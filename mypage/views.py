import hashlib
import io
import logging
import os
import threading
from datetime import timedelta

from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from django.db import connection, transaction
from django.db.models import Count, Q
from django.http import Http404, HttpResponseForbidden, JsonResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from assistant.guardrails import detect_prompt_injection

from core.concurrency import background_slot, extract_slot
from core.ai import AIQuotaExceeded, check_quota, cost_for, credit_info, ocr_cost, require_credits

from .ai import (
    LEGACY_SUMMARY_CHARS, SUMMARY_CHUNK_CHARS, SUMMARY_MAX_CHARS, SUMMARY_MAX_CHUNKS, clean_question_text, extract_text, generate_one_question, generate_summary, grade_answer, is_duplicate_question,
    pdf_page_texts, summary_chunk_count, summary_too_long, too_long_message,
)
from .cram import MAX_SOURCES as CRAM_MAX_SOURCES
from .forms import ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE, PersonalDocumentUploadForm, PersonalFolderForm
from .models import GeneratedQuestion, MockExam, PersonalDocument, PersonalFolder, ProcessingStatus
from .stream import SummaryPublisher
from .ontology import professor_choices, resolve_professor, resolve_subject, subject_choices

logger = logging.getLogger(__name__)

MAX_QUESTIONS = 20
NOTE_STALE_AFTER = timedelta(minutes=10)
STALE_AFTER = timedelta(minutes=3)  # 이 시간이 지나도 '생성 중'이면 멈춘 것으로 보고 다시 시도할 수 있게 한다


_summarizing = set()  # 이 프로세스에서 요약을 만드는 중인 문서 (오래된 '생성 중'과 진짜 진행 중을 구별한다)


def _generate_summary_bg(document_id):
    _summarizing.add(document_id)
    publisher = None
    try:
        with background_slot():      # 업로드가 몰려도 AI를 부르는 작업은 동시에 몇 개만 (core/concurrency.py)
            document = PersonalDocument.objects.select_related("user").get(pk=document_id)
            publisher = SummaryPublisher(document_id)       # 만들어지는 대로 열어 둔 학습 화면에 보낸다 (mypage/stream.py)
            summary = generate_summary(document.extracted_text, user=document.user, kind=document.document_type,
                                       on_text=publisher.push)
            PersonalDocument.objects.filter(pk=document_id).update(summary=summary, summary_status=ProcessingStatus.DONE)
            publisher.finish("done")
    except Exception:
        logger.exception("문서 %s 자동 요약 생성 실패", document_id)
        PersonalDocument.objects.filter(pk=document_id).update(summary_status=ProcessingStatus.FAILED)
        if publisher:
            publisher.finish("failed")
        connection.close()
        return
    finally:
        _summarizing.discard(document_id)
    with background_slot():          # 분류·개념 태그·강의 초안도 AI를 부르므로 같은 상한을 지킨다 (요약 자리는 먼저 놓는다)
        _classify_and_build(document_id)
    connection.close()


def _course_after_upload_bg(document_id):
    try:
        with background_slot():
            _classify_and_build(document_id)
    finally:
        connection.close()


def _classify_and_build(document_id):
    """AI가 자료의 주제를 정하고, 그 주제에 강의를 만들 만큼 자료가 모였다고 판단하면 강의 초안을 만든다
    (course/topics.py). 강의는 바로 바뀌지 않고 강의자가 judge > 강의 생성 탭에서 승인해야 게시된다.
    여기서 실패해도 요약은 그대로 남는다."""
    try:
        from course.topics import after_summary

        after_summary(document_id)
    except Exception:
        logger.exception("문서 %s 주제 분류·강의 초안 처리 실패", document_id)


def _generate_question_bg(question_id, extracted_text, question_type, existing_texts, user=None, index=0, style=""):
    try:
        with background_slot():
            _make_question(question_id, extracted_text, question_type, existing_texts, user, index, style)
    finally:
        connection.close()


def _make_question(question_id, extracted_text, question_type, existing_texts, user, index, style):
    try:
        q = generate_one_question(extracted_text, question_type, existing_questions=existing_texts, user=user,
                                  index=index, style=style)
        if is_duplicate_question(q.get("question", ""), existing_texts):
            # 이미 있는 문제와 같으면 문서의 다른 구간으로 한 번만 더 시도하고, 그래도 같으면 실패 처리한다
            q = generate_one_question(extracted_text, question_type, existing_questions=existing_texts, user=user,
                                      index=index + 1, style=style)
            if is_duplicate_question(q.get("question", ""), existing_texts):
                raise ValueError("이미 만든 문제와 같은 문제가 만들어져 건너뜁니다.")
        # OX 해설은 만들 때 같이 받아 feedback에 넣어 둔다 (답을 낸 뒤에만 화면에 보이고, 다시 부르지 않음)
        GeneratedQuestion.objects.filter(pk=question_id).update(
            question_text=q.get("question", ""), answer=q.get("answer", ""),
            feedback=q.get("explanation", ""), status=ProcessingStatus.DONE,
        )
    except Exception:
        logger.exception("문제 %s 생성 실패", question_id)
        GeneratedQuestion.objects.filter(pk=question_id).update(status=ProcessingStatus.FAILED)
    finally:
        connection.close()


