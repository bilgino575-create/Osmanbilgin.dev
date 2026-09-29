"use client";

import { motion, type Variants } from "framer-motion";

interface SectionHeadingProps {
  index?: string;
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

const wordVariants: Variants = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function SectionHeading({
  index,
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const words = title.split(" ");
  const accentWords = accent ? accent.split(" ") : [];
  const isCenter = align === "center";

  return (
    <div
      className={`flex flex-col ${isCenter ? "items-center text-center" : "items-start text-left"} ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.4em] text-accent"
      >
        {index && <span className="text-muted">{index}</span>}
        <span className="h-px w-8 bg-accent" />
        {eyebrow}
      </motion.div>
      <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
        <span className={`flex flex-wrap gap-x-4 ${isCenter ? "justify-center" : ""}`}>
          {words.map((word, i) => (
            <span key={`w-${i}`} className="overflow-hidden pb-2">
              <motion.span
                custom={i}
                variants={wordVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="inline-block"
              >
                {word}
              </motion.span>
            </span>
          ))}
        </span>
        {accentWords.length > 0 && (
          <span className={`flex flex-wrap gap-x-4 text-gradient-static ${isCenter ? "justify-center" : ""}`}>
            {accentWords.map((word, i) => (
              <span key={`a-${i}`} className="overflow-hidden pb-2">
                <motion.span
                  custom={words.length + i}
                  variants={wordVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
        )}
      </h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`mt-6 max-w-xl text-base text-secondary sm:text-lg ${isCenter ? "mx-auto" : ""}`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
