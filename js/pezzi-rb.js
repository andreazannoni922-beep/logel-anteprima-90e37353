// Pezzi di React Bits montati come sono (codice della libreria in metodo/librerie/rb/pezzi, costruito con costruisci.mjs).
const fx = document.querySelector('.intro__fx');
if (fx && !fx.closest('.intro.done')) {
  import('./rb/electriclogo.js').then(({ monta }) => {
    const m = monta(fx, { src: 'img/marchio-pieno.svg', color: '#d6ecff', glowColor: '#046cc1', scale: .42, strands: 4, crackle: 1.6, arcs: 1.2, flicker: .5, fill: .12, speed: 2.6, interactive: false });
    addEventListener('logel:intro', () => setTimeout(() => m.smonta(), 900), { once: true });
  });
}
const topo = document.querySelector('.calibro__topo');
if (topo) new IntersectionObserver((en, o) => {
  if (!en[0].isIntersecting) return; o.disconnect();
  import('./rb/topography.js').then(({ monta }) => monta(topo, { color: '#046cc1', lineCount: 24, lineWidth: 1.1, elevation: .9, foreground: .15 }));
}, { rootMargin: '300px' }).observe(topo);

// carica un pezzo solo quando la sua sezione si avvicina
const quando = (el, fn, margin = '400px') => { if (!el) return; new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { o.disconnect(); fn(); } }, { rootMargin: margin }).observe(el); };

// tre frasi: fascio laser blu (React Bits LaserFlow) che colpisce il piano delle frasi
const laser = document.querySelector('.claims__laser');
quando(laser, () => import('./rb/laserflow.js').then(({ monta }) => monta(laser, {
  surfaceRef: { current: document.querySelector('.claims__piano') }, color: '#1f86ff', beamPosition: .5, intensity: 1.6, mouseInteraction: false,
})));

// certificati veri su carte olografiche (React Bits HoloCard)
document.querySelectorAll('[data-holo]').forEach(el => quando(el, () => import('./rb/holocard.js').then(({ monta }) => monta(el, {
  image: el.dataset.holo, width: innerWidth < 900 ? 220 : 260, foilColor: '#cfe3ff', preset: 'bursts', intensity: .8,
}))));

// marchio Logel in metallo liquido (React Bits MetallicPaint)
const metallo = document.querySelector('.foot__metallo');
quando(metallo, () => import('./rb/metallicpaint.js').then(({ monta }) => monta(metallo, { imageSrc: 'img/marchio-pieno.svg', scale: .62, speed: .8, mouseTilt: .6 })));

// settori: righe che scorrono con le foto vere (React Bits FlowingMenu)
const menu = document.querySelector('.settori__menu');
quando(menu, () => import('./rb/flowingmenu.js').then(({ monta }) => monta(menu, {
  items: [
    { link: '#calibro', text: 'Ceramica', image: 'img/linea-scelta.webp' },
    { link: '#settori', text: 'Marmo e pietra', image: 'img/meccanica.webp' },
    { link: '#cosa-facciamo', text: 'Macchine automatiche', image: 'img/bordo-macchina.webp' },
    { link: '#certificazioni', text: 'Nord America', image: 'img/quadro-macchina.webp' },
  ],
  textColor: '#f2f2f0', bgColor: '#0b0d10', marqueeBgColor: '#046cc1', marqueeTextColor: '#ffffff',
  borderColor: 'rgba(61,149,230,.35)', imageShape: 'rounded', speed: 70, ariaLabel: 'Settori',
})));
