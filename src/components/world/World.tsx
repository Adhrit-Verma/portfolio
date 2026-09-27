"use client";

/**
 * The world behind every page: one swarm of shapes and one camera, both driven
 * by scroll. Pipeline, per frame:
 *
 *   scroll → which scene, how far through it, how far into the next (w)
 *   target = formation(scene) ⟶ formation(next) with a per-shape stagger
 *   current follows target with a per-shape spring (so page changes and hover
 *            overrides animate in time even though scroll is the clock)
 *   display = current + a swirl that grows with distance still to travel
 *            + orbit / wave / flow / spin life
 *
 * The camera does the same: keyframes per scene, spring-followed, with an FOV
 * punch, roll and a chromatic-aberration kick on every cut.
 *
 * Cost control:
 *   - frames are paced by hand: 60fps while anything moves (scroll, pointer,
 *     a morph settling, a page change), 30fps when idle
 *   - once every spring has converged the swarm skips all blending and colour
 *     uploads; only the idle motion is recomputed
 *   - a governor watches real frame times and steps quality down (DPR, then
 *     post-processing) if the device can't keep up — never back up, so no flapping
 *   - low-power devices start without post and draw fewer shapes
 *
 * Decorative only (aria-hidden, no pointer events). Reduced motion: shapes and
 * camera snap per scene, nothing idles, frames render only on scroll/resize.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode, type ChromaticAberrationEffect } from "postprocessing";
import * as THREE from "three";
import { useLowPower, useReducedMotion } from "@/lib/motion";
import { C, PER, S, T, formation, type Formation } from "./formations";
import { world, type SceneDef } from "./store";

const VOID = "#0e0c0b";
const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Anything that moves the picture keeps the world at full frame rate for a moment. */
let activeUntil = 0;
const poke = () => (activeUntil = performance.now() + 1600);

/** Shared clock for every swarm material; the only per-frame upload once settled. */
const uTime = { value: 0 };

const SWARM_COMMON = /* glsl */ `
attribute vec3 aPos; attribute vec3 aScl; attribute vec3 aRot; attribute vec4 aAnim; attribute vec3 aFlow;
attribute vec3 aAxis; attribute float aSeed; attribute float aGlow;
uniform float uTime;
varying float vGlow;
mat3 rotXYZ(vec3 r) {
  vec3 c = cos(r), s = sin(r);
  // three's Euler "XYZ": Rx * Ry * Rz, column-major
  return mat3(c.y * c.z, c.x * s.z + s.x * s.y * c.z, s.x * s.z - c.x * s.y * c.z,
              -c.y * s.z, c.x * c.z - s.x * s.y * s.z, s.x * c.z + c.x * s.y * s.z,
              s.y, -s.x * c.y, c.x * c.y);
}`;

const SWARM_PLACE = /* glsl */ `
vec3 swP = aPos;
if (aFlow.x != 0.0) swP.x = mod(swP.x + uTime * aFlow.x + aFlow.y * 0.5, aFlow.y) - aFlow.y * 0.5;
if (aAnim.w != 0.0) swP.z += aAnim.w * sin(uTime * 1.7 + swP.x * 0.35 + swP.y * 0.3);
if (aAnim.y != 0.0) { float a = uTime * aAnim.y; float c = cos(a), sn = sin(a); swP.xz = vec2(swP.x * c + swP.z * sn, -swP.x * sn + swP.z * c); }
if (aAnim.z != 0.0) { float a = uTime * aAnim.z; float c = cos(a), sn = sin(a); swP.xy = vec2(swP.x * c - swP.y * sn, swP.x * sn + swP.y * c); }
if (aAnim.x != 0.0) swP.y += sin(uTime * 0.9 + aSeed) * 0.05;
mat3 swR = rotXYZ(aRot + aAxis * (aAnim.x * uTime + aFlow.z));
vec3 objectNormal = normalize(swR * normal);
vGlow = aGlow;`;

/**
 * Standard material whose vertex shader places each shape itself. Per instance:
 *   aPos aScl aRot   — sprung position (incl. swirl), scale, base rotation
 *   aAnim            — spin, orbit-Y, orbit-Z, wave amplitude
 *   aFlow            — flow speed, flow wrap length, swirl spin phase
 *   aAxis aSeed      — per-shape spin axis and bob phase (constant)
 *   aGlow            — emissive multiplier
 * The instance matrix stays identity: spin, orbit, wave, flow and bob all run
 * on the GPU from one time uniform, so a settled swarm costs no JS per shape.
 */
