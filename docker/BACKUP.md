# DB 백업 / 복구

운영 서버에서 `db_backup` 서비스(`docker-compose.prod.yml`, 스크립트 `docker/backup.sh`)가 PostgreSQL을 매일 백업합니다.

- **언제**: 매일 새벽 04:00 KST(19:00 UTC). 서비스가 처음 뜰 때 최근 24시간 안의 백업이 없으면 바로 한 번 만듭니다.
- **무엇을**: 기본 DB(`ipse_lms`)와 judge DB(`beta_judge`)를 각각 `pg_dump` → gzip.
- **어디에**: 서버의 `./backups/postgres/` (compose 파일이 있는 폴더 기준). 파일 이름은 `ipse_lms-2026-10-19-1900.sql.gz` 형식입니다.
- **얼마나**: 14일이 지난 백업은 지웁니다. 그 DB의 새 백업이 성공한 뒤에만 지우므로, 백업이 계속 실패하는 동안 마지막 백업은 남습니다. 보관 일수는 서비스 환경변수 `BACKUP_KEEP_DAYS`, 실행 시각은 `BACKUP_HOUR_UTC`로 바꿉니다.
- **서버 디스크에만 있습니다.** 디스크가 고장나거나 서버가 도난·침수되면 백업도 함께 사라집니다. 가끔 `./backups/postgres/` 의 최신 파일을 다른 PC나 외장 디스크에 복사해 두세요.

## 적용 (처음 한 번)
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs db_backup   # [backup] OK ... 가 보이면 정상
ls backups/postgres
```

## 백업이 잘 도는지 확인
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail 20 db_backup
```
`OK` 줄이 매일 하나씩(DB마다) 생기면 정상입니다. `FAIL` 줄이 보이면 이유가 같이 적혀 있습니다.

## 복구
백업은 `--clean --if-exists` 로 만들어서, 복구하면 기존 테이블을 지우고 백업 시점으로 되돌립니다. **현재 데이터가 사라지므로** 복구 전에 지금 상태를 한 번 더 백업해 두세요.

```bash
# 1) 웹 서버를 멈춘다 (DB에 쓰는 쪽이 없게)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml stop web

# 2) 기본 DB 복구 (파일 이름은 실제 파일로 바꾼다)
gunzip -c backups/postgres/ipse_lms-2026-10-19-1900.sql.gz | \
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T db psql -U <POSTGRES_USER> -d ipse_lms

# 3) judge DB 복구
gunzip -c backups/postgres/beta_judge-2026-10-19-1900.sql.gz | \
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T db_judge psql -U <JUDGE_POSTGRES_USER> -d beta_judge

# 4) 웹 서버를 다시 켠다
docker-compose -f docker-compose.yml -f docker-compose.prod.yml start web
```
`<POSTGRES_USER>` 와 DB 이름은 `.env.docker` / `.env.judge.docker` 에 적힌 값입니다. 처음 한 번은 새 DB(또는 테스트 서버)에서 복구해 보며 절차를 연습해 두는 것을 권합니다.
