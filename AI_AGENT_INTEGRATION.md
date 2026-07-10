# AI Agent 연동 기술 문서 (StudyNest Agent)

`yhw_agent_project/`(계절학기 과제로 만든 AI Agent, IPSE-LMS와 무관한 독립 git 저장소)에서
설계·검증한 것을 IPSE-LMS 실서비스에 **어떻게** 반영했는지 정리한 문서다.
`yhw_agent_project/README.md`가 이 문서를 가리키고 있으며, 저 폴더 내부 코드에 대한 설명은 그쪽에
있다. 이 문서는 반대로 **IPSE-LMS 저장소 자체에 실제로 존재하는 코드**만 다룬다.

## 1. 전체 그림

`yhw_agent_project/prototype/`은 LangChain/LangGraph/pgvector로 파이프라인 로직이 동작하는지
증명하는 역할로 끝났다. IPSE-LMS에는 그 코드를 그대로 옮기지 않고, 기존 컨벤션(Django 동기 뷰 +
`threading.Thread`로 LLM 호출만 비동기화, 순수 OpenAI 호출)에 맞춰 훨씬 단순하게 새로 구현했다.
LangGraph·pgvector·벡터 검색·RAG는 **IPSE-LMS 본체 어디에도 없다** — 아래 2절에서 앱별로 실제
코드를 정리한다.

관련 앱: `mypage`(자료 업로드·요약·문제생성·강의 생성 트리거), `course`(강의 초안 생성·반영),
`assistant`(FAB 챗봇).

## 2. 앱별 코드 인벤토리

### 2.1 `mypage` — 자료 업로드 → 요약/문제 생성 → 강의 생성 트리거

- **`mypage/models.py`**: `PersonalDocument`(업로드 파일, `subject_code`, `summary`,
  `summary_status`, `is_deleted` 소프트 삭제 플래그), `PersonalFolder`, `GeneratedQuestion`
  (OX/단답/서술형, `status` 진행 상태).
- **`mypage/ai.py`**: 순수 OpenAI 호출 4개 —
  - `extract_text(file_obj, filename)`: pypdf/python-docx/python-pptx로 텍스트 추출(실패 시 빈 문자열).
  - `generate_summary(extracted_text)`: 구조화된 장문 요약 생성.
  - `generate_one_question(extracted_text, question_type, existing_questions)`: OX/단답/서술형
    문제 1개를 JSON 모드(`response_format={"type": "json_object"}`)로 생성.
  - `explain_ox_answer`, `grade_answer`: 오답 해설/서술형 채점.
  - 가드레일·RAG·벡터 검색 없음 — 방금 업로드된 문서의 원문(`extracted_text[:8000]`)을 그대로
    프롬프트에 넣는 단발성 생성이다.
- **`mypage/views.py`**:
  - `document_list`: 업로드 처리 후 `threading.Thread(target=_generate_summary_bg, ...)`로
    요약 생성을 백그라운드로 돌린다(블로킹 방지).
  - `_generate_summary_bg(document_id)`: 요약 생성 → `PersonalDocument` 업데이트 →
    `_maybe_generate_course_bg(document.subject_code)` 호출.
  - `_maybe_generate_course_bg(subject_code)`: 같은 `subject_code`로 요약이 끝난(`is_deleted=False`,
    `summary_status=DONE`, `summary` 비어있지 않은) 문서가 `COURSE_DRAFT_THRESHOLD = 3`건 이상이면
    `course.ai.generate_course_draft` → `course.services.sync_course_from_draft` 순으로 호출.
    실패해도 예외를 로그로만 남기고 업로드 자체는 성공 응답을 유지한다(`ponytail` 주석 참고 —
    동시 업로드 시 threshold를 여러 스레드가 동시에 넘겨 OpenAI 호출이 중복될 수 있음, DB 정합성은
    `Course.get_or_create`가 보장하므로 트래픽이 실제 문제될 때 락 추가 예정).
  - `document_delete`: 실제 삭제 대신 `is_deleted=True`만 저장(소프트 삭제) — 사용자 화면에서는
    사라지지만 요약/원문은 그대로 남아 강의 생성 자료로 계속 쓰인다.
  - `document_preview`/`generate_question_view`/`submit_answer_view` 전부 `is_deleted=False`
    필터를 거쳐 삭제된 문서에는 본인도 접근할 수 없다.
  - `document_list`의 폴더 카드 문서 개수는 `annotate(doc_count=Count("documents",
    filter=Q(documents__is_deleted=False)))`로 삭제된 문서를 제외하고 집계한다.
