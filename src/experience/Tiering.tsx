"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { getGPUTier } from "detect-gpu";
import { store } from "@/lib/store";
import { disableGl } from "@/lib/gl";

/**
 * Quality tiers with hysteresis.
 *
 * 1. `detect-gpu` gives the starting tier (benchmarks are self-hosted under
 *    /benchmarks so no third-party request is made at runtime).
 * 2. drei's PerformanceMonitor watches the real frame rate. A decline needs
 *    two consecutive reports under the lower bound, an incline three above the
 *    upper bound, and after any change the tier is locked for six seconds.
 *    `flipflops` caps the number of changes in a session so it can never
 *    oscillate.
 */
export default function Tiering() {
  const declines = useRef(0);
  const inclines = useRef(0);
  const lockedUntil = useRef(0);

  useEffect(() => {
    let cancelled = false;
    getGPUTier({ benchmarksURL: "/benchmarks" })
      .then((r) => {
        if (cancelled) return;
        const forced = new URLSearchParams(location.search).get("gl") === "1";
        if (r.tier === 0 && !store.get().tierLocked && !forced) {
          // blocklisted or benchmarked far below the floor: the HTML site is the better experience
          disableGl(`gpu tier 0 (${r.gpu ?? "unknown"})`);
          return;
        }
        const mobileLike = r.isMobile || store.get().touch;
        const tier: "high" | "low" = r.tier >= 2 && !mobileLike ? "high" : r.tier >= 3 ? "high" : "low";
        store.set(store.get().tierLocked ? { gpuTier: r.tier } : { gpuTier: r.tier, tier });
        store.boot("ok", `gpu: ${r.gpu ?? "unknown"} · tier ${r.tier}${r.fps ? ` · ~${r.fps} fps` : ""} → ${tier}`);
      })
      .catch(() => {
        if (cancelled) return;
        store.set({ gpuTier: 0 });
        store.boot("warn", "gpu: benchmark unavailable, keeping current tier");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PerformanceMonitor
      bounds={() => [45, 58]}
      flipflops={3}
      iterations={8}
      ms={250}
      onDecline={() => {
        inclines.current = 0;
        if (store.get().tierLocked || performance.now() < lockedUntil.current) return;
        declines.current++;
        if (declines.current >= 2 && store.get().tier === "high") {
          store.set({ tier: "low" });
          store.boot("warn", "perf: frame rate below 45, switching to LOW tier");
          lockedUntil.current = performance.now() + 6000;
          declines.current = 0;
        }
      }}
      onIncline={() => {
        declines.current = 0;
        if (store.get().tierLocked || performance.now() < lockedUntil.current) return;
        inclines.current++;
        if (inclines.current >= 3 && store.get().tier === "low" && store.get().gpuTier >= 2) {
          store.set({ tier: "high" });
          store.boot("ok", "perf: frame rate stable above 58, back to HIGH tier");
          lockedUntil.current = performance.now() + 6000;
          inclines.current = 0;
        }
      }}
    />
  );
}
