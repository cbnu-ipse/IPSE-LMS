import csv
import io
import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse

from .models import (
    CommunityPost, Survey, SurveyAnswer, SurveyQuestion, SurveyQuestionChoice, SurveyResponse,
)
from .views import _survey_structure_matches_existing

User = get_user_model()


class SurveyMultipleChoiceTestCase(TestCase):
    def setUp(self):
        self.author = User.objects.create_user(username='mc_author', password='pw', is_staff=True)
        self.user = User.objects.create_user(username='mc_user', password='pw')
        self.other = User.objects.create_user(username='mc_other', password='pw')
        self.post = CommunityPost.objects.create(title='복수 선택 설문', content='내용', author=self.author)
        self.survey = Survey.objects.create(post=self.post, title='설문', created_by=self.author)
        self.multi = SurveyQuestion.objects.create(
            survey=self.survey, question_text='여러 개 고르세요', question_type='CHOICE', order=1, allow_multiple=True)
        self.m = [SurveyQuestionChoice.objects.create(question=self.multi, choice_text=t, order=i)
                  for i, t in enumerate(['A', 'B', 'C'])]
        self.single = SurveyQuestion.objects.create(
            survey=self.survey, question_text='하나만 고르세요', question_type='CHOICE', order=2)
        self.s = [SurveyQuestionChoice.objects.create(question=self.single, choice_text=t, order=i)
                  for i, t in enumerate(['X', 'Y'])]
        self.client = Client()
        self.client.login(username='mc_user', password='pw')

    def _respond(self, payload, client=None):
        return (client or self.client).post(
            reverse('survey_respond', kwargs={'survey_id': self.survey.id}),
            data=json.dumps(payload), content_type='application/json')

    def _page(self, query=''):
        return self.client.get(reverse('post_detail', kwargs={'post_id': self.post.id}) + query).content.decode()

    def test_multiple_choices_are_saved_for_multi_question(self):
        res = self._respond({f'question_{self.multi.id}': [self.m[0].id, self.m[2].id],
                             f'question_{self.single.id}': self.s[1].id})
        self.assertEqual(res.status_code, 200)
        response = SurveyResponse.objects.get()
        chosen = set(response.answers.filter(question=self.multi).values_list('choice_id', flat=True))
        self.assertEqual(chosen, {self.m[0].id, self.m[2].id})
        self.assertEqual(response.answers.filter(question=self.single).count(), 1)

    def test_single_choice_question_rejects_multiple_and_rolls_back(self):
        first = self._respond({f'question_{self.multi.id}': [self.m[0].id]}).json()
        self.assertEqual(first['status'], 'success')
        bad = self._respond({f'question_{self.multi.id}': [self.m[1].id],
                             f'question_{self.single.id}': [self.s[0].id, self.s[1].id]})
        self.assertEqual(bad.status_code, 400)
        # 실패한 제출이 기존 응답을 지우거나 새 응답을 남기지 않는다
        self.assertEqual(SurveyResponse.objects.count(), 1)
        self.assertEqual(list(SurveyAnswer.objects.values_list('choice_id', flat=True)), [self.m[0].id])

    def test_choice_from_another_question_is_rejected(self):
        res = self._respond({f'question_{self.multi.id}': [self.s[0].id]})
        self.assertEqual(res.status_code, 400)
        self.assertFalse(SurveyResponse.objects.exists())

    def test_resubmitting_replaces_previous_selection(self):
        self._respond({f'question_{self.multi.id}': [self.m[0].id, self.m[1].id]})
        self._respond({f'question_{self.multi.id}': [self.m[2].id]})  # 1인 1회: 기존 응답을 갱신
        self.assertEqual(SurveyResponse.objects.count(), 1)
        self.assertEqual(list(SurveyAnswer.objects.values_list('choice_id', flat=True)), [self.m[2].id])

    def test_page_renders_checkbox_only_for_multi_question_and_prefills(self):
        html = self._page()
        self.assertEqual(html.count(f'type="checkbox" name="question_{self.multi.id}"'), 3)
        self.assertEqual(html.count(f'type="radio" name="question_{self.single.id}"'), 2)
        self.assertIn('복수 선택 가능', html)
        self._respond({f'question_{self.multi.id}': [self.m[0].id, self.m[1].id]})
        edit = self._page('?modify_response=1')
        for choice, checked in zip(self.m, (True, True, False)):
            tag = f'name="question_{self.multi.id}" value="{choice.id}"'
            start = edit.index(tag)
            self.assertEqual('checked' in edit[start:edit.index('>', start)], checked)

    def test_results_api_and_csv_export_handle_multiple_answers(self):
        self._respond({f'question_{self.multi.id}': [self.m[0].id, self.m[1].id]})
        other = Client()
        other.login(username='mc_other', password='pw')
        self._respond({f'question_{self.multi.id}': [self.m[0].id]}, client=other)

        staff = Client()
        staff.login(username='mc_author', password='pw')
        data = staff.get(reverse('survey_results_api', kwargs={'survey_id': self.survey.id})).json()
        multi = next(q for q in data['results'] if q['id'] == self.multi.id)
        self.assertEqual(multi['answered'], 2)  # 선택 수는 3개지만 응답자는 2명
        self.assertEqual({s['choice_text']: s['count'] for s in multi['stats']}, {'A': 2, 'B': 1, 'C': 0})
        cells = [row['answers'][0] for row in data['respondents']['rows']]
        self.assertCountEqual(cells, ['A, B', 'A'])

        csv_text = staff.get(reverse('survey_results_export', kwargs={'survey_id': self.survey.id})).content.decode('utf-8-sig')
        rows = list(csv.reader(io.StringIO(csv_text)))
        self.assertCountEqual([r[3] for r in rows[1:]], ['A, B', 'A'])

    def test_post_create_saves_allow_multiple_only_for_choice(self):
        client = Client()
        client.login(username='mc_user', password='pw')
        survey_json = {
            'title': '새 설문', 'description': '', 'is_anonymous': False, 'allow_duplicate_response': False,
            'questions': [
                {'sequence': 0, 'title': '복수', 'question_type': 'CHOICE', 'allow_multiple': True,
                 'choices': [{'text': '가'}, {'text': '나'}]},
                {'sequence': 1, 'title': '단일', 'question_type': 'CHOICE',
                 'choices': [{'text': '가'}, {'text': '나'}]},
                {'sequence': 2, 'title': '주관식', 'question_type': 'TEXT', 'allow_multiple': True},
            ],
        }
        res = client.post(reverse('post_create'), {'title': '새 글', 'content': '내용', 'category': 'free',
                                                   'survey_data': json.dumps(survey_json)})
        self.assertEqual(res.status_code, 302)
        survey = CommunityPost.objects.get(title='새 글').survey
        self.assertEqual([q.allow_multiple for q in survey.questions.all()], [True, False, False])

    def test_changing_multiple_setting_is_blocked_once_responses_exist(self):
        base = [
            {'sequence': 1, 'title': '여러 개 고르세요', 'question_type': 'CHOICE', 'allow_multiple': True,
             'choices': [{'text': 'A'}, {'text': 'B'}, {'text': 'C'}]},
            {'sequence': 2, 'title': '하나만 고르세요', 'question_type': 'CHOICE',
             'choices': [{'text': 'X'}, {'text': 'Y'}]},
        ]
        self.assertTrue(_survey_structure_matches_existing(self.survey, base))
        base[0]['allow_multiple'] = False
        self.assertFalse(_survey_structure_matches_existing(self.survey, base))
