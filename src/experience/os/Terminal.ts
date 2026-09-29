import { C, charWidth, mono, wrap } from "./draw";
import { OsWindow, type OsPointer, type Rect } from "./Window";
import { buildFs, resolvePath, tree, type FsDir } from "./fs";
import { GIT_HEAD, GIT_LOG } from "./sources.generated";
import { siteConfig, projects, skillLevels, languages, techCategories } from "@/lib/data";

interface Line {
  text: string;
  color?: string;
}

export interface TerminalHost {
  openProject(slug: string): void;
  goto(hash: string): void;
  tier(): string;
  renderer(): string;
}

const HELP: [string, string][] = [
  ["help", "this list"],
  ["whoami", "who is at the keyboard"],
  ["neofetch", "system summary"],
  ["ls [path]", "list directory"],
  ["cd <path>", "change directory"],
  ["cat <file>", "print a file"],
  ["tree [path]", "directory tree"],
  ["git log --oneline --graph", "this site's real commit history"],
  ["open <project>", "open a project window"],
  ["skills", "instrument readout"],
  ["contact", "how to reach me"],
  ["history", "command history"],
  ["clear", "clear the screen"],
];

const MATRIX_GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789ABCDEF";

/**
 * A real terminal: virtual filesystem, tab completion, history, and a few
 * easter eggs. Rendering is a plain monospace grid.
 */
export class Terminal extends OsWindow {
  private lines: Line[] = [];
  private input = "";
  private cursor = 0;
  private history: string[] = [];
  private histIdx = -1;
  private scroll = 0; // lines scrolled up from the bottom
  private fs: FsDir = buildFs();
  private cwd: string[] = [];
  private blinkOn = true;
  private lastBlink = 0;
  /** animated easter egg state */
  private anim: { kind: "matrix" | "sl"; until: number; cols?: number[]; x?: number } | null = null;
  private typed = false;

  constructor(rect: Rect, private host: TerminalHost) {
    super("terminal", "osman@bilgin: ~", rect, C.cyan);
    this.motd();
  }

  private get prompt() {
    const path = this.cwd.length ? "~/" + this.cwd.join("/") : "~";
    return `osman@bilgin:${path}$ `;
  }

  private motd() {
    this.print("Last login: from 127.0.0.1 on ttys001", C.muted);
    this.print("osbOS 3.0 · root access granted", C.muted);
    this.print("type `help` — or try `sudo hire osman`", C.muted);
    this.print("");
  }

  print(text = "", color?: string) {
    const cols = this.cols;
    for (const l of wrap(text, cols)) this.lines.push({ text: l, color });
    if (this.lines.length > 600) this.lines.splice(0, this.lines.length - 600);
    this.scroll = 0;
    this.dirty = true;
  }

  private get cols() {
    const cw = charWidth(this.ctx, mono(13));
    return Math.max(20, Math.floor((this.rect.w - 28) / cw));
  }
  private get rows() {
    return Math.floor((this.body.h - 16) / 20);
  }

  /** Types a command as if the visitor had (used once by the boot sequence). */
  autorun(cmd: string) {
    this.input = cmd;
    this.cursor = cmd.length;
    this.submit();
  }

  // ---------- input ----------

