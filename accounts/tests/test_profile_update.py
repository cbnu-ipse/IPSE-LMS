from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from accounts.models import Student
from accounts.forms import ProfileUpdateForm

User = get_user_model()

class ProfileUpdateTests(TestCase):
    def setUp(self):
        self.student_user = User.objects.create_user(
            username='student1',
            password='password123',
            is_student=True,
            first_name='Gildong',
            last_name='Hong'
        )
        self.staff_user = User.objects.create_user(
            username='staff1',
            password='password123',
            is_student=False,
            is_lecturer=True,
            first_name='Chulsoo',
            last_name='Kim'
        )
        
        # Student profile object is automatically created via post_save signal
        self.student_profile = self.student_user.student
        self.student_profile.nickname = 'GildongNick'
        self.student_profile.bio = 'Hello world'
        self.student_profile.github_url = 'https://github.com/gildong'
        self.student_profile.blog_url = 'https://gildong.blog'
        self.student_profile.save()
        
        self.client = Client()

    def test_form_fields_for_student(self):
        form = ProfileUpdateForm(instance=self.student_user)
        self.assertIn('nickname', form.fields)
        self.assertIn('bio', form.fields)
        self.assertIn('github_url', form.fields)
        self.assertIn('blog_url', form.fields)
        
        self.assertEqual(form.fields['nickname'].initial, 'GildongNick')
        self.assertEqual(form.fields['bio'].initial, 'Hello world')
        self.assertEqual(form.fields['github_url'].initial, 'https://github.com/gildong')
        self.assertEqual(form.fields['blog_url'].initial, 'https://gildong.blog')

    def test_form_fields_for_non_student(self):
        form = ProfileUpdateForm(instance=self.staff_user)
        self.assertNotIn('nickname', form.fields)
        self.assertNotIn('bio', form.fields)
        self.assertNotIn('github_url', form.fields)
        self.assertNotIn('blog_url', form.fields)

    def test_form_save_updates_student_fields(self):
        data = {
            'first_name': 'Gildong2',
            'last_name': 'Hong2',
            'gender': 'M',
            'email': 'gildong2@example.com',
            'phone': '010-9999-8888',
            'address': 'Cheongju',
            'nickname': 'NewNick',
            'bio': 'New Bio info',
            'github_url': 'https://github.com/newgildong',
            'blog_url': 'https://newgildong.blog'
        }
        form = ProfileUpdateForm(data, instance=self.student_user)
        self.assertTrue(form.is_valid(), form.errors)
        
        updated_user = form.save()
        self.assertEqual(updated_user.first_name, 'Gildong2')
        self.assertEqual(updated_user.email, 'gildong2@example.com')
        
        # Verify student fields updated
        self.student_profile.refresh_from_db()
        self.assertEqual(self.student_profile.nickname, 'NewNick')
        self.assertEqual(self.student_profile.bio, 'New Bio info')
        self.assertEqual(self.student_profile.github_url, 'https://github.com/newgildong')
        self.assertEqual(self.student_profile.blog_url, 'https://newgildong.blog')

    def test_profile_edit_view_get_and_post(self):
        self.client.login(username='student1', password='password123')
        edit_url = reverse('edit_profile')
        
        # GET request
        response = self.client.get(edit_url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '닉네임 (Nickname)')
        
        # POST request
        post_data = {
            'first_name': 'Gildong3',
            'last_name': 'Hong3',
            'gender': 'M',
            'email': 'gildong3@example.com',
            'phone': '010-7777-7777',
            'address': 'Cheongju',
            'nickname': 'SuperGildong',
            'bio': 'I am Gildong',
            'github_url': 'https://github.com/supergildong',
            'blog_url': 'https://supergildong.blog'
        }
        response = self.client.post(edit_url, post_data)
        self.assertEqual(response.status_code, 302)  # Redirects to profile page on success
        
        self.student_profile.refresh_from_db()
        self.assertEqual(self.student_profile.nickname, 'SuperGildong')
        self.assertEqual(self.student_profile.bio, 'I am Gildong')
