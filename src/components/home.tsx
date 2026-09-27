"use client";

/**
 * Home is one broadcast in seven scenes. Each section owns a stretch of scroll;
 * the world behind it (scenes.ts) morphs and the camera moves while you read.
 *
 *   intro    the host: a voxel LED mask, the name as a poster
 *   dive     the camera flies into its eye and down a tunnel; the manifesto
 *   stats    a stadium wall spells ONLINE; four numbers on flat shapes
 *   channels one channel per featured project; the swarm becomes each one
 *   archive  recovered builds
 *   stack    the toolkit on crossing tapes around an atom
 *   connect  the mask again — it reacts to the call to action
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { featured, recovered } from "@/lib/projects";
import { endpoints, identity, skillModules, stats } from "@/lib/resume";
import { ScrollTrigger, countUp, gsap, useGsapScope, useNarrow, useReducedMotion } from "@/lib/motion";
import { homeScenes } from "./world/scenes";
import { WorldScenes, setOverride } from "./world/store";
import { PixelFace } from "./pixel";
import { Kinetic, Shape, Sticker, Tape } from "./pop";

export function HomeScenes() {
  const narrow = useNarrow();
  const scenes = useMemo(() => homeScenes(narrow), [narrow]);
  return <WorldScenes scenes={scenes} />;
}

/* ------------------------------------------------------------------- intro */

export function Intro() {
  return (
    <section id="s-intro" aria-labelledby="intro-title" className="relative flex min-h-[100svh] flex-col overflow-hidden pt-16">
      <div aria-hidden="true" className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-[65%]" />

      <div className="relative mx-auto flex w-full max-w-7xl items-center gap-3 px-5 pt-6 sm:px-8">
        <span className="rec h-2.5 w-2.5 rounded-full bg-hot" aria-hidden="true" />
        <p className="chrome text-ink">
          DEDSEC<span className="text-hot">{"//"}</span>BROADCAST <span className="text-dim">· CH.07 · LIVE FROM {identity.location.split(",")[0].toUpperCase()}</span>
        </p>
      </div>

      <div className="relative mx-auto mt-auto w-full max-w-7xl px-5 pb-28 sm:px-8 sm:pb-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <p className="chrome max-w-xs leading-relaxed text-acid">
            {identity.role}
            <br />
            <span className="text-dim">{identity.tagline}</span>
          </p>
          <Sticker text="PYTHON ✦ LLMS ✦ RAG ✦ MCP ✦ AGENTS ✦ " size={132} className="hidden sm:block">
            <PixelFace mood="happy" cell={2.4} />
          </Sticker>
        </div>

        <Kinetic as="h1" id="intro-title" immediate delay={0.25} stagger={0.035} className="poster riso mt-6 text-[clamp(4rem,min(17vw,26svh),15rem)] text-ink">
          Adhrit
          <br />
          <span className="outline-text [--stroke:var(--color-signal)]">Verma</span>
        </Kinetic>

        <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink/90 sm:text-xl">
          Builds multi-agent systems that do real work — contract review, accessibility remediation, schema
          retrieval for agents — and ran a regulated airline platform solo for two years.
        </p>
      </div>

      <Tape
        className="absolute -left-4 -right-4 bottom-8 -rotate-[2.5deg]"
        items={["Now broadcasting", "Multi-agent pipelines", "RAG that retrieves", "MCP servers", "Shipped · tested · measured"]}
      />
    </section>
  );
}

/* -------------------------------------------------------------------- dive */

const MANIFESTO = [
  { t: "I build", c: "text-ink" },
  { t: "AI systems", c: "text-signal riso" },
  { t: "that do", c: "text-acid" },
  { t: "real work.", c: "text-hot" },
];

