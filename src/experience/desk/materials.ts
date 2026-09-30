"use client";

/**
 * One material language for the desk. Everything is MeshPhysicalMaterial
 * with restrained roughness and a light touch of clearcoat where a real
 * object would have one. Shared singletons: created once, disposed by the
 * DeskWorld on unmount.
 */
import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from "three";

export function createDeskMaterials() {
  const wood = new MeshPhysicalMaterial({
    color: new Color("#171310"),
    roughness: 0.5,
    metalness: 0.0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.4,
    sheen: 0.1,
    sheenColor: new Color("#3a2e22"),
  });
  const wall = new MeshStandardMaterial({ color: new Color("#101014"), roughness: 0.95, metalness: 0 });
  const floor = new MeshPhysicalMaterial({
    color: new Color("#0b0b0e"),
    roughness: 0.6,
    metalness: 0.0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
  });
  const plastic = new MeshPhysicalMaterial({
    color: new Color("#111116"),
    roughness: 0.48,
    metalness: 0.05,
    clearcoat: 0.25,
    clearcoatRoughness: 0.4,
  });
  const metal = new MeshPhysicalMaterial({
    color: new Color("#5a5c66"),
    roughness: 0.34,
    metalness: 0.95,
    clearcoat: 0.0,
  });
  const keycap = new MeshPhysicalMaterial({
    color: new Color("#262833"),
    roughness: 0.62,
    metalness: 0.0,
    clearcoat: 0.08,
    clearcoatRoughness: 0.8,
    emissive: new Color("#2997ff"),
    emissiveIntensity: 1,
  });
  const rubber = new MeshPhysicalMaterial({
    color: new Color("#ffc61a"),
    roughness: 0.5,
    metalness: 0.0,
    sheen: 0.4,
    sheenColor: new Color("#ffe89a"),
    sheenRoughness: 0.6,
  });
  const beak = new MeshPhysicalMaterial({ color: new Color("#ff7a1a"), roughness: 0.5 });
  const eye = new MeshPhysicalMaterial({ color: new Color("#08080a"), roughness: 0.2, clearcoat: 1 });
  const ceramic = new MeshPhysicalMaterial({
    color: new Color("#16181f"),
    roughness: 0.22,
    metalness: 0.0,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
  });
  const coffee = new MeshPhysicalMaterial({
    color: new Color("#120a06"),
    roughness: 0.08,
    metalness: 0.0,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });
  const paper = new MeshStandardMaterial({ color: new Color("#f5e46a"), roughness: 0.9 });
  const phone = new MeshPhysicalMaterial({
    color: new Color("#0a0a0d"),
    roughness: 0.18,
    metalness: 0.4,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });
  const mat = new MeshStandardMaterial({ color: new Color("#0c0c10"), roughness: 0.92 });
  const led = new MeshStandardMaterial({
    color: new Color("#2997ff"),
    emissive: new Color("#2997ff"),
    emissiveIntensity: 1.5,
    toneMapped: false,
  });
  const glassDark = new MeshPhysicalMaterial({
    color: new Color("#05060a"),
    roughness: 0.05,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  });

  const all = { wood, wall, floor, plastic, metal, keycap, rubber, beak, eye, ceramic, coffee, paper, phone, mat, led, glassDark };
  return all;
}

export type DeskMaterials = ReturnType<typeof createDeskMaterials>;
