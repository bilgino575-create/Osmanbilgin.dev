/**
 * The virtual file system the terminal and the explorer share. Everything in
 * it is derived from data.ts or from the real embedded sources.
 */
import {
  siteConfig,
  languages,
  techCategories,
  projects,
  services,
  skillLevels,
  processSteps,
  aboutHighlights,
} from "@/lib/data";
import { SOURCES } from "./sources.generated";

export interface FsFile {
  kind: "file";
  name: string;
  content: string;
}
export interface FsDir {
  kind: "dir";
  name: string;
  children: Record<string, FsNode>;
}
export type FsNode = FsFile | FsDir;

const file = (name: string, content: string): FsFile => ({ kind: "file", name, content });
const dir = (name: string, children: Record<string, FsNode> = {}): FsDir => ({
  kind: "dir",
  name,
  children,
});

function titleCase(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export function buildFs(): FsDir {
  const home = dir("~");

  home.children["about.md"] = file(
    "about.md",
    [
      `# ${siteConfig.name}`,
      "",
      siteConfig.titles.map((t) => titleCase(t)).join(" · "),
      "",
      siteConfig.description,
      "",
      ...aboutHighlights.map((h) => `- **${h.title}** — ${h.description}`),
    ].join("\n")
  );

  home.children["contact.txt"] = file(
    "contact.txt",
    [
      `email:     ${siteConfig.email}`,
      `phone:     ${siteConfig.phoneDisplay}`,
      `instagram: ${siteConfig.instagram} (${siteConfig.instagramUrl})`,
      `web:       ${siteConfig.url}`,
      "",
      `status:    ${siteConfig.availability}`,
    ].join("\n")
  );

  home.children["skills.json"] = file(
    "skills.json",
    JSON.stringify(
      Object.fromEntries(skillLevels.map((s) => [s.name, { level: s.level, category: s.category }])),
      null,
      2
    )
  );

  const stack = dir("stack");
  stack.children["languages.txt"] = file(
    "languages.txt",
    languages.map((l) => l.name).join("\n")
  );
  for (const c of techCategories) {
    stack.children[`${c.id}.txt`] = file(
      `${c.id}.txt`,
      [`# ${c.label}`, `# ${c.description}`, "", ...c.items.map((i) => i.name)].join("\n")
    );
  }
  home.children["stack"] = stack;

  const proj = dir("projects");
  for (const p of projects) {
    const d = dir(p.slug);
    d.children["README.md"] = file(
      "README.md",
      [
        `# ${p.title}`,
        `> ${p.category}`,
        "",
        p.description,
        "",
        "## Stack",
        ...p.tech.map((t) => `- ${t}`),
        ...(p.github ? ["", `source: ${p.github}`] : []),
        ...(p.demo ? [`live: ${p.demo}`] : []),
      ].join("\n")
    );
    d.children["stack.txt"] = file("stack.txt", p.tech.join("\n"));
    proj.children[p.slug] = d;
  }
  home.children["projects"] = proj;

  home.children["services.txt"] = file(
    "services.txt",
    services.map((s) => `[${s.block.toUpperCase().padEnd(6)}] ${s.title} — ${s.description}`).join("\n")
  );

  home.children["process.txt"] = file(
    "process.txt",
    processSteps.map((s) => `${s.number}  ${s.title.padEnd(14)} ${s.stage.padEnd(9)} ${s.description}`).join("\n")
  );

  // the site's own source tree, from the build-time embed
  const src = dir("site");
  for (const s of SOURCES) {
    const parts = s.path.split("/");
    let cur = src;
    for (let i = 0; i < parts.length - 1; i++) {
      const name = parts[i];
      if (!cur.children[name]) cur.children[name] = dir(name);
      cur = cur.children[name] as FsDir;
    }
    cur.children[parts[parts.length - 1]] = file(parts[parts.length - 1], s.text);
  }
  home.children["site"] = src;

  home.children[".bashrc"] = file(
    ".bashrc",
    [
      "# ~/.bashrc",
      'export PS1="\\u@\\h:\\w\\$ "',
      "alias ll='ls -la'",
      "alias gs='git status'",
      "alias deploy='echo \"ship it 🚀\"'",
      "",
      "# easter eggs are enabled. try: sudo hire osman",
    ].join("\n")
  );

  return home;
}

export function resolvePath(root: FsDir, cwd: string[], input: string): { node: FsNode | null; parts: string[] } {
  let parts: string[];
  if (input.startsWith("~") || input.startsWith("/")) {
    parts = [];
    input = input.replace(/^~\/?|^\//, "");
  } else {
    parts = [...cwd];
  }
  for (const seg of input.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") {
      parts.pop();
      continue;
    }
    parts.push(seg);
  }
  let node: FsNode = root;
  for (const seg of parts) {
    if (node.kind !== "dir" || !node.children[seg]) return { node: null, parts };
    node = node.children[seg];
  }
  return { node, parts };
}

export function tree(node: FsDir, prefix = "", depth = 0, maxDepth = 3): string[] {
  const out: string[] = [];
  const names = Object.keys(node.children).sort((a, b) => {
    const da = node.children[a].kind === "dir" ? 0 : 1;
    const db = node.children[b].kind === "dir" ? 0 : 1;
    return da - db || a.localeCompare(b);
  });
  names.forEach((name, i) => {
    const last = i === names.length - 1;
    const child = node.children[name];
    out.push(`${prefix}${last ? "└── " : "├── "}${name}${child.kind === "dir" ? "/" : ""}`);
    if (child.kind === "dir" && depth < maxDepth) {
      out.push(...tree(child, prefix + (last ? "    " : "│   "), depth + 1, maxDepth));
    }
  });
  return out;
}
