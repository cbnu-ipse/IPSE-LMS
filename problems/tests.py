from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from contest.models import (
    Contest, ContestParticipant, ContestProblem, ContestSubmission, JudgeTask, Problem as ContestTaskProblem,
)
from course.models import CourseCategory

from .models import Problem, ProblemComment, SolveRecord

User = get_user_model()


class CrossDatabasePagesTestCase(TestCase):
    """문제·대회 데이터(judge DB)와 사용자·강의 카테고리(기본 DB)는 서로 다른 DB에 있다.
    두 DB를 한 SQL로 JOIN(select_related)하면 "no such table"로 깨지므로, 각 화면이 실제 데이터로 열리는지 확인한다."""

    databases = {"default", "beta_judge"}

    def setUp(self):
        self.user = User.objects.create_user(username="solver", password="pw", is_staff=True)
        self.author = User.objects.create_user(username="author", password="pw")
        category = CourseCategory.objects.create(title="웹 해킹")
        self.problem = Problem.objects.create(title="쿠키 문제", category=category, difficulty=2, points=150,
                                              description="d", flag="flag{x}", author=self.author)
        SolveRecord.objects.create(user=self.user, problem=self.problem, status="SOLVED", solved_at=timezone.now())
        ProblemComment.objects.create(problem=self.problem, author=self.author, content="힌트 주세요")

        now = timezone.now()
        self.contest = Contest.objects.create(title="가을 대회", start_time=now - timedelta(hours=2),
                                              end_time=now + timedelta(hours=1), is_public=True)
        task = ContestTaskProblem.objects.create(title="A+B", slug="ab", statement="s")
        ContestProblem.objects.create(contest=self.contest, problem=task, label="A")
        ContestParticipant.objects.create(contest=self.contest, user=self.user)
        sub = ContestSubmission.objects.create(contest=self.contest, problem=task, user=self.user, source_code="x",
                                               result="AC", passed_count=1, total_count=1)
        JudgeTask.objects.create(submission=sub, status="DONE")
        self.client.force_login(self.user)

    def test_problem_list(self):
        res = self.client.get(reverse("problem_list"))
        self.assertContains(res, "쿠키 문제")
        self.assertContains(res, "웹 해킹")
        self.assertEqual([u.username for u in res.context["top_rankers"]], ["solver"])
        self.assertEqual(res.context["top_rankers"][0].problem_score, 150)

    def test_problem_detail(self):
        res = self.client.get(reverse("problem_detail", args=[self.problem.pk]))
        self.assertContains(res, "쿠키 문제")
        self.assertContains(res, "힌트 주세요")

    def test_contest_pages(self):
        res = self.client.get(reverse("contest:list"))  # 진행 중 대회의 실시간 점수판 포함
        self.assertContains(res, "가을 대회")
        for name in ("submissions", "my_submissions"):
            res = self.client.get(reverse(f"contest:{name}", args=[self.contest.pk]))
            self.assertContains(res, "A+B", msg_prefix=name)

    def test_contest_ranking_board(self):
        res = self.client.get(reverse("ranking:home") + "?board=contest")
        self.assertIn(res.status_code, (200, 302))
