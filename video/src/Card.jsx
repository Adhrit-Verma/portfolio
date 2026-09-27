// Share cards (1200x630 OpenGraph) in the site's broadcast-poster style.
// One per project — its Blender artifact + poster type — and one for home.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { projects } from "../../src/lib/projects.ts";

const { fontFamily: POSTER } = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] });

const C = { void: "#0E0C0B", ink: "#EDE9E3", dim: "#A39C94", signal: "#FF6B1A", hot: "#FF2E88", scan: "#4FE3D6", acid: "#FFD23F" };
const riso = `0.045em 0.025em 0 ${C.hot}, -0.035em -0.02em 0 ${C.scan}cc`;

function Tape({ text, bg, rotate, bottom }) {
  return (
    <div style={{ position: "absolute", left: -40, right: -40, bottom, transform: `rotate(${rotate}deg)`, background: bg, padding: "10px 0",
      fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: "0.2em", color: C.void, whiteSpace: "nowrap", overflow: "hidden" }}>
      {(text + "  ✦  ").repeat(8)}
    </div>
  );
}

const Grid = () => (
  <AbsoluteFill style={{
    backgroundImage: `radial-gradient(${C.dim}33 1.2px, transparent 1.6px)`, backgroundSize: "9px 9px",
    maskImage: "radial-gradient(ellipse 70% 70% at 70% 45%, #000, transparent 75%)",
  }} />
);

export const Card = ({ slug }) => {
  const p = projects.find((x) => x.slug === slug);
  if (!p) {
    const art = ["jimmy", "contrast", "tablefox", "gdc"];
    return (
      <AbsoluteFill style={{ background: C.void, color: C.ink, fontFamily: MONO }}>
        <Grid />
        {art.map((s, k) => (
          <Img key={s} src={staticFile(`${s}.webp`)} style={{ position: "absolute", width: 520, left: 560 + (k % 2) * 300, top: -60 + Math.floor(k / 2) * 250, opacity: 0.85 }} />
        ))}
        <div style={{ position: "absolute", left: 60, top: 54, fontSize: 18, letterSpacing: "0.2em" }}>
          <span style={{ color: C.hot }}>●</span> DEDSEC<span style={{ color: C.hot }}>//</span>BROADCAST <span style={{ color: C.dim }}>· CH.07</span>
        </div>
        <div style={{ position: "absolute", left: 56, top: 120, fontFamily: POSTER, fontSize: 196, lineHeight: 0.84, textTransform: "uppercase", textShadow: riso }}>
          Adhrit<br /><span style={{ color: C.signal }}>Verma</span>
        </div>
        <div style={{ position: "absolute", left: 60, top: 470, fontSize: 20, letterSpacing: "0.16em", color: C.acid }}>AI SOFTWARE ENGINEER · PYTHON · LLMS · RAG · MCP</div>
        <Tape text="MULTI-AGENT PIPELINES ✦ RAG THAT RETRIEVES ✦ MCP SERVERS ✦ SHIPPED · TESTED · MEASURED" bg={C.signal} rotate={-2} bottom={28} />
      </AbsoluteFill>
    );
  }
  const idx = projects.indexOf(p) + 1;
  return (
    <AbsoluteFill style={{ background: C.void, color: C.ink, fontFamily: MONO }}>
      <Grid />
      <Img src={staticFile(`${p.slug}.webp`)} style={{ position: "absolute", width: 860, right: -150, top: -20, transform: "rotate(-4deg)" }} />
      <div style={{ position: "absolute", left: 60, top: 54, fontSize: 18, letterSpacing: "0.2em" }}>
        <span style={{ color: C.hot }}>●</span> F-{String(idx).padStart(2, "0")} <span style={{ color: C.dim }}>/{p.code} · {p.status}</span>
      </div>
      <div style={{ position: "absolute", left: 56, top: 110, width: 720, fontFamily: POSTER, fontSize: p.name.length > 12 ? 118 : 168, lineHeight: 0.86, textTransform: "uppercase", textShadow: riso }}>
        {p.name}
      </div>
      <div style={{ position: "absolute", left: 60, top: 400, width: 600, fontSize: 19, lineHeight: 1.45, letterSpacing: "0.1em", textTransform: "uppercase", color: C.acid }}>
        {p.kind}
      </div>
      <div style={{ position: "absolute", left: 60, top: 470, display: "flex", gap: 44 }}>
        {p.metrics.slice(0, 2).map((m) => (
          <div key={m.k}>
            <div style={{ fontFamily: POSTER, fontSize: 52, color: C.signal }}>{m.v}</div>
            <div style={{ fontSize: 13, letterSpacing: "0.18em", color: C.dim, textTransform: "uppercase" }}>{m.k}</div>
          </div>
        ))}
      </div>
      <Tape text={`ADHRIT VERMA ✦ AI SOFTWARE ENGINEER ✦ ${p.name.toUpperCase()}`} bg={C.hot} rotate={1.5} bottom={-6} />
    </AbsoluteFill>
  );
};
