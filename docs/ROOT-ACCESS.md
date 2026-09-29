# ROOT ACCESS — architecture & art direction

osmanbilgin.dev rebuilt as one continuous real-time 3D world. The site is a
computer; the visitor goes inside it. This document is written before the code
and kept in sync with it. Facts (name, titles, contact, languages, tech,
services, projects, process) come from `src/lib/data.ts` and nowhere else.

## 1. Art direction

**Mood.** 02:40 at night. A developer's desk in a dark flat, the only light
coming from a monitor, a cyan LED strip and a rainy city outside. Cinematic,
quiet, premium. Reference points are the Blade Runner apartment interiors and
the way Apple product films light black anodised aluminium: large soft
highlights, deep blacks that are never pure black, one saturated accent.
Nothing is cartoon or low-poly; every object has bevels, roughness variation
and a plausible material.

**Palette.** Near-black `#050507` base; surfaces `#0b0b10`, `#121218`.
Accents are the brand colours used as *light*, never as paint:

| token   | hex       | role                                                   |
|---------|-----------|--------------------------------------------------------|
| cyan    | `#00F5FF` | the signal: LED strip, terminal cursor, packets, traces |
| violet  | `#7C3AED` | rim light from the city, die iridescence, hover states  |
| green   | `#00FF88` | success only: passing pipeline stages, "available"      |

Text: `#F4F4F5` primary, `#A1A1AA` secondary, `#63636B` muted. Text sits on
glass panels (`rgba(8,8,12,0.55)` + 12 px blur + 1 px `rgba(255,255,255,.08)`
border) so it stays legible over any frame of the 3D scene.

**Lighting.** Physically-based, ACES filmic tone mapping, exposure 1.05.
Three lights per act, never more:
1. key — monitor emissive (white-cyan, changes with what is on screen; bleeds onto desk and keyboard),
2. accent — cyan LED strip under the monitor (point light + emissive bar),
3. rim — violet-blue from the window (city + lightning-free, steady).
Bloom is selective: only emissive materials above threshold 1.0 bloom.

**Materials.** One material language across acts: `MeshPhysicalMaterial`
with roughness 0.35–0.7, clearcoat on the desk and the phone, brushed
metal on the monitor stand (anisotropy via roughness map noise in shader),
matte rubber on the duck, soft-touch plastic on keycaps. Glass uses
transmission only on HIGH tier; LOW tier swaps to a tinted reflective
material. Custom shaders: rain-on-glass, city bokeh, steam, screen glass,
iridescent die, trace pulses, heat haze, fiber tunnel, globe dots, sky.

**Typography.** Space Grotesk (display and body) and Geist Mono (terminal,
labels, HUD). Both self-hosted through `next/font/google`. Type is set
small and precise: mono labels at 11–12 px with 0.2 em tracking, display
headings at clamp(2.5rem, 6vw, 5.5rem) with tight leading.

## 2. Storyboard and camera path

Scroll progress `p ∈ [0,1]` is the master clock. The camera is driven only by
`p` (smoothed with a critically damped spring, `maath/easing.damp`). Acts are
ranges of `p`. Inside each range the camera moves between keyframes
(position, look-at target, fov) with smoothstep interpolation.

| act | p range     | anchor     | camera                                                        | HTML section shown            |
|-----|-------------|------------|---------------------------------------------------------------|-------------------------------|
| I   | 0.00 – 0.16 | `#home`    | wide desk shot → slow push toward the monitor                 | Hero (name, titles, tagline)   |
| I→II| 0.16 – 0.22 | –          | pushes through the glass; screen fills the frame              | –                              |
| II  | 0.22 – 0.44 | `#about` `#stack` `#work` | inside the OS: dolly across the desktop, parallax between windows | About, Stack, Work           |
| II→III | 0.44 – 0.50 | –       | dive: zoom into a pixel, warp transition to the board          | –                              |
| III | 0.50 – 0.68 | `#services` `#skills` | motherboard → CPU package → die → traces at nanometre scale | Services, Skills              |
| III→IV | 0.68 – 0.72 | –       | packet leaves the die into the fiber tunnel                    | –                              |
| IV  | 0.72 – 0.86 | `#process` | tunnel → emerges above the dark globe; orbit                   | Process pipeline               |
| V   | 0.86 – 1.00 | `#contact` | packet returns; back at the desk, phone lights; pull out through the window into the rain | Contact (ssh form), Available |

