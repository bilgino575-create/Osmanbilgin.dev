# osmanbilgin.dev — Root Access

The personal site of Osman Bilgin, rebuilt as one continuous real-time 3D
world: the site is a computer, and the visitor goes inside it.

- **Act I — The desk.** A procedural night room. The monitor boots from real
  load events, the keyboard reacts to your real keyboard, the duck has physics,
  the steam avoids the cursor, the phone shows the real contact details.
- **Act II — The screen.** The camera pushes through the glass into a working
  desktop OS rendered on canvas textures: a terminal (tab completion, history,
  easter eggs), a code editor showing this site's own source, a file explorer
  with the projects.
- **Act III — The silicon.** Motherboard → CPU → die. Services are functional
  blocks on the die, languages flow through the pipeline, skills are gauges.
- **Act IV — The network.** A fibre tunnel to a deploy-map globe with the
  DevOps/cloud tools as edge nodes; the process runs as a pipeline.
- **Act V — Return.** Back at the desk the phone lights up; the contact form
  is an ssh prompt; the camera leaves through the window into the rain.

Everything is procedural: no downloaded models, textures or fonts beyond the
self-hosted Google fonts through `next/font`. The full site is also complete,
readable HTML without WebGL.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
npm run typecheck
```

URL switches for testing: `?nogl` (HTML only), `?gl=1` (force WebGL on a
software renderer such as SwiftShader; the probe refuses those by default),
`?tier=high|low` (force a quality tier), `?debug` (devtools HUD, also `D`).
Command palette: `~` or Ctrl/⌘+K.

The interface follows the Apple system language (Inter, pure black, one blue
accent, frosted glass, pill buttons); the on-screen OS has a menu bar, a dock
and rounded windows. See `docs/ROOT-ACCESS.md` §1.

## Screenshots and checks

```bash
npm run shoot -- --p 0,0.34 --tier high         # docs/screenshots
node scripts/verify.mjs keyboard|overflow|memory|reduced|perf|bundle
node scripts/leak.mjs                              # per-world GPU resource leak check
```

`scripts/embed-sources.mjs` runs before every build and embeds the curated
source files plus the repository's real git log into
`src/experience/os/sources.generated.ts`.

## Documentation

`docs/ROOT-ACCESS.md` holds the art direction, storyboard, scene graph,
quality tiers, dependency justifications, measurements and known limitations.
