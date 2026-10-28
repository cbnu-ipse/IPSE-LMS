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

    def test_header_shows_no_ai_gauge_and_no_candy_anywhere(self):
        use_up(self.user, 42)
        for url in ("/mypage/", "/game/", "/introduce/"):
            html = self.client.get(url).content.decode()
            self.assertNotIn("AI 42%", html)
            self.assertNotIn("AI 사용량 42", html)
            self.assertNotIn('title="할로윈 사탕"', html)
            self.assertNotIn("🍬 <span", html)

    def test_judge_header_keeps_only_bell_and_a_user_menu_outside(self):
        html = self.client.get("/mypage/").content.decode()
        self.assertIn('id="user-menu-btn"', html)
        outside = html.replace(self.menu(html), "")
        self.assertNotIn('title="낙엽 잔액"', outside)                         # 낙엽·재화 지급·로그아웃은 메뉴 안으로
        self.assertNotIn("openGrantModal()", outside)

    def test_menu_holds_profile_balance_site_links_and_logout(self):
        menu = self.menu(self.client.get("/mypage/").content.decode())
        for text in ("프로필", "낙엽", "IPSE 놀이터", "잎새 커뮤니티", "로그아웃", 'onclick="doLogout()"'):
            self.assertIn(text, menu)
        self.assertNotIn("IPSE Judge (학습)", menu)                             # 지금 있는 사이트로는 가는 링크를 두지 않는다
        self.assertNotIn("사탕", menu)
        self.assertNotIn("AI 사용량", menu)

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


class MobileMenuTests(TestCase):
    def mobile(self, html):
        start = html.index('id="mobile-menu"')
        return html[start:html.index("</nav>", start)]

    def test_judge_mobile_menu_has_icon_tiles_site_chips_and_a_short_list(self):
        user = User.objects.create_user(username="mm", password="pw")
        self.client.force_login(user)
        menu = self.mobile(self.client.get("/mypage/").content.decode())
        for label in ("학습", "문제", "대회", "랭킹", "개인", "내 학습"):
            self.assertIn(f"</i>{label}</a>", menu)                              # 한 줄짜리 긴 목록이 아니라 아이콘 타일
        self.assertNotIn("강의 생성", menu)                                       # 강의자·관리자만
        self.assertIn("다른 사이트", menu)
        self.assertIn("놀이터", menu)
        self.assertIn("잎새", menu)
        self.assertNotIn("</i>Judge</a>", menu)                                 # 지금 있는 사이트는 뺀다
        for text in ("소개", "알림", "로그아웃"):
            self.assertIn(text, menu)
        for gone in ("사탕", "AI 사용량", "← 잎새로 돌아가기"):
            self.assertNotIn(gone, menu)

    def test_staff_extras_only_for_the_right_people(self):
        lecturer = User.objects.create_user(username="ml", password="pw", is_lecturer=True)
        self.client.force_login(lecturer)
        self.assertIn("강의 생성", self.mobile(self.client.get("/mypage/").content.decode()))

    def test_anonymous_mobile_menu_offers_login_and_intro(self):
        menu = self.mobile(self.client.get("/introduce/").content.decode())
        self.assertIn("로그인", menu)
        self.assertIn("소개", menu)
        self.assertNotIn("알림", menu)


class IntroducePageTests(TestCase):
    def test_introduce_is_public_and_shows_the_updated_platform_content(self):
        res = self.client.get("/introduce/")
        self.assertEqual(res.status_code, 200)                                  # 로그인 없이 볼 수 있다
        html = res.content.decode()
        for text in ("자료를 올리면", "손글씨 A4 노트", "모의 출제", "OX · 객관식 · 단답형 · 서술형", "5개"):
            self.assertIn(text, html)
        self.assertNotIn("강의 콘텐츠 평균 최신화 주기", html)                      # 근거 없던 '7일/30일' 지표는 뺐다
        self.assertNotIn("신규 학습 트랙 평균 추가 주기", html)

    def test_open_recruitment_links_from_the_bottom_of_the_page(self):
        from datetime import timedelta

        from django.utils import timezone

        from community.models import RecruitmentForm

        owner = User.objects.create_user(username="own", password="pw")
        form = RecruitmentForm.objects.create(title="2026-2 신입 부원 모집", is_active=True, created_by=owner,
                                              closes_at=timezone.now() + timedelta(days=3))
        html = self.client.get("/introduce/").content.decode()
        self.assertIn('id="recruiting"', html)
        self.assertIn("2026-2 신입 부원 모집", html)
        self.assertIn(f'href="/recruit/{form.id}/"', html)
        self.assertGreater(html.index('id="recruiting"'), html.index("IPSE 학습을 시작해보세요"))    # 맨 아래 (마지막 CTA 뒤)

    def test_no_banner_when_nothing_is_open(self):
        from datetime import timedelta

        from django.utils import timezone

        from community.models import RecruitmentForm

        owner = User.objects.create_user(username="own2", password="pw")
        RecruitmentForm.objects.create(title="비활성", is_active=False, created_by=owner)
        RecruitmentForm.objects.create(title="마감됨", is_active=True, created_by=owner, closes_at=timezone.now() - timedelta(days=1))
        RecruitmentForm.objects.create(title="아직 안 열림", is_active=True, created_by=owner, opens_at=timezone.now() + timedelta(days=1))
        self.assertNotIn('id="recruiting"', self.client.get("/introduce/").content.decode())
