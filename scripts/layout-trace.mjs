// Who forces layout / style recalc while scrolling? Traces 4s of wheel scrolling
// on the static export and groups Layout + UpdateLayoutTree events by the JS
// frame that triggered them.   node scripts/layout-trace.mjs [route]
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const OUT = path.resolve("out");
const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const f = [p, `${p}.html`, path.join(p, "index.html")].map((c) => path.join(OUT, c)).find((c) => existsSync(c) && statSync(c).isFile());
  res.writeHead(f ? 200 : 404);
  res.end(f ? readFileSync(f) : "");
});
await new Promise((r) => server.listen(0, r));
const browser = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem("ctos-booted", "1"));
const page = await ctx.newPage();
await page.goto(`http://localhost:${server.address().port}${process.argv[2] ?? "/"}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.mouse.move(700, 450);
if (process.env.NOANIM) await page.addStyleTag({ content: process.env.NOANIM === "all" ? "*,*::before,*::after{animation:none!important}" : `${process.env.NOANIM}{animation:none!important}` });

await browser.startTracing(page, { categories: ["devtools.timeline", "disabled-by-default-devtools.timeline.stack"] });
for (let k = 0; k < 40; k++) {
  await page.mouse.wheel(0, 160);
  await page.waitForTimeout(90);
}
const buf = await browser.stopTracing();
const events = JSON.parse(buf.toString()).traceEvents;

const tally = new Map();
for (const e of events) {
  if (e.name !== "Layout" && e.name !== "UpdateLayoutTree") continue;
  const st = e.args?.beginData?.stackTrace ?? e.args?.data?.stackTrace;
  const top = st?.[0];
  const key = `${e.name.padEnd(16)} ${top ? `${top.functionName || "(anon)"} ${top.url.split("/").pop()}:${top.lineNumber}:${top.columnNumber}` : "(no JS — rendering pipeline)"}`;
  const t = tally.get(key) ?? { n: 0, ms: 0 };
  t.n++;
  t.ms += (e.dur ?? 0) / 1000;
  tally.set(key, t);
}
[...tally.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 15).forEach(([k, v]) => console.log(`${String(v.n).padStart(5)}x ${v.ms.toFixed(0).padStart(5)}ms  ${k}`));
await browser.close();
server.close();
