"use client";

/**
 * The second 3D layer: a LangGraph-shaped pipeline topology.
 *
 * It is not decoration for its own sake — the three featured projects are all
 * multi-agent graphs, so the Files chapter opens on one executing. Scroll
 * position drives the execution front; nodes light up layer by layer as it passes.
 *
 * GSAP still owns scroll (design-system.md §3). ScrollTrigger writes a number
 * into a ref and useFrame reads it, so nothing here triggers a React render.
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollTrigger } from "@/lib/motion";

/** Node count per layer — fan out, do the work, converge on a verdict. */
const LAYERS = [1, 3, 5, 4, 3, 1];
const SPAN_X = 4.6;
const FANOUT = 3; // edges per node to the next layer

const COLD = new THREE.Color("#2b3542");
const HOT = new THREE.Color("#ff6b1a");

function buildGraph() {
  const nodes: { pos: THREE.Vector3; layer: number }[] = [];

  LAYERS.forEach((count, li) => {
    const x = -SPAN_X / 2 + (li / (LAYERS.length - 1)) * SPAN_X;
    for (let i = 0; i < count; i++) {
      // centre each layer vertically, with a little depth so rotation reads as 3D
      const y = count === 1 ? 0 : (i / (count - 1) - 0.5) * 1.9;
      const z = count === 1 ? 0 : Math.sin((i / count) * Math.PI * 2) * 0.55;
      nodes.push({ pos: new THREE.Vector3(x, y, z), layer: li });
    }
  });

  const edges: number[] = [];
  let cursor = 0;
  LAYERS.forEach((count, li) => {
    if (li === LAYERS.length - 1) return;
    const nextStart = cursor + count;
    const nextCount = LAYERS[li + 1];
    for (let i = 0; i < count; i++) {
      const from = nodes[cursor + i];
      // connect to the FANOUT nearest nodes in the next layer
      const targets = Array.from({ length: nextCount }, (_, j) => nextStart + j)
        .sort((a, b) => from.pos.distanceTo(nodes[a].pos) - from.pos.distanceTo(nodes[b].pos))
        .slice(0, FANOUT);
      for (const t of targets) {
        edges.push(from.pos.x, from.pos.y, from.pos.z, nodes[t].pos.x, nodes[t].pos.y, nodes[t].pos.z);
      }
    }
    cursor = nextStart;
  });

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(edges), 3));

  return { nodes, edgeGeo };
}

function Graph({ progress }: { progress: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { nodes, edgeGeo } = useMemo(() => buildGraph(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const scratch = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const g = group.current;
    const m = mesh.current;
    if (!g || !m) return;

    const t = state.clock.elapsedTime;

    // Oscillate rather than spin: a full rotation turns the pipeline edge-on and
    // the left-to-right shape — the whole point of the thing — disappears.
    g.rotation.y = Math.sin(t * 0.22) * 0.45 + state.pointer.x * 0.18;
    g.rotation.x += (state.pointer.y * 0.16 + 0.05 - g.rotation.x) * 0.05;

    // The execution front sweeps across the layers as the chapter scrolls past.
    const front = (progress.current ?? 0) * (LAYERS.length + 1) - 0.5;

    nodes.forEach((n, i) => {
      const heat = Math.max(0, 1 - Math.abs(n.layer - front) * 0.75);
      const pulse = heat > 0 ? 1 + Math.sin(t * 3 + n.layer) * 0.12 * heat : 1;

      dummy.position.copy(n.pos);
      dummy.scale.setScalar((0.55 + heat * 0.7) * pulse);
      dummy.rotation.set(t * 0.3 + i, t * 0.2 + i, 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, scratch.copy(COLD).lerp(HOT, heat));
    });

    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <lineSegments>
        <primitive object={edgeGeo} attach="geometry" />
        <lineBasicMaterial color="#4fe3d6" transparent opacity={0.26} />
      </lineSegments>
      <instancedMesh ref={mesh} args={[undefined, undefined, nodes.length]}>
        <octahedronGeometry args={[0.155, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

export default function AgentGraph() {
  const host = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  // ScrollTrigger writes; useFrame reads. No React state in the hot path.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });
    return () => st.kill();
  }, []);

  return (
    <div ref={host} className="absolute inset-0">
      <Canvas
        aria-hidden="true"
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.15, 3.85], fov: 42 }}
        gl={{ antialias: false, powerPreference: "low-power" }}
        style={{ pointerEvents: "none" }}
      >
        <Graph progress={progress} />
      </Canvas>
    </div>
  );
}
