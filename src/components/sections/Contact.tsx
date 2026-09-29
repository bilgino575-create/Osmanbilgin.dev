"use client";

import { type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone, Send } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { siteConfig, budgetOptions } from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import MagneticButton from "@/components/ui/MagneticButton";

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 font-mono text-sm text-primary placeholder:text-muted/60 outline-none transition-colors duration-300 focus:border-accent/50 focus:bg-white/[0.04]";

const labelClass = "mb-2 block font-mono text-[11px] uppercase tracking-[0.3em] text-muted";

const contactLinks = [
  {
    icon: Mail,
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: siteConfig.phoneDisplay,
    href: siteConfig.phoneHref,
  },
  {
    icon: SiInstagram,
    label: "Instagram",
    value: siteConfig.instagram,
    href: siteConfig.instagramUrl,
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    budget: budgetOptions[0],
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const subject = `New Project Inquiry from ${form.name || "Website"}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Budget: ${form.budget}`,
      "",
      form.message,
    ].join("\n");

    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact" className="section-glow relative py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading
          index="09"
          eyebrow="Get In Touch"
          title="LET'S BUILD"
          accent="SOMETHING GREAT"
          description="Have a project in mind, or just want to say hi? Tell me about it — I read every message and reply within 24 hours."
        />

        <motion.a
          href={`mailto:${siteConfig.email}`}
          data-cursor="hover"
          data-cursor-text="Email"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="group mt-14 flex flex-wrap items-center gap-3 lg:mt-20"
        >
          <span className="font-display text-3xl font-bold leading-none tracking-tight text-primary transition-colors duration-500 group-hover:text-gradient-static break-all sm:text-5xl lg:text-6xl">
            {siteConfig.email}
          </span>
          <ArrowUpRight className="h-8 w-8 shrink-0 text-accent transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2 sm:h-12 sm:w-12" />
        </motion.a>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  Your Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@company.com"
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="budget" className={labelClass}>
                Project Budget
              </label>
              <select
                id="budget"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                className={`${fieldClass} appearance-none`}
              >
                {budgetOptions.map((option) => (
                  <option key={option} value={option} className="bg-surface text-primary">
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className={labelClass}>
                Project Details
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={form.message}
                onChange={handleChange}
                placeholder="Tell me about your project, timeline and goals..."
                className={`${fieldClass} resize-none`}
              />
            </div>

            <MagneticButton
              type="submit"
              cursorText="Send"
              className="group flex items-center justify-center gap-2 self-start rounded-full bg-primary px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-background"
            >
              Send Message
              <Send className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </MagneticButton>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.label === "Instagram" ? "_blank" : undefined}
                rel={link.label === "Instagram" ? "noopener noreferrer" : undefined}
                data-cursor="hover"
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors duration-300 hover:border-accent/30"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-accent transition-colors duration-300 group-hover:bg-accent/10">
                  <link.icon className="h-5 w-5" />
                </span>
                <span className="flex flex-col">
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
                    {link.label}
                  </span>
                  <span className="font-display text-base font-semibold text-primary">
                    {link.value}
                  </span>
                </span>
                <ArrowUpRight className="ml-auto h-4 w-4 text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" />
              </a>
            ))}

            <div className="glass mt-2 flex items-center gap-4 rounded-2xl p-5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-3 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-3" />
              </span>
              <div className="flex flex-col">
                <span className="font-display text-sm font-semibold text-primary">
                  Available for new projects
                </span>
                <span className="font-mono text-xs text-muted">
                  Currently accepting freelance &amp; full-time opportunities
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
