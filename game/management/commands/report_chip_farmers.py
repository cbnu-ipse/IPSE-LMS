"""칩 파밍(매크로·자동화) 의심 계정 리포트. 판단은 사람이 하도록 표만 보여 주고, 자동 제재는 하지 않는다.

기존 데이터만 쓴다 (스키마 변경 없음):
  - 낙엽 원장(LeafTransaction)의 POKER_BUYIN / POKER_CASHOUT → 기간 동안 칩으로 번 낙엽(환전 − 충전)
  - 원장 기록이 있는 '활동 시간대'(서로 다른 시각 수) → 사람은 보통 하루 8~12시간을 넘기기 어렵다
  - 포커 핸드 기록(PokerHandLog)의 승자 목록 → 이긴 핸드 수

  python manage.py report_chip_farmers --days 7 --top 20
"""
from collections import Counter, defaultdict
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import LeafTransaction
from game.models import PokerHandLog

NET_FLAG = 20000        # 기간 순수익(낙엽)이 이 이상이면 표시
HOURS_FLAG_PER_DAY = 14  # 하루 평균 활동 시간대가 이 이상이면 표시 (사람 한계 근처)


def collect(days):
    since = timezone.now() - timedelta(days=days)
    net, cashouts, hours = defaultdict(int), Counter(), defaultdict(set)
    names = {}
    ledger = (LeafTransaction.objects.filter(created_at__gte=since, transaction_type__in=("POKER_BUYIN", "POKER_CASHOUT"))
              .select_related("user"))
    for tx in ledger:
        names[tx.user_id] = tx.user.username
        net[tx.user_id] += tx.amount          # 충전은 음수, 환전은 양수 → 합이 곧 칩으로 번 낙엽
        hours[tx.user_id].add(tx.created_at.replace(minute=0, second=0, microsecond=0))
        if tx.transaction_type == "POKER_CASHOUT":
            cashouts[tx.user_id] += 1
    wins = Counter()
    for log in PokerHandLog.objects.filter(ended_at__gte=since).only("winners"):
        for w in log.winners or []:
            if w.get("username"):
                wins[w["username"]] += 1
    rows = []
    for uid, total in net.items():
        active_hours = len(hours[uid])
        rows.append({"user": names[uid], "net": total, "cashouts": cashouts[uid], "hours_per_day": active_hours / days,
                     "wins": wins.get(names[uid], 0),
                     "flags": [f for f, hit in (("순수익 큼", total >= NET_FLAG),
                                                ("활동 시간대 과다", active_hours / days >= HOURS_FLAG_PER_DAY)) if hit]})
    return sorted(rows, key=lambda r: r["net"], reverse=True)


class Command(BaseCommand):
    help = "칩 파밍(매크로) 의심 계정 리포트"

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=7)
        parser.add_argument("--top", type=int, default=20)

    def handle(self, *args, **opts):
        rows = collect(opts["days"])[:opts["top"]]
        self.stdout.write(f"최근 {opts['days']}일 포커 칩 → 낙엽 순수익 상위 {len(rows)}명 (환전 − 충전)")
        self.stdout.write(f"{'계정':<20}{'순수익':>10}{'환전횟수':>8}{'시간대/일':>10}{'이긴핸드':>8}  표시")
        for r in rows:
            self.stdout.write(f"{r['user']:<20}{r['net']:>10,}{r['cashouts']:>8}{r['hours_per_day']:>10.1f}{r['wins']:>8}  "
                              f"{', '.join(r['flags']) or '-'}")
