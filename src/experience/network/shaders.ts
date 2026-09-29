/** Shaders for the network act: fibre tunnel, globe, atmosphere. */

export const tunnelVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Fibre-optic tunnel seen from inside: hundreds of longitudinal strands with
 * light pulses racing toward the far end, faint rings for speed, and a fade to
 * black where the globe emerges.
 */
export const tunnelFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3 uCyan;
uniform vec3 uViolet;
uniform float uLength;
varying vec2 vUv;
varying vec3 vPos;
float hash(float n) { return fract(sin(n) * 43758.5453); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  // uv.x around the tube, uv.y along it (0 = near, 1 = far)
  float around = vUv.x;
  float along = vUv.y;
  // strands
  float strands = 160.0;
  float sid = floor(around * strands);
  float sf = fract(around * strands);
  float sh = hash(sid);
  float strand = smoothstep(0.5, 0.0, abs(sf - 0.5)) * (0.15 + 0.85 * step(0.55, sh));
  // pulses travelling along each strand
  float speed = 0.35 + sh * 0.6;
  float t = fract(along * (1.5 + sh * 2.0) - uTime * speed + sh * 7.0);
  float pulse = smoothstep(0.25, 0.0, t) * step(0.4, sh);
  // rings
  float ring = smoothstep(0.02, 0.0, abs(fract(along * 40.0 - uTime * 1.5) - 0.5) - 0.47);
  vec3 col = mix(uViolet, uCyan, sh) * (strand * (0.06 + pulse * 1.6)) ;
  col += uCyan * ring * 0.06;
  // slow scintillation
  col *= 0.8 + 0.2 * sin(uTime * 3.0 + sid);
  // fade at both ends
  float fade = smoothstep(0.0, 0.08, along) * smoothstep(1.0, 0.75, along);
  col *= fade;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const globeVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorldPos;
void main() {
  vUv = uv;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

/**
 * Deploy-map globe: land as a dot matrix from the rasterised mask, a faint
 * graticule, a cyan-blue fresnel atmosphere and a slow scan band.
 */
export const globeFragment = /* glsl */ `
precision highp float;
uniform sampler2D uMask;
uniform float uTime;
uniform vec3 uCyan;
uniform vec3 uViolet;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorldPos;
void main() {
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 N = normalize(vNormalW);
  float NdV = max(dot(N, V), 0.0);
  float fres = pow(1.0 - NdV, 3.0);
  // dot matrix: cells in uv space, compensated for latitude squash
  float cols = 260.0;
  float rows = 130.0;
  vec2 cell = vec2(vUv.x * cols, vUv.y * rows);
  vec2 id = floor(cell);
  vec2 c = (id + 0.5) / vec2(cols, rows);
  float land = texture2D(uMask, c).r;
  float d = length((fract(cell) - 0.5) * vec2(1.0, 1.0));
  float dot = smoothstep(0.34, 0.22, d) * step(0.5, land);
  // graticule every 15°
  float g = smoothstep(0.012, 0.0, abs(fract(vUv.x * 24.0) - 0.5) - 0.49) + smoothstep(0.012, 0.0, abs(fract(vUv.y * 12.0) - 0.5) - 0.49);
  // scan band sweeping around
  float scan = smoothstep(0.06, 0.0, abs(fract(vUv.x - uTime * 0.03) - 0.5) - 0.44);
  vec3 ocean = vec3(0.012, 0.016, 0.03);
  vec3 col = ocean;
  col += vec3(0.05, 0.06, 0.09) * g * 0.5;
  col += mix(uCyan, vec3(0.75, 0.9, 1.0), 0.4) * dot * (0.35 + 0.45 * NdV) * (1.0 + scan * 0.8);
  col += uCyan * scan * 0.02;
  // atmosphere
  col += mix(uCyan, uViolet, 0.35) * fres * 0.55;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const atmosphereFragment = /* glsl */ `
precision highp float;
uniform vec3 uCyan;
varying vec3 vNormalW;
varying vec3 vWorldPos;
void main() {
  // back faces of a slightly larger sphere: |N·V| is 0 at the outer edge and ~0.42 at the globe's limb
  vec3 V = normalize(cameraPosition - vWorldPos);
  float d = abs(dot(normalize(vNormalW), V));
  float t = clamp(d / 0.42, 0.0, 1.0);
  float glow = t * t;
  gl_FragColor = vec4(uCyan * glow * 0.45, glow * 0.6);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Packets flying down the tunnel: instanced elongated quads, positions from time. */
export const packetVertex = /* glsl */ `
uniform float uTime;
uniform float uLength;
attribute vec3 aSeed;
varying float vA;
void main() {
  float t = fract(uTime * (0.18 + aSeed.z * 0.25) + aSeed.x);
  float ang = aSeed.y * 6.2831 + t * 0.6;
  float r = 1.4 + aSeed.z * 1.4;
  vec3 c = vec3(cos(ang) * r, sin(ang) * r, 30.0 - t * uLength);
  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 p = c + right * position.x * 0.05 + vec3(0.0, 0.0, position.y * 1.6);
  vA = smoothstep(0.0, 0.1, t) * (1.0 - smoothstep(0.85, 1.0, t));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const packetFragment = /* glsl */ `
precision highp float;
uniform vec3 uColor;
varying float vA;
void main() {
  gl_FragColor = vec4(uColor * 2.2, vA * 0.85);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
