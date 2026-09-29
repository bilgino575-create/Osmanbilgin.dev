"use client";

import { motion } from "framer-motion";
import { achievements } from "@/lib/data";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function Achievements() {
  return (
    <section className="relative py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="glass-strong relative overflow-hidden rounded-3xl px-6 py-14 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-accent-2/20 blur-[110px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-accent/15 blur-[110px]"
          />

          <div className="relative grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-4 sm:divide-x sm:divide-white/10">
            {achievements.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-3 text-center sm:px-4"
              >
                <item.icon className="h-6 w-6 text-accent sm:h-7 sm:w-7" />
                <span className="font-display text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
                  <AnimatedCounter value={item.value} suffix={item.suffix} duration={2.4} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted sm:text-xs">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
