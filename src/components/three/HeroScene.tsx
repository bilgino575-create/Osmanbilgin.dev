"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import SolarSystem from "./SolarSystem";

export default function HeroScene() {
  const [quality, setQuality] = useState<"high" | "low">("high");

  useEffect(() => {
    const update = () => setQuality(window.innerWidth < 768 ? "low" : "high");
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <Canvas
      dpr={[1, quality === "high" ? 2 : 1]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 4.5, 15], fov: 42 }}
      className="!absolute inset-0 pointer-events-auto"
    >
      <Suspense fallback={null}>
        <SolarSystem quality={quality} />
      </Suspense>
    </Canvas>
  );
}
