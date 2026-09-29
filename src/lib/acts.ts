/**
 * Scroll → progress mapping shared by the DOM layer (section placement, hash
 * links, command palette) and the 3D layer (camera keyframes).
 *
 * `p` is the master clock in [0, 1]. Every act owns a range of `p`; every
 * HTML section owns an anchor `p` inside an act, which is where the camera
 * has settled and the panel is fully visible.
 */
import type { ActId } from "./store";

export interface Act {
  id: ActId;
  label: string;
  start: number;
  end: number;
}

export const ACTS: Act[] = [
  { id: "desk", label: "I · The Desk", start: 0.0, end: 0.2 },
  { id: "screen", label: "II · The Screen", start: 0.2, end: 0.47 },
  { id: "silicon", label: "III · The Silicon", start: 0.47, end: 0.7 },
  { id: "network", label: "IV · The Network", start: 0.7, end: 0.86 },
  { id: "return", label: "V · Return", start: 0.86, end: 1.0 },
];

export interface Section {
  id: string;
  label: string;
  act: ActId;
  /** progress where the section is fully visible */
  anchor: number;
  /** visible range */
  from: number;
  to: number;
}

export const SECTIONS: Section[] = [
  { id: "home", label: "Desk", act: "desk", anchor: 0.0, from: 0, to: 0.13 },
  { id: "about", label: "About", act: "screen", anchor: 0.25, from: 0.21, to: 0.31 },
  { id: "stack", label: "Stack", act: "screen", anchor: 0.34, from: 0.31, to: 0.395 },
  { id: "work", label: "Work", act: "screen", anchor: 0.42, from: 0.395, to: 0.465 },
  { id: "services", label: "Services", act: "silicon", anchor: 0.55, from: 0.51, to: 0.6 },
  { id: "skills", label: "Skills", act: "silicon", anchor: 0.645, from: 0.6, to: 0.685 },
  { id: "process", label: "Process", act: "network", anchor: 0.79, from: 0.745, to: 0.855 },
  { id: "contact", label: "Contact", act: "return", anchor: 0.91, from: 0.875, to: 0.955 },
  { id: "end", label: "Available", act: "return", anchor: 0.99, from: 0.965, to: 1.0 },
];

/** Scroll track height in viewport heights. */
export const TRACK_VH = { desktop: 1400, mobile: 900 };

export function actAt(p: number): ActId {
  for (let i = ACTS.length - 1; i >= 0; i--) {
    if (p >= ACTS[i].start) return ACTS[i].id;
  }
  return "desk";
}

export function sectionById(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

/** 0..1 visibility of a section at progress p, with soft edges. */
export function sectionVisibility(s: Section, p: number): number {
  const fade = 0.02;
  if (p < s.from - fade || p > s.to + fade) return 0;
  // the first and last sections are fully visible at the scroll edges
  const inA = s.from <= 0 ? 1 : clamp01((p - (s.from - fade)) / (fade * 2));
  const outA = s.to >= 1 ? 1 : clamp01((s.to + fade - p) / (fade * 2));
  return Math.min(inA, outA);
}

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function smoothstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Linear remap of p from [a,b] to [0,1], clamped. */
export function range(p: number, a: number, b: number): number {
  return clamp01((p - a) / (b - a));
}
