import { C, OS, display, makeCanvas, mono, roundRect } from "./draw";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PointerKind = "move" | "down" | "up" | "wheel" | "leave";

export interface OsPointer {
  kind: PointerKind;
  /** window-local OS pixels */
  x: number;
  y: number;
  deltaY?: number;
}

/**
 * A window is an off-screen canvas plus a dirty flag. Subclasses draw their
 * content into `ctx` (in OS pixels; the canvas is `OS.SCALE`× larger) and
 * never touch the compositor. Redraws happen only when `dirty` is set.
 */
export abstract class OsWindow {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  dirty = true;
  /** bumps on every redraw so textures know when to re-upload */
  version = 0;
  focused = false;
  hover = false;
  /** last hover position in window-local pixels */
  hx = -1;
  hy = -1;

  constructor(
    public readonly id: string,
    public title: string,
    public rect: Rect,
    public readonly accent = C.cyan
  ) {
    this.canvas = makeCanvas(rect.w * OS.SCALE, rect.h * OS.SCALE);
    this.ctx = this.canvas.getContext("2d", { alpha: false })!;
  }

  /** content area below the title bar, in window-local pixels */
  get body(): Rect {
    return { x: 0, y: OS.TITLE, w: this.rect.w, h: this.rect.h - OS.TITLE };
  }

  abstract drawBody(ctx: CanvasRenderingContext2D, body: Rect, now: number): void;

  /** Subclasses override; return true when handled (and mark dirty). */
  pointer(e: OsPointer): boolean {
    void e;
    return false;
  }
  key(e: KeyboardEvent): boolean {
    void e;
    return false;
  }
  /** Called every frame; return true to request a redraw (e.g. cursor blink). */
  tick(now: number): boolean {
    void now;
    return false;
  }

  render(now: number) {
    if (!this.dirty) return false;
    this.dirty = false;
    this.version++;
    const { ctx } = this;
    ctx.setTransform(OS.SCALE, 0, 0, OS.SCALE, 0, 0);
    const { w, h } = this.rect;
    // frame
    ctx.fillStyle = C.panel;
    ctx.fillRect(0, 0, w, h);
    // unified macOS title bar
    ctx.fillStyle = this.focused ? "#2c2c2e" : "#232325";
    ctx.fillRect(0, 0, w, OS.TITLE);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, 0, w, 1);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, OS.TITLE - 1, w, 1);
    // traffic lights
    const dots = ["#ff5f57", "#febc2e", "#28c840"];
    dots.forEach((c, i) => {
      ctx.beginPath();
      ctx.arc(20 + i * 20, OS.TITLE / 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = this.focused || this.hover ? c : "#4a4a4e";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 0.75;
      ctx.stroke();
    });
    ctx.font = display(13, 600);
    ctx.textBaseline = "middle";
    ctx.fillStyle = this.focused ? C.text : C.muted;
    ctx.textAlign = "center";
    ctx.fillText(this.title, w / 2, OS.TITLE / 2 + 0.5);
    ctx.textAlign = "left";
    // body
    const body = this.body;
    ctx.save();
    ctx.beginPath();
    ctx.rect(body.x, body.y, body.w, body.h);
    ctx.clip();
    ctx.translate(body.x, body.y);
    this.drawBody(ctx, { x: 0, y: 0, w: body.w, h: body.h }, now);
    ctx.restore();
    // corners are cut by the compositor / mesh; keep a hairline edge for contrast
    ctx.strokeStyle = this.focused ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.09)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    return true;
  }

  /** Small helper for a rounded pill label. */
  protected pill(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) {
    ctx.font = mono(10, 500);
    const w = ctx.measureText(text).width + 12;
    roundRect(ctx, x, y, w, 16, 8);
    ctx.fillStyle = color + "26";
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + 6, y + 8.5);
    return w;
  }

  protected heading(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
    ctx.font = display(18, 600);
    ctx.fillStyle = C.text;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, x, y);
  }
}
