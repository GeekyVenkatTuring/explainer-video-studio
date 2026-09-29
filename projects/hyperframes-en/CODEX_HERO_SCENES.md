# Codex task — build 9 bespoke "hero" scenes for the HyperFrames explainer

You are working in the repo `/Users/appuram/Developer/explainer-forge`. We are building an
animated explainer video ABOUT HyperFrames (the framework that renders video from HTML).
Claude has already built the scene set `composer/src/scenes/HFScenes.tsx` (identity, shared
helpers, and parameterized archetypes). **Your job: create ONE new file
`composer/src/scenes/HFHeroScenes.tsx`** that exports 9 bespoke scene components listed below.
Claude will import them into the HFScenes router and QA them. Do NOT edit HFScenes.tsx,
Explainer.tsx, build.py, or anything else — only create HFHeroScenes.tsx.

## MANDATORY READING FIRST (do not skip — these are the quality bar)
1. `composer/src/scenes/HFScenes.tsx` — COPY its patterns exactly (imports, phasing, motif).
   Note the exported shared helpers you MUST reuse: `T` (theme), `A` (accent colors),
   `useR` (front-loaded reveals), `AngleFrame`, `TrackBar`, `TagChip`, `CodePanel`, `Tok`.
2. `composer/src/lib/primitives.tsx` — the engine: `useP`, `usePop`, `rnd`, `mix`, `MONO`,
   `SANS`, `Bg`, `Stage`, `Head`, `Foot`, `Card`, `Flow`, `Wire`, `Counter`, `Type`,
   `PixGrid`, `Brackets`, `ScanBeam`, `Kicker`.
3. `skills/03-animation.md`, `skills/08-cookbook.md`, `skills/09-frame-design.md` — the rules.

## HARD RULES (violations = defects; Claude will QA every scene as a still)
- Every scene is `const X: React.FC<{ dur?: number; ...props }> = ({ dur }) => {...}`.
  Phase EVERYTHING with fractions: `const p = useR(dur)` for reveals (front-loaded), and
  `const pf = useP(dur)` for anything that tracks a running process / continuous motion.
  NEVER use fixed frame numbers for reveals (`interpolate(frame,[40,56],...)` is a defect).
  `useCurrentFrame()` is ONLY for continuous loops (dash-march, sine glow, orbit, scrub).
- CONTINUOUS MOTION in every frame: at least 1–2 always-on elements (Flow particles, Wire
  dash-march is automatic, `Math.sin(frame*0.06)` glow, orbit, a moving scrub head).
- DETERMINISM: never `Math.random()` — use `rnd(i, j, seed)`. No CSS `filter`/`backdrop-filter`.
- Author on `Stage` (1920×1080). Margins x:100→1820. `Head` at top (kicker+title). `Foot`
  at y=924 (one-line takeaway, phased in near the end p(0.82,0.92)). Content lives y:200→900.
- Do NOT render your own `<Bg>` or `SceneProgress` — the HFScenes router wraps every scene
  with Bg + the playhead progress bar. Just return the scene content (`<Stage>…</Stage>`).
- Text: every absolute text block gets an explicit `width`. Min font 19px. Follow the
  typography table in skill 09 (Head title 52, section 30–40, body 26–30, mono labels 21–26).
- Reveals span the beat: last reveal lands ~p(0.75,0.9). Keep 4–8 phased reveals per scene.
- Accent color semantics: A.html=cyan (DOM/structure), A.motion=violet (animation),
  A.media=amber (audio), A.ship=green (CLI/render), A.warn=rose (bans/bugs). Use the accent
  noted per scene.

## FILE HEADER (start HFHeroScenes.tsx with exactly this import shape)
```tsx
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import {
  useP, usePop, rnd, mix, MONO, SANS, CL,
  Stage, Head, Foot, Card, Flow, Wire, Counter, Type, Kicker, Brackets, ScanBeam,
} from "../lib/primitives";
import { T, A, useR, AngleFrame, TrackBar, TagChip, CodePanel, Tok } from "./HFScenes";
```
Export EACH component with a named `export const`. End with `npx tsc --noEmit` clean
(run inside `composer/`; only YOUR file needs to be clean).

