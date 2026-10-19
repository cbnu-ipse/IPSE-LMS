import logging

from django.utils import timezone

from .executors import RunnerUnavailable, execute_code
from .models import SubmissionTestCaseResult

logger = logging.getLogger(__name__)

# 실행기 상태 → 제출 결과. 여러 테스트케이스가 틀리면 처음 틀린 케이스의 결과를 쓴다.
_STATUS_RESULT = {"TLE": "TLE", "MLE": "MLE", "OLE": "RE", "RE": "RE", "CE": "CE", "SE": "RE"}
_STATUS_MESSAGE = {
    "TLE": "시간 초과", "MLE": "메모리 초과", "OLE": "출력 초과", "RE": "런타임 에러",
    "CE": "컴파일 에러", "SE": "채점기 오류",
}
_RESULT_MESSAGE = {
    "AC": "모든 테스트케이스를 통과했습니다.",
    "WA": "일부 테스트케이스의 출력이 다릅니다.",
    "TLE": "시간 제한을 넘긴 테스트케이스가 있습니다.",
    "MLE": "메모리 제한을 넘긴 테스트케이스가 있습니다.",
    "RE": "실행 중 오류가 난 테스트케이스가 있습니다.",
    "CE": "코드를 실행할 수 없습니다.",
}


def _normalize(text):
    """줄 끝 공백과 마지막 빈 줄 차이는 무시한다."""
    return "\n".join(line.rstrip() for line in text.strip().splitlines())


def judge_submission(problem, source_code, language="python"):
    """테스트케이스를 모두 실행해 결과를 낸다. 실행기에 닿지 못하면 RunnerUnavailable."""
    testcases = list(problem.testcases.all().order_by("order", "id"))
    results, passed_count, verdict, max_time = [], 0, None, None

    for testcase in testcases:
        run = execute_code(problem=problem, source_code=source_code, input_data=testcase.input_data,
                           language=language)
        status = run.get("status", "SE")
        actual = run.get("stdout", "")
        if run.get("time_ms") is not None:
            max_time = max(max_time or 0, run["time_ms"])
        if status == "OK" and _normalize(actual) == _normalize(testcase.expected_output):
            passed_count += 1
            message, passed = "통과", True
        else:
            passed = False
            case_result = "WA" if status == "OK" else _STATUS_RESULT.get(status, "RE")
            message = "출력 불일치" if status == "OK" else _STATUS_MESSAGE.get(status, "런타임 에러")
            verdict = verdict or case_result
            if status == "CE":  # 실행 자체가 안 되면 나머지 케이스도 같으니 멈춘다
                results.append({"testcase": testcase, "passed": False, "actual_output": "",
                                "judge_message": run.get("stderr", "")[:255] or message})
                break
        results.append({"testcase": testcase, "passed": passed, "actual_output": actual,
                        "judge_message": message})

    if not testcases:
        verdict = "WA"
    result = verdict or "AC"
    return {
        "result": result,
        "passed_count": passed_count,
        "total_count": len(testcases),
        "judge_message": _RESULT_MESSAGE.get(result, ""),
        "execution_time_ms": max_time,
        "testcase_results": results,
    }


def run_judge(submission):
    """제출 하나를 채점해 저장한다. 실행기에 닿지 못하면 RunnerUnavailable을 그대로 올려
    호출한 쪽(채점 워커)이 작업을 대기열로 되돌리게 한다."""
    judge_task = submission.judge_task
    try:
        data = judge_submission(submission.problem, submission.source_code, submission.language)
    except RunnerUnavailable:
        raise
    except Exception as exc:
        logger.exception("judge failed: submission=%s", submission.pk)
        submission.result = "RE"
        submission.judge_message = "채점 중 오류가 발생했습니다."
        submission.save()
        judge_task.status = "FAILED"
        judge_task.error_message = str(exc)
        judge_task.finished_at = timezone.now()
        judge_task.save()
        return submission

    submission.result = data["result"]
    submission.passed_count = data["passed_count"]
    submission.total_count = data["total_count"]
    submission.judge_message = data["judge_message"]
    submission.execution_time_ms = data["execution_time_ms"]
    submission.save()
    submission.testcase_results.all().delete()
    SubmissionTestCaseResult.objects.bulk_create([
        SubmissionTestCaseResult(submission=submission, testcase=r["testcase"], passed=r["passed"],
                                 actual_output=r["actual_output"][:65535], judge_message=r["judge_message"][:255])
        for r in data["testcase_results"]
    ])
    judge_task.status = "DONE"
    judge_task.error_message = ""
    judge_task.finished_at = timezone.now()
    judge_task.save()
    return submission