Mobile (`pointer: coarse` or width < 768) uses the same keyframes with fewer
intermediate stops and a shorter scroll track (900 vh instead of 1400 vh).
`prefers-reduced-motion` turns every flight into a cut: `p` snaps to the
nearest act keyframe and a 400 ms crossfade covers the switch.

**Signature continuity.** One cyan signal: a bright emissive point that
sits on the keyboard LED in Act I, travels into the screen (a pulse on the
terminal cursor) in Act II, runs along the traces in Act III, rides the
tunnel and the globe arcs in Act IV, and comes back to light the phone in
Act V. It is implemented as a single `Signal` object whose world position is
a function of `p`, rendered with additive bloom so it is always the brightest
thing on screen.

## 3. Scene graph

```
<Canvas>                                # one persistent canvas, dynamic import, ssr:false
  Renderer: WebGL2, ACES, sRGB, dpr by tier
  <CameraRig p/>                        # keyframe interpolation, damping, shake-free
  <Signal p/>                           # the cyan continuity light
  <World.Desk visible={p<0.5 || p>0.86}>
    Room (floor, walls, window frame)   # boxes + planes, physical materials
    Window (rain shader + city bokeh)   # 1 plane, 1 shader, cursor-independent
    Desk, MonitorStand, Monitor         # monitor screen = ScreenOS canvas texture
    Keyboard (InstancedMesh 61 keycaps) # per-instance color + y offset from real keydown
    Mug + Steam (instanced quads, cursor-reactive)
    Duck (Rapier RigidBody, click impulse)
    StickyNotes (3 planes, canvas text)
    Phone (screen = canvas texture with contact info)
    LedStrip (emissive + point light)
  </World.Desk>
  <World.Silicon visible={0.44<p<0.72}> # placed at y = -500
    Die (iridescent shader plane)
    Blocks (InstancedMesh, services layout like a die shot) + label atlas
    Traces (InstancedMesh segments + pulse shader)
    InstructionStreams (15 languages, instanced glyph quads moving along the pipeline)
    Gauges (InstancedMesh planes, dial shader with per-instance level, 10 skills)
  </World.Silicon>
  <World.Network visible={0.68<p<0.9}>  # placed at y = -1000
    Tunnel (cylinder, streak shader)
    Globe (sphere, land-mask dots shader from a procedural canvas)
    EdgeNodes (InstancedMesh + label atlas; devops/cloud tools from data.ts)
    Arcs (instanced tube segments + packet shader)
  </World.Network>
  <World.City visible={p>0.94}>         # exterior shot for the ending
    Facade (InstancedMesh windows, one lit), Rain (GPGPU/instanced streaks)
  </World.City>
  <Post tier/>                          # selective Bloom, ChromaticAberration, Noise, Vignette, DoF, HeatHaze (custom), Dive (custom warp)
</Canvas>
```

Above the canvas, in normal DOM: `<Nav>`, the semantic sections (server
rendered), `<CommandPalette>`, `<DebugHud>`, `<SoundToggle>`, `<Cursor>`.

**Screen OS.** The desktop OS is not DOM. It is a 1536×960 2D canvas drawn by
a small window manager (`ScreenOS`) and used as a texture on the curved
screen mesh, so it receives the glass shader, reflections, curvature and
light bleed like everything else. Redraws happen only when state changes
(dirty flag), not every frame. Pointer events on the screen mesh are
raycast to UV → canvas coordinates → hit regions. Keyboard events go to the
focused window. The terminal, editor and explorer are plain TypeScript
classes with no three.js dependency so they can be unit-reasoned and reused
by the HTML mirror.

## 4. Scroll → progress mapping

- The document is a real scroll track: `<main>` has height `1400vh` (desktop)
  or `900vh` (mobile). Lenis smooths the wheel; the store receives
  `p = scrollY / (scrollHeight - innerHeight)` every scroll event.
