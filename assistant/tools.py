"""LLM이 호출하는 읽기 전용 조회 함수들.

모든 함수는 `user`를 첫 인자로 받아 그 사용자의 데이터만 조회한다.
LLM이 넘기는 인자에는 절대 user/user_id를 받지 않는다 — 다른 사용자의
데이터를 조회하도록 유도해도 서버에서 원천적으로 불가능해야 하기 때문이다.
"""

MAX_ITEMS = 20


def list_my_documents(user, **_kwargs):
    from mypage.models import PersonalDocument

    docs = PersonalDocument.objects.filter(user=user).order_by("-uploaded_at")[:MAX_ITEMS]
    return [
        {"id": d.pk, "title": d.title, "summary": d.summary[:200]}
        for d in docs
    ]


def get_document_detail(user, document_id, **_kwargs):
    from mypage.models import GeneratedQuestion, PersonalDocument

    try:
        document = PersonalDocument.objects.get(pk=document_id, user=user)
    except (PersonalDocument.DoesNotExist, ValueError, TypeError):
        return {"error": "해당 자료를 찾을 수 없습니다."}

    questions = GeneratedQuestion.objects.filter(document=document)
    return {
        "id": document.pk,
        "title": document.title,
        "summary": document.summary,
        "question_count": questions.count(),
        "correct_count": questions.filter(is_correct=True).count(),
        "incorrect_count": questions.filter(is_correct=False).count(),
    }


def list_my_course_progress(user, **_kwargs):
    from course.models import UserCourseProgress

    progresses = UserCourseProgress.objects.filter(user=user).select_related("course")[:MAX_ITEMS]
    return [
        {"course": p.course.title, "progress_percentage": p.progress_percentage}
        for p in progresses
    ]


def list_my_quiz_attempts(user, **_kwargs):
    from quiz.models import Sitting

    sittings = Sitting.objects.filter(user=user).select_related("quiz").order_by("-start")[:MAX_ITEMS]
    return [
        {
            "quiz": s.quiz.title,
            "score": s.current_score,
            "complete": s.complete,
            "started_at": s.start.isoformat(),
        }
        for s in sittings
    ]


def list_my_contest_submissions(user, **_kwargs):
    from contest.models import ContestSubmission

    submissions = (
        ContestSubmission.objects.filter(user=user)
        .select_related("contest", "problem")
        .order_by("-submitted_at")[:MAX_ITEMS]
    )
    return [
        {
            "contest": s.contest.title,
            "problem": s.problem.title,
            "result": s.result,
            "submitted_at": s.submitted_at.isoformat(),
        }
        for s in submissions
    ]


def list_my_problem_solve_status(user, **_kwargs):
    from problems.models import SolveRecord

    records = SolveRecord.objects.filter(user=user).select_related("problem")[:MAX_ITEMS]
    return [{"problem": r.problem.title, "status": r.status} for r in records]


TOOL_FUNCTIONS = {
    "list_my_documents": list_my_documents,
    "get_document_detail": get_document_detail,
    "list_my_course_progress": list_my_course_progress,
    "list_my_quiz_attempts": list_my_quiz_attempts,
    "list_my_contest_submissions": list_my_contest_submissions,
    "list_my_problem_solve_status": list_my_problem_solve_status,
}

TOOLS_SPEC = [
    {
        "type": "function",
        "function": {
            "name": "list_my_documents",
            "description": "사용자가 mypage에 업로드한 자료 목록(제목, 요약)을 최근 순으로 조회한다.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_document_detail",
            "description": "특정 자료의 상세 정보(요약, 생성된 문제 수, 정답/오답 수)를 조회한다.",
            "parameters": {
                "type": "object",
                "properties": {"document_id": {"type": "integer", "description": "자료 id"}},
                "required": ["document_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_my_course_progress",
            "description": "사용자가 수강 중인 강의별 진행률을 조회한다.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_my_quiz_attempts",
            "description": "사용자의 퀴즈 응시 기록(점수, 완료 여부)을 최근 순으로 조회한다.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_my_contest_submissions",
            "description": "사용자의 대회 문제 제출 이력(결과, 제출 시각)을 최근 순으로 조회한다.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_my_problem_solve_status",
            "description": "사용자의 문제 풀이 상태(TODO/ATTEMPT/SOLVED) 목록을 조회한다.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]


def dispatch_tool(user, name, arguments):
    func = TOOL_FUNCTIONS.get(name)
    if func is None:
        return {"error": f"알 수 없는 tool: {name}"}
    return func(user, **arguments)
