# VIDEO SPEC — "Reading a Stock Portfolio Like a Quant, From Scratch" (prefix `fq`)

An educational explainer that TEACHES fundamental + technical analysis from zero
(definition → formula → worked example), using a real ₹59k Zerodha portfolio and a
5-stock pick list as the running examples. 16:9 1080p30, Kokoro af_bella voice,
burned-in captions ON. Multi-chapter → master.

**Pedagogy rule (non-negotiable):** assume the viewer has never heard of P/E, ROE, RSI,
etc. For every concept: (1) NAME it, (2) one plain-English DEFINITION, (3) the FORMULA
shown on screen, (4) a WORKED EXAMPLE with a real number from the data below. No jargon
without immediate plain-English.

---

## 1. Build contract (read before writing a scene)

- Each scene is `const XScene: React.FC<{ dur?: number }> = ({ dur }) => { const p = useP(dur); … }`.
- Import identity + helpers from `./kit`, primitives from `../../lib/primitives`.
- Return a `<Stage>…</Stage>` (content scenes) — do NOT add your own `<Bg>`; the router adds it.
- Author on the **1920×1080 Stage**. Everything phases with `p(a,b)` fractions of the beat
  (skills/03) — NEVER fixed frame numbers. Last reveal lands at p≈0.8–0.9.
- Add `<SceneProgress p={p} color={ACCENT} />` once per content scene (top-edge bar).
- Add ≥1 continuous-motion layer (Flow / Wire dash-march / sin-glow / chase / a live counter).
- **Captions are ON** → the bottom band (y≳1000) is occupied. Do NOT use `<Foot>`; put the
  takeaway in-content at y ≤ 880. Keep all content y ≤ 900.
- Determinism: only `rnd(i,j,s)` — never `Math.random()`. No CSS `filter`/`backdrop-filter`.
- After writing your file, run `cd composer && npx tsc --noEmit` and fix errors IN YOUR FILE.
- Add a `// NARRATION:` comment above each scene with a 2–4 sentence beginner script
  (define → formula → example) — Claude harvests these into the master screenplay.

## 2. Identity (from `./kit`)

- `T` = theme (dark navy). `A` = semantic accents:
  - `A.fund` green = fundamentals / quality / "good"
  - `A.tech` amber = technicals / momentum / caution
  - `A.val`  violet = valuation / models / targets
  - `A.risk` rose = risk / loss / concentration / "bad"
  - `A.main` blue = structure / neutral
- Helpers in `./kit`: `SceneProgress`, `DefBadge` (label pill), `Formula` (parts:[text,color?][]),
  `StatChip` (label+value), `TickStrip` (candlestick ambience). `mix, MONO, SANS` re-exported.
- Primitives (`../../lib/primitives`): `Stage, Head, Card, Wire, Flow, Counter, Type, PixGrid,
  Brackets, ScanBeam, Kicker, useP, usePop, rnd, mix, MONO, SANS`.

## 3. Frame zones & typography (skills/09 — enforced at QA)

- Header via `<Head theme={T} kicker="…" title="…" color={ACCENT} o={p(0,0.06)} />` (kicker ≤40, title ≤55 chars).
- Content lives y 200→900, x 100→1820 (usable width 1720). Nothing crosses y>900.
- Type sizes: Head title 52 · section head 30–40 · body 26–30 · mono labels 21–26 · min 19.
- ONE hero element per frame. Width-budget every text block (SANS ≈0.5×size/char, MONO ≈0.6×).
- Column grids: 2-col x=130/990 w=790 · 3-col x=140+i·560 w=520.
- Overlap checklist per scene (skills/09 §9): every text has a width; stacked y computed;
  x+w≤1820, y+h≤900; animated growth checked at final size; moving paths cleared.

## 4. The DATA (verified — use EXACT numbers; skills/12 gate)