- Each HTML section is absolutely positioned at its act's `p` (top =
  `p_start * trackHeight`) with a sticky inner panel so it stays in view for
  the act's duration, then fades. Hash links (`#about` …) scroll to
  `p_anchor * track` through Lenis, so the URL, the nav, the command palette
  and the camera all agree.
- Without WebGL the same sections lose the absolute positioning (`html:not(.gl)`)
  and stack as a normal, complete document with a static designed background.

## 5. Quality tiers and budgets

Initial tier from `detect-gpu` (tier ≥ 2 and not mobile → HIGH; else LOW),
then drei `PerformanceMonitor` (bounds 45–58 fps, `flipflops=3`) with
hysteresis: a decline needs two consecutive windows under 45 fps, an
incline needs three windows above 58, and after a change the monitor is
locked for 6 s. The tier never oscillates more than once per minute.

| tier | dpr        | post-processing                                       | rain          | steam/particles | shadows |
|------|------------|-------------------------------------------------------|---------------|-----------------|---------|
| HIGH | min(2, dev)| bloom, chromatic aberration, grain, vignette, DoF, heat haze | 2 000 streaks | 600 quads        | 1 soft  |
| LOW  | 1          | none                                                  | 400 streaks   | 150 quads        | none    |

Rendering rules: every repeated mesh is an `InstancedMesh`; `useFrame`
callbacks allocate nothing (all vectors are module-level scratch objects);
every geometry, material and texture created in a component is disposed on
unmount; `frameloop` pauses on `visibilitychange` and while the tab is
hidden; worlds outside the current act are `visible=false` so they cost no
draw calls.

Budgets: initial JS before the 3D chunk ≤ 200 KB gzip (no framer-motion, no
gsap; Lenis only); 3D chunk loaded after first paint via `next/dynamic`
with `ssr:false` from a client component, triggered by `requestIdleCallback`;
LCP is the hero `<h1>`; CLS < 0.05 (canvas is `position:fixed`, sections
have explicit heights); ≤ 120 draw calls per act on HIGH.

## 6. Renderer decision

WebGL2 via `THREE.WebGLRenderer`, always. WebGPU was evaluated and not
shipped, for three concrete reasons:

1. The post-processing stack (`postprocessing` and its React bindings) is a
   WebGL pipeline. Selective bloom, DoF, SMAA and the two custom effects
   (dive, heat haze) have no WebGPU path; keeping WebGPU would mean a second
   TSL post pipeline and every effect written twice.
2. Every custom material here is a GLSL `ShaderMaterial` (rain, screen,
   steam, die, traces, gauges, tunnel, globe, labels). WebGPURenderer needs
   node materials; a dual GLSL/TSL codebase doubles the surface to keep in
   sync for no visual gain at this scene's size.
3. The renderer must be chosen before the canvas exists, so "try WebGPU,
   fall back" adds an async probe on the critical path of the 3D chunk.

The brief's rule was to keep WebGPU only if everything, including post,
worked. It does not, so the build stays on WebGL2.

## 7. Fallback plan

| condition                    | behaviour                                                                 |
|------------------------------|---------------------------------------------------------------------------|
| no WebGL2 context            | 3D chunk never loads; `html` lacks `.gl`; full designed HTML site           |
| `prefers-reduced-motion`     | camera cuts + crossfades; no rain animation; no auto-typing                  |
| touch device                 | shorter track, no hover-only info, no custom cursor, larger hit targets      |
| WebGL context lost           | overlay message, HTML remains complete                                      |
| keyboard only                | every control focusable, visible cyan focus ring, skip link to `#about`      |
| screen reader                | canvas `aria-hidden`; all content in semantic HTML with headings and lists   |

## 8. Dependencies added

| package                        | why                                                                        |
|--------------------------------|----------------------------------------------------------------------------|
| `@react-three/postprocessing` + `postprocessing` | selective bloom, chromatic aberration, noise, vignette, DoF; base class for the custom heat-haze and dive effects |
| `@react-three/rapier`          | rubber-duck physics (rigid body, restitution, click impulse)                 |
| `maath`                        | `damp` easing for the camera and `random` for particle distributions          |
| `three-stdlib`                 | `RoundedBoxGeometry` for keycaps, phone, monitor bezel                        |
| `detect-gpu`                   | initial quality tier from the GPU benchmark database                          |
| `puppeteer` (dev)              | headless screenshots and measurements for the self-critique loop              |

