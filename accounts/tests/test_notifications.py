from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from accounts.models import Notification, Student
from community.models import GatheringEvent, GatheringComment
from django.utils import timezone
import datetime

User = get_user_model()

class NotificationSystemTestCase(TestCase):
    def setUp(self):
        # 1. 테스트 유저 생성
        self.host_user = User.objects.create_user(
            username="hostuser",
            password="password123",
            first_name="Host",
            last_name="User"
        )
        self.guest_user = User.objects.create_user(
            username="guestuser",
            password="password123",
            first_name="Guest",
            last_name="User"
        )
        self.other_user = User.objects.create_user(
            username="otheruser",
            password="password123",
            first_name="Other",
            last_name="User"
        )

        # 2. 번개 모임 개설 (시작 시점엔 gathering_created 알림 발송됨)
        # 테스트 생성의 노이즈를 지우기 위해 개설 전 생성된 알림 삭제
        Notification.objects.all().delete()

        self.gathering = GatheringEvent.objects.create(
            title="테스트 번개 모임",
            description="상세 설명",
            author=self.host_user,
            event_date=timezone.now() + datetime.timedelta(days=2),
            location="동아리방",
            max_participants=5,
            category="study"
        )
        # 주최자 기본 참여 처리
        self.gathering.participants.add(self.host_user)

    def test_default_settings_are_true(self):
        """새로 생성된 유저의 알림 설정은 기본적으로 True여야 함"""
        self.assertTrue(self.guest_user.student.notify_gathering_all)
        self.assertTrue(self.guest_user.student.notify_gathering_joined)

    def test_gathering_created_notification(self):
        """새로운 번개 모임이 개설되면 다른 활성 유저에게 알림이 전송됨"""
        Notification.objects.all().delete()

        # other_user가 새로운 모임을 만들었을 때 (POST 요청)
        self.client.force_login(self.other_user)
        create_url = reverse('gathering_create')
        event_date_str = (timezone.now() + datetime.timedelta(days=1)).strftime('%Y-%m-%dT%H:%M:%S')
        response = self.client.post(create_url, {
            'title': '새로운 스터디',
            'description': '설명',
            'event_date': event_date_str,
            'location': '세미나실',
            'max_participants': '3',
            'category': 'study'
        })
        self.assertEqual(response.status_code, 302)

        new_gathering = GatheringEvent.objects.get(title='새로운 스터디')

        # GNB 알림 생성 검증: host_user, guest_user 에게 개설 알림 도달
        notifications = Notification.objects.filter(gathering=new_gathering)
        recipients = [n.recipient for n in notifications]
        
        self.assertIn(self.host_user, recipients)
        self.assertIn(self.guest_user, recipients)
        self.assertNotIn(self.other_user, recipients)  # 자기 자신에겐 안 보냄

    def test_gathering_created_notification_respects_settings(self):
        """notify_gathering_all=False 인 사용자에게는 개설 알림을 보내지 않음"""
        Notification.objects.all().delete()
        
        # guest_user의 전체 알림 옵션을 비활성화
        student = self.guest_user.student
        student.notify_gathering_all = False
        student.save()

        # other_user가 새로운 모임 생성 (POST 요청)
        self.client.force_login(self.other_user)
        create_url = reverse('gathering_create')
        event_date_str = (timezone.now() + datetime.timedelta(days=1)).strftime('%Y-%m-%dT%H:%M:%S')
        response = self.client.post(create_url, {
            'title': '새로운 스터디 2',
            'description': '설명',
            'event_date': event_date_str,
            'location': '세미나실',
            'max_participants': '3',
            'category': 'study'
        })
        self.assertEqual(response.status_code, 302)

        new_gathering = GatheringEvent.objects.get(title='새로운 스터디 2')

        # host_user는 수신하지만, guest_user는 수신하지 않음
        self.assertTrue(Notification.objects.filter(recipient=self.host_user, gathering=new_gathering).exists())
        self.assertFalse(Notification.objects.filter(recipient=self.guest_user, gathering=new_gathering).exists())

    def test_gathering_comment_notification(self):
        """모임 글에 댓글 작성 시 개설자에게 댓글 알림 전송"""
        Notification.objects.all().delete()

        # guest_user 가 댓글을 남김 (POST 요청)
        self.client.force_login(self.guest_user)
        detail_url = reverse('gathering_detail', kwargs={'gathering_id': self.gathering.id})
        response = self.client.post(detail_url, {
            'action': 'add_comment',
            'content': '저도 참가하고 싶습니다!'
        })
        self.assertEqual(response.status_code, 302)

        # 호스트(host_user)에게 댓글 알림이 생성되었는지 검증
        self.assertTrue(Notification.objects.filter(
            recipient=self.host_user,
            sender=self.guest_user,
            notification_type='gathering_comment',
            gathering=self.gathering
        ).exists())

    def test_gathering_comment_notification_respects_settings(self):
        """notify_gathering_joined=False 인 개설자에게는 댓글 알림을 보내지 않음"""
        Notification.objects.all().delete()

        # 호스트의 알림 설정 변경
        student = self.host_user.student
        student.notify_gathering_joined = False
        student.save()

        # guest_user 가 댓글 작성 (POST 요청)
        self.client.force_login(self.guest_user)
        detail_url = reverse('gathering_detail', kwargs={'gathering_id': self.gathering.id})
        response = self.client.post(detail_url, {
            'action': 'add_comment',
            'content': '설정 테스트 댓글'
        })
        self.assertEqual(response.status_code, 302)

        self.assertFalse(Notification.objects.filter(
            recipient=self.host_user,
            notification_type='gathering_comment'
        ).exists())

    def test_gathering_join_and_leave_notification(self):
        """사용자가 모임 신청/취소 시 개설자에게 알림 전송"""
        Notification.objects.all().delete()

        # guest_user가 모임 참여 신청을 함
        self.client.force_login(self.guest_user)
        join_url = reverse('gathering_join_toggle', kwargs={'gathering_id': self.gathering.id})
        response = self.client.post(join_url)
        self.assertEqual(response.status_code, 200)

        # 개설자에게 신청 알림 전송되었는지 검증
        self.assertTrue(Notification.objects.filter(
            recipient=self.host_user,
            sender=self.guest_user,
            notification_type='gathering_join',
            gathering=self.gathering
        ).exists())

        # 다시 취소 처리
        Notification.objects.all().delete()
        response = self.client.post(join_url)
        self.assertEqual(response.status_code, 200)

        # 개설자에게 취소 알림 전송되었는지 검증
        self.assertTrue(Notification.objects.filter(
            recipient=self.host_user,
            sender=self.guest_user,
            notification_type='gathering_leave',
            gathering=self.gathering
        ).exists())

    def test_gathering_cancel_notification(self):
        """방장이 모임을 취소(폭파)하면 참여자 전원에게 알림이 전송됨"""
        # guest_user 와 other_user 를 참여자로 등록
        self.gathering.participants.add(self.guest_user)
        self.gathering.participants.add(self.other_user)

        Notification.objects.all().delete()

        # host_user가 모임 취소 호출
        self.client.force_login(self.host_user)
        cancel_url = reverse('gathering_cancel', kwargs={'gathering_id': self.gathering.id})
        response = self.client.post(cancel_url)
        self.assertEqual(response.status_code, 302)  # redirect to gathering_list

        # 참여 중이었던 guest_user, other_user 에게 취소 알림 전송 확인
        self.assertTrue(Notification.objects.filter(recipient=self.guest_user, notification_type='gathering_cancel').exists())
        self.assertTrue(Notification.objects.filter(recipient=self.other_user, notification_type='gathering_cancel').exists())
        # 본인(host_user)에게는 안 보냄
        self.assertFalse(Notification.objects.filter(recipient=self.host_user, notification_type='gathering_cancel').exists())

    def test_notification_apis(self):
        """알림 비동기 API들(unread-count, list, read, delete, read-all) 검증"""
        # 테스트 알림 하나 직접 적재
        n = Notification.objects.create(
            recipient=self.guest_user,
            sender=self.host_user,
            notification_type='gathering_comment',
            gathering=self.gathering,
            message="댓글 알림 테스트 메시지"
        )

        self.client.force_login(self.guest_user)

        # 1. unread-count API
        count_url = reverse('unread_notification_count_api')
        res = self.client.get(count_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['unread_count'], 1)

        # 2. list API
        list_url = reverse('notification_list_api')
        res = self.client.get(list_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()['notifications']), 1)
        self.assertEqual(res.json()['notifications'][0]['message'], "댓글 알림 테스트 메시지")

        # 3. read and redirect 뷰
        read_url = reverse('read_and_redirect', kwargs={'notification_id': n.id})
        res = self.client.get(read_url)
        self.assertEqual(res.status_code, 302)  # redirect to gathering_detail
        
        # 읽음 확인
        n.refresh_from_db()
        self.assertTrue(n.is_read)

        # 4. read-all API
        # 새로운 읽지 않은 알림 하나 더 생성
        n2 = Notification.objects.create(
            recipient=self.guest_user,
            sender=self.host_user,
            notification_type='gathering_comment',
            gathering=self.gathering,
            message="댓글 알림 테스트 메시지 2"
        )
        read_all_url = reverse('mark_all_as_read_api')
        res = self.client.post(read_all_url)
        self.assertEqual(res.status_code, 200)
        n2.refresh_from_db()
        self.assertTrue(n2.is_read)

        # 5. delete API
        delete_url = reverse('delete_notification_api', kwargs={'notification_id': n2.id})
        res = self.client.post(delete_url)
        self.assertEqual(res.status_code, 200)
        self.assertFalse(Notification.objects.filter(id=n2.id).exists())

    def test_subscribe_push_api(self):
        """웹 푸시 구독 등록 및 갱신 API 검증"""
        self.client.force_login(self.guest_user)
        subscribe_url = reverse('subscribe_push_api')
        
        # 1. 구독 정보 신규 생성
        payload = {
            'endpoint': 'https://fcm.googleapis.com/fcm/send/test-token-123',
            'keys': {
                'p256dh': 'test-p256dh-key',
                'auth': 'test-auth-key'
            }
        }
        res = self.client.post(subscribe_url, payload, content_type='application/json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()['success'])
        
        from accounts.models import PushSubscription
        sub = PushSubscription.objects.get(endpoint=payload['endpoint'])
        self.assertEqual(sub.student, self.guest_user.student)
        self.assertEqual(sub.p256dh, 'test-p256dh-key')
        self.assertEqual(sub.auth, 'test-auth-key')

        # 2. 동일 엔드포인트 갱신 검증
        payload_update = {
            'endpoint': 'https://fcm.googleapis.com/fcm/send/test-token-123',
            'keys': {
                'p256dh': 'updated-p256dh-key',
                'auth': 'updated-auth-key'
            }
        }
        res = self.client.post(subscribe_url, payload_update, content_type='application/json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()['success'])
        
        sub.refresh_from_db()
        self.assertEqual(sub.p256dh, 'updated-p256dh-key')
        self.assertEqual(sub.auth, 'updated-auth-key')

    def test_unsubscribe_push_api(self):
        """웹 푸시 구독 해제 API 검증"""
        from accounts.models import PushSubscription
        sub = PushSubscription.objects.create(
            student=self.guest_user.student,
            endpoint='https://fcm.googleapis.com/fcm/send/test-token-abc',
            p256dh='keys-dh',
            auth='keys-auth'
        )
        
        self.client.force_login(self.guest_user)
        unsubscribe_url = reverse('unsubscribe_push_api')
        payload = {
            'endpoint': 'https://fcm.googleapis.com/fcm/send/test-token-abc'
        }
        res = self.client.post(unsubscribe_url, payload, content_type='application/json')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()['success'])
        self.assertFalse(PushSubscription.objects.filter(id=sub.id).exists())

    def test_send_web_push_helper_trigger(self):
        """알림 생성 시 send_web_push 전송 트리거가 Mock 호출되는지 확인"""
        from unittest.mock import patch
        
        with patch('accounts.utils.send_web_push') as mock_send:
            from community.views import _create_notification
            _create_notification(
                recipient=self.guest_user,
                sender=self.host_user,
                notification_type='gathering_comment',
                gathering=self.gathering,
                message="테스트 푸시 트리거"
            )
            self.assertTrue(mock_send.called)

    def test_gathering_join_cooldown_limit(self):
        """참가 취소 후 1시간 이내 재신청 시 400 에러 및 쿨타임 남은 시간 정보 반환 검증"""
        # 1. guest_user가 모임에 가입
        self.gathering.participants.add(self.guest_user)
        self.assertTrue(self.gathering.participants.filter(id=self.guest_user.id).exists())

        # 2. guest_user가 모임 탈퇴
        self.client.force_login(self.guest_user)
        toggle_url = reverse('gathering_join_toggle', kwargs={'gathering_id': self.gathering.id})
        res = self.client.post(toggle_url)
        self.assertEqual(res.status_code, 200)
        self.assertFalse(self.gathering.participants.filter(id=self.guest_user.id).exists())

        # 3. 즉시 재신청 시도 -> 400 에러 반환 및 쿨타임 남은 시간 정보 포함 확인
        res_fail = self.client.post(toggle_url)
        self.assertEqual(res_fail.status_code, 400)
        response_data = res_fail.json()
        self.assertEqual(response_data['status'], 'error')
        self.assertIn('참가 취소 후 1시간 동안은 재신청할 수 없습니다.', response_data['message'])
        self.assertTrue(response_data['cooldown_remaining'] > 0)

        # 4. 강제로 leave_log의 left_at 시간을 1시간 이상 전으로 조작하여 시간 만료 테스트
        from community.models import GatheringLeaveLog
        leave_log = GatheringLeaveLog.objects.filter(gathering=self.gathering, user=self.guest_user).first()
        self.assertIsNotNone(leave_log)
        
        # auto_now=True 필드를 변경하기 위해 QuerySet update 사용
        GatheringLeaveLog.objects.filter(id=leave_log.id).update(
            left_at=timezone.now() - datetime.timedelta(hours=2)
        )

        # 5. 쿨타임이 지났으므로 재신청 성공 검증
        res_success = self.client.post(toggle_url)
        self.assertEqual(res_success.status_code, 200)
        self.assertTrue(self.gathering.participants.filter(id=self.guest_user.id).exists())

    def test_post_comment_notification(self):
        """게시글에 댓글 작성 시 게시글 작성자에게 알림 전송"""
        from community.models import CommunityPost
        post = CommunityPost.objects.create(
            title="게시글 제목",
            content="게시글 내용",
            author=self.host_user,
            category="free"
        )
        Notification.objects.all().delete()

        # guest_user 가 댓글 작성
        self.client.force_login(self.guest_user)
        detail_url = reverse('post_detail', kwargs={'post_id': post.id})
        response = self.client.post(detail_url, {
            'action': 'add_comment',
            'content': '댓글 본문입니다.'
        })
        self.assertEqual(response.status_code, 302)

        # 게시글 작성자(host_user)에게 알림이 왔는지 검증
        self.assertTrue(Notification.objects.filter(
            recipient=self.host_user,
            sender=self.guest_user,
            notification_type='post_comment',
            post=post
        ).exists())

    def test_post_comment_notification_respects_settings(self):
        """notify_post_comment=False 이면 게시글 댓글 알림을 보내지 않음"""
        from community.models import CommunityPost
        post = CommunityPost.objects.create(
            title="게시글 제목 2",
            content="게시글 내용 2",
            author=self.host_user,
            category="free"
        )
        Notification.objects.all().delete()

        # 호스트의 알림 설정 변경
        student = self.host_user.student
        student.notify_post_comment = False
        student.save()

        # guest_user 가 댓글 작성
        self.client.force_login(self.guest_user)
        detail_url = reverse('post_detail', kwargs={'post_id': post.id})
        response = self.client.post(detail_url, {
            'action': 'add_comment',
            'content': '댓글 본문입니다.'
        })
        self.assertEqual(response.status_code, 302)

        # 알림이 가지 않아야 함
        self.assertFalse(Notification.objects.filter(
            recipient=self.host_user,
            notification_type='post_comment'
        ).exists())

    def test_comment_reply_notification(self):
        """댓글에 답글(대댓글) 작성 시 상위 댓글 작성자에게 알림 전송"""
        from community.models import CommunityPost, CommunityComment
        post = CommunityPost.objects.create(
            title="게시글 제목 3",
            content="게시글 내용 3",
            author=self.host_user,
            category="free"
        )
        parent_comment = CommunityComment.objects.create(
            post=post,
            author=self.guest_user,
            content="상위 댓글"
        )
        Notification.objects.all().delete()

        # other_user 가 답글(대댓글) 작성
        self.client.force_login(self.other_user)
        detail_url = reverse('post_detail', kwargs={'post_id': post.id})
        response = self.client.post(detail_url, {
            'action': 'add_comment',
            'content': '대댓글 본문입니다.',
            'parent_id': parent_comment.id
        })
        self.assertEqual(response.status_code, 302)

        # 상위 댓글 작성자(guest_user)에게 대댓글 알림이 왔는지 검증
        self.assertTrue(Notification.objects.filter(
            recipient=self.guest_user,
            sender=self.other_user,
            notification_type='comment_reply',
            post=post
        ).exists())

