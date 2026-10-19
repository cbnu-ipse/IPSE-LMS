"""
AI 강의 초안 → 강의자 검토 → 게시.

흐름:
  1. 업로드된 자료는 AI가 주제로 분류하고, 그 주제에 강의를 만들 만큼 자료가 모였다고 AI가 판단하면
     build_draft()가 초안을 만든다 (course/topics.py, mypage 업로드 후 백그라운드). 강의는 바로 바뀌지 않는다.
  2. 강의자(is_lecturer)가 judge > 강의 생성 탭에서 초안을 학생 화면 그대로 미리 보고, 확인 문제까지 풀어 본다.
     카드·문제 문구는 고칠 수 있다 (AI 호출 없음).
  3. 승인하면 publish_draft()가 저장된 내용을 그대로 강의로 옮긴다 — 게시할 때 AI를 다시 부르지 않는다.
     새 강의는 승인한 강의자가 담당이 되고, 이미 있는 강의를 바꾸는 초안은 담당 강의자(또는 관리자)만 승인한다.
  4. 게시된 강의의 내용이 바뀌는 것도 모두 초안을 거친다 — 새 자료로 다시 만든 초안이든, 강의자가 직접 고치려고
     만든 수정 초안이든 승인해야 반영된다.

토큰 절약:
  - 입력 자료(요약)의 해시(source_hash)가 같은 초안이 이미 있으면 다시 만들지 않는다 (DB 유니크 제약이라
    동시에 들어온 생성 요청도 하나만 진행된다).
  - 챕터마다 근거 자료의 해시를 저장해 두고, 다시 만들 때 근거가 그대로인 챕터는 AI를 부르지 않고 이전 것을 쓴다.
"""
import hashlib
import json
import logging
import re

from django.db import IntegrityError, transaction
from django.utils import timezone

from . import ai as course_ai
from . import markup
from .models import Course, CourseCategory, CourseDraft, Lesson, LessonQuizResult, Unit, UserCourseProgress

logger = logging.getLogger(__name__)

AI_CATEGORY = "AI 자동 생성"


# ── 권한 ────────────────────────────────────────────────────────────────────

def is_studio_user(user):
    return bool(getattr(user, "is_authenticated", False) and (user.is_superuser or user.is_lecturer))


def can_review(user, draft):
    """새 강의 초안은 강의자 누구나, 기존 강의를 바꾸는 초안은 담당 강의자(또는 관리자)만."""
    if not is_studio_user(user):
        return False
    if user.is_superuser:
        return True
    course = draft.course or Course.objects.filter(code=draft.subject_code).first()
    return course is None or course.instructor_id == user.id


# ── 입력 자료 ───────────────────────────────────────────────────────────────

