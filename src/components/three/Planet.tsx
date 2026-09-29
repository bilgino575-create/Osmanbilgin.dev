"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetData } from "@/lib/solarSystemData";
import { createGlowTexture, createPlanetTexture, createRingTexture } from "./planetTextures";

interface PlanetProps {
  data: PlanetData;
  segments: number;
  showBadge: boolean;
}

export default function Planet({ data, segments, showBadge }: PlanetProps) {
  const orbitRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const texture = useMemo(
    () => createPlanetTexture(data.textureType, data.color, data.secondaryColor),
    [data]
  );
  const glowTexture = useMemo(() => createGlowTexture(data.glowColor), [data.glowColor]);
  const ringTexture = useMemo(
    () => (data.hasRings ? createRingTexture(data.ringColor ?? data.secondaryColor, data.color) : null),
    [data]
  );

  const startAngle = useMemo(() => Math.random() * Math.PI * 2, []);
  const Icon = data.icon;

  useFrame((state, delta) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y =
        startAngle + state.clock.elapsedTime * data.orbitSpeed * 0.15;
    }
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * data.rotationSpeed * 0.3;
    }
  });

  const glowScale = data.size * 2.1;

  return (
    <group ref={orbitRef}>
      {/* clean orbital axis ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.orbitRadius - 0.008, data.orbitRadius + 0.008, 128]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <group position={[data.orbitRadius, 0, 0]}>
        {/* subtle rim glow sprite */}
        <sprite scale={[glowScale, glowScale, 1]}>
          <spriteMaterial
            map={glowTexture}
            transparent
            opacity={hovered ? 0.5 : 0.22}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>

        <group ref={spinRef} rotation={[0, 0, data.tilt]}>
          <mesh
            scale={data.size}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHovered(false);
            }}
          >
            <sphereGeometry args={[1, segments, segments]} />
            <meshStandardMaterial map={texture} roughness={0.75} metalness={0.1} />
          </mesh>

          {/* thin atmosphere shell */}
          <mesh scale={data.size * 1.1}>
            <sphereGeometry args={[1, segments, segments]} />
            <meshBasicMaterial
              color={data.glowColor}
              transparent
              opacity={hovered ? 0.3 : 0.1}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* rings (Saturn) */}
          {ringTexture && (
            <mesh rotation={[Math.PI / 2.3, 0.1, 0]}>
              <ringGeometry args={[data.size * 1.6, data.size * 2.8, 96]} />
              <meshBasicMaterial
                map={ringTexture}
                transparent
                opacity={0.9}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>

        {/* technology label — "holographic" logo + language name */}
        {showBadge && (
          <Html position={[0, data.size + 0.32, 0]} center distanceFactor={9} zIndexRange={[20, 0]}>
            <div
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 backdrop-blur-md transition-all duration-300 ${
                hovered
                  ? "scale-110 border-[#00E5FF] bg-[#00E5FF]/15"
                  : "border-white/15 bg-black/30"
              }`}
              style={hovered ? { boxShadow: `0 0 18px ${data.glowColor}` } : undefined}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: data.glowColor }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white">
                {data.tech}
              </span>
            </div>
          </Html>
        )}

        {/* hover stat card */}
        {hovered && (
          <Html
            position={[0, data.size + 1.05, 0]}
            center
            distanceFactor={9}
            zIndexRange={[30, 10]}
          >
            <div
              className="w-44 rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-xs text-white backdrop-blur-xl"
              style={{ boxShadow: `0 0 30px ${data.glowColor}33` }}
            >
              <div className="mb-1.5 text-sm font-bold" style={{ color: data.glowColor }}>
                {data.tech}
              </div>
              <div className="text-secondary">{data.stats.experience}</div>
              <div className="text-secondary">{data.stats.projects}</div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${data.stats.skill}%`,
                    background: `linear-gradient(90deg, ${data.glowColor}, #00E5FF)`,
                  }}
                />
              </div>
              <div className="mt-1 text-right text-[10px] text-muted">{data.stats.skill}%</div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
