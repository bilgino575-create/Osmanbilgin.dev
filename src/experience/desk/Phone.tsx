"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, LinearFilter, MeshBasicMaterial, PointLight, SRGBColorSpace } from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { L } from "./layout";
import { useMaterials } from "./context";
import { siteConfig } from "@/lib/data";
import { store } from "@/lib/store";
import { rig } from "../rig/CameraRig";
import { display, mono, resolveFonts, roundRect } from "../os/draw";

const W = 360;
const H = 780;

function drawScreen(ctx: CanvasRenderingContext2D, lit: number, sent: boolean) {
  resolveFonts();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1a1d30");
  g.addColorStop(1, "#0a0b14");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const r = ctx.createRadialGradient(W * 0.5, H * 0.2, 0, W * 0.5, H * 0.2, W);
  r.addColorStop(0, `rgba(0,245,255,${0.3 * lit})`);
  r.addColorStop(1, "rgba(0,245,255,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, W, H);
  // status bar
  ctx.font = mono(16, 500);
  ctx.fillStyle = "#c9ccd6";
  ctx.textBaseline = "middle";
  const d = new Date();
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  ctx.fillText(time, 28, 34);
  ctx.textAlign = "right";
  ctx.fillText("▮▮▮ ◔", W - 28, 34);
  ctx.textAlign = "left";
  // clock
  ctx.font = display(96, 700);
  ctx.fillStyle = "#f4f4f5";
  ctx.textAlign = "center";
  ctx.fillText(time, W / 2, 190);
  ctx.font = mono(15);
  ctx.fillStyle = "#8a8d99";
  ctx.fillText(d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }), W / 2, 250);
  ctx.textAlign = "left";
  // notification card
  const y = 300;
  roundRect(ctx, 24, y, W - 48, sent ? 200 : 168, 22);
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fill();
  ctx.strokeStyle = `rgba(0,245,255,${0.25 + 0.5 * lit})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = mono(13, 500);
  ctx.fillStyle = "#00f5ff";
  ctx.fillText(sent ? "● INCOMING · now" : "● CONTACT", 44, y + 32);
  ctx.font = display(22, 700);
  ctx.fillStyle = "#f4f4f5";
  ctx.fillText(sent ? "New message" : siteConfig.name, 44, y + 68);
  ctx.font = mono(14);
  ctx.fillStyle = "#c9ccd6";
  if (sent) {
    ctx.fillText("via hello@osmanbilgin.dev", 44, y + 98);
    ctx.fillStyle = "#00ff88";
    ctx.fillText("packet delivered ✓", 44, y + 126);
    ctx.fillStyle = "#8a8d99";
    ctx.fillText("your mail client has the rest", 44, y + 154);
  } else {
    ctx.fillText(siteConfig.email, 44, y + 98);
    ctx.fillText(siteConfig.phoneDisplay, 44, y + 124);
    ctx.fillText(`instagram ${siteConfig.instagram}`, 44, y + 150);
  }
  // second card: availability
  const y2 = y + (sent ? 220 : 188);
  roundRect(ctx, 24, y2, W - 48, 74, 22);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fill();
  ctx.fillStyle = "#00ff88";
  ctx.beginPath();
  ctx.arc(52, y2 + 37, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = mono(14);
  ctx.fillStyle = "#e8e8ec";
  ctx.fillText(siteConfig.availability, 70, y2 + 37);
  // home indicator
  roundRect(ctx, W / 2 - 60, H - 26, 120, 6, 3);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fill();
}

/** The phone. Its lock screen shows the real contact details and lights up in Act V. */
export default function Phone() {
  const m = useMaterials();
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.minFilter = LinearFilter;
    t.generateMipmaps = false;
    t.anisotropy = 4;
    return t;
  }, [canvas]);
  const screenMat = useMemo(() => new MeshBasicMaterial({ map: texture, toneMapped: false }), [texture]);
  const bodyGeo = useMemo(() => new RoundedBoxGeometry(0.072, 0.0075, 0.148, 4, 0.003), []);
  useEffect(
    () => () => {
      texture.dispose();
      screenMat.dispose();
      bodyGeo.dispose();
    },
    [texture, screenMat, bodyGeo]
  );
  const light = useRef<PointLight>(null);
  const lit = useRef(0.25);
  const lastDraw = useRef({ lit: -1, sent: false, minute: -1 });

  useFrame((_, dt) => {
    const s = store.get();
    const sent = s.sentAt > 0 && performance.now() - s.sentAt < 20000;
    // lights up when the camera arrives at the phone in act V or when a message is sent
    const near = rig.p > 0.87 && rig.p < 0.96;
    const target = sent ? 1 : near ? 0.85 : 0.25;
    lit.current += (target - lit.current) * Math.min(1, dt * 2.5);
    const minute = new Date().getMinutes();
    const ld = lastDraw.current;
    if (Math.abs(ld.lit - lit.current) > 0.03 || ld.sent !== sent || ld.minute !== minute) {
      ld.lit = lit.current;
      ld.sent = sent;
      ld.minute = minute;
      drawScreen(canvas.getContext("2d")!, lit.current, sent);
      texture.needsUpdate = true;
    }
    screenMat.color.setScalar(0.5 + lit.current * 1.4);
    if (light.current) light.current.intensity = lit.current * 0.35;
  });

  return (
    <group position={[L.phone.x, L.deskY + 0.004, L.phone.z]} rotation-y={-0.35}>
      <mesh geometry={bodyGeo} material={m.phone} castShadow receiveShadow />
      <mesh material={screenMat} position={[0, 0.0041, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.066, 0.142]} />
      </mesh>
      {/* camera bump */}
      <mesh material={m.glassDark} position={[-0.022, -0.0035, -0.055]} rotation-x={Math.PI / 2}>
        <circleGeometry args={[0.009, 16]} />
      </mesh>
      <pointLight ref={light} position={[0, 0.06, 0]} distance={0.45} decay={2} intensity={0} color="#9be9ff" />
    </group>
  );
}
