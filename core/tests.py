from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
import datetime
import json
from .models import Schedule

User = get_user_model()

class ScheduleRecurrenceTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='staff_user',
            password='password123',
            is_staff=True
        )
        self.client = Client()
        self.client.login(username='staff_user', password='password123')

    def test_add_recurrence_daily(self):
        # 1. 매일 반복 일정 추가 테스트 (5일간)
        url = reverse('add_schedule_api')
        start_time = timezone.now() + datetime.timedelta(days=1)
        end_time = start_time + datetime.timedelta(hours=1)
        
        # 5일 뒤 종료하도록 설정
        recurrence_end = (start_time + datetime.timedelta(days=4)).date().isoformat()
        
        response = self.client.post(url, json.dumps({
            'title': '매일 공부 모임',
            'description': '매일매일 공부합니다.',
            'start': start_time.isoformat(),
            'end': end_time.isoformat(),
            'is_global': False,
            'recurrence_type': 'DAILY',
            'recurrence_end': recurrence_end
        }), content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'success')
        
        # 5개 생성되었는지 검증
        schedules = Schedule.objects.filter(recurrence_type='DAILY')
        self.assertEqual(schedules.count(), 5)
        
        # 각 일정이 1일 간격으로 떨어져 있는지 검증
        s_list = list(schedules.order_by('start_date'))
        for i in range(1, 5):
            diff = s_list[i].start_date - s_list[0].start_date
            self.assertEqual(diff.days, i)

    def test_delete_recurrence(self):
        # 테스트용 반복 그룹 일정 3개 직접 생성
        recur_group = "test-group-uuid"
        base_time = timezone.now()
        
        s1 = Schedule.objects.create(
            title='반복 일정 1', start_date=base_time, user=self.user,
            recurrence_type='WEEKLY', recurrence_group=recur_group
        )
        s2 = Schedule.objects.create(
            title='반복 일정 2', start_date=base_time + datetime.timedelta(weeks=1), user=self.user,
            recurrence_type='WEEKLY', recurrence_group=recur_group
        )
        s3 = Schedule.objects.create(
            title='반복 일정 3', start_date=base_time + datetime.timedelta(weeks=2), user=self.user,
            recurrence_type='WEEKLY', recurrence_group=recur_group
        )
        
        # 1. 이 일정만 삭제
        del_url_1 = reverse('delete_schedule_api', kwargs={'sch_id': s1.id})
        response = self.client.post(del_url_1, json.dumps({
            'delete_type': 'one'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Schedule.objects.filter(id=s1.id).exists())
        self.assertEqual(Schedule.objects.filter(recurrence_group=recur_group).count(), 2)
        
        # 2. 전체 반복 일정 일괄 삭제
        del_url_2 = reverse('delete_schedule_api', kwargs={'sch_id': s2.id})
        response = self.client.post(del_url_2, json.dumps({
            'delete_type': 'all'
        }), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        # s2 및 동일 그룹이었던 s3 도 모두 지워져야 함
        self.assertFalse(Schedule.objects.filter(recurrence_group=recur_group).exists())

    def test_update_recurrence(self):
        recur_group = "test-group-uuid"
        base_time = timezone.now()
        
        s1 = Schedule.objects.create(
            title='원래 제목', start_date=base_time, user=self.user,
            recurrence_type='DAILY', recurrence_group=recur_group
        )
        s2 = Schedule.objects.create(
            title='원래 제목', start_date=base_time + datetime.timedelta(days=1), user=self.user,
            recurrence_type='DAILY', recurrence_group=recur_group
        )

        update_url = reverse('update_schedule_api', kwargs={'sch_id': s1.id})
        
        # 1. 단일 일정만 수정 (그룹 분리 및 제목 변경)
        response = self.client.post(update_url, json.dumps({
            'title': '수정된 단독 제목',
            'description': '단독 변경 메모',
            'start': base_time.isoformat(),
            'update_type': 'one'
        }), content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        s1.refresh_from_db()
        self.assertEqual(s1.title, '수정된 단독 제목')
        self.assertEqual(s1.recurrence_group, '')  # 그룹 탈퇴
        
        # s2는 그룹에 그대로 남아있고 제목도 변하지 않아야 함
        s2.refresh_from_db()
        self.assertEqual(s2.title, '원래 제목')
        self.assertEqual(s2.recurrence_group, recur_group)

        # 새로운 그룹을 가진 다른 두 일정 생성해서 전체 수정 테스트
        new_group = "new-group-uuid"
        t1 = Schedule.objects.create(
            title='원래 제목 A', start_date=base_time, user=self.user,
            recurrence_type='DAILY', recurrence_group=new_group
        )
        t2 = Schedule.objects.create(
            title='원래 제목 B', start_date=base_time + datetime.timedelta(days=1), user=self.user,
            recurrence_type='DAILY', recurrence_group=new_group
        )
        
        # 2. 모든 반복 일정 일괄 수정 (2시간 뒤로 시간 평행이동)
        new_start = base_time + datetime.timedelta(hours=2)
        update_url_all = reverse('update_schedule_api', kwargs={'sch_id': t1.id})
        
        response = self.client.post(update_url_all, json.dumps({
            'title': '일괄 변경 제목',
            'description': '일괄 메모',
            'start': new_start.isoformat(),
            'update_type': 'all'
        }), content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        t1.refresh_from_db()
        t2.refresh_from_db()
        
        # 두 일정이 모두 일괄 변경되었는지 검증
        self.assertEqual(t1.title, '일괄 변경 제목')
        self.assertEqual(t2.title, '일괄 변경 제목')
        
        # 둘 다 2시간씩 시간이 밀렸는지 검증
        self.assertEqual(t1.start_date.hour, new_start.hour)
        self.assertEqual(t2.start_date, base_time + datetime.timedelta(days=1, hours=2))
