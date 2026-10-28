from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.http import require_POST

from . import sharing
from .models import MockExam, PersonalDocument, SharedMaterial


def _shared_json(request, material, created):
    url = request.build_absolute_uri(sharing.post_path(material))
    return JsonResponse({"ok": True, "url": url, "created": created})


@login_required
@require_POST
def share_note(request, pk):
    """속성 노트를 자유게시판에 올리고 게시글 주소를 돌려준다 (이미 올렸으면 기존 글)."""
    note = get_object_or_404(PersonalDocument, pk=pk, is_deleted=False)
    try:
        material, created = sharing.share_note(request.user, note)
    except sharing.ShareError as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)
    return _shared_json(request, material, created)


@login_required
@require_POST
def share_mock(request, pk):
    exam = get_object_or_404(MockExam, pk=pk)
    try:
        material, created = sharing.share_mock(request.user, exam)
    except sharing.ShareError as exc:
        return JsonResponse({"ok": False, "error": str(exc)}, status=400)
    return _shared_json(request, material, created)


@login_required
@require_POST
def shared_import(request, pk):
    """게시글의 속성 노트·모의고사를 내 자료로 불러온다."""
    material = get_object_or_404(SharedMaterial.objects.select_related("post", "author"), pk=pk)
    back = redirect(sharing.post_path(material))
    try:
        document, created = sharing.import_material(request.user, material)
    except sharing.ShareError as exc:
        messages.error(request, str(exc))
        return back
    messages.success(request, "내 자료로 불러왔어요." if created else "이미 불러온 자료예요.")
    return redirect(document.get_absolute_url() if hasattr(document, "get_absolute_url") else "mypage:document_list")
