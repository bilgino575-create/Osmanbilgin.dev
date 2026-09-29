"use client";

import { useDispose } from "../utils/useDispose";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";
import { services, languages, skillLevels } from "@/lib/data";
import { store } from "@/lib/store";
import { rig } from "../rig/CameraRig";
import { rng, smoothstep } from "../utils/scratch";
import { createTextAtlas, labelFragment, labelVertex } from "../utils/textAtlas";
import { boardFragment, dieFragment, dieVertex, gaugeFragment, gaugeVertex, traceFragment, traceVertex } from "./shaders";

/** Die-shot layout: one block per service, grouped by function. x/z in die units (die is 8×8). */
const SLOTS: Record<string, { x: number; z: number; w: number; d: number }[]> = {
  core: [
    { x: -2.2, z: -0.5, w: 1.5, d: 1.5 },
    { x: -0.6, z: -0.5, w: 1.5, d: 1.5 },
    { x: -2.2, z: 1.1, w: 1.5, d: 1.5 },
    { x: -0.6, z: 1.1, w: 1.5, d: 1.5 },
  ],
  cache: [
    { x: 0.9, z: -0.5, w: 1.0, d: 1.5 },
    { x: 0.9, z: 1.1, w: 1.0, d: 1.5 },
  ],
  memory: [{ x: -1.4, z: -2.15, w: 3.6, d: 1.0 }],
  gpu: [{ x: 2.6, z: 0.3, w: 2.2, d: 3.1 }],
  io: [
    { x: -2.2, z: 2.9, w: 2.0, d: 0.9 },
    { x: 0.0, z: 2.9, w: 2.0, d: 0.9 },
    { x: 2.2, z: 2.9, w: 2.0, d: 0.9 },
  ],
  npu: [{ x: 2.6, z: -2.2, w: 2.2, d: 1.2 }],
};
const BLOCK_LABEL: Record<string, string> = {
  core: "CORE",
  cache: "L3 CACHE",
  memory: "MEMORY CTRL",
  gpu: "GPU",
  io: "I/O",
  npu: "NPU",
};
const BLOCK_COLOR: Record<string, string> = {
  core: "#00f5ff",
  cache: "#a78bfa",
  memory: "#00ff88",
  gpu: "#7c3aed",
  io: "#00f5ff",
  npu: "#c084fc",
};

interface Block {
  title: string;
  kind: string;
  x: number;
  z: number;
  w: number;
  d: number;
  color: string;
}

function layoutBlocks(): Block[] {
  const used: Record<string, number> = {};
  return services.map((s) => {
    const i = used[s.block] ?? 0;
    used[s.block] = i + 1;
    const slot = SLOTS[s.block][Math.min(i, SLOTS[s.block].length - 1)];
    return { title: s.title, kind: s.block, ...slot, color: BLOCK_COLOR[s.block] };
  });
}

const tmp = new Matrix4();
const q = new Quaternion();
const v = new Vector3();
const sc = new Vector3();
const col = new Color();

