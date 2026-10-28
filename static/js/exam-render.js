// 모의고사·오답노트의 문제 본문·보기·해설을 마크다운과 수식으로 그린다 (markdown-lite.js · math-render.js가 먼저 있어야 한다).
// 문제 글은 줄마다 줄바꿈이 보여야 해서(마크다운은 한 줄 바꿈을 공백으로 합친다) 코드 블록·목록·표 밖의 줄바꿈은 문단으로 나눈다.
(function () {
    var BLOCK_START = /^([-*+]\s|\d+[.)]\s|\||>|#)/;

    // 여러 줄에 걸친 $$ ... $$ (행렬 등)는 한 줄로 합친다: 마크다운 렌더러가 수식을 줄 단위로 찾고, LaTeX에서 줄바꿈은 공백이라 뜻이 같다
    function joinDisplayMath(text) {
        return text.replace(/\$\$([\s\S]+?)\$\$/g, function (m, tex) { return '$$' + tex.replace(/\s*\n\s*/g, ' ').trim() + '$$'; });
    }

    function splitLines(text) {
        var lines = joinDisplayMath(String(text || '').replace(/\r\n/g, '\n')).split('\n'), out = [], fence = false;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i], t = line.trim();
            out.push(line);
            if (t.indexOf('```') === 0) { fence = !fence; continue; }
            if (fence) continue;
            var next = lines[i + 1];
            if (t && next !== undefined && next.trim() && next.trim().indexOf('```') !== 0 && !BLOCK_START.test(t) && !BLOCK_START.test(next.trim())) out.push('');
        }
        return out.join('\n');
    }

    function block(el) {
        if (typeof window.renderMarkdown !== 'function' || el.dataset.mdDone) return;
        try { el.innerHTML = window.renderMarkdown(splitLines(el.textContent)); el.dataset.mdDone = '1'; el.classList.remove('mq-plain', 'wn-plain'); } catch (e) {}
    }
    function inline(el) {
        if (typeof window.renderMarkdown !== 'function' || el.dataset.mdDone) return;
        try { el.innerHTML = window.renderMarkdown(el.textContent).replace(/^<p class="md-p">([\s\S]*)<\/p>$/, '$1'); el.dataset.mdDone = '1'; } catch (e) {}
    }

    // root 안의 [data-md](문단)와 [data-md-inline](한 줄)을 그린다
    function all(root) {
        root = root || document;
        root.querySelectorAll('[data-md]').forEach(block);
        root.querySelectorAll('[data-md-inline]').forEach(inline);
        if (typeof window.renderMath === 'function') { try { window.renderMath(root); } catch (e) {} }
    }

    window.ExamMd = { all: all, splitLines: splitLines };
    function start() { if (typeof window.renderMarkdown === 'function') all(document); else window.addEventListener('load', function () { all(document); }); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
