/** Shaders for the silicon act: die surface, traces, gauges, motherboard. */

export const dieVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormalW;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

/**
 * Iridescent die: a dark silicon base with a fine lithographic grid, thin-film
 * interference colour that shifts with the viewing angle, and a slow heat
 * shimmer in the emissive term.
 */
export const dieFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uCyan;
uniform vec3 uViolet;
uniform float uScale;   // grid cells across the die
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormalW;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
vec3 filmColor(float t) {
  // thin-film interference palette, biased to the brand
  return 0.5 + 0.5 * cos(6.2831 * (t + vec3(0.0, 0.33, 0.67)));
}

void main() {
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 N = normalize(vNormalW);
  float NdV = max(dot(N, V), 0.0);
  float fres = pow(1.0 - NdV, 2.5);

  // lithographic micro grid: two frequencies
  vec2 g1 = fract(vUv * uScale);
  vec2 g2 = fract(vUv * uScale * 7.0);
  float line1 = smoothstep(0.0, 0.03, g1.x) * smoothstep(1.0, 0.97, g1.x) * smoothstep(0.0, 0.03, g1.y) * smoothstep(1.0, 0.97, g1.y);
  float line2 = smoothstep(0.0, 0.12, g2.x) * smoothstep(1.0, 0.88, g2.x);
  float cells = noise(floor(vUv * uScale) * 0.37);
  float cellTone = 0.35 + 0.65 * cells;

  // interference: view angle + cell structure drive the film thickness
  float thickness = fres * 1.6 + cells * 0.4 + vUv.x * 0.3;
  vec3 film = filmColor(thickness);
  film = mix(film, mix(uViolet, uCyan, cells), 0.55);

  vec3 base = vec3(0.012, 0.014, 0.02) * cellTone;
  base += vec3(0.02) * (1.0 - line1) * 0.6;
  vec3 col = base + film * (0.06 + fres * 0.55) * (0.6 + 0.4 * line2);
  // specular highlight from a virtual overhead light
  vec3 L = normalize(vec3(0.3, 1.0, 0.4));
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 90.0);
  col += film * spec * 0.9;
  // slow shimmer
  float shimmer = noise(vUv * 30.0 + vec2(0.0, uTime * 0.15));
  col += uCyan * shimmer * 0.02;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Traces: instanced box segments with a bright pulse travelling along their length. */
export const traceVertex = /* glsl */ `
attribute float aPhase;
attribute float aSpeed;
attribute float aLen;
varying vec2 vUv;
varying float vPhase;
varying float vSpeed;
varying float vLen;
void main() {
  vUv = uv;
  vPhase = aPhase;
  vSpeed = aSpeed;
  vLen = aLen;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`;

export const traceFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;
varying float vPhase;
varying float vSpeed;
varying float vLen;
void main() {
  // u along the segment (box geometry: x axis), from uv of side/top faces
  float u = vUv.x;
  float t = fract(uTime * vSpeed * 0.25 + vPhase);
  float head = t * (1.0 + 0.3) - 0.15;
  float d = (u - head) * vLen;
  float pulse = smoothstep(0.35, 0.0, abs(d)) * (0.5 + 0.5 * smoothstep(-0.9, 0.0, d));
  vec3 base = uColor * 0.035;
  vec3 col = base + uColor * pulse * uIntensity;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Gauges: instanced planes, each an instrument dial. `aLevel` in 0..1. */
export const gaugeVertex = /* glsl */ `
attribute float aLevel;
attribute vec3 aColor;
varying vec2 vUv;
varying float vLevel;
varying vec3 vColor;
void main() {
  vUv = uv;
  vLevel = aLevel;
  vColor = aColor;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`;

export const gaugeFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uReveal;  // 0..1 needle sweep
varying vec2 vUv;
varying float vLevel;
varying vec3 vColor;
#define PI 3.14159265
void main() {
  vec2 p = (vUv - vec2(0.5, 0.42)) * 2.0;
  float r = length(p);
  float a = atan(p.x, -p.y); // 0 at bottom, ± PI at top
  // dial spans -135° .. +135° (2.356 rad)
  float span = 2.356;
  float ang = clamp(a, -span, span);
  float frac = (ang + span) / (2.0 * span);
  float level = vLevel * uReveal;
  vec3 col = vec3(0.0);
  float alpha = 0.0;
  // face
  float face = smoothstep(1.0, 0.98, r);
  col += vec3(0.02, 0.022, 0.03) * face;
  alpha = max(alpha, face * 0.9);
  // arc track
  float arc = smoothstep(0.86, 0.88, r) * smoothstep(0.98, 0.96, r) * step(abs(a), span);
  col += vec3(0.08) * arc;
  // filled arc up to level
  float fill = arc * step(frac, level);
  col += vColor * fill * 1.6;
  // ticks
  float tick = step(0.94, r) * step(r, 1.0) * step(abs(a), span) * smoothstep(0.02, 0.0, abs(fract(frac * 20.0) - 0.5) - 0.44);
  col += vec3(0.35) * tick * (1.0 - fill);
  // needle
  float na = -span + level * 2.0 * span;
  vec2 nd = vec2(sin(na), -cos(na));
  float along = dot(p, nd);
  float side = abs(dot(p, vec2(-nd.y, nd.x)));
  float needle = step(0.0, along) * step(along, 0.82) * smoothstep(0.03 + 0.02 * (1.0 - along), 0.0, side);
  col += vec3(1.0, 0.98, 0.95) * needle * 1.4;
  // hub
  col += vColor * smoothstep(0.08, 0.05, r) * 1.2;
  alpha = max(alpha, max(arc, needle));
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(col, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Motherboard: solder-mask green-black with procedural traces and pads. */
export const boardFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uCyan;
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vNormalW;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 uv = vUv * 60.0;
  vec2 id = floor(uv);
  vec2 f = fract(uv);
  float h = hash(id);
  // trace network: horizontal or vertical strips per cell with random connectivity
  float horiz = step(0.55, h) * smoothstep(0.42, 0.46, f.y) * smoothstep(0.58, 0.54, f.y);
  float vert = step(h, 0.45) * smoothstep(0.42, 0.46, f.x) * smoothstep(0.58, 0.54, f.x);
  float pad = step(0.985, hash(id * 3.1)) * smoothstep(0.25, 0.2, length(f - 0.5));
  vec3 mask = vec3(0.012, 0.03, 0.025);
  vec3 copper = vec3(0.35, 0.25, 0.14);
  vec3 col = mask + copper * (horiz + vert) * 0.35 + vec3(0.6, 0.5, 0.3) * pad;
  // vignette toward the edges
  float d = length(vUv - 0.5);
  col *= smoothstep(0.75, 0.2, d);
  // faint cyan data pulses running along some traces
  float pulse = step(0.965, hash(id + 7.0)) * smoothstep(0.02, 0.0, abs(fract(f.x + uTime * 0.3) - 0.5) - 0.45);
  col += uCyan * pulse * (horiz + vert) * 0.3;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
