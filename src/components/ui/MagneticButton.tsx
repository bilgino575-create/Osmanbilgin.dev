"use client";

import { type MouseEvent, type ReactNode } from "react";
import { motion } from "framer-motion";

type MagneticClickEvent = MouseEvent<HTMLAnchorElement | HTMLButtonElement>;

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: (e: MagneticClickEvent) => void;
  strength?: number;
  cursorText?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit";
}

export default function MagneticButton({
  children,
  href,
  className,
  onClick,
  strength = 0.35,
  cursorText,
  target,
  rel,
  type = "button",
}: MagneticButtonProps) {
  const handleMouseMove = (
    e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    e.currentTarget.style.setProperty("--mx", `${x}px`);
    e.currentTarget.style.setProperty("--my", `${y}px`);
  };

  const handleMouseLeave = (
    e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => {
    e.currentTarget.style.setProperty("--mx", "0px");
    e.currentTarget.style.setProperty("--my", "0px");
  };

  const sharedProps = {
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onClick,
    className,
    "data-cursor": "hover",
    "data-cursor-text": cursorText,
    style: {
      transform: "translate3d(var(--mx, 0px), var(--my, 0px), 0)",
      transition: "transform 0.25s var(--ease-out-expo, ease)",
    },
  };

  if (href) {
    return (
      <motion.a
        href={href}
        target={target}
        rel={rel}
        whileTap={{ scale: 0.96 }}
        {...sharedProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} whileTap={{ scale: 0.96 }} {...sharedProps}>
      {children}
    </motion.button>
  );
}
