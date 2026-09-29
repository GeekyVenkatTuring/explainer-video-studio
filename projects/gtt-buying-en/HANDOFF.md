# HANDOFF — "GTT Buy-Schedule, Explained" video (fresh session)

You are starting fresh. This file is the complete brief — everything you need is embedded here
(the previous session's scratchpad is gone). Build a **comprehensive English explainer video** that
teaches a beginner what a **GTT** is, what a **staggered GTT buy-schedule** is, **how it was
designed**, and reprises the **RSI** lesson. The user does not know what GTT is — teach from zero.

---

## 0. First actions in the new session (do these before designing)

1. Read the explainer-forge contract: `CLAUDE.md`, then the MANDATORY skills it names —
   `skills/01-pipeline.md`, `02-screenplay.md`, `03-animation.md`, `04-visuals.md`,
   `08-cookbook.md`, `09-frame-design.md`, then `05-tts.md`, `06-qa.md`, `07-render.md`.
2. **STUDY the gold references before writing any scene** — `reference/FTScenes*`,
   `reference/CVShared*`, `reference/CVScenes*`, and `REVIEW.md`. These are the visual quality bar.
3. Read the skill `~/.claude/skills/stock-pick-research/SKILL.md` — it explains the derivation logic
   behind the schedule (funnel, 4-pillar score, GTT plan). Scripts in that skill's `scripts/gtt.py`
   are the exact schedule generator.
4. Look at the previous video's scenes `composer/src/scenes/fq/*` (esp. `pickdetail.tsx`, `tech.tsx`)
   as the **baseline to EXCEED — do not copy its look.** See §6 on graphics.

---

## 1. Video requirements (hard)

- **Topic depth:** comprehensive. Length is open — 20, 30, 60 min, whatever it takes to make the
  user *understand*. Do not compress; over-explain, with worked examples and real numbers.
- **Subtitles ON** — burned-in captions (proportional `beat_cues`; caption band at bottom, keep
  scene content y ≤ ~864). Same captions system as the `fq` video.
- **Voice:** **Kokoro ONNX, `af_bella`** (NOT Voicebox, NOT af_nova). Offline direct inference.
  Config (copy from `projects/quant-finance-en/build.py`):
  `KOKORO_MODEL=~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx`,
  `KOKORO_VOICES=~/.cache/hyperframes/tts/voices/voices-v1.0.bin`, `VOICE="af_bella"`,
  GAP=0.5, PAUSE=0.6, ATEMPO=0.95. Run build.py with `projects/midcap5-picks-en/.venv/bin/python3`.
- **Defaults:** 16:9 1080p 30fps, no music. Determinism (no `Math.random`, use `rnd`); no CSS filter.
- **Improve the visual graphics** (see §6) — this is a REPEATED user ask; the last two videos still
  felt "the same as past videos." This one must visibly level up.
- **Use the Codex agent for a lot of the work** (build.py TTS, QA stills, render, deliver, and
  parallel scene-building) via the `cmux` skill. Claude orchestrates + owns design quality + numbers.
- Suggested project slug `projects/gtt-buying-en/` (this dir), scene prefix **`gt`** (register
  `gt: GTScene` in `composer/src/Explainer.tsx` REGISTRY; scene file
  `composer/src/scenes/GTScenes.tsx` or a `gt/` folder like `fq/`).
- Deliver to `~/Downloads/generated_videos/gtt-buy-schedule-explained.mp4`.
- **Disclaimer:** educational, NOT investment advice. Never place/modify live GTT orders in Kite from
  the video build. The numbers below are illustrative of a real Aug-2026 analysis.

---

## 2. CORE CONTENT — what a GTT is (teach from zero)

**GTT = Good Till Triggered.** It is a Zerodha Kite order *type*.
- A **normal order** is valid only for the current trading day; if it doesn't execute, it dies at
  close. A **GTT** is a *resting instruction* that stays alive for **up to 1 year**. It sits
  dormant and does nothing until the market price reaches a **trigger price** you set; then it
  automatically **places** your buy (or sell) order. "Good till triggered" = it waits, patiently,
  until your condition is met.
- Mechanics: you set a **trigger price** and the actual **limit price** of the order it will place.
  When last-traded-price crosses the trigger, Kite submits the limit order. (Trigger is usually a few
  rupees above your limit for a buy, so the order is marketable when it fires.)
- **Two GTT types:** **Single** (one trigger → one order) and **OCO = One-Cancels-the-Other**
  (two triggers on the same holding — typically a **target** above and a **stop-loss** below; when
  one fires, the other auto-cancels). OCO is how you bracket a position for exit.
- **Why it matters:** it lets you **plan entries and exits in advance**, so decisions are made calmly
  — not in the heat of a moving market. You don't have to watch the screen.
- Teach the contrast visually: Market order (buy now, any price) vs Limit order (buy at/below X,
  today only) vs **GTT** (buy at/below X, waits up to a year).

---

## 3. CORE CONTENT — the staggered GTT **buy-schedule** (the method)

The user asked specifically: *what is this, and how did you come up with the format?* Explain the
reasoning, step by step:

**The problem it solves.** Buying a whole position at once, at today's price, is a bet on one moment.
If it dips right after, you feel it fully and you have no dry powder. So instead of one market buy,
we **stagger the entry into two legs placed BELOW the current price**, average in on dips, and
protect the whole thing with a stop — all pre-placed as GTTs.

**How each number is derived (the format):**
1. **Anchor to real technicals.** Pull 15 months of daily closes from Kite; compute the **50-DMA**
   and **200-DMA** (support levels) and RSI. Entries hang off these, not round guesses.
2. **Leg 1 (shallow dip, ~1.5–3% below price):** a normal pullback, often a retest of the **50-DMA**.
   You buy the first tranche here.
3. **Leg 2 (deeper dip, ~6–10% below price):** a more serious correction, near the 50-DMA or toward
   the **200-DMA** / a prior swing low. You buy the second tranche here at a better price.
4. **Average entry** = quantity-weighted average of the two legs. Splitting the buy lowers your
   average cost if the dip comes, and guarantees you're not all-in at the top.
5. **Stop-loss (OCO sell):** placed *below* Leg 2 / under the 200-DMA, sized so the **max loss from
   your average entry is bounded (~10–20%)**. If the thesis breaks, it sells automatically.
6. **Target (OCO sell):** the **52-week high / reclaim level** (or next resistance) — the first
   objective. Also show the price needed for +50% / +100% so the aggressive goal is honest.
7. **Position sizing:** split the **monthly budget (₹30–50k)** across the two legs → integer share
   quantities. One pick per month over 5 months.
8. **Reward:Risk (R:R):** reward to target vs risk to stop; and separately reconcile with the
   valuation lens (bull÷bear vs fair value). Say honestly when a name is "priced for growth" — the
   schedule R:R looks great but the valuation says it's roughly fair (the +50–100% is a bull tail,
   not a base case).
