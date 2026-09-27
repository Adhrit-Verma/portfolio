/**
 * The swarm's shapes. One fixed population of 740 primitives — 440 cubes,
 * 150 pyramids, 150 spheres — and every formation is just a different place
 * to put them. Because it's always the same shapes, any formation can morph
 * into any other: the mask becomes the tunnel becomes TableFox's schema graph.
 *
 * Formations are pure data (typed arrays), built once and cached by key:
 *   mask:<mood>  tunnel  wall:<text>  field  atom  helix
 *   glyph:<slug>  — a literal model of what that project does
 *   pipe:<slug>   — that project's pipeline, one node cluster per step
 */
import * as THREE from "three";
import { projects } from "@/lib/projects";
import { EYES, type Mood } from "../pixel";

export const C = 440; // cubes
export const T = 150; // pyramids
export const S = 150; // spheres
export const N = C + T + S;

export const PAL = {
  orange: "#ff6b1a",
  soft: "#ff9552",
  hot: "#ff2e88",
  cyan: "#4fe3d6",
  acid: "#ffd23f",
  ink: "#ede9e3",
  panel: "#241e1a",
  dark: "#2e2723",
  ember: "#7a2e0e",
  wine: "#3d1526",
};

export type Formation = {
  pos: Float32Array; // N*3
  scl: Float32Array; // N*3
  rot: Float32Array; // N*3 base euler
  col: Float32Array; // N*3 linear rgb
  glow: Float32Array; // N   emissive multiplier
  spin: Float32Array; // N   free rotation speed
  orbY: Float32Array; // N   angular speed around world Y
  orbZ: Float32Array; // N   angular speed around world Z
  wave: Float32Array; // N   z-wave amplitude
  flow: Float32Array; // N   x-flow speed
  flowL: Float32Array; // N  x-flow wrap length
};

type V3 = [number, number, number];
type Opts = { rot?: V3; spin?: number; orbY?: number; orbZ?: number; wave?: number; flow?: number; flowL?: number };

/** Deterministic, so every visitor sees the same art. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tmp = new THREE.Color();

class Builder {
  f: Formation;
  used = new Uint8Array(N);
  ci = 0;
  ti = 0;
  si = 0;
  r: () => number;

  constructor(seed = 1) {
    const a = (k: number) => new Float32Array(N * k);
    this.f = {
      pos: a(3), scl: a(3), rot: a(3), col: a(3), glow: a(1), spin: a(1),
      orbY: a(1), orbZ: a(1), wave: a(1), flow: a(1), flowL: a(1),
    };
    this.r = rng(seed);
  }

  set(i: number, p: V3, s: number | V3, color: string, glow = 0, o: Opts = {}) {
    const f = this.f;
    const sc = typeof s === "number" ? [s, s, s] : s;
    f.pos.set(p, i * 3);
    f.scl.set(sc, i * 3);
    f.rot.set(o.rot ?? [0, 0, 0], i * 3);
    tmp.set(color);
    f.col.set([tmp.r, tmp.g, tmp.b], i * 3);
    f.glow[i] = glow;
    f.spin[i] = o.spin ?? 0;
    f.orbY[i] = o.orbY ?? 0;
    f.orbZ[i] = o.orbZ ?? 0;
    f.wave[i] = o.wave ?? 0;
    f.flow[i] = o.flow ?? 0;
    f.flowL[i] = o.flowL ?? 40;
    this.used[i] = 1;
  }
  cube(p: V3, s: number | V3, color: string, glow = 0, o?: Opts) {
    if (this.ci >= C) return;
    this.set(this.ci++, p, s, color, glow, o);
  }
  tet(p: V3, s: number | V3, color: string, glow = 0, o?: Opts) {
    if (this.ti >= T) return;
    this.set(C + this.ti++, p, s, color, glow, o);
  }
  sph(p: V3, s: number | V3, color: string, glow = 0, o?: Opts) {
    if (this.si >= S) return;
    this.set(C + T + this.si++, p, s, color, glow, o);
  }
  /** a dotted line of `n` shapes from a to b */
  line(kind: "tet" | "sph" | "cube", a: V3, b: V3, n: number, s: number, color: string, glow: number, o?: Opts) {
    for (let k = 0; k < n; k++) {
      const t = n === 1 ? 0.5 : k / (n - 1);
      this[kind]([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], s, color, glow, o);
    }
  }
  /** Whatever a formation didn't place becomes slow, far-off dust. */
  done(): Formation {
    const dim = [PAL.dark, PAL.panel, PAL.ember, PAL.wine, PAL.orange, PAL.cyan];
    for (let i = 0; i < N; i++) {
      if (this.used[i]) continue;
      const r = 30 + this.r() * 34;
      const th = this.r() * Math.PI * 2;
      const ph = Math.acos(2 * this.r() - 1);
      const c = dim[Math.floor(this.r() * dim.length)];
      this.set(i, [r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.6, r * Math.sin(ph) * Math.sin(th) - 10],
        0.08 + this.r() * 0.16, c, c === PAL.orange || c === PAL.cyan ? 0.8 : 0, { spin: 0.6, orbY: 0.02 });
    }
    return this.f;
  }
}

