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

관련 앱: `mypage`(자료 업로드·요약·문제생성·강의 생성 트리거), `course`(강의 초안 생성·검토·게시),
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
    단답 채점은 `' | '`로 적은 대안 표현만 로컬에서 바로 정답 처리하고(`' / '`는 항목 구분일 수 있어 제외),
    그 외에는 프로그램이 계산한 단어 차이(`answer_diff`)를 AI에 함께 넘겨 틀린 부분을 지어내지 않게 한다.
  - 가드레일·RAG·벡터 검색 없음 — 방금 업로드된 문서의 원문(`extracted_text[:8000]`)을 그대로
    프롬프트에 넣는 단발성 생성이다.
- **`mypage/views.py`**:
  - `document_list`: 업로드 처리 후 `threading.Thread(target=_generate_summary_bg, ...)`로
    요약 생성을 백그라운드로 돌린다(블로킹 방지).
  - `_generate_summary_bg(document_id)`: 요약 생성 → `PersonalDocument` 업데이트 →
    `_classify_and_build`(→ `course.topics.after_summary`). 분류·초안 단계가 실패해도 요약은 그대로 남는다.
  - **주제는 사람이 고르지 않는다** (`course/topics.py`): 요약이 끝나면 AI가 기존 주제 목록(이름 + 설명)을
    보고 주제들(`PersonalDocument.topics` 다대다, 최대 3개 — 새 강의를 만들면서 기존 강의에도 추가될 수 있음, 대표 주제는 `subject_code`)을 정한다. 강의 자료면 "충분한가"를 미리
    판단하지 않고, 어떤 자료든 걸러내지 않고 항상 초안을 만들거나 갱신한다(같은 자료면 AI를 다시 부르지 않음). 강의자는 강의 생성 탭의 주제별 현황·
    자료 가공 결과(`studio.topic_overview`/`topic_detail`)를 보고 언제든 승인해 개설한다(2.2절).
  - `document_delete`: 실제 삭제 대신 `is_deleted=True`만 저장(소프트 삭제) — 사용자 화면에서는
    사라지지만 요약/원문은 그대로 남아 강의 생성 자료로 계속 쓰인다.
  - `document_preview`/`generate_question_view`/`submit_answer_view` 전부 `is_deleted=False`
    필터를 거쳐 삭제된 문서에는 본인도 접근할 수 없다.
  - `document_list`의 폴더 카드 문서 개수는 `annotate(doc_count=Count("documents",
    filter=Q(documents__is_deleted=False)))`로 삭제된 문서를 제외하고 집계한다.
- **`mypage/forms.py`**: `PersonalDocumentUploadForm`은 자료명과 파일만 받는다(과목·자료 구분 입력 없음).

### 2.2 `course` — 강의 초안 생성 → 강의자 검토·승인 → 게시

- **`course/ai.py`**: 두 단계 생성. `generate_outline`(목차: 자료 제목 + 요약 앞부분만 보고 챕터와
  챕터별 근거 자료를 고름) → `generate_chapter`(챕터마다 그 챕터의 요약만 넣어 학습 세트 = 개념 카드 +
  확인 문제(OX/객관식/단답)를 만듦). 강의는 스크롤 없이 한 걸음씩 배우도록 챕터를 짧은 세트(카드 1~3장, 카드당 250자 안팎, 문제 1~3개)로
  잘게 쪼갠다(`FORMAT_VERSION`이 해시에 들어가 형식이 바뀌면 다시 생성). 강의의 목적은 원문 재현이 아니라 그 과목을 재미있게 잘 가르치는 것이라
  프롬프트가 자료를 참고용으로만 쓰게 한다. 출력은 `normalize_*`로 검증·정리한다.