- **`mypage/forms.py`**: `PersonalDocumentUploadForm`에 `subject_code`(선택 입력) 필드 — 사용자가
  입력하면 강의 자동 생성 그룹핑 키로 쓰인다.

### 2.2 `course` — 강의 초안 생성 및 반영

- **`course/ai.py`**: `generate_course_draft(subject_code, summaries)` — 누적된 문서 요약들을
  합쳐(`[:8000]`자로 자름) OpenAI JSON 모드로 `{title, description, units: [{title, lessons:
  [{title, content_outline}]}]}` 구조의 초안을 생성한다. 승인 절차·HITL 없음 — 결과를 그대로
  반환한다.
- **`course/services.py`**: `sync_course_from_draft(subject_code, draft, instructor=None)` —
  `subject_code`를 `Course.code`로 삼아 `get_or_create`(카테고리는 "AI 자동 생성" 고정,
  `instructor`는 미지정 시 첫 슈퍼유저), 이미 있으면 title/summary만 갱신. `Unit`/`Lesson`은 매번
  전체 삭제 후 draft 내용으로 재생성한다(멱등적 upsert, 이전 회차 Unit/Lesson이 누적되지 않음).
- **`course/management/commands/sync_course_drafts.py`**: `mypage`가 트리거하는 실시간 경로와는
  **별개의**, 프로토타입 검증용 수동 동기화 명령어. `yhw_agent_project/prototype/output/
  review_queue.json`(프로토타입 CLI가 사람 승인까지 마친 결과를 기록하는 파일)을 읽어
  `sync_course_from_draft`를 호출한다. `_latest_by_subject`는 `entry.get("approved")` 체크 없이
  전부 자동 수락한다(`ponytail` 주석: 사람 승인이 필요해지면 이 체크를 복원).
  **주의**: 이 명령어와 `mypage`가 트리거하는 실시간 경로는 둘 다 같은 `sync_course_from_draft`를
  거치지만 서로 다른 입력(파일 vs. mypage 누적 문서)에서 출발하는 완전히 독립된 두 경로다.
- **알려진 이슈 — 한글 전용 제목의 슬러그**: `course/utils.py::unique_slug_generator`가
  `django.utils.text.slugify(instance.title)`를 `allow_unicode=True` 없이 호출한다. Django의
  기본 `slugify`는 비-ASCII 문자를 전부 제거하므로, AI가 생성한 `draft["title"]`이 순수 한글이면
  (예: "자료구조 개론") 슬러그가 빈 문자열이 될 수 있다. `Course.code`(=`subject_code`)를 조회
  키로 쓰기 때문에 기능 자체는 깨지지 않지만, `Course.get_absolute_url()`(슬러그 기반 URL)이
  영향받을 수 있다 — 이번 작업 범위에서 수정하지 않았고, 필요 시 `slugify(title,
  allow_unicode=True)`로 교체가 다음 개선 지점이다.

### 2.3 `assistant` — 전역 FAB 챗봇

- **`assistant/tools.py`**: `TOOLS_SPEC`(OpenAI function-calling 스펙 6개) + `TOOL_FUNCTIONS` —
  `list_my_documents`, `get_document_detail`, `list_my_course_progress`, `list_my_quiz_attempts`,
  `list_my_contest_submissions`, `list_my_problem_solve_status`. 모든 조회 함수는 `user`를 첫
  인자로 강제해, LLM이 넘기는 인자에 `user_id` 같은 필드가 없어도(=LLM이 다른 사용자 데이터를
  조회하도록 유도해도) 서버에서 항상 **호출한 본인의 데이터만** 조회되도록 설계했다.
  `dispatch_tool(user, name, arguments)`가 이름으로 함수를 찾아 실행한다.
