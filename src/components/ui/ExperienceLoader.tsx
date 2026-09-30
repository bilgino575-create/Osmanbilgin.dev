"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { store, useStore } from "@/lib/store";
import { disableGl, frameClock, glForced } from "@/lib/gl";

/**
 * Mounts the single persistent canvas after first paint. The 3D chunk is a
 * separate bundle (`ssr: false`), requested from an idle callback so the
 * hero text is painted and interactive before three.js is even fetched.
 *
 * Two safety nets keep the site usable on machines the 3D layer cannot
 * handle: an error boundary (a throw anywhere in the 3D tree hands the
 * document back to HTML) and a watchdog (no frame for twelve seconds while
 * the tab is visible means a stalled renderer, same fallback; `?gl=1` turns
 * the watchdog off because software renderers stall that long by design).
 */
const Experience = dynamic(() => import("@/experience/Experience"), {
  ssr: false,
  loading: () => null,
});

class GlBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    disableGl(`render error: ${error.message}`);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function ExperienceLoader() {
  const gl = useStore((s) => s.gl);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!gl) return;
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      store.boot("ok", "webgl2: context available, loading renderer");
      setReady(true);
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 1200 });
    else setTimeout(start, 250);
    return () => {
      cancelled = true;
    };
  }, [gl]);

  // watchdog: the renderer must keep producing frames while the tab is visible
  useEffect(() => {
    if (!gl || !ready || glForced()) return;
    const mounted = performance.now();
    let armed = false;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const now = performance.now();
      if (!armed) {
        // give the chunk + first compile a generous head start
        if (frameClock.frames > 0 || now - mounted > 25000) armed = true;
        if (now - mounted > 25000 && frameClock.frames === 0) disableGl("no frame rendered 25 s after mount");
        return;
      }
      // a world's shader compile on a weak GPU can take a few seconds; a real freeze takes longer
      if (now - frameClock.last > 12000) disableGl("renderer stalled for 12 s");
    }, 1000);
    return () => window.clearInterval(id);
  }, [gl, ready]);

  // uncaught errors from inside the frame loop are not React errors; catch them here
  useEffect(() => {
    if (!gl) return;
    const onError = (e: ErrorEvent) => {
      const src = `${e.filename ?? ""} ${e.error?.stack ?? ""}`;
      if (/three|experience|fiber|postprocessing|rapier/i.test(src)) disableGl(`runtime error: ${e.message}`);
    };
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, [gl]);

  if (!gl || !ready) return null;
  return (
    <div className="gl-layer" aria-hidden="true">
      <GlBoundary>
        <Experience />
      </GlBoundary>
    </div>
  );
}
