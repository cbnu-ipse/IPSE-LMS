from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import User
from . import poker_engine
from .models import PokerSeat, PokerTable
from .poker_engine import evaluate_best_of_7, _build_side_pots


class PokerHandEvaluatorTestCase(TestCase):
    """카드 평가 로직이 표준 포커 족보 순서를 지키는지 확인 (money path 핵심 로직)."""

    def test_category_ordering(self):
        royal_flush = evaluate_best_of_7(["AS", "KS", "QS", "JS", "TS", "2H", "3D"])
        straight_flush = evaluate_best_of_7(["9S", "8S", "7S", "6S", "5S", "2H", "3D"])
        four_kind = evaluate_best_of_7(["AS", "AH", "AD", "AC", "2H", "3D", "4C"])
        full_house = evaluate_best_of_7(["AS", "AH", "AD", "2C", "2H", "3D", "4C"])
        flush = evaluate_best_of_7(["AS", "KS", "9S", "5S", "2S", "2H", "3D"])
        straight = evaluate_best_of_7(["9S", "8H", "7D", "6C", "5S", "2H", "3D"])
        # 주의: 키커에 5-4-3-2를 함께 넣으면 A와 묶여 휠 스트레이트(A-2-3-4-5)가
        # 숨어버려 트리플/투페어/원페어보다 강하게 평가된다. 아래 키커들은 그런
        # 5연속 조합이 생기지 않도록 골랐다.
        trips = evaluate_best_of_7(["AS", "AH", "AD", "9C", "7H", "4D", "2C"])
        two_pair = evaluate_best_of_7(["AS", "AH", "5D", "5C", "9H", "7D", "2C"])
        one_pair = evaluate_best_of_7(["AS", "AH", "9D", "7C", "2H", "3D", "4C"])
        high_card = evaluate_best_of_7(["AS", "KH", "9D", "5C", "2H", "3D", "7C"])

        ordering = [
            high_card, one_pair, two_pair, trips, straight,
            flush, full_house, four_kind, straight_flush, royal_flush,
        ]
        for weaker, stronger in zip(ordering, ordering[1:]):
            self.assertLess(weaker, stronger)

    def test_wheel_straight_is_five_high(self):
        wheel = evaluate_best_of_7(["AS", "2H", "3D", "4C", "5S", "9H", "KD"])
        six_high = evaluate_best_of_7(["6S", "2H", "3D", "4C", "5S", "9H", "KD"])
        self.assertEqual(wheel[0], 4)   # 스트레이트 카테고리
        self.assertEqual(wheel[1], 5)   # 하이카드는 5 (A는 최하위 취급)
        self.assertLess(wheel, six_high)


class PokerSidePotTestCase(TestCase):
    """짧은 스택 올인이 섞였을 때 사이드팟이 정확히 나뉘는지 확인."""

    def test_uneven_all_ins_split_into_side_pots(self):
        # A: 50 올인, B: 150 올인, C: 150 콜 (전부 컨트리뷰션 == 최종 상태)
        a = PokerSeat(seat_number=0, contributed_total=50, status="all_in")
        b = PokerSeat(seat_number=1, contributed_total=150, status="all_in")
        c = PokerSeat(seat_number=2, contributed_total=150, status="active")

        pots = _build_side_pots([a, b, c])

        self.assertEqual(len(pots), 2)
        main_pot, side_pot = pots
        self.assertEqual(main_pot["amount"], 150)  # 50 * 3명
        self.assertEqual({s.seat_number for s in main_pot["eligible"]}, {0, 1, 2})
        self.assertEqual(side_pot["amount"], 200)  # (150-50) * 2명
        self.assertEqual({s.seat_number for s in side_pot["eligible"]}, {1, 2})

    def test_folded_contribution_stays_in_pot_but_not_eligible(self):
        a = PokerSeat(seat_number=0, contributed_total=100, status="folded")
        b = PokerSeat(seat_number=1, contributed_total=100, status="active")

        pots = _build_side_pots([a, b])

        self.assertEqual(len(pots), 1)
        self.assertEqual(pots[0]["amount"], 200)
        self.assertEqual({s.seat_number for s in pots[0]["eligible"]}, {1})


class PokerNextHandSchedulingTestCase(TestCase):
    """회귀 테스트: 핸드가 끝나도 table.status가 'playing'에 남아있으면
    next_deadline_at()/process_due_deadlines()가 next_hand_at을 절대 보지 않아
    "카운트다운은 뜨는데 다음 핸드가 시작을 안 함" 상태로 영원히 멈췄던 버그."""

    def _seat_two_active_players(self):
        table = PokerTable.get_solo()
        u1 = User.objects.create_user(username="p1", password="x")
        u2 = User.objects.create_user(username="p2", password="x")
        seats = {s.seat_number: s for s in table.seats.all()}
        s0, s1 = seats[0], seats[1]
        s0.user, s0.stack, s0.status, s0.contributed_total = u1, 19000, "active", 1000
        s0.hole_cards = ["AS", "KS"]
        s1.user, s1.stack, s1.status, s1.contributed_total = u2, 19000, "active", 1000
        s1.hole_cards = ["2H", "3D"]
        s0.save()
        s1.save()
        table.status = "playing"
        table.round = "river"
        table.pot = 2000
        table.dealer_seat = 0
        table.community_cards = ["4C", "5C", "6C", "7H", "9D"]
        table.save()
        return table, {0: s0, 1: s1}

    def test_finish_hand_with_two_remaining_marks_table_waiting(self):
        table, seats_by_number = self._seat_two_active_players()

        poker_engine._finish_hand(table, seats_by_number)

        table.refresh_from_db()
        self.assertEqual(table.status, "waiting")
        self.assertIsNotNone(table.next_hand_at)

    def test_process_due_deadlines_deals_next_hand_once_due(self):
        table, seats_by_number = self._seat_two_active_players()
        poker_engine._finish_hand(table, seats_by_number)

        table.refresh_from_db()
        table.next_hand_at = timezone.now() - timedelta(seconds=1)
        table.save()

        poker_engine.process_due_deadlines()

        table.refresh_from_db()
        self.assertEqual(table.status, "playing")
        self.assertEqual(table.round, "preflop")
        self.assertEqual(table.hand_number, 1)
