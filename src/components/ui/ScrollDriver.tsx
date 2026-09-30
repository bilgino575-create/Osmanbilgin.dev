"use client";

import { useEffect } from "react";
import { SECTIONS, actAt, sectionVisibility, TRACK_VH } from "@/lib/acts";
import { store } from "@/lib/store";
import { audio } from "@/lib/audio";
import { currentProgress, scrollToHash, setLenis } from "@/lib/scroll";
import { probeWebGL } from "@/lib/gl";

/**
 * Owns the scroll. Decides early whether the 3D layer is possible (so the
 * document takes its final shape before the heavy chunk loads), runs Lenis,
 * writes progress to the store and drives the visibility of the HTML sections
 * without React re-renders.
 */
export default function ScrollDriver() {
  useEffect(() => {
    const html = document.documentElement;
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqCoarse = window.matchMedia("(pointer: coarse)");
    const params = new URLSearchParams(window.location.search);

    const touch = mqCoarse.matches || "ontouchstart" in window;
    const reducedMotion = mqReduce.matches;
    const debug = params.has("debug");

    // WebGL2 capability check, cheap and synchronous; software renderers get the HTML site.
    const probe = probeWebGL();
    const glOk = probe.ok;
    if (!glOk) store.boot("warn", `3d: skipped — ${probe.reason}`);

    const tierParam = params.get("tier");
    const tierLocked = tierParam === "high" || tierParam === "low";
    store.set({
      touch,
      reducedMotion,
      debug,
      gl: glOk,
      glFailed: !glOk,
      ...(tierLocked ? { tier: tierParam as "high" | "low", tierLocked: true } : {}),
    });

    if (glOk) {
      html.classList.add("gl");
      html.style.setProperty(
        "--track-vh",
        String(touch || window.innerWidth < 768 ? TRACK_VH.mobile : TRACK_VH.desktop)
      );
    }

    const sections = SECTIONS.map((s) => ({
      s,
      el: document.getElementById(s.id),
    })).filter((x): x is { s: (typeof SECTIONS)[number]; el: HTMLElement } => !!x.el);

    const pipeline = Array.from(
      document.querySelectorAll<HTMLElement>("#pipeline .pipe-step")
    );
    const processSection = SECTIONS.find((s) => s.id === "process")!;

    let lastSection = "";
    const apply = (p: number) => {
      if (!store.get().gl) return;
      let best = "";
      let bestD = 1;
      for (const { s, el } of sections) {
        const v = sectionVisibility(s, p);
        el.style.setProperty("--vis", v.toFixed(3));
        el.dataset.hidden = v < 0.02 ? "true" : "false";
        const d = Math.abs(p - s.anchor);
        if (d < bestD) {
          bestD = d;
          best = s.id;
        }
      }
      if (best !== lastSection) {
        lastSection = best;
        store.set({ section: best });
      }
      html.style.setProperty("--footer-vis", sectionVisibility(SECTIONS[SECTIONS.length - 1], p).toFixed(3));
      // Pipeline stages turn green as the visitor moves through Act IV.
      const t = (p - processSection.from) / (processSection.to - processSection.from);
      const n = pipeline.length;
      pipeline.forEach((el, i) => {
        const done = t > (i + 1) / (n + 0.5);
        const active = !done && t > i / (n + 0.5);
        if (el.dataset.done !== String(done)) el.dataset.done = String(done);
        if (el.dataset.active !== String(active)) el.dataset.active = String(active);
      });
    };

    const onScroll = () => {
      const live = store.get().gl;
      const p = live ? currentProgress() : 0;
      store.set({ progress: p, act: actAt(p) });
      if (live) {
        apply(p);
        return;
      }
      // Without WebGL, the active section is the last one whose top passed mid-viewport.
      let best = "home";
      const mid = window.innerHeight * 0.45;
      for (const { s, el } of sections) {
        if (el.getBoundingClientRect().top <= mid) best = s.id;
      }
      if (best !== lastSection) {
        lastSection = best;
        store.set({ section: best });
      }
    };

    let lenisCleanup = () => {};
    if (glOk && !reducedMotion) {
      import("lenis").then(({ default: Lenis }) => {
        const lenis = new Lenis({
          autoRaf: true,
          lerp: 0.085,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.4,
          syncTouch: false,
        });
        setLenis(lenis);
        lenis.on("scroll", onScroll);
        lenisCleanup = () => {
          lenis.destroy();
          setLenis(null);
        };
        store.boot("ok", "lenis: smooth scroll attached");
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    // Deep links: `#work` etc. resolve to the camera position.
    if (glOk && window.location.hash) {
      const hash = window.location.hash;
      requestAnimationFrame(() => scrollToHash(hash, true));
    }

    // Keyboard focus inside a hidden section brings the camera there.
    const onFocus = (e: FocusEvent) => {
      if (!glOk) return;
      const target = e.target as HTMLElement | null;
      const sec = target?.closest<HTMLElement>("section.section");
      if (!sec || sec.dataset.hidden !== "true") return;
      scrollToHash(`#${sec.id}`, true);
    };
    document.addEventListener("focusin", onFocus);

    // Global key events feed the 3D keyboard and the sound engine.
    let n = 0;
    const isTyping = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      store.set({ keyEvent: { code: e.code, down: true, n: ++n } });
      audio.click(rowOf(e.code), true);
      if (isTyping(e) || store.get().paletteOpen) return;
      if (e.key === "d" || e.key === "D") {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) store.set({ debug: !store.get().debug });
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      store.set({ keyEvent: { code: e.code, down: false, n: ++n } });
      audio.click(rowOf(e.code), false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const onPointer = (e: PointerEvent) => {
      store.set({
        pointerX: (e.clientX / window.innerWidth) * 2 - 1,
        pointerY: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const onReduce = () => store.set({ reducedMotion: mqReduce.matches });
    mqReduce.addEventListener("change", onReduce);

    return () => {
      lenisCleanup();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointermove", onPointer);
      mqReduce.removeEventListener("change", onReduce);
    };
  }, []);

  return null;
}

function rowOf(code: string): number {
  if (/^(Escape|F\d+)/.test(code)) return 0;
  if (/^(Digit|Minus|Equal|Backspace|Backquote)/.test(code)) return 1;
  if (/^Key[QWERTYUIOP]|Tab|Bracket/.test(code)) return 2;
  if (/^Key[ASDFGHJKL]|Semicolon|Quote|Enter|CapsLock/.test(code)) return 3;
  return 4;
}
