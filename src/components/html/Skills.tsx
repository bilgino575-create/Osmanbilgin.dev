import type { CSSProperties } from "react";
import { skillLevels } from "@/lib/data";
import { Section } from "./Track";

export default function Skills() {
  return (
    <Section id="skills" align="right">
      <div className="wrap">
        <div className="glass ml-auto max-w-[44rem] p-6 sm:p-9">
          <p className="eyebrow mb-4">
            <b>sensors</b> --skills
          </p>
          <h2 id="skills-title" className="display h2">
            Instrument readout.
          </h2>
          <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {skillLevels.map((s) => (
              <li key={s.name}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-medium">{s.name}</h3>
                  <span className="mono num text-xs text-cyan">
                    {s.level}
                    <span className="text-muted">/100</span>
                  </span>
                </div>
                <div
                  className="meter"
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={s.level}
                  aria-label={`${s.name} proficiency`}
                  style={{ "--w": `${s.level}%` } as CSSProperties}
                >
                  <span />
                </div>
                <p className="eyebrow mt-1 !text-[10px] !tracking-[0.14em]">{s.category}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
