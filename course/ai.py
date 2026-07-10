import json

from django.conf import settings


def _client():
    from openai import OpenAI

    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY가 설정되어 있지 않습니다. 운영 .env에 키를 추가한 뒤 다시 시도해주세요.")
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_course_draft(subject_code, summaries):
    """누적된 문서 요약으로 Course(제목/설명) - Unit(2~3개) - Lesson 구조의 초안을 생성한다."""
    client = _client()
    joined = "\n\n---\n\n".join(summaries)
    prompt = (
        f"'{subject_code}' 과목으로 학생들이 올린 학습 자료 요약들입니다. 이 내용을 바탕으로 강의 초안을 만들어주세요.\n"
        "- Course 제목과 설명\n"
        "- Unit 2~3개, 각 Unit마다 Lesson 여러 개(제목 + 개요)\n\n"
        '아래 JSON 형식으로만 응답하세요: {"title": "...", "description": "...", '
        '"units": [{"title": "...", "lessons": [{"title": "...", "content_outline": "..."}]}]}\n\n'
        "--- 자료 요약 ---\n"
        f"{joined[:8000]}"
    )
    response = client.chat.completions.create(
        model=settings.MYPAGE_CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)
