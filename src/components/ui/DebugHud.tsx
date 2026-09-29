"use client";

import { useEffect, useRef } from "react";
import { store, useStore } from "@/lib/store";

/**
 * Developer HUD. Toggled with `D` or `?debug`. Numbers come straight from
 * `renderer.info` and the frame clock; the sparkline is the last 120 frame
 * times. Nothing here is estimated.
 */
export default function DebugHud() {
  const debug = useStore((s) => s.debug);
  const stats = useStore((s) => s.stats);
  const tier = useStore((s) => s.tier);
  const gpuTier = useStore((s) => s.gpuTier);
  const act = useStore((s) => s.act);
  const progress = useStore((s) => s.progress);
  const gl = useStore((s) => s.gl);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const history = useRef<number[]>([]);

  useEffect(() => {
    if (!debug) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const h = history.current;
    h.push(stats.ms);
    if (h.length > 120) h.shift();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = c.clientWidth,
      H = c.clientHeight;
    if (c.width !== W * dpr || c.height !== H * dpr) {
      c.width = W * dpr;
      c.height = H * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    const y16 = H - (16.7 / 40) * H;
    ctx.moveTo(0, y16);
    ctx.lineTo(W, y16);
    ctx.stroke();
    ctx.beginPath();
    h.forEach((ms, i) => {
      const x = (i / 119) * W;
      const y = H - Math.min(1, ms / 40) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = stats.ms > 20 ? "#ffb648" : "#00f5ff";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }, [debug, stats]);

  if (!debug) return null;

  return (
    <aside className="hud" aria-label="Developer HUD">
      <header>
        <span>root-access · devtools</span>
        <button
          type="button"
          onClick={() => store.set({ debug: false })}
          aria-label="Close HUD"
          className="text-muted hover:text-text"
        >
          ✕
        </button>
      </header>
      <dl>
        <dt>renderer</dt>
        <dd>{gl ? "WebGL2" : "none"}</dd>
        <dt>fps</dt>
        <dd>{stats.fps.toFixed(0)}</dd>
        <dt>frame</dt>
        <dd>{stats.ms.toFixed(2)} ms</dd>
        <dt>draw calls</dt>
        <dd>{stats.calls}</dd>
        <dt>triangles</dt>
        <dd>{stats.triangles.toLocaleString()}</dd>
        <dt>geometries / textures</dt>
        <dd>
          {stats.geometries} / {stats.textures}
        </dd>
        <dt>programs</dt>
        <dd>{stats.programs}</dd>
        <dt>gpu tier (detect-gpu)</dt>
        <dd>{gpuTier < 0 ? "…" : gpuTier}</dd>
        <dt>quality tier</dt>
        <dd className={tier === "high" ? "text-cyan" : "text-[#ffb648]"}>{tier}</dd>
        <dt>act</dt>
        <dd>{act}</dd>
        <dt>scroll progress</dt>
        <dd>{progress.toFixed(4)}</dd>
      </dl>
      <canvas ref={canvasRef} aria-hidden="true" />
    </aside>
  );
}
