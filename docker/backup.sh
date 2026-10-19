#!/bin/sh
# PostgreSQL 일일 백업 (db_backup 서비스에서 실행).
# - 기본 DB(DATABASE_URL)와 judge DB(JUDGE_DATABASE_URL)를 각각 pg_dump → gzip 해서 /backups 에 저장한다.
# - 매일 BACKUP_HOUR_UTC시(기본 19시 UTC = 새벽 04시 KST)에 실행하고, 시작할 때 최근 백업이 없으면 바로 한 번 만든다.
# - BACKUP_KEEP_DAYS(기본 14)일이 지난 백업은 지운다. 그 DB의 새 백업이 검증을 통과한 뒤에만 지운다.
# 복구 방법은 docker/BACKUP.md 참고.
set -u

BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_HOUR_UTC="${BACKUP_HOUR_UTC:-19}"
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"

log() { echo "[backup] $(date -u +%Y-%m-%dT%H:%M:%SZ) $*"; }

# dump_one <이름> <접속 URL>
dump_one() {
    name="$1"; url="$2"
    if [ -z "$url" ]; then
        log "WARN $name: 접속 URL이 없어 건너뜁니다"
        return 1
    fi
    out="$BACKUP_DIR/$name-$(date -u +%Y-%m-%d-%H%M).sql.gz"
    tmp="$out.tmp"
    # pipefail이 없는 sh라서 pg_dump 종료 코드는 파일 검증(gzip -t, 크기)으로 대신 확인한다
    if pg_dump --no-owner --clean --if-exists "$url" 2>"$tmp.err" | gzip > "$tmp" \
        && gzip -t "$tmp" && [ "$(gzip -dc "$tmp" | wc -c)" -gt 200 ] && ! grep -q "pg_dump: error" "$tmp.err"; then
        mv "$tmp" "$out"
        rm -f "$tmp.err"
        log "OK $name → $out ($(wc -c < "$out") bytes)"
        # 이 DB의 새 백업이 검증을 통과한 뒤에만 이 DB의 오래된 백업을 지운다 (계속 실패하는 동안 마지막 백업이 사라지지 않도록)
        find "$BACKUP_DIR" -name "$name-*.sql.gz" -mtime +"$BACKUP_KEEP_DAYS" -print -delete | sed 's/^/[backup] 삭제 /'
        return 0
    fi
    log "FAIL $name: $(tail -n 3 "$tmp.err" 2>/dev/null | tr '\n' ' ')"
    rm -f "$tmp" "$tmp.err"
    return 1
}

run_backup() {
    mkdir -p "$BACKUP_DIR"
    dump_one ipse_lms "${DATABASE_URL:-}"
    dump_one beta_judge "${JUDGE_DATABASE_URL:-}"
}

recent_backup_exists() {
    [ -n "$(find "$BACKUP_DIR" -name 'ipse_lms-*.sql.gz' -mmin -1440 2>/dev/null | head -n 1)" ]
}

seconds_until_next_run() {
    now=$(date -u +%s)
    today=$(date -u +%Y-%m-%d)
    target=$(date -u -d "$today ${BACKUP_HOUR_UTC}:00:00" +%s 2>/dev/null) || target=$((now - now % 86400 + BACKUP_HOUR_UTC * 3600))
    [ "$target" -le "$now" ] && target=$((target + 86400))
    echo $((target - now))
}

mkdir -p "$BACKUP_DIR"
if ! recent_backup_exists; then
    log "최근 24시간 안의 백업이 없어 먼저 한 번 만듭니다"
    run_backup
fi
while true; do
    wait_s=$(seconds_until_next_run)
    log "다음 백업까지 ${wait_s}초"
    sleep "$wait_s"
    run_backup
done
