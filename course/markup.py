"""
강의 카드 본문(AI가 쓴 제한된 마크다운) → 안전한 HTML.

먼저 모든 글자를 HTML 이스케이프한 뒤, 정해진 몇 가지 서식만 태그로 바꾼다. 원문에 HTML·스크립트가
들어 있어도 글자로만 보인다. 지원하는 서식:
  **굵게**, `코드`, 목록(- / * / •, 앞에 공백 2칸이면 한 단계 들여쓰기), 번호 목록(1.),
  표(| a | b |, 첫 줄은 머리글, |---| 구분 줄은 무시), 코드 블록(```), 인용(> ), 소제목(### )
"""
import re
from html import escape

_BOLD = re.compile(r"\*\*(.+?)\*\*")
_CODE = re.compile(r"`([^`]+)`")
_BULLET = re.compile(r"^(\s*)[-*•]\s+(.*)$")
_NUMBER = re.compile(r"^\s*\d+[.)]\s+(.*)$")
_TABLE_SEP = re.compile(r"^\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?$")


def _inline(text):
    text = escape(text, quote=False)
    # 코드 안의 ** 는 굵게로 바꾸지 않도록 코드를 먼저 자리표시로 빼 둔다
    codes = []

    def keep(m):
        codes.append(m.group(1))
        return f"\x00{len(codes) - 1}\x00"

    text = _CODE.sub(keep, text)
    text = _BOLD.sub(r"<strong>\1</strong>", text)
    return re.sub(r"\x00(\d+)\x00", lambda m: f"<code>{codes[int(m.group(1))]}</code>", text)


def _cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def render(markdown):
    lines = (markdown or "").replace("\r\n", "\n").split("\n")
    out, i = [], 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if not stripped:
            i += 1
            continue
        if stripped.startswith("```"):
            body = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                body.append(lines[i])
                i += 1
            i += 1  # 닫는 ```
            out.append(f'<pre class="lc-pre"><code>{escape(chr(10).join(body), quote=False)}</code></pre>')
            continue
        if stripped.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                if not _TABLE_SEP.match(lines[i].strip()):
                    rows.append(_cells(lines[i]))
                i += 1
            head, body = rows[0], rows[1:]
            html = ['<div class="lc-table"><table><thead><tr>']
            html += [f"<th>{_inline(c)}</th>" for c in head]
            html.append("</tr></thead><tbody>")
            for row in body:
                html.append("<tr>" + "".join(f"<td>{_inline(c)}</td>" for c in row) + "</tr>")
            html.append("</tbody></table></div>")
            out.append("".join(html))
            continue
        if stripped.startswith(">"):
            quote = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip()[1:].lstrip())
                i += 1
            out.append(f'<pre class="lc-pre"><code>{escape(chr(10).join(quote), quote=False)}</code></pre>')
            continue
        if _BULLET.match(line) or _NUMBER.match(line):
            ordered = bool(_NUMBER.match(line)) and not _BULLET.match(line)
            tag = "ol" if ordered else "ul"
            items = []
            while i < len(lines) and (_BULLET.match(lines[i]) or _NUMBER.match(lines[i])):
                bullet = _BULLET.match(lines[i])
                if bullet:
                    nested = len(bullet.group(1)) >= 2
                    items.append(f'<li{" class=lc-sub" if nested else ""}>{_inline(bullet.group(2))}</li>')
                else:
                    items.append(f"<li>{_inline(_NUMBER.match(lines[i]).group(1))}</li>")
                i += 1
            out.append(f"<{tag}>{''.join(items)}</{tag}>")
            continue
        if stripped.startswith("#"):
            out.append(f"<h4>{_inline(stripped.lstrip('#').strip())}</h4>")
            i += 1
            continue
        out.append(f"<p>{_inline(stripped)}</p>")
        i += 1
    return "".join(out)
