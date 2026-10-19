// 의존성 없는 경량 마크다운 렌더러 (요약·챗봇 답변용). 모든 글자를 먼저 이스케이프한 뒤 아래 서식만 태그로 바꾼다.
//   블록: # ~ ###### 제목, 문단, - * + 목록(들여쓰기 2칸마다 한 단계), 1. 번호 목록, > 인용, --- 구분선,
//         | 표 |, ``` 코드 블록
//   인라인: **굵게**, *기울임*, `코드`, ==형광펜==, ~밑줄 강조~(물결 밑줄), ~~취소선~~
// 스타일은 static/css/markdown-lite.css (md-* 클래스). 전체 CommonMark를 다루지는 않는다.
window.renderMarkdown = function (text) {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const inline = (raw) => {
        const codes = [];
        let s = esc(raw).replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
        s = s
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/==([^=]+)==/g, '<mark class="md-mark">$1</mark>')
            .replace(/~~([^~]+)~~/g, '<del>$1</del>')
            // ~물결~ 은 앞뒤가 글자·숫자가 아닐 때만 (1600~1750 같은 범위 표기는 건드리지 않는다)
            .replace(/(^|[\s(\[“"'])~([^~\s](?:[^~]*?[^~\s])?)~(?=$|[\s.,!?)\]”"':;])/g, '$1<span class="md-wavy">$2</span>')
            .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>');
        return s.replace(/\u0000(\d+)\u0000/g, (m, i) => '<code class="md-code">' + codes[+i] + '</code>');
    };

    const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let i = 0;

    const isTableRow = (l) => /^\s*\|.*\|\s*$/.test(l);
    const isTableSep = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
    const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    const listMatch = (l) => l.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);

    while (i < lines.length) {
        const line = lines[i];
        const t = line.trim();
        if (!t) { i++; continue; }

        if (t.startsWith('```')) {
            const body = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) body.push(lines[i++]);
            i++;
            out.push('<pre class="md-pre"><code>' + esc(body.join('\n')) + '</code></pre>');
            continue;
        }
        const h = t.match(/^(#{1,6})\s+(.*)$/);
        if (h) { out.push('<h' + h[1].length + ' class="md-h md-h' + h[1].length + '">' + inline(h[2]) + '</h' + h[1].length + '>'); i++; continue; }
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { out.push('<hr class="md-hr">'); i++; continue; }

        if (isTableRow(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
            const head = cells(line);
            i += 2;
            const rows = [];
            while (i < lines.length && isTableRow(lines[i])) rows.push(cells(lines[i++]));
            out.push('<div class="md-table"><table><thead><tr>' + head.map((c) => '<th>' + inline(c) + '</th>').join('') +
                '</tr></thead><tbody>' + rows.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
                '</tbody></table></div>');
            continue;
        }
        if (t.startsWith('>')) {
            const body = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) body.push(lines[i++].trim().replace(/^>\s?/, ''));
            out.push('<blockquote class="md-quote">' + body.map((l) => inline(l)).join('<br>') + '</blockquote>');
            continue;
        }
        if (listMatch(line)) {
            // 들여쓰기 2칸마다 한 단계. 같은 단계에서 번호/글머리표가 바뀌면 새 목록으로 시작한다
            const stack = [];  // {indent, tag}
            let html = '';
            while (i < lines.length && listMatch(lines[i])) {
                const m = listMatch(lines[i]);
                const indent = m[1].replace(/\t/g, '  ').length, tag = /^\d/.test(m[2]) ? 'ol' : 'ul';
                while (stack.length && indent < stack[stack.length - 1].indent) { html += '</li></' + stack.pop().tag + '>'; }
                if (stack.length && indent === stack[stack.length - 1].indent) {
                    if (stack[stack.length - 1].tag !== tag) { html += '</li></' + stack.pop().tag + '>'; }
                    else { html += '</li>'; }
                }
                if (!stack.length || indent > stack[stack.length - 1].indent) {
                    html += '<' + tag + ' class="md-list">'; stack.push({ indent, tag });
                }
                html += '<li>' + inline(m[3]);
                i++;
            }
            while (stack.length) html += '</li></' + stack.pop().tag + '>';
            out.push(html);
            continue;
        }
        const para = [];
        while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>|---)/.test(lines[i].trim()) &&
               !listMatch(lines[i]) && !isTableRow(lines[i])) para.push(lines[i++].trim());
        if (!para.length) { para.push(t); i++; }
        out.push('<p class="md-p">' + inline(para.join(' ')) + '</p>');
    }
    return out.join('');
};

// 최상위 `## ` 헤딩 기준으로 마크다운을 청크 단위로 나눈다. 첫 `##` 이전 내용은 "개요" 청크로 묶는다.
// (코드 블록 안의 ## 은 헤딩으로 보지 않는다)
window.splitMarkdownSections = function (text) {
    const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
    const sections = [];
    let current = null;
    let inCode = false;
    lines.forEach((line) => {
        if (line.trim().startsWith('```')) inCode = !inCode;
        const match = !inCode && line.match(/^##\s+(.*)$/);
        if (match) {
            current = { title: match[1].trim(), body: [line] };
            sections.push(current);
            return;
        }
        if (!current) {
            current = { title: '개요', body: [] };
            sections.push(current);
        }
        current.body.push(line);
    });
    return sections
        .map((s) => ({ title: s.title, body: s.body.join('\n').trim() }))
        .filter((s) => s.body !== '');
};
