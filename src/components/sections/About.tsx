"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SiTypescript } from "react-icons/si";
import { siteConfig, aboutHighlights } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import RevealText from "@/components/ui/RevealText";
import TiltCard from "@/components/ui/TiltCard";

type TokenType = "keyword" | "key" | "string" | "punct" | "value" | "comment";

const tokenClass: Record<TokenType, string> = {
  keyword: "text-accent-2",
  key: "text-accent",
  string: "text-accent-3",
  punct: "text-muted",
  value: "text-accent-2",
  comment: "text-muted/50 italic",
};

interface CodeToken {
  text: string;
  type: TokenType;
}

interface CodeLine {
  indent: number;
  tokens: CodeToken[];
}

const codeLines: CodeLine[] = [
  { indent: 0, tokens: [{ text: "const", type: "keyword" }, { text: " developer ", type: "punct" }, { text: "=", type: "punct" }, { text: " {", type: "punct" }] },
  { indent: 1, tokens: [{ text: "name", type: "key" }, { text: ": ", type: "punct" }, { text: "'Osman Bilgin'", type: "string" }, { text: ",", type: "punct" }] },
  { indent: 1, tokens: [{ text: "role", type: "key" }, { text: ": ", type: "punct" }, { text: "'Full Stack Developer'", type: "string" }, { text: ",", type: "punct" }] },
  { indent: 1, tokens: [{ text: "focus", type: "key" }, { text: ": [", type: "punct" }, { text: "'Web'", type: "string" }, { text: ", ", type: "punct" }, { text: "'AI'", type: "string" }, { text: ", ", type: "punct" }, { text: "'SaaS'", type: "string" }, { text: ", ", type: "punct" }, { text: "'Mobile'", type: "string" }, { text: "],", type: "punct" }] },
  { indent: 1, tokens: [{ text: "projects", type: "key" }, { text: ": ", type: "punct" }, { text: "100", type: "value" }, { text: ",", type: "punct" }, { text: " // and counting", type: "comment" }] },
  { indent: 1, tokens: [{ text: "technologies", type: "key" }, { text: ": ", type: "punct" }, { text: "30", type: "value" }, { text: ",", type: "punct" }] },
  { indent: 1, tokens: [{ text: "remote", type: "key" }, { text: ": ", type: "punct" }, { text: "true", type: "value" }, { text: ",", type: "punct" }] },
  { indent: 1, tokens: [{ text: "hireable", type: "key" }, { text: ": ", type: "punct" }, { text: "true", type: "value" }] },
  { indent: 0, tokens: [{ text: "};", type: "punct" }] },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [22, 0, -22]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, -6]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const glowRotate = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section ref={sectionRef} id="about" className="section-glow relative py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          index="01"
          eyebrow="About Me"
          title="BEYOND JUST"
          accent="WRITING CODE"
          description={siteConfig.description}
        />

        <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-8">
            <RevealText as="p" className="text-lg leading-relaxed text-secondary sm:text-xl">
              I&apos;m <span className="text-primary">Osman Bilgin</span> — a developer who
              turns ambitious ideas into fast, reliable, production-grade software. My work
              spans full stack web platforms, AI-driven systems and cloud-native
              infrastructure, always built with the same obsession for craft.
            </RevealText>

            <RevealText as="p" delay={0.1} className="leading-relaxed text-muted">
              Every project starts with the same question:{" "}
              <span className="text-primary">how do we build this right?</span> Clean
              architecture, type-safe code, intentional UX and performance budgets aren&apos;t
              extras — they&apos;re the baseline. Whether it&apos;s a SaaS platform, an
              enterprise dashboard or an AI-powered product, I own the full pipeline from
              first commit to production deploy.
            </RevealText>

            <div className="grid gap-4 sm:grid-cols-2">
              {aboutHighlights.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  <TiltCard className="h-full rounded-2xl" maxTilt={6}>
                    <div className="glass flex h-full flex-col gap-4 rounded-2xl p-6 transition-colors duration-300 hover:border-accent/30">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-accent">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-base font-semibold text-primary">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted">{item.description}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center py-10 lg:py-0">
            <motion.div
              aria-hidden
              style={{ rotate: glowRotate }}
              className="pointer-events-none absolute -inset-10 -z-10"
            >
              <div className="absolute -left-6 top-0 h-56 w-56 rounded-full bg-accent-2/25 blur-[100px]" />
              <div className="absolute -right-6 bottom-0 h-64 w-64 rounded-full bg-accent/20 blur-[100px]" />
            </motion.div>

            <div className="perspective-1000 w-full max-w-md">
              <motion.div style={{ rotateX, rotateY, y: cardY }} className="preserve-3d">
                <TiltCard maxTilt={10} className="rounded-2xl">
                  <div className="glass-strong overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
                    <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-4 py-3">
                      <span className="h-3 w-3 rounded-full bg-[#ff5f57]/70" />
                      <span className="h-3 w-3 rounded-full bg-[#febc2e]/70" />
                      <span className="h-3 w-3 rounded-full bg-[#28c840]/70" />
                      <span className="ml-3 flex items-center gap-1.5 font-mono text-xs text-muted">
                        <SiTypescript className="h-3.5 w-3.5 text-[#3178c6]" />
                        developer.ts
                      </span>
                    </div>

                    <div className="flex p-5 font-mono text-[13px] leading-relaxed sm:text-sm">
                      <div className="mr-4 flex select-none flex-col items-end text-muted/30">
                        {codeLines.map((_, i) => (
                          <span key={i}>{i + 1}</span>
                        ))}
                        <span>{codeLines.length + 1}</span>
                      </div>
                      <div className="flex flex-col">
                        {codeLines.map((line, i) => (
                          <div key={i} style={{ paddingLeft: `${line.indent * 1.25}rem` }}>
                            {line.tokens.map((token, j) => (
                              <span key={j} className={tokenClass[token.type]}>
                                {token.text}
                              </span>
                            ))}
                          </div>
                        ))}
                        <div className="mt-2 flex items-center gap-2 text-muted/60">
                          <span className="text-accent-3">console</span>
                          <span className="text-muted">.</span>
                          <span className="text-accent">log</span>
                          <span className="text-muted">(</span>
                          <span>developer.hireable</span>
                          <span className="text-muted">);</span>
                        </div>
                        <div className="text-muted/50">
                          <span className="text-muted/30">// →</span>{" "}
                          <span className="text-accent-3">true</span>
                          <span className="ml-1 animate-blink text-accent">_</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
