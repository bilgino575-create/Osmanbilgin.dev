/**
 * Canvas 2D helpers shared by the OS windows. Fonts come from the CSS
 * variables next/font sets on <html>, so the OS uses the same self-hosted
 * faces as the document.
 */

export const OS = {
  W: 1536,
  H: 960,
  /** menu bar height (macOS-style, at the top) */
  TASKBAR: 30,
  /** dock height + margin reserved at the bottom */
  DOCK: 92,
  TITLE: 32,
  /** window corner radius in OS pixels */
  RADIUS: 11,
  /** window canvases are rendered at this multiple of OS pixels (1 on phones, set before the OS is created) */
  SCALE: 2,
};

/** Older browsers (Safari < 16, Chrome < 99) have no roundRect; draw one with arcs. */
export function polyfillCanvas() {
  if (typeof CanvasRenderingContext2D === "undefined") return;
  const proto = CanvasRenderingContext2D.prototype as CanvasRenderingContext2D & {
    roundRect?: (x: number, y: number, w: number, h: number, r?: number | number[]) => void;
  };
  if (typeof proto.roundRect === "function") return;
  proto.roundRect = function (x: number, y: number, w: number, h: number, r: number | number[] = 0) {
    const rr = Array.isArray(r) ? r : [r, r, r, r];
    const [tl, tr, br, bl] = [rr[0] ?? 0, rr[1] ?? rr[0] ?? 0, rr[2] ?? rr[0] ?? 0, rr[3] ?? rr[1] ?? rr[0] ?? 0];
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.arcTo(x + w, y, x + w, y + tr, tr);
    this.lineTo(x + w, y + h - br);
    this.arcTo(x + w, y + h, x + w - br, y + h, br);
    this.lineTo(x + bl, y + h);
    this.arcTo(x, y + h, x, y + h - bl, bl);
    this.lineTo(x, y + tl);
    this.arcTo(x, y, x + tl, y, tl);
    this.closePath();
  };
}

/** Apple system palette (dark). Keys keep their historical names so callers don't change. */
export const C = {
  bg: "#1c1c1e",
  bg2: "#1e1e20",
  panel: "#1e1e1e",
  panel2: "#2a2a2c",
  line: "rgba(255,255,255,0.08)",
  line2: "rgba(255,255,255,0.14)",
  text: "#f5f5f7",
  text2: "#a1a1a6",
  muted: "#6e6e73",
  cyan: "#64d2ff",
  violet: "#bf5af2",
  green: "#30d158",
  amber: "#ffd60a",
  red: "#ff453a",
  keyword: "#ff7b72",
  string: "#a5d6ff",
  number: "#79c0ff",
  type: "#ffa657",
  comment: "#8b949e",
  punct: "#c9d1d9",
  tag: "#7ee787",
};

let monoFamily = "'Geist Mono', ui-monospace, monospace";
let displayFamily = "Inter, -apple-system, system-ui, sans-serif";

export function resolveFonts() {
  if (typeof document === "undefined") return;
  const cs = getComputedStyle(document.documentElement);
  const m = cs.getPropertyValue("--font-mono").trim();
  const d = cs.getPropertyValue("--font-display").trim();
  if (m) monoFamily = m;
  if (d) displayFamily = d;
}

export function mono(size: number, weight = 400) {
  return `${weight} ${size}px ${monoFamily}`;
}
export function display(size: number, weight = 500) {
  return `${weight} ${size}px ${displayFamily}`;
}

const charW = new Map<string, number>();
export function charWidth(ctx: CanvasRenderingContext2D, font: string) {
  let w = charW.get(font);
  if (w === undefined) {
    ctx.font = font;
    w = ctx.measureText("M").width;
    charW.set(font, w);
  }
  return w;
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[]
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/** Word-wrap a string to a character width (mono fonts). */
export function wrap(text: string, cols: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    if (para.length <= cols) {
      out.push(para);
      continue;
    }
    let line = "";
    for (const word of para.split(" ")) {
      if ((line + " " + word).trim().length > cols) {
        out.push(line);
        line = word;
      } else {
        line = (line ? line + " " : "") + word;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

export function pad(s: string, n: number) {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}
