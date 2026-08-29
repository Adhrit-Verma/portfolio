"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { countUp, gsap, glitchCut, typeOn, useLowPower, useReducedMotion } from "@/lib/motion";
import { identity, stats } from "@/lib/resume";
import { Corners, Pill } from "./hud";

const HeroField = dynamic(() => import("./HeroField"), { ssr: false });

/** Fires once the boot overlay is out of the way (or immediately, if it never ran). */
function useBooted() {
  const [booted, setBooted] = useState(
    () => typeof window !== "undefined" && !!window.sessionStorage.getItem("ctos-booted"),
  );
  useEffect(() => {
    if (booted) return;
    const on = () => setBooted(true);
    window.addEventListener("ctos:booted", on, { once: true });
    const failsafe = window.setTimeout(on, 6000);
    return () => {
      window.removeEventListener("ctos:booted", on);
      window.clearTimeout(failsafe);
    };
  }, [booted]);
  return booted;
}

export default function Hero() {
  const reduced = useReducedMotion();
  const lowPower = useLowPower();
  const booted = useBooted();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!booted || !el) return;

    const ctx = gsap.context(() => {
      const role = el.querySelector<HTMLElement>("[data-role]");
      const name = el.querySelector<HTMLElement>("[data-glitch]");

      if (reduced) {
        if (role) role.textContent = identity.role;
        el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
          n.textContent = String(n.dataset.count);
        });
        gsap.fromTo(el.querySelectorAll("[data-stagger]"), { opacity: 0 }, { opacity: 1, duration: 0.45, stagger: 0.04 });
        return;
      }

      const tl = gsap.timeline({ delay: 0.15 });

      tl.fromTo(
        el.querySelectorAll("[data-corner]"),
        { opacity: 0, scale: 0.4 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out", stagger: 0.06 },
      )
        .fromTo(
          el.querySelectorAll("[data-stagger]"),
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.75, ease: "power3.out", stagger: 0.07 },
          "-=0.2",
        )
        .add(() => name && glitchCut(name), "-=0.55");

      if (role) tl.add(typeOn(role, identity.role, 0.75), 0.45);

      el.querySelectorAll<HTMLElement>("[data-count]").forEach((n, i) => {
        tl.add(countUp(n, Number(n.dataset.count), 1.0), 0.7 + i * 0.08);
      });
    }, el);

    return () => ctx.revert();
  }, [booted, reduced]);

  return (
    <section
      ref={root}
      id="hero"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-28 pt-20"
    >
      <div aria-hidden="true" className="circuit-grid absolute inset-0 opacity-70" />

      {/* the one 3D layer — never on coarse pointers or under reduced motion */}
      {!lowPower && !reduced && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[6%] top-1/2 hidden h-[54vh] w-[54vh] -translate-y-1/2 opacity-60 lg:block"
        >
          <HeroField />
        </div>
      )}
      {(lowPower || reduced) && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-20%] top-1/2 h-[60vh] w-[70vw] -translate-y-1/2 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,107,26,0.18), rgba(79,227,214,0.07) 55%, transparent 72%)",
          }}
        />
      )}

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <div data-stagger className="mb-6 flex flex-wrap items-center gap-2">
            <Pill tone="signal">CTOS PROFILE // 0X01</Pill>
            <Pill tone="scan">SCAN COMPLETE</Pill>
          </div>

          <h1
            id="hero-title"
            data-glitch
            data-text={identity.name}
            className="glitch-text text-[clamp(3rem,12vw,9rem)] font-bold uppercase leading-[0.86] tracking-tighter"
          >
            <span data-stagger className="block">
              {identity.name}
            </span>
          </h1>

          <p
            data-stagger
            className="chrome caret mt-6 min-h-[1.4em] text-signal-soft sm:text-xs"
            aria-label={identity.role}
          >
            <span data-role>{identity.role}</span>
          </p>

          <p data-stagger className="mt-5 max-w-xl text-base leading-relaxed text-dim sm:text-lg">
            Backend-first. Ships airline operations and HR platforms that people
            depend on at 6am, then owns the pager when they do.
          </p>

          {/* ctOS profile card */}
          <div data-stagger className="relative mt-9 max-w-lg bg-panel/60 p-5 backdrop-blur-sm">
            <Corners />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                ["Occupation", identity.role],
                ["Employer", "Newru Technologies"],
                ["Location", identity.location],
                ["Active since", identity.since],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="chrome text-dim">{k}</dt>
                  <dd className="mt-1.5 font-mono text-sm text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              {identity.stack.map((s) => (
                <Pill key={s} tone="dim">
                  {s}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        {/* stat readout */}
        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-line pt-8 md:grid-cols-4">
          {stats.map((s) => (
            <li key={s.label} data-stagger>
              <p className="tabnum font-display text-4xl font-bold text-signal sm:text-5xl">
                {s.prefix}
                <span data-count={s.value}>{s.value}</span>
                {s.suffix}
              </p>
              <p className="chrome mt-2 text-ink">{s.label}</p>
              <p className="chrome mt-1 text-dim/80 normal-case tracking-normal">{s.note}</p>
            </li>
          ))}
        </ul>
      </div>

      <div
        aria-hidden="true"
        className="chrome absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-dim sm:block"
      >
        ↓ SCROLL TO DECRYPT
      </div>
    </section>
  );
}
