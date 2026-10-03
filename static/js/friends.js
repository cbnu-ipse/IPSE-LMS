/*
 * 놀이터 접속자 탭 + 친구 (게임 템플릿 공용).
 *
 *   FriendsPanel.mount({ listEl, countEl, myUserId, csrf, inviteGame, panel, fab })
 *   FriendsPanel.render(users)   // 로비 채팅 소켓의 presence 메시지(접속 중 목록)를 받을 때마다 호출
 *
 * - 받은 친구 요청: 수락/거절
 * - 접속 중: 전체 접속자. 친구가 아니면 [친구 추가], 친구면 ★ + [초대]
 * - 친구 · 오프라인: 접속하지 않은 친구 (회색)
 * inviteGame("gostop" | "yacht" | "poker")이 있으면 친구를 내가 있는 방으로 초대할 수 있다.
 * 친구 데이터는 /accounts/friends/ 에서 받아오고 30초마다(화면이 보일 때) 새로고친다.
 */
(function () {
    const STYLE = `
.fr-section { padding: 6px 16px 4px; font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: .02em; display: flex; align-items: center; gap: 6px; }
.fr-section:not(:first-child) { margin-top: 6px; border-top: 1px solid #f1f5f9; padding-top: 10px; }
.fr-row { display: flex; align-items: center; gap: 8px; padding: 8px 16px; }
.fr-row--me { background: #ecfdf5; border-left: 2px solid #34d399; }
.fr-row--off { opacity: .55; }
.fr-dot { width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; background: #10b981; }
.fr-row--off .fr-dot { background: #cbd5e1; }
.fr-avatar { flex-shrink: 0; width: 24px; height: 24px; border-radius: 999px; object-fit: cover; border: 1px solid #e2e8f0; }
.fr-initial { flex-shrink: 0; width: 24px; height: 24px; border-radius: 999px; background: #e0e7ff; color: #4338ca; font-weight: 700; font-size: 10px; display: flex; align-items: center; justify-content: center; text-transform: uppercase; }
.fr-name { flex: 1; min-width: 0; font-weight: 600; font-size: 12px; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fr-row--me .fr-name { color: #047857; }
.fr-star { color: #f59e0b; font-size: 10px; margin-left: 3px; }
.fr-btn { flex-shrink: 0; border: 1px solid #c7d2fe; background: #eef2ff; color: #4338ca; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 999px; cursor: pointer; white-space: nowrap; font-family: inherit; }
.fr-btn:hover { background: #e0e7ff; }
.fr-btn:disabled { opacity: .5; cursor: default; }
.fr-btn--ok { border-color: #a7f3d0; background: #ecfdf5; color: #047857; }
.fr-btn--muted { border-color: #e2e8f0; background: #f8fafc; color: #94a3b8; }
.fr-btn--x { border: none; background: none; color: #cbd5e1; padding: 2px 4px; font-size: 12px; }
.fr-btn--x:hover { background: none; color: #ef4444; }
.fr-empty { font-size: 11px; color: #94a3b8; text-align: center; padding: 18px 0; }
.gsp-tab { white-space: nowrap; }  /* 요청 뱃지가 붙어도 '접속자'가 두 줄로 꺾이지 않게 */
.fr-req-badge { margin-left: 2px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 800; line-height: 16px; display: inline-block; }`;

    let cfg = null;
    let online = [];
    let presenceSeen = false;  // 접속자 목록을 받기 전엔 그리지 않는다 ("접속자 없음" 깜빡임 방지)
    let data = { friends: [], incoming: [], outgoing: [] };
    let reqBadge = null;
    const busy = new Set();

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function toast(msg, variant) {
        if (window.showToast) window.showToast(msg, variant || 'success');
    }
    // 사진·이름을 누르면 프로필 카드(base.html의 [data-hover-card] 모달)
    function cardAttrs(u) {
        return ` data-hover-card data-user-id="${u.user_id}" data-hover-stats="1" data-picture="${esc(u.card_picture || u.picture_url || '')}"`
            + ` data-nickname="${esc(u.display_name || '')}" data-fullname="${esc(u.full_name || '')}" style="cursor:pointer"`;
    }
    const GRADUATE = '<span title="졸업생" style="margin-left:3px;padding:0 4px;border-radius:999px;background:#eef2ff;color:#4338ca;font-size:9px;font-weight:800"><i class="fa-solid fa-graduation-cap"></i></span>';
    function avatar(u) {
        return u.picture_url
            ? `<img src="${esc(u.picture_url)}" alt="" class="fr-avatar"${cardAttrs(u)}>`
            : `<span class="fr-initial"${cardAttrs(u)}>${esc((u.display_name || '?').charAt(0))}</span>`;
    }
    const ids = list => new Set(list.map(u => u.user_id));

    async function post(url, body) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'X-CSRFToken': cfg.csrf, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        let json = {};
        try { json = await res.json(); } catch (e) { /* 빈 응답 */ }
        // 오류 페이지(HTML)가 오면 원인을 알 수 있게 상태 코드를 같이 보여준다
        if (!res.ok || json.ok === false) throw new Error(json.message || `처리하지 못했습니다. (오류 ${res.status})`);
        return json;
    }

    async function refresh() {
        try {
            const res = await fetch('/accounts/friends/', { headers: { 'Accept': 'application/json' } });
            if (res.ok) data = await res.json();
        } catch (e) { /* 다음 주기에 다시 시도 */ }
        draw();
    }

    function actionsFor(u, rel) {
        const id = u.user_id;
        const dis = busy.has(id) ? 'disabled' : '';
        if (rel === 'friend') {
            return (cfg.inviteGame ? `<button type="button" class="fr-btn fr-btn--ok" data-fr="invite" data-id="${id}" ${dis}>초대</button>` : '')
                + `<button type="button" class="fr-btn fr-btn--x" data-fr="remove" data-id="${id}" title="친구 삭제" ${dis}>×</button>`;
        }
        if (rel === 'incoming') {
            return `<button type="button" class="fr-btn fr-btn--ok" data-fr="accept" data-id="${id}" ${dis}>수락</button>`
                + `<button type="button" class="fr-btn fr-btn--muted" data-fr="decline" data-id="${id}" ${dis}>거절</button>`;
        }
        if (rel === 'outgoing') {
            return `<button type="button" class="fr-btn fr-btn--muted" data-fr="cancel" data-id="${id}" title="요청 취소" ${dis}>요청됨 ×</button>`;
        }
        return `<button type="button" class="fr-btn" data-fr="request" data-id="${id}" ${dis}><i class="fa-solid fa-user-plus"></i> 친구</button>`;
    }

    function row(u, rel, opts) {
        const isMe = u.user_id === cfg.myUserId;
        const cls = ['fr-row', isMe ? 'fr-row--me' : '', opts.offline ? 'fr-row--off' : ''].join(' ');
        const star = rel === 'friend' ? '<i class="fa-solid fa-star fr-star" title="친구"></i>' : '';
        const me = isMe ? ' <span class="text-[10px] text-emerald-500">(나)</span>' : '';
        return `<div class="${cls}">
            ${opts.noDot ? '' : '<span class="fr-dot"></span>'}
            ${avatar(u)}
            <span class="fr-name"><span${cardAttrs(u)}>${esc(u.display_name)}</span>${u.is_graduate ? GRADUATE : ''}${star}${me}</span>
            ${isMe ? '' : actionsFor(u, rel)}
        </div>`;
    }

    function draw() {
        if (!cfg || !presenceSeen) return;
        const friendIds = ids(data.friends), inIds = ids(data.incoming), outIds = ids(data.outgoing);
        const onlineIds = ids(online);
        const relOf = id => friendIds.has(id) ? 'friend' : inIds.has(id) ? 'incoming' : outIds.has(id) ? 'outgoing' : 'none';
        const parts = [];

        if (data.incoming.length) {
            parts.push(`<div class="fr-section"><i class="fa-solid fa-user-clock"></i> 받은 친구 요청 ${data.incoming.length}</div>`);
            parts.push(data.incoming.map(u => row(u, 'incoming', { noDot: true })).join(''));
        }
        parts.push(`<div class="fr-section"><i class="fa-solid fa-circle" style="color:#10b981;font-size:7px"></i> 접속 중 ${online.length}</div>`);
        // 나 → 친구 → 나머지 순
        const sorted = online.slice().sort((a, b) =>
            (b.user_id === cfg.myUserId) - (a.user_id === cfg.myUserId)
            || friendIds.has(b.user_id) - friendIds.has(a.user_id));
        parts.push(sorted.length
            ? sorted.map(u => row(u, relOf(u.user_id), {})).join('')
            : '<p class="fr-empty">접속자가 없습니다.</p>');

        const offline = data.friends.filter(u => !onlineIds.has(u.user_id));
        parts.push(`<div class="fr-section"><i class="fa-solid fa-user-group"></i> 친구 · 오프라인 ${offline.length}</div>`);
        parts.push(offline.length
            ? offline.map(u => row(u, 'friend', { offline: true })).join('')
            : `<p class="fr-empty">${data.friends.length ? '모든 친구가 접속 중이에요.' : '접속자 옆 [친구] 버튼으로 친구를 추가해 보세요.'}</p>`);

        cfg.listEl.innerHTML = parts.join('');
        if (cfg.countEl) cfg.countEl.textContent = online.length;
        if (reqBadge) {
            reqBadge.textContent = data.incoming.length;
            reqBadge.style.display = data.incoming.length ? '' : 'none';
        }
    }

    const ACTIONS = {
        request: id => post('/accounts/friends/request/', { user_id: id }).then(r =>
            toast(r.status === 'accepted' ? '친구가 되었어요!' : '친구 요청을 보냈어요.')),
        accept: id => post('/accounts/friends/respond/', { user_id: id, accept: true }).then(() => toast('친구가 되었어요!')),
        decline: id => post('/accounts/friends/respond/', { user_id: id, accept: false }),
        cancel: id => post('/accounts/friends/remove/', { user_id: id }),
        remove: id => {
            const f = data.friends.find(u => u.user_id === id);
            if (!confirm(`${f ? f.display_name : '이 친구'}님을 친구에서 삭제할까요?`)) return Promise.resolve();
            return post('/accounts/friends/remove/', { user_id: id });
        },
        invite: id => post('/game/invite/', { user_id: id, game: cfg.inviteGame }).then(() => toast('초대 알림을 보냈어요!')),
    };

    function onClick(e) {
        const btn = e.target.closest('[data-fr]');
        if (!btn || btn.disabled) return;
        const id = Number(btn.dataset.id);
        const action = ACTIONS[btn.dataset.fr];
        if (!action) return;
        busy.add(id);
        draw();
        action(id)
            .catch(err => toast(err.message, 'error'))
            .finally(() => { busy.delete(id); refresh(); });
    }

    // 친구 요청 알림을 눌러 들어오면(?friends=1) 접속자 탭을 바로 연다
    function openFromLink() {
        const params = new URLSearchParams(location.search);
        if (params.get('friends') !== '1') return;
        const pane = cfg.listEl.closest('.gsp-pane');
        const tab = pane && document.querySelector(`.gsp-tab[onclick*="${pane.id}"]`);
        if (tab) tab.click();
        if (cfg.fab && cfg.panel && getComputedStyle(cfg.fab).display !== 'none'
            && getComputedStyle(cfg.panel).display === 'none') cfg.fab.click();
        params.delete('friends');
        const qs = params.toString();
        history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
    }

    function mount(opts) {
        cfg = Object.assign({ inviteGame: null }, opts);
        if (!cfg.listEl) return;
        const style = document.createElement('style');
        style.textContent = STYLE;
        document.head.appendChild(style);
        if (cfg.countEl) {
            reqBadge = document.createElement('span');
            reqBadge.className = 'fr-req-badge';
            reqBadge.title = '받은 친구 요청';
            reqBadge.style.display = 'none';
            cfg.countEl.after(reqBadge);
        }
        cfg.listEl.addEventListener('click', onClick);
        refresh();
        setInterval(() => { if (!document.hidden) refresh(); }, 30000);
        document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
        openFromLink();
    }

    function render(users) {
        online = users || [];
        presenceSeen = true;
        draw();
    }

    window.FriendsPanel = { mount, render, refresh };
})();
