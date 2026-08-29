"use client";

import { useRef, useState } from "react";
import { countUp, gsap, typeOn, useIsoEffect } from "@/lib/motion";

/** Hero waits on this instead of guessing how long the boot takes. */
function finishBoot() {
  window.sessionStorage.setItem("ctos-booted", "1");
  window.dispatchEvent(new Event("ctos:booted"));
}

const LINES = [
  "> ctos.link --target ADHRIT_VERMA --region blr",
  "> bypassing profile encryption ............ ok",
  "> employment record ........ NEWRU TECHNOLOGIES",
  "> decrypting project archive ....... 3 dossiers",
];

/**
 * `boot` — the access sequence. Once per session, then it stays out of the way.
 * Mounted in a layout effect so it paints before the hero, and skipped whole
 * under reduced motion: the site simply starts at the hero.
 */
export default function Boot() {
  const [armed, setArmed] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useIsoEffect(() => {
    const seen = window.sessionStorage.getItem("ctos-booted");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      finishBoot();
      return;
    }
    setArmed(true);
  }, []);

  useIsoEffect(() => {
    const el = root.current;
    if (!armed || !el) return;

    document.body.style.overflow = "hidden";
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setArmed(false);
          finishBoot();
        },
      });

      el.querySelectorAll<HTMLElement>("[data-line]").forEach((line, i) => {
        tl.add(typeOn(line, LINES[i], 0.34), i === 0 ? 0 : "-=0.06");
      });

      const pct = el.querySelector<HTMLElement>("[data-pct]");
      if (pct) tl.add(countUp(pct, 100, 1.15), 0.15);

      tl.to(el.querySelector("[data-bar]"), { scaleX: 1, duration: 1.15, ease: "none" }, 0.15)
        .to(el.querySelector("[data-granted]"), { opacity: 1, duration: 0.18 }, ">-0.05")
        .to(el.querySelector("[data-granted]"), { opacity: 0.35, duration: 0.1, repeat: 3, yoyo: true })
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.5, ease: "power2.inOut" }, "+=0.15");
    }, el);

    return () => {
      document.body.style.overflow = "";
      ctx.revert();
    };
  }, [armed]);

  if (!armed) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-live="polite"
      aria-label="Establishing connection"
      className="fixed inset-0 z-[90] flex items-center bg-void"
      style={{ clipPath: "inset(0 0 0 0)" }}
    >
      <div aria-hidden="true" className="scanlines pointer-events-none absolute inset-0 opacity-60" />
      <div className="mx-auto w-full max-w-2xl px-6">
        <p className="chrome mb-6 text-signal">CTOS // REMOTE PROFILE ACCESS</p>

        <div className="space-y-1.5 font-mono text-[13px] leading-relaxed text-dim sm:text-sm">
          {LINES.map((_, i) => (
            <p key={i} data-line className="min-h-[1.4em] break-all" />
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-line">
            <div data-bar className="h-px origin-left scale-x-0 bg-signal" />
          </div>
          <span className="chrome tabnum w-14 text-right text-ink">
            <span data-pct>0</span>%
          </span>
        </div>

        <p data-granted className="chrome mt-6 text-scan opacity-0">
          ACCESS GRANTED — WELCOME BACK
        </p>
      </div>
    </div>
  );
}
