# DEDSEC DOSSIER — Design System

Bespoke system for `adhritverma.dev`. Reference: **Watch_Dogs 2 / ctOS profiler**, not Watch_Dogs 1.
WD1 is cold, grim, blue-grey Chicago. WD2 is warm, bright, San Francisco hacktivist — DedSec orange
over warm off-black, spray-stencil and sticker culture layered under clean HUD chrome, glitch used as
a *transition* (a cut), never as wallpaper.

Source of truth. Do not re-litigate these values elsewhere.

---

## 1. Color

| Token | Hex | Role |
|---|---|---|
| `void` | `#0B0D10` | Page ground. Warm off-black — never `#000`. |
| `panel` | `#12151A` | Dossier card / panel fill. |
| `panel-hi` | `#181C23` | Raised panel, hover state, table stripe. |
| `line` | `#262C35` | Hairline borders, grid texture. |
| `line-hot` | `#3A424E` | Active/hover hairline. |
| `ink` | `#E8E6E1` | Body text. Warm off-white — never `#FFF` on dark. |
| `dim` | `#9AA0A6` | Secondary text, metadata, timestamps. |
| `signal` | `#FF6B1A` | **DedSec orange.** Primary accent, CTAs, active state, key numbers. |
| `signal-soft` | `#FF9552` | Orange for smaller text where the pure hue gets shouty. |
| `scan` | `#4FE3D6` | ctOS cyan. Secondary "scan/system" accent — brackets, sweep lines, readouts. |
| `alert` | `#FF2E88` | **Transition only.** RGB-split channel + glitch cut. Never resting UI. |

**Contrast (measured, on `void`)** — all pass WCAG AA for their use:
`ink` 16.3:1 · `dim` 7.4:1 · `signal` 6.8:1 · `scan` 12.3:1.
`alert` is decorative only and never carries meaning alone.

Rules:
- One accent leads per chapter. Orange = identity/emphasis. Cyan = machine/system chrome.
- Saturated magenta+cyan split appears only during a `glitchCut`, capped at ~180ms.
- No pure black, no pure white, no neon-green-on-black. That's the wrong game.

## 2. Typography

| Face | Where | Why |
|---|---|---|
| **Chakra Petch** | Display headlines, chapter titles | Beveled, cut-corner terminals read as HUD geometry without cosplaying a "cyber" font. Condensed enough for long section titles on mobile. |
| **JetBrains Mono** | UI chrome — labels, stats, readouts, nav, timestamps, terminal copy | A real code face. Holds legibility at 11–12px where display faces fall apart, and its tabular figures keep count-up readouts from jittering. |
| **Inter** | Body copy | Neutral, tall x-height, engineered for screens. Gets out of the way so the two loud faces stay loud. |

All three self-hosted via `next/font/google` — no external request, no layout shift.

Scale: chapter titles `clamp(2.5rem, 7vw, 5.5rem)` uppercase, tight tracking.
Chrome labels `11px/0.18em` uppercase mono. Body `16–18px/1.65` max `68ch`.

## 3. Motion vocabulary

Five named patterns. Everything on the site is one of these — no one-off animations.

| Name | What it does | Owner |
|---|---|---|
| `boot` | Access sequence: mono lines type in, a progress readout ticks 0→100, the panel wipes away into the hero. Runs once per session. | GSAP |
| `scan` | **The signature move.** Four corner brackets draw in (clip-path), a cyan sweep line crosses the box, a percentage counts up, the label glitches into place, content staggers up. | GSAP + ScrollTrigger |
| `glitchCut` | Chapter boundary. ~180ms: horizontal slice offset + magenta/cyan channel split, then clean. A cut, not a texture. | CSS keyframes, GSAP-triggered |
| `typeOn` | Terminal type-on for one key line per chapter. Caret blinks, then resolves. | GSAP |
| `unlock` | Dossier card reveal: bracket snap, status flips `LOCKED` → `DECRYPTED`, body staggers in. Hover lifts + re-sweeps. | Framer Motion (hover) + GSAP (scroll) |

Easing: `--ease-hud` `cubic-bezier(.16,1,.3,1)` for reveals (fast out, long settle — HUD panels arriving).
`--ease-snap` `cubic-bezier(.6,0,.2,1)` for state flips and cuts.

**Library job split — they never share a timeline:**
- **GSAP + ScrollTrigger** owns everything scroll-driven: pinning, scrubbed timelines, reveals, counters, the case-log spine.
- **Framer Motion** owns pointer-driven component state only: hover, tap, layout. No scroll listeners.
- **React Three Fiber** owns one thing: the hero particle network. Lazy-loaded, capped, disabled on coarse pointers and reduced-motion.
- **Lenis** smooths the scroll and drives ScrollTrigger's ticker. Off under reduced-motion.

## 4. Texture & iconography

- **Circuit grid**: 1px lines at 3% alpha on a 48px pitch, plus a radial vignette. Background only, never over text.
- **Scanlines**: 2px repeating overlay at ~4% — only during `boot` and `glitchCut`, never resting.
- **Stencil marks**: sparse spray-stencil labels (`// DEDSEC`, `ACCESS GRANTED`, chapter index numerals)
  set in mono, rotated a degree or two, low alpha. WD2's street-art layer, used maybe six times site-wide.
- **Corner brackets** replace card borders as the primary framing device — a box is *scanned*, not drawn.

## 5. Accessibility floor

The site owner ships an accessibility auditor. Hold the bar.

- **`prefers-reduced-motion`**: a genuinely calmer site, not a broken one. Boot sequence resolves instantly to the hero, `scan` renders in its finished state (brackets drawn, counters at final value), `glitchCut` becomes a plain fade, Lenis and the 3D layer never mount. Nothing is hidden behind an animation that no longer runs.
- Contrast per the table above; never color-alone for meaning (status pills carry text).
- Glitch never obscures readable content for more than ~180ms, and never runs on a loop over body copy.
- Every interactive element reachable by keyboard with a visible `scan`-cyan focus ring, `:focus-visible` only.
- Semantic landmarks, one `h1`, chapters as `<section aria-labelledby>`, decorative layers `aria-hidden`.
- Content is in the DOM at full opacity before JS animates it down — no-JS gets a readable page.