9. **Discipline notes per stock:** e.g. don't chase names sitting at their highs — let Leg-2 fill
   only on a real correction, else roll forward.

**Key teaching point:** a GTT buy-schedule turns "should I buy now?" into a pre-committed plan:
*where* to buy (two dips), *how much* (budget-sized legs), *when to quit* (stop), *where you're
aiming* (target) — all resting in the market so emotion never gets a vote.

---

## 4. THE REAL DATA (embed these — illustrative, Aug-2026, from live Kite + Screener)

Budget ~₹30–50k/month, one pick/month for 5 months. Averages/stops/targets are quantity-weighted.
Use these exact numbers in the worked examples (they match the published artifact & Obsidian note).

### HAL — Month 1 · Large-cap · Defence (aircraft)
LTP ₹4,861.1 · 50-DMA ₹4,652.9 · 200-DMA ₹4,383 · 52w-high ₹5,099
- Leg 1: buy ₹4,760 (trigger ₹4,775), qty 4 — dip −1.8%
- Leg 2: buy ₹4,560 (trigger ₹4,575), qty 4 — dip −5.9%
- Avg entry ₹4,675 · total 8 sh · outlay ₹37,400
- STOP ₹4,090 (trig ₹4,060) → risk 13.2% ≈ ₹4,920 · dip −16.5%
- TARGET ₹5,099 → reward 9.1% · R:R 3.8 · +50% = ₹7,012 · +100% = ₹9,350
- Note: Above 50-DMA; both legs are normal pullbacks. High conviction — OK to buy Leg-1 at market.

### DIXON — Month 2 · Mid/Large-cap · EMS
LTP ₹14,650 · 50-DMA ₹13,689 · 200-DMA ₹12,230 · 52w-high ₹18,177
- Leg 1: buy ₹14,300 (trig ₹14,360), qty 1 — dip −2.0%
- Leg 2: buy ₹13,700 (trig ₹13,760), qty 2 — dip −6.1%
- Avg entry ₹13,960 · total 3 sh · outlay ₹41,880
- STOP ₹12,100 (trig ₹12,000) → risk 14.0% ≈ ₹5,880 · dip −18.1%
- TARGET ₹18,177 → reward 30.2% · R:R 3.6 · +50% = ₹20,940 · +100% = ₹27,920
- Note: ₹14.6k/share — only 2–3 shares fit. Leg-2 sits on the 50-DMA; deep support is the 200-DMA.

