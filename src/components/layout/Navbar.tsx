"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Menu, X, ArrowUpRight, Mail, Phone } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { navLinks, siteConfig } from "@/lib/data";
import { scrollToSection } from "@/lib/utils";
import { useAppLoaded } from "@/lib/useAppLoaded";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("#home");
  const loaded = useAppLoaded();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) {
      window.__lenis?.stop();
    } else {
      window.__lenis?.start();
    }
  }, [menuOpen]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToSection(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: -120, opacity: 0 }}
        animate={loaded ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled || menuOpen ? "glass-strong" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "#home")}
            className="group flex items-center gap-3"
            data-cursor="hover"
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
              <span className="absolute inset-0 rotate-45 rounded-md border border-accent/40 transition-transform duration-500 ease-out group-hover:rotate-[135deg] group-hover:border-accent" />
              <span className="font-display text-sm font-bold">OB</span>
            </span>
            <span className="hidden font-display text-sm font-semibold uppercase tracking-[0.3em] sm:block">
              {siteConfig.name}
            </span>
          </a>

          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1.5 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-cursor="hover"
                onClick={(e) => handleNavClick(e, link.href)}
                className={`relative rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                  active === link.href
                    ? "text-background"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {active === link.href && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              data-cursor="hover"
              className="hidden items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-primary transition-colors duration-300 hover:border-accent hover:text-accent sm:flex"
            >
              Hire Me
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="relative z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-primary lg:hidden"
              data-cursor="hover"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    <Menu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 2.5rem) 2.5rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 2.5rem) 2.5rem)" }}
            transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-background px-8 grid-bg lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className={`font-display text-5xl font-bold uppercase tracking-tight transition-colors sm:text-6xl ${
                    active === link.href ? "text-gradient-static" : "text-primary"
                  }`}
                  data-cursor="hover"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 font-mono text-sm text-secondary"
            >
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 transition-colors hover:text-accent" data-cursor="hover">
                <Mail className="h-4 w-4" /> {siteConfig.email}
              </a>
              <a href={siteConfig.phoneHref} className="flex items-center gap-3 transition-colors hover:text-accent" data-cursor="hover">
                <Phone className="h-4 w-4" /> {siteConfig.phoneDisplay}
              </a>
              <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-colors hover:text-accent" data-cursor="hover">
                <SiInstagram className="h-4 w-4" /> {siteConfig.instagram}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
