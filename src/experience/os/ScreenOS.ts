import { C, OS, display, makeCanvas, mono, resolveFonts, roundRect } from "./draw";
import type { OsWindow, OsPointer, PointerKind } from "./Window";
import { Terminal, type TerminalHost } from "./Terminal";
import { Editor } from "./Editor";
import { Explorer } from "./Explorer";
import { siteConfig } from "@/lib/data";
import type { BootLine } from "@/lib/store";

export type OsPhase = "off" | "post" | "kernel" | "login" | "desktop";

/**
 * The desktop OS. Owns the windows, the wallpaper/taskbar layer and the
 * composite canvas that the Act I monitor displays. Each window's own canvas
 * is also used directly as a texture in Act II.
 *
 * Boot is driven by real events pushed in via `bootLog`, never by a timer
 * pretending to load something.
 */
export class ScreenOS {
  readonly composite: HTMLCanvasElement;
  private cctx: CanvasRenderingContext2D;
  readonly backdrop: HTMLCanvasElement;
  private bctx: CanvasRenderingContext2D;
  readonly terminal: Terminal;
  readonly editor: Editor;
  readonly explorer: Explorer;
  readonly windows: OsWindow[];
  phase: OsPhase = "off";
  /** true when the composite texture must be re-uploaded */
  compositeDirty = true;
  backdropDirty = true;
  private bootLines: BootLine[] = [];
  private phaseStart = 0;
  private lastClock = "";
  private booted = false;
  private focus: OsWindow | null = null;
  private hoverWin: OsWindow | null = null;
  /** average screen colour (linear-ish 0..1), for light bleed */
  readonly avg = { r: 0.02, g: 0.03, b: 0.04 };
  private avgCanvas = makeCanvas(4, 4);
  private avgCtx = this.avgCanvas.getContext("2d", { willReadFrequently: true })!;
  private lastAvg = 0;

  constructor(host: TerminalHost & { onProject(slug: string | null): void }) {
    resolveFonts();
    this.composite = makeCanvas(OS.W, OS.H);
    this.cctx = this.composite.getContext("2d", { alpha: false })!;
    this.backdrop = makeCanvas(OS.W, OS.H);
    this.bctx = this.backdrop.getContext("2d", { alpha: false })!;
    this.terminal = new Terminal({ x: 36, y: 60, w: 640, h: 520 }, host);
    this.editor = new Editor({ x: 700, y: 60, w: 800, h: 620 });
    this.explorer = new Explorer({ x: 36, y: 604, w: 640, h: 320 }, (slug) => host.onProject(slug));
    this.windows = [this.terminal, this.editor, this.explorer];
    this.setFocus(this.terminal);
    this.phaseStart = performance.now();
    this.phase = "post";
    document.fonts?.ready.then(() => {
      resolveFonts();
      this.windows.forEach((w) => (w.dirty = true));
      this.backdropDirty = true;
      this.compositeDirty = true;
    });
  }

  /** feed the real boot log; the screen mirrors it */
  bootLog(lines: BootLine[], booted: boolean) {
    if (lines.length !== this.bootLines.length || booted !== this.booted) {
      this.bootLines = lines;
      this.booted = booted;
      this.compositeDirty = true;
      if (booted && this.phase !== "desktop") {
        this.phase = "login";
        this.phaseStart = performance.now();
      }
    }
  }

  get focused() {
    return this.focus;
  }

  setFocus(w: OsWindow | null) {
    if (this.focus === w) return;
    if (this.focus) {
      this.focus.focused = false;
      this.focus.dirty = true;
    }
    this.focus = w;
    if (w) {
      w.focused = true;
      w.dirty = true;
      // bring to front
      const i = this.windows.indexOf(w);
      if (i >= 0) {
        this.windows.splice(i, 1);
        this.windows.push(w);
      }
    }
    this.backdropDirty = true;
    this.compositeDirty = true;
  }

  windowAt(x: number, y: number): OsWindow | null {
    for (let i = this.windows.length - 1; i >= 0; i--) {
      const w = this.windows[i];
      const r = w.rect;
      if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return w;
    }
    return null;
  }

  /** Pointer in composite OS coordinates (Act I monitor). */
  pointer(kind: PointerKind, x: number, y: number, deltaY = 0) {
    if (this.phase !== "desktop") return;
    const w = kind === "leave" ? null : this.windowAt(x, y);
    if (this.hoverWin && this.hoverWin !== w) {
      this.hoverWin.pointer({ kind: "leave", x: 0, y: 0 });
      this.hoverWin.hover = false;
      this.hoverWin = null;
    }
    if (!w) return;
    this.hoverWin = w;
    w.hover = true;
    if (kind === "down") this.setFocus(w);
    this.pointerInWindow(w, { kind, x: x - w.rect.x, y: y - w.rect.y, deltaY });
  }

