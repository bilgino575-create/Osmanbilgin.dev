"use client";

import { lazy, Suspense, useEffect, useMemo } from "react";
import { store } from "@/lib/store";
import { createDeskMaterials } from "./materials";
import { MaterialsCtx } from "./context";
import Room from "./Room";
import WindowPane from "./WindowPane";
import Desk from "./Desk";
import Monitor from "./Monitor";
import Keyboard from "./Keyboard";
import Mug from "./Mug";
import Phone from "./Phone";
import StickyNotes from "./StickyNotes";
import Lights from "./Lights";
import Exterior from "./Exterior";
import { DuckStatic } from "./Duck";

const DuckPhysics = lazy(() => import("./DuckPhysics"));

export default function DeskWorld() {
  const materials = useMemo(() => createDeskMaterials(), []);
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);
  // phones skip the physics engine (≈2 MB of wasm to parse); the duck still wobbles on tap
  const physics = !store.get().touch;

  return (
    <MaterialsCtx.Provider value={materials}>
      <Lights />
      <Room />
      <WindowPane />
      <Desk />
      <Monitor />
      <Keyboard />
      <Mug />
      <Phone />
      <StickyNotes />
      {physics ? (
        <Suspense fallback={<DuckStatic />}>
          <DuckPhysics />
        </Suspense>
      ) : (
        <DuckStatic />
      )}
      <Exterior />
    </MaterialsCtx.Provider>
  );
}
