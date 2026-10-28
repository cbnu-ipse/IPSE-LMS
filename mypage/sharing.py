"""
만든 속성 노트·모의고사를 자유게시판에 올리고, 다른 사람이 내 자료로 불러오게 한다. AI를 부르지 않는다 (저장된 이미지·문제를 복사할 뿐이다).

- 올리기: 게시글(자유게시판)을 만들고 SharedMaterial에 스냅샷을 둔다. 노트는 손글씨 이미지를 게시글 첨부로 올려 글에서 바로 보인다.
  모의고사는 문제·정답이 게시글 글에는 나오지 않는다 (불러온 뒤에 풀 수 있다). 같은 자료는 한 번만 올라가고, 다시 올리면 기존 글을 돌려준다.
- 불러오기: 내 개인 탭에 복사본을 만든다 (모의고사는 풀지 않은 새 시험, 노트는 이미지 복사본). 모의고사 문제는 불러올 때 다시 검증한다
  (exam._normalize_mock_question: 형식 검사·SVG 검열). 한 사람이 같은 글을 다시 불러오면 이미 있는 복사본을 가리킨다.
"""
import copy
import re

from django.core.files.base import ContentFile
from django.db import transaction
from django.db.models import F

from community.models import CommunityPost, CommunityPostAttachment

from .models import MockExam, PersonalDocument, ProcessingStatus, SharedImport, SharedMaterial

PAGE_LABEL = re.compile(r"\s*\(\d+/\d+\)\s*$")
TYPE_NAMES = {"ox": "OX", "mc": "객관식", "short": "단답", "essay": "서술형"}


class ShareError(ValueError):
    """사용자에게 그대로 보여줘도 되는 메시지."""


def _post_url(post):
    from django.urls import reverse

    return reverse("post_detail", args=[post.pk])


def existing(author, source_key):
    return SharedMaterial.objects.select_related("post").filter(author=author, source_key=source_key).first()


# ── 올리기 ──────────────────────────────────────────────────────────────────

def note_pages(note):
    """이 노트가 속한 장들 (한 장에 다 안 들어가 둘째 장부터 따로 만들어진 같은 노트의 자료까지, 순서대로)."""
    pages = PersonalDocument.objects.filter(
        user=note.user, document_type=PersonalDocument.DocumentType.NOTE, is_deleted=False,
        summary_status=ProcessingStatus.DONE, summary=note.summary).exclude(file="").order_by("id")
    return list(pages) or [note]


def share_note(user, note):
    """(SharedMaterial, 새로 만들었는지). 노트가 아직 만들어지지 않았으면 ShareError."""
    if (note.user_id != user.pk or note.document_type != PersonalDocument.DocumentType.NOTE or note.is_deleted):
        raise ShareError("내 속성 노트만 올릴 수 있어요.")
    if note.summary_status != ProcessingStatus.DONE or not note.file:
        raise ShareError("아직 만들어지지 않은 노트예요.")
    pages = note_pages(note)
    key = f"note:{pages[0].pk}"
    found = existing(user, key)
    if found:
        return found, False
    base = PAGE_LABEL.sub("", note.title)
    content = (f"{base}\n\n시험 5분 전에 훑어볼 수 있는 속성 노트예요 ({len(pages)}장).\n"
               + (f"과목: {note.course_name}\n" if note.course_name else "")
               + "\n아래 이미지로 바로 볼 수 있고, '내 자료로 불러오기'를 누르면 내 개인 탭에 복사돼요.")
    with transaction.atomic():
        post = CommunityPost.objects.create(title=f"[속성 노트] {base}"[:200], content=content, author=user, category="free")
        ids = []
        for n, page in enumerate(pages, 1):
            with page.file.open("rb") as fh:
                data = fh.read()
            att = CommunityPostAttachment(post=post, filename=f"{base[:60]}-{n}.png")
            att.file.save(f"note-{n}.png", ContentFile(data), save=True)
            ids.append(att.pk)
        material = SharedMaterial.objects.create(
            post=post, author=user, kind=SharedMaterial.Kind.NOTE, title=base[:200], course_name=note.course_name, source_key=key,
            payload={"markdown": note.summary, "attachments": ids})
    return material, True


