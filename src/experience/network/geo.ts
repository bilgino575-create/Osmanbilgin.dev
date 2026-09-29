"use client";

import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, Vector3 } from "three";
import { techCategories } from "@/lib/data";

/**
 * Coarse continent outlines (longitude, latitude), hand-authored so the
 * globe needs no downloaded texture. Rasterised once into an equirectangular
 * land mask; the shader turns it into a dot matrix.
 */
const CONTINENTS: [number, number][][] = [
  // North America
  [[-168, 66], [-160, 71], [-140, 70], [-125, 72], [-110, 74], [-95, 76], [-80, 76], [-70, 68], [-60, 60], [-64, 50], [-70, 45], [-76, 38], [-81, 31], [-80, 25], [-90, 29], [-97, 26], [-105, 20], [-92, 15], [-83, 9], [-78, 8], [-85, 12], [-95, 16], [-105, 22], [-112, 30], [-117, 33], [-124, 40], [-124, 48], [-130, 55], [-138, 59], [-150, 60], [-165, 60]],
  // Greenland
  [[-55, 60], [-45, 60], [-20, 70], [-20, 80], [-40, 83], [-70, 78], [-60, 72]],
  // South America
  [[-78, 8], [-70, 12], [-60, 8], [-52, 4], [-45, -2], [-35, -8], [-39, -15], [-41, -22], [-48, -27], [-53, -34], [-58, -38], [-65, -42], [-66, -47], [-70, -52], [-74, -50], [-73, -40], [-71, -30], [-70, -20], [-76, -14], [-81, -5], [-80, 0]],
  // Europe
  [[-10, 36], [-9, 43], [-2, 48], [-5, 50], [2, 51], [5, 53], [8, 55], [10, 58], [5, 62], [15, 68], [25, 71], [30, 70], [40, 68], [45, 66], [60, 70], [60, 55], [40, 50], [35, 45], [28, 41], [22, 37], [18, 40], [15, 38], [12, 44], [3, 43], [-1, 38], [-6, 36]],
  // British Isles
  [[-6, 50], [2, 52], [0, 56], [-3, 59], [-7, 57], [-6, 54]],
  [[-10, 52], [-6, 52], [-6, 55], [-10, 55]],
  // Africa
  [[-17, 15], [-17, 21], [-10, 30], [-5, 36], [10, 37], [20, 32], [32, 31], [35, 27], [40, 15], [44, 11], [51, 12], [48, 5], [41, -2], [40, -10], [35, -20], [33, -26], [28, -33], [19, -35], [15, -28], [12, -18], [13, -8], [9, -2], [8, 4], [2, 6], [-5, 5], [-8, 4], [-13, 8]],
  // Madagascar
  [[44, -13], [50, -15], [49, -25], [44, -25], [43, -18]],
  // Asia
  [[40, 68], [60, 70], [75, 72], [90, 75], [110, 76], [130, 71], [150, 68], [170, 69], [180, 66], [170, 60], [160, 60], [155, 50], [140, 45], [135, 43], [130, 38], [125, 35], [122, 30], [120, 22], [110, 20], [108, 10], [104, 2], [100, 8], [98, 15], [92, 20], [88, 22], [80, 15], [77, 8], [72, 20], [65, 25], [58, 22], [55, 25], [50, 30], [45, 38], [35, 45], [40, 50], [60, 55]],
  // Arabia
  [[35, 30], [40, 15], [44, 12], [52, 16], [58, 22], [56, 26], [48, 30], [40, 32]],
  // Japan
  [[130, 31], [132, 35], [140, 37], [142, 42], [145, 44], [141, 45], [137, 40], [133, 34]],
  // Sumatra, Borneo, Java, Philippines, New Guinea
  [[95, 5], [105, -5], [106, -6], [98, 2]],
  [[109, 1], [118, 5], [119, -3], [110, -3]],
  [[105, -6], [114, -8], [113, -7]],
  [[120, 18], [124, 13], [126, 7], [121, 10]],
  [[131, -2], [141, -3], [150, -10], [140, -8], [133, -4]],
  // Australia
  [[114, -22], [114, -34], [118, -35], [124, -33], [132, -32], [137, -35], [140, -38], [146, -39], [150, -37], [153, -30], [153, -25], [146, -19], [142, -11], [136, -12], [131, -12], [126, -14], [122, -18]],
  // New Zealand
  [[167, -46], [170, -45], [174, -41], [178, -38], [174, -36], [172, -40]],
  // Antarctica (band)
  [[-180, -68], [180, -68], [180, -90], [-180, -90]],
];

export function createLandMask(width = 1024, height = 512): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  const px = (lon: number) => ((lon + 180) / 360) * width;
  const py = (lat: number) => ((90 - lat) / 180) * height;
  for (const poly of CONTINENTS) {
    ctx.beginPath();
    poly.forEach(([lon, lat], i) => (i === 0 ? ctx.moveTo(px(lon), py(lat)) : ctx.lineTo(px(lon), py(lat))));
    ctx.closePath();
    ctx.fill();
  }
  const t = new CanvasTexture(c);
  t.wrapS = RepeatWrapping;
  t.minFilter = LinearMipmapLinearFilter;
  t.magFilter = LinearFilter;
  t.flipY = true;
  return t;
}

/** lon/lat → unit sphere (three's default sphere uv: u = lon, v = lat). */
export function lonLatToVec3(lon: number, lat: number, r: number, out = new Vector3()): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  out.set(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  return out;
}

export interface EdgeNode {
  tool: string;
  city: string;
  lon: number;
  lat: number;
  color: string;
}

/** The DevOps & Cloud tools from data.ts placed on real edge/datacenter cities. */
export function edgeNodes(): EdgeNode[] {
  const devops = techCategories.find((c) => c.id === "devops")!.items;
  const cities: Record<string, [string, number, number]> = {
    AWS: ["N. Virginia", -77.5, 39.0],
    "Google Cloud": ["Iowa", -93.6, 41.3],
    Azure: ["Dublin", -6.3, 53.3],
    Vercel: ["San Francisco", -122.4, 37.8],
    Cloudflare: ["London", -0.1, 51.5],
    DigitalOcean: ["Amsterdam", 4.9, 52.4],
    Docker: ["Frankfurt", 8.7, 50.1],
    Linux: ["Helsinki", 24.9, 60.2],
    Ubuntu: ["Cape Town", 18.4, -33.9],
    Nginx: ["Singapore", 103.8, 1.35],
    Apache: ["Tokyo", 139.7, 35.7],
    Git: ["Sydney", 151.2, -33.9],
    GitHub: ["São Paulo", -46.6, -23.5],
    GitLab: ["Mumbai", 72.9, 19.1],
    "CI/CD": ["Istanbul", 29.0, 41.0],
  };
  return devops
    .filter((d) => cities[d.name])
    .map((d) => {
      const [city, lon, lat] = cities[d.name];
      return { tool: d.name, city, lon, lat, color: d.color === "#FFFFFF" ? "#c9d4ff" : d.color };
    });
}
