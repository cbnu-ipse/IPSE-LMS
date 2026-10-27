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
import difflib
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
            .filter(topics__name=subject_code, summary_status=ProcessingStatus.DONE, is_course_material=True,
                    document_type=PersonalDocument.DocumentType.LECTURE)    # 족보는 강의 본문이 아니라 출제 스타일에 쓴다
            .exclude(summary="").order_by("id").values("id", "title", "summary", "concept_tags"))
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


def build_draft(subject_code, force=False):
    """이 주제의 강의 자료로 AI 초안을 만든다. 만들었으면 CourseDraft, 아니면 None.
    만들지 말지(자료가 충분한지)는 부르는 쪽(course/topics.py)이 AI 판단으로 정한다.
    같은 입력으로 이미 만들었거나 만드는 중이면 AI를 부르지 않고 None.
    force=True(운영진 재생성)면 같은 입력의 완료된 초안이 있어도, 챕터 재사용 없이 처음부터 다시 만든다."""
    if not subject_code:
        return None
    docs = eligible_docs(subject_code)
    if not docs:
        return None
    # 강의는 올라온 수업 자료만으로 만든다. 교수님 족보 출제 스타일은 내 자료로 문제를 만들 때와 모의 출제에만 쓴다
    style_text, style_parts = "", []
    from mypage.ontology import concepts_for_docs, text_for_concepts

    # 개념 태그가 충분하면 챕터를 개념 단위로 구성한다 (개념 구성이 바뀌면 초안도 새로 만든다)
    concept_map = concepts_for_docs([d["id"] for d in docs])
    if len(concept_map) < 3:
        concept_map = {}
    concept_parts = [sorted(concept_map.items())] if concept_map else []
    source_hash = _sha("draft", course_ai.FORMAT_VERSION, _doc_fingerprint(docs), *style_parts, *concept_parts)
    if force:  # 같은 입력의 완료된 초안은 입력 해시를 비워 새로 만들 수 있게 한다 (만드는 중인 것은 그대로 둔다)
        CourseDraft.objects.filter(subject_code=subject_code, source_hash=source_hash).exclude(
            status=CourseDraft.Status.GENERATING).update(source_hash="")
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
        if force:
            reuse = {}
        by_id = {d["id"]: d for d in docs}
        outline_extra = {"concepts": concept_map} if concept_map else {}
        outline = course_ai.generate_outline(subject_code, docs, previous=previous or None, **outline_extra)
        chapters = []
        for chapter in outline["chapters"]:
            chapter_docs = [by_id[i] for i in chapter["doc_ids"] if i in by_id]
            if chapter.get("concepts"):     # 챕터의 개념을 다루는 요약 부분만 챕터 재료로 쓴다 (없으면 자료 요약 전체)
                chapter_docs = [{**d, "summary": text_for_concepts(d["summary"], d.get("concept_tags"), chapter["concepts"])
                                 or d["summary"]} for d in chapter_docs]
            digest = _sha("chapter", course_ai.FORMAT_VERSION, chapter["title"], _doc_fingerprint(chapter_docs),
                          *style_parts, *([chapter["concepts"]] if chapter.get("concepts") else []))
            reused = digest in reuse
            extra = {"style": style_text} if style_text else {}
            sets = reuse[digest] if reused else course_ai.generate_chapter(subject_code, chapter, chapter_docs, **extra)
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


# ── 강의자용 현황: 어떤 자료가 어떻게 가공되어 어느 강의로 가는지 ────────────────────

