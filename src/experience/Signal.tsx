"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, PointLight } from "three";
import { rig } from "./rig/CameraRig";
import { WORLD_OFFSET } from "./rig/keyframes";
import { L } from "./desk/layout";
import { smoothstep } from "./utils/scratch";
import { store } from "@/lib/store";

/**
 * The one continuous cyan signal. Its world position is a function of the
 * master clock: keyboard LED → into the screen → along the silicon traces →
 * across the network → back to the phone. Always the brightest emissive in
 * the frame, so bloom makes it read as light, not paint.
 */
export default function Signal() {
  const mesh = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);

  useFrame((state) => {
    const m = mesh.current;
    const l = light.current;
    if (!m || !l) return;
    const p = rig.p;
    const t = store.get().reducedMotion ? 0 : state.clock.elapsedTime;
    let x = 0,
      y = 0,
      z = 0,
      scale = 1,
      vis = 1;
    if (p < 0.2) {
      // sits on the keyboard's LED then races into the screen
      const k = smoothstep(0.12, 0.2, p);
      x = L.keyboard.x + 0.02 + (L.monitor.x - L.keyboard.x - 0.02) * k;
      y = L.deskY + 0.02 + (L.monitor.y - L.deskY - 0.02) * k;
      z = L.keyboard.z + (L.monitor.z + 0.02 - L.keyboard.z) * k;
      scale = 0.4 + k * 0.6;
    } else if (p < 0.47) {
      // rides the terminal → editor → explorer, always at the window edge
      const o = WORLD_OFFSET.screen;
      const k = smoothstep(0.22, 0.46, p);
      x = o[0] + (k < 0.5 ? -4.9 + 9.8 * (k * 2) : 4.9 - 7.5 * ((k - 0.5) * 2));
      y = o[1] + (k < 0.5 ? 2.8 : 2.8 - 5.2 * ((k - 0.5) * 2)) + Math.sin(t * 1.5) * 0.05;
      z = o[2] + 0.9;
      scale = 0.7;
    } else if (p < 0.7) {
      const o = WORLD_OFFSET.silicon;
      const k = smoothstep(0.47, 0.7, p);
      x = o[0] + 3 - 9 * k;
      y = o[1] + 0.12;
      z = o[2] + Math.sin(k * 9) * 1.2 - k * 3;
      scale = 0.35;
    } else if (p < 0.875) {
      const o = WORLD_OFFSET.network;
      const k = smoothstep(0.7, 0.875, p);
      x = o[0] + Math.sin(k * 6.3) * 2;
      y = o[1] + Math.cos(k * 5) * 1.5 + 0.5;
      z = o[2] + 2 - 60 * k;
      scale = 0.9;
    } else {
      // returns to the phone
      const k = smoothstep(0.875, 0.92, p);
      x = L.monitor.x + (L.phone.x - L.monitor.x) * k;
      y = L.monitor.y + (L.deskY + 0.03 - L.monitor.y) * k;
      z = L.monitor.z + 0.02 + (L.phone.z - L.monitor.z - 0.02) * k;
      scale = 0.5 - 0.3 * k;
      vis = 1 - smoothstep(0.95, 0.97, p);
    }
    m.position.set(x, y, z);
    const s = 0.012 * scale * (1 + 0.15 * Math.sin(t * 7));
    m.scale.setScalar(s);
    m.visible = vis > 0.01;
    l.position.copy(m.position);
    l.intensity = 0.22 * vis * scale;
  });

  return (
    <>
      <mesh ref={mesh}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color={[0, 6, 6.5]} toneMapped={false} />
      </mesh>
      <pointLight ref={light} color="#00f5ff" distance={0.7} decay={2} intensity={0} />
    </>
  );
}
