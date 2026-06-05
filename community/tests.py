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
