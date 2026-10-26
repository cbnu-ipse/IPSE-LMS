// 수식 렌더링: 마크다운 렌더러가 $...$ / $$...$$ 를 <span class="md-math" data-tex="...">로 남겨 두면, 이 스크립트가 KaTeX를
// (처음 필요할 때만) 불러와 그려 준다. KaTeX를 못 불러오면 TeX 원문이 그대로 보인다 (요약은 항상 읽을 수 있다).
(function () {
    'use strict';
    const VERSION = '0.16.11', BASE = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/' + VERSION + '/';
    let loading = null;

    function loadKatex() {
        if (window.katex) return Promise.resolve(window.katex);
        if (loading) return loading;
        loading = new Promise((resolve, reject) => {
            const css = document.createElement('link');
            css.rel = 'stylesheet'; css.href = BASE + 'katex.min.css';
            document.head.appendChild(css);
            const js = document.createElement('script');
            js.src = BASE + 'katex.min.js'; js.async = true;
            js.onload = () => (window.katex ? resolve(window.katex) : reject(new Error('katex missing')));
            js.onerror = () => { loading = null; reject(new Error('katex load failed')); };
            document.head.appendChild(js);
        });
        return loading;
    }

    window.renderMath = function (root) {
        const nodes = Array.from((root || document).querySelectorAll('.md-math:not([data-done])'));
        if (!nodes.length) return Promise.resolve();
        return loadKatex().then((katex) => {
            nodes.forEach((node) => {
                node.dataset.done = '1';
                try {
                    katex.render(node.dataset.tex, node, { throwOnError: false, displayMode: node.dataset.display === '1' });
                } catch (e) { /* 원문 그대로 둔다 */ }
            });
        }).catch(() => {});
    };
})();
