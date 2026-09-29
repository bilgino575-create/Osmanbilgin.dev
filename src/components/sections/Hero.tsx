"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, ArrowUpRight, Mail, Sparkles as SparklesIcon } from "lucide-react";
import { SiReact, SiNextdotjs, SiTypescript } from "react-icons/si";
import { siteConfig, heroStats } from "@/lib/data";
import { scrollToSection } from "@/lib/utils";
import { useAppLoaded } from "@/lib/useAppLoaded";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import MagneticButton from "@/components/ui/MagneticButton";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
});

function RoleCycler({ titles }: { titles: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % titles.length);
    }, 2800);
    return () => clearInterval(id);
  }, [titles.length]);

  return (
    <span className="relative inline-flex h-[1.3em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={titles[index]}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-110%", opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block whitespace-nowrap text-gradient-static"
        >
          {titles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const floatingBadges = [
  { icon: SiReact, label: "React", className: "left-[6%] top-[22%]", depth: 60, delay: 0 },
  { icon: SiNextdotjs, label: "Next.js", className: "right-[8%] top-[30%]", depth: 100, delay: 1 },
  { icon: SiTypescript, label: "TypeScript", className: "left-[12%] bottom-[18%]", depth: 40, delay: 2 },
];

interface FloatingBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className: string;
  depth: number;
  delay: number;
  progress: MotionValue<number>;
  loaded: boolean;
}

function FloatingBadge({ icon: Icon, label, className, depth, delay, progress, loaded }: FloatingBadgeProps) {
  const y = useTransform(progress, [0, 1], [0, depth]);

  return (
    <motion.div
      style={{ y }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={loaded ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.8, delay: 0.6 + delay * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-none absolute z-10 hidden animate-float items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-xs text-secondary backdrop-blur-md lg:flex ${className}`}
    >
      <Icon className="h-4 w-4 text-accent" />
      {label}
    </motion.div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const loaded = useAppLoaded();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-32"
    >
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

      <motion.div
        style={{ y: sceneY, scale: sceneScale }}
        className="absolute inset-0"
      >
        <HeroScene />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_75%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />

      {floatingBadges.map((badge) => (
        <FloatingBadge key={badge.label} {...badge} progress={scrollYProgress} loaded={loaded} />
      ))}

      <motion.div
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-6 lg:px-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex items-center gap-3 self-start rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.35em] text-secondary"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-3 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-3" />
          </span>
          Available for new projects
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-2xl font-bold uppercase tracking-wide text-secondary sm:text-3xl md:text-4xl"
        >
          <span className="text-primary">/</span>
          <RoleCycler titles={siteConfig.titles} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl font-mono text-sm leading-relaxed text-muted sm:text-base"
        >
          <p>
            <span className="text-accent">{">"} </span>
            Building digital experiences without limits — enterprise software, AI
            systems and modern web applications engineered for scale.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={loaded ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <MagneticButton
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#work");
            }}
            cursorText="View"
            className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-primary px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-background"
          >
            <span className="relative z-10 flex items-center gap-2">
              View Projects
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </MagneticButton>

          <MagneticButton
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#contact");
            }}
            cursorText="Hire"
            className="group flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            Hire Me
            <SparklesIcon className="h-4 w-4" />
          </MagneticButton>

          <MagneticButton
            href={`mailto:${siteConfig.email}`}
            cursorText="Email"
            className="group flex items-center gap-2 px-3 py-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-secondary transition-colors duration-300 hover:text-primary"
          >
            <Mail className="h-4 w-4" />
            <span className="relative">
              Contact Me
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
            </span>
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={loaded ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8 sm:grid-cols-4"
        >
          {heroStats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="font-display text-3xl font-bold text-primary sm:text-4xl">
                {stat.isInfinity ? (
                  "∞"
                ) : (
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2.2} />
                )}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.button
        onClick={() => scrollToSection("#about")}
        initial={{ opacity: 0 }}
        animate={loaded ? { opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 1.4 }}
        data-cursor="hover"
        className="group absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-secondary transition-colors hover:text-accent"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/15 p-1.5 group-hover:border-accent">
          <motion.span
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-current"
          />
        </span>
        <ArrowDown className="h-3 w-3 opacity-0 sm:opacity-100" />
      </motion.button>
    </section>
  );
}
