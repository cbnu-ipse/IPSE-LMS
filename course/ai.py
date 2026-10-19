from core import ai as core_ai


def generate_course_draft(subject_code, summaries):
    """누적된 문서 요약으로 Course(제목/설명) - Unit(2~3개) - Lesson 구조의 초안을 생성한다.
    각 Lesson의 content는 학생이 그 내용만 읽고 바로 학습할 수 있는 수준의 상세한 본문이어야 한다
    (단순 개요/한줄 요약이 아님)."""
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
    return core_ai.complete_json("course_chapter", [{"role": "user", "content": prompt}])
