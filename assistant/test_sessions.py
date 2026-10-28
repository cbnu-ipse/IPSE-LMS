import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from . import ai
from .models import ChatMessage, ChatSession

User = get_user_model()


def make_user(name):
    return User.objects.create_user(username=name, password="pw")


def reply_with(text):
    return patch("assistant.ai.core_ai.chat", return_value=type("R", (), {"choices": [type("C", (), {
        "message": type("M", (), {"content": text, "tool_calls": None, "model_dump": lambda self, exclude_none=True: {}})()})()]})())


class SessionModelTests(TestCase):
    def test_a_user_can_have_many_sessions_and_the_latest_used_comes_first(self):
        user = make_user("m1")
        a, b = ChatSession.objects.create(user=user, title="A"), ChatSession.objects.create(user=user, title="B")
        self.assertEqual(list(user.assistant_sessions.all()), [b, a])
        a.save()                                                                  # 쓰면 맨 위로
        self.assertEqual(list(user.assistant_sessions.all())[0], a)


class AnswerSessionTests(TestCase):
    def setUp(self):
        self.user = make_user("s1")

    def test_messages_go_to_the_given_session_and_first_question_becomes_the_title(self):
        first, second = ChatSession.objects.create(user=self.user), ChatSession.objects.create(user=self.user)
        with reply_with("답"):
            ai.answer(self.user, "운영체제 페이징이 뭐야? " + "길게 " * 30, session=first)
        self.assertEqual(first.messages.count(), 2)
        self.assertEqual(second.messages.count(), 0)                              # 다른 대화에는 섞이지 않는다
        first.refresh_from_db()
        self.assertTrue(first.title.startswith("운영체제 페이징이 뭐야?"))
        self.assertLessEqual(len(first.title), ai.TITLE_CHARS)

    def test_existing_title_is_kept_and_without_a_session_the_latest_one_is_used(self):
        old = ChatSession.objects.create(user=self.user, title="내가 정한 이름")
        newest = ChatSession.objects.create(user=self.user)
        with reply_with("답"):
            ai.answer(self.user, "질문 하나", session=old)
            ai.answer(self.user, "질문 둘")                                         # session 생략 → 가장 최근에 쓴 대화
        old.refresh_from_db()
        self.assertEqual(old.title, "내가 정한 이름")
        self.assertEqual(old.messages.count(), 4)                                  # 방금 쓴 대화가 가장 최근이라 둘째 질문도 거기로
        self.assertEqual(newest.messages.count(), 0)
        self.assertEqual(ChatSession.objects.filter(user=self.user).count(), 2)

    def test_the_context_only_uses_the_messages_of_that_session(self):
        a, b = ChatSession.objects.create(user=self.user), ChatSession.objects.create(user=self.user)
        ChatMessage.objects.create(session=a, role="user", content="A 대화의 비밀")
        sent = {}

        def capture(task, messages, **kwargs):
            sent["messages"] = messages
            return type("R", (), {"choices": [type("C", (), {"message": type("M", (), {"content": "ok", "tool_calls": None})()})()]})()

        with patch("assistant.ai.core_ai.chat", side_effect=capture):
            ai.answer(self.user, "B 대화의 질문", session=b)
        text = json.dumps(sent["messages"], ensure_ascii=False)
        self.assertIn("B 대화의 질문", text)
        self.assertNotIn("A 대화의 비밀", text)

    def test_new_session_reuses_an_empty_latest_one_and_prunes_old_ones(self):
        empty = ai.new_session(self.user)
        self.assertEqual(ai.new_session(self.user), empty)                         # 빈 대화가 쌓이지 않는다
        ChatMessage.objects.create(session=empty, role="user", content="x")
        for i in range(ai.MAX_SESSIONS + 3):
            s = ai.new_session(self.user)
            ChatMessage.objects.create(session=s, role="user", content=f"m{i}")
        self.assertEqual(ChatSession.objects.filter(user=self.user).count(), ai.MAX_SESSIONS)