  /** Pointer in a specific window's local coordinates (Act II meshes). */
  pointerInWindow(w: OsWindow, e: OsPointer) {
    if (this.phase !== "desktop") return;
    if (e.kind === "down") this.setFocus(w);
    if (w.pointer(e)) this.compositeDirty = true;
  }

  key(e: KeyboardEvent): boolean {
    if (this.phase !== "desktop") return false;
    if (e.altKey && e.key === "Tab") {
      const i = this.windows.indexOf(this.focus!);
      this.setFocus(this.windows[(i + 1) % this.windows.length]);
      return true;
    }
    const handled = this.focus?.key(e) ?? false;
    if (handled) this.compositeDirty = true;
    return handled;
  }

  /** Advance animations and redraw whatever is dirty. Returns true if the composite changed. */
  update(now: number): boolean {
    if (this.phase === "login" && now - this.phaseStart > 900) {
      this.phase = "desktop";
      this.backdropDirty = true;
      this.compositeDirty = true;
      this.windows.forEach((w) => (w.dirty = true));
    }
    if (this.phase === "post" && now - this.phaseStart > 1400) {
      this.phase = "kernel";
      this.compositeDirty = true;
    }
    if (this.phase === "post" || this.phase === "kernel") {
      // the boot screen animates with the real log; redraw at 10 Hz for the cursor
      if (Math.floor(now / 100) !== Math.floor((now - 16) / 100)) this.compositeDirty = true;
    }

    if (this.phase === "desktop") {
      for (const w of this.windows) {
        if (w.tick(now)) w.dirty = true;
        if (w.render(now)) this.compositeDirty = true;
      }
      const clock = this.clock();
      if (clock !== this.lastClock) {
        this.lastClock = clock;
        this.backdropDirty = true;
        this.compositeDirty = true;
      }
      if (this.backdropDirty) this.drawBackdrop();
    }

    if (!this.compositeDirty) return false;
    this.compositeDirty = false;
    this.drawComposite(now);
    if (now - this.lastAvg > 250) {
      this.lastAvg = now;
      this.sampleAverage();
    }
    return true;
  }

