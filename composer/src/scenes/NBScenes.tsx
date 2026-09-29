/**
 * NBScenes.tsx — "50 to Beat the Nifty" (prefix `nb`).
 *
 * A chaptered, high-conviction stock thesis video. Identity: a "scoreboard" that
 * pits a stock's compounding against the Nifty benchmark — the recurring motif is
 * an ALPHA GAP: a stock line breaking above the index line. Tiers recolor it.
 *
 * Honesty (skills/12): every metric is real (screener.in, point-in-time), shown to
 * its actual precision; the trajectory chart is SCHEMATIC (labelled), never a price
 * forecast; a disclaimer rides the foot. Numbers arrive via props from build_chN.py.
 *
 * Rules (skills/03,09): duration-aware phasing (useP(dur)), continuous motion in
 * every frame, overlap-proof layout on the 1920×1080 Stage, determinism (rnd only).
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  makeTheme, mix, useP, usePop, rnd, MONO, SANS,
  Bg, Stage, Kicker, Head, Foot, Card, Flow, Wire, Counter, ScanBeam, Brackets,
} from "../lib/primitives";

// ---- identity -------------------------------------------------------------
const T = makeTheme({ accent: "#34D399", bg0: "#05070C", bg1: "#0A0F16", bg2: "#101826", panel: "#141d2b" });
const A = {
  quality: "#34D399", // green  — quality / core
  growth: "#FBBF24",  // amber  — growth / valuation
  bench: "#38BDF8",   // cyan   — the Nifty benchmark
  theme: "#A78BFA",   // violet — structural theme / risk basket
  risk: "#FB7185",    // rose   — caution / high-risk
  ok: "#4ADE80",
};
// tier -> accent
const TIER: Record<string, string> = { "1": A.quality, "2": A.growth, "3": A.risk };

// scene-set-local progress bar (universal "this is playing" signal) — skills/03
const Progress: React.FC<{ p: number; color: string }> = ({ p, color }) => (
  <div style={{ position: "absolute", left: 0, bottom: 0, width: 1920, height: 6, background: "rgba(255,255,255,0.05)" }}>
    <div style={{ height: 6, width: 1920 * Math.max(0, Math.min(1, p)), background: `linear-gradient(90deg, ${mix(color, "#ffffff", 0.2)}, ${color})` }} />
  </div>
);

// The ALPHA-GAP mini chart: two rising lines from a common origin; the stock line's
// slope scales with its real earnings growth so faster compounders diverge more.
// Explicitly SCHEMATIC — labelled, never a price target.
const AlphaChart: React.FC<{
  x: number; y: number; w: number; h: number; color: string; draw: number; growth: number;
}> = ({ x, y, w, h, color, draw, growth }) => {
  const frame = useCurrentFrame();
  const N = 60;
  // stock steepness from growth (clamped 6..40% -> curvature); nifty ~ steady 12%
  const gk = Math.max(0.5, Math.min(2.6, growth / 14));
  const niftyK = 0.85;
  const pt = (k: number, i: number) => {
    const t = i / (N - 1);
    const yy = h - h * (0.08 + 0.9 * Math.pow(t, 1.0) * (0.5 + 0.5 * k)); // convex-ish rise
    return [x + t * w, y + yy];
  };
  const stock = Array.from({ length: N }, (_, i) => pt(gk, i));
  const nifty = Array.from({ length: N }, (_, i) => pt(niftyK, i));
  const nShow = Math.max(2, Math.round(N * draw));
  const poly = (a: number[][]) => a.slice(0, nShow).map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  // shaded alpha gap between the two visible line ends
  const gap = stock.slice(0, nShow).map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .concat(nifty.slice(0, nShow).reverse().map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)).join(" ");
  const head = stock[nShow - 1];
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
      {/* axes */}
      <line x1={x} y1={y} x2={x} y2={y + h} stroke={T.line} strokeWidth={2} />
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={T.line} strokeWidth={2} />
      {/* alpha gap fill */}
      <polygon points={gap} fill={mix(T.bg0, color, 0.16)} opacity={0.55} />
      {/* nifty benchmark (cyan, dashed) */}
      <polyline points={poly(nifty)} fill="none" stroke={A.bench} strokeWidth={3.5} strokeDasharray="7 9" opacity={0.9} />
      {/* stock line (tier color) with marching dash overlay for life */}
      <polyline points={poly(stock)} fill="none" stroke={color} strokeWidth={5} />
      <polyline points={poly(stock)} fill="none" stroke={mix(color, "#fff", 0.4)} strokeWidth={5} opacity={0.5}
        strokeDasharray="4 20" strokeDashoffset={-frame * 1.8} />
      {head && <circle cx={head[0]} cy={head[1]} r={7} fill={color} stroke={T.bg0} strokeWidth={2} />}
    </svg>
  );
};

