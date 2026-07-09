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

    let historyLoaded = false;
    let typingBubble = null;

    function appendMessage(role, content) {
        const bubble = document.createElement('div');
        bubble.className = role === 'user'
            ? 'ml-auto max-w-[85%] bg-emerald-600 text-white rounded-2xl rounded-br-sm px-3 py-2'
            : 'mr-auto max-w-[85%] bg-slate-100 text-slate-700 rounded-2xl rounded-bl-sm px-3 py-2';
        bubble.textContent = content;
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
        if (fabBadge) fabBadge.classList.add('hidden');
    }

    function loadHistory() {
        if (historyLoaded) return;
        historyLoaded = true;
        fetch(historyUrl)
            .then((res) => res.json())
            .then((data) => {
                (data.messages || []).forEach((m) => appendMessage(m.role, m.content));
            })
            .catch(() => {});
    }

    fabBtn.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) loadHistory();
    });

    closeBtn.addEventListener('click', () => panel.classList.add('hidden'));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        appendMessage('user', message);
        input.value = '';
        showTyping();

        fetch(messageUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ message: message, current_path: window.location.pathname }),
        })
            .then((res) => res.json())
            .then((data) => {
                hideTyping();
                appendMessage('assistant', data.reply || data.error || '오류가 발생했습니다.');
            })
            .catch(() => {
                hideTyping();
                appendMessage('assistant', '오류가 발생했습니다.');
            });
    });
})();
