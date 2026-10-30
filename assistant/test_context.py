from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from . import ai
from .models import ChatMessage, ChatSession
from .test_sessions import reply_with

User = get_user_model()


def add(session, n):
    for i in range(n):
        ChatMessage.objects.create(session=session, role=["user", "assistant"][i % 2], content=f"m{i}")


class ContextStatusTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="c", password="pw")
        self.session = ChatSession.objects.create(user=self.user)

    def test_left_counts_question_answer_pairs_until_compaction(self):
        self.assertEqual(ai.context_status(self.session), {"used": 0, "limit": 40, "left": 20, "summarized": False})
        add(self.session, 30)
        self.assertEqual(ai.context_status(self.session)["left"], 5)
        add(self.session, 10)
        self.assertEqual(ai.context_status(self.session)["left"], 0)

    def test_payload_in_history_list_and_message_responses(self):
        self.client.force_login(self.user)
        add(self.session, 4)
        history = self.client.get(reverse("assistant:chat_history"), {"session": self.session.pk}).json()
        self.assertEqual(history["session"]["context"]["used"], 4)
        listed = self.client.get(reverse("assistant:sessions")).json()["sessions"][0]
        self.assertEqual(listed["context"]["left"], 18)
        with reply_with("답"):
            sent = self.client.post(reverse("assistant:chat_message"), {"message": "질문", "session_id": self.session.pk}, content_type="application/json").json()
        self.assertEqual(sent["session"]["context"]["used"], 6)


class UnansweredFollowUpTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="pw")
        self.session = ChatSession.objects.create(user=self.user)

    def system_prompt_of_next_answer(self):
        with reply_with("답") as chat:
            ai.answer(self.user, "왜 오류노", session=self.session)
        return chat.call_args.args[1][0]["content"]

    def test_prompt_mentions_the_failed_turn_after_an_unanswered_question(self):
        ChatMessage.objects.create(session=self.session, role="user", content="f(3y+1) 증명이 돼?")      # 오류로 답이 없는 질문
        self.assertIn("서버 오류로 답변이 저장되지 않았습니다", self.system_prompt_of_next_answer())

    def test_no_mention_when_the_previous_turn_was_answered(self):
        add(self.session, 2)
        self.assertNotIn("서버 오류", self.system_prompt_of_next_answer())
class ScreenContextTests(TestCase):
    PNG = ("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")

    def setUp(self):
        self.user = User.objects.create_user(username="sc", password="pw")
        self.session = ChatSession.objects.create(user=self.user)

    def test_screen_context_allows_longer_text_than_other_kinds(self):
        ctx = ai._clean_page_context({"kind": "screen", "title": "모의고사", "text": "가" * 5000})
        self.assertEqual(len(ctx["text"]), 5000)
        self.assertEqual(ctx["kind"], "현재 화면의 글")
        self.assertEqual(len(ai._clean_page_context({"kind": "summary", "text": "가" * 5000})["text"]), ai.PAGE_TEXT_CHARS)

    def test_clean_screenshot_accepts_real_images_only(self):
        self.assertEqual(ai.clean_screenshot(self.PNG), self.PNG)
        self.assertIsNone(ai.clean_screenshot("data:image/png;base64,AAAA"))
        self.assertIsNone(ai.clean_screenshot("data:text/html;base64,PGI+"))
        self.assertIsNone(ai.clean_screenshot(None))

    def test_screenshot_is_attached_to_the_last_user_message_only_for_this_call(self):
        with reply_with("답") as chat:
            ai.answer(self.user, "이 문제 풀이가 이해가 안 돼", session=self.session, screenshot=self.PNG)
        messages = chat.call_args.args[1]
        self.assertIn("스크린샷을 이번 메시지에 첨부", messages[0]["content"])
        content = messages[-1]["content"]
        self.assertEqual([part["type"] for part in content], ["text", "image_url"])
        self.assertEqual(self.session.messages.first().content, "이 문제 풀이가 이해가 안 돼")      # 저장되는 것은 글뿐
        with reply_with("답") as chat:
            ai.answer(self.user, "다음", session=self.session, screenshot="data:image/png;base64,AAAA")
        self.assertIsInstance(chat.call_args.args[1][-1]["content"], str)

    def test_screen_prompt_tells_the_model_it_can_see_the_screen(self):
        prompt = ai._page_context_prompt({"kind": "screen", "title": "모의고사", "text": "3번 문제 내용"})
        self.assertIn("화면을 볼 수 없다고 답하지 말고", prompt)
        self.assertNotIn("화면을 볼 수 없다고 답하지 말고", ai._page_context_prompt({"kind": "summary", "title": "t", "text": "요약"}))


class ScriptVersionTests(TestCase):
    def test_chat_script_is_versioned_so_browsers_do_not_keep_an_old_copy(self):
        user = User.objects.create_user(username="v", password="pw")
        self.client.force_login(user)
        html = self.client.get(reverse("mypage:document_list")).content.decode()
        self.assertRegex(html, r"js/assistant-chat\.js\?v=\d+")