def share_mock(user, exam):
    if exam.user_id != user.pk:
        raise ShareError("내 모의고사만 올릴 수 있어요.")
    if not exam.questions:
        raise ShareError("문제가 없는 모의고사예요.")
    key = f"mock:{exam.pk}"
    found = existing(user, key)
    if found:
        return found, False
    counts = {}
    for q in exam.questions:
        counts[q["type"]] = counts.get(q["type"], 0) + 1
    mix = " · ".join(f"{TYPE_NAMES[t]} {n}" for t, n in counts.items() if t in TYPE_NAMES)
    content = (f"{exam.title}\n\n모의고사 {len(exam.questions)}문항 ({mix})\n"
               + (f"과목: {exam.course_code}\n" if exam.course_code else "")
               + "\n문제와 정답은 불러온 뒤에 볼 수 있어요. '내 자료로 불러오기'를 누르면 내 개인 탭에 새 시험이 만들어져요.")
    with transaction.atomic():
        post = CommunityPost.objects.create(title=f"[모의고사] {exam.title}"[:200], content=content, author=user, category="free")
        material = SharedMaterial.objects.create(
            post=post, author=user, kind=SharedMaterial.Kind.MOCK, title=exam.title[:200], course_name=exam.course_code[:50], source_key=key,
            payload={"course_code": exam.course_code, "questions": copy.deepcopy(exam.questions)})
    return material, True


def post_path(material):
    return _post_url(material.post)


# ── 불러오기 ────────────────────────────────────────────────────────────────

def import_material(user, material):
    """내 개인 탭에 복사본을 만든다. (복사본 PersonalDocument, 새로 만들었는지). 불러올 수 없으면 ShareError."""
    if material.author_id == user.pk:
        raise ShareError("내가 올린 자료예요. 내 자료에 이미 있어요.")
    with transaction.atomic():
        record, _ = SharedImport.objects.select_for_update().get_or_create(material=material, user=user)
        if record.document_id and not record.document.is_deleted:
            return record.document, False
        document = _import_mock(user, material) if material.kind == SharedMaterial.Kind.MOCK else _import_note(user, material)
        record.document = document
        record.save(update_fields=["document"])
        SharedMaterial.objects.filter(pk=material.pk).update(import_count=F("import_count") + 1)
    return document, True


def _import_mock(user, material):
    from .exam import _normalize_mock_question

    questions = [q for q in map(_normalize_mock_question, material.payload.get("questions") or []) if q]
    if not questions:
        raise ShareError("불러올 수 있는 문제가 없어요.")
    payload = material.payload
    exam = MockExam.objects.create(user=user, course_code=str(payload.get("course_code") or "")[:50], title=material.title,
                                   questions=questions)
    document = PersonalDocument.objects.create(
        user=user, title=material.title[:200], file="", document_type=PersonalDocument.DocumentType.MOCK, is_course_material=False,
        course_name=material.course_name, summary_status=ProcessingStatus.DONE,
        summary=f"{len(questions)}문항 · 게시판에서 불러옴 ({material.author.display_author})")
    exam.document = document
    exam.save(update_fields=["document"])
    return document


def _import_note(user, material):
    attachments = list(CommunityPostAttachment.objects.filter(post=material.post, pk__in=material.payload.get("attachments") or []).order_by("id"))
    images = []
    for att in attachments:
        try:
            with att.file.open("rb") as fh:
                images.append(fh.read())
        except (FileNotFoundError, ValueError):
            continue
    if not images:
        raise ShareError("노트 이미지를 찾을 수 없어요. 올린 사람이 지웠을 수 있어요.")
    total = len(images)
    first = None
    for n, data in enumerate(images, 1):
        label = f" ({n}/{total})" if total > 1 else ""
        doc = PersonalDocument.objects.create(
            user=user, title=f"{material.title[:190]}{label}", file="", document_type=PersonalDocument.DocumentType.NOTE,
            course_name=material.course_name, is_course_material=False, summary=material.payload.get("markdown") or "",
            summary_status=ProcessingStatus.DONE)
        doc.file.save("cram-note.png", ContentFile(data), save=True)
        first = first or doc
    return first
