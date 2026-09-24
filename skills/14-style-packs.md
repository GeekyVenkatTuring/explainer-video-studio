# Skill 14 — Style Packs (visual variety)

Every video before Sept 2026 used one look (`lib/primitives.tsx`: near-black grid bg, Space
Grotesk + SF Mono, glowing cards, hard cuts). Style packs fix the monotony: each pack is a
complete visual identity — background, typography, scene archetypes, caption treatment and
scene-to-scene transitions — while the repo contract (useP(dur) phasing, continuous motion,
rnd() determinism, no CSS filter, QA stills) stays exactly the same.

## Where things are
- `composer/src/styles/core.tsx` — the `StylePack` contract + shared computed content + pack-styled captions.
- `composer/src/styles/packs/*.tsx` — one file per pack. `styles/registry.ts` — one line per pack.
- Backgrounds receive `dur` (beat seconds) → packs can draw a scene-progress bar (ledger does).
- `composer/src/styles/StyleReel.tsx` — composition `StyleReel` (props `{pack, beats, captions, audio, label}`),
  uses `@remotion/transitions` (TransitionSeries; each sequence is extended by T frames so narration sync holds).
- Reference build: `projects/style-lab/` (Rule of 72, one script × 3 packs → `~/Downloads/generated_videos/style-lab/`).

## Pick the pack from the CONTENT (do this in Step 1 of skills/01)
| Pack | Look | Use for |
|---|---|---|
| `editorial` | light cream paper, Playfair/Source Serif, FT-style d3 charts, masked reveals, slide/fade | finance, markets, business, policy |
| `blueprint` | blue drafting sheet, roughjs hand-drawn strokes that "boil", Caveat + JetBrains Mono, dimension lines, wipes | system design, engineering, how-it-works |
| `kinetic` | flat colour fields per beat, huge Anton type slamming on springs, @remotion/shapes + noise, clock-wipe/flip | hooks, Shorts/Reels, intros, recaps |
| `chalk` | green slate + wooden frame, Cabin Sketch/Patrick Hand, chalk strokes with dust, **typeset maths** (`statement.tex` = LaTeX → MathML, system STIX Two Math) | maths, stats, ML theory, physics, lessons/courses |
| `studio` | 3D Three.js heroes under studio light (stacks, tubes, columns, pedestals), Sora type — **render with `--gl=angle`** (render.sh does) | hardware, GPUs, infra, products, science |
| `flat` | Kurzgesagt-style flat vector: deep-space gradient, stars, planet horizon, two-tone "orbs", Nunito, iris/slide | science, space, biology, health, big-idea / general-audience |
| `paper` | paper cutout: torn-edge paper with cast shadows, tape, pins, index cards, clothes-line flow, stop-motion jitter, Fredoka | storytelling, history, beginner finance, kids/education, friendly topics |
| `brutal` | neo-brutalist UI: 5px black borders, hard offset shadows, pastel fills, app windows, stickers, marquee, clicking cursor, Archivo Black + Space Mono | startups, product, dev tools, tech news, SaaS, hot takes |
| `iso` | isometric diagrams in pure SVG: shaded iso blocks, platforms + pipes with cube packets, column "skyline" charts, Manrope — cheap to render | cloud/infra, data pipelines, logistics, business processes (3D feel without 3D Studio's cost) |
| `ledger` | light spreadsheet worksheet: column letters/row numbers, live formula bar, sheet tabs + progress bar, violet **cell-cursor** motif, yellow highlighter = verified, provenance chips; IBM Plex Sans/Mono; semantic PDF=orange · Excel=green · SQL=blue · agent=violet · error=crimson | data engineering, agents-over-data, analytics/BI, finance workflows, spreadsheets |
| legacy `primitives` dark look | the pre-2026 style | dev tools / terminal topics only — no longer the default |
Don't use the same pack for two consecutive videos in a series unless it is a deliberate series identity.

## Libraries now installed (composer/, pinned to the core Remotion version — keep them equal!)
`@remotion/transitions` (fade, slide, wipe, flip, clock-wipe) · `@remotion/three` + `three` + `@react-three/fiber@8` (React 18) · `katex` (MathML output only — no CSS/web fonts) · `@remotion/paths` (evolvePath draw-on, getLength)
· `@remotion/shapes` (Circle/Star/Triangle/…) · `@remotion/noise` (noise2D organic drift) · `roughjs`
(hand-drawn; ALWAYS pass `seed` — it uses Math.random otherwise) · `d3-shape` / `d3-scale` (real charts).
Check `npx remotion versions` after any install — a mismatch breaks renders.

## Fonts — system-installed, never loaded in-render
TTFs live in `composer/public/fonts/stylepacks/` and are installed to `~/Library/Fonts` (IBM Plex Sans + Mono, Anton, Playfair
Display, Source Serif 4, Caveat, JetBrains Mono, Inter, Cabin Sketch, Patrick Hand, Sora, Nunito, Fredoka,
Archivo Black, Space Mono, Manrope; all OFL). Chrome resolves system fonts synchronously,
so renders can't stall (see skills/05 on why in-render font loading is banned). New font → download the
TTF there, copy to `~/Library/Fonts`, reference it by family name with a system fallback.

## Making a production video with a pack (the normal path)
1. `cp -r projects/_template_pack projects/<slug>`; set `PACK`, `META` (brand/project/issue/code), a unique `PREFIX`.
2. Write `BEATS = [(kind, props, narration, chapter), …]` using the 8 generic archetypes:
   | kind | props (see `styles/core.tsx`) | use for |
   |---|---|---|
   | `title` | kicker, title ("\n" = 2nd line, accented), subtitle | opening card |
   | `divider` | n, total, title, sub | part breaks |
   | `statement` | kicker, lines[], accent (line idx), big (number/formula), sub | the key idea, a hook |
   | `list` | kicker, title, items[{h,d}] ≤ 6 | levers, reasons, checklists |
   | `flow` | kicker, title, steps[{h,d}] 3–6 | processes, pipelines |
   | `chart` | kicker, title, type line/bar, points[{x,y}] or bars[{label,value}], marks, unit, note | data — COMPUTE it in build.py |
   | `versus` | kicker, title, left/right {h, items[]}, winner | comparisons |
   | `recap` | title, items[], closer | the ending |
3. `python build.py` → TTS + captions + **auto-synced reveals**: for list/flow/recap items, bar labels and
   statement lines, build.py finds the word where each item is spoken and sets `props.ats` so it reveals
   ~0.03 of the beat before the voice says it. Name items with words the narration actually uses.
4. `bash render.sh` → per-chapter MP4s + `renders/master.mp4`. QA stills first (skills/06) as always.
Reference: `projects/style-lab/gallery.py` renders every archetype in every pack (archetype gallery).

## Adding a pack
Copy the closest pack, change tokens/fonts/background/transition, re-design each archetype's LAYOUT (a
reskin with the same layout is not a new pack), add one registry line, render the 5 QA stills, fix, done.
Every pack MUST implement all 8 generic archetypes (`packs/<pack>-generic.tsx`, merged in registry.ts).
The hook/formula/growth/compare/takeaway kinds are sample-only (Rule of 72 reel). New archetype → add to
`Kind` + a props interface in core.tsx and implement it in every pack.