@login_required
def document_list(request, folder_id=None):
    folder = None
    if folder_id is not None:
        folder = get_object_or_404(PersonalFolder, pk=folder_id)
        if folder.user != request.user:
            return HttpResponseForbidden("본인의 폴더만 볼 수 있습니다.")

    if request.method == "POST":
        form = PersonalDocumentUploadForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            document = form.save(commit=False)
            document.user = request.user
            document.folder = folder
            if not document.title:
                document.title = os.path.splitext(document.file.name)[0]
            typed_course = form.cleaned_data["course_name"]

            def apply_info():
                """과목·교수를 이미 있는 것에 묶는다 (표기만 다른 이름은 같은 과목·교수로). 저장 직전에만 불러 빈 과목이 남지 않게 한다."""
                subject, how = resolve_subject(typed_course)
                professor = resolve_professor(form.cleaned_data["professor"])
                document.course_name = subject.name
                document.professor = professor.name if professor else ""
                if how != "new" and subject.name != " ".join(typed_course.split()):
                    messages.info(request, f"「{typed_course}」은(는) 기존 과목 「{subject.name}」으로 묶었습니다.")
                elif how == "new":
                    messages.info(request, f"새 과목 「{subject.name}」을(를) 만들었습니다.")

            upload = request.FILES["file"]
            upload.seek(0)
            content_hash = hashlib.sha256(upload.read()).hexdigest()
            upload.seek(0)
            # 같은 파일이 이미 요약돼 있으면 AI를 부르지 않고 그 결과를 쓴다 (토큰 절약)
            same = (PersonalDocument.objects.filter(content_hash=content_hash, summary_status=ProcessingStatus.DONE,
                                                    document_type=document.document_type)
                    .exclude(summary="").first())
            if same:
                document.content_hash = content_hash
                document.extracted_text = same.extracted_text
                document.summary = same.summary
                document.summary_status = ProcessingStatus.DONE
                apply_info()
                document.save()
                threading.Thread(target=_course_after_upload_bg, args=(document.pk,), daemon=True).start()
                messages.success(request, "자료가 업로드되었습니다. 같은 자료의 요약을 바로 불러왔습니다.")
                return redirect(request.path)
            in_flight = PersonalDocument.objects.filter(user=request.user, summary_status=ProcessingStatus.PROCESSING,
                                                        uploaded_at__gte=timezone.now() - STALE_AFTER).count()
            if in_flight >= settings.MAX_PROCESSING_PER_USER:     # 한 사람이 처리 대기열을 독차지하지 못하게
                messages.error(request, f"요약 중인 자료가 {in_flight}개 있습니다. 몇 개가 끝난 뒤에 올려주세요 "
                                        f"(동시에 최대 {settings.MAX_PROCESSING_PER_USER}개).")
                return redirect(request.path)
            is_image = document.file.name.lower().endswith((".jpg", ".jpeg", ".png"))
            try:
                # 이미지는 글자 읽기(크기당) + 요약 최소 1조각, 그 밖에는 요약 최소 1조각의 크레딧이 있어야 시작한다
                require_credits(request.user, (ocr_cost(upload.size) if is_image else 0) + cost_for("summary"))
            except AIQuotaExceeded as exc:
                messages.error(request, f"자료를 올리지 못했습니다. {exc}")
                return redirect(request.path)
            document.content_hash = content_hash
            apply_info()
            document.save()
            # 파일을 고를 때 이미 글자를 읽어 둔 게 있으면 다시 읽지 않는다 (upload_estimate, 이미지는 OCR이라 제외)
            extracted_text = None if is_image else cache.get(_extract_cache_key(request.user, content_hash))
            if extracted_text is None:
                try:
                    with extract_slot(), document.file.open("rb") as fh:     # 변환(CPU)은 동시에 몇 개만
                        extracted_text = extract_text(fh, document.file.name, user=request.user)
                except TimeoutError as exc:
                    document.file.delete(save=False)
                    document.delete()
                    messages.error(request, str(exc))
                    return redirect(request.path)
            if not extracted_text.strip():
                document.file.delete(save=False)
                document.delete()
                messages.error(request, "자료를 올리지 못했습니다. " + UNREADABLE_MESSAGE)
                return redirect(request.path)
            if detect_prompt_injection(extracted_text):
                document.summary_status = ProcessingStatus.FAILED
                document.save(update_fields=["summary_status"])
                messages.error(request, "업로드한 자료에서 프롬프트 인젝션으로 의심되는 내용이 발견되어 처리를 중단했습니다.")
                return redirect(request.path)
            if summary_too_long(extracted_text):
                document.file.delete(save=False)
                document.delete()
                messages.error(request, "자료를 올리지 못했습니다. " + too_long_message(len(extracted_text)))
                return redirect(request.path)
            document.extracted_text = extracted_text
            try:    # 본문을 읽은 뒤 전체 조각 수로 필요한 크레딧을 미리 확인한다 (AI를 부르지 않고 글자 수로 센다)
                require_credits(request.user, summary_chunk_count(extracted_text) * cost_for("summary"))
            except AIQuotaExceeded as exc:
                document.summary_status = ProcessingStatus.PENDING
                document.save(update_fields=["extracted_text", "summary_status"])
                messages.warning(request, f"자료를 올렸지만 요약은 시작하지 않았습니다. {exc} 충전한 뒤 '요약 시작'을 눌러주세요.")
                return redirect(request.path)
            document.summary_status = ProcessingStatus.PROCESSING
            document.save(update_fields=["extracted_text", "summary_status"])
            threading.Thread(target=_generate_summary_bg, args=(document.pk,), daemon=True).start()
            messages.success(request, "자료가 업로드되었습니다. 요약은 잠시 후 생성됩니다.")
            return redirect(request.path)
        if {"document_type", "course_name", "professor"} & set(form.errors):
            messages.error(request, "자료 구분, 과목 이름, 교수 이름을 모두 입력해주세요. 올린 뒤에는 고칠 수 없습니다.")
        else:
            messages.error(request, "업로드에 실패했습니다. 파일 형식과 크기를 확인해주세요.")
    else:
        form = PersonalDocumentUploadForm(user=request.user)

    PersonalDocument.objects.filter(      # 서버가 다시 켜지는 등으로 멈춘 노트는 실패로 돌려 목록이 계속 새로고침되지 않게 한다
        user=request.user, document_type=PersonalDocument.DocumentType.NOTE, summary_status=ProcessingStatus.PROCESSING,
        uploaded_at__lt=timezone.now() - NOTE_STALE_AFTER).update(
        summary_status=ProcessingStatus.FAILED,
        summary="노트를 만드는 도중 서버가 다시 시작되는 등으로 작업이 중단됐습니다. 다시 만들어주세요. 크레딧이 차감됐는데 돌아오지 않았다면 운영진에게 알려주세요.")
    folders = PersonalFolder.objects.filter(user=request.user).annotate(
        doc_count=Count("documents", filter=Q(documents__is_deleted=False))
    )
    documents = list(PersonalDocument.objects.filter(user=request.user, folder=folder, is_deleted=False))
    for doc in documents:   # 요약을 (다시) 시작하는 버튼에 보일 정확한 비용: 본문을 읽었으면 조각 수 × 조각당 비용
        doc.resummary_cost = _summary_cost(doc)
    return render(request, "mypage/list.html", {
        "documents": documents,
        "folders": folders,
        "current_folder": folder,
        "form": form,
        "summary_chunk_chars": SUMMARY_CHUNK_CHARS,
        "summary_max_chunks": SUMMARY_MAX_CHUNKS,
        "summary_max_chars": f"{SUMMARY_MAX_CHARS:,}",
        "cram_max": CRAM_MAX_SOURCES,
        "max_upload_bytes": MAX_UPLOAD_SIZE,
        "subject_choices": subject_choices(),
        "professor_choices": professor_choices(),
        "folder_form": PersonalFolderForm(),
    })


