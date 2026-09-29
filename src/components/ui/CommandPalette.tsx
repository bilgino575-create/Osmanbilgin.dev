"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SECTIONS, ACTS } from "@/lib/acts";
import { store, useStore } from "@/lib/store";
import { scrollToHash, scrollToProgress } from "@/lib/scroll";
import { audio } from "@/lib/audio";

interface Command {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

/**
 * Command palette on `~` or Ctrl/⌘+K. Every command is also reachable by
 * mouse, and the list is a proper listbox for screen readers.
 */
export default function CommandPalette() {
  const open = useStore((s) => s.paletteOpen);
  useHotkeys();
  if (!open) return null;
  return <Palette />;
}

function useHotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        store.set({ paletteOpen: !store.get().paletteOpen });
      } else if (e.key === "`" && !typing && !store.get().paletteOpen) {
        e.preventDefault();
        store.set({ paletteOpen: true });
      } else if (e.key === "Escape" && store.get().paletteOpen) {
        store.set({ paletteOpen: false });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function Palette() {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const goto = SECTIONS.filter((s) => s.id !== "end").map<Command>((s) => ({
      id: `go-${s.id}`,
      label: `go ${s.label.toLowerCase()}`,
      hint: `#${s.id}`,
      run: () => scrollToHash(`#${s.id}`),
    }));
    const acts = ACTS.map<Command>((a) => ({
      id: `act-${a.id}`,
      label: `camera → act ${a.label.toLowerCase()}`,
      hint: `p=${a.start.toFixed(2)}`,
      run: () => scrollToProgress(a.start + 0.015),
    }));
    return [
      ...goto,
      ...acts,
      {
        id: "sound",
        label: "toggle ambient sound",
        hint: "rain + keys",
        run: () => {
          audio.toggle().then((on) => store.set({ sound: on }));
        },
      },
      {
        id: "debug",
        label: "toggle devtools hud",
        hint: "D",
        run: () => store.set({ debug: !store.get().debug }),
      },
      {
        id: "top",
        label: "reboot (back to desk)",
        hint: "#home",
        run: () => scrollToHash("#home"),
      },
      {
        id: "mail",
        label: "mail hello@osmanbilgin.dev",
        hint: "mailto",
        run: () => {
          window.location.href = "mailto:osman_002001@hotmail.com";
        },
      },
    ];
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands;
    return commands.filter((c) => c.label.includes(s) || c.hint.includes(s));
  }, [q, commands]);


  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  const run = (c: Command) => {
    store.set({ paletteOpen: false });
    c.run();
  };

  return (
    <div
      className="palette-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && store.set({ paletteOpen: false })}
    >
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setIdx(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setIdx((i) => Math.min(filtered.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setIdx((i) => Math.max(0, i - 1));
            } else if (e.key === "Enter" && filtered[idx]) {
              run(filtered[idx]);
            }
          }}
          placeholder="type a command · go work · toggle sound · act iii"
          aria-label="Command"
          aria-controls="palette-list"
          aria-activedescendant={filtered[idx] ? `cmd-${filtered[idx].id}` : undefined}
          role="combobox"
          aria-expanded="true"
          autoComplete="off"
          spellCheck={false}
        />
        <ul id="palette-list" role="listbox" aria-label="Commands">
          {filtered.length === 0 && (
            <li className="mono p-3 text-xs text-muted">command not found</li>
          )}
          {filtered.map((c, i) => (
            <li key={c.id} role="none">
              <button
                type="button"
                id={`cmd-${c.id}`}
                role="option"
                aria-selected={i === idx}
                onMouseEnter={() => setIdx(i)}
                onClick={() => run(c)}
              >
                <span>
                  <span className="text-cyan">$</span> {c.label}
                </span>
                <span className="text-muted">{c.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
