"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { chapters, identity } from "@/lib/resume";

/** Active chapter via IntersectionObserver — no scroll listener needed. */
function useActiveChapter() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );
    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return active;
}

export default function Nav() {
  const active = useActiveChapter();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <a
        href="#profile"
        className="chrome sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-signal focus:px-4 focus:py-3 focus:text-void"
      >
        Skip to content
      </a>

      {/* top chrome bar */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-void/80 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-5 sm:px-8">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-signal" />
          <span className="chrome text-ink">{identity.handle}</span>
          <span className="chrome hidden text-dim sm:inline">/ CTOS DOSSIER</span>
          <span className="chrome ml-auto tabnum text-dim" suppressHydrationWarning>
            {clock || "--:--:--"}
          </span>
        </div>
      </div>

      {/* chapter rail — desktop only, it's chrome not navigation of last resort */}
      <nav
        aria-label="Chapters"
        className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 lg:block"
      >
        <ul className="flex flex-col gap-3">
          {chapters.map((c) => {
            const on = active === c.id;
            return (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  aria-current={on ? "true" : undefined}
                  className="group flex items-center justify-end gap-2.5"
                >
                  <span
                    className={`chrome transition-opacity duration-300 ${
                      on ? "text-signal opacity-100" : "text-dim opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {c.index} {c.label}
                  </span>
                  <motion.span
                    aria-hidden="true"
                    animate={{ width: on ? 22 : 10, backgroundColor: on ? "#FF6B1A" : "#3A424E" }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="block h-px"
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
