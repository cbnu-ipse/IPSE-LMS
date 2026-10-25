import hashlib
import logging
import os
import threading
from datetime import timedelta

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import connection, transaction
from django.db.models import Count, Q
from django.http import Http404, HttpResponseForbidden, JsonResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from assistant.guardrails import detect_prompt_injection

from core.ai import AIQuotaExceeded, check_quota, credit_info

from .ai import (
    SUMMARY_CHUNK_CHARS, clean_question_text, extract_text, generate_one_question, generate_summary, grade_answer, is_duplicate_question,
)
from .forms import PersonalDocumentUploadForm, PersonalFolderForm
from .models import GeneratedQuestion, PersonalDocument, PersonalFolder, ProcessingStatus

logger = logging.getLogger(__name__)

MAX_QUESTIONS = 20
STALE_AFTER = timedelta(minutes=3)  # 이 시간이 지나도 '생성 중'이면 멈춘 것으로 보고 다시 시도할 수 있게 한다


_summarizing = set()  # 이 프로세스에서 요약을 만드는 중인 문서 (오래된 '생성 중'과 진짜 진행 중을 구별한다)


def _generate_summary_bg(document_id):
    _summarizing.add(document_id)
    try:
        document = PersonalDocument.objects.select_related("user").get(pk=document_id)
        summary = generate_summary(document.extracted_text, user=document.user)
        PersonalDocument.objects.filter(pk=document_id).update(summary=summary, summary_status=ProcessingStatus.DONE)
    except Exception:
        logger.exception("문서 %s 자동 요약 생성 실패", document_id)
        PersonalDocument.objects.filter(pk=document_id).update(summary_status=ProcessingStatus.FAILED)
        connection.close()
        return
    finally:
        _summarizing.discard(document_id)
    _classify_and_build(document_id)
    connection.close()


def _course_after_upload_bg(document_id):
    try:
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


def _generate_question_bg(question_id, extracted_text, question_type, existing_texts, user=None, index=0):
    try:
        q = generate_one_question(extracted_text, question_type, existing_questions=existing_texts, user=user,
                                  index=index)
        if is_duplicate_question(q.get("question", ""), existing_texts):
            # 이미 있는 문제와 같으면 문서의 다른 구간으로 한 번만 더 시도하고, 그래도 같으면 실패 처리한다
            q = generate_one_question(extracted_text, question_type, existing_questions=existing_texts, user=user,
                                      index=index + 1)
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
            upload = request.FILES["file"]
            upload.seek(0)
            content_hash = hashlib.sha256(upload.read()).hexdigest()
            upload.seek(0)
            # 같은 파일이 이미 요약돼 있으면 AI를 부르지 않고 그 결과를 쓴다 (토큰 절약)
            same = (PersonalDocument.objects.filter(content_hash=content_hash, summary_status=ProcessingStatus.DONE)
                    .exclude(summary="").first())
            if same:
                document.content_hash = content_hash
                document.extracted_text = same.extracted_text
                document.summary = same.summary
                document.summary_status = ProcessingStatus.DONE
                document.save()
                threading.Thread(target=_course_after_upload_bg, args=(document.pk,), daemon=True).start()
                messages.success(request, "자료가 업로드되었습니다. 같은 자료의 요약을 바로 불러왔습니다.")
                return redirect(request.path)
            try:
                check_quota(request.user, "summary")
            except AIQuotaExceeded as exc:
                messages.error(request, f"자료를 올리지 못했습니다. {exc}")
                return redirect(request.path)
            document.content_hash = content_hash
            document.save()
            with document.file.open("rb") as fh:
                extracted_text = extract_text(fh, document.file.name, user=request.user)
            if detect_prompt_injection(extracted_text):
                document.summary_status = ProcessingStatus.FAILED
                document.save(update_fields=["summary_status"])
                messages.error(request, "업로드한 자료에서 프롬프트 인젝션으로 의심되는 내용이 발견되어 처리를 중단했습니다.")
                return redirect(request.path)
            document.extracted_text = extracted_text
            document.summary_status = ProcessingStatus.PROCESSING
            document.save(update_fields=["extracted_text", "summary_status"])
            threading.Thread(target=_generate_summary_bg, args=(document.pk,), daemon=True).start()
            messages.success(request, "자료가 업로드되었습니다. 요약은 잠시 후 생성됩니다.")
            return redirect(request.path)
        messages.error(request, "업로드에 실패했습니다. 파일 형식과 크기를 확인해주세요.")
    else:
        form = PersonalDocumentUploadForm(user=request.user)

    folders = PersonalFolder.objects.filter(user=request.user).annotate(
        doc_count=Count("documents", filter=Q(documents__is_deleted=False))
    )
    documents = PersonalDocument.objects.filter(user=request.user, folder=folder, is_deleted=False)
    return render(request, "mypage/list.html", {
        "documents": documents,
        "folders": folders,
        "current_folder": folder,
        "form": form,
        "folder_form": PersonalFolderForm(),
    })


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
def document_preview(request, pk):
    document = get_object_or_404(PersonalDocument, pk=pk, is_deleted=False)
    if document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 볼 수 있습니다.")

    is_pdf = document.file.name.lower().endswith(".pdf")
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
        "active_panel": active_panel,
        "current_questions": current_questions,
        "current_question": current_questions[q_index] if current_questions else None,
        "q_index": q_index,
        "max_questions": MAX_QUESTIONS,
        "question_types": GeneratedQuestion.QuestionType.choices,
        "has_pending_question": any(q.status == ProcessingStatus.PROCESSING for q in current_questions),
        "can_resummarize": _can_resummarize(document),
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
    threading.Thread(
        target=_generate_question_bg,
        args=(question.pk, document.extracted_text, question_type, existing_texts, request.user, existing_count),
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
    if document.summary_status == ProcessingStatus.FAILED:
        return True
    if document.summary_status == ProcessingStatus.PROCESSING:
        return document.pk not in _summarizing and document.uploaded_at < timezone.now() - STALE_AFTER
    return not document.summary.strip() or len(document.extracted_text) > SUMMARY_CHUNK_CHARS


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
    # 조건 확인과 상태 변경을 한 번에 해 두 번 눌러도 요약이 한 번만 시작되게 한다
    updated = PersonalDocument.objects.filter(pk=document.pk, summary_status=document.summary_status).update(
        extracted_text=text, summary_status=ProcessingStatus.PROCESSING)
    if updated and document.pk not in _summarizing:
        _summarizing.add(document.pk)
        threading.Thread(target=_generate_summary_bg, args=(document.pk,), daemon=True).start()
        messages.success(request, "요약을 다시 만들고 있습니다.")
    return back


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
