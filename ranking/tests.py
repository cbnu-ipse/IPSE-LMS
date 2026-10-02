from django.test import TestCase

from accounts.models import User
from game.models import POKER_CHIPS_PER_LEAF, GostopRoom, GostopSeat, PokerChipWallet, PokerTable


class LeavesRankingIncludesChipsTestCase(TestCase):
    """낙엽 랭킹은 보유 칩(지갑 + 포커 좌석 스택 + 고스톱 좌석 스택)을 낙엽으로 환전했다고 가정해 합산한다."""

    def test_chips_are_counted_as_leaves(self):
        table = PokerTable.create_with_seats("intermediate")
        viewer = User.objects.create_user(username="viewer", password="x")
        leaves_only = User.objects.create_user(username="a_leaves", password="x", leaves=3)
        chips_holder = User.objects.create_user(username="b_chips", password="x", leaves=1)
        PokerChipWallet.objects.create(user=chips_holder, chips=2 * POKER_CHIPS_PER_LEAF + 999)
        seat = table.seats.get(seat_number=0)
        seat.user, seat.stack = chips_holder, POKER_CHIPS_PER_LEAF
        seat.save()
        GostopSeat.objects.create(room=GostopRoom.objects.create(), user=leaves_only, seat=0, stack=POKER_CHIPS_PER_LEAF)

        self.client.force_login(viewer)
        res = self.client.get("/ranking/community/?board=leaves")

        scores = {r["user"].username: r["score"] for r in res.context["ranking_rows"]}
        # 1낙엽 + 지갑 2999칩(→2) + 좌석 1000칩(→1) = 4, 1낙엽 미만 칩은 버림
        # a_leaves: 3낙엽 + 고스톱 좌석 스택 1000칩(→1) = 4
        self.assertEqual(scores, {"a_leaves": 4, "b_chips": 4})
