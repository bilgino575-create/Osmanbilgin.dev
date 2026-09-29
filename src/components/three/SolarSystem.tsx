"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Stars, Trail } from "@react-three/drei";
import * as THREE from "three";
import { planets } from "@/lib/solarSystemData";
import Planet from "./Planet";
import { createGlowTexture } from "./planetTextures";

function useGlobalPointer() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", handler, { passive: true });
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  return pointer;
}

function Sun() {
  const coreRef = useRef<THREE.Mesh>(null);
  const flareTexture = useMemo(() => createGlowTexture("#fff3d6"), []);
  const haloTexture = useMemo(() => createGlowTexture("#00E5FF"), []);

  useFrame((_, delta) => {
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.04;
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.75, 64, 64]} />
        <meshStandardMaterial
          color="#ffd27a"
          emissive="#ffb347"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>

      {/* soft corona */}
      <sprite scale={[3.4, 3.4, 1]}>
        <spriteMaterial map={flareTexture} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite scale={[1.8, 1.8, 1]}>
        <spriteMaterial map={flareTexture} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {/* cyan rim halo to tie into brand palette */}
      <sprite scale={[2.6, 2.6, 1]}>
        <spriteMaterial map={haloTexture} transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>

      <pointLight color="#ffe3b0" intensity={45} distance={60} decay={2} />
      <pointLight color="#00E5FF" intensity={8} distance={40} decay={2} />
    </group>
  );
}

function AsteroidBelt({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        radius: 5.3 + Math.random() * 0.7,
        angle: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * 0.35,
        speed: 0.01 + Math.random() * 0.02,
        scale: 0.02 + Math.random() * 0.045,
        spin: Math.random() * Math.PI,
      })),
    [count]
  );

  useFrame((state) => {
    if (!ref.current) return;
    data.forEach((a, i) => {
      const angle = a.angle + state.clock.elapsedTime * a.speed;
      dummy.position.set(Math.cos(angle) * a.radius, a.y, Math.sin(angle) * a.radius);
      dummy.scale.setScalar(a.scale);
      dummy.rotation.set(a.spin, angle, a.spin * 0.5);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#9c948a" roughness={0.95} metalness={0.05} />
    </instancedMesh>
  );
}

function Comet({ delay, duration }: { delay: number; duration: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const start = useMemo(() => new THREE.Vector3(-20, 9 + Math.random() * 4, -10 - Math.random() * 8), []);
  const end = useMemo(() => new THREE.Vector3(20, -10 - Math.random() * 4, 4 + Math.random() * 6), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = ((state.clock.elapsedTime + delay) % duration) / duration;
    ref.current.position.lerpVectors(start, end, t);
    ref.current.visible = t < 0.9;
  });

  return (
    <Trail width={2.4} length={5} color="#00E5FF" attenuation={(t) => t * t} decay={1}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </Trail>
  );
}

function Nebula() {
  const cyan = useMemo(() => createGlowTexture("#0088FF"), []);
  const blue = useMemo(() => createGlowTexture("#00E5FF"), []);
  const violet = useMemo(() => createGlowTexture("#3a1d8a"), []);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.004;
  });

  return (
    <group ref={ref}>
      <sprite position={[-14, 7, -26]} scale={[32, 32, 1]}>
        <spriteMaterial map={cyan} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite position={[16, -9, -30]} scale={[38, 38, 1]}>
        <spriteMaterial map={blue} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite position={[0, 12, -34]} scale={[44, 44, 1]}>
        <spriteMaterial map={violet} transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

function CameraRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useGlobalPointer();

  useFrame((state, delta) => {
    if (!group.current) return;
    const targetX = pointer.current.y * 0.12;
    const targetY = pointer.current.x * 0.22 + state.clock.elapsedTime * 0.012;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, delta * 1.5);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, delta * 1.5);
  });

  return <group ref={group}>{children}</group>;
}

interface SolarSystemProps {
  quality: "high" | "low";
}

export default function SolarSystem({ quality }: SolarSystemProps) {
  const isHigh = quality === "high";
  const segments = isHigh ? 48 : 24;

  return (
    <>
      <ambientLight intensity={0.12} />

      <Stars
        radius={90}
        depth={60}
        count={isHigh ? 6000 : 2200}
        factor={3}
        saturation={0}
        fade
        speed={0.4}
      />

      <Nebula />

      <CameraRig>
        <group position={[4.5, -1.2, -2]} scale={0.78}>
          <Sun />

          {planets.map((planet) => (
            <Planet key={planet.id} data={planet} segments={segments} showBadge={isHigh} />
          ))}

          {isHigh && <AsteroidBelt count={180} />}
          {isHigh && (
            <>
              <Comet delay={0} duration={16} />
              <Comet delay={9} duration={22} />
            </>
          )}
        </group>
      </CameraRig>

      <Sparkles
        count={isHigh ? 140 : 60}
        scale={26}
        size={1.4}
        speed={0.2}
        color="#00E5FF"
        opacity={0.35}
      />
    </>
  );
}
