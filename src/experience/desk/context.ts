"use client";

import { createContext, useContext } from "react";
import type { DeskMaterials } from "./materials";

export const MaterialsCtx = createContext<DeskMaterials | null>(null);

export const useMaterials = () => {
  const m = useContext(MaterialsCtx);
  if (!m) throw new Error("DeskWorld materials are not available outside DeskWorld");
  return m;
};
