"""
내 학습 통합 조회 — 흩어져 있는 학습 기록을 한 곳에서 모아 본다 (테이블은 그대로, 읽기만 한다).

  강의(course)      : 진도(UserCourseProgress) + 세트 확인 문제 결과(LessonQuizResult)
  복습 문제(mypage) : 내 자료로 만든 문제(GeneratedQuestion)의 풀이 결과
  퀴즈(quiz)        : 응시 기록(Sitting)
  대회(contest)     : 제출(ContestSubmission)              ← judge DB
  문제(problems)    : 풀이 상태(SolveRecord)               ← judge DB

judge > 내 학습 화면과 챗봇 도구(get_my_learning_overview)가 함께 쓴다. 나중에 크레딧 지급 기준으로도 쓸 수 있다.
"""
from django.db.models import Count, Q

WEAK_RATIO = 0.6       # 확인 문제 정답률이 이보다 낮은 세트는 "다시 볼 세트"로
RECENT_LIMIT = 15


def _pct(part, whole):
    return round(part * 100 / whole) if whole else None


def overview(user):
    from contest.models import ContestSubmission
    from course.models import LessonQuizResult, UserCourseProgress
    from mypage.models import GeneratedQuestion
    from problems.models import SolveRecord
    from quiz.models import Sitting

    results = list(LessonQuizResult.objects.filter(user=user).select_related("lesson__course", "lesson__unit"))
    by_course = {}
    for r in results:
        stats = by_course.setdefault(r.lesson.course_id, {"correct": 0, "total": 0})
        stats["correct"] += r.correct
        stats["total"] += r.total

    courses = []
    for p in UserCourseProgress.objects.filter(user=user).select_related("course").prefetch_related("completed_lessons"):
        quiz = by_course.get(p.course_id, {"correct": 0, "total": 0})
        courses.append({
            "title": p.course.title, "url": p.course.get_absolute_url(), "percent": p.progress_percentage,
            "sets_done": p.completed_lessons.count(), "sets_total": p.course.lessons.count(),
            "quiz_correct": quiz["correct"], "quiz_total": quiz["total"], "accuracy": _pct(quiz["correct"], quiz["total"]),
        })
    courses.sort(key=lambda c: (c["percent"] == 100, -c["percent"]))

    lecture_correct = sum(r.correct for r in results)
    lecture_total = sum(r.total for r in results)
    weak = sorted((r for r in results if r.total and r.correct / r.total < WEAK_RATIO),
                  key=lambda r: r.correct / r.total)[:5]

    review = GeneratedQuestion.objects.filter(document__user=user, is_correct__isnull=False).aggregate(
        answered=Count("id"), correct=Count("id", filter=Q(is_correct=True)))
    sittings = Sitting.objects.filter(user=user).select_related("quiz")
    completed = [s for s in sittings if s.complete]
    quiz_avg = round(sum(s.get_percent_correct for s in completed) / len(completed)) if completed else None

    submissions = ContestSubmission.objects.filter(user_id=user.id)
    sub_stats = submissions.aggregate(total=Count("id"), accepted=Count("id", filter=Q(result="AC")))
    solved_contest = submissions.filter(result="AC").values("problem_id").distinct().count()
    records = SolveRecord.objects.filter(user_id=user.id)
    rec_stats = records.aggregate(solved=Count("id", filter=Q(status="SOLVED")),
                                  attempting=Count("id", filter=Q(status="ATTEMPT")))

    recent = [{"kind": "강의 문제", "title": f"{r.lesson.course.title} · {r.lesson.title}",
               "detail": f"{r.correct}/{r.total}", "at": r.updated_at, "url": r.lesson.get_absolute_url()}
              for r in sorted(results, key=lambda r: r.updated_at, reverse=True)[:RECENT_LIMIT]]
    recent += [{"kind": "퀴즈", "title": s.quiz.title, "detail": f"{s.get_percent_correct}%" if s.complete else "진행 중",
                "at": s.end or s.start, "url": ""} for s in sittings.order_by("-start")[:RECENT_LIMIT]]
    recent += [{"kind": "대회 제출", "title": s.problem.title, "detail": s.result, "at": s.submitted_at,
                "url": f"/contest/{s.contest_id}/submissions/{s.pk}/"}
               for s in submissions.select_related("problem").order_by("-submitted_at")[:RECENT_LIMIT]]
    recent += [{"kind": "문제 해결", "title": r.problem.title, "detail": "", "at": r.solved_at, "url": f"/problems/{r.problem_id}/"}
               for r in records.filter(status="SOLVED", solved_at__isnull=False).select_related("problem")
               .order_by("-solved_at")[:RECENT_LIMIT]]
    recent.sort(key=lambda e: e["at"], reverse=True)

    return {
        "courses": courses,
        "lecture_quiz": {"sets": len(results), "correct": lecture_correct, "total": lecture_total,
                         "accuracy": _pct(lecture_correct, lecture_total)},
        "weak_sets": [{"title": f"{r.lesson.course.title} · {r.lesson.title}", "score": f"{r.correct}/{r.total}",
                       "url": r.lesson.get_absolute_url()} for r in weak],
        "review_questions": {"answered": review["answered"], "correct": review["correct"],
                             "accuracy": _pct(review["correct"], review["answered"])},
        "quizzes": {"attempts": sittings.count(), "completed": len(completed), "average": quiz_avg},
        "contests": {"submissions": sub_stats["total"], "accepted": sub_stats["accepted"],
                     "problems_solved": solved_contest},
        "problems": {"solved": rec_stats["solved"], "attempting": rec_stats["attempting"]},
        "recent": recent[:RECENT_LIMIT],
    }


def overview_for_assistant(user):
    """챗봇 도구용: 주소·시각 객체 없이 짧게."""
    data = overview(user)
    return {
        "courses": [{k: c[k] for k in ("title", "percent", "sets_done", "sets_total", "accuracy")} for c in data["courses"]],
        "lecture_quiz": data["lecture_quiz"],
        "weak_sets": [{"title": w["title"], "score": w["score"]} for w in data["weak_sets"]],
        "review_questions": data["review_questions"],
        "quizzes": data["quizzes"],
        "contests": data["contests"],
        "problems": data["problems"],
        "recent": [{"kind": e["kind"], "title": e["title"], "detail": e["detail"], "at": e["at"].isoformat()}
                   for e in data["recent"][:8]],
    }
