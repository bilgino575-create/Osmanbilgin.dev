"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    window.__lenis = lenis;
    lenis.stop();

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const handleAppLoaded = () => lenis.start();
    window.addEventListener("app:loaded", handleAppLoaded);

    return () => {
      window.removeEventListener("app:loaded", handleAppLoaded);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      if (window.__lenis === lenis) {
        window.__lenis = undefined;
      }
    };
  }, []);

  return <>{children}</>;
}
