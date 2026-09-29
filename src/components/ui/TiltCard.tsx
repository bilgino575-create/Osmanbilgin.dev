"use client";

import { type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  maxTilt?: number;
}

export default function TiltCard({
  children,
  className = "",
  innerClassName = "",
  maxTilt = 8,
}: TiltCardProps) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 150, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), springConfig);
  const scale = useSpring(1, springConfig);
  const glareX = useTransform(x, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(y, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseEnter = () => scale.set(1.015);

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
    scale.set(1);
  };

  return (
    <div
      className={`group perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
        className={`relative h-full w-full ${innerClassName}`}
      >
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(280px circle at ${gx} ${gy}, color-mix(in oklab, var(--accent) 18%, transparent), transparent 70%)`
            ),
          }}
        />
      </motion.div>
    </div>
  );
}
