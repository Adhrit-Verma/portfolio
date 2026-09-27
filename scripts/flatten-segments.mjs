// Next 16.3's static export writes segment prefetch files with backslash paths on
// Windows (`__next.work\$d$slug\__PAGE__.txt` becomes nested folders) while the
// client requests `__next.work.$d$slug.__PAGE__.txt`. This moves them to the flat
// names the router asks for. On Linux (Netlify) there's nothing nested; no-op.
// ponytail: delete once Next's export joins segment paths with "/" on Windows.
import { readdirSync, renameSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(p, dir, name);
    else walk(p);
  }
};
const flatten = (p, parent, prefix) => {
  for (const name of readdirSync(p)) {
    const q = path.join(p, name);
    if (statSync(q).isDirectory()) flatten(q, parent, `${prefix}.${name}`);
    else renameSync(q, path.join(parent, `${prefix}.${name}`));
  }
  rmSync(p, { recursive: true });
};
walk(path.resolve("out"));
