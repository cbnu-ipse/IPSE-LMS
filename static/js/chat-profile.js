/*
 * 로비 채팅 메시지의 프로필 사진·이름을 누르면 프로필 카드(base.html의 [data-hover-card] 모달)가 열리게 한다.
 *
 *   ChatProfile.tag(messageEl, data)  // 실시간으로 받은 채팅 메시지 요소에 카드 정보를 붙인다
 *
 * 이전 채팅 기록(서버 렌더링)은 템플릿에서 같은 data-* 속성을 직접 붙인다.
 * 졸업생이면 이름 옆에 졸업생 마크도 붙인다.
 */
(function () {
    const GRADUATE_BADGE = '<span title="졸업생" style="display:inline-flex;align-items:center;gap:2px;margin:0 2px;padding:0 5px;'
        + 'border-radius:999px;background:#eef2ff;color:#4338ca;font-size:10px;font-weight:800;line-height:16px;'
        + 'vertical-align:middle;white-space:nowrap"><i class="fa-solid fa-graduation-cap"></i>졸업</span>';

    function setCard(el, data) {
        if (!el) return;
        el.setAttribute('data-hover-card', '');
        el.dataset.userId = data.user_id;
        el.dataset.hoverStats = '1';
        el.dataset.picture = data.card_picture || data.picture_url || '';
        el.dataset.nickname = data.display_name || data.username || '';
        el.dataset.fullname = data.full_name || '';
        el.style.cursor = 'pointer';
    }

    function tag(messageEl, data) {
        if (!messageEl || !data || !data.user_id) return;
        const avatar = messageEl.firstElementChild;  // 사진(img) 또는 이니셜(span)
        const name = messageEl.querySelector('.font-semibold');
        setCard(avatar, data);
        setCard(name, data);
        if (data.is_graduate && name) name.insertAdjacentHTML('afterend', GRADUATE_BADGE);
    }

    window.ChatProfile = { tag };
})();
