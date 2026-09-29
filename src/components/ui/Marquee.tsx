import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  reverse?: boolean;
  speed?: number;
  className?: string;
  trackClassName?: string;
}

export default function Marquee({
  children,
  reverse = false,
  speed,
  className = "",
  trackClassName = "",
}: MarqueeProps) {
  return (
    <div className={`flex overflow-hidden ${className}`}>
      <div
        style={speed ? { animationDuration: `${speed}s` } : undefined}
        className={`flex w-max shrink-0 ${
          reverse ? "marquee-track-reverse" : "marquee-track"
        } ${trackClassName}`}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
