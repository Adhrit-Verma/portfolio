// Quick look at specific spots: node scripts/shot.mjs <route> <width>x<height> <id>[@fraction] ...
// Saves inspect/spot-<id>-<w>.png — for checking one fix without a full inspection.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const [route, size, ...spots] = process.argv.slice(2);
const [W, H] = size.split("x").map(Number);
const OUT = path.resolve("out");
const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const f = [p, `${p}.html`, path.join(p, "index.html")].map((c) => path.join(OUT, c)).find((c) => existsSync(c) && statSync(c).isFile());
  res.writeHead(f ? 200 : 404);
  res.end(f ? readFileSync(f) : "");
});
await new Promise((r) => server.listen(0, r));
mkdirSync("inspect", { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.addInitScript(() => sessionStorage.setItem("ctos-booted", "1"));
await page.goto(`http://localhost:${server.address().port}${route}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
for (const spot of spots) {
  const [id, frac = "0.3"] = spot.split("@");
  // walk there so scroll-triggered reveals fire on the way
  const target = await page.evaluate(([sid, f]) => {
    const r = document.getElementById(sid).getBoundingClientRect();
    return r.top + window.scrollY + r.height * Number(f) - window.innerHeight / 2;
  }, [id, frac]);
  const from = await page.evaluate(() => window.scrollY);
  for (let k = 1; k <= 10; k++) {
    await page.evaluate((y) => window.scrollTo(0, y), from + ((target - from) * k) / 10);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `inspect/spot-${id}-${W}.png` });
}
await browser.close();
server.close();
