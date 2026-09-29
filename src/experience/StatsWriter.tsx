"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { store } from "@/lib/store";

declare global {
  interface Window {
    __stats?: () => unknown;
  }
}

/** Writes real renderer numbers to the store four times a second. */
export default function StatsWriter() {
  const gl = useThree((s) => s.gl);
  const acc = useRef({ frames: 0, time: 0, last: 0, ms: 0 });

  useEffect(() => {
    window.__stats = () => ({
      ...store.get().stats,
      tier: store.get().tier,
      gpuTier: store.get().gpuTier,
      act: store.get().act,
      progress: store.get().progress,
      memory: gl.info.memory,
      programs: gl.info.programs?.length ?? 0,
    });
    return () => {
      delete window.__stats;
    };
  }, [gl]);

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
          calls: info.render.calls,
          triangles: info.render.triangles,
          geometries: info.memory.geometries,
          textures: info.memory.textures,
          programs: info.programs?.length ?? 0,
        },
      });
      a.frames = 0;
      a.time = 0;
    }
  }, 1000);

  return null;
}
