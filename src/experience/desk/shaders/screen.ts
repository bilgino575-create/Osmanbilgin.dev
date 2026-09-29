/**
 * The monitor glass. Samples the OS composite, adds fresnel reflection of the
 * room, an edge vignette, and an RGB subpixel mask that only appears when the
 * camera is close enough for texels to become larger than screen pixels
 * (the dive moment).
 */
export const screenVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDirW;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vViewDirW = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const screenFragment = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform float uBrightness;
uniform float uOn;        // 0 = off (black glass), 1 = on
uniform vec2  uRes;       // texture resolution
uniform vec3  uReflA;     // violet room light
uniform vec3  uReflB;     // cyan strip
uniform float uRefl;      // strength of the room reflection
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vViewDirW;

void main() {
  vec2 uv = vUv;
  vec3 tex = texture2D(uMap, uv).rgb;
  // subpixel mask when magnified
  float texelPx = 1.0 / max(fwidth(uv.x) * uRes.x, 1e-4); // screen pixels per texel
  float mag = smoothstep(2.5, 9.0, texelPx);
  vec2 sp = fract(uv * uRes);
  float sub = floor(sp.x * 3.0);
  vec3 mask = vec3(step(sub, 0.5), step(0.5, sub) * step(sub, 1.5), step(1.5, sub));
  float scan = 0.65 + 0.35 * smoothstep(0.0, 0.25, sp.y) * smoothstep(1.0, 0.75, sp.y);
  vec3 masked = tex * (mask * 2.2) * scan;
  vec3 col = mix(tex, masked, mag * 0.75);
  col *= uBrightness * uOn;
  // fresnel reflection of the room
  float f = pow(1.0 - max(dot(normalize(vNormalW), normalize(vViewDirW)), 0.0), 4.0);
  vec3 refl = mix(uReflA, uReflB, uv.y) * 0.035 + vec3(0.02);
  col += refl * (0.6 + f * 3.0) * (1.0 - uOn * 0.5) * uRefl;
  // edge vignette of the panel
  float vig = smoothstep(0.0, 0.03, uv.x) * smoothstep(1.0, 0.97, uv.x) * smoothstep(0.0, 0.04, uv.y) * smoothstep(1.0, 0.96, uv.y);
  col *= 0.86 + 0.14 * vig;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
