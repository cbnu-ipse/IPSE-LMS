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
        # participant_user 가 다시 참가 신청해놓음 (최근 도입된 쿨타임 우회를 위해 쿨타임 로그 삭제 후 시도)
        from .models import GatheringLeaveLog
        GatheringLeaveLog.objects.filter(gathering=gathering, user=self.participant).delete()
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


class CommunityLikeDislikeBestCommentTestCase(TestCase):
    # home_view -> ranking.utils가 problems 앱(beta_judge DB)을 조회하므로 명시 필요
    databases = {"default", "beta_judge"}

    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.user2 = User.objects.create_user(username='user2', password='password123')
        self.staff_user = User.objects.create_user(username='staff_user', password='password123', is_staff=True)
        self.client = Client()
        
        # 게시글 생성
        from .models import CommunityPost, CommunityComment, GatheringEvent
        self.post = CommunityPost.objects.create(
            title='테스트용 게시글',
            content='본문 내용입니다.',
            author=self.user1
        )
        
    def test_post_like_dislike_mutual_exclusion(self):
        self.client.login(username='user1', password='password123')
        
        # 1. 추천 토글
        like_url = reverse('post_like_toggle', kwargs={'post_id': self.post.id})
        response = self.client.post(like_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['liked'])
        self.assertFalse(data['disliked'])
        self.assertEqual(data['like_count'], 1)
        self.assertEqual(data['dislike_count'], 0)
        
        # 2. 비추천 토글 (추천이 취소되고 비추천이 활성화되는지)
        dislike_url = reverse('post_dislike_toggle', kwargs={'post_id': self.post.id})
        response = self.client.post(dislike_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data['liked'])
        self.assertTrue(data['disliked'])
        self.assertTrue(data['liked_removed'])
        self.assertEqual(data['like_count'], 0)
        self.assertEqual(data['dislike_count'], 1)

        # 3. 다시 추천 토글 (비추천이 취소되고 추천이 활성화되는지)
        response = self.client.post(like_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['liked'])
        self.assertFalse(data['disliked'])
        self.assertTrue(data['disliked_removed'])
        self.assertEqual(data['like_count'], 1)
        self.assertEqual(data['dislike_count'], 0)

    def test_comment_like_dislike_mutual_exclusion(self):
        from .models import CommunityComment
        comment = CommunityComment.objects.create(
            post=self.post,
            author=self.user2,
            content='댓글 테스트'
        )
        self.client.login(username='user1', password='password123')
        
        # 1. 댓글 추천 토글
        like_url = reverse('comment_like_toggle', kwargs={'comment_id': comment.id})
        response = self.client.post(like_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['liked'])
        self.assertFalse(data['disliked'])
        self.assertEqual(data['like_count'], 1)
        self.assertEqual(data['dislike_count'], 0)
        
        # 2. 댓글 비추천 토글 (추천이 지워져야 함)
        dislike_url = reverse('comment_dislike_toggle', kwargs={'comment_id': comment.id})
        response = self.client.post(dislike_url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data['liked'])
        self.assertTrue(data['disliked'])
        self.assertTrue(data['liked_removed'])
        self.assertEqual(data['like_count'], 0)
        self.assertEqual(data['dislike_count'], 1)

    def test_best_comment_selection_on_detail_page(self):
        from .models import CommunityComment, CommunityCommentLike
        # 세 개의 댓글 생성
        c1 = CommunityComment.objects.create(post=self.post, author=self.user2, content='댓글 1')
        c2 = CommunityComment.objects.create(post=self.post, author=self.user2, content='댓글 2')
        c3 = CommunityComment.objects.create(post=self.post, author=self.user2, content='댓글 3')
        
        # c1 추천 1개, c2 추천 2개, c3 추천 2개 (c3가 최신글)
        CommunityCommentLike.objects.create(comment=c1, user=self.user1)
        
        CommunityCommentLike.objects.create(comment=c2, user=self.user1)
        CommunityCommentLike.objects.create(comment=c2, user=self.user2)
        
        CommunityCommentLike.objects.create(comment=c3, user=self.user1)
        CommunityCommentLike.objects.create(comment=c3, user=self.user2)
        
        self.client.login(username='user1', password='password123')
        detail_url = reverse('post_detail', kwargs={'post_id': self.post.id})
        response = self.client.get(detail_url)
        
        self.assertEqual(response.status_code, 200)
        # 최다 추천수(2개)를 가진 c2, c3 중 최신 등록 댓글인 c3가 best_comment로 선정되어야 함
        self.assertEqual(response.context['best_comment'].id, c3.id)
        
    def test_home_dashboard_meetup_filtering(self):
        from .models import GatheringEvent
        # 1. 진행 예정 번개 모임
        gathering_future = GatheringEvent.objects.create(
            title='미래 번개',
            description='미래 번개 설명',
            event_date=timezone.now() + datetime.timedelta(days=1),
            location='동방',
            author=self.user1,
            max_participants=5
        )
        # 2. 이미 지난 번개 모임
        gathering_past = GatheringEvent.objects.create(
            title='과거 번개',
            description='과거 번개 설명',
            event_date=timezone.now() - datetime.timedelta(days=1),
            location='동방',
            author=self.user1,
            max_participants=5
        )
        # 3. 폭파된(취소된) 미래 번개 모임
        gathering_canceled = GatheringEvent.objects.create(
            title='폭파된 미래 번개',
            description='폭파된 미래 번개 설명',
            event_date=timezone.now() + datetime.timedelta(days=2),
            location='동방',
            author=self.user1,
            max_participants=5,
            is_canceled=True
        )
        
        self.client.login(username='user1', password='password123')
        home_url = reverse('home')
        response = self.client.get(home_url)
        
        self.assertEqual(response.status_code, 200)
        active_gatherings = response.context['active_gatherings']
        
        # 활성 번개(미래 번개)만 포함되어야 함
        gathering_ids = [g.id for g in active_gatherings]
        self.assertIn(gathering_future.id, gathering_ids)
        self.assertNotIn(gathering_past.id, gathering_ids)
        self.assertNotIn(gathering_canceled.id, gathering_ids)


