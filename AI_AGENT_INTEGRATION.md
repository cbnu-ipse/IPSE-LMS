# AI Agent 모듈 연동 가이드 (StudyNest Agent)

계절학기 과제로 만든 학습 콘텐츠 자동화 Agent(요약/문제생성/강의초안 생성)를 IPSE-LMS 실제
서비스에 연동하기 위한 환경설정·테스트 방법을 정리한 문서. Agent의 발표 자료·대본·프로토타입
코드 자체는 별도 저장소인 `yhw_agent_project/`(IPSE-LMS와 무관한 독립 git 저장소, 추후 Gitea로
이전)에 있으며, 이 문서는 그 프로젝트가 향후 LMS 전체에 적용될 것을 대비해 **LMS 쪽에 남아야
하는 실행/환경 지식만** 분리해 둔 것이다.

## 1. 실행 환경

Agent 프로토타입은 Django 앱과 별개의 Python venv(`yhw_agent_project/prototype/.venv`)에서
LangChain/LangGraph로 동작한다.

```bash
cd yhw_agent_project/prototype
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 아래 2번 항목대로 값 채우기
python -m src.cli demo --reset
```

## 2. `.env` 항목 설명

`yhw_agent_project/prototype/.env`(gitignore 처리, 실제 값은 미커밋)에 필요한 값:

| 변수 | 용도 |
|---|---|
| `PGVECTOR_HOST` / `PORT` / `DB` / `USER` / `PASSWORD` | 랩 pgvector DB(`lab.studynest.kr:45432`) 접속 정보 |
| `OPENAI_API_KEY` | 임베딩·요약·문제생성·강의초안 생성에 사용하는 OpenAI 키 |
| `EMBEDDING_MODEL` | 기본 `text-embedding-3-small` |
| `CHAT_MODEL` | 기본 `gpt-5.5` (모델 ID는 점 표기, 하이픈 아님 — 계정에 노출된 실제 모델명으로 API 조회 확인함) |
| `TOPIC_THRESHOLD` | 같은 과목 코드로 자료가 몇 건 쌓이면 강의 초안을 생성할지 |
| `VLLM_BASE_URL` / `VLLM_API_KEY` / `VLLM_MODEL` | 랩 자체 호스팅 vLLM(OpenAI 호환 REST) — OpenAI 장애/비용 이슈 시 `ChatOpenAI(base_url=...)` 교체만으로 대체 가능한 옵션 |

이 프로젝트가 다루는 API 키는 절대 커밋하지 않는다 — `prototype/.env`는 gitignore 대상이고,
`.env.example`에는 값이 채워지지 않은 키 이름만 남긴다.

## 3. 테스트 방법

- **API/DB 없이 순수 로직만 검증**: `python yhw_agent_project/prototype/tests/test_pipeline.py`
  (청크 분할, 임계치 판단 등 로직만 확인, 비용 발생 없음)
- **전체 파이프라인 e2e**: `python -m src.cli demo --reset` — 실제 OpenAI API·lab pgvector DB를
  호출하므로 비용이 발생한다. `demo_data/`의 샘플 2건(과목 `CS201`)으로 업로드→가드레일→청크
  분할→임베딩→요약→문제생성→(임계치 도달 시) 강의 초안 생성→HITL 승인까지 실행된다.
- **vLLM 연동 검증**: `python -m src.cli vllm-check` — 동일 가드레일로 감싼 상태에서 OpenAI가
  아닌 vLLM 서버 호출이 성공하는지 확인.

## 4. 실제 LMS DB 연동

승인(HITL 통과)된 강의 초안을 실제 Django `course.Course`/`Unit`/`Lesson`에 반영하는 경로가
두 가지 있다 — 용도가 다르니 혼동하지 않는다.

- **`yhw_agent_project/prototype/sync_course_drafts.py`**: 과제 제출/채점용 프로토타입 데모
  스크립트. 운영 DB를 실수로 건드리지 않도록 `DATABASE_URL`을 스크립트 안에서 강제로 비워
  항상 로컬 `db.sqlite3`에만 반영한다(개발자 로컬 검증용).
- **`course/management/commands/sync_course_drafts.py`**: IPSE-LMS 본체 저장소에 커밋된
  **실제 운영 반영용** Django 관리 명령어. 별도 안전장치 없이 Django 설정(`DATABASE_URL`)에
  연결된 DB에 그대로 반영한다 — 즉 서버에서 실행하면 운영 DB에 실제로 쓰인다.

```bash
# 실제 운영 반영
cd IPSE-LMS && source .venv/bin/activate
python manage.py sync_course_drafts

# 로컬 검증만 하고 싶을 때 (운영 DB에 절대 안 씀)
DATABASE_URL="" python manage.py sync_course_drafts
```

두 스크립트 모두 `yhw_agent_project/prototype/output/review_queue.json`(사람이 이미 승인한
항목만)을 읽는다 — 서버에는 `yhw_agent_project`도 함께 체크아웃되어 있어야 이 파일을 읽을 수
있다. 과목 코드(`code`)를 키로 `get_or_create` 후 매번 해당 Course의 Unit/Lesson을 지우고
최신 승인 초안으로 다시 생성하는 멱등적 upsert이므로 여러 번 실행해도 중복 생성되지 않는다
(로컬 sqlite로 재실행 검증 완료: Course 1개, Unit 3개, Lesson 9개 유지).

## 5. 알려진 이슈

- `course/utils.py`의 `unique_slug_generator()`가 `slugify()`를 `allow_unicode=True` 없이
  호출하고 있어, 제목이 전부 한글인 `Course`는 `slug`가 빈 문자열로 저장된다(예:
  `기초 자료구조: 스택·큐·트리·그래프` → 빈 slug). AI가 생성한 강의뿐 아니라 한글 제목의
  일반 강의 전체에 해당하는 기존 버그이며, 공용 코드라 별도 확인 후 수정이 필요하다.

## 6. 향후 계획

- Phase 2: 위 sync 스크립트를 관리 화면(운영진 승인 후 자동 반영)으로 확장, quiz 앱과의 결합
  (OX→`MCQuestion`, 주관식→`EssayQuestion`, 단답형은 신규 서브클래스 제안).
- Phase 3~4: 일부 동아리원 대상 시범 운영 후 정식 확대. 상세 로드맵은
  `yhw_agent_project/slides/slides.pptx`의 Delivery 설계 참고.
