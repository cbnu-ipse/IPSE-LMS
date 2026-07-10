// 의존성 없는 경량 마크다운 렌더러. 헤딩/볼드/이탤릭/인라인코드/코드블록/리스트/문단만 지원한다.
// AI가 생성하는 요약·채팅 답변(## 헤딩 + 문장, 가끔 코드블록) 수준을 커버하는 것이 목적이며
// 전체 CommonMark 스펙은 다루지 않는다.
window.renderMarkdown = function (text) {
    const escapeHtml = (s) => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const inline = (s) => escapeHtml(s)
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-100 rounded text-[0.85em]">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');

    const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
    const html = [];
    let listBuffer = [];
    let inCodeBlock = false;
    let codeLines = [];

    function flushList() {
        if (listBuffer.length) {
            html.push('<ul class="list-disc pl-5 space-y-0.5">' + listBuffer.map((li) => `<li>${inline(li)}</li>`).join('') + '</ul>');
            listBuffer = [];
        }
    }

    lines.forEach((line) => {
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                html.push(`<pre class="bg-slate-800 text-slate-100 rounded-lg p-3 overflow-x-auto text-xs"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
                codeLines = [];
                inCodeBlock = false;
            } else {
                flushList();
                inCodeBlock = true;
            }
            return;
        }
        if (inCodeBlock) {
            codeLines.push(line);
            return;
        }
        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
            flushList();
            const level = heading[1].length;
            html.push(`<h${level} class="font-bold mt-2 mb-1">${inline(heading[2])}</h${level}>`);
            return;
        }
        const listItem = line.match(/^\s*[-*]\s+(.*)$/);
        if (listItem) {
            listBuffer.push(listItem[1]);
            return;
        }
        flushList();
        html.push(line.trim() === '' ? '' : `<p>${inline(line)}</p>`);
    });
    flushList();
    return html.filter((h) => h !== '').join('');
};