/* ------------------------------------------------------------------ formations */

/** A Wrench-style LED mask in voxels: two 7x7 eye matrices on a rounded panel, under a hood. */
function mask(mood: Mood): Formation {
  const b = new Builder(11);
  const W = 22, H = 13, cs = 0.62;
  const [l, r] = EYES[mood];
  const right = r ?? l;
  const lit = mood === "dead" ? PAL.hot : mood === "scan" ? PAL.cyan : PAL.orange;
  const inPanel = (c: number, rr: number) =>
    c >= 0 && c < W && rr >= 0 && rr < H && Math.min(c, W - 1 - c) + Math.min(rr, H - 1 - rr) >= 2;

  for (let rr = 0; rr < H; rr++)
    for (let c = 0; c < W; c++) {
      if (!inPanel(c, rr)) continue;
      const x = (c - (W - 1) / 2) * cs;
      const y = ((H - 1) / 2 - rr) * cs;
      const eyeL = c >= 2 && c <= 8 && rr >= 3 && rr <= 9;
      const eyeR = c >= 13 && c <= 19 && rr >= 3 && rr <= 9;
      if (eyeL || eyeR) {
        const bmp = eyeL ? l : right;
        const on = bmp[rr - 3][c - (eyeL ? 2 : 13)] === "#";
        if (on) b.cube([x, y, 0.32], 0.54, lit, 2.4);
        else b.cube([x, y, 0], 0.5, PAL.wine, 0.25);
        continue;
      }
      const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !inPanel(c + dx, rr + dy));
      b.cube([x, y, edge ? 0.08 : 0], 0.56, edge ? PAL.hot : PAL.panel, edge ? 1.1 : 0);
    }

  // the hood: three arcs of big dark voxels behind the face
  for (let row = 0; row < 3; row++) {
    const R = 8.4 + row * 0.9;
    const n = 55;
    for (let k = 0; k < n; k++) {
      const a = -0.35 + (k / (n - 1)) * (Math.PI + 0.7);
      const speck = b.r() < 0.08;
      b.cube([Math.cos(a) * R, Math.sin(a) * R * 0.92 - 0.6, -1.2 - row * 1.1], 0.78 - row * 0.05,
        speck ? PAL.orange : row === 0 ? PAL.dark : PAL.panel, speck ? 1.4 : 0);
    }
  }
  // satellite rings
  for (let k = 0; k < T; k++) {
    const a = (k / T) * Math.PI * 2;
    const R = 14;
    const tilt = 1.2;
    b.tet([Math.cos(a) * R, Math.sin(a) * R * Math.cos(tilt), Math.sin(a) * R * Math.sin(tilt)], 0.34, PAL.cyan,
      k % 5 === 0 ? 2 : 0.7, { spin: 2, orbY: 0.22 });
  }
  for (let k = 0; k < 110; k++) {
    const a = (k / 110) * Math.PI * 2;
    const R = 16.5;
    b.sph([Math.cos(a) * R, Math.sin(a) * R * 0.35 + Math.cos(a) * 3, Math.sin(a) * R * 0.9], 0.26,
      k % 2 ? PAL.acid : PAL.hot, 1.2, { orbY: -0.15 });
  }
  return b.done();
}

