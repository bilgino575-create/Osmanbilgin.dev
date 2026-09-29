"use client";

import { useDispose } from "../utils/useDispose";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  PlaneGeometry,
  PointsMaterial,
  Quaternion,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import { processSteps } from "@/lib/data";
import { store } from "@/lib/store";
import { rig } from "../rig/CameraRig";
import { rng } from "../utils/scratch";
import { createTextAtlas, labelFragment, labelVertex } from "../utils/textAtlas";
import { traceFragment, traceVertex } from "../silicon/shaders";
import { createLandMask, edgeNodes, lonLatToVec3 } from "./geo";
import { atmosphereFragment, globeFragment, globeVertex, packetFragment, packetVertex, tunnelFragment, tunnelVertex } from "./shaders";
import { SECTIONS } from "@/lib/acts";

const GLOBE = new Vector3(0, 0, -58);
const R = 4;
const TUNNEL_LEN = 78;

const tmp = new Matrix4();
const q = new Quaternion();
const v = new Vector3();
const v2 = new Vector3();
const sc = new Vector3();
const col = new Color();

export default function NetworkWorld() {
  const tier = store.get().tier;
  const nodes = useMemo(() => edgeNodes(), []);

  // ---------- tunnel ----------
  const tunnelGeo = useMemo(() => {
    const g = new CylinderGeometry(3.2, 3.2, TUNNEL_LEN, 96, 1, true);
    g.rotateX(Math.PI / 2); // axis along z
    g.translate(0, 0, 30 - TUNNEL_LEN / 2);
    return g;
  }, []);
  const tunnelMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: tunnelVertex,
        fragmentShader: tunnelFragment,
        uniforms: { uTime: { value: 0 }, uCyan: { value: new Color("#00f5ff") }, uViolet: { value: new Color("#7c3aed") }, uLength: { value: TUNNEL_LEN } },
        side: BackSide,
      }),
    []
  );
  const PACKETS = tier === "high" ? 260 : 90;
  const packetGeo = useMemo(() => {
    const g = new PlaneGeometry(1, 1);
    const seeds = new Float32Array(PACKETS * 3);
    const r = rng(3);
    for (let i = 0; i < PACKETS; i++) {
      seeds[i * 3] = r();
      seeds[i * 3 + 1] = r();
      seeds[i * 3 + 2] = r();
    }
    g.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 3));
    return g;
  }, [PACKETS]);
  const packetMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: packetVertex,
        fragmentShader: packetFragment,
        uniforms: { uTime: { value: 0 }, uLength: { value: TUNNEL_LEN - 6 }, uColor: { value: new Color("#00f5ff") } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    []
  );
  const packetRef = useRef<InstancedMesh>(null);
  const tunnelRef = useRef<Mesh>(null);

  // ---------- globe ----------
  const mask = useMemo(() => createLandMask(), []);
  const globeMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: globeVertex,
        fragmentShader: globeFragment,
        uniforms: { uMask: { value: mask }, uTime: { value: 0 }, uCyan: { value: new Color("#00f5ff") }, uViolet: { value: new Color("#7c3aed") } },
      }),
    [mask]
  );
  const atmoMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: globeVertex,
        fragmentShader: atmosphereFragment,
        uniforms: { uCyan: { value: new Color("#00f5ff") } },
        transparent: true,
        depthWrite: false,
        side: BackSide,
        blending: AdditiveBlending,
      }),
    []
  );

  // ---------- nodes + labels ----------
  const nodeGeo = useMemo(() => new SphereGeometry(0.06, 12, 10), []);
  const nodeRef = useRef<InstancedMesh>(null);
  const ringGeo = useMemo(() => new PlaneGeometry(1, 1), []);
  const ringMat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          attribute float aPhase;
          attribute vec3 aColor;
          varying vec2 vUv; varying float vPhase; varying vec3 vColor;
          void main() { vUv = uv; vPhase = aPhase; vColor = aColor; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
          precision highp float;
          uniform float uTime;
          varying vec2 vUv; varying float vPhase; varying vec3 vColor;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            float t = fract(uTime * 0.5 + vPhase);
            float ring = smoothstep(0.06, 0.0, abs(d - t * 0.95)) * (1.0 - t);
            float core = smoothstep(0.25, 0.0, d) * 0.6;
            float a = (ring + core);
            if (a < 0.01) discard;
            gl_FragColor = vec4(vColor * 1.6, a);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
      }),
    []
  );
  const ringGeoInst = useMemo(() => {
    const g = ringGeo.clone();
    const phase = new Float32Array(nodes.length);
    const colors = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      phase[i] = i / nodes.length;
      col.set(n.color);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    });
    g.setAttribute("aPhase", new InstancedBufferAttribute(phase, 1));
    g.setAttribute("aColor", new InstancedBufferAttribute(colors, 3));
    return g;
  }, [ringGeo, nodes]);
  const ringRef = useRef<InstancedMesh>(null);

  const atlas = useMemo(
    () =>
      createTextAtlas(
        [...nodes.map((n) => n.tool), ...processSteps.map((s) => s.title)],
        { px: 34, weight: 500, sub: (i) => (i < nodes.length ? nodes[i].city : processSteps[i - nodes.length].stage) }
      ),
    [nodes]
  );
  const labelMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: labelVertex,
        fragmentShader: labelFragment,
        uniforms: { uMap: { value: atlas.texture }, uIntensity: { value: 1.2 }, uBillboard: { value: 1 } },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    [atlas]
  );
  const makeLabelGeo = (count: number, offset: number, color: (i: number) => string) => {
    const g = new PlaneGeometry(1, 1);
    const rect = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const alpha = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const e = atlas.entries[offset + i];
      rect[i * 4] = e.u;
      rect[i * 4 + 1] = e.v;
      rect[i * 4 + 2] = e.w;
      rect[i * 4 + 3] = e.h;
      col.set(color(i));
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
      alpha[i] = 1;
    }
    g.setAttribute("aRect", new InstancedBufferAttribute(rect, 4));
    g.setAttribute("aColor", new InstancedBufferAttribute(colors, 3));
    g.setAttribute("aAlpha", new InstancedBufferAttribute(alpha, 1));
    return g;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nodeLabelGeo = useMemo(() => makeLabelGeo(nodes.length, 0, () => "#ffffff"), [atlas, nodes]);
  const nodeLabelRef = useRef<InstancedMesh>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stageLabelGeo = useMemo(() => makeLabelGeo(processSteps.length, nodes.length, () => "#9aa0aa"), [atlas, nodes]);
  const stageLabelRef = useRef<InstancedMesh>(null);
  const stageDotGeo = useMemo(() => new SphereGeometry(0.055, 12, 10), []);
  const stageDotRef = useRef<InstancedMesh>(null);

  // ---------- arcs ----------
  const SEG = 28;
  const links = useMemo(() => {
    // connect each node to two others (ring + one long hop), no duplicates
    const pairs: [number, number][] = [];
    const n = nodes.length;
    for (let i = 0; i < n; i++) {
      pairs.push([i, (i + 1) % n]);
      if (i % 3 === 0) pairs.push([i, (i + Math.floor(n / 2)) % n]);
    }
    return pairs;
  }, [nodes]);
  const arcGeo = useMemo(() => {
    const count = links.length * SEG;
    const g = new BoxGeometry(1, 0.014, 0.014);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    const len = new Float32Array(count);
    links.forEach((_, li) => {
      for (let s = 0; s < SEG; s++) {
        const i = li * SEG + s;
        phase[i] = 1 - s / SEG + li * 0.13; // pulse continuity along the arc
        speed[i] = 0.9;
        len[i] = 1;
      }
    });
    g.setAttribute("aPhase", new InstancedBufferAttribute(phase, 1));
    g.setAttribute("aSpeed", new InstancedBufferAttribute(speed, 1));
    g.setAttribute("aLen", new InstancedBufferAttribute(len, 1));
    return g;
  }, [links]);
  const arcMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: traceVertex,
        fragmentShader: traceFragment,
        uniforms: { uTime: { value: 0 }, uColor: { value: new Color("#00f5ff") }, uIntensity: { value: 1.5 } },
      }),
    []
  );
  const arcRef = useRef<InstancedMesh>(null);

  // ---------- stars ----------
  const stars = useMemo(() => {
    const n = 1800;
    const pos = new Float32Array(n * 3);
    const r = rng(77);
    for (let i = 0; i < n; i++) {
      const th = r() * Math.PI * 2;
      const ph = Math.acos(2 * r() - 1);
      const rad = 120 + r() * 60;
      pos[i * 3] = rad * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = rad * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = -58 + rad * Math.cos(ph);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    const m = new PointsMaterial({ color: "#9fb4ff", size: 0.35, sizeAttenuation: true, transparent: true, opacity: 0.7 });
    return { g, m };
  }, []);

  useEffect(() => {
    const nm = nodeRef.current;
    const rm = ringRef.current;
    const lm = nodeLabelRef.current;
    if (nm && rm && lm) {
      nodes.forEach((n, i) => {
        lonLatToVec3(n.lon, n.lat, R + 0.02, v).add(GLOBE);
        tmp.compose(v, q.identity(), sc.set(1, 1, 1));
        nm.setMatrixAt(i, tmp);
        col.set(n.color);
        nm.setColorAt(i, col);
        // ring tangent to the surface
        v2.copy(v).sub(GLOBE).normalize();
        q.setFromUnitVectors(new Vector3(0, 0, 1), v2);
        tmp.compose(v, q, sc.set(0.7, 0.7, 1));
        rm.setMatrixAt(i, tmp);
        // label floating above the node
        const e = atlas.entries[i];
        v.addScaledVector(v2, 0.32);
        const w = 0.9;
        tmp.compose(v, q.identity(), sc.set(w, w / e.aspect, 1));
        lm.setMatrixAt(i, tmp);
      });
      nm.instanceMatrix.needsUpdate = true;
      if (nm.instanceColor) nm.instanceColor.needsUpdate = true;
      rm.instanceMatrix.needsUpdate = true;
      lm.instanceMatrix.needsUpdate = true;
    }
    const am = arcRef.current;
    if (am) {
      const a = new Vector3();
      const b = new Vector3();
      const mid = new Vector3();
      const p0 = new Vector3();
      const p1 = new Vector3();
      const from = new Vector3(1, 0, 0);
      links.forEach(([i, j], li) => {
        lonLatToVec3(nodes[i].lon, nodes[i].lat, R, a);
        lonLatToVec3(nodes[j].lon, nodes[j].lat, R, b);
        const dist = a.distanceTo(b);
        mid.addVectors(a, b).multiplyScalar(0.5).normalize().multiplyScalar(R + 0.35 + dist * 0.35);
        for (let s = 0; s < SEG; s++) {
          const t0 = s / SEG;
          const t1 = (s + 1) / SEG;
          // quadratic bezier a → mid → b
          p0.set(0, 0, 0).addScaledVector(a, (1 - t0) * (1 - t0)).addScaledVector(mid, 2 * (1 - t0) * t0).addScaledVector(b, t0 * t0);
          p1.set(0, 0, 0).addScaledVector(a, (1 - t1) * (1 - t1)).addScaledVector(mid, 2 * (1 - t1) * t1).addScaledVector(b, t1 * t1);
          const L = p0.distanceTo(p1);
          v.addVectors(p0, p1).multiplyScalar(0.5).add(GLOBE);
          v2.subVectors(p1, p0).normalize();
          q.setFromUnitVectors(from, v2);
          tmp.compose(v, q, sc.set(L * 1.02, 1, 1));
          am.setMatrixAt(li * SEG + s, tmp);
          (am.geometry.getAttribute("aLen") as InstancedBufferAttribute).setX(li * SEG + s, L);
        }
      });
      (am.geometry.getAttribute("aLen") as InstancedBufferAttribute).needsUpdate = true;
      am.instanceMatrix.needsUpdate = true;
    }
    const pm = packetRef.current;
    if (pm) {
      for (let i = 0; i < PACKETS; i++) pm.setMatrixAt(i, tmp.identity());
      pm.instanceMatrix.needsUpdate = true;
    }
  }, [nodes, links, atlas, PACKETS]);

  useDispose(tunnelGeo);
  useDispose(tunnelMat);
  useDispose(packetGeo);
  useDispose(packetMat);
  useDispose(mask);
  useDispose(globeMat);
  useDispose(atmoMat);
  useDispose(nodeGeo);
  useDispose(ringGeo);
  useDispose(ringGeoInst);
  useDispose(ringMat);
  useDispose(atlas);
  useDispose(labelMat);
  useDispose(nodeLabelGeo);
  useDispose(stageLabelGeo);
  useDispose(stageDotGeo);
  useDispose(arcGeo);
  useDispose(arcMat);
  useDispose(stars.g);
  useDispose(stars.m);

  const processSection = SECTIONS.find((s) => s.id === "process")!;
  const globeRef = useRef<Group>(null);
  const stageColor = useMemo(() => processSteps.map(() => new Color("#9aa0aa")), []);

  useFrame((state) => {
    const on = rig.p > 0.69 && rig.p < 0.875;
    if (!on) return;
    const t = store.get().reducedMotion ? 0 : state.clock.elapsedTime;
    tunnelMat.uniforms.uTime.value = t;
    packetMat.uniforms.uTime.value = t;
    // the tunnel is only around the camera until it has emerged above the globe
    const tm = tunnelRef.current;
    const pm = packetRef.current;
    const inTunnel = rig.p < 0.775 || rig.p > 0.862;
    if (tm && tm.visible !== inTunnel) tm.visible = inTunnel;
    if (pm && pm.visible !== inTunnel) pm.visible = inTunnel;
    globeMat.uniforms.uTime.value = t;
    ringMat.uniforms.uTime.value = t;
    arcMat.uniforms.uTime.value = t;
    // process ring: seven stages orbit the globe; each turns green as the pipeline advances
    const sl = stageLabelRef.current;
    const sd = stageDotRef.current;
    if (sl && sd) {
      const n = processSteps.length;
      const tp = (rig.p - processSection.from) / (processSection.to - processSection.from);
      const colors = sl.geometry.getAttribute("aColor") as InstancedBufferAttribute;
      for (let i = 0; i < n; i++) {
        const ang = t * 0.12 + (i / n) * Math.PI * 2;
        const rr = R + 1.6;
        v.set(Math.cos(ang) * rr, 0.9 + Math.sin(ang * 2) * 0.15, Math.sin(ang) * rr * 0.85).add(GLOBE);
        const e = atlas.entries[nodes.length + i];
        const w = 1.1;
        tmp.compose(v, q.identity(), sc.set(w, w / e.aspect, 1));
        v2.copy(v);
        v2.y -= 0.32;
        sl.setMatrixAt(i, tmp);
        tmp.compose(v2, q.identity(), sc.set(1, 1, 1));
        sd.setMatrixAt(i, tmp);
        const done = tp > (i + 1) / (n + 0.5);
        const active = !done && tp > i / (n + 0.5);
        const target = done ? "#00ff88" : active ? "#00f5ff" : "#9aa0aa";
        stageColor[i].lerp(col.set(target), 0.1);
        colors.setXYZ(i, stageColor[i].r, stageColor[i].g, stageColor[i].b);
        sd.setColorAt(i, stageColor[i]);
      }
      colors.needsUpdate = true;
      sl.instanceMatrix.needsUpdate = true;
      sd.instanceMatrix.needsUpdate = true;
      if (sd.instanceColor) sd.instanceColor.needsUpdate = true;
    }
    // slow globe rotation (nodes and arcs are placed in world space and stay put: the map turns beneath a fixed deploy overlay)
    const g = globeRef.current;
    if (g) g.rotation.y = t * 0.02;
  });

  return (
    <group>
      <mesh ref={tunnelRef} geometry={tunnelGeo} material={tunnelMat} />
      <instancedMesh ref={packetRef} args={[packetGeo, packetMat, PACKETS]} frustumCulled={false} />
      <points geometry={stars.g} material={stars.m} />
      <group position={GLOBE} ref={globeRef}>
        <mesh material={globeMat}>
          <sphereGeometry args={[R, 96, 64]} />
        </mesh>
        <mesh material={atmoMat} scale={1.09}>
          <sphereGeometry args={[R, 48, 32]} />
        </mesh>
      </group>
      <instancedMesh ref={nodeRef} args={[nodeGeo, undefined, nodes.length]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} color={[1.4, 1.4, 1.4]} />
      </instancedMesh>
      <instancedMesh ref={ringRef} args={[ringGeoInst, ringMat, nodes.length]} frustumCulled={false} />
      <instancedMesh ref={nodeLabelRef} args={[nodeLabelGeo, labelMat, nodes.length]} frustumCulled={false} />
      <instancedMesh ref={arcRef} args={[arcGeo, arcMat, links.length * SEG]} frustumCulled={false} />
      <instancedMesh ref={stageLabelRef} args={[stageLabelGeo, labelMat, processSteps.length]} frustumCulled={false} />
      <instancedMesh ref={stageDotRef} args={[stageDotGeo, undefined, processSteps.length]} frustumCulled={false}>
        <meshBasicMaterial toneMapped={false} color={[1.6, 1.6, 1.6]} />
      </instancedMesh>
      <pointLight position={[0, 6, -50]} intensity={3} distance={30} decay={2} color="#00f5ff" />
      <pointLight position={[-8, -4, -56]} intensity={2} distance={30} decay={2} color="#7c3aed" />
    </group>
  );
}
