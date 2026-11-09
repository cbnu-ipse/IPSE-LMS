# ==========================================
# Stage 1: builder — 의존성 설치 + Tailwind 빌드
# ==========================================
FROM python:3.12-slim AS builder

WORKDIR /app

# 시스템 의존성 (Pillow 빌드용)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements/base.txt requirements/base.txt
COPY requirements/production.txt requirements/production.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements/production.txt

# Tailwind 실행 파일(약 100MB) 준비.
# GitHub 릴리스 주소(익명 다운로드)가 504를 내면 빌드가 통째로 깨졌다. 토큰으로 받는 `gh release download`는 그때도 됐으므로,
# CI는 실행 파일을 미리 받아 docker/tailwind/ 에 둔다(.github/workflows/deploy.yml). 여기서는
#   ① 그 파일이 있으면 그대로 쓰고,
#   ② 없거나 이 플랫폼에서 안 돌면(로컬 `docker compose build` 등) pytailwindcss로 내려받는다 (버전 고정, 최대 10번 길게 다시 시도).
# templates/·static/을 복사하기 전에 끝내서 템플릿이 바뀔 때마다 다시 받지 않는다(캐시된 층).
RUN pip install --no-cache-dir pytailwindcss
ARG TAILWINDCSS_VERSION=v4.3.5
COPY docker/tailwind/ /tmp/tailwind/
RUN set -e; \
    if [ -f /tmp/tailwind/tailwindcss-linux-x64 ] \
       && install -m 0755 /tmp/tailwind/tailwindcss-linux-x64 /usr/local/bin/tailwindcss-bin \
       && /usr/local/bin/tailwindcss-bin --help > /dev/null 2>&1; then \
        echo ">>> using the Tailwind binary supplied by CI"; \
    else \
        for i in 1 2 3 4 5 6 7 8 9 10; do \
            python -c "import pytailwindcss; pytailwindcss.install('${TAILWINDCSS_VERSION}')" && break; \
            [ "$i" -eq 10 ] && exit 1; \
            echo "tailwind binary download failed (attempt $i), retrying..."; sleep $((i < 4 ? i * 15 : 60)); \
        done; \
        cp "$(python -c "from pytailwindcss.utils import get_bin_path; print(get_bin_path('${TAILWINDCSS_VERSION}'))")" /usr/local/bin/tailwindcss-bin; \
    fi; \
    rm -rf /tmp/tailwind
# templates/, static/ 전체 복사 후 빌드해야 Tailwind v4가 클래스 스캔 가능
COPY templates/ templates/
COPY static/ static/
RUN tailwindcss-bin -i static/src/input.css -o static/css/tailwind.css --minify

# ==========================================
# Stage 2: runtime — 최소 이미지
# ==========================================
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings

WORKDIR /app

# 런타임 시스템 의존성
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    cron \
    && rm -rf /var/lib/apt/lists/*

# builder에서 설치된 패키지 복사
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# 소스 코드 복사
COPY . .

# builder에서 빌드된 Tailwind CSS 덮어쓰기
COPY --from=builder /app/static/css/tailwind.css static/css/tailwind.css

# entrypoint 실행 권한 부여 및 Windows CRLF 개행문자 제거
RUN sed -i 's/\r$//' docker/entrypoint.sh && chmod +x docker/entrypoint.sh

# 게임 시즌 cron 작업 등록 (finalize_game_season, notify_season_ending)
RUN sed -i 's/\r$//' docker/crontab \
    && cp docker/crontab /etc/cron.d/game-season \
    && chmod 0644 /etc/cron.d/game-season

# media 볼륨 마운트 포인트
RUN mkdir -p /app/media /app/staticfiles

EXPOSE 8000

ENTRYPOINT ["docker/entrypoint.sh"]