  private clock() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  private sampleAverage() {
    const c = this.avgCtx;
    c.drawImage(this.composite, 0, 0, 4, 4);
    const d = c.getImageData(0, 0, 4, 4).data;
    let r = 0,
      g = 0,
      b = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i];
      g += d[i + 1];
      b += d[i + 2];
    }
    const n = d.length / 4 * 255;
    this.avg.r = r / n;
    this.avg.g = g / n;
    this.avg.b = b / n;
  }

  // ---------- drawing ----------

  private drawBackdrop() {
    this.backdropDirty = false;
    const ctx = this.bctx;
    const { W, H, TASKBAR } = OS;
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#07070c");
    g.addColorStop(1, "#0b0b14");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // soft glows
    const r1 = ctx.createRadialGradient(W * 0.85, H * 0.9, 0, W * 0.85, H * 0.9, W * 0.55);
    r1.addColorStop(0, "rgba(124,58,237,0.22)");
    r1.addColorStop(1, "rgba(124,58,237,0)");
    ctx.fillStyle = r1;
    ctx.fillRect(0, 0, W, H);
    const r2 = ctx.createRadialGradient(W * 0.1, H * 0.1, 0, W * 0.1, H * 0.1, W * 0.5);
    r2.addColorStop(0, "rgba(0,245,255,0.12)");
    r2.addColorStop(1, "rgba(0,245,255,0)");
    ctx.fillStyle = r2;
    ctx.fillRect(0, 0, W, H);
    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 48) {
      ctx.moveTo(x + 0.5, TASKBAR);
      ctx.lineTo(x + 0.5, H);
    }
    for (let y = TASKBAR; y <= H; y += 48) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
    }
    ctx.stroke();
    // watermark
    ctx.font = display(150, 700);
    ctx.fillStyle = "rgba(255,255,255,0.028)";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("ROOT ACCESS", W * 0.45, H * 0.88);

    // taskbar
    ctx.fillStyle = "rgba(10,10,16,0.92)";
    ctx.fillRect(0, 0, W, TASKBAR);
    ctx.fillStyle = C.line;
    ctx.fillRect(0, TASKBAR - 1, W, 1);
    ctx.textBaseline = "middle";
    ctx.font = mono(13, 500);
    ctx.fillStyle = C.cyan;
    ctx.fillText("◆", 18, TASKBAR / 2 + 1);
    ctx.fillStyle = C.text;
    ctx.fillText("osbOS", 38, TASKBAR / 2 + 1);
    let x = 120;
    ctx.font = mono(12);
    for (const w of [this.terminal, this.editor, this.explorer]) {
      const label = w.id;
      const tw = ctx.measureText(label).width + 26;
      if (w.focused) {
        roundRect(ctx, x - 8, 6, tw, TASKBAR - 12, 6);
        ctx.fillStyle = "rgba(255,255,255,0.07)";
        ctx.fill();
      }
      ctx.fillStyle = w.focused ? w.accent : C.text2;
      ctx.fillText("●", x, TASKBAR / 2 + 1);
      ctx.fillStyle = w.focused ? C.text : C.text2;
      ctx.fillText(label, x + 14, TASKBAR / 2 + 1);
      x += tw + 12;
    }
    ctx.textAlign = "right";
    ctx.fillStyle = C.text2;
    ctx.fillText(`${siteConfig.handle}   ${this.clock()}`, W - 18, TASKBAR / 2 + 1);
    ctx.fillStyle = C.green;
    ctx.fillText("● online", W - 190, TASKBAR / 2 + 1);
    ctx.textAlign = "left";
  }

  private drawComposite(now: number) {
    const ctx = this.cctx;
    const { W, H } = OS;
    if (this.phase === "desktop") {
      ctx.drawImage(this.backdrop, 0, 0);
      for (const w of this.windows) {
        // shadow
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(w.rect.x + 4, w.rect.y + 8, w.rect.w, w.rect.h);
        ctx.drawImage(w.canvas, w.rect.x, w.rect.y, w.rect.w, w.rect.h);
        ctx.strokeStyle = w.focused ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.strokeRect(w.rect.x + 0.5, w.rect.y + 0.5, w.rect.w - 1, w.rect.h - 1);
      }
      return;
    }
    // boot screens
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = "top";
    if (this.phase === "post") {
      ctx.font = mono(22);
      ctx.fillStyle = "#c8c8c8";
      ctx.fillText("osbOS BIOS v3.0.1 (c) 2026 Osman Bilgin", 60, 60);
      ctx.fillText("Root Access Firmware · Build " + new Date().getFullYear(), 60, 96);
      const t = (now - this.phaseStart) / 1400;
      const items = [
        ["CPU", "Turbopack @ 1 thread ......... OK"],
        ["Memory", `${(navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? "?"} GB reported .......... OK`],
        [
          "Display",
          `${typeof screen !== "undefined" ? `${screen.width}x${screen.height}@${Math.round(window.devicePixelRatio * 100) / 100}x` : "unknown"} ..... OK`,
        ],
        ["Input", `${navigator.maxTouchPoints > 0 ? "touch + " : ""}keyboard ................ OK`],
        ["Storage", "textures, canvas-backed ........ OK"],
      ];
      items.forEach((it, i) => {
        if (t > (i + 1) / (items.length + 1)) {
          ctx.fillStyle = "#c8c8c8";
          ctx.fillText(it[0].padEnd(10), 60, 160 + i * 34);
          ctx.fillText(it[1], 60 + 11 * 13, 160 + i * 34);
        }
      });
      ctx.fillStyle = "#c8c8c8";
      if (t > 0.9) ctx.fillText("Booting from /dev/root-access …", 60, 360);
      if (Math.floor(now / 500) % 2 === 0) ctx.fillText("_", 60, 400);
      return;
    }
    // kernel log + login
    ctx.font = mono(19);
    const lh = 26;
    const maxRows = Math.floor((H - 100) / lh);
    const lines = this.bootLines.slice(-maxRows + 3);
    let y = 40;
    ctx.fillStyle = "#c8c8c8";
    ctx.fillText(`Linux version 6.x-osbOS (osman@bilgin) (turbopack) #${new Date().getFullYear()}`, 40, y);
    y += lh;
    for (const l of lines) {
      ctx.fillStyle = "#8a8a8a";
      ctx.fillText(`[${l.t.toFixed(6).padStart(12)}]`, 40, y);
      ctx.fillStyle = l.kind === "ok" ? "#7ee787" : l.kind === "warn" ? "#ffb648" : "#c8c8c8";
      ctx.fillText(l.text, 40 + 15 * 11.4, y);
      y += lh;
    }
    if (this.phase === "login") {
      y += lh;
      ctx.fillStyle = "#c8c8c8";
      ctx.fillText("osbOS 3.0 root-access tty1", 40, y);
      y += lh;
      ctx.fillStyle = C.cyan;
      ctx.fillText("osman@bilgin:~$ ", 40, y);
      ctx.fillStyle = "#c8c8c8";
      ctx.fillText("startx", 40 + 16 * 11.4, y);
    } else if (Math.floor(now / 500) % 2 === 0) {
      ctx.fillStyle = "#c8c8c8";
      ctx.fillText("_", 40, y);
    }
  }
}