- **`assistant/guardrails.py`**: 정규식 기반 프롬프트 인젝션/탈옥 탐지
  (`detect_prompt_injection`). 영어("ignore previous instructions", "DAN mode" 등)와 한국어
  ("이전 지시 무시", "탈옥", "시스템 프롬프트 공개" 등) 패턴을 모두 포함. 걸리면
  `REFUSAL_MESSAGE`로 즉시 응답하고 LLM 호출 자체를 하지 않는다.
- **`assistant/ai.py`**: `answer(user, user_message, current_path)` —
  1. `detect_prompt_injection`으로 입력 가드레일 통과 확인(실패 시 거부 메시지 반환, LLM 미호출).
  2. 대화 이력이 `RECENT_MESSAGE_LIMIT(20)`의 2배를 넘으면 오래된 절반을 `_compact_summary`로
     압축(오래된 `ChatMessage` 삭제) — 컨텍스트 크기 관리.
  3. `_build_system_prompt`에 이전 요약 + 현재 보고 있는 페이지 힌트(`_current_page_hint`,
     `/mypage/<id>/` 패턴이면 해당 문서 제목 주입)를 넣어 시스템 프롬프트 구성.
  4. `MAX_TOOL_ROUNDS(3)`번까지 tool-calling 루프 — `message.tool_calls`가 있으면
     `dispatch_tool`로 로컬 실행 후 `role: tool` 메시지로 대화에 추가, 없으면 최종 답변 반환.
  - 출력 가드레일(post-check)은 없음 — 입력 인젝션 차단만 구현되어 있다(범위: judge 섹션 학습
    데이터 조회로 한정, PII 마스킹은 이식하지 않음. `assistant/guardrails.py` 상단 주석 참고).

## 3. 계절학기 레퍼런스가 IPSE-LMS 본체 코드에 쓰인 곳

