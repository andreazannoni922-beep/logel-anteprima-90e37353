import{a as $,b as he,c as se,d as ce}from"./comune-W7MDVSFA.js";var B=$(he());var H=$(se()),pe=512,Y=2048,ue=2560*1600*2,ve=`#version 300 es
layout(location = 0) in vec2 a_position;
uniform vec2 u_resolution;
uniform float u_imageAspect;
uniform float u_scale;
uniform float u_rotation;
out vec2 v_imageUV;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  vec2 uv = a_position * 0.5;
  float r = u_rotation * 3.14159265358979323846 / 180.0;
  mat2 turn = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 imageBox;
  imageBox.x = min(u_resolution.x / u_imageAspect, u_resolution.y) * u_imageAspect;
  imageBox.y = imageBox.x / u_imageAspect;
  v_imageUV = uv * (u_resolution / imageBox) / u_scale;
  v_imageUV.x *= u_imageAspect;
  v_imageUV = turn * v_imageUV;
  v_imageUV.x /= u_imageAspect;
  v_imageUV += 0.5;
  v_imageUV.y = 1.0 - v_imageUV.y;
}`,xe=`#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_colorBack;
uniform vec4 u_colorTint;
uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;
uniform vec2 u_tilt;
uniform float u_reveal;
uniform float u_light;

in vec2 v_imageUV;

out vec4 fragColor;

#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float getColorChanges(float c1, float c2, float stripe, vec3 w, float blur, float bump, float tint) {
  float ch = mix(c2, c1, smoothstep(0.0, 2.0 * blur, stripe));
  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));
  bump = smoothstep(0.2, 0.8, bump);
  border = w[0] + 0.4 * (1.0 - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));
  border = w[0] + 0.5 * (1.0 - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe));
  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe));
  float gradientT = (stripe - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0.0, 1.0, gradientT));
  ch = mix(ch, gradient, smoothstep(border, border + 0.5 * blur, stripe));
  ch = mix(ch, 1.0 - min(1.0, (1.0 - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.0;
  frame *= smoothstep(0.0, th, uv.y);
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.y);
  frame *= smoothstep(0.0, th, uv.x);
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;
  float sum = 4.0 * centerSample;
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += 2.0 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += 2.0 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += 2.0 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;
  return sum / 16.0;
}

void main() {
  const float firstFrameOffset = 2.8;
  float t = 0.3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  float cycleWidth = u_repetition;

  vec2 rotatedUV = uv - vec2(0.5);
  float angle = (-u_angle + 70.0) * PI / 180.0;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(rotatedUV.x * cosA - rotatedUV.y * sinA, rotatedUV.x * sinA + rotatedUV.y * cosA) + vec2(0.5);

  float edge = blurEdge3x3(u_image, uv, dudx, dudy, 6.0, img.r);
  edge = pow(edge, 1.6);
  edge *= smoothstep(0.0, 0.4, u_contour);

  float opacity = img.g * getImgFrame(v_imageUV, 0.0);
  float depth = img.r;

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color1 = mix(vec3(0.98, 0.98, 1.0), vec3(0.9, 0.9, 0.93), u_light);
  vec3 color2 = vec3(0.1, 0.1, 0.1 + 0.1 * smoothstep(0.7, 1.3, diagTLtoBR));

  vec2 gradUV = uv - 0.5 - u_tilt * vec2(0.18, -0.12);
  float dist = length(gradUV + vec2(0.0, 0.2 * diagBLtoTR));
  gradUV = rotate(gradUV, (0.25 - 0.2 * diagBLtoTR) * PI);
  float direction = gradUV.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1.0 - bump;
  bump *= pow(uv.y, 0.3);

  float thinStrip1 = 0.12 / cycleWidth * (1.0 - 0.4 * bump);
  float thinStrip2 = 0.07 / cycleWidth * (1.0 + 0.4 * bump);
  float wideStrip = 1.0 - thinStrip1 - thinStrip2;

  float noise = snoise(uv - t);
  edge += (1.0 - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  direction -= 2.0 * noise * diagBLtoTR * (smoothstep(0.0, 1.0, edge) * (1.0 - smoothstep(0.0, 1.0, edge)));
  direction *= mix(1.0, 1.0 - edge, smoothstep(0.5, 1.0, u_contour));
  direction -= 1.7 * edge * smoothstep(0.5, 1.0, u_contour);
  direction += 0.2 * pow(u_contour, 4.0) * (1.0 - smoothstep(0.0, 1.0, edge));

  bump *= clamp(pow(uv.y, 0.1), 0.3, 1.0);
  direction *= 0.1 + (1.1 - edge) * bump;
  direction *= 0.4 + 0.6 * (1.0 - smoothstep(0.5, 1.0, edge));
  direction += 0.18 * (smoothstep(0.1, 0.2, uv.y) * (1.0 - smoothstep(0.2, 0.4, uv.y)));
  direction += 0.03 * (smoothstep(0.1, 0.2, 1.0 - uv.y) * (1.0 - smoothstep(0.2, 0.4, 1.0 - uv.y)));
  direction *= 0.5 + 0.5 * pow(uv.y, 2.0);
  direction *= cycleWidth;
  direction -= t + dot(u_tilt, vec2(0.35, 0.2));

  float colorDispersion = clamp(1.0 - bump, 0.0, 1.0);
  float dispersionRed = colorDispersion;
  dispersionRed += 0.03 * bump * noise;
  dispersionRed += 5.0 * (smoothstep(-0.1, 0.2, uv.y) * (1.0 - smoothstep(0.1, 0.5, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 1.0, bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion * 1.3;
  dispersionBlue += (smoothstep(0.0, 0.4, uv.y) * (1.0 - smoothstep(0.1, 0.8, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 0.8, bump)));
  dispersionBlue -= 0.2 * edge;

  dispersionRed *= u_shiftRed / 20.0;
  dispersionBlue *= u_shiftBlue / 20.0;

  float softness = 0.05 * u_softness;
  float blur = softness + 0.5 * smoothstep(1.0, 10.0, u_repetition) * smoothstep(0.0, 1.0, edge);
  float smallCanvas = 1.0 - smoothstep(100.0, 500.0, min(u_resolution.x, u_resolution.y));
  blur += smallCanvas * smoothstep(0.0, 1.0, edge);
  float rExtraBlur = softness * (0.05 + 0.1 * (u_shiftRed / 20.0) * bump);
  float gExtraBlur = softness * 0.05 / max(0.001, abs(1.0 - diagBLtoTR));

  vec3 w = vec3(thinStrip1 * cycleWidth, thinStrip2 * cycleWidth, wideStrip);
  w[1] -= 0.02 * smoothstep(0.0, 1.0, edge + bump);
  float stripeR = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripeR, w, blur + fwidth(stripeR) + rExtraBlur, bump, u_colorTint.r);
  float stripeG = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripeG, w, blur + fwidth(stripeG) + gExtraBlur, bump, u_colorTint.g);
  float stripeB = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripeB, w, blur + fwidth(stripeB), bump, u_colorTint.b);

  vec3 sheen = mix(vec3(1.0), u_colorTint.rgb, 0.45 * u_colorTint.a);
  r *= sheen.r;
  g *= sheen.g;
  b *= sheen.b;

  float rim = smoothstep(0.78, 1.0, depth) * u_light;
  r *= 1.0 - rim * 0.62;
  g *= 1.0 - rim * 0.62;
  b *= 1.0 - rim * 0.58;

  float pour = u_reveal * 1.25 - 0.1;
  opacity *= smoothstep(1.0 - pour, 1.15 - pour, depth) * smoothstep(0.0, 0.25, u_reveal);

  vec3 color = vec3(r, g, b) * opacity;
  vec3 back = u_colorBack.rgb * u_colorBack.a;
  color += back * (1.0 - opacity);
  opacity += u_colorBack.a * (1.0 - opacity);
  color += 1.0 / 256.0 * (fract(sin(dot(0.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5);
  fragColor = vec4(color, opacity);
}`,E=(o,a,u)=>Math.min(u,Math.max(a,o)),le=(()=>{let o=null;return(a,u)=>{if(typeof document>"u"||(o??=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),!o))return u;o.clearRect(0,0,1,1),o.fillStyle="rgba(0, 0, 0, 0)",o.fillStyle=String(a),o.fillRect(0,0,1,1);let[s,c,m,f]=o.getImageData(0,0,1,1).data;return[s/255,c/255,m/255,f/255]}})(),_e=o=>new Promise((a,u)=>{let s=new Image;s.crossOrigin="anonymous",s.onload=()=>a(s),s.onerror=()=>u(new Error("MetallicPaint: failed to load the image")),s.src=o}),be=async o=>{if(/\.svg($|[?#])/i.test(o)||o.startsWith("data:image/svg+xml"))return!0;if(!o.startsWith("blob:"))return!1;try{return(await(await fetch(o)).blob()).type==="image/svg+xml"}catch{return!1}},ye=async o=>{let[a,u]=await Promise.all([_e(o),be(o)]),s=a.naturalWidth||a.width||Y,c=a.naturalHeight||a.height||Y,m=Math.max(s,c),f=u?Y/m:E(1024/m,1,Y/m);s=Math.max(1,Math.round(s*f)),c=Math.max(1,Math.round(c*f));let p=document.createElement("canvas");p.width=s,p.height=c;let _=p.getContext("2d",{willReadFrequently:!0});_.drawImage(a,0,0,s,c);let i=_.getImageData(0,0,s,c),h=!0;for(let n=3;n<i.data.length;n+=4)if(i.data[n]<250){h=!1;break}if(h){for(let n=0;n<i.data.length;n+=4){let v=Math.min(i.data[n],i.data[n+1],i.data[n+2]);i.data[n+3]=Math.round(E((250-v)/30,0,1)*255)}_.putImageData(i,0,0)}return p},Ee=async(o,a,u)=>{let c=`${u} 320px ${a}`;try{await document.fonts?.load(c,o)}catch{return null}let m=document.createElement("canvas").getContext("2d");m.font=c;let f=m.measureText(o),p=f.actualBoundingBoxAscent||320*.8,_=f.actualBoundingBoxDescent||320*.2,i=f.actualBoundingBoxLeft||0,h=f.actualBoundingBoxRight||f.width,n=320*.12,v=document.createElement("canvas");v.width=Math.ceil(i+h+n*2),v.height=Math.ceil(p+_+n*2);let R=v.getContext("2d");return R.font=c,R.fillStyle="#000",R.textBaseline="alphabetic",R.fillText(o,n+i,n+p),v},Re=(o,a,u)=>{let s=[];for(let i=0;i<u;i++)for(let h=0;h<a;h++){let n=i*a+h;if(!o[n])continue;h===0||i===0||h===a-1||i===u-1||!o[n-1]||!o[n+1]||!o[n-a]||!o[n+a]||!o[n-a-1]||!o[n-a+1]||!o[n+a-1]||!o[n+a+1]||s.push(n)}let c=new Float32Array(a*u),m=[],f=[];s.forEach(i=>(i%a+Math.floor(i/a))%2===0?m.push(i):f.push(i));let p=i=>{for(let h=0;h<i.length;h++){let n=i[h],v=c[n+1]+c[n-1]+c[n-a]+c[n+a];c[n]=1.9*((.01+v)/4)-.9*c[n]}};for(let i=0;i<40;i++)p(m),p(f);let _=0;return s.forEach(i=>{c[i]>_&&(_=c[i])}),{field:c,peak:_||1}},Te=o=>{let a=o.width,u=o.height,s=pe/Math.min(a,u),c=Math.max(2,Math.round(a*s)),m=Math.max(2,Math.round(u*s)),f=document.createElement("canvas");f.width=c,f.height=m;let p=f.getContext("2d",{willReadFrequently:!0});p.drawImage(o,0,0,c,m);let _=p.getImageData(0,0,c,m).data,i=new Uint8Array(c*m);for(let l=0;l<i.length;l++)i[l]=_[l*4+3]>0?1:0;let{field:h,peak:n}=Re(i,c,m),v=p.createImageData(c,m);for(let l=0;l<i.length;l++){let T=l*4,V=i[l]?255*(1-h[l]/n):255;v.data[T]=V,v.data[T+1]=V,v.data[T+2]=V,v.data[T+3]=i[l]?255:0}p.putImageData(v,0,0);let R=document.createElement("canvas");R.width=a,R.height=u;let D=R.getContext("2d",{willReadFrequently:!0});D.imageSmoothingEnabled=!0,D.imageSmoothingQuality="high",D.drawImage(f,0,0,c,m,0,0,a,u);let b=D.getImageData(0,0,a,u),z=o.getContext("2d",{willReadFrequently:!0}).getImageData(0,0,a,u).data;for(let l=0;l<b.data.length;l+=4){let T=z[l+3];T===0?(b.data[l]=255,b.data[l+1]=0):(b.data[l]=b.data[l+3]===0?0:b.data[l],b.data[l+1]=T),b.data[l+2]=255,b.data[l+3]=255}return b},de=(o,a,u)=>{let s=o.createShader(a);return s?(o.shaderSource(s,u),o.compileShader(s),o.getShaderParameter(s,o.COMPILE_STATUS)?s:(o.deleteShader(s),null)):null};function K({imageSrc:o,text:a,fontFamily:u="system-ui, sans-serif",fontWeight:s=800,color:c="#ffffff",backgroundColor:m="transparent",density:f=2,softness:p=.1,dispersion:_=.3,distortion:i=.07,edgeBend:h=.6,angle:n=70,speed:v=1,scale:R=.6,rotation:D=0,mouseTilt:b=.5,lightMode:z=!1,intro:l=!0,paused:T=!1,dpr:V,className:me="",style:fe}){let Q=(0,B.useRef)(null),Z=(0,B.useRef)(null),U=(0,B.useRef)(null),L=(0,B.useRef)(null);return L.current={tint:le(c,[1,1,1,1]),back:le(m,[0,0,0,0]),density:E(f,.5,12),softness:E(p,0,1),dispersion:E(_,-1,1),distortion:E(i,0,1),edgeBend:E(h,0,1),angle:n,speed:v,scale:Math.max(.05,R),rotation:D,mouseTilt:E(b,0,1.5),lightMode:z,intro:l,paused:T,dpr:V},(0,B.useEffect)(()=>{let x=Q.current,w=Z.current;if(!x||!w)return;let e=w.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!e)return;let F=de(e,e.VERTEX_SHADER,ve),O=de(e,e.FRAGMENT_SHADER,xe),y=e.createProgram();if(!F||!O||!y||(e.attachShader(y,F),e.attachShader(y,O),e.linkProgram(y),e.deleteShader(F),e.deleteShader(O),!e.getProgramParameter(y,e.LINK_STATUS)))return;e.useProgram(y);let g={},ge=e.getProgramParameter(y,e.ACTIVE_UNIFORMS);for(let r=0;r<ge;r++){let d=e.getActiveUniform(y,r);d&&(g[d.name]=e.getUniformLocation(y,d.name))}let k=e.createVertexArray(),J=e.createBuffer();e.bindVertexArray(k),e.bindBuffer(e.ARRAY_BUFFER,J),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let W=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,W),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([255,0,255,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.uniform1i(g.u_image,0);let j=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,t={raf:0,last:0,time:0,visible:!0,pending:!1,hasImage:!1,imageAspect:1,width:0,height:0,revealStart:-1,reveal:L.current.intro&&!j?0:1,tiltX:0,tiltY:0,velocityX:0,velocityY:0,targetX:0,targetY:0,alive:!0},q=()=>{let r=L.current,d=x.getBoundingClientRect(),X=r.dpr??Math.min(window.devicePixelRatio||1,2),A=Math.max(X,2),P=d.width*d.height*A*A;P>ue&&(A*=Math.sqrt(ue/P));let M=Math.max(1,Math.round(d.width*A)),S=Math.max(1,Math.round(d.height*A));M===t.width&&S===t.height||(t.width=M,t.height=S,w.width=M,w.height=S,e.viewport(0,0,M,S))},C=()=>{let r=L.current;if(t.pending||!t.hasImage){e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT);return}e.useProgram(y),e.uniform2f(g.u_resolution,t.width,t.height),e.uniform1f(g.u_time,t.time),e.uniform1f(g.u_imageAspect,t.imageAspect),e.uniform1f(g.u_scale,r.scale),e.uniform1f(g.u_rotation,r.rotation),e.uniform4f(g.u_colorBack,r.back[0],r.back[1],r.back[2],r.back[3]),e.uniform4f(g.u_colorTint,r.tint[0],r.tint[1],r.tint[2],r.tint[3]),e.uniform1f(g.u_softness,r.softness),e.uniform1f(g.u_repetition,r.density),e.uniform1f(g.u_shiftRed,r.dispersion),e.uniform1f(g.u_shiftBlue,r.dispersion),e.uniform1f(g.u_distortion,r.distortion),e.uniform1f(g.u_contour,r.edgeBend),e.uniform1f(g.u_angle,r.angle),e.uniform2f(g.u_tilt,t.tiltX,t.tiltY),e.uniform1f(g.u_reveal,t.reveal),e.uniform1f(g.u_light,r.lightMode?1:0),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.bindVertexArray(k),e.drawArrays(e.TRIANGLE_STRIP,0,4)},ee=r=>{if(t.raf=0,!t.alive)return;let d=L.current,X=t.last?Math.min(.05,(r-t.last)/1e3):1/60;t.last=r;let A=!d.paused&&!j&&d.speed!==0;A&&(t.time+=X*d.speed);let P=A;if(t.reveal<1&&!t.pending){t.revealStart<0&&(t.revealStart=r);let G=E((r-t.revealStart)/1600,0,1);t.reveal=1-(1-G)**3,A&&(t.time+=X*2.4*(1-G)**2),P=!0}let M=60,S=14,ne=Math.max(1,Math.ceil(X/(1/240))),N=X/ne;for(let G=0;G<ne;G++)t.velocityX+=(M*(t.targetX*d.mouseTilt-t.tiltX)-S*t.velocityX)*N,t.velocityY+=(M*(t.targetY*d.mouseTilt-t.tiltY)-S*t.velocityY)*N,t.tiltX+=t.velocityX*N,t.tiltY+=t.velocityY*N;(Math.abs(t.targetX*d.mouseTilt-t.tiltX)>5e-4||Math.abs(t.targetY*d.mouseTilt-t.tiltY)>5e-4||Math.abs(t.velocityX)+Math.abs(t.velocityY)>5e-4)&&(P=!0),C(),P&&t.visible?t.raf=requestAnimationFrame(ee):t.last=0},I=()=>{!t.raf&&t.alive&&t.visible&&(t.raf=requestAnimationFrame(ee))},te=r=>{let d=x.getBoundingClientRect();t.targetX=E((r.clientX-d.left)/d.width*2-1,-1.2,1.2),t.targetY=E((r.clientY-d.top)/d.height*2-1,-1.2,1.2),I()},oe=()=>{t.targetX=0,t.targetY=0,I()},re=new ResizeObserver(()=>{q(),C()});re.observe(x);let ae=new IntersectionObserver(r=>{t.visible=r.some(d=>d.isIntersecting),t.visible&&I()});ae.observe(x);let ie=r=>{r.preventDefault(),t.alive=!1,cancelAnimationFrame(t.raf)};return w.addEventListener("webglcontextlost",ie),x.addEventListener("pointermove",te),x.addEventListener("pointerleave",oe),U.current={setPending:r=>{t.pending=r,C()},setImage:r=>{t.pending=!1,e.bindTexture(e.TEXTURE_2D,W),r?(e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),t.imageAspect=r.width/r.height,t.hasImage=!0):(e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([255,0,255,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),t.imageAspect=1,t.hasImage=!1),C(),I()},wake:I,redraw:()=>{q(),C(),I()}},q(),C(),I(),()=>{t.alive=!1,cancelAnimationFrame(t.raf),re.disconnect(),ae.disconnect(),w.removeEventListener("webglcontextlost",ie),x.removeEventListener("pointermove",te),x.removeEventListener("pointerleave",oe),U.current=null,e.deleteTexture(W),e.deleteBuffer(J),e.deleteVertexArray(k),e.deleteProgram(y)}},[]),(0,B.useEffect)(()=>{let x=!0,w=a?Ee(a,u,s):o?ye(o):null;if(!w){U.current?.setImage(null);return}return U.current?.setPending(!0),w.then(e=>{if(!x||!e)return;let F=Te(e);x&&U.current?.setImage(F)}).catch(()=>{x&&U.current?.setImage(null)}),()=>{x=!1}},[o,a,u,s]),(0,B.useEffect)(()=>{U.current?.redraw()}),(0,H.jsx)("div",{ref:Q,className:`metallic-paint ${me}`.trim(),style:fe,children:(0,H.jsx)("canvas",{ref:Z,className:"metallic-paint-canvas"})})}var Se=ce(K);export{Se as monta};
