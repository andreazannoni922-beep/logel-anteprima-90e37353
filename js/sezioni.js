// Sezioni sotto la hero, ognuna dal codice di una libreria:
// reparti = Cordex (MotionSites) · processo = task-cables (UberDesigner)
// calibro = Technical Specifications (MotionSites) · chiusura = arc-charge (UberDesigner)
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, u) => a + (b - a) * u;
const eIO = u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
const eOut = u => 1 - Math.pow(1 - clamp(u), 5);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = () => innerWidth <= 900;
// avanzamento di una sezione "a palco fisso": 0 quando entra in cima, 1 quando sta per uscire
const progress = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };

/* ---------- COSA FACCIAMO (Cordex) ---------- */
const REPARTI = [
  { label: 'Quadri e bordo macchina', title: 'Quadri elettrici e bordo macchina', href: 'https://www.logel.it/it/prodotti/settore-elettromeccanico/7/', thumb: 'img/quadro-macchina.webp',
    specs: [{ k: 'Progetto', v: '3 postazioni EPLAN, 2 Pro Panel, 2 SPAC' }, { k: 'Produzione', v: 'Quadri di comando, bordo macchina, cablaggi strutturati e di linea' }, { k: 'Certificazione', tag: 'UL508A · USA e Canada' }, { k: 'Avviamento', v: 'In Italia e all’estero' }] },
  { label: 'Software PLC', title: 'Software PLC e supervisione', href: 'https://www.logel.it/it/prodotti/settore-software/6/', thumb: 'img/pannello-operatore.webp',
    specs: [{ k: 'PLC', v: 'Siemens S7 / TIA Portal, Allen Bradley, Beckhoff, Omron, Saia' }, { k: 'Controlli numerici', v: 'Esa Automation, Siemens' }, { k: 'Robot', v: 'ABB, Fanuc, Kuka' }, { k: 'Supervisione', v: 'Interfacce in C# e Visual C++' }] },
  { label: 'Schede elettroniche', title: 'Schede elettroniche su misura', href: 'https://www.logel.it/it/prodotti/settore-elettronico/5/', thumb: 'img/scheda.webp',
    specs: [{ k: 'Progetto', v: 'OrCAD e Altium Designer, meccanica in 2D e 3D' }, { k: 'Firmware', v: 'Microcontrollori NXP fino a 32 bit, FPGA Lattice in Verilog' }, { k: 'Collaudo', tag: 'Camera climatica · pre-compliance EMC' }] },
  { label: 'Calibro Planar', title: 'Calibro Planar', href: '#calibro', thumb: 'img/linea-scelta.webp',
    specs: [{ k: 'Misura', v: 'Planarità, spessore e diagonali delle piastrelle, in linea' }, { k: 'Precisione', tag: '± 0,1 mm' }, { k: 'Formati', v: 'Da 120 × 120 a 650 × 650 mm' }] },
  { label: 'Carpenterie su disegno', title: 'Carpenterie su disegno', href: 'https://www.logel.it/it/prodotti/lavorazioni-carpenterie-su-disegno/51/', thumb: 'img/perforex.webp',
    specs: [{ k: 'Macchina', v: 'Centro di lavoro Rittal Perforex MT 2101' }, { k: 'Lavorazioni', v: 'Armadi e piastre per tutti i settori, su disegno' }, { k: 'Archivio', v: 'Ogni lavorazione salvata con le sue quote' }] },
];
(() => {
  const sec = $('.reparti'); if (!sec) return;
  const scenes = $$('.scena', sec), menu = $('.reparti__menu', sec), card = $('.reparti__card', sec);
  const opts = REPARTI.map((r, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'opt' + (i ? '' : ' is-on'); b.setAttribute('role', 'tab');
    b.innerHTML = `${r.label}<img alt="" src="${r.thumb}" loading="lazy">`;
    b.addEventListener('click', () => go(i, true)); menu.appendChild(b); return b;
  });
  let index = -1;
  const render = i => {
    const r = REPARTI[i];
    card.innerHTML = `<h3>${r.title}</h3>` + r.specs.map(s => `<div class="spec"><b></b><div><small>${s.k}</small>${s.tag ? `<span class="tag">${s.tag}</span>` : `<span>${s.v}</span>`}</div></div>`).join('')
      + `<a class="link" href="${r.href}">Scopri il reparto <i>→</i></a>`;
  };
  const go = (i, fromClick) => {
    i = clamp(i, 0, REPARTI.length - 1);
    if (i !== index) {
      index = i; scenes.forEach((s, k) => s.classList.toggle('is-on', k === i)); opts.forEach((o, k) => o.classList.toggle('is-on', k === i)); render(i);
      if (mobile()) { const a = opts[i].getBoundingClientRect(), m = menu.getBoundingClientRect(); menu.scrollBy({ left: a.left + a.width / 2 - (m.left + m.width / 2), behavior: 'smooth' }); }
    }
    if (fromClick) { const top = sec.offsetTop + (i / (REPARTI.length - 1)) * (sec.offsetHeight - innerHeight) * .9; window.__lenis ? window.__lenis.scrollTo(top) : scrollTo({ top, behavior: 'smooth' }); }
  };
  go(0);
  const tick = () => go(Math.round(clamp(progress(sec) / .9) * (REPARTI.length - 1)));
  addEventListener('scroll', tick, { passive: true });
})();

