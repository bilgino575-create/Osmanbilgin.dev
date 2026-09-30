/**
 * Rain on glass with a bokeh city behind it. One plane, one draw call.
 *
 * Front face (seen from the room): opaque, the night city refracted through
 * running drops. Back face (seen from outside in Act V): mostly transparent
 * glass with the same drops as highlights, so the lit room shows through.
 */
export const windowVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const windowFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uAspect;   // width / height of the pane
uniform float uRain;     // 0..1 amount of rain
uniform float uLit;      // how bright the room is (for the back face)
uniform float uQuality;  // 1 = full, 0 = phone
uniform vec3  uTintA;    // violet
uniform vec3  uTintB;    // cyan
varying vec2 vUv;
varying vec3 vWorldPos;

#define S(a, b, t) smoothstep(a, b, t)

float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float hash21(vec2 p) { return hash22(p).x; }

// ---------- the city ----------
// returns colour of the skyline for a given uv; blur widens window lights into bokeh discs
vec3 city(vec2 uv, float blur) {
  vec3 sky = mix(vec3(0.012, 0.010, 0.028), vec3(0.06, 0.03, 0.11), S(0.0, 1.0, uv.y)) ;
  sky += uTintA * 0.05 * S(0.3, 1.0, uv.y);
  vec3 col = sky;
  // three parallax layers, far → near
  for (int L = 0; L < 3; L++) {
    float fl = float(L);
    float density = 6.0 + fl * 5.0;
    float px = uv.x * density + fl * 3.7;
    float cell = floor(px);
    float h = 0.08 + hash11(cell + fl * 91.0) * (0.18 + fl * 0.17);
    float edge = fract(px);
    float top = h;
    float inBuilding = step(uv.y, top) * step(0.06, edge) * step(edge, 0.94);
    // silhouette darkens with proximity (nearer layers are darker, closer to camera)
    vec3 bcol = mix(vec3(0.03, 0.03, 0.05), vec3(0.008, 0.008, 0.012), fl / 2.0);
    bcol = mix(bcol, sky, (1.0 - fl / 2.0) * 0.55); // aerial perspective
    // windows: grid inside the building
    float wcols = 3.0 + fl * 2.0;
    float wrows = 70.0 - fl * 10.0;
    vec2 wg = vec2(fract(px * wcols), fract(uv.y * wrows));
    vec2 wid = vec2(floor(px * wcols), floor(uv.y * wrows));
    float on = step(0.86 - fl * 0.04, hash21(wid + fl * 17.0));
    float flicker = 0.85 + 0.15 * sin(uTime * (0.5 + hash21(wid) * 2.0) + hash21(wid) * 6.28);
    // bokeh disc: distance to window centre, radius grows with blur
    float r = 0.11 + blur * 0.26;
    float d = length((wg - 0.5) * vec2(1.0, 0.8));
    float disc = S(r, r * 0.3, d) * on * flicker;
    vec3 warm = vec3(1.0, 0.72, 0.42);
    vec3 cool = mix(uTintB, vec3(0.8, 0.9, 1.0), 0.5);
    vec3 wcol = mix(warm, cool, step(0.5, hash21(wid * 1.7 + 3.0)));
    float bright = (0.3 + 0.5 * hash21(wid * 2.3)) * (1.0 - blur * 0.5);
    vec3 layer = bcol + wcol * disc * bright * (0.45 + 0.55 * (fl / 2.0));
    col = mix(col, layer, inBuilding);
  }
  // neon glow low on the skyline
  col += uTintB * 0.045 * S(0.55, 0.0, uv.y) * (0.5 + 0.5 * sin(uv.x * 3.0 + uTime * 0.2));
  col += uTintA * 0.06 * S(0.5, 0.0, uv.y);
  // fog band and horizon haze
  col = mix(col, vec3(0.05, 0.04, 0.09), S(0.5, 0.0, uv.y) * 0.45);
  col += vec3(0.08, 0.05, 0.14) * S(0.6, 0.25, uv.y) * S(0.0, 0.25, uv.y);
  return col;
}

