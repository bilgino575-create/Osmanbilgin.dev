"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [cursorText, setCursorText] = useState("");

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const ringX = useSpring(cursorX, { damping: 28, stiffness: 280, mass: 0.5 });
  const ringY = useSpring(cursorY, { damping: 28, stiffness: 280, mass: 0.5 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);

      const target = e.target as HTMLElement;
      const interactive = target.closest(
        'a, button, input, textarea, select, [role="button"], [data-cursor]'
      ) as HTMLElement | null;

      setIsPointer(!!interactive);
      setCursorText(interactive?.dataset.cursorText ?? "");
    };

    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    document.documentElement.addEventListener("mouseleave", handleLeave);
    document.documentElement.addEventListener("mouseenter", handleEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      document.documentElement.removeEventListener("mouseenter", handleEnter);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200] flex items-center justify-center rounded-full border border-accent/70"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isPointer ? 88 : 36,
          height: isPointer ? 88 : 36,
          opacity: isVisible ? 1 : 0,
          backgroundColor: isPointer ? "rgba(0, 245, 255, 0.08)" : "rgba(0, 245, 255, 0)",
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {cursorText && (
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
            {cursorText}
          </span>
        )}
      </motion.div>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200] h-2 w-2 rounded-full bg-accent mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible && !isPointer ? 1 : 0,
        }}
      />
    </>
  );
}