UNREADABLE_MESSAGE = "글자를 읽지 못했어요. 스캔한 PDF라면 이미지(JPG·PNG)로 올려 주세요."
UPLOAD_ESTIMATE_PER_MINUTE = 20
EXTRACT_CACHE_TTL = 900


def _extract_cache_key(user, content_hash):
    return f"upload-extract:{user.pk}:{content_hash}"


@login_required
@require_POST
def upload_estimate(request):
    """파일을 고르는 순간 부르는 비용 계산: 글자를 읽어(AI 없음) 요약 조각 수와 필요한 크레딧을 알려 준다.
    읽은 글자는 잠시 캐시해 두었다가 실제 업로드에서 다시 읽지 않는다. 이미지는 글자 읽기(크기당) + 요약 최소~최대 범위."""
    upload = request.FILES.get("file")
    if upload is None:
        return JsonResponse({"ok": False, "error": "파일을 선택해주세요."}, status=400)
    if upload.size > MAX_UPLOAD_SIZE:
        return JsonResponse({"ok": False, "error": f"파일은 {MAX_UPLOAD_SIZE // (1024 * 1024)}MB를 넘을 수 없습니다 "
                                                    f"(선택한 파일 {upload.size / (1024 * 1024):.1f}MB)."}, status=413)
    name = upload.name.lower()
    if not name.endswith(ALLOWED_EXTENSIONS):
        return JsonResponse({"ok": False, "error": "지원하지 않는 파일 형식입니다."}, status=400)
    bucket = f"upload-estimate:{request.user.pk}"
    cache.add(bucket, 0, 60)
    if cache.incr(bucket) > UPLOAD_ESTIMATE_PER_MINUTE:
        return JsonResponse({"ok": False, "error": "잠시 후 다시 시도해주세요."}, status=429)
    data = upload.read()
    unit = cost_for("summary")
    info = {"ok": True, "unit_cost": unit, "max_chunks": SUMMARY_MAX_CHUNKS}
    if name.endswith((".jpg", ".jpeg", ".png")):
        ocr = ocr_cost(len(data))
        info.update(kind="image", ocr_cost=ocr, min_cost=ocr + unit, max_cost=ocr + unit * SUMMARY_MAX_CHUNKS)
        need = ocr + unit
    else:
        content_hash = hashlib.sha256(data).hexdigest()
        key = _extract_cache_key(request.user, content_hash)
        text = cache.get(key)
        if text is None:
            try:
                with extract_slot():
                    text = extract_text(io.BytesIO(data), upload.name, user=request.user)
            except TimeoutError as exc:
                return JsonResponse({"ok": False, "error": str(exc)}, status=503)
            cache.set(key, text, EXTRACT_CACHE_TTL)
        if not text.strip():               # 스캔한 PDF처럼 글자를 못 읽으면 올려도 요약할 게 없다
            return JsonResponse({"ok": False, "empty": True, "error": UNREADABLE_MESSAGE}, status=422)
        if summary_too_long(text):         # 앞부분만 요약되는 일이 없게, 요약하지 않고 쪼개서 올리게 한다
            return JsonResponse({"ok": False, "too_long": True, "error": too_long_message(len(text))}, status=422)
        chunks = summary_chunk_count(text)
        info.update(kind="text", chunks=chunks, chars=len(text), cost=chunks * unit)
        need = chunks * unit
    balance = credit_info(request.user, "summary")
    info["balance"] = balance["balance"] if balance else None       # 크레딧이 필요 없는 사용자는 None
    info["enough"] = True if balance is None else balance["balance"] >= need
    return JsonResponse(info)