/** Rings along -z. The camera flies down it. */
function tunnel(): Formation {
  const b = new Builder(3);
  const rings = 20;
  const colors = [PAL.orange, PAL.hot, PAL.orange, PAL.cyan];
  for (let i = 0; i < N; i++) {
    const ring = i % rings;
    const slot = Math.floor(i / rings);
    const per = Math.ceil(N / rings);
    const a = (slot / per) * Math.PI * 2 + ring * 0.3;
    const R = 7.5 + Math.sin(ring * 0.9) * 1.4;
    const p: V3 = [Math.cos(a) * R, Math.sin(a) * R, 12 - ring * 6.5];
    b.set(i, p, i < C ? 0.55 : 0.6, colors[ring % 4], slot % 3 === 0 ? 2.2 : 0.35, {
      spin: 1.5, orbZ: ring % 2 ? 0.25 : -0.25,
    });
  }
  return b.f;
}

const FONT: Record<string, string> = {
  O: ".###. #...# #...# #...# #...# #...# .###.",
  N: "#...# ##..# #.#.# #..## #...# #...# #...#",
  L: "#.... #.... #.... #.... #.... #.... #####",
  I: "##### ..#.. ..#.. ..#.. ..#.. ..#.. #####",
  E: "##### #.... #.... ####. #.... #.... #####",
  "4": "...#. ..##. .#.#. #..#. ##### ...#. ...#.",
  "0": ".###. #..## #.#.# ##..# #...# #...# .###.",
  " ": "..... ..... ..... ..... ..... ..... .....",
};

/** A 40x11 stadium wall of cubes spelling `text` in a 5x7 pixel font, rippling. */
function wall(text: string): Formation {
  const b = new Builder(5);
  const cols = 40, rows = 11, s = 0.72;
  const width = text.length * 6 - 1;
  const x0 = Math.floor((cols - width) / 2);
  const litAt = (c: number, r: number) => {
    const k = Math.floor((c - x0) / 6);
    const cx = (c - x0) % 6;
    if (c < x0 || k >= text.length || cx === 5 || r < 2 || r > 8) return false;
    return (FONT[text[k]] ?? FONT[" "]).split(" ")[r - 2][cx] === "#";
  };
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const on = litAt(c, r);
      const tint = new THREE.Color(PAL.orange).lerp(new THREE.Color(PAL.hot), c / cols).getHexString();
      b.cube([(c - 19.5) * s, (5 - r) * s, on ? 0.4 : 0], [0.62, 0.62, on ? 0.7 : 0.4],
        on ? `#${tint}` : PAL.panel, on ? 1.6 : 0, { wave: 0.18 });
    }
  const conf = [PAL.orange, PAL.hot, PAL.cyan, PAL.acid];
  for (let k = 0; k < T + S; k++) {
    const p: V3 = [(b.r() - 0.5) * 44, (b.r() - 0.5) * 22, -4 - b.r() * 14];
    const c = conf[k % 4];
    if (k < T) b.tet(p, 0.3, c, 1.2, { spin: 2.2 });
    else b.sph(p, 0.22, c, 1.2, { spin: 1 });
  }
  return b.done();
}

/** Calm drifting slab — the backdrop behind reading-heavy sections. */
function field(): Formation {
  const b = new Builder(9);
  const lit = [PAL.orange, PAL.hot, PAL.cyan, PAL.acid];
  // mostly dark and far back: a backdrop for reading should recede
  for (let i = 0; i < N; i++) {
    const glow = b.r() < 0.07;
    b.set(i, [(b.r() - 0.5) * 70, (b.r() - 0.5) * 36, -46 + b.r() * 26], 0.2 + b.r() * 0.45,
      glow ? lit[i % 4] : i % 2 ? PAL.panel : PAL.dark, glow ? 0.7 : 0, { spin: 0.25 + b.r() * 0.4 });
  }
  return b.f;
}

/** Nucleus and tilted rings — the toolkit orbiting one core. */
function atom(): Formation {
  const b = new Builder(13);
  for (let x = -3; x <= 3; x++)
    for (let y = -3; y <= 3; y++)
      for (let z = -3; z <= 3; z++) {
        if (x * x + y * y + z * z > 9.5) continue;
        const shell = x * x + y * y + z * z > 5;
        b.cube([x * 0.62, y * 0.62, z * 0.62], 0.56, shell ? PAL.orange : PAL.acid, shell ? 1.3 : 2.2);
      }
  const rings: [number, number, string, "cube" | "tet" | "sph", number][] = [
    [7, 0.5, PAL.cyan, "cube", 70], [9.5, -0.9, PAL.hot, "cube", 90], [12, 1.3, PAL.orange, "tet", 150], [14.5, -0.3, PAL.cyan, "sph", 150],
  ];
  rings.forEach(([R, tilt, color, kind, n], ri) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      b[kind]([Math.cos(a) * R, Math.sin(a) * R * Math.sin(tilt), Math.sin(a) * R * Math.cos(tilt)], kind === "sph" ? 0.22 : 0.3,
        color, k % 3 === 0 ? 1.8 : 0.6, { spin: 1.5, orbY: (ri % 2 ? -1 : 1) * (0.12 + ri * 0.05) });
    }
  });
  return b.done();
}

