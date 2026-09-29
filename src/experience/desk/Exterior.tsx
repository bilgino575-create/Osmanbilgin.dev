"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import { L } from "./layout";
import { useMaterials } from "./context";
import { rig } from "../rig/CameraRig";
import { rng } from "../utils/scratch";
import { store } from "@/lib/store";
import { windowFragment, windowVertex } from "./shaders/window";

/**
 * The outside of the building for the ending shot: a facade of instanced
 * windows (one of them lit: the room we were just in), rain streaks around
 * the camera and the far city as a backdrop. Only rendered when p > 0.93.
 */
export default function Exterior() {
  const m = useMaterials();
  const group = useRef<Group>(null);
  const facade = useRef<InstancedMesh>(null);
  const rain = useRef<InstancedMesh>(null);

  const COLS = 11;
  const ROWS = 9;
  const winGeo = useMemo(() => new PlaneGeometry(1.3, 1.0), []);
  const winMat = useMemo(
    () => new MeshStandardMaterial({ color: "#0a0a10", emissive: "#ffd9a0", emissiveIntensity: 0, roughness: 0.4 }),
    []
  );
  // rain streaks
  const RAIN = 900;
  const rainGeo = useMemo(() => {
    const g = new PlaneGeometry(0.006, 0.35);
    const seeds = new Float32Array(RAIN * 3);
    const r = rng(11);
    for (let i = 0; i < RAIN; i++) {
      seeds[i * 3] = r();
      seeds[i * 3 + 1] = r();
      seeds[i * 3 + 2] = r();
    }
    g.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 3));
    return g;
  }, []);
  const rainMat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uColor: { value: new Color("#9fd8ff") } },
        vertexShader: /* glsl */ `
          uniform float uTime;
          attribute vec3 aSeed;
          varying float vA;
          void main() {
            vec4 origin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
            float t = fract(uTime * (0.9 + aSeed.z * 0.6) + aSeed.y);
            vec3 p = origin.xyz;
            p.y = 8.0 - t * 12.0;
            p.x += aSeed.z * 0.2 - t * 0.6;
            vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
            vec3 world = (modelMatrix * vec4(p, 1.0)).xyz + right * position.x + vec3(0.0, position.y, 0.0);
            vA = 0.25 + 0.5 * aSeed.x;
            gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying float vA;
          void main() { gl_FragColor = vec4(uColor, vA * 0.35); }`,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    []
  );
  const cityMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: windowVertex,
        fragmentShader: windowFragment,
        uniforms: {
          uTime: { value: 0 },
          uAspect: { value: 3 },
          uRain: { value: 0 },
          uLit: { value: 0 },
          uTintA: { value: new Color("#7c3aed") },
          uTintB: { value: new Color("#00f5ff") },
        },
      }),
    []
  );
  useEffect(
    () => () => {
      winGeo.dispose();
      winMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();
      cityMat.dispose();
    },
    [winGeo, winMat, rainGeo, rainMat, cityMat]
  );

  useEffect(() => {
    const f = facade.current;
    if (!f) return;
    const mat = new Matrix4();
    const r = rng(3);
    let i = 0;
    const litColor = new Color();
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = (col - 5) * 2.4 + 0.9;
        const y = row * 2.1 + 0.62 - 2.1; // our window is row 1 → y ≈ L.window.y
        mat.makeTranslation(x, y + 1.0, L.wallZ - 0.13);
        f.setMatrixAt(i, mat);
        // our room's window is left transparent (col 5,row 1) → hide with scale 0
        const ours = col === 5 && row === 1;
        if (ours) {
          mat.makeScale(0, 0, 0);
          f.setMatrixAt(i, mat);
        }
        const lit = !ours && r() < 0.12;
        litColor.set(lit ? (r() < 0.5 ? "#ffd9a0" : "#8ec8ff") : "#000000");
        f.setColorAt(i, litColor);
        i++;
      }
    }
    f.instanceMatrix.needsUpdate = true;
    if (f.instanceColor) f.instanceColor.needsUpdate = true;
    const rn = rain.current;
    if (rn) {
      const rr = rng(5);
      for (let k = 0; k < RAIN; k++) {
        mat.makeTranslation((rr() - 0.5) * 14, 0, L.wallZ - 1 - rr() * 9);
        rn.setMatrixAt(k, mat);
      }
      rn.instanceMatrix.needsUpdate = true;
    }
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const on = rig.p > 0.93;
    if (g.visible !== on) g.visible = on;
    if (!on) return;
    if (!store.get().reducedMotion) {
      rainMat.uniforms.uTime.value = state.clock.elapsedTime;
      cityMat.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group ref={group} visible={false}>
      {/* facade wall (outside face) */}
      <mesh position={[0.9, 9, L.wallZ - 0.14]} rotation-y={Math.PI} material={m.wall}>
        <planeGeometry args={[30, 24]} />
      </mesh>
      <instancedMesh ref={facade} args={[winGeo, winMat, COLS * ROWS]} rotation-y={Math.PI} frustumCulled={false} />
      {/* window ledges */}
      {Array.from({ length: ROWS }, (_, row) => (
        <mesh key={row} position={[0.9, row * 2.1 + 0.62 - 2.1 + 0.48, L.wallZ - 0.2]} material={m.plastic}>
          <boxGeometry args={[28, 0.06, 0.14]} />
        </mesh>
      ))}
      {/* far city backdrop */}
      <mesh position={[0.9, 6, L.wallZ - 60]} material={cityMat}>
        <planeGeometry args={[180, 60]} />
      </mesh>
      <instancedMesh ref={rain} args={[rainGeo, rainMat, RAIN]} frustumCulled={false} />
      {/* street glow */}
      <pointLight position={[3, -2, L.wallZ - 6]} color="#7c3aed" intensity={4} distance={20} decay={2} />
      <pointLight position={[-4, 0, L.wallZ - 5]} color="#00f5ff" intensity={2} distance={16} decay={2} />
    </group>
  );
}
