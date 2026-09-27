"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, useReducedMotion } from "@/lib/motion";

/**
 * Lenis drives GSAP's ticker so scrubbed timelines land on the same frame as
 * the scroll position. Skipped entirely under reduced motion — native scroll
 * is the calmer fallback, not a degraded one.
 *
 * Lives in the root layout, so it survives navigation: each new page starts at
 * the top (or its #hash) and ScrollTrigger re-measures the new layout.
 */
export default function SmoothScroll() {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;

    const l = new Lenis({ duration: 1.05, wheelMultiplier: 0.9, touchMultiplier: 1.4, anchors: true });
    const raf = (time: number) => l.raf(time * 1000);
    lenis.current = l;

    l.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      l.destroy();
      lenis.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    const hash = window.location.hash;
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) lenis.current?.scrollTo(target, { immediate: true, offset: -56 });
    else lenis.current?.scrollTo(0, { immediate: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