- **`course/studio.py`**: 초안(`CourseDraft`)의 생성·수정·승인·반려.
  - `build_draft`: 같은 입력(요약 해시)으로는 다시 만들지 않는다(DB 유니크 제약 → 동시 업로드에도 AI 호출 1회).
    근거 자료가 그대로인 챕터는 이전 초안의 세트를 재사용해 AI를 부르지 않는다.
  - `publish_draft`: 저장된 초안을 그대로 Course/Unit/Lesson(cards·questions)에 옮긴다. **게시할 때 AI 호출 없음.**
    같은 챕터 순서·세트 제목의 수업은 고쳐 써서 학생 진도를 유지한다.
  - 게시된 AI 강의의 내용은 승인된 초안으로만 바뀐다(직접 수업 편집은 막힘, `start_edit_draft`로 수정 초안).
- **`course/views_studio.py`** + `templates/course/studio_*.html`: judge > **강의 생성** 탭(강의자 전용).
  학생 화면 그대로 미리보기·문제 풀이(저장 안 함), 카드·문제 수정, 승인·반려.
- **`course/markup.py`**: 카드 본문(제한된 마크다운)을 이스케이프 후 안전한 HTML로.
- **`course/services.py`**: 프로토타입 형식(review_queue.json)을 검토 대기 초안으로 넣는다
  (`sync_course_drafts` 명령어도 더 이상 강의를 직접 바꾸지 않는다).

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

## 4. HITL(사람 승인)

실서비스에도 사람 승인이 있다. AI가 만든 강의 초안은 강의자(`is_lecturer`)가 judge > 강의 생성 탭에서
미리 보고 확인 문제까지 풀어 본 뒤 승인해야 게시된다. 새 강의는 강의자 누구나 승인할 수 있고 승인한
사람이 담당이 되며, 게시된 강의를 바꾸는 초안(새 자료로 다시 만든 것이든 강의자가 직접 고친 것이든)은
담당 강의자(또는 관리자)만 승인한다. LangGraph 없이 `CourseDraft.status`(생성 중 → 검토 대기 →
승인/반려)로 상태를 관리한다.

## 5. 외부(yhw_agent_project 밖) 변경 이력

`yhw_agent_project` 작업은 원칙적으로 그 폴더 내부에서만 진행했고, 폴더 **밖** IPSE-LMS 저장소를
건드린 유일한 예외는 다음 한 건이다.

- **2026-07-08, 루트 `.gitignore`에 3줄 추가**: `yhw_agent_project`가 Gitea 원격 저장소로 독립적으로
  push될 예정이라, IPSE-LMS 메인 저장소가 이 폴더를 추적하지 않도록 통째로 무시 처리했다
  (사용자 명시적 승인 후 반영).

이후 `mypage`/`course`/`assistant` 앱에 대한 모든 변경은 이 예외가 아니라 IPSE-LMS 본체 개발
자체이므로 통상적인 커밋 이력(`git log`)으로 추적된다.

## 공급자·모델 라우팅 (core/ai.py)

- 작업마다 (공급자, 모델)을 따로 정한다: `settings.AI_TASK_PROVIDERS`·`AI_MODELS` (환경변수 `AI_PROVIDER_<작업>`·`AI_MODEL_<작업>`).
  기본 배정은 주제 분류·챗봇·요약 = Gemini, 문제 생성·채점 = OpenAI, 강의 목차·챕터 = Claude.
- Gemini·Claude는 OpenAI SDK와 호환되는 주소(`base_url`)로 부르므로 새 패키지가 필요 없다. 지정한 공급자의 키가 없으면
  OpenAI 기본 모델로 대신 부른다(`route()`).
- 공급자 차이: OpenAI는 `max_completion_tokens`, 호환 주소는 `max_tokens`. Claude 호환 주소는 `response_format`(JSON 모드)을
  무시하므로 `complete_json`이 코드 펜스·앞뒤 설명이 붙어도 읽는 `parse_json`으로 보완한다.
- 모델 비교는 `python manage.py eval_ai_models` (사례: `core/eval/cases.json`). 서비스 함수를 후보 모델로 바꿔 그대로 돌리고
  사용량은 DB에 남기지 않는다.
