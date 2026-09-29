import type { CSSProperties, ReactNode } from "react";
import { TRACK_VH, sectionById } from "@/lib/acts";

/**
 * The scroll track. With WebGL on, it is `TRACK_VH` tall and its sections are
 * absolutely positioned at their act's progress. Without WebGL it is a plain
 * document.
 */
export default function Track({ children }: { children: ReactNode }) {
  return (
    <main
      id="main"
      className="track"
      style={{ "--track-vh": TRACK_VH.desktop } as CSSProperties}
    >
      {children}
    </main>
  );
}

interface SectionProps {
  id: string;
  /** visible label for the aria-labelledby heading */
  children: ReactNode;
  className?: string;
  /** align the panel body to the left, right or center of the viewport */
  align?: "left" | "right" | "center";
}

export function Section({ id, children, className = "", align = "left" }: SectionProps) {
  const s = sectionById(id);
  const style = s
    ? ({ "--from": s.from, "--to": s.to } as CSSProperties)
    : undefined;
  return (
    <section
      id={id}
      className={`section ${className}`}
      style={style}
      data-from={s?.from}
      data-to={s?.to}
      data-anchor={s?.anchor}
      aria-labelledby={`${id}-title`}
    >
      <div className="panel">
        <div className={`panel-body align-${align}`}>{children}</div>
      </div>
    </section>
  );
}
