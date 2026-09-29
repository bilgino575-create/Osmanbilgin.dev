"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { store, useStore } from "@/lib/store";
import Scene from "./Scene";

/**
 * The single persistent canvas. Created after first paint (see
 * ExperienceLoader). Rendering pauses when the tab is hidden and resumes when
 * it comes back. Loss of the WebGL context is reported to the store so the
 * HTML site takes over.
 */
export default function Experience() {
  const tier = useStore((s) => s.tier);
  const [visible, setVisible] = useState(true);
  const [dprMax] = useState(() => Math.min(2, window.devicePixelRatio || 1));

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      frameloop={visible ? "always" : "never"}
      dpr={tier === "high" ? [1, dprMax] : 1}
      gl={{
        antialias: false,
        alpha: false,
        stencil: false,
        depth: true,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        outputColorSpace: SRGBColorSpace,
      }}
      camera={{ fov: 36, near: 0.03, far: 200, position: [-0.62, 1.22, 1.32] }}
      shadows={tier === "high" ? "soft" : false}
      flat={false}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
      onCreated={({ gl }) => {
        store.boot("ok", `renderer: ${gl.capabilities.isWebGL2 ? "WebGL2" : "WebGL1"} · ${(gl.getContext() as WebGLRenderingContext).getParameter((gl.getContext() as WebGLRenderingContext).VERSION)}`);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          store.boot("warn", "webgl: context lost");
          store.set({ glFailed: true });
        });
        gl.domElement.addEventListener("webglcontextrestored", () => {
          store.boot("ok", "webgl: context restored");
          store.set({ glFailed: false });
        });
      }}
      style={{ background: "#050507" }}
    >
      <Scene />
    </Canvas>
  );
}
