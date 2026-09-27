"use client";

import { useRef, useState } from "react";
import { gsap, useIsoEffect } from "@/lib/motion";
import { featured, recovered } from "@/lib/projects";

function finishBoot() {
  window.sessionStorage.setItem("ctos-booted", "1");
  window.dispatchEvent(new Event("ctos:booted"));
}

const BARS = ["#ede9e3", "#ffd23f", "#4fe3d6", "#ff6b1a", "#ff2e88", "#241e1a", "#0e0c0b"];

/**
 * `boot` — DedSec hijacks your screen. Static, colour bars, signal acquired,
 * then the picture collapses to a line and snaps off, CRT-style, onto the site.
 * Once per session; skipped entirely under reduced motion.
 */
export default function Boot() {
  const [armed, setArmed] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useIsoEffect(() => {
    const seen = window.sessionStorage.getItem("ctos-booted");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) return finishBoot();
    setArmed(true);
  }, []);

  useIsoEffect(() => {
    const el = root.current;
    if (!armed || !el) return;
    document.body.style.overflow = "hidden";

    // static: a 160x90 canvas of noise, scaled up pixelated
    const cv = el.querySelector("canvas")!;
    const ctx = cv.getContext("2d")!;
    const img = ctx.createImageData(160, 90);
    let raf = 0;
    const noise = () => {
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 200;
        img.data[i] = v;
        img.data[i + 1] = v * 0.93;
        img.data[i + 2] = v * 0.88;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(noise);
    };
    noise();

    const g = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          setArmed(false);
          finishBoot();
        },
      });
      tl.set("[data-bars]", { autoAlpha: 0 })
        .set("[data-signal]", { autoAlpha: 0 })
        .to("[data-searching]", { autoAlpha: 0.35, duration: 0.08, repeat: 5, yoyo: true })
        .add(() => cancelAnimationFrame(raf), 0.75)
        .set(cv, { autoAlpha: 0 }, 0.75)
        .set("[data-searching]", { autoAlpha: 0 }, 0.75)
        .set("[data-bars]", { autoAlpha: 1 }, 0.75)
        .fromTo("[data-bar]", { yPercent: -100 }, { yPercent: 0, duration: 0.3, stagger: 0.025, ease: "power4.out" }, 0.75)
        .set("[data-signal]", { autoAlpha: 1 }, 1.1)
        .fromTo("[data-signal] > *", { yPercent: 110 }, { yPercent: 0, duration: 0.4, stagger: 0.05, ease: "expo.out" }, 1.1)
        .fromTo("[data-fill]", { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: "power2.inOut" }, 1.15)
        // CRT power-off: squash to a bright line, then to a dot, then gone
        .to(el, { scaleY: 0.004, duration: 0.22, ease: "power3.in" }, 1.85)
        .to(el, { scaleX: 0, duration: 0.18, ease: "power3.in" })
        .set(el, { autoAlpha: 0 });
    }, el);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
      g.revert();
    };
  }, [armed]);

  if (!armed) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-live="polite"
      aria-label="Incoming broadcast"
      className="fixed inset-0 z-[90] overflow-hidden bg-void"
      style={{ transformOrigin: "50% 50%" }}
    >
      <canvas width={160} height={90} aria-hidden="true" className="absolute inset-0 h-full w-full" style={{ imageRendering: "pixelated" }} />
      <p data-searching className="poster absolute inset-0 flex items-center justify-center text-[clamp(2rem,6vw,5rem)] text-ink mix-blend-difference">
        No signal
      </p>
      <div data-bars aria-hidden="true" className="absolute inset-0 flex">
        {BARS.map((c) => (
          <div key={c} data-bar className="h-full flex-1" style={{ background: c }} />
        ))}
      </div>
      <div data-signal className="absolute inset-x-0 bottom-0 bg-void px-6 py-8 sm:px-12">
        <div className="overflow-hidden">
          <p className="chrome text-hot">CH.07 // DEDSEC BROADCAST</p>
        </div>
        <div className="overflow-hidden">
          <p className="poster mt-3 text-[clamp(2.4rem,7vw,5.5rem)] text-ink">Signal acquired</p>
        </div>
        <div className="overflow-hidden">
          <p className="chrome mt-3 text-dim">
            ADHRIT_VERMA · {featured.length} featured files · {recovered.length} recovered
          </p>
        </div>
        <div className="mt-5 h-1 bg-line">
          <div data-fill className="h-1 origin-left bg-signal" />
        </div>
      </div>
      <div aria-hidden="true" className="scanlines pointer-events-none absolute inset-0 opacity-70" />
    </div>
  );
}
