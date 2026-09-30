"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { store } from "@/lib/store";
import { rig } from "./rig/CameraRig";
import { frameClock } from "@/lib/gl";

declare global {
  interface Window {
    __stats?: () => unknown;
  }
}

/**
 * Writes real renderer numbers to the store four times a second.
 *
 * `renderer.info` auto-resets on every render call, and the post-processing
 * composer issues several per frame, so the counters are read at the very
 * start of the next frame (the previous frame's total) and reset manually.
 */
export default function StatsWriter() {
  const gl = useThree((s) => s.gl);
  const acc = useRef({ frames: 0, time: 0, last: 0, ms: 0, calls: 0, triangles: 0 });

  useEffect(() => {
    gl.info.autoReset = false;
    return () => {
      gl.info.autoReset = true;
    };
  }, [gl]);

  // read the previous frame's totals, then reset for this frame
  useFrame(() => {
    acc.current.calls = gl.info.render.calls;
    acc.current.triangles = gl.info.render.triangles;
    gl.info.reset();
    frameClock.last = performance.now();
    frameClock.frames++;
  }, -2000);

  useEffect(() => {
    window.__stats = () => ({
      ...store.get().stats,
      tier: store.get().tier,
      gpuTier: store.get().gpuTier,
      act: store.get().act,
      progress: store.get().progress,
      rigP: rig.p,
      dive: rig.dive,
      world: rig.world,
      memory: gl.info.memory,
      programs: gl.info.programs?.length ?? 0,
    });
    return () => {
      delete window.__stats;
    };
  }, [gl]);

  // negative priority: a positive one would tell R3F to stop rendering on its own,
  // which blanks the LOW tier (no composer there to render instead)
  useFrame((_, dt) => {
    const a = acc.current;
    a.frames++;
    a.time += dt;
    a.ms = a.ms * 0.9 + dt * 1000 * 0.1;
    if (a.time >= 0.25) {
      const fps = a.frames / a.time;
      const info = gl.info;
      store.set({
        stats: {
          fps,
          ms: a.ms,
          calls: a.calls,
          triangles: a.triangles,
          geometries: info.memory.geometries,
          textures: info.memory.textures,
          programs: info.programs?.length ?? 0,
        },
      });
      a.frames = 0;
      a.time = 0;
    }
  }, -1000);

  return null;
}