### KEI — Month 3 · Mid-cap · Cables/electrification
LTP ₹5,570 · 50-DMA ₹5,324 · 200-DMA ₹4,749 · 52w-high ₹5,873
- Leg 1: buy ₹5,420 (trig ₹5,445), qty 4 — dip −2.2%
- Leg 2: buy ₹5,150 (trig ₹5,175), qty 4 — dip −7.1%
- Avg entry ₹5,310 · total 8 sh · outlay ₹42,480
- STOP ₹4,780 (trig ₹4,750) → risk 10.5% ≈ ₹4,480 · dip −14.7%
- TARGET ₹5,873 → reward 10.6% · R:R 4.7 · +50% = ₹7,965 · +100% = ₹10,620
- Note: Near a breakout; Leg-1 buys the 50-DMA retest, Leg-2 a deeper dip. Stop just under 200-DMA.

### SYRMA — Month 4 · Small-cap · EMS (diversified)
LTP ₹1,474.3 · 50-DMA ₹1,411 · 200-DMA ₹1,008 · 52w-high ₹1,516.4
- Leg 1: buy ₹1,420 (trig ₹1,428), qty 14 — dip −3.1%
- Leg 2: buy ₹1,320 (trig ₹1,328), qty 15 — dip −9.9%
- Avg entry ₹1,376.3 · total 29 sh · outlay ₹39,912
- STOP ₹1,190 (trig ₹1,180) → risk 14.3% ≈ ₹5,692 · dip −20.0%
- TARGET ₹1,516.4 → reward 10.2% · R:R 3.5 · +50% = ₹2,064 · +100% = ₹2,753
- Note: Extended (at 52-wk high, 95% of range). BE PATIENT — Leg-2 may fill only on a real
  correction; if only Leg-1 fills, roll the rest forward. Do NOT chase at highs. (Great "discipline" scene.)

### DATAPATTNS — Month 5 · Small-cap · Defence electronics
LTP ₹4,624.8 · 50-DMA ₹4,498 · 200-DMA ₹3,543 · 52w-high ₹4,866
- Leg 1: buy ₹4,480 (trig ₹4,505), qty 4 — dip −2.6%
- Leg 2: buy ₹4,200 (trig ₹4,225), qty 5 — dip −8.6%
- Avg entry ₹4,349.4 · total 9 sh · outlay ₹39,145
- STOP ₹3,920 (trig ₹3,890) → risk 10.6% ≈ ₹4,135 · dip −15.9%
- TARGET ₹4,866 → reward 11.9% · R:R 4.7 · +50% = ₹6,524 · +100% = ₹8,699
- Note: Highest volatility (54%). Size smallest / stagger most. Leg-1 on the 50-DMA, Leg-2 a
  sharp-dip catcher.

Use **HAL as the primary worked example** (clean, above 50-DMA) and **SYRMA as the "discipline /
don't chase" example** (extended at highs).

---

## 5. CORE CONTENT — RSI reprise (user asked to include it again)

Reteach RSI exactly as the last video did, and compute it live on a price series (don't draw a
static picture — see `composer/src/scenes/fq/tech.tsx` for the live-RSI computation to reuse):

- **RSI = Relative Strength Index**, a momentum oscillator from **0 to 100**.
- It **compares the size of recent gains to recent losses** over a lookback (default **14** periods):
  `RS = avg gain / avg loss`, `RSI = 100 − 100/(1 + RS)`. Show this formula on screen.
- **> 70 = overbought** (run hot, may pause). **< 30 = oversold** (beaten down, may bounce).
  **45–65 = a healthy, sustainable trend.**
- RSI does **not** tell you *direction* — it tells you whether a move has gone **too far**.
- Tie it back to the schedule: RSI helps decide *whether to chase* — a name with RSI near the top of
  its range (e.g. SYRMA) argues for patience and deeper legs; a mid-band RSI (HAL ~53) is calmer.

---

## 6. IMPROVE THE VISUAL GRAPHICS — concrete direction (do not skip)

The user has asked twice for better visuals and still finds them same-y. Generic `Card` + `StatChip`
grids are the problem. This video's subject (charts, price, orders) is inherently visual — build
**bespoke, animated, computed** scene visuals, not text cards. Specifics:

- **A real animated candlestick / price chart as the recurring centerpiece.** Precompute a
  deterministic daily OHLC series at module scope; draw candles (wicks + bodies, green/red) with
  `rnd`-seeded variation. The chart is the stage, cards are annotations on it.
