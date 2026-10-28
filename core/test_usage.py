from datetime import datetime
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone

from . import ai, usage
from .models import AIUsage
from .testing import use_up

User = get_user_model()
KST = timezone.get_fixed_timezone(9 * 60)


def kst(*args):
    return datetime(*args, tzinfo=KST)


class WeekTests(TestCase):
    def test_week_starts_monday_midnight_kst(self):
        self.assertEqual(usage.week_start(kst(2026, 10, 28, 15, 30)), kst(2026, 10, 26, 0, 0))   # 수요일 → 그 주 월요일
        self.assertEqual(usage.week_start(kst(2026, 10, 26, 0, 0)), kst(2026, 10, 26, 0, 0))     # 월요일 0시 정각은 새 주
        self.assertEqual(usage.week_start(kst(2026, 10, 25, 23, 59)), kst(2026, 10, 19, 0, 0))   # 일요일 밤은 지난 주
        self.assertEqual(usage.next_reset(kst(2026, 10, 28, 9, 0)), kst(2026, 11, 2, 0, 0))


@override_settings(AI_POINT_USD=0.002, AI_WEEKLY_LIMIT_POINTS=100)
class PointsTests(TestCase):
    def test_points_use_model_prices_cache_discount_and_default_for_unknown_models(self):
        # gemini-3.6-flash: 입력 1.5 / 출력 7.5 / 캐시 0.15 (100만 토큰당 달러), 1점 = 0.002달러
        self.assertAlmostEqual(usage.points_for_tokens("gemini-3.6-flash", 0, 0, 1_000_000), 7.5 / 0.002)
        self.assertAlmostEqual(usage.points_for_tokens("gemini-3.6-flash", 1_000_000, 1_000_000, 0), 0.15 / 0.002)   # 전부 캐시
        self.assertAlmostEqual(usage.points_for_tokens("gemini-3.5-flash-lite", 1_000_000, 0, 0), 0.30 / 0.002)
        self.assertEqual(usage.price_for("something-new"), usage.settings.AI_DEFAULT_PRICE)

    def test_percent_label(self):
        self.assertEqual([usage.percent_label(p) for p in (0, 0.4, 3, 37.4, 100)], ["0", "<1", "3.0", "37", "100"])


@override_settings(AI_POINT_USD=0.002, AI_WEEKLY_LIMIT_POINTS=100)
class InfoTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")

    def test_only_this_users_usage_this_week_counts(self):
        other = User.objects.create_user(username="o", password="pw")
        use_up(self.user, 30)
        use_up(other, 50)
        use_up(self.user, 40, when=usage.week_start() - usage.timedelta(seconds=1))        # 지난 주 마지막 순간
        info = usage.info(self.user)
        self.assertEqual((info["percent"], info["label"]), (30, "30"))
        self.assertAlmostEqual(info["remaining"], 70, delta=0.5)
        self.assertEqual(info["reset_at"], usage.next_reset())

    def test_lecturers_see_their_usage_too_and_it_can_pass_100_percent(self):
        lecturer = User.objects.create_user(username="l", password="pw", is_lecturer=True)
        use_up(lecturer, 135)
        info = usage.info(lecturer)
        self.assertTrue(info["unlimited"])
        self.assertEqual((info["label"], info["percent"]), ("135", 100))          # 라벨은 100을 넘어도 그대로, 막대만 100에서 멈춘다
        ai.require_quota(lecturer, 500)                                           # 그래도 막히지 않는다
        normal = usage.info(self.user)
        self.assertFalse(normal["unlimited"])

    def test_system_work_has_no_gauge(self):
        self.assertIsNone(usage.info(None))

    def test_percent_is_capped_at_100(self):
        use_up(self.user, 250)
        self.assertEqual(usage.info(self.user)["percent"], 100)