/** A double helix along x — the record's timeline spine. */
function helix(): Formation {
  const b = new Builder(17);
  for (let k = 0; k < 170; k++) {
    const x = -26 + (k / 170) * 52;
    const a = x * 0.55;
    b.cube([x, Math.cos(a) * 3, Math.sin(a) * 3], 0.5, PAL.orange, k % 4 === 0 ? 2 : 0.8);
    b.cube([x, Math.cos(a + Math.PI) * 3, Math.sin(a + Math.PI) * 3], 0.5, PAL.cyan, k % 4 === 2 ? 2 : 0.7);
  }
  for (let k = 0; k < 25; k++) {
    const x = -24 + k * 2;
    const a = x * 0.55;
    b.line("tet", [x, Math.cos(a) * 3, Math.sin(a) * 3], [x, -Math.cos(a) * 3, -Math.sin(a) * 3], 6, 0.18, PAL.ink, 0.5, { spin: 1 });
  }
  return b.done();
}

/* --------------------------------------------------------------- project glyphs */

function jimmy(): Formation {
  const b = new Builder(21);
  const R = 8.5;
  const centers: V3[] = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const cy = Math.sin(k * 1.3) * 0.9;
    const c: V3 = [Math.sin(a) * R, cy, Math.cos(a) * R];
    centers.push(c);
    const matched = k === 2 || k === 7;
    for (let u = 0; u < 5; u++)
      for (let v = 0; v < 3; v++) {
        const du = (u - 2) * 0.46, dv = (v - 1) * 0.46;
        b.cube([c[0] + Math.cos(a) * du, c[1] + dv, c[2] - Math.sin(a) * du], [0.42, 0.42, 0.08],
          matched ? PAL.orange : v === 2 ? PAL.dark : PAL.panel, matched ? 2 : 0, { rot: [0, a, 0] });
      }
  }
  // the listening pill
  for (let x = -3; x <= 3; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        if (Math.abs(x) === 3 && Math.abs(y) + Math.abs(z) === 2) continue;
        b.cube([x * 0.46, y * 0.46, z * 0.46], 0.42, "#161210", 0);
      }
  b.cube([-0.9, 0, 0.72], 0.3, PAL.cyan, 4);
  // voice rings
  [3.2, 4.4, 5.6].forEach((r, ri) => {
    for (let k = 0; k < 50; k++) {
      const a = (k / 50) * Math.PI * 2;
      b.tet([Math.cos(a) * r, Math.sin(a) * r, 0], 0.2, PAL.cyan, 1.8 - ri * 0.5, { spin: 2, orbZ: ri % 2 ? 0.3 : -0.3 });
    }
  });
  // evidence beams from the two matched moments
  [2, 7].forEach((k) => b.line("sph", centers[k], [0, 0, 0], 20, 0.13, PAL.orange, 2.2));
  return b.done();
}

function contrast(): Formation {
  const b = new Builder(23);
  for (let L = 0; L < 3; L++) {
    const ox = L * 1.3 - 1.3, oy = L * 1.0 - 1.0, oz = L * 1.8 - 1.8;
    const front = L === 2;
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 14; c++) {
        let color = PAL.panel, glow = 0;
        if (front) {
          if (r === 0) { color = PAL.ink; glow = 0.35; }
          else if ((r >= 2 && r <= 3 && c >= 1 && c <= 6) || (r === 6 && c >= 2 && c <= 10)) { color = PAL.orange; glow = 2; }
          else if (r >= 2 && r <= 4 && c >= 8 && c <= 12) { color = PAL.cyan; glow = 1.5; }
        }
        b.cube([(c - 6.5) * 0.56 + ox, (4 - r) * 0.56 + oy, oz], [0.5, 0.5, 0.12], color, glow);
      }
  }
  // the scan curtain sweeping across
  for (let y = 0; y < 30; y++)
    for (let z = 0; z < 5; z++)
      b.tet([0, (y - 14.5) * 0.3, (z - 2) * 0.8], 0.16, PAL.cyan, 1.4, { flow: 2.2, flowL: 14 });
  // the lens
  for (let k = 0; k < 100; k++) {
    const a = (k / 100) * Math.PI * 2;
    const t = (k % 5) / 5 * Math.PI * 2;
    const R = 2.6 + Math.cos(t) * 0.35;
    b.sph([5 + Math.cos(a) * R, 4 + Math.sin(a) * R, 3 + Math.sin(t) * 0.35], 0.16, PAL.orange, 2.2);
  }
  for (let k = 0; k < 50; k++) {
    const a = (k / 50) * Math.PI * 2;
    b.sph([5 + Math.cos(a) * 1.9, 4 + Math.sin(a) * 1.9, 3], 0.11, PAL.cyan, 2);
  }
  return b.done();
}

