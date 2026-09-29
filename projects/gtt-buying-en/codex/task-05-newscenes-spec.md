# Codex Task 05 — 3 new scenes (expansion beats)

Add 3 scenes to the files you already own. Do NOT touch kit.tsx, GTScenes.tsx, or Claude's
files (core/gtt/chart/worked). The router already imports these exact export names.

## STEP 0 (do FIRST) — regenerate narration for the 5 new beats
Claude added 5 new segments to build.py. Re-run it (idempotent — only new WAVs generate):
`projects/midcap5-picks-en/.venv/bin/python3 projects/gtt-buying-en/build.py`
It should now print ~28 scenes and update artifacts/edit_decisions.json. THEN build the 3 scenes
below (the render/stills need both the new cuts AND the new scene components).

Reuse the SAME kit primitives, phasing, chrome (SceneProgress, GTHead, Verdict), caption-safe
y≤900, and look you built in rsi.tsx / plan.tsx. Match that quality. `cd composer && npx tsc
--noEmit` must be clean for your files when done.

## SCENE A — add `RSIReadScene` to gt/rsi.tsx   [accent A.trig amber]
`export const RSIReadScene: React.FC<{ dur?: number }>` returning `<Stage>`.
NARRATION: HAL's RSI ≈ 53 sits in the calm, healthy middle → buying leg 1 near the price is
reasonable. Syrma's RSI is hot, near the top of its range → the move is stretched, wait for a
deeper leg. Same tool, opposite message; RSI paces your entry, it doesn't pick the stock.

Build: kicker "ANCHORS · RSI IN PRACTICE", title "Same tool, opposite message". TWO horizontal
0–100 RSI meters stacked (one per stock), each ~640px wide:
- draw a rounded track 0→100 with a red zone ≥70, green zone ≤30, and a subtle "45–65 healthy"
  middle band; a marker dot + value label at the RSI value.
- HAL meter: value 53, a green `<Chip>` verdict "STEP IN — calm middle". reveal p(0.2,0.5).
- SYRMA meter: value 66 (hot), a rose `<Chip>` verdict "WAIT — stretched, near the top". reveal p(0.5,0.75).
- label each meter with the ticker (MONO).
- `<Verdict color={A.trig} o={p(0.82,0.9)} text="RSI doesn't pick the stock — it paces your entry."/>`.

## SCENE B — add `ValuationScene` to gt/plan.tsx   [accent A.d200 violet]
`export const ValuationScene: React.FC<{ dur?: number }>`.
NARRATION: imagine three futures — bear (disappoints), base (middle), bull (all goes right).
For each, multiply a fair P/E by expected profit, then weight by likelihood. For HAL the weighted
value lands ~today's price. Bull +16%, bear −24%. So the schedule's R:R looks great but valuation
says the name is roughly fair — both true, hold them together.

Numbers: today ₹4,861 · BEAR −24% (₹3,694) · BASE ≈ fair (₹4,861) · BULL +16% (₹5,639) ·
weighted value ≈ ₹4,861 (today).
Build: kicker "THE PLAN · VALUE IT HONESTLY", title "Three futures, one weighted value".
- Three vertical bars/columns labelled BEAR / BASE / BULL at their price levels around a horizontal
  "today ₹4,861" reference line; BEAR rose, BASE muted, BULL cyan. Grow each with a phase; put the
  % and ₹ under each. Show a "WEIGHTED ≈ ₹4,861 · today" hero `<Chip>` (violet A.d200).
- A reconcile note card: "R:R looks great; valuation says fair. Both are true." reveal p(0.6,0.72).
- `<Verdict color={A.d200} o={p(0.82,0.9)} text="The growth is already in the price — a double is the bull tail, not the base case."/>`.

## SCENE C — add `MistakesScene` to gt/plan.tsx   [accent A.stop rose]
`export const MistakesScene: React.FC<{ dur?: number }>`.
NARRATION: four ways it goes wrong — (1) a GAP: price leaps past your trigger, you fill lower; the
plan bounds risk, can't erase it; (2) STOP TOO TIGHT: normal noise knocks you out — give it room
below real support; (3) CHASING: patience is the point, don't buy the top; (4) NEVER REVIEWING: a
GTT lives a year, check it. Avoid these four and the method does its job.

Build: kicker "THE PLAN · WHAT GOES WRONG", title "Four ways this plan breaks". A 2×2 grid of
`<Card>` (x = 130 / 990, w = 790, y = 250 / 530, h ~ 230), each with a MONO number badge + a bold
title + one plain sentence:
  1 GAP RISK (A.trig) — "Bad news can leap the price straight past your trigger. Risk is bounded, not erased."
  2 STOP TOO TIGHT (A.stop) — "Set just under the price, normal noise stops you out. Give it room, below real support."
  3 CHASING (A.trig) — "Cancel the wait and buy the top, and you've thrown the plan away."
  4 NO REVIEW (A.main) — "A GTT lives for a year — revisit it; companies and prices change."
- one continuous-motion element (a Flow along the bottom, or sine glow on the hero card).
- `<Verdict color={A.stop} o={p(0.82,0.9)} text="Avoid these four, and the orders quietly do their job."/>`.

## When done
`cd composer && npx tsc --noEmit` clean for your files. Then render QA stills for JUST the 3 new
scenes: `projects/midcap5-picks-en/.venv/bin/python3 projects/gtt-buying-en/codex/qa_stills.py a2b a5b k1b`
(the ids are gt_rsiread=a2b, gt_valuation=a5b, gt_mistakes=k1b). Confirm 3 PNGs render without error,
then write codex/task-05-RESULT.md. Do NOT run the full render.