/* ---------- PROCESSO (task-cables) ---------- */
const FASI = [
  { t: 'Disegno', d: 'Schema elettrico, fascicoli costruttivi e distinta in EPLAN e Pro Panel.', img: 'img/officina.webp', x: 60, y: 300 },
  { t: 'Carpenteria', d: 'Fori, asole e piastre sul Rittal Perforex, dalle quote del progetto.', img: 'img/perforex.webp', x: 400, y: 560 },
  { t: 'Cablaggio', d: 'Quadri, bordo macchina e cablaggi strutturati, cablati e siglati in officina.', img: 'img/canaline.webp', x: 760, y: 250 },
  { t: 'Collaudo', d: 'Banchi di test, camera climatica e prove di pre-compliance elettromagnetica.', img: 'img/componente.webp', x: 1060, y: 560 },
  { t: 'Avviamento', d: 'Installazione e messa in servizio sulla linea del cliente, in Italia e all’estero.', img: 'img/linea.webp', x: 1290, y: 160 },
];
(() => {
  const sec = $('.flusso'); if (!sec) return;
  const nodiEl = $('.flusso__nodi', sec), svg = $('.flusso__cavi', sec), mondo = $('.flusso__mondo', sec), vista = $('.flusso__vista', sec);
  const NS = 'http://www.w3.org/2000/svg';
  const nodi = FASI.map(f => {
    const n = document.createElement('div'); n.className = 'nodo'; n.style.left = f.x + 'px'; n.style.top = f.y + 'px';
    n.innerHTML = `<div class="nodo__fill"></div><img src="${f.img}" alt="" loading="lazy"><h3>${f.t}</h3><p>${f.d}</p><div class="nodo__ring"></div>`;
    nodiEl.appendChild(n); return n;
  });
  // porte e cavi (porta d'uscita a destra a metà foto, porta d'ingresso a sinistra)
  const out = i => [FASI[i].x + 300, FASI[i].y + 110], inn = i => [FASI[i].x, FASI[i].y + 110];
  const porte = [];
  const cavi = [];
  for (let i = 0; i < FASI.length - 1; i++) {
    const [ax, ay] = out(i), [bx, by] = inn(i + 1), mx = (ax + bx) / 2;
    const d = `M${ax},${ay} C${mx + 40},${ay} ${mx - 40},${by} ${bx},${by}`;
    const g = document.createElementNS(NS, 'g');
    const mk = (stroke, w, extra = {}) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke', stroke); p.setAttribute('stroke-width', w); for (const k in extra) p.setAttribute(k, extra[k]); g.appendChild(p); return p; };
    mk('rgba(255,255,255,.22)', 1.6);
    const lit = [mk('rgba(61,149,230,.12)', 22, { pathLength: 1, 'stroke-dasharray': '1 1' }), mk('rgba(61,149,230,.3)', 9, { pathLength: 1, 'stroke-dasharray': '1 1' }), mk('#4ea6f0', 2.4, { pathLength: 1, 'stroke-dasharray': '1 1' })];
    const pulse = [mk('rgba(200,230,255,.12)', 18, { pathLength: 1, 'stroke-dasharray': '.07 2' }), mk('rgba(200,230,255,.35)', 8, { pathLength: 1, 'stroke-dasharray': '.07 2' }), mk('#ffffff', 3.4, { pathLength: 1, 'stroke-dasharray': '.07 2' })];
    svg.appendChild(g);
    const path = lit[2];
    cavi.push({ lit, pulse, path, len: 0 });
  }
  FASI.forEach((f, i) => {
    [i ? inn(i) : null, i < FASI.length - 1 ? out(i) : null].forEach(p => {
      if (!p) return; const el = document.createElement('div'); el.className = 'porta'; el.style.left = p[0] + 'px'; el.style.top = p[1] + 'px'; el.innerHTML = '<i></i>'; nodiEl.appendChild(el); porte.push({ el: el.firstChild, node: p === inn(i) ? i : i, kind: i && p[0] === f.x ? 'in' : 'out', i });
    });
  });
  const portEls = $$('.porta i', nodiEl);
  let fit = 1, cx = 800, cy = 450, cz = 1;
  const layout = () => {
    if (mobile()) return;
    const W = vista.clientWidth, H = vista.clientHeight;
    fit = Math.min(W / 1700, (H - 120) / 1000);
    cavi.forEach(c => { c.len = c.path.getTotalLength(); });
  };
  layout(); addEventListener('resize', layout);
  const frame = () => {
    requestAnimationFrame(frame);
    if (mobile()) {
      const r = sec.getBoundingClientRect();
      nodi.forEach(n => { const b = n.getBoundingClientRect(); const on = b.top < innerHeight * .6; n.querySelector('.nodo__fill').style.opacity = on ? .55 : 0; });
      return;
    }
    const p = reduce ? 1 : progress(sec);
    const steps = FASI.length - 1, s = clamp(p * 1.08) * steps; // ultimi istanti fermi sull'ultimo nodo
    let tx = 800, ty = 450, tz = 1;
    cavi.forEach((c, k) => {
      const u = clamp(s - k);
      const off = 1 - eIO(u);
      c.lit.forEach(l => l.setAttribute('stroke-dashoffset', off));
      c.pulse.forEach(l => { l.setAttribute('stroke-dashoffset', .07 - u * 1.07); l.style.opacity = u > 0 && u < 1 ? 1 : 0; });
      if (u > 0 && u < 1 && c.len) { const pt = c.path.getPointAtLength(c.len * u); tx = pt.x; ty = pt.y; tz = 1.35; }
    });
    nodi.forEach((n, i) => {
      const reached = s - (i - 1); // il nodo i si accende quando il cavo i-1 arriva
      const on = i === 0 ? clamp(s * 4 + .3) : clamp(reached);
      const flash = i === 0 ? 0 : Math.exp(-Math.max(0, reached - 1) * 6) * (reached >= 1 ? 1 : 0);
      n.querySelector('.nodo__fill').style.opacity = on >= 1 ? .55 : 0;
      n.querySelector('.nodo__ring').style.opacity = flash;
      n.style.transform = `scale(${1 + flash * .04})`;
    });
    portEls.forEach((e, k) => { e.style.opacity = clamp(s * 2 - k * .5 + .5); });
    if (tz === 1) { const i = Math.round(s); const f = FASI[clamp(i, 0, steps)]; tx = lerp(800, f.x + 150, .45); ty = lerp(450, f.y + 160, .45); tz = 1.1; }
    if (p <= 0.001) { tx = 800; ty = 470; tz = 1; }
    cx = lerp(cx, tx, .08); cy = lerp(cy, ty, .08); cz = lerp(cz, tz, .06);
    const W = vista.clientWidth, H = vista.clientHeight, z = fit * cz;
    const drift = Math.sin(performance.now() / 2400) * .6;
    mondo.style.transform = `translate(${W / 2 + W * .06}px, ${H / 2 + 60}px) rotateX(${8 + drift}deg) rotateY(${-6 - drift}deg) scale(${z}) translate(${-cx}px, ${-cy}px)`;
  };
  requestAnimationFrame(frame);
})();

