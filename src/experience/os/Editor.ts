import { C, charWidth, mono } from "./draw";
import { OsWindow, type OsPointer, type Rect } from "./Window";
import { SOURCES, GIT_HEAD, type SourceFile } from "./sources.generated";

type TokKind = "kw" | "str" | "num" | "cmt" | "type" | "punct" | "tag" | "id" | "attr" | "glsl";

interface Tok {
  t: string;
  k: TokKind;
}

const KEYWORDS = new Set(
  "import export from default const let var function return if else for while switch case break continue new class extends implements interface type enum async await try catch finally throw typeof instanceof in of as void null undefined true false this super readonly private public protected static declare abstract keyof satisfies uniform varying attribute precision highp mediump lowp float vec2 vec3 vec4 mat3 mat4 sampler2D int bool struct inout out discard".split(
    " "
  )
);

const COLOR: Record<TokKind, string> = {
  kw: C.keyword,
  str: C.string,
  num: C.number,
  cmt: C.comment,
  type: C.type,
  punct: C.punct,
  tag: C.tag,
  id: C.text,
  attr: C.violet,
  glsl: C.string,
};

/** A small, fast tokenizer good enough for TS/TSX/GLSL/CSS in a picture. */
export function tokenize(line: string, state: { block: boolean }): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const n = line.length;
  while (i < n) {
    if (state.block) {
      const end = line.indexOf("*/", i);
      if (end < 0) {
        out.push({ t: line.slice(i), k: "cmt" });
        return out;
      }
      out.push({ t: line.slice(i, end + 2), k: "cmt" });
      i = end + 2;
      state.block = false;
      continue;
    }
    const ch = line[i];
    if (ch === "/" && line[i + 1] === "/") {
      out.push({ t: line.slice(i), k: "cmt" });
      return out;
    }
    if (ch === "/" && line[i + 1] === "*") {
      const end = line.indexOf("*/", i + 2);
      if (end < 0) {
        out.push({ t: line.slice(i), k: "cmt" });
        state.block = true;
        return out;
      }
      out.push({ t: line.slice(i, end + 2), k: "cmt" });
      i = end + 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < n && line[j] !== ch) {
        if (line[j] === "\\") j++;
        j++;
      }
      out.push({ t: line.slice(i, j + 1), k: "str" });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(ch) && (i === 0 || !/[A-Za-z_]/.test(line[i - 1]))) {
      let j = i;
      while (j < n && /[0-9.xa-fA-F_]/.test(line[j])) j++;
      out.push({ t: line.slice(i, j), k: "num" });
      i = j;
      continue;
    }
    if (/[A-Za-z_$#@]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_$#@-]/.test(line[j])) j++;
      const w = line.slice(i, j);
      let k: TokKind = "id";
      if (KEYWORDS.has(w)) k = "kw";
      else if (/^[A-Z]/.test(w)) k = "type";
      else if (w.startsWith("#") || w.startsWith("@")) k = "kw";
      else if (line[i - 1] === "<" || line[i - 1] === "/") k = "tag";
      else if (line[j] === "=" && line[j + 1] !== "=" && line.slice(0, i).includes("<")) k = "attr";
      out.push({ t: w, k });
      i = j;
      continue;
    }
    if (/[{}()[\]<>=+\-*/%!&|^~?:;,.]/.test(ch)) {
      out.push({ t: ch, k: "punct" });
      i++;
      continue;
    }
    let j = i;
    while (j < n && !/[A-Za-z0-9_$"'`/{}()[\]<>=+\-*%!&|^~?:;,.#@]/.test(line[j])) j++;
    if (j === i) j++;
    out.push({ t: line.slice(i, j), k: "id" });
    i = j;
  }
  return out;
}

interface Doc {
  file: SourceFile;
  lines: Tok[][];
  /** per-line dominant colour for the minimap */
  mini: string[];
}

/**
 * A code editor that shows this site's own source: tabs, gutter, syntax
 * colours, a minimap and a status bar. Wheel scrolls; when nobody is reading
 * it drifts slowly so the screen is never static.
 */
export class Editor extends OsWindow {
  private docs: Doc[];
  private active = 0;
  private scroll = 0;
  private lastInteract = 0;
  private lastDrift = 0;
  private tabRects: Rect[] = [];

  constructor(rect: Rect) {
    super("editor", "site — src/lib/data.ts — Code", rect, C.violet);
    this.docs = SOURCES.map((f) => {
      const state = { block: false };
      const lines = f.text.split("\n").map((l) => tokenize(l, state));
      const mini = lines.map((toks) => {
        const first = toks.find((t) => t.t.trim());
        return first ? COLOR[first.k] : "transparent";
      });
      return { file: f, lines, mini };
    });
  }

  private get lineH() {
    return 19;
  }
  private get gutter() {
    return 54;
  }
  private get tabsH() {
    return 34;
  }
  private get statusH() {
    return 24;
  }
  private get miniW() {
    return 90;
  }
  private get visibleRows() {
    return Math.floor((this.body.h - this.tabsH - this.statusH) / this.lineH);
  }

  openPath(path: string) {
    const i = this.docs.findIndex((d) => d.file.path === path);
    if (i >= 0) this.setActive(i);
  }

  private setActive(i: number) {
    this.active = i;
    this.scroll = 0;
    this.title = `site — ${this.docs[i].file.path} — Code`;
    this.dirty = true;
  }

  pointer(e: OsPointer): boolean {
    if (e.kind === "wheel" && e.deltaY) {
      const doc = this.docs[this.active];
      const max = Math.max(0, doc.lines.length - this.visibleRows);
      this.scroll = Math.max(0, Math.min(max, this.scroll + Math.sign(e.deltaY) * 3));
      this.lastInteract = performance.now();
      this.dirty = true;
      return true;
    }
    if (e.kind === "down") {
      const y = e.y - this.body.y;
      if (y >= 0 && y < this.tabsH) {
        const i = this.tabRects.findIndex((r) => e.x >= r.x && e.x < r.x + r.w);
        if (i >= 0) {
          this.setActive(i);
          this.lastInteract = performance.now();
          return true;
        }
      }
      // minimap click → jump
      if (e.x > this.rect.w - this.miniW && y > this.tabsH) {
        const doc = this.docs[this.active];
        const frac = (y - this.tabsH) / (this.body.h - this.tabsH - this.statusH);
        this.scroll = Math.max(0, Math.min(doc.lines.length - this.visibleRows, Math.floor(frac * doc.lines.length)));
        this.lastInteract = performance.now();
        this.dirty = true;
        return true;
      }
    }
    return false;
  }

  key(e: KeyboardEvent): boolean {
    const doc = this.docs[this.active];
    const max = Math.max(0, doc.lines.length - this.visibleRows);
    const step =
      e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : e.key === "PageDown" ? this.visibleRows : e.key === "PageUp" ? -this.visibleRows : 0;
    if (step) {
      this.scroll = Math.max(0, Math.min(max, this.scroll + step));
      this.lastInteract = performance.now();
      this.dirty = true;
      return true;
    }
    if (e.key === "Tab" && e.ctrlKey) {
      this.setActive((this.active + 1) % this.docs.length);
      return true;
    }
    return false;
  }

  tick(now: number): boolean {
    // gentle reading drift when idle
    if (now - this.lastInteract > 6000 && now - this.lastDrift > 900) {
      this.lastDrift = now;
      const doc = this.docs[this.active];
      const max = Math.max(0, doc.lines.length - this.visibleRows);
      if (max === 0) return false;
      this.scroll = this.scroll >= max ? 0 : this.scroll + 1;
      this.dirty = true;
      return true;
    }
    return false;
  }

  drawBody(ctx: CanvasRenderingContext2D, body: Rect) {
    const doc = this.docs[this.active];
    const { lineH, gutter, tabsH, statusH, miniW } = this;
    ctx.fillStyle = "#0a0b10";
    ctx.fillRect(0, 0, body.w, body.h);

    // tabs
    ctx.fillStyle = "#0d0e15";
    ctx.fillRect(0, 0, body.w, tabsH);
    ctx.font = mono(11.5);
    ctx.textBaseline = "middle";
    let x = 0;
    this.tabRects = [];
    for (let i = 0; i < this.docs.length; i++) {
      const name = this.docs[i].file.path.split("/").pop()!;
      const w = ctx.measureText(name).width + 34;
      if (x + w > body.w - miniW && i !== this.active) {
        this.tabRects.push({ x: -1, y: 0, w: 0, h: 0 });
        continue;
      }
      const on = i === this.active;
      ctx.fillStyle = on ? "#0a0b10" : "transparent";
      ctx.fillRect(x, 0, w, tabsH);
      if (on) {
        ctx.fillStyle = C.violet;
        ctx.fillRect(x, 0, w, 1.5);
      }
      ctx.fillStyle = on ? C.text : C.muted;
      // file-type glyph
      ctx.fillStyle = name.endsWith(".ts") || name.endsWith(".tsx") ? C.type : name.endsWith(".mjs") ? C.amber : C.text2;
      ctx.fillText(name.endsWith("x") ? "⚛" : "TS", x + 10, tabsH / 2 + 1);
      ctx.fillStyle = on ? C.text : C.muted;
      ctx.fillText(name, x + 30 - (name.endsWith("x") ? 4 : 0), tabsH / 2 + 1);
      this.tabRects.push({ x, y: 0, w, h: tabsH });
      x += w;
    }
    ctx.fillStyle = C.line;
    ctx.fillRect(0, tabsH - 1, body.w, 1);

    // code
    const top = tabsH;
    const rows = this.visibleRows;
    const cw = charWidth(ctx, mono(12.5));
    ctx.font = mono(12.5);
    ctx.textBaseline = "top";
    const codeW = body.w - gutter - miniW;
    const maxCols = Math.floor((codeW - 8) / cw);
    for (let r = 0; r < rows; r++) {
      const li = this.scroll + r;
      if (li >= doc.lines.length) break;
      const y = top + r * lineH + 3;
      // current-line highlight on the middle row
      if (r === Math.floor(rows / 2)) {
        ctx.fillStyle = "rgba(255,255,255,0.025)";
        ctx.fillRect(0, y - 3, body.w - miniW, lineH);
      }
      ctx.fillStyle = r === Math.floor(rows / 2) ? C.text2 : C.muted;
      ctx.textAlign = "right";
      ctx.fillText(String(li + 1), gutter - 14, y);
      ctx.textAlign = "left";
      let cx = gutter;
      let cols = 0;
      for (const tok of doc.lines[li]) {
        if (cols >= maxCols) break;
        const t = tok.t.slice(0, maxCols - cols);
        ctx.fillStyle = COLOR[tok.k];
        ctx.fillText(t, cx, y);
        cx += t.length * cw;
        cols += t.length;
      }
    }
    // gutter line
    ctx.fillStyle = C.line;
    ctx.fillRect(gutter - 6, top, 1, body.h - top - statusH);

    // minimap
    const mx = body.w - miniW;
    ctx.fillStyle = "#0c0d13";
    ctx.fillRect(mx, top, miniW, body.h - top - statusH);
    const miniH = body.h - top - statusH;
    const scale = Math.min(2.2, miniH / Math.max(1, doc.lines.length));
    for (let li = 0; li < doc.lines.length; li++) {
      const toks = doc.lines[li];
      let px = mx + 6;
      const py = top + li * scale;
      for (const tok of toks) {
        const w = Math.max(1, tok.t.length * 0.9);
        if (tok.t.trim()) {
          ctx.fillStyle = COLOR[tok.k];
          ctx.globalAlpha = 0.55;
          ctx.fillRect(px, py, w, Math.max(1, scale - 0.6));
          ctx.globalAlpha = 1;
        }
        px += w;
        if (px > mx + miniW - 4) break;
      }
    }
    // viewport indicator
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(mx, top + this.scroll * scale, miniW, rows * scale);
    ctx.fillStyle = C.line;
    ctx.fillRect(mx, top, 1, miniH);

    // status bar
    const sy = body.h - statusH;
    ctx.fillStyle = "#12101c";
    ctx.fillRect(0, sy, body.w, statusH);
    ctx.fillStyle = C.violet;
    ctx.fillRect(0, sy, 6, statusH);
    ctx.font = mono(11);
    ctx.textBaseline = "middle";
    ctx.fillStyle = C.text2;
    const mid = this.scroll + Math.floor(rows / 2) + 1;
    ctx.fillText(`⎇ feat/root-access  ${GIT_HEAD}`, 16, sy + statusH / 2 + 1);
    ctx.textAlign = "right";
    const lang = doc.file.path.endsWith(".mjs") ? "JavaScript" : doc.file.path.endsWith(".tsx") ? "TypeScript JSX" : "TypeScript";
    ctx.fillText(`Ln ${mid}, Col 1   UTF-8   LF   ${lang}   ${doc.file.lines} lines${doc.file.clipped ? " (excerpt)" : ""}`, body.w - 12, sy + statusH / 2 + 1);
    ctx.textAlign = "left";
  }
}
