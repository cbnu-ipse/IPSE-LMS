import hashlib
import logging
import os
import threading

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import connection
from django.db.models import Count, Q
from django.http import Http404, HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from assistant.guardrails import detect_prompt_injection

from core.ai import AIQuotaExceeded, check_quota

from .ai import extract_text, generate_one_question, generate_summary, grade_answer
from .forms import PersonalDocumentUploadForm, PersonalFolderForm
from .models import GeneratedQuestion, PersonalDocument, PersonalFolder, ProcessingStatus

logger = logging.getLogger(__name__)

MAX_QUESTIONS = 20


def _generate_summary_bg(document_id):
    try:
        document = PersonalDocument.objects.select_related("user").get(pk=document_id)
        summary = generate_summary(document.extracted_text, user=document.user)
        PersonalDocument.objects.filter(pk=document_id).update(summary=summary, summary_status=ProcessingStatus.DONE)
    except Exception:
        logger.exception("문서 %s 자동 요약 생성 실패", document_id)
        PersonalDocument.objects.filter(pk=document_id).update(summary_status=ProcessingStatus.FAILED)
        connection.close()
        return
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


def _generate_question_bg(question_id, extracted_text, question_type, existing_texts, user=None):
    try:
        q = generate_one_question(extracted_text, question_type, existing_questions=existing_texts, user=user)
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
def document_preview(request, pk):
    document = get_object_or_404(PersonalDocument, pk=pk, is_deleted=False)
    if document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 볼 수 있습니다.")

    is_pdf = document.file.name.lower().endswith(".pdf")
    active_panel = request.GET.get("panel", "summary")
    if active_panel not in ("summary", "quiz"):
        active_panel = "summary"

    current_questions = list(document.questions.all())
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

    existing_count = document.questions.count()
    if existing_count >= MAX_QUESTIONS:
        messages.error(request, f"이미 최대 {MAX_QUESTIONS}개까지 생성했습니다.")
        return redirect(redirect_base)

    try:
        check_quota(request.user, "question")
    except AIQuotaExceeded as exc:
        messages.error(request, str(exc))
        return redirect(redirect_base)

    existing_texts = list(
        document.questions.filter(question_type=question_type).values_list("question_text", flat=True)
    )
    question = GeneratedQuestion.objects.create(
        document=document,
        question_type=question_type,
        status=ProcessingStatus.PROCESSING,
    )
    threading.Thread(
        target=_generate_question_bg,
        args=(question.pk, document.extracted_text, question_type, existing_texts, request.user),
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

    if question.status != ProcessingStatus.DONE:
        messages.error(request, "문제를 아직 생성하고 있습니다. 잠시 후 다시 시도해주세요.")
        return redirect(redirect_base)

    user_answer = request.POST.get("user_answer", "").strip()
    if not user_answer:
        messages.error(request, "답을 입력해주세요.")
        return redirect(redirect_base)

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
            messages.error(request, str(exc))
            return redirect(redirect_base)
        except Exception:
            logger.exception("문제 %s 채점 실패", question.pk)
            messages.error(request, "채점 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
            return redirect(redirect_base)

    question.user_answer = user_answer
    question.is_correct = is_correct
    question.feedback = feedback
    question.save(update_fields=["user_answer", "is_correct", "feedback"])
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
