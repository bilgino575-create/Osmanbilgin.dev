"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  Color,
  CylinderGeometry,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
} from "three";
import { getOS } from "../os/instance";
import { OS } from "../os/draw";
import type { OsWindow } from "../os/Window";
import { screenFragment, screenVertex } from "../desk/shaders/screen";
import { rig } from "../rig/CameraRig";
import { store } from "@/lib/store";

/** OS pixels → world units (the backdrop is 10 units wide). */
export const SCREEN_W = 10;
export const SCREEN_H = (SCREEN_W * OS.H) / OS.W;
const S = SCREEN_W / OS.W;

/** depth of each window in front of the backdrop, for parallax */
const DEPTH: Record<string, number> = { terminal: 0.45, editor: 0.7, files: 0.55 };

function toWorld(rect: { x: number; y: number; w: number; h: number }) {
  return {
    w: rect.w * S,
    h: rect.h * S,
    x: (rect.x + rect.w / 2 - OS.W / 2) * S,
    y: (OS.H / 2 - (rect.y + rect.h / 2)) * S,
  };
}

function makeMaterial(texture: CanvasTexture, res: Vector2, brightness: number, refl = 0.5) {
  return new ShaderMaterial({
    vertexShader: screenVertex,
    fragmentShader: screenFragment,
    uniforms: {
      uMap: { value: texture },
      uBrightness: { value: brightness },
      uOn: { value: 1 },
      uRes: { value: res },
      uReflA: { value: new Color("#7c3aed") },
      uReflB: { value: new Color("#00f5ff") },
      uRefl: { value: refl },
      uTime: { value: 0 },
    },
  });
}

function makeTexture(canvas: HTMLCanvasElement) {
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  t.minFilter = LinearFilter;
  t.magFilter = LinearFilter;
  t.generateMipmaps = false;
  t.anisotropy = 8;
  return t;
}

/**
 * Act II. The desktop OS as a place: a curved backdrop (wallpaper + taskbar)
 * and each window as its own glass pane floating at a different depth. The
 * same OS instance that the Act I monitor shows; here every window is a
 * live, clickable, typeable texture.
 */
