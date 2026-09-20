"use client";

import { motion } from "motion/react";
import {
  credentials,
  endpoints,
  identity,
  profileTraits,
  skillModules,
  summary,
} from "@/lib/resume";
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
        <ScanPanel className="pl-6">
          <p data-stagger className="text-lg leading-relaxed text-ink sm:text-xl sm:leading-relaxed">
            {summary}
          </p>
        </ScanPanel>

        <ScanPanel className="self-start bg-panel/50 p-6" tone="signal" sweep={false}>
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
        label="Access"
        title="Unlocked Modules"
        meta={`${skillModules.length} MODULES · ${skillModules.reduce((n, m) => n + m.items.length, 0)} ENTRIES`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillModules.map((m) => (
          <ScanPanel key={m.id} className="group bg-panel/40 p-5 transition-colors hover:bg-panel-hi/60">
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
        index="05"
        label="Credentials"
        title="Verified Records"
        meta="3 RECORDS ON FILE"
      />

      <div className="space-y-4">
        {credentials.map((c) => (
          <ScanPanel key={c.title} className="bg-panel/40 p-6 sm:p-8">
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

/* ------------------------------------------------------------------ 06 CONNECT */

export function Connect() {
  return (
    <Chapter id="connect" className="pb-16">
      <ChapterHeader
        id="connect-title"
        index="06"
        label="Connect"
        title="Open Channel"
        meta="ENCRYPTION: YOUR CALL"
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="max-w-md text-lg leading-relaxed text-ink">
            Agent pipelines, retrieval that has to actually retrieve, or a platform
            that has quietly become three platforms — send it over. Response time
            beats most CI pipelines.
          </p>
          <motion.a
            href={`mailto:${identity.email}`}
            whileHover={{ x: 6 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 inline-flex items-center gap-3 bg-signal px-6 py-4 font-mono text-sm font-bold uppercase tracking-widest text-void"
          >
            Establish connection
            <span aria-hidden="true">→</span>
          </motion.a>
          <p className="chrome mt-6 text-dim">
            {identity.location} · Open to remote
          </p>
        </div>

        <ScanPanel className="bg-panel/40 p-2 sm:p-4">
          <ul>
            {endpoints.map((e) => (
              <li key={e.label} data-stagger>
                <motion.a
                  href={e.href}
                  target={e.proto === "HTTPS" ? "_blank" : undefined}
                  rel={e.proto === "HTTPS" ? "noreferrer" : undefined}
                  whileHover={{ backgroundColor: "rgba(24,28,35,0.9)" }}
                  className="flex items-center gap-4 border-b border-line px-4 py-5 last:border-0"
                >
                  <span className="chrome w-14 shrink-0 text-scan">{e.proto}</span>
                  <span className="min-w-0 flex-1">
                    <span className="chrome block text-dim">{e.label}</span>
                    <span className="mt-1 block truncate font-mono text-sm text-ink">{e.value}</span>
                  </span>
                  <span aria-hidden="true" className="text-signal">
                    ↗
                  </span>
                </motion.a>
              </li>
            ))}
          </ul>
        </ScanPanel>
      </div>

      <footer className="relative mt-24 border-t border-line pt-6">
        <Stencil className="absolute -top-14 left-0 rotate-1 text-[clamp(1.6rem,5vw,3.4rem)]">
          STAY DEDSEC
        </Stencil>
        <div className="chrome flex flex-wrap items-center justify-between gap-3 text-dim">
          <span>© {new Date().getFullYear()} {identity.name}</span>
          <span>Session closed — no data retained</span>
        </div>
      </footer>
    </Chapter>
  );
}
