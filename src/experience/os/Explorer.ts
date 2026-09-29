import { C, display, mono, roundRect, wrap } from "./draw";
import { OsWindow, type OsPointer, type Rect } from "./Window";
import { isRealUrl, projects, type ProjectItem } from "@/lib/data";

interface Hit {
  rect: Rect;
  action: () => void;
}

/**
 * File explorer: projects are folders. Opening one shows a project window
 * with the description, tech and links from data.ts. Rendered inside the
 * explorer's own canvas as an overlay.
 */
export class Explorer extends OsWindow {
  private hits: Hit[] = [];
  private open: ProjectItem | null = null;
  private selected = -1;
  private openedAt = 0;

  constructor(rect: Rect, private onOpen: (slug: string | null) => void) {
    super("files", "Files — ~/projects", rect, C.green);
  }

  openProject(slug: string | null) {
    const p = slug ? projects.find((x) => x.slug === slug) ?? null : null;
    this.open = p;
    this.openedAt = performance.now();
    this.selected = p ? projects.indexOf(p) : -1;
    this.title = p ? `Files — ~/projects/${p.slug}` : "Files — ~/projects";
    this.onOpen(p ? p.slug : null);
    this.dirty = true;
  }

  pointer(e: OsPointer): boolean {
    const x = e.x;
    const y = e.y - this.body.y;
    if (e.kind === "move") {
      let h = -1;
      for (let i = 0; i < this.hits.length; i++) {
        const r = this.hits[i].rect;
        if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) h = i;
      }
      if (h !== this.hoverIdx) {
        this.hoverIdx = h;
        this.dirty = true;
      }
      return h >= 0;
    }
    if (e.kind === "down") {
      for (const h of this.hits) {
        const r = h.rect;
        if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) {
          h.action();
          this.dirty = true;
          return true;
        }
      }
    }
    if (e.kind === "leave" && this.hoverIdx >= 0) {
      this.hoverIdx = -1;
      this.dirty = true;
    }
    return false;
  }
  private hoverIdx = -1;

  key(e: KeyboardEvent): boolean {
    if (e.key === "Escape" && this.open) {
      this.openProject(null);
      return true;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      this.selected = Math.min(projects.length - 1, this.selected + 1);
      this.dirty = true;
      return true;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      this.selected = Math.max(0, this.selected - 1);
      this.dirty = true;
      return true;
    }
    if (e.key === "Enter" && this.selected >= 0) {
      this.openProject(projects[this.selected].slug);
      return true;
    }
    return false;
  }

  tick(now: number): boolean {
    // window-open animation for 260ms
    return !!this.open && now - this.openedAt < 280;
  }

  drawBody(ctx: CanvasRenderingContext2D, body: Rect, now: number) {
    this.hits = [];
    const sideW = 168;
    ctx.fillStyle = "#0b0c11";
    ctx.fillRect(0, 0, body.w, body.h);
    // sidebar
    ctx.fillStyle = "#0e0f15";
    ctx.fillRect(0, 0, sideW, body.h);
    ctx.fillStyle = C.line;
    ctx.fillRect(sideW, 0, 1, body.h);
    ctx.font = mono(10.5, 500);
    ctx.textBaseline = "middle";
    ctx.fillStyle = C.muted;
    ctx.fillText("PLACES", 14, 18);
    const places = ["~", "projects", "stack", "site", "about.md", "contact.txt"];
    places.forEach((p, i) => {
      const y = 36 + i * 24;
      const on = i === 1;
      if (on) {
        roundRect(ctx, 8, y - 10, sideW - 16, 22, 5);
        ctx.fillStyle = "rgba(0,255,136,0.1)";
        ctx.fill();
      }
      ctx.font = mono(11.5);
      ctx.fillStyle = on ? C.green : C.text2;
      const glyph = p.includes(".") ? "▤" : "▸";
      ctx.fillText(`${glyph} ${p}${p.includes(".") ? "" : "/"}`, 16, y + 1);
    });
    ctx.fillStyle = C.muted;
    ctx.font = mono(10.5, 500);
    ctx.fillText("DISK", 14, 36 + places.length * 24 + 16);
    ctx.font = mono(10.5);
    ctx.fillStyle = C.text2;
    ctx.fillText(`${projects.length} folders · 0 B used`, 14, 36 + places.length * 24 + 34);
    ctx.fillText("rendered on a texture", 14, 36 + places.length * 24 + 50);

    // breadcrumb
    ctx.font = mono(11.5);
    ctx.fillStyle = C.text2;
    ctx.fillText("~ / projects", sideW + 16, 18);
    ctx.fillStyle = C.line;
    ctx.fillRect(sideW + 1, 34, body.w - sideW - 1, 1);

    // grid of folders
    const gx = sideW + 16;
    const gy = 48;
    const cellW = 112;
    const cellH = 96;
    const perRow = Math.max(1, Math.floor((body.w - sideW - 24) / cellW));
    projects.forEach((p, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const x = gx + col * cellW;
      const y = gy + row * cellH;
      const hot = this.hoverIdx === this.hits.length || this.selected === i;
      if (hot) {
        roundRect(ctx, x - 4, y - 4, cellW - 8, cellH - 6, 8);
        ctx.fillStyle = "rgba(0,255,136,0.08)";
        ctx.fill();
      }
      this.drawFolder(ctx, x + 18, y + 6, hot);
      ctx.font = mono(10.5);
      ctx.fillStyle = hot ? C.text : C.text2;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const label = wrap(p.title, 15);
      label.slice(0, 2).forEach((l, k) => ctx.fillText(l, x + (cellW - 8) / 2 - 4, y + 54 + k * 13));
      ctx.textAlign = "left";
      this.hits.push({ rect: { x: x - 4, y: y - 4, w: cellW - 8, h: cellH - 6 }, action: () => this.openProject(p.slug) });
    });

    if (this.open) this.drawProject(ctx, body, this.open, now);
  }

  private drawFolder(ctx: CanvasRenderingContext2D, x: number, y: number, hot: boolean) {
    const w = 64;
    const h = 44;
    // back
    roundRect(ctx, x, y + 6, w, h, 5);
    ctx.fillStyle = hot ? "#1c3b34" : "#1a1c27";
    ctx.fill();
    // tab
    roundRect(ctx, x, y, 26, 12, 3);
    ctx.fill();
    // front
    const g = ctx.createLinearGradient(0, y + 12, 0, y + h + 6);
    g.addColorStop(0, hot ? "#22d3a0" : "#2b2e40");
    g.addColorStop(1, hot ? "#0e8f6b" : "#1d1f2c");
    roundRect(ctx, x, y + 14, w, h - 8, 5);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = hot ? "rgba(0,255,136,0.5)" : "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawProject(ctx: CanvasRenderingContext2D, body: Rect, p: ProjectItem, now: number) {
    const t = Math.min(1, (now - this.openedAt) / 260);
    const ease = 1 - Math.pow(1 - t, 3);
    const w = Math.min(460, body.w - 40);
    const h = Math.min(340, body.h - 40);
    const x = (body.w - w) / 2;
    const y = (body.h - h) / 2 + (1 - ease) * 18;
    ctx.save();
    ctx.globalAlpha = ease;
    ctx.fillStyle = "rgba(4,4,8,0.55)";
    ctx.fillRect(0, 0, body.w, body.h);
    roundRect(ctx, x, y, w, h, 10);
    ctx.fillStyle = "#101219";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,255,136,0.35)";
    ctx.stroke();
    // header
    ctx.fillStyle = "#151827";
    ctx.beginPath();
    ctx.roundRect(x, y, w, 36, [10, 10, 0, 0]);
    ctx.fill();
    ctx.font = mono(11);
    ctx.textBaseline = "middle";
    ctx.fillStyle = C.text2;
    ctx.fillText(`~/projects/${p.slug}/README.md`, x + 14, y + 18);
    // close
    ctx.fillStyle = C.muted;
    ctx.textAlign = "right";
    ctx.fillText("esc ✕", x + w - 12, y + 18);
    ctx.textAlign = "left";
    this.hits.push({ rect: { x: x + w - 60, y: y, w: 60, h: 36 }, action: () => this.openProject(null) });

    let cy = y + 62;
    ctx.font = display(22, 700);
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = C.text;
    ctx.fillText(p.title, x + 18, cy);
    cy += 14;
    ctx.font = mono(10.5, 500);
    ctx.fillStyle = C.green;
    ctx.fillText(p.category.toUpperCase(), x + 18, cy + 8);
    cy += 32;
    ctx.font = mono(12);
    ctx.fillStyle = C.text2;
    for (const l of wrap(p.description, Math.floor((w - 36) / 7.2))) {
      ctx.fillText(l, x + 18, cy);
      cy += 18;
    }
    cy += 10;
    let px = x + 18;
    for (const tech of p.tech) {
      const pw = this.pill(ctx, px, cy, tech, C.cyan);
      px += pw + 8;
      if (px > x + w - 80) {
        px = x + 18;
        cy += 22;
      }
    }
    cy += 40;
    ctx.font = mono(11.5);
    ctx.textBaseline = "alphabetic";
    const links: string[] = [];
    if (isRealUrl(p.github)) links.push(`source → ${p.github}`);
    if (isRealUrl(p.demo)) links.push(`live → ${p.demo}`);
    if (links.length === 0) {
      ctx.fillStyle = C.muted;
      ctx.fillText("private client work · details on request", x + 18, cy);
    } else {
      ctx.fillStyle = C.cyan;
      for (const l of links) {
        ctx.fillText(l, x + 18, cy);
        cy += 18;
      }
    }
    ctx.restore();
  }
}