export default function ScreenWorld() {
  const os = useMemo(() => getOS(), []);
  const camera = useThree((s) => s.camera);

  const backdropTex = useMemo(() => makeTexture(os.backdrop), [os]);
  const backdropMat = useMemo(() => makeMaterial(backdropTex, new Vector2(OS.W, OS.H), 1.0, 0.12), [backdropTex]);
  const backdropGeo = useMemo(() => {
    // a cylinder segment: radius 14, arc chosen so the chord is SCREEN_W wide
    const R = 14;
    const theta = 2 * Math.asin(SCREEN_W / 2 / R);
    const g = new CylinderGeometry(R, R, SCREEN_H, 64, 1, true, -theta / 2, theta);
    // the segment's centre sits at z = R; pull it back to z = 0 so the concave side faces the camera
    g.scale(-1, 1, 1);
    g.translate(0, 0, -R);
    return g;
  }, []);

  // a stable list: os.windows itself reorders on focus
  const windows = useMemo(() => [os.terminal, os.editor, os.explorer], [os]);
  const winTex = useMemo(() => windows.map((w) => makeTexture(w.canvas)), [windows]);
  const winMat = useMemo(
    () => windows.map((w, i) => makeMaterial(winTex[i], new Vector2(w.canvas.width, w.canvas.height), 1.35)),
    [windows, winTex]
  );
  const winGeo = useMemo(() => windows.map((w) => new PlaneGeometry(w.rect.w * S, w.rect.h * S)), [windows]);
  const versions = useRef(windows.map(() => -1));
  const backdropVersion = useRef(-1);

  useEffect(
    () => () => {
      backdropTex.dispose();
      backdropMat.dispose();
      backdropGeo.dispose();
      winTex.forEach((t) => t.dispose());
      winMat.forEach((m) => m.dispose());
      winGeo.forEach((g) => g.dispose());
    },
    [backdropTex, backdropMat, backdropGeo, winTex, winMat, winGeo]
  );

  useFrame((state) => {
    const on = rig.p > 0.19 && rig.p < 0.48;
    if (!on) return;
    const now = performance.now();
    os.update(now);
    if (os.backdropVersion !== backdropVersion.current) {
      backdropVersion.current = os.backdropVersion;
      backdropTex.needsUpdate = true;
    }
    for (let i = 0; i < windows.length; i++) {
      const w = windows[i];
      if (w.version !== versions.current[i]) {
        versions.current[i] = w.version;
        winTex[i].needsUpdate = true;
      }
      winMat[i].uniforms.uTime.value = state.clock.elapsedTime;
    }
    backdropMat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  const handler = (w: OsWindow, kind: "move" | "down" | "up" | "leave" | "wheel") => (e: ThreeEvent<PointerEvent | WheelEvent>) => {
    if (kind !== "leave" && !e.uv) return;
    const x = e.uv ? e.uv.x * w.rect.w : 0;
    const y = e.uv ? (1 - e.uv.y) * w.rect.h : 0;
    if (kind === "down") {
      e.stopPropagation();
      store.set({ osFocus: true });
    }
    if (kind === "wheel" && !store.get().osFocus) return;
    os.pointerInWindow(w, { kind, x, y, deltaY: kind === "wheel" ? (e as ThreeEvent<WheelEvent>).deltaY : 0 });
  };

  return (
    <group>
      {/* backdrop */}
      <mesh geometry={backdropGeo} material={backdropMat} position={[0, 0, -0.2]} />
      {/* soft floor reflection plane below the screen */}
      <mesh position={[0, -SCREEN_H / 2 - 0.02, 2]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[40, 14]} />
        <meshStandardMaterial color="#030308" roughness={0.7} metalness={0.1} />
      </mesh>
      {windows.map((w, i) => {
        const r = toWorld(w.rect);
        return (
          <mesh
            key={w.id}
            geometry={winGeo[i]}
            material={winMat[i]}
            position={[r.x, r.y, DEPTH[w.id] ?? 0.5]}
            onPointerMove={handler(w, "move")}
            onPointerDown={handler(w, "down")}
            onPointerUp={handler(w, "up")}
            onPointerLeave={handler(w, "leave")}
            onWheel={handler(w, "wheel")}
          >
            {/* frame + drop shadow */}
            <mesh position={[0, 0, -0.012]}>
              <planeGeometry args={[r.w + 0.05, r.h + 0.05]} />
              <meshStandardMaterial color="#111319" roughness={0.6} metalness={0.2} />
            </mesh>
            <mesh position={[0.06, -0.08, -0.03]}>
              <planeGeometry args={[r.w + 0.06, r.h + 0.06]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.55} />
            </mesh>
          </mesh>
        );
      })}
      {/* light from the windows onto the floor */}
      <pointLight position={[-2.6, 0.5, 2.5]} color="#00f5ff" intensity={1.2} distance={7} decay={2} />
      <pointLight position={[2.2, 0.5, 2.5]} color="#a78bfa" intensity={1.2} distance={7} decay={2} />
      <pointLight position={[-2.6, -2.2, 2.5]} color="#00ff88" intensity={0.6} distance={5} decay={2} />
      <ClickAway camera={camera} />
    </group>
  );
}

/** Clicking the void releases the OS keyboard. */
function ClickAway({ camera }: { camera: unknown }) {
  void camera;
  const mesh = useRef<Mesh>(null);
  return (
    <mesh
      ref={mesh}
      position={[0, 0, -0.5]}
      onPointerDown={() => {
        if (store.get().osFocus) store.set({ osFocus: false });
      }}
    >
      <planeGeometry args={[60, 40]} />
      <meshBasicMaterial color="#020205" />
    </mesh>
  );
}