## 3D notes (studio)
Canvas camera and the `PROJ` camera in studio.tsx are identical (pos [0,0.6,12], fov 35, looking down −z), so
`proj(x,y,z)` gives exact stage pixels for HTML labels. Visible world at z=0 ≈ ±6.7 wide, ±3.8 tall — keep
objects inside ±5.5 x and above y≈−2 (captions). No env map → keep metalness ≤ 0.4 or objects render dark.

## Transitions — CSS only
@remotion/transitions 4.0.484 also ships shader transitions (book-flip, cross-zoom, dissolve, swap, ripple,
film-burn, zoom-in-out…). They draw through WebGL/HTML-in-canvas — don't use them in packs. CSS-safe ones:
fade, slide, wipe, flip, clock-wipe, iris.

## Algorithm scenes (x_* kinds) — available in `blueprint` AND `iso`
x_diagram · x_code · x_cosine · x_hnsw · x_graph · x_store · x_fusion. Same props in both packs (see
projects/mem0-memory-en/build.py for real examples), so a script can switch between them by changing PACK.
The computation is shared (`buildHnsw`, `bm25Params` exported from packs/blueprint-x.tsx): both packs show
identical numbers. Iso versions: raised "slab" cards, pipes with cube packets, HNSW as three stacked iso
planes with the search dropping between layers, entities as iso blocks, columns for cosine/fusion scores.
`ledger` has its OWN x_* set (packs/ledger-x.tsx): x_diagram (nodes + dashed `groups`, straight-routed edges) · x_code (syntax-tinted, `notes`) · x_table (typed cells, `computed` columns in violet, `marks` with notes) · x_ingest (PDF/Excel page → stages → facts rows) · x_loop (ring of steps + orbiting token + live trace panel) · x_context (context-window stack, token budget, compaction) · x_trace (agent transcript: user/memory/plan/call/result/answer with inline tables) · x_verify (draft claims checked against an evidence log; failed number struck + fixed). Reference: projects/data-harness-en/build.py (its autosync also syncs any `notes`/`events`/`marks`/`claims` entry that names a spoken `key` word).
Other packs don't have x_* scenes yet — a missing kind renders blank, so check before choosing a pack.
