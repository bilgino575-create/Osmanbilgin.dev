"use client";

import { useEffect, useRef } from "react";

/** A small dot + lagging ring. Fine pointers only; never on touch devices. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches || reduce.matches) return;
    document.documentElement.classList.add("cursor-on");
    let x = -100,
      y = -100,
      rx = -100,
      ry = -100;
    let raf = 0;
    let hover = false;
    const el = ref.current!;
    const dot = el.querySelector<HTMLElement>(".dot")!;
    const ring = el.querySelector<HTMLElement>(".ring")!;
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      dot.style.transform = `translate3d(${x}px,${y}px,0)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement | null;
      const h = !!t?.closest("a, button, input, textarea, select, [role=button], canvas");
      if (h !== hover) {
        hover = h;
        el.dataset.hover = String(h);
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("cursor-on");
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden="true" hidden>
      <div className="dot" />
      <div className="ring" />
    </div>
  );
}
