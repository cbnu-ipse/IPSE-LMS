from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from .testing import use_up

User = get_user_model()


@override_settings(AI_WEEKLY_LIMIT_POINTS=100)
class HeaderUserMenuTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="hm", password="pw")
        self.client.force_login(self.user)

    def menu(self, html):
        start = html.index('id="user-menu-container"')
        return html[start:html.index("</nav>", start)]

    def test_judge_header_keeps_only_bell_ai_gauge_and_a_user_menu_outside(self):
        use_up(self.user, 42)
        html = self.client.get("/mypage/").content.decode()
        self.assertIn('id="user-menu-btn"', html)
        self.assertIn("AI 42%", html)                                         # 게이지는 밖에 하나만
        self.assertNotIn('title="낙엽 잔액"', html.replace(self.menu(html), ""))   # 낙엽·재화 지급·로그아웃은 메뉴 안으로
        self.assertNotIn("openGrantModal()", html.replace(self.menu(html), ""))

    def test_menu_holds_profile_balances_usage_site_links_and_logout(self):
        use_up(self.user, 42)
        menu = self.menu(self.client.get("/mypage/").content.decode())
        for text in ("프로필", "낙엽", "이번 주 AI 사용량", "IPSE 놀이터", "잎새 커뮤니티", "로그아웃", 'onclick="doLogout()"'):
            self.assertIn(text, menu)
        self.assertNotIn("IPSE Judge (학습)", menu)                             # 지금 있는 사이트로는 가는 링크를 두지 않는다

    def test_site_links_exclude_the_current_site(self):
        menu = self.menu(self.client.get("/game/").content.decode())
        self.assertNotIn("IPSE 놀이터", menu)
        self.assertIn("IPSE Judge (학습)", menu)
        self.assertIn("잎새 커뮤니티", menu)

    def test_grant_button_only_for_people_who_can_grant(self):
        self.assertNotIn("재화 지급", self.menu(self.client.get("/mypage/").content.decode()))
        boss = User.objects.create_user(username="boss", password="pw", is_superuser=True)
        self.client.force_login(boss)
        self.assertIn("재화 지급", self.menu(self.client.get("/mypage/").content.decode()))

    def test_anonymous_visitors_still_get_the_login_button_and_site_shortcuts(self):
        self.client.logout()
        html = self.client.get("/introduce/").content.decode()
        self.assertNotIn('id="user-menu-btn"', html)
        self.assertIn("로그인", html)
