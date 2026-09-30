"use client";

import { store } from "./store";

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen|virtualbox|vmware svga/i;

/**
 * Can this machine run the 3D layer well enough to be worth it?
 *
 * Software renderers (SwiftShader, llvmpipe, remote desktops, VMs) report a
 * WebGL2 context but render at a frame per second; those visitors get the
 * complete HTML site instead of a frozen canvas. `?gl=1` forces the canvas on
 * (used by the screenshot tooling, which only has a software renderer).
 */
export function probeWebGL(): { ok: boolean; reason: string; renderer: string } {
  const params = new URLSearchParams(window.location.search);
  if (params.has("nogl")) return { ok: false, reason: "disabled by ?nogl", renderer: "" };
  const forced = glForced();
  try {
    const c = document.createElement("canvas");
    const g = c.getContext("webgl2", { failIfMajorPerformanceCaveat: !forced }) as WebGL2RenderingContext | null;
    if (!g) return { ok: false, reason: "no webgl2 context (or a major performance caveat)", renderer: "" };
    const dbg = g.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(dbg ? g.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER));
    g.getExtension("WEBGL_lose_context")?.loseContext();
    if (!forced && SOFTWARE.test(renderer)) return { ok: false, reason: `software renderer: ${renderer}`, renderer };
    // very old canvas APIs mean a very old browser; keep it simple there
    if (typeof CanvasRenderingContext2D === "undefined") return { ok: false, reason: "no canvas 2d", renderer };
    return { ok: true, reason: "ok", renderer };
  } catch (e) {
    return { ok: false, reason: `probe threw: ${(e as Error).message}`, renderer: "" };
  }
}

/**
 * Switch the document back to the plain HTML site. Safe to call more than
 * once. Used when the 3D layer throws, stops rendering, or the GPU turns out
 * to be too weak after the fact.
 */
export function disableGl(reason: string) {
  if (!store.get().gl) return;
  store.boot("warn", `3d: disabled — ${reason}`);
  store.set({ gl: false, glFailed: true, osFocus: false });
  const html = document.documentElement;
  html.classList.remove("gl", "os-focus");
  html.style.removeProperty("--track-vh");
  html.style.removeProperty("--footer-vis");
  for (const s of Array.from(document.querySelectorAll<HTMLElement>("section.section"))) {
    s.style.removeProperty("--vis");
    delete s.dataset.hidden;
  }
  // keep the visitor at the top of the now-static document
  window.scrollTo({ top: 0, behavior: "auto" });
}

/** `?gl=1`: the visitor (or the measurement scripts) insists on the canvas; probe and watchdog stand down. */
export function glForced() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("gl") === "1";
}

/** Last time the renderer produced a frame; the watchdog reads it. */
export const frameClock = { last: 0, frames: 0 };