def topic_overview():
    """주제(과목)별 현황 — 모든 강의가 여기서 관리된다. 게시 전이든 게시 후든 주제는 계속 남고,
    새 자료가 들어오면 같은 주제의 초안이 갱신돼 언제든 (다시) 게시할 수 있다.
    카드 하나 = 주제 하나: 자료 수, 게시된 강의(있으면), 게시 가능한 초안(있으면), 생성 중/실패 여부."""
    from django.db.models import Count, Max

    from mypage.models import PersonalDocument, ProcessingStatus

    rows = {r["topics__name"]: r for r in
            PersonalDocument.objects.filter(is_deleted=False, is_course_material=True, topics__isnull=False,
                                            document_type=PersonalDocument.DocumentType.LECTURE)
            .values("topics__name").annotate(doc_count=Count("id"), last_upload=Max("uploaded_at"))}
    drafts = {}
    for d in CourseDraft.objects.exclude(status=CourseDraft.Status.SUPERSEDED).order_by("created_at"):
        drafts.setdefault(d.subject_code, []).append(d)
    # 게시된 AI 강의는 자료가 지워져도 목록에 남는다
    published_codes = {d.subject_code for d in CourseDraft.objects.filter(status=CourseDraft.Status.APPROVED)}
    codes = set(rows) | published_codes
    courses = {c.code: c for c in Course.objects.filter(code__in=codes)}
    topics = []
    for code in codes:
        mine = drafts.get(code, [])
        pending = next((d for d in reversed(mine) if d.status == CourseDraft.Status.PENDING), None)
        latest = mine[-1] if mine else None
        row = rows.get(code, {})
        topics.append({
            "name": code, "doc_count": row.get("doc_count", 0), "last_upload": row.get("last_upload"),
            "course": courses.get(code), "pending": pending,
            "generating": any(d.status == CourseDraft.Status.GENERATING for d in mine),
            "failed": latest if latest and latest.status == CourseDraft.Status.FAILED else None,
        })
    topics.sort(key=lambda t: t["last_upload"].timestamp() if t["last_upload"] else 0, reverse=True)
    # 아직 분류·요약 중인 자료 (곧 어느 주제로 들어갈지 정해짐)
    in_progress = PersonalDocument.objects.filter(is_deleted=False, topics__isnull=True,
                                                  summary_status=ProcessingStatus.PROCESSING).count()
    return topics, in_progress


def topic_detail(subject_code):
    """한 주제의 자료별 가공 결과와, 최신 초안의 챕터가 어떤 자료를 근거로 만들어졌는지."""
    from mypage.models import PersonalDocument

    docs = list(PersonalDocument.objects.filter(topics__name=subject_code, is_deleted=False)
                .select_related("user").order_by("uploaded_at"))
    draft = (CourseDraft.objects.filter(subject_code=subject_code,
                                        status__in=[CourseDraft.Status.PENDING, CourseDraft.Status.APPROVED])
             .exclude(content={}).order_by("-created_at").first())
    used = {}
    chapters = []
    if draft:
        for ci, chapter in enumerate(draft.content.get("chapters", [])):
            ids = chapter.get("doc_ids", [])
            chapters.append({"index": ci, "title": chapter["title"], "summary": chapter.get("summary", ""),
                             "concepts": chapter.get("concepts", []),
                             "reused": chapter.get("reused", False), "doc_ids": ids,
                             "set_count": len(chapter.get("sets", []))})
            for i in ids:
                used.setdefault(i, []).append(chapter["title"])
    for doc in docs:
        doc.used_in = used.get(doc.pk, [])
    titles = {d.pk: d.title for d in docs}
    for chapter in chapters:
        chapter["doc_titles"] = [titles[i] for i in chapter["doc_ids"] if i in titles]
    return docs, draft, chapters


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


def _line_diff(before, after, context=1):
    """줄 단위 변경 보기. [(종류, 글)] — 종류: add(추가) / del(삭제) / ctx(변하지 않은 주변 줄) / gap(생략)."""
    old, new = (before or "").splitlines(), (after or "").splitlines()
    out = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, old, new, autojunk=False).get_opcodes():
        if tag == "equal":
            chunk = old[i1:i2]
            if len(chunk) > 2 * context:
                head = [("ctx", l) for l in chunk[:context]] if out else []
                tail = [("ctx", l) for l in chunk[-context:]] if j2 < len(new) else []
                out += head + [("gap", "…")] + tail if (head or tail) else []
            else:
                out += [("ctx", l) for l in chunk]
        else:
            out += [("del", l) for l in old[i1:i2]] + [("add", l) for l in new[j1:j2]]
    return out


def _question_changes(before, after):
    old = {q["q"]: q for q in before}
    new = {q["q"]: q for q in after}
    return {
        "added": [q["q"] for q in after if q["q"] not in old],
        "removed": [q["q"] for q in before if q["q"] not in new],
        "modified": [q["q"] for q in after if q["q"] in old and old[q["q"]] != q],
    }


