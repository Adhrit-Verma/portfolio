# DEDSEC DOSSIER — Adhrit Verma

A scroll-driven portfolio built as a **ctOS-style profile hack**: you don't browse sections,
you decrypt a dossier. Watch_Dogs 2's San Francisco hacktivist language — DedSec orange on warm
off-black, HUD scan-boxes, glitch as a *cut* — not Watch_Dogs 1's grim green-on-black terminal.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build       # static export -> out/
npx serve out       # preview the export exactly as Netlify will serve it
npx eslint src      # lint (clean)
npx tsc --noEmit    # typecheck (clean)
```

Node 20+. No env vars, no external services.

`next.config.ts` sets `output: "export"`, so `npm run build` writes plain files to `out/`
and there is no server to run — `npm start` does not apply.

## Deploy to Netlify

[netlify.toml](netlify.toml) has everything: build command, publish directory (`out`), and
Node version. Nothing to configure in the Netlify UI.

**From the dashboard:** *Add new site → Import an existing project*, pick this repo, deploy.
Netlify reads `netlify.toml` and the detected settings will already be correct.

**From the CLI:**

```bash
npm i -g netlify-cli
netlify init      # link the repo, once
netlify deploy --prod
```

Because the site is a static export, Netlify serves it as plain files — no Next.js runtime,
no serverless functions, no cold starts. `NETLIFY_NEXT_PLUGIN_SKIP` in `netlify.toml` turns
off the auto-installed Next runtime, which has nothing to do here.

If you ever add a route handler, server action, or `next/image`, drop `output: "export"` from
`next.config.ts`, remove `NETLIFY_NEXT_PLUGIN_SKIP`, and change `publish` to `.next` — Netlify's
Next.js runtime takes over from there.

## Where things live

| Path | What |
|---|---|
| [design-system.md](design-system.md) | **Read this first.** Palette, type pairing, the five named motion patterns, accessibility floor. Source of truth. |
| [src/lib/resume.ts](src/lib/resume.ts) | **Every word on the site.** Copy lifted verbatim from the resume PDF. Edit content here, never in components. |
| [src/lib/motion.ts](src/lib/motion.ts) | The motion vocabulary — `scan`, `typeOn`, `countUp`, `glitchCut` — plus the media-query hooks. |
| [src/app/globals.css](src/app/globals.css) | Design tokens as a Tailwind v4 `@theme` block, texture classes, keyframes, reduced-motion rules. |
| [src/components/hud.tsx](src/components/hud.tsx) | HUD primitives: `ScanPanel`, `Corners`, `ChapterHeader`, `Pill`, `Stencil`. |
| [src/components/](src/components/) | One file per chapter. `chapters.tsx` holds the four simpler ones. |

## The chapters

`Boot` (access sequence) → `Hero` (profile card) → `Profile` → `AccessPanel` (skills) →
`CaseLog` (experience) → `HackedFiles` (projects) → `Credentials` → `Connect`.

Composed in [src/app/page.tsx](src/app/page.tsx).

## Who owns what animation

They never share a timeline — that's deliberate.

- **GSAP + ScrollTrigger** — everything scroll-driven: reveals, counters, the case-log spine, the boot sequence.
- **Framer Motion** (`motion` pkg) — pointer state only: card lift, nav rail, button press.
- **React Three Fiber + drei** — one thing: the hero node network. Lazy-loaded via `next/dynamic`,
  420 nodes, neighbours resolved once at init, and never mounted on coarse pointers, narrow screens,
  ≤4 cores, or under reduced motion.
- **Lenis** — smooths scroll and drives GSAP's ticker. Not mounted under reduced motion.

## Accessibility

The site owner ships an accessibility auditor, so the bar is that bar.

- `prefers-reduced-motion` gets a **calmer site, not a broken one**: no boot overlay, no 3D, no smooth
  scroll, scan boxes render finished (brackets drawn, counters at final value), glitch becomes a fade.
- All text meets WCAG AA on the dark palette (measured values in `design-system.md` §1).
- Fully readable with JavaScript disabled — counters render their real values in the HTML and
  animations only take content away and hand it back.
- Skip link, one `h1`, `<section aria-labelledby>` per chapter, visible cyan `:focus-visible` ring,
  status carried by text (`LOCKED` / `DECRYPTED`) rather than color alone.

## Content notes

Real links are wired in (`LINKEDIN` / `GITHUB` at the top of `src/lib/resume.ts`).

The **Hacked Files** chapter has two tiers, and this is intentional:

- **Three full dossiers** — Aviatrack, HRM Web Application, Contrast — every line sourced from the resume.
- **Five partial fragments** in the `archive` array (Personal AI Assistant, Postgres Schema
  Intelligence, Dense Visual Encoding, Intranet Audio Broadcast, RAG Document Q&A). These carry a name
  and a one-line hook only, and the UI labels them `PARTIAL RECOVERY` — because no verified detail for
  them exists in the source resume. Nothing was invented to fill them out.

  **To promote one to a full card:** move its entry from `archive` into `files` in
  [src/lib/resume.ts](src/lib/resume.ts), matching the existing shape (`id`, `code`, `name`, `kind`,
  `hook`, `stack`, `body`, `metrics`). No component changes needed.
