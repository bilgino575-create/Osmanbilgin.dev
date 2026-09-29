/**
 * The camera path. Every key is a stop on the master clock `p`. Between two
 * keys of the same world the camera eases; between different worlds the rig
 * cuts and triggers the dive transition. Positions are world-local.
 */
export type WorldId = "desk" | "screen" | "silicon" | "network";

export interface Key {
  p: number;
  world: WorldId;
  pos: [number, number, number];
  tgt: [number, number, number];
  fov: number;
  /** a "stop": reduced motion snaps to these only */
  stop?: boolean;
}

/** Where each world lives in scene space (so they never overlap). */
export const WORLD_OFFSET: Record<WorldId, [number, number, number]> = {
  desk: [0, 0, 0],
  screen: [0, -300, 0],
  silicon: [0, -600, 0],
  network: [0, -900, 0],
};

export const DESKTOP_KEYS: Key[] = [
  // ACT I — the desk
  { p: 0.0, world: "desk", pos: [-0.95, 1.12, 0.62], tgt: [-0.02, 0.95, -1.0], fov: 34, stop: true },
  { p: 0.08, world: "desk", pos: [-0.35, 1.12, 0.5], tgt: [0.28, 0.99, -0.98], fov: 34 },
  { p: 0.14, world: "desk", pos: [0.05, 1.07, 0.12], tgt: [0.25, 1.01, -1.0], fov: 33 },
  { p: 0.2, world: "desk", pos: [0.25, 1.03, -0.62], tgt: [0.25, 1.02, -1.05], fov: 30 },
  // ACT II — inside the screen
  { p: 0.205, world: "screen", pos: [0, 0, 11.5], tgt: [0, 0, 0], fov: 30 },
  { p: 0.25, world: "screen", pos: [-3.3, 0.95, 6.4], tgt: [-2.1, 0.9, 0], fov: 32, stop: true },
  { p: 0.31, world: "screen", pos: [-0.6, 0.9, 5.6], tgt: [0.2, 0.8, 0], fov: 32 },
  { p: 0.34, world: "screen", pos: [3.9, 0.9, 7.4], tgt: [2.6, 0.7, 0], fov: 32, stop: true },
  { p: 0.395, world: "screen", pos: [0.4, -0.8, 5.4], tgt: [-1.4, -1.2, 0], fov: 32 },
  { p: 0.42, world: "screen", pos: [-1.6, -1.6, 4.4], tgt: [-2.6, -1.8, 0], fov: 32, stop: true },
  { p: 0.47, world: "screen", pos: [-2.5, -1.75, 0.95], tgt: [-2.6, -1.8, 0], fov: 34 },
  // ACT III — the silicon
  { p: 0.475, world: "silicon", pos: [0, 26, 22], tgt: [0, 0, 0], fov: 34 },
  { p: 0.52, world: "silicon", pos: [0, 9, 8.5], tgt: [0, 0, 0], fov: 34 },
  { p: 0.55, world: "silicon", pos: [3.2, 4.0, 4.6], tgt: [1.2, 0, 0], fov: 36, stop: true },
  { p: 0.6, world: "silicon", pos: [-1.4, 2.2, 2.6], tgt: [-1.8, 0.1, -0.4], fov: 38 },
  { p: 0.645, world: "silicon", pos: [-3.3, 1.4, 1.7], tgt: [-3.7, 0.3, -0.7], fov: 40, stop: true },
  { p: 0.7, world: "silicon", pos: [-4.2, 0.35, -1.2], tgt: [-6, 0.2, -3.4], fov: 44 },
  // ACT IV — the network
  { p: 0.705, world: "network", pos: [0, 0, 30], tgt: [0, 0, -40], fov: 60 },
  { p: 0.745, world: "network", pos: [0, 0, 2], tgt: [0, 0, -40], fov: 62 },
  { p: 0.79, world: "network", pos: [-3.4, 2.2, -50.5], tgt: [0, 0.2, -58], fov: 40, stop: true },
  { p: 0.855, world: "network", pos: [3.2, 3.0, -49.5], tgt: [0, 0.4, -58], fov: 40 },
  { p: 0.865, world: "network", pos: [0.5, 0.5, -52], tgt: [0, 0, -58], fov: 60 },
  // ACT V — return to the desk, then out of the window
  { p: 0.875, world: "desk", pos: [0.62, 1.05, 0.02], tgt: [0.36, 0.76, -0.55], fov: 36 },
  { p: 0.91, world: "desk", pos: [0.55, 1.0, -0.05], tgt: [0.36, 0.76, -0.56], fov: 36, stop: true },
  { p: 0.955, world: "desk", pos: [-0.2, 1.35, 0.9], tgt: [0.9, 1.35, -1.6], fov: 40 },
  { p: 0.975, world: "desk", pos: [0.9, 1.6, -1.9], tgt: [0.9, 1.6, -0.9], fov: 44 },
  { p: 1.0, world: "desk", pos: [2.4, 3.2, -9.5], tgt: [0.9, 1.8, -1.6], fov: 46, stop: true },
];

