"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  InstancedBufferAttribute,
  InstancedMesh,
  LinearMipmapLinearFilter,
  Matrix4,
  MeshPhysicalMaterial,
  SRGBColorSpace,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { L } from "./layout";
import { useMaterials } from "./context";
import { store } from "@/lib/store";
import { mono, resolveFonts } from "../os/draw";

/**
 * A 61-key mechanical keyboard as a single InstancedMesh.
 *
 * Per-instance attributes: `uvRect` selects the key's legend in a canvas
 * atlas (map + emissiveMap), `aGlow` drives the legend's LED intensity.
 * Real keydown events depress the key and send a ripple to its neighbours.
 * The buffer is only re-uploaded while something is moving.
 */

interface KeyDef {
  code: string;
  legend: string;
  w: number; // units
}

const U = 0.01905; // 19.05 mm key pitch
const ROWS: KeyDef[][] = [
  [
    { code: "Backquote", legend: "`", w: 1 },
    ...Array.from({ length: 10 }, (_, i) => ({ code: `Digit${(i + 1) % 10}`, legend: String((i + 1) % 10), w: 1 })),
    { code: "Minus", legend: "-", w: 1 },
    { code: "Equal", legend: "=", w: 1 },
    { code: "Backspace", legend: "⌫", w: 2 },
  ],
  [
    { code: "Tab", legend: "⇥", w: 1.5 },
    ..."QWERTYUIOP".split("").map((c) => ({ code: `Key${c}`, legend: c, w: 1 })),
    { code: "BracketLeft", legend: "[", w: 1 },
    { code: "BracketRight", legend: "]", w: 1 },
    { code: "Backslash", legend: "\\", w: 1.5 },
  ],
  [
    { code: "CapsLock", legend: "⇪", w: 1.75 },
    ..."ASDFGHJKL".split("").map((c) => ({ code: `Key${c}`, legend: c, w: 1 })),
    { code: "Semicolon", legend: ";", w: 1 },
    { code: "Quote", legend: "'", w: 1 },
    { code: "Enter", legend: "⏎", w: 2.25 },
  ],
  [
    { code: "ShiftLeft", legend: "⇧", w: 2.25 },
    ..."ZXCVBNM".split("").map((c) => ({ code: `Key${c}`, legend: c, w: 1 })),
    { code: "Comma", legend: ",", w: 1 },
    { code: "Period", legend: ".", w: 1 },
    { code: "Slash", legend: "/", w: 1 },
    { code: "ShiftRight", legend: "⇧", w: 2.75 },
  ],
  [
    { code: "ControlLeft", legend: "ctrl", w: 1.25 },
    { code: "MetaLeft", legend: "◆", w: 1.25 },
    { code: "AltLeft", legend: "alt", w: 1.25 },
    { code: "Space", legend: "", w: 6.25 },
    { code: "AltRight", legend: "alt", w: 1.25 },
    { code: "Fn", legend: "fn", w: 1.25 },
    { code: "ContextMenu", legend: "≡", w: 1.25 },
    { code: "ControlRight", legend: "ctrl", w: 1.25 },
  ],
];

interface KeyInst {
  code: string;
  x: number;
  z: number;
  w: number;
  row: number;
  col: number;
}

function layout(): KeyInst[] {
  const keys: KeyInst[] = [];
  const totalW = 15 * U;
  ROWS.forEach((row, r) => {
    let x = -totalW / 2;
    row.forEach((k, c) => {
      const w = k.w * U;
      keys.push({ code: k.code, x: x + w / 2, z: (r - 2) * U, w: w - 0.0026, row: r, col: c });
      x += w;
    });
  });
  return keys;
}

const ATLAS = 1024;
const CELL = 128; // 8×8 cells
function buildAtlas(defs: KeyDef[]): { map: CanvasTexture; emissive: CanvasTexture } {
  resolveFonts();
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = ATLAS;
    c.height = ATLAS;
    return c;
  };
  const a = mk();
  const b = mk();
  const ca = a.getContext("2d")!;
  const cb = b.getContext("2d")!;
  ca.fillStyle = "#ffffff";
  ca.fillRect(0, 0, ATLAS, ATLAS);
  cb.fillStyle = "#000000";
  cb.fillRect(0, 0, ATLAS, ATLAS);
  defs.forEach((d, i) => {
    const cx = (i % 8) * CELL;
    const cy = Math.floor(i / 8) * CELL;
    const small = d.legend.length > 1;
    const font = mono(small ? 26 : 44, 500);
    for (const ctx of [ca, cb]) {
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = ctx === ca ? "#9aa0a8" : "#ffffff";
      ctx.fillText(d.legend, cx + CELL / 2, cy + CELL / 2 + 2);
    }
  });
  const map = new CanvasTexture(a);
  map.colorSpace = SRGBColorSpace;
  map.minFilter = LinearMipmapLinearFilter;
  map.anisotropy = 4;
  map.flipY = false;
  const emissive = new CanvasTexture(b);
  emissive.colorSpace = SRGBColorSpace;
  emissive.minFilter = LinearMipmapLinearFilter;
  emissive.flipY = false;
  return { map, emissive };
}

const tmp = new Matrix4();

