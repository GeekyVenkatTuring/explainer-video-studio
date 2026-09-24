# Explainer Video Studio — Agent Contract

You are building an animated explainer video. This repo exists because earlier
attempts produced narrated slides; the standard here is the "fine-tuning" and
"computer-vision" gold references in `reference/`. Meeting that bar is not about
talent — it is about following this contract exactly.

**MANDATORY: before writing any code, read `skills/01-pipeline.md`,
`skills/02-screenplay.md`, `skills/03-animation.md`, `skills/04-visuals.md`,
`skills/08-cookbook.md` (copy-paste recipes for every scene archetype — adapt these
rather than inventing structures from scratch), and `skills/09-frame-design.md`
(frame zones, typography hierarchy, text-width math, title/end-card anatomy —
this is how you avoid overlaps while composing blind).**
Read `skills/05-tts.md` before generating narration, `skills/06-qa.md` before your
first render, `skills/07-render.md` before the final render. **If the brief says
short / Shorts / Reel / TikTok / Instagram / vertical / 9:16, also read
`skills/10-vertical.md` BEFORE designing anything — vertical overrides parts of
skills 02 and 09 (cold-open hook, UI-safe zones, stacked layout, bigger type,
`VStage`, render `ExplainerVertical`).** **If the narration or on-screen text is
Telugu or any Indic script, also read `skills/11-indic-telugu.md` BEFORE designing
anything — it encodes QA findings from delivered Telugu videos (letter-spacing
breaks Telugu words, dead-air phasing, caption-band layout, Telugu type minimums)
and the proven edge-tts + system-font pipeline.** **If the video involves stock
markets, trading, IPOs, or investing (pre/post-market wraps, IPO analysis, market
education, platform how-tos), read `skills/12-market-research.md` BEFORE any web
research — it is the source directory + data-validation protocol (exact 2-decimal
figures, triangulation on conflicts, benchmark naming, dateline checks, disclaimer).
A wrong number in a finance video misleads real investors and is the worst defect
this repo can ship; the pre-render numbers checklist in that skill is a hard gate.**
**Also read `skills/14-style-packs.md` BEFORE designing — pick a style pack
(editorial / blueprint / kinetic …) that matches the content instead of defaulting to the
old dark primitives look; the monotony of one look for every video is a known problem.**
If you have not read a skill, do not perform its step.

## Hard rules (violations = defects, all verified at QA)

1. **No fixed-frame animation; reveals track the NARRATION.** Every scene takes `dur`
   (seconds) from its cut props and phases ALL reveals with `useP(dur)` fractions.
   `interpolate(frame, [40, 56], …)` for a reveal is a defect. Each reveal fires ~when its
   subject is spoken — and since narration is usually front-loaded (names all items early,
   then elaborates), reveals are usually front-loaded too. Do NOT spread reveals evenly to
   p≈0.85 to "fill the beat": that trails the audio by 10–30s (the A/V-lag defect). Keep
   the back half alive with continuous motion + the progress bar (rule 2), not by delaying
   reveals. Keep beats short (≤ ~75s) so audio and visuals align; split long intros (short
   title + developing roadmap). See skills/02 §"Narration ↔ scene contract", skills/06 §4b.
   Two shipped defects this prevents: a 96s title held static ~46s; and reveals lagging the
   narration by up to 30s.
2. **Continuous motion in every frame.** Each scene layers 1–3 always-on elements
   (Flow, Wire dash-march, ScanBeam, sine glow, chase highlight, orbit) — clearly
   visible, not a few tiny dots. Add a scene-progress bar at the frame edge (fills over
   `p(0,1)`) as a cheap universal "this is playing" signal. A frozen frame anywhere is a defect.
3. **Compute the real thing.** If the topic contains an algorithm or numeric process,
   run it (precompute deterministic states at module scope, index by phase) instead
   of drawing a static picture of it.
4. **Deterministic rendering.** Never `Math.random()` in render code — use
   `rnd(i, j, seed)` from lib/primitives. Never CSS `filter`/`backdrop-filter`.
5. **QA stills before final render.** Render a mid-animation still of EVERY scene,
   look at every one, fix what you see, verify the fixes. Never ship unseen scenes.
6. **Calibrated length.** Narration budget = target-minutes × 212 words (Nova).
   After TTS, compare the printed total to the target; iterate (delete changed WAVs
   only) until within ~5%.
7. **One visual identity per video**: theme + 2–4 semantic accent colors + a
   recurring motif. Colors mean things; don't decorate randomly.
8. **Defaults**: 16:9 1080p 30fps, no music, no captions, Nova voice, 0.35s gaps —
   unless the user says otherwise.

## Workflow (detail in skills/01-pipeline.md)
brief → beat list + identity → scene set (`composer/src/scenes/<X>Scenes.tsx`, built
on `lib/primitives.tsx`, registered in `Explainer.tsx` REGISTRY) → screenplay + TTS
(`projects/<slug>/build.py`, copied from `projects/_template/`) → QA stills → final
render → verify (ffprobe + extracted frames) → deliver to `~/Downloads/generated_videos/`.

## Where things are
- `composer/src/lib/primitives.tsx` — the scene engine (useP, Flow, Wire, Counter,
  Type, Card, Stage, Bg, PixGrid, Brackets, ScanBeam, rnd, makeTheme). Build on it;
  extend it rather than duplicating.
- `composer/src/scenes/DemoScenes.tsx` — annotated starter; copy it for a new video.
- `projects/_template/build.py` — screenplay/TTS/props template; copy per video.
- `reference/` — the gold implementations (FTScenes, CVShared/CVScenesA/CVScenes) and
  `REVIEW.md` at repo root explains exactly why earlier videos fell short. When
  unsure how rich a scene should be, open a gold file and match it.

## Honesty
Report what QA caught, what you fixed, and what remains imperfect. If narration
missed the length target or a scene is weaker than the rest, say so in the delivery
summary instead of hiding it.
