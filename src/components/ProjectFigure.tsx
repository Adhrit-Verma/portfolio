"use client";

/**
 * The visual for each featured project — the thing the Files chapter was
 * missing. A portfolio of text boxes gives a reader nothing to look at.
 *
 * Three treatments, because only one project has a UI to screenshot and
 * inventing the other two would be a lie:
 *   shots    — Contrast's real product screenshots, layered for depth
 *   pipeline — ClauseGuard's actual three-agent graph, drawn as a schematic
 *   bench    — TableFox's published benchmark, drawn as bars from real numbers
 *
 * Each is labelled for what it is, so a screenshot never gets confused with a
 * diagram.
 */

import Image from "next/image";
import type { files } from "@/lib/resume";
import { Corners } from "./hud";

type Figure = NonNullable<(typeof files)[number]["figure"]>;

function Frame({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <figure className={`relative ${className}`}>
      <div className="relative border border-line bg-panel/60 p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] sm:p-3">
        <Corners />
        {children}
      </div>
      <figcaption className="mt-3 font-mono text-xs leading-relaxed text-dim">{label}</figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- screenshots */

function Shots({ figure }: { figure: Extract<Figure, { type: "shots" }> }) {
  const [lead, ...rest] = figure.shots;
  return (
    <div data-stagger>
      <Frame label={`Screenshot — ${lead.caption}`}>
        <Image
          src={lead.src}
          width={lead.w}
          height={lead.h}
          alt={lead.alt}
          className="h-auto w-full"
          sizes="(max-width: 1024px) 100vw, 1100px"
          loading="lazy"
        />
      </Frame>

      {/* Secondary views, smaller — depth without burying the lead. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {rest.map((s) => (
          <figure key={s.src} className="relative border border-line bg-panel/40 p-2">
            <Image
              src={s.src}
              width={s.w}
              height={s.h}
              alt={s.alt}
              className="h-auto w-full opacity-80 transition-opacity duration-500 hover:opacity-100"
              sizes="(max-width: 640px) 100vw, 520px"
              loading="lazy"
            />
            <figcaption className="mt-2 font-mono text-xs text-dim/80">{s.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ schematic */

function Pipeline({ figure }: { figure: Extract<Figure, { type: "pipeline" }> }) {
  return (
    <div data-stagger>
      <Frame label="Schematic — not a screenshot">
        <div className="px-3 py-8 sm:px-8 sm:py-14">
          <ol className="grid gap-5 md:grid-cols-3">
            {figure.agents.map((a, i) => (
              <li key={a.name} className="relative">
                <div className="h-full border border-line-hot/70 bg-void/70 p-5">
                  <span className="chrome text-scan">AGENT {String(i + 1).padStart(2, "0")}</span>
                  <h4 className="mt-3 font-display text-xl font-bold uppercase tracking-wide text-ink">
                    {a.name}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-dim">{a.does}</p>
                </div>
                {i < figure.agents.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="chrome absolute -bottom-4 left-1/2 -translate-x-1/2 text-signal md:-right-4 md:bottom-auto md:left-auto md:top-1/2 md:-translate-y-1/2 md:translate-x-0"
                  >
                    <span className="md:hidden">↓</span>
                    <span className="hidden md:inline">→</span>
                  </span>
                )}
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="chrome text-dim">{figure.note}</p>
            <p className="chrome border border-alert/50 px-3 py-2 text-alert">
              VERDICT: {figure.verdict}
            </p>
          </div>
        </div>
      </Frame>
    </div>
  );
}

/* ------------------------------------------------------------------ benchmark */

function Bench({ figure }: { figure: Extract<Figure, { type: "bench" }> }) {
  return (
    <div data-stagger>
      <Frame label="Published benchmark — real measurements">
        <div className="px-4 py-8 sm:px-10 sm:py-12">
          <div className="mb-8 flex flex-wrap gap-x-7 gap-y-2">
            <span className="chrome flex items-center gap-2 text-ink">
              <span aria-hidden="true" className="h-2.5 w-5 bg-signal" />
              {figure.legend.a}
            </span>
            <span className="chrome flex items-center gap-2 text-dim">
              <span aria-hidden="true" className="h-2.5 w-5 bg-line-hot" />
              {figure.legend.b}
            </span>
          </div>

          <dl className="space-y-9">
            {figure.rows.map((r) => {
              const max = Math.max(r.a, r.b);
              return (
                <div key={r.k}>
                  <dt className="chrome mb-4 text-dim">{r.k}</dt>
                  <dd className="space-y-2.5">
                    {(
                      [
                        [figure.legend.a, r.a, "bg-signal", "text-signal"],
                        [figure.legend.b, r.b, "bg-line-hot", "text-dim"],
                      ] as const
                    ).map(([name, v, bar, tone]) => (
                      <div key={name} className="flex items-center gap-4">
                        <div className="h-7 flex-1 bg-panel-hi/60">
                          <div
                            className={`h-7 ${bar}`}
                            style={{ width: `${(v / max) * 100}%` }}
                          />
                        </div>
                        <span
                          className={`tabnum w-28 shrink-0 text-right font-display text-lg font-bold sm:text-2xl ${tone}`}
                        >
                          {v.toLocaleString()}
                          {r.unit}
                        </span>
                      </div>
                    ))}
                  </dd>
                </div>
              );
            })}
          </dl>

          <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-dim/80">
            {figure.caption}
          </p>
        </div>
      </Frame>
    </div>
  );
}

export default function ProjectFigure({ figure }: { figure: Figure }) {
  if (figure.type === "shots") return <Shots figure={figure} />;
  if (figure.type === "pipeline") return <Pipeline figure={figure} />;
  return <Bench figure={figure} />;
}