function clauseguard(): Formation {
  const b = new Builder(29);
  const lens = [12, 9, 13, 10, 12, 8, 11, 13, 9, 12, 10];
  lens.forEach((n, r) => {
    for (let k = 0; k < n; k++)
      b.cube([-12 + k * 0.52, 3.8 - r * 0.75, 0], [0.48, 0.32, 0.3], r === 4 ? PAL.orange : PAL.panel, r === 4 ? 2.2 : 0);
  });
  const nodes: V3[] = [[-1.5, 1.2, 0], [3.2, -0.6, 0], [7.8, 1, 0]];
  nodes.forEach((n, ni) => {
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++)
        for (let z = 0; z < 4; z++) {
          const ext = [x, y, z].filter((v) => v === 0 || v === 3).length;
          if (ext === 0) continue;
          const edge = ext >= 2;
          b.cube([n[0] + (x - 1.5) * 0.5, n[1] + (y - 1.5) * 0.5, n[2] + (z - 1.5) * 0.5], 0.44,
            edge ? (ni === 1 ? PAL.orange : PAL.cyan) : PAL.panel, edge ? 1.5 : 0);
        }
  });
  for (let x = 0; x < 7; x++)
    for (let y = 0; y < 4; y++) b.cube([7.8 + (x - 3) * 0.58, -4.4 + (y - 1.5) * 0.58, 0], [0.54, 0.54, 0.2], PAL.hot, 2);
  b.line("tet", [-5.8, 0.8, 0], nodes[0], 18, 0.16, PAL.cyan, 1.5, { spin: 2 });
  b.line("tet", nodes[0], nodes[1], 26, 0.16, PAL.orange, 1.8, { spin: 2 });
  b.line("tet", nodes[1], nodes[2], 26, 0.16, PAL.orange, 1.8, { spin: 2 });
  b.line("tet", nodes[2], [7.8, -3.2, 0], 20, 0.16, PAL.hot, 1.8, { spin: 2 });
  for (let k = 0; k < 60; k++) {
    const a = (k / 60) * Math.PI * 2;
    b.sph([3.2 + Math.cos(a) * 2.6, -0.6 + Math.sin(a) * 2.6 * 0.4, Math.sin(a) * 2.6], 0.12, PAL.acid, 1.4);
  }
  return b.done();
}

function tablefox(): Formation {
  const b = new Builder(31);
  const raw = [[-2.6, -0.4], [-1.4, 1.3], [-1.2, -1.6], [0, 0], [0.3, 1.9], [1.4, -1.2], [1.6, 0.9], [2.8, -0.2], [-0.4, -2.8], [2.6, 2.2], [-2.8, 1.9], [0.9, -2.9]];
  const pos = raw.map(([x, z]) => [x * 2.3, z * 2.3] as [number, number]);
  const hot = new Set([3, 5, 7]);
  const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [3, 6], [5, 7], [6, 7], [2, 8], [6, 9], [1, 10], [5, 11], [4, 9]];
  pos.forEach(([x, z], i) => {
    const on = hot.has(i);
    for (let d = 0; d < 3; d++) {
      const y = -1.2 + d * 0.8;
      for (let k = 0; k < 9; k++) {
        const a = (k / 8) * Math.PI * 2;
        const rr = k === 8 ? 0 : 0.75;
        b.cube([x + Math.cos(a) * rr, y, z + Math.sin(a) * rr], 0.42,
          on ? PAL.orange : d === 2 && k === 8 ? PAL.ink : PAL.panel, on ? (d === 2 ? 2.4 : 1.2) : d === 2 && k === 8 ? 0.4 : 0);
      }
    }
  });
  edges.forEach(([a, c]) => {
    const on = hot.has(a) && hot.has(c);
    b.line("sph", [pos[a][0], -0.4, pos[a][1]], [pos[c][0], -0.4, pos[c][1]], 10, on ? 0.16 : 0.11, on ? PAL.orange : PAL.ink, on ? 2.2 : 0.25);
  });
  const agent: V3 = [0, 8, 0];
  [...hot].forEach((i) => b.line("tet", agent, [pos[i][0], 0.6, pos[i][1]], 40, 0.16, PAL.cyan, 1.6, { spin: 2 }));
  for (let k = 0; k < 30; k++) {
    const a = (k / 30) * Math.PI * 2;
    b.tet([Math.cos(a) * 0.9, 8 + Math.sin(k) * 0.4, Math.sin(a) * 0.9], 0.2, PAL.cyan, 2.4, { spin: 3 });
  }
  return b.done();
}

