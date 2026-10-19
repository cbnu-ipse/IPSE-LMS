"""제출 코드 실행 — 직접 실행하지 않고 격리된 채점 실행기(judge_runner 컨테이너)에 맡긴다."""
import json
import urllib.error
import urllib.request

from django.conf import settings


class RunnerUnavailable(Exception):
    """실행기에 닿지 못함 (설정 없음·연결 실패). 채점 작업은 실패 처리하지 않고 다시 대기열로 돌린다."""


def execute_code(problem, source_code, input_data, language="python"):
    """실행 결과 {"status": OK|RE|TLE|MLE|OLE|CE|SE, "stdout", "stderr", "time_ms"}."""
    url = settings.JUDGE_RUNNER_URL
    if not url:
        raise RunnerUnavailable("JUDGE_RUNNER_URL이 설정되어 있지 않습니다.")
    # 문제마다 정한 제한(초, MB)을 쓰고, 없으면 기본값
    time_limit_ms = (getattr(problem, "time_limit", None) or 0) * 1000 or settings.JUDGE_TIME_LIMIT_MS
    payload = json.dumps({
        "language": language,
        "source": source_code,
        "input": input_data,
        "time_limit_ms": time_limit_ms,
        "memory_mb": getattr(problem, "memory_limit", None) or settings.JUDGE_MEMORY_MB,
    }).encode()
    request = urllib.request.Request(url.rstrip("/") + "/run", data=payload,
                                     headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=time_limit_ms / 1000 + 15) as response:
            return json.loads(response.read())
    except (urllib.error.URLError, TimeoutError, ConnectionError, ValueError) as exc:
        raise RunnerUnavailable(str(exc)) from exc
