// Renders the OpenGraph share cards into ../public/og/<slug>.jpg (plus home.jpg),
// using the Blender artifacts in ../art/renders.
// `node render.mjs [slug ...]` to render only some.
import path from "node:path";
import { mkdirSync, readFileSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const out = path.resolve("../public/og");
mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.jsx"), publicDir: path.resolve("../art/renders") });
const all = ["home", ...[...readFileSync("../src/lib/projects.ts", "utf8").matchAll(/slug: "([\w-]+)"/g)].map((m) => m[1])];
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : all;

for (const slug of slugs) {
  const inputProps = { slug };
  const composition = await selectComposition({ serveUrl, id: "Card", inputProps });
  await renderStill({ composition, serveUrl, inputProps, imageFormat: "jpeg", jpegQuality: 86, output: `${out}/${slug}.jpg` });
  console.log("rendered", slug);
}
