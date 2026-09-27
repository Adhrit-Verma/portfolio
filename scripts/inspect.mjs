// The UI inspector's instrument. Serves the static export in out/, walks every
// route at desktop + mobile (+ desktop with reduced motion), scrolls through so
// every scroll-triggered reveal fires, and records what a reviewer needs:
//
//   inspect/report.md    — machine checks per route/viewport, worst first
//   inspect/report.json  — same, structured
//   inspect/shots/…      — screenshots in ~1600px chunks for visual review
//
//   npm run build && node scripts/inspect.mjs [route ...]
//
// Machine checks: console errors, page errors, failed requests, broken images,
// horizontal overflow, clipped headings, text left invisible after scrolling,
// and axe-core WCAG 2.x A/AA violations. Visual judgement is the agent's job.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const OUT = path.resolve("out");
const DIR = path.resolve("inspect");
if (!existsSync(OUT)) throw new Error("out/ missing — run `npm run build` first");

const slugs = [...readFileSync("src/lib/projects.ts", "utf8").matchAll(/slug: "([\w-]+)"/g)].map((m) => m[1]);
const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/work", "/record", ...slugs.map((s) => `/work/${s}`), "/no-such-file"];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, reducedMotion: "no-preference" },
  { name: "mobile", width: 390, height: 844, reducedMotion: "no-preference", isMobile: true, hasTouch: true },
  { name: "reduced", width: 1440, height: 900, reducedMotion: "reduce" },
];

// ---------------------------------------------------------------- tiny static server
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp",
  ".png": "image/png", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain" };
