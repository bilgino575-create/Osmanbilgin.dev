"use client";

import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from "three";
import { mono, display, resolveFonts } from "../os/draw";

export interface AtlasEntry {
  /** uv rect: x, y, w, h in 0..1 (y up, already flipped for three) */
  u: number;
  v: number;
  w: number;
  h: number;
  /** pixel width / pixel height of the label */
  aspect: number;
}

export interface TextAtlas {
  texture: CanvasTexture;
  entries: AtlasEntry[];
  dispose(): void;
}

interface AtlasOptions {
  size?: number;
  font?: "mono" | "display";
  px?: number;
  weight?: number;
  color?: string;
  /** optional second, smaller line under each label */
  sub?: (i: number) => string | undefined;
  subColor?: string;
}

/**
 * Packs a list of strings into one canvas texture (rows of fixed height),
 * so hundreds of 3D labels cost one texture and one instanced draw call.
 * Fonts are the self-hosted faces from next/font.
 */
export function createTextAtlas(labels: string[], opts: AtlasOptions = {}): TextAtlas {
  resolveFonts();
  const size = opts.size ?? 1024;
  const px = opts.px ?? 40;
  const weight = opts.weight ?? 500;
  const fontFn = opts.font === "display" ? display : mono;
  const color = opts.color ?? "#ffffff";
  const subPx = Math.round(px * 0.55);
  const lineH = opts.sub ? px + subPx + 18 : px + 12;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.textBaseline = "middle";
  const entries: AtlasEntry[] = [];
  let x = 0;
  let y = 0;
  const pad = 14;
  labels.forEach((label, i) => {
    ctx.font = fontFn(px, weight);
    const w = Math.ceil(ctx.measureText(label).width) + pad * 2;
    const sub = opts.sub?.(i);
    let sw = 0;
    if (sub) {
      ctx.font = fontFn(subPx, 400);
      sw = Math.ceil(ctx.measureText(sub).width) + pad * 2;
    }
    const cw = Math.max(w, sw);
    if (x + cw > size) {
      x = 0;
      y += lineH;
    }
    ctx.font = fontFn(px, weight);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(label, x + cw / 2, y + px / 2 + 6);
    if (sub) {
      ctx.font = fontFn(subPx, 400);
      ctx.fillStyle = opts.subColor ?? "rgba(255,255,255,0.6)";
      ctx.fillText(sub, x + cw / 2, y + px + 10 + subPx / 2);
    }
    entries.push({
      u: x / size,
      v: 1 - (y + lineH) / size,
      w: cw / size,
      h: lineH / size,
      aspect: cw / lineH,
    });
    x += cw;
  });
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = 8;
  texture.flipY = true;
  return { texture, entries, dispose: () => texture.dispose() };
}

/** Vertex/fragment pair for instanced label quads (billboarded or flat). */
export const labelVertex = /* glsl */ `
attribute vec4 aRect;      // u v w h
attribute vec3 aColor;
attribute float aAlpha;
uniform float uBillboard;  // 1 = face camera
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vUv = aRect.xy + uv * aRect.zw;
  vColor = aColor;
  vAlpha = aAlpha;
  vec4 origin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec3 scale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), 1.0);
  vec3 world = (modelMatrix * origin).xyz;
  vec3 local = position * scale;
  if (uBillboard > 0.5) {
    vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 up    = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    world += right * local.x + up * local.y;
  } else {
    world += mat3(modelMatrix) * (mat3(instanceMatrix) * position);
  }
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

export const labelFragment = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform float uIntensity;
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 t = texture2D(uMap, vUv);
  if (t.a < 0.02) discard;
  gl_FragColor = vec4(vColor * uIntensity, t.a * vAlpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
