"use client";

import { SECTIONS } from "@/lib/acts";
import { useStore } from "@/lib/store";
import { scrollToHash } from "@/lib/scroll";

/** Right-hand progress rail: one dot per section, current one lit. */
export default function Rail() {
  const section = useStore((s) => s.section);
  return (
    <nav className="rail" aria-label="Sections">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-label={s.label}
          title={s.label}
          aria-current={section === s.id ? "true" : undefined}
          onClick={(e) => {
            e.preventDefault();
            scrollToHash(`#${s.id}`);
          }}
        />
      ))}
    </nav>
  );
}