/* ---------- CALIBRO (Technical Specifications) ---------- */
(() => {
  const el = $('[data-tspec]'); if (!el) return;
  const rows = [
    { label: 'Formati controllabili', note: 'da 120 × 120 a 650 × 650 mm', v: 650 / 700, rs: 120 / 700, re: 650 / 700, val: '120 – 650 mm' },
    { label: 'Velocità del traino', note: 'da 3 a 60 m/min', v: 1, rs: 3 / 60, re: 1, val: '3 – 60 m/min' },
    { label: 'Temperatura d’esercizio', note: 'da 0 a 60 °C', v: 1, rs: 0, re: 1, val: '0 – 60 °C' },
    { label: 'Campo dei sensori planar', note: 'telecamere fino a 60 mm', v: 35 / 60, rs: 0, re: 1, val: '35 mm' },
  ];
  el.innerHTML = `<div class="tspec__head">Evo-Plan · campo di lavoro<span>Precisione ± 0,1 mm</span></div><div class="tspec__bars">` + rows.map((r, i) => {
    const sparks = [.2, .38, .55, .7, .85, .97].map((x, j) => `<i class="tspec__spark" style="--x:${(x * r.v * 100).toFixed(1)}%;--y:${j % 2 ? 62 : 34}%;--pd:${j * 70}ms"></i>`).join('');
    return `<div class="tspec__row" style="--v:${(r.v * 100).toFixed(1)}%;--rs:${(r.rs * 100).toFixed(1)}%;--rw:${((r.re - r.rs) * 100).toFixed(1)}%;--d:${i * 90}ms"><div><strong>${r.label}</strong><small>${r.note}</small></div><div class="tspec__track"><div class="tspec__range"></div><div class="tspec__bar"></div><b class="tspec__val">${r.val}</b>${sparks}</div></div>`;
  }).join('') + `</div>`;
  new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { el.classList.add('is-ready'); o.disconnect(); } }, { threshold: .35 }).observe(el);
})();

