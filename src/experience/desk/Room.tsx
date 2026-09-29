"use client";

import { L } from "./layout";
import { useMaterials } from "./context";

/**
 * Floor, back wall with a window opening, a side wall and a shelf. All
 * boxes; the material does the work.
 */
export default function Room() {
  const m = useMaterials();
  const { window: w, wallZ } = L;
  const wallH = 3.0;
  const wallW = 8;
  const t = 0.12; // wall thickness
  // pieces around the window opening
  const left = w.x - w.w / 2;
  const right = w.x + w.w / 2;
  const bottom = w.y - w.h / 2;
  const top = w.y + w.h / 2;
  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -0.5]} material={m.floor} receiveShadow>
        <planeGeometry args={[wallW, 8]} />
      </mesh>
      {/* back wall pieces (left of window, right of window, below, above) */}
      <mesh position={[(-wallW / 2 + left) / 2, wallH / 2, wallZ - t / 2]} material={m.wall} receiveShadow>
        <boxGeometry args={[left + wallW / 2, wallH, t]} />
      </mesh>
      <mesh position={[(right + wallW / 2) / 2, wallH / 2, wallZ - t / 2]} material={m.wall} receiveShadow>
        <boxGeometry args={[wallW / 2 - right, wallH, t]} />
      </mesh>
      <mesh position={[w.x, bottom / 2, wallZ - t / 2]} material={m.wall} receiveShadow>
        <boxGeometry args={[w.w, bottom, t]} />
      </mesh>
      <mesh position={[w.x, (top + wallH) / 2, wallZ - t / 2]} material={m.wall} receiveShadow>
        <boxGeometry args={[w.w, wallH - top, t]} />
      </mesh>
      {/* window frame + sill */}
      <mesh position={[w.x, bottom - 0.02, wallZ + 0.05]} material={m.plastic}>
        <boxGeometry args={[w.w + 0.16, 0.04, 0.22]} />
      </mesh>
      <mesh position={[left - 0.03, w.y, wallZ - 0.02]} material={m.plastic}>
        <boxGeometry args={[0.06, w.h + 0.1, 0.08]} />
      </mesh>
      <mesh position={[right + 0.03, w.y, wallZ - 0.02]} material={m.plastic}>
        <boxGeometry args={[0.06, w.h + 0.1, 0.08]} />
      </mesh>
      <mesh position={[w.x, top + 0.03, wallZ - 0.02]} material={m.plastic}>
        <boxGeometry args={[w.w + 0.12, 0.06, 0.08]} />
      </mesh>
      {/* vertical mullion */}
      <mesh position={[w.x, w.y, wallZ - 0.03]} material={m.plastic}>
        <boxGeometry args={[0.03, w.h, 0.04]} />
      </mesh>
      {/* left side wall */}
      <mesh position={[-2.4, wallH / 2, 0.5]} material={m.wall} receiveShadow>
        <boxGeometry args={[t, wallH, 6]} />
      </mesh>
      {/* shelf on the left wall with a few books */}
      <mesh position={[-2.2, 1.55, -0.9]} material={m.wood}>
        <boxGeometry args={[0.28, 0.025, 0.9]} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[-2.2, 1.55 + 0.09 + (i % 2) * 0.02, -1.25 + i * 0.075]}
          rotation-z={i === 3 ? 0.12 : 0}
          material={i % 3 === 0 ? m.plastic : i % 3 === 1 ? m.ceramic : m.mat}
        >
          <boxGeometry args={[0.2, 0.18 + (i % 2) * 0.04, 0.045]} />
        </mesh>
      ))}
      {/* a low cabinet beside the desk */}
      <mesh position={[-1.25, 0.32, -1.15]} material={m.plastic} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.64, 0.5]} />
      </mesh>
      <mesh position={[-1.25, 0.5, -0.895]} material={m.metal}>
        <boxGeometry args={[0.12, 0.012, 0.012]} />
      </mesh>
      <mesh position={[-1.25, 0.22, -0.895]} material={m.metal}>
        <boxGeometry args={[0.12, 0.012, 0.012]} />
      </mesh>
    </group>
  );
}