def _sha(*parts):
    return hashlib.sha256(json.dumps(parts, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def eligible_docs(subject_code):
    from mypage.models import PersonalDocument, ProcessingStatus

    rows = (PersonalDocument.objects
            .filter(subject_code=subject_code, summary_status=ProcessingStatus.DONE, is_course_material=True)
            .exclude(summary="").order_by("id").values("id", "title", "summary"))
    return list(rows)


def _doc_fingerprint(docs):
    return [(d["id"], hashlib.sha256(d["summary"].encode()).hexdigest()) for d in docs]


def course_title(subject_code):
    from mypage.models import Subject

    subject = Subject.objects.filter(name=subject_code).first()
    return f"{subject.code}({subject.name})" if subject and subject.code else subject_code


# ── 초안 만들기 ─────────────────────────────────────────────────────────────

_REUSABLE = (CourseDraft.Status.APPROVED, CourseDraft.Status.PENDING, CourseDraft.Status.SUPERSEDED)


def _previous(subject_code):
    """(직전 목차, 재사용할 챕터 {근거 해시: 세트}). 반려·실패한 초안의 내용은 쓰지 않는다.
    강의자가 검토하며 고친 내용도 그대로 재사용된다."""
    drafts = list(CourseDraft.objects.filter(subject_code=subject_code, status__in=_REUSABLE)
                  .exclude(content={}).order_by("-created_at"))
    latest = next((d for d in drafts if d.status in (CourseDraft.Status.APPROVED, CourseDraft.Status.PENDING)), None)
    reuse = {}
    for draft in reversed(drafts):  # 최근 것이 이기도록 오래된 것부터 채운다
        for chapter in (draft.content or {}).get("chapters", []):
            if chapter.get("source_hash") and chapter.get("sets"):
                reuse[chapter["source_hash"]] = chapter["sets"]
    return ((latest.content or {}).get("chapters", []) if latest else []), reuse


def build_draft(subject_code):
    """이 주제의 강의 자료로 AI 초안을 만든다. 만들었으면 CourseDraft, 아니면 None.
    만들지 말지(자료가 충분한지)는 부르는 쪽(course/topics.py)이 AI 판단으로 정한다.
    같은 입력으로 이미 만들었거나 만드는 중이면 AI를 부르지 않고 None."""
    if not subject_code:
        return None
    docs = eligible_docs(subject_code)
    if not docs:
        return None
    source_hash = _sha("draft", _doc_fingerprint(docs))
    try:
        with transaction.atomic():
            draft = CourseDraft.objects.create(
                subject_code=subject_code, source_hash=source_hash, status=CourseDraft.Status.GENERATING,
                course=Course.objects.filter(code=subject_code).first(),
            )
    except IntegrityError:
        return None  # 같은 자료로 이미 만든(또는 만드는 중인) 초안이 있다

    try:
        previous, reuse = _previous(subject_code)
        by_id = {d["id"]: d for d in docs}
        outline = course_ai.generate_outline(subject_code, docs, previous=previous or None)
        chapters = []
        for chapter in outline["chapters"]:
            chapter_docs = [by_id[i] for i in chapter["doc_ids"] if i in by_id]
            digest = _sha("chapter", chapter["title"], _doc_fingerprint(chapter_docs))
            reused = digest in reuse
            sets = reuse[digest] if reused else course_ai.generate_chapter(subject_code, chapter, chapter_docs)
            if sets:
                chapters.append({**chapter, "source_hash": digest, "reused": reused, "sets": sets})
        if not chapters:
            raise ValueError("AI가 강의 내용을 만들지 못했습니다.")
        draft.content = {"title": course_title(subject_code), "description": outline["description"],
                         "chapters": chapters}
        draft.status = CourseDraft.Status.PENDING
        draft.save(update_fields=["content", "status"])
        # 아직 검토하지 않은 이전 AI 초안은 이 초안으로 대체 (강의자가 고치던 수정 초안은 건드리지 않음)
        CourseDraft.objects.filter(subject_code=subject_code, status=CourseDraft.Status.PENDING,
                                   created_by__isnull=True).exclude(pk=draft.pk).update(
            status=CourseDraft.Status.SUPERSEDED)
        return draft
    except Exception as exc:
        logger.exception("course draft failed: %s", subject_code)
        # 입력 해시를 비워 다음 업로드 때 다시 시도할 수 있게 한다
        CourseDraft.objects.filter(pk=draft.pk).update(status=CourseDraft.Status.FAILED, source_hash="",
                                                        error=str(exc)[:2000])
        return None


def content_from_course(course):
    """게시된 강의를 초안 내용 형식으로 (강의자가 직접 고치는 수정 초안의 시작점)."""
    chapters = []
    for unit in course.units.order_by("order"):
        sets = [{"title": l.title, "cards": l.cards, "questions": l.questions}
                for l in unit.lessons.order_by("order") if l.cards]
        if sets:
            chapters.append({"title": unit.title, "summary": "", "doc_ids": [], "source_hash": "", "sets": sets})
    return {"title": course.title, "description": course.summary or "", "chapters": chapters}


def start_edit_draft(course, user):
    """게시된 강의를 고치기 위한 수정 초안. 이미 이 강의자가 고치던 초안이 있으면 그것을 돌려준다."""
    existing = CourseDraft.objects.filter(course=course, created_by=user, status=CourseDraft.Status.PENDING).first()
    if existing:
        return existing
    return CourseDraft.objects.create(subject_code=course.code, course=course, created_by=user,
                                      status=CourseDraft.Status.PENDING, content=content_from_course(course))


# ── 검토 중 고치기 (AI 호출 없음) ───────────────────────────────────────────

def _locked_pending(draft_id):
    draft = CourseDraft.objects.select_for_update().get(pk=draft_id)
    if draft.status != CourseDraft.Status.PENDING:
        raise ValueError("검토 대기 중인 초안만 고칠 수 있습니다.")
    return draft


def _set_at(content, ci, si):
    try:
        return content["chapters"][ci]["sets"][si]
    except (KeyError, IndexError, TypeError):
        raise ValueError("없는 학습 세트입니다.")


def update_card(draft_id, ci, si, ki, title, body):
    with transaction.atomic():
        draft = _locked_pending(draft_id)
        cards = _set_at(draft.content, ci, si)["cards"]
        if not 0 <= ki < len(cards) or not body.strip():
            raise ValueError("카드 내용을 확인해주세요.")
        cards[ki] = {"title": title.strip()[:120], "body": body.strip()[:4000]}
        draft.save(update_fields=["content"])


def update_question(draft_id, ci, si, qi, data):
    """data: 폼 값 {type, q, explanation, answer(ox: O/X, mc: 정답 번호 1부터), options(줄바꿈), answers(' / ')}."""
    kind = data.get("type")
    raw = {"type": kind, "q": data.get("q", ""), "explanation": data.get("explanation", "")}
    if kind == "ox":
        raw["answer"] = data.get("answer", "").strip().upper() == "O"
    elif kind == "mc":
        raw["options"] = [o for o in data.get("options", "").splitlines() if o.strip()]
        try:
            raw["answer"] = int(data.get("answer", "")) - 1
        except ValueError:
            raw["answer"] = -1
    elif kind == "short":
        raw["answers"] = [a for a in re.split(r"\s*/\s*", data.get("answers", "")) if a.strip()]
    question = course_ai.normalize_question(raw)
    if question is None:
        raise ValueError("문제 형식이 올바르지 않습니다 (정답·보기를 확인해주세요).")
    with transaction.atomic():
        draft = _locked_pending(draft_id)
        questions = _set_at(draft.content, ci, si)["questions"]
        if not 0 <= qi < len(questions):
            raise ValueError("없는 문제입니다.")
        questions[qi] = question
        draft.save(update_fields=["content"])


def delete_question(draft_id, ci, si, qi):
    with transaction.atomic():
        draft = _locked_pending(draft_id)
        questions = _set_at(draft.content, ci, si)["questions"]
        if not 0 <= qi < len(questions):
            raise ValueError("없는 문제입니다.")
        questions.pop(qi)
        draft.save(update_fields=["content"])


# ── 승인·반려 ───────────────────────────────────────────────────────────────

def _legacy_markdown(cards):
    """카드를 예전 수업 형식(마크다운, --- 로 페이지 구분)으로도 남긴다 (검색·챗봇 도구용)."""
    return "\n\n---\n\n".join(f"## {c['title']}\n\n{c['body']}" for c in cards)


def _sync_course(course, content):
    """초안 내용을 강의에 반영한다. 같은 챕터 순서·같은 세트 제목의 수업은 고쳐 쓰고(학생 진도 유지),
    없어진 것은 지우고, 새것은 만든다."""
    existing_units = list(course.units.order_by("order"))
    keep_units, keep_lessons, order = set(), set(), 0
    for ci, chapter in enumerate(content.get("chapters", [])):
        unit = existing_units[ci] if ci < len(existing_units) else Unit(course=course)
        unit.title, unit.order = chapter["title"], ci
        unit.save()
        keep_units.add(unit.pk)
        old = {l.title: l for l in Lesson.objects.filter(course=course, unit=unit)}
        for s in chapter.get("sets", []):
            lesson = old.pop(s["title"], None) or Lesson(course=course, unit=unit, title=s["title"])
            lesson.cards, lesson.questions = s["cards"], s.get("questions", [])
            lesson.content = _legacy_markdown(s["cards"])
            lesson.order = order
            lesson.save()
            keep_lessons.add(lesson.pk)
            order += 1
    Lesson.objects.filter(course=course).exclude(pk__in=keep_lessons).delete()
    course.units.exclude(pk__in=keep_units).delete()


def publish_draft(draft_id, user):
    """저장된 초안 내용을 그대로 게시한다 (AI 호출 없음). 이미 처리된 초안이면 ValueError."""
    with transaction.atomic():
        draft = CourseDraft.objects.select_for_update().get(pk=draft_id)
        if draft.status != CourseDraft.Status.PENDING:
            raise ValueError("이미 처리된 초안입니다.")
        if not can_review(user, draft):
            raise PermissionError("이 초안을 승인할 권한이 없습니다.")
        content = draft.content
        course = draft.course or Course.objects.filter(code=draft.subject_code).first()
        if course is None:
            category, _ = CourseCategory.objects.get_or_create(title=AI_CATEGORY)
            course = Course.objects.create(code=draft.subject_code, title=content.get("title") or draft.subject_code,
                                           summary=content.get("description", ""), category=category,
                                           instructor=user)
        else:
            course.title = content.get("title") or course.title
            course.summary = content.get("description", course.summary)
            course.save(update_fields=["title", "summary"])
        _sync_course(course, content)
        draft.status = CourseDraft.Status.APPROVED
        draft.course = course
        draft.reviewed_by, draft.reviewed_at = user, timezone.now()
        draft.save(update_fields=["status", "course", "reviewed_by", "reviewed_at"])
    return course


def reject_draft(draft_id, user, note=""):
    with transaction.atomic():
        draft = CourseDraft.objects.select_for_update().get(pk=draft_id)
        if draft.status != CourseDraft.Status.PENDING:
            raise ValueError("이미 처리된 초안입니다.")
        if not can_review(user, draft):
            raise PermissionError("이 초안을 반려할 권한이 없습니다.")
        draft.status = CourseDraft.Status.REJECTED
        draft.reviewed_by, draft.reviewed_at, draft.review_note = user, timezone.now(), note.strip()[:2000]
        draft.save(update_fields=["status", "reviewed_by", "reviewed_at", "review_note"])
    return draft


def is_ai_managed(course):
    """초안으로 게시된 강의 — 내용은 초안 승인으로만 바뀐다."""
    return CourseDraft.objects.filter(course=course, status=CourseDraft.Status.APPROVED).exists()


def changed_chapters(draft):
    """수정 초안에서 게시된 강의와 달라진 챕터 번호 집합 (검토 화면 표시용)."""
    if not draft.course_id:
        return None
    published = content_from_course(draft.course)["chapters"]
    changed = set()
    for i, chapter in enumerate(draft.content.get("chapters", [])):
        before = published[i] if i < len(published) else None
        if before is None or before["title"] != chapter["title"] or before["sets"] != chapter["sets"]:
            changed.add(i)
    return changed


# ── 학습 화면 ───────────────────────────────────────────────────────────────

def render_cards(cards):
    return [{"title": c.get("title", ""), "html": markup.render(c.get("body", ""))} for c in cards]


def _norm(text):
    return re.sub(r"[\s.,!?'\"()\[\]{}·`~\-]+", "", str(text or "").lower())


def grade_question(question, value):
    """학생 답 하나 채점 (AI 호출 없음). value: ox → true/false, mc → 보기 번호, short → 문자열."""
    kind = question.get("type")
    if kind == "ox":
        return isinstance(value, bool) and value == question["answer"]
    if kind == "mc":
        return isinstance(value, int) and not isinstance(value, bool) and value == question["answer"]
    if kind == "short":
        target = _norm(value)
        return bool(target) and any(target == _norm(a) for a in question["answers"])
    return False


def save_quiz_result(user, lesson, answers):
    """세트 확인 문제 답안을 서버에서 다시 채점해 저장한다. [맞았는지...]를 돌려준다."""
    results = [grade_question(q, answers[i] if i < len(answers) else None) for i, q in enumerate(lesson.questions)]
    LessonQuizResult.objects.update_or_create(
        user=user, lesson=lesson,
        defaults={"correct": sum(results), "total": len(results),
                  "wrong": [i for i, ok in enumerate(results) if not ok]},
    )
    progress, _ = UserCourseProgress.objects.get_or_create(user=user, course=lesson.course)
    progress.completed_lessons.add(lesson)
    return results
