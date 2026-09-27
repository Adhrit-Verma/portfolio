"use client";

/**
 * The pixel layer. Watch_Dogs 2's DedSec language mixes dithering, ASCII, pixel
 * art and glitch; this file is the dithering + pixel-art half. Every piece
 * carries meaning — none of it is wallpaper:
 *
 *   PixelFace  — a Wrench-style LED mask used as a status readout: it blinks
 *                while idle, scans on navigation, hearts the contact CTA, and
 *                reads X X on a dead link.
 *   PixelMeter — one block per unit. A 72-test suite is 72 blocks.
 *   PixelIcon  — 8x8 sprites for the perks list.
 *   PixelWipe  — an ordered-dither (Bayer) dissolve on route change: the cut
 *                between pages, never a loop.
 */

import { useEffect, useRef, useState } from "react";
import type { PixelIconName } from "@/lib/projects";
import { useReducedMotion } from "@/lib/motion";

/* ------------------------------------------------------------------ bitmaps */

const rows = (s: string) => s.trim().split(/\s+/);

const ICONS: Record<PixelIconName, string[]> = {
  lock: rows("..####.. .#....#. .#....#. ######## ###..### ###..### ######## ########"),
  search: rows(".####... #....#.. #....#.. #....#.. .####... ....##.. .....##. ......##"),
  shield: rows("######## #......# #.....## #.#..#.# #..##..# .#....#. ..#..#.. ...##..."),
  mute: rows("...#.... ..##.... ####.#.# ####..#. ####.#.# ..##.... ...#.... ........"),
  ask: rows("..####.. .#....#. ......#. ....##.. ...#.... ...#.... ........ ...#...."),
  check: rows("........ .......# ......## #....##. ##..##.. .####... ..##.... ........"),
  loop: rows("..####.. .#....#. #......# #....### #.....#. .#...... ..####.. ........"),
  key: rows("........ .###.... #...#... #...#### #...#.## .###..#. ........ ........"),
  eye: rows("........ ..####.. .#....#. #..##..# #..##..# .#....#. ..####.. ........"),
  layers: rows("..###### ........ .######. ........ ######.. ........ ######## ........"),
  bolt: rows("....##.. ...##... ..##.... .######. ....##.. ...##... ..##.... .##....."),
  db: rows(".######. #......# .######. #......# .######. #......# .######. ........"),
  graph: rows("##....## ##....## ..#..#.. ...##... ...##... ..#..#.. ##....## ##....##"),
  grid: rows("##.##.## ##.##.## ........ ##.##.## ##.##.## ........ ##.##.## ##.##.##"),
  cam: rows("........ ..###... ######## #..##..# #.#..#.# #..##..# ######## ........"),
  gate: rows("#.#.#.#. ######## #.#.#.#. #.#.#.#. #.#.#.#. #.#.#.#. ######## ........"),
  box: rows("..#####. .#...##. #####.#. #...#.#. #...#.#. #...##.. #####... ........"),
};

export function PixelIcon({ name, size = 24, className = "" }: { name: PixelIconName; size?: number; className?: string }) {
  const bmp = ICONS[name];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 8 8"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
    >
      {bmp.flatMap((row, y) =>
        [...row].map((c, x) => (c === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null)),
      )}
    </svg>
  );
}

/* --------------------------------------------------------------- the LED mask */

export type Mood = "idle" | "blink" | "happy" | "heart" | "scan" | "dead";

// Each eye is 7x7. The right eye mirrors the left unless given.
export const EYES: Record<Mood, [string[], string[]?]> = {
  idle: [rows("....... ..###.. .#####. .#####. .#####. ..###.. .......")],
  blink: [rows("....... ....... ....... .#####. ....... ....... .......")],
  happy: [rows("....... ...#... ..#.#.. .#...#. #.....# ....... .......")],
  heart: [rows("....... .##.##. ####### ####### .#####. ..###.. ...#...")],
  scan: [
    rows("#...... .##.... ...##.. .....## ...##.. .##.... #......"),
    rows("......# ....##. ..##... ##..... ..##... ....##. ......#"),
  ],
  dead: [rows("#.....# .#...#. ..#.#.. ...#... ..#.#.. .#...#. #.....#")],
};

/**
 * Wrench's mask, reduced to its idea: two LED matrices that emote. Idle blinks
 * every few seconds unless reduced motion is on. `label` names the state for
 * assistive tech when the face is the only signal; otherwise it's aria-hidden.
 */
