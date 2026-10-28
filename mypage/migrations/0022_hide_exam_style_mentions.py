import re

from django.db import migrations

STYLE_LINE = re.compile(r"(?m)^출제 스타일:.*\n?")


def scrub(apps, schema_editor):
    """이미 만들어진 모의고사 카드 요약과 게시판 글에 남은 '적용한 출제 스타일' 문구를 지운다 (화면에 드러내지 않기로 했다)."""
    MockExam = apps.get_model("mypage", "MockExam")
    PersonalDocument = apps.get_model("mypage", "PersonalDocument")
    SharedMaterial = apps.get_model("mypage", "SharedMaterial")
    CommunityPost = apps.get_model("community", "CommunityPost")
    for exam in MockExam.objects.exclude(style_label="").exclude(document__isnull=True):
        doc = PersonalDocument.objects.get(pk=exam.document_id)
        cleaned = doc.summary.replace(f" · {exam.style_label}", "")
        if cleaned != doc.summary:
            PersonalDocument.objects.filter(pk=doc.pk).update(summary=cleaned)
    for shared in SharedMaterial.objects.filter(kind="mock"):
        payload = dict(shared.payload or {})
        if "style_label" in payload:
            payload.pop("style_label")
            SharedMaterial.objects.filter(pk=shared.pk).update(payload=payload)
        post = CommunityPost.objects.get(pk=shared.post_id)
        cleaned = STYLE_LINE.sub("", post.content)
        if cleaned != post.content:
            CommunityPost.objects.filter(pk=post.pk).update(content=cleaned)


class Migration(migrations.Migration):
    dependencies = [("mypage", "0021_shared_material")]
    operations = [migrations.RunPython(scrub, migrations.RunPython.noop)]
