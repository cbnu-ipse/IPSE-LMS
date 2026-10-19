"""judge > 강의 생성 탭 (강의자 전용): AI 강의 초안 검토·미리보기·수정·승인. 로직은 course/studio.py."""
from urllib.parse import urlencode

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.http import Http404, HttpResponseForbidden, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from . import studio
from .models import Course, CourseDraft


def _studio_only(view):
    @login_required
    def wrapper(request, *args, **kwargs):
        if not studio.is_studio_user(request.user):
            return HttpResponseForbidden("강의자만 이용할 수 있습니다.")
        return view(request, *args, **kwargs)
    wrapper.__name__ = view.__name__
    return wrapper


@_studio_only
def studio_list(request):
    drafts = CourseDraft.objects.select_related("course", "created_by", "reviewed_by")
    topics, in_progress = studio.topic_overview()
    for t in topics:
        if t["pending"]:
            t["can_review"] = studio.can_review(request.user, t["pending"])
            chapters = t["pending"].content.get("chapters", [])
            t["chapter_count"] = len(chapters)
            t["set_count"] = sum(len(c.get("sets", [])) for c in chapters)
        if t["course"]:
            t["can_edit"] = request.user.is_superuser or t["course"].instructor_id == request.user.id
    return render(request, "course/studio_list.html", {
        "topics": topics, "in_progress_docs": in_progress,
        "history": drafts.exclude(status__in=[CourseDraft.Status.PENDING, CourseDraft.Status.GENERATING])[:20],
    })


@_studio_only
def studio_detail(request, pk):
    draft = get_object_or_404(CourseDraft.objects.select_related("course"), pk=pk)
    changed = studio.changed_chapters(draft) if draft.status == CourseDraft.Status.PENDING else None
    chapters = []
    for ci, chapter in enumerate(draft.content.get("chapters", [])):
        chapters.append({
            "index": ci, "title": chapter["title"], "summary": chapter.get("summary", ""),
            "reused": chapter.get("reused", False), "changed": changed is not None and ci in changed,
            "sets": [{"index": si, "title": s["title"], "cards": s["cards"],
                      "questions": [dict(q, options_text="\n".join(q.get("options", [])),
                                         answers_text=" / ".join(q.get("answers", [])))
                                    for q in s.get("questions", [])]}
                     for si, s in enumerate(chapter.get("sets", []))],
        })
    return render(request, "course/studio_detail.html", {
        "draft": draft, "chapters": chapters, "can_review": studio.can_review(request.user, draft),
        "editable": draft.status == CourseDraft.Status.PENDING and studio.can_review(request.user, draft),
        "has_changes": changed is None or bool(changed),
    })


def _draft_set(draft, ci, si):
    try:
        chapters = draft.content["chapters"]
        return chapters, chapters[ci], chapters[ci]["sets"][si]
    except (KeyError, IndexError):
        raise Http404("없는 학습 세트입니다.")


@_studio_only
def studio_preview(request, pk, ci, si):
    """학생이 보게 될 화면 그대로 미리 보기. 확인 문제도 풀 수 있지만 결과는 저장하지 않는다."""
    draft = get_object_or_404(CourseDraft, pk=pk)
    chapters, chapter, current = _draft_set(draft, ci, si)
    order = [(c, s) for c, ch in enumerate(chapters) for s in range(len(ch["sets"]))]
    pos = order.index((ci, si))

    def url(p):
        return f"/course/studio/{draft.pk}/preview/{order[p][0]}/{order[p][1]}/" if 0 <= p < len(order) else None

    return render(request, "course/set_player.html", {
        "mode": "preview", "course_title": draft.content.get("title", draft.subject_code),
        "chapter_no": ci + 1, "chapter_title": chapter["title"], "set_title": current["title"],
        "position": pos + 1, "total": len(order),
        "cards": studio.render_cards(current["cards"]), "questions": current.get("questions", []),
        "prev_url": url(pos - 1), "next_url": url(pos + 1), "exit_url": f"/course/studio/{draft.pk}/",
    })


def _int(request, name):
    try:
        return int(request.POST.get(name, ""))
    except ValueError:
        raise Http404