const resolveFile = (url) => {
  const p = decodeURIComponent(new URL(url, "http://x").pathname);
  for (const c of [p, `${p}.html`, path.join(p, "index.html")]) {
    const f = path.join(OUT, c);
    if (f.startsWith(OUT) && existsSync(f) && statSync(f).isFile()) return [f, 200];
  }
  return [path.join(OUT, "404.html"), 404];
};
const server = createServer((req, res) => {
  const [f, code] = resolveFile(req.url);
  const buf = readFileSync(f);
  const type = TYPES[path.extname(f)] ?? "application/octet-stream";
  const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
  if (range && code === 200) {
    const start = +range[1], end = range[2] ? +range[2] : buf.length - 1;
    res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${buf.length}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
    return res.end(buf.subarray(start, end + 1));
  }
  res.writeHead(code, { "Content-Type": type, "Accept-Ranges": "bytes" });
  res.end(buf);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}`;

// ------------------------------------------------------------------------- run
rmSync(DIR, { recursive: true, force: true });
mkdirSync(path.join(DIR, "shots"), { recursive: true });
// GPU flags so the WebGL world renders headless instead of falling back to a blank canvas.
const browser = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] });
const results = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: vp.reducedMotion,
    isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: 1 });
  // Skip the once-per-session boot overlay so it isn't screenshotted on top of the hero.
  await ctx.addInitScript(() => sessionStorage.setItem("ctos-booted", "1"));

  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const r = { route, viewport: vp.name, consoleErrors: [], pageErrors: [], failedRequests: [], issues: [], axe: [], shots: [] };
    page.on("console", (m) => {
      // the 404 route's own status is expected, not an error
      if (m.type() === "error" && !(route === "/no-such-file" && /status of 404/.test(m.text()))) r.consoleErrors.push(m.text().slice(0, 300));
    });
    page.on("pageerror", (e) => r.pageErrors.push(String(e).slice(0, 300)));
    page.on("response", (res) => {
      const expected404 = route === "/no-such-file" && res.url() === BASE + route;
      if (res.status() >= 400 && !expected404) r.failedRequests.push(`${res.status()} ${res.url().replace(BASE, "")}`);
    });
    page.on("requestfailed", (q) => {
      const why = q.failure()?.errorText ?? "";
      if (!/ERR_ABORTED/.test(why)) r.failedRequests.push(`FAILED ${q.url().replace(BASE, "")} ${why}`);
    });

    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Scroll through like a reader so every ScrollTrigger reveal fires.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += vp.height * 0.6) {
      if (vp.isMobile) await page.evaluate((to) => window.scrollTo(0, to), y);
      else await page.mouse.wheel(0, vp.height * 0.6);
      await page.waitForTimeout(140);
    }
    await page.waitForTimeout(1200);

    r.issues.push(...(await page.evaluate(() => {
      const out = [];
      const vw = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > vw + 1)
        out.push(`horizontal overflow: page is ${document.documentElement.scrollWidth}px wide in a ${vw}px viewport`);
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width && r.right > vw + 1 && getComputedStyle(el).position !== "fixed" && !el.closest("[aria-hidden='true'], .overflow-hidden, .overflow-x-auto, .sr-only, canvas, svg"))
          { out.push(`element past right edge: <${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 60)}"> right=${Math.round(r.right)}`); if (out.length > 12) break; }
      }
      document.querySelectorAll("img").forEach((img) => {
        if (img.complete && img.naturalWidth === 0) out.push(`broken image: ${img.getAttribute("src")}`);
        if (img.getAttribute("loading") !== "lazy" && !img.complete) out.push(`image never loaded: ${img.getAttribute("src")}`);
      });
      document.querySelectorAll("h1, h2, h3").forEach((h) => {
        if (!h.closest(".sr-only") && h.scrollWidth > h.clientWidth + 2 && getComputedStyle(h).overflow !== "visible")
          out.push(`clipped heading: "${h.textContent.trim().slice(0, 50)}"`);
      });
      // Text a reveal animation left hidden after the reader has scrolled past it.
      document.querySelectorAll("[data-stagger], h1, h2, h3, p").forEach((el) => {
        // [data-shader-covered]: the hero h1 fades out once its WebGL twin has painted it
        if (!el.textContent.trim() || el.closest("[aria-hidden='true'], .sr-only, [data-shader-covered]")) return;
        let n = el, o = 1;
        while (n && n !== document.body) { o *= +getComputedStyle(n).opacity; n = n.parentElement; }
        if (o < 0.3) out.push(`text stuck invisible (opacity ${o.toFixed(2)}): "${el.textContent.trim().slice(0, 50)}"`);
      });
      if (document.querySelectorAll("h1").length !== 1) out.push(`${document.querySelectorAll("h1").length} h1 elements (want 1)`);
      return [...new Set(out)];
    })));

    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    r.axe = axe.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help,
      nodes: v.nodes.slice(0, 4).map((n) => `${n.target.join(" ")} — ${n.failureSummary?.split("\n")[1]?.trim() ?? ""}`) }));

    // Frames as a visitor sees them: scroll, let the camera and swarm settle, capture the viewport.
    // (Full-page capture would stretch the fixed WebGL stage to the page height.)
    const slug = (route === "/" ? "home" : route.slice(1).replace(/\//g, "_")) + `-${vp.name}`;
    const full = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.round(vp.height * 0.9);
    for (let y = 0, i = 0; y < full - vp.height * 0.5 && i < 16; y += step, i++) {
      await page.evaluate((to) => window.scrollTo(0, to), y);
      await page.waitForTimeout(1100);
      const file = path.join("shots", `${slug}-${String(i).padStart(2, "0")}.png`);
      await page.screenshot({ path: path.join(DIR, file) });
      r.shots.push(file);
    }
    // Scene stills: each registered world scene, mid-way through, fully settled —
    // judges the formation and framing, not a morph in flight.
    const sceneIds = await page.evaluate(() => window.__scenes ?? []);
    for (const id of vp.name === "reduced" ? [] : sceneIds) {
      const ok = await page.evaluate((sid) => {
        const el = document.getElementById(sid);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        window.scrollTo(0, r.top + window.scrollY + Math.min(r.height * 0.3, r.height - window.innerHeight * 0.45) - window.innerHeight / 2);
        return true;
      }, id);
      if (!ok) continue;
      await page.waitForTimeout(2600);
      const file = path.join("shots", `${slug}-scene-${id}.png`);
      await page.screenshot({ path: path.join(DIR, file) });
      r.shots.push(file);
    }
    results.push(r);
    await page.close();
    process.stdout.write(`${route} @ ${vp.name}: ${r.issues.length + r.axe.length + r.consoleErrors.length + r.pageErrors.length + r.failedRequests.length} findings\n`);
  }
  await ctx.close();
}
await browser.close();
server.close();

// ------------------------------------------------------------------------ report
const count = (r) => r.issues.length + r.axe.length + r.consoleErrors.length + r.pageErrors.length + r.failedRequests.length;
const lines = ["# UI inspection — machine checks", "",
  `${results.length} route/viewport runs · ${results.reduce((n, r) => n + count(r), 0)} findings`, ""];
for (const r of [...results].sort((a, b) => count(b) - count(a))) {
  lines.push(`## ${r.route} @ ${r.viewport} — ${count(r)} findings`);
  for (const [k, list] of [["page error", r.pageErrors], ["console error", r.consoleErrors], ["request", r.failedRequests], ["layout", r.issues]])
    list.forEach((x) => lines.push(`- **${k}**: ${x}`));
  r.axe.forEach((v) => lines.push(`- **axe ${v.impact}** \`${v.id}\`: ${v.help}`, ...v.nodes.map((n) => `  - ${n}`)));
  lines.push(`- shots: ${r.shots.join(", ")}`, "");
}
writeFileSync(path.join(DIR, "report.md"), lines.join("\n"));
writeFileSync(path.join(DIR, "report.json"), JSON.stringify(results, null, 2));
console.log(`\nreport: inspect/report.md`);
