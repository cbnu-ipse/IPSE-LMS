(function () {
    const script = document.currentScript;
    const historyUrl = script.dataset.historyUrl;
    const messageUrl = script.dataset.messageUrl;
    const csrfToken = script.dataset.csrfToken;

    const fabBtn = document.getElementById('assistant-fab-btn');
    const fabBadge = document.getElementById('assistant-fab-badge');
    const panel = document.getElementById('assistant-chat-panel');
    const closeBtn = document.getElementById('assistant-chat-close');
    const messagesEl = document.getElementById('assistant-chat-messages');
    const form = document.getElementById('assistant-chat-form');
    const input = document.getElementById('assistant-chat-input');

    const LAST_SEEN_KEY = 'assistant_last_seen_id';
    let historyPromise = null;
    let typingBubble = null;
    let isWaiting = false;

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

    function hideTyping() {
        if (typingBubble) {
            typingBubble.remove();
            typingBubble = null;
        }
    }

    function getLastSeenId() {
        return parseInt(localStorage.getItem(LAST_SEEN_KEY) || '0', 10);
    }

    function markSeen(id) {
        localStorage.setItem(LAST_SEEN_KEY, String(id || 0));
        if (fabBadge) fabBadge.classList.add('hidden');
    }

    // 패널이 닫혀 있어도(다른 페이지로 이동했다 돌아와도) 답변이 도착했는지 확인할 수 있도록
    // 대화 기록은 한 번만 fetch해서 캐시해두고 렌더링/뱃지 판단 양쪽에서 재사용한다.
    function fetchHistory() {
        if (!historyPromise) {
            historyPromise = fetch(historyUrl).then((res) => res.json()).catch(() => ({ messages: [] }));
        }
        return historyPromise;
    }

    let historyRendered = false;
    function renderHistory() {
        if (historyRendered) return;
        historyRendered = true;
        fetchHistory().then((data) => {
            (data.messages || []).forEach((m) => appendMessage(m.role, m.content));
        });
    }

    function checkUnread() {
        fetchHistory().then((data) => {
            const messages = data.messages || [];
            const last = messages[messages.length - 1];
            if (last && last.role === 'assistant' && last.id > getLastSeenId()) {
                if (fabBadge) fabBadge.classList.remove('hidden');
            }
        });
    }

    checkUnread();

    fabBtn.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            renderHistory();
            fetchHistory().then((data) => {
                const messages = data.messages || [];
                const last = messages[messages.length - 1];
                markSeen(last ? last.id : 0);
            });
        }
    });

    closeBtn.addEventListener('click', () => panel.classList.add('hidden'));

    // 학습 화면처럼 '지금 보고 있는 내용'을 알려 줄 수 있는 화면은 window.assistantContext()를 정의한다.
    // 그러면 "이게 이해가 안 돼"처럼 화면 속 내용을 가리키는 질문에 그 내용을 바탕으로 더 쉽게 설명한다.
    function getPageContext() {
        try { return typeof window.assistantContext === 'function' ? window.assistantContext() : null; } catch (e) { return null; }
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

        fetch(messageUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ message: message, current_path: window.location.pathname, page_context: getPageContext() }),
        })
            .then((res) => res.json())
            .then((data) => {
                appendMessage('assistant', data.reply || data.error || '오류가 발생했습니다.');
            })
            .catch(() => {
                appendMessage('assistant', '오류가 발생했습니다.');
            })
            .finally(() => {
                hideTyping();
                isWaiting = false;
                input.disabled = false;
                input.focus();
            });
    });
})();
