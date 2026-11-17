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
