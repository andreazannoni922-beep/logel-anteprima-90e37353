import{a as O,b as ke,c as ce,d as fe}from"./comune-W7MDVSFA.js";var l=O(ke());var p=O(ce()),Fe=["bursts","stars","shards","cosmos","rainbow","swirl","glitter","gold"],ue=1100,Se=63/88,Me=`#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`,Ue=`#version 300 es
precision highp float;

uniform sampler2D uArt;
uniform vec2 uSize;
uniform float uAspect;
uniform vec2 uTilt;
uniform vec2 uLight;
uniform float uDistance;
uniform int uPreset;
uniform float uIntensity;
uniform float uScale;
uniform float uEdge;
uniform float uFrame;
uniform float uRadius;
uniform float uGlare;
uniform vec3 uFoil;
uniform float uReady;

out vec4 outColor;

const float TAU = 6.28318530718;

struct Foil {
  float mask;
  float angle;
  float jitter;
  vec2 facet;
};

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

vec2 hash2(vec2 p) {
  return vec2(hash(p), hash(p + 17.31));
}

vec3 hue(float t) {
  t = abs(fract(t * 0.5) * 2.0 - 1.0);
  vec3 c = mix(vec3(0.1, 0.25, 1.0), vec3(0.0, 0.85, 1.0), smoothstep(0.0, 0.25, t));
  c = mix(c, vec3(0.25, 1.0, 0.2), smoothstep(0.25, 0.45, t));
  c = mix(c, vec3(1.0, 0.92, 0.05), smoothstep(0.45, 0.65, t));
  c = mix(c, vec3(1.0, 0.45, 0.05), smoothstep(0.65, 0.85, t));
  return mix(c, vec3(0.95, 0.12, 0.3), smoothstep(0.85, 1.0, t));
}

Foil bursts(vec2 p) {
  vec2 q = mat2(0.7071068, 0.7071068, -0.7071068, 0.7071068) * (p - vec2(0.5, 0.5 * uAspect)) / (0.283 / uScale);
  vec2 d = fract(q) - 0.5;
  float u = length(d) / 0.49;
  float angle = atan(d.y, d.x);
  if (u < 0.12) {
    float ring = min(floor(u / 0.045 + 0.5), 2.0);
    float count = max(1.0, ring * 6.0);
    float spot = (floor(angle / TAU * count) + 0.5) / count * TAU;
    vec2 dot = vec2(cos(spot), sin(spot)) * ring * 0.045;
    float m = smoothstep(0.024, 0.012, length(d / 0.49 - dot));
    return Foil(m, angle, 0.5, vec2(0.0));
  }
  bool inner = u < 0.66;
  float slot = angle / TAU * (inner ? 56.0 : 72.0);
  bool shifted = mod(floor(slot), 2.0) > 0.5;
  vec2 band = inner ? (shifted ? vec2(0.45, 0.61) : vec2(0.33, 0.49)) : (shifted ? vec2(0.84, 0.99) : vec2(0.7, 0.85));
  float across = abs(u - (band.x + band.y) * 0.5) / ((band.y - band.x) * 0.5);
  float along = abs(fract(slot) - 0.5) * 2.0;
  float width = inner ? 0.72 : 0.6;
  float m = smoothstep(1.0, 0.78, across) * smoothstep(width, width - 0.2, along);
  return Foil(m, angle, 0.5, vec2(0.0));
}

Foil stars(vec2 p) {
  Foil best = Foil(0.0, 0.0, 0.0, vec2(0.0));
  vec2 g = p / (0.08 / uScale);
  vec2 base = floor(g);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 id = base + vec2(float(i), float(j));
      float pick = hash(id + 1.3);
      vec2 d = g - (id + 0.5 + (hash2(id) - 0.5) * 0.55);
      float m = smoothstep(0.07, 0.035, length(d));
      if (pick < 0.62) {
        float size = mix(0.16, 0.5, pow(hash(id + 9.0), 1.8));
        float sector = TAU / (pick < 0.3 ? 4.0 : 5.0);
        float k = abs(fract((atan(d.y, d.x) + hash(id + 4.0) * TAU) / sector) - 0.5) * 2.0;
        float edge = size * mix(1.0, 0.36, pow(k, 0.6));
        m = smoothstep(edge, edge * 0.8, length(d));
      }
      if (m > best.mask) best = Foil(m, hash(id + 6.0) * TAU, hash(id + 8.0), (hash2(id + 2.0) - 0.5) * 0.6);
    }
  }
  return best;
}

Foil shards(vec2 p) {
  vec2 g = p * 19.0 * uScale;
  vec2 base = floor(g);
  float best = 9.0;
  float second = 9.0;
  vec2 id = base;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 cell = base + vec2(float(i), float(j));
      float d = length(cell + 0.08 + hash2(cell) * 0.84 - g);
      if (d < best) {
        second = best;
        best = d;
        id = cell;
      } else if (d < second) {
        second = d;
      }
    }
  }
  float crack = smoothstep(0.015, 0.07, second - best);
  float shine = 0.25 + 0.75 * pow(hash(id + 7.7), 2.0);
  return Foil((0.2 + 0.8 * crack) * shine, hash(id + 3.17) * TAU, hash(id + 11.73), (hash2(id + 5.0) - 0.5) * 0.5);
}

Foil cosmos(vec2 p) {
  Foil best = Foil(0.0, 0.0, 0.0, vec2(0.0));
  vec2 g = p / (0.16 / uScale);
  vec2 base = floor(g);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 id = base + vec2(float(i), float(j));
      vec2 d = g - (id + 0.5 + (hash2(id) - 0.5) * 0.7);
      float size = mix(0.16, 0.52, hash(id + 2.0));
      float r = length(d);
      float m = max(smoothstep(0.05, 0.0, abs(r - size)), smoothstep(size, size - 0.04, r) * 0.22);
      if (m > best.mask) best = Foil(m, hash(id + 6.0) * TAU + atan(d.y, d.x) * 0.5, hash(id + 1.0), (hash2(id + 4.0) - 0.5) * 0.5);
    }
  }
  vec2 fine = p / (0.035 / uScale);
  vec2 cell = floor(fine);
  float dots = smoothstep(0.2, 0.1, length(fine - cell - 0.5 - (hash2(cell + 9.0) - 0.5) * 0.6)) * step(0.55, hash(cell + 2.0));
  if (dots > best.mask) best = Foil(dots, hash(cell) * TAU, hash(cell + 3.0), (hash2(cell + 7.0) - 0.5) * 0.6);
  return best;
}

Foil rainbow(vec2 p) {
  return Foil(0.86 + 0.14 * hash(floor(p * 700.0 * uScale)), 0.2, 0.5, vec2(0.0));
}

Foil swirl(vec2 p) {
  vec2 d = p - vec2(0.5, 0.42 * uAspect);
  float angle = atan(d.y, d.x);
  float rays = 0.55 + 0.45 * smoothstep(0.3, 0.7, abs(fract(angle / TAU * 60.0 * uScale) - 0.5) * 2.0);
  return Foil(rays, angle, length(d), vec2(0.0));
}

Foil glitter(vec2 p) {
  vec2 g = p * 72.0 * uScale;
  vec2 cell = floor(g);
  float size = mix(0.18, 0.4, hash(cell + 3.0));
  float m = smoothstep(size, size * 0.55, length(fract(g) - 0.5 - (hash2(cell) - 0.5) * 0.5)) * step(0.25, hash(cell + 5.0));
  return Foil(m, hash(cell + 7.0) * TAU, hash(cell + 9.0), (hash2(cell + 11.0) - 0.5) * 0.9);
}

Foil gold(vec2 p) {
  Foil flake = glitter(p * 0.8);
  if (flake.mask > 0.5) return flake;
  float etch = 0.55 + 0.45 * smoothstep(0.2, 0.8, abs(fract((p.x * 0.6 + p.y) * 140.0 * uScale) - 0.5) * 2.0);
  return Foil(etch, 0.9, 0.4, vec2(0.0));
}

vec3 sparkles(vec2 p, vec3 halfway, vec2 sweep, float awake) {
  vec2 g = p * 62.0;
  vec2 cell = floor(g);
  vec2 d = fract(g) - 0.5 - (hash2(cell) - 0.5) * 0.36;
  float spin = hash(cell + 3.0) * TAU;
  d = mat2(cos(spin), -sin(spin), sin(spin), cos(spin)) * d;
  vec2 a = abs(d);
  float hexagon = max(a.x * 0.866 + a.y * 0.5, a.y);
  float size = mix(0.22, 0.38, hash(cell + 2.0));
  float piece = smoothstep(size, size - 0.07, hexagon) * step(0.42, hash(cell + 4.0));
  vec3 facet = normalize(vec3((hash2(cell + 6.0) - 0.5) * 0.9, 1.0));
  float flash = pow(max(dot(facet, halfway), 0.0), 6.0);
  vec3 tint = hue(dot(sweep, vec2(cos(spin), sin(spin))) * 1.2 + dot(sweep, vec2(0.8, 0.6)) * 0.8 + hash(cell + 8.0) * 0.5);
  vec3 color = piece * tint * (0.3 + 1.6 * flash) * awake;
  vec2 fine = p * 210.0;
  vec2 speckCell = floor(fine);
  float speck = smoothstep(0.24, 0.0, length(fract(fine) - 0.5 - (hash2(speckCell) - 0.5) * 0.5)) * step(0.72, hash(speckCell + 1.0));
  float speckFlash = pow(max(dot(normalize(vec3((hash2(speckCell + 2.0) - 0.5) * 0.9, 1.0)), halfway), 0.0), 10.0);
  return color + vec3(1.2) * speck * speckFlash * (1.0 - piece);
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / uSize.x, 1.0 - gl_FragCoord.y / uSize.y);
  vec2 p = vec2(uv.x, uv.y * uAspect);
  vec2 center = vec2(0.5, 0.5 * uAspect);
  vec2 q = abs(p - center) - center + uRadius;
  float outside = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float pixel = 1.0 / uSize.x;
  float alpha = clamp(0.5 - outside / pixel, 0.0, 1.0);
  vec4 sampled = texture(uArt, uv);
  if (uReady > 0.5) alpha *= sampled.a;
  if (alpha <= 0.0) {
    outColor = vec4(0.0);
    return;
  }
  vec3 art = uReady > 0.5 ? pow(sampled.rgb, vec3(2.2)) : vec3(0.12);

  mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, cos(uTilt.x), sin(uTilt.x), 0.0, -sin(uTilt.x), cos(uTilt.x));
  mat3 ry = mat3(cos(uTilt.y), 0.0, -sin(uTilt.y), 0.0, 1.0, 0.0, sin(uTilt.y), 0.0, cos(uTilt.y));
  mat3 turn = rx * ry;
  vec3 world = turn * vec3(p - center, 0.0);
  vec3 view = normalize(transpose(turn) * (vec3(0.0, 0.0, uDistance) - world));
  vec3 lamp = vec3((uLight - 0.5) * vec2(1.1, 1.1 * uAspect), 0.9);
  vec3 light = normalize(transpose(turn) * (lamp - world));
  vec3 halfway = normalize(light + view);
  vec2 sweep = light.xy + view.xy;
  float sheen = pow(max(halfway.z, 0.0), 10.0);
  float shine = pow(max(halfway.z, 0.0), 80.0);
  float frame = 1.0 - smoothstep(uFrame - pixel, uFrame + pixel, -outside);

  Foil f;
  if (uPreset == 0) f = bursts(p);
  else if (uPreset == 1) f = stars(p);
  else if (uPreset == 2) f = shards(p);
  else if (uPreset == 3) f = cosmos(p);
  else if (uPreset == 4) f = rainbow(p);
  else if (uPreset == 5) f = swirl(p);
  else if (uPreset == 6) f = glitter(p);
  else f = gold(p);

  vec3 metal = uPreset == 7 ? vec3(1.0, 0.74, 0.38) * dot(uFoil, vec3(0.3333)) * 1.15 : uFoil;
  vec4 look = uPreset == 0 ? vec4(0.25, 1.9, 0.12, 1.0)
    : uPreset == 1 ? vec4(0.6, 1.4, 0.3, 1.0)
    : uPreset == 2 ? vec4(0.9, 0.9, 0.6, 0.5)
    : uPreset == 3 ? vec4(0.7, 1.2, 0.35, 0.85)
    : uPreset == 4 ? vec4(0.0, 2.2, 0.0, 0.45)
    : uPreset == 5 ? vec4(1.6, 0.3, 0.0, 0.4)
    : uPreset == 6 ? vec4(0.9, 1.0, 0.6, 1.0)
    : vec4(0.3, 1.0, 0.2, 0.95);
  vec2 dir = vec2(cos(f.angle), sin(f.angle));
  float phase = dot(sweep, dir) * look.x + dot(sweep, vec2(0.8, 0.6)) * look.y + f.jitter * look.z;
  float spoke = 1.0;
  if (uPreset == 5) {
    float facing = dot(normalize(sweep + 0.0001), dir);
    phase = f.jitter * 2.4 + facing * 0.6 + length(sweep) * 0.8;
    spoke = 0.3 + 0.7 * smoothstep(0.25, 0.95, abs(facing));
  }
  vec3 tint = hue(phase);
  if (uPreset == 7) tint = mix(tint, metal, 0.65);
  float glint = pow(max(dot(normalize(vec3(f.facet, 1.0)), halfway), 0.0), 24.0) * step(0.001, length(f.facet));
  bool layered = uPreset == 2 || uPreset == 4 || uPreset == 5 || uPreset == 7;
  vec3 foil = (layered ? tint : mix(tint, vec3(1.0), 0.12)) * (1.15 + 0.3 * sheen) + metal * glint * 1.2;
  float tilted = smoothstep(0.02, 0.21, length(sin(uTilt)));
  float awake = mix(0.2, 1.0, tilted);
  float strength = uIntensity * f.mask * (1.0 - frame) * awake;
  float band = uPreset == 5 ? spoke : layered ? 0.25 + 0.75 * smoothstep(0.3, 0.95, 0.5 + 0.5 * cos(phase * TAU * 0.5 + 1.3)) : 1.0;
  vec3 color = layered
    ? 1.0 - (1.0 - art) * (1.0 - clamp(foil * look.w * band * strength, 0.0, 1.0))
    : mix(art, foil, clamp(strength * look.w, 0.0, 1.0));
  color += sparkles(p, halfway, sweep, mix(0.55, 1.0, tilted)) * uEdge * frame;
  color += uFoil * sheen * 0.12 * frame;
  color += vec3(sheen * 0.07 + shine * 0.3) * uGlare;
  color = pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2));
  outColor = vec4(color * alpha, alpha);
}
`,v=(r,h,d)=>Math.min(d,Math.max(h,r)),Xe=r=>{let h=[.78,.8,.84];if(typeof document>"u")return h;let d=document.createElement("canvas").getContext("2d");if(!d)return h;d.fillStyle="#000000",d.fillStyle=r;let u=d.fillStyle;return!u.startsWith("#")||u.length!==7?h:[1,3,5].map(k=>Math.pow(parseInt(u.slice(k,k+2),16)/255,2.2))},he=(r,h,d)=>{let u=r.createShader(h);return u?(r.shaderSource(u,d),r.compileShader(u),r.getShaderParameter(u,r.COMPILE_STATUS)?u:(r.deleteShader(u),null)):null};function W({image:r,backImage:h,alt:d="",preset:u="bursts",intensity:k=.85,scale:de=1,edgeSparkle:pe=.8,frame:me=4,glare:ve=.5,foilColor:ge="#e2e6ec",width:be=320,radius:$=14,tiltMax:xe=14,hoverScale:we=1.04,idle:Te=!0,shadow:ye=!0,className:q="",style:_e}){let H=(0,l.useRef)(null),K=(0,l.useRef)(null),I=(0,l.useRef)(null),J=(0,l.useRef)(null),Y=(0,l.useRef)(null),F=(0,l.useRef)({x:.5,y:.5,inside:!1}),E=(0,l.useRef)(null),S=(0,l.useRef)(null),D=(0,l.useRef)(!1),[Re,Ee]=(0,l.useState)(Se),[Ae,Q]=(0,l.useState)(!1),[Z,Pe]=(0,l.useState)(!1),g=!!h;Y.current={preset:Math.max(0,Fe.indexOf(u)),intensity:v(k,0,1),scale:v(de,.25,4),edgeSparkle:v(pe,0,1),frame:v(me,0,20)/100,glare:v(ve,0,1),foil:Xe(ge),radius:Math.max(0,$),tiltMax:v(xe,0,45),hoverScale:v(we,.8,1.3),idle:Te},D.current=g&&Z,(0,l.useEffect)(()=>{E.current?.()}),(0,l.useEffect)(()=>{S.current?.(r)},[r]),(0,l.useEffect)(()=>{let s=H.current,b=K.current,f=J.current;if(!s||!b||!f)return;let C=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,e=f.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1}),c=null,A=null,L=null,n={},M=!1;if(e){let o=he(e,e.VERTEX_SHADER,Me),a=he(e,e.FRAGMENT_SHADER,Ue);if(o&&a&&(c=e.createProgram(),e.attachShader(c,o),e.attachShader(c,a),e.bindAttribLocation(c,0,"position"),e.linkProgram(c),e.deleteShader(o),e.deleteShader(a),e.getProgramParameter(c,e.LINK_STATUS)||(e.deleteProgram(c),c=null)),c){L=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,L),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),A=e.createTexture(),e.bindTexture(e.TEXTURE_2D,A),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));for(let i of["uArt","uSize","uAspect","uTilt","uLight","uDistance","uPreset","uIntensity","uScale","uEdge","uFrame","uRadius","uGlare","uFoil","uReady"])n[i]=e.getUniformLocation(c,i)}}let t={tiltX:0,tiltY:0,tiltVX:0,tiltVY:0,lightX:.36,lightY:.26,lightVX:0,lightVY:0,lift:1,liftV:0,turn:0,turnV:0,clock:Math.random()*40},P=0,G=0,N=!0,U=!0,X=0,B=()=>{if(!e||!c)return;let o=Y.current,a=f.width,i=f.height;!a||!i||(e.viewport(0,0,a,i),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(c),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,A),e.uniform1i(n.uArt,0),e.uniform2f(n.uSize,a,i),e.uniform1f(n.uAspect,i/a),e.uniform2f(n.uTilt,t.tiltX*Math.PI/180,(t.tiltY+t.turn)*Math.PI/180),e.uniform2f(n.uLight,t.lightX,t.lightY),e.uniform1f(n.uDistance,ue/Math.max(1,f.clientWidth)),e.uniform1i(n.uPreset,o.preset),e.uniform1f(n.uIntensity,o.intensity),e.uniform1f(n.uScale,o.scale),e.uniform1f(n.uEdge,o.edgeSparkle),e.uniform1f(n.uFrame,o.frame),e.uniform1f(n.uRadius,o.radius/Math.max(1,f.clientWidth)),e.uniform1f(n.uGlare,o.glare),e.uniform3f(n.uFoil,o.foil[0],o.foil[1],o.foil[2]),e.uniform1f(n.uReady,M?1:0),e.drawArrays(e.TRIANGLES,0,3))},T=(o,a,i,m,y,x)=>{let _=a+((i-o)*m-a*y)*x;return[o+_*x,_]},ae=o=>{if(P=0,!U)return;let a=Math.min(1/30,Math.max(1/240,(o-G)/1e3));G=o;let i=Y.current,m=F.current,y=0,x=0,_=.36,j=.26,re=1,se=i.idle&&!C&&!m.inside;if(m.inside&&!C)y=(.5-m.y)*2*i.tiltMax,x=(m.x-.5)*2*i.tiltMax,_=m.x,j=m.y,re=i.hoverScale;else if(se){t.clock+=a;let w=t.clock;y=Math.sin(w*.7)*i.tiltMax*.28,x=Math.sin(w*.53+1.2)*i.tiltMax*.4,_=.5+Math.sin(w*.41)*.42,j=.38+Math.sin(w*.33+.6)*.3}let ne=Math.ceil(a/(1/240)),R=a/ne;for(let w=0;w<ne;w++)[t.tiltX,t.tiltVX]=T(t.tiltX,t.tiltVX,y,150,16,R),[t.tiltY,t.tiltVY]=T(t.tiltY,t.tiltVY,x,150,16,R),[t.lightX,t.lightVX]=T(t.lightX,t.lightVX,_,220,30,R),[t.lightY,t.lightVY]=T(t.lightY,t.lightVY,j,220,30,R),[t.lift,t.liftV]=T(t.lift,t.liftV,re,320,30,R),[t.turn,t.turnV]=C?[D.current?180:0,0]:T(t.turn,t.turnV,D.current?180:0,170,20,R);b.style.transform=`perspective(${ue}px) scale(${t.lift}) rotateX(${t.tiltX}deg) rotateY(${t.tiltY+t.turn}deg)`,I.current&&(I.current.style.transform=`translate(${-t.tiltY*.7}px, ${t.tiltX*.7}px) scale(${.9+(t.lift-1)*1.5})`),Math.cos((t.tiltY+t.turn)*Math.PI/180)>-.05&&B(),X=Math.abs(t.tiltVX)+Math.abs(t.tiltVY)+Math.abs(t.liftV)*40+Math.abs(t.turnV)+(Math.abs(t.lightVX)+Math.abs(t.lightVY))*60+Math.abs(t.tiltX-y)+Math.abs(t.tiltY-x)>.02?0:X+a,!(!N||!se&&!m.inside&&X>.3)&&(P=requestAnimationFrame(ae))},z=()=>{P||!U||(X=0,G=performance.now(),P=requestAnimationFrame(ae))};E.current=z;let oe=()=>{let o=Math.min(window.devicePixelRatio||1,2),a=Math.max(1,Math.round(f.clientWidth*o)),i=Math.max(1,Math.round(f.clientHeight*o));(f.width!==a||f.height!==i)&&(f.width=a,f.height=i),B(),z()};S.current=o=>{if(M=!1,Q(!1),!o)return;let a=new Image;a.crossOrigin="anonymous",a.decoding="async",a.onload=()=>{if(U&&(a.naturalWidth&&a.naturalHeight&&Ee(a.naturalWidth/a.naturalHeight),!(!e||!c)))try{e.bindTexture(e.TEXTURE_2D,A),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,a),e.generateMipmap(e.TEXTURE_2D),M=!0,Q(!0),B(),z()}catch{M=!1}},a.src=o},S.current(r);let ie=new ResizeObserver(oe);ie.observe(f);let le=new IntersectionObserver(o=>{N=o.some(a=>a.isIntersecting),N&&z()});return le.observe(s),oe(),()=>{U=!1,cancelAnimationFrame(P),E.current=null,S.current=null,ie.disconnect(),le.disconnect(),e&&(e.deleteTexture(A),e.deleteBuffer(L),e.deleteProgram(c))}},[]);let V=s=>{if(s.pointerType==="touch"&&s.type==="pointermove"&&!s.buttons)return;let b=s.currentTarget.getBoundingClientRect();F.current={x:v((s.clientX-b.left)/b.width,0,1),y:v((s.clientY-b.top)/b.height,0,1),inside:!0},E.current?.()},ee=()=>{F.current={...F.current,inside:!1},E.current?.()},te=()=>{g&&Pe(s=>!s)};return(0,p.jsxs)("div",{ref:H,className:`holo-card${q?` ${q}`:""}`,role:g?"button":"img",tabIndex:g?0:void 0,"aria-label":d||void 0,"aria-pressed":g?Z:void 0,"data-ready":Ae?"":void 0,"data-flippable":g?"":void 0,onPointerEnter:V,onPointerMove:V,onPointerDown:V,onPointerLeave:ee,onPointerCancel:ee,onClick:te,onKeyDown:s=>{!g||s.key!=="Enter"&&s.key!==" "||(s.preventDefault(),s.repeat||te())},style:{"--hc-w":`${be}px`,"--hc-ratio":Re,"--hc-radius":`${$}px`,..._e},children:[ye?(0,p.jsx)("span",{ref:I,className:"holo-card__shadow","aria-hidden":"true"}):null,(0,p.jsxs)("div",{ref:K,className:"holo-card__rotor",children:[(0,p.jsxs)("div",{className:"holo-card__face holo-card__face--front",children:[r?(0,p.jsx)("img",{src:r,alt:"",draggable:!1}):null,(0,p.jsx)("canvas",{ref:J})]}),g?(0,p.jsx)("div",{className:"holo-card__face holo-card__face--back",children:(0,p.jsx)("img",{src:h,alt:"",draggable:!1})}):null]})]})}var Ge=fe(W);export{Ge as monta};