@login_required
@require_POST
def folder_create(request):
    form = PersonalFolderForm(request.POST)
    if form.is_valid():
        folder = form.save(commit=False)
        folder.user = request.user
        folder.save()
        messages.success(request, "폴더가 생성되었습니다.")
        return redirect("mypage:document_list", folder_id=folder.pk)
    messages.error(request, "폴더 이름을 확인해주세요.")
    return redirect("mypage:document_list")


@login_required
@require_POST
def folder_delete(request, pk):
    folder = get_object_or_404(PersonalFolder, pk=pk)
    if folder.user != request.user:
        return HttpResponseForbidden("본인의 폴더만 삭제할 수 있습니다.")
    folder.delete()
    messages.success(request, "폴더가 삭제되었습니다. 안에 있던 자료는 루트로 이동했습니다.")
    return redirect("mypage:document_list")


@login_required
@require_POST
def folder_rename(request, pk):
    folder = get_object_or_404(PersonalFolder, pk=pk)
    if folder.user != request.user:
        return HttpResponseForbidden("본인의 폴더만 이름을 바꿀 수 있습니다.")
    name = request.POST.get("name", "").strip()
    if not name or len(name) > 100:
        messages.error(request, "폴더 이름은 1~100자로 입력해주세요.")
    else:
        folder.name = name
        folder.save(update_fields=["name"])
        messages.success(request, "폴더 이름을 바꿨습니다.")
    return redirect(request.POST.get("next") if request.POST.get("next", "").startswith("/mypage/") else "mypage:document_list")


@login_required
@require_POST
def document_rename(request, pk):
    document = get_object_or_404(PersonalDocument, pk=pk, is_deleted=False)
    if document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 이름을 바꿀 수 있습니다.")
    title = request.POST.get("title", "").strip()
    max_len = PersonalDocument._meta.get_field("title").max_length
    if not title or len(title) > max_len:
        messages.error(request, f"자료 이름은 1~{max_len}자로 입력해주세요.")
    else:
        document.title = title
        document.save(update_fields=["title"])
        messages.success(request, "자료 이름을 바꿨습니다.")
    return redirect(request.POST.get("next") if request.POST.get("next", "").startswith("/mypage/") else "mypage:document_list")


