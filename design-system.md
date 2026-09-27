# DEDSEC://BROADCAST — Design System

Bespoke system for `adhritverma.dev`. Reference: **Watch_Dogs 2**, the San Francisco side of DedSec —
not WD1's grim blue-grey terminal. The concept: the site is a **pirate broadcast** hijacking your screen,
the way DedSec hijacks billboards. One real-time 3D world sits behind every page and a camera flies
through it as you scroll; street-poster type, sticker tape and pixel art sit on top of it.

Source of truth. Do not re-litigate these values elsewhere.

---

## 1. Color

| Token | Hex | Role |
|---|---|---|
| `void` | `#0E0C0B` | Ground. Warm off-black (R>G>B) — never `#000`. |
| `panel` / `panel-hi` | `#15120F` / `#1C1815` | Panels, raised states. |
| `line` / `line-hot` | `#2B2724` / `#3F3833` | Hairlines. |
| `ink` | `#EDE9E3` | Body text. Never `#FFF`. |
| `dim` | `#A39C94` | Secondary text. |
| `signal` | `#FF6B1A` | **DedSec orange.** Identity, CTAs, key numbers. |
| `hot` | `#FF2E88` | Hot magenta. Riso plate, REC light, one poster word per section. |
| `acid` | `#FFD23F` | Sticker yellow. Kinds/subtitles, the hazard tape. |
| `scan` | `#4FE3D6` | ctOS cyan. System chrome, the second riso plate. |

Contrast on `void`: `ink` 16.1:1 · `dim` 7.2:1 · `signal` 6.8:1 · `scan` 12.4:1 · `acid` 13:1 · `hot` 5.2:1.
Never use `/opacity` variants of `dim` for text — they drop under 4.5:1.

Rules: a section leads with one pop colour; poster headlines may carry a second in one word. No neon
green. Colour never carries meaning alone.

## 2. Typography

| Face | Where | Why |
|---|---|---|
| **Anton** | Poster type — every headline, big numbers | Condensed street-poster weight; reads at 15rem and at 2rem. Also the `--font-display` role. |
| **JetBrains Mono** | Chrome — labels, readouts, nav, tapes | A real code face, tabular figures for counters. |
| **Inter** | Body copy | Gets out of the way so the loud faces stay loud. |

Self-hosted via `next/font/google`. Poster sizes are capped by **both** width and height —
`clamp(min, min(Nvw, Msvh), max)` — so a wide-but-short window never pushes a headline under the nav.

`.riso` prints magenta and cyan plates a hair off-register behind poster type. `.outline-text` for a
stroked word. Never riso body copy.

## 3. The world (`src/components/world/`)

One swarm of **740 shapes** (440 cubes, 150 pyramids, 150 spheres) and one camera, behind every page.

- **Formations** (`formations.ts`) are pure data: where each shape goes. Because it's always the same
  shapes, any formation morphs into any other. Each project's **glyph** is a literal model of what it
  does — GDC's modules extruded by gray level, TableFox's schema graph with only the retrieved tables lit,
  Jimmy's ring of remembered moments beamed to the listening pill, a project's **pipe** is its real
  pipeline, one node cluster per step. Plus the host mask (Wrench-style LED eyes, a hood), the tunnel,
  the stadium wall, the atom, the helix and a quiet field.
- **Scenes** (`scenes.ts`) pair a DOM section with a formation and a camera move (from → to across the
  section). Scroll is the clock: in the last 38% of a viewport of each section, the swarm morphs into the
  next scene — staggered per shape, arcing outward on a swirl, springing home — while the camera swings
  with an FOV punch, roll and a chromatic-aberration kick. Phones get their own framing (subject lifted
  into the top band, camera pulled back).
- **Persistence**: the world lives in the root layout, so navigating continues the motion — a dossier's
  last section already shows the *next* project's glyph.

**No glow.** No bloom: flat, lit colour reads crisper under poster type and costs nothing. Post is
chromatic aberration (cuts only), grain, vignette, Khronos Neutral tone mapping (keeps orange orange).

## 4. Motion vocabulary

| Name | What | Owner |
|---|---|---|
| `boot` | Broadcast hijack: static → colour bars → "signal acquired" → CRT collapse onto the site. Once per session. | GSAP |
| `morph` | The swarm re-forming between scenes, scroll-scrubbed. | `World.tsx` |
| `kinetic` | Poster type rising letter by letter out of a per-line mask. Above-the-fold type waits for `boot`. | GSAP SplitText (`Kinetic`) |
| `channel` | Switching featured projects: the panel tears in from a slice, then settles. | CSS `channel-in` |
| `dither` | The page cut: void blocks dissolve in 4×4 Bayer order on client navigation. | Canvas, `PixelWipe` |
| `led` | The LED face as a status light: blinks, scans on navigation, hearts the CTA, X X on 404. | `PixelFace` |
| `meter` | One block per unit — 72 tests are 72 blocks. | `PixelMeter` |
| `lock-on` | The cursor is a ctOS reticle that snaps to interactive targets and names the action. | Raw rAF, `CtosCursor` |
| `tape` / `sticker` | Marquee tape and rotating stickers — WD2's sticker-bomb layer. | CSS |

**Performance rules** (measured with `scripts/perf.mjs` / `layout-trace.mjs` — keep them true):
- Animate `transform` / `opacity` only. Never animate `clip-path`, `width`/`height` or filters per frame.
- No `backdrop-filter` over the canvas — it re-blurs every frame. `.glass` is a solid tint.
- Rotate HTML wrappers, never SVG elements (SVG transform animations aren't composited).
- Keep marquee strips short enough to stay a GPU layer; looping CSS animations pause off screen
  (`AnimationGate`).
- The swarm's idle motion runs in its vertex shader; the CPU only springs shapes during a morph.
  Frames are paced 60fps while anything moves, 30fps idle; a governor steps DPR/post down on slow devices.

## 5. Accessibility floor

- **Reduced motion**: no boot, no Lenis, no reticle, no kinetic type, no dither; the world snaps per scene
  and renders only on scroll. Everything reads in its finished state.
- The world, stickers, tapes and meters are decorative and `aria-hidden`; what they say is said in text
  too (skills as an `sr-only` list beside the tapes, the pipeline as an ordered list of steps, the featured
  channels as an `sr-only` link list).
- Text over the world always sits on a scrim or `.glass`; the reading backdrop (`field`) is dark and far.
- One `h1` per page, sections `aria-labelledby`, `:focus-visible` cyan ring, keyboard-reachable everything.
- Content is in the DOM at full opacity without JS.
