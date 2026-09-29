import { Effect, EffectAttribute, BlendFunction } from "postprocessing";
import { Uniform, Vector2 } from "three";

/**
 * World-switch transition: a radial warp toward the centre, a cyan flash and
 * a scanline burst that decays over ~0.7 s. `amount` is driven by the rig.
 */
const fragment = /* glsl */ `
uniform float amount;
uniform float time;
uniform vec2 centre;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void mainUv(inout vec2 uv) {
  if (amount <= 0.0) return;
  vec2 d = uv - centre;
  float r = length(d);
  float a = amount * amount;
  // pull pixels toward the centre, more at the edges
  uv = centre + d * (1.0 - a * 0.55 * r);
  // horizontal tearing lines
  float line = step(0.985, hash(vec2(floor(uv.y * 90.0), floor(time * 24.0))));
  uv.x += line * (hash(vec2(floor(uv.y * 90.0), time)) - 0.5) * 0.08 * a;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 c = inputColor.rgb;
  if (amount > 0.0) {
    float a = amount * amount;
    float r = length(uv - centre);
    // cyan flash with a bright core
    vec3 flash = vec3(0.0, 0.96, 1.0) * (1.0 - r * 1.2);
    c = mix(c, c + flash, a * 0.85);
    // scanlines
    float scan = 0.5 + 0.5 * sin(uv.y * 900.0 + time * 40.0);
    c *= 1.0 - a * 0.35 * scan;
  }
  outputColor = vec4(c, inputColor.a);
}
`;

export class DiveEffect extends Effect {
  constructor() {
    super("DiveEffect", fragment, {
      attributes: EffectAttribute.NONE,
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ["amount", new Uniform(0)],
        ["time", new Uniform(0)],
        ["centre", new Uniform(new Vector2(0.5, 0.5))],
      ]),
    });
  }
  set amount(v: number) {
    this.uniforms.get("amount")!.value = v;
  }
  get amount(): number {
    return this.uniforms.get("amount")!.value as number;
  }
  update(_r: unknown, _i: unknown, dt: number) {
    const t = this.uniforms.get("time")!;
    t.value = (t.value as number) + dt;
  }
}
