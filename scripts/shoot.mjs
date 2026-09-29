/**
 * Headless screenshots for the self-critique loop.
 *
 *   node scripts/shoot.mjs [--url http://localhost:3000] [--out docs/screenshots] [--tag act1]
 *                          [--p 0,0.25] [--w 1440 --h 900] [--nogl] [--reduce] [--wait 4000]
 *
 * Chrome: set CHROME_PATH, otherwise the Playwright Chromium in /opt/pw-browsers
 * or "C:/Program Files/Google/Chrome/Application/chrome.exe" on Windows.
 */
import puppeteer from "puppeteer";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const get = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : d;
};
const has = (k) => args.includes(`--${k}`);

const url = get("url", "http://localhost:3000");
const out = get("out", "docs/screenshots");
const tag = get("tag", "shot");
const ps = get("p", "0").split(",").map(Number);
const w = Number(get("w", 1440));
const h = Number(get("h", 900));
const wait = Number(get("wait", 5000));
const mobile = w < 600;

const candidates = [
  process.env.CHROME_PATH,
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/opt/pw-browsers/chromium/chrome-linux/chrome",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));

mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--disable-dev-shm-usage",
    "--autoplay-policy=no-user-gesture-required",
  ],
});

const page = await browser.newPage();
await page.setViewport({
  width: w,
  height: h,
  deviceScaleFactor: 1,
  isMobile: mobile,
  hasTouch: mobile,
});
if (has("reduce")) {
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
}
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text()}`);
});
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

const q = [];
if (has("nogl")) q.push("nogl");
if (has("tier")) q.push(`tier=${get("tier", "high")}`);
if (has("debug")) q.push("debug");
const target = q.length ? `${url}?${q.join("&")}` : url;
await page.goto(target, { waitUntil: "domcontentloaded", timeout: 120000 });
await new Promise((r) => setTimeout(r, wait));

for (const p of ps) {
  await page.evaluate((p) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: p * max, behavior: "auto" });
    // software renderers run at <1 fps; jump the camera clock so the frame is representative
    if (window.__snap) window.__snap(p);
  }, p);
  // let the camera settle, and wait until the DOM panel for this progress is on screen
  await new Promise((r) => setTimeout(r, has("nogl") ? 400 : Number(get("settle", 4000))));
  if (!has("nogl")) {
    for (let i = 0; i < 40; i++) {
      const ok = await page.evaluate((p) => {
        const secs = [...document.querySelectorAll("section.section")];
        const near = secs
          .map((s) => ({ s, d: Math.abs(Number(s.dataset.anchor) - p) }))
          .sort((a, b) => a.d - b.d)[0];
        const stats = window.__stats ? window.__stats() : null;
        const rigOk = !stats || Math.abs(stats.rigP - p) < 0.01;
        return (!near || near.d > 0.06 || near.s.dataset.hidden === "false") && rigOk;
      }, p);
      if (ok) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  const file = path.join(out, `${tag}-${mobile ? "mobile" : "desktop"}-p${p.toFixed(2)}.png`);
  await page.screenshot({ path: file });
  console.log("saved", file);
}

if (has("stats")) {
  const stats = await page.evaluate(() => (window.__stats ? window.__stats() : null));
  console.log("stats", JSON.stringify(stats));
}

if (errors.length) {
  console.log("console:");
  for (const e of errors) console.log("  " + e);
} else {
  console.log("console: clean");
}

await browser.close();