export function Dive() {
  const reduced = useReducedMotion();
  const ref = useGsapScope<HTMLElement>(
    (el) => {
      if (reduced) return;
      const words = el.querySelectorAll("[data-word]");
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 } });
      // transform + opacity only: compositor work, no repaint of the giant type per frame
      words.forEach((w, k) =>
        tl.fromTo(
          w,
          { autoAlpha: 0, yPercent: 60, scale: 1.35, rotate: k % 2 ? 4 : -4 },
          { autoAlpha: 1, yPercent: 0, scale: 1, rotate: 0, duration: 1, ease: "power3.out" },
          k * 1.15,
        ),
      );
      tl.fromTo(el.querySelector("[data-sub]"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, ">-0.2").to({}, { duration: 1.4 });
    },
    [reduced],
  );

  return (
    <section ref={ref} id="s-dive" aria-labelledby="dive-title" className="relative h-[270vh]">
      <div id="s-dive-a" aria-hidden="true" className="absolute inset-x-0 top-0 h-[110vh]" />
      <div id="s-dive-b" aria-hidden="true" className="absolute inset-x-0 top-[110vh] h-[160vh]" />

      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center px-5 text-center">
        <h2 id="dive-title" className="poster text-[clamp(2.6rem,min(9.5vw,12.5svh),8.5rem)] leading-[0.88]">
          {MANIFESTO.map((w) => (
            <span key={w.t} data-word className={`block will-change-transform ${w.c}`}>
              {w.t}
            </span>
          ))}
        </h2>
        <p data-sub className="glass mt-8 max-w-xl px-5 py-4 text-base leading-relaxed text-ink sm:text-lg">
          Multi-agent pipelines. Retrieval that has to actually retrieve. MCP servers that let agents touch a real
          database safely — each one tested, measured, and honest about its limits.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- stats */

const SHAPES = [
  { kind: "circle", color: "var(--color-signal)" },
  { kind: "square", color: "var(--color-hot)" },
  { kind: "tri", color: "var(--color-scan)" },
  { kind: "burst", color: "var(--color-acid)" },
] as const;

export function Stats() {
  const reduced = useReducedMotion();
  const ref = useGsapScope<HTMLElement>(
    (el) => {
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
        if (reduced) return;
        ScrollTrigger.create({ trigger: n, start: "top 90%", once: true, onEnter: () => countUp(n, Number(n.dataset.count), 1.4) });
      });
      if (!reduced)
        gsap.from(el.querySelectorAll("[data-pop]"), {
          scale: 0, rotate: -40, duration: 0.9, ease: "back.out(2)", stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 70%", once: true },
        });
    },
    [reduced],
  );

  return (
    <section ref={ref} id="s-stats" aria-labelledby="stats-title" className="relative flex min-h-[115vh] flex-col justify-end pb-24">
      <div aria-hidden="true" className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-[70%]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Kinetic id="stats-title" className="poster text-[clamp(2.6rem,7vw,6rem)] text-ink">
          On the <span className="text-acid">record</span>
        </Kinetic>
        <ul className="mt-12 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {stats.map((s, k) => (
            <li key={s.label} className="relative border-t-2 pt-5" style={{ borderColor: SHAPES[k].color }}>
              {/* the number stands alone; the shape is a sticker beside it, never a frame it must fit */}
              <div className="flex items-start justify-between gap-3">
                <p className="poster tabnum text-[clamp(3rem,6.5vw,6rem)] leading-none" style={{ color: SHAPES[k].color }}>
                  {s.prefix}
                  <span data-count={s.value}>{s.value}</span>
                  {s.suffix}
                </p>
                <div data-pop className="mt-1 h-10 w-10 shrink-0 sm:h-12 sm:w-12">
                  <div className="spin-slow h-full w-full [animation-duration:30s]">
                    <Shape kind={SHAPES[k].kind} color={SHAPES[k].color} className="h-full w-full" />
                  </div>
                </div>
              </div>
              <p className="chrome mt-5 leading-snug text-ink">{s.label}</p>
              <p className="mt-1.5 text-sm text-dim">{s.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- channels */

export function Channels() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const triggers = featured.map((p, k) =>
      ScrollTrigger.create({
        trigger: `#ch-${p.slug}`,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => self.isActive && setActive(k),
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  const last = featured.length - 1;
  return (
    <section ref={root} id="s-channels" aria-labelledby="channels-title" className="relative" style={{ height: `${featured.length * 100 + 30}vh` }}>
      {featured.map((p, k) => (
        <div key={p.slug} id={`ch-${p.slug}`} aria-hidden="true" className="absolute inset-x-0" style={{ top: `${k * 100}vh`, height: k === last ? "130vh" : "100vh" }} />
      ))}

      <h2 id="channels-title" className="sr-only">
        Featured files
      </h2>
      {/* the whole list, for assistive tech and keyboard users; the stage below shows one at a time */}
      <ul className="sr-only">
        {featured.map((p) => (
          <li key={p.slug}>
            <Link href={`/work/${p.slug}`}>
              {p.name} — {p.kind}
            </Link>
          </li>
        ))}
      </ul>

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden="true" className="scrim-l pointer-events-none absolute inset-y-0 left-0 w-full md:w-[62%]" />
        <div aria-hidden="true" className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-[55%] md:hidden" />

        {featured.map((p, k) => {
          const on = k === active;
          return (
            <div
              key={p.slug}
              aria-hidden="true"
              inert
              className={`absolute inset-0 mx-auto flex max-w-7xl flex-col justify-end px-5 pb-36 pt-20 sm:px-8 md:justify-center md:pb-24 ${
                on ? (reduced ? "" : "channel-in") : "pointer-events-none opacity-0"
              }`}
            >
              <p className="chrome flex items-center gap-2.5 text-ink">
                <span className={`h-2 w-2 rounded-full bg-hot ${on ? "rec" : ""}`} />
                CH {String(k + 1).padStart(2, "0")}/{String(featured.length).padStart(2, "0")} · Now playing
                <span className="text-dim">· /{p.code}</span>
              </p>
              <p className="poster riso mt-4 max-w-[12ch] text-[clamp(3rem,min(9vw,16svh),8.5rem)] text-ink">{p.name}</p>
              <p className="chrome mt-4 max-w-md leading-relaxed text-acid">{p.kind}</p>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/90 sm:text-xl">{p.hook}</p>
              <dl className="mt-7 flex gap-10">
                {p.metrics.slice(0, 2).map((m) => (
                  <div key={m.k} className="flex flex-col-reverse">
                    <dt className="chrome mt-2 text-dim">{m.k}</dt>
                    <dd className="poster text-4xl text-signal sm:text-5xl">{m.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}

        {/* the one interactive layer: enter the playing channel, or switch */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 pb-8 sm:px-8">
            <Link
              href={`/work/${featured[active].slug}`}
              className="chrome inline-flex items-center gap-3 bg-signal px-6 py-4 font-bold text-void transition-colors hover:bg-acid"
            >
              Enter file — {featured[active].name} <span aria-hidden="true">→</span>
            </Link>
            <nav aria-label="Channels" className="ml-auto hidden gap-1 md:flex">
              {featured.map((p, k) => (
                <a
                  key={p.slug}
                  href={`#ch-${p.slug}`}
                  aria-current={k === active ? "true" : undefined}
                  className={`chrome border-t-2 px-3 pb-1 pt-3 transition-colors ${
                    k === active ? "border-signal text-ink" : "border-line text-dim hover:text-ink"
                  }`}
                >
                  {String(k + 1).padStart(2, "0")} {p.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- archive */

export function Archive() {
  return (
    <section id="s-archive" aria-labelledby="archive-title" className="relative flex min-h-[110vh] items-center py-28">
      <div aria-hidden="true" className="scrim-l pointer-events-none absolute inset-y-0 left-0 w-full md:w-[65%]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <p className="chrome text-dim">
          <span className="text-hot">{"//"}</span> Recovered — research and reference builds
        </p>
        <Kinetic id="archive-title" className="poster mt-4 text-[clamp(2.8rem,8vw,7rem)] text-ink">
          Recovered <span className="outline-text [--stroke:var(--color-scan)]">files</span>
        </Kinetic>
        <ul className="mt-10 max-w-2xl border-t border-line">
          {recovered.map((p) => (
            <li key={p.slug} className="border-b border-line">
              <Link
                href={`/work/${p.slug}`}
                onPointerEnter={() => setOverride(`glyph:${p.slug}`)}
                onPointerLeave={() => setOverride(null)}
                onFocus={() => setOverride(`glyph:${p.slug}`)}
                onBlur={() => setOverride(null)}
                className="group flex items-baseline gap-5 py-6"
              >
                <span className="chrome w-12 shrink-0 text-scan">{p.code}</span>
                <span className="min-w-0">
                  <span className="poster block text-[clamp(2rem,4.5vw,3.4rem)] text-ink transition-colors group-hover:text-signal">
                    {p.name}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-dim">{p.kind}</span>
                </span>
                <span aria-hidden="true" className="ml-auto text-2xl text-signal transition-transform group-hover:translate-x-1.5">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/work" className="chrome inline-flex items-center gap-2 border border-ink px-5 py-3.5 text-ink transition-colors hover:bg-ink hover:text-void">
            Every file on record <span aria-hidden="true">→</span>
          </Link>
          <Link href="/record" className="chrome inline-flex items-center gap-2 border border-line-hot px-5 py-3.5 text-dim transition-colors hover:border-ink hover:text-ink">
            The full record <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- stack */

const TAPE_TONES = ["signal", "hot", "acid", "scan", "ink", "void"] as const;

export function Stack() {
  return (
    <section id="s-stack" aria-labelledby="stack-title" className="relative flex min-h-[125vh] flex-col justify-center overflow-hidden py-28">
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Kinetic id="stack-title" className="poster riso text-[clamp(3rem,min(12vw,20svh),10.5rem)] text-ink">
          Loadout
        </Kinetic>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-ink/90">
          Six modules, {skillModules.reduce((n, m) => n + m.items.length, 0)} tools — chosen per problem, never per trend.
        </p>
      </div>
      <div className="relative mt-14 space-y-7">
        {skillModules.map((m, k) => (
          <Tape
            key={m.id}
            tone={TAPE_TONES[k % TAPE_TONES.length]}
            reverse={k % 2 === 1}
            duration={34 + k * 5}
            className={`-mx-6 ${k % 2 ? "rotate-[1.8deg]" : "-rotate-[1.4deg]"}`}
            items={[`${m.id} // ${m.title}`, ...m.items]}
          />
        ))}
      </div>
      <dl className="sr-only">
        {skillModules.map((m) => (
          <div key={m.id}>
            <dt>{m.title}</dt>
            <dd>{m.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ----------------------------------------------------------------- connect */

export function Connect() {
  return (
    <section id="s-connect" aria-labelledby="connect-title" className="relative flex min-h-[105vh] flex-col justify-end pb-16 pt-40">
      <div aria-hidden="true" className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-[70%]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Kinetic id="connect-title" className="poster riso text-[clamp(3rem,min(11vw,18svh),10rem)] text-ink">
          Open a <span className="text-signal">channel</span>
        </Kinetic>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="max-w-md text-lg leading-relaxed text-ink/90">
              Agent pipelines, retrieval that has to actually retrieve, or a platform that has quietly become three
              platforms — send it over. Response time beats most CI pipelines.
            </p>
            <a
              href={`mailto:${identity.email}`}
              onPointerEnter={() => setOverride("mask:heart")}
              onPointerLeave={() => setOverride(null)}
              onFocus={() => setOverride("mask:heart")}
              onBlur={() => setOverride(null)}
              className="poster mt-8 inline-flex items-center gap-4 bg-signal px-7 py-5 text-3xl text-void transition-colors hover:bg-acid sm:text-4xl"
            >
              Establish connection <span aria-hidden="true">→</span>
            </a>
          </div>
          <ul className="glass grid gap-px sm:grid-cols-2">
            {endpoints.map((e) => (
              <li key={e.label}>
                <a
                  href={e.href}
                  target={e.proto === "HTTPS" ? "_blank" : undefined}
                  rel={e.proto === "HTTPS" ? "noreferrer" : undefined}
                  className="group block px-5 py-4 transition-colors hover:bg-panel-hi"
                >
                  <span className="chrome block text-scan">
                    {e.proto} · {e.label}
                  </span>
                  <span className="mt-2 block truncate font-mono text-sm text-ink group-hover:text-signal">{e.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="chrome mt-10 text-dim">
          {identity.location} · Open to remote
        </p>
      </div>
    </section>
  );
}
