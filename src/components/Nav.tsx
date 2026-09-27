"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { chapters, identity } from "@/lib/resume";
import { PixelFace, type Mood } from "./pixel";

const PAGES = [
  { href: "/work", label: "Files", match: "/work" },
  { href: "/record", label: "Record", match: "/record" },
  { href: "/#connect", label: "Contact", match: "" },
];

/** Active chapter via IntersectionObserver — no scroll listener needed. */
function useActiveChapter(enabled: boolean) {
  const [active, setActive] = useState("");
  useEffect(() => {
    if (!enabled) return;
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
  }, [enabled]);
  return active;
}

/** The LED face is the status light: it scans for a moment on every navigation. */
function useNavMood() {
  const pathname = usePathname();
  const first = useRef(true);
  const [mood, setMood] = useState<Mood>("idle");
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setMood("scan");
    const t = window.setTimeout(() => setMood("idle"), 900);
    return () => window.clearTimeout(t);
  }, [pathname]);
  return mood;
}

export default function Nav() {
  const pathname = usePathname();
  const onRecord = pathname === "/record";
  const active = useActiveChapter(onRecord);
  const mood = useNavMood();
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
        href="#main"
        className="chrome sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-signal focus:px-4 focus:py-3 focus:text-void"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-void/92">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-5 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 py-2" aria-label={`${identity.name} — home`}>
            <PixelFace mood={mood} cell={1.5} />
            <span className="chrome hidden text-ink min-[420px]:inline">{identity.handle}</span>
          </Link>
          <span className="chrome hidden text-dim md:inline">/ CTOS DOSSIER</span>

          <nav aria-label="Pages" className="ml-auto">
            <ul className="flex items-center">
              {PAGES.map((p) => {
                const on = p.match !== "" && pathname.startsWith(p.match);
                return (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      aria-current={on ? "page" : undefined}
                      className={`chrome relative block px-2.5 py-4 transition-colors sm:px-3.5 ${
                        on ? "text-signal" : "text-dim hover:text-ink"
                      }`}
                    >
                      {p.label}
                      {on && <span aria-hidden="true" className="absolute inset-x-2.5 bottom-2 h-px bg-signal sm:inset-x-3.5" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <span className="chrome hidden tabnum text-dim lg:inline" suppressHydrationWarning>
            {clock || "--:--:--"}
          </span>
        </div>
      </header>

      {/* chapter rail — only the record page has chapters to jump between */}
      {onRecord && (
        <nav aria-label="Chapters" className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
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
                        on ? "text-signal opacity-100" : "text-dim opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                      }`}
                    >
                      {c.index} {c.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`block h-px transition-[width,background-color] duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
                        on ? "w-[22px] bg-signal" : "w-2.5 bg-line-hot"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}
