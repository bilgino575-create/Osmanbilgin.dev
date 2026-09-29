"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { damp } from "maath/easing";
import { store } from "@/lib/store";
import { actAt } from "@/lib/acts";
import { DESKTOP_KEYS, MOBILE_KEYS, WORLD_OFFSET, type Key, type WorldId, worldAt } from "./keyframes";
import { smoothstep, v3a, v3b, v3c } from "../utils/scratch";

/** Shared, read by worlds and post effects (never re-allocated). */
export const rig = {
  /** smoothed progress */
  p: 0,
  world: "desk" as WorldId,
  /** 0..1 pulse that decays after a world switch */
  dive: 0,
  /** counter incremented on every world switch (reduced-motion crossfades) */
  cuts: 0,
  target: new Vector3(),
  keys: DESKTOP_KEYS,
  /** jump the smoothed clock (used by tests and screenshots) */
  snap: (p: number) => {
    void p;
  },
};

declare global {
  interface Window {
    __snap?: (p: number) => void;
  }
}

function sample(keys: Key[], p: number, outPos: Vector3, outTgt: Vector3): { fov: number; world: WorldId } {
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].p <= p) i++;
  const a = keys[i];
  const b = keys[Math.min(i + 1, keys.length - 1)];
  if (a.world !== b.world || a === b) {
    // hard cut at a world boundary: hold the last key of the world
    const k = p >= b.p ? b : a;
    outPos.set(k.pos[0], k.pos[1], k.pos[2]);
    outTgt.set(k.tgt[0], k.tgt[1], k.tgt[2]);
    return { fov: k.fov, world: k.world };
  }
  const t = smoothstep(a.p, b.p, p);
  outPos.set(
    a.pos[0] + (b.pos[0] - a.pos[0]) * t,
    a.pos[1] + (b.pos[1] - a.pos[1]) * t,
    a.pos[2] + (b.pos[2] - a.pos[2]) * t
  );
  outTgt.set(
    a.tgt[0] + (b.tgt[0] - a.tgt[0]) * t,
    a.tgt[1] + (b.tgt[1] - a.tgt[1]) * t,
    a.tgt[2] + (b.tgt[2] - a.tgt[2]) * t
  );
  return { fov: a.fov + (b.fov - a.fov) * t, world: a.world };
}

/** nearest stop key at or before p (for reduced motion) */
function snap(keys: Key[], p: number): number {
  let best = keys[0].p;
  for (const k of keys) {
    if (k.stop && k.p <= p + 0.02) best = k.p;
  }
  return best;
}

export default function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const smoothed = useRef({ p: 0, fov: 36 });
  const lastWorld = useRef<WorldId>("desk");
  const lastSnap = useRef(-1);
  const keys = useMemo(() => (store.get().touch || window.innerWidth < 768 ? MOBILE_KEYS : DESKTOP_KEYS), []);

  useEffect(() => {
    rig.keys = keys;
    camera.near = 0.03;
    camera.far = 200;
    camera.updateProjectionMatrix();
    rig.snap = (p: number) => {
      smoothed.current.p = p;
      rig.p = p;
      rig.dive = 0;
      lastWorld.current = sample(keys, p, v3a, v3b).world;
      rig.world = lastWorld.current;
    };
    window.__snap = (p: number) => {
      window.scrollTo({ top: p * (document.documentElement.scrollHeight - window.innerHeight), behavior: "auto" });
      store.set({ progress: p, act: actAt(p) });
      rig.snap(p);
    };
    return () => {
      delete window.__snap;
    };
  }, [keys, camera]);

  useFrame((_, dt) => {
    const s = store.get();
    const clampedDt = Math.min(dt, 1 / 20);
    let p: number;
    if (s.reducedMotion) {
      p = snap(keys, s.progress);
      if (p !== lastSnap.current) {
        lastSnap.current = p;
        rig.cuts++;
      }
      smoothed.current.p = p;
    } else {
      damp(smoothed.current, "p", s.progress, 0.22, clampedDt);
      p = smoothed.current.p;
    }
    rig.p = p;

    const { fov, world } = sample(keys, p, v3a, v3b);
    const off = WORLD_OFFSET[world];
    v3a.x += off[0];
    v3a.y += off[1];
    v3a.z += off[2];
    v3b.x += off[0];
    v3b.y += off[1];
    v3b.z += off[2];

    if (world !== lastWorld.current) {
      lastWorld.current = world;
      rig.world = world;
      rig.dive = 1;
      rig.cuts++;
    }
    rig.dive = Math.max(0, rig.dive - clampedDt * 1.4);

    // subtle pointer parallax (desktop only, not in reduced motion)
    if (!s.touch && !s.reducedMotion) {
      v3c.subVectors(v3b, v3a).normalize();
      // right vector = forward × up
      const rx = v3c.z, rz = -v3c.x;
      const amt = world === "desk" ? 0.035 : 0.12;
      v3a.x += rx * s.pointerX * amt;
      v3a.z += rz * s.pointerX * amt;
      v3a.y += s.pointerY * amt * 0.6;
    }

    camera.position.copy(v3a);
    camera.lookAt(v3b);
    rig.target.copy(v3b);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, -10);

  return null;
}

export { worldAt };