/** Block material: dark chip with a micro pattern, glowing edges in the block colour. */
const blockVertex = /* glsl */ `
attribute vec3 aColor;
attribute float aPhase;
varying vec2 vUv;
varying vec3 vColor;
varying float vPhase;
varying vec3 vNormalW;
varying float vTop;
void main() {
  vUv = uv;
  vColor = aColor;
  vPhase = aPhase;
  vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vTop = step(0.9, normal.y);
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`;
const blockFragment = /* glsl */ `
precision highp float;
uniform float uTime;
varying vec2 vUv;
varying vec3 vColor;
varying float vPhase;
varying vec3 vNormalW;
varying float vTop;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec3 L = normalize(vec3(0.3, 1.0, 0.5));
  float diff = 0.25 + 0.75 * max(dot(normalize(vNormalW), L), 0.0);
  vec3 base = vec3(0.03, 0.032, 0.045) * diff;
  // micro cells on the top face
  vec2 g = fract(vUv * 18.0);
  float cell = smoothstep(0.0, 0.08, g.x) * smoothstep(1.0, 0.92, g.x) * smoothstep(0.0, 0.08, g.y) * smoothstep(1.0, 0.92, g.y);
  float act = step(0.6, hash(floor(vUv * 18.0) + floor(uTime * 2.0 + vPhase * 10.0)));
  vec3 top = base + vColor * cell * act * 0.12 + vec3(0.01) * (1.0 - cell);
  // glowing edge on the top face
  float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
  float edge = smoothstep(0.05, 0.0, e);
  float breathe = 0.7 + 0.3 * sin(uTime * 1.5 + vPhase * 6.28);
  vec3 col = mix(base + vColor * 0.05 * (1.0 - vUv.y), top, vTop);
  col += vColor * edge * breathe * 1.8 * vTop;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export default function SiliconWorld() {
  const blocks = useMemo(() => layoutBlocks(), []);
  const tier = store.get().tier;

  // ---------- die + board ----------
  const dieMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: dieVertex,
        fragmentShader: dieFragment,
        uniforms: {
          uTime: { value: 0 },
          uCyan: { value: new Color("#00f5ff") },
          uViolet: { value: new Color("#7c3aed") },
          uScale: { value: 24 },
        },
      }),
    []
  );
  const boardMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: dieVertex,
        fragmentShader: boardFragment,
        uniforms: { uTime: { value: 0 }, uCyan: { value: new Color("#00f5ff") } },
      }),
    []
  );

  // ---------- blocks ----------
  const blockGeo = useMemo(() => {
    const g = new BoxGeometry(1, 1, 1);
    const n = blocks.length;
    const colors = new Float32Array(n * 3);
    const phase = new Float32Array(n);
    blocks.forEach((b, i) => {
      col.set(b.color);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
      phase[i] = i / n;
    });
    g.setAttribute("aColor", new InstancedBufferAttribute(colors, 3));
    g.setAttribute("aPhase", new InstancedBufferAttribute(phase, 1));
    return g;
  }, [blocks]);
  const blockMat = useMemo(
    () => new ShaderMaterial({ vertexShader: blockVertex, fragmentShader: blockFragment, uniforms: { uTime: { value: 0 } } }),
    []
  );
  const blockRef = useRef<InstancedMesh>(null);

  // ---------- traces ----------
  const TRACES = tier === "high" ? 360 : 180;
  const traceGeo = useMemo(() => {
    const g = new BoxGeometry(1, 0.012, 0.028);
    const phase = new Float32Array(TRACES);
    const speed = new Float32Array(TRACES);
    const len = new Float32Array(TRACES);
    const r = rng(42);
    for (let i = 0; i < TRACES; i++) {
      phase[i] = r();
      speed[i] = 0.6 + r() * 1.2;
      len[i] = 1;
    }
    g.setAttribute("aPhase", new InstancedBufferAttribute(phase, 1));
    g.setAttribute("aSpeed", new InstancedBufferAttribute(speed, 1));
    g.setAttribute("aLen", new InstancedBufferAttribute(len, 1));
    return g;
  }, [TRACES]);
  const traceMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: traceVertex,
        fragmentShader: traceFragment,
        uniforms: { uTime: { value: 0 }, uColor: { value: new Color("#00f5ff") }, uIntensity: { value: 1.3 } },
      }),
    []
  );
  const traceRef = useRef<InstancedMesh>(null);

  // ---------- labels (one atlas for everything in this act) ----------
  const labelSets = useMemo(() => {
    const serviceLabels = blocks.map((b) => b.title);
    const langLabels = languages.map((l) => l.name);
    const skillLabels = skillLevels.map((s) => s.name);
    const all = [...serviceLabels, ...langLabels, ...skillLabels];
    const atlas = createTextAtlas(all, {
      px: 34,
      weight: 500,
      sub: (i) =>
        i < serviceLabels.length
          ? BLOCK_LABEL[blocks[i].kind]
          : i >= serviceLabels.length + langLabels.length
            ? `${skillLevels[i - serviceLabels.length - langLabels.length].level} / 100`
            : undefined,
    });
    return { atlas, nService: serviceLabels.length, nLang: langLabels.length, nSkill: skillLabels.length };
  }, [blocks]);

  const labelMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: labelVertex,
        fragmentShader: labelFragment,
        uniforms: { uMap: { value: labelSets.atlas.texture }, uIntensity: { value: 1.3 }, uBillboard: { value: 0 } },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    [labelSets]
  );
  const streamLabelMat = useMemo(() => {
    const m = labelMat.clone();
    m.uniforms.uBillboard.value = 1;
    m.uniforms.uIntensity.value = 1.15;
    m.blending = AdditiveBlending;
    return m;
  }, [labelMat]);

  const makeLabelGeo = (count: number, pick: (i: number) => { entry: number; color: string; alpha?: number }) => {
    const g = new PlaneGeometry(1, 1);
    const rect = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const alpha = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const { entry, color, alpha: a } = pick(i);
      const e = labelSets.atlas.entries[entry];
      rect[i * 4] = e.u;
      rect[i * 4 + 1] = e.v;
      rect[i * 4 + 2] = e.w;
      rect[i * 4 + 3] = e.h;
      col.set(color);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
      alpha[i] = a ?? 1;
    }
    g.setAttribute("aRect", new InstancedBufferAttribute(rect, 4));
    g.setAttribute("aColor", new InstancedBufferAttribute(colors, 3));
    g.setAttribute("aAlpha", new InstancedBufferAttribute(alpha, 1));
    return g;
  };

  const serviceLabelGeo = useMemo(
    () => makeLabelGeo(blocks.length, (i) => ({ entry: i, color: "#ffffff" })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blocks, labelSets]
  );
  const serviceLabelRef = useRef<InstancedMesh>(null);

  // language streams: 4 copies of each language riding a bezier across the die
  const STREAM = languages.length * 4;
  const streamGeo = useMemo(
    () =>
      makeLabelGeo(STREAM, (i) => ({
        entry: labelSets.nService + (i % languages.length),
        color: languages[i % languages.length].color,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [labelSets]
  );
  const streamRef = useRef<InstancedMesh>(null);
  const streamSeeds = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: STREAM }, (_, i) => ({ t0: (i / STREAM + r() * 0.02) % 1, lane: (r() - 0.5) * 2, size: 0.3 + r() * 0.12 }));
  }, [STREAM]);

  // skill gauges
  const gaugeGeo = useMemo(() => {
    const g = new PlaneGeometry(1, 1);
    const n = skillLevels.length;
    const level = new Float32Array(n);
    const colors = new Float32Array(n * 3);
    skillLevels.forEach((s, i) => {
      level[i] = s.level / 100;
      col.set(i % 3 === 0 ? "#00f5ff" : i % 3 === 1 ? "#a78bfa" : "#00ff88");
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    });
    g.setAttribute("aLevel", new InstancedBufferAttribute(level, 1));
    g.setAttribute("aColor", new InstancedBufferAttribute(colors, 3));
    return g;
  }, []);
  const gaugeMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: gaugeVertex,
        fragmentShader: gaugeFragment,
        uniforms: { uTime: { value: 0 }, uReveal: { value: 0 } },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    []
  );
  const gaugeRef = useRef<InstancedMesh>(null);
  const gaugeLabelGeo = useMemo(
    () => makeLabelGeo(skillLevels.length, (i) => ({ entry: labelSets.nService + labelSets.nLang + i, color: "#ffffff" })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [labelSets]
  );
  const gaugeLabelRef = useRef<InstancedMesh>(null);

  // components on the motherboard
  const COMP = 90;
  const compGeo = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const capGeo = useMemo(() => new CylinderGeometry(0.5, 0.5, 1, 14), []);
  const compMat = useMemo(() => new MeshStandardMaterial({ color: "#0d0f14", roughness: 0.55, metalness: 0.4 }), []);
  const capMat = useMemo(() => new MeshStandardMaterial({ color: "#1a1d2a", roughness: 0.35, metalness: 0.7 }), []);
  const compRef = useRef<InstancedMesh>(null);
  const capRef = useRef<InstancedMesh>(null);

  useEffect(() => {
    // static instance matrices
    const b = blockRef.current;
    if (b) {
      blocks.forEach((bl, i) => {
        tmp.compose(v.set(bl.x, 0.07, bl.z), q.identity(), sc.set(bl.w, 0.14, bl.d));
        b.setMatrixAt(i, tmp);
      });
      b.instanceMatrix.needsUpdate = true;
    }
    const sl = serviceLabelRef.current;
    if (sl) {
      blocks.forEach((bl, i) => {
        const e = labelSets.atlas.entries[i];
        const w = Math.min(bl.w * 0.92, 1.9);
        const h = w / e.aspect;
        q.setFromAxisAngle(v.set(1, 0, 0), -Math.PI / 2);
        tmp.compose(v.set(bl.x, 0.15, bl.z + Math.min(bl.d * 0.28, 0.5) - h * 0.0), q, sc.set(w, h, 1));
        sl.setMatrixAt(i, tmp);
      });
      sl.instanceMatrix.needsUpdate = true;
    }
    const t = traceRef.current;
    if (t) {
      const r = rng(7);
      let i = 0;
      while (i < TRACES) {
        // a Manhattan polyline of 2..5 segments
        let x = (r() - 0.5) * 7.6;
        let z = (r() - 0.5) * 7.6;
        const segs = 2 + Math.floor(r() * 4);
        let horizontal = r() > 0.5;
        for (let s = 0; s < segs && i < TRACES; s++) {
          const len = 0.3 + r() * 1.6;
          const dir = r() > 0.5 ? 1 : -1;
          const nx = horizontal ? Math.max(-3.9, Math.min(3.9, x + dir * len)) : x;
          const nz = horizontal ? z : Math.max(-3.9, Math.min(3.9, z + dir * len));
          const L = Math.hypot(nx - x, nz - z);
          if (L > 0.05) {
            q.setFromAxisAngle(v.set(0, 1, 0), horizontal ? 0 : Math.PI / 2);
            tmp.compose(v.set((x + nx) / 2, 0.006, (z + nz) / 2), q, sc.set(L, 1, 1));
            t.setMatrixAt(i, tmp);
            (t.geometry.getAttribute("aLen") as InstancedBufferAttribute).setX(i, L);
            i++;
          }
          x = nx;
          z = nz;
          horizontal = !horizontal;
        }
      }
      (t.geometry.getAttribute("aLen") as InstancedBufferAttribute).needsUpdate = true;
      t.instanceMatrix.needsUpdate = true;
    }
    const g = gaugeRef.current;
    const gl = gaugeLabelRef.current;
    if (g && gl) {
      skillLevels.forEach((_, i) => {
        const cx = -4.75 + (i % 5) * 0.72;
        const cz = i < 5 ? -1.55 : -0.55;
        q.setFromAxisAngle(v.set(1, 0, 0), -Math.PI / 2 + 0.55);
        tmp.compose(v.set(cx, 0.22, cz), q, sc.set(0.6, 0.6, 1));
        g.setMatrixAt(i, tmp);
        const e = labelSets.atlas.entries[labelSets.nService + labelSets.nLang + i];
        const w = 0.66;
        tmp.compose(v.set(cx, 0.12, cz + 0.3), q, sc.set(w, w / e.aspect, 1));
        gl.setMatrixAt(i, tmp);
      });
      g.instanceMatrix.needsUpdate = true;
      gl.instanceMatrix.needsUpdate = true;
    }
    const c = compRef.current;
    const cap = capRef.current;
    if (c && cap) {
      const r = rng(21);
      for (let i = 0; i < COMP; i++) {
        // keep clear of the CPU package (|x|,|z| < 6)
        let x = 0,
          z = 0;
        do {
          x = (r() - 0.5) * 50;
          z = (r() - 0.5) * 50;
        } while (Math.abs(x) < 6.5 && Math.abs(z) < 6.5);
        const w = 0.6 + r() * 3.5;
        const d = 0.4 + r() * 2.5;
        const h = 0.15 + r() * 0.9;
        tmp.compose(v.set(x, -0.4 + h / 2, z), q.identity(), sc.set(w, h, d));
        c.setMatrixAt(i, tmp);
        const cx = (r() - 0.5) * 50;
        const cz = (r() - 0.5) * 50;
        const ch = 0.4 + r() * 1.1;
        tmp.compose(v.set(Math.abs(cx) < 6 ? cx + 8 : cx, -0.4 + ch / 2, cz), q.identity(), sc.set(0.5, ch, 0.5));
        cap.setMatrixAt(i, tmp);
      }
      c.instanceMatrix.needsUpdate = true;
      cap.instanceMatrix.needsUpdate = true;
    }
  }, [blocks, labelSets, TRACES]);

  useDispose(dieMat);
  useDispose(boardMat);
  useDispose(blockGeo);
  useDispose(blockMat);
  useDispose(traceGeo);
  useDispose(traceMat);
  useDispose(labelSets.atlas);
  useDispose(labelMat);
  useDispose(streamLabelMat);
  useDispose(serviceLabelGeo);
  useDispose(streamGeo);
  useDispose(gaugeGeo);
  useDispose(gaugeMat);
  useDispose(gaugeLabelGeo);
  useDispose(compGeo);
  useDispose(capGeo);
  useDispose(compMat);
  useDispose(capMat);

  // bezier for the instruction stream: from the I/O edge through the cache into the cores
  const P0 = useMemo(() => new Vector3(4.2, 0.25, 3.6), []);
  const P1 = useMemo(() => new Vector3(1.6, 0.35, 1.2), []);
  const P2 = useMemo(() => new Vector3(0.4, 0.35, -0.2), []);
  const P3 = useMemo(() => new Vector3(-2.6, 0.25, -0.6), []);

  useFrame((state) => {
    const on = rig.p > 0.46 && rig.p < 0.71;
    if (!on) return;
    const t = store.get().reducedMotion ? 0 : state.clock.elapsedTime;
    dieMat.uniforms.uTime.value = t;
    boardMat.uniforms.uTime.value = t;
    blockMat.uniforms.uTime.value = t;
    traceMat.uniforms.uTime.value = t;
    gaugeMat.uniforms.uTime.value = t;
    // gauges sweep in as the camera arrives
    gaugeMat.uniforms.uReveal.value = smoothstep(0.6, 0.65, rig.p);
    // move the instruction stream
    const s = streamRef.current;
    if (s) {
      for (let i = 0; i < STREAM; i++) {
        const seed = streamSeeds[i];
        const u = (t * 0.045 + seed.t0) % 1;
        const mt = 1 - u;
        // cubic bezier
        v.set(0, 0, 0)
          .addScaledVector(P0, mt * mt * mt)
          .addScaledVector(P1, 3 * mt * mt * u)
          .addScaledVector(P2, 3 * mt * u * u)
          .addScaledVector(P3, u * u * u);
        v.x += seed.lane * 0.55;
        v.z += seed.lane * 0.3;
        v.y += 0.08 + Math.sin(t * 2 + i) * 0.02;
        const e = labelSets.atlas.entries[labelSets.nService + (i % languages.length)];
        const w = seed.size;
        const fade = smoothstep(0, 0.08, u) * (1 - smoothstep(0.92, 1, u));
        tmp.compose(v, q.identity(), sc.set(w * fade, (w / e.aspect) * fade, 1));
        s.setMatrixAt(i, tmp);
      }
      s.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* motherboard */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.4, 0]} material={boardMat}>
        <planeGeometry args={[70, 70]} />
      </mesh>
      <instancedMesh ref={compRef} args={[compGeo, compMat, COMP]} frustumCulled={false} />
      <instancedMesh ref={capRef} args={[capGeo, capMat, COMP]} frustumCulled={false} />
      {/* CPU package substrate + rim */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[9.6, 0.4, 9.6]} />
        <meshStandardMaterial color="#0b1a16" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[8.3, 0.04, 8.3]} />
        <meshStandardMaterial color="#3a3d48" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* die */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]} material={dieMat}>
        <planeGeometry args={[8, 8]} />
      </mesh>
      <instancedMesh ref={traceRef} args={[traceGeo, traceMat, TRACES]} frustumCulled={false} />
      <instancedMesh ref={blockRef} args={[blockGeo, blockMat, blocks.length]} frustumCulled={false} />
      <instancedMesh ref={serviceLabelRef} args={[serviceLabelGeo, labelMat, blocks.length]} frustumCulled={false} />
      <instancedMesh ref={streamRef} args={[streamGeo, streamLabelMat, STREAM]} frustumCulled={false} />
      <instancedMesh ref={gaugeRef} args={[gaugeGeo, gaugeMat, skillLevels.length]} frustumCulled={false} />
      <instancedMesh ref={gaugeLabelRef} args={[gaugeLabelGeo, labelMat, skillLevels.length]} frustumCulled={false} />
      {/* lights */}
      <directionalLight position={[4, 12, 6]} intensity={1.6} color="#c9d4ff" />
      <pointLight position={[0, 3, 0]} intensity={4} distance={14} decay={2} color="#00f5ff" />
      <pointLight position={[3, 1.5, -2]} intensity={2} distance={10} decay={2} color="#7c3aed" />
      <ambientLight intensity={0.08} />
    </group>
  );
}
