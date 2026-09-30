"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group } from "three";
import { store } from "@/lib/store";
import CameraRig, { rig } from "./rig/CameraRig";
import { WORLD_OFFSET, type WorldId } from "./rig/keyframes";
import Tiering from "./Tiering";
import StatsWriter from "./StatsWriter";
import Post from "./Post";
import DeskWorld from "./desk/DeskWorld";
import ScreenWorld from "./screen/ScreenWorld";
import SiliconWorld from "./silicon/SiliconWorld";
import NetworkWorld from "./network/NetworkWorld";
import Signal from "./Signal";

/** Which worlds must be rendered around a given progress (with margins so
 * the cut never shows an empty frame). */
function activeWorlds(p: number): Record<WorldId, boolean> {
  return {
    desk: p < 0.21 || p > 0.86,
    screen: p > 0.19 && p < 0.48,
    silicon: p > 0.46 && p < 0.71,
    network: p > 0.69 && p < 0.875,
  };
}

/** Wider window: a world is mounted (geometry, textures, shaders) before it is needed
 * and unmounted once the visitor is well past it, so phones never hold all four. */
function mountedWorlds(p: number): Record<WorldId, boolean> {
  return {
    desk: true,
    screen: p > 0.12 && p < 0.56,
    silicon: p > 0.38 && p < 0.78,
    network: p > 0.6 && p < 0.9,
  };
}

function World({ id, children }: { id: WorldId; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  const [mounted, setMounted] = useState(id === "desk");
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const check = useRef(0);
  useFrame(() => {
    const g = ref.current;
    if (g) {
      const on = activeWorlds(rig.p)[id];
      if (g.visible !== on) g.visible = on;
    }
    // mount/unmount decisions a few times a second, never per frame
    // (time-based so a slow renderer still reacts within a frame or two)
    const now = performance.now();
    if (now - check.current < 200) return;
    check.current = now;
    const want = mountedWorlds(rig.p)[id];
    if (want !== mounted) setMounted(want);
  });
  // pre-compile a freshly mounted world's shaders while it is still invisible
  useEffect(() => {
    if (!mounted || id === "desk") return;
    const t = window.setTimeout(() => {
      try {
        gl.compile(scene, camera);
      } catch {
        /* compiled lazily on first draw instead */
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [mounted, id, gl, scene, camera]);
  const o = WORLD_OFFSET[id];
  return (
    <group ref={ref} position={o} visible={id === "desk"}>
      {mounted ? children : null}
    </group>
  );
}

function Boot() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t0 = performance.now();
      try {
        await gl.compileAsync(scene, camera);
      } catch {
        gl.compile(scene, camera);
      }
      if (cancelled) return;
      store.boot("ok", `shaders: ${gl.info.programs?.length ?? 0} programs compiled in ${(performance.now() - t0).toFixed(0)} ms`);
      await document.fonts.ready;
      if (cancelled) return;
      store.boot("ok", `fonts: ${document.fonts.size} faces ready`);
      store.boot("ok", "login: osman@bilgin — welcome back");
      store.set({ booted: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);
  return null;
}

export default function Scene() {
  return (
    <>
      <CameraRig />
      <Tiering />
      <StatsWriter />
      <Suspense fallback={null}>
        <World id="desk">
          <DeskWorld />
        </World>
        <World id="screen">
          <ScreenWorld />
        </World>
        <World id="silicon">
          <SiliconWorld />
        </World>
        <World id="network">
          <NetworkWorld />
        </World>
        <Signal />
        <Boot />
      </Suspense>
      <Post />
    </>
  );
}
