"use client";

import { ArrowUp, Mail, Phone } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { siteConfig, navLinks } from "@/lib/data";
import { scrollToSection } from "@/lib/utils";
import Marquee from "@/components/ui/Marquee";
import MagneticButton from "@/components/ui/MagneticButton";

const marqueeRepeats = Array.from({ length: 4 });

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/5 pt-4">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

      <Marquee speed={38} className="border-y border-white/5 py-8 sm:py-12">
        {marqueeRepeats.map((_, i) => (
          <span
            key={i}
            className="mx-6 flex items-center gap-6 font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="text-stroke">Osman Bilgin</span>
            <span className="text-accent">✦</span>
          </span>
        ))}
      </Marquee>

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-2">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#home");
              }}
              data-cursor="hover"
              className="group flex w-fit items-center gap-3"
            >
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                <span className="absolute inset-0 rotate-45 rounded-md border border-accent/40 transition-transform duration-500 ease-out group-hover:rotate-[135deg] group-hover:border-accent" />
                <span className="font-display text-sm font-bold">OB</span>
              </span>
              <span className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                {siteConfig.name}
              </span>
            </a>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              {siteConfig.description}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs uppercase tracking-[0.35em] text-muted">
              Navigation
            </h4>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    data-cursor="hover"
                    className="text-sm text-secondary transition-colors duration-300 hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs uppercase tracking-[0.35em] text-muted">Connect</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  data-cursor="hover"
                  className="flex items-center gap-2 text-sm text-secondary transition-colors duration-300 hover:text-accent"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.phoneHref}
                  data-cursor="hover"
                  className="flex items-center gap-2 text-sm text-secondary transition-colors duration-300 hover:text-accent"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="hover"
                  className="flex items-center gap-2 text-sm text-secondary transition-colors duration-300 hover:text-accent"
                >
                  <SiInstagram className="h-3.5 w-3.5" />
                  {siteConfig.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 sm:flex-row">
          <p className="font-mono text-xs text-muted">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="font-mono text-xs text-muted">
            Built with Next.js, TypeScript &amp; Three.js
          </p>
          <MagneticButton
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#home");
            }}
            cursorText="Top"
            className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.25em] text-secondary transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" />
          </MagneticButton>
        </div>
      </div>
    </footer>
  );
}
