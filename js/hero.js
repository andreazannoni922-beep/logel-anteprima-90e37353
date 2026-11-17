import { createQuadro, PARTS } from './quadro.js';
const hero = document.querySelector('.hero');
const pin = hero.querySelector('.hero__pin');
const canvas = hero.querySelector('.hero__gl');
const det = hero.querySelector('.hero__detail');
const btns = [...hero.querySelectorAll('.hero__reparti button')];
const box = hero.querySelector('.hero__callouts');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// richiami del quadro aperto: nome del reparto e una riga vera
const NOTE = ['Armadi forati sul Perforex', 'Canaline e cavi siglati', 'Siemens · Beckhoff · Omron', 'Schede e firmware su misura', 'Interruttori e morsettiere', 'HMI in C# e Visual C++'];
const SIDE = [-1, 1, 1, 1, -1, 1]; // da che parte esce il richiamo
const calls = PARTS.map((p, i) => {
  const d = document.createElement('div'); d.className = 'callout' + (SIDE[i] < 0 ? ' sx' : '');
  d.innerHTML = `<i></i><span><b>${p.name}</b><small>${NOTE[i]}</small></span>`; box.appendChild(d); return d;
});

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

const onFrame = ({ pts, open }) => {
  const pr = pin.getBoundingClientRect();
  calls.forEach((c, i) => {
    const vis = clampN((open - 0.55 - i * 0.04) / 0.25);
    c.style.opacity = vis;
    const w = c.offsetWidth;
    const x = pts[i][0] - pr.left + (SIDE[i] < 0 ? -w : 0), y = pts[i][1] - pr.top - c.offsetHeight / 2;
    c.style.transform = `translate(${x}px, ${y}px)`;
  });
};
const clampN = v => Math.max(0, Math.min(1, v));

let q;
try {
  q = createQuadro({ canvas, host: pin, tip: hero.querySelector('.hero__tip'), reducedMotion: reduce, onFocus: show, onFrame });
} catch (e) { console.warn('WebGL non disponibile', e); }
if (q) {
  if (window.__introDone) q.begin(); else addEventListener('logel:intro', () => q.begin(), { once: true });
  btns.forEach(b => b.addEventListener('click', () => { const i = +b.dataset.i; q.setFocus(btns[i].classList.contains('is-on') ? -1 : i); }));
  det.querySelector('.hero__back').addEventListener('click', () => q.setFocus(-1));
  const upd = () => { const r = hero.getBoundingClientRect(); const s = clampN(-r.top / Math.max(1, r.height - innerHeight)); q.setScroll(s); if (s > 0.08) q.setFocus(-1); };
  addEventListener('scroll', upd, { passive: true }); upd();
}