@login_required
@require_POST
def document_move(request, pk):
    """자료를 다른 폴더(또는 맨 위)로 옮긴다. 위치만 바꾸므로 AI를 부르지 않는다."""
    document = get_object_or_404(PersonalDocument, pk=pk, is_deleted=False)
    if document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 옮길 수 있습니다.")
    raw = request.POST.get("folder", "")
    folder = None
    if raw:
        folder = PersonalFolder.objects.filter(pk=raw if raw.isdigit() else 0, user=request.user).first()
        if folder is None:
            messages.error(request, "옮길 폴더를 찾지 못했습니다.")
            return redirect(request.POST.get("next") if request.POST.get("next", "").startswith("/mypage/") else "mypage:document_list")
    if document.folder_id != (folder.pk if folder else None):
        document.folder = folder
        document.save(update_fields=["folder"])
    messages.success(request, f"「{document.title}」을(를) {folder.name if folder else '맨 위(폴더 밖)'}(으)로 옮겼습니다.")
    return redirect(request.POST.get("next") if request.POST.get("next", "").startswith("/mypage/") else "mypage:document_list")


@login_required
def document_preview(request, pk):
    document = get_object_or_404(PersonalDocument, pk=pk, is_deleted=False)
    if document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 볼 수 있습니다.")
    if document.document_type == PersonalDocument.DocumentType.NOTE:
        return render(request, "mypage/note.html", {"document": document})

    is_pdf = document.file.name.lower().endswith(".pdf")
    source_pages = pdf_page_texts(document) if is_pdf and document.summary.strip() else []
    active_panel = request.GET.get("panel", "summary")
    if active_panel not in ("summary", "quiz"):
        active_panel = "summary"

    # 생성에 실패한 문제는 빈 카드로 남기지 않고 목록에서 뺀다
    current_questions = list(document.questions.exclude(status=ProcessingStatus.FAILED))
    for question in current_questions:
        question.display_text = clean_question_text(question.question_text)  # 예전에 만든 문제의 'OX로 답하시오.'도 가린다
    q_index = 0
    if current_questions:
        try:
            q_index = int(request.GET.get("q", 0))
        except ValueError:
            q_index = 0
        q_index = max(0, min(q_index, len(current_questions) - 1))

    return render(request, "mypage/preview.html", {
        "document": document,
        "is_pdf": is_pdf,
        "source_pages": source_pages,
        "active_panel": active_panel,
        "current_questions": current_questions,
        "current_question": current_questions[q_index] if current_questions else None,
        "q_index": q_index,
        "max_questions": MAX_QUESTIONS,
        "question_types": GeneratedQuestion.QuestionType.choices,
        "has_pending_question": any(q.status == ProcessingStatus.PROCESSING for q in current_questions),
        "can_resummarize": _can_resummarize(document),
        "resummary_cost": _summary_cost(document),
        "credit_info": _credit_context(request.user),
        "initial_state": _document_state(document),
    })


@login_required
@require_POST
def generate_question_view(request, pk):
    document = get_object_or_404(PersonalDocument, pk=pk, is_deleted=False)
    if document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 문제를 생성할 수 있습니다.")
    question_type = request.POST.get("question_type")
    if question_type not in dict(GeneratedQuestion.QuestionType.choices):
        raise Http404("존재하지 않는 문제 유형입니다.")

    redirect_base = f"{document.get_absolute_url()}?panel=quiz"

    if not document.extracted_text.strip():
        messages.error(request, "문서에서 텍스트를 추출하지 못해 문제를 생성할 수 없습니다.")
        return redirect(redirect_base)

    try:
        check_quota(request.user, "question")
    except AIQuotaExceeded as exc:
        messages.error(request, str(exc))
        return redirect(redirect_base)

    # 같은 문서에서 동시에 두 번 눌러도 문제가 하나만 만들어지게 문서 행을 잠그고 확인한다
    with transaction.atomic():
        PersonalDocument.objects.select_for_update().get(pk=document.pk)
        document.questions.filter(
            status=ProcessingStatus.PROCESSING, created_at__lt=timezone.now() - STALE_AFTER,
        ).update(status=ProcessingStatus.FAILED)  # 멈춘 작업 정리
        if document.questions.filter(status=ProcessingStatus.PROCESSING).exists():
            messages.info(request, "문제를 생성하는 중입니다. 끝난 뒤에 다시 눌러주세요.")
            return redirect(redirect_base)
        kept = document.questions.exclude(status=ProcessingStatus.FAILED)
        existing_count = kept.count()
        if existing_count >= MAX_QUESTIONS:
            messages.error(request, f"이미 최대 {MAX_QUESTIONS}개까지 생성했습니다.")
            return redirect(redirect_base)
        # 유형과 상관없이 이미 만든 문제를 모두 알려 줘서 같은 내용을 다시 묻지 않게 한다
        existing_texts = [clean_question_text(t) for t in kept.values_list("question_text", flat=True) if t]
        question = GeneratedQuestion.objects.create(
            document=document,
            question_type=question_type,
            status=ProcessingStatus.PROCESSING,
        )
    from .exam import style_for, style_prompt, topic_professor

    subject = document.subject_code
    professor = document.professor or topic_professor(subject)
    style_text = style_prompt(style_for(professor, subject), professor, subject)    # 교수님 족보에서 배운 출제 스타일
    threading.Thread(
        target=_generate_question_bg,
        args=(question.pk, document.extracted_text, question_type, existing_texts, request.user, existing_count),
        kwargs={"style": style_text},
        daemon=True,
    ).start()

    messages.success(request, "문제를 생성하고 있습니다. 잠시 후 새로고침해주세요.")
    return redirect(f"{redirect_base}&q={existing_count}")


