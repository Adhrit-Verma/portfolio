"use client";

import { credentials, identity, profileTraits, skillModules, summary } from "@/lib/resume";
import { Chapter, ChapterHeader, Pill, ScanPanel, Stencil } from "./hud";

/* ------------------------------------------------------------------ 01 PROFILE */

export function Profile() {
  return (
    <Chapter id="profile">
      <ChapterHeader
        id="profile-title"
        index="01"
        label="Profile"
        title="Subject Summary"
        meta="SOURCE: RESUME + PUBLIC REPOS"
      />

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <ScanPanel className="glass p-6 sm:p-8">
          <p data-stagger className="text-lg leading-relaxed text-ink sm:text-xl sm:leading-relaxed">
            {summary}
          </p>
        </ScanPanel>

        <ScanPanel className="self-start glass p-6" tone="signal" sweep={false}>
          <p data-stagger className="chrome mb-5 text-signal">
            Behavioral Read
          </p>
          <dl className="space-y-4">
            {profileTraits.map((t) => (
              <div key={t.k} data-stagger className="border-b border-line pb-3 last:border-0">
                <dt className="chrome text-dim">{t.k}</dt>
                <dd className="mt-1.5 font-mono text-sm text-ink">{t.v}</dd>
              </div>
            ))}
          </dl>
        </ScanPanel>
      </div>
    </Chapter>
  );
}

/* ------------------------------------------------------------------- 02 ACCESS */

export function AccessPanel() {
  return (
    <Chapter id="access" className="overflow-hidden">
      <Stencil className="absolute -right-2 top-10 -rotate-3">{"// TOOLKIT"}</Stencil>

      <ChapterHeader
        id="access-title"
        index="02"
        label="Toolkit"
        title="Unlocked Modules"
        meta={`${skillModules.length} MODULES · ${skillModules.reduce((n, m) => n + m.items.length, 0)} ENTRIES`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillModules.map((m) => (
          <ScanPanel key={m.id} className="group glass p-5 transition-colors hover:bg-panel-hi/60">
            <div data-stagger className="mb-4 flex items-baseline justify-between border-b border-line pb-3">
              <span className="chrome text-scan">{m.id}</span>
              <span className="chrome tabnum text-dim">
                <span data-count={m.items.length}>{m.items.length}</span> ENTRIES
              </span>
            </div>
            <h3 data-stagger className="mb-4 text-xl font-semibold uppercase tracking-wide text-ink">
              {m.title}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {m.items.map((it) => (
                <li key={it} data-stagger>
                  <span className="inline-block border border-line px-2 py-1 font-mono text-[11px] text-dim transition-colors group-hover:border-line-hot group-hover:text-ink">
                    {it}
                  </span>
                </li>
              ))}
            </ul>
          </ScanPanel>
        ))}
      </div>
    </Chapter>
  );
}

/* -------------------------------------------------------------- 05 CREDENTIALS */

export function Credentials() {
  return (
    <Chapter id="creds">
      <ChapterHeader
        id="creds-title"
        index="04"
        label="Credentials"
        title="Verified Records"
        meta="3 RECORDS ON FILE"
      />

      <div className="space-y-4">
        {credentials.map((c) => (
          <ScanPanel key={c.title} className="glass p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div data-stagger className="mb-3 flex flex-wrap items-center gap-2">
                  <Pill tone="scan">{c.kind}</Pill>
                  {c.detail && <Pill tone="signal">{c.detail}</Pill>}
                </div>
                <h3 data-stagger className="text-2xl font-semibold uppercase tracking-wide sm:text-3xl">
                  {c.title}
                </h3>
                <p data-stagger className="mt-2 max-w-2xl text-sm text-dim">
                  {c.org}
                  {c.place && ` — ${c.place}`}
                </p>
              </div>
              <p data-stagger className="chrome shrink-0 tabnum text-signal-soft">
                {c.period}
              </p>
            </div>
          </ScanPanel>
        ))}
      </div>
    </Chapter>
  );
}

/* ------------------------------------------------------------------- footer */

export function Footer() {
  return (
    <footer className="relative mx-auto mt-16 w-full max-w-6xl px-5 pb-10 sm:px-8">
      <Stencil className="absolute -top-12 left-4 rotate-1 text-[clamp(1.6rem,5vw,3.4rem)] sm:left-7">
        STAY DEDSEC
      </Stencil>
      <div className="chrome relative flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-dim">
        <span>© {new Date().getFullYear()} {identity.name}</span>
        <span>Session closed — no data retained</span>
      </div>
    </footer>
  );
}