@require_POST
@_studio_only
def studio_action(request, pk, action):
    draft = get_object_or_404(CourseDraft, pk=pk)
    back = redirect("course_studio_detail", pk=draft.pk)
    if not studio.can_review(request.user, draft):
        messages.error(request, "이 초안을 처리할 권한이 없습니다. 기존 강의의 수정 초안은 담당 강의자만 처리합니다.")
        return back
    try:
        if action == "approve":
            course = studio.publish_draft(draft.pk, request.user)
            messages.success(request, f"'{course.title}' 강의를 게시했습니다.")
            if request.POST.get("next") == "studio":
                return redirect("course_studio")
            return redirect("course_detail", slug=course.slug)
        if action == "reject":
            studio.reject_draft(draft.pk, request.user, request.POST.get("note", ""))
            messages.success(request, "초안을 반려했습니다.")
            return redirect("course_studio")
        ci, si = _int(request, "chapter"), _int(request, "set")
        if action == "edit_card":
            studio.update_card(draft.pk, ci, si, _int(request, "item"), request.POST.get("title", ""),
                               request.POST.get("body", ""))
        elif action == "edit_question":
            studio.update_question(draft.pk, ci, si, _int(request, "item"), request.POST)
        elif action == "delete_question":
            studio.delete_question(draft.pk, ci, si, _int(request, "item"))
        else:
            raise Http404
        messages.success(request, "수정했습니다.")
    except (ValueError, PermissionError) as exc:
        messages.error(request, str(exc))
    return redirect(f"/course/studio/{draft.pk}/#set-{request.POST.get('chapter', '')}-{request.POST.get('set', '')}")


@require_POST
@_studio_only
def studio_start_edit(request, slug):
    course = get_object_or_404(Course, slug=slug)
    if not (request.user.is_superuser or course.instructor_id == request.user.id):
        return HttpResponseForbidden("담당 강의자만 수정 초안을 만들 수 있습니다.")
    draft = studio.start_edit_draft(course, request.user)
    messages.info(request, "수정 초안을 만들었습니다. 고친 뒤 승인해야 강의에 반영됩니다.")
    return redirect("course_studio_detail", pk=draft.pk)


@_studio_only
def studio_topic(request):
    """한 주제(?name=)에 어떤 자료가 있고, 어떻게 가공(요약)됐고, 어느 챕터에 쓰였는지."""
    name = request.GET.get("name", "")
    docs, draft, chapters = studio.topic_detail(name)
    course = Course.objects.filter(code=name).first()
    if not docs and not course:
        raise Http404("없는 주제입니다.")
    return render(request, "course/studio_topic.html", {
        "name": name, "docs": docs, "draft": draft, "chapters": chapters,
        "course": course, "can_publish": bool(draft and draft.status == CourseDraft.Status.PENDING
                                              and studio.can_review(request.user, draft)),
        "generating": CourseDraft.objects.filter(subject_code=name, status=CourseDraft.Status.GENERATING).exists(),
    })


@require_POST
@_studio_only
def studio_topic_build(request):
    """초안을 지금 만든다 (자료가 그대로면 AI를 부르지 않는다). 실패해서 멈춘 주제를 다시 시도할 때도 쓴다."""
    import threading

    from django.db import connection

    name = request.POST.get("name", "")

    def run():
        try:
            studio.build_draft(name)
        finally:
            connection.close()

    threading.Thread(target=run, daemon=True).start()
    messages.info(request, "초안 만들기를 시작했습니다. 잠시 뒤 강의 생성 화면에서 확인하세요.")
    return redirect("course_studio")


MATERIALS_PER_PAGE = 30


@_studio_only
def studio_materials(request):
    """모든 자료를 제목 목록으로 (주제 분류와 무관하게). 제목·요약·본문 검색, 필터, 삭제."""
    from mypage.models import PersonalDocument

    q = request.GET.get("q", "").strip()
    scope = request.GET.get("scope", "all")
    docs = PersonalDocument.objects.select_related("user").order_by("-uploaded_at")
    if q:
        docs = docs.filter(Q(title__icontains=q) | Q(summary__icontains=q) | Q(extracted_text__icontains=q))
    if scope == "unassigned":      # 주제가 없거나 강의 자료에서 제외된 자료 = 주제별 현황에 안 잡히는 자료
        docs = docs.filter(Q(subject_code="") | Q(is_course_material=False))
    elif scope == "deleted":       # 사용자가 지웠지만 강의 생성용으로 남아 있는 자료
        docs = docs.filter(is_deleted=True)
    page = Paginator(docs, MATERIALS_PER_PAGE).get_page(request.GET.get("page"))
    return render(request, "course/studio_materials.html", {
        "page": page, "q": q, "scope": scope, "total": page.paginator.count,
        "query": urlencode({"q": q, "scope": scope}),
    })


@require_POST
@_studio_only
def studio_material_delete(request, pk):
    """자료를 DB에서 완전히 지운다 (파일 포함). 사용자 화면의 소프트 삭제와 달리 되돌릴 수 없다."""
    from mypage.models import PersonalDocument

    doc = get_object_or_404(PersonalDocument, pk=pk)
    title = doc.title
    if doc.file:
        doc.file.delete(save=False)
    doc.delete()
    messages.success(request, f"'{title}' 자료를 삭제했습니다.")
    nxt = request.POST.get("next", "")
    return redirect(nxt if nxt.startswith("/course/studio/materials/") else "course_studio_materials")
