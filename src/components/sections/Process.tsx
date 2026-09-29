"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { processSteps } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Process() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.4"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.5,
  });

  return (
    <section id="process" className="section-glow relative py-28 lg:py-40">
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        <SectionHeading
          index="07"
          eyebrow="How I Work"
          title="DEVELOPMENT"
          accent="PROCESS"
          align="center"
          description="A transparent, repeatable workflow that takes a project from first conversation to long-term support — no surprises along the way."
        />

        <div ref={containerRef} className="relative mt-20 lg:mt-28">
          <div className="absolute left-7 top-2 bottom-2 w-px bg-white/10 sm:left-8" />
          <motion.div
            style={{ scaleY: progress }}
            className="absolute left-7 top-2 bottom-2 w-px origin-top bg-gradient-to-b from-accent via-accent-2 to-accent-3 sm:left-8"
          />

          <div className="flex flex-col gap-12 sm:gap-16">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex gap-6 sm:gap-8"
              >
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-surface text-accent sm:h-16 sm:w-16">
                  <step.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="font-mono text-xs uppercase tracking-[0.35em] text-muted">
                    Step {step.number}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-bold text-primary sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-xl leading-relaxed text-muted">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
