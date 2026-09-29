# BRIEF — "Daily Trading Algorithms" explainer (build from THIS + RESEARCH.md only)

Slug `daily-trading-algos-en` · Prefix `dta` · Scene set `composer/src/scenes/DTAScenes.tsx`
Voice Kokoro ONNX **af_bella** (offline, direct — like projects/gtt-buying-en/build.py) ·
**Captions ON** · 16:9 1080p30 · target **~22 min** · India-first · Education, NOT advice.

**ONLY use facts from RESEARCH.md.** Every on-screen number must match a RESEARCH.md figure
with its scope label. Do NOT invent numbers. Strategy demos use SYNTHETIC price data and must
carry an on-screen "illustrative · synthetic data" tag — never labeled a backtest or history.

## MUST READ FIRST (Codex)
skills/02-screenplay.md, 03-animation.md, 04-visuals.md, 08-cookbook.md, 09-frame-design.md,
05-tts.md, 06-qa.md, 07-render.md, 12-market-research.md. Model scenes on `reference/FTScenes.tsx`
and existing `composer/src/scenes/GTScenes.tsx` (candlestick + trigger-rail engine) and
`AITScenes.tsx` (AI-trading identity). Build on `composer/src/lib/primitives.tsx`. Copy the
Kokoro-af_bella + captions + per-word-cue build pattern from `projects/gtt-buying-en/build.py`.

## Identity — "The Quant Desk / Signal Terminal"
Dark terminal. Recurring MOTIF = the algo loop, shown/echoed in many scenes:
`DATA → SIGNAL → RISK → ORDER → FILL` (a rail that pulses a packet around the loop).
Semantic colors (mirror in a dta kit): cyan `#38BDF8` data/price/ticks · green `#34D399`
buy/long/profit · rose `#FB7185` sell/short/risk/loss · amber `#FBBF24` signal/caution/regulation
· violet `#A78BFA` execution/infrastructure. Continuous motion every scene (rule 2): marching
tick-stream, pulsing signal node, order routing down the rail, candlestick engine, + a
scene-progress bar at the frame edge.

## COMPUTE THE REAL THING (hard rule 3) — precompute at module scope from deterministic `rnd()`:
- `s01 momentum`: fast SMA(e.g.10) vs slow SMA(e.g.30) on a synthetic price path; mark the
  cross points; buy on golden cross, exit on death cross.
- `s02 mean-reversion`: Bollinger(20,2σ) + RSI(14) on a path; flag band-pokes & RSI<30/>70.
- `s03 pairs`: two correlated synthetic series, compute spread and z-score; trade at |z|>2.
- `s04 breakout (ORB)`: first-window high/low from candles; mark the breakout bar + stop.
- `s05 vwap`: VWAP curve from price×volume; show a big parent order sliced into child orders
  (TWAP even slices) tracking VWAP.
- `r02 costs`: gross vs net equity after N trades applying VERIFIED F&O costs (see below);
  show cost-drag eating returns as turnover rises.
- `b02 backtest`: an equity curve; contrast an overfit in-sample curve vs a flat/worse
  out-of-sample (walk-forward) curve.

## VERIFIED FACTS (from RESEARCH.md — put on screen with the scope label shown)
- **Algo share:** NSE cash-market **12.8%** (FY24, gross turnover). Contrast **~70%** US equities
  (IMF, Oct 2024 — label "US"). Co-location **34.3%** (FY24) is NOT algo — teach the distinction.
  India-wide / BSE / HFT share = **UNVERIFIED** → do not state a number.
- **SEBI retail-algo framework:** circular 4 Feb 2025; **applies to ALL brokers from 1 Apr 2026**.
  Threshold **10 OPS** (orders/sec) per exchange/segment; ≤10 OPS gets a generic **Algo ID**, >10
  OPS must **register** the algo. **Broker = principal, provider = agent.** Access needs a unique
  API key + broker-whitelisted **static IP** + **OAuth + 2FA**; daily API logout. **White-box** =
  disclosed logic; **black-box** = provider must register as **Research Analyst**. Exchange **kill
  switch** per Algo ID; audit trail kept **≥5 years**.
- **Marketing rule (nuanced):** brokers/algo platforms must **not** refer to past or expected
  return of an algo (narrow PaRRVA-verified-metrics exception). Say "no unverified promised/
  expected/past-return marketing" — NOT "all performance talk is banned."
- **Costs (from 1 Apr 2026):** STT futures **0.05%** (sell), options **0.15%** (on premium).
  Zerodha example: futures **0.03% or ₹20/order, lower**; options **₹20/order**; NSE txn charges
  eq-futures **0.00183%**, eq-options **0.03553%** of premium; **GST 18%**. Label "Zerodha example,
  not all brokers."
- **Reality check (SEBI, 23 Sep 2024, FY22–24):** **93%** of **1 crore+** individual equity F&O
  traders lost money; aggregate losses **>₹1.8 lakh crore**; avg loss ~**₹2 lakh**/losing person
  (incl. costs); only **1%** made >₹1 lakh after costs; FY24 avg cost **₹26,000**/person. **97%**
  of FPI and **96%** of proprietary profits (FY24) came from algo trading. Scope: F&O traders,
  NOT "algo users." Automation ≠ edge.
