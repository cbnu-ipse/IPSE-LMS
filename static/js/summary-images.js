// 학습 화면: PPTX·DOCX에서 뽑은 그림을 요약 조각 아래에 붙여 보여 준다 (AI 없이).
// 그림마다 '그림이 있던 슬라이드·문단의 글(ctx)'이 있고, 그것과 요약 조각 글의 겹침이 가장 큰 조각에 붙인다.
// 그림은 원문 순서대로 나오고 요약도 원문 순서를 따르므로, 순서가 거꾸로 가지 않도록(앞 그림보다 앞 조각에 붙지 않게)
// 동적 계획법으로 전체 점수가 가장 큰 배치를 고른다. 겹치는 글이 없는 그림은 원문에서의 상대 위치에 맞춰 붙인다.
(function () {
    'use strict';

    function tokens(text) {
        const out = new Set();
        const words = String(text || '').toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}_+#.-]*/gu) || [];
        words.forEach((w) => {
            const hangul = w.replace(/[^가-힣]/g, '');
            if (hangul.length >= 2) for (let i = 0; i + 1 < hangul.length; i++) out.add(hangul.slice(i, i + 2));
            (w.match(/[a-z0-9][a-z0-9_+#.-]+/g) || []).forEach((x) => { if (!/^\d{1,2}$/.test(x)) out.add(x); });
        });
        return out;
    }

    // pages: 요약 조각 글 목록, images: [{ctx}] (원문 순서). 돌려주는 값: 그림마다 붙을 조각 번호.
    function assign(pages, images) {
        const P = pages.length, N = images.length;
        if (!P || !N) return new Array(N).fill(0);
        const pageTokens = pages.map((p) => tokens(p));
        const df = new Map();
        pageTokens.forEach((set) => set.forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
        const score = images.map((img, i) => {
            const ctx = tokens(img.ctx);
            const expected = N > 1 ? (i / (N - 1)) * (P - 1) : 0;
            return pageTokens.map((set, p) => {
                let s = 0;
                ctx.forEach((t) => { if (set.has(t)) s += 1 / df.get(t); });     // 여러 조각에 나오는 흔한 말은 덜 센다
                return s - 0.001 * Math.abs(p - expected);                      // 점수가 같으면 상대 위치에 가까운 조각
            });
        });
        const dp = [], back = [];
        for (let i = 0; i < N; i++) {
            dp.push(new Array(P).fill(-Infinity)); back.push(new Array(P).fill(0));
            let best = -Infinity, bestP = 0;
            for (let p = 0; p < P; p++) {
                if (i === 0) { dp[i][p] = score[i][p]; continue; }
                if (dp[i - 1][p] > best) { best = dp[i - 1][p]; bestP = p; }     // 앞 그림이 p 이하 조각에 붙은 경우의 최대
                dp[i][p] = score[i][p] + best; back[i][p] = bestP;
            }
        }
        let p = 0;
        for (let q = 1; q < P; q++) if (dp[N - 1][q] > dp[N - 1][p]) p = q;
        const out = new Array(N);
        for (let i = N - 1; i >= 0; i--) { out[i] = p; p = back[i][p]; }
        return out;
    }

    function figures(items) {
        const box = document.createElement('div');
        box.className = 'ms-figs';
        items.forEach((img) => {
            const fig = document.createElement('figure');
            const a = document.createElement('a');
            a.href = img.url; a.target = '_blank'; a.rel = 'noopener'; a.title = '크게 보기';
            const el = document.createElement('img');
            el.src = img.url; el.loading = 'lazy'; el.alt = img.label;
            a.appendChild(el); fig.appendChild(a);
            const cap = document.createElement('figcaption');
            cap.textContent = img.label;
            fig.appendChild(cap); box.appendChild(fig);
        });
        return box;
    }

    function init() {
        window.msImages = { assign: assign };         // 배치 계산만 따로 시험할 수 있게
        const source = document.getElementById('doc-images');
        const content = document.getElementById('document-summary-content');
        if (!source || !content) return;
        let images;
        try { images = JSON.parse(source.textContent) || []; } catch (e) { return; }
        if (!images.length) return;
        images.forEach((img) => { img.label = img.slide ? '슬라이드 ' + img.slide : '그림'; });
        const summary = window.msSummary;
        let byPage = null;
        if (summary && summary.pages && summary.pages.length > 1) {
            const where = assign(summary.pages.map((p) => (p.title || '') + ' ' + (p.body || '')), images);
            byPage = summary.pages.map(() => []);
            images.forEach((img, i) => byPage[where[i]].push(img));
        }
        function show(index) {
            content.querySelectorAll('.ms-figs').forEach((el) => el.remove());
            const list = byPage ? (byPage[index] || []) : images;
            if (list.length) content.appendChild(figures(list));
        }
        window.addEventListener('ms:summary-page', (e) => show(e.detail.index));       // 조각을 넘길 때마다
        show(summary && summary.getIndex ? summary.getIndex() : 0);                     // 처음 열 때
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