// ============================================================ nb_title
const TitleScene: React.FC<{ dur?: number; big?: string; big2?: string; sub?: string; kick?: string }> =
({ dur, big = "50 to Beat", big2 = "the Nifty", sub = "A conviction portfolio · built from real fundamentals", kick = "INDIAN EQUITIES · 1–5 YEAR THESIS" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur); const pop = usePop(dur);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Bg theme={T} accent={A.quality} />
      {/* ambient: candlestick ticks rising along the edges */}
      {Array.from({ length: 26 }).map((_, i) => {
        const t = (frame * 0.4 + i * 34) % 1920;
        const up = rnd(i, 3) > 0.42;
        const hh = 20 + rnd(i, 7) * 70;
        return (
          <div key={i} style={{
            position: "absolute", left: t - 4, bottom: 40 + rnd(i, 1) * 30, width: 8, height: hh,
            background: up ? mix(A.quality, T.bg0, 0.2) : mix(A.risk, T.bg0, 0.2), borderRadius: 2,
            opacity: 0.18 + rnd(i, 5) * 0.2,
          }} />
        );
      })}
      <div style={{ textAlign: "center", transform: `scale(${0.92 + pop(0) * 0.08})` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <Kicker theme={T} text={kick} color={A.quality} cx />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 122, lineHeight: 1.02, letterSpacing: -3, color: T.text }}>
          <div>{big}</div>
          <div style={{ color: A.quality, textShadow: `0 0 70px ${mix(T.bg0, A.quality, 0.7)}` }}>{big2}</div>
        </div>
        <div style={{ height: 6, width: interpolate(p(0.18, 0.45), [0, 1], [0, 560]), background: `linear-gradient(90deg, ${A.quality}, ${A.bench})`, borderRadius: 3, margin: "30px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 38, color: T.muted, opacity: p(0.28, 0.5) }}>{sub}</div>
        <div style={{ fontFamily: MONO, fontSize: 21, color: mix(T.muted, A.risk, 0.5), opacity: p(0.5, 0.7), marginTop: 26 }}>
          Analysis from public data · NOT investment advice
        </div>
      </div>
      <Progress p={p(0, 1)} color={A.quality} />
    </AbsoluteFill>
  );
};

// ============================================================ nb_divider
const DividerScene: React.FC<{ dur?: number; n?: number; title?: string; sub?: string; tier?: string; total?: number }> =
({ dur, n = 1, title = "", sub = "", tier = "1", total = 5 }) => {
  const frame = useCurrentFrame();
  const p = useP(dur); const color = TIER[tier] || A.quality;
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <Brackets x={330} y={300} w={1260} h={480} color={color} o={p(0.02, 0.14)} len={54} />
      <ScanBeam theme={T} x={340} y={310} w={1240} h={460} color={color} o={p(0.05, 0.2)} speed={1.6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color, letterSpacing: 10, opacity: p(0.05, 0.15) }}>CHAPTER {"0" + n}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, color: T.text, letterSpacing: -2, marginTop: 18, opacity: p(0.12, 0.24), transform: `translateY(${(1 - p(0.12, 0.24)) * 30}px)` }}>{title}</div>
        <div style={{ height: 5, width: interpolate(p(0.2, 0.5), [0, 1], [0, 460]), background: color, borderRadius: 3, margin: "24px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 34, color: T.muted, opacity: p(0.3, 0.45) }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", gap: 16, opacity: p(0.3, 0.45) }}>
        {Array.from({ length: total }, (_, k) => k + 1).map((i) => (
          <div key={i} style={{ width: i === n ? 44 : 14, height: 14, borderRadius: 8,
            background: i <= n ? color : mix(T.panel, color, 0.15), border: `1.5px solid ${i <= n ? color : T.line}`,
            opacity: i === n ? 0.7 + Math.sin(frame * 0.1) * 0.3 : 1 }} />
        ))}
      </div>
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ============================================================ nb_funnel
// The 2,397 -> 260 -> 50 selection funnel. Bars shrink; counters count.
const FunnelScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const stages = [
    { at: 0.10, n: 2397, label: "All NSE-listed companies · 22 sectors", w: 1440, c: T.muted },
    { at: 0.34, n: 260, label: "Quality & growth shortlist · real fundamentals scraped", w: 940, c: A.bench },
    { at: 0.58, n: 50, label: "The conviction portfolio · scored, ranked, diversified", w: 520, c: A.quality },
  ];
  return (
    <Stage>
      <Bg theme={T} accent={A.quality} />
      <Head theme={T} kicker="THE FUNNEL · HOW WE GOT TO 50" title="From 2,397 companies down to 50" color={A.quality} o={p(0, 0.06)} />
      {stages.map((s, i) => {
        const y = 280 + i * 205;
        const grow = p(s.at, s.at + 0.12);
        const w = s.w * grow;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 960 - w / 2, top: y, width: w, height: 118, borderRadius: 18,
              background: `linear-gradient(90deg, ${mix(T.panel, s.c, 0.28)}, ${mix(T.panel, s.c, 0.12)})`,
              border: `2.5px solid ${s.c}`, opacity: grow, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 46, color: s.c }}>
                <Counter p={grow} to={s.n} color={s.c} size={46} comma />
              </div>
            </div>
            <div style={{ position: "absolute", left: 160, right: 160, top: y + 122, textAlign: "center",
              fontFamily: SANS, fontWeight: 700, fontSize: 25, color: T.text, opacity: p(s.at + 0.05, s.at + 0.14) }}>{s.label}</div>
            {i < stages.length - 1 && (
              <div style={{ position: "absolute", left: 957, top: y + 162, width: 6, height: 40, borderRadius: 3,
                background: mix(T.bg1, stages[i + 1].c, 0.6), opacity: p(s.at + 0.12, s.at + 0.2) }} />
            )}
          </React.Fragment>
        );
      })}
      <Foot theme={T} p={p(0.8, 0.9)}>Universe: NSE equity list · Fundamentals: screener.in, point-in-time Aug 2026 · Not investment advice</Foot>
      <Progress p={p(0, 1)} color={A.quality} />
    </Stage>
  );
};