@login_required
@require_POST
def submit_answer_view(request, pk, question_id):
    question = get_object_or_404(GeneratedQuestion, pk=question_id, document_id=pk, document__is_deleted=False)
    if question.document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 답을 제출할 수 있습니다.")

    redirect_base = f"{question.document.get_absolute_url()}?panel=quiz&q={request.GET.get('q', 0)}"
    wants_json = request.headers.get("X-Requested-With") == "XMLHttpRequest"

    def fail(message, status=400):
        if wants_json:
            return JsonResponse({"ok": False, "error": message}, status=status)
        messages.error(request, message)
        return redirect(redirect_base)

    if question.status != ProcessingStatus.DONE:
        return fail("문제를 아직 생성하고 있습니다. 잠시 후 다시 시도해주세요.")

    user_answer = request.POST.get("user_answer", "").strip()
    if not user_answer:
        return fail("답을 입력해주세요.")

    if question.question_type == GeneratedQuestion.QuestionType.OX:
        # 해설은 문제를 만들 때 받아 둔 것(question.feedback)을 그대로 쓴다 — AI를 다시 부르지 않음
        is_correct = user_answer.upper() == question.answer.strip().upper()
        feedback = question.feedback
    else:
        try:
            result = grade_answer(question.question_text, question.answer, user_answer, user=request.user,
                                  question_type=question.question_type)
            is_correct, feedback = result["is_correct"], result["feedback"]
        except AIQuotaExceeded as exc:
            return fail(str(exc), status=429)
        except Exception:
            logger.exception("문제 %s 채점 실패", question.pk)
            return fail("채점 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", status=500)

    question.user_answer = user_answer
    question.is_correct = is_correct
    question.feedback = feedback
    question.save(update_fields=["user_answer", "is_correct", "feedback"])
    if wants_json:
        return JsonResponse({"ok": True, "is_correct": is_correct, "feedback": feedback,
                             "user_answer": user_answer, "answer": question.answer})
    return redirect(redirect_base)


@login_required
@require_POST
def document_delete(request, pk):
    document = get_object_or_404(PersonalDocument, pk=pk, is_deleted=False)
    if document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 삭제할 수 있습니다.")
    folder_id = document.folder_id
    document.is_deleted = True
    document.save(update_fields=["is_deleted"])
    messages.success(request, "자료가 삭제되었습니다.")
    if folder_id:
        return redirect("mypage:document_list", folder_id=folder_id)
    return redirect("mypage:document_list")


@login_required
def learning_overview(request):
    """judge > 내 학습: 강의·복습 문제·퀴즈·대회·문제 풀이 기록을 한 화면에 (core/learning.py)."""
    from core.learning import overview

    return render(request, "mypage/learning.html", {"data": overview(request.user)})


def _can_resummarize(document):
    """요약이 실패했거나(또는 비어 있거나) 오래 '생성 중'에 멈춰 있으면 다시 만들 수 있다.
    본문이 긴 자료는 요약이 있어도 다시 만들 수 있다 — 예전 요약은 앞 12,000자만 반영했을 수 있어서다."""
    if document.document_type == PersonalDocument.DocumentType.NOTE:
        return False        # 노트는 요약이 아니라 새로 만든다
    if document.summary_status == ProcessingStatus.FAILED:
        return True
    if document.summary_status == ProcessingStatus.PROCESSING:
        return document.pk not in _summarizing and document.uploaded_at < timezone.now() - STALE_AFTER
    return not document.summary.strip() or len(document.extracted_text) > LEGACY_SUMMARY_CHARS