- **Disclaimer** (spoken in recap + in description): "Educational information from public sources,
  not investment advice. Consult a SEBI-registered adviser." No buy/sell calls, no price targets.

## Beat list (variant → visual; narration written per skill 02, ≤2 new terms/min, [pause]s)
Dividers parameterized `dta_divider {n,title,sub,color,pips}`. Recap parameterized.

1. `dta_title` — title card "Daily Trading Algorithms", subtitle "How machines trade — and the
   India reality", identity motif teased. ≤12s.
2. `dta_hook` — cold puzzle: an order hits the exchange; who placed it? A rulebook a computer
   follows without emotion. Tease: by FY24, 12.8% of NSE cash turnover was algo — and what that
   does/doesn't mean.
--- PART 1: WHAT AN ALGORITHM ACTUALLY DOES ---
3. `dta_divider` n1 "The Anatomy" cyan
4. `dta_anatomy` — establish the loop DATA→SIGNAL→RISK→ORDER→FILL; a packet travels it.
5. `dta_algomarket` — algo vs HFT vs DMA vs colo; the 12.8% (NSE cash FY24) vs colo 34.3% vs US
   ~70%; latency/co-location explained. Careful scope labels.
6. `dta_taxonomy` — the menu of 6 strategy families (momentum, mean-reversion, breakout,
   VWAP/TWAP execution, market-making, arbitrage) as a selectable board; "each is just a rule".
--- PART 2: THE STRATEGIES (each computed, illustrative·synthetic) ---
7. `dta_divider` n2 "The Strategies" green
8. `dta_momentum` — MA crossover computed; golden/death cross; failure = whipsaw in chop.
9. `dta_meanrev` — Bollinger + RSI computed; buy oversold/revert; failure = trend/break.
10. `dta_pairs` — spread + z-score on two names; long/short at |z|>2; failure = relationship breaks.
11. `dta_breakout` — ORB: opening range hi/lo, breakout bar, stop; failure = false breakout/gap.
12. `dta_vwap` — VWAP/TWAP execution: slice a big order to cut market impact/slippage (execution,
    not alpha).
13. `dta_making` — market making (quote both sides, earn spread, manage inventory; adverse
    selection) + arbitrage (cash–futures lock a spread only if costs covered). Split into two if crowded.
--- PART 3: THE INDIA REALITY ---
14. `dta_divider` n3 "The India Reality" amber
15. `dta_sebi` — the SEBI/NSE retail-algo rulebook board (10 OPS, Algo ID, static IP+2FA,
    broker=principal, white/black box→RA, kill switch, 5-yr audit, 1 Apr 2026). Timeline strip.
16. `dta_costs` — computed cost-drag: gross vs net as turnover rises, using verified F&O costs;
    "slippage decides whether high-turnover survives."
17. `dta_reality` — the SEBI F&O-loss numbers (93% / ₹1.8 lakh cr / 1% / ₹26k); myths busted
    (automated≠profitable, backtest≠live, retail API≠HFT, no promised returns). Micro-recap of Part 3.
--- PART 4: BUILD & RUN ONE ---
18. `dta_divider` n4 "Build & Run One" violet
19. `dta_stack` — the real pipeline: data→validate→signal→risk→OMS/RMS→broker API→exchange→
    fills→monitor/kill→EOD review (the loop, expanded, mapped to real components + SEBI controls).
20. `dta_backtest` — backtesting done right: train/validation/test, no look-ahead/survivorship,
    model costs; the overfit vs walk-forward equity curves.
21. `dta_code` — signal→order as clear pseudo-code (MA-cross bot) with pre-trade RISK CHECKS
    (cash/margin cap, max order size, daily loss limit) BEFORE the order sends.
22. `dta_live` — going live: paper-trade first, position sizing, kill-switch, monitoring/alerts
    (stale feed, rejected/duplicate order, latency spike, daily loss). Discipline > code.
23. `dta_rules` — golden rules + top mistakes (overfitting, ignoring costs, no monitoring,
    over-leverage, promised-return providers = red flag).
24. `dta_recap` — 7 one-line items mirrored on screen + closer + spoken disclaimer + thanks.

## Chapters (render units — SEQUENTIAL, concurrency ~5; only 8GB RAM, do NOT parallelize renders)
CH1 = beats 1–4 · CH2 = 5–6 · CH3 = 7–9 · CH4 = 10–11 · CH5 = 12–13 · CH6 = 14–17 ·
CH7 = 18–20 · CH8 = 21–24. build.py emits per-chapter `edit_decisions_chNN.json` + stages each
chapter's narration to `composer/public/dta/chNN.wav`; render each Explainer with that chapter's
props; ffmpeg-concat the 8 MP4s into the master. Keep a single-master JSON option too.

## Honesty gate before render (skill 12 §6): every % 2-decimal-exact & matches RESEARCH.md scope
label; strategy demos tagged synthetic/illustrative; disclaimer in narration+description;
no buy/sell calls. tsc clean for dta files. QA a still of EVERY scene and fix before final.
