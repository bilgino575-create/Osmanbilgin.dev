"use client";

import { useDispose } from "../utils/useDispose";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Color, DoubleSide, ShaderMaterial, Vector3 } from "three";
import { L } from "./layout";
import { windowFragment, windowVertex } from "./shaders/window";
import { store } from "@/lib/store";

/** The rainy window: one plane with the rain/city shader. */
export default function WindowPane() {
  const { window: w, wallZ } = L;
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: windowVertex,
        fragmentShader: windowFragment,
        uniforms: {
          uTime: { value: 0 },
          uAspect: { value: w.w / w.h },
          uRain: { value: 0.75 },
          uLit: { value: 1 },
          uTintA: { value: new Color("#7c3aed") },
          uTintB: { value: new Color("#00f5ff") },
        },
        side: DoubleSide,
        transparent: true,
        depthWrite: true,
      }),
    [w.w, w.h]
  );
  useDispose(material);

  useFrame((state) => {
    const s = store.get();
    // reduced motion: rain stands still (a photo, not a film)
    if (!s.reducedMotion) material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uRain.value = s.tier === "high" ? 0.8 : 0.55;
  });

  return (
    <mesh position={[w.x, w.y, wallZ - 0.05]} material={material}>
      <planeGeometry args={[w.w, w.h]} />
    </mesh>
  );
}

export const WINDOW_CENTRE = new Vector3(L.window.x, L.window.y, L.wallZ);
