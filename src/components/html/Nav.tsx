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
        <a
          href="#home"
          onClick={(e) => go(e, "#home")}
          className="mono flex items-center gap-3 text-[12px] tracking-[0.2em]"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-md border border-line-2 bg-black/40 text-[11px] font-medium text-cyan"
            style={{ borderColor: "var(--line-2)" }}
          >
            {siteConfig.initials}
          </span>
          <span className="hidden sm:inline">{siteConfig.url.replace("https://", "")}</span>
          <span className="sr-only">, back to the top</span>
        </a>

        <nav
          className="nav-links hidden items-center gap-0.5 rounded-full border border-line bg-black/40 p-1 backdrop-blur-md lg:flex"
          aria-label="Primary"
        >
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
            className="btn hidden !h-9 !px-3 md:inline-flex"
            onClick={() => store.set({ paletteOpen: true })}
            aria-label="Open command palette"
          >
            <span className="kbd">⌘K</span> run
          </button>
          <a href="#contact" onClick={(e) => go(e, "#contact")} className="btn !h-9 !px-4">
            Hire me
          </a>
          <button
            type="button"
            className="btn !h-9 !w-9 !px-0 lg:hidden"
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
        className="fixed inset-x-3 top-[calc(var(--nav-h)+4px)] z-50 rounded-2xl border border-line bg-[rgba(8,8,12,0.94)] p-3 backdrop-blur-xl lg:hidden"
      >
        <nav aria-label="Primary mobile" className="grid">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => go(e, l.href)}
              className="mono rounded-lg px-3 py-3 text-sm uppercase tracking-[0.18em] text-text-2 hover:bg-white/5 hover:text-text"
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
