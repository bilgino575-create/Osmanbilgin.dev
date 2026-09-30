/**
 * Toggle one world at a time (screen, silicon, network) three times and print
 * renderer.info.memory after each step. A texture or geometry count that climbs
 * on every mount is a leak in that world.
 *   node scripts/leak.mjs   (against http://localhost:3000, software GL)
 */
import puppeteer from "puppeteer";
const browser = await puppeteer.launch({
  headless: true,
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1000, height: 600 });
await page.goto("http://localhost:3000/?gl=1&tier=high", { waitUntil: "domcontentloaded", timeout: 120000 });
await new Promise((r) => setTimeout(r, 14000));
const snap = async (p) => { await page.evaluate((p) => window.__snap?.(p), p); await new Promise((r) => setTimeout(r, 5000)); const s = await page.evaluate(() => window.__stats?.()); return `p=${p} tex=${s.memory.textures} geo=${s.memory.geometries} prog=${s.programs}`; };
const tests = { screen: [0.0, 0.3], silicon: [0.3, 0.55], network: [0.55, 0.75] };
for (const [name, [a, b]] of Object.entries(tests)) {
  console.log("==", name);
  console.log(await snap(a));
  for (let i = 0; i < 3; i++) { console.log(await snap(b)); console.log(await snap(a)); }
}
await browser.close();
