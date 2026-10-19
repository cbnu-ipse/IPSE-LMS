import json
import threading
from datetime import timedelta
from http.server import ThreadingHTTPServer
from unittest import mock

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from judge_runner import runner

from . import tasks
from .executors import RunnerUnavailable
from .models import (
    Contest, ContestParticipant, ContestProblem, ContestSubmission, JudgeTask, Problem, TestCase as JudgeCase,
)

User = get_user_model()


class SandboxRunnerTestCase(TestCase):
    """judge_runner/runner.py의 실행 결과 판정 (운영에선 격리된 컨테이너 안에서 돈다)."""

    def test_ok_and_stdin(self):
        r = runner.run("python", "print(int(input()) * 2)", "21\n")
        self.assertEqual((r["status"], r["stdout"].strip()), ("OK", "42"))

    def test_runtime_error(self):
        self.assertEqual(runner.run("python", "raise SystemExit(3)")["status"], "RE")
        self.assertEqual(runner.run("python", "1/0")["status"], "RE")

    def test_time_limit(self):
        r = runner.run("python", "while True: pass", time_limit_ms=300)
        self.assertEqual(r["status"], "TLE")

    def test_output_limit(self):
        r = runner.run("python", "import sys\nwhile True: sys.stdout.write('x' * 65536)", time_limit_ms=2000)
        self.assertIn(r["status"], ("OLE", "TLE"))
        self.assertLessEqual(len(r["stdout"]), runner.MAX_OUTPUT_BYTES)

    def test_unsupported_language(self):
        self.assertEqual(runner.run("cobol", "DISPLAY 1")["status"], "CE")

    def test_environment_has_no_secrets(self):
        with mock.patch.dict("os.environ", {"DATABASE_URL": "postgres://secret", "SECRET_KEY": "x"}):
            r = runner.run("python", "import os\nprint(sorted(os.environ))")
        self.assertEqual(r["status"], "OK")
        self.assertNotIn("DATABASE_URL", r["stdout"])
        self.assertNotIn("SECRET_KEY", r["stdout"])

    def test_background_process_is_killed(self):
        code = "import subprocess, sys\nsubprocess.Popen([sys.executable, '-c', 'import time; time.sleep(30)'])\nprint('done')"
        r = runner.run("python", code, time_limit_ms=1000)
        self.assertEqual(r["status"], "OK")


class _Runner:
    """테스트용 실행기 HTTP 서버 (실제 runner.Handler를 임의 포트로 띄운다)."""

    def __enter__(self):
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), runner.Handler)
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.url = f"http://127.0.0.1:{self.server.server_address[1]}"
        return self

    def __exit__(self, *exc):
        self.server.shutdown()
        self.server.server_close()


class JudgeQueueTestCase(TestCase):
    databases = {"default", "beta_judge"}

    def setUp(self):
        self.user = User.objects.create_user(username="coder", password="pw")
        now = timezone.now()
        self.contest = Contest.objects.create(title="대회", start_time=now - timedelta(hours=1),
                                              end_time=now + timedelta(hours=1), is_public=True)
        self.problem = Problem.objects.create(title="A+B", slug="a-plus-b", statement="두 수의 합", time_limit=1)
        ContestProblem.objects.create(contest=self.contest, problem=self.problem, label="A")
        JudgeCase.objects.create(problem=self.problem, input_data="1 2\n", expected_output="3\n", order=1)
        JudgeCase.objects.create(problem=self.problem, input_data="10 20\n", expected_output="30", order=2)
        ContestParticipant.objects.create(contest=self.contest, user=self.user)
        self.client.force_login(self.user)

    def submit(self, code):
        url = reverse("contest:submit_solution", args=[self.contest.pk, self.problem.pk])
        with mock.patch("contest.executors.urllib.request.urlopen") as urlopen:
            self.client.post(url, {"language": "python", "source_code": code})
            urlopen.assert_not_called()  # 웹 요청 안에서는 코드를 실행하지 않는다
        return ContestSubmission.objects.latest("submitted_at")

    def test_submit_only_enqueues(self):
        sub = self.submit("print(sum(map(int, input().split())))")
        self.assertEqual((sub.result, sub.judge_task.status), ("PENDING", "QUEUED"))

    def test_worker_judges_ac_wa_tle_re(self):
        cases = {
            "print(sum(map(int, input().split())))": "AC",
            "print(0)": "WA",
            "while True: pass": "TLE",
            "raise ValueError": "RE",
        }
        subs = {code: self.submit(code) for code in cases}
        with _Runner() as r, override_settings(JUDGE_RUNNER_URL=r.url):
            while tasks.process_next_task():
                pass
        for code, expected in cases.items():
            sub = ContestSubmission.objects.get(pk=subs[code].pk)
            self.assertEqual(sub.result, expected, code)
            self.assertEqual(sub.judge_task.status, "DONE")
        ac = ContestSubmission.objects.get(pk=subs["print(sum(map(int, input().split())))"].pk)
        self.assertEqual((ac.passed_count, ac.total_count), (2, 2))
        self.assertEqual(ac.testcase_results.count(), 2)

    def test_runner_down_requeues_task(self):
        sub = self.submit("print(3)")
        with override_settings(JUDGE_RUNNER_URL="http://127.0.0.1:9"):
            with self.assertRaises(RunnerUnavailable):
                tasks.process_next_task()
        task = JudgeTask.objects.get(submission=sub)
        self.assertEqual(task.status, "QUEUED")
        self.assertIn("실행기 연결 실패", task.error_message)
        with override_settings(JUDGE_RUNNER_URL=""):
            with self.assertRaises(RunnerUnavailable):
                tasks.process_next_task()

    def test_stale_running_task_is_requeued(self):
        sub = self.submit("print(3)")
        JudgeTask.objects.filter(submission=sub).update(status="RUNNING", started_at=timezone.now() - timedelta(minutes=10))
        self.assertEqual(tasks.requeue_stale_tasks(), 1)
        self.assertEqual(JudgeTask.objects.get(submission=sub).status, "QUEUED")

    def test_status_endpoint_only_returns_own_submissions(self):
        mine = self.submit("print(3)")
        other = User.objects.create_user(username="other", password="pw")
        url = reverse("contest:submission_status", args=[self.contest.pk]) + f"?ids={mine.pk}"
        data = self.client.get(url).json()
        self.assertEqual([s["id"] for s in data["submissions"]], [mine.pk])
        self.client.force_login(other)
        self.assertEqual(self.client.get(url).json()["submissions"], [])

    def test_worker_command_once(self):
        from django.core.management import call_command
        self.submit("print(sum(map(int, input().split())))")
        with _Runner() as r, override_settings(JUDGE_RUNNER_URL=r.url):
            call_command("run_judge_worker", "--once")
        self.assertEqual(ContestSubmission.objects.get().result, "AC")
