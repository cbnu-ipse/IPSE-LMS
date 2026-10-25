"""
AI 강의 생성 — 강의 자료(요약)로 챕터별 강의를 만든다. 호출은 core.ai를 거친다.

두 단계로 나눠 토큰을 아낀다:
  1. 목차(course_outline): 자료 제목과 요약 앞부분만 보고 챕터를 나누고 챕터마다 근거 자료를 고른다.
  2. 챕터(course_chapter): 챕터마다 그 챕터의 자료 요약만 넣어 학습 세트(개념 카드 + 확인 문제)를 만든다.
같은 자료로 만든 챕터는 다시 만들지 않는다 (course/studio.py의 source_hash 비교).

강의 자료는 "시험 포인트 정리"가 아니라 그 챕터에서 알아야 할 것만 담은 간결한 강의 내용이다.
원본 자료(PDF 등)는 학생에게 보여주지 않으므로 카드만 읽어도 이해되게 쓴다.
"""
import random
import zlib

from core import ai as core_ai

OUTLINE_HEAD_CHARS = 600      # 목차를 정할 때 자료 하나당 요약 앞부분 길이
CHAPTER_INPUT_CHARS = 9000    # 챕터 하나를 만들 때 넣는 요약 길이 상한
MAX_CHAPTERS = 8
# 한 화면에서 스크롤 없이 읽히도록 잘게 쪼갠다: 챕터 = 작은 학습 세트 여러 개, 세트 = 짧은 카드 1~3장 + 문제 1~3개
MAX_SETS = 12
MAX_CARDS = 3
MAX_QUESTIONS = 3
MAX_QUIZ = 5               # 한 강(챕터) 끝의 확인 퀴즈 문제 수 상한
QUIZ_TYPES = ("ox", "short")   # 강 퀴즈는 OX와 단답만
FORMAT_VERSION = 4          # 강의 형식(프롬프트)이 바뀌면 올린다 — 해시에 들어가 다음 생성 때 새 형식으로 다시 만든다

OUTLINE_SYSTEM = (
    "대학 동아리 학습 플랫폼의 강의 설계자입니다. 학생들이 올린 강의 자료 목록을 보고 강의 목차를 만듭니다.\n"
    "- 챕터는 배우는 순서대로 2~8개. 챕터마다 근거 자료 번호(doc_ids)를 고릅니다 (한 자료가 여러 챕터에 쓰여도 됨).\n"
    "- 자료의 목차를 그대로 따르지 말고, 이 과목을 처음 배우는 학생이 재미있게 따라갈 수 있는 순서로 설계합니다.\n"
    "- 강의 제목·설명과 챕터 요약은 한두 문장으로 짧게.\n"
    '- JSON으로만 답하세요: {"title": "...", "description": "...", '
    '"chapters": [{"title": "...", "summary": "...", "doc_ids": [1, 2]}]}'
)

OUTLINE_CONCEPTS_NOTE = (
    "\n개념 목록이 주어지면 챕터를 개념 단위로 구성합니다: 챕터마다 함께 배우기 좋은 개념 2~6개를 묶어 concepts에 이름을 글자 그대로 적고 "
    "(doc_ids는 생략해도 됩니다), 모든 개념을 빠짐없이 어느 한 챕터에 넣습니다. 서로 이어지는 개념은 가까운 챕터에 두고 쉬운 개념부터 배치합니다.\n"
    '이때 챕터는 {"title": "...", "summary": "...", "concepts": ["개념", ...]} 형태입니다.'
)

