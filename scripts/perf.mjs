// Frame-time benchmark for the static export. Serves out/, scrolls the home page
// through every scene with the wheel (as a reader would), and reports frame times,
// main-thread long tasks and bytes transferred — at native CPU and at 4x throttle.
//
//   npm run build && node scripts/perf.mjs [route]
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const OUT = path.resolve("out");
const route = process.argv[2] ?? "/";
const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const f = [p, `${p}.html`, path.join(p, "index.html")].map((c) => path.join(OUT, c)).find((c) => existsSync(c) && statSync(c).isFile());
  res.writeHead(f ? 200 : 404);
  res.end(f ? readFileSync(f) : "");
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}`;
const browser = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });

async function run(throttle) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  await ctx.addInitScript(() => {
    sessionStorage.setItem("ctos-booted", "1");
    window.__long = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(e.duration))).observe({ type: "longtask", buffered: true });
  });
  const page = await ctx.newPage();
  let bytes = { js: 0, other: 0 };
  page.on("response", async (r) => {
    const len = Number(r.headers()["content-length"] ?? (await r.body().catch(() => Buffer.alloc(0))).length);
    if (r.url().endsWith(".js")) bytes.js += len;
    else bytes.other += len;
  });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await cdp.send("Performance.enable");
  const metric = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  const m0 = await metric();
  const profile = process.env.PROFILE && throttle > 1;
  if (profile) {
    await cdp.send("Profiler.enable");
    await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
    await cdp.send("Profiler.start");
  }

  await page.evaluate(() => {
    window.__frames = [];
    let last = performance.now();
    const tick = (t) => { window.__frames.push(t - last); last = t; if (!window.__stop) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 180) {
    await page.mouse.wheel(0, 180);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(800);
  if (profile) {
    // self time per function, top 25 — where the main thread actually goes
    const { profile: pr } = await cdp.send("Profiler.stop");
    const dt = new Map();
    pr.samples.forEach((id, k) => dt.set(id, (dt.get(id) ?? 0) + (pr.timeDeltas[k] ?? 0)));
    const agg = new Map();
    for (const n of pr.nodes) {
      const f = n.callFrame;
      const key = `${f.functionName || "(anon)"} ${f.url.split("/").pop()}:${f.lineNumber}`;
      agg.set(key, (agg.get(key) ?? 0) + (dt.get(n.id) ?? 0));
    }
    const total = [...agg.values()].reduce((a, b) => a + b, 0);
    [...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([k, v]) => console.log(`${((v / total) * 100).toFixed(1).padStart(5)}%  ${(v / 1000).toFixed(0).padStart(6)}ms  ${k}`));
    // PROFILE=<chunk>: who calls into that chunk (nearest frame outside it, with column)
    if (process.env.PROFILE !== "1") {
      const parent = new Map();
      pr.nodes.forEach((n) => (n.children ?? []).forEach((c) => parent.set(c, n.id)));
      const byId = new Map(pr.nodes.map((n) => [n.id, n]));
      const callers = new Map();
      for (const [id, t] of dt) {
        let n = byId.get(id);
        if (!n.callFrame.url.includes(process.env.PROFILE)) continue;
        while (n && n.callFrame.url.includes(process.env.PROFILE)) n = byId.get(parent.get(n.id));
        const f = n?.callFrame;
        const key = f ? `${f.functionName || "(anon)"} ${f.url.split("/").pop()}:${f.lineNumber}:${f.columnNumber}` : "(root)";
        callers.set(key, (callers.get(key) ?? 0) + t);
      }
      console.log("--- callers into", process.env.PROFILE);
      [...callers.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([k, v]) => console.log(`${(v / 1000).toFixed(0).padStart(6)}ms  ${k}`));
    }
  }
  const m1 = await metric();
  const d = (k) => ((m1[k] - m0[k]) * 1000).toFixed(0);
  console.log(`  cpu x${throttle} main thread ms — script ${d("ScriptDuration")} · style ${d("RecalcStyleDuration")} (${m1.RecalcStyleCount - m0.RecalcStyleCount}x) · layout ${d("LayoutDuration")} (${m1.LayoutCount - m0.LayoutCount}x) · task total ${d("TaskDuration")}`);
  const res = await page.evaluate(() => {
    window.__stop = true;
    const f = window.__frames.slice(5).sort((a, b) => a - b);
    const avg = f.reduce((a, b) => a + b, 0) / f.length;
    return { fps: 1000 / avg, p95: f[Math.floor(f.length * 0.95)], worst: f[f.length - 1], janky: f.filter((x) => x > 34).length / f.length, long: window.__long.length, longMs: window.__long.reduce((a, b) => a + b, 0) };
  });
  await ctx.close();
  return { ...res, js: bytes.js, other: bytes.other };
}

for (const t of [1, 4]) {
  const r = await run(t);
  console.log(
    `${route} cpu x${t}: ${r.fps.toFixed(1)} fps · p95 ${r.p95.toFixed(1)}ms · worst ${r.worst.toFixed(0)}ms · ` +
      `${(r.janky * 100).toFixed(1)}% frames >34ms · ${r.long} long tasks (${r.longMs.toFixed(0)}ms) · ` +
      `JS ${(r.js / 1024).toFixed(0)}KB · other ${(r.other / 1024).toFixed(0)}KB`,
  );
}
await browser.close();
server.close();
