"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PointLight, SpotLight } from "three";
import { L } from "./layout";
import { store, useStore } from "@/lib/store";

/**
 * Three lights: the cyan LED strip (accent), the window's violet-blue rim,
 * and one soft shadow-casting spot above the desk. The monitor's own light
 * lives in Monitor.tsx. The environment is a procedural cubemap rendered
 * once from lightformers, so glossy surfaces reflect a plausible room.
 */
export default function Lights() {
  const tier = useStore((s) => s.tier);
  const led = useRef<PointLight>(null);
  const spot = useRef<SpotLight>(null);

  useFrame((state) => {
    const l = led.current;
    if (!l) return;
    const s = store.get();
    // LED strip breathes slowly; steady in reduced motion
    const t = s.reducedMotion ? 0 : state.clock.elapsedTime;
    l.intensity = 1.15 + 0.12 * Math.sin(t * 0.9);
  });

  return (
    <>
      <ambientLight intensity={0.045} color="#6b6bff" />
      {/* LED strip */}
      <pointLight
        ref={led}
        position={[0.1, L.deskY + 0.32, L.wallZ + 0.16]}
        color="#2997ff"
        intensity={1.2}
        distance={2.6}
        decay={2}
      />
      {/* window rim */}
      <pointLight position={[L.window.x, L.window.y, L.wallZ + 0.3]} color="#5e5ce6" intensity={0.9} distance={4} decay={2} />
      <pointLight position={[L.window.x - 0.6, L.window.y + 0.3, L.wallZ + 0.1]} color="#4d7cff" intensity={0.35} distance={3} decay={2} />
      {/* soft key from above the desk (shadows on HIGH) */}
      <spotLight
        ref={spot}
        position={[0.4, 2.3, -0.3]}
        target-position={[0.2, L.deskY, L.deskZ]}
        angle={0.55}
        penumbra={0.9}
        intensity={tier === "high" ? 6 : 4}
        color="#b8c6ff"
        distance={5}
        decay={2}
        castShadow={tier === "high"}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <Environment resolution={128} frames={1} environmentIntensity={0.35}>
        <Lightformer form="rect" intensity={2.5} color="#2997ff" position={[0, -0.3, -2]} scale={[4, 0.1, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#5e5ce6" position={[1.5, 1.2, -2.5]} scale={[2, 1.4, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#dfe7ff" position={[0.3, 0.6, -1.5]} scale={[0.9, 0.55, 1]} />
        <Lightformer form="ring" intensity={0.4} color="#ffffff" position={[-2, 2, 1]} scale={2} />
        <mesh scale={30}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#05050a" side={1} />
        </mesh>
      </Environment>
    </>
  );
}