CHAPTER_SYSTEM = (
    "대학 동아리 학습 플랫폼에서 이 과목을 재미있고 쉽게 가르치는 강사입니다. 목적은 올라온 자료를 다시 보여 주는 것이 아니라 "
    "학생이 이 챕터의 내용을 진짜로 이해하게 만드는 것입니다. 주어진 자료 요약은 무엇을 다룰지 알려 주는 참고 자료입니다.\n"
    "원칙:\n"
    "- 자료의 순서·문장·표현에 얽매이지 않습니다. 가르치기 좋은 순서로 다시 짜고, 자료가 불친절하면 풀어서 설명합니다.\n"
    "- 이해를 돕는 비유, 일상 예시, 짧은 코드/계산 예를 적극 씁니다. 자료에 없어도 이 과목에서 널리 인정되는 내용은 "
    "보충할 수 있지만, 확실하지 않은 수치·고유 사실은 쓰지 않습니다. 자료와 어긋나는 내용도 쓰지 않습니다.\n"
    "- 학생은 원본 자료를 보지 못합니다. '자료에 따르면', 파일·슬라이드 번호 언급 금지. 카드만 읽어도 이해되게 "
    "궁금증 → 핵심 개념 → 짧은 예 순서로 씁니다.\n"
    "- 말투는 친근하되 군더더기·인사말·같은 말 반복은 금지.\n"
    "구성 (가장 중요: 스크롤을 거의 하지 않고, 한 걸음씩 차근차근 배우게 합니다):\n"
    f"- 챕터를 작은 학습 세트(sets)로 최대한 잘게 쪼갭니다. 세트 하나는 '한 가지 개념'만 다루고, 한 세트를 2~3분 안에 끝낼 수 있어야 합니다. "
    f"세트는 챕터당 3~{MAX_SETS}개. 앞 세트를 알아야 뒤 세트를 이해하도록 쉬운 것부터 순서대로 배열합니다.\n"
    f"- 세트마다 개념 카드(cards) 1~{MAX_CARDS}장만 둡니다. 세트마다 문제를 두지 않습니다 (문제가 너무 많아지면 학습 흐름이 끊깁니다).\n"
    "- 카드 하나는 휴대폰 화면 한 장에 들어가게: 본문 공백 포함 250자 안팎, 최대 6줄. 길어지면 카드나 세트를 나눕니다. "
    "한 카드에 한 가지 생각만 담고, 긴 설명 대신 한 줄 정의 + 짧은 예 하나로 끝냅니다.\n"
    "- 카드 body에 쓸 수 있는 서식: **굵게**, `코드`, '- ' 목록(하위 항목은 앞에 공백 2칸), "
    "'1. ' 번호 목록, '| a | b |' 표(행 사이에 빈 줄 없이), ``` 코드 블록. 그 밖의 HTML·이미지·링크는 쓰지 않습니다. 표는 작게(3열·4행 이내).\n"
    f"- 문제는 세트마다가 아니라 이 강(챕터) 전체를 마무리하는 퀴즈(quiz)로 한 번만 냅니다: 3~{MAX_QUIZ}개, 강의 핵심 개념을 골고루 묻고 "
    "카드 내용을 이해했는지 확인하는 수준으로. 유형은 OX와 단답만 씁니다 (객관식 금지):\n"
    '  OX: {"type": "ox", "q": "...", "answer": false, "explanation": "..."}\n'
    '  단답: {"type": "short", "q": "...", "answers": ["정답", "다른 표현"], "explanation": "..."}\n'
    "- 정답이 한쪽으로 쏠리면 안 됩니다: OX는 정답이 O인 문제와 X인 문제를 섞고(X 문제는 자료의 사실 하나를 그럴듯하게 바꿔 거짓 진술로) "
    "퀴즈 안에서 O와 X가 고르게 나오게 하세요. 단답은 한 단어나 짧은 구로 답이 정해지는 것만 냅니다.\n"
    "- explanation은 한 문장.\n"
    'JSON으로만 답하세요: {"sets": [{"title": "...", "cards": [{"title": "...", "body": "..."}]}], "quiz": [...]}'
)


