import json
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from assistant.tools import TOOL_FUNCTIONS, dispatch_tool
from contest.models import Contest, ContestSubmission, Problem as ContestProblem
from course.models import Course, CourseCategory, Lesson, LessonQuizResult, Unit, UserCourseProgress
from mypage.models import GeneratedQuestion, PersonalDocument
from problems.models import Problem, SolveRecord
from quiz.models import Quiz, Sitting

from .learning import overview

User = get_user_model()


class LearningOverviewTestCase(TestCase):
    databases = {"default", "beta_judge"}

    def setUp(self):
        self.user = User.objects.create_user(username="learner", password="pw")
        self.other = User.objects.create_user(username="other", password="pw")
        category = CourseCategory.objects.create(title="AI 자동 생성")
        self.course = Course.objects.create(code="DB1", title="데이터베이스", category=category, instructor=self.other)
        unit = Unit.objects.create(course=self.course, title="조인", order=0)
        cards = [{"title": "t", "body": "b"}]
        self.good = Lesson.objects.create(course=self.course, unit=unit, title="조인 기초", content="", cards=cards, order=0)
        self.weak = Lesson.objects.create(course=self.course, unit=unit, title="외부 조인", content="", cards=cards, order=1)
        Lesson.objects.create(course=self.course, unit=unit, title="안 본 세트", content="", cards=cards, order=2)
        progress = UserCourseProgress.objects.create(user=self.user, course=self.course)
        progress.completed_lessons.add(self.good, self.weak)
        LessonQuizResult.objects.create(user=self.user, lesson=self.good, correct=3, total=3)
        LessonQuizResult.objects.create(user=self.user, lesson=self.weak, correct=1, total=4, wrong=[0, 1, 2])
        LessonQuizResult.objects.create(user=self.other, lesson=self.good, correct=0, total=3)  # 남의 기록

        doc = PersonalDocument.objects.create(user=self.user, title="d", file="d.txt")
        GeneratedQuestion.objects.create(document=doc, question_type="ox", is_correct=True)
        GeneratedQuestion.objects.create(document=doc, question_type="ox", is_correct=False)
        GeneratedQuestion.objects.create(document=doc, question_type="ox")  # 아직 안 푼 문제

        quiz = Quiz.objects.create(title="1주차 퀴즈", course=self.course)
        Sitting.objects.create(user=self.user, quiz=quiz, course=self.course, question_order="1,2", question_list="",
                               incorrect_questions="", current_score=1, complete=True, user_answers="{}",
                               end=timezone.now())

        now = timezone.now()
        contest = Contest.objects.create(title="대회", start_time=now - timedelta(hours=1), end_time=now + timedelta(hours=1))
        cp = ContestProblem.objects.create(title="A+B", slug="ab", statement="s")
        for result in ("WA", "AC", "AC"):
            ContestSubmission.objects.create(contest=contest, problem=cp, user=self.user, source_code="x", result=result)
        ContestSubmission.objects.create(contest=contest, problem=cp, user=self.other, source_code="x", result="AC")
        problem = Problem.objects.create(title="플래그", description="d", flag="f", author=self.other)
        SolveRecord.objects.create(user=self.user, problem=problem, status="SOLVED", solved_at=now)

    def test_overview_collects_every_source_for_this_user_only(self):
        data = overview(self.user)
        course = data["courses"][0]
        self.assertEqual((course["percent"], course["sets_done"], course["sets_total"]), (66, 2, 3))
        self.assertEqual((course["quiz_correct"], course["quiz_total"], course["accuracy"]), (4, 7, 57))
        self.assertEqual(data["lecture_quiz"], {"sets": 2, "correct": 4, "total": 7, "accuracy": 57})
        self.assertEqual([w["score"] for w in data["weak_sets"]], ["1/4"])
        self.assertEqual(data["review_questions"], {"answered": 2, "correct": 1, "accuracy": 50})
        self.assertEqual(data["quizzes"], {"attempts": 1, "completed": 1, "average": 50})
        self.assertEqual(data["contests"], {"submissions": 3, "accepted": 2, "problems_solved": 1})
        self.assertEqual(data["problems"], {"solved": 1, "attempting": 0})
        kinds = {e["kind"] for e in data["recent"]}
        self.assertEqual(kinds, {"강의 문제", "퀴즈", "대회 제출", "문제 해결"})
        times = [e["at"] for e in data["recent"]]
        self.assertEqual(times, sorted(times, reverse=True))

    def test_page_and_nav(self):
        self.client.force_login(self.user)
        res = self.client.get(reverse("mypage:learning"))
        self.assertContains(res, "다시 볼 세트")
        self.assertContains(res, "외부 조인")
        self.assertContains(res, "57%")
        self.assertContains(res, "내 학습")

    def test_assistant_tool_is_compact_and_serializable(self):
        self.assertIn("get_my_learning_overview", TOOL_FUNCTIONS)
        data = dispatch_tool(self.user, "get_my_learning_overview", {})
        json.dumps(data, ensure_ascii=False)
        self.assertNotIn("url", data["courses"][0])
        self.assertEqual(data["lecture_quiz"]["accuracy"], 57)

    def test_empty_user(self):
        data = overview(User.objects.create_user(username="new", password="pw"))
        self.assertEqual((data["courses"], data["recent"], data["lecture_quiz"]["accuracy"]), ([], [], None))
