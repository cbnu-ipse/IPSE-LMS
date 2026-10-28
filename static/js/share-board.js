// 속성 노트·모의고사를 자유게시판에 올리고, 게시글 링크를 자동으로 복사한 뒤 짧게 알려 준다.
// 버튼: <button class="js-share-board" data-url="공유 POST 주소" data-csrf="토큰">
(function () {
    'use strict';

    function toast(message, kind) {
        if (typeof window.showToast === 'function') window.showToast(message, kind || 'success');
        else window.alert(message);
    }

    // 클립보드 복사: 요청이 끝난 뒤에는 브라우저가 '사용자 동작'으로 안 쳐 줄 수 있어 옛 방식으로 한 번 더 시도한다
    function copyText(text) {
        const legacy = function () {
            const box = document.createElement('textarea');
            box.value = text; box.setAttribute('readonly', ''); box.style.cssText = 'position:fixed;top:-1000px;opacity:0';
            document.body.appendChild(box); box.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
            box.remove();
            return ok;
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacy(); });
        }
        return Promise.resolve(legacy());
    }

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.js-share-board');
        if (!btn || btn.disabled) return;
        e.preventDefault();
        btn.disabled = true;
        const label = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i>올리는 중…';
        fetch(btn.dataset.url, { method: 'POST', credentials: 'same-origin', headers: { 'X-CSRFToken': btn.dataset.csrf } })
            .then(function (res) { return res.json().catch(function () { return {}; }); })
            .then(function (d) {
                if (!d.ok) { toast(d.error || '게시판에 올리지 못했어요. 잠시 후 다시 시도해주세요.', 'error'); return; }
                return copyText(d.url).then(function (copied) {
                    toast((d.created ? '게시판에 올렸어요. ' : '이미 올린 글이에요. ') + (copied ? '게시물 링크를 복사했어요.' : '링크: ' + d.url), 'success');
                });
            })
            .catch(function () { toast('게시판에 올리지 못했어요. 잠시 후 다시 시도해주세요.', 'error'); })
            .finally(function () { btn.disabled = false; btn.innerHTML = label; });
    });
})();
