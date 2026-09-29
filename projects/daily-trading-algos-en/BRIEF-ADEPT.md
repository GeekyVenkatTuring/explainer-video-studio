# BRIEF — ADEPT REWRITE of "Daily Trading Algorithms" (slower, teach-per-frame)

Rewrite the delivered fast video into the **ADEPT (visible rail) + Feynman** style of
`projects/positional-embeddings` / `composer/src/scenes/PEScenes.tsx`. Same verified facts,
but ONE concept per beat, walked Analogy→Diagram→Example→Plain→Technical, paced SLOW so the
viewer can dwell on each frame. Keep Kokoro af_bella + captions ON, 16:9 1080p30.

New prefix **`da`** · scene set **`composer/src/scenes/DAScenes.tsx`** · build **`build_adept.py`**
in this project folder. Do NOT touch the v1 (`dta`) files or its renders.

## SOURCES (use ONLY these)
- Facts/numbers: `projects/daily-trading-algos-en/RESEARCH.md` (every on-screen figure must match it
  with its scope label; strategy charts are SYNTHETIC/illustrative, never a backtest/history).
- Frame technique to COPY: `composer/src/scenes/PEScenes.tsx` — copy `STAGES`, `TH`, `AdeptRail`,
  `AdeptLedger`, `Teach`, `Tile`, `SceneProgress`, `DividerScene`, `TitleScene`/`HookScene` patterns
  INTO DAScenes and adapt to the trading identity. Keep the gold rail accent `MET=#E9D8A6`.
- Computed-chart functions to PORT from `composer/src/scenes/DTAScenes.tsx`: `price()` candles,
  `sma()`, `std()` (Bollinger), pairs spread/z, `VWAP`, ORB hi/lo + breakout index, cost-drag bars,
  overfit-vs-walkforward curves. These render INSIDE the Teach left panel (see layout).
- Method rules: `skills/02-screenplay.md`, `03-animation.md`, `09-frame-design.md`.

## Identity / palette
Quant-desk dark theme (reuse DTAScenes T/makeTheme). Semantic: cyan data, green buy/long,
rose sell/risk, amber signal, violet exec. ADEPT rail uses gold `MET`. Every scene: `SceneProgress`
bar + continuous motion; teaching scenes always show the `AdeptRail` (top-right) + `AdeptLedger`.

## LAYOUT of a Teach beat (from PEScenes)
- Head (kicker+title) top-left (x100,y54).
- `AdeptRail` top-right (x1140,y66). `AdeptLedger` right column (x1140,y222,w680) — 5 lines, each
  reveals in its stage window (p at 0.2*i+0.02).