Removed: `framer-motion`, `gsap`, `react-icons`, `lucide-react` from the client
bundle (icons are rendered server-side only from `icons.ts`).

## 9. Techniques

- **One canvas, four worlds.** Worlds sit 300 units apart on y; the rig cuts
  between them and the `Dive` post effect covers the cut. Only worlds inside
  the current progress window are `visible`, so draw calls stay per-act.
- **Scroll is the only clock.** `p ∈ [0,1]` is written by the scroll driver
  and damped in the rig (`maath/easing.damp`). Reduced motion snaps `p` to
  stop keys instead of damping, so the camera cuts.
- **The OS is a texture, not DOM.** Window classes draw into their own
  2× canvases only when dirty; the compositor draws them into the monitor
  texture; in Act II each canvas is its own glass pane. Pointer rays hit the
  mesh, UV → window pixels; keyboard is routed while `osFocus` is set.
- **Real boot.** The BIOS/kernel log lines are the store's boot log: WebGL2
  context, renderer, GPU tier, shader compile (`compileAsync`), rapier wasm,
  fonts. There is no percentage anywhere.
- **Sources at build time.** `scripts/embed-sources.mjs` (prebuild) embeds
  eleven curated files and `git log --oneline --graph` of this repository.
- **Instancing everywhere.** Keycaps (61, legend atlas with per-instance UV
  rect and glow via `onBeforeCompile`), steam quads, traces, blocks, labels,
  streams, gauges, packets, arcs, facade windows, rain. Per-frame updates
  touch existing typed arrays; scratch vectors live at module scope.
- **Procedural everything.** Rain/city, screen glass with subpixel mask,
  iridescent die, gauge dials, fibre tunnel, dot-matrix globe from a
  hand-authored land mask, facade. No files are downloaded at runtime except
  the self-hosted `detect-gpu` benchmark JSON under `/benchmarks`.
- **Tiers with hysteresis.** `detect-gpu` picks the start; PerformanceMonitor
  needs two low windows to drop, three high windows to rise, then locks for
  six seconds; `?tier=` forces one.
- **HTML first.** The document is complete without the canvas; panels are
  positioned by progress in 3D mode; keyboard focus inside a hidden section
  scrolls the section (and the camera) into view.

## 10. Measurements

All numbers below were measured in the build container on the Playwright
Chromium with SwiftShader (software WebGL, no GPU). They describe this
machine; a mid-range laptop GPU has not been measured in this session.

MEASUREMENTS_TABLE

## 11. Known limitations (honest)

- **Frame rate on real hardware is unmeasured.** The only GPU available here
  is SwiftShader, which renders this scene at well under 1 fps. The 60/40 fps
  targets are engineered for (instancing, tiers, dpr caps, world culling)
  but not verified on a laptop or a phone.
- **Lighthouse numbers come from the software renderer.** Total Blocking
  Time is dominated by the CPU rasterising WebGL; a device with a GPU will
  see a very different TBT. Accessibility, best practices and SEO scores do
  not depend on the GPU.
- **Continent outlines are hand-authored** at coarse resolution. They read
  correctly as a dot-matrix globe; they are not a survey-grade dataset.
- **The OS windows are canvas textures**, so their text is rendered at 2×
  OS pixels. Very close to the glass the subpixel mask takes over by design.
- **Project links.** `data.ts` has no real URLs for the projects, so the
  project windows say "private client work" instead of linking anywhere.
- **Testimonials** stay hidden until an entry is marked `verified: true`.
- **Sound** is synthesized and off by default; the toggle is the only way in.
- **Duck physics** loads rapier lazily (≈240 KB gzip); until it arrives a
  static duck is shown.
- **Initial JS** is 195 KB gzip, inside the 200 KB budget but with little
  margin; the largest slice is the Next/React runtime.
