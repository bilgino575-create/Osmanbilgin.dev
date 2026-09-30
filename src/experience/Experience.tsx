"use client";

import { Canvas, useThree } from "@react-three/fiber";
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
/**
 * Phones render at 30 fps: half the GPU work and a much steadier frame time
 * than chasing 60 with a thermally throttled SoC. Desktop keeps the display rate.
 */
/**
 * Caps the render loop at `fps` on touch devices. The canvas runs in
 * `demand` mode and this loop invalidates it every 1000/fps ms, so the
 * clock keeps normal seconds (in `never` mode R3F feeds the raw timestamp
 * into `clock.elapsedTime`, which breaks every time-based shader).
 */
function FrameCap({ fps, paused }: { fps: number; paused: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = 0;
    const step = 1000 / fps - 1.5;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < step) return;
      last = t;
      invalidate();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [invalidate, fps, paused]);
  return null;
}

export default function Experience() {
  const tier = useStore((s) => s.tier);
  const touch = useStore((s) => s.touch);
  const [visible, setVisible] = useState(true);
  const [dprMax] = useState(() => Math.min(2, window.devicePixelRatio || 1));

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      frameloop={!visible ? "never" : touch ? "demand" : "always"}
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
      {touch && <FrameCap fps={30} paused={!visible} />}
      <Scene />
    </Canvas>
  );
}
