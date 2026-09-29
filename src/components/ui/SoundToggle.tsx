"use client";

import { audio } from "@/lib/audio";
import { store, useStore } from "@/lib/store";

export default function SoundToggle() {
  const sound = useStore((s) => s.sound);
  const gl = useStore((s) => s.gl);
  if (!gl) return null;
  return (
    <button
      type="button"
      className="btn fixed bottom-4 right-4 z-[45] !h-9 !px-3"
      aria-pressed={sound}
      onClick={() => audio.toggle().then((on) => store.set({ sound: on }))}
      title={sound ? "Mute ambient sound" : "Enable ambient sound (rain, keys)"}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-1.5 w-1.5 rounded-full ${sound ? "bg-green shadow-[0_0_8px_var(--green)]" : "bg-muted"}`}
      />
      {sound ? "sound on" : "sound off"}
    </button>
  );
}