- DIAGRAM / children go in the LEFT panel ≈ x100..1050, y230..820. **Port charts must be scaled to
  ~940px wide** (narrower than v1's full-width charts) so they never collide with the ledger.
- `Foot` takeaway reveals ~p(0.86,0.95). Captions ON → keep Foot text short (bottom band).

## PACING (this is the point of the rewrite — SLOWER)
- `ATEMPO=0.92` (was 0.95), `PAUSE=0.65` (was 0.6), `GAP=0.6` (was 0.5).
- Narration walks the 5 ADEPT stages IN ORDER with a `[pause]` at EACH stage boundary (≥4 pauses/
  teaching beat, at the 0.2/0.4/0.6/0.8 marks) so rail + ledger light up in sync.
- One idea per beat. Teaching beats ~90–130 words each (≈45–70s). Target whole video **~16–20 min**;
  prioritise deliberate pace over hitting a number — do NOT pad with jargon.
- Feynman voice: everyday analogy FIRST, short sentences (≤14 words), intuition before the term,
  the technical term LAST. Say-it-and-show-it for every number.

## BEAT LIST (variant → ADEPT ledger A/D/E/P/T + diagram). Dividers & recap parameterised.
1. `da_title` — ADEPT promise + topic. "I'll explain each idea with something you already know, using
   ADEPT — analogy, diagram, example, plain words, then the term." Topic: daily trading algorithms;
   rail teaser row. Education, not advice.
2. `da_hook` — puzzle (no rail): an order hits the exchange in a blink; a human didn't click it — a
   rule did. Tease: by FY24, 12.8% of NSE cash turnover was algo (scope-labelled).
--- PART 1: WHAT A TRADING ALGORITHM IS ---
3. `da_div` n1 "What a Rule Really Does" (cyan)
4. `da_loop` (Teach) — the algo loop.
   A: like a vending machine / recipe — meet the condition, it acts, no emotion.
   D: DATA→SIGNAL→RISK→ORDER→FILL loop. E: "if price crosses the line, buy one lot" once.
   P: a rule that turns data into orders and watches itself. T: algorithmic trading; DMA; the loop.
5. `da_market` (Teach) — not everything fast is an algo.
   A: a highway — self-driving cars (algo), fast-lane-by-the-toll (colo), rented on-ramp (DMA).
   D: bars 12.8% algo vs 34.3% colo (NSE cash FY24) vs ~70% US (IMF). E: a colocated order can still
   be a human's. P: automation, speed, access are three separate choices. T: HFT = latency subset;
   India-wide/HFT share UNVERIFIED (do not state a number).
--- PART 2: THE STRATEGIES (each Teach + its computed synthetic chart, "illustrative" tag) ---
6. `da_div` n2 "The Strategies" (green)
7. `da_momentum` (Teach + candles/SMA cross).
   A: pushing a child on a swing — push when it's already moving your way. D: fast vs slow SMA on
   candles. E: fast crosses above slow → long; below → exit (show computed cross). P: ride a move
   already underway. T: trend/momentum; failure = whipsaw in chop.
8. `da_meanrev` (Teach + Bollinger).
   A: a rubber band — stretch too far, it snaps back. D: bands around a mean, price pokes lower band.
   E: price below band / RSI low → possible bounce. P: bet an extreme returns to average. T: mean
   reversion; failure = a real trend keeps stretching.
9. `da_breakout` (Teach + ORB box).
   A: a coiled spring / water behind a dam. D: opening-range box, breakout bar, stop. E: first window
   hi/lo; break the high → enter, stop below. P: trade the escape from a quiet range. T: opening-range
   breakout; failure = false breakout / gap.
10. `da_vwap` (Teach + VWAP curve + sliced order).
   A: buying a huge order in small sips so you don't spook the market. D: VWAP curve + parent order
   sliced into child orders. E: 1000 lots split into 20 through the day, tracking VWAP. P: this is HOW
   you buy, not WHAT — cutting your footprint. T: VWAP/TWAP execution, not directional alpha.
11. `da_makingarb` (Teach) — market-making + arbitrage (one beat).
   A: a shopkeeper earning bid-ask margin; and buying cheap in one bazaar to sell dearer in another.
   D: bid←fair→ask ladder + cash↔futures. E: quote both sides; cash-futures spread only if it beats
   every cost. P: tiny edges, fierce competition. T: adverse selection; basis/legging risk.
--- PART 3: THE INDIA REALITY ---
12. `da_div` n3 "The India Reality" (amber)
13. `da_sebi` (Teach) — the rulebook.
   A: a driving licence + number plate for your bot. D: rulebook board (4 Feb 2025; all brokers
   1 Apr 2026; 10 OPS/exchange-segment; Algo ID; static IP+OAuth+2FA; broker=principal; white/black
   box→RA; kill switch; ≥5-yr audit). E: ≤10 orders/sec → generic Algo ID; above → register. P: your
   bot must be identified, rate-limited, supervised. T: SEBI retail-algo framework.
14. `da_costs` (Teach + cost-drag bars).
   A: friction/tax on every trade — a leaky bucket. D: gross vs net bars as turnover rises + the
   reality stat. E: STT 0.05%/0.15% + ₹20 brokerage + 18% GST (Zerodha example, not all brokers) eats
   a high-turnover edge. P: automation isn't an edge; costs decide if turnover survives. T: SEBI FY22–24
   study — 93% of 1 cr+ individual F&O traders lost, ₹1.8L cr; scope = F&O traders, not algo users.
--- PART 4: BUILD & RUN ONE ---
15. `da_div` n4 "Build & Run One" (violet)
16. `da_stack` (Teach) — the pipeline.
   A: a factory line with a foreman and an emergency stop. D: data→validate→signal→risk→OMS/RMS→API→
   exchange→fills→monitor→EOD. E: every hand-off observable; kill switch tested. P: code is one part;
   controls make it a system. T: OMS/RMS, reconciliation, kill switch.
17. `da_backtest` (Teach + overfit vs walk-forward curves).
   A: a dress rehearsal vs opening night. D: in-sample (great) vs walk-forward (real) equity curves.
   E: split train/validation/test, model costs, no look-ahead. P: a backtest challenges the idea, it
   doesn't sell it. T: overfitting; survivorship/look-ahead bias.
18. `da_live` (Teach + pseudo-code + alerts).
   A: a pilot's pre-flight checklist before takeoff. D: pseudo-code with risk checks BEFORE send +
   go-live alerts + kill switch. E: check cash/margin/size/daily-loss THEN send the tagged order.
   P: paper-trade first, size small, monitor, be ready to stop. T: pre-trade RMS; the strongest line
   of code prevents a trade.
19. `da_recap` — 6–7 one-liners mirrored on screen + closer + spoken disclaimer + thanks.
   Disclaimer: "Educational information from public sources, not investment advice. Consult a
   SEBI-registered adviser."

## Chapters (render units, SEQUENTIAL @ concurrency 5 — 8GB RAM, no parallel renders)
Group ~ CH1 [1–5] · CH2 [6–8] · CH3 [9–11] · CH4 [12–14] · CH5 [15–19]. build_adept.py emits
per-chapter `artifacts/edit_decisions_adept_chNN.json` (in_seconds + captions restart at 0) and stages
`composer/public/da/chNN.wav`, plus a full master `da/narration.wav` + `edit_decisions_adept.json`.
Print per-chapter + total durations; warn on any beat >90s.

## Gates
tsc clean for da files · every % 2-decimal-exact & scope-labelled per RESEARCH.md · strategy charts
tagged synthetic/illustrative · charts fit LEFT panel (no ledger overlap) · rail+ledger light in sync
with the [pause] stage boundaries · disclaimer in narration + description · QA a still of EVERY scene.
