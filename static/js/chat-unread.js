/*
 * 게임 페이지 로비 채팅 "안 읽은 메시지" 표시 (게임 템플릿 공용).
 *
 *   ChatUnread.setup({ panel, fab, chatPane, myUsername })
 *   ChatUnread.bump(username)   // 채팅 메시지를 받을 때마다 호출
 *
 * - 모바일(채팅 FAB가 보일 때): 채팅 창이 닫혀 있으면 FAB에 카톡처럼 빨간 숫자 뱃지. 창을 열면 사라진다.
 * - PC: 채팅 패널에 강조 외곽선 + 채팅 탭에 숫자 뱃지. 패널에 마우스를 올리거나 클릭/입력하면 사라진다.
 * 내가 보낸 메시지는 세지 않는다.
 */
(function () {
    const STYLE = `
.chat-unread-badge {
    position: absolute; top: -4px; right: -4px; min-width: 22px; height: 22px; padding: 0 6px;
    border-radius: 999px; background: #ef4444; color: #fff; font-size: 12px; font-weight: 800; line-height: 22px;
    text-align: center; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.25); pointer-events: none;
    font-family: inherit;
}
.chat-unread-tab-badge {
    margin-left: 4px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px;
    background: #ef4444; color: #fff; font-size: 10px; font-weight: 800; line-height: 16px; display: inline-block;
}
.chat-unread-glow {
    outline: 3px solid #6366f1 !important; outline-offset: 2px;
    animation: chat-unread-pulse 1.4s ease-in-out infinite;
}
@keyframes chat-unread-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,.45); }
    50% { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
}`;

    let cfg = null;
    let count = 0;
    let hovering = false;
    let fabBadge = null;
    let tabBadge = null;

    function visible(el) {
        return !!el && getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0;
    }
    function isMobile() { return visible(cfg.fab); }
    function chatSeen() {
        if (!visible(cfg.panel) || !visible(cfg.chatPane)) return false;
        return isMobile() || hovering;
    }

    function render() {
        const text = count > 99 ? '99+' : String(count);
        fabBadge.textContent = text;
        fabBadge.style.display = count && isMobile() ? '' : 'none';
        if (tabBadge) {
            tabBadge.textContent = text;
            tabBadge.style.display = count ? '' : 'none';
        }
        cfg.glowEl.classList.toggle('chat-unread-glow', !!count && !isMobile());
    }

    function clear() {
        if (!count) return;
        count = 0;
        render();
    }

    function setup(opts) {
        cfg = Object.assign({}, opts);
        if (!cfg.panel || !cfg.fab || !cfg.chatPane) return;
        cfg.glowEl = cfg.panel.classList.contains('game-side-panel')
            ? cfg.panel : (cfg.panel.querySelector('.game-side-panel') || cfg.panel);

        const style = document.createElement('style');
        style.textContent = STYLE;
        document.head.appendChild(style);

        fabBadge = document.createElement('span');
        fabBadge.className = 'chat-unread-badge';
        fabBadge.style.display = 'none';
        cfg.fab.appendChild(fabBadge);

        const tab = cfg.panel.querySelector(`.gsp-tab[onclick*="${cfg.chatPane.id}"]`);
        if (tab) {
            tabBadge = document.createElement('span');
            tabBadge.className = 'chat-unread-tab-badge';
            tabBadge.style.display = 'none';
            tab.appendChild(tabBadge);
        }

        cfg.glowEl.addEventListener('mouseenter', () => { hovering = true; if (chatSeen()) clear(); });
        cfg.glowEl.addEventListener('mouseleave', () => { hovering = false; });
        cfg.glowEl.addEventListener('pointerdown', () => { if (visible(cfg.chatPane)) clear(); });
        cfg.glowEl.addEventListener('focusin', () => { if (visible(cfg.chatPane)) clear(); });
        // 모바일에서 채팅 창을 열거나 채팅 탭으로 바꾸면 읽은 것으로 본다
        const observer = new MutationObserver(() => {
            if (count && isMobile() && chatSeen()) clear();
            else render();
        });
        observer.observe(cfg.panel, { attributes: true, attributeFilter: ['class', 'style'] });
        observer.observe(cfg.chatPane, { attributes: true, attributeFilter: ['class', 'style'] });
        window.addEventListener('resize', render);
    }

    function bump(username) {
        if (!cfg || !fabBadge) return;
        if (cfg.myUsername && username === cfg.myUsername) return;
        if (chatSeen()) return;
        count += 1;
        render();
    }

    window.ChatUnread = { setup, bump, clear };
})();
