import json
from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import Friendship, Notification, User
from game.models import GostopRoom, GostopSeat, PokerChipWallet, YachtRoom, YachtSeat


class FriendTestCase(TestCase):
    def setUp(self):
        self.a = User.objects.create_user(username="a", password="x")
        self.b = User.objects.create_user(username="b", password="x")
        self.client.force_login(self.a)

    def post(self, path, payload, user=None):
        if user:
            self.client.force_login(user)
        return self.client.post(path, data=json.dumps(payload), content_type="application/json")

    def friends(self, user):
        self.client.force_login(user)
        return self.client.get("/accounts/friends/").json()

    def test_request_notifies_and_accept_makes_friends(self):
        res = self.post("/accounts/friends/request/", {"user_id": self.b.id})
        self.assertEqual(res.json()["status"], "pending")
        n = Notification.objects.get(recipient=self.b)
        self.assertEqual((n.notification_type, n.sender, n.link), ("friend_request", self.a, "/game/?friends=1"))
        self.assertEqual([u["user_id"] for u in self.friends(self.b)["incoming"]], [self.a.id])
        self.assertEqual([u["user_id"] for u in self.friends(self.a)["outgoing"]], [self.b.id])

        res = self.post("/accounts/friends/respond/", {"user_id": self.a.id, "accept": True}, user=self.b)
        self.assertEqual(res.json()["status"], "accepted")
        self.assertTrue(Notification.objects.filter(recipient=self.a, notification_type="friend_accept").exists())
        self.assertEqual([u["user_id"] for u in self.friends(self.a)["friends"]], [self.b.id])
        self.assertEqual([u["user_id"] for u in self.friends(self.b)["friends"]], [self.a.id])

    def test_mutual_request_accepts_and_duplicates_rejected(self):
        self.post("/accounts/friends/request/", {"user_id": self.b.id})
        self.assertEqual(self.post("/accounts/friends/request/", {"user_id": self.b.id}).status_code, 400)
        res = self.post("/accounts/friends/request/", {"user_id": self.a.id}, user=self.b)  # 상대도 요청하면 바로 친구
        self.assertEqual(res.json()["status"], "accepted")
        self.assertEqual(Friendship.objects.count(), 1)
        self.assertEqual(self.post("/accounts/friends/request/", {"user_id": self.b.id}, user=self.a).status_code, 400)

    def test_decline_cancel_and_remove(self):
        self.post("/accounts/friends/request/", {"user_id": self.b.id})
        self.post("/accounts/friends/respond/", {"user_id": self.a.id, "accept": False}, user=self.b)
        self.assertFalse(Friendship.objects.exists())

        self.post("/accounts/friends/request/", {"user_id": self.b.id}, user=self.a)
        self.post("/accounts/friends/remove/", {"user_id": self.b.id})  # 보낸 요청 취소
        self.assertFalse(Friendship.objects.exists())

        self.post("/accounts/friends/request/", {"user_id": self.b.id})
        self.post("/accounts/friends/respond/", {"user_id": self.a.id, "accept": True}, user=self.b)
        self.post("/accounts/friends/remove/", {"user_id": self.a.id}, user=self.b)  # 친구 삭제 (어느 쪽이든)
        self.assertFalse(Friendship.objects.exists())

    def test_cannot_friend_self_or_bot_or_cancel_received_request_via_remove(self):
        bot = User.objects.create_user(username="AI-1", password="x", is_bot=True)
        self.assertEqual(self.post("/accounts/friends/request/", {"user_id": self.a.id}).status_code, 400)
        self.assertEqual(self.post("/accounts/friends/request/", {"user_id": bot.id}).status_code, 400)
        self.post("/accounts/friends/request/", {"user_id": self.a.id}, user=self.b)
        self.assertEqual(self.post("/accounts/friends/remove/", {"user_id": self.b.id}, user=self.a).status_code, 400)
        self.assertTrue(Friendship.objects.exists())

    def test_notification_link_redirect_is_internal_only(self):
        ok = Notification.objects.create(recipient=self.a, notification_type="game_invite", message="m", link="/game/yacht/?room=3")
        bad = Notification.objects.create(recipient=self.a, notification_type="game_invite", message="m", link="//evil.com/")
        self.assertRedirects(self.client.get(f"/accounts/notifications/{ok.id}/read/"), "/game/yacht/?room=3",
                             fetch_redirect_response=False)
        self.assertNotIn("evil", self.client.get(f"/accounts/notifications/{bad.id}/read/")["Location"])


class GameInviteTestCase(TestCase):
    def setUp(self):
        self.a = User.objects.create_user(username="a", password="x")
        self.b = User.objects.create_user(username="b", password="x")
        Friendship.objects.create(from_user=self.a, to_user=self.b, status="accepted", accepted_at=timezone.now())
        self.client.force_login(self.a)

    def invite(self, game, user_id=None):
        return self.client.post("/game/invite/", data=json.dumps({"user_id": user_id or self.b.id, "game": game}),
                                content_type="application/json")

    def test_invite_requires_seat_and_friendship(self):
        self.assertEqual(self.invite("yacht").status_code, 400)  # 방에 없음
        room = YachtRoom.objects.create(capacity=2, stake=1000)
        YachtSeat.objects.create(room=room, user=self.a, seat=0)
        stranger = User.objects.create_user(username="c", password="x")
        self.assertEqual(self.invite("yacht", stranger.id).status_code, 400)  # 친구 아님

        res = self.invite("yacht")
        self.assertTrue(res.json()["ok"])
        n = Notification.objects.get(recipient=self.b, notification_type="game_invite")
        self.assertEqual(n.link, f"/game/yacht/?room={room.id}")
        self.assertIn(f"{room.id}번 방", n.message)
        self.assertEqual(self.invite("yacht").status_code, 400)  # 쿨다운

        Notification.objects.update(created_at=timezone.now() - timedelta(seconds=60))
        self.assertEqual(self.invite("yacht").status_code, 200)

    def test_gostop_invite_link(self):
        PokerChipWallet.objects.create(user=self.a, chips=0)
        room = GostopRoom.objects.create(mode="matgo")
        GostopSeat.objects.create(room=room, user=self.a, seat=0, stack=5000)
        self.assertTrue(self.invite("gostop").json()["ok"])
        n = Notification.objects.get(recipient=self.b)
        self.assertEqual(n.link, f"/game/gostop/?room={room.id}")
        self.assertIn("맞고", n.message)

    def test_pages_render_with_friends_panel(self):
        for path in ("/game/", "/game/gostop/", "/game/yacht/", "/game/poker/", "/game/apple-game/"):
            res = self.client.get(path)
            if res.status_code == 404:
                continue
            self.assertEqual(res.status_code, 200, path)
            self.assertContains(res, "FriendsPanel.mount", msg_prefix=path)