// ============================================================ nb_scorecard
// The transparent scoring dimensions.
const ScorecardScene: React.FC<{ dur?: number; kicker?: string; title?: string; items?: { k: string; d: string; c: string }[] }> = ({ dur, kicker = "THE SCORECARD · WHAT 'BEATS NIFTY' MEANS", title = "Five tests every pick had to pass", items }) => {
  const p = useP(dur);
  const rows = items || [
    { k: "Quality", d: "High, durable ROE / ROCE — the business earns well on capital", c: A.quality },
    { k: "Growth", d: "Strong 3- and 5-year sales & profit CAGR — the engine is running", c: A.growth },
    { k: "Valuation sanity", d: "Price paid vs growth bought — no paying any price", c: A.bench },
    { k: "Moat & runway", d: "Structural tailwind the next five years extend, not exhaust", c: A.theme },
    { k: "Investability", d: "Enough size and liquidity to actually own the position", c: A.ok },
  ];
  const frame = useCurrentFrame();
  return (
    <Stage>
      <Bg theme={T} accent={A.growth} />
      <Head theme={T} kicker={kicker} title={title} color={A.growth} o={p(0, 0.06)} />
      {rows.map((r, i) => {
        const y = 250 + i * 128;
        const at = 0.08 + i * 0.12;
        const hot = Math.floor(frame / 40) % rows.length === i;
        return (
          <div key={i} style={{ position: "absolute", left: 130, top: y, width: 1660, height: 108, borderRadius: 16,
            background: mix(T.panel, r.c, hot ? 0.16 : 0.07), border: `2.5px solid ${hot ? r.c : mix(T.line, r.c, 0.5)}`,
            display: "flex", alignItems: "center", padding: "0 30px", boxSizing: "border-box",
            opacity: p(at, at + 0.09), transform: `translateX(${(1 - p(at, at + 0.09)) * -30}px)` }}>
            <div style={{ width: 54, height: 54, borderRadius: 12, background: r.c, color: T.bg0, fontFamily: MONO, fontWeight: 800, fontSize: 28,
              display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>{i + 1}</div>
            <div style={{ marginLeft: 26, width: 360, fontFamily: SANS, fontWeight: 800, fontSize: 34, color: r.c }}>{r.k}</div>
            <div style={{ fontFamily: SANS, fontSize: 27, color: T.text, flex: 1 }}>{r.d}</div>
          </div>
        );
      })}
      <Progress p={p(0, 1)} color={A.growth} />
    </Stage>
  );
};

// ============================================================ nb_stock  (WORKHORSE)
type Metric = { k: string; v: string; c?: string; hero?: boolean };
const StockScene: React.FC<{
  dur?: number; idx?: number; total?: number; tier?: string; name?: string; ticker?: string;
  sector?: string; cap?: string; metrics?: Metric[]; thesis?: string[]; growth?: number; take?: string;
}> = ({ dur, idx = 1, total = 50, tier = "1", name = "", ticker = "", sector = "", cap = "",
       metrics = [], thesis = [], growth = 18, take = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const color = TIER[tier] || A.quality;
  const tierName = tier === "1" ? "CORE COMPOUNDER" : tier === "2" ? "GROWTH ACCELERATOR" : "HIGH RISK · HIGH REWARD";
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <Head theme={T} kicker={`TIER ${tier} · ${tierName} · PICK ${idx} / ${total}`} title={name} color={color} o={p(0, 0.05)} />
      {/* tier badge + ticker chip top-right */}
      <div style={{ position: "absolute", right: 100, top: 60, display: "flex", gap: 12, opacity: p(0.02, 0.1) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.bg0, background: color, borderRadius: 10, padding: "8px 16px" }}>{ticker}</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color, background: mix(T.panel, color, 0.16), border: `2px solid ${color}`, borderRadius: 10, padding: "8px 14px" }}>T{tier}</div>
      </div>

      {/* LEFT — fundamentals panel */}
      <Card theme={T} x={100} y={220} w={720} h={660} color={color} o={p(0.06, 0.15)} pad="26px 30px" glow>
        <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, letterSpacing: 2, marginBottom: 6 }}>FUNDAMENTALS · screener.in</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: MONO, fontSize: 22, color: A.bench, background: mix(T.panel, A.bench, 0.14), border: `1.5px solid ${mix(T.line, A.bench, 0.6)}`, borderRadius: 8, padding: "6px 12px" }}>{sector}</span>
          <span style={{ fontFamily: MONO, fontSize: 22, color: A.theme, background: mix(T.panel, A.theme, 0.14), border: `1.5px solid ${mix(T.line, A.theme, 0.6)}`, borderRadius: 8, padding: "6px 12px" }}>{cap}</span>
        </div>
        {metrics.slice(0, 6).map((m, i) => {
          const at = 0.16 + i * 0.06;
          const glow = m.hero ? 0.5 + Math.sin(frame * 0.08) * 0.5 : 0;
          const mc = m.c || color;
          return (
            <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
              borderBottom: `1px solid ${T.line}`, padding: "13px 0", opacity: p(at, at + 0.06) }}>
              <span style={{ fontFamily: MONO, fontSize: 24, color: T.muted }}>{m.k}</span>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: m.hero ? 40 : 32, color: mc,
                textShadow: m.hero ? `0 0 ${14 + glow * 16}px ${mix(T.bg0, mc, 0.7)}` : "none" }}>{m.v}</span>
            </div>
          );
        })}
      </Card>

      {/* RIGHT TOP — the alpha chart */}
      <div style={{ position: "absolute", left: 880, top: 232, fontFamily: MONO, fontSize: 21, color: T.muted, opacity: p(0.2, 0.3) }}>
        WHY THE GAP · earnings compounding vs the index
      </div>
      <AlphaChart x={900} y={280} w={860} h={250} color={color} draw={p(0.2, 0.7)} growth={growth} />
      <Flow x1={900} y1={520} x2={1760} y2={300} color={color} n={5} o={p(0.55, 0.7)} speed={0.006} />
      {/* legend */}
      <div style={{ position: "absolute", left: 900, top: 548, display: "flex", gap: 26, opacity: p(0.35, 0.45) }}>
        <span style={{ fontFamily: MONO, fontSize: 20, color }}>▬ {ticker}</span>
        <span style={{ fontFamily: MONO, fontSize: 20, color: A.bench }}>▬ ▬ Nifty (schematic, not a forecast)</span>
      </div>

      {/* RIGHT BOTTOM — thesis bullets */}
      <div style={{ position: "absolute", left: 880, top: 600, width: 920 }}>
        <div style={{ fontFamily: MONO, fontSize: 21, color, letterSpacing: 2, marginBottom: 14, opacity: p(0.4, 0.48) }}>THE THESIS</div>
        {thesis.slice(0, 3).map((b, i) => {
          const at = 0.46 + i * 0.11;
          return (
            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, opacity: p(at, at + 0.08), transform: `translateY(${(1 - p(at, at + 0.08)) * 14}px)` }}>
              <div style={{ width: 10, height: 10, borderRadius: 6, background: color, marginTop: 12, flex: "0 0 auto", boxShadow: `0 0 12px ${color}` }} />
              <div style={{ fontFamily: SANS, fontSize: 27, color: T.text, lineHeight: 1.34 }}>{b}</div>
            </div>
          );
        })}
      </div>

      <Foot theme={T} p={p(0.82, 0.92)}>{take ? take + " · " : ""}Figures point-in-time (screener.in, Aug 2026); past performance ≠ future returns · Not investment advice</Foot>
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ============================================================ nb_tierboard
// A tier roll-up: the list of names in this tier as chips, phased in.
const TierBoardScene: React.FC<{ dur?: number; tier?: string; title?: string; sub?: string; names?: string[] }> =
({ dur, tier = "1", title = "", sub = "", names = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur); const color = TIER[tier] || A.quality;
  const cols = 3;
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <Head theme={T} kicker={`TIER ${tier} · THE LINE-UP`} title={title} color={color} o={p(0, 0.06)} />
      {sub && <div style={{ position: "absolute", left: 100, top: 158, fontFamily: SANS, fontSize: 28, color: T.muted, opacity: p(0.05, 0.14) }}>{sub}</div>}
      {names.map((nm, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const x = 130 + c * 560, y = 240 + r * 96;
        const at = 0.06 + i * 0.035;
        const hot = Math.floor(frame / 18) % names.length === i;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 520, height: 78, borderRadius: 12,
            background: mix(T.panel, color, hot ? 0.18 : 0.08), border: `2px solid ${hot ? color : mix(T.line, color, 0.45)}`,
            display: "flex", alignItems: "center", gap: 14, padding: "0 18px", boxSizing: "border-box",
            opacity: p(at, at + 0.06), transform: `translateY(${(1 - p(at, at + 0.06)) * 14}px)` }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: T.bg0, background: color, borderRadius: 8, padding: "5px 10px", minWidth: 34, textAlign: "center" }}>{i + 1}</span>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 25, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nm}</span>
          </div>
        );
      })}
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ============================================================ nb_bars
// A comparison bar chart (e.g. growth rates, or sector allocation). Generic.
const BarsScene: React.FC<{ dur?: number; kicker?: string; title?: string; unit?: string; bars?: { label: string; v: number; c?: string }[]; foot?: string }> =
({ dur, kicker = "", title = "", unit = "%", bars = [], foot = "" }) => {
  const p = useP(dur);
  const maxV = Math.max(1, ...bars.map((b) => b.v));
  const BASE = 820, W = Math.min(240, Math.floor(1560 / Math.max(1, bars.length)));
  const X0 = Math.round((1920 - bars.length * W) / 2);
  const H = 470;
  return (
    <Stage>
      <Bg theme={T} accent={A.growth} />
      <Head theme={T} kicker={kicker} title={title} color={A.growth} o={p(0, 0.06)} />
      <div style={{ position: "absolute", left: X0 - 20, top: BASE, width: bars.length * W + 40, height: 2, background: T.line }} />
      {bars.map((b, i) => {
        const grow = p(0.1 + i * 0.08, 0.2 + i * 0.08);
        const h = (b.v / maxV) * H * grow;
        const c = b.c || A.growth;
        const x = X0 + i * W;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x, top: BASE - h, width: W - 40, height: h, borderRadius: "12px 12px 0 0",
              background: `linear-gradient(180deg, ${c}, ${mix(c, T.bg1, 0.5)})`, border: `2px solid ${c}`, borderBottom: "none" }} />
            <div style={{ position: "absolute", left: x - 10, top: BASE - h - 44, width: W - 20, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 28, color: c, opacity: grow }}>
              {Number.isInteger(b.v) ? b.v : b.v.toFixed(1)}{unit}
            </div>
            <div style={{ position: "absolute", left: x - 20, top: BASE + 14, width: W, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 22, color: T.text, opacity: grow, lineHeight: 1.2, whiteSpace: "pre-line" }}>{b.label}</div>
          </React.Fragment>
        );
      })}
      {foot && <Foot theme={T} p={p(0.8, 0.9)}>{foot}</Foot>}
      <Progress p={p(0, 1)} color={A.growth} />
    </Stage>
  );
};