Portfolio (Kite 28-Aug-2026): value ₹59,405, +₹3,837 (+6.9%). **ARDEE 59.7% of the book**
(a recycler that IPO'd 12-Aug-2026), effective ≈2.46 independent stocks.
- HDFCBANK: price ₹720, P/E 14.0, P/B 1.85, ROE 13.6%, ROCE 7.0%, div yield 1.8%, D/E low.
- RELIANCE: ₹1,287, below 200-DMA (₹1,396), RSI 42.9, 52-wk pos 8%, beta 0.94.
- INFY: P/E 14.9, ROE 31.9%, div yield 4.2%, net cash.

Teaching numbers:
- P/E worked example: HDFCBANK ₹720 ÷ EPS ₹51.4 ≈ **14×** ("pay ₹14 for ₹1 of yearly profit → ~14 yrs to earn back").
- P/B: price ₹720 ÷ book ₹390 ≈ **1.85×**.
- ROE example: INFY profit ÷ equity ≈ **32%** (₹32 profit a year on every ₹100 of owners' capital).
- Growth/PEG: DIXON profit CAGR 77%, P/E 47.7 → PEG ≈ 0.6 (<1 = cheap for the growth).

5 picks (score / P/E / ROE): HAL 83 / 34.9 / 24 · DIXON 80 / 47.7 / 37 · KEI 71 / 53.4 / 15 ·
SYRMA 73 / 76.5 / 14 · DATAPATTNS 70 / 95.8 / 15.

Funnel: ~2,000 NSE → ~400 liquid → ~120 tailwind-sector → ~40 growth → **23** shortlist → **5** picks.

Valuation (bear/base/bull fair value vs price): HAL 3,718 / 4,758 / 5,651 (now 4,861) ·
DIXON 10,096 / 13,767 / 16,520 (now 14,650). Base case ≈ flat; bull +13–22%; bear −24–31%.

GTT: stagger 2 buy legs on dips + a stop-loss. Example HAL: buy 4,760 & 4,560, stop 4,090.

## 5. Scene list & OWNERSHIP

### CORE — Claude — `fq/core.tsx`
- `fq_title` · `fq_lenses` (FA asks "is the business good & fairly priced?" vs TA asks
  "what is the price doing?") · `fq_divider` (params n,title,sub,color) · `fq_recap` (params items,closer)

### FUNDAMENTALS — **CURSOR** — `fq/fund.tsx` (green A.fund accent)
Teach, each from scratch, define→formula→example:
1. `fq_share` — what a share is; **Market cap = price × number of shares**; small/mid/large-cap.
2. `fq_pe` — EPS (profit per share) → **P/E = Price ÷ EPS**; "years to earn it back"; cheap vs dear (HDFCBANK 14× vs a 70× growth stock). A visual counter of "₹ paid per ₹1 profit".
3. `fq_pb` — book value → **P/B = Price ÷ Book value**; <1 below net worth (banks).
4. `fq_roe` — **ROE = Profit ÷ Shareholders' equity** (and ROCE); the compounding engine —
   show ₹100 growing at 32%/yr (INFY) as a rising stack; high ROE = better compounder.
5. `fq_debt` — **Debt ÷ Equity** (balance-sheet risk), promoter holding (skin in the game),
   dividend yield (cash while you hold). A little dashboard of 3 gauges.
6. `fq_growth` — sales & profit growth (CAGR) + **PEG = P/E ÷ growth%** (a dear P/E can be cheap
   if growth is high — DIXON 47× but PEG ~0.6).
7. `fq_apply_fa` — read HDFCBANK end-to-end through all 6 metrics → verdict "cheap, quality".

### TECHNICALS — **CODEX** — `fq/tech.tsx` (amber A.tech accent)
Use a real precomputed price series (module-scope array) and COMPUTE the indicators live:
1. `fq_chart` — price & returns; a line/candle chart drawn progressively; "% change over 1M/6M/1Y".
2. `fq_dma` — **moving average = average of the last N closing prices**; draw 50-DMA & 200-DMA
   over the price line (compute them from the series); trend = price above/below the 200-DMA.
3. `fq_rsi` — **RSI = momentum, 0–100**; >70 overbought, <30 oversold, 45–65 healthy; a live
   dial/gauge sweeping to the value; one-line on how it's computed (avg gains vs avg losses).
4. `fq_volbeta` — **volatility** (how much daily returns swing, σ×√252) + **beta** (vs Nifty:
   β 1 moves with market, >1 amplifies) + **max drawdown** (worst peak-to-trough fall).
5. `fq_52w` — **52-week range**; a track with low↔high and a marker for where price sits (%).
6. `fq_apply_ta` — read RELIANCE: below 200-DMA, RSI 43, 8% of its 52-wk range, beta 0.94 → "weak tape, but cheap".

**CODEX also**: after building tech.tsx, append suggested narration as `// NARRATION:` comments
(you don't write the master screenplay — Claude assembles it).

### APPLICATION — Claude — `fq/apply.tsx`
`fq_score` (4-pillar composite→Buy/Hold/Sell) · `fq_concentration` (ARDEE 60%, effective 2.46) ·
`fq_funnel` (2000→23→5) · `fq_picks` (5-pick scorecard) · `fq_targets` (fair P/E × forward EPS +
consensus + technical levels) · `fq_valuation` (bear/base/bull + reality-check) · `fq_gtt` (staggered entry + stop).

## 6. Router (Claude owns `FQScenes.tsx`)

Claude imports every scene component and switches on `variant`, wrapping in `<Bg theme={T}
accent={sceneAccent} />`. Agents do NOT touch FQScenes.tsx or Explainer.tsx. Just export your
scene components from your file, e.g. `export const PEScene`, `export const DMAScene`, …