class SessionViewTests(TestCase):
    def setUp(self):
        self.user = make_user("v1")
        self.other = make_user("v2")
        self.client.force_login(self.user)

    def post_json(self, url, data=None):
        return self.client.post(url, data=json.dumps(data or {}), content_type="application/json")

    def test_list_shows_only_my_sessions_newest_first(self):
        mine = [ChatSession.objects.create(user=self.user, title=t) for t in ("첫째", "둘째")]
        ChatSession.objects.create(user=self.other, title="남의 대화")
        data = self.client.get("/assistant/sessions/").json()
        self.assertEqual([s["title"] for s in data["sessions"]], ["둘째", "첫째"])
        self.assertEqual([s["id"] for s in data["sessions"]], [mine[1].pk, mine[0].pk])

    def test_create_makes_a_new_empty_session_or_reuses_the_empty_one(self):
        first = self.post_json("/assistant/sessions/new/").json()["session"]
        again = self.post_json("/assistant/sessions/new/").json()["session"]
        self.assertEqual(first["id"], again["id"])
        self.assertEqual(first["title"], "새 대화")
        ChatMessage.objects.create(session_id=first["id"], role="user", content="hi")
        third = self.post_json("/assistant/sessions/new/").json()["session"]
        self.assertNotEqual(third["id"], first["id"])

    def test_history_of_a_given_session_and_default_to_the_latest(self):
        a = ChatSession.objects.create(user=self.user, title="A")
        ChatMessage.objects.create(session=a, role="user", content="a-질문")
        b = ChatSession.objects.create(user=self.user, title="B")
        ChatMessage.objects.create(session=b, role="user", content="b-질문")
        data = self.client.get(f"/assistant/history/?session={a.pk}").json()
        self.assertEqual([m["content"] for m in data["messages"]], ["a-질문"])
        self.assertEqual(data["session"]["id"], a.pk)
        latest = self.client.get("/assistant/history/").json()
        self.assertEqual(latest["session"]["id"], b.pk)
        self.assertEqual(self.client.get("/assistant/history/?session=abc").status_code, 400)

    def test_history_with_no_sessions_is_empty(self):
        data = self.client.get("/assistant/history/").json()
        self.assertEqual((data["session"], data["messages"]), (None, []))

    def test_other_users_sessions_are_not_reachable(self):
        theirs = ChatSession.objects.create(user=self.other, title="비공개")
        ChatMessage.objects.create(session=theirs, role="user", content="비밀")
        self.assertEqual(self.client.get(f"/assistant/history/?session={theirs.pk}").status_code, 404)
        self.assertEqual(self.post_json(f"/assistant/sessions/{theirs.pk}/delete/").status_code, 404)
        self.assertEqual(self.post_json(f"/assistant/sessions/{theirs.pk}/rename/", {"title": "x"}).status_code, 404)
        with reply_with("답"):
            res = self.post_json("/assistant/message/", {"message": "안녕", "session_id": theirs.pk})
        self.assertEqual(res.status_code, 404)
        self.assertEqual(theirs.messages.count(), 1)                              # 남의 대화에는 아무것도 쓰이지 않는다

    def test_message_goes_to_the_chosen_session_and_returns_its_info(self):
        a = ChatSession.objects.create(user=self.user)
        b = ChatSession.objects.create(user=self.user)
        with reply_with("답변"):
            data = self.post_json("/assistant/message/", {"message": "첫 질문입니다", "session_id": a.pk}).json()
        self.assertEqual(data["reply"], "답변")
        self.assertEqual(data["session"]["id"], a.pk)
        self.assertEqual(data["session"]["title"], "첫 질문입니다")
        self.assertEqual((a.messages.count(), b.messages.count()), (2, 0))

    def test_message_without_a_session_id_still_works_for_old_clients(self):
        with reply_with("답변"):
            data = self.post_json("/assistant/message/", {"message": "안녕"}).json()
        self.assertEqual(ChatSession.objects.filter(user=self.user).count(), 1)
        self.assertEqual(data["session"]["id"], ChatSession.objects.get(user=self.user).pk)

    def test_bad_session_id_is_a_400(self):
        self.assertEqual(self.post_json("/assistant/message/", {"message": "안녕", "session_id": "abc"}).status_code, 400)

    def test_rename_and_delete(self):
        s = ChatSession.objects.create(user=self.user, title="옛 이름")
        data = self.post_json(f"/assistant/sessions/{s.pk}/rename/", {"title": "  새   이름  "}).json()
        self.assertEqual(data["session"]["title"], "새 이름")
        self.assertEqual(self.post_json(f"/assistant/sessions/{s.pk}/rename/", {"title": "   "}).status_code, 400)
        ChatMessage.objects.create(session=s, role="user", content="x")
        self.assertTrue(self.post_json(f"/assistant/sessions/{s.pk}/delete/").json()["ok"])
        self.assertFalse(ChatSession.objects.filter(pk=s.pk).exists())
        self.assertFalse(ChatMessage.objects.filter(session_id=s.pk).exists())     # 메시지도 함께 지워진다

    def test_endpoints_require_login_and_the_right_method(self):
        self.client.logout()
        for url in ("/assistant/sessions/", "/assistant/sessions/new/", "/assistant/history/"):
            self.assertEqual(self.client.get(url).status_code, 302)
        self.client.force_login(self.user)
        self.assertEqual(self.client.get("/assistant/sessions/new/").status_code, 405)

    def test_panel_markup_has_the_session_controls(self):
        html = self.client.get("/mypage/").content.decode()
        for marker in ('id="assistant-new-session-btn"', 'id="assistant-session-list-btn"', 'id="assistant-session-panel"',
                       'data-sessions-url="/assistant/sessions/"'):
            self.assertIn(marker, html)
