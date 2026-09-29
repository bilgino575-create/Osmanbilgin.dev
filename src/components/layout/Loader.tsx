"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAME = "OSMAN BILGIN";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.2,
    },
  },
};

const letter = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const duration = 2400;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => setDone(true), 350);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!done) return;
    document.documentElement.style.overflow = "";
    window.dispatchEvent(new Event("app:loaded"));
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background grid-bg"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

          <div className="relative flex flex-col items-center px-6">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 font-mono text-[11px] uppercase tracking-[0.5em] text-accent/80"
            >
              System.Init<span className="animate-blink">_</span>
            </motion.span>

            <motion.div
              variants={container}
              initial="hidden"
              animate="visible"
              className="flex select-none flex-wrap items-center justify-center"
            >
              {NAME.split("").map((char, i) => (
                <span key={i} className="overflow-hidden py-1">
                  <motion.span
                    variants={letter}
                    className="inline-block font-display text-[12vw] font-bold leading-none tracking-tight text-primary sm:text-[9vw] md:text-[7vw]"
                  >
                    {char === " " ? " " : char}
                  </motion.span>
                </span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-4 font-mono text-[10px] uppercase tracking-[0.4em] text-secondary sm:text-xs"
            >
              Full Stack Developer — Software Engineer — AI System Architect
            </motion.p>
          </div>

          <div className="absolute bottom-10 left-1/2 w-[min(420px,80vw)] -translate-x-1/2">
            <div className="mb-3 flex items-center justify-between font-mono text-xs text-secondary">
              <span className="tracking-[0.3em]">LOADING</span>
              <span className="tabular-nums text-primary">{progress}%</span>
            </div>
            <div className="h-px w-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-accent via-accent-2 to-accent-3"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-6 border border-white/[0.06] sm:inset-10" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
