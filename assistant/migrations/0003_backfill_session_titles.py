from django.db import migrations


def backfill(apps, schema_editor):
    """대화가 하나뿐이던 시절의 기록에 제목(첫 질문 앞부분)을 붙인다."""
    ChatSession = apps.get_model("assistant", "ChatSession")
    ChatMessage = apps.get_model("assistant", "ChatMessage")
    for session in ChatSession.objects.filter(title=""):
        first = ChatMessage.objects.filter(session=session, role="user").order_by("created_at", "id").first()
        if first:
            session.title = " ".join(first.content.split())[:30]
            session.save(update_fields=["title"])


class Migration(migrations.Migration):
    dependencies = [("assistant", "0002_chat_sessions")]
    operations = [migrations.RunPython(backfill, migrations.RunPython.noop)]