// ---------- drops ----------
vec3 dropLayer(vec2 uv, float t) {
  vec2 UV = uv;
  uv.y += t * 0.75;
  vec2 a = vec2(6.0, 1.0);
  vec2 grid = a * 2.0;
  vec2 id = floor(uv * grid);
  float colShift = hash11(id.x);
  uv.y += colShift;
  id = floor(uv * grid);
  vec2 n = hash22(id);
  vec2 st = fract(uv * grid) - vec2(0.5, 0.0);
  float x = n.x - 0.5;
  float y = UV.y * 20.0;
  float wiggle = sin(y + sin(y));
  x += wiggle * (0.5 - abs(x)) * (n.y - 0.5);
  x *= 0.7;
  float ti = fract(t + n.y);
  y = (S(0.85, 0.0, ti) - 0.5) * 0.9 + 0.5;
  vec2 p = vec2(x, y);
  vec2 d = (st - p) * a.yx;
  float mainDrop = S(0.4, 0.0, length(d));
  float r = sqrt(S(1.0, y, st.y));
  float cd = abs(st.x - x);
  float trail = S(0.23 * r, 0.15 * r * r, cd);
  float trailFront = S(-0.02, 0.02, st.y - y);
  trail *= trailFront * r * r;
  y = UV.y;
  float trail2 = S(0.2 * r, 0.0, cd);
  float droplets = max(0.0, (sin(y * (1.0 - y) * 120.0) - st.y)) * trail2 * trailFront * hash21(id * 1.3);
  y = fract(y * 10.0) + (st.y - 0.5);
  float dd = length(st - vec2(x, y));
  droplets = S(0.3, 0.0, dd);
  float m = mainDrop + droplets * r * trailFront;
  return vec3(m, trail, 0.0);
}

float staticDrops(vec2 uv, float t) {
  uv *= 40.0;
  vec2 id = floor(uv);
  uv = fract(uv) - 0.5;
  vec3 n = vec3(hash22(id * 107.45), hash21(id * 3.7));
  vec2 p = (n.xy - 0.5) * 0.7;
  float d = length(uv - p);
  float fade = S(0.025, 0.0, fract(t + n.z));
  float c = S(0.3, 0.0, d) * fract(n.z * 10.0) * fade;
  return c;
}

vec2 drops(vec2 uv, float t, float l0, float l1, float l2) {
  float s = staticDrops(uv, t) * l0;
  vec3 m1 = dropLayer(uv, t) * l1;
  vec3 m2 = dropLayer(uv * 1.85, t) * l2;
  float c = s + m1.x + m2.x;
  c = S(0.3, 1.0, c);
  return vec2(c, max(m1.y * l0, m2.y * l1));
}

void main() {
  vec2 uv = vUv;
  vec2 auv = vec2(uv.x * uAspect, uv.y);
  float t = uTime * 0.18;
  float rain = uRain;
  float l0 = S(0.0, 1.0, rain) * 0.9;
  float l1 = S(0.25, 0.75, rain);
  float l2 = S(0.0, 0.5, rain);
  vec2 duv = auv * 2.6;
  vec2 c;
  vec3 m1 = dropLayer(duv, t) * l1;
  vec2 n;
  if (uQuality > 0.5) {
    c = drops(duv, t, l0, l1, l2);
    // normal from the drop field
    vec2 e = vec2(0.002, 0.0);
    float cx = drops(duv + e, t, l0, l1, l2).x;
    float cy = drops(duv + e.yx, t, l0, l1, l2).x;
    n = vec2(cx - c.x, cy - c.x);
  } else {
    // phone: the one big-drop layer, refraction from its trail only
    c = vec2(S(0.3, 1.0, m1.x), m1.y);
    n = vec2(m1.x * 0.02, -m1.y * 0.01);
  }

  if (gl_FrontFacing) {
    // inside the room: background is out of focus except where a drop refracts it sharply
    float focus = mix(1.0, 0.1, c.x);
    vec3 col = city(uv + n * 0.9, focus);
    // subtle streak highlight
    col += vec3(0.6, 0.85, 1.0) * (c.y * 0.05 + c.x * 0.02);
    // glass tint + reflection of the room's cyan strip near the bottom
    col += uTintB * 0.03 * S(0.35, 0.0, uv.y) * (1.0 - c.x);
    // vignette at the frame
    float vig = S(0.0, 0.08, uv.x) * S(1.0, 0.92, uv.x) * S(0.0, 0.06, uv.y) * S(1.0, 0.94, uv.y);
    col *= 0.7 + 0.3 * vig;
    gl_FragColor = vec4(col, 1.0);
  } else {
    // outside: transparent glass, drops as highlights, faint reflection of the sky
    vec3 col = vec3(0.6, 0.85, 1.0) * (m1.x * 0.1 + c.y * 0.04);
    col += uTintA * 0.01;
    float alpha = 0.03 + m1.x * 0.1 + c.y * 0.04;
    gl_FragColor = vec4(col, alpha);
  }
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
