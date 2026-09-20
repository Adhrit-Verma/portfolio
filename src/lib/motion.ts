"use client";

/**
 * The motion vocabulary from design-system.md §3.
 * Five named patterns — boot, scan, glitchCut, typeOn, unlock — and nothing else.
 * GSAP owns scroll. Framer Motion owns pointer. They never share a timeline.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export const EASE_HUD = "power3.out"; // matches --ease-hud
export const EASE_SNAP = "power2.inOut"; // matches --ease-snap

export const useIsoEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Subscribes to matchMedia. Server snapshot is explicit, so hydration matches. */
function useMedia(query: string, serverValue: boolean) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Live — a user can flip the OS setting without reloading. */
export function useReducedMotion() {
  return useMedia("(prefers-reduced-motion: reduce)", false);
}

/** Touch/pen only — distinct from the 3D power gate below. */
export function useCoarsePointer() {
  return useMedia("(pointer: coarse)", true);
}

/** Coarse pointer, narrow screen, or few cores => skip the 3D layer entirely. */
export function useLowPower() {
  const coarse = useMedia("(pointer: coarse)", true);
  const narrow = useMedia("(max-width: 767px)", true);
  const cores = useSyncExternalStore(
    () => () => {},
    () => (navigator.hardwareConcurrency ?? 8) <= 4,
    () => true,
  );
  return coarse || narrow || cores;
}

/** gsap.context scoped to a ref, auto-reverted. Our stand-in for @gsap/react. */
export function useGsapScope<T extends HTMLElement>(
  setup: (root: T) => void,
  deps: unknown[] = [],
) {
  const ref = useRef<T>(null);
  useIsoEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => setup(root), root);
    return () => ctx.revert();
  }, deps);
  return ref;
}

// ---------------------------------------------------------------- primitives

/** typeOn — characters land one at a time. No plugin, no split. */
export function typeOn(el: Element, text: string, duration = 1.2, delay = 0) {
  const state = { i: 0 };
  el.textContent = "";
  return gsap.to(state, {
    i: text.length,
    duration,
    delay,
    ease: "none",
    snap: { i: 1 },
    onUpdate: () => {
      el.textContent = text.slice(0, state.i);
    },
  });
}

/** Count-up for a stat readout. Tabular figures keep it from jittering. */
export function countUp(el: Element, to: number, duration = 1.1) {
  const state = { n: 0 };
  return gsap.to(state, {
    n: to,
    duration,
    ease: EASE_HUD,
    snap: { n: 1 },
    onUpdate: () => {
      el.textContent = String(Math.round(state.n));
    },
  });
}

/** glitchCut — ~180ms RGB split, then clean. A cut, never a texture. */
export function glitchCut(el: HTMLElement) {
  el.dataset.glitching = "true";
  el.classList.add("glitch-cut");
  window.setTimeout(() => {
    delete el.dataset.glitching;
    el.classList.remove("glitch-cut");
  }, 190);
}

// ---------------------------------------------------------------- the scan

type ScanOpts = { reduced: boolean; start?: string; once?: boolean };

/**
 * `scan` — the signature reveal. Expects, inside `root`:
 *   [data-corner]  four bracket spans
 *   [data-sweep]   the cyan sweep line (optional)
 *   [data-stagger] content that rises in
 *   [data-count]   elements whose textContent is a target integer
 *   [data-glitch]  a label that glitches into place
 *
 * Reduced motion gets the finished state plus a soft fade — never an empty box.
 */
export function scan(root: HTMLElement, { reduced, start = "top 78%", once = true }: ScanOpts) {
  const corners = root.querySelectorAll("[data-corner]");
  const sweep = root.querySelector<HTMLElement>("[data-sweep]");
  const items = root.querySelectorAll("[data-stagger]");
  const counts = root.querySelectorAll<HTMLElement>("[data-count]");
  const glitch = root.querySelector<HTMLElement>("[data-glitch]");

  if (reduced) {
    gsap.set([corners, items], { opacity: 1, clearProps: "transform" });
    if (sweep) gsap.set(sweep, { opacity: 0 });
    gsap.fromTo(
      root,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, scrollTrigger: { trigger: root, start, once } },
    );
    return;
  }

  const tl = gsap.timeline({ scrollTrigger: { trigger: root, start, once } });

  tl.fromTo(
    corners,
    { opacity: 0, scale: 0.4 },
    { opacity: 1, scale: 1, duration: 0.35, ease: EASE_HUD, stagger: 0.05 },
  );

  if (sweep) {
    tl.fromTo(
      sweep,
      { yPercent: -100, opacity: 0.9 },
      { yPercent: 100, opacity: 0, duration: 0.62, ease: "none" },
      "-=0.15",
    );
  }

  tl.fromTo(
    items,
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.6, ease: EASE_HUD, stagger: 0.055 },
    "-=0.42",
  );

  counts.forEach((el) => {
    const target = Number(el.dataset.count ?? el.textContent ?? 0);
    tl.add(countUp(el, target, 0.9), "<");
  });

  if (glitch) tl.add(() => glitchCut(glitch), "-=0.35");

  return tl;
}

export { gsap, ScrollTrigger };
