(function () {
    const script = document.currentScript;
    const historyUrl = script.dataset.historyUrl;
    const messageUrl = script.dataset.messageUrl;
    const sessionsUrl = script.dataset.sessionsUrl;     // /assistant/sessions/ (+ new/, <id>/rename/, <id>/delete/)
    const csrfToken = script.dataset.csrfToken;

    const fabBtn = document.getElementById('assistant-fab-btn');
    const fabBadge = document.getElementById('assistant-fab-badge');
    const panel = document.getElementById('assistant-chat-panel');
    const closeBtn = document.getElementById('assistant-chat-close');
    const messagesEl = document.getElementById('assistant-chat-messages');
    const form = document.getElementById('assistant-chat-form');
    const input = document.getElementById('assistant-chat-input');
    const titleEl = document.getElementById('assistant-session-title');
    const listBtn = document.getElementById('assistant-session-list-btn');
    const newBtn = document.getElementById('assistant-new-session-btn');
    const listPanel = document.getElementById('assistant-session-panel');
    const listItems = document.getElementById('assistant-session-items');

    const LAST_SEEN_KEY = 'assistant_last_seen_id';
    const SESSION_KEY = 'assistant_session_id';
    const DEFAULT_TITLE = 'AI 어시스턴트';
    let currentSessionId = readStoredSession();
    let loaded = false;
    let typingBubble = null;
    let isWaiting = false;
    let waitToken = 0;                   // 답을 기다리는 요청의 번호: 기다리다 다른 대화로 옮기면 이전 요청의 결과는 화면에 그리지 않는다
    let initialHistory = null;           // 첫 불러오기는 뱃지 확인과 화면 그리기가 함께 쓴다

    function readStoredSession() {
        try { const v = parseInt(localStorage.getItem(SESSION_KEY) || '', 10); return Number.isFinite(v) ? v : null; } catch (e) { return null; }
    }
    function storeSession(id) {
        currentSessionId = id;
        try { if (id) localStorage.setItem(SESSION_KEY, String(id)); else localStorage.removeItem(SESSION_KEY); } catch (e) {}
    }
    function post(url, body) {
        return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken }, body: JSON.stringify(body || {}) });
    }
    function setTitle(title) { titleEl.textContent = title || DEFAULT_TITLE; }

    // 압축까지 남은 대화 (질문·답 한 쌍 = 1회). 다 차면 다음 질문 때 오래된 대화가 요약으로 압축된다
    const ctxBar = document.getElementById('assistant-context-bar');
    const ctxText = document.getElementById('assistant-context-text');
    function contextLabel(c) {
        if (!c) return '';
        return c.left > 0 ? '약 ' + c.left + '회 남음' : '다음 질문에 압축돼요';
    }
    function setContext(c) {
        const used = c ? Math.min(100, Math.round(c.used / c.limit * 100)) : 0;
        ctxBar.style.width = used + '%';
        ctxBar.style.background = used >= 90 ? '#fbbf24' : '#34d399';
        ctxText.textContent = contextLabel(c);
    }

    function appendMessage(role, content) {
        const bubble = document.createElement('div');
        bubble.className = role === 'user'
            ? 'ml-auto max-w-[85%] bg-emerald-600 text-white rounded-2xl rounded-br-sm px-3 py-2'
            : 'mr-auto max-w-[85%] bg-slate-100 text-slate-700 rounded-2xl rounded-bl-sm px-3 py-2';
        bubble.innerHTML = window.renderMarkdown(content);
        messagesEl.appendChild(bubble);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
        typingBubble = document.createElement('div');
        typingBubble.className = 'mr-auto max-w-[85%] bg-slate-100 text-slate-400 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1';
        typingBubble.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span><span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span><span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>';
        messagesEl.appendChild(typingBubble);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        if (fabBadge) fabBadge.classList.remove('hidden');
    }
    function hideTyping() { if (typingBubble) { typingBubble.remove(); typingBubble = null; } }

    function getLastSeenId() { try { return parseInt(localStorage.getItem(LAST_SEEN_KEY) || '0', 10); } catch (e) { return 0; } }
    function markSeen(id) {
        try { localStorage.setItem(LAST_SEEN_KEY, String(id || 0)); } catch (e) {}
        if (fabBadge) fabBadge.classList.add('hidden');
    }

    // ── 대화 불러오기 ─────────────────────────────────────────────
    function fetchSession(id) {
        const url = id ? historyUrl + '?session=' + encodeURIComponent(id) : historyUrl;
        return fetch(url).then((res) => (res.ok ? res.json() : Promise.reject(res.status)));
    }
    function showSession(data) {
        messagesEl.innerHTML = '';
        (data.messages || []).forEach((m) => appendMessage(m.role, m.content));
        const session = data.session;
        storeSession(session ? session.id : null);
        setTitle(session ? session.title : '');
        setContext(session ? session.context : null);
        const last = (data.messages || [])[data.messages.length - 1];
        markSeen(last ? last.id : 0);
        loaded = true;
    }
    // id가 없어졌거나(삭제됨) 내 것이 아니면 가장 최근 대화로 돌아간다
    function loadSession(id) {
        return fetchSession(id).catch(() => fetchSession(null)).then(showSession).catch(() => { loaded = true; });
    }

    // 패널이 닫혀 있어도(다른 페이지로 이동했다 돌아와도) 답변이 도착했는지 뱃지로 알린다.
    function checkUnread() {
        initialHistory = fetchSession(currentSessionId).catch(() => fetchSession(null)).catch(() => ({ messages: [], session: null }));
        initialHistory.then((data) => {
            const messages = data.messages || [];
            const last = messages[messages.length - 1];
            if (last && last.role === 'assistant' && last.id > getLastSeenId() && fabBadge) fabBadge.classList.remove('hidden');
        });
    }
    checkUnread();

    fabBtn.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) applyPos();
        if (panel.classList.contains('hidden') || loaded) return;
        (initialHistory || fetchSession(currentSessionId)).then(showSession).catch(() => { loaded = true; });
    });
    closeBtn.addEventListener('click', () => { panel.classList.add('hidden'); listPanel.classList.add('hidden'); });

    // ── 채팅 창 위치: 제목 줄을 끌어 옮기거나 ↔ 버튼으로 왼쪽/오른쪽 아래에 붙인다 (데스크톱만, 기억해 둔다) ──
    const POS_KEY = 'assistant_panel_pos';
    const header = panel.firstElementChild;
    const dockBtn = document.getElementById('assistant-dock-btn');
    const wide = () => window.innerWidth >= 768;
    function readPos() { try { return JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) { return null; } }
    function savePos(pos) { try { if (pos) localStorage.setItem(POS_KEY, JSON.stringify(pos)); else localStorage.removeItem(POS_KEY); } catch (e) {} }
    function place(left, top, right, bottom) {
        panel.style.left = left; panel.style.top = top; panel.style.right = right; panel.style.bottom = bottom;
    }
    function applyPos() {
        const pos = wide() ? readPos() : null;
        if (!pos) { place('', '', '', ''); return; }
        if (pos.dock === 'left') { place('1.5rem', 'auto', 'auto', '1.5rem'); return; }
        const rect = panel.getBoundingClientRect();
        const x = Math.min(Math.max(0, pos.x), Math.max(0, window.innerWidth - rect.width));
        const y = Math.min(Math.max(0, pos.y), Math.max(0, window.innerHeight - rect.height));
        place(x + 'px', y + 'px', 'auto', 'auto');
    }
    dockBtn.addEventListener('click', () => {
        const pos = readPos();
        savePos(pos && pos.dock === 'left' ? null : { dock: 'left' });
        applyPos();
    });
    header.addEventListener('pointerdown', (e) => {
        if (!wide() || e.button !== 0 || e.target.closest('button')) return;
        const rect = panel.getBoundingClientRect();
        const dx = e.clientX - rect.left, dy = e.clientY - rect.top;
        header.setPointerCapture(e.pointerId);
        let pos = null;
        function move(ev) {
            pos = { x: Math.min(Math.max(0, ev.clientX - dx), window.innerWidth - rect.width), y: Math.min(Math.max(0, ev.clientY - dy), window.innerHeight - rect.height) };
            place(pos.x + 'px', pos.y + 'px', 'auto', 'auto');
        }
        function up() {
            header.removeEventListener('pointermove', move);
            header.removeEventListener('pointerup', up);
            header.removeEventListener('pointercancel', up);
            if (pos) savePos(pos);
        }
        header.addEventListener('pointermove', move);
        header.addEventListener('pointerup', up);
        header.addEventListener('pointercancel', up);
    });
    header.style.cursor = 'move';
    window.addEventListener('resize', applyPos);

    // ── 새 대화 / 목록 / 이름 바꾸기 / 삭제 ─────────────────────────
    // 답을 기다리는 중에 새 대화·다른 대화로 옮기면 기다림을 풀고 넘어간다 (답은 서버가 원래 대화에 저장한다)
    function leaveWaiting() {
        waitToken += 1;
        hideTyping();
        isWaiting = false;
        input.disabled = false;
    }
    function startNewSession() {
        leaveWaiting();
        post(sessionsUrl + 'new/').then((res) => res.json()).then((data) => {
            storeSession(data.session.id);
            messagesEl.innerHTML = '';
            setTitle(data.session.title === '새 대화' ? '새 대화' : data.session.title);
            setContext(data.session.context);
            loaded = true;
            listPanel.classList.add('hidden');
            input.focus();
        }).catch(() => { appendMessage('assistant', '새 대화를 만들지 못했어요. 새로고침한 뒤 다시 시도해주세요.'); });
    }
    newBtn.addEventListener('click', startNewSession);
    document.getElementById('assistant-session-new').addEventListener('click', startNewSession);

    function relativeTime(iso) {
        const diff = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
        if (diff < 60) return '방금';
        if (diff < 3600) return Math.floor(diff / 60) + '분 전';
        if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
        if (diff < 86400 * 7) return Math.floor(diff / 86400) + '일 전';
        const d = new Date(iso);
        return (d.getMonth() + 1) + '/' + d.getDate();
    }

    function renderList(sessions) {
        listItems.innerHTML = '';
        if (!sessions.length) {
            const empty = document.createElement('li');
            empty.className = 'px-4 py-8 text-center text-slate-400 text-xs';
            empty.textContent = '아직 대화가 없어요. 새 대화를 시작해 보세요.';
            listItems.appendChild(empty);
            return;
        }
        sessions.forEach((s) => {
            const li = document.createElement('li');
            li.className = 'flex items-center gap-2 px-4 py-3 hover:bg-slate-50 cursor-pointer' + (s.id === currentSessionId ? ' bg-emerald-50' : '');
            const text = document.createElement('div');
            text.className = 'flex-1 min-w-0';
            const name = document.createElement('p');
            name.className = 'font-semibold text-slate-700 truncate';
            name.textContent = s.title;
            const time = document.createElement('p');
            time.className = 'text-[11px] text-slate-400';
            time.textContent = relativeTime(s.updated_at) + ' · 압축까지 ' + (s.context.left > 0 ? '약 ' + s.context.left + '회' : '다음 질문');
            text.append(name, time);
            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'shrink-0 w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition';
            del.title = '대화 삭제';
            del.setAttribute('aria-label', '대화 삭제');
            del.innerHTML = '<i class="fa-solid fa-trash-can text-xs"></i>';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!window.confirm('이 대화를 삭제할까요? 되돌릴 수 없어요.')) return;
                post(sessionsUrl + s.id + '/delete/').then(() => {
                    const wasCurrent = s.id === currentSessionId;
                    return (wasCurrent ? loadSession(null) : Promise.resolve()).then(openList);
                });
            });
            li.append(text, del);
            li.addEventListener('click', () => {
                leaveWaiting();
                loadSession(s.id).then(() => listPanel.classList.add('hidden'));
            });
            listItems.appendChild(li);
        });
    }
    function openList() {
        listPanel.classList.remove('hidden');
        return fetch(sessionsUrl).then((res) => res.json()).then((data) => renderList(data.sessions || [])).catch(() => renderList([]));
    }
    listBtn.addEventListener('click', openList);
    document.getElementById('assistant-session-back').addEventListener('click', () => listPanel.classList.add('hidden'));

    titleEl.addEventListener('dblclick', () => {
        if (!currentSessionId) return;
        const next = window.prompt('대화 이름', titleEl.textContent === DEFAULT_TITLE ? '' : titleEl.textContent);
        if (next === null || !next.trim()) return;
        post(sessionsUrl + currentSessionId + '/rename/', { title: next.trim() })
            .then((res) => res.json()).then((data) => { if (data.session) setTitle(data.session.title); });
    });

    // 학습 화면처럼 '지금 보고 있는 내용'을 알려 줄 수 있는 화면은 window.assistantContext()를 정의한다.
    // 그러면 "이게 이해가 안 돼"처럼 화면 속 내용을 가리키는 질문에 그 내용을 바탕으로 더 쉽게 설명한다.
    // 그 밖의 화면은 보이는 글 전체를 읽어 보낸다 (수식은 $...$ 원문으로, 입력란에 쓴 값도 함께)
    const screenToggle = document.getElementById('assistant-screen-text');
    const shotToggle = document.getElementById('assistant-screenshot');
    const SKIP = 'nav, footer, script, style, noscript, #assistant-fab-container, #site-nav, .no-print';
    const SCREEN_CHARS = 6000;
    function walk(node, out) {
        if (node.nodeType === 3) { out.push(node.nodeValue); return; }
        if (node.nodeType !== 1 || node.matches(SKIP) || node.hidden) return;
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden') return;
        if (node.dataset && node.dataset.tex) { out.push(' $' + node.dataset.tex + '$ '); return; }
        if (node.tagName === 'TEXTAREA' || (node.tagName === 'INPUT' && node.type === 'text')) { if (node.value) out.push(' [입력: ' + node.value + '] '); return; }
        if (node.tagName === 'INPUT' && (node.type === 'radio' || node.type === 'checkbox')) { if (node.checked) out.push(' [선택: ' + node.value + '] '); return; }
        node.childNodes.forEach((child) => walk(child, out));
        if (style.display !== 'inline') out.push('\n');
    }
    function screenText() {
        const out = [];
        walk(document.querySelector('main') || document.body, out);
        return out.join('').split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n').slice(0, SCREEN_CHARS);
    }
    function getPageContext() {
        try {
            if (typeof window.assistantContext === 'function') return window.assistantContext();
            if (!screenToggle || !screenToggle.checked) return null;
            const text = screenText();
            if (!text) return null;
            return { kind: 'screen', title: document.title, text: text, selection: String(window.getSelection() || '').slice(0, 600) };
        } catch (e) { return null; }
    }
    try { if (localStorage.getItem('assistant_screen_text') === '0') screenToggle.checked = false; } catch (e) {}
    screenToggle.addEventListener('change', () => { try { localStorage.setItem('assistant_screen_text', screenToggle.checked ? '1' : '0'); } catch (e) {} });

    // 스크린샷: 그림·표처럼 글로 안 읽히는 것이 있을 때 이번 질문에만 붙인다 (html2canvas-pro(oklch 색 지원)는 처음 쓸 때만 불러온다)
    let h2cLoading = null;
    function loadHtml2canvas() {
        if (window.html2canvas) return Promise.resolve(window.html2canvas);
        if (h2cLoading) return h2cLoading;
        h2cLoading = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js';
            s.async = true;
            s.onload = () => (window.html2canvas ? resolve(window.html2canvas) : reject(new Error('html2canvas missing')));
            s.onerror = () => { h2cLoading = null; reject(new Error('html2canvas load failed')); };
            document.head.appendChild(s);
        });
        return h2cLoading;
    }
    function takeScreenshot() {
        return loadHtml2canvas().then((h2c) => h2c(document.documentElement, {
            x: window.scrollX, y: window.scrollY, width: window.innerWidth, height: window.innerHeight,
            scale: Math.min(1, 1280 / window.innerWidth), useCORS: true, logging: false, backgroundColor: '#ffffff',
            ignoreElements: (el) => el.id === 'assistant-fab-container',
        })).then((canvas) => canvas.toDataURL('image/jpeg', 0.7));
    }
    if (typeof window.assistantContext === 'function') {
        const chips = document.createElement('div');
        chips.className = 'px-3 pt-2 flex flex-wrap gap-1.5 border-t border-slate-100';
        ['지금 보는 내용을 더 쉽게 설명해줘', '예시를 들어줘', '시험에는 어떻게 나올까?'].forEach((text) => {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = text;
            b.className = 'text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition';
            b.addEventListener('click', () => { input.value = text; form.requestSubmit(); });
            chips.appendChild(b);
        });
        form.parentNode.insertBefore(chips, form);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isWaiting) return;
        const message = input.value.trim();
        if (!message) return;

        appendMessage('user', message);
        input.value = '';
        isWaiting = true;
        input.disabled = true;
        showTyping();
        const sentTo = currentSessionId;                 // 답을 기다리는 동안 다른 대화로 바꿔도 이 대화에 저장된다
        const token = ++waitToken;
        const wantShot = shotToggle.checked;
        shotToggle.checked = false;                       // 스크린샷은 한 번만 붙인다

        (wantShot ? takeScreenshot().catch(() => null) : Promise.resolve(null))
            .then((shot) => post(messageUrl, { message: message, session_id: sentTo, current_path: window.location.pathname,
                                               page_context: getPageContext(), screenshot: shot }))
            .then((res) => res.json().catch(() => ({ error: '서버 응답이 끊겼어요 (오래 걸렸을 수 있어요). 같은 질문을 다시 보내면 이어서 답해요.' })))
            .then((data) => {
                if (token === waitToken) {
                    appendMessage('assistant', data.reply || data.error || '오류가 발생했습니다.');
                    if (data.session) { storeSession(data.session.id); setTitle(data.session.title); setContext(data.session.context); }
                }
            })
            .catch(() => { if (token === waitToken) appendMessage('assistant', '네트워크 오류로 답을 받지 못했어요. 같은 질문을 다시 보내면 이어서 답해요.'); })
            .finally(() => {
                if (token !== waitToken) return;              // 그 사이 다른 대화로 옮겼다면 화면 상태는 그대로 둔다
                hideTyping();
                isWaiting = false;
                input.disabled = false;
                input.focus();
            });
    });
})();