def _diff_set(old, new):
    """세트 하나의 변경. old/new 중 없는 쪽은 통째로 추가/삭제."""
    if old is None or new is None:
        side = new if old is None else old
        return {"title": side["title"], "status": "added" if old is None else "removed", "cards": [],
                "questions": {"added": [], "removed": [], "modified": []},
                "card_count": len(side["cards"]), "question_count": len(side.get("questions", []))}
    cards = []
    for i in range(max(len(old["cards"]), len(new["cards"]))):
        b = old["cards"][i] if i < len(old["cards"]) else None
        a = new["cards"][i] if i < len(new["cards"]) else None
        if b is None or a is None:
            card = a or b
            cards.append({"title": card["title"], "status": "added" if b is None else "removed",
                          "lines": [("add" if b is None else "del", l) for l in card["body"].splitlines()]})
        elif b != a:
            cards.append({"title": a["title"], "old_title": b["title"] if b["title"] != a["title"] else "",
                          "status": "modified", "lines": _line_diff(b["body"], a["body"])})
    questions = _question_changes(old.get("questions", []), new.get("questions", []))
    changed = bool(cards) or any(questions.values())
    return {"title": new["title"], "status": "modified" if changed else "same", "cards": cards,
            "questions": questions, "card_count": len(new["cards"]), "question_count": len(new.get("questions", []))}


def diff_draft(draft):
    """게시된 강의와 초안의 차이 (강의자 검토용). 새 강의 초안이면 None.
    챕터는 순서(게시할 때 단원이 순서로 이어지므로), 세트는 제목으로 짝지어 비교한다."""
    if not draft.course_id:
        return None
    published = content_from_course(draft.course)["chapters"]
    chapters = (draft.content or {}).get("chapters", [])
    out = []
    for i in range(max(len(published), len(chapters))):
        before = published[i] if i < len(published) else None
        after = chapters[i] if i < len(chapters) else None
        if before is None or after is None:
            ch = after or before
            sets = [_diff_set(None if before is None else s, s if before is None else None) for s in ch["sets"]]
            out.append({"index": i, "title": ch["title"], "old_title": "", "status": "added" if before is None else "removed",
                        "sets": sets})
            continue
        old_sets = {s["title"]: s for s in before["sets"]}
        sets = [_diff_set(old_sets.pop(s["title"], None), s) for s in after["sets"]]
        sets += [_diff_set(s, None) for s in old_sets.values()]
        retitled = before["title"] != after["title"]
        changed = retitled or any(s["status"] != "same" for s in sets)
        out.append({"index": i, "title": after["title"], "old_title": before["title"] if retitled else "",
                    "status": "modified" if changed else "same", "sets": sets})
    counts = {"chapters_added": 0, "chapters_removed": 0, "sets_added": 0, "sets_removed": 0, "sets_modified": 0,
              "chapters_retitled": 0}
    for ch in out:
        counts["chapters_added"] += ch["status"] == "added"
        counts["chapters_removed"] += ch["status"] == "removed"
        counts["chapters_retitled"] += bool(ch["old_title"])
        for st in ch["sets"]:
            counts["sets_added"] += st["status"] == "added"
            counts["sets_removed"] += st["status"] == "removed"
            counts["sets_modified"] += st["status"] == "modified"
    meta_changed = (draft.content or {}).get("title") not in (None, draft.course.title) or \
        ((draft.content or {}).get("description") or "") != (draft.course.summary or "")
    counts["total"] = sum(v for k, v in counts.items()) + int(meta_changed)
    return {"chapters": out, "counts": counts, "meta_changed": meta_changed, "new_docs": _new_docs(draft)}


def _new_docs(draft):
    """이번 초안에서 처음 반영된 자료 (직전에 게시된 초안의 근거 자료에 없던 것)."""
    from mypage.models import PersonalDocument

    def ids(d):
        return {i for ch in (d.content or {}).get("chapters", []) for i in ch.get("doc_ids", [])}

    last = (CourseDraft.objects.filter(subject_code=draft.subject_code, status=CourseDraft.Status.APPROVED)
            .exclude(content={}).order_by("-reviewed_at", "-created_at").first())
    fresh = ids(draft) - (ids(last) if last else set())
    return list(PersonalDocument.objects.filter(pk__in=fresh).values_list("title", flat=True)) if fresh else []


def changed_chapters(draft):
    """초안에서 게시된 강의와 달라진 챕터 번호 집합 (새 강의 초안이면 None)."""
    diff = diff_draft(draft)
    return None if diff is None else {c["index"] for c in diff["chapters"] if c["status"] != "same"}


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