- **The GTT mechanic, shown literally:** draw the price as a **live marker that descends** into
  horizontal **trigger rails** (Leg-1, Leg-2, Stop, Target). When the price crosses a rail, **fire
  it** — pulse/flash the rail, pop an **order-ticket** ("BUY 4 @ ₹4,760 ✓"), and **accumulate filled
  quantity in a counter**. This single animation teaches "good till *triggered*" better than any card.
- **An order-book / price-ladder visual** (depth-ladder style) with resting GTT orders that light up
  when hit — a "trading terminal" feel.
- **OCO bracket:** show target-above / stop-below as a bracket around the entry, with the
  one-cancels-other behaviour animated (one fires → the other greys out).
- **RSI oscillator panel** computed on the SAME series, with a moving line, 30/70 bands shaded, and a
  marker that tracks in sync with the price chart.
- **Continuous motion in every frame** (rule 2): the price path draws on, candles stream, the RSI
  line advances, a scene-progress bar fills. No frozen frames.
- **A distinct visual identity from the `fq` video:** commit to a **"trading terminal"** look — near-
  black terminal ground, monospace tickers, a subtle grid, semantic colors (buy=green, stop/risk=red,
  target=blue/teal, trigger=amber). Recurring motif = the candlestick + the trigger rail.
- Prefer **SVG/Canvas bespoke drawing** over stacking primitive components. Reach into
  `lib/primitives.tsx` for the engine (useP, Flow, Wire, Counter, rnd, makeTheme) but author the
  chart/ladder/oscillator as custom scene code. Match the richness of `reference/FTScenes`.
- **QA every scene still** (rule 5) before the final render; have Codex render mid + late stills of
  each scene, review overlaps/fit/caption-band, fix, re-still. Never ship unseen scenes.

---

## 7. Suggested beat list (adapt after reading the skills)

1. Cold-open hook: "You found a stock. Now — how do you actually buy it well?"
2. Market vs Limit vs GTT (the order-type ladder).
3. What GTT stands for + the resting-order mechanic (trigger → order), up to 1 year.
4. Single vs OCO (target + stop, one-cancels-other).
5. Why stagger: buying-all-at-once vs averaging into dips (the core idea).
6. Anchoring to technicals: 50-DMA / 200-DMA as where legs live (+ compute them on a chart).
7. **RSI** (full reprise, §5) — momentum / when not to chase.
8. Leg 1 + Leg 2 derivation (shallow vs deep dip) — animated on the chart.
9. The stop-loss (bounded max loss) and the target (52w-high; +50%/+100% honesty).
10. Reward:Risk + "priced for growth" honesty (double = bull tail).
11. Position sizing to the monthly budget → integer quantities.
12. **Worked example: HAL** end-to-end (all rails fire on the chart).
13. **Discipline example: SYRMA** — extended at highs, be patient, roll forward.
14. The full 5-month schedule overview (one pick/month, the table).
15. How to place it in Kite (conceptually) + the safety rules (never blind, always a stop).
16. Recap + disclaimer (not advice).

---

## 8. Pipeline quick-reference

- Scenes on `composer/src/lib/primitives.tsx`; register prefix `gt` in `Explainer.tsx` REGISTRY.
- Screenplay + TTS in `projects/gtt-buying-en/build.py` (copy from
  `projects/quant-finance-en/build.py` — it already has the Kokoro af_bella + captions setup).
- Build: `projects/midcap5-picks-en/.venv/bin/python3 projects/gtt-buying-en/build.py`
- Typecheck: `cd composer && npx tsc --noEmit`
- Render (captions burned via `captions` cues in props):
  `cd composer && npx remotion render Explainer ../projects/gtt-buying-en/renders/final.mp4
  --props=../projects/gtt-buying-en/artifacts/edit_decisions.json --concurrency=8`
- Verify with ffprobe + extracted frames; deliver to
  `~/Downloads/generated_videos/gtt-buy-schedule-explained.mp4`.
- Multi-agent: use the `cmux` skill; only Claude runs Kite (not needed here — data is embedded above);
  hand parallel scene-building + the render to Codex. Watch agent usage limits.

## 9. Related persistent resources (survive the session)
- Skill: `~/.claude/skills/stock-pick-research/` (SKILL.md + scripts/gtt.py = schedule generator).
- Obsidian: `~/Documents/Claude Docs/Finance/Kite Portfolio Analysis & 5-Pick Research — Aug 2026.md`
  (Part 3 = the GTT schedule; Part 4 = bull/bear valuation).
- Prior video (visual baseline to EXCEED): `composer/src/scenes/fq/` + `projects/quant-finance-en/`.
- Memory: `five-to-add-stock-picks`, `portfolio-quant-desk`, `quant-finance-video`,
  `market-data-tool-unreliable`.
