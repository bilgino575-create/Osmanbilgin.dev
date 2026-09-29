"use client";

import { Suspense, useEffect, useRef } from "react";
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

function World({ id, children }: { id: WorldId; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const on = activeWorlds(rig.p)[id];
    if (g.visible !== on) g.visible = on;
  });
  const o = WORLD_OFFSET[id];
  return (
    <group ref={ref} position={o} visible={id === "desk"}>
      {children}
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
