"use client";

/**
 * What the world should be doing. Pages register their scenes (DOM section id →
 * formation + camera move); hover can override the formation for a moment.
 * A plain mutable object — the render loop reads it every frame, React never
 * re-renders because of it.
 */
import { useEffect } from "react";

export type V3 = [number, number, number];
export type Cam = { pos: V3; look: V3 };
export type SceneDef = {
  /** id of the DOM element whose scroll span this scene owns */
  id: string;
  form: string;
  /** camera at the scene's start… */
  from: Cam;
  /** …and where it has travelled to by the scene's end (defaults to `from`) */
  to?: Cam;
  fov?: number;
  /** camera roll in radians, start → end */
  roll?: [number, number];
};

export const world = {
  scenes: [] as SceneDef[],
  override: null as string | null,
  /** 0..1 — chromatic-aberration kick, decays each frame */
  kick: 0,
  version: 0,
  listeners: new Set<() => void>(),
};

const notify = () => world.listeners.forEach((l) => l());

export function setScenes(scenes: SceneDef[]) {
  world.scenes = scenes;
  // read by scripts/inspect.mjs to capture each scene settled
  (window as unknown as { __scenes?: string[] }).__scenes = scenes.map((s) => s.id);
  world.version++;
  world.kick = 1;
  notify();
}

export function setOverride(key: string | null) {
  if (world.override === key) return;
  world.override = key;
  if (key) world.kick = Math.max(world.kick, 0.6);
  notify();
}

/** Register this page's scenes with the world. */
export function WorldScenes({ scenes }: { scenes: SceneDef[] }) {
  useEffect(() => {
    setScenes(scenes);
    return () => setOverride(null);
  }, [scenes]);
  return null;
}

/**
 * Orbit `center`, but aim `side` units to the camera's left of it — so the
 * subject sits on the right of frame and text can own the left.
 */
export function orbitSide(r: number, a0: number, a1: number, y: number, side: number, center: V3 = [0, 0, 0]): Pick<SceneDef, "from" | "to"> {
  const at = (a: number): Cam => ({
    pos: [center[0] + Math.sin(a) * r, center[1] + y, center[2] + Math.cos(a) * r],
    look: [center[0] - Math.cos(a) * side, center[1] - y * 0.12, center[2] + Math.sin(a) * side],
  });
  return { from: at(a0), to: at(a1) };
}

/** Camera circling `look` at radius r from angle a0 to a1 (radians), at height y. */
export function orbit(r: number, a0: number, a1: number, y: number, look: V3 = [0, 0, 0]): Pick<SceneDef, "from" | "to"> {
  const at = (a: number): Cam => ({ pos: [look[0] + Math.sin(a) * r, look[1] + y, look[2] + Math.cos(a) * r], look });
  return { from: at(a0), to: at(a1) };
}