@login_required
@require_POST
def document_resummarize(request, pk):
    """요약을 만들지 못한 자료의 요약을 다시 만든다 (본문이 비어 있으면 파일에서 다시 추출해 본다)."""
    document = get_object_or_404(PersonalDocument, pk=pk, is_deleted=False)
    if document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 다시 요약할 수 있습니다.")
    back = redirect(document.get_absolute_url())
    if not _can_resummarize(document):
        messages.info(request, "이미 요약이 있거나 생성 중입니다.")
        return back
    try:
        check_quota(request.user, "summary")
    except AIQuotaExceeded as exc:
        messages.error(request, str(exc))
        return back

    text = document.extracted_text
    if not text.strip():
        try:
            with document.file.open("rb") as fh:
                text = extract_text(fh, document.file.name, user=request.user)
        except (FileNotFoundError, ValueError, OSError):
            text = ""
        if not text.strip():
            messages.error(request, "파일에서 글자를 읽지 못해 요약할 수 없습니다. 파일 형식과 내용을 확인해주세요.")
            return back
        if detect_prompt_injection(text):
            messages.error(request, "자료에서 프롬프트 인젝션으로 의심되는 내용이 발견되어 처리를 중단했습니다.")
            return back
    if summary_too_long(text):
        messages.error(request, too_long_message(len(text)))
        return back
    try:    # 전체 조각 수로 필요한 크레딧을 미리 확인한다 (모자라면 시작하지 않는다)
        require_credits(request.user, summary_chunk_count(text) * cost_for("summary"))
    except AIQuotaExceeded as exc:
        messages.error(request, str(exc))
        return back
    # 조건 확인과 상태 변경을 한 번에 해 두 번 눌러도 요약이 한 번만 시작되게 한다
    updated = PersonalDocument.objects.filter(pk=document.pk, summary_status=document.summary_status).update(
        extracted_text=text, summary_status=ProcessingStatus.PROCESSING)
    if updated and document.pk not in _summarizing:
        _summarizing.add(document.pk)
        threading.Thread(target=_generate_summary_bg, args=(document.pk,), daemon=True).start()
        messages.success(request, "요약을 다시 만들고 있습니다.")
    return back


def _summary_cost(document):
    """이 자료를 요약할 때 드는 크레딧: 읽어 둔 본문이 있으면 조각 수 × 조각당 비용, 아직 없으면 최소(1조각) 비용."""
    chunks = summary_chunk_count(document.extracted_text) if document.extracted_text.strip() else 1
    return max(chunks, 1) * cost_for("summary")


def _credit_context(user):
    info = credit_info(user, "summary")
    return {**info, "chars": SUMMARY_CHUNK_CHARS} if info else None


def _document_state(document):
    """학습 화면이 폴링으로 비교하는 상태. 값이 바뀌면 화면을 새로 읽는다."""
    return {
        "summary_status": document.summary_status,
        "has_summary": bool(document.summary.strip()),
        "can_resummarize": _can_resummarize(document),
        "questions": [[q.pk, q.status] for q in document.questions.order_by("pk")],
    }


@login_required
def document_status(request, pk):
    document = get_object_or_404(PersonalDocument, pk=pk, is_deleted=False)
    if document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 볼 수 있습니다.")
    return JsonResponse(_document_state(document))


# ── 시험 5분 전 속성 노트 ────────────────────────────────────────────────────

def _cram_note_bg(note_id, source_ids):
    from .cram import build_note_document

    try:
        with background_slot():
            build_note_document(note_id, source_ids)
    finally:
        connection.close()


@login_required
@require_POST
def cram_note_create(request):
    """고른 자료로 시험 5분 전 속성 노트를 만든다. 개인 탭에 '생성 중' 노트가 바로 생기고, 그림은 백그라운드에서 그린다."""
    from .cram import note_cost, note_title, usable

    back = redirect(request.POST.get("next") if request.POST.get("next", "").startswith("/mypage/") else "mypage:document_list")
    try:
        ids = [int(v) for v in request.POST.getlist("ids")]
    except ValueError:
        ids = []
    sources = [d for d in PersonalDocument.objects.filter(pk__in=ids, user=request.user, is_deleted=False).order_by("id") if usable(d)]
    if not sources:
        messages.error(request, "노트로 만들 자료를 하나 이상 골라주세요. (요약이 있는 자료만 고를 수 있습니다.)")
        return back
    if len(sources) > CRAM_MAX_SOURCES:
        messages.error(request, f"한 번에 최대 {CRAM_MAX_SOURCES}개 자료까지 고를 수 있습니다.")
        return back
    in_flight = PersonalDocument.objects.filter(
        user=request.user, summary_status=ProcessingStatus.PROCESSING, uploaded_at__gte=timezone.now() - STALE_AFTER).count()
    if in_flight >= settings.MAX_PROCESSING_PER_USER:
        messages.error(request, f"처리 중인 자료가 {in_flight}개 있습니다. 몇 개가 끝난 뒤에 만들어주세요 "
                                f"(동시에 최대 {settings.MAX_PROCESSING_PER_USER}개).")
        return back
    try:
        require_credits(request.user, note_cost(len(sources)))      # 고른 자료 수만큼
    except AIQuotaExceeded as exc:
        messages.error(request, str(exc))
        return back
    folder = PersonalFolder.objects.filter(pk=request.POST.get("folder") or None, user=request.user).first()
    courses = list(dict.fromkeys(d.course_name for d in sources if d.course_name))
    professors = list(dict.fromkeys(d.professor for d in sources if d.professor))
    note = PersonalDocument.objects.create(
        user=request.user, folder=folder, title=note_title(sources), file="",
        document_type=PersonalDocument.DocumentType.NOTE, summary_status=ProcessingStatus.PROCESSING,
        course_name=courses[0] if len(courses) == 1 else "", professor=professors[0] if len(professors) == 1 else "",
        is_course_material=False)
    threading.Thread(target=_cram_note_bg, args=(note.pk, [d.pk for d in sources]), daemon=True).start()
    messages.success(request, "속성 노트를 손글씨로 쓰고 있습니다. 잠시 후 개인 탭에 나타납니다.")
    return back


