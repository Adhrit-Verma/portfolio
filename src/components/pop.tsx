"use client";

/**
 * WD2's street-art layer as components: kinetic poster type, tape marquees,
 * rotating stickers, flat shape badges. The 3D world is the cinema; this is
 * the graffiti on top of it.
 */

import { useEffect, useId, useRef, type ReactNode } from "react";
import { SplitText } from "gsap/SplitText";
import { gsap, useIsoEffect, useReducedMotion } from "@/lib/motion";

if (typeof window !== "undefined") gsap.registerPlugin(SplitText);

/**
 * Pauses the looping CSS animations (tapes, stickers, REC dots) while they're
 * off screen. One observer for the whole page; it writes an attribute, never
 * React state.
 */
export function AnimationGate() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) =>
      entries.forEach((e) => (e.isIntersecting ? e.target.removeAttribute("data-offscreen") : e.target.setAttribute("data-offscreen", ""))),
    );
    const watch = () => document.querySelectorAll(".tape-track, .spin-slow, .rec").forEach((el) => io.observe(el));
    watch();
    // pages mount their animated bits after navigation
    const mo = new MutationObserver(watch);
    mo.observe(document.getElementById("main") ?? document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}

/**
 * Poster type that lands letter by letter, each line masked so the letters
 * rise out of a slot. SplitText re-splits when fonts load or the width changes
 * (autoSplit) and keeps the element's accessible name intact.
 */
export function Kinetic({
  as = "h2",
  children,
  className = "",
  id,
  stagger = 0.022,
  start = "top 88%",
  delay = 0,
  immediate = false,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  children: ReactNode;
  className?: string;
  id?: string;
  stagger?: number;
  start?: string;
  delay?: number;
  /** play on mount instead of on scroll (above-the-fold type) */
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useIsoEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    // above-the-fold type waits for the boot broadcast to get out of the way
    const booted = () => !!window.sessionStorage.getItem("ctos-booted");
    let tween: gsap.core.Tween | undefined;
    const play = () => tween?.play();
    const split = SplitText.create(el, {
      type: "lines,chars",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) => {
        tween = gsap.from(self.chars, {
          yPercent: 118,
          rotate: 9,
          duration: 1.05,
          ease: "expo.out",
          stagger,
          delay,
          paused: immediate && !booted(),
          scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
        });
        return tween;
      },
    });
    window.addEventListener("ctos:booted", play);
    return () => {
      window.removeEventListener("ctos:booted", play);
      split.revert();
    };
  }, [reduced]);

  const Tag = as as "h2";
  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} id={id} className={className}>
      {children}
    </Tag>
  );
}

const TONES = {
  signal: "bg-signal text-void",
  hot: "bg-hot text-void",
  acid: "bg-acid text-void",
  scan: "bg-scan text-void",
  ink: "bg-ink text-void",
  void: "bg-void text-signal border-y border-signal/60",
} as const;

/** A strip of sticker tape with text running along it. Decorative — say it elsewhere for AT. */
export function Tape({
  items,
  tone = "signal",
  reverse = false,
  duration = 38,
  className = "",
}: {
  items: string[];
  tone?: keyof typeof TONES;
  reverse?: boolean;
  duration?: number;
  className?: string;
}) {
  const once = items.map((t) => `${t}  ✦  `).join("");
  // just long enough to span a wide screen: an over-long strip exceeds the GPU
  // layer size limit and silently falls back to main-thread animation
  const row = once.repeat(Math.max(1, Math.ceil(170 / once.length)));
  return (
    <div aria-hidden="true" className={`overflow-hidden py-2.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)] ${TONES[tone]} ${className}`}>
      <div
        className="tape-track flex w-max whitespace-nowrap will-change-transform font-mono text-[13px] font-bold uppercase tracking-[0.2em] sm:text-sm"
        data-reverse={reverse}
        style={{ ["--tape-dur" as string]: `${duration}s` }}
      >
        <span className="pr-2">{row}</span>
        <span className="pr-2">{row}</span>
      </div>
    </div>
  );
}

/** A round sticker with text circling its edge, spinning slowly. */
export function Sticker({
  text,
  size = 150,
  children,
  className = "",
  fill = "var(--color-acid)",
}: {
  text: string;
  size?: number;
  children?: ReactNode;
  className?: string;
  fill?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <div aria-hidden="true" className={`relative ${className}`} style={{ width: size, height: size }}>
      <div className="spin-slow absolute inset-0">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <path id={id} d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <circle cx="50" cy="50" r="49" fill={fill} />
        <circle cx="50" cy="50" r="28" fill="var(--color-void)" />
        <text fill="var(--color-void)" fontSize="8.6" fontFamily="var(--font-jbmono), monospace" fontWeight="700" letterSpacing="1.6">
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** Flat geometric badges — the same primitives the 3D swarm is made of, in 2D. */
export function Shape({ kind, color, className = "" }: { kind: "circle" | "square" | "tri" | "burst"; color: string; className?: string }) {
  const burst = Array.from({ length: 24 }, (_, k) => {
    const a = (k / 24) * Math.PI * 2;
    const r = k % 2 ? 36 : 50;
    // rounded: Node and the browser disagree in the last float digits, which broke hydration
    return `${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`;
  }).join(" ");
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={className}>
      {kind === "circle" && <circle cx="50" cy="50" r="48" fill={color} />}
      {kind === "square" && <rect x="8" y="8" width="84" height="84" fill={color} transform="rotate(8 50 50)" />}
      {kind === "tri" && <polygon points="50,4 97,92 3,92" fill={color} />}
      {kind === "burst" && <polygon points={burst} fill={color} />}
    </svg>
  );
}
