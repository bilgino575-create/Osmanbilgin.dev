"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Physics, RigidBody, CuboidCollider, type RapierRigidBody } from "@react-three/rapier";
import { Quaternion, Vector3 } from "three";
import { L } from "./layout";
import { DuckMesh } from "./Duck";
import { store } from "@/lib/store";
import { rig } from "../rig/CameraRig";
import { audio } from "@/lib/audio";

const q = new Quaternion();
const up = new Vector3();
const torque = new Vector3();
const impulse = new Vector3();

/**
 * Rapier physics for the duck only. The world is paused whenever the desk
 * is off screen. A click gives the duck an impulse and a spin; a gentle
 * self-righting torque brings it back upright so it always ends the wobble
 * standing, like a real rubber duck with a weighted base.
 */
export default function DuckPhysics() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    store.boot("ok", "physics: rapier wasm loaded, duck is live");
  }, []);
  useFrame(() => {
    const off = rig.p > 0.24 && rig.p < 0.86;
    if (off !== paused) setPaused(off);
  });
  return (
    <Physics gravity={[0, -9.81, 0]} timeStep={1 / 60} paused={paused} colliders={false}>
      {/* desk top */}
      <CuboidCollider args={[L.deskW / 2, 0.02, L.deskD / 2]} position={[0, L.deskY - 0.02, L.deskZ]} friction={0.9} />
      {/* invisible fence keeps it near its spot */}
      <CuboidCollider args={[0.02, 0.2, 0.2]} position={[L.duck.x - 0.22, L.deskY + 0.2, L.duck.z]} />
      <CuboidCollider args={[0.02, 0.2, 0.2]} position={[L.duck.x + 0.22, L.deskY + 0.2, L.duck.z]} />
      <CuboidCollider args={[0.2, 0.2, 0.02]} position={[L.duck.x, L.deskY + 0.2, L.duck.z - 0.16]} />
      <CuboidCollider args={[0.2, 0.2, 0.02]} position={[L.duck.x, L.deskY + 0.2, L.duck.z + 0.18]} />
      <Duck />
    </Physics>
  );
}

function Duck() {
  const body = useRef<RapierRigidBody>(null);
  const awake = useRef(0);

  useFrame((_, dt) => {
    const b = body.current;
    if (!b || b.isSleeping()) return;
    // self-righting: torque toward world up, proportional to tilt
    const r = b.rotation();
    q.set(r.x, r.y, r.z, r.w);
    up.set(0, 1, 0).applyQuaternion(q);
    torque.set(up.z, 0, -up.x).multiplyScalar(0.00045);
    b.applyTorqueImpulse(torque, true);
    awake.current = Math.max(0, awake.current - dt);
  });

  const poke = () => {
    const b = body.current;
    if (!b) return;
    b.wakeUp();
    impulse.set((Math.random() - 0.5) * 0.02, 0.055 + Math.random() * 0.02, (Math.random() - 0.5) * 0.02);
    b.applyImpulse(impulse, true);
    torque.set((Math.random() - 0.5) * 0.0014, (Math.random() - 0.5) * 0.002, (Math.random() - 0.5) * 0.0014);
    b.applyTorqueImpulse(torque, true);
    awake.current = 3;
    audio.blip(520);
  };

  return (
    <RigidBody
      ref={body}
      position={[L.duck.x, L.deskY + 0.01, L.duck.z]}
      colliders={false}
      mass={0.06}
      restitution={0.35}
      friction={0.8}
      angularDamping={1.6}
      linearDamping={0.4}
      ccd
    >
      <CuboidCollider args={[0.04, 0.045, 0.05]} position={[0, 0.048, 0.005]} />
      <group
        onPointerDown={(e) => {
          e.stopPropagation();
          poke();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <DuckMesh />
      </group>
    </RigidBody>
  );
}
