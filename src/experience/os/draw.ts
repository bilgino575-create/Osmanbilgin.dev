/**
 * Canvas 2D helpers shared by the OS windows. Fonts come from the CSS
 * variables next/font sets on <html>, so the OS uses the same self-hosted
 * faces as the document.
 */

export const OS = {
  W: 1536,
  H: 960,
  TASKBAR: 36,
  TITLE: 32,
  /** window canvases are rendered at this multiple of OS pixels */
  SCALE: 2,
};

export const C = {
  bg: "#07070b",
  bg2: "#0b0c12",
  panel: "#0e0f16",
  panel2: "#12131b",
  line: "rgba(255,255,255,0.09)",
  line2: "rgba(255,255,255,0.16)",
  text: "#e8e8ec",
  text2: "#a7a7b2",
  muted: "#63636e",
  cyan: "#00f5ff",
  violet: "#a78bfa",
  green: "#00ff88",
  amber: "#ffb648",
  red: "#ff5c5c",
  keyword: "#c792ea",
  string: "#8fe388",
  number: "#f78c6c",
  type: "#82aaff",
  comment: "#5c6370",
  punct: "#89ddff",
  tag: "#7fdbff",
};

let monoFamily = "'Geist Mono', ui-monospace, monospace";
let displayFamily = "'Space Grotesk', system-ui, sans-serif";

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
  r: number
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
