"use client";

import { motion } from "framer-motion";
import { languages } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";

export default function TechStack() {
  return (
    <section id="stack" className="relative py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          index="02"
          eyebrow="Tech Stack"
          title="LANGUAGES I"
          accent="SPEAK FLUENTLY"
          description="Fifteen programming languages spanning web, systems, mobile and data — picking the right tool for every problem, never forcing one."
        />

        <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:mt-24 lg:grid-cols-5 lg:gap-4">
          {languages.map((lang, i) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, y: 32, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: (i % 5) * 0.07 + Math.floor(i / 5) * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <TiltCard maxTilt={16} className="aspect-square rounded-2xl">
                <div className="group relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors duration-300 hover:border-white/20">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${lang.color}33, transparent 70%)`,
                    }}
                  />
                  <lang.icon
                    className="relative z-10 h-9 w-9 transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10"
                    style={{ color: lang.color }}
                  />
                  <span className="relative z-10 font-mono text-[11px] uppercase tracking-wider text-secondary sm:text-xs">
                    {lang.name}
                  </span>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
