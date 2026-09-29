"use client";

import { motion } from "framer-motion";
import {
  Server,
  Code2,
  Monitor,
  Database,
  BrainCircuit,
  Cloud,
  Smartphone,
  Palette,
  Boxes,
  type LucideIcon,
} from "lucide-react";
import { skillLevels } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const categoryIcons: Record<string, LucideIcon> = {
  Backend: Server,
  Language: Code2,
  Frontend: Monitor,
  Data: Database,
  AI: BrainCircuit,
  Infrastructure: Cloud,
  Mobile: Smartphone,
  Design: Palette,
  Architecture: Boxes,
};

const accentCycle = ["var(--color-accent)", "var(--color-accent-2)", "var(--color-accent-3)"];

export default function Skills() {
  return (
    <section className="relative py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          index="04"
          eyebrow="Expertise"
          title="SKILL"
          accent="PROFICIENCY"
          description="A decade-spanning toolkit, distilled into the disciplines I rely on most when turning a brief into a shipped product."
        />

        <div className="mt-16 grid gap-x-16 gap-y-10 sm:grid-cols-2 lg:mt-24">
          {skillLevels.map((skill, i) => {
            const Icon = categoryIcons[skill.category] ?? Code2;
            const accent = accentCycle[i % accentCycle.length];

            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (i % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]"
                      style={{ color: accent }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-display text-sm font-semibold text-primary sm:text-base">
                        {skill.name}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
                        {skill.category}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xl font-bold text-primary sm:text-2xl">
                    <AnimatedCounter value={skill.level} suffix="%" duration={1.6} />
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: skill.level / 100 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 1.4, delay: (i % 2) * 0.1 + 0.15, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      transformOrigin: "left",
                      background: `linear-gradient(90deg, ${accent}, var(--color-accent-2))`,
                    }}
                    className="h-full rounded-full"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
