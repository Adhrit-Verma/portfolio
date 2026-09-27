"use client";

import { useMemo } from "react";
import Link from "next/link";
import { featured, projects, recovered } from "@/lib/projects";
import { useNarrow } from "@/lib/motion";
import { indexScenes } from "./world/scenes";
import { WorldScenes } from "./world/store";
import { fileId } from "./Dossier";
import { Kinetic, Tape } from "./pop";

/** The file index: scroll the list and the swarm becomes each file in turn. */
export default function WorkIndex() {
  const narrow = useNarrow();
  const scenes = useMemo(() => indexScenes(narrow), [narrow]);

  return (
    <div>
      <WorldScenes scenes={scenes} />

      <header id="w-head" className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden pb-24 pt-28">
        <div aria-hidden="true" className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-[60%]" />
        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
          <p className="chrome text-dim">
            <span className="text-hot">IDX</span> · {featured.length} featured · {recovered.length} recovered
          </p>
          <Kinetic as="h1" immediate delay={0.15} className="poster riso mt-4 text-[clamp(3.6rem,min(14vw,22svh),12rem)] text-ink">
            Hacked <span className="text-signal">files</span>
          </Kinetic>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/90">
            {projects.length} systems. Each one opens with its purpose, the reasoning behind its design, the stack
            and what every part does, real measurements — and its limits, stated plainly.
          </p>
        </div>
        <Tape className="absolute -left-4 -right-4 bottom-6 rotate-[1.5deg]" tone="acid" items={projects.map((p) => `${p.code} // ${p.name}`)} />
      </header>

      <ol>
        {projects.map((p, k) => (
          <li key={p.slug} id={`w-${p.slug}`} className="relative">
            <div aria-hidden="true" className="scrim-l pointer-events-none absolute inset-y-0 left-0 w-full md:w-[62%]" />
            <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-5 pb-20 pt-16 sm:px-8 md:justify-center md:pb-16">
              {k === featured.length && (
                <p className="chrome mb-10 text-dim">
                  <span className="text-hot">{"//"}</span> Recovered — research and reference builds
                </p>
              )}
              <p className="chrome flex flex-wrap items-center gap-3 text-dim">
                <span className="text-signal">{fileId(p.slug)}</span>/{p.code} · {p.year}
                <span className="border border-scan/50 px-2 py-1 text-scan">{p.status}</span>
              </p>
              <h2 className="poster riso mt-4 max-w-[12ch] text-[clamp(3.2rem,9.5vw,8.5rem)] text-ink">{p.name}</h2>
              <p className="chrome mt-4 max-w-md leading-relaxed text-acid">{p.kind}</p>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/90">{p.hook}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link
                  href={`/work/${p.slug}`}
                  className="chrome inline-flex items-center gap-3 bg-signal px-6 py-4 font-bold text-void transition-colors hover:bg-acid"
                >
                  Decrypt {p.name} <span aria-hidden="true">→</span>
                </Link>
                <dl className="flex gap-8">
                  {p.metrics.slice(0, 2).map((m) => (
                    <div key={m.k} className="flex flex-col-reverse">
                      <dt className="chrome mt-1.5 text-dim">{m.k}</dt>
                      <dd className="poster text-3xl text-signal">{m.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
