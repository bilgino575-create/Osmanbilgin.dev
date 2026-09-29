"use client";

import { useDispose } from "../utils/useDispose";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  CanvasTexture,
  Color,
  LinearFilter,
  PointLight,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
} from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { L } from "./layout";
import { useMaterials } from "./context";
import { screenFragment, screenVertex } from "./shaders/screen";
import { getOS } from "../os/instance";
import { OS } from "../os/draw";
import { store } from "@/lib/store";
import { rig } from "../rig/CameraRig";

/**
 * The monitor. Its panel shows the OS composite through the glass shader;
 * a point light in front of it carries the screen's average colour onto the
 * desk and the keyboard (light bleed that follows the content).
 */
export default function Monitor() {
  const m = useMaterials();
  const { monitor: mon } = L;
  const os = useMemo(() => getOS(), []);
  const texture = useMemo(() => {
    const t = new CanvasTexture(os.composite);
    t.colorSpace = SRGBColorSpace;
    t.minFilter = LinearFilter;
    t.magFilter = LinearFilter;
    t.generateMipmaps = false;
    t.anisotropy = 4;
    return t;
  }, [os]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: screenVertex,
        fragmentShader: screenFragment,
        uniforms: {
          uMap: { value: texture },
          uBrightness: { value: 1.5 },
          uOn: { value: 0 },
          uRes: { value: new Vector2(OS.W, OS.H) },
          uReflA: { value: new Color("#7c3aed") },
          uReflB: { value: new Color("#00f5ff") },
          uRefl: { value: 1 },
          uTime: { value: 0 },
        },
      }),
    [texture]
  );
  const bezel = useMemo(() => new RoundedBoxGeometry(mon.w + 0.03, mon.h + 0.03, 0.018, 3, 0.006), [mon.w, mon.h]);
  const base = useMemo(() => new RoundedBoxGeometry(0.26, 0.012, 0.18, 3, 0.005), []);
  useDispose(texture);
  useDispose(material);
  useDispose(bezel);
  useDispose(base);

  const light = useRef<PointLight>(null);
  const on = useRef(0);

  useFrame((state, dt) => {
    const now = performance.now();
    // the screen is only worth updating while the desk world is on screen
    const visible = rig.p < 0.22 || rig.p > 0.86;
    if (visible && os.update(now)) texture.needsUpdate = true;
    // power-on: the panel comes alive when the boot log starts
    const target = os.phase === "off" ? 0 : 1;
    on.current += (target - on.current) * Math.min(1, dt * 3);
    material.uniforms.uOn.value = on.current;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    const l = light.current;
    if (l) {
      const a = os.avg;
      l.color.setRGB(0.35 + a.r * 1.4, 0.4 + a.g * 1.4, 0.5 + a.b * 1.4);
      const lum = 0.2126 * a.r + 0.7152 * a.g + 0.0722 * a.b;
      l.intensity = (0.2 + lum * 2.4) * on.current * (store.get().tier === "high" ? 1 : 0.8);
    }
  });

  // pointer → OS composite coordinates
  const toOS = (e: ThreeEvent<PointerEvent | WheelEvent>) => {
    if (!e.uv) return null;
    return { x: e.uv.x * OS.W, y: (1 - e.uv.y) * OS.H };
  };

  return (
    <group position={[mon.x, mon.y, mon.z]} rotation-x={-0.03}>
      {/* panel */}
      <mesh
        material={material}
        position={[0, 0, 0.0095]}
        onPointerMove={(e) => {
          const p = toOS(e);
          if (p) os.pointer("move", p.x, p.y);
        }}
        onPointerDown={(e) => {
          const p = toOS(e);
          if (!p) return;
          os.pointer("down", p.x, p.y);
          if (os.windowAt(p.x, p.y)) store.set({ osFocus: true });
        }}
        onPointerUp={(e) => {
          const p = toOS(e);
          if (p) os.pointer("up", p.x, p.y);
        }}
        onPointerLeave={() => os.pointer("leave", -1, -1)}
        onWheel={(e) => {
          const p = toOS(e);
          if (p) os.pointer("wheel", p.x, p.y, e.deltaY);
        }}
      >
        <planeGeometry args={[mon.w, mon.h]} />
      </mesh>
      {/* bezel */}
      <mesh geometry={bezel} material={m.plastic} castShadow />
      {/* back shell */}
      <mesh material={m.plastic} position={[0, 0, -0.025]} castShadow>
        <boxGeometry args={[mon.w * 0.86, mon.h * 0.8, 0.035]} />
      </mesh>
      {/* stand neck + base */}
      <mesh material={m.metal} position={[0, -mon.h / 2 - 0.07, -0.03]} castShadow>
        <boxGeometry args={[0.06, 0.16, 0.02]} />
      </mesh>
      <mesh geometry={base} material={m.metal} position={[0, -mon.h / 2 - 0.145, 0.0]} castShadow />
      {/* power LED */}
      <mesh position={[mon.w / 2 - 0.02, -mon.h / 2 - 0.006, 0.012]} material={m.led} scale={[0.004, 0.002, 0.002]}>
        <boxGeometry />
      </mesh>
      {/* the screen's light on the room */}
      <pointLight ref={light} position={[0, 0.12, 0.42]} distance={2.4} decay={2} intensity={0} castShadow={false} />
    </group>
  );
}
