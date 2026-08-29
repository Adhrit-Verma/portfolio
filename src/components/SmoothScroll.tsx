"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, useReducedMotion } from "@/lib/motion";

/**
 * Lenis drives GSAP's ticker so scrubbed timelines land on the same frame as
 * the scroll position. Skipped entirely under reduced motion — native scroll
 * is the calmer fallback, not a degraded one.
 */
export default function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ duration: 1.05, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
    const raf = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
