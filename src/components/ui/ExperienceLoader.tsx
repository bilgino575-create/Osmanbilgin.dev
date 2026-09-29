"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { store, useStore } from "@/lib/store";

/**
 * Mounts the single persistent canvas after first paint. The 3D chunk is a
 * separate bundle (`ssr: false`), requested from an idle callback so the
 * hero text is painted and interactive before three.js is even fetched.
 */
const Experience = dynamic(() => import("@/experience/Experience"), {
  ssr: false,
  loading: () => null,
});

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

  if (!gl || !ready) return null;
  return (
    <div className="gl-layer" aria-hidden="true">
      <Experience />
    </div>
  );
}
