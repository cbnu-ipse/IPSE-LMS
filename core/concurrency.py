"""
한꺼번에 몰리는 요청이 서버와 AI 공급자를 눌러 버리지 않게 하는 동시 실행 상한.

- background_slots: AI를 부르는 백그라운드 작업(요약·분류·강의 초안·문제 생성)의 동시 실행 수. 업로드가 몰리면 스레드는 만들어지지만
  이 자리가 날 때까지 DB 연결도 열지 않고 기다린다 (그래서 DB 연결·API 호출 수가 상한을 넘지 않는다).
- extract_slots: 파일에서 글자를 뽑는 CPU 작업(PDF·PPT 변환)의 동시 실행 수. 파일을 고를 때(비용 계산)와 업로드할 때 모두 같은 자리를 쓴다.
상한은 설정(BACKGROUND_AI_CONCURRENCY, EXTRACT_CONCURRENCY)으로 바꾼다.
"""
import contextlib
import threading

from django.conf import settings

_slots = {}
_lock = threading.Lock()


def _semaphore(name, setting, default):
    with _lock:
        if name not in _slots:
            _slots[name] = threading.BoundedSemaphore(max(1, int(getattr(settings, setting, default))))
        return _slots[name]


@contextlib.contextmanager
def background_slot():
    sem = _semaphore("background", "BACKGROUND_AI_CONCURRENCY", 4)
    with sem:
        yield


@contextlib.contextmanager
def extract_slot(timeout=120):
    """글자 뽑기 자리. 오래 기다려도 안 나면 TimeoutError (요청이 영원히 붙잡히지 않게)."""
    sem = _semaphore("extract", "EXTRACT_CONCURRENCY", 2)
    if not sem.acquire(timeout=timeout):
        raise TimeoutError("서버가 바빠 파일을 읽지 못했습니다. 잠시 후 다시 시도해주세요.")
    try:
        yield
    finally:
        sem.release()


def reset_for_tests():
    with _lock:
        _slots.clear()