export default function Keyboard() {
  const m = useMaterials();
  const keys = useMemo(() => layout(), []);
  const defs = useMemo(() => ROWS.flat(), []);
  const atlas = useMemo(() => buildAtlas(defs), [defs]);
  const meshRef = useRef<InstancedMesh>(null);
  const caseGeo = useMemo(() => new RoundedBoxGeometry(15 * U + 0.012, 0.018, 5 * U + 0.012, 3, 0.004), []);
  const capGeo = useMemo(() => {
    const g = new RoundedBoxGeometry(1, 0.0078, U - 0.0026, 2, 0.0014);
    // per-instance uv rect + glow
    const n = keys.length;
    const rects = new Float32Array(n * 4);
    const glow = new Float32Array(n);
    keys.forEach((k, i) => {
      rects[i * 4 + 0] = (i % 8) / 8;
      rects[i * 4 + 1] = Math.floor(i / 8) / 8;
      rects[i * 4 + 2] = 1 / 8;
      rects[i * 4 + 3] = 1 / 8;
      glow[i] = 0.35;
    });
    g.setAttribute("uvRect", new InstancedBufferAttribute(rects, 4));
    g.setAttribute("aGlow", new InstancedBufferAttribute(glow, 1));
    return g;
  }, [keys]);

  const material = useMemo(() => {
    const mat = (m.keycap as MeshPhysicalMaterial).clone();
    mat.map = atlas.map;
    mat.emissiveMap = atlas.emissive;
    mat.emissiveIntensity = 1;
    mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
          attribute vec4 uvRect;
          attribute float aGlow;
          varying float vGlow;
          varying float vTop;`
        )
        .replace(
          "#include <uv_vertex>",
          `#include <uv_vertex>
          vec2 legendUv = uvRect.xy + uv * uvRect.zw;
          #ifdef USE_MAP
          vMapUv = legendUv;
          #endif
          #ifdef USE_EMISSIVEMAP
          vEmissiveMapUv = legendUv;
          #endif
          vGlow = aGlow;
          vTop = step(0.9, normal.y);`
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          varying float vGlow;
          varying float vTop;`
        )
        .replace(
          "#include <map_fragment>",
          `#ifdef USE_MAP
            vec4 legend = texture2D( map, vMapUv );
            legend = mix(vec4(1.0), legend, vTop);
            diffuseColor *= legend;
          #endif`
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#ifdef USE_EMISSIVEMAP
            vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
            totalEmissiveRadiance *= emissiveColor.rgb * vTop * vGlow;
          #else
            totalEmissiveRadiance *= vGlow;
          #endif`
        );
    };
    mat.customProgramCacheKey = () => "keycap-legend";
    return mat;
  }, [m.keycap, atlas]);

  useEffect(
    () => () => {
      atlas.map.dispose();
      atlas.emissive.dispose();
      capGeo.dispose();
      caseGeo.dispose();
      material.dispose();
    },
    [atlas, capGeo, caseGeo, material]
  );

  // state arrays (no allocation per frame)
  const press = useMemo(() => new Float32Array(keys.length), [keys]);
  const glowTarget = useMemo(() => new Float32Array(keys.length), [keys]);
  const codeIndex = useMemo(() => new Map(keys.map((k, i) => [k.code, i])), [keys]);
  const lastKeyN = useRef(0);
  const active = useRef(true);

  // initial matrices
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    keys.forEach((k, i) => {
      tmp.makeScale(k.w, 1, 1);
      tmp.setPosition(k.x, 0.0125, k.z);
      mesh.setMatrixAt(i, tmp);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [keys]);

  useFrame((state, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const s = store.get();
    if (s.keyEvent.n !== lastKeyN.current) {
      lastKeyN.current = s.keyEvent.n;
      const i = codeIndex.get(s.keyEvent.code);
      if (i !== undefined) {
        if (s.keyEvent.down) {
          press[i] = 1;
          glowTarget[i] = 4;
          // ripple to neighbours
          const k = keys[i];
          for (let j = 0; j < keys.length; j++) {
            const d = Math.hypot(keys[j].x - k.x, keys[j].z - k.z);
            if (d < 0.05 && j !== i) glowTarget[j] = Math.max(glowTarget[j], 2.2 * (1 - d / 0.05));
          }
        } else press[i] = 0;
        active.current = true;
      }
    }
    // idle breathing wave across the board (very subtle), keeps the LEDs alive
    const t = state.clock.elapsedTime;
    const glow = capGeo.getAttribute("aGlow") as InstancedBufferAttribute;
    let moving = false;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const breathe = 0.3 + 0.12 * Math.sin(t * 1.2 + k.x * 40 + k.z * 10);
      const target = Math.max(breathe, glowTarget[i]);
      glowTarget[i] = Math.max(0, glowTarget[i] - dt * 6);
      const cur = glow.array[i] as number;
      const next = cur + (target - cur) * Math.min(1, dt * 14);
      if (Math.abs(next - cur) > 0.002) moving = true;
      glow.array[i] = next;
      // depress
      const y = 0.0125 - press[i] * 0.0025;
      mesh.getMatrixAt(i, tmp);
      if (Math.abs(tmp.elements[13] - y) > 1e-5) {
        tmp.elements[13] += (y - tmp.elements[13]) * Math.min(1, dt * 30);
        mesh.setMatrixAt(i, tmp);
        moving = true;
      }
    }
    glow.needsUpdate = true;
    if (moving) mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[L.keyboard.x, L.deskY + 0.004, L.keyboard.z]} rotation-x={0.04}>
      <mesh geometry={caseGeo} material={m.plastic} position={[0, 0.006, 0]} castShadow receiveShadow />
      {/* LED diffuser plate under the caps */}
      <mesh position={[0, 0.0135, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[15 * U, 5 * U]} />
        <meshStandardMaterial color="#020a0b" emissive="#00f5ff" emissiveIntensity={0.1} toneMapped={false} />
      </mesh>
      <instancedMesh ref={meshRef} args={[capGeo, material, keys.length]} castShadow receiveShadow frustumCulled={false} />
    </group>
  );
}
