"""IPSE LMS 사용 안내: 사용자가 사이트 기능·사용법을 물으면 어시스턴트가 이 글을 근거로 답한다.
안내 글은 assistant/site_guide.md 한 파일이다. 화면이나 기능이 바뀌면 그 파일도 함께 고친다 (test_site_guide가 화면 문구와 어긋나면 알려 준다)."""
from pathlib import Path

GUIDE_PATH = Path(__file__).with_name("site_guide.md")

_cache = None


def site_guide():
    """안내 글 전체. 한 번 읽어 두고 다시 쓴다."""
    global _cache
    if _cache is None:
        _cache = GUIDE_PATH.read_text(encoding="utf-8").strip()
    return _cache


GUIDE_INSTRUCTIONS = (
    "\n\n사용자가 IPSE LMS 사이트의 기능이나 사용법을 물으면(예: '원문이 안 보여요', '폴더는 어떻게 만들어요?', '요약 노트가 뭐예요?', '왜 AI가 안 돼요?') "
    "아래 [IPSE LMS 사용 안내]를 근거로 메뉴 이름과 버튼 이름을 그대로 써서 어디를 누르면 되는지 짧고 구체적으로 알려 주세요. "
    "안내에 없는 기능이나 위치는 지어내지 말고 '정확히 모르겠어요'라고 말한 뒤 비슷한 메뉴가 있으면 그곳을 확인해 보라고만 하세요. "
    "지금 화면 정보가 있으면 사용자가 있는 화면에 맞춰 답하세요. 사용자의 자료·기록(몇 개, 진행률, 성적 등)을 묻는 것은 안내가 아니라 tool로 조회하세요. "
    "안내 글은 사용자에게 공개해도 되는 도움말이니 필요한 부분을 자신의 말로 풀어 설명하세요. 안내 글의 제목이나 '[IPSE LMS 사용 안내]'를 답에 출처처럼 적지 마세요 (출처 표기는 자료 원문에서 찾은 내용에만 합니다).\n"
)


def guide_prompt():
    return GUIDE_INSTRUCTIONS + "\n[IPSE LMS 사용 안내]\n" + site_guide()