---

## THE 9 SCENES

### 1. `TracksScene`  (accent A.html) — "Tracks stack; z-order is data-track-index"
Concept: multiple horizontal timeline tracks; clips on higher `data-track-index` render in
front. Layout: 3 stacked tracks (rows) at x=180, w=1560, rowY = 300 + row*150, rowH=70.
Label each row left (mono, e.g. "track 0 — background", "track 1 — content", "track 2 —
overlay") in A.html/muted. On each track draw 2–3 clip blocks (rounded rects, colored by
A.html/A.motion/A.media) at fractional x-offsets/widths; a clip on track 2 overlaps a clip on
track 1 to show z-order (the higher track's clip sits ON TOP with a shadow). Reveal tracks
top→down p(0.08…), clips after their track. A single vertical scrub head (full height across
all 3 tracks) sweeps L→R over the FULL beat (use `useP` not `useR` for the head x). Small
`TagChip("data-track-index", A.html)` near title area. Foot: "Same track = later clip wins;
different track = higher index wins."

### 2. `SeekScene`  (accent A.html) — "One paused timeline. We SEEK it, we never play it."
Concept: the core mental model. A single long track bar (use `TrackBar`) with a scrub head
that moves NON-monotonically — scrubs forward then jumps back — to prove frames are computed
from time t, not played. Above the bar, a "state readout" panel that recomputes from the head
position: show e.g. `t = 3.20s` (Counter/derived), and a little element whose x/opacity is a
pure function of the head fraction (so as the head scrubs back, it visibly rewinds). Two
labels: left "gsap.timeline({ paused: true })" (mono, A.motion), right "render length =
data-duration" (mono, A.html). The head fraction: `const hf = 0.5 + 0.42*Math.sin(frame*0.02)`
(oscillates → scrubs back and forth, continuous). Reveal the panel/labels with useR; the
scrub + readout run off frame. Foot: "Every frame is the timeline sampled at one instant —
so any frame is reproducible."

### 3. `SubcompScene`  (accent A.html) — "Standalone vs sub-composition"
Concept: nesting. Left: a "host index.html" card (use CodePanel-style or Card) showing a host
slot `<div data-composition-src="scene.html" data-composition-id="scene">`. Right: the
sub-composition file `scene.html` whose root is wrapped in `<template>` (highlight the
`<template>` in A.warn to stress "sub-comps MUST be wrapped; standalone must NOT"). Draw a
Wire + Flow from the host slot to the sub-comp (data-composition-src link). Add two TagChips:
`data-composition-src` (A.html) and `<template>` (A.warn). Include a small caption line: "host
id === inner template id === window.__timelines key". Reveal host→wire→subcomp→chips with
useR. Foot: "Only <template> contents are cloned — put <style>/<script> inside it."

### 4. `DeterminismGridScene`  (accent A.warn) — COMPUTED: parallel workers desync on a clock
Concept: a grid rendered by parallel workers; a hidden clock makes frames flicker. Draw a
16×9-ish grid of cells (cell ~54px) at x=180,y=260. TWO states shown side-by-side OR morph:
LEFT half "Math.random()/Date.now()" → cells have MISMATCHED colors computed with a
frame-varying seed (`rnd(r,c,Math.floor(frame/3))`) so they visibly flicker/scatter =
desync. RIGHT (or after a phase flip) "rnd(i,j,seed) seeded" → cells form a STABLE clean
pattern (`rnd(r,c,7)` fixed seed, no frame term) = identical every render. Label the flickery
side A.warn "flickers across workers", the stable side A.ship "identical every render". This
is the "compute the real thing" scene — the flicker must be visibly alive. Use `useP` for any
reveal; the flicker itself is the continuous motion. Foot: "Workers render frames in parallel;
a hidden clock gives each a different answer."

### 5. `AdaptersScene`  (accent A.motion) — orbit hub: 7 runtimes, one seek
Concept: ADAPT the cookbook §3 orbit hub. Center hub = a glowing node "one seek()" (A.motion,
label "window.__timelines"). 7 satellites on an ellipse (rx=560, ry=270, center 960,560):
GSAP (🎯, the biggest/brightest, A.motion), Lottie (🎬), Three.js (🧊), Anime.js (✨), CSS (🎨),
WAAPI (⚙️), TypeGPU (🔺). Each satellite: a Wire from center drawn just before it appears +
Flow particles from hub→satellite (data flows OUT: one seek drives all). Reveal satellites
staggered p(0.1 + i*0.06 …). A slow orbit sway via `Math.sin(frame*0.008)`. A "chase" glow
cycles emphasis across satellites after they land (`Math.floor(frame/26)%7`). Foot: "Each
runtime registers on its own global; one seek pass drives every one."

### 6. `AudioEngineScene`  (accent A.media) — the one engine + the credential switch
Concept: a branching diagram. Left: input card `audio_request.json` (A.media). Center: the
engine node `scripts/audio.mjs` (big, glowing A.media). Right: output card `audio_meta.json`.
Wire+Flow left→center→right along the middle. BELOW the engine, a SWITCH that branches on
"HeyGen credential?" into two columns: YES → (TTS: HeyGen Starfish · BGM: retrieve · SFX:
retrieve) in A.ship; NO → (TTS: ElevenLabs→Kokoro · BGM: Lyria/MusicGen · SFX: bundled lib)
in A.muted/warn. Draw the branch as two Wires from a small diamond "cred?" node. Reveal:
request→engine→meta (useR early), then the switch branches (mid), then the two columns
(later). Foot: "One engine, one request file — the same code, credentialed or offline."

### 7. `TtsChainScene`  (accent A.media) — the TTS provider ladder + word timestamps
Concept: a vertical fallback ladder of 3 rungs: 1) HeyGen (Starfish) — "native
word timestamps ✓" (A.ship), 2) ElevenLabs — "no timestamps → chain transcribe" (A.media),
3) Kokoro-82M local — "always available, no key" (A.html). "First available provider wins":
show a token/arrow descending until it lands on the first available rung (highlight the
landed rung, dim the rest). Each rung is a full-width Card (x=200,w=1520,h~150, stacked
y=280+i*180). Right side of each rung: a "word timestamps?" badge (✓ green / ✗ muted). A small
moving indicator (the "resolve" probe) animates down the rungs via useP then settles. Foot:
"HeyGen gives word timings natively; the others chain Whisper transcription."

