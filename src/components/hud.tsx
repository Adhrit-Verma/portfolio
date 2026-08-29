"use client";

/**
 * HUD primitives. Every framed box on this site is one of these.
 * A box is *scanned* into place, not drawn — corner brackets, not borders.
 */

import type { ReactNode } from "react";
import { scan, useGsapScope, useReducedMotion } from "@/lib/motion";

export function Corners({ tone = "scan" }: { tone?: "scan" | "signal" }) {
  const c = tone === "signal" ? "border-signal" : "border-scan";
  const base = `absolute h-3.5 w-3.5 ${c}`;
  return (
    <span aria-hidden="true">
      <span data-corner className={`${base} left-0 top-0 border-l border-t`} />
      <span data-corner className={`${base} right-0 top-0 border-r border-t`} />
      <span data-corner className={`${base} bottom-0 left-0 border-b border-l`} />
      <span data-corner className={`${base} bottom-0 right-0 border-b border-r`} />
    </span>
  );
}

/**
 * The `scan` pattern, wrapped. Children marked `data-stagger` rise in behind
 * the sweep; `data-count` counts up; `data-glitch` glitches into place.
 */
export function ScanPanel({
  children,
  className = "",
  start,
  tone,
  sweep = true,
}: {
  children: ReactNode;
  className?: string;
  start?: string;
  tone?: "scan" | "signal";
  sweep?: boolean;
}) {
  const reduced = useReducedMotion();
  const ref = useGsapScope<HTMLDivElement>((root) => scan(root, { reduced, start }), [reduced, start]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <Corners tone={tone} />
      {sweep && (
        <span
          aria-hidden="true"
          data-sweep
          className="sweep pointer-events-none absolute inset-x-0 top-0 h-16 opacity-0"
        />
      )}
      {children}
    </div>
  );
}

export function ChapterHeader({
  index,
  label,
  title,
  meta,
  id,
}: {
  index: string;
  label: string;
  title: string;
  meta?: string;
  id?: string;
}) {
  return (
    <header className="mb-10 sm:mb-14">
      <div className="flex items-baseline gap-3 border-b border-line pb-3">
        <span className="chrome text-signal">{index}</span>
        <span className="chrome text-dim">{label}</span>
        {meta && <span className="chrome ml-auto hidden text-dim/70 sm:block">{meta}</span>}
      </div>
      <h2
        id={id}
        data-stagger
        className="mt-5 text-[clamp(2.25rem,6.5vw,5rem)] font-bold uppercase leading-[0.92] tracking-tight"
      >
        {title}
      </h2>
    </header>
  );
}

/** WD2's street-art layer. Sparse — six times site-wide, no more. */
export function Stencil({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`stencil pointer-events-none select-none text-[clamp(2rem,9vw,7rem)] opacity-25 ${className}`}
    >
      {children}
    </span>
  );
}

/** Status carries text, never color alone. */
export function Pill({
  children,
  tone = "dim",
}: {
  children: ReactNode;
  tone?: "dim" | "signal" | "scan";
}) {
  const map = {
    dim: "border-line text-dim",
    signal: "border-signal/50 text-signal-soft",
    scan: "border-scan/40 text-scan",
  } as const;
  return (
    <span className={`chrome inline-block border px-2 py-1 ${map[tone]}`}>{children}</span>
  );
}

export function Chapter({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 sm:py-32 ${className}`}
    >
      {children}
    </section>
  );
}
