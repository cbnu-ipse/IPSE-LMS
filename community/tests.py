from django.test import TestCase, Client
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.urls import reverse
import datetime
from .models import RecruitmentForm, RecruitmentApplication

User = get_user_model()

class RecruitmentTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='staff_user',
            password='password123',
            is_staff=True
        )
        self.form = RecruitmentForm.objects.create(
            title='2026 IPSE 모집',
            description='모집 설명',
            opens_at=timezone.now() - datetime.timedelta(days=1),
            closes_at=timezone.now() + datetime.timedelta(days=7),
            created_by=self.user
        )
        self.client = Client()

    def test_recruitment_is_closed(self):
        # 1. 활성 상태이고 마감 이전이면 마감되지 않음
        self.assertFalse(self.form.is_closed)

        # 2. 비활성이면 마감으로 판단
        self.form.is_active = False
        self.form.save()
        self.assertTrue(self.form.is_closed)

        # 3. 마감 시간이 지난 경우
        self.form.is_active = True
        self.form.closes_at = timezone.now() - datetime.timedelta(days=1)
        self.form.save()
        self.assertTrue(self.form.is_closed)

    def test_recruit_apply_validation(self):
        url = reverse('recruit_apply', kwargs={'form_id': self.form.id})
        
        # GET 요청 시 세션에 load_time 설정되는지 확인
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        session_key = f'recruit_load_time_{self.form.id}'
        self.assertIn(session_key, self.client.session)

        # 1. Honeypot 필드가 채워져서 제출되면 400 에러를 뱉는지 검증
        post_data = {
            'name': '홍길동',
            'student_id': '20260001',
            'department': '컴퓨터공학과',
            'contact': '010-1234-5678',
            'motivation': '꼭 참여하고 싶습니다!',
            'email_confirm': 'bot_input'  # honeypot 필드
        }
        response = self.client.post(url, post_data)
        self.assertEqual(response.status_code, 400)
        
        # 2. 정상 데이터 제출 (Honeypot 비워둠, 시간 보정 필요)
        session = self.client.session
        session[session_key] = session[session_key] - 5.0
        session.save()

        post_data['email_confirm'] = ''
        response = self.client.post(url, post_data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '지원서가 성공적으로 제출되었습니다')

        # DB에 잘 쌓였는지 확인
        apps = RecruitmentApplication.objects.filter(form=self.form)
        self.assertEqual(apps.count(), 1)
        self.assertEqual(apps.first().name, '홍길동')


