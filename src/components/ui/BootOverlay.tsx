"use client";

import { useStore } from "@/lib/store";

/**
 * HTML mirror of the boot log that the monitor prints. It shows the same real
 * events (context, chunk, shaders, physics, fonts) and disappears when the
 * system has booted. There is no percentage: only things that happened.
 */
export default function BootOverlay() {
  const gl = useStore((s) => s.gl);
  const booted = useStore((s) => s.booted);
  const log = useStore((s) => s.bootLog);
  if (!gl || booted) return null;
  return (
    <div className="boot" aria-live="polite" aria-atomic="false">
      {log.slice(-6).map((l, i) => (
        <div key={i} className={l.kind}>
          <span className="text-muted">[{l.t.toFixed(3).padStart(8, " ")}]</span> {l.text}
        </div>
      ))}
    </div>
  );
}