export function PixelFace({
  mood = "idle",
  cell = 3,
  label,
  className = "",
}: {
  mood?: Mood;
  cell?: number;
  label?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (reduced || mood !== "idle") return;
    let t: number;
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        t = window.setTimeout(() => {
          setBlink(false);
          loop();
        }, 140);
      }, 2600 + Math.random() * 2600);
    };
    loop();
    return () => window.clearTimeout(t);
  }, [mood, reduced]);

  const m: Mood = mood === "idle" && blink ? "blink" : mood;
  const [l, r] = EYES[m];
  const right = r ?? l;
  const W = 16; // 7 + 2 gap + 7
  const lit = (x: number, y: number) => (x < 7 ? l[y][x] === "#" : x > 8 ? right[y][x - 9] === "#" : false);
  const tone = m === "dead" ? "var(--color-alert)" : m === "scan" ? "var(--color-scan)" : "var(--color-signal)";

  return (
    <svg
      viewBox={`0 0 ${W} 7`}
      width={W * cell}
      height={7 * cell}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    >
      {Array.from({ length: 7 }, (_, y) =>
        Array.from({ length: W }, (_, x) =>
          x === 7 || x === 8 ? null : (
            <rect
              key={`${x}-${y}`}
              x={x + 0.1}
              y={y + 0.1}
              width={0.8}
              height={0.8}
              fill={lit(x, y) ? tone : "var(--color-line)"}
              opacity={lit(x, y) ? 1 : 0.55}
            />
          ),
        ),
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ meter */

/**
 * One block per unit, lit in order when it scrolls into view. The count is the
 * picture: 72 tests are visibly more than 23. CSS transition delays do the
 * sequencing, so nothing re-renders per block.
 */
export function PixelMeter({ count, tone = "signal" }: { count: number; tone?: "signal" | "scan" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [seen, setSeen] = useState(false);
  const on = seen || reduced; // reduced motion: shown finished, no sequence

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const color = tone === "scan" ? "var(--color-scan)" : "var(--color-signal)";
  const step = Math.min(28, 900 / count);
  return (
    <div ref={ref} aria-hidden="true" className="flex max-w-[16rem] flex-wrap gap-[3px]">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="block h-[7px] w-[7px]"
          style={{
            background: on ? color : "var(--color-line)",
            transition: `background-color 0s linear ${on && !reduced ? Math.round(i * step) : 0}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- wipe */

// 4x4 Bayer thresholds: the same ordered dither the Remotion infographics use.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/**
 * The page-to-page cut. A canvas of void blocks dissolves in Bayer order over
 * ~420ms; blocks on the dissolve front flash orange/cyan for one step. Mounted
 * from app/template.tsx, which remounts per navigation. Never on first load
 * (the page is already there; no-JS readers must never see a cover) and never
 * under reduced motion.
 */
let hydrated = false;

export function PixelWipe() {
  const reduced = useReducedMotion();
  const [armed] = useState(() => hydrated);
  const ref = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    hydrated = true;
    const cv = ref.current;
    if (!armed || reduced || !cv) {
      setDone(true);
      return;
    }
    const ctx = cv.getContext("2d");
    if (!ctx) return setDone(true);
    const B = window.innerWidth < 640 ? 24 : 36;
    const w = (cv.width = Math.ceil(window.innerWidth / B));
    const h = (cv.height = Math.ceil(window.innerHeight / B));
    const t0 = performance.now();
    const DUR = 420;
    let raf = 0;
    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / DUR);
      ctx.clearRect(0, 0, w, h);
      cv.style.background = "transparent"; // the CSS fill only covers the frame before the first draw
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const t = (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
          // a slow diagonal bias so the cut sweeps rather than pops
          const d = t * 0.65 + ((x / w + y / h) / 2) * 0.35;
          if (d < p) continue;
          const front = d - p < 0.06;
          ctx.fillStyle = front ? ((x + y) % 3 ? "#ff6b1a" : "#4fe3d6") : "#0e0c0b";
          ctx.fillRect(x, y, 1, 1);
        }
      if (p < 1) raf = requestAnimationFrame(frame);
      else setDone(true);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [armed, reduced]);

  if (!armed || done) return null;
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] h-full w-full"
      style={{ imageRendering: "pixelated", background: "#0e0c0b" }}
    />
  );
}