@override_settings(AI_POINT_USD=0.002, AI_WEEKLY_LIMIT_POINTS=100, AI_CREDIT_COSTS={"summary": 3, "question": 7})
class QuotaTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")

    def test_blocks_only_when_used_up_or_the_task_would_not_fit(self):
        ai.require_quota(self.user)                                   # 아직 하나도 안 썼다
        use_up(self.user, 95)
        ai.require_quota(self.user, 4)                                # 남은 5 안에 들어간다
        with self.assertRaises(ai.AIQuotaExceeded) as ctx:
            ai.require_quota(self.user, 8)                            # 남은 5보다 크다
        self.assertIn("월요일 0시", str(ctx.exception))
        use_up(self.user, 10)
        with self.assertRaises(ai.AIQuotaExceeded):
            ai.require_quota(self.user)                               # 다 썼다

    def test_check_quota_uses_the_task_estimate(self):
        use_up(self.user, 94)
        ai.check_quota(self.user, "summary")                          # 3 ≤ 6
        with self.assertRaises(ai.AIQuotaExceeded):
            ai.check_quota(self.user, "question")                     # 7 > 6

    def test_a_new_week_resets_the_limit(self):
        use_up(self.user, 150, when=usage.week_start() - usage.timedelta(days=1))
        ai.require_quota(self.user, 50)

    def test_affordable_units(self):
        use_up(self.user, 85)
        self.assertEqual(ai.affordable_units(self.user, "summary"), 5)           # 남은 15 // 3
        self.assertIsNone(ai.affordable_units(User.objects.create_user(username="l", password="pw", is_lecturer=True), "summary"))
        self.assertIsNone(ai.affordable_units(self.user, "grading"))             # 예상 점수가 없는 작업

    def test_lecturers_and_system_work_are_never_blocked(self):
        lecturer = User.objects.create_user(username="l2", password="pw", is_lecturer=True)
        use_up(lecturer, 1000)
        ai.require_quota(lecturer, 500)
        ai.require_quota(None, 500)

    def test_staff_and_superusers_have_a_limit_too(self):
        staff = User.objects.create_user(username="st", password="pw", is_staff=True)
        use_up(staff, 101)
        with self.assertRaises(ai.AIQuotaExceeded):
            ai.require_quota(staff)


@override_settings(AI_POINT_USD=0.002, AI_WEEKLY_LIMIT_POINTS=100, AI_BLOCK_NETWORK=False,
                   AI_MODELS={"chat": "m"}, AI_TASK_PROVIDERS={"chat": "openai"}, AI_CREDIT_COSTS={"chat": 2})
class CallsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")

    @staticmethod
    def fake_client(prompt=100, completion=50, fail=False):
        from types import SimpleNamespace

        def create(**kwargs):
            if fail:
                raise RuntimeError("api down")
            message = SimpleNamespace(content="답", tool_calls=None)
            return SimpleNamespace(choices=[SimpleNamespace(message=message)], usage=SimpleNamespace(
                prompt_tokens=prompt, completion_tokens=completion, prompt_tokens_details=SimpleNamespace(cached_tokens=0)))

        return SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create)))

    def test_a_call_adds_to_usage_and_does_not_spend_credits(self):
        from accounts import credits
        credits.grant(self.user, 5, "test")
        with patch.object(ai, "_client", return_value=self.fake_client(prompt=1_000_000, completion=0)):
            ai.complete("chat", [], user=self.user)
        self.user.refresh_from_db()
        self.assertEqual(self.user.credits, 5)                                    # 크레딧은 그대로
        self.assertAlmostEqual(usage.used_points(self.user), 1.5 / 0.002, delta=0.01)   # 입력 100만 토큰 = 750점
        self.assertEqual(usage.info(self.user)["percent"], 100)

    def test_calls_are_refused_once_the_week_is_used_up(self):
        use_up(self.user, 101)
        with patch.object(ai, "_client", return_value=self.fake_client()) as client:
            with self.assertRaises(ai.AIQuotaExceeded):
                ai.complete("chat", [], user=self.user)
        client.assert_not_called()
        before = AIUsage.objects.count()
        lecturer = User.objects.create_user(username="l", password="pw", is_lecturer=True)
        with patch.object(ai, "_client", return_value=self.fake_client()):
            ai.complete("chat", [], user=lecturer)                                 # 강의자는 통과
        self.assertEqual(AIUsage.objects.count(), before + 1)

    def test_a_failed_call_adds_no_usage(self):
        with patch.object(ai, "_client", return_value=self.fake_client(fail=True)):
            with self.assertRaises(RuntimeError):
                ai.complete("chat", [], user=self.user)
        self.assertEqual(AIUsage.objects.filter(user=self.user).count(), 0)
