from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from unittest.mock import patch
import json
import datetime

from accounts.models import LMSToken
from core.models import Schedule

User = get_user_model()

class LMSImportAssignmentsAPITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='2020123456',
            password='password',
            first_name='Gildong',
            last_name='Hong'
        )
        self.url = reverse('lms_import_assignments_api')

    def test_import_api_requires_login(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 302)

    def test_import_api_without_token(self):
        self.client.login(username='2020123456', password='password')
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'error')
        self.assertEqual(data['message'], 'LMS 연동이 되어있지 않습니다.')

    @patch('accounts.views._lms_call')
    def test_import_api_success_and_semester_filtering(self, mock_lms_call):
        self.client.login(username='2020123456', password='password')
        
        # Create token
        LMSToken.objects.create(
            user=self.user,
            token='test-token-123',
            lms_username='lmsuser',
            moodle_user_id=999
        )

        now = timezone.now()
        # Mock course active this semester (enddate in the future or 0)
        course_active = {
            'id': 101,
            'fullname': 'Software Engineering',
            'enddate': int((now + datetime.timedelta(days=30)).timestamp())
        }
        # Mock course from past semester (enddate in the past)
        course_past = {
            'id': 102,
            'fullname': 'Intro to Programming',
            'enddate': int((now - datetime.timedelta(days=120)).timestamp())
        }

        # Mock assignments structure
        assignments_response = {
            'courses': [
                {
                    'id': 101,
                    'fullname': 'Software Engineering',
                    'assignments': [
                        {
                            'id': 201,
                            'name': 'Sprint 1 Report',
                            'duedate': int((now + datetime.timedelta(days=5)).timestamp())
                        },
                        {
                            'id': 202,
                            'name': 'Sprint 2 Report',
                            'duedate': int((now + datetime.timedelta(days=15)).timestamp())
                        }
                    ]
                }
            ]
        }

        # Mock submission status responses
        sub_status_201 = {
            'lastattempt': {
                'submission': {
                    'status': 'submitted'
                }
            }
        }
        sub_status_202 = {
            'lastattempt': {
                'submission': {
                    'status': 'draft',
                    'plugins': [
                        {
                            'type': 'file',
                            'fileareas': [
                                {
                                    'area': 'submission_files',
                                    'files': [
                                        {'filename': 'sprint2.pdf', 'fileurl': 'http://lms/sprint2.pdf', 'filesize': 1024}
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        }

        # Mock _lms_call:
        # First call gets courses
        # Second call gets assignments
        # Third and Fourth calls get submission status for the assignments
        mock_lms_call.side_effect = [
            [course_active, course_past],  # core_enrol_get_users_courses return
            assignments_response,          # mod_assign_get_assignments return
            sub_status_201,
            sub_status_202,
        ]

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        self.assertEqual(data['status'], 'ok')
        self.assertEqual(data['imported'], 2)
        self.assertEqual(data['skipped'], 0)

        # Verify database schedules created and completed flag set correctly
        user_schedules = Schedule.objects.filter(user=self.user)
        self.assertEqual(user_schedules.count(), 2)
        self.assertTrue(user_schedules.filter(title='Sprint 1 Report', is_completed=True).exists())
        self.assertTrue(user_schedules.filter(title='Sprint 2 Report', is_completed=True).exists())

        # Test duplicate skipping on subsequent call
        # Mock call again
        mock_lms_call.side_effect = [
            [course_active, course_past],
            assignments_response,
            sub_status_201,
            sub_status_202,
        ]

        response2 = self.client.post(self.url)
        self.assertEqual(response2.status_code, 200)
        data2 = json.loads(response2.content)
        self.assertEqual(data2['status'], 'ok')
        self.assertEqual(data2['imported'], 0)
        self.assertEqual(data2['skipped'], 2)  # skipped due to duplicates

        # Schedule count remains 2
        self.assertEqual(Schedule.objects.filter(user=self.user).count(), 2)