class EmbeddedSurveyTestCase(TestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(username='staff_user', password='password123', is_staff=True)
        self.author_user = User.objects.create_user(username='author_user', password='password123')
        self.normal_user = User.objects.create_user(username='normal_user', password='password123')
        self.client = Client()

    def test_post_creation_with_survey(self):
        self.client.login(username='author_user', password='password123')
        
        survey_json = {
            'title': 'Test Survey',
            'description': 'Survey Description',
            'is_anonymous': False,
            'allow_duplicate_response': False,
            'questions': [
                {
                    'sequence': 1,
                    'title': 'Which option?',
                    'question_type': 'CHOICE',
                    'choices': [{'text': 'Option A'}, {'text': 'Option B'}]
                },
                {
                    'sequence': 2,
                    'title': 'Rate your experience',
                    'question_type': 'SCALE'
                },
                {
                    'sequence': 3,
                    'title': 'Short text',
                    'question_type': 'TEXT'
                }
            ]
        }
        
        import json
        response = self.client.post(reverse('post_create'), {
            'title': 'Post with Survey',
            'content': 'Check out this survey.',
            'category': 'free',
            'survey_data': json.dumps(survey_json)
        })
        self.assertEqual(response.status_code, 302)
        
        from .models import CommunityPost, Survey, SurveyQuestion
        post = CommunityPost.objects.filter(title='Post with Survey').first()
        self.assertIsNotNone(post)
        self.assertIsNotNone(post.survey)
        self.assertEqual(post.survey.title, 'Test Survey')
        self.assertEqual(post.survey.questions.count(), 3)
        
        questions = list(post.survey.questions.all().order_by('order'))
        self.assertEqual(questions[0].question_type, 'CHOICE')
        self.assertEqual(questions[0].choices.count(), 2)
        self.assertEqual(questions[1].question_type, 'SCALE')
        self.assertEqual(questions[2].question_type, 'TEXT')

    def test_survey_answering_and_results(self):
        # 1. Setup a post with a survey
        from .models import CommunityPost, Survey, SurveyQuestion, SurveyQuestionChoice
        post = CommunityPost.objects.create(title='Post with Survey', content='Content', author=self.author_user)
        survey = Survey.objects.create(post=post, title='Test Survey', created_by=self.author_user)
        q1 = SurveyQuestion.objects.create(survey=survey, question_text='Choice Question', question_type='CHOICE', order=1)
        choice_a = SurveyQuestionChoice.objects.create(question=q1, choice_text='A', order=1)
        choice_b = SurveyQuestionChoice.objects.create(question=q1, choice_text='B', order=2)
        q2 = SurveyQuestion.objects.create(survey=survey, question_text='Scale Question', question_type='SCALE', order=2)
        q3 = SurveyQuestion.objects.create(survey=survey, question_text='Text Question', question_type='TEXT', order=3)
        
        # 2. Answer the survey as a normal user
        self.client.login(username='normal_user', password='password123')
        respond_url = reverse('survey_respond', kwargs={'survey_id': survey.id})
        
        import json
        answer_data = {
            f'question_{q1.id}': choice_a.id,
            f'question_{q2.id}': 4,
            f'question_{q3.id}': 'My text answer'
        }
        
        response = self.client.post(respond_url, data=json.dumps(answer_data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        res_json = response.json()
        self.assertEqual(res_json['status'], 'success')
        
        from .models import SurveyResponse, SurveyAnswer
        self.assertEqual(SurveyResponse.objects.filter(survey=survey, respondent=self.normal_user).count(), 1)
        
        # 3. Check results API (only author or staff)
        results_api_url = reverse('survey_results_api', kwargs={'survey_id': survey.id})
        
        # Regular user should be forbidden
        response = self.client.get(results_api_url)
        self.assertEqual(response.status_code, 403)
        
        # Author should be allowed
        self.client.logout()
        self.client.login(username='author_user', password='password123')
        response = self.client.get(results_api_url)
        self.assertEqual(response.status_code, 200)
        results_data = response.json()['results']
        self.assertEqual(len(results_data), 3)
        
        # Verify stats and answers are loaded successfully without errors
        # Choice question
        q1_stats = next(q for q in results_data if q['id'] == q1.id)['stats']
        self.assertEqual(next(c for c in q1_stats if c['choice_id'] == choice_a.id)['count'], 1)
        self.assertEqual(next(c for c in q1_stats if c['choice_id'] == choice_b.id)['count'], 0)
        
        # Scale question
        q2_stats = next(q for q in results_data if q['id'] == q2.id)['stats']
        self.assertEqual(next(s for s in q2_stats if s['scale'] == 4)['count'], 1)
        self.assertEqual(next(s for s in q2_stats if s['scale'] == 1)['count'], 0)
        
        # Text question
        q3_answers = next(q for q in results_data if q['id'] == q3.id)['answers']
        self.assertEqual(len(q3_answers), 1)
        self.assertEqual(q3_answers[0]['text'], 'My text answer')

        # 4. Check CSV Export permission (Staff only)
        export_url = reverse('survey_results_export', kwargs={'survey_id': survey.id})
        
        # Author is not staff, so should get 403 or redirect (302)
        response = self.client.get(export_url)
        self.assertIn(response.status_code, [302, 403])
        
        # Staff user should get 200 and a CSV download
        self.client.logout()
        self.client.login(username='staff_user', password='password123')
        response = self.client.get(export_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/csv; charset=utf-8-sig')

    def test_academic_board_restrictions(self):
        # 1. Normal users trying to post with 'academic' category should be restricted (coerced to 'free')
        self.client.login(username='author_user', password='password123')
        create_url = reverse('post_create')
        response = self.client.post(create_url, {
            'title': '임의의 학사일정 글',
            'content': '학사공지를 임의로 작성해봅니다.',
            'category': 'academic'
        })
        self.assertEqual(response.status_code, 302)
        
        from .models import CommunityPost
        post = CommunityPost.objects.filter(title='임의의 학사일정 글').first()
        self.assertIsNotNone(post)
        self.assertEqual(post.category, 'free')  # Coerced to 'free'

        # 2. Staff user trying to post with 'academic' category should also be restricted
        staff_user = User.objects.create_user(
            username='staff_post_user',
            password='password123',
            is_staff=True
        )
        self.client.logout()
        self.client.login(username='staff_post_user', password='password123')
        response = self.client.post(create_url, {
            'title': '스태프 임의 학사일정 글',
            'content': '스태프도 막아야 함.',
            'category': 'academic'
        })
        self.assertEqual(response.status_code, 302)
        post_staff = CommunityPost.objects.filter(title='스태프 임의 학사일정 글').first()
        self.assertIsNotNone(post_staff)
        self.assertEqual(post_staff.category, 'free')  # Coerced to 'free'



