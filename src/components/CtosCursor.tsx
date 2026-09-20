"use client";

/**
 * The signature interaction: a ctOS targeting reticle.
 *
 * In Watch_Dogs 2 you point at a person and the city scans them — brackets snap
 * to the target, a readout resolves. That is the whole concept of this site, so
 * it is the cursor. Idle it is a small crosshair; approach anything interactive
 * and it locks to that element's box, tints cyan, and names the action.
 *
 * Written straight to the DOM inside one rAF loop — no React state in the hot
 * path. Never mounted for coarse pointers or reduced motion, and nothing here
 * intercepts a pointer event or reaches the accessibility tree.
 */

import { useEffect, useRef } from "react";
import { useCoarsePointer, useReducedMotion } from "@/lib/motion";

const IDLE = 26; // px, the resting crosshair
const PAD = 10; // breathing room around a locked target

type Frame = { x: number; y: number; w: number; h: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** What the reticle calls the action, per target. */
function actionFor(el: HTMLElement): string {
  const explicit = el.dataset.cursor;
  if (explicit) return explicit;
  if (el.tagName === "BUTTON") return "EXECUTE";
  const href = el.getAttribute("href") ?? "";
  if (href.startsWith("mailto:")) return "OPEN CHANNEL";
  if (href.startsWith("tel:")) return "DIAL";
  if (href.startsWith("#")) return "JUMP";
  return "OPEN ↗";
}

export default function CtosCursor() {
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();

  const boxRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || coarse) return;
    const box = boxRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    const root = rootRef.current;
    if (!box || !dot || !label || !root) return;

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cur: Frame = { x: pointer.x, y: pointer.y, w: IDLE, h: IDLE };
    let locked: HTMLElement | null = null;
    let visible = false;
    let raf = 0;

    document.documentElement.classList.add("ctos-cursor");

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!visible) {
        visible = true;
        root.style.opacity = "1";
      }
    };

    const onOver = (e: PointerEvent) => {
      const hit =
        (e.target as HTMLElement | null)?.closest<HTMLElement>("a, button, [data-cursor]") ??
        null;
      if (hit === locked) return;
      locked = hit;
      if (hit) {
        label.textContent = actionFor(hit);
        root.dataset.locked = "true";
      } else {
        delete root.dataset.locked;
      }
    };

    const onLeave = () => {
      visible = false;
      root.style.opacity = "0";
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);

      // A locked target pulls the reticle onto its box; otherwise it trails the pointer.
      let gx = pointer.x;
      let gy = pointer.y;
      let gw = IDLE;
      let gh = IDLE;

      if (locked?.isConnected) {
        const r = locked.getBoundingClientRect();
        gx = r.left + r.width / 2;
        gy = r.top + r.height / 2;
        gw = r.width + PAD * 2;
        gh = r.height + PAD * 2;
      } else if (locked) {
        locked = null; // target unmounted mid-hover
        delete root.dataset.locked;
      }

      // Size settles faster than position, so the snap reads as a lock-on.
      cur.x = lerp(cur.x, gx, 0.22);
      cur.y = lerp(cur.y, gy, 0.22);
      cur.w = lerp(cur.w, gw, 0.3);
      cur.h = lerp(cur.h, gh, 0.3);

      box.style.transform = `translate3d(${cur.x - cur.w / 2}px, ${cur.y - cur.h / 2}px, 0)`;
      box.style.width = `${cur.w}px`;
      box.style.height = `${cur.h}px`;
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("ctos-cursor");
    };
  }, [reduced, coarse]);

  if (reduced || coarse) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] opacity-0 transition-opacity duration-300"
    >
      {/* the reticle — four brackets that snap to whatever is under the pointer */}
      <div ref={boxRef} className="ctos-reticle absolute left-0 top-0 will-change-transform">
        <span className="ctos-bracket ctos-bracket-tl" />
        <span className="ctos-bracket ctos-bracket-tr" />
        <span className="ctos-bracket ctos-bracket-bl" />
        <span className="ctos-bracket ctos-bracket-br" />
        <span className="ctos-readout">
          <span ref={labelRef} />
        </span>
      </div>

      {/* the true pointer position, unlagged, so clicking still feels exact */}
      <div
        ref={dotRef}
        className="ctos-dot absolute left-0 top-0 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      />
    </div>
  );
}
