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
  backdropVersion = 0;
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
    // layout leaves the menu bar above and the dock below untouched
    this.terminal = new Terminal({ x: 36, y: 52, w: 640, h: 500 }, host);
    this.editor = new Editor({ x: 700, y: 52, w: 800, h: 816 });
    this.explorer = new Explorer({ x: 36, y: 572, w: 640, h: 296 }, (slug) => host.onProject(slug));
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

  /** dock icon rects in OS pixels, in the stable app order */
  private dockRects() {
    const { W, H } = OS;
    const size = 56;
    const gap = 14;
    const apps = [this.terminal, this.editor, this.explorer];
    const total = apps.length * size + (apps.length - 1) * gap;
    const x0 = (W - total) / 2;
    const y = H - 78;
    return apps.map((w, i) => ({ w, x: x0 + i * (size + gap), y, size }));
  }

  dockAt(x: number, y: number): OsWindow | null {
    for (const d of this.dockRects()) {
      if (x >= d.x && x < d.x + d.size && y >= d.y && y < d.y + d.size) return d.w;
    }
    return null;
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
    if (!w && kind === "down") {
      const d = this.dockAt(x, y);
      if (d) this.setFocus(d);
    }
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
      this.terminal.autorun("neofetch");
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
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
    return `${day} ${d.getDate()} ${mon}  ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
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
    this.backdropVersion++;
    const ctx = this.bctx;
    const { W, H, TASKBAR } = OS;
    // wallpaper: deep navy with flowing colour fields (no image asset)
    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, "#0b1030");
    base.addColorStop(0.55, "#161046");
    base.addColorStop(1, "#2a0f3a");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);
    const blob = (x: number, y: number, r: number, c0: string, c1: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };
    blob(W * 0.18, H * 0.25, W * 0.5, "rgba(41,151,255,0.55)", "rgba(41,151,255,0)");
    blob(W * 0.82, H * 0.8, W * 0.55, "rgba(191,90,242,0.5)", "rgba(191,90,242,0)");
    blob(W * 0.62, H * 0.15, W * 0.35, "rgba(255,122,61,0.35)", "rgba(255,122,61,0)");
    blob(W * 0.35, H * 0.95, W * 0.4, "rgba(48,209,88,0.18)", "rgba(48,209,88,0)");
    // a soft diagonal ribbon
    ctx.save();
    ctx.translate(W * 0.5, H * 0.55);
    ctx.rotate(-0.42);
    const rib = ctx.createLinearGradient(0, -140, 0, 140);
    rib.addColorStop(0, "rgba(255,255,255,0)");
    rib.addColorStop(0.5, "rgba(255,255,255,0.09)");
    rib.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rib;
    ctx.fillRect(-W, -140, W * 2, 280);
    ctx.restore();
    // darken the top so the menu bar reads
    const top = ctx.createLinearGradient(0, 0, 0, 160);
    top.addColorStop(0, "rgba(0,0,0,0.35)");
    top.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, W, 160);

    // menu bar
    ctx.fillStyle = "rgba(20,20,24,0.62)";
    ctx.fillRect(0, 0, W, TASKBAR);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, TASKBAR - 1, W, 1);
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    const focusedApp = this.focus === this.editor ? "Code" : this.focus === this.explorer ? "Files" : "Terminal";
    // logo mark
    roundRect(ctx, 14, 7, 16, 16, 5);
    ctx.fillStyle = C.text;
    ctx.fill();
    ctx.font = display(9, 700);
    ctx.fillStyle = "#1d1d1f";
    ctx.textAlign = "center";
    ctx.fillText("OB", 22, TASKBAR / 2 + 0.5);
    ctx.textAlign = "left";
    let x = 42;
    ctx.font = display(13, 700);
    ctx.fillStyle = C.text;
    ctx.fillText(focusedApp, x, TASKBAR / 2 + 0.5);
    x += ctx.measureText(focusedApp).width + 18;
    ctx.font = display(13, 500);
    for (const item of ["File", "Edit", "View", "Go", "Window", "Help"]) {
      ctx.fillStyle = C.text;
      ctx.fillText(item, x, TASKBAR / 2 + 0.5);
      x += ctx.measureText(item).width + 18;
    }
    ctx.textAlign = "right";
    ctx.fillStyle = C.text;
    ctx.fillText(this.clock(), W - 16, TASKBAR / 2 + 0.5);
    let rx = W - 16 - ctx.measureText(this.clock()).width - 22;
    // status glyphs: wifi arcs, battery, online dot
    ctx.fillStyle = C.text;
    ctx.font = display(12, 500);
    ctx.fillText(siteConfig.handle, rx, TASKBAR / 2 + 0.5);
    rx -= ctx.measureText(siteConfig.handle).width + 18;
    // battery
    ctx.strokeStyle = "rgba(245,245,247,0.85)";
    ctx.lineWidth = 1.2;
    roundRect(ctx, rx - 24, TASKBAR / 2 - 5.5, 22, 11, 3);
    ctx.stroke();
    ctx.fillStyle = "rgba(245,245,247,0.85)";
    ctx.fillRect(rx - 22, TASKBAR / 2 - 3.5, 18, 7);
    ctx.fillRect(rx - 1, TASKBAR / 2 - 2, 1.5, 4);
    rx -= 40;
    // wifi
    ctx.strokeStyle = "rgba(245,245,247,0.85)";
    ctx.lineWidth = 1.6;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(rx - 8, TASKBAR / 2 + 4, i * 3.4, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(245,245,247,0.85)";
    ctx.beginPath();
    ctx.arc(rx - 8, TASKBAR / 2 + 4, 1.3, 0, Math.PI * 2);
    ctx.fill();
    rx -= 32;
    ctx.fillStyle = C.green;
    ctx.beginPath();
    ctx.arc(rx - 4, TASKBAR / 2 + 0.5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = "left";

    // dock
    const dock = this.dockRects();
    const pad = 12;
    const dx = dock[0].x - pad;
    const dw = dock[dock.length - 1].x + dock[0].size + pad - dx;
    const dy = dock[0].y - pad;
    const dh = dock[0].size + pad * 2;
    roundRect(ctx, dx + 3, dy + 6, dw, dh, 22);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();
    roundRect(ctx, dx, dy, dw, dh, 22);
    ctx.fillStyle = "rgba(40,40,46,0.62)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1;
    ctx.stroke();
    for (const d of dock) {
      this.drawDockIcon(ctx, d.w, d.x, d.y, d.size);
      // running indicator
      ctx.fillStyle = d.w.focused ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)";
      ctx.beginPath();
      ctx.arc(d.x + d.size / 2, d.y + d.size + 7, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawDockIcon(ctx: CanvasRenderingContext2D, w: OsWindow, x: number, y: number, s: number) {
    const r = s * 0.22;
    // shadow
    roundRect(ctx, x, y + 2, s, s, r);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + s);
    if (w === this.terminal) {
      g.addColorStop(0, "#3a3a3f");
      g.addColorStop(1, "#151517");
    } else if (w === this.editor) {
      g.addColorStop(0, "#3aa0ff");
      g.addColorStop(1, "#0a5bd8");
    } else {
      g.addColorStop(0, "#6fc4ff");
      g.addColorStop(1, "#1f8bff");
    }
    roundRect(ctx, x, y, s, s, r);
    ctx.fillStyle = g;
    ctx.fill();
    // top gloss
    ctx.save();
    ctx.clip();
    const gloss = ctx.createLinearGradient(0, y, 0, y + s * 0.5);
    gloss.addColorStop(0, "rgba(255,255,255,0.22)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gloss;
    ctx.fillRect(x, y, s, s * 0.5);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    if (w === this.terminal) {
      // a mini prompt window
      roundRect(ctx, x + 9, y + 12, s - 18, s - 24, 5);
      ctx.fillStyle = "#0b0b0d";
      ctx.fill();
      ctx.fillStyle = "#e5e5ea";
      ctx.fillRect(x + 9, y + 12, s - 18, 6);
      ctx.font = mono(15, 700);
      ctx.fillStyle = "#f5f5f7";
      ctx.textAlign = "left";
      ctx.fillText(">_", x + 14, y + s / 2 + 5);
      ctx.textAlign = "center";
    } else if (w === this.editor) {
      ctx.font = mono(20, 700);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("</>", x + s / 2, y + s / 2 + 1);
    } else {
      // folder
      const fx = x + 10;
      const fy = y + 16;
      const fw = s - 20;
      const fh = s - 30;
      roundRect(ctx, fx, fy, fw * 0.45, 8, [3, 3, 0, 0]);
      ctx.fillStyle = "#e8f4ff";
      ctx.fill();
      roundRect(ctx, fx, fy + 5, fw, fh - 5, 4);
      ctx.fillStyle = "#f5f9ff";
      ctx.fill();
      roundRect(ctx, fx, fy + 12, fw, fh - 12, 4);
      ctx.fillStyle = "#dbeaff";
      ctx.fill();
    }
    ctx.textAlign = "left";
  }

  private drawComposite(now: number) {
    const ctx = this.cctx;
    const { W, H } = OS;
    if (this.phase === "desktop") {
      ctx.drawImage(this.backdrop, 0, 0);
      const R = OS.RADIUS;
      for (const w of this.windows) {
        const { x, y, w: ww, h } = w.rect;
        // layered soft shadow (no filter: cheap on every compositor pass)
        const layers = w.focused ? 4 : 2;
        for (let i = layers; i >= 1; i--) {
          roundRect(ctx, x - i * 3, y + i * 2, ww + i * 6, h + i * 6, R + i * 3);
          ctx.fillStyle = `rgba(0,0,0,${w.focused ? 0.12 : 0.1})`;
          ctx.fill();
        }
        ctx.save();
        roundRect(ctx, x, y, ww, h, R);
        ctx.clip();
        ctx.drawImage(w.canvas, x, y, ww, h);
        ctx.restore();
        roundRect(ctx, x + 0.5, y + 0.5, ww - 1, h - 1, R);
        ctx.strokeStyle = w.focused ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();
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
