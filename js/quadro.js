// Quadro elettrico Logel in punti di luce.
// Motore preso da UberDesigner "halvane" (shader dei punti, telecamera, selezione, esploso),
// geometria riscritta: armadio, canaline e cavi, PLC, scheda, morsettiera, porta con pannello operatore.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const damp = (r, dt) => 1 - Math.exp(-dt * r);
const rng = seed => { let s = seed; return () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646); };

export const PARTS = [
  { name: 'Carpenteria', box: [[-0.64, -1.08, -0.3], [0.64, 1.08, 0.26]], yaw: 0.85, pitch: 0.12, dist: 6.2,
    desc: 'Armadi e piastre forati sul nostro Rittal Perforex MT 2101, dalle quote del progetto.',
    stats: [['Perforex MT 2101', 'Centro di lavoro Rittal'], ['Su disegno', 'Armadi e piastre'], ['Archivio', 'di ogni lavorazione']] },
  { name: 'Cablaggio', box: [[-0.58, -0.62, -0.2], [0.58, 0.9, 0.0]], yaw: 0.3, pitch: 0.08, dist: 4.8,
    desc: 'Canaline, cavi e siglatura: quadri, bordo macchina e cablaggi strutturati, fatti in officina.',
    stats: [['3 EPLAN', 'postazioni di progetto'], ['2 Pro Panel', 'postazioni'], ['2 SPAC', 'postazioni']] },
  { name: 'PLC e software', box: [[-0.5, 0.48, -0.22], [0.5, 0.74, 0.0]], yaw: 0.25, pitch: 0.18, dist: 2.6,
    desc: 'Scriviamo il software di PLC, controlli numerici e robot, con la consociata REM software & automation.',
    stats: [['Siemens S7', 'TIA Portal'], ['Beckhoff · Omron', 'Allen Bradley · Saia'], ['ABB · Fanuc · Kuka', 'robot']] },
  { name: 'Elettronica', box: [[-0.4, -0.5, -0.2], [0.18, -0.12, 0.05]], yaw: 0.35, pitch: 0.42, dist: 2.3,
    desc: 'Progettiamo e produciamo schede su misura, dal disegno al firmware, e le collaudiamo nel nostro laboratorio.',
    stats: [['Altium · OrCAD', 'progetto'], ['NXP · Lattice', 'firmware e FPGA'], ['Camera climatica', 'collaudo']] },
  { name: 'Bordo macchina', box: [[-0.5, -0.92, -0.22], [0.5, 0.26, 0.0]], yaw: -0.25, pitch: 0.1, dist: 3.6,
    desc: 'Interruttori, morsettiere e cavi verso la macchina, pronti per l’avviamento in Italia e all’estero.',
    stats: [['UL508A', 'quadri per USA e Canada'], ['ISO 9001:2015', 'TÜV Rheinland'], ['Italia ed estero', 'avviamento']] },
  { name: 'Pannello operatore', box: [[-0.62, -1.02, 0.22], [0.62, 1.02, 0.34]], yaw: 0.7, pitch: 0.05, dist: 5.2,
    desc: 'Interfacce uomo-macchina in C# e Visual C++, o sui principali pannelli in commercio.',
    stats: [['C# · Visual C++', 'interfacce'], ['HMI', 'pannelli operatore'], ['Supervisione', 'di linee intere']] },
];
const N = PARTS.length, DOOR = 5, CASE = 0;