def generate_outline(subject, docs, previous=None, concepts=None):
    """docs: [{"id", "title", "summary"}]. previous: 이전 목차(챕터 제목·doc_ids) — 있으면 되도록 유지하게 한다.
    concepts: {개념 이름: [자료 id]} — 있으면 챕터를 개념 단위로 구성한다."""
    listing = "\n".join(f"[{d['id']}] {d['title']}\n{d['summary'][:OUTLINE_HEAD_CHARS]}" for d in docs)
    request = f"과목: {subject}\n"
    if concepts:
        request += "개념 목록 (개념: 다루는 자료 번호):\n" + "\n".join(f"- {n}: {ids}" for n, ids in concepts.items()) + "\n"
    if previous:
        request += ("이전 목차가 있습니다. 새 자료를 알맞은 챕터에 넣고, 꼭 필요할 때만 챕터를 추가·변경하세요. "
                    "바뀌지 않는 챕터는 제목을 그대로 두세요:\n"
                    + "\n".join(f"- {c['title']} (자료 {c.get('doc_ids', [])})" for c in previous) + "\n")
    data = core_ai.complete_json("course_outline", [
        {"role": "system", "content": OUTLINE_SYSTEM + (OUTLINE_CONCEPTS_NOTE if concepts else "")},
        {"role": "user", "content": request + core_ai.untrusted("자료목록", listing)},
    ])
    return normalize_outline(data, {d["id"] for d in docs}, concepts)


def generate_chapter(subject, chapter, docs, style=""):
    """한 챕터의 학습 세트들을 만든다. docs: 이 챕터의 근거 자료 [{"id", "title", "summary"}]."""
    material = "\n\n".join(f"## {d['title']}\n{d['summary']}" for d in docs)[:CHAPTER_INPUT_CHARS]
    style_note = (f"\n확인 문제 출제 스타일 (교수님 족보에서 배운 것 — 퀴즈 문장·난이도를 이에 맞추세요. 단, 퀴즈 유형은 OX·단답으로 고정):\n{style}\n"
                  if style else "")
    data = core_ai.complete_json("course_chapter", [
        {"role": "system", "content": CHAPTER_SYSTEM},
        {"role": "user", "content": f"과목: {subject}\n챕터: {chapter['title']}\n챕터 개요: {chapter.get('summary', '')}\n"
                                    + style_note + core_ai.untrusted("자료", material)},
    ])
    return attach_quiz(normalize_sets(data.get("sets")), data.get("quiz"), data.get("sets"))


def normalize_quiz(raw):
    """강 퀴즈 문제 정리: OX·단답만, 최대 MAX_QUIZ개."""
    out = []
    for q in raw or []:
        question = normalize_question(q)
        if question and question["type"] in QUIZ_TYPES:
            out.append(question)
    return out[:MAX_QUIZ]


def attach_quiz(sets, quiz, raw_sets=None):
    """문제는 세트마다 두지 않고 강의 마지막 세트에 모아 한 번만 낸다. 모델이 예전 방식(세트별 questions)으로 답하면
    그 문제들 중 OX·단답만 모아 같은 방식으로 쓴다."""
    questions = normalize_quiz(quiz)
    if not questions:
        legacy = [q for s in (raw_sets or []) if isinstance(s, dict) for q in (s.get("questions") or [])]
        questions = normalize_quiz(legacy)
    for s in sets:
        s["questions"] = []
    if sets and questions:
        sets[-1]["questions"] = questions
    return shuffle_choices(sets)


def shuffle_choices(sets):
    """객관식 보기 순서를 섞고 정답 번호를 따라 옮긴다. 모델이 정답을 첫 보기에 몰아 두는 경향이 있어서다.
    문제 글로 정해지는 고정 방식이라 같은 문제는 늘 같게 섞이고, 생성 직후에 한 번만 부른다
    (강의자가 고친 문제를 다시 정리할 때 보기 순서가 바뀌지 않도록 normalize_*에는 넣지 않는다)."""
    for s in sets:
        for q in s["questions"]:
            if q["type"] != "mc":
                continue
            order = list(range(len(q["options"])))
            random.Random(zlib.crc32(q["q"].encode())).shuffle(order)
            q["options"], q["answer"] = [q["options"][i] for i in order], order.index(q["answer"])
    return sets


