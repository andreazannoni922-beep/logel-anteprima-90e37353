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
  if (!hasGsap || reduce) { intro.classList.add('done'); setTab(0); return; }

  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -40 });
  }));

  // apertura: i cinque scatti entrano, quello centrale si allarga fino a diventare la hero
  lenis.stop();
  const main = $('.intro__tile--main');
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { intro.classList.add('done'); lenis.start(); setTab(0); } });
  tl.to('.intro__tile', { opacity: 1, y: 0, duration: .7, stagger: .08 })
    .to('.intro__line span', { opacity: 1, duration: .25, stagger: .07 }, '-=.3')
    .to('.intro__tile:not(.intro__tile--main), .intro__line', { opacity: 0, duration: .45, ease: 'power2.in' }, '+=.45')
    .add(() => {
      const r = main.getBoundingClientRect();
      gsap.set(main, { position: 'fixed', left: r.left, top: r.top, width: r.width, height: r.height, margin: 0 });
    })
    .to(main, { left: 0, top: 0, width: innerWidth, height: innerHeight, duration: 1.1, ease: 'expo.inOut' })
    .to(intro, { opacity: 0, duration: .5 }, '-=.15')
    .from('.hero__title .ln>span', { yPercent: 105, duration: 1.1, stagger: .1, ease: 'expo.out' }, '-=.55')
    .from('.hero__lead, .hero__cta, .hero__frame, .nav', { opacity: 0, y: 16, duration: .8, stagger: .08 }, '-=.8');

  // hero: si stringe dentro la cornice mentre si scende
  gsap.to('.hero__media', { clipPath: 'inset(96px 48px 24px 48px)', ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__copy', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });

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
  gsap.from('.come__img', { y: 80, ease: 'none', scrollTrigger: { trigger: '.come', scrub: true } });
  gsap.fromTo('.fascia__img', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.fascia', scrub: true } });
  gsap.from('.fascia .h2', { opacity: 0, y: 60, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.fascia', start: 'top 55%' } });

  // titoli che salgono
  $$('.h2').forEach(h => { if (h.closest('.fascia')) return; gsap.from(h, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } }); });

  // cosa facciamo: fila orizzontale bloccata su computer
  ScrollTrigger.matchMedia({
    '(min-width: 901px)': () => {
      const track = $('.servizi__track');
      gsap.to(track, {
        x: () => -(track.scrollWidth - innerWidth), ease: 'none',
        scrollTrigger: { trigger: '.servizi', start: 'top top', end: () => '+=' + (track.scrollWidth - innerWidth), pin: true, scrub: .8, invalidateOnRefresh: true }
      });
      // processo: la foto fissa segue il passaggio attivo
      const steps = $$('.step'), pics = $$('.processo__pic img'), tag = $('.processo__tag b');
      steps.forEach((s, i) => ScrollTrigger.create({
        trigger: s, start: 'top 55%', end: 'bottom 55%',
        onToggle: st => { if (!st.isActive) return; steps.forEach((o, k) => o.classList.toggle('is-on', k === i)); pics.forEach((p, k) => p.classList.toggle('is-on', k === i)); tag.textContent = s.querySelector('h3').textContent; }
      }));
    },
    '(max-width: 900px)': () => {
      $$('.card').forEach(c => gsap.from(c, { y: 50, opacity: 0, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 90%' } }));
    }
  });

  gsap.from('.modelli li', { y: 40, opacity: 0, duration: .9, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.modelli', start: 'top 85%' } });
  gsap.from('.cta__strip img', { yPercent: 25, duration: 1.2, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.cta__strip', start: 'top 95%' } });
  gsap.from('.foot__big a', { xPercent: -6, opacity: 0, duration: 1, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 80%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