/* ---------- CHIUSURA (arc-charge, shader originale; colori Logel; tempo legato allo scroll) ---------- */
(() => {
  const sec = $('.arco'); if (!sec) return;
  const cv = $('.arco__gl', sec);
  const gl = cv.getContext('webgl2', { antialias: false });
  if (!gl) return;
  const VS = `#version 300 es
in vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
  const FS = `#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uDpr,uT;
uniform float uA,uOn,uIdle,uFront,uFlash,uSpark,uBeam;
uniform vec3 uC1,uC2,uCam,uView;
out vec4 o;
const float PI=3.14159265,X0=170.,X1=910.,Y=640.;
uniform float uLevel;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec2(17.1,3.7);a*=.5;}return s;}
float env(float x){float u=clamp((x-X0)/(X1-X0),0.,1.);return pow(max(sin(PI*u),0.),.85);}
float fil(vec2 p,float seed,float A,float sp){
 float t=uT*sp;
 float y=Y+env(p.x)*A*((fbm(vec2(p.x*.0075+seed,t))-.5)*2.4+(noise(vec2(p.x*.05+seed*3.,t*2.7))-.5)*.42+(noise(vec2(p.x*.19+seed,t*6.))-.5)*.12);
 return abs(p.y-y);}
void main(){
 vec2 sp=(vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uDpr-uView.xy)/uView.z+vec2(540.);
 vec2 p=uCam.xy+(sp-vec2(540.))/uCam.z;
 vec3 col=vec3(.006,.006,.009);
 {vec2 g=floor(p/46.);vec2 q=(g+vec2(h21(g+1.3),h21(g+7.7))*.8+.1)*46.;float r=length(p-q);
  col+=uC1*(.25+.75*h21(g+3.))*exp(-r*r/(1.2+2.*h21(g)))*.5*smoothstep(1.1,2.2,uCam.z)*exp(-abs(p.y-Y)/160.);}
 float inX=smoothstep(X0-3.,X0,p.x)*smoothstep(X1+3.,X1,p.x);
 float ox=max(max(X0-p.x,p.x-X1),0.);float soft=exp(-ox*ox/(150.*150.));
 float ex=env(p.x);
 float front=X0+(X1-X0)*uFront;
 float fz=front+900.*smoothstep(.96,1.,uFront);
 float lit=smoothstep(fz+6.,fz-30.,p.x);float litS=smoothstep(fz+90.,fz-90.,p.x);
 float dy=abs(p.y-Y);
 float tt=floor(uT*24.);
 float fl=.7+.3*noise(vec2(tt,1.));
 float snap=1.+.55*smoothstep(.72,.9,noise(vec2(floor(uT*9.),4.)));
 col+=uC1*uIdle*(mix(soft,inX,exp(-dy/8.))*.22/(dy+1.)+soft*.05*exp(-dy/30.))*(.4+.6*ex);
 if(uOn>0.){
  vec3 hot=vec3(1.)*.75+uC2*.4;
  float A=uA*snap;
  float d=fil(p,0.,A,1.3);
  float core=(.7+.55*uLevel)*1.15/(d+.75);
  vec3 arc=hot*core*mix(soft,inX*smoothstep(0.,.04,ex),exp(-d/8.));vec3 gw=uC2*exp(-d/7.)*.55+uC1*exp(-d/42.)*.32;
  for(int i=1;i<5;i++){float fi=float(i);
   float vis=smoothstep(.38,.62,noise(vec2(floor(uT*(5.+fi)),fi*7.)))*smoothstep(fi*.2-.1,fi*.2+.06,uLevel);
   float di=fil(p,fi*5.37,A*(1.25+.2*fi),1.+.25*fi);
   arc+=hot*.42/(di+.9)*vis*uA/(uA+12.)*mix(soft,inX*smoothstep(0.,.04,ex),exp(-di/8.));gw+=uC1*exp(-di/18.)*.1*vis;
  }
  col+=(arc*mix(litS,lit,exp(-d/8.))+gw*soft*smoothstep(fz+70.,fz-70.,p.x))*uOn*fl;
  col+=uC1*uOn*smoothstep(fz+160.,fz-160.,p.x)*(exp(-dy/420.)*.075+exp(-dy/150.)*.1+exp(-dy/50.)*.1*(.3+.7*ex))*fl*(.6+.6*uLevel)/uCam.z;
  if(uFront<1.){vec2 q=p-vec2(front,Y);col+=(hot*1.6/(length(q*vec2(.3,1.))*.5+1.)+uC2*exp(-length(q*vec2(.5,1.))/9.)+uC1*exp(-length(q)/30.)*.6)*uOn;}
  for(int i=0;i<34;i++){float fi=float(i);float h=h21(vec2(fi,1.7)),h2=h21(vec2(fi,9.1));
   float L=.35+h*.55;float k=uT/L+h2;float id=floor(k);k=fract(k);
   float sx=mix(X0+20.,X1-20.,h21(vec2(fi,id)));
   vec2 v=vec2((h21(vec2(id,fi))-.5)*220.,-(40.+220.*h21(vec2(id+3.,fi)))*(h2>.3?1.:-1.));
   vec2 pos=vec2(sx,Y)+v*k*L+vec2(0.,420.*k*k*L*L);
   vec2 dv=p-pos;vec2 vn=normalize(v+vec2(0.,840.*k*L));
   float al=dot(dv,vn),pe=length(dv-vn*al);
   col+=(hot*.9+uC2)*uSpark*pow(1.-k,2.)*exp(-pe*pe/1.2)*exp(-al*al/(40.+60.*(1.-k)))*step(sx,front);}
 }
 col+=((vec3(1.)*.8+uC2*.4)*(1./(dy+.8))*mix(soft,inX,exp(-dy/8.))+uC2*exp(-dy/9.)*.5+uC1*(exp(-dy/60.)*.22+exp(-dy/190.)*.1))*uBeam*soft*(.35+.65*ex);
 for(int i=0;i<2;i++){vec2 e=vec2(i==0?X0:X1,Y);float r=length(p-e);
  float on=i==0?max(uOn,uBeam):max(uOn*step(1.,uFront),uBeam);
  col+=mix(uC1*uIdle,vec3(1.)*.8+uC2*.5,on)*(1.3/(r*r*.12+1.)+.25*exp(-r/22.)*on);}
 {float u=(p.x-X0)/(X1-X0);float idx=floor(u*24.);float cx=X0+(idx+.5)*(X1-X0)/24.;float ty=Y+116.;
  float bar=smoothstep(1.6,.8,abs(p.x-cx))*smoothstep(7.,6.,abs(p.y-ty))*step(0.,u)*step(u,1.);
  float on=step((idx+.5)/24.,uLevel);
  col+=mix(vec3(.075),uC2*1.2+.15,on)*bar+uC1*on*.1*exp(-abs(p.y-ty)/12.)*smoothstep(-.03,.02,u)*smoothstep(uLevel+.03,uLevel-.03,u);}
 vec2 c=p-vec2(540.,Y);
 col+=(uC2*.8+vec3(.4))*uFlash*(exp(-abs(c.y)/2.2)*exp(-abs(c.x)/420.)*1.3+exp(-length(c*vec2(.5,1.))/100.)*.8+exp(-length(c)/360.)*.25);
 col+=uC1*uBeam*(exp(-dy/420.)*.07);
 col*=1.-.3*smoothstep(420.,900.,length(sp-vec2(540.)));
 col=1.-exp(-col*1.35);
 col+=(h21(sp+fract(uT*7.))-.5)/255.;
 o=vec4(col,1.);}`;
  const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(x)); return x; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const al = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['uRes', 'uDpr', 'uT', 'uA', 'uOn', 'uIdle', 'uFront', 'uFlash', 'uSpark', 'uBeam', 'uC1', 'uC2', 'uLevel', 'uCam', 'uView'].forEach(n => U[n] = gl.getUniformLocation(pr, n));

  // palette: brace → ambra → blu Logel → blu chiaro; a pieno il fascio è blu Logel (al posto della menta)
  const STOPS = [[.04, [[.9, .16, .05], [1, .5, .2]]], [.3, [[1, .48, .06], [1, .8, .45]]], [.6, [[.02, .3, .9], [.45, .75, 1]]], [.92, [[.16, .42, 1], [.8, .9, 1]]]];
  const FULL = [[.02, .42, .86], [.7, .88, 1]];
  const mix3 = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
  const mixP = (a, b, u) => a.map((v, i) => mix3(v, b[i], u));
  const palL = l => { for (let i = 0; i < STOPS.length - 1; i++) { const [a, A] = STOPS[i], [b, B] = STOPS[i + 1]; if (l <= b) return mixP(A, B, eIO((l - a) / (b - a))); } return STOPS[3][1]; };
  const T0 = .5, TS = .9, TA = 2.4, TF = 6.2, X0 = 170, X1 = 910, LY = 640;
  const state = t => {
    const chg = clamp((t - TA) / (TF - TA));
    let level = .04; if (t >= TA && t < TF) level = .04 + .96 * (1 - Math.pow(1 - chg, 1.5)); else if (t >= TF) level = 1;
    const fu = clamp((t - TS) / (TA - TS)); const front = t < TS ? 0 : fu * fu * (1.7 - .7 * fu);
    const calm = eIO((t - TF + .25) / .35);
    const on = t >= T0 && t < TF + .1 ? eOut((t - T0) / .2) * (1 - clamp((t - TF) / .1)) : 0;
    const A = lerp(lerp(10, 58, Math.pow(level, .8)), 0, calm);
    const beam = t >= TF ? eOut((t - TF) / .2) * (.8 + .2 * Math.exp(-(t - TF) * 3)) : 0;
    const flash = (t >= TA ? Math.exp(-(t - TA) * 5.5) * .9 : 0) + (t >= TF ? Math.exp(-(t - TF) * 3.2) * 1.5 : 0);
    let P = palL(level); if (t >= TF - .1) P = mixP(palL(1), FULL, eIO((t - TF + .1) / .4));
    const idle = t < TA ? .75 + .25 * Math.sin(t * 3) : 0;
    const zin = eIO((t - T0) / .4), zout = eIO((t - TA + .05) / .9), k = zin * (1 - zout);
    const cam = [lerp(540, X0 + (X1 - X0) * front + 30 * fu * (1 - fu) * 4 + Math.sin(t * 37) * 2 * k, k), lerp(540, LY - 26 + Math.cos(t * 29) * 2 * k, k), 1 + 2.5 * k];
    return { cam, level, front, on, A, beam, flash, P, idle, spark: on * (t >= TA ? 1 : 0) * (1 - calm) * clamp(level * 1.4 - .1) };
  };
  const DPR = Math.min(2, devicePixelRatio || 1);
  const view = { cx: 0, cy: 0, s: 1 };
  const fit = () => { const W = cv.clientWidth, H = cv.clientHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); view.cx = W / 2; view.cy = H / 2 + H * .2; view.s = Math.min(W, H) / 1080; };
  fit(); addEventListener('resize', fit);
  let tShown = 0, visible = false, live = 0;
  new IntersectionObserver(en => { visible = en[0].isIntersecting; }).observe(sec);
  const draw = (tl, time) => {
    const s = state(tl);
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform3f(U.uView, view.cx, view.cy, view.s); gl.uniform1f(U.uDpr, DPR); gl.uniform1f(U.uT, time);
    gl.uniform1f(U.uA, s.A); gl.uniform1f(U.uOn, s.on); gl.uniform1f(U.uIdle, s.idle); gl.uniform1f(U.uFront, s.front); gl.uniform1f(U.uFlash, s.flash);
    gl.uniform1f(U.uSpark, s.spark); gl.uniform1f(U.uBeam, s.beam); gl.uniform1f(U.uLevel, s.level);
    gl.uniform3f(U.uCam, s.cam[0], s.cam[1], s.cam[2]); gl.uniform3fv(U.uC1, s.P[0]); gl.uniform3fv(U.uC2, s.P[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = now => {
    requestAnimationFrame(loop);
    if (!visible) return;
    // la scarica segue lo scroll: entri nella sezione e la scintilla parte, a metà il quadro è "carico"
    const target = reduce ? 6.8 : clamp((1 - sec.getBoundingClientRect().top / innerHeight) / 1.6) * 6.9;
    tShown = lerp(tShown, target, .08);
    live += 1 / 60;
    draw(Math.max(0, tShown), live);
  };
  requestAnimationFrame(loop);
})();