LangChain/RAG/LangGraph/Guardrail/Agent
실습 자료가 **prototype/**에는 광범위하게 재사용됐지만(벡터 저장/검색, LangGraph HITL, 가드레일
엔진 vendor 등 — 자세한 매핑은 `yhw_agent_project/README.md` 참고), **IPSE-LMS 본체**에는
그중 두 가지 개념만, 훨씬 단순화된 형태로 들어왔다.

| study/ 개념 | study/ 레퍼런스 | IPSE-LMS 본체 적용 위치 | 비고 |
|---|---|---|---|
| Tool-calling (Agent Loop) | `14_AIagent/labs/lab1_openai/lab1a_function_calling.py` | `assistant/tools.py` (`TOOLS_SPEC`/`TOOL_FUNCTIONS`) + `assistant/ai.py::answer` (tool-calling 루프) | 레퍼런스의 "모델 요청 → 로컬 실행 → 결과 반환" 루프 구조를 그대로 각색. 도구가 계산기 등 범용이 아니라 "본인 데이터 조회"로 도메인만 좁혔다 |
| Guardrail (security) | `15_AIguardrail/guardrail_python/guardrails/engine.py` | `assistant/guardrails.py` (`detect_prompt_injection`) | verbatim vendor가 아니라 **정규식 패턴만 발췌해 재구현** — PII 마스킹·출력 스캐닝(post-check)은 이식하지 않고 입력 인젝션 탐지만 가져왔다 |
| LangGraph (HITL) | `13_langgraph/hitl.py` | **없음** | `course/ai.py`+`course/services.py`는 LangGraph 없이 단일 함수 호출 2개로 대체했고, 승인 절차 자체가 없다(4절 참고) |
| RAG(벡터 검색) | `10_vectorstore/pgvector_pdf.py`, `11_retriever/vector_retriever.py` | **없음** | `mypage/ai.py`·`course/ai.py` 모두 pgvector 없이, 방금 업로드된 원문/요약 문자열을 그대로 프롬프트에 넣는 방식이다 |

즉 IPSE-LMS 본체는 "study/ 레퍼런스를 최대한 이식"이 아니라 "prototype에서 검증된 로직 중,
실제 서비스에 필요한 결과(요약/문제/강의초안 JSON)만 가장 단순한 방식으로 재현"하는 방향으로
구현했다. LangGraph와 벡터 검색을 뺀 것은 "안 써도 되니까"가 아니라 다음 네 가지 구체적인
이유 때문이다.

1. **프로덕션에 새 무거운 의존성을 추가하지 않는다**: `requirements/base.txt`에는 langchain
   계열이 전혀 없다. LangGraph/LangChain을 넣으면 `langchain-core`/`langgraph`/pydantic 버전
   제약 등 의존성 트리 전체가 실서비스에 들어온다. 프로토타입은 1회성 검증 도구라 의존성이
   무거워도 괜찮지만, 학생들이 매일 쓰는 LMS에 그 무게를 그대로 얹을 이유는 없다.
2. **RAG(벡터 검색)이 풀 문제 자체가 없다**: RAG는 "미리 알 수 없는 후보 중 관련 있는 걸
   찾아야 할 때" 쓰는 기법이다. `course/ai.py::generate_course_draft`의 입력은
   `PersonalDocument.objects.filter(subject_code=..., summary_status=DONE)` 쿼리 하나로 이미
   정확히 어떤 요약이 필요한지 결정되고, `mypage/ai.py`도 방금 업로드된 문서 하나의 전체
   텍스트를 그대로 쓴다. 검색해서 찾아야 할 "모르는 관련 문서"가 없으므로 벡터 인덱스를 둘
   이유가 없다.
3. **LangGraph가 관리할 분기/루프가 없다**: prototype의 그래프는 "초안 생성 → 사람 승인 →
   반려 시 재생성"이라는 조건부 엣지를 위해 존재한다. 실서비스는 승인 절차 자체가 없으므로
   (4절 참고) 상태 전이도 조건 분기도 없다 — 함수 호출 2개로 끝나는 흐름을 상태 그래프로
   감싸는 건 없는 복잡도를 만드는 것이다.
4. **기존 컨벤션과의 통일**: `mypage/ai.py`가 이 기능 이전부터 "Django 동기 뷰 + threading +
   순수 OpenAI" 패턴을 쓰고 있었다. `course` 앱만 LangGraph/RAG를 쓰면 같은 프로젝트 안에 AI
   호출 방식이 두 갈래로 갈라진다.

## 4. HITL(사람 승인)에 대한 정정 — 프로토타입과 실서비스는 다르다

`yhw_agent_project/prototype/`의 `course_builder.py`(LangGraph)는 강의 초안 생성 후 반드시
`human_review_node`(터미널 `input()` 승인/반려)를 거쳐야 `output/review_queue.json`에 기록된다.
**하지만 IPSE-LMS 실서비스 경로(`mypage` → `course.ai` → `course.services`)에는 이 승인 단계가
없다** — `_maybe_generate_course_bg`가 threshold 도달을 감지하면 사람 개입 없이 바로
`Course`/`Unit`/`Lesson`에 반영된다. `course/management/commands/sync_course_drafts.py`(수동
동기화 명령어) 쪽도 마찬가지로 `entry.get("approved")` 체크를 의도적으로 제거해 전부 자동
수락한다.

**어느 쪽이 "진짜" 배포 경로인가**: `mypage` 실시간 트리거 쪽이 실제로 동작 중인 서비스 경로다.
`sync_course_drafts` 명령어는 프로토타입 CLI 결과물(review_queue.json)을 로컬에서 확인하고 싶을
때 쓰는 보조 도구로 남아 있다.

## 5. 외부(yhw_agent_project 밖) 변경 이력

`yhw_agent_project` 작업은 원칙적으로 그 폴더 내부에서만 진행했고, 폴더 **밖** IPSE-LMS 저장소를
건드린 유일한 예외는 다음 한 건이다.

- **2026-07-08, 루트 `.gitignore`에 3줄 추가**: `yhw_agent_project`가 Gitea 원격 저장소로 독립적으로
  push될 예정이라, IPSE-LMS 메인 저장소가 이 폴더를 추적하지 않도록 통째로 무시 처리했다
  (사용자 명시적 승인 후 반영).

이후 `mypage`/`course`/`assistant` 앱에 대한 모든 변경은 이 예외가 아니라 IPSE-LMS 본체 개발
자체이므로 통상적인 커밋 이력(`git log`)으로 추적된다.
