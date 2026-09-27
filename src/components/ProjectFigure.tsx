"use client";

/**
 * Project evidence, each labelled for what it is so a screenshot is never
 * mistaken for a diagram:
 *   Shots     — real product captures from the repo
 *   Bench     — published measurements drawn as bars, caveat underneath
 *   Film      — a finished film with sound, click to play
 */

import Image from "next/image";
import { useState } from "react";
import type { Project, Shot } from "@/lib/projects";
import { Corners } from "./hud";

export function Frame({
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

export function Shots({ shots }: { shots: Shot[] }) {
  const [lead, ...rest] = shots;
  return (
    <div>
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
      {rest.length > 0 && (
        <div className="mt-4 grid items-start gap-4 sm:grid-cols-2">
          {rest.map((s) => (
            <figure key={s.src} className="relative border border-line bg-panel/40 p-2">
              <Image
                src={s.src}
                width={s.w}
                height={s.h}
                alt={s.alt}
                className="h-auto w-full opacity-85 transition-opacity duration-500 hover:opacity-100"
                sizes="(max-width: 640px) 100vw, 520px"
                loading="lazy"
              />
              <figcaption className="mt-2 font-mono text-xs text-dim">{s.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

export function Bench({ bench }: { bench: NonNullable<Project["bench"]> }) {
  return (
    <Frame label="Published measurements — real numbers from the repo">
      <div className="px-4 py-8 sm:px-10 sm:py-12">
        <div className="mb-8 flex flex-wrap gap-x-7 gap-y-2">
          <span className="chrome flex items-center gap-2 text-ink">
            <span aria-hidden="true" className="h-2.5 w-5 bg-signal" />
            {bench.legend.a}
          </span>
          <span className="chrome flex items-center gap-2 text-dim">
            <span aria-hidden="true" className="h-2.5 w-5 bg-line-hot" />
            {bench.legend.b}
          </span>
        </div>

        <dl className="space-y-9">
          {bench.rows.map((r) => {
            const max = Math.max(r.a, r.b);
            return (
              <div key={r.k}>
                <dt className="chrome mb-4 text-dim">
                  {r.k}
                  {r.lowerIsBetter && <span className="text-dim"> · lower is better</span>}
                </dt>
                <dd className="space-y-2.5">
                  {(
                    [
                      [bench.legend.a, r.a, "bg-signal", "text-signal"],
                      [bench.legend.b, r.b, "bg-line-hot", "text-dim"],
                    ] as const
                  ).map(([name, v, bar, tone]) => (
                    <div key={name} className="flex items-center gap-4">
                      <div className="h-7 flex-1 bg-panel-hi/60">
                        <div className={`h-7 ${bar}`} style={{ width: `${(v / max) * 100}%` }} />
                      </div>
                      <span
                        className={`tabnum w-28 shrink-0 text-right font-display text-lg font-bold sm:text-2xl ${tone}`}
                      >
                        <span className="sr-only">{name}: </span>
                        {v.toLocaleString("en-US")}
                        {r.unit}
                      </span>
                    </div>
                  ))}
                </dd>
              </div>
            );
          })}
        </dl>

        <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-dim">{bench.caption}</p>
      </div>
    </Frame>
  );
}

/** A film with a soundtrack: the visitor starts it. Native controls, keyboard-operable. */
export function Film({ film, name }: { film: NonNullable<Project["film"]>; name: string }) {
  const [started, setStarted] = useState(false);
  return (
    <Frame label={`${film.caption} · ${film.duration} · sound on`}>
      <div className="relative">
        <video
          src={film.src}
          poster={film.poster}
          controls={started}
          playsInline
          preload="none"
          className="block aspect-video w-full bg-void"
          aria-label={`${name} launch film`}
          onPlay={() => setStarted(true)}
        />
        {!started && (
          <button
            type="button"
            onClick={(e) => {
              setStarted(true);
              (e.currentTarget.previousElementSibling as HTMLVideoElement).play().catch(() => {});
            }}
            className="group absolute inset-0 flex items-end justify-start bg-gradient-to-t from-void/70 to-transparent p-4 transition-colors sm:p-6"
            aria-label={`Play the ${name} launch film, ${film.duration}, with sound`}
          >
            <span className="chrome flex items-center gap-3 border border-signal bg-void/85 px-5 py-4 text-signal-soft transition-colors group-hover:bg-signal group-hover:text-void">
              <span aria-hidden="true">▶</span> Play film · {film.duration}
            </span>
          </button>
        )}
      </div>
    </Frame>
  );
}
