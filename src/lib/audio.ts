"use client";

/**
 * Synthesized ambient audio. No samples are loaded: rain is band-passed
 * noise with slow amplitude drift, and key clicks are short filtered noise
 * bursts with a pitch that depends on the key row. Muted by default; the
 * context is created only after the visitor opts in.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let rainGain: GainNode | null = null;
let rainSource: AudioBufferSourceNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let enabled = false;

function createNoise(c: AudioContext): AudioBuffer {
  const seconds = 4;
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const data = buf.getChannelData(0);
  // pink-ish noise via Paul Kellet's filter
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return buf;
}

function ensure(): AudioContext {
  if (ctx) return ctx;
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  noiseBuffer = createNoise(ctx);
  return ctx;
}

function startRain() {
  if (!ctx || !master || !noiseBuffer || rainSource) return;
  rainSource = ctx.createBufferSource();
  rainSource.buffer = noiseBuffer;
  rainSource.loop = true;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 900;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 6500;
  lp.Q.value = 0.4;

  rainGain = ctx.createGain();
  rainGain.gain.value = 0.55;

  // slow drift in the rain intensity
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.18;
  lfo.connect(lfoGain).connect(rainGain.gain);
  lfo.start();

  rainSource.connect(hp).connect(lp).connect(rainGain).connect(master);
  rainSource.start();
}

export const audio = {
  get enabled() {
    return enabled;
  },
  async toggle(): Promise<boolean> {
    enabled = !enabled;
    const c = ensure();
    if (enabled) {
      if (c.state === "suspended") await c.resume();
      startRain();
      master!.gain.cancelScheduledValues(c.currentTime);
      master!.gain.setTargetAtTime(0.9, c.currentTime, 0.6);
    } else {
      master!.gain.setTargetAtTime(0, c.currentTime, 0.3);
    }
    return enabled;
  },
  /** A mechanical key click. `row` 0..4 shifts the pitch slightly. */
  click(row = 2, down = true) {
    if (!enabled || !ctx || !master || !noiseBuffer) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.playbackRate.value = 1.4 + row * 0.12 + Math.random() * 0.1;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = down ? 2600 + row * 180 : 3400;
    bp.Q.value = 1.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(down ? 0.35 : 0.14, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.001, t + (down ? 0.055 : 0.03));
    src.connect(bp).connect(g).connect(master);
    src.start(t, Math.random() * 3);
    src.stop(t + 0.08);
  },
  /** A soft UI blip for the OS. */
  blip(freq = 880) {
    if (!enabled || !ctx || !master) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.2);
  },
};
