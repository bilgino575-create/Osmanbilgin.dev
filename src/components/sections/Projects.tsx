"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { projects, type ProjectItem } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";

function ProjectRow({ project, index }: { project: ProjectItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const reverse = index % 2 === 1;
  const [from, to] = project.gradient;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
    >
      <TiltCard maxTilt={8} className={`rounded-3xl ${reverse ? "lg:order-2" : ""}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-surface">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{ background: `linear-gradient(135deg, ${from}26, ${to}26)` }}
          />
          <div
            aria-hidden
            className="absolute -left-10 -top-10 h-40 w-40 rounded-full blur-[80px]"
            style={{ background: `${from}55` }}
          />
          <div
            aria-hidden
            className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full blur-[90px]"
            style={{ background: `${to}55` }}
          />

          <motion.div
            style={{ y }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span
              aria-hidden
              className="select-none font-display text-[7rem] font-bold leading-none sm:text-[9rem]"
              style={{
                backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                opacity: 0.25,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </motion.div>

          <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-secondary backdrop-blur-md">
            {project.category}
          </div>
        </div>
      </TiltCard>

      <div className="flex flex-col gap-5">
        <span className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
          {String(index + 1).padStart(2, "0")} / {projects.length}
        </span>
        <h3 className="font-display text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
          {project.title}
        </h3>
        <p className="max-w-lg leading-relaxed text-muted">{project.description}</p>

        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] text-secondary"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-4">
          <a
            href={project.demo}
            data-cursor="hover"
            className="group flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-background transition-transform duration-300 hover:scale-[1.03]"
          >
            Live Demo
            <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href={project.github}
            data-cursor="hover"
            className="group flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            <SiGithub className="h-3.5 w-3.5" />
            Source
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <section id="work" className="relative py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          index="06"
          eyebrow="Featured Work"
          title="SELECTED"
          accent="PROJECTS"
          description="A look at the platforms, products and systems I've designed, built and shipped end-to-end."
        />

        <div className="mt-16 flex flex-col gap-24 lg:mt-28 lg:gap-32">
          {projects.map((project, i) => (
            <ProjectRow key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
