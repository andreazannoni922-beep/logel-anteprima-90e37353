(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = window.gsap && window.ScrollTrigger;
  const desk = matchMedia('(min-width: 901px)');

  // menu telefono
  const burger = $('.nav__burger'), menu = $('.menu');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); menu.hidden = !open;
  });
  $$('.menu a').forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', false); menu.hidden = true; }));

  // menu che si nasconde scendendo e torna salendo
  const nav = $('.nav'); let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('solid', y > 80);
    nav.classList.toggle('hide', y > lastY && y > 600 && menu.hidden);
    lastY = y;
  }, { passive: true });

  // schede Progettazione / Produzione / Avviamento: avanzano da sole
  const tabBtns = $$('.tabs__nav button'), tabP = $$('.tabs__panels p'), tabImg = $$('.tabs__bg img');
  let tabI = 0, tabTween;
  const setTab = i => {
    if (!tabBtns.length) return;
    tabI = i;
    tabBtns.forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.querySelector('i').style.width = '0'; });
    tabP.forEach((p, k) => p.classList.toggle('is-on', k === i));
    tabImg.forEach((im, k) => im.classList.toggle('is-on', k === i));
    if (hasGsap && !reduce) {
      tabTween && tabTween.kill();
      tabTween = gsap.fromTo(tabBtns[i].querySelector('i'), { width: '0%' }, { width: '100%', duration: 6, ease: 'none', onComplete: () => setTab((tabI + 1) % tabBtns.length) });
    }
  };
  tabBtns.forEach((b, i) => b.addEventListener('click', () => setTab(i)));

  // settori: una voce aperta alla volta, cambia la foto
  const det = $$('.settori details'), setImg = $$('.settori__pic img');
  det.forEach((d, i) => d.addEventListener('toggle', () => {
    if (!d.open) return;
    det.forEach((o, k) => { if (k !== i) o.open = false; });
    setImg.forEach((im, k) => im.classList.toggle('is-on', k === i));
  }));

  const intro = $('.intro');
  if (!hasGsap || reduce) { intro.classList.add('done'); setTab(0); window.__introDone = true; dispatchEvent(new Event('logel:intro')); return; }

  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.1 }); window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -40 });
  }));

  // apertura: il marchio crepita di corrente, poi si spegne e lascia il quadro
  lenis.stop();
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { intro.classList.add('done'); lenis.start(); setTab(0); } });
  tl.call(() => { window.__introDone = true; dispatchEvent(new Event('logel:intro')); }, null, 2.9);
  tl.from('.intro__fx', { opacity: 0, scale: .92, duration: .9 }, 0)
    .to('.intro__line span', { opacity: 1, duration: .25, stagger: .08 }, .6)
    .to('.intro__fx', { scale: 1.6, opacity: 0, filter: 'blur(10px)', duration: .9, ease: 'expo.in' }, 2.3)
    .to('.intro__line', { opacity: 0, duration: .4 }, 2.3)
    .to(intro, { opacity: 0, duration: .5 }, 2.9)
    .from('.hero__title .ln>span', { yPercent: 105, duration: 1.1, stagger: .1, ease: 'expo.out' }, 3.0)
    .from('.hero__lead, .hero__cta, .hero__reparti, .hero__cue, .nav', { opacity: 0, y: 16, duration: .8, stagger: .08 }, 3.2);

  // hero: si stringe dentro la cornice mentre si scende
  gsap.to('.hero__copy, .hero__reparti, .hero__cue', { y: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '18% top', scrub: true } });

  // tre frasi: si scoprono una dopo l'altra, la traccia di corrente corre sotto
  const claims = $$('.claim span'), trace = $('.claims__trace path'), len = trace.getTotalLength();
  gsap.set(trace, { strokeDasharray: len, strokeDashoffset: len });
  const ctl = gsap.timeline({ scrollTrigger: { trigger: '.claims', start: 'top top', end: 'bottom bottom', scrub: .6 } });
  ctl.to(trace, { strokeDashoffset: 0, ease: 'none', duration: 3 }, 0);
  gsap.set(claims[0], { clipPath: 'inset(0 0 0% 0)' });
  claims.forEach((c, i) => {
    if (i) ctl.fromTo(c, { clipPath: 'inset(0 0 100% 0)', y: 40 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: .45 }, i - .2);
    ctl.to(c, { clipPath: 'inset(100% 0 0% 0)', y: -40, duration: .45 }, i + .7 + (i === claims.length - 1 ? .3 : 0));
  });

  // parallasse foto

  // titoli che salgono
  $$('.h2').forEach(h => { if (h.closest('.flusso, .arco')) return; gsap.from(h, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } }); });

  gsap.from('.modelli li', { y: 40, opacity: 0, duration: .9, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.modelli', start: 'top 85%' } });
  gsap.from('.foot__big a', { xPercent: -6, opacity: 0, duration: 1, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 80%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