# ── 정리·검증: AI 출력을 템플릿이 믿고 쓸 수 있는 모양으로 ───────────────────────

def _text(value, limit):
    return str(value or "").strip()[:limit]


def normalize_outline(data, valid_doc_ids, concepts=None):
    """concepts({개념: [자료 id]})가 있으면 챕터의 개념을 검증하고 근거 자료를 그 개념을 다루는 자료로 정한다.
    어느 챕터에도 안 들어간 개념은 마지막 챕터에 붙인다."""
    chapters = []
    used = set()
    for c in (data.get("chapters") or [])[:MAX_CHAPTERS]:
        title = _text(c.get("title"), 120)
        if not title:
            continue
        names = []
        if concepts:
            names = [n for n in (c.get("concepts") or []) if isinstance(n, str) and n in concepts and n not in used][:12]
            used.update(names)
        if names:
            doc_ids = sorted({i for n in names for i in concepts[n] if i in valid_doc_ids})
        else:
            doc_ids = [d for d in (c.get("doc_ids") or []) if isinstance(d, int) and d in valid_doc_ids]
        chapter = {"title": title, "summary": _text(c.get("summary"), 300),
                   "doc_ids": sorted(set(doc_ids)) or sorted(valid_doc_ids)}
        if names:
            chapter["concepts"] = names
        chapters.append(chapter)
    if concepts and chapters:
        left = [n for n in concepts if n not in used]
        if left:
            last = chapters[-1]
            last["concepts"] = last.get("concepts", []) + left
            last["doc_ids"] = sorted(set(last["doc_ids"]) | {i for n in left for i in concepts[n] if i in valid_doc_ids})
    return {"title": _text(data.get("title"), 120), "description": _text(data.get("description"), 500),
            "chapters": chapters}


def normalize_question(q):
    """잘못된 문제는 None. 템플릿·채점이 기대하는 필드만 남긴다."""
    if not isinstance(q, dict):
        return None
    kind, text = q.get("type"), _text(q.get("q"), 500)
    explanation = _text(q.get("explanation"), 400)
    if not text:
        return None
    if kind == "ox":
        answer = q.get("answer")
        if isinstance(answer, str):
            answer = answer.strip().upper() in ("O", "TRUE", "참", "T", "YES")
        return {"type": "ox", "q": text, "answer": bool(answer), "explanation": explanation}
    if kind == "mc":
        options = [_text(o, 200) for o in (q.get("options") or []) if _text(o, 200)][:6]
        answer = q.get("answer")
        if len(options) < 2 or not isinstance(answer, int) or not 0 <= answer < len(options):
            return None
        return {"type": "mc", "q": text, "options": options, "answer": answer, "explanation": explanation}
    if kind == "short":
        answers = [_text(a, 100) for a in (q.get("answers") or []) if _text(a, 100)][:6]
        if not answers:
            return None
        return {"type": "short", "q": text, "answers": answers, "explanation": explanation}
    return None


def normalize_sets(sets):
    out = []
    for s in (sets or [])[:MAX_SETS]:
        if not isinstance(s, dict):
            continue
        cards = [{"title": _text(c.get("title"), 120), "body": _text(c.get("body"), 4000)}
                 for c in (s.get("cards") or [])[:MAX_CARDS] if isinstance(c, dict) and _text(c.get("body"), 4000)]
        questions = [q for q in map(normalize_question, (s.get("questions") or [])[:MAX_QUESTIONS]) if q]
        title = _text(s.get("title"), 120)
        if title and cards:
            out.append({"title": title, "cards": cards, "questions": questions})
    return out