function build(rnd, q) {
  const P = [], PART = [], SIZE = [], EX = [];
  let ex = [0, 0, 0, 0];
  const pt = (x, y, z, part, s = 1) => { P.push(x, y, z); PART.push(part); SIZE.push(s); EX.push(ex[0], ex[1], ex[2], ex[3]); };
  const n = k => Math.max(4, Math.round(k * q));
  const line = (a, b, dens, part, s) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const m = n(L * dens);
    for (let i = 0; i <= m; i++) { const t = i / m; pt(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), part, s); }
  };
  const box = (x0, y0, z0, x1, y1, z1, dens, part, s) => {
    const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => line(v[a], v[b], dens, part, s));
  };
  // punti sparsi su un rettangolo (asse: 'z' = piano xy a quota z, 'x' = piano yz, 'y' = piano xz)
  const face = (ax, c, u0, u1, v0, v1, count, part, s) => {
    for (let i = 0, m = n(count); i < m; i++) {
      const u = lerp(u0, u1, rnd()), v = lerp(v0, v1, rnd());
      if (ax === 'z') pt(u, v, c, part, s); else if (ax === 'x') pt(c, u, v, part, s); else pt(u, c, v, part, s);
    }
  };
  const bez = (a, c1, c2, b, dens, part, s) => {
    const m = n(dens);
    for (let i = 0; i <= m; i++) {
      const t = i / m, u = 1 - t;
      const f = (k) => u * u * u * a[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * b[k];
      pt(f(0), f(1), f(2), part, s);
    }
  };

  const W = 0.6, H = 1.0, Zb = -0.25, Zf = 0.24;

  /* 0 · ARMADIO (carpenteria): spigoli, fianchi forati, zoccolo, piastra di montaggio */
  ex = [0, 0, 0, 0];
  const caseStart = P.length / 3;
  box(-W, -H, Zb, W, H, Zf, 420, CASE, 1.3);
  box(-W - 0.02, -H - 0.1, Zb - 0.02, W + 0.02, -H, Zf + 0.02, 300, CASE, 1.1); // zoccolo
  box(-W - 0.02, H, Zb - 0.02, W + 0.02, H + 0.03, Zf + 0.02, 300, CASE, 1.1); // tetto
  face('x', -W, -H, H, Zb, Zf, 9000, CASE, 0.55); face('x', W, -H, H, Zb, Zf, 9000, CASE, 0.55);
  face('z', Zb, -W, W, -H, H, 12000, CASE, 0.5); face('y', H, -W, W, Zb, Zf, 3000, CASE, 0.55);
  for (let yy = -0.8; yy <= 0.8; yy += 0.1) for (let zz = -0.17; zz <= 0.17; zz += 0.085) { // asole del Perforex sul fianco
    line([W, yy, zz - 0.025], [W, yy, zz + 0.025], 900, CASE, 1.2); line([-W, yy, zz - 0.025], [-W, yy, zz + 0.025], 900, CASE, 1.2);
  }
  // piastra di montaggio
  box(-0.56, -0.95, -0.21, 0.56, 0.95, -0.2, 300, CASE, 1.0);
  face('z', -0.205, -0.56, 0.56, -0.95, 0.95, 16000, CASE, 0.45);
  const caseEnd = P.length / 3;
  for (let i = caseStart; i < caseEnd; i++) { // esploso: fianchi in fuori, schiena indietro, tetto in su
    const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
    const k = i * 4;
    EX[k] = Math.abs(x) > W - 0.03 ? Math.sign(x) * 0.55 : 0;
    EX[k + 1] = y > H - 0.01 ? 0.45 : y < -H + 0.01 ? -0.2 : 0;
    EX[k + 2] = z < -0.19 ? -0.6 : 0; EX[k + 3] = 0.2;
  }

  /* 1 · CABLAGGIO: canaline con i denti, fasci di cavi */
  const duct = (x0, y0, x1, y1, horiz, part) => {
    box(x0, y0, -0.2, x1, y1, -0.11, 380, part, 1.15);
    face('z', -0.11, x0, x1, y0, y1, (x1 - x0) * (y1 - y0) * 9000, part, 0.6);
    if (horiz) for (let x = x0; x < x1; x += 0.022) { line([x, y0, -0.11], [x, y0 + 0.012, -0.11], 3000, part, 1.25); line([x, y1, -0.11], [x, y1 - 0.012, -0.11], 3000, part, 1.25); }
    else for (let y = y0; y < y1; y += 0.022) { line([x0, y, -0.11], [x0 + 0.012, y, -0.11], 3000, part, 1.25); line([x1, y, -0.11], [x1 - 0.012, y, -0.11], 3000, part, 1.25); }
  };
  ex = [0, 0, 0.5, 0];
  [0.82, 0.36, -0.06, -0.58].forEach(y => duct(-0.5, y - 0.04, 0.5, y + 0.04, true, 1));
  duct(-0.55, -0.9, -0.48, 0.86, false, 1); duct(0.48, -0.9, 0.55, 0.86, false, 1);
  ex = [0, 0, 0.62, 0];
  for (let i = 0; i < n(90); i++) { // cavi dai PLC alle canaline e dagli interruttori ai morsetti
    const x = lerp(-0.45, 0.45, rnd()), z = -0.13 - rnd() * 0.04;
    if (i % 2) bez([x, 0.5, z], [x, 0.44, z + 0.03], [x + (rnd() - 0.5) * 0.1, 0.42, z], [x + (rnd() - 0.5) * 0.15, 0.39, z], 120, 1, 0.9);
    else bez([x, 0.08, z], [x, 0.0, z + 0.04], [x, -0.03, z], [lerp(-0.45, 0.45, rnd()), -0.06, z], 120, 1, 0.9);
    const xv = lerp(-0.45, 0.45, rnd());
    bez([xv, -0.62, z], [xv, -0.66, z + 0.03], [xv, -0.7, z], [xv + (rnd() - 0.5) * 0.04, -0.74, z], 80, 1, 0.9);
  }
  for (let i = 0; i < n(26); i++) { // fasci nelle canaline verticali
    const x = lerp(-0.545, -0.485, rnd()), x2 = lerp(0.485, 0.545, rnd()), z = -0.15 - rnd() * 0.04;
    line([x, -0.88, z], [x, 0.84, z], 700, 1, 0.75); line([x2, -0.88, z], [x2, 0.84, z], 700, 1, 0.75);
  }

  /* 2 · PLC sulla guida DIN */
  ex = [0, 0, 0, 0];
  line([-0.5, 0.6, -0.195], [0.5, 0.6, -0.195], 900, 2, 1.2); line([-0.5, 0.62, -0.195], [0.5, 0.62, -0.195], 900, 2, 1.2);
  for (let m = 0; m < 9; m++) {
    const x0 = -0.46 + m * 0.1, x1 = x0 + (m === 0 ? 0.13 : 0.085), wide = m === 0;
    ex = [(m - 4) * 0.06, 0.08, 0.5, 0];
    const xs = wide ? x0 - 0.03 : x0;
    box(xs, 0.52, -0.195, x1, 0.71, -0.07, 520, 2, 1.25);
    face('z', -0.07, xs, x1, 0.52, 0.71, 900, 2, 0.6);
    for (let l = 0; l < 8; l++) { pt(xs + 0.012, 0.69 - l * 0.016, -0.069, 2, 2.2); if (!wide) pt(xs + 0.03, 0.69 - l * 0.016, -0.069, 2, 1.6); } // LED
    if (wide) box(xs + 0.02, 0.56, -0.07, x1 - 0.02, 0.62, -0.068, 900, 2, 1.6); // display CPU
  }

  /* 3 · SCHEDA ELETTRONICA: piastra, piste, componenti a strati */
  ex = [0, 0.05, 0.55, 0];
  const bx0 = -0.36, bx1 = 0.14, by0 = -0.46, by1 = -0.16, bz = -0.12;
  box(bx0, by0, bz - 0.01, bx1, by1, bz, 600, 3, 1.3);
  face('z', bz, bx0, bx1, by0, by1, 7000, 3, 0.55);
  for (let i = 0; i < n(70); i++) { // piste a 90°
    let x = lerp(bx0, bx1, rnd()), y = lerp(by0, by1, rnd());
    for (let s = 0; s < 3; s++) {
      const L = 0.02 + rnd() * 0.08;
      const nx = s % 2 ? x : clamp(x + (rnd() > 0.5 ? L : -L), bx0, bx1), ny = s % 2 ? clamp(y + (rnd() > 0.5 ? L : -L), by0, by1) : y;
      line([x, y, bz + 0.001], [nx, ny, bz + 0.001], 1400, 3, 1.05); x = nx; y = ny;
    }
  }
  ex = [0, 0.05, 0.8, 0];
  const chips = [[-0.3, -0.36, 0.07, 0.07], [-0.18, -0.36, 0.05, 0.05], [-0.06, -0.24, 0.09, 0.06], [0.04, -0.4, 0.06, 0.04], [-0.3, -0.24, 0.04, 0.04]];
  chips.forEach(([x, y, w, h]) => {
    box(x, y, bz, x + w, y + h, bz + 0.012, 1600, 3, 1.4);
    for (let k = 0; k <= 8; k++) { const t = x + (k / 8) * w; line([t, y, bz + 0.002], [t, y - 0.008, bz + 0.002], 4000, 3, 1.4); line([t, y + h, bz + 0.002], [t, y + h + 0.008, bz + 0.002], 4000, 3, 1.4); }
  });
  for (let i = 0; i < n(30); i++) { const x = lerp(bx0 + 0.02, bx1 - 0.02, rnd()), y = lerp(by0 + 0.02, by1 - 0.02, rnd()); for (let a = 0; a < 18; a++) pt(x + Math.cos(a / 18 * TAU) * 0.008, y + Math.sin(a / 18 * TAU) * 0.008, bz + 0.02, 3, 1.2); }

  /* 4 · BORDO MACCHINA: interruttori e morsettiera */
  line([-0.5, 0.15, -0.195], [0.5, 0.15, -0.195], 900, 4, 1.2);
  for (let m = 0; m < 12; m++) {
    const x0 = -0.47 + m * 0.078; ex = [(m - 5.5) * 0.03, 0.05, 0.42, 0];
    box(x0, 0.06, -0.195, x0 + 0.066, 0.24, -0.09, 520, 4, 1.2);
    line([x0 + 0.033, 0.15, -0.09], [x0 + 0.033, 0.19, -0.075], 2500, 4, 1.8); // levetta
  }
  line([-0.5, -0.76, -0.195], [0.5, -0.76, -0.195], 900, 4, 1.2);
  for (let m = 0; m < 46; m++) {
    const x0 = -0.47 + m * 0.0205; ex = [(m - 23) * 0.012, -0.05, 0.4, 0];
    box(x0, -0.84, -0.195, x0 + 0.016, -0.68, -0.12, 700, 4, 1.05);
  }
  ex = [0, -0.35, 0.3, 0.3];
  for (let i = 0; i < n(40); i++) { const x = lerp(-0.45, 0.45, rnd()); bez([x, -0.84, -0.15], [x, -0.95, -0.15], [x * 1.1, -1.05, -0.1], [x * 1.3, -1.25, 0.05], 120, 4, 0.8); } // cavi verso la macchina

  /* 5 · PORTA con pannello operatore */
  ex = [0.95, 0, 0.7, 0.55];
  const zd = 0.27;
  box(-W + 0.01, -H + 0.01, zd, W - 0.01, H - 0.01, zd + 0.025, 380, DOOR, 1.3);
  face('z', zd + 0.025, -W, W, -H, H, 9000, DOOR, 0.35);
  box(-0.32, 0.22, zd + 0.025, 0.32, 0.66, zd + 0.04, 900, DOOR, 1.5); // HMI
  face('z', zd + 0.041, -0.29, 0.29, 0.25, 0.63, 6000, DOOR, 0.95);
  for (let k = 0; k < 4; k++) line([-0.25, 0.32 + k * 0.07, zd + 0.042], [-0.25 + 0.12 + rnd() * 0.3, 0.32 + k * 0.07, zd + 0.042], 2000, DOOR, 1.8);
  [[-0.2, -0.05], [0, -0.05], [0.2, -0.05]].forEach(([x, y], i) => { // pulsanti e selettore
    for (let a = 0; a < n(64); a++) { const an = a / n(64) * TAU; pt(x + Math.cos(an) * 0.045, y + Math.sin(an) * 0.045, zd + 0.03, DOOR, 1.4); pt(x + Math.cos(an) * 0.03, y + Math.sin(an) * 0.03, zd + 0.05, DOOR, i === 2 ? 2 : 1.2); }
  });
  line([0.5, -0.1, zd + 0.03], [0.5, 0.2, zd + 0.03], 1200, DOOR, 1.6); // maniglia
  for (let y = -0.9; y < -0.6; y += 0.03) line([-0.25, y, zd + 0.026], [0.25, y, zd + 0.026], 700, DOOR, 1.0); // griglia

  return { count: P.length / 3, position: new Float32Array(P), part: new Float32Array(PART), size: new Float32Array(SIZE), explode: new Float32Array(EX) };
}

