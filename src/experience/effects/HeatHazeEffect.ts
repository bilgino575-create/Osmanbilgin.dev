import { Effect, EffectAttribute, BlendFunction } from "postprocessing";
import { Uniform } from "three";

/**
 * Screen-space heat shimmer for the silicon act: a rising, low-frequency
 * distortion field strongest in the lower half of the frame. `amount` is 0
 * everywhere except Act III.
 */
const fragment = /* glsl */ `
uniform float amount;
uniform float time;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash2(i).x, b = hash2(i + vec2(1.0, 0.0)).x;
  float c = hash2(i + vec2(0.0, 1.0)).x, d = hash2(i + vec2(1.0, 1.0)).x;
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void mainUv(inout vec2 uv) {
  if (amount <= 0.0) return;
  float t = time * 0.6;
  float n1 = noise(vec2(uv.x * 9.0, uv.y * 14.0 - t * 2.2));
  float n2 = noise(vec2(uv.x * 17.0 + 5.0, uv.y * 23.0 - t * 3.1));
  float strength = amount * 0.006 * (0.4 + 0.6 * (1.0 - uv.y));
  uv += vec2(n1 - 0.5, (n2 - 0.5) * 0.6) * strength;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = inputColor;
}
`;

export class HeatHazeEffect extends Effect {
  constructor() {
    super("HeatHazeEffect", fragment, {
      attributes: EffectAttribute.NONE,
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["amount", new Uniform(0)],
        ["time", new Uniform(0)],
      ]),
    });
  }
  set amount(v: number) {
    this.uniforms.get("amount")!.value = v;
  }
  update(_r: unknown, _i: unknown, dt: number) {
    const t = this.uniforms.get("time")!;
    t.value = (t.value as number) + dt;
  }
}
