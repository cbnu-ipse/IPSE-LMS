from django.core.management.base import BaseCommand

from mypage import doctype


class Command(BaseCommand):
    help = "확인된 자료(강의자가 올렸거나 '맞음'으로 검토된 것)의 특징으로 AI가 자료 구분(족보/수업 자료) 판단 규칙값을 다시 쓴다 (AI 호출 1번)"

    def handle(self, *args, **options):
        row = doctype.refresh_rules()
        if row is None:
            self.stdout.write(f"근거가 모자라 규칙을 바꾸지 않았습니다 (족보·수업 자료 각각 확인된 자료가 {doctype.MIN_SAMPLES_PER_TYPE}개 이상 필요).")
            return
        self.stdout.write(f"규칙을 새로 저장했습니다 (근거 자료 {row.sample_count}개): margin={row.rules['margin']}")
