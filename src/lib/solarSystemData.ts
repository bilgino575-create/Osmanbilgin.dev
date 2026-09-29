import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiPhp,
  SiLaravel,
  SiPython,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
} from "react-icons/si";
import type { IconComponent } from "./data";

export type PlanetTextureType = "rocky" | "earth" | "gas" | "ice" | "dwarf";

export interface PlanetData {
  id: string;
  name: string;
  tech: string;
  icon: IconComponent;
  /** Dominant surface tone */
  color: string;
  /** Secondary surface tone used for banding / continents */
  secondaryColor: string;
  /** Atmosphere / rim-light glow tone */
  glowColor: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  tilt: number;
  textureType: PlanetTextureType;
  hasRings?: boolean;
  ringColor?: string;
  stats: {
    experience: string;
    projects: string;
    skill: number;
  };
}

export const planets: PlanetData[] = [
  {
    id: "mercury",
    name: "Mercury",
    tech: "HTML5",
    icon: SiHtml5 as unknown as IconComponent,
    color: "#9c5a3c",
    secondaryColor: "#e34f26",
    glowColor: "#ff8a5c",
    size: 0.22,
    orbitRadius: 2.1,
    orbitSpeed: 0.62,
    rotationSpeed: 0.6,
    tilt: 0.02,
    textureType: "rocky",
    stats: { experience: "8+ Years Experience", projects: "90+ Projects", skill: 98 },
  },
  {
    id: "venus",
    name: "Venus",
    tech: "CSS3",
    icon: SiCss as unknown as IconComponent,
    color: "#a3742f",
    secondaryColor: "#2965f1",
    glowColor: "#7fb2ff",
    size: 0.3,
    orbitRadius: 2.9,
    orbitSpeed: 0.49,
    rotationSpeed: 0.45,
    tilt: 0.04,
    textureType: "rocky",
    stats: { experience: "8+ Years Experience", projects: "90+ Projects", skill: 97 },
  },
  {
    id: "earth",
    name: "Earth",
    tech: "JavaScript",
    icon: SiJavascript as unknown as IconComponent,
    color: "#1c5fb0",
    secondaryColor: "#f7df1e",
    glowColor: "#5fc8ff",
    size: 0.34,
    orbitRadius: 3.7,
    orbitSpeed: 0.41,
    rotationSpeed: 0.9,
    tilt: 0.41,
    textureType: "earth",
    stats: { experience: "7+ Years Experience", projects: "80+ Projects", skill: 96 },
  },
  {
    id: "mars",
    name: "Mars",
    tech: "PHP",
    icon: SiPhp as unknown as IconComponent,
    color: "#a8432b",
    secondaryColor: "#8993be",
    glowColor: "#ff8a65",
    size: 0.26,
    orbitRadius: 4.6,
    orbitSpeed: 0.34,
    rotationSpeed: 0.85,
    tilt: 0.44,
    textureType: "rocky",
    stats: { experience: "6+ Years Experience", projects: "60+ Projects", skill: 95 },
  },
  {
    id: "jupiter",
    name: "Jupiter",
    tech: "Laravel",
    icon: SiLaravel as unknown as IconComponent,
    color: "#c9763f",
    secondaryColor: "#ff2d20",
    glowColor: "#ffb37a",
    size: 0.72,
    orbitRadius: 6.1,
    orbitSpeed: 0.22,
    rotationSpeed: 1.6,
    tilt: 0.05,
    textureType: "gas",
    stats: { experience: "5+ Years Experience", projects: "45+ Projects", skill: 93 },
  },
  {
    id: "saturn",
    name: "Saturn",
    tech: "Python",
    icon: SiPython as unknown as IconComponent,
    color: "#e0c08c",
    secondaryColor: "#3776ab",
    glowColor: "#ffe9b0",
    size: 0.6,
    orbitRadius: 7.8,
    orbitSpeed: 0.17,
    rotationSpeed: 1.45,
    tilt: 0.47,
    textureType: "gas",
    hasRings: true,
    ringColor: "#ffd43b",
    stats: { experience: "4+ Years Experience", projects: "30+ Projects", skill: 88 },
  },
  {
    id: "uranus",
    name: "Uranus",
    tech: "React",
    icon: SiReact as unknown as IconComponent,
    color: "#61dafb",
    secondaryColor: "#bdf4ff",
    glowColor: "#9af0ff",
    size: 0.42,
    orbitRadius: 9.2,
    orbitSpeed: 0.13,
    rotationSpeed: 1.1,
    tilt: 1.7,
    textureType: "ice",
    stats: { experience: "5+ Years Experience", projects: "50+ Projects", skill: 94 },
  },
  {
    id: "neptune",
    name: "Neptune",
    tech: "Next.js",
    icon: SiNextdotjs as unknown as IconComponent,
    color: "#1b2a6b",
    secondaryColor: "#ffffff",
    glowColor: "#7c9bff",
    size: 0.4,
    orbitRadius: 10.5,
    orbitSpeed: 0.105,
    rotationSpeed: 1.0,
    tilt: 0.49,
    textureType: "ice",
    stats: { experience: "4+ Years Experience", projects: "40+ Projects", skill: 92 },
  },
  {
    id: "pluto",
    name: "Pluto",
    tech: "Node.js",
    icon: SiNodedotjs as unknown as IconComponent,
    color: "#8b8378",
    secondaryColor: "#339933",
    glowColor: "#8fffb0",
    size: 0.15,
    orbitRadius: 11.7,
    orbitSpeed: 0.085,
    rotationSpeed: 0.5,
    tilt: 0.3,
    textureType: "dwarf",
    stats: { experience: "5+ Years Experience", projects: "45+ Projects", skill: 91 },
  },
];

export const SOLAR_COLORS = {
  primary: "#00E5FF",
  secondary: "#0088FF",
  accent: "#FFFFFF",
  background: "#020205",
};
