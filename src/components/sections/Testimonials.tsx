"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const current = testimonials[index];
  const initials = current.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <section className="relative py-28 lg:py-40">
      <div className="mx-auto max-w-4xl px-6 lg:px-12">
        <SectionHeading
          index="08"
          eyebrow="Testimonials"
          title="CLIENT"
          accent="FEEDBACK"
          align="center"
          description="Don't just take my word for it — here's what people I've worked with have to say."
        />

        <div className="relative mt-16 lg:mt-24">
          <Quote className="mx-auto h-10 w-10 text-accent/25" />

          <div className="relative mt-8 min-h-[260px] sm:min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col items-center text-center"
              >
                <p className="max-w-2xl font-display text-xl font-medium leading-relaxed text-primary sm:text-2xl">
                  &ldquo;{current.quote}&rdquo;
                </p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] font-display text-sm font-bold text-accent">
                    {initials}
                  </div>
                  <div>
                    <div className="font-display text-sm font-semibold text-primary">
                      {current.name}
                    </div>
                    <div className="font-mono text-xs text-muted">
                      {current.role} · {current.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6">
            <button
              onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
              data-cursor="hover"
              aria-label="Previous testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-secondary transition-colors duration-300 hover:border-accent hover:text-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setIndex(i)}
                  data-cursor="hover"
                  aria-label={`Show testimonial from ${t.name}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-accent" : "w-1.5 bg-white/15 hover:bg-white/30"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
              data-cursor="hover"
              aria-label="Next testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-secondary transition-colors duration-300 hover:border-accent hover:text-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
