"use client";

/**
 * A project page is a flight through that project:
 *   p-hero  its glyph, orbiting — the name, the hook, the numbers, the purpose
 *   p-pipe  the camera travels the pipeline node by node as you read each step
 *   p-body  a calm field behind the reading: film, perks, tech, evidence, limits
 *   p-next  the swarm is already becoming the next project before you click
 */

import { useMemo } from "react";
import Link from "next/link";
import { projects, type Project } from "@/lib/projects";
import { useNarrow } from "@/lib/motion";
import { projectScenes } from "./world/scenes";
import { WorldScenes } from "./world/store";
import { PixelIcon, PixelMeter } from "./pixel";
import { Kinetic, Tape } from "./pop";
import { Bench, Film, Shots } from "./ProjectFigure";

export const fileId = (slug: string) => `F-${String(projects.findIndex((q) => q.slug === slug) + 1).padStart(2, "0")}`;

function Label({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="chrome flex items-center gap-3 text-dim">
      <span className="text-hot">{n}</span>
      {children}
    </p>
  );
}

export default function Dossier({ p }: { p: Project }) {
  const narrow = useNarrow();
  const scenes = useMemo(() => projectScenes(p.slug, narrow), [p.slug, narrow]);
  const i = projects.findIndex((q) => q.slug === p.slug);
  const next = projects[(i + 1) % projects.length];

  return (
    <article>
      <WorldScenes scenes={scenes} />

      {/* ------------------------------------------------------------- hero */}
      <section id="p-hero" aria-labelledby="p-title" className="relative">
        <div aria-hidden="true" className="scrim-l pointer-events-none absolute inset-y-0 left-0 w-full md:w-[70%]" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8">
          <nav aria-label="Breadcrumb" className="chrome flex flex-wrap items-center gap-x-3 gap-y-2 text-dim">
            <Link href="/work" className="py-2 text-ink hover:text-signal">
              <span aria-hidden="true">← </span>All files
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-signal">{fileId(p.slug)}</span>
            <span>/{p.code}</span>
            <span>{p.year}</span>
            <span className="border border-scan/50 px-2 py-1 text-scan">{p.status}</span>
          </nav>

          <Kinetic as="h1" id="p-title" immediate delay={0.2} className="poster riso mt-6 max-w-[11ch] text-[clamp(3.2rem,min(11vw,19svh),10rem)] text-ink">
            {p.name}
          </Kinetic>
          <p className="chrome mt-6 max-w-xl leading-relaxed text-acid">{p.kind}</p>
          <p className="mt-5 max-w-2xl text-xl leading-snug text-ink sm:text-2xl sm:leading-snug">{p.hook}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href={p.url} target="_blank" rel="noreferrer" className="chrome inline-flex items-center gap-2 bg-signal px-6 py-4 font-bold text-void transition-colors hover:bg-acid">
              Source on GitHub <span aria-hidden="true">↗</span>
            </a>
            <a href="#p-pipe" className="chrome inline-flex items-center gap-2 border border-ink/60 px-6 py-4 text-ink transition-colors hover:border-scan hover:text-scan">
              How it works <span aria-hidden="true">↓</span>
            </a>
          </div>

          <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line/80 pt-8 md:grid-cols-4">
            {p.metrics.map((m) => (
              <li key={m.k}>
                <p className="poster text-[clamp(2.6rem,5vw,4rem)] text-signal">{m.v}</p>
                <p className="chrome mt-2 leading-snug text-ink">{m.k}</p>
                {m.count && m.count > 1 && (
                  <div className="mt-3">
                    <PixelMeter count={m.count} tone={m.count > 20 ? "signal" : "scan"} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* purpose, still orbiting the glyph */}
        <div className="relative mx-auto grid max-w-7xl gap-5 px-5 pb-32 pt-16 sm:px-8 lg:grid-cols-2">
          <div className="glass border-l-4 border-hot p-7 sm:p-9">
            <Label n="01">The problem</Label>
            <p className="mt-5 text-lg leading-relaxed text-ink sm:text-xl sm:leading-relaxed">{p.problem}</p>
          </div>
          <div className="glass border-l-4 border-scan p-7 sm:p-9">
            <Label n="02">The approach</Label>
            <p className="mt-5 text-lg leading-relaxed text-ink sm:text-xl sm:leading-relaxed">{p.approach}</p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- pipeline */}
      <section id="p-pipe" aria-labelledby="pipe-title" className="relative scroll-mt-12">
        <div aria-hidden="true" className="scrim-l pointer-events-none absolute inset-y-0 left-0 w-full md:w-[55%]" />
        <div className="relative mx-auto max-w-7xl px-5 pt-24 sm:px-8">
          <Label n="03">Architecture — the camera follows the data</Label>
          <Kinetic id="pipe-title" className="poster mt-4 text-[clamp(2.8rem,8vw,6.5rem)] text-ink">
            How it <span className="text-signal">works</span>
          </Kinetic>
          <p className="mt-5 max-w-lg font-mono text-sm leading-relaxed text-dim">
            <span className="text-signal">&gt; </span>
            {p.flow.note}
          </p>
        </div>
        <ol className="relative mx-auto max-w-7xl px-5 sm:px-8">
          {p.flow.nodes.map((n, k) => (
            <li key={n.label} className="flex min-h-[78vh] items-center">
              <div className="max-w-md">
                <p aria-hidden="true" className={`poster outline-text text-[clamp(5rem,12vw,9rem)] ${n.hot ? "[--stroke:var(--color-signal)]" : "[--stroke:var(--color-scan)]"}`}>
                  {String(k + 1).padStart(2, "0")}
                </p>
                <h3 className="poster -mt-4 text-[clamp(2.4rem,5.5vw,4.2rem)] text-ink">
                  <span className="sr-only">Step {k + 1}: </span>
                  {n.label}
                </h3>
                <p className="mt-3 font-mono text-[15px] text-dim">{n.sub}</p>
                {n.hot && <p className="chrome mt-5 inline-block bg-signal px-2.5 py-1.5 text-void">Where the work happens</p>}
                {p.flow.loop?.from === k && (
                  <p className="chrome mt-5 leading-relaxed text-scan">
                    ↺ Loops back to step {String(p.flow.loop.to + 1).padStart(2, "0")} when {p.flow.loop.label}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ body */}
      <section id="p-body" aria-label="Details" className="relative mx-auto max-w-7xl space-y-32 px-5 py-28 sm:px-8">
        {p.film && (
          <div>
            <Label n="//">Launch film</Label>
            <div className="mt-6">
              <Film film={p.film} name={p.name} />
            </div>
          </div>
        )}

        <div>
          <Label n="04">Perks — why it&apos;s built this way</Label>
          <h2 className="poster mt-4 text-[clamp(2.6rem,7vw,5.5rem)] text-ink">
            The <span className="text-acid">edge</span>
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.perks.map((k, j) => (
              <li
                key={k.title}
                className={`glass group relative border border-line p-7 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1.5 ${
                  j % 3 === 1 ? "lg:translate-y-8 lg:hover:translate-y-6" : ""
                }`}
              >
                <span className={`inline-flex h-14 w-14 items-center justify-center ${["bg-signal", "bg-hot", "bg-scan", "bg-acid"][j % 4]} text-void`}>
                  <PixelIcon name={k.icon} size={32} />
                </span>
                <h3 className="poster mt-6 text-3xl text-ink">{k.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-dim">{k.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Label n="05">Tech — and what each part does</Label>
          <h2 className="poster mt-4 text-[clamp(2.6rem,7vw,5.5rem)] text-ink">
            The <span className="text-scan">stack</span>
          </h2>
          <dl className="glass mt-10 grid sm:grid-cols-2">
            {p.tech.map((t) => (
              <div key={t.name} className="flex flex-col gap-1.5 border-b border-line/80 px-6 py-5 sm:odd:border-r">
                <dt className="font-mono text-[15px] font-bold text-ink">{t.name}</dt>
                <dd className="text-sm text-dim">{t.role}</dd>
              </div>
            ))}
          </dl>
        </div>

        {(p.shots.length > 0 || p.bench) && (
          <div>
            <Label n="06">Evidence</Label>
            <h2 className="poster mt-4 text-[clamp(2.6rem,7vw,5.5rem)] text-ink">
              The <span className="text-signal">proof</span>
            </h2>
            <div className="mt-10 space-y-10">
              {p.bench && <Bench bench={p.bench} />}
              {p.shots.length > 0 && <Shots shots={p.shots} />}
            </div>
          </div>
        )}

        {p.limits.length > 0 && (
          <div>
            <div className="hazard h-3" aria-hidden="true" />
            <div className="glass px-6 py-10 sm:px-10">
              <Label n="07">Known limits — stated plainly</Label>
              <h2 className="poster mt-4 text-[clamp(2.4rem,6vw,4.6rem)] text-acid">Where it doesn&apos;t win</h2>
              <ul className="mt-8 max-w-3xl space-y-5">
                {p.limits.map((l) => (
                  <li key={l} className="flex gap-4">
                    <span aria-hidden="true" className="poster shrink-0 text-2xl leading-none text-hot">!</span>
                    <span className="text-lg leading-relaxed text-ink/90">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hazard h-3" aria-hidden="true" />
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------ next */}
      <section id="p-next" aria-labelledby="next-title" className="relative overflow-hidden">
        <div aria-hidden="true" className="scrim-l pointer-events-none absolute inset-y-0 left-0 w-full md:w-[60%]" />
        <Tape className="relative -mx-4 -rotate-[1.5deg]" tone="hot" items={["Next file", next.name, next.kind, "Decrypting"]} />
        <div className="relative mx-auto flex min-h-[95vh] max-w-7xl flex-col justify-center px-5 py-24 sm:px-8">
          <p className="chrome text-dim">
            <span className="text-hot">→</span> Next file · {fileId(next.slug)} /{next.code}
          </p>
          <h2 id="next-title" className="sr-only">
            Next file
          </h2>
          <Link href={`/work/${next.slug}`} className="group mt-4 block max-w-3xl">
            <span className="poster riso block text-[clamp(3.4rem,11vw,9.5rem)] text-ink transition-colors group-hover:text-signal">
              {next.name}
            </span>
            <span className="mt-5 block max-w-lg text-lg leading-relaxed text-ink/85">{next.hook}</span>
            <span className="chrome mt-8 inline-flex items-center gap-3 bg-signal px-6 py-4 font-bold text-void transition-colors group-hover:bg-acid">
              Decrypt it <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </section>
    </article>
  );
}