  key(e: KeyboardEvent): boolean {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "c" && e.ctrlKey) {
        this.print(this.prompt + this.input + "^C");
        this.input = "";
        this.cursor = 0;
        this.anim = null;
        return true;
      }
      if (e.key === "l" && e.ctrlKey) {
        this.lines = [];
        this.dirty = true;
        return true;
      }
      return false;
    }
    this.typed = true;
    switch (e.key) {
      case "Enter":
        this.submit();
        return true;
      case "Backspace":
        if (this.cursor > 0) {
          this.input = this.input.slice(0, this.cursor - 1) + this.input.slice(this.cursor);
          this.cursor--;
        }
        break;
      case "Delete":
        this.input = this.input.slice(0, this.cursor) + this.input.slice(this.cursor + 1);
        break;
      case "ArrowLeft":
        this.cursor = Math.max(0, this.cursor - 1);
        break;
      case "ArrowRight":
        this.cursor = Math.min(this.input.length, this.cursor + 1);
        break;
      case "Home":
        this.cursor = 0;
        break;
      case "End":
        this.cursor = this.input.length;
        break;
      case "ArrowUp":
        if (this.history.length) {
          this.histIdx = this.histIdx < 0 ? this.history.length - 1 : Math.max(0, this.histIdx - 1);
          this.input = this.history[this.histIdx];
          this.cursor = this.input.length;
        }
        break;
      case "ArrowDown":
        if (this.histIdx >= 0) {
          this.histIdx++;
          if (this.histIdx >= this.history.length) {
            this.histIdx = -1;
            this.input = "";
          } else this.input = this.history[this.histIdx];
          this.cursor = this.input.length;
        }
        break;
      case "Tab":
        this.complete();
        break;
      case "PageUp":
        this.scroll = Math.min(Math.max(0, this.lines.length - this.rows + 1), this.scroll + this.rows - 2);
        break;
      case "PageDown":
        this.scroll = Math.max(0, this.scroll - (this.rows - 2));
        break;
      default:
        if (e.key.length === 1) {
          this.input = this.input.slice(0, this.cursor) + e.key + this.input.slice(this.cursor);
          this.cursor++;
        } else return false;
    }
    this.blinkOn = true;
    this.dirty = true;
    return true;
  }

  pointer(e: OsPointer): boolean {
    if (e.kind === "wheel" && e.deltaY) {
      const max = Math.max(0, this.lines.length - this.rows + 1);
      this.scroll = Math.max(0, Math.min(max, this.scroll + (e.deltaY > 0 ? -3 : 3)));
      this.dirty = true;
      return true;
    }
    return false;
  }

  tick(now: number): boolean {
    let redraw = false;
    if (this.focused && now - this.lastBlink > 530) {
      this.lastBlink = now;
      this.blinkOn = !this.blinkOn;
      redraw = true;
    }
    if (this.anim) {
      if (now > this.anim.until) {
        this.anim = null;
        this.print("");
      }
      redraw = true;
    }
    return redraw;
  }

  private complete() {
    const parts = this.input.slice(0, this.cursor).split(" ");
    const last = parts[parts.length - 1];
    let candidates: string[] = [];
    if (parts.length === 1) {
      candidates = [...HELP.map((h) => h[0].split(" ")[0]), "sudo", "matrix", "sl", "rm", "echo", "pwd", "date", "uname"];
    } else {
      const cmd = parts[0];
      if (cmd === "open") candidates = projects.map((p) => p.slug);
      else {
        const slash = last.lastIndexOf("/");
        const dirPart = slash >= 0 ? last.slice(0, slash + 1) : "";
        const { node } = resolvePath(this.fs, this.cwd, dirPart || ".");
        if (node && node.kind === "dir") {
          candidates = Object.keys(node.children).map(
            (n) => dirPart + n + (node.children[n].kind === "dir" ? "/" : "")
          );
        }
      }
    }
    const matches = candidates.filter((c) => c.startsWith(last));
    if (matches.length === 1) {
      const completion = matches[0] + (matches[0].endsWith("/") ? "" : " ");
      this.input = this.input.slice(0, this.cursor - last.length) + completion + this.input.slice(this.cursor);
      this.cursor += completion.length - last.length;
    } else if (matches.length > 1) {
      // common prefix
      let prefix = matches[0];
      for (const m of matches) while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1);
      if (prefix.length > last.length) {
        this.input = this.input.slice(0, this.cursor - last.length) + prefix + this.input.slice(this.cursor);
        this.cursor += prefix.length - last.length;
      } else {
        this.print(this.prompt + this.input);
        this.print(matches.join("  "), C.text2);
      }
    }
  }

  private submit() {
    const raw = this.input;
    this.print(this.prompt + raw, C.text);
    this.input = "";
    this.cursor = 0;
    this.histIdx = -1;
    const cmd = raw.trim();
    if (!cmd) return;
    this.history.push(cmd);
    this.run(cmd);
  }

  // ---------- commands ----------

  private run(cmdline: string) {
    const [cmd, ...args] = cmdline.split(/\s+/);
    const arg = args.join(" ");
    switch (cmd) {
      case "help":
        this.print("commands:", C.text2);
        for (const [c, d] of HELP) this.print(`  ${c.padEnd(28)} ${d}`);
        this.print("");
        this.print("  tab completes · ↑/↓ recall history · ctrl+l clears", C.muted);
        return;
      case "whoami":
        this.print(siteConfig.name, C.cyan);
        for (const t of siteConfig.titles) this.print("  " + t.toLowerCase());
        return;
      case "pwd":
        this.print("/home/osman" + (this.cwd.length ? "/" + this.cwd.join("/") : ""));
        return;
      case "date":
        this.print(new Date().toString());
        return;
      case "uname":
        this.print(`osbOS 3.0 root-access #${GIT_HEAD} ${this.host.renderer()} x86_64`);
        return;
      case "echo":
        this.print(arg);
        return;
      case "neofetch":
        this.neofetch();
        return;
      case "ls":
        return this.ls(arg);
      case "cd":
        return this.cd(arg);
      case "cat":
        return this.cat(arg);
      case "tree": {
        const { node } = resolvePath(this.fs, this.cwd, arg || ".");
        if (!node || node.kind !== "dir") return this.print(`tree: ${arg}: not a directory`, C.red);
        this.print((arg || ".") + "/", C.cyan);
        for (const l of tree(node, "", 0, 2)) this.print(l);
        return;
      }
      case "git":
        if (args[0] === "log") {
          this.print(`# real history of this repository (HEAD ${GIT_HEAD})`, C.muted);
          for (const l of GIT_LOG.split("\n")) this.print(l, l.includes("*") ? C.text : C.text2);
          return;
        }
        if (args[0] === "status") {
          this.print("On branch feat/root-access");
          this.print("nothing to commit, working tree clean", C.green);
          return;
        }
        return this.print(`git: '${args[0] ?? ""}' is not a git command. try: git log --oneline --graph`, C.red);
      case "open": {
        const p = projects.find((x) => x.slug === arg || x.title.toLowerCase() === arg.toLowerCase());
        if (!p) {
          this.print(`open: unknown project '${arg}'`, C.red);
          this.print("  " + projects.map((x) => x.slug).join("  "), C.text2);
          return;
        }
        this.print(`opening ${p.title} …`, C.green);
        this.host.openProject(p.slug);
        return;
      }
      case "skills":
        for (const s of skillLevels) {
          const n = Math.round(s.level / 5);
          this.print(`${s.name.padEnd(26)} ${"█".repeat(n)}${"░".repeat(20 - n)} ${s.level}`, C.text);
        }
        return;
      case "contact":
        this.print(`email     ${siteConfig.email}`, C.cyan);
        this.print(`phone     ${siteConfig.phoneDisplay}`);
        this.print(`instagram ${siteConfig.instagram}`);
        this.print(`→ or: ssh hello@osmanbilgin.dev`, C.muted);
        this.host.goto("#contact");
        return;
      case "ssh":
        this.print(`connecting to ${arg || "hello@osmanbilgin.dev"} …`, C.text2);
        this.host.goto("#contact");
        return;
      case "history":
        this.history.forEach((h, i) => this.print(`  ${String(i + 1).padStart(3)}  ${h}`));
        return;
      case "clear":
        this.lines = [];
        this.dirty = true;
        return;
      case "sudo":
        if (/^hire\s+osman/i.test(arg)) {
          this.print("[sudo] password for visitor: ••••••••", C.text2);
          this.print("Access granted. Escalating to hiring manager …", C.green);
          this.print("→ opening secure channel: ssh hello@osmanbilgin.dev", C.cyan);
          this.host.goto("#contact");
          return;
        }
        this.print("visitor is not in the sudoers file. This incident will be reported.", C.amber);
        return;
      case "matrix":
        this.anim = { kind: "matrix", until: performance.now() + 4500, cols: [] };
        return;
      case "sl":
        this.anim = { kind: "sl", until: performance.now() + 4200, x: 0 };
        return;
      case "rm":
        if (/-rf\s+\/(\s|$)|-fr\s+\/(\s|$)/.test(cmdline) || cmdline.includes("--no-preserve-root")) {
          this.print("rm: refusing to remove '/' — it is where I keep the coffee.", C.amber);
          this.print("rm: osbOS integrity guard: 0 files removed, 1 duck alarmed 🦆", C.text2);
          return;
        }
        this.print("rm: this filesystem is read-only (it is literally rendered on a texture)", C.text2);
        return;
      case "exit":
      case "logout":
        this.print("logout … just kidding. scroll to leave the screen.", C.text2);
        return;
      case "vim":
      case "nano":
      case "code":
        this.print(`${cmd}: use the editor window on the right — it has this site's real source.`, C.text2);
        return;
      default:
        this.print(`bash: ${cmd}: command not found`, C.red);
        this.print("try `help`", C.muted);
    }
  }

  private ls(arg: string) {
    const { node } = resolvePath(this.fs, this.cwd, arg || ".");
    if (!node) return this.print(`ls: cannot access '${arg}': No such file or directory`, C.red);
    if (node.kind === "file") return this.print(node.name);
    const names = Object.keys(node.children).sort();
    const parts: string[] = [];
    for (const n of names) {
      const c = node.children[n];
      parts.push(c.kind === "dir" ? n + "/" : n);
    }
    // columns
    const cols = this.cols;
    const colW = Math.max(...parts.map((p) => p.length)) + 3;
    const per = Math.max(1, Math.floor(cols / colW));
    for (let i = 0; i < parts.length; i += per) {
      const row = parts.slice(i, i + per);
      this.print(row.map((p) => p.padEnd(colW)).join(""), C.text);
    }
  }

  private cd(arg: string) {
    if (!arg || arg === "~") {
      this.cwd = [];
      return;
    }
    const { node, parts } = resolvePath(this.fs, this.cwd, arg);
    if (!node) return this.print(`cd: ${arg}: No such file or directory`, C.red);
    if (node.kind !== "dir") return this.print(`cd: ${arg}: Not a directory`, C.red);
    this.cwd = parts;
    this.title = `osman@bilgin: ${parts.length ? "~/" + parts.join("/") : "~"}`;
  }

  private cat(arg: string) {
    if (!arg) return this.print("cat: missing file operand", C.red);
    const { node } = resolvePath(this.fs, this.cwd, arg);
    if (!node) return this.print(`cat: ${arg}: No such file or directory`, C.red);
    if (node.kind === "dir") return this.print(`cat: ${arg}: Is a directory`, C.red);
    const lines = node.content.split("\n");
    for (const l of lines.slice(0, 120)) this.print(l, l.startsWith("#") ? C.cyan : undefined);
    if (lines.length > 120) this.print(`… (${lines.length - 120} more lines — read it in the editor)`, C.muted);
  }

  private neofetch() {
    const logo = [
      "   ██████╗ ██████╗ ",
      "  ██╔═══██╗██╔══██╗",
      "  ██║   ██║██████╔╝",
      "  ██║   ██║██╔══██╗",
      "  ╚██████╔╝██████╔╝",
      "   ╚═════╝ ╚═════╝ ",
    ];
    const info = [
      `osman@bilgin`,
      `----------------`,
      `OS:        osbOS 3.0 root-access`,
      `Host:      ${siteConfig.url.replace("https://", "")}`,
      `Kernel:    next 16 · react 19 · three`,
      `Shell:     terminal (canvas texture)`,
      `Renderer:  ${this.host.renderer()} · tier ${this.host.tier()}`,
      `Languages: ${languages.length}`,
      `Tools:     ${techCategories.reduce((n, c) => n + c.items.length, 0)}`,
      `Projects:  ${projects.length}`,
      `Commit:    ${GIT_HEAD}`,
    ];
    for (let i = 0; i < Math.max(logo.length, info.length); i++) {
      const l = (logo[i] ?? "").padEnd(22);
      this.lines.push({ text: l + (info[i] ?? ""), color: i < logo.length ? C.cyan : undefined });
    }
    this.dirty = true;
  }

  // ---------- drawing ----------

  drawBody(ctx: CanvasRenderingContext2D, body: Rect, now: number) {
    ctx.fillStyle = "#08090d";
    ctx.fillRect(0, 0, body.w, body.h);
    ctx.font = mono(13);
    ctx.textBaseline = "top";
    const cw = charWidth(ctx, mono(13));
    const lh = 20;
    const rows = this.rows;

    if (this.anim?.kind === "matrix") {
      this.drawMatrix(ctx, body, now, cw, lh);
      return;
    }

    const all: Line[] = [...this.lines];
    // the live input line, wrapped
    const promptLine = this.prompt + this.input;
    const inputLines = wrap(promptLine, this.cols);
    all.push(...inputLines.map((t) => ({ text: t, color: C.text })));
    const start = Math.max(0, all.length - rows - this.scroll);
    const visible = all.slice(start, start + rows);

    for (let i = 0; i < visible.length; i++) {
      const l = visible[i];
      const y = 10 + i * lh;
      const isPromptLine = l.text.startsWith("osman@bilgin:");
      if (isPromptLine) {
        // colour the prompt like a real shell
        const promptEnd = l.text.indexOf("$ ") + 2;
        const p = l.text.slice(0, promptEnd);
        const at = p.indexOf(":");
        ctx.fillStyle = C.green;
        ctx.fillText(p.slice(0, at), 14, y);
        ctx.fillStyle = C.text2;
        ctx.fillText(":", 14 + at * cw, y);
        ctx.fillStyle = C.violet;
        ctx.fillText(p.slice(at + 1, p.length - 2), 14 + (at + 1) * cw, y);
        ctx.fillStyle = C.text2;
        ctx.fillText("$", 14 + (p.length - 2) * cw, y);
        ctx.fillStyle = l.color ?? C.text;
        ctx.fillText(l.text.slice(promptEnd), 14 + promptEnd * cw, y);
      } else {
        ctx.fillStyle = l.color ?? C.text2;
        ctx.fillText(l.text, 14, y);
      }
    }

    // cursor
    if (this.scroll === 0 && this.focused && this.blinkOn) {
      const idx = this.prompt.length + this.cursor;
      const cols = this.cols;
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const lineIdx = visible.length - inputLines.length + row;
      const y = 10 + lineIdx * lh;
      ctx.fillStyle = C.cyan;
      ctx.fillRect(14 + col * cw, y - 1, cw, lh - 3);
      const ch = promptLine[idx];
      if (ch) {
        ctx.fillStyle = "#001416";
        ctx.fillText(ch, 14 + col * cw, y);
      }
    }
    if (!this.focused && !this.typed) {
      ctx.fillStyle = C.muted;
      ctx.font = mono(11);
      ctx.fillText("click the terminal and type · tab · ↑ ↓", 14, body.h - 20);
    }

    if (this.anim?.kind === "sl") this.drawTrain(ctx, body, now, lh);
  }

  private drawMatrix(ctx: CanvasRenderingContext2D, body: Rect, now: number, cw: number, lh: number) {
    const a = this.anim!;
    const ncol = Math.floor(body.w / cw);
    if (!a.cols || a.cols.length !== ncol) a.cols = Array.from({ length: ncol }, () => Math.random() * -40);
    const t = now / 1000;
    for (let c = 0; c < ncol; c++) {
      a.cols[c] += 0.35 + (c % 5) * 0.08;
      const head = Math.floor(a.cols[c]);
      for (let k = 0; k < 18; k++) {
        const r = head - k;
        if (r < 0 || r * lh > body.h) continue;
        const g = MATRIX_GLYPHS[Math.floor(Math.abs(Math.sin(c * 12.9 + r * 3.7 + t * 2)) * MATRIX_GLYPHS.length) % MATRIX_GLYPHS.length];
        const fade = 1 - k / 18;
        ctx.fillStyle = k === 0 ? "#dfffe8" : `rgba(0,255,136,${fade * 0.9})`;
        ctx.fillText(g, c * cw, 6 + r * lh);
      }
      if (a.cols[c] * lh > body.h + 18 * lh) a.cols[c] = Math.random() * -30;
    }
    ctx.fillStyle = C.muted;
    ctx.font = mono(11);
    ctx.fillText("wake up, neo …  (ctrl+c to stop)", 14, body.h - 20);
  }

  private drawTrain(ctx: CanvasRenderingContext2D, body: Rect, now: number, lh: number) {
    const a = this.anim!;
    const train = [
      "      ====        ________                ___________ ",
      "  _D _|  |_______/        \\__I_I_____===__|_________| ",
      "   |(_)---  |   H\\________/ |   |        =|___ ___|   ",
      "   /     |  |   H  |  |     |   |         ||_| |_||   ",
      "  |      |  |   H  |__--------------------| [___] |   ",
      "  | ________|___H__/__|_____/[][]~\\_______|       |   ",
      "  |/ |   |-----------I_____I [][] []  D   |=======|__ ",
      "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
      " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
      "  \\_/      \\O=====O=====O=====O_/      \\_/            ",
    ];
    const total = 4200;
    const elapsed = total - (a.until - now);
    const x = body.w - (elapsed / total) * (body.w + 60 * 8);
    ctx.fillStyle = "#08090d";
    ctx.fillRect(0, body.h - lh * 12, body.w, lh * 12);
    ctx.fillStyle = C.text;
    ctx.font = mono(13);
    train.forEach((l, i) => ctx.fillText(l, x, body.h - lh * (12 - i) + 4));
  }
}