function gdc(): Formation {
  const b = new Builder(37);
  const n = 21, s = 0.58;
  const finder = (x: number, y: number) => {
    for (const [ox, oy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      const dx = x - ox, dy = y - oy;
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) {
        if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return "sep";
        return Math.max(Math.abs(dx - 3), Math.abs(dy - 3)) === 2 ? "sep" : "on";
      }
    }
    return null;
  };
  const off = ((n - 1) * s) / 2;
  const colors = [PAL.panel, PAL.ember, PAL.soft, PAL.orange];
  const glows = [0, 0.35, 0.9, 1.5];
  for (let x = 0; x < n; x++)
    for (let y = 0; y < n; y++) {
      const f = finder(x, y);
      const px = x * s - off, pz = y * s - off;
      if (f === "sep") continue;
      if (f === "on") { b.cube([px, 0.14, pz], [0.52, 0.28, 0.52], PAL.cyan, 1.6); continue; }
      if (x === 6 || y === 6) {
        if ((x + y) % 2 === 0) b.cube([px, 0.1, pz], [0.52, 0.2, 0.52], PAL.ink, 0.6);
        continue;
      }
      const lvl = Math.floor(b.r() * 4); // 4 gray levels = 2 bits a module
      const h = 0.14 + lvl * 0.55;
      b.cube([px, h / 2, pz], [0.52, h, 0.52], colors[lvl], glows[lvl]);
    }
  // the viewfinder scanning it
  const side = 37;
  for (let k = 0; k < side * 4 && k < T; k++) {
    const e = Math.floor(k / side), t = (k % side) / side;
    const L = 7.6;
    const p: V3 = e === 0 ? [-L + 2 * L * t, 6, -L] : e === 1 ? [L, 6, -L + 2 * L * t] : e === 2 ? [L - 2 * L * t, 6, L] : [-L, 6, L - 2 * L * t];
    b.tet(p, 0.2, PAL.cyan, 1.4, { spin: 2 });
  }
  for (let k = 0; k < S; k++)
    b.sph([(b.r() - 0.5) * 14, 1.5 + b.r() * 7, (b.r() - 0.5) * 14], 0.1 + b.r() * 0.08, k % 2 ? PAL.acid : PAL.orange, 1.4, { spin: 1 });
  return b.done();
}

