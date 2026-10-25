import threading
import time
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase, override_settings

from . import ai, concurrency, vertex

User = get_user_model()


@override_settings(BACKGROUND_AI_CONCURRENCY=3, EXTRACT_CONCURRENCY=2)
class SlotTests(SimpleTestCase):
    def setUp(self):
        concurrency.reset_for_tests()
        self.addCleanup(concurrency.reset_for_tests)

    def hammer(self, slot, workers=12):
        state = {"now": 0, "peak": 0, "done": 0}
        lock = threading.Lock()

        def work():
            with slot():
                with lock:
                    state["now"] += 1
                    state["peak"] = max(state["peak"], state["now"])
                time.sleep(0.03)
                with lock:
                    state["now"] -= 1
                    state["done"] += 1

        threads = [threading.Thread(target=work) for _ in range(workers)]
        [t.start() for t in threads]
        [t.join(10) for t in threads]
        return state

    def test_background_work_never_exceeds_the_limit_and_everything_finishes(self):
        state = self.hammer(concurrency.background_slot)
        self.assertEqual(state["done"], 12)                  # 몰려도 하나도 버려지지 않는다
        self.assertLessEqual(state["peak"], 3)
        self.assertGreater(state["peak"], 1)                 # 그리고 실제로 병렬로 돈다

    def test_extraction_limit_and_timeout(self):
        self.assertLessEqual(self.hammer(concurrency.extract_slot)["peak"], 2)
        with concurrency.extract_slot(), concurrency.extract_slot():
            with self.assertRaises(TimeoutError):            # 자리가 계속 없으면 영원히 붙잡히지 않는다
                with concurrency.extract_slot(timeout=0.05):
                    pass


class _Err(Exception):
    def __init__(self, status):
        super().__init__(f"status {status}")
        self.status = status


class RetryTests(TestCase):
    def setUp(self):
        sleeper = patch("core.ai.time.sleep")
        self.sleep = sleeper.start()
        self.addCleanup(sleeper.stop)

    def test_transient_errors_are_retried_then_succeed(self):
        calls = []

        def flaky():
            calls.append(1)
            if len(calls) < 3:
                raise vertex.VertexError(429, "RESOURCE_EXHAUSTED")
            return "ok"

        self.assertEqual(ai._with_retry(flaky), "ok")
        self.assertEqual((len(calls), self.sleep.call_count), (3, 2))

    def test_gives_up_after_the_delays_and_raises_the_last_error(self):
        def always():
            raise _Err(503)
        with self.assertRaises(_Err):
            ai._with_retry(always)
        self.assertEqual(self.sleep.call_count, len(ai.RETRY_DELAYS))

    def test_non_transient_errors_are_not_retried(self):
        calls = []

        def broken():
            calls.append(1)
            raise vertex.VertexError(400, "INVALID_ARGUMENT")
        with self.assertRaises(vertex.VertexError):
            ai._with_retry(broken)
        with self.assertRaises(RuntimeError):
            ai._with_retry(lambda: (_ for _ in ()).throw(RuntimeError("api down")))
        self.assertEqual(len(calls), 1)
        self.sleep.assert_not_called()

    @override_settings(AI_CREDIT_COSTS={"chat": 2})
    def test_a_retried_call_charges_credits_only_once(self):
        from accounts import credits
        user = User.objects.create_user(username="retry", password="pw")
        credits.grant(user, 10, "test")
        attempts = []

        class Completions:
            def create(self, **kw):
                attempts.append(1)
                if len(attempts) == 1:
                    raise _Err(429)
                message = type("M", (), {"content": "답", "tool_calls": None})()
                return type("R", (), {"choices": [type("C", (), {"message": message})()], "usage": None})()

        client = type("Cl", (), {"chat": type("Ch", (), {"completions": Completions()})()})()
        with override_settings(AI_TASK_PROVIDERS={"chat": "openai"}, AI_MODELS={"chat": "m"}), patch.object(ai, "_client", return_value=client):
            self.assertEqual(ai.complete("chat", [], user=user), "답")
        user.refresh_from_db()
        self.assertEqual((len(attempts), user.credits), (2, 8))
