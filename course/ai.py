import json

from django.conf import settings


def _client():
    from openai import OpenAI

    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY가 설정되어 있지 않습니다. 운영 .env에 키를 추가한 뒤 다시 시도해주세요.")
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_course_draft(subject_code, summaries):
    """누적된 문서 요약으로 Course(제목/설명) - Unit(2~3개) - Lesson 구조의 초안을 생성한다.
    각 Lesson의 content는 학생이 그 내용만 읽고 바로 학습할 수 있는 수준의 상세한 본문이어야 한다
    (단순 개요/한줄 요약이 아님)."""
    client = _client()
    joined = "\n\n---\n\n".join(summaries)
    prompt = (
        f"'{subject_code}' 과목으로 학생들이 올린 학습 자료 요약들입니다. 이 내용을 바탕으로 "
        "학생이 실제로 학습할 수 있는 상세한 강의를 만들어주세요.\n"
        "- Course 제목과 설명\n"
        "- Unit 2~3개, 각 Unit마다 Lesson 여러 개\n"
        "- 각 Lesson의 content는 한두 문장짜리 개요가 아니라, 소제목(##)으로 구성을 나누고 "
        "개념 설명·예시·핵심 포인트를 충분히 풀어쓴 최소 8문장 이상의 본문이어야 합니다.\n"
        "- 제공된 자료 요약에 없는 내용을 지어내지 말고, 그 안의 내용을 최대한 활용해 상세히 서술하세요.\n\n"
        '아래 JSON 형식으로만 응답하세요: {"title": "...", "description": "...", '
        '"units": [{"title": "...", "lessons": [{"title": "...", "content": "..."}]}]}\n\n'
        "--- 자료 요약 ---\n"
        f"{joined[:12000]}"
    )
    response = client.chat.completions.create(
        model=settings.MYPAGE_CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)