# ── 모의 출제 ────────────────────────────────────────────────────────────────

@login_required
@require_POST
def mock_exam_create(request):
    """고른 수업 자료들로 모의 출제를 만든다 (교수님 족보 스타일 적용, 크레딧을 받고 만들지 못하면 돌려준다)."""
    from .cram import MAX_SOURCES
    from .exam import generate_mock_exam, usable_for_mock

    back = redirect("mypage:document_list")
    try:
        ids = [int(v) for v in request.POST.getlist("ids")]
    except ValueError:
        ids = []
    documents = [d for d in PersonalDocument.objects.filter(pk__in=ids, user=request.user, is_deleted=False).order_by("id")
                 if usable_for_mock(d)]
    if not documents:
        messages.error(request, "모의 출제에 쓸 수업 자료를 하나 이상 골라주세요. (요약이 끝난 수업 자료만 고를 수 있습니다.)")
        return back
    if len(documents) > MAX_SOURCES:
        messages.error(request, f"한 번에 최대 {MAX_SOURCES}개 자료까지 고를 수 있습니다.")
        return back
    try:
        check_quota(request.user, "mock_exam")
        exam = generate_mock_exam(request.user, documents)
    except AIQuotaExceeded as exc:
        messages.error(request, str(exc))
        return back
    except ValueError as exc:
        messages.error(request, str(exc))
        return back
    except Exception:
        logger.exception("모의 출제 생성 실패")
        messages.error(request, "모의 출제를 만들지 못했습니다. 잠시 후 다시 시도해주세요.")
        return back
    return redirect(exam.get_absolute_url())


@login_required
def mock_exam(request, pk):
    from .exam import essay_count, grade_mock_exam

    exam = get_object_or_404(MockExam, pk=pk)
    if exam.user != request.user:
        return HttpResponseForbidden("본인의 모의 출제만 볼 수 있습니다.")
    posted = {}
    if request.method == "POST" and exam.submitted_at is None:
        posted = {k[2:]: v for k, v in request.POST.items() if k.startswith("a_")}
        try:    # 서술형은 AI가 채점하므로 답을 쓴 서술형 수만큼 채점 크레딧이 필요하다 (모자라면 채점하지 않고 답을 그대로 보여 준다)
            require_credits(request.user, essay_count(exam, posted) * cost_for("grading"))
        except AIQuotaExceeded as exc:
            messages.error(request, f"서술형 채점에 크레딧이 필요합니다. {exc}")
        else:
            grade_mock_exam(exam, posted)
            return redirect(exam.get_absolute_url())
    rows = []
    for i, q in enumerate(exam.questions):
        row = {"index": i, "q": q, "value": posted.get(str(i), "")}
        if exam.submitted_at:
            row.update(answer=exam.answers[i] if i < len(exam.answers) else None,
                       correct=exam.results[i] if i < len(exam.results) else False)
            if q["type"] == "ox":
                row["correct_text"] = "O" if q["answer"] else "X"
                row["answer_text"] = {True: "O", False: "X"}.get(row["answer"], "무응답")
            elif q["type"] == "mc":
                row["correct_text"] = f"{q['answer'] + 1}. {q['options'][q['answer']]}"
                a = row["answer"]
                row["answer_text"] = f"{a + 1}. {q['options'][a]}" if isinstance(a, int) and 0 <= a < len(q["options"]) else "무응답"
            elif q["type"] == "essay":
                row["correct_text"] = q["answer"]
                row["answer_text"] = row["answer"] or "무응답"
                row["note"] = exam.feedback[i] if i < len(exam.feedback) else ""
            else:
                row["correct_text"] = " / ".join(q["answers"])
                row["answer_text"] = row["answer"] or "무응답"
        rows.append(row)
    score = sum(exam.results) if exam.submitted_at else None
    essays = essay_count(exam)
    grading = credit_info(request.user, "grading")
    return render(request, "mypage/mock_exam.html", {
        "exam": exam, "rows": rows, "score": score, "total": len(exam.questions),
        "essays": essays, "essay_cost": essays * grading["cost"] if grading else 0,
    })
