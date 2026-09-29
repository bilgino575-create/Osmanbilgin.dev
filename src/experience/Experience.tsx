"use client";

import { Canvas } from "@react-three/fiber";

export default function Experience() {
  return (
    <Canvas dpr={1} gl={{ antialias: false, powerPreference: "high-performance" }}>
      <color attach="background" args={["#050507"]} />
    </Canvas>
  );
}
