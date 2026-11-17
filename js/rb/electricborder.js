import{a as fe,b as Ge,c as $e,d as Oe}from"./comune-W7MDVSFA.js";var E=fe(Ge());var me=fe($e()),I=4,ne=3,x=64,Xe=3e6,We=560,de=Math.PI/2,Ye=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
void main() {
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,Ke=`#version 300 es
precision highp float;
precision highp int;

uniform vec2 uSize;
uniform float uRatio;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uRadius;
uniform vec3 uParam;
uniform float uPerimeter;
uniform vec4 uCells;
uniform vec2 uSoft;
uniform float uTime;
uniform float uPower;
uniform float uReveal;
uniform vec3 uHover;
uniform float uHoverRadius;
uniform vec4 uPulses[${ne}];
uniform vec3 uCore;
uniform vec3 uGlowColor;
uniform float uIntensity;
uniform float uGlow;
uniform float uThickness;
uniform float uStrands;
uniform float uChaos;
uniform float uSpread;
uniform float uFlicker;
uniform float uInk;
uniform vec4 uArcEnds[${I}];
uniform vec4 uArcShape[${I}];

out vec4 fragColor;

uint scramble(uint x) {
  x ^= x >> 16u;
  x *= 0x7feb352du;
  x ^= x >> 15u;
  x *= 0x846ca68bu;
  x ^= x >> 16u;
  return x;
}

vec2 slant(uint x, uint y, uint seed) {
  uint h = scramble(x * 0x8da6b343u + y * 0xd8163841u + seed * 0xcb1ab31fu);
  return vec2(uvec2(h, h >> 8u) & 255u) / 127.5 - 1.0;
}

vec2 ring(vec2 p, float period, uint seed) {
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float du = 30.0 * f.x * f.x * (f.x * (f.x - 2.0) + 1.0);
  uint x0 = uint(mod(i.x, period));
  uint x1 = uint(mod(i.x + 1.0, period));
  uint y0 = uint(i.y + 65536.0);
  vec2 ga = slant(x0, y0, seed);
  vec2 gb = slant(x1, y0, seed);
  vec2 gc = slant(x0, y0 + 1u, seed);
  vec2 gd = slant(x1, y0 + 1u, seed);
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  float k = va - vb - vc + vd;
  float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
  float gx = ga.x + u.x * (gb.x - ga.x) + u.y * (gc.x - ga.x) + u.x * u.y * (ga.x - gb.x - gc.x + gd.x);
  return vec2(value, gx + du * (vb - va + u.y * k));
}

float wobble(float x, uint seed) {
  return ring(vec2(x, 0.5), 1048576.0, seed).x;
}

vec2 frameAt(vec2 p) {
  vec2 inner = max(uHalf - uRadius, 0.0);
  vec2 q = abs(p) - inner;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float quarter = uPerimeter * 0.25;
  vec2 v = abs(p) - uParam.xy;
  float t;
  if (v.x > 0.0 && v.y > 0.0) t = uParam.x + uParam.z * atan(v.x, v.y);
  else if (v.x > v.y) t = uParam.x + 1.5707963 * uParam.z + uParam.y - abs(p.y);
  else t = abs(p.x);
  t = clamp(t, 0.0, quarter);
  float s = p.x >= 0.0 ? (p.y < 0.0 ? t : 2.0 * quarter - t) : (p.y < 0.0 ? 4.0 * quarter - t : 2.0 * quarter + t);
  return vec2(s, d);
}

vec2 glowShape(float line, float spread, float w) {
  float x = abs(line);
  float y = abs(spread);
  return vec2(exp(-x * x / (w * w * 0.5)) + exp(-y / (w * 2.2)) * 0.6, exp(-y / (w * 4.5)) * 0.5);
}

void addArc(vec2 p, vec4 ends, vec4 info, float t, inout vec3 light, inout float energy, inout float hot) {
  if (info.y < 0.002) return;
  vec2 ab = ends.zw - ends.xy;
  float len = max(length(ab), 1.0);
  vec2 dir = ab / len;
  vec2 rel = p - ends.xy;
  float along = dot(rel, dir);
  float side = dot(rel, vec2(-dir.y, dir.x));
  float margin = abs(info.x) + (0.6 + uChaos) * (2.0 + len * 0.08) + uThickness * 12.0 + 10.0;
  if (along < -margin || along > len + margin || abs(side) > margin) return;
  float u = clamp(along / len, 0.0, 1.0);
  float taper = sin(3.14159265 * u);
  float settle = smoothstep(0.0, 0.15, u) * smoothstep(1.0, 0.85, u);
  float bendSlope = 3.14159265 / len * cos(3.14159265 * u) * settle;
  float beyond = max(-along, 0.0) + max(along - len, 0.0);
  for (int c = 0; c < 2; c++) {
    uint seed = uint(info.z * 131.0) + uint(c) * 29u + 7u;
    float jag = 0.0;
    float jagSlope = 0.0;
    float wave = max(len * 0.3, 14.0);
    float weight = (0.6 + uChaos) * (1.5 + len * 0.05) * (c == 0 ? 1.0 : 1.5);
    for (int o = 0; o < 3; o++) {
      vec2 n = ring(vec2(along / wave + info.z * 3.0, t * (1.4 + float(o) * 1.1)), 1048576.0, seed + uint(o));
      jag += n.x * weight;
      jagSlope += n.y * weight / wave;
      wave *= 0.42;
      weight *= 0.4;
    }
    float offset = (info.x + jag) * taper;
    float offsetSlope = (info.x + jag) * bendSlope + jagSlope * taper * settle;
    float across = (side - offset) / sqrt(1.0 + offsetSlope * offsetSlope);
    float gap = length(vec2(beyond, across));
    float w = uThickness * (c == 0 ? 0.9 : 0.6);
    vec2 g = glowShape(gap, gap, w);
    float k = info.y * (c == 0 ? 1.0 : 0.45);
    light += (uCore * g.x + uGlowColor * g.y * uGlow) * k;
    energy += (g.x + g.y * uGlow) * k;
    hot += exp(-gap * gap / (w * w * 0.16)) * k * (c == 0 ? 1.0 : 0.0);
  }
}

void main() {
  vec2 p = vec2(gl_FragCoord.x / uRatio, uSize.y - gl_FragCoord.y / uRatio);
  vec2 frame = frameAt(p - uCenter);
  float s = frame.x;
  float d = frame.y;
  float t = uTime;
  vec3 light = vec3(0.0);
  float energy = 0.0;
  float hot = 0.0;

  float along = min(s, uPerimeter - s);
  float front = uReveal * (uPerimeter * 0.5 + 80.0);
  float shown = smoothstep(front, front - 70.0, along) * uPower;
  float flare = uReveal < 1.0 ? exp(-pow((along - front + 30.0) / 26.0, 2.0)) * uPower : 0.0;

  vec2 toHover = p - uHover.xy;
  float heat = uHover.z * exp(-dot(toHover, toHover) / (uHoverRadius * uHoverRadius));
  float surge = 0.0;
  for (int i = 0; i < ${ne}; i++) {
    vec4 pulse = uPulses[i];
    if (pulse.z <= 0.0) continue;
    float gap = abs(s - pulse.x);
    gap = min(gap, uPerimeter - gap);
    float wave = (gap - pulse.y * ${We}.0) / 46.0;
    surge += exp(-wave * wave) * pulse.z * exp(-pulse.y * 1.2);
  }
  heat = min(heat * 0.7 + surge * 0.8 + flare * 0.6, 1.2);
  vec2 inset = min(p, uSize - p);
  float frameFade = smoothstep(0.0, 14.0, min(inset.x, inset.y));

  float edge = abs(d);
  float inward = d < 0.0 ? exp(d / 14.0) : 1.0;
  float bloom = (exp(-edge / 3.0) * 0.1 + exp(-edge / 16.0) * 0.05 * inward) * uGlow * (1.0 + heat * 0.6) * shown;
  light += uGlowColor * bloom;
  energy += bloom;

  float bendAmp = uSpread * 16.0 * (1.0 + heat * 0.35);
  float rippleAmp = uSpread * 6.0 * (1.0 + heat * 0.3);
  float crinkleAmp = uChaos * 4.5 * (1.0 + heat * 0.3);
  float squeeze = min(1.0, 34.0 / max((bendAmp + rippleAmp) * 1.6 + crinkleAmp, 1e-3));
  bendAmp *= squeeze;
  rippleAmp *= squeeze;
  crinkleAmp *= squeeze;
  float reach = (bendAmp * 1.9 + rippleAmp + crinkleAmp * 1.6) * 1.3 + uThickness * 14.0 + 8.0;
  if (edge < reach && shown > 0.0) {
    float fade = smoothstep(reach, reach * 0.55, edge);
    float count = min(uStrands + heat * 1.2, 6.0);
    float slopeScale = 1.0 / uPerimeter;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      if (fi >= ceil(count)) break;
      float present = clamp(count - fi, 0.0, 1.0);
      uint seed = uint(i) * 7u + 3u;
      float lead = i == 0 ? 1.0 : 0.0;
      float range = mix(1.35 + fi * 0.18, 0.7, lead);
      float x = s * slopeScale;
      vec2 a = ring(vec2(x * uCells.x, t * 0.7 + fi * 3.1), uCells.x, seed);
      vec2 b = ring(vec2(x * uCells.y, t * 1.9 + fi * 1.7), uCells.y, seed + 1u);
      vec2 c = ring(vec2(x * uCells.z, t * 4.6 + fi * 0.9), uCells.z, seed + 2u);
      vec2 e = ring(vec2(x * uCells.w, t * 6.8), uCells.w, seed + 3u);
      float offset = (a.x * bendAmp + b.x * rippleAmp) * range + (c.x + e.x * 0.35) * crinkleAmp;
      float slope =
        ((a.y * uCells.x * bendAmp + b.y * uCells.y * rippleAmp) * range +
          (c.y * uCells.z + e.y * 0.35 * uCells.w) * crinkleAmp) *
        slopeScale;
      float drift = lead > 0.5 ? 0.0 : wobble(fi * 7.3, seed + 9u) * 2.5 * uSpread;
      offset += drift;
      float across = (d - offset) / sqrt(1.0 + slope * slope);
      float spread = d - a.x * bendAmp * range - drift;
      float swell = 0.5 + 0.5 * ring(vec2(x * uSoft.y, t * 2.0 + fi * 5.1), uSoft.y, seed + 8u).x;
      float w = uThickness * mix(0.55, 1.0, lead) * (0.5 + swell);
      float vis = mix(0.3 + 0.45 * smoothstep(-0.25, 0.2, ring(vec2(x * uSoft.x, t * 0.5 + fi * 3.7), uSoft.x, seed + 5u).x), 1.0, lead);
      float spark = 1.0 - uFlicker * 0.3 * (0.5 + 0.5 * wobble(t * 13.0 + fi * 2.3, seed + 6u));
      float weight = max(vis, heat * 0.6) * spark * fade * present * (0.7 + 0.6 * swell);
      vec2 g = glowShape(across, spread, w) * weight;
      g.y *= inward;
      float haze = uGlow * (1.0 + heat * 0.5) * (1.0 - uInk * 0.7);
      light += uCore * g.x + uGlowColor * g.y * haze;
      energy += g.x + g.y * haze;
      hot += exp(-across * across / (w * w * 0.16)) * lead * weight;
    }
    light *= shown;
    energy *= shown;
    hot *= shown;
  }

  for (int i = 0; i < ${I}; i++) addArc(p, uArcEnds[i], uArcShape[i], t, light, energy, hot);

  float breath = 1.0 + uFlicker * 0.5 * wobble(t * 4.6 + 7.0, 3u);
  float gain = uIntensity * breath * (1.0 + heat * 0.25) * 1.4;
  light *= frameFade;
  energy *= frameFade;
  hot *= frameFade;
  float alpha = 1.0 - exp(-energy * gain);
  vec3 color = mix(1.0 - exp(-light * gain), alpha * light / max(energy, 1e-4), uInk);
  color = mix(color, vec3(alpha), clamp(hot, 0.0, 1.0) * uInk * 0.85);
  float grain = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  alpha = clamp(alpha + grain, 0.0, 1.0);
  fragColor = vec4(clamp(color + grain, 0.0, alpha), alpha);
}`,R=(o,u,r)=>Math.min(r,Math.max(u,o)),Ae=o=>{let u=String(o||"").trim(),r=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(u);if(r){let s=r[1].length===3?r[1].replace(/./g,c=>c+c):r[1];return[0,2,4].map(c=>parseInt(s.slice(c,c+2),16)/255)}let t=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(u);if(t)return[t[1],t[2],t[3]].map(s=>R(parseFloat(s)/255,0,1));if(typeof document<"u"){let s=document.createElement("canvas").getContext("2d");if(s){s.fillStyle="#000000",s.fillStyle=u;let c=String(s.fillStyle);if(c!=="#000000"||/^(#0{3}|#0{6}|black)$/i.test(u))return Ae(c)}}return[.49,.98,1]},Ue=(o,u,r)=>{let t=o.createShader(u);return t?(o.shaderSource(t,r),o.compileShader(t),o.getShaderParameter(t,o.COMPILE_STATUS)?t:(console.error(o.getShaderInfoLog(t)),o.deleteShader(t),null)):null},Je=o=>{let u=Ue(o,o.VERTEX_SHADER,Ye),r=Ue(o,o.FRAGMENT_SHADER,Ke),t=u&&r?o.createProgram():null;if(!u||!r||!t)return u&&o.deleteShader(u),r&&o.deleteShader(r),null;if(o.attachShader(t,u),o.attachShader(t,r),o.linkProgram(t),o.deleteShader(u),o.deleteShader(r),!o.getProgramParameter(t,o.LINK_STATUS))return console.error(o.getProgramInfoLog(t)),o.deleteProgram(t),null;let s={},c=o.getProgramParameter(t,o.ACTIVE_UNIFORMS);for(let f=0;f<c;f++){let p=o.getActiveUniform(t,f);p&&(s[p.name.replace(/\[0\]$/,"")]=o.getUniformLocation(t,p.name))}return{program:t,uniforms:s}},ae=(o,u,r,t,s)=>{let c=Math.abs(o)-(r-s),f=Math.abs(u)-(t-s);return Math.hypot(Math.max(c,0),Math.max(f,0))+Math.min(Math.max(c,f),0)-s},Ve=(o,u,r,t)=>{let s=Math.max(1,o/2+t),c=Math.max(1,u/2+t),f=R(r+t,0,Math.min(s,c)),p=Math.min(f+48,Math.min(s,c)),S=s-p,v=c-p,L=S+v+de*p;return{hx:s,hy:c,r:f,vr:p,ax:S,ay:v,quarter:L,perimeter:L*4}},Se=(o,u)=>{let{hx:r,hy:t,r:s,vr:c,ax:f,ay:p,quarter:S,perimeter:v}=o,L=(u%v+v)%v,T=Math.min(3,Math.floor(L/S)),W=L-T*S,H=T%2?S-W:W,j,N;if(H<=f)j=H,N=-t;else if(H<=f+de*c){let B=c>0?(H-f)/c:0,J=Math.sin(B),ie=-Math.cos(B),G=0,Q=c+s+2;for(let F=0;F<18;F++){let w=(G+Q)/2;ae(f+J*w,-p+ie*w,r,t,s)<0?G=w:Q=w}j=f+J*G,N=-p+ie*G}else j=r,N=-p+(H-f-de*c);let he=T>=2?-1:1,pe=T===1||T===2?-1:1,_=j*he,q=N*pe,re=ae(_+.5,q,r,t,s)-ae(_-.5,q,r,t,s),Y=ae(_,q+.5,r,t,s)-ae(_,q-.5,r,t,s),K=Math.hypot(re,Y)||1;return{x:_,y:q,nx:re/K,ny:Y/K}},De=(o,u,r)=>{let{ax:t,ay:s,vr:c,quarter:f}=o,p=Math.abs(u)-t,S=Math.abs(r)-s,v;return p>0&&S>0?v=t+c*Math.atan2(p,S):p>S?v=t+de*c+s-Math.abs(r):v=Math.abs(u),v=R(v,0,f),u>=0?r<0?v:2*f-v:r<0?4*f-v:2*f+v},Qe=({children:o,color:u="#7df9ff",glowColor:r,speed:t=1,chaos:s=.5,spread:c=.6,thickness:f=1.5,strands:p=3,glow:S=.6,intensity:v=.8,arcs:L=1,flicker:T=.5,borderRadius:W=24,offset:H=0,active:j=!0,intro:N=!0,interactive:he=!0,cursorRadius:pe=90,theme:_="dark",className:q="",style:re})=>{let Y=(0,E.useRef)(null),K=(0,E.useRef)(null),B=(0,E.useRef)(null),[J,ie]=(0,E.useState)(0),G=Ae(u),Q={core:G.map(w=>w+(1-w)*.55),glowColor:r?Ae(r):G,speed:Math.max(0,t),chaos:R(s,0,2),spread:R(c,0,2),thickness:Math.max(.25,f),strands:R(Math.round(p),1,6),glow:R(S,0,3),intensity:Math.max(0,v),arcs:Math.max(0,L),flicker:R(T,0,1),borderRadius:Math.max(0,W),offset:H,active:j,intro:N,interactive:he,cursorRadius:Math.max(1,pe),light:_==="light"},F=(0,E.useRef)(Q);return F.current=Q,(0,E.useEffect)(()=>{B.current?.()}),(0,E.useEffect)(()=>{let w=Y.current,b=K.current;if(!w||!b)return;let a=b.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"default"}),se=a?Je(a):null;if(!a||!se)return;let X=window.matchMedia("(prefers-reduced-motion: reduce)").matches,Ce=a.createVertexArray(),Z=new Float32Array(I*4),ee=new Float32Array(I*4),te=new Float32Array(ne*4),A={width:1,height:1,ratio:1},d={x:0,y:0,over:!1,near:!1},m={x:0,y:0,vx:0,vy:0,power:0},C=[],$=[],le=F.current,k=le.active&&!(le.intro&&!X&&J===0)?1:0,oe=k,ke=le.active,ve=le.light?1:0,h=Ve(1,1,0,0),O=Math.random()*100,U=0,ce=0,xe=!0,ge=document.visibilityState!=="hidden",ye=!1,we=()=>{let i=F.current,n=Math.max(1,w.offsetWidth),e=Math.max(1,w.offsetHeight),P=n+x*2,M=e+x*2,D=Math.min(window.devicePixelRatio||1,2,Math.sqrt(Xe/(P*M))),z=Math.max(1,Math.round(P*D)),l=Math.max(1,Math.round(M*D));(b.width!==z||b.height!==l)&&(b.width=z,b.height=l),b.style.width=`${P}px`,b.style.height=`${M}px`,Object.assign(A,{width:n,height:e,ratio:z/P}),h=Ve(n,e,i.borderRadius,i.offset)},be=(i,n)=>{let e=Math.min(h.perimeter*.3,60+Math.random()*90),M=(n??Math.random()*h.perimeter)-e*(.2+Math.random()*.6),D=M+e,z=Se(h,M),l=Se(h,D),g=Se(h,(M+D)/2),y=l.x-z.x,ue=l.y-z.y,Me=Math.hypot(y,ue)||1,Be=-ue/Me*g.nx+y/Me*g.ny,_e=Math.min(x-30,Me*(.14+Math.random()*.16)+5);return{ax:z.x,ay:z.y,bx:l.x,by:l.y,bow:Be>=0?_e:-_e,seed:1+Math.random()*60,born:i,life:.35+Math.random()*.45}},Ne=(i,n)=>{let e=se.uniforms,P=A.width+x*2,M=A.height+x*2;a.viewport(0,0,b.width,b.height),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT),!(k<=.001&&!C.length)&&(a.useProgram(se.program),a.uniform2f(e.uSize,P,M),a.uniform1f(e.uRatio,A.ratio),a.uniform2f(e.uCenter,P/2,M/2),a.uniform2f(e.uHalf,h.hx,h.hy),a.uniform1f(e.uRadius,h.r),a.uniform3f(e.uParam,h.ax,h.ay,h.vr),a.uniform1f(e.uPerimeter,h.perimeter),a.uniform4f(e.uCells,Math.max(1,Math.round(h.perimeter/75)),Math.max(2,Math.round(h.perimeter/25)),Math.max(3,Math.round(h.perimeter/9)),Math.max(4,Math.round(h.perimeter/4))),a.uniform2f(e.uSoft,Math.max(1,Math.round(h.perimeter/150)),Math.max(1,Math.round(h.perimeter/50))),a.uniform1f(e.uTime,O),a.uniform1f(e.uPower,k*k*(3-2*k)),a.uniform1f(e.uReveal,oe),a.uniform3f(e.uHover,m.x+x,m.y+x,n),a.uniform1f(e.uHoverRadius,i.cursorRadius),a.uniform4fv(e.uPulses,te),a.uniform3fv(e.uCore,i.core),a.uniform3fv(e.uGlowColor,i.glowColor),a.uniform1f(e.uIntensity,i.intensity),a.uniform1f(e.uGlow,i.glow),a.uniform1f(e.uThickness,i.thickness),a.uniform1f(e.uStrands,i.strands),a.uniform1f(e.uChaos,i.chaos),a.uniform1f(e.uSpread,i.spread),a.uniform1f(e.uFlicker,X?0:i.flicker),a.uniform1f(e.uInk,ve),a.uniform4fv(e.uArcEnds,Z),a.uniform4fv(e.uArcShape,ee),a.bindVertexArray(Ce),a.drawArrays(a.TRIANGLES,0,3))},Pe=i=>{if(U=0,ye)return;let n=F.current,e=R((i-ce)/1e3||0,0,.05);ce=Math.max(ce,i);let P=X?.2:1;O+=e*n.speed*P,n.active&&!ke&&(oe=0),ke=n.active,k+=((n.active?1:0)-k)*(1-Math.exp(-e/(n.active?.28:.4))),n.active&&(oe=X?1:Math.min(1,oe+e/.9)),ve+=((n.light?1:0)-ve)*(1-Math.exp(-e/.25));let M=n.interactive&&d.near&&n.active;M&&m.power<.01&&(m.x=d.x,m.y=d.y,m.vx=0,m.vy=0),m.vx+=((d.x-m.x)*120-m.vx*19)*e,m.vy+=((d.y-m.y)*120-m.vy*19)*e,m.x+=m.vx*e,m.y+=m.vy*e,m.power+=((M?1:0)-m.power)*(1-Math.exp(-e/(M?.3:.55)));for(let l=C.length-1;l>=0;l--)O-C[l].born>C[l].life&&C.splice(l,1);if(!X&&n.active&&oe>=1&&n.arcs>0&&C.length<I){let l=e*n.speed*n.arcs;Math.random()<l*5*m.power?C.push(be(O,De(h,m.x-A.width/2,m.y-A.height/2))):Math.random()<l*(.6+h.perimeter/2400)&&C.push(be(O,null))}let D=k*k*(3-2*k);for(let l=0;l<I;l++){let g=l*4,y=C[l];if(!y){ee[g+1]=0;continue}let ue=R((O-y.born)/y.life,0,1);Z[g]=y.ax+A.width/2+x,Z[g+1]=y.ay+A.height/2+x,Z[g+2]=y.bx+A.width/2+x,Z[g+3]=y.by+A.height/2+x,ee[g]=y.bow,ee[g+1]=Math.sin(Math.PI*ue)*D,ee[g+2]=y.seed}for(let l=$.length-1;l>=0;l--)i-$[l].born>2200&&$.splice(l,1);for(let l=0;l<ne;l++){let g=l*4,y=$[l];if(!y){te[g+2]=0;continue}te[g]=y.s,te[g+1]=(i-y.born)/1e3,te[g+2]=1}Ne(n,m.power*(n.interactive?1:0)),(k>.002||n.active||C.length>0)&&xe&&ge&&(U=requestAnimationFrame(Pe))},V=()=>{U||ye||!xe||!ge||(ce=performance.now(),U=requestAnimationFrame(Pe))};B.current=()=>{we(),V()};let Re=i=>{let n=w.getBoundingClientRect();d.x=i.clientX-n.left,d.y=i.clientY-n.top,d.over=d.x>=0&&d.y>=0&&d.x<=n.width&&d.y<=n.height,d.near=d.x>=-x/2&&d.y>=-x/2&&d.x<=n.width+x/2&&d.y<=n.height+x/2},Ee=i=>{Re(i),d.near&&V()},ze=i=>{Re(i);let n=F.current;if(!d.over||!n.interactive||!n.active||X)return;let e=De(h,d.x-A.width/2,d.y-A.height/2);$.push({s:e,born:performance.now()}),$.length>ne&&$.shift(),C.length<I&&C.push(be(O,e)),V()},qe=()=>{d.over=!1,d.near=!1};window.addEventListener("pointermove",Ee,{passive:!0}),window.addEventListener("pointerdown",ze,{passive:!0}),document.documentElement.addEventListener("pointerleave",qe);let Fe=i=>{i.preventDefault(),ye=!0,cancelAnimationFrame(U),U=0},Ie=()=>ie(i=>i+1);b.addEventListener("webglcontextlost",Fe),b.addEventListener("webglcontextrestored",Ie);let Le=new ResizeObserver(()=>{we(),V()});Le.observe(w);let Te=new IntersectionObserver(i=>{xe=i.some(n=>n.isIntersecting),V()});Te.observe(w);let He=()=>{ge=document.visibilityState!=="hidden",V()};return document.addEventListener("visibilitychange",He),we(),V(),()=>{cancelAnimationFrame(U),B.current=null,Le.disconnect(),Te.disconnect(),window.removeEventListener("pointermove",Ee),window.removeEventListener("pointerdown",ze),document.documentElement.removeEventListener("pointerleave",qe),document.removeEventListener("visibilitychange",He),b.removeEventListener("webglcontextlost",Fe),b.removeEventListener("webglcontextrestored",Ie),a.isContextLost()||(a.deleteVertexArray(Ce),a.deleteProgram(se.program))}},[J]),(0,me.jsxs)("div",{ref:Y,className:`electric-border${q?` ${q}`:""}`,style:{borderRadius:W,...re},children:[o,(0,me.jsx)("canvas",{ref:K,className:"electric-border__canvas",style:{top:-x,left:-x},"aria-hidden":"true"})]})},je=Qe;var Ze=fe(Ge()),it=Oe(je);var export_React=Ze.default;export{export_React as React,it as monta};