const vertexShader = `
  attribute float aPart, aSize, aRand; attribute vec4 aEx;
  uniform float uTime, uReveal, uPx, uGain; uniform float uHi[6]; uniform float uDim[6]; uniform float uEx[6]; uniform float uSel[6];
  varying vec3 vCol; varying float vA;
  void main(){
    int id = int(aPart + 0.5);
    float e = uEx[id];
    vec3 p = position + aEx.xyz * e;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    float edge = (position.y + 1.15) / 2.35;
    float r = smoothstep(edge - 0.02, edge + 0.10, uReveal * 1.15 - aRand * 0.04);
    float hi = uHi[id], sel = uSel[id];
    float bright = smoothstep(0.8, 1.3, aSize);
    vec3 base = mix(vec3(0.58, 0.63, 0.70), vec3(0.94, 0.96, 1.0), bright);
    vec3 blue = mix(vec3(0.03, 0.36, 0.86), vec3(0.42, 0.72, 1.0), bright);
    float led = step(1.9, aSize) * (0.6 + 0.4 * sin(uTime * 3.0 + aRand * 40.0));
    vCol = mix(mix(base, blue, hi), mix(vec3(1.0), blue, 0.35 + 0.3 * (1.0 - bright)), sel);
    vCol = mix(vCol, vec3(0.35, 0.7, 1.0), led * 0.8);
    float a = (0.34 + 0.62 * bright) * uDim[id] * (1.0 + hi * 0.4 + sel * 0.25 + led);
    a *= smoothstep(0.4, 1.6, depth) * mix(1.0, uGain, sel);
    a *= clamp(1.4 - depth * 0.05, 0.4, 1.0) * r * (1.0 - aEx.w * e * 0.88);
    vA = a;
    gl_PointSize = max(aSize * uPx * clamp(4.6 / depth, 0.6, 1.25), 1.0);
  }`;
