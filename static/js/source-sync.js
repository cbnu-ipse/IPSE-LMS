// 학습 화면: 요약 조각과 원문을 서로 따라가게 한다.
// - 요약 조각을 넘기면 원문이 그 내용이 있는 곳으로 이동한다 (텍스트 원문은 해당 부분을 하이라이트하고 스크롤,
//   PDF는 해당 페이지로 이동).
// - 텍스트 원문을 스크롤하면 그 위치의 내용을 요약한 조각으로 요약이 넘어간다 (PDF 뷰어는 브라우저가 스크롤 위치를
//   알려 주지 않아 요약 → PDF 방향만 된다).
// 어느 조각이 원문 어디에 해당하는지는 AI 없이 글자 겹침(단어 가중치)으로 맞추고, 요약이 원문 순서를 따른다는 점을
// 이용해 순서가 거꾸로 가지 않도록 보정한다 (window.msSourceSync.buildMapping).
(function () {
    'use strict';

    // ── 조각 ↔ 원문 위치 맞추기 (DOM 없이 동작해서 따로 시험할 수 있다) ───────────────
    function tokens(text) {
        const out = new Set();
        const words = String(text || '').toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}_+#.-]*/gu) || [];
        words.forEach((w) => {
            const hangul = w.replace(/[^가-힣]/g, '');
            if (hangul.length >= 2) {            // 한글은 조사가 붙어도 겹치도록 두 글자씩 쪼갠다
                for (let i = 0; i + 1 < hangul.length; i++) out.add(hangul.slice(i, i + 2));
            }
            (w.match(/[a-z0-9][a-z0-9_+#.-]+/g) || []).forEach((x) => { if (!/^\d{1,2}$/.test(x)) out.add(x); });
        });
        return out;
    }

    // pieces: 요약 조각 글, units: 원문 단위(페이지·문단 묶음) 글.
    // 반환: 조각마다 {unit, end} (unit~end가 해당 원문 범위) 또는 null(못 찾음). 순서는 거꾸로 가지 않는다.
    function buildMapping(pieces, units) {
        const P = pieces.length, U = units.length;
        if (!P || !U) return [];
        const unitTok = units.map(tokens), pieceTok = pieces.map(tokens);
        const df = new Map();
        unitTok.forEach((s) => s.forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
        const idf = (t) => Math.log(1 + U / (1 + (df.get(t) || 0)));
        const norm = (s) => { let n = 0; s.forEach((t) => { n += idf(t); }); return Math.sqrt(n) || 1; };
        const unitNorm = unitTok.map(norm), pieceNorm = pieceTok.map(norm);
        const S = pieceTok.map((pt, i) => unitTok.map((ut, j) => {
            let sum = 0;
            pt.forEach((t) => { if (ut.has(t)) sum += idf(t); });
            return sum / (pieceNorm[i] * unitNorm[j]);
        }));

        // 순서를 지키는 최선의 경로: 조각 p의 위치는 조각 p-1의 위치보다 앞설 수 없다
        const back = [];
        let prev = S[0].slice();
        for (let p = 1; p < P; p++) {
            const row = new Array(U), from = new Array(U);
            let m = -1, mi = 0;
            for (let u = 0; u < U; u++) {
                if (prev[u] > m) { m = prev[u]; mi = u; }
                row[u] = S[p][u] + m;
                from[u] = mi;
            }
            back.push(from);
            prev = row;
        }
        let u = 0;
        prev.forEach((v, i) => { if (v > prev[u]) u = i; });
        const path = new Array(P);
        path[P - 1] = u;
        for (let p = P - 1; p >= 1; p--) { u = back[p - 1][u]; path[p - 1] = u; }

        const MIN = 0.02;
        let found = 0;
        const out = path.map((unit, p) => {
            const top = S[p][unit];
            if (top < MIN) return null;
            found++;
            let end = unit;
            while (end + 1 < U && end - unit < 2 && S[p][end + 1] >= top * 0.6) end++;
            return { unit, end };
        });
        if (found < P * 0.3) {   // 글자가 거의 안 겹치면(스캔 PDF 등) 위치를 비례로 짐작한다
            return pieces.map((_, p) => { const unit = Math.min(U - 1, Math.floor(p * U / P)); return { unit, end: unit }; });
        }
        let last = null;          // 못 찾은 조각은 바로 앞 조각의 위치를 따른다
        return out.map((m) => { if (m) last = m; return m || last; });
    }

    // 원문 단위 unit 위치에서 보이는 요약 조각: unit 이하에서 가장 뒤에 있는 위치를 가리키는 조각 중 첫 번째
    function pieceForUnit(mapping, unit) {
        let at = -1;
        mapping.forEach((m) => { if (m && m.unit <= unit && m.unit > at) at = m.unit; });
        const p = mapping.findIndex((m) => m && m.unit === at);
        return p < 0 ? 0 : p;
    }

    const api = { tokens, buildMapping, pieceForUnit };
    window.msSourceSync = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;

    // ── 화면 연결 ──────────────────────────────────────────────────────────────
    const src = document.getElementById('ms-src');
    const summary = window.msSummary;
    if (!src || !summary || !summary.pages || summary.pages.length < 2) return;

    const KEY = 'mypage-source-sync';
    let enabled = true;
    try { enabled = localStorage.getItem(KEY) !== '0'; } catch (e) {}

    const pieceText = (page) => (page.title ? page.title + '\n' : '') + page.body;
    const pieces = summary.pages.map(pieceText);

    let iframe = src.querySelector('iframe');
    const pre = src.querySelector('pre');
    let units = [], mapping = [], setHighlight = () => {}, pdfBase = '';
    let container = null, lockUntil = 0, fromSource = false;

    const pill = document.createElement('button');
    pill.type = 'button';
    pill.id = 'ms-sync-toggle';
    pill.className = 'ms-sync';
    function renderPill(label) {
        pill.classList.toggle('off', !enabled);
        pill.textContent = (enabled ? '원문 따라가기 켜짐' : '원문 따라가기 꺼짐') + (label ? ' · ' + label : '');
        pill.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    }
    pill.addEventListener('click', () => {
        enabled = !enabled;
        try { localStorage.setItem(KEY, enabled ? '1' : '0'); } catch (e) {}
        renderPill();
        if (enabled) follow(summary.getIndex());
    });
    src.appendChild(pill);

    if (iframe) {                                   // PDF: 페이지 글은 서버가 JSON으로 준다
        let pages = [];
        try { pages = JSON.parse(document.getElementById('ms-pdf-pages').textContent); } catch (e) { pages = []; }
        if (!pages.length) return;
        units = pages;
        pdfBase = (iframe.getAttribute('src') || '').split('#')[0];
        let shownPage = 1, pdfTimer = null;
        // 크롬 PDF 뷰어는 이미 열린 상태에서 주소의 #page=N만 바꾸면(location.replace·src 모두) 페이지를 옮기지 않는다.
        // 그래서 목표 페이지가 들어간 새 iframe을 만들어 갈아 끼운다 (새 뷰어는 #page=N으로 열린다). 갈아 끼우는 동안은 이전 화면을
        // 남겨 깜빡임을 줄이고, 요약을 빠르게 넘길 때는 마지막 페이지로만 한 번 옮긴다.
        let pending = null;
        function goToPdfPage(page) {
            shownPage = page;
            if (pending) { pending.remove(); pending = null; }           // 아직 뜨는 중인 이전 요청은 버린다 (iframe이 쌓이지 않게)
            const next = iframe.cloneNode(false);
            next.src = pdfBase + '#page=' + page;
            next.style.cssText = 'position:absolute;inset:6px;width:calc(100% - 12px);height:calc(100% - 12px);opacity:0';
            pending = next;
            const swap = () => {
                if (pending !== next) return;                              // 그 사이 더 새 요청이 생겼다
                pending = null;
                Array.from(src.querySelectorAll('iframe')).forEach((f) => { if (f !== next) f.remove(); });   // 이전 화면 포함 남은 것 전부 치움
                next.style.cssText = '';
                iframe = next;
            };
            next.addEventListener('load', () => setTimeout(swap, 250), { once: true });
            setTimeout(swap, 3000);                                         // 로드 이벤트가 안 와도 결국 갈아 끼운다
            iframe.after(next);
        }
        setHighlight = (m) => {
            const page = m.unit + 1;
            renderPill('p.' + page);
            if (page === shownPage) return;        // 이미 그 페이지를 보고 있으면 다시 열지 않는다
            clearTimeout(pdfTimer);
            pdfTimer = setTimeout(() => goToPdfPage(page), 150);
        };
    } else if (pre) {                               // 텍스트 계열 원문: 문단 묶음으로 나눠 하이라이트하고 스크롤한다
        const paragraphs = pre.textContent.replace(/\r\n/g, '\n').split(/\n\s*\n/).filter((p) => p.trim());
        const groups = [];
        let buf = [], size = 0;
        paragraphs.forEach((p) => {
            buf.push(p); size += p.length;
            if (size >= 600) { groups.push(buf.join('\n\n')); buf = []; size = 0; }
        });
        if (buf.length) groups.push(buf.join('\n\n'));
        if (groups.length < 2) return;
        units = groups;
        container = document.createElement('div');
        container.className = 'ms-text';
        const els = groups.map((g, i) => {
            const el = document.createElement('div');
            el.className = 'ms-unit';
            el.dataset.u = i;
            el.textContent = g;
            container.appendChild(el);
            return el;
        });
        pre.replaceWith(container);
        setHighlight = (m, scroll) => {
            els.forEach((el, i) => el.classList.toggle('ms-hl', i >= m.unit && i <= m.end));
            if (scroll === false) return;            // 원문을 스크롤하다 요약이 넘어간 경우: 표시만 바꾼다
            lockUntil = performance.now() + 250;     // 우리가 움직인 스크롤은 되돌려 따라가지 않는다 (움직이는 동안 계속 연장)
            container.scrollTo({ top: Math.max(0, els[m.unit].offsetTop - 16), behavior: 'smooth' });
        };
        container.addEventListener('scroll', () => {
            if (!enabled) return;
            if (performance.now() < lockUntil) { lockUntil = performance.now() + 150; return; }   // 아직 움직이는 중
            if (container.__raf) return;
            container.__raf = requestAnimationFrame(() => {
                container.__raf = 0;
                const probe = container.scrollTop + container.clientHeight * 0.3;
                let u = 0;
                els.forEach((el, i) => { if (el.offsetTop <= probe) u = i; });
                const p = pieceForUnit(mapping, u);
                if (p !== summary.getIndex()) { fromSource = true; summary.show(p); fromSource = false; }
            });
        }, { passive: true });
    } else {
        pill.remove();          // 이미지 같은 원문은 따라갈 위치가 없다
        return;
    }

    mapping = buildMapping(pieces, units);

    function follow(index) {
        const m = mapping[index];
        if (enabled && m) setHighlight(m);
    }
    window.addEventListener('ms:summary-page', (e) => {
        if (fromSource) {                            // 원문을 스크롤해서 넘어간 조각은 원문을 다시 움직이지 않고 표시만 옮긴다
            const m = mapping[e.detail.index];
            if (m) setHighlight(m, false);
            return;
        }
        follow(e.detail.index);
    });
    // 모바일에서 원문을 다시 열면 현재 조각의 위치로 맞춰 준다
    const toggle = document.getElementById('ms-toggle');
    if (toggle) toggle.addEventListener('click', () => setTimeout(() => follow(summary.getIndex()), 80));
    renderPill();
    if (container) {            // 처음 화면에서도 첫 조각의 위치를 표시한다 (스크롤은 맨 위 그대로)
        const m = mapping[summary.getIndex()];
        if (m) container.children[m.unit].classList.add('ms-hl');
    }
})();
