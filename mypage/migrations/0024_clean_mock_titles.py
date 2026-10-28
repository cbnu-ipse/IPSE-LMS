from django.db import migrations


def clean(apps, schema_editor):
    """이미 만들어진 모의고사 제목(과 그 카드·게시글 제목)에서 '○○ 교수님 스타일' 같은 표현을 지운다."""
    from mypage.titles import clean_title

    MockExam = apps.get_model("mypage", "MockExam")
    PersonalDocument = apps.get_model("mypage", "PersonalDocument")
    SharedMaterial = apps.get_model("mypage", "SharedMaterial")
    CommunityPost = apps.get_model("community", "CommunityPost")
    for exam in MockExam.objects.all():
        doc = PersonalDocument.objects.filter(pk=exam.document_id).first() if exam.document_id else None
        fallback = f"{exam.course_code} 모의고사" if exam.course_code else "모의고사"
        new = clean_title(exam.title, fallback, [exam.style_label, doc.professor if doc else ""])
        if new == exam.title:
            continue
        MockExam.objects.filter(pk=exam.pk).update(title=new)
        if doc:
            PersonalDocument.objects.filter(pk=doc.pk).update(title=new[:200])
        for shared in SharedMaterial.objects.filter(kind="mock", source_key=f"mock:{exam.pk}"):
            post = CommunityPost.objects.get(pk=shared.post_id)
            SharedMaterial.objects.filter(pk=shared.pk).update(title=new[:200])
            CommunityPost.objects.filter(pk=post.pk).update(title=f"[모의고사] {new}"[:200], content=post.content.replace(exam.title, new, 1))


class Migration(migrations.Migration):
    dependencies = [("mypage", "0023_strip_ox_reason_requests")]
    operations = [migrations.RunPython(clean, migrations.RunPython.noop)]
