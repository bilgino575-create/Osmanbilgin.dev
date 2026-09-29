"use client";

import { useDispose } from "../utils/useDispose";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  NormalBlending,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Plane,
  PlaneGeometry,
  Raycaster,
  ShaderMaterial,
  TorusGeometry,
  Vector2,
  Vector3,
} from "three";
import { L } from "./layout";
import { useMaterials } from "./context";
import { steamFragment, steamVertex } from "./shaders/steam";
import { store } from "@/lib/store";
import { rng } from "../utils/scratch";

const raycaster = new Raycaster();
const ndc = new Vector2();
const hit = new Vector3();

/** A ceramic mug of coffee with GPU steam that the cursor disturbs. */
export default function Mug() {
  const m = useMaterials();
  const camera = useThree((s) => s.camera);
  const tier = store.get().tier;
  const count = tier === "high" ? 320 : 120;

  const body = useMemo(() => {
    const pts = [];
    const r0 = 0.041;
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      pts.push(new Vector2(r0 * (0.86 + 0.14 * t), t * 0.098));
    }
    pts.push(new Vector2(r0 * 0.94, 0.098));
    pts.push(new Vector2(r0 * 0.9, 0.096));
    pts.push(new Vector2(r0 * 0.86, 0.02));
    return new LatheGeometry(pts, 40);
  }, []);
  const handle = useMemo(() => new TorusGeometry(0.023, 0.006, 12, 24, Math.PI), []);
  const steamGeo = useMemo(() => {
    const g = new PlaneGeometry(1, 1);
    const seeds = new Float32Array(count * 4);
    const r = rng(7);
    for (let i = 0; i < count; i++) {
      seeds[i * 4] = r();
      seeds[i * 4 + 1] = 0.7 + r() * 0.6;
      seeds[i * 4 + 2] = r();
      seeds[i * 4 + 3] = r();
    }
    g.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 4));
    return g;
  }, [count]);
  const steamMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: steamVertex,
        fragmentShader: steamFragment,
        uniforms: {
          uTime: { value: 0 },
          uCursor: { value: new Vector3() },
          uCursorOn: { value: 0 },
          uHeight: { value: 0.13 },
          uOpacity: { value: 0.05 },
          uColor: { value: new Color("#cfd8e0") },
        },
        transparent: true,
        depthWrite: false,
        blending: NormalBlending,
      }),
    []
  );
  useDispose(body);
  useDispose(handle);
  useDispose(steamGeo);
  useDispose(steamMat);

  const steamRef = useRef<InstancedMesh>(null);
  const plane = useMemo(() => new Plane(new Vector3(0, 1, 0), -(L.deskY + 0.1)), []);
  const cursorOn = useRef(0);

  useEffect(() => {
    const mesh = steamRef.current;
    if (!mesh) return;
    const mat = new Matrix4();
    for (let i = 0; i < count; i++) mesh.setMatrixAt(i, mat);
    mesh.instanceMatrix.needsUpdate = true;
  }, [count]);

  useFrame((state, dt) => {
    const s = store.get();
    if (!s.reducedMotion) steamMat.uniforms.uTime.value = state.clock.elapsedTime;
    // project the cursor onto a plane just above the mug
    let on = 0;
    if (!s.touch) {
      ndc.set(s.pointerX, s.pointerY);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        const d = Math.hypot(hit.x - L.mug.x, hit.z - L.mug.z);
        if (d < 0.25) {
          steamMat.uniforms.uCursor.value.copy(hit);
          on = 1;
        }
      }
    }
    cursorOn.current += (on - cursorOn.current) * Math.min(1, dt * 6);
    steamMat.uniforms.uCursorOn.value = cursorOn.current;
  });

  return (
    <group position={[L.mug.x, L.deskY, L.mug.z]}>
      <mesh geometry={body} material={m.ceramic} castShadow receiveShadow />
      <mesh geometry={handle} material={m.ceramic} position={[0.043, 0.05, 0]} rotation-z={Math.PI / 2} rotation-y={Math.PI / 2} castShadow />
      {/* coffee surface */}
      <mesh material={m.coffee} position={[0, 0.088, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.036, 32]} />
      </mesh>
      <instancedMesh
        ref={steamRef}
        args={[steamGeo, steamMat, count]}
        position={[0, 0.1, 0]}
        frustumCulled={false}
      />
    </group>
  );
}
