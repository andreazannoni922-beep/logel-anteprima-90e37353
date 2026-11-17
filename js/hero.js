import { createQuadro, PARTS } from './quadro.js';
const hero = document.querySelector('.hero');
const canvas = hero.querySelector('.hero__gl');
const det = hero.querySelector('.hero__detail');
const btns = [...hero.querySelectorAll('.hero__reparti button')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const show = i => {
  hero.classList.toggle('is-focus', i >= 0);
  btns.forEach((b, k) => b.classList.toggle('is-on', k === i));
  if (i < 0) { det.hidden = true; return; }
  const p = PARTS[i];
  det.querySelector('.hero__dname').textContent = p.name;
  det.querySelector('.hero__ddesc').textContent = p.desc;
  det.querySelector('.hero__dstats').innerHTML = p.stats.map(([v, l]) => `<div><dt>${v}</dt><dd>${l}</dd></div>`).join('');
  det.hidden = false;
};

let q;
try {
  q = createQuadro({ canvas, host: hero, tip: hero.querySelector('.hero__tip'), reducedMotion: reduce, onFocus: show });
} catch (e) { console.warn('WebGL non disponibile', e); }
if (q) {
  if (window.__introDone) q.begin(); else addEventListener('logel:intro', () => q.begin(), { once: true });
  btns.forEach(b => b.addEventListener('click', () => { const i = +b.dataset.i; q.setFocus(btns[i].classList.contains('is-on') ? -1 : i); }));
  det.querySelector('.hero__back').addEventListener('click', () => q.setFocus(-1));
  addEventListener('scroll', () => q.setScroll(Math.min(1, scrollY / innerHeight)), { passive: true });
}
