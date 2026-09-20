"use client";

/**
 * The headline, rendered through a corruption shader.
 *
 * A ctOS profile record that is being pulled without permission should not sit
 * there as clean type. The name is drawn to a 2D canvas using the *real* h1's
 * computed font, uploaded as a texture, then torn apart per-channel in GLSL:
 * horizontal slice displacement, chromatic aberration, and scanline modulation,
 * all scaled by one intensity uniform.
 *
 * Intensity is driven by scroll velocity — the faster you move, the harder the
 * record degrades — plus a decaying spike when the profile first resolves.
 *
 * Progressive enhancement: the real <h1> stays in the DOM and only fades to
 * opacity 0 once WebGL has actually painted. No JS, no WebGL, or a context
 * failure and you keep crisp, selectable, screen-reader-correct text.
 */

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec2 uv = vUv;
    float amt = uIntensity;

    // Horizontal slice displacement: a few bands tear sideways at a time,
    // re-rolled on a coarse time step so it reads as digital, not wobbly.
    float band = floor(uv.y * 22.0);
    float roll = hash(band + floor(uTime * 11.0) * 13.0);
    float torn = step(0.80, roll) * (roll - 0.5) * 0.16 * amt;
    uv.x += torn;

    // Per-channel offset. There is always a hairline of it, so the type reads
    // as a signal rather than as a font even when nothing is happening.
    float ca = 0.0016 + 0.026 * amt;
    float r = texture2D(uTex, uv + vec2(ca, 0.0)).a;
    float g = texture2D(uTex, uv).a;
    float b = texture2D(uTex, uv - vec2(ca, 0.0)).a;

    vec3 ink  = vec3(0.929, 0.914, 0.890); // --color-ink
    vec3 hot  = vec3(1.000, 0.180, 0.533); // --color-alert
    vec3 cool = vec3(0.310, 0.890, 0.839); // --color-scan

    float a = max(g, max(r, b));
    vec3 col = ink * g + hot * r * (0.22 + amt * 0.9) + cool * b * (0.22 + amt * 0.9);
    col /= max(a, 0.0001);

    // Scanlines, and a dropout that only bites while the record is degrading.
    a *= 0.94 + 0.06 * sin(uv.y * 620.0);
    a *= 1.0 - step(0.985, hash(band * 7.0 + floor(uTime * 24.0))) * amt * 0.85;

    if (a < 0.003) discard;
    gl_FragColor = vec4(col, a);
  }
`;

function Plane({
  texture,
  aspect,
  onFirstFrame,
}: {
  texture: THREE.Texture;
  aspect: number;
  onFirstFrame: () => void;
}) {
  const { viewport } = useThree();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const painted = useRef(false);
  const velocity = useRef(0);
  const lastY = useRef(0);
  const spike = useRef(1);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const dy = Math.abs(window.scrollY - lastY.current);
      lastY.current = window.scrollY;
      velocity.current = Math.min(1, velocity.current + dy / 220);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Everything mutable lives behind a ref and is touched only here. R3F is an
  // imperative scene graph; the uniforms object itself is never written during render.
  useFrame((state, delta) => {
    const m = matRef.current;
    if (!m) return;

    m.uniforms.uTime.value = state.clock.elapsedTime;

    // Both inputs decay, so the type settles back to near-clean when you stop.
    velocity.current *= Math.max(0, 1 - delta * 3.2);
    spike.current *= Math.max(0, 1 - delta * 1.4);
    m.uniforms.uIntensity.value = Math.min(1, velocity.current * 0.55 + spike.current);

    if (!painted.current) {
      painted.current = true;
      onFirstFrame();
    }
  });

  // Fit the plane to the canvas box; UV then maps 1:1 onto the element.
  const w = viewport.width;
  return (
    <mesh scale={[w, w / aspect, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{
          uTex: { value: texture },
          uTime: { value: 0 },
          uIntensity: { value: 1 },
        }}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function ShaderTitle({
  sourceRef,
  onReady,
}: {
  /** The real <h1> this replaces — its box and computed font are the spec. */
  sourceRef: React.RefObject<HTMLElement | null>;
  onReady: () => void;
}) {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    const el = sourceRef.current;
    if (!el) return;
    let cancelled = false;

    const draw = async () => {
      await document.fonts.ready; // otherwise the texture bakes the fallback face
      if (cancelled || !el) return;

      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;

      const cs = getComputedStyle(el);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cvs = document.createElement("canvas");
      cvs.width = Math.ceil(rect.width * dpr);
      cvs.height = Math.ceil(rect.height * dpr);

      const ctx = cvs.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.font = `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`;
      ctx.fillStyle = "#fff"; // alpha is the payload; the shader supplies colour
      ctx.textBaseline = "middle";
      if ("letterSpacing" in ctx) {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          cs.letterSpacing;
      }

      const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.1;

      let text = (el.textContent ?? "").trim();
      if (cs.textTransform === "uppercase") text = text.toUpperCase();
      if (cs.textTransform === "lowercase") text = text.toLowerCase();

      // Greedy wrap against the real box so the texture breaks where the h1 does.
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(next).width > rect.width) {
          lines.push(line);
          line = word;
        } else {
          line = next;
        }
      }
      if (line) lines.push(line);

      const top = (rect.height - lines.length * lineHeight) / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, 0, top + lineHeight * (i + 0.5));
      });

      const t = new THREE.CanvasTexture(cvs);
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = 4;
      setAspect(rect.width / rect.height);
      setTex(t);
    };

    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(el);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [sourceRef]);

  if (!tex) return null;

  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 1.5], fov: 50 }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => gl.setClearAlpha(0)}
    >
      <Plane texture={tex} aspect={aspect} onFirstFrame={onReady} />
    </Canvas>
  );
}
