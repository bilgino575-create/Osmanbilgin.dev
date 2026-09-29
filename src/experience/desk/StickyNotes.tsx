"use client";

import { useMemo } from "react";
import { useDisposeAll } from "../utils/useDispose";
import { CanvasTexture, LinearFilter, MeshStandardMaterial, SRGBColorSpace } from "three";
import { L } from "./layout";
import { display, resolveFonts } from "../os/draw";

const NOTES: { text: string[]; color: string; ink: string; pos: [number, number, number]; rot: number }[] = [
  {
    text: ["TODO", "ship osmanbilgin.dev v3", "→ root access"],
    color: "#f2e26a",
    ink: "#2b2a1e",
    pos: [L.monitor.x + 0.4, L.monitor.y + 0.1, L.wallZ + 0.006],
    rot: -0.08,
  },
  {
    text: ["fix: duck physics", "(again)", "tests: 12/12 ✓"],
    color: "#ff9fb0",
    ink: "#3a1a22",
    pos: [L.monitor.x + 0.4, L.monitor.y - 0.01, L.wallZ + 0.006],
    rot: 0.06,
  },
  {
    text: ["call client 10:00", "ERP rollout · phase 2", "don't: npm audit fix --force"],
    color: "#d8f0a0",
    ink: "#24301a",
    pos: [L.monitor.x - 0.42, L.monitor.y + 0.07, L.wallZ + 0.006],
    rot: 0.1,
  },
];

function noteTexture(text: string[], color: string, ink: string) {
  resolveFonts();
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);
  // paper grain + a darker sticky strip
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(0, 0, 256, 34);
  ctx.fillStyle = ink;
  text.forEach((t, i) => {
    ctx.font = display(i === 0 ? 30 : 22, i === 0 ? 700 : 500);
    ctx.fillText(t, 20, 78 + i * 44);
  });
  // faint pen line
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 226);
  ctx.lineTo(180, 224);
  ctx.stroke();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.minFilter = LinearFilter;
  t.anisotropy = 4;
  return t;
}

/** Three sticky notes on the wall around the monitor with plausible TODOs. */
export default function StickyNotes() {
  const mats = useMemo(
    () =>
      NOTES.map((n) => {
        const map = noteTexture(n.text, n.color, n.ink);
        return new MeshStandardMaterial({ map, roughness: 0.95, metalness: 0 });
      }),
    []
  );
  // the note textures belong to the materials: dispose both together
  useDisposeAll(useMemo(() => mats.map((m) => ({ dispose: () => { m.map?.dispose(); m.dispose(); } })), [mats]));
  return (
    <group>
      {NOTES.map((n, i) => (
        <group key={i} position={n.pos} rotation-z={n.rot}>
          <mesh material={mats[i]} rotation-x={0.06} castShadow>
            <planeGeometry args={[0.075, 0.075]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