// ============================================================ nb_portfolio
// The full 50 as a dense grid, colored by tier.
const PortfolioScene: React.FC<{ dur?: number; picks?: { t: string; nm: string }[] }> = ({ dur, picks = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const cols = 5;
  return (
    <Stage>
      <Bg theme={T} accent={A.quality} />
      <Head theme={T} kicker="THE PORTFOLIO · ALL 50" title="Fifty ways to try to beat the index" color={A.quality} o={p(0, 0.05)} />
      {picks.map((pk, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const x = 120 + c * 342, y = 210 + r * 66;
        const color = TIER[pk.t] || A.quality;
        const at = 0.04 + i * 0.014;
        const hot = Math.floor(frame / 8) % picks.length === i;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 322, height: 54, borderRadius: 9,
            background: mix(T.panel, color, hot ? 0.22 : 0.09), border: `1.5px solid ${hot ? color : mix(T.line, color, 0.4)}`,
            display: "flex", alignItems: "center", gap: 10, padding: "0 12px", boxSizing: "border-box", opacity: p(at, at + 0.05) }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 17, color: T.bg0, background: color, borderRadius: 5, padding: "3px 6px" }}>{i + 1}</span>
            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pk.nm}</span>
          </div>
        );
      })}
      <Progress p={p(0, 1)} color={A.quality} />
    </Stage>
  );
};

