"use client";

import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  DepthOfField,
  SMAA,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Vector2 } from "three";
import type { DepthOfFieldEffect } from "postprocessing";
import { useStore, store } from "@/lib/store";
import { rig } from "./rig/CameraRig";
import { DiveEffect } from "./effects/DiveEffect";
import { HeatHazeEffect } from "./effects/HeatHazeEffect";
import { smoothstep } from "./utils/scratch";

/**
 * HIGH tier only. Bloom is selective by luminance: only HDR emissives above
 * 1.0 bloom, so the cyan signal, the LED strip and the screen glow while the
 * room stays clean. DoF follows the rig's look-at target.
 */
export default function Post() {
  const tier = useStore((s) => s.tier);
  const dive = useMemo(() => new DiveEffect(), []);
  const haze = useMemo(() => new HeatHazeEffect(), []);
  const dof = useRef<DepthOfFieldEffect>(null);
  const caOffset = useMemo(() => new Vector2(0.0006, 0.0004), []);

  useEffect(() => {
    store.boot("ok", "post: composer ready (bloom, dof, ca, grain, vignette, smaa)");
    return () => {
      dive.dispose();
      haze.dispose();
    };
  }, [dive, haze]);

  useFrame(() => {
    dive.amount = rig.dive;
    // heat haze only over the die (act III), fading at its edges
    const p = rig.p;
    haze.amount = smoothstep(0.5, 0.54, p) * (1 - smoothstep(0.66, 0.7, p));
    const d = dof.current;
    if (d) {
      // focus on the rig target; bokeh subtle on the desk, larger inside the machine
      d.target = rig.target;
      const scale = rig.world === "desk" ? 2.2 : rig.world === "screen" ? 1.2 : 2.8;
      if (Math.abs(d.bokehScale - scale) > 0.01) d.bokehScale = scale;
    }
  });

  if (tier !== "high") return null;

  return (
    <EffectComposer multisampling={0} depthBuffer>
      <DepthOfField
        ref={dof}
        focalLength={0.02}
        focusRange={0.02}
        worldFocusRange={0.6}
        bokehScale={2}
      />
      <Bloom
        luminanceThreshold={1}
        luminanceSmoothing={0.25}
        mipmapBlur
        intensity={0.55}
        radius={0.6}
        levels={7}
      />
      <primitive object={haze} />
      <primitive object={dive} />
      <ChromaticAberration offset={caOffset} radialModulation modulationOffset={0.35} />
      <Noise premultiply opacity={0.06} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.22} darkness={0.75} />
      <SMAA />
    </EffectComposer>
  );
}
