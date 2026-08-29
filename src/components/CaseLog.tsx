"use client";

import { experience } from "@/lib/resume";
import { gsap, useGsapScope, useReducedMotion } from "@/lib/motion";
import { Chapter, ChapterHeader, Pill, ScanPanel, Stencil } from "./hud";

/* ------------------------------------------------------------------ 03 CASE LOG */

export default function CaseLog() {
  const reduced = useReducedMotion();

  // The spine fills as you read down the record. Scrubbed, so it tracks the
  // scrollbar exactly rather than easing behind it.
  const root = useGsapScope<HTMLDivElement>(
    (el) => {
      const fill = el.querySelector<HTMLElement>("[data-spine-fill]");
      if (!fill) return;
      if (reduced) {
        gsap.set(fill, { scaleY: 1 });
        return;
      }
      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 75%", scrub: 0.4 },
        },
      );
    },
    [reduced],
  );

  return (
    <Chapter id="caselog" className="overflow-hidden">
      <Stencil className="absolute -left-1 top-8 rotate-2">{"// RECORD"}</Stencil>

      <ChapterHeader
        id="caselog-title"
        index="03"
        label="Case Log"
        title="Employment Record"
        meta="STATUS: ACTIVE"
      />

      <div ref={root} className="relative">
        {/* the spine */}
        <div aria-hidden="true" className="absolute bottom-0 left-0 top-2 w-px bg-line sm:left-1">
          <div data-spine-fill className="h-full w-px origin-top scale-y-0 bg-signal" />
        </div>

        {experience.map((job) => (
          <div key={job.org} className="pl-6 sm:pl-10">
            <div className="sticky top-12 z-10 -mx-1 bg-void/90 py-4 backdrop-blur-sm">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <h3 className="text-2xl font-bold uppercase tracking-wide sm:text-4xl">{job.org}</h3>
                <span className="chrome tabnum text-signal">{job.period}</span>
              </div>
              <p className="chrome mt-2 text-dim">
                {job.role} · {job.location}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {job.stack.map((s) => (
                  <li key={s}>
                    <span className="inline-block border border-line px-2 py-1 font-mono text-[11px] text-dim">
                      {s}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 space-y-6">
              {job.missions.map((m) => (
                <ScanPanel key={m.code} className="bg-panel/40 p-5 sm:p-7">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[26px] top-8 hidden h-px w-5 bg-line-hot sm:block"
                  />

                  <div data-stagger className="mb-4 flex flex-wrap items-center gap-3">
                    <Pill tone="scan">{m.code}</Pill>
                    <h4
                      data-glitch
                      data-text={m.name}
                      className="glitch-text text-xl font-semibold uppercase tracking-wide sm:text-2xl"
                    >
                      {m.name}
                    </h4>
                  </div>
                  <p data-stagger className="chrome mb-6 text-signal-soft">
                    {m.subtitle}
                  </p>

                  <ul className="max-w-3xl space-y-3.5">
                    {m.log.map((line, i) => (
                      <li key={i} data-stagger className="flex gap-4">
                        <span aria-hidden="true" className="chrome tabnum shrink-0 pt-1.5 text-dim/60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[15px] leading-relaxed text-dim sm:text-base">{line}</span>
                      </li>
                    ))}
                  </ul>
                </ScanPanel>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Chapter>
  );
}