// ============================================================ nb_recap
const RecapScene: React.FC<{ dur?: number; title?: string; items?: string[]; closer?: string }> = ({ dur, title = "Beating the Nifty, in one breath", items = [], closer = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Bg theme={T} accent={A.quality} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Kicker theme={T} text="RECAP · THE WHOLE THESIS" color={A.quality} cx o={p(0, 0.08)} /></div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, color: T.text, marginTop: 16, opacity: p(0.04, 0.14) }}>{title}</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 250, width: 1340 }}>
        {items.map((it, i) => {
          const at = 0.08 + i * 0.1;
          return (
            <div key={i} style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20, opacity: p(at, at + 0.08), transform: `translateX(${(1 - p(at, at + 0.08)) * -24}px)` }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: mix(T.panel, A.quality, 0.2), border: `2px solid ${A.quality}`, color: A.quality, fontFamily: MONO, fontWeight: 800, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>{i + 1}</div>
              <div style={{ fontFamily: SANS, fontSize: 30, color: T.text }}>{it}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 200, right: 200, top: 852, textAlign: "center", fontFamily: SANS, fontStyle: "italic", fontWeight: 700, fontSize: 40,
        color: A.quality, opacity: p(0.8, 0.9), textShadow: `0 0 40px ${mix(T.bg0, A.quality, 0.5 + Math.sin(frame * 0.06) * 0.2)}` }}>{closer}</div>
      <Progress p={p(0, 1)} color={A.quality} />
    </Stage>
  );
};

