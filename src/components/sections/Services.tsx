"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";
import { scrollToSection } from "@/lib/utils";

export default function Services() {
  return (
    <section id="services" className="section-glow relative py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          index="05"
          eyebrow="Services"
          title="WHAT I CAN"
          accent="BUILD FOR YOU"
          description="From a single landing page to a full enterprise platform — end-to-end engineering across every layer of the stack."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: (i % 3) * 0.08 + Math.floor(i / 3) * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-full"
            >
              <TiltCard maxTilt={6} className="h-full rounded-2xl">
                <button
                  onClick={() => scrollToSection("#contact")}
                  data-cursor="hover"
                  className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 text-left transition-colors duration-300 hover:border-accent/30"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 -top-6 select-none font-display text-7xl font-bold text-white/[0.025] transition-colors duration-300 group-hover:text-accent/[0.06] sm:text-8xl"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-accent transition-all duration-300 group-hover:border-accent/40 group-hover:bg-accent/10">
                      <service.icon className="h-5 w-5" />
                    </div>

                    <h3 className="font-display text-lg font-semibold text-primary sm:text-xl">
                      {service.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                      {service.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-secondary transition-colors duration-300 group-hover:text-accent">
                      Get Started
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>
                </button>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