function tasx(): Formation {
  const b = new Builder(41);
  const shell = (cx: number, color: string) => {
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++)
        for (let z = 0; z < 4; z++) {
          const ext = [x, y, z].filter((v) => v === 0 || v === 3).length;
          if (!ext) continue;
          b.cube([cx + (x - 1.5) * 0.62, (y - 1.5) * 0.62, (z - 1.5) * 0.62], 0.56, ext >= 2 ? color : PAL.panel, ext >= 2 ? 1.6 : 0);
        }
  };
  shell(-7, PAL.orange);
  shell(7, PAL.cyan);
  for (let x = 0; x < 3; x++)
    for (let y = 0; y < 3; y++)
      for (let z = 0; z < 3; z++)
        if (b.r() < 0.7) b.cube([(x - 1) * 0.6, (y - 1) * 0.6, (z - 1) * 0.6], 0.5, y === 2 ? PAL.orange : PAL.soft, y === 2 ? 2.2 : 1);
  const h = 2.4;
  const corners: V3[] = [];
  for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) corners.push([x, y, z]);
  corners.forEach((a, i) => corners.forEach((c, j) => {
    const diff = a.filter((v, k) => v !== c[k]).length;
    if (j > i && diff === 1) b.line("sph", a, c, 9, 0.12, PAL.cyan, 1.3);
  }));
  for (let k = 0; k < 5; k++)
    for (let x = 0; x < 2; x++)
      for (let y = 0; y < 2; y++)
        for (let z = 0; z < 2; z++)
          b.cube([-4 + k * 2 + (x - 0.5) * 0.5, -5 + (y - 0.5) * 0.5, -1 + (z - 0.5) * 0.5], 0.44, k < 3 ? PAL.orange : PAL.panel, k < 3 ? 1.2 : 0);
  b.line("tet", [-4.8, 0, 0], [-2.6, 0, 0], 12, 0.18, PAL.orange, 1.8, { spin: 2 });
  b.line("tet", [4.8, 0, 0], [2.6, 0, 0], 12, 0.18, PAL.cyan, 1.8, { spin: 2 });
  b.line("tet", [0, -2.6, 0], [0, -4.4, -1], 10, 0.16, PAL.acid, 1.6, { spin: 2 });
  return b.done();
}

/** One node cluster per pipeline step, linked, with packets streaming through. */
function pipe(slug: string): Formation {
  const p = projects.find((x) => x.slug === slug) ?? projects[0];
  const nodes = p.flow.nodes;
  const b = new Builder(43);
  const gap = 6.5;
  const xs = nodes.map((_, k) => (k - (nodes.length - 1) / 2) * gap);
  nodes.forEach((node, k) => {
    for (let x = 0; x < 3; x++)
      for (let y = 0; y < 3; y++)
        for (let z = 0; z < 3; z++) {
          const edge = [x, y, z].filter((v) => v !== 1).length >= 2;
          b.cube([xs[k] + (x - 1) * 0.62, (y - 1) * 0.62, (z - 1) * 0.62], 0.56,
            node.hot ? PAL.orange : edge ? PAL.cyan : PAL.panel, node.hot ? 1.8 : edge ? 1.2 : 0);
        }
  });
  for (let k = 0; k < nodes.length - 1; k++) b.line("tet", [xs[k] + 1.1, 0, 0], [xs[k + 1] - 1.1, 0, 0], 16, 0.16, PAL.ink, 0.7, { spin: 2 });
  const L = (nodes.length - 1) * gap + 8;
  for (let k = 0; k < 70; k++)
    b.cube([(b.r() - 0.5) * L, (b.r() - 0.5) * 0.3, (b.r() - 0.5) * 0.3], 0.14, k % 3 ? PAL.orange : PAL.acid, 2.4, { flow: 3.2, flowL: L });
  if (p.flow.loop) {
    const a = xs[p.flow.loop.from], c = xs[p.flow.loop.to];
    for (let k = 0; k < 40; k++) {
      const t = k / 39;
      b.sph([a + (c - a) * t, -1.6 - Math.sin(Math.PI * t) * 3, 0], 0.16, PAL.cyan, 2);
    }
  }
  return b.done();
}

const GLYPHS: Record<string, () => Formation> = { jimmy, contrast, clauseguard, tablefox, gdc, tasx };

const cache = new Map<string, Formation>();

export function formation(key: string): Formation {
  let f = cache.get(key);
  if (f) return f;
  const [kind, arg = ""] = key.split(":");
  f =
    kind === "mask" ? mask((arg || "idle") as Mood)
    : kind === "tunnel" ? tunnel()
    : kind === "wall" ? wall(arg || "ONLINE")
    : kind === "atom" ? atom()
    : kind === "helix" ? helix()
    : kind === "glyph" ? (GLYPHS[arg] ?? field)()
    : kind === "pipe" ? pipe(arg)
    : field();
  cache.set(key, f);
  return f;
}

/** Per-instance constants: morph stagger, follow speed, swirl direction. */
export const PER = (() => {
  const r = rng(99);
  const delay = new Float32Array(N), speed = new Float32Array(N), curl = new Float32Array(N * 3), axis = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    delay[i] = r();
    speed[i] = 2.6 + r() * 3.4;
    const v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    curl.set([v.x, v.y, v.z], i * 3);
    axis.set([r() * 2 - 1, r() * 2 - 1, r() * 2 - 1], i * 3);
  }
  return { delay, speed, curl, axis };
})();
