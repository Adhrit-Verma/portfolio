# DEDSEC://BROADCAST — Adhrit Verma

Portfolio for an **AI Software Engineer** (LangGraph multi-agent pipelines, RAG, MCP), built as a
Watch_Dogs 2 pirate broadcast: one real-time 3D world behind every page, a camera that flies through it
as you scroll, and a swarm of 740 shapes that re-forms into each project — under street-poster type,
sticker tape and pixel art. Pages: `/` (the broadcast), `/work` (every file), `/work/[slug]` (a flight
through one project: purpose, the pipeline node by node, perks, stack, evidence, limits), `/record`.

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
| [design-system.md](design-system.md) | **Read this first.** Palette, type, the world, motion vocabulary, performance rules, accessibility floor. |
| [src/lib/projects.ts](src/lib/projects.ts) | **Every project** — purpose, perks, tech + role, metrics, flow, limits — from each repo's README. |
| [src/lib/resume.ts](src/lib/resume.ts) | Identity, experience, skills, credentials. Edit content here, never in components. |
| [src/components/world/](src/components/world/) | The 3D world: `formations.ts` (where the shapes go), `scenes.ts` (camera direction per page), `World.tsx` (renderer, GPU swarm, pacing, quality governor). |
| [src/components/home.tsx](src/components/home.tsx) | The home broadcast: intro, dive, stats, channels, archive, loadout, connect. |
| [src/components/Dossier.tsx](src/components/Dossier.tsx) | A project page. `WorkIndex.tsx` is `/work`; `chapters.tsx` + `CaseLog.tsx` are `/record`. |
| [src/components/pop.tsx](src/components/pop.tsx) | Kinetic poster type, tape, stickers, shapes, the off-screen animation gate. |
| [src/components/pixel.tsx](src/components/pixel.tsx) | LED face, pixel meter, 8×8 icons, Bayer-dither page cut. |
| [art/blender/](art/blender/) | Procedural Blender artifacts → `art/renders/*.webp` (Blender 5.2, `./render_all.sh [slug…]`). Used by the share cards. |
| [video/](video/) | Remotion: composes the OpenGraph share cards → `public/og/*.jpg` (`cd video && npm i && npm run render`). |
| [scripts/inspect.mjs](scripts/inspect.mjs) | UI inspection (Playwright + axe): frames as a visitor sees them + every scene settled. Used by the `ui-inspector` agent. |
| [scripts/perf.mjs](scripts/perf.mjs) | Frame-time benchmark at 1× and 4× CPU; `PROFILE=1` for a self-time profile. `layout-trace.mjs` finds forced layouts. |
| [public/work/](public/work/) | Real product imagery from the project repos, and Jimmy's launch film. |

## The chapters

`Boot` (access sequence) → `Hero` (profile card) → `Profile` → `AccessPanel` (skills) →
`HackedFiles` (projects) → `CaseLog` (experience) → `Credentials` → `Connect`.

The AI project work leads; the employment record follows it.

Composed in [src/app/page.tsx](src/app/page.tsx).

## Who owns what animation

They never share a timeline — that's deliberate.

- **GSAP + ScrollTrigger** — everything scroll-driven: reveals, counters, the case-log spine, the boot sequence.
- **Framer Motion** (`motion` pkg) — pointer state only: card lift, nav rail, button press.
- **React Three Fiber + drei** — two scenes, both lazy-loaded via `next/dynamic` and never mounted
  on coarse pointers, narrow screens, ≤4 cores, or under reduced motion:
  - `HeroField` — a 420-node cloud, neighbours resolved once at init.
  - `AgentGraph` — the pipeline topology in the Files chapter. One `InstancedMesh`, per-instance
    colour, and an execution front that sweeps the layers as you scroll. ScrollTrigger writes a
    number into a ref and `useFrame` reads it, so the hot path triggers no React renders.
    It oscillates rather than spins — a full rotation turns the pipeline edge-on and the
    left-to-right shape stops reading. Without the 3D layer the panel collapses to a compact
    text strip instead of leaving an empty box.
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

## Imagery

Every featured project carries a visual, because a portfolio made only of type gives a reader
nothing to look at. All of it is real and each is labelled for what it is:

- **Contrast** — actual product screenshots from `Adhrit-Verma/Contrast/docs`.
- **ClauseGuard** — a drawn schematic of its real three-agent graph. It has no UI to capture, and
  a fabricated screenshot would be a lie, so the figure says "Schematic — not a screenshot".
- **TableFox** — its published benchmark as bars, with the measurement caveats printed underneath.
- **Gradient Dense Code** — the repo's own encode animation.

To refresh the screenshots, re-download them into `public/work/` from the source repos; the paths
live in `src/lib/resume.ts`.

## Content notes

Copy comes from two JD-targeted resumes (AI Software Engineer, Forward Deployed Engineer),
cross-checked against the live public repos at [github.com/Adhrit-Verma](https://github.com/Adhrit-Verma).
**Where a repo and a resume disagree, the repo wins** — it is the artifact a reader can go and verify.

> Known divergence: Contrast's suite is **72 tests** in the repo; both resume PDFs still say 68.
> This site uses 72. Worth updating the PDFs.

**Featured** (full dossier cards, each linking to its repo): Contrast, ClauseGuard, TableFox.
**Recovered** (compact cards, also linked): Two-Agent Self-Extending AI System, Gradient Dense Code.

The recovered list is deliberately short. LocalDocQA and AuDiX were cut — a long tail of minor
repos dilutes the three that carry the positioning. Add one back only if it earns its place.

Aviatrack and the HRM Web Application live in the Case Log rather than Files — they are client work,
not public repos.

To add or move a project, edit the `files` (featured) or `recovered` (compact) arrays in
[src/lib/resume.ts](src/lib/resume.ts). No component changes needed.
