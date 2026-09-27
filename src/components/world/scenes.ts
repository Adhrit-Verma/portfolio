/**
 * Camera direction for every page, in one place. Each scene pairs a DOM
 * section with a formation and a camera move (from → to across the section).
 * Units: the mask is ~14 wide; glyphs fit a radius of ~10.
 */
import { featured, projects } from "@/lib/projects";
import { orbit, orbitSide, type SceneDef } from "./store";

/** Per-glyph framing: orbit radius, height, sweep. */
const GLYPH_CAM: Record<string, { r: number; y: number; a: [number, number] }> = {
  jimmy: { r: 25, y: 7, a: [-0.55, 0.35] },
  contrast: { r: 31, y: 7, a: [0.6, -0.25] },
  clauseguard: { r: 31, y: 6, a: [-0.35, 0.3] },
  tablefox: { r: 25, y: 13, a: [0.7, 1.5] },
  gdc: { r: 23, y: 16, a: [0.5, 1.25] },
  tasx: { r: 27, y: 7, a: [-0.45, 0.4] },
};

export function glyphScene(id: string, slug: string, narrow: boolean, side = 7.5): SceneDef {
  const g = GLYPH_CAM[slug] ?? GLYPH_CAM.jimmy;
  const cam = narrow
    ? orbit(g.r * 1.3, g.a[0], g.a[1], g.y, [0, -5, 0]) // centred, lifted into the top half
    : orbitSide(g.r, g.a[0], g.a[1], g.y, side);
  return { id, form: `glyph:${slug}`, ...cam, fov: 40 };
}

export function homeScenes(narrow: boolean): SceneDef[] {
  // Phones: the subject sits in the top band, pulled back, so the type below stays clear.
  const maskLook: [number, number, number] = narrow ? [0, -9, 0] : [-10, -3.2, 0];
  const zf = narrow ? 1.55 : 1;
  const wallLook = narrow ? -9 : -4.6;
  return [
    { id: "s-intro", form: "mask:scan", from: { pos: [-2, -1, 42 * zf], look: maskLook }, to: { pos: [3, 0, 35 * zf], look: [maskLook[0] + 1, maskLook[1] + 0.5, 0] }, fov: 42 },
    { id: "s-dive-a", form: "mask:idle", from: { pos: [3, 0, 35 * zf], look: [maskLook[0] + 1, maskLook[1] + 0.5, 0] }, to: { pos: [-3.4, 0, 1.6], look: [-3.4, 0, -12] }, fov: 50, roll: [0, 0.6] },
    { id: "s-dive-b", form: "tunnel", from: { pos: [0, 0, 6], look: [0, 0, -20] }, to: { pos: [0, 0, -92], look: [0, 0, -130] }, fov: 80, roll: [0.6, 3.4] },
    // phones: a wider lens, not more distance — past ~70 units the wall sinks into the fog
    { id: "s-stats", form: "wall:ONLINE", from: { pos: [-2.5, -3, 31 * (narrow ? 1.6 : 1)], look: [0, wallLook, 0] }, to: { pos: [2.5, -2.5, 28 * (narrow ? 1.6 : 1)], look: [0, wallLook + 0.4, 0] }, fov: narrow ? 72 : 44 },
    ...featured.map((p) => glyphScene(`ch-${p.slug}`, p.slug, narrow)),
    glyphScene("s-archive", "gdc", narrow),
    { id: "s-stack", form: "atom", ...orbit(narrow ? 48 : 33, 0, 1.2, 6, narrow ? [0, -12, 0] : [0, 0, 0]), fov: 44 },
    { id: "s-connect", form: "mask:happy", from: { pos: [0, -2, 40 * zf], look: [0, narrow ? -10 : -4.2, 0] }, to: { pos: [0, -1, 33 * zf], look: [0, narrow ? -9.5 : -3.8, 0] }, fov: 42 },
  ];
}

export function projectScenes(slug: string, narrow: boolean): SceneDef[] {
  const i = projects.findIndex((p) => p.slug === slug);
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];
  const n = p.flow.nodes.length;
  const x0 = (-(n - 1) / 2) * 6.5, x1 = -x0;
  const back = narrow ? 18 : 13;
  return [
    glyphScene("p-hero", slug, narrow),
    { id: "p-pipe", form: `pipe:${slug}`, from: { pos: [x0 - 4, 4, back], look: [x0 + 1, -0.5, 0] }, to: { pos: [x1 - 4, 4, back], look: [x1 + 1, -0.5, 0] }, fov: 46, roll: [-0.05, 0.05] },
    { id: "p-body", form: "field", from: { pos: [0, 0, 18], look: [0, 0, -10] }, to: { pos: [6, -3, 10], look: [0, 0, -20] }, fov: 50 },
    glyphScene("p-next", next.slug, narrow),
  ];
}

export function indexScenes(narrow: boolean): SceneDef[] {
  return [
    { id: "w-head", form: "atom", ...orbit(narrow ? 44 : 36, -0.3, 0.6, 8), fov: 44 },
    ...projects.map((p) => glyphScene(`w-${p.slug}`, p.slug, narrow)),
  ];
}

export function recordScenes(): SceneDef[] {
  return [
    // the helix rides the top band of the frame so it never sits behind body text
    { id: "profile", form: "helix", from: { pos: [-24, -9, 26], look: [-14, -10, 0] }, to: { pos: [-10, -9, 24], look: [-2, -10, 0] }, fov: 46, roll: [0.08, 0] },
    { id: "access", form: "atom", ...orbit(34, 0.2, 1.1, 7), fov: 44 },
    { id: "caselog", form: "helix", from: { pos: [-6, -9, 24], look: [2, -10, 0] }, to: { pos: [22, -9, 24], look: [28, -10, 0] }, fov: 48, roll: [0, -0.08] },
    { id: "creds", form: "field", from: { pos: [0, 0, 20], look: [0, 0, -10] }, to: { pos: [4, 2, 14], look: [0, 0, -10] }, fov: 50 },
  ];
}

export const notFoundScenes: SceneDef[] = [
  { id: "nf", form: "mask:dead", from: { pos: [0, -2, 30], look: [-6, -3, 0] }, to: { pos: [3, -1, 26], look: [-6, -3, 0] }, fov: 42 },
];
