// Изпълнява се в браузъра (agent-browser eval --stdin): брои формулите и търси проблеми
(() => {
  const w = document.documentElement.clientWidth, main = document.querySelector('main');
  return JSON.stringify({
    katex: document.querySelectorAll('.katex').length,
    errors: [...document.querySelectorAll('.katex-error')].map(e => e.title || e.textContent).slice(0, 5),
    rawDollar: [...main.querySelectorAll('*')].filter(e => e.childElementCount === 0 && /\$[^$]+\$/.test(e.textContent)).map(e => e.textContent.slice(0, 60)).slice(0, 5),
    // формули извън екрана – освен ако са в контейнер с хоризонтално превъртане (таблици)
    overflow: [...main.querySelectorAll('.katex')]
      .filter(e => e.getBoundingClientRect().right > w + 1)
      .filter(e => { for (let p = e.parentElement; p && p !== main; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') return false; } return true; })
      .map(e => e.textContent.slice(0, 40)).slice(0, 5),
    width: w,
  });
})();