function swarmMaterial(flat: boolean) {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.36, metalness: 0.18, flatShading: flat });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uTime;
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>\n${SWARM_COMMON}`)
      .replace("#include <beginnormal_vertex>", SWARM_PLACE)
      .replace("#include <begin_vertex>", "vec3 transformed = swR * (position * aScl) + swP;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vGlow;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vGlow;");
  };
  return m;
}

/* ------------------------------------------------------------ scroll → scenes */

type Spans = { tops: number[]; heights: number[]; scenes: SceneDef[] };

function measure(): Spans {
  const tops: number[] = [], heights: number[] = [], scenes: SceneDef[] = [];
  for (const s of world.scenes) {
    const el = document.getElementById(s.id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    tops.push(r.top + window.scrollY);
    heights.push(r.height);
    scenes.push(s);
  }
  return { tops, heights, scenes };
}

/** Where the reader is: scene index, progress through it, blend into the next. */
function locate(sp: Spans, reduced: boolean) {
  const n = sp.scenes.length;
  if (!n) return null;
  const vh = window.innerHeight;
  const center = window.scrollY + vh * 0.5;
  const Z = vh * 0.38; // the blend zone at the end of each scene
  let i = 0;
  for (let k = 0; k < n; k++) if (center >= sp.tops[k]) i = k;
  const top = sp.tops[i], h = sp.heights[i];
  const t = clamp01((center - top) / Math.max(1, h - Z));
  let w = i < n - 1 ? smooth(clamp01((center - (top + h - Z)) / Z)) : 0;
  if (reduced) w = w > 0.5 ? 1 : 0;
  return { i, t: reduced ? 0 : t, w };
}

/* ---------------------------------------------------------------------- swarm */

const ATTR3 = ["pos", "scl", "rot", "col"] as const;
const ATTR1 = ["glow", "spin", "orbY", "orbZ", "wave", "flow", "flowL"] as const;
type Live = Record<(typeof ATTR3)[number] | (typeof ATTR1)[number], Float32Array> & {
  overrideW: number; lastOverride: string | null; first: boolean;
  prevI: number; prevW: number; prevOW: number; still: number; residual: number;
};

function liveState(): Live {
  const f = formation("mask:scan");
  const out = { overrideW: 0, lastOverride: null, first: true, prevI: -1, prevW: -1, prevOW: -1, still: 0, residual: 1 } as Live;
  for (const k of [...ATTR3, ...ATTR1]) out[k] = f[k].slice();
  return out;
}

/** Spring cur[j] toward the (A→B, then →O) target; returns the remaining gap. */
function spring(A: Float32Array, B: Float32Array, O: Float32Array | null, cur: Float32Array, j: number, wi: number, ow: number, k: number) {
  let v = A[j] + (B[j] - A[j]) * wi;
  if (O) v += (O[j] - v) * ow;
  const d = v - cur[j];
  cur[j] += d * k;
  return d;
}

const SEGMENTS = [
  [0, C],
  [C, T],
  [C + T, S],
] as const;

const ATTRS = { aPos: 3, aScl: 3, aRot: 3, aAnim: 4, aFlow: 3, aAxis: 3, aSeed: 1, aGlow: 1 } as const;
type AttrName = keyof typeof ATTRS;
const DYNAMIC: AttrName[] = ["aPos", "aScl", "aRot", "aAnim", "aFlow", "aGlow"];

function Swarm({ spans, reduced, lite }: { spans: React.RefObject<Spans>; reduced: boolean; lite: boolean }) {
  const cubes = useRef<THREE.InstancedMesh>(null);
  const tets = useRef<THREE.InstancedMesh>(null);
  const sphs = useRef<THREE.InstancedMesh>(null);
  const live = useRef<Live | null>(null);

  const res = useMemo(() => {
    const geos = [new THREE.BoxGeometry(1, 1, 1), new THREE.TetrahedronGeometry(0.75), new THREE.IcosahedronGeometry(0.6, 0)];
    geos.forEach((g, k) => {
      const [base, n] = SEGMENTS[k];
      for (const [name, size] of Object.entries(ATTRS)) {
        const attr = new THREE.InstancedBufferAttribute(new Float32Array(n * size), size);
        attr.setUsage(THREE.DynamicDrawUsage);
        g.setAttribute(name, attr);
      }
      // constants: spin axis and bob phase never change
      const axis = g.getAttribute("aAxis") as THREE.InstancedBufferAttribute;
      const seed = g.getAttribute("aSeed") as THREE.InstancedBufferAttribute;
      for (let idx = 0; idx < n; idx++) {
        const i = base + idx;
        axis.setXYZ(idx, PER.axis[i * 3], PER.axis[i * 3 + 1], PER.axis[i * 3 + 2]);
        seed.setX(idx, i);
      }
    });
    return { geos, mats: [swarmMaterial(false), swarmMaterial(true), swarmMaterial(true)] };
  }, []);

  useEffect(() => {
    [cubes, tets, sphs].forEach((m) => {
      const mesh = m.current;
      if (!mesh) return;
      mesh.frustumCulled = false;
      const id = new THREE.Matrix4();
      for (let k = 0; k < mesh.count; k++) mesh.setMatrixAt(k, id);
      mesh.instanceMatrix.needsUpdate = true;
      mesh.setColorAt(0, new THREE.Color(VOID));
    });
    if (lite) {
      if (tets.current) tets.current.count = 70;
      if (sphs.current) sphs.current.count = 70;
    }
  }, [lite]);

  useFrame((_, rawDt) => {
    const sp = spans.current;
    const loc = sp && locate(sp, reduced);
    if (!loc) return;
    const cur = (live.current ??= liveState());
    const dt = Math.min(rawDt, 1 / 20);
    if (!reduced) uTime.value += dt;

    const A: Formation = formation(sp.scenes[loc.i].form);
    const B: Formation = formation(sp.scenes[Math.min(loc.i + 1, sp.scenes.length - 1)].form);
    if (world.override) cur.lastOverride = world.override;
    cur.overrideW += ((world.override ? 1 : 0) - cur.overrideW) * (reduced ? 1 : 1 - Math.exp(-4 * dt));
    const O: Formation | null = cur.lastOverride ? formation(cur.lastOverride) : null;
    const ow = O ? cur.overrideW : 0;

    // Settled? Same scene, same blend, same override for a while and every spring home.
    const changed = loc.i !== cur.prevI || Math.abs(loc.w - cur.prevW) > 1e-4 || Math.abs(ow - cur.prevOW) > 1e-4;
    cur.still = changed ? 0 : cur.still + 1;
    cur.prevI = loc.i;
    cur.prevW = loc.w;
    cur.prevOW = ow;
    const snap = reduced || cur.first;
    cur.first = false;
    if (!snap && cur.still > 20 && cur.residual < 0.004) return; // the GPU carries the idle motion
    poke();
    let residual = 0;

    const meshes = [cubes.current, tets.current, sphs.current];
    for (let seg = 0; seg < 3; seg++) {
      const mesh = meshes[seg];
      if (!mesh) continue;
      const [base] = SEGMENTS[seg];
      const g = mesh.geometry;
      const at = (n: AttrName) => (g.getAttribute(n) as THREE.InstancedBufferAttribute).array as Float32Array;
      const aPos = at("aPos"), aScl = at("aScl"), aRot = at("aRot"), aAnim = at("aAnim"), aFlow = at("aFlow"), aGlow = at("aGlow");
      const col = mesh.instanceColor?.array as Float32Array | undefined;

      for (let idx = 0; idx < mesh.count; idx++) {
        const i = base + idx;
        const wi = snap ? loc.w : smooth(clamp01((loc.w - PER.delay[i] * 0.4) / 0.6));
        const k = snap ? 1 : 1 - Math.exp(-PER.speed[i] * dt);
        let d2 = 0;
        for (let c = 0; c < 3; c++) {
          const j = i * 3 + c;
          const d = spring(A.pos, B.pos, O?.pos ?? null, cur.pos, j, wi, ow, k);
          d2 += d * d;
          spring(A.scl, B.scl, O?.scl ?? null, cur.scl, j, wi, ow, k);
          spring(A.rot, B.rot, O?.rot ?? null, cur.rot, j, wi, ow, k);
          spring(A.col, B.col, O?.col ?? null, cur.col, j, wi, ow, k);
        }
        for (const key of ATTR1) spring(A[key], B[key], O?.[key] ?? null, cur[key], i, wi, ow, k);
        residual = Math.max(residual, d2);

        // swirl: shapes still travelling arc outward and tumble, then settle
        const swirl = reduced ? 0 : Math.min(Math.sqrt(d2), 10) * 0.32;
        const i3 = idx * 3;
        for (let c = 0; c < 3; c++) {
          aPos[i3 + c] = cur.pos[i * 3 + c] + PER.curl[i * 3 + c] * swirl;
          aScl[i3 + c] = cur.scl[i * 3 + c];
          aRot[i3 + c] = cur.rot[i * 3 + c];
          if (col) col[i3 + c] = cur.col[i * 3 + c];
        }
        aAnim[idx * 4] = cur.spin[i];
        aAnim[idx * 4 + 1] = cur.orbY[i];
        aAnim[idx * 4 + 2] = cur.orbZ[i];
        aAnim[idx * 4 + 3] = cur.wave[i];
        aFlow[i3] = cur.flow[i];
        aFlow[i3 + 1] = cur.flowL[i] || 1;
        aFlow[i3 + 2] = swirl * 0.35;
        aGlow[idx] = cur.glow[i];
      }
      for (const n of DYNAMIC) g.getAttribute(n).needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    cur.residual = residual;
  });

  return (
    <>
      <instancedMesh ref={cubes} args={[res.geos[0], res.mats[0], C]} />
      <instancedMesh ref={tets} args={[res.geos[1], res.mats[1], T]} />
      <instancedMesh ref={sphs} args={[res.geos[2], res.mats[2], S]} />
    </>
  );
}

/* --------------------------------------------------------------------- camera */

type CamState = { pos: number[]; look: number[]; fov: number; roll: number };

function camAt(s: SceneDef, t: number, out: CamState) {
  const to = s.to ?? s.from;
  const e = smooth(t);
  for (let k = 0; k < 3; k++) {
    out.pos[k] = s.from.pos[k] + (to.pos[k] - s.from.pos[k]) * e;
    out.look[k] = s.from.look[k] + (to.look[k] - s.from.look[k]) * e;
  }
  out.fov = s.fov ?? 42;
  out.roll = s.roll ? s.roll[0] + (s.roll[1] - s.roll[0]) * e : 0;
  return out;
}

const camA: CamState = { pos: [0, 0, 0], look: [0, 0, 0], fov: 42, roll: 0 };
const camB: CamState = { pos: [0, 0, 0], look: [0, 0, 0], fov: 42, roll: 0 };
const vTarget = new THREE.Vector3();
const vLook = new THREE.Vector3();

function Rig({ spans, reduced, fx }: { spans: React.RefObject<Spans>; reduced: boolean; fx: React.RefObject<ChromaticAberrationEffect | null> }) {
  const st = useRef({ pos: new THREE.Vector3(0, 0, 40), look: new THREE.Vector3(), fov: 42, roll: 0, mx: 0, my: 0, tmx: 0, tmy: 0, time: 0, first: true });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      st.current.tmx = e.clientX / window.innerWidth - 0.5;
      st.current.tmy = e.clientY / window.innerHeight - 0.5;
      poke();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, rawDt) => {
    const sp = spans.current;
    const loc = sp && locate(sp, reduced);
    if (!loc) return;
    const camera = state.camera as THREE.PerspectiveCamera;
    const s = st.current;
    const dt = Math.min(rawDt, 1 / 20);
    s.time += reduced ? 0 : dt;

    const a = camAt(sp.scenes[loc.i], loc.t, camA);
    const b = camAt(sp.scenes[Math.min(loc.i + 1, sp.scenes.length - 1)], 0, camB);
    const w = loc.w;
    vTarget.set(a.pos[0] + (b.pos[0] - a.pos[0]) * w, a.pos[1] + (b.pos[1] - a.pos[1]) * w, a.pos[2] + (b.pos[2] - a.pos[2]) * w);
    vLook.set(a.look[0] + (b.look[0] - a.look[0]) * w, a.look[1] + (b.look[1] - a.look[1]) * w, a.look[2] + (b.look[2] - a.look[2]) * w);
    const punch = reduced ? 0 : Math.sin(Math.PI * w);
    const fov = a.fov + (b.fov - a.fov) * w + punch * 14;
    const roll = a.roll + (b.roll - a.roll) * w + punch * 0.22;

    if (!reduced) {
      s.mx += (s.tmx - s.mx) * (1 - Math.exp(-3 * dt));
      s.my += (s.tmy - s.my) * (1 - Math.exp(-3 * dt));
      vTarget.x += s.mx * 2.4 + Math.sin(s.time * 0.31) * 0.5;
      vTarget.y -= s.my * 1.6 + Math.cos(s.time * 0.23) * 0.35;
    }

    const k = reduced || s.first ? 1 : 1 - Math.exp(-3.2 * dt);
    s.first = false;
    if (s.pos.distanceToSquared(vTarget) > 0.01) poke();
    s.pos.lerp(vTarget, k);
    s.look.lerp(vLook, k);
    s.fov += (fov - s.fov) * k;
    s.roll += (roll - s.roll) * k;

    camera.position.copy(s.pos);
    camera.lookAt(s.look);
    camera.rotateZ(s.roll);
    if (Math.abs(camera.fov - s.fov) > 0.01) {
      camera.fov = s.fov;
      camera.updateProjectionMatrix();
    }

    // the cut: aberration spikes through every transition and on page/hover changes
    world.kick *= Math.exp(-3 * dt);
    if (world.kick > 0.01) poke();
    const off = reduced ? 0 : 0.0007 + punch * 0.006 + world.kick * 0.008;
    fx.current?.offset.set(off, off * 0.4);
  });
  return null;
}

/* ----------------------------------------------------------- pacing & quality */

/**
 * Drives the demand frameloop: every frame while active, every other frame when
 * idle. Under reduced motion it does nothing — scroll and resize invalidate.
 */
function Pacer({ reduced }: { reduced: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (reduced) return;
    let raf = 0, n = 0;
    const loop = () => {
      n++;
      if (performance.now() < activeUntil || n % 2 === 0) invalidate();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [invalidate, reduced]);
  return null;
}

/**
 * Watches real frame times while the world is active and steps quality down if
 * the device is struggling: tier 0 full, 1 DPR 1, 2 DPR 0.8, 3 no post.
 */
function Governor({ tier, setTier }: { tier: number; setTier: (t: number) => void }) {
  const setDpr = useThree((s) => s.setDpr);
  const acc = useRef({ sum: 0, n: 0, last: 0, warm: 0 });
  useEffect(() => {
    setDpr(tier === 0 ? Math.min(window.devicePixelRatio, 1.25) : tier === 1 ? 1 : 0.8);
  }, [tier, setDpr]);
  useFrame(() => {
    const now = performance.now();
    const a = acc.current;
    const gap = now - a.last;
    a.last = now;
    // only judge full-rate frames: idle pacing and tab switches aren't the GPU's fault
    if (now > activeUntil || gap > 200 || ++a.warm < 90) return;
    a.sum += gap;
    if (++a.n < 90) return;
    const avg = a.sum / a.n;
    a.sum = a.n = 0;
    if (avg > 24 && tier < 3) {
      a.warm = 0;
      setTier(tier + 1);
    }
  });
  return null;
}

/* ---------------------------------------------------------------------- world */

function Scene({ reduced, lite }: { reduced: boolean; lite: boolean }) {
  const spans = useRef<Spans>({ tops: [], heights: [], scenes: [] });
  const fx = useRef<ChromaticAberrationEffect | null>(null);
  const invalidate = useThree((s) => s.invalidate);
  const [tier, setTier] = useState(lite ? 3 : 0);

  useEffect(() => {
    let raf = 0;
    const remeasure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        spans.current = measure();
        poke();
        invalidate();
      });
    };
    remeasure();
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    world.listeners.add(remeasure);
    const onScroll = () => {
      poke();
      invalidate();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const late = window.setTimeout(remeasure, 800); // fonts and images settle
    return () => {
      ro.disconnect();
      world.listeners.delete(remeasure);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(late);
      cancelAnimationFrame(raf);
    };
  }, [invalidate]);

  return (
    <>
      <color attach="background" args={[VOID]} />
      <fog attach="fog" args={[VOID, 26, 95]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 10]} intensity={2.2} color="#ffe2cc" />
      <directionalLight position={[-12, -4, -6]} intensity={1.6} color="#4fe3d6" />
      <pointLight position={[0, 2, 8]} intensity={60} distance={45} color="#ff6b1a" />
      <Swarm spans={spans} reduced={reduced} lite={lite} />
      <Rig spans={spans} reduced={reduced} fx={fx} />
      <Pacer reduced={reduced} />
      {!reduced && <Governor tier={tier} setTier={setTier} />}
      {tier < 3 && (
        <EffectComposer multisampling={0}>
          <ChromaticAberration ref={fx} offset={new THREE.Vector2(0.0007, 0.0003)} radialModulation={false} modulationOffset={0} />
          <Noise opacity={0.07} blendFunction={BlendFunction.OVERLAY} />
          <Vignette darkness={0.72} offset={0.28} />
          {/* Neutral keeps hue as highlights compress: hot orange stays orange instead of clipping to yellow */}
          <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        </EffectComposer>
      )}
    </>
  );
}

export default function World() {
  const reduced = useReducedMotion();
  const lite = useLowPower();
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={1}
        frameloop="demand"
        camera={{ fov: 42, near: 0.1, far: 220, position: [0, 0, 40] }}
        gl={{ antialias: lite, powerPreference: "high-performance", stencil: false, toneMapping: THREE.NeutralToneMapping }}
      >
        <Scene reduced={reduced} lite={lite} />
      </Canvas>
    </div>
  );
}
