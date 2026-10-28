from django.db import migrations


def strip(apps, schema_editor):
    """이미 만들어진 OX 문제에서 '이유를 설명하시오' 같은 서술 요구 문장을 뗀다 (답을 쓸 칸이 없는 모순). 이미 채점한 시험은 건드리지 않는다."""
    from mypage.ai import REASON_REQUEST, strip_reason_request

    MockExam = apps.get_model("mypage", "MockExam")
    WrongNote = apps.get_model("mypage", "WrongNote")
    GeneratedQuestion = apps.get_model("mypage", "GeneratedQuestion")

    def fixed(question):
        if not isinstance(question, dict) or question.get("type") != "ox" or not REASON_REQUEST.search(str(question.get("q") or "")):
            return None
        text = strip_reason_request(question["q"])
        return {**question, "q": text} if text else None

    for exam in MockExam.objects.filter(submitted_at__isnull=True):
        questions, changed = [], False
        for q in exam.questions:
            new = fixed(q)
            questions.append(new or q)
            changed = changed or bool(new)
        if changed:
            MockExam.objects.filter(pk=exam.pk).update(questions=questions)
    for note in WrongNote.objects.all():
        new = fixed(note.question)
        if new:
            WrongNote.objects.filter(pk=note.pk).update(question=new)
    for q in GeneratedQuestion.objects.filter(question_type="ox"):
        if REASON_REQUEST.search(q.question_text or ""):
            text = strip_reason_request(q.question_text)
            if text:
                GeneratedQuestion.objects.filter(pk=q.pk).update(question_text=text)


class Migration(migrations.Migration):
    dependencies = [("mypage", "0022_hide_exam_style_mentions")]
    operations = [migrations.RunPython(strip, migrations.RunPython.noop)]
