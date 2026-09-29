# Codex Task 03 — Build two scene files (gt/rsi.tsx + gt/plan.tsx)

You are building 5 Remotion scenes for the GTT video, prefix `gt`, identity = "trading
terminal". Claude built the shared engine `composer/src/scenes/gt/kit.tsx` and the router
`composer/src/scenes/GTScenes.tsx` (which already imports your two files). Build ONLY these
two files. Do NOT touch kit.tsx, GTScenes.tsx, or Claude's scene files (core/gtt/chart/worked).

## MANDATORY reading before you write a line
1. `composer/src/scenes/gt/kit.tsx` — your toolbox. Study every export.
2. `composer/src/scenes/fq/tech.tsx` — the RSIScene there computes live RSI; the visual bar is
   the quality baseline to MATCH or exceed. Also `fq/apply.tsx` for card/table styling.
3. `skills/03-animation.md`, `skills/09-frame-design.md` (frame zones, typography, overlap math).

## Hard rules (from the repo contract — verified at QA)
- Every scene: `const p = useP(dur)` from kit; phase ALL reveals with `p(a,b)` fractions.
  Last reveal lands ~p 0.75–0.88. NO fixed frame numbers. NO Math.random (use kit's determinism).
- Add `<SceneProgress p={p} color={...}/>` (top edge) to every scene.
- Add `<GTHead kicker=... title=... color=... p={p}/>` at top of every content scene.
- Captions occupy the bottom band — keep ALL content at y ≤ ~900. Use kit's `<Verdict>` (sits y=862)
  for the one-line takeaway; do NOT use `Foot`.
- 1920×1080 Stage, 100px side margins, x+w ≤ 1820. Import from `./kit` and `../../lib/primitives`.
- Continuous motion in every frame (SceneProgress counts; add one more: a `Flow`, sine glow, or the
  RSIPanel's own moving marker).
- `cd composer && npx tsc --noEmit` must be clean for your files before you report done.

## Signatures (the router calls these EXACT names/exports)
```
// gt/rsi.tsx
export const RSIScene: React.FC<{ dur?: number }>
// gt/plan.tsx
export const RRScene: React.FC<{ dur?: number }>
export const SizingScene: React.FC<{ dur?: number }>
export const ScheduleScene: React.FC<{ dur?: number; rows?: any[] }>
export const KiteScene: React.FC<{ dur?: number }>
```
Each returns `<Stage> … </Stage>`. Import `Stage` from `../../lib/primitives`.

---

## SCENE 1 — RSIScene (gt/rsi.tsx)  [accent A.trig amber]
NARRATION (for sync): defines RSI 0–100, compares recent gains vs losses over 14 days, gives the
formula, then 70=overbought / 30=oversold / 45–65=healthy, then "RSI does not tell direction, only
whether a move went too far — which is how you decide whether to chase or wait for a deeper leg."

Build:
- Kicker "ANCHORS · MOMENTUM", title "RSI: has the move gone too far?".
- A DEFINITION Card (top-left, ~x110 y185 w720 h120): use `DefBadge text="DEFINITION" color={A.trig}`
  then a sans sentence "Momentum on a 0–100 scale — recent gains vs recent losses." Reveal p(0.08,0.18).
- A formula Card (top-right ~x870 y185 w840 h120): render the formula in MONO 26px:
  `RSI = 100 − 100 ÷ (1 + avg gain ÷ avg loss)`. Reveal p(0.2,0.3). Highlight "RSI" in A.trig.
- The hero: `<RSIPanel x={140} y={340} w={1120} h={300} closes={TAPE} reveal={p(0.3,0.8)} title="COMPUTED TAPE · RSI(14)"/>`
  (import TAPE from kit). This draws 30/70 bands + a moving line + end marker (that's your continuous motion).
- To the right of the panel (x~1330, y 360..660): three stacked band chips using `<Chip>`:
  "70+  OVERBOUGHT" (A.stop), "45–65  HEALTHY" (A.buy), "30−  OVERSOLD" (A.trig) — reveal staggered p(0.55..0.78).
- `<Verdict color={A.trig} o={p(0.82,0.9)} text="RSI measures how far, not which way — near the top of its range, wait for a deeper leg."/>`.

## SCENE 2 — RRScene (gt/plan.tsx)  [accent A.main cyan]
NARRATION: reward-to-risk on HAL — risk ~13% to the stop, reward ~9% to the first target, R:R ≈ 3.8;
THEN the honesty: valuation says HAL is ~fairly priced, bull +16%, bear −24%, so +50%/+100% is a
"bull tail, not the base case; the growth is already in the price."

Numbers to embed (HAL): avg ₹4,675 · stop ₹4,090 (−13.2%) · target ₹5,099 (+9.1%) · R:R 3.8 ·
bull +16% · bear −24% · +50% = ₹7,012 · +100% = ₹9,350.

Build:
- Kicker "THE PLAN · WEIGH IT", title "Reward against risk — honestly".
- A horizontal reward/risk bar centered ~y360: a two-sided bar from the avg (center). Left/down = risk
  to stop in ROSE (label "−13.2% · ₹4,090"), right/up = reward to target in CYAN ("+9.1% · ₹5,099").
  Grow each side with a phase. Put a big `R:R 3.8 : 1` chip (hero) using `<Chip hero color={A.buy}>`.
- An "HONESTY" callout Card lower (~x110 y560 w1600 h150), DefBadge "REALITY CHECK" color={A.stop}:
  sans text "Valuation says HAL is already roughly fairly priced. Bull case +16%, bear −24%." reveal p(0.55,0.68).
- Two dim chips for the dream: "+50% = ₹7,012", "+100% = ₹9,350" (color A.muted/violet), reveal p(0.7,0.82).
- `<Verdict color={A.main} o={p(0.83,0.9)} text="A double is a bull tail — a lovely maybe, not the base case."/>`.

## SCENE 3 — SizingScene (gt/plan.tsx)  [accent A.buy green]
NARRATION: one stock a month, budget ₹30–50k, split across the two legs into WHOLE shares; HAL =
4 + 4 = 8 shares, outlay ~₹37,400; a pricey stock (Dixon ₹14k/share) fits only 2–3 shares — size to
the budget.

Build:
- Kicker "THE PLAN · SIZE IT", title "Fit the budget into whole shares".
- A budget "tower/bar" of ₹30–50k that SPLITS into two stacked segments: Leg 1 (4 sh @ ₹4,760 ≈ ₹19,040)
  and Leg 2 (4 sh @ ₹4,560 ≈ ₹18,240). Animate the split with phases. Green.
- Use `<Chip>` row: "BUDGET ₹30–50k", "LEG 1 · 4 sh", "LEG 2 · 4 sh", "TOTAL 8 sh · ₹37,400" (hero).
- A small contrast note card: "Dixon at ₹14,650/share → only 2–3 shares fit." reveal p(0.6,0.72).
- `<Verdict color={A.buy} o={p(0.82,0.9)} text="Size to the budget, not to the ego — round to whole shares."/>`.

## SCENE 4 — ScheduleScene (gt/plan.tsx)  [accent A.main cyan]  props: { rows }
NARRATION: one pick a month for five months — HAL, Dixon, KEI, Syrma, Data Patterns; each with two
legs, a stop and a target, anchored to its own chart; spreading across months is a stagger in time.

`rows` prop shape (from build.py) — each row:
`{ tk, m, cap, sector, color, leg1, leg2, avg, stop, tgt, rr, outlay }` (5 rows).
Default `rows` to the same 5 if prop missing, so QA stills render.

Build a trading-terminal TABLE (this is the payoff scene — make it crisp):
- Kicker "THE PLAN · 5 MONTHS", title "The staggered schedule".
- Header row (MONO caps, muted): MONTH · STOCK · LEG 1 · LEG 2 · AVG · STOP · TARGET · R:R.
- 5 data rows, each revealed p(0.15 + i*0.11, ...), row height ~92, starting y~300, width ~1620 (x=140).
  Left color tab = row.color. Ticker bold; prices in MONO tabular; use `rupee()` from kit.
  Stop cell in ROSE, target cell in CYAN, R:R in green.
- Column x-positions must not overlap — compute widths (skills/09 §3). 8 columns across 1620px.
- `<Verdict color={A.main} o={p(0.82,0.9)} text="One pick a month — spreading the buys across time is itself a stagger."/>`.

## SCENE 5 — KiteScene (gt/plan.tsx)  [accent A.main cyan]
NARRATION: in Kite, open the stock → GTT → Single for each buy leg (trigger+limit, qty); OCO for the
exits (target above, stop below); THREE rules: (1) never buy blind, know your stop first; (2) a GTT
lasts up to a year — review it; (3) it's a plan not a promise, price can gap through a trigger.

Build:
- Kicker "THE PLAN · PLACE IT", title "How it rests in Kite".
- Left: a mock order-ticket panel (a Card styled like a broker ticket) showing:
  "GTT · SINGLE  |  BUY HAL  |  trigger ₹4,775  limit ₹4,760  qty 4" and below
  "GTT · OCO  |  SELL HAL  |  target ₹5,099  ·  stop ₹4,090". MONO, tabular. Reveal p(0.12,0.4).
- Right: three numbered rule cards (stack), each a `<Card>` with a mono number badge + sans rule text,
  revealed p(0.45,0.55), p(0.58,0.68), p(0.7,0.8). Colors: rule1 A.stop (stop first), rule2 A.trig
  (review), rule3 A.main.
- `<Verdict color={A.main} o={p(0.82,0.9)} text="The orders don't predict — they enforce the discipline you set."/>`.

---

## When done
1. `cd composer && npx tsc --noEmit` — clean for gt/rsi.tsx and gt/plan.tsx (ignore unrelated pre-existing errors, but yours must be clean).
2. Write `codex/task-03-RESULT.md`: the two files created, tsc clean (yes/no), and any layout
   decisions you made. Then STOP — Claude will render QA stills and review.
Do NOT run the full render. Do NOT edit build.py.
