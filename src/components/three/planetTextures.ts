import * as THREE from "three";
import type { PlanetTextureType } from "@/lib/solarSystemData";

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function blob(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  count: number,
  maxRadius: number,
  alphaRange: [number, number]
) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = maxRadius * (0.3 + Math.random() * 0.7);
    const a = alphaRange[0] + Math.random() * (alphaRange[1] - alphaRange[0]);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, rgba(color, a));
    grad.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawBands(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  baseColor: string,
  bandColor: string
) {
  const bandCount = 14;
  for (let i = 0; i < bandCount; i++) {
    const y = (h / bandCount) * i;
    const bandH = h / bandCount;
    const mix = Math.random();
    ctx.fillStyle = rgba(mix > 0.5 ? bandColor : baseColor, 0.35 + Math.random() * 0.3);
    ctx.fillRect(0, y, w, bandH);

    // wavy edge for turbulence
    ctx.globalAlpha = 0.5;
    for (let x = 0; x < w; x += 24) {
      const wobble = Math.sin((x / w) * Math.PI * 4 + i) * bandH * 0.4;
      ctx.fillRect(x, y + wobble, 24, bandH * 0.5);
    }
    ctx.globalAlpha = 1;
  }
}

/**
 * Procedurally generates a 1024x512 equirectangular surface texture for a planet.
 * Avoids external image assets while giving every planet a unique, painterly look.
 */
export function createPlanetTexture(
  type: PlanetTextureType,
  baseColor: string,
  secondaryColor: string
): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  switch (type) {
    case "earth": {
      const ocean = ctx.createLinearGradient(0, 0, 0, h);
      ocean.addColorStop(0, "#0a3d7a");
      ocean.addColorStop(0.5, baseColor);
      ocean.addColorStop(1, "#072a55");
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, w, h);

      // continents
      blob(ctx, w, h, "#1f7a3f", 14, 130, [0.55, 0.85]);
      blob(ctx, w, h, "#3f9e4f", 10, 80, [0.5, 0.7]);
      blob(ctx, w, h, secondaryColor, 6, 50, [0.18, 0.3]);
      // clouds
      blob(ctx, w, h, "#ffffff", 22, 90, [0.08, 0.22]);
      break;
    }
    case "gas": {
      drawBands(ctx, w, h, baseColor, secondaryColor);
      // great storm spot
      blob(ctx, w, h, secondaryColor, 3, 160, [0.35, 0.5]);
      blob(ctx, w, h, "#ffffff", 8, 60, [0.05, 0.12]);
      break;
    }
    case "ice": {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, baseColor);
      grad.addColorStop(1, secondaryColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      blob(ctx, w, h, "#ffffff", 10, 100, [0.06, 0.18]);
      blob(ctx, w, h, secondaryColor, 8, 120, [0.1, 0.25]);
      break;
    }
    case "dwarf": {
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, w, h);
      blob(ctx, w, h, "#5a5248", 16, 70, [0.3, 0.5]);
      blob(ctx, w, h, secondaryColor, 4, 60, [0.12, 0.22]);
      blob(ctx, w, h, "#ffffff", 6, 40, [0.05, 0.12]);
      break;
    }
    case "rocky":
    default: {
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, w, h);
      blob(ctx, w, h, secondaryColor, 10, 110, [0.15, 0.32]);
      blob(ctx, w, h, "#000000", 26, 36, [0.08, 0.22]);
      blob(ctx, w, h, "#ffffff", 10, 24, [0.04, 0.1]);
      break;
    }
  }

  // subtle global shading to give a sense of curvature/lighting
  const shade = ctx.createLinearGradient(0, 0, w, 0);
  shade.addColorStop(0, "rgba(0,0,0,0.35)");
  shade.addColorStop(0.5, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

/** Generates a soft radial-gradient sprite texture used for glows, sun corona and nebulas. */
export function createGlowTexture(color: string, size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, rgba(color, 0.9));
  grad.addColorStop(0.4, rgba(color, 0.35));
  grad.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Generates a banded ring texture (used for Saturn) with gaps to mimic ring divisions. */
export function createRingTexture(baseColor: string, accentColor: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;

  for (let x = 0; x < size; x++) {
    const t = x / size;
    const gapNoise = Math.sin(t * 60) * 0.5 + Math.sin(t * 137) * 0.5;
    const alpha = 0.25 + Math.max(0, gapNoise) * 0.55;
    const color = t % 0.18 < 0.09 ? baseColor : accentColor;
    ctx.fillStyle = rgba(color, alpha);
    ctx.fillRect(x, 0, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
