"use client";

import { useStore } from "@/lib/store";

/** Tells the visitor the on-screen OS has the keyboard and how to give it back. */
export default function OsHint() {
  const focus = useStore((s) => s.osFocus);
  if (!focus) return null;
  return (
    <div className="os-hint" role="status">
      typing into the OS · <span className="kbd">esc</span> to release · <span className="kbd">alt</span>+<span className="kbd">tab</span> switch window
    </div>
  );
}