### 8. `StudioScene`  (accent A.ship) — preview opens Studio; render is user-gated
Concept: a mock of the Studio timeline editor. A big rounded "app window" (x=150,y=240,
w=1620,h=600) with: a top toolbar (▶ play, a time readout), a large preview area (left ~60%)
showing a simple composed frame, and a TIMELINE strip at the bottom with 3 mini tracks + clip
blocks + a scrub head (reuse TrackBar) that moves over the beat. Show a SELECTED clip
(highlighted outline, A.ship) with a little "selection" tag. A caption: "the user can edit any
clip here — render only after they approve". Reveal window→preview→timeline→selection with
useR; scrub head + a subtle play indicator run off frame. Foot: "preview = Studio; render is
never automatic — it waits for the user's go."

### 9. `LambdaScene`  (accent A.ship) — cloud fan-out for long / large / 4K
Concept: distributed render. Left node: "your laptop / CI" (Card, A.ship) with the command
`hyperframes lambda render`. Center: a fan-out to N (=6) Lambda worker nodes (small rounded
nodes in a vertical column at x~980), each rendering a frame-range chunk (label f0–f9,
f10–f19, …). Wires from laptop→each worker with Flow particles (work dispatched). Right: an S3
bucket node that the workers write to, then a single "final.mp4" node. Flow from workers→S3→mp4.
A chase highlight cycles which worker is "active". Reveal laptop→workers (staggered)→S3→mp4
with useR; Flows continuous. Foot: "Frames split across many workers, muxed once in the cloud
— for multi-minute or 4K renders."

---

## WHEN DONE
- `cd composer && npx tsc --noEmit` — must be clean for HFHeroScenes.tsx.
- Reply with the list of exported component names and confirm tsc is clean.
- Do not run any render. Claude will import, wire the router, QA stills, and fix.
