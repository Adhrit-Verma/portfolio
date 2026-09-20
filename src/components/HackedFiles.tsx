"use client";

import dynamic from "next/dynamic";
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

const AgentGraph = dynamic(() => import("./AgentGraph"), { ssr: false });

/* --------------------------------------------------------------- 03 HACKED FILES */

type FileRecord = (typeof files)[number];

function SourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="chrome inline-flex items-center gap-1.5 border border-signal/45 px-3 py-2 text-signal-soft transition-colors hover:border-signal hover:bg-signal hover:text-void"
    >
      {label}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

/**
 * `unlock` — GSAP runs the scroll reveal and flips the status readout;
 * Framer Motion owns the pointer lift. Separate triggers, separate concerns.
 */
function FileCard({ file }: { file: FileRecord }) {
  const reduced = useReducedMotion();

  const ref = useGsapScope<HTMLDivElement>(
    (el) => {
      scan(el, { reduced });

      const status = el.querySelector<HTMLElement>("[data-status]");
      if (!status) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 78%",
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
    <motion.div
      ref={ref}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="hover-sweep group relative overflow-hidden border border-line bg-panel/50 p-6 transition-colors hover:border-line-hot sm:p-9"
    >
      <Corners />
      <span
        aria-hidden="true"
        data-sweep
        className="sweep pointer-events-none absolute inset-x-0 top-0 h-20 opacity-0"
      />

      <div data-stagger className="mb-6 flex flex-wrap items-center gap-3">
        <span className="chrome tabnum text-signal">{file.id}</span>
        <span className="chrome text-dim">/{file.code}</span>
        <span data-status className="chrome ml-auto border border-line px-2 py-1 text-dim">
          LOCKED
        </span>
      </div>

      <h3
        data-glitch
        data-text={file.name}
        className="glitch-text text-3xl font-bold uppercase leading-none tracking-tight sm:text-5xl"
      >
        {file.name}
      </h3>
      <p data-stagger className="chrome mt-3 text-signal-soft">
        {file.kind}
      </p>
      <p data-stagger className="mt-5 max-w-2xl text-lg leading-relaxed text-ink">
        {file.hook}
      </p>

      <dl data-stagger className="mt-7 grid grid-cols-3 gap-4 border-y border-line py-5">
        {file.metrics.map((m) => (
          <div key={m.k}>
            <dt className="chrome text-dim">{m.k}</dt>
            <dd className="tabnum mt-1.5 font-display text-xl font-bold text-signal sm:text-3xl">
              {m.v}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mt-6 max-w-3xl space-y-3.5">
        {file.body.map((line, i) => (
          <li key={i} data-stagger className="flex gap-4">
            <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-signal/70" />
            <span className="text-[15px] leading-relaxed text-dim sm:text-base">{line}</span>
          </li>
        ))}
      </ul>

      <div data-stagger className="mt-7 flex flex-wrap items-center gap-2">
        <SourceLink href={file.url} label={`Source — ${file.name}`} />
        {file.stack.map((s) => (
          <span
            key={s}
            className="inline-block border border-line px-2 py-1 font-mono text-[11px] text-dim transition-colors group-hover:border-line-hot group-hover:text-ink"
          >
            {s}
          </span>
        ))}
      </div>
    </motion.div>
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
        className={`relative mb-10 border border-line bg-panel/30 ${
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

      <div className="space-y-6">
        {files.map((f) => (
          <FileCard key={f.id} file={f} />
        ))}
      </div>

      <div className="mt-14">
        <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <Pill tone="dim">RECOVERED</Pill>
          <p className="chrome text-dim">Smaller builds — all public repos</p>
        </div>
        <ul className="grid gap-px bg-line sm:grid-cols-2">
          {recovered.map((a) => (
            <li key={a.code}>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col bg-void p-6 transition-colors hover:bg-panel-hi/70"
              >
                <div className="flex items-center justify-between">
                  <span className="chrome text-scan">{a.code}</span>
                  <span
                    aria-hidden="true"
                    className="text-signal opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ↗
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold uppercase tracking-wide text-ink">
                  {a.name}
                </h3>
                <p className="mt-2 max-w-prose flex-1 text-sm leading-relaxed text-dim">{a.hook}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {a.stack.map((s) => (
                    <li key={s}>
                      <span className="inline-block border border-line px-2 py-1 font-mono text-[11px] text-dim transition-colors group-hover:border-line-hot group-hover:text-ink">
                        {s}
                      </span>
                    </li>
                  ))}
                </ul>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Chapter>
  );
}
