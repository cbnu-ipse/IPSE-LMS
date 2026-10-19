# 채점 실행기 — 제출 코드만 실행하는 최소 이미지 (judge_runner/runner.py, 표준 라이브러리만 사용)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN useradd --create-home --uid 10001 runner
WORKDIR /srv
COPY runner.py /srv/runner.py
USER runner
EXPOSE 8080
CMD ["python", "-I", "/srv/runner.py"]
