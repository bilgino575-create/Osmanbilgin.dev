"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "p" | "span";
}

export default function RevealText({
  children,
  className = "",
  delay = 0,
  as = "div",
}: RevealTextProps) {
  const MotionTag = motion[as];

  return (
    <div className="overflow-hidden">
      <MotionTag
        initial={{ y: "100%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
      >
        {children}
      </MotionTag>
    </div>
  );
}
