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

from .ai import explain_ox_answer, extract_text, generate_one_question, generate_summary, grade_answer
from .forms import PersonalDocumentUploadForm, PersonalFolderForm
from .models import GeneratedQuestion, PersonalDocument, PersonalFolder, ProcessingStatus

logger = logging.getLogger(__name__)

MAX_QUESTIONS_PER_TYPE = 20
COURSE_DRAFT_THRESHOLD = 5


def _generate_summary_bg(document_id):
    try:
        document = PersonalDocument.objects.get(pk=document_id)
        summary = generate_summary(document.extracted_text)
        PersonalDocument.objects.filter(pk=document_id).update(summary=summary, summary_status=ProcessingStatus.DONE)
        _maybe_generate_course_bg(document.subject_code)
    except Exception:
        logger.exception("문서 %s 자동 요약 생성 실패", document_id)
        PersonalDocument.objects.filter(pk=document_id).update(summary_status=ProcessingStatus.FAILED)
    finally:
        connection.close()


def _maybe_generate_course_bg(subject_code):
    """같은 과목 코드로 요약이 완료된 자료가 threshold 이상 쌓이면 강의를 자동 생성/갱신한다.
    소프트 삭제된 자료도 요약 데이터 자체는 남아있으므로 누적 대상에 포함시켜, 매번 새 자료가
    쌓일 때마다(threshold 이상인 동안 계속) 강의 내용을 더 두텁게 갱신한다.
    ponytail: 동시 업로드 시 여러 스레드가 동시에 threshold를 넘겨 OpenAI 호출이 중복될 수 있음
    (Course.get_or_create로 DB 정합성 자체는 보장됨) — 트래픽이 문제될 때 락 추가."""
    if not subject_code:
        return
    docs = PersonalDocument.objects.filter(
        subject_code=subject_code,
        summary_status=ProcessingStatus.DONE,
        document_type=PersonalDocument.DocumentType.ASSIGNMENT,
    ).exclude(summary="")
    if docs.count() < COURSE_DRAFT_THRESHOLD:
        return
    try:
        from course.ai import generate_course_draft
        from course.services import sync_course_from_draft

        draft = generate_course_draft(subject_code, list(docs.values_list("summary", flat=True)))
        sync_course_from_draft(subject_code, draft)
    except Exception:
        logger.exception("%s 과목 강의 초안 생성 실패", subject_code)


def _generate_question_bg(question_id, extracted_text, question_type, existing_texts):
    try:
        q = generate_one_question(extracted_text, question_type, existing_questions=existing_texts)
        GeneratedQuestion.objects.filter(pk=question_id).update(
            question_text=q.get("question", ""), answer=q.get("answer", ""), status=ProcessingStatus.DONE,
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
        form = PersonalDocumentUploadForm(request.POST, request.FILES)
        if form.is_valid():
            document = form.save(commit=False)
            document.user = request.user
            document.folder = folder
            if not document.title:
                document.title = os.path.splitext(document.file.name)[0]
            document.save()
            with document.file.open("rb") as fh:
                extracted_text = extract_text(fh, document.file.name)
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
        form = PersonalDocumentUploadForm()

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
    valid_types = [c[0] for c in GeneratedQuestion.QuestionType.choices]
    active_tab = request.GET.get("tab", "ox")
    if active_tab not in valid_types:
        active_tab = "ox"
    active_panel = request.GET.get("panel", "summary")
    if active_panel not in ("summary", "quiz"):
        active_panel = "summary"

    tabs = [
        (q_type, label, list(document.questions.filter(question_type=q_type)))
        for q_type, label in GeneratedQuestion.QuestionType.choices
    ]
    current_questions = next(q for t, _, q in tabs if t == active_tab)
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
        "active_tab": active_tab,
        "tabs": tabs,
        "current_questions": current_questions,
        "current_question": current_questions[q_index] if current_questions else None,
        "q_index": q_index,
        "max_questions_per_type": MAX_QUESTIONS_PER_TYPE,
        "has_pending_question": any(q.status == ProcessingStatus.PROCESSING for q in current_questions),
    })


@login_required
@require_POST
def generate_question_view(request, pk, question_type):
    document = get_object_or_404(PersonalDocument, pk=pk, is_deleted=False)
    if document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 문제를 생성할 수 있습니다.")
    if question_type not in dict(GeneratedQuestion.QuestionType.choices):
        raise Http404("존재하지 않는 문제 유형입니다.")

    redirect_base = f"{document.get_absolute_url()}?panel=quiz&tab={question_type}"

    if not document.extracted_text.strip():
        messages.error(request, "문서에서 텍스트를 추출하지 못해 문제를 생성할 수 없습니다.")
        return redirect(redirect_base)

    existing_texts = list(
        document.questions.filter(question_type=question_type).values_list("question_text", flat=True)
    )
    if len(existing_texts) >= MAX_QUESTIONS_PER_TYPE:
        messages.error(request, f"이미 이 유형은 최대 {MAX_QUESTIONS_PER_TYPE}개까지 생성했습니다.")
        return redirect(redirect_base)

    question = GeneratedQuestion.objects.create(
        document=document,
        question_type=question_type,
        status=ProcessingStatus.PROCESSING,
    )
    threading.Thread(
        target=_generate_question_bg,
        args=(question.pk, document.extracted_text, question_type, existing_texts),
        daemon=True,
    ).start()

    messages.success(request, "문제를 생성하고 있습니다. 잠시 후 새로고침해주세요.")
    return redirect(f"{redirect_base}&q={len(existing_texts)}")


@login_required
@require_POST
def submit_answer_view(request, pk, question_id):
    question = get_object_or_404(GeneratedQuestion, pk=question_id, document_id=pk, document__is_deleted=False)
    if question.document.user != request.user:
        return HttpResponseForbidden("본인의 자료만 답을 제출할 수 있습니다.")

    redirect_base = f"{question.document.get_absolute_url()}?panel=quiz&tab={question.question_type}&q={request.GET.get('q', 0)}"

    if question.status != ProcessingStatus.DONE:
        messages.error(request, "문제를 아직 생성하고 있습니다. 잠시 후 다시 시도해주세요.")
        return redirect(redirect_base)

    user_answer = request.POST.get("user_answer", "").strip()
    if not user_answer:
        messages.error(request, "답을 입력해주세요.")
        return redirect(redirect_base)

    if question.question_type == GeneratedQuestion.QuestionType.OX:
        is_correct = user_answer.upper() == question.answer.strip().upper()
        feedback = ""
        if not is_correct:
            try:
                feedback = explain_ox_answer(question.question_text, question.answer)
            except Exception:
                logger.exception("문제 %s 해설 생성 실패", question.pk)
    else:
        try:
            result = grade_answer(question.question_text, question.answer, user_answer)
            is_correct, feedback = result["is_correct"], result["feedback"]
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
