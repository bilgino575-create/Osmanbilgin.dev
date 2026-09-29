"use client";

import { useMemo, useEffect } from "react";
import { RoundedBoxGeometry } from "three-stdlib";
import { L } from "./layout";
import { useMaterials } from "./context";

/** Desk top, legs, a desk mat and the LED strip along the back edge. */
export default function Desk() {
  const m = useMaterials();
  const top = useMemo(() => new RoundedBoxGeometry(L.deskW, 0.04, L.deskD, 3, 0.012), []);
  const mat = useMemo(() => new RoundedBoxGeometry(0.9, 0.004, 0.4, 2, 0.002), []);
  const led = useMemo(() => new RoundedBoxGeometry(L.deskW - 0.2, 0.008, 0.012, 2, 0.003), []);
  useEffect(
    () => () => {
      top.dispose();
      mat.dispose();
      led.dispose();
    },
    [top, mat, led]
  );
  const legY = L.deskY / 2 - 0.02;
  return (
    <group>
      <mesh geometry={top} material={m.wood} position={[0, L.deskY - 0.02, L.deskZ]} castShadow receiveShadow />
      {/* legs: two slim panels */}
      <mesh material={m.metal} position={[-L.deskW / 2 + 0.05, legY, L.deskZ]} castShadow>
        <boxGeometry args={[0.04, L.deskY - 0.04, L.deskD - 0.1]} />
      </mesh>
      <mesh material={m.metal} position={[L.deskW / 2 - 0.05, legY, L.deskZ]} castShadow>
        <boxGeometry args={[0.04, L.deskY - 0.04, L.deskD - 0.1]} />
      </mesh>
      {/* cross bar */}
      <mesh material={m.metal} position={[0, 0.12, L.deskZ - 0.3]}>
        <boxGeometry args={[L.deskW - 0.14, 0.03, 0.03]} />
      </mesh>
      {/* desk mat under keyboard + phone */}
      <mesh geometry={mat} material={m.mat} position={[L.keyboard.x + 0.05, L.deskY + 0.002, L.keyboard.z + 0.02]} receiveShadow />
      {/* LED strip at the foot of the wall behind the desk: it lights the wall, not the lens */}
      <mesh geometry={led} material={m.led} position={[0, L.deskY + 0.012, L.wallZ + 0.03]} />
      {/* cable */}
      <mesh material={m.plastic} position={[L.monitor.x + 0.02, L.deskY + 0.006, L.deskZ - 0.25]} rotation-y={0.4}>
        <boxGeometry args={[0.005, 0.005, 0.3]} />
      </mesh>
    </group>
  );
}
