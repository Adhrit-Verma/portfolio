"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "motion/react";
import { files, recovered } from "@/lib/resume";
import {
  ScrollTrigger,
  glitchCut,
  scan,
  useGsapScope,
  useLowPower,
  useReducedMotion,
} from "@/lib/motion";
import { Chapter, ChapterHeader, Corners, Pill, Stencil } from "./hud";
import ProjectFigure from "./ProjectFigure";

const AgentGraph = dynamic(() => import("./AgentGraph"), { ssr: false });

/* --------------------------------------------------------------- 03 HACKED FILES */

type FileRecord = (typeof files)[number];

function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="chrome inline-flex items-center gap-1.5 border border-signal/45 px-4 py-3 text-signal-soft transition-colors hover:border-signal hover:bg-signal hover:text-void"
    >
      {label}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

/**
 * A case study, not a card. The visual leads and the type sits under it —
 * boxing every project in a bordered panel is what made this chapter read flat.
 */
function FileCard({ file }: { file: FileRecord }) {
  const reduced = useReducedMotion();

  const ref = useGsapScope<HTMLElement>(
    (el) => {
      scan(el, { reduced, start: "top 85%" });

      const status = el.querySelector<HTMLElement>("[data-status]");
      if (!status) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          status.textContent = "DECRYPTED";
          status.classList.remove("text-dim", "border-line");
          status.classList.add("text-scan", "border-scan/40");
          if (!reduced) glitchCut(status);
        },
      });
    },
    [reduced],
  );

  return (
    <article ref={ref} className="relative border-t border-line pt-8 sm:pt-12">
      <div data-stagger className="mb-7 flex flex-wrap items-center gap-3">
        <span className="chrome tabnum text-signal">{file.id}</span>
        <span className="chrome text-dim">/{file.code}</span>
        <span data-status className="chrome ml-auto border border-line px-2 py-1 text-dim">
          LOCKED
        </span>
      </div>

      <h3
        data-glitch
        data-text={file.name}
        className="glitch-text text-[clamp(2.75rem,8vw,7rem)] font-bold uppercase leading-[0.88] tracking-tighter"
      >
        {file.name}
      </h3>
      <p data-stagger className="chrome mt-4 text-signal-soft">
        {file.kind}
      </p>
      <p
        data-stagger
        className="mt-6 max-w-3xl text-xl leading-snug text-ink sm:text-2xl sm:leading-snug"
      >
        {file.hook}
      </p>

      {/* the focal point */}
      <div className="mt-11">
        <ProjectFigure figure={file.figure} />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-16">
        <ul className="space-y-4">
          {file.body.map((line, i) => (
            <li key={i} data-stagger className="flex gap-4">
              <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-signal/70" />
              <span className="text-[15px] leading-relaxed text-dim sm:text-base">{line}</span>
            </li>
          ))}
        </ul>

        <div>
          <dl data-stagger className="grid grid-cols-3 gap-4 border-y border-line py-5">
            {file.metrics.map((m) => (
              <div key={m.k}>
                <dt className="chrome flex min-h-[2.4em] items-start text-dim">{m.k}</dt>
                <dd className="tabnum mt-1.5 font-display text-xl font-bold text-signal sm:text-2xl">
                  {m.v}
                </dd>
              </div>
            ))}
          </dl>
          <ul data-stagger className="mt-5 flex flex-wrap gap-1.5">
            {file.stack.map((s) => (
              <li key={s}>
                <span className="inline-block border border-line px-2 py-1 font-mono text-[11px] text-dim">
                  {s}
                </span>
              </li>
            ))}
          </ul>
          <div data-stagger className="mt-6">
            <SourceLink href={file.url} label={`Source — ${file.name}`} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HackedFiles() {
  const reduced = useReducedMotion();
  const lowPower = useLowPower();
  const show3D = !reduced && !lowPower;

  return (
    <Chapter id="files" className="overflow-hidden">
      <Stencil className="absolute -right-1 top-8 rotate-2">{"// ARCHIVE"}</Stencil>

      <ChapterHeader
        id="files-title"
        index="03"
        label="Files"
        title="Hacked Files"
        meta={`${files.length} FEATURED · ${recovered.length} RECOVERED`}
      />

      {/* Pipeline topology — the shape all three featured systems share.
          Without the 3D layer the tall panel is just an empty box, so the
          fallback is a compact strip carrying the same information. */}
      <div
        className={`relative mb-20 border border-line bg-panel/30 ${
          show3D ? "h-[300px] sm:h-[380px]" : ""
        }`}
      >
        <Corners />
        {show3D && <AgentGraph />}
        <div
          className={`p-5 sm:p-6 ${
            show3D ? "pointer-events-none absolute inset-x-0 top-0" : "relative"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <p className="chrome text-scan">PIPELINE TOPOLOGY // LANGGRAPH</p>
            {show3D && (
              <p className="chrome hidden text-dim sm:block">EXECUTION FRONT TRACKS SCROLL</p>
            )}
          </div>
          <p className="chrome mt-2 max-w-[22ch] text-dim sm:max-w-none">
            Extract → analyze → retrieve → verify → verdict
          </p>
        </div>
      </div>

      <div className="space-y-24 sm:space-y-36">
        {files.map((f) => (
          <FileCard key={f.id} file={f} />
        ))}
      </div>

      <div className="mt-28">
        <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <Pill tone="dim">RECOVERED</Pill>
          <p className="chrome text-dim">Smaller builds — all public repos</p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2">
          {recovered.map((a) => (
            <li key={a.code}>
              <motion.a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="group flex h-full flex-col border border-line bg-panel/30 transition-colors hover:border-line-hot"
              >
                {"image" in a && a.image ? (
                  <Image
                    src={a.image.src}
                    width={a.image.w}
                    height={a.image.h}
                    alt={a.image.alt}
                    unoptimized
                    loading="lazy"
                    className="h-56 w-full border-b border-line object-cover object-center opacity-85 transition-opacity duration-500 group-hover:opacity-100"
                    sizes="(max-width: 640px) 100vw, 520px"
                  />
                ) : "diagram" in a && a.diagram ? (
                  <div className="flex h-56 w-full items-center overflow-hidden border-b border-line bg-void/60 px-5">
                    <div className="font-mono text-[11px] leading-[1.7] text-dim transition-colors group-hover:text-ink">
                      {/* Index keys: the diagram is a static literal that never
                          reorders, and identical lines repeat (the bare "|" rungs). */}
                      {a.diagram.map((line, i) => (
                        <div key={i} className="whitespace-pre">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between">
                    <span className="chrome text-scan">{a.code}</span>
                    <span
                      aria-hidden="true"
                      className="text-signal opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      ↗
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold uppercase leading-tight tracking-wide text-ink">
                    {a.name}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-dim">{a.hook}</p>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {a.stack.map((s) => (
                      <li key={s}>
                        <span className="inline-block border border-line px-2 py-1 font-mono text-[11px] text-dim">
                          {s}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.a>
            </li>
          ))}
        </ul>
      </div>
    </Chapter>
  );
}
