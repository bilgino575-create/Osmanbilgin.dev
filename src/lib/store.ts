"use client";

/**
 * A tiny external store shared by the DOM layer and the 3D layer.
 *
 * `useFrame` callbacks read `store.get()` directly (no React re-render);
 * React components subscribe with `useStore(selector)` through
 * `useSyncExternalStore`.
 */
import { useSyncExternalStore } from "react";

export type Tier = "high" | "low";
export type ActId = "desk" | "screen" | "silicon" | "network" | "return";

export interface BootLine {
  t: number;
  kind: "ok" | "info" | "warn";
  text: string;
}

export interface AppState {
  /** raw scroll progress 0..1 */
  progress: number;
  /** current act, derived from progress */
  act: ActId;
  /** id of the section nearest to the current progress */
  section: string;
  /** the 3D chunk has mounted a canvas */
  gl: boolean;
  /** WebGL context could not be created / was lost */
  glFailed: boolean;
  /** boot finished: shaders compiled, physics ready, fonts ready */
  booted: boolean;
  bootLog: BootLine[];
  tier: Tier;
  gpuTier: number;
  reducedMotion: boolean;
  touch: boolean;
  debug: boolean;
  sound: boolean;
  paletteOpen: boolean;
  /** pointer position in normalized device coordinates (-1..1) */
  pointerX: number;
  pointerY: number;
  /** a project slug opened from the OS or the HTML mirror */
  openProject: string | null;
  /** last key typed, used by the keyboard mesh and the sound engine */
  keyEvent: { code: string; down: boolean; n: number };
  /** the visitor sent a message: drives the return packet in Act V */
  sentAt: number;
  /** stats written by the renderer for the debug HUD */
  stats: {
    fps: number;
    ms: number;
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
    programs: number;
  };
}

type Listener = () => void;

const initial: AppState = {
  progress: 0,
  act: "desk",
  section: "home",
  gl: false,
  glFailed: false,
  booted: false,
  bootLog: [],
  tier: "high",
  gpuTier: -1,
  reducedMotion: false,
  touch: false,
  debug: false,
  sound: false,
  paletteOpen: false,
  pointerX: 0,
  pointerY: 0,
  openProject: null,
  keyEvent: { code: "", down: false, n: 0 },
  sentAt: 0,
  stats: {
    fps: 0,
    ms: 0,
    calls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
  },
};

let state: AppState = initial;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export const store = {
  get: () => state,
  set(partial: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
    const next = typeof partial === "function" ? partial(state) : partial;
    let changed = false;
    const a = state as unknown as Record<string, unknown>;
    const b = next as unknown as Record<string, unknown>;
    for (const k in b) {
      if (a[k] !== b[k]) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    state = { ...state, ...next };
    emit();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  /** Append a line to the boot log (real events only). */
  boot(kind: BootLine["kind"], text: string) {
    const t =
      typeof performance !== "undefined" ? performance.now() / 1000 : 0;
    state = { ...state, bootLog: [...state.bootLog, { t, kind, text }] };
    emit();
  },
};

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(initial)
  );
}
