/**
 * Coffee steam: instanced billboards animated entirely on the GPU. Each
 * instance has a seed; its position is a function of time, so the CPU never
 * touches the buffer. The cursor (projected onto the mug's plane) pushes the
 * wisps away.
 */
export const steamVertex = /* glsl */ `
uniform float uTime;
uniform vec3  uCursor;    // world-space cursor on the y = mugTop plane
uniform float uCursorOn;
uniform float uHeight;
attribute vec4 aSeed;     // phase, speed, sway, size
varying float vLife;
varying vec2 vQuad;
varying float vSeed;

void main() {
  vQuad = uv - 0.5;
  vSeed = aSeed.x;
  float t = fract(uTime * aSeed.y * 0.09 + aSeed.x);
  vLife = t;
  // rising, swaying, expanding
  vec3 c = vec3(0.0, t * uHeight, 0.0);
  float sway = aSeed.z * (0.35 + t);
  c.x += sin(t * 5.0 + aSeed.x * 6.283) * sway * 0.02 + (aSeed.x - 0.5) * 0.02;
  c.z += cos(t * 4.0 + aSeed.x * 6.283) * sway * 0.02 + (aSeed.w - 0.5) * 0.02;
  // instance origin (mug centre) is in the instance matrix
  vec4 origin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec3 world = (modelMatrix * origin).xyz + c;
  // cursor push (in world xz)
  vec2 d = world.xz - uCursor.xz;
  float dist = length(d);
  float push = smoothstep(0.16, 0.0, dist) * uCursorOn * 0.08;
  world.xz += normalize(d + 1e-4) * push;
  world.y += push * 0.4;
  // billboard
  float size = (0.006 + aSeed.w * 0.008) * (0.5 + t * 1.8);
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up    = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
  world += (right * vQuad.x + up * vQuad.y) * size;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

export const steamFragment = /* glsl */ `
precision highp float;
uniform float uOpacity;
uniform vec3  uColor;
uniform float uTime;
varying float vLife;
varying vec2 vQuad;
varying float vSeed;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  float r = length(vQuad) * 2.0;
  float n = noise(vQuad * 6.0 + vSeed * 40.0 + vec2(0.0, -uTime * 0.6));
  float a = smoothstep(1.0, 0.2, r) * (0.55 + 0.45 * n);
  a *= sin(vLife * 3.14159) ;
  a *= uOpacity;
  gl_FragColor = vec4(uColor, a);
}
`;
