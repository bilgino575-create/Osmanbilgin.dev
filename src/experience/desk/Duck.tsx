"use client";

import { useDispose } from "../utils/useDispose";

import { forwardRef, useMemo } from "react";
import { BufferGeometry, ConeGeometry, Group, SphereGeometry, Matrix4 } from "three";
import { mergeBufferGeometries } from "three-stdlib";
import { L } from "./layout";
import { useMaterials } from "./context";

/**
 * A procedural rubber duck: body, head, tail, beak and eyes, merged into
 * three geometries (one per material). ~2.6k triangles.
 */
export function useDuckGeometry() {
  const geos = useMemo(() => {
    const tmp = new Matrix4();
    const parts: BufferGeometry[] = [];
    // body: squashed sphere
    const body = new SphereGeometry(0.036, 28, 20);
    body.applyMatrix4(tmp.makeScale(1.1, 0.78, 1.35));
    body.translate(0, 0.028, 0.005);
    parts.push(body);
    // chest bump
    const chest = new SphereGeometry(0.022, 20, 16);
    chest.applyMatrix4(tmp.makeScale(1, 0.9, 1));
    chest.translate(0, 0.03, 0.03);
    parts.push(chest);
    // tail
    const tail = new SphereGeometry(0.02, 20, 14);
    tail.applyMatrix4(tmp.makeScale(0.7, 0.7, 1.4));
    tail.rotateX(-0.55);
    tail.translate(0, 0.045, -0.046);
    parts.push(tail);
    // head
    const head = new SphereGeometry(0.026, 28, 22);
    head.translate(0, 0.078, 0.022);
    parts.push(head);
    // wings
    for (const sgn of [-1, 1]) {
      const wing = new SphereGeometry(0.018, 18, 12);
      wing.applyMatrix4(tmp.makeScale(0.5, 0.7, 1.3));
      wing.translate(sgn * 0.034, 0.03, -0.004);
      parts.push(wing);
    }
    const yellow = mergeBufferGeometries(parts)!;
    parts.forEach((p) => p.dispose());

    const beak = new ConeGeometry(0.011, 0.022, 16);
    beak.applyMatrix4(tmp.makeScale(1.4, 1, 0.7));
    beak.rotateX(Math.PI / 2);
    beak.translate(0, 0.073, 0.052);

    const eyes: BufferGeometry[] = [];
    for (const sgn of [-1, 1]) {
      const e = new SphereGeometry(0.0038, 12, 10);
      e.translate(sgn * 0.013, 0.086, 0.041);
      eyes.push(e);
    }
    const eye = mergeBufferGeometries(eyes)!;
    eyes.forEach((e) => e.dispose());
    return { yellow, beak, eye };
  }, []);
  useDispose(geos.yellow);
  useDispose(geos.beak);
  useDispose(geos.eye);
  return geos;
}

export const DuckMesh = forwardRef<Group>(function DuckMesh(_, ref) {
  const m = useMaterials();
  const g = useDuckGeometry();
  return (
    <group ref={ref} rotation-y={0.55} scale={1.25} dispose={null}>
      <mesh geometry={g.yellow} material={m.rubber} castShadow receiveShadow />
      <mesh geometry={g.beak} material={m.beak} castShadow />
      <mesh geometry={g.eye} material={m.eye} />
    </group>
  );
});

/** Shown until the physics chunk arrives (and if it never does). */
export function DuckStatic() {
  return (
    <group position={[L.duck.x, L.deskY, L.duck.z]}>
      <DuckMesh />
    </group>
  );
}