class CommunityTestCase(TestCase):
    def setUp(self):
        # 유저 2명 생성 (주최자/작성자 및 참가자)
        self.author = User.objects.create_user(
            username='author_user',
            password='password123',
            first_name='길동',
            last_name='홍'
        )
        self.participant = User.objects.create_user(
            username='participant_user',
            password='password123',
            first_name='철수',
            last_name='김'
        )
        self.client = Client()

    def test_post_creation_and_commenting(self):
        self.client.login(username='author_user', password='password123')
        
        # 1. 자유게시판 글쓰기
        create_url = reverse('post_create')
        response = self.client.post(create_url, {
            'title': '테스트 게시글 제목',
            'content': '테스트 마크다운 본문 내용입니다.'
        })
        self.assertEqual(response.status_code, 302)  # 상세조회 페이지로 리다이렉트 확인
        
        from .models import CommunityPost, CommunityComment
        post = CommunityPost.objects.first()
        self.assertIsNotNone(post)
        self.assertEqual(post.title, '테스트 게시글 제목')
        self.assertEqual(post.author, self.author)

        # 2. 상세 조회 및 댓글 작성
        detail_url = reverse('post_detail', kwargs={'post_id': post.id})
        response = self.client.post(detail_url, {
            'action': 'add_comment',
            'content': '댓글 내용 등록 테스트'
        })
        self.assertEqual(response.status_code, 302)
        
        comment = CommunityComment.objects.first()
        self.assertIsNotNone(comment)
        self.assertEqual(comment.content, '댓글 내용 등록 테스트')
        self.assertEqual(comment.author, self.author)
        self.assertEqual(comment.post, post)

    def test_gathering_scheduling_and_calendar_sync(self):
        self.client.login(username='author_user', password='password123')
        
        # 1. 번개 모임 개설
        create_url = reverse('gathering_create')
        event_time = timezone.now() + datetime.timedelta(days=2)
        response = self.client.post(create_url, {
            'title': '알고리즘 번개 모임',
            'description': '오늘 같이 알고리즘 공부해요!',
            'event_date': event_time.isoformat(),
            'location': '동아리 방',
            'max_participants': '3'
        })
        self.assertEqual(response.status_code, 302)
        
        from .models import GatheringEvent
        from core.models import Schedule
        
        gathering = GatheringEvent.objects.first()
        self.assertIsNotNone(gathering)
        self.assertEqual(gathering.title, '알고리즘 번개 모임')
        self.assertEqual(gathering.max_participants, 3)
        
        # 주최자가 참가자 목록에 자동 등록되었는지 검증
        self.assertIn(self.author, gathering.participants.all())
        
        # 주최자 개인 일정에 자동으로 등록되었는지 검증
        host_schedule = Schedule.objects.filter(user=self.author, external_id=f"gathering:{gathering.id}").first()
        self.assertIsNotNone(host_schedule)
        self.assertEqual(host_schedule.title, '[번개] 알고리즘 번개 모임')

        # 2. 다른 사용자로 로그인하여 참가 신청 토글 테스트
        self.client.logout()
        self.client.login(username='participant_user', password='password123')
        
        join_url = reverse('gathering_join_toggle', kwargs={'gathering_id': gathering.id})
        response = self.client.post(join_url)
        self.assertEqual(response.status_code, 200)
        
        # 참가 신청 완료 상태 검증
        self.assertIn(self.participant, gathering.participants.all())
        participant_schedule = Schedule.objects.filter(user=self.participant, external_id=f"gathering:{gathering.id}").first()
        self.assertIsNotNone(participant_schedule)
        
        # 3. 참가자 정원 초과 테스트를 위해 제 3의 멤버 참가 시도
        extra_user1 = User.objects.create_user(username='extra_user1', password='password123')
        extra_user2 = User.objects.create_user(username='extra_user2', password='password123')
        
        gathering.participants.add(extra_user1)  # 현재 참여자: 호스트, 참가자, extra_user1 -> 총 3명 (정원 도달)
        
        # 정원 초과 상태에서 extra_user2가 로그인해서 참여하려 하면 400 에러를 반환하는지 검증
        self.client.logout()
        self.client.login(username='extra_user2', password='password123')
        response = self.client.post(join_url)
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(response.content, {'status': 'error', 'message': '정원이 마감되어 신청할 수 없습니다.'})
        
        # 4. 참가자 취소 시 캘린더 일정 삭제 검증
        self.client.logout()
        self.client.login(username='participant_user', password='password123')
        response = self.client.post(join_url)  # 참가 취소 토글
        self.assertEqual(response.status_code, 200)
        
        # 취소 완료 상태 검증
        self.assertNotIn(self.participant, gathering.participants.all())
        participant_schedule_deleted = Schedule.objects.filter(user=self.participant, external_id=f"gathering:{gathering.id}").exists()
        self.assertFalse(participant_schedule_deleted)

        # 5. 개설자가 모임 폭파(취소) 시 모든 일정 일괄 삭제 검증
        # participant_user 가 다시 참가 신청해놓음
        self.client.post(join_url)
        self.assertTrue(Schedule.objects.filter(user=self.participant, external_id=f"gathering:{gathering.id}").exists())
        
        # 호스트로 로그인 후 취소 요청
        self.client.logout()
        self.client.login(username='author_user', password='password123')
        
        cancel_url = reverse('gathering_cancel', kwargs={'gathering_id': gathering.id})
        response = self.client.post(cancel_url)
        self.assertEqual(response.status_code, 302)
        
        gathering.refresh_from_db()
        self.assertTrue(gathering.is_canceled)
        
        # 호스트 및 참여자 캘린더에서 완전히 일괄 삭제되었는지 검증
        self.assertFalse(Schedule.objects.filter(external_id=f"gathering:{gathering.id}").exists())

    def test_post_like_toggle(self):
        self.client.login(username='author_user', password='password123')
        
        # 자유게시판 글 하나 개설
        from .models import CommunityPost, CommunityPostLike
        post = CommunityPost.objects.create(
            title='추천용 게시글',
            content='추천 기능 테스트용 본문',
            author=self.author
        )
        
        like_url = reverse('post_like_toggle', kwargs={'post_id': post.id})
        
        # 1. 좋아요 추가
        response = self.client.post(like_url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['liked'])
        self.assertEqual(response.json()['like_count'], 1)
        self.assertTrue(CommunityPostLike.objects.filter(post=post, user=self.author).exists())
        
        # 2. 좋아요 취소 (토글)
        response = self.client.post(like_url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()['liked'])
        self.assertEqual(response.json()['like_count'], 0)
        self.assertFalse(CommunityPostLike.objects.filter(post=post, user=self.author).exists())

    def test_popular_hot_posts(self):
        from .models import CommunityPost, CommunityComment, CommunityPostLike
        
        # 3개의 글 개설
        p1 = CommunityPost.objects.create(title='인기글 1위 후보', content='1위 내용', author=self.author, views=10) # 10점
        p2 = CommunityPost.objects.create(title='인기글 2위 후보', content='2위 내용', author=self.author, views=5)  # 5점
        p3 = CommunityPost.objects.create(title='비인기글', content='내용', author=self.author, views=1)         # 1점
        
        # p2 에 댓글 2개 추가 -> comment_count=2 (점수: 5 + 2*5 = 15점 -> 1위로 상승해야 함)
        CommunityComment.objects.create(post=p2, author=self.author, content='댓글 1')
        CommunityComment.objects.create(post=p2, author=self.participant, content='댓글 2')
        
        # p1 에 좋아요 2개 추가 -> like_count=2 (점수: 10 + 2*10 = 30점 -> 다시 1위로 상승해야 함)
        CommunityPostLike.objects.create(post=p1, user=self.author)
        CommunityPostLike.objects.create(post=p1, user=self.participant)
        
        # community_home 뷰 조회
        self.client.login(username='author_user', password='password123')
        url = reverse('community_home')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        hot_posts = response.context['hot_posts']
        
        # 정렬 순서 검증 (1위: p1 (30점), 2위: p2 (15점), 3위: p3 (1점))
        self.assertEqual(hot_posts[0].id, p1.id)
        self.assertEqual(hot_posts[1].id, p2.id)
        self.assertEqual(hot_posts[2].id, p3.id)