// ============================================================ nb_statement (full-bleed message)
const StatementScene: React.FC<{ dur?: number; kicker?: string; lines?: string[]; color?: string; sub?: string }> =
({ dur, kicker = "", lines = [], color = A.risk, sub = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <ScanBeam theme={T} x={200} y={200} w={1520} h={680} color={color} o={p(0.05, 0.2)} speed={1.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}><Kicker theme={T} text={kicker} color={color} cx o={p(0, 0.1)} /></div>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 68, lineHeight: 1.12, letterSpacing: -2,
            color: i % 2 ? color : T.text, opacity: p(0.1 + i * 0.14, 0.2 + i * 0.14),
            transform: `translateY(${(1 - p(0.1 + i * 0.14, 0.2 + i * 0.14)) * 24}px)` }}>{l}</div>
        ))}
        {sub && <div style={{ fontFamily: SANS, fontSize: 34, color: T.muted, marginTop: 34, opacity: p(0.6, 0.72) }}>{sub}</div>}
      </div>
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ---------------------------------------------------------------- router
export const NBScene: React.FC<{ variant: string; [k: string]: unknown }> = ({ variant, ...props }) => {
  const v = variant.replace(/^nb_/, "");
  switch (v) {
    case "title": return <TitleScene {...props} />;
    case "divider": return <DividerScene {...props} />;
    case "funnel": return <FunnelScene {...props} />;
    case "scorecard": return <ScorecardScene {...props} />;
    case "stock": return <StockScene {...props} />;
    case "tierboard": return <TierBoardScene {...props} />;
    case "bars": return <BarsScene {...props} />;
    case "portfolio": return <PortfolioScene {...props} />;
    case "recap": return <RecapScene {...props} />;
    case "statement": return <StatementScene {...props} />;
    default: return <TitleScene {...props} />;
  }
};