/** Mobile: fewer intermediate stops, camera further back so panels fit. */
export const MOBILE_KEYS: Key[] = [
  { p: 0.0, world: "desk", pos: [-0.5, 1.3, 1.9], tgt: [0.28, 0.98, -0.95], fov: 44, stop: true },
  { p: 0.14, world: "desk", pos: [0.1, 1.06, 0.1], tgt: [0.25, 1.01, -1.0], fov: 40 },
  { p: 0.2, world: "desk", pos: [0.25, 1.03, -0.6], tgt: [0.25, 1.02, -1.05], fov: 36 },
  { p: 0.205, world: "screen", pos: [0, 0.4, 13], tgt: [0, 0, 0], fov: 36 },
  { p: 0.25, world: "screen", pos: [-2.7, 1.9, 5.6], tgt: [-2.7, 1.0, 0], fov: 40, stop: true },
  { p: 0.34, world: "screen", pos: [2.2, 1.9, 6.4], tgt: [2.2, 0.7, 0], fov: 40, stop: true },
  { p: 0.42, world: "screen", pos: [-2.7, -0.6, 5.0], tgt: [-2.7, -1.8, 0], fov: 40, stop: true },
  { p: 0.47, world: "screen", pos: [-2.6, -1.75, 1.0], tgt: [-2.6, -1.8, 0], fov: 40 },
  { p: 0.475, world: "silicon", pos: [0, 30, 24], tgt: [0, 0, 0], fov: 40 },
  { p: 0.55, world: "silicon", pos: [1.4, 6.5, 6], tgt: [0.4, 0, 0], fov: 44, stop: true },
  { p: 0.645, world: "silicon", pos: [-2.8, 2.6, 2.6], tgt: [-3.4, 0.2, -0.6], fov: 48, stop: true },
  { p: 0.7, world: "silicon", pos: [-4.2, 0.6, -1.2], tgt: [-6, 0.2, -3.4], fov: 50 },
  { p: 0.705, world: "network", pos: [0, 0, 30], tgt: [0, 0, -40], fov: 70 },
  { p: 0.745, world: "network", pos: [0, 0, 2], tgt: [0, 0, -40], fov: 70 },
  { p: 0.79, world: "network", pos: [-2.5, 3.5, -47], tgt: [0, 0, -58], fov: 50, stop: true },
  { p: 0.865, world: "network", pos: [0.5, 1, -51], tgt: [0, 0, -58], fov: 70 },
  { p: 0.875, world: "desk", pos: [0.6, 1.2, 0.3], tgt: [0.36, 0.76, -0.55], fov: 44 },
  { p: 0.91, world: "desk", pos: [0.55, 1.1, 0.1], tgt: [0.36, 0.76, -0.56], fov: 44, stop: true },
  { p: 0.975, world: "desk", pos: [0.9, 1.6, -1.9], tgt: [0.9, 1.6, -0.9], fov: 50 },
  { p: 1.0, world: "desk", pos: [2.2, 3.4, -10.5], tgt: [0.9, 1.8, -1.6], fov: 52, stop: true },
];

export function worldAt(keys: Key[], p: number): WorldId {
  let w: WorldId = keys[0].world;
  for (const k of keys) {
    if (p >= k.p) w = k.world;
    else break;
  }
  return w;
}
