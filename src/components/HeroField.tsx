"use client";

/**
 * The one 3D thing on this site: a ctOS-ish node network.
 * Lazy-loaded, never mounted on coarse pointers or under reduced motion
 * (see Hero.tsx), capped at 420 nodes, neighbours resolved once at init.
 */

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points } from "@react-three/drei";
import * as THREE from "three";

const COUNT = 420;
const LINK_DIST = 0.34;
const MAX_LINKS = 2600; // ~1550 expected at this density; this is a ceiling, not a target

function buildField() {
  const pts = new Float32Array(COUNT * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    // jitter so it reads as a scan cloud, not a lattice
    const rad = 1.28 + (Math.random() - 0.5) * 0.16;
    pts[i * 3] = Math.cos(theta) * r * rad;
    pts[i * 3 + 1] = y * rad;
    pts[i * 3 + 2] = Math.sin(theta) * r * rad;
  }

  // ponytail: O(n²) neighbour pass, run once for 420 nodes. Grid-hash it if COUNT grows.
  const seg: number[] = [];
  for (let i = 0; i < COUNT && seg.length < MAX_LINKS * 6; i++) {
    for (let j = i + 1; j < COUNT; j++) {
      const dx = pts[i * 3] - pts[j * 3];
      const dy = pts[i * 3 + 1] - pts[j * 3 + 1];
      const dz = pts[i * 3 + 2] - pts[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < LINK_DIST * LINK_DIST) {
        seg.push(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2], pts[j * 3], pts[j * 3 + 1], pts[j * 3 + 2]);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(seg), 3));
  const lines = new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ color: "#4FE3D6", transparent: true, opacity: 0.16 }),
  );

  return { pts, lines };
}

function Net() {
  const group = useRef<THREE.Group>(null);
  const { pts, lines } = useMemo(() => buildField(), []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * 0.055;
    // pointer parallax, damped
    const { x, y } = state.pointer;
    g.rotation.x += (y * 0.22 - g.rotation.x) * 0.04;
    g.position.x += (x * 0.14 - g.position.x) * 0.04;
  });

  return (
    <group ref={group}>
      <primitive object={lines} />
      <Points positions={pts} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#FF6B1A"
          size={0.042}
          sizeAttenuation
          depthWrite={false}
          opacity={0.95}
        />
      </Points>
    </group>
  );
}

export default function HeroField() {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ antialias: false, powerPreference: "low-power" }}
      style={{ pointerEvents: "none" }}
    >
      <Net />
    </Canvas>
  );
}
