"use client";

import { motion } from "framer-motion";
import { techCategories, type TechItem } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import Marquee from "@/components/ui/Marquee";

function TechPill({ item }: { item: TechItem }) {
  return (
    <div className="mx-2 flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.02] px-5 py-2.5 font-mono text-sm text-secondary transition-colors duration-300 hover:border-white/20 hover:text-primary">
      <item.icon className="h-4 w-4 shrink-0" style={{ color: item.color }} />
      {item.name}
    </div>
  );
}

export default function TechUniverse() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          index="03"
          eyebrow="Tech Universe"
          title="THE FULL"
          accent="ECOSYSTEM"
          description="Frameworks, databases, infrastructure and AI tooling — the complete toolkit behind every product I ship."
        />
      </div>

      <div className="mt-16 flex flex-col gap-10 lg:mt-24 lg:gap-14">
        {techCategories.map((category, i) => (
          <div key={category.id} className="flex flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto flex w-full max-w-7xl flex-wrap items-baseline gap-x-4 gap-y-1 px-6 lg:px-12"
            >
              <span className="flex items-center gap-2 font-display text-lg font-semibold text-primary sm:text-xl">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: category.accent }}
                />
                {category.label}
              </span>
              <span className="text-sm text-muted">{category.description}</span>
            </motion.div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent sm:w-32" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent sm:w-32" />
              <Marquee reverse={i % 2 === 1} speed={category.items.length * 3.2}>
                {category.items.map((item) => (
                  <TechPill key={item.name} item={item} />
                ))}
              </Marquee>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
