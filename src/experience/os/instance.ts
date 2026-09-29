"use client";

import { ScreenOS } from "./ScreenOS";
import { store } from "@/lib/store";
import { getLenis, scrollToHash } from "@/lib/scroll";

let os: ScreenOS | null = null;

/**
 * The single OS instance shared by the Act I monitor and the Act II windows.
 * Created lazily on the client; keyboard routing lives here so both acts
 * share one listener.
 */
export function getOS(): ScreenOS {
  if (os) return os;
  os = new ScreenOS({
    openProject(slug) {
      os!.explorer.openProject(slug);
      os!.setFocus(os!.explorer);
    },
    goto(hash) {
      scrollToHash(hash);
    },
    tier: () => store.get().tier.toUpperCase(),
    renderer: () => "WebGL2",
    onProject(slug) {
      store.set({ openProject: slug });
    },
  });

  window.addEventListener(
    "keydown",
    (e) => {
      if (!store.get().osFocus || store.get().paletteOpen) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if (e.key === "Escape") {
        store.set({ osFocus: false });
        return;
      }
      if (os!.key(e)) e.preventDefault();
      else if (e.key === " " || e.key === "Tab") e.preventDefault();
    },
    { capture: true }
  );

  // keep the boot log mirrored on the monitor; hand the wheel to the OS while it has focus
  let lastFocus = false;
  store.subscribe(() => {
    const s = store.get();
    os!.bootLog(s.bootLog, s.booted);
    if (s.osFocus !== lastFocus) {
      lastFocus = s.osFocus;
      document.documentElement.classList.toggle("os-focus", s.osFocus);
      const lenis = getLenis();
      if (s.osFocus) lenis?.stop();
      else lenis?.start();
    }
  });
  return os;
}
