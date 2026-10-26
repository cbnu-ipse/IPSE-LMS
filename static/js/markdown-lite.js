// 의존성 없는 경량 마크다운 렌더러 (요약·챗봇 답변용). 모든 글자를 먼저 이스케이프한 뒤 아래 서식만 태그로 바꾼다.
//   블록: # ~ ###### 제목, 문단, - * + 목록(들여쓰기 2칸마다 한 단계), 1. 번호 목록, > 인용, --- 구분선,
//         | 표 |, ``` 코드 블록
//   인라인: **굵게**, *기울임*, `코드`, ==형광펜==, ~밑줄 강조~(물결 밑줄), ~~취소선~~
// 스타일은 static/css/markdown-lite.css (md-* 클래스). 전체 CommonMark를 다루지는 않는다.
// 수식: $...$ (인라인), $$...$$ (가운데 줄) 은 <span class="md-math" data-tex>로 남기고 static/js/math-render.js(KaTeX)가 그린다.
// $5 와 $10 같은 금액은 수식으로 보지 않는다 (여는 $ 뒤·닫는 $ 앞이 공백이 아니고, 닫는 $ 뒤에 숫자가 없을 때만).
const MD_MATH = /(```[\s\S]*?```|`[^`\n]+`)|\$\$([\s\S]+?)\$\$|\$(?!\s)([^$\n]+?)(?<!\s)\$(?!\d)/g;
const MD_BASE = (document.currentScript && document.currentScript.src || '').replace(/markdown-lite\.js.*$/, '');

window.renderMarkdown = function (text) {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let hasMath = false;

    const inline = (raw) => {
        const maths = [];
        raw = raw.replace(MD_MATH, (m, code, block, inl) => {
            if (code) return m;                              // 코드 안의 $ 는 그대로
            maths.push({ tex: (block || inl).trim(), display: !!block });
            return '\uE000' + (maths.length - 1) + '\uE001';
        });
        const codes = [];
        let s = esc(raw).replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
        s = s
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/==([^=]+)==/g, '<mark class="md-mark">$1</mark>')
            .replace(/~~([^~]+)~~/g, '<del>$1</del>')
            // ~물결~ 은 앞뒤가 글자·숫자가 아닐 때만 (1600~1750 같은 범위 표기는 건드리지 않는다)
            .replace(/(^|[\s(\[“"'])~([^~\s](?:[^~]*?[^~\s])?)~(?=$|[\s.,!?)\]”"':;])/g, '$1<span class="md-wavy">$2</span>')
            .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>');
        s = s.replace(/\u0000(\d+)\u0000/g, (m, i) => '<code class="md-code">' + codes[+i] + '</code>');
        return s.replace(/\uE000(\d+)\uE001/g, (m, i) => {
            hasMath = true;
            const x = maths[+i];
            return '<span class="md-math" data-tex="' + esc(x.tex).replace(/"/g, '&quot;') + '"' + (x.display ? ' data-display="1"' : '') + '>' + esc(x.tex) + '</span>';
        });
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

        // 표: 헤더 행 + 구분 행(|---|---|) + 데이터 행. 행 사이에 빈 줄이 끼어 있어도 하나의 표로 읽는다
        const nextFilled = (from) => { let k = from; while (k < lines.length && !lines[k].trim()) k++; return k; };
        if (isTableRow(line)) {
            const sepAt = nextFilled(i + 1);
            if (sepAt < lines.length && isTableSep(lines[sepAt])) {
                const head = cells(line);
                const rows = [];
                i = sepAt + 1;
                for (let k = nextFilled(i); k < lines.length && isTableRow(lines[k]); k = nextFilled(i)) {
                    rows.push(cells(lines[k]));
                    i = k + 1;
                }
                out.push('<div class="md-table"><table><thead><tr>' + head.map((c) => '<th>' + inline(c) + '</th>').join('') +
                    '</tr></thead><tbody>' + rows.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
                    '</tbody></table></div>');
                continue;
            }
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
    const html = out.join('');
    if (hasMath) {   // 화면에 들어간 뒤 그린다 (호출한 쪽이 innerHTML로 넣는 시간을 준다)
        setTimeout(() => {
            if (window.renderMath) { window.renderMath(document); return; }
            const el = document.createElement('script');
            el.src = MD_BASE + 'math-render.js';
            el.onload = () => window.renderMath && window.renderMath(document);
            document.head.appendChild(el);
        }, 30);
    }
    return html;
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

// 요약을 화면 한 장에 들어갈 만큼 잘게 나눈다 (스크롤을 줄이기 위해). `#`~`###` 제목에서 나누고, 그래도 긴 부분은
// 빈 줄 단위로 더 나눈다(표·코드 블록은 쪼개지 않는다). 너무 짧은 조각은 다음 조각과 합친다.
// 반환: [{title, crumb(상위 ## 제목), body, cont(앞 조각의 이어서인지)}]
window.splitMarkdownPages = function (text, maxChars, minChars) {
    maxChars = maxChars || 480; minChars = minChars == null ? 140 : minChars;
    const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
    const sections = [];
    let cur = null, inCode = false, crumb = '';
    lines.forEach((line) => {
        if (line.trim().startsWith('```')) inCode = !inCode;
        const m = !inCode && line.match(/^(#{1,3})\s+(.*)$/);
        if (m) {
            if (m[1].length <= 2) crumb = m[2].trim();
            cur = { title: m[2].trim(), crumb: m[1].length === 3 ? crumb : '', level: m[1].length, lines: [line] };
            sections.push(cur);
            return;
        }
        if (!cur) { cur = { title: '개요', crumb: '', level: 2, lines: [] }; sections.push(cur); }
        cur.lines.push(line);
    });

    const isRow = (l) => /^\s*\|/.test(l || '');
    const pages = [];
    sections.forEach((sec) => {
        // 빈 줄 기준 블록으로 나누되, 코드 블록 안의 빈 줄과 표 사이의 빈 줄은 같은 블록으로 묶는다
        const blocks = [];
        let block = [], fence = false;
        const flush = () => { if (block.length) { blocks.push(block); block = []; } };
        sec.lines.forEach((l) => {
            if (l.trim().startsWith('```')) fence = !fence;
            if (!fence && !l.trim()) { flush(); return; }
            block.push(l);
        });
        flush();
        const merged = [];
        blocks.forEach((b) => {
            const prev = merged[merged.length - 1];
            if (prev && isRow(prev[prev.length - 1]) && isRow(b[0])) prev.push(...b); else merged.push(b.slice());
        });
        let body = [], size = 0, first = true;
        const emit = () => {
            if (!body.length) return;
            pages.push({ title: sec.title, crumb: sec.crumb, level: sec.level, body: body.map((b) => b.join('\n')).join('\n\n'), cont: !first });
            body = []; size = 0; first = false;
        };
        merged.forEach((b) => {
            const len = b.join('\n').length;
            if (body.length && size + len > maxChars) emit();
            body.push(b); size += len;
        });
        emit();
    });

    // 너무 짧은 조각은 다음 조각과 합친다 (합쳐도 한 장 분량일 때만)
    const out = [];
    for (let i = 0; i < pages.length; i++) {
        let p = pages[i];
        // 새 `##` 주제로 넘어가는 경계는 넘지 않는다 (`###` 세부 항목이나 이어지는 조각끼리만 합침)
        while (p.body.length < minChars && i + 1 < pages.length && (pages[i + 1].level >= 3 || pages[i + 1].cont) &&
               p.body.length + pages[i + 1].body.length <= maxChars) {
            p = { title: p.title, crumb: p.crumb, level: p.level, body: p.body + '\n\n' + pages[i + 1].body, cont: p.cont };
            i++;
        }
        if (p.body.trim()) out.push(p);
    }
    return out;
};
