"""자료 원문 검색.

요약만 보고 답하면 요약에서 빠진 예시·수치·풀이 과정을 AI가 다시 볼 수 없다. 그래서 질문이 오면 사용자의 자료 원문(extracted_text)을
문단 단위로 나눠 관련 있는 곳만 찾아 근거로 준다 (스키마·외부 패키지 없이 BM25 방식의 글자 일치 점수).
한국어는 조사가 붙어("행렬식은", "행렬식을") 단어 단위로는 안 맞으므로 한글은 글자 2개씩 묶어 비교한다.
"""
import math
import re
import unicodedata
from collections import Counter, OrderedDict

CHUNK_CHARS = 700          # 조각 하나의 목표 길이
CHUNK_MAX = 1000           # 문단이 이보다 길면 문장 단위로 자른다
MAX_QUERY_CHARS = 300
CACHE_SIZE = 64            # 자료 몇 개의 조각을 메모리에 들고 있을지

_WORD = re.compile(r"[0-9A-Za-zÀ-ɏ]+|[가-힣]+")
_HANGUL = re.compile(r"[가-힣]+")
_SENTENCE_END = re.compile(r"(?<=[.!?。])\s+|(?<=다\.)\s*|\n")
_cache = OrderedDict()


def tokens(text):
    """검색용 토큰: 영문·숫자는 단어째로, 한글은 글자 2개씩(한 글자 단어는 그대로)."""
    out = []
    for word in _WORD.findall(unicodedata.normalize("NFKC", str(text or "")).casefold()):
        if _HANGUL.fullmatch(word):
            out.extend([word] if len(word) == 1 else [word[i:i + 2] for i in range(len(word) - 1)])
        elif len(word) > 1 or word.isdigit():
            out.append(word)
    return out


def _split_long(paragraph):
    pieces, current = [], ""
    for sentence in _SENTENCE_END.split(paragraph):
        if current and len(current) + len(sentence) > CHUNK_MAX:
            pieces.append(current)
            current = ""
        while len(sentence) > CHUNK_MAX:                       # 문장 하나가 너무 길면 그대로 자른다
            pieces.append(sentence[:CHUNK_MAX])
            sentence = sentence[CHUNK_MAX:]
        current += (" " if current else "") + sentence
    if current:
        pieces.append(current)
    return pieces


def split_chunks(text):
    """본문을 문단 경계를 지키며 CHUNK_CHARS 안팎의 조각으로 나눈다 (순서 유지)."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n|\n(?=#{1,4}\s)", str(text or "")) if p.strip()]
    chunks, current = [], ""
    for paragraph in paragraphs:
        for piece in (_split_long(paragraph) if len(paragraph) > CHUNK_MAX else [paragraph]):
            if current and len(current) + len(piece) > CHUNK_CHARS:
                chunks.append(current)
                current = ""
            current += ("\n" if current else "") + piece
    if current:
        chunks.append(current)
    return chunks


def _indexed(document):
    """자료 하나의 (조각, 토큰 수 세기) 목록. 본문이 바뀌면 다시 만든다."""
    key = (document.pk, document.content_hash, len(document.extracted_text or ""))
    if key in _cache:
        _cache.move_to_end(key)
        return _cache[key]
    items = [(c, Counter(tokens(c))) for c in split_chunks(document.extracted_text)]
    _cache[key] = items
    while len(_cache) > CACHE_SIZE:
        _cache.popitem(last=False)
    return items


def search(documents, query, k=5, per_document=3):
    """documents(PersonalDocument 목록)의 원문에서 query와 가장 관련 있는 조각을 점수 순으로 돌려준다.
    [{document_id, title, part, parts, text, score}]. 관련 조각이 없으면 빈 목록."""
    q_tokens = Counter(tokens(str(query or "")[:MAX_QUERY_CHARS]))
    if not q_tokens:
        return []
    corpus = [(d, i, text, counts) for d in documents for i, (text, counts) in enumerate(_indexed(d))]
    if not corpus:
        return []
    n = len(corpus)
    avg_len = sum(sum(c.values()) for *_, c in corpus) / n or 1
    df = Counter(t for *_, counts in corpus for t in q_tokens if t in counts)
    scored = []
    for document, index, text, counts in corpus:
        length, score = sum(counts.values()), 0.0
        for term in q_tokens:
            tf = counts.get(term, 0)
            if not tf:
                continue
            idf = math.log(1 + (n - df[term] + 0.5) / (df[term] + 0.5))
            score += idf * tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * length / avg_len))
        if score > 0:
            scored.append((score, document, index, text))
    scored.sort(key=lambda row: -row[0])
    parts_of = {d.pk: len(_indexed(d)) for d in documents}
    out, taken = [], Counter()
    for score, document, index, text in scored:
        if taken[document.pk] >= per_document:
            continue
        taken[document.pk] += 1
        out.append({"document_id": document.pk, "title": document.title, "part": index + 1, "parts": parts_of[document.pk],
                    "text": text, "score": round(score, 2)})
        if len(out) >= k:
            break
    return out


def format_passages(results, limit_chars=4000):
    """찾은 조각을 프롬프트에 넣을 글로 묶는다 (출처 포함). limit_chars를 넘으면 뒤는 버린다."""
    lines, used = [], 0
    for r in results:
        block = f"[{r['title']} · {r['part']}/{r['parts']}번째 부분]\n{r['text']}"
        if used + len(block) > limit_chars:
            break
        lines.append(block)
        used += len(block)
    return "\n\n".join(lines)
