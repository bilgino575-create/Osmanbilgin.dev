"use client";

import { useEffect, useState } from "react";
import { navLinks, siteConfig } from "@/lib/data";
import { store, useStore } from "@/lib/store";
import { scrollToHash } from "@/lib/scroll";

export default function Nav() {
  const section = useStore((s) => s.section);
  const [open, setOpen] = useState(false);
  const active = `#${section === "end" ? "contact" : section === "skills" ? "services" : section}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!store.get().gl) return; // native anchor jump
    e.preventDefault();
    setOpen(false);
    scrollToHash(href);
  };

  return (
    <header className="nav">
      <div className="wrap flex items-center justify-between">
        <a href="#home" onClick={(e) => go(e, "#home")} className="nav-brand">
          <span aria-hidden="true" className="nav-mark">
            {siteConfig.initials}
          </span>
          <span className="hidden sm:inline">{siteConfig.name}</span>
          <span className="sr-only">, back to the top</span>
        </a>

        <nav className="nav-links hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => go(e, l.href)}
              aria-current={active === l.href ? "true" : undefined}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn hidden md:inline-flex"
            onClick={() => store.set({ paletteOpen: true })}
          >
            <span className="kbd" aria-hidden="true">⌘K</span> Search
            <span className="sr-only"> command palette (Ctrl or ⌘ + K)</span>
          </button>
          <a href="#contact" onClick={(e) => go(e, "#contact")} className="btn btn-solid">
            Hire me
          </a>
          <button
            type="button"
            className="btn !w-9 !px-0 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="grid gap-[4px]">
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-3 top-[calc(var(--nav-h)+6px)] z-50 rounded-2xl border border-line bg-[rgba(29,29,31,0.94)] p-2 backdrop-blur-xl lg:hidden"
      >
        <nav aria-label="Primary mobile" className="grid">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => go(e, l.href)}
              className="rounded-xl px-4 py-3 text-[17px] font-medium tracking-[-0.01em] text-text hover:bg-white/8"
              aria-current={active === l.href ? "true" : undefined}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