const fragmentShader = `
  varying vec3 vCol; varying float vA;
  void main(){ vec2 c = gl_PointCoord - 0.5; float f = exp(-dot(c, c) * 13.0); if (f < 0.03) discard; gl_FragColor = vec4(vCol * vA * f, 1.0); }`;

export function createQuadro({ canvas, host, tip, reducedMotion, onFocus }) {
  const W = () => host.clientWidth, H = () => host.clientHeight;
  const mobile = Math.min(innerWidth, innerHeight) < 700;
  const rnd = rng(7);
  const g = build(rnd, mobile ? 0.55 : 1);
  const aRand = new Float32Array(g.count); for (let i = 0; i < g.count; i++) aRand[i] = rnd();

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr); renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
  const model = new THREE.Group(); scene.add(model);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(g.position, 3));
  geo.setAttribute('aPart', new THREE.BufferAttribute(g.part, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(g.size, 1));
  geo.setAttribute('aRand', new THREE.BufferAttribute(aRand, 1));
  geo.setAttribute('aEx', new THREE.BufferAttribute(g.explode, 4));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6);
  const U = {
    uTime: { value: 0 }, uReveal: { value: reducedMotion ? 1 : 0 }, uPx: { value: dpr }, uGain: { value: 1 },
    uHi: { value: new Array(N).fill(0) }, uEx: { value: new Array(N).fill(0) }, uSel: { value: new Array(N).fill(0) }, uDim: { value: new Array(N).fill(1) },
  };
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geo, mat); points.frustumCulled = false; model.add(points);

  const boxes = PARTS.map(p => new THREE.Box3(new THREE.Vector3(...p.box[0]), new THREE.Vector3(...p.box[1])));
  let focus = -1, hover = -1, focusAt = 0;
  const exProg = new Array(N).fill(0);
  const setFocus = i => { if (i === focus) return; focus = i; focusAt = performance.now(); onFocus(i); };

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), inv = new THREE.Matrix4(), hit = new THREE.Vector3();
  const local = new THREE.Ray();
  const mouse = { x: 0, y: 0, in: false };
  const ORDER = [2, 3, 4, 1]; // prima i pezzi interni, poi porta e armadio
  const pickAt = (x, y) => {
    ray.setFromCamera(ndc.set(x, y), camera);
    inv.copy(model.matrixWorld).invert();
    local.copy(ray.ray).applyMatrix4(inv);
    let best = Infinity, id = -1;
    for (const k of ORDER) if (local.intersectBox(boxes[k], hit)) { const d = hit.distanceTo(local.origin); if (d < best) { best = d; id = k; } }
    if (id < 0 && focus !== DOOR && exProg[DOOR] < 0.1 && local.intersectBox(boxes[DOOR], hit)) id = DOOR;
    if (id < 0 && local.intersectBox(boxes[CASE], hit)) id = CASE;
    return id;
  };
  const pickable = () => U.uReveal.value > 0.95;
  const rect = () => canvas.getBoundingClientRect();
  const onMove = e => {
    const r = rect(); mouse.in = true;
    mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1; mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    tip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`;
  };
  const onLeave = () => { mouse.in = false; };
  const onClick = e => {
    const r = rect();
    const id = pickable() ? pickAt(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1) : -1;
    if (id >= 0 && id !== focus) setFocus(id); else if (id < 0 && focus >= 0) setFocus(-1);
  };
  const onKey = e => { if (e.key === 'Escape') setFocus(-1); };
  const resize = () => { renderer.setSize(W(), H(), false); camera.aspect = W() / H(); camera.updateProjectionMatrix(); };
  canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('click', onClick); addEventListener('keydown', onKey); addEventListener('resize', resize); resize();

  const OVER = { yaw: 0.55, pitch: 0.1 };
  const rot = { yaw: OVER.yaw - 0.6, pitch: OVER.pitch };
  const cam = { pos: new THREE.Vector3(0, 0.3, 11), look: new THREE.Vector3(0, 0, 0) };
  const tpos = new THREE.Vector3(), tlook = new THREE.Vector3(), centre = new THREE.Vector3();
  const hi = new Array(N).fill(0), dim = new Array(N).fill(1);
  let last = performance.now(), raf = 0, visible = true, scroll = 0, t0 = last + 1e9;
  const narrow = () => W() < 900;
  const aim = () => {
    const fit = Math.max(1, 0.9 / camera.aspect);
    // a computer il quadro sta a destra, lasciando il testo a sinistra
    const side = narrow() ? 0 : -0.78;
    tpos.set(side, narrow() ? -0.55 : 0.12, (narrow() ? 6.6 : 5.7) * fit); tlook.set(side, narrow() ? -0.95 : 0, 0);
    if (focus >= 0) {
      const b = boxes[focus]; b.getCenter(centre); model.localToWorld(centre);
      const D = PARTS[focus].dist * (narrow() ? 1.45 : 1);
      const s = narrow() ? 0 : -D * 0.2;
      tlook.set(centre.x + s, centre.y - (narrow() ? D * 0.32 : 0), centre.z);
      tpos.set(centre.x + s, centre.y + D * 0.1, centre.z + D);
    }
  };
  if (reducedMotion) { aim(); cam.pos.copy(tpos); cam.look.copy(tlook); }
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } });
  io.observe(host);

  function frame(now) {
    raf = 0; if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const T = Math.max(0, (now - t0) / 1000); U.uTime.value = T;
    if (!reducedMotion) U.uReveal.value = eio(clamp((T - 0.2) / 2.6, 0, 1));
    const sway = reducedMotion || focus >= 0 ? 0 : Math.sin(T * 0.25) * 0.12 + scroll * 0.6;
    const ty = (focus >= 0 ? PARTS[focus].yaw : OVER.yaw) + sway, tp = focus >= 0 ? PARTS[focus].pitch : OVER.pitch;
    const rk = damp(focus >= 0 ? 2.2 : 1.4, dt);
    rot.yaw = lerp(rot.yaw, ty, rk); rot.pitch = lerp(rot.pitch, tp, rk);
    model.rotation.set(rot.pitch, rot.yaw, 0, 'XYZ'); model.updateMatrixWorld(true);
    aim();
    const ck = damp(2, dt);
    cam.pos.lerp(tpos, ck); cam.look.lerp(tlook, ck);
    camera.position.copy(cam.pos); camera.lookAt(cam.look); camera.updateMatrixWorld();

    hover = pickable() && mouse.in ? pickAt(mouse.x, mouse.y) : -1;
    canvas.style.cursor = hover >= 0 && hover !== focus ? 'pointer' : 'default';
    if (hover >= 0 && hover !== focus) { tip.textContent = PARTS[hover].name; tip.style.opacity = '1'; } else tip.style.opacity = '0';
    const hk = damp(8, dt), dk = damp(4, dt);
    for (let p = 0; p < N; p++) {
      const h = p === hover && p !== focus ? 1 : 0;
      U.uSel.value[p] = lerp(U.uSel.value[p], p === focus ? 1 : 0, hk);
      let d = 1;
      if (focus >= 0 && p !== focus) d = p === hover ? 0.45 : p === DOOR || p === CASE ? 0.05 : 0.12;
      else if (focus < 0 && hover >= 0 && p !== hover) d = 0.55;
      hi[p] = lerp(hi[p], h, hk); dim[p] = lerp(dim[p], d, dk);
      U.uHi.value[p] = hi[p]; U.uDim.value[p] = dim[p];
      const want = (p === focus && now - focusAt > 700) || (focus >= 0 && focus !== DOOR && p === DOOR);
      exProg[p] = clamp(exProg[p] + (want ? dt / 2.0 : -dt / 1.2), 0, 1);
      U.uEx.value[p] = eio(exProg[p]);
    }
    U.uGain.value = lerp(U.uGain.value, focus >= 0 ? 2.0 : 1, dk);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return { setFocus, begin: () => { t0 = performance.now(); }, setScroll: v => { scroll = v; }, count: g.count };
}
