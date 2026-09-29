/**
 * MWScenes.tsx — "Who Actually Made Money" (prefix `mw`).
 *
 * A chaptered, documentary-style video on people who genuinely made money in the
 * Indian market over the last six months — against a tape that CRASHED then
 * recovered (Nifty 26,130 Dec-25 → 22,182.55 low 02-Apr-26 → ~24,080 Aug-26).
 * Verified big-bull disclosed portfolios, the 2026 IPO winners, the "boring"
 * SIP/dip buyers — and two chapters that dissect the FAKE viral profit claims
 * (SEBI finfluencer orders + a red-flag checklist).
 *
 * Identity: "the market tape". A scrolling ticker + a rising equity curve. Colors
 * MEAN things — gold = money/winners, green = gains, cyan = the benchmark, violet =
 * strategy/theme, rose = risk / fakes / regulatory action.
 *
 * Honesty (skills/12): every portfolio figure is a DISCLOSED shareholding (aggregator
 * from BSE/NSE filings), shown as-of its quarter; the equity curve is SCHEMATIC
 * (labelled), never a forecast; unverifiable viral claims are dissected, never asserted;
 * a disclaimer rides the foot. Numbers arrive via props from build.py.
 *
 * Rules (skills/03,09): duration-aware phasing (useP(dur)), continuous motion in every
 * frame, overlap-proof layout on the 1920×1080 Stage, determinism (rnd only).
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  makeTheme, mix, useP, usePop, rnd, MONO, SANS,
  Bg, Stage, Kicker, Head, Foot, Card, Flow, Wire, Counter, ScanBeam, Brackets, CL,
} from "../lib/primitives";

// ---- identity -------------------------------------------------------------
const T = makeTheme({ accent: "#FBBF24", bg0: "#05060B", bg1: "#0A0D16", bg2: "#111726", panel: "#141b2b" });
const A = {
  money: "#FBBF24",  // gold   — money / winners / headline
  gain: "#34D399",   // green  — gains / quality / verified
  bench: "#38BDF8",  // cyan   — the index / benchmark / market
  theme: "#A78BFA",  // violet — strategy / structural theme
  risk: "#FB7185",   // rose   — risk / fakes / regulatory action
  ink: "#EEF1FB",
};
const clamp = (x: number) => Math.max(0, Math.min(1, x));

// scene-set progress bar — universal "this is playing" signal (skills/03)
const Progress: React.FC<{ p: number; color: string }> = ({ p, color }) => (
  <div style={{ position: "absolute", left: 0, bottom: 0, width: 1920, height: 6, background: "rgba(255,255,255,0.05)" }}>
    <div style={{ height: 6, width: 1920 * clamp(p), background: `linear-gradient(90deg, ${mix(color, "#ffffff", 0.2)}, ${color})` }} />
  </div>
);

// A live scrolling ticker tape strip — the recurring motif. Deterministic.
const Ticker: React.FC<{ y: number; color?: string; o?: number; speed?: number; seed?: number }> =
({ y, color = A.money, o = 0.5, speed = 1.1, seed = 0 }) => {
  const frame = useCurrentFrame();
  const syms = ["TITAN", "DMART", "BEL", "HAL", "L&T", "RADICO", "NEULAND", "SHAILY", "GHCL", "CERA",
    "TEJAS", "METRO", "NCC", "CARYSIL", "PRAKASH", "SPIC", "ZOTA", "NUVAMA", "SIRCA", "ATUL"];
  const W = 1920, span = 210;
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: W, height: 40, overflow: "hidden", opacity: o }}>
      {Array.from({ length: 14 }).map((_, i) => {
        const x = ((i * span - frame * speed) % (14 * span) + 14 * span) % (14 * span) - span;
        const s = syms[(i + seed) % syms.length];
        const up = rnd(i, seed, 2) > 0.4;
        const pct = (rnd(i, seed, 5) * 6 + 0.2).toFixed(2);
        const c = up ? A.gain : A.risk;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 6, display: "flex", gap: 8, alignItems: "center", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 20, color: mix(color, "#fff", 0.1), fontWeight: 700 }}>{s}</span>
            <span style={{ fontFamily: MONO, fontSize: 19, color: c }}>{up ? "▲" : "▼"}{pct}%</span>
          </div>
        );
      })}
    </div>
  );
};

// Rising equity/wealth curve — SCHEMATIC (labelled), never a forecast. `steep`
// scales the compounding curvature; draws in as `draw` 0→1 then a head dot glows.
const EquityCurve: React.FC<{
  x: number; y: number; w: number; h: number; color: string; draw: number; steep?: number; dip?: boolean;
}> = ({ x, y, w, h, color, draw, steep = 1.4, dip = false }) => {
  const frame = useCurrentFrame();
  const N = 64;
  const pt = (i: number) => {
    const t = i / (N - 1);
    // optional early dip (for the "bought the crash" story), then compounding rise
    const dipTerm = dip ? -0.18 * Math.sin(clamp(t / 0.32) * Math.PI) * Math.exp(-t * 1.2) : 0;
    const rise = Math.pow(t, 1.05) * (0.42 + 0.5 * steep);
    const yy = h - h * clamp(0.08 + rise + dipTerm);
    return [x + t * w, y + yy];
  };
  const all = Array.from({ length: N }, (_, i) => pt(i));
  const nShow = Math.max(2, Math.round(N * clamp(draw)));
  const line = all.slice(0, nShow).map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fill = `${x},${y + h} ` + all.slice(0, nShow).map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + ` ${all[nShow - 1][0].toFixed(1)},${y + h}`;
  const head = all[nShow - 1];
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
      <line x1={x} y1={y} x2={x} y2={y + h} stroke={T.line} strokeWidth={2} />
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={T.line} strokeWidth={2} />
      <polygon points={fill} fill={mix(T.bg0, color, 0.16)} opacity={0.5} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={5} />
      <polyline points={line} fill="none" stroke={mix(color, "#fff", 0.4)} strokeWidth={5} opacity={0.5}
        strokeDasharray="4 20" strokeDashoffset={-frame * 1.8} />
      {head && <circle cx={head[0]} cy={head[1]} r={7} fill={color} stroke={T.bg0} strokeWidth={2}
        style={{ filter: undefined }} />}
    </svg>
  );
};

// ============================================================ mw_title
const TitleScene: React.FC<{ dur?: number; big?: string; big2?: string; sub?: string; kick?: string }> =
({ dur, big = "Who Actually", big2 = "Made Money", sub = "Real winners of the last six months — and how to spot the fakes", kick = "INDIAN MARKETS · MAR–AUG 2026 · VERIFIED STORIES" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur); const pop = usePop(dur);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Bg theme={T} accent={A.money} />
      <Ticker y={150} o={0.4} speed={1.0} seed={0} />
      <Ticker y={880} o={0.4} speed={0.8} seed={7} />
      {/* ambient candlestick ticks */}
      {Array.from({ length: 26 }).map((_, i) => {
        const t = (frame * 0.4 + i * 34) % 1920;
        const up = rnd(i, 3) > 0.42;
        const hh = 20 + rnd(i, 7) * 70;
        return (
          <div key={i} style={{
            position: "absolute", left: t - 4, bottom: 40 + rnd(i, 1) * 30, width: 8, height: hh,
            background: up ? mix(A.gain, T.bg0, 0.25) : mix(A.risk, T.bg0, 0.25), borderRadius: 2,
            opacity: 0.14 + rnd(i, 5) * 0.16,
          }} />
        );
      })}
      <div style={{ textAlign: "center", transform: `scale(${0.92 + pop(0) * 0.08})` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <Kicker theme={T} text={kick} color={A.money} cx />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 128, lineHeight: 1.0, letterSpacing: -3, color: T.text }}>
          <div>{big}</div>
          <div style={{ color: A.money, textShadow: `0 0 70px ${mix(T.bg0, A.money, 0.7)}` }}>{big2}</div>
        </div>
        <div style={{ height: 6, width: interpolate(p(0.18, 0.45), [0, 1], [0, 620]), background: `linear-gradient(90deg, ${A.money}, ${A.gain})`, borderRadius: 3, margin: "30px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 37, color: T.muted, opacity: p(0.28, 0.5) }}>{sub}</div>
        <div style={{ fontFamily: MONO, fontSize: 21, color: mix(T.muted, A.risk, 0.5), opacity: p(0.5, 0.7), marginTop: 26 }}>
          Public disclosures &amp; SEBI orders · NOT investment advice
        </div>
      </div>
      <Progress p={p(0, 1)} color={A.money} />
    </AbsoluteFill>
  );
};

// ============================================================ mw_divider
const DividerScene: React.FC<{ dur?: number; n?: number; title?: string; sub?: string; color?: string; total?: number }> =
({ dur, n = 1, title = "", sub = "", color = A.money, total = 15 }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <Ticker y={120} o={0.28} speed={0.9} seed={n} />
      <Ticker y={920} o={0.28} speed={0.7} seed={n + 4} />
      <Brackets x={330} y={300} w={1260} h={480} color={color} o={p(0.02, 0.14)} len={54} />
      <ScanBeam theme={T} x={340} y={310} w={1240} h={460} color={color} o={p(0.05, 0.2)} speed={1.6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color, letterSpacing: 10, opacity: p(0.05, 0.15) }}>CHAPTER {n < 10 ? "0" + n : n}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 88, color: T.text, letterSpacing: -2, marginTop: 18, opacity: p(0.12, 0.24), transform: `translateY(${(1 - p(0.12, 0.24)) * 30}px)` }}>{title}</div>
        <div style={{ height: 5, width: interpolate(p(0.2, 0.5), [0, 1], [0, 460]), background: color, borderRadius: 3, margin: "24px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 33, color: T.muted, opacity: p(0.3, 0.45) }}>{sub}</div>
      </div>
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ============================================================ mw_statement (full-bleed message)
const StatementScene: React.FC<{ dur?: number; kicker?: string; lines?: string[]; color?: string; sub?: string }> =
({ dur, kicker = "", lines = [], color = A.money, sub = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <ScanBeam theme={T} x={180} y={200} w={1560} h={680} color={color} o={p(0.05, 0.2)} speed={1.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}><Kicker theme={T} text={kicker} color={color} cx o={p(0, 0.1)} /></div>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 66, lineHeight: 1.14, letterSpacing: -2,
            color: i % 2 ? color : T.text, opacity: p(0.1 + i * 0.13, 0.2 + i * 0.13),
            transform: `translateY(${(1 - p(0.1 + i * 0.13, 0.2 + i * 0.13)) * 24}px)` }}>{l}</div>
        ))}
        {sub && <div style={{ fontFamily: SANS, fontSize: 33, color: T.muted, marginTop: 34, opacity: p(0.62, 0.74) }}>{sub}</div>}
      </div>
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ============================================================ mw_macro
// The last-6-months arc of the index: peak → crash-low → recovery. Computed from
// real anchor points passed as props. Marks the low and the recovery. Not a forecast.
const MacroScene: React.FC<{
  dur?: number; peak?: number; low?: number; now?: number; lowDate?: string; nowLabel?: string;
  peakLabel?: string; dropPct?: string; recoverPct?: string;
}> = ({ dur, peak = 26130, low = 22182.55, now = 24080, lowDate = "2 Apr 2026", nowLabel = "Aug 2026",
       peakLabel = "Dec 2025", dropPct = "−16%", recoverPct = "+9%" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const X = 260, Y = 250, W = 1400, H = 500;
  // path: peak (t0) → dips to low (t~0.42) → recovers to now (t1)
  const lo = Math.min(low, now) * 0.985, hi = peak * 1.008;
  const yFor = (v: number) => Y + H - H * clamp((v - lo) / (hi - lo));
  const N = 80;
  const val = (t: number) => {
    if (t <= 0.42) return peak + (low - peak) * Math.pow(t / 0.42, 1.25);
    return low + (now - low) * Math.pow((t - 0.42) / 0.58, 0.85);
  };
  const pts = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    return [X + t * W, yFor(val(t))];
  });
  const draw = p(0.12, 0.82);
  const nShow = Math.max(2, Math.round(N * draw));
  const line = pts.slice(0, nShow).map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
  const head = pts[nShow - 1];
  const lowIdx = Math.round(0.42 * (N - 1));
  const lowPt = pts[lowIdx];
  return (
    <Stage>
      <Bg theme={T} accent={A.bench} />
      <Head theme={T} kicker="THE TAPE · LAST SIX MONTHS" title="The market itself went nowhere" color={A.bench} o={p(0, 0.06)} />
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
          <line key={i} x1={X} y1={Y + H * g} x2={X + W} y2={Y + H * g} stroke={T.line} strokeWidth={1} opacity={0.5} />
        ))}
        {/* the drawn index path */}
        <polyline points={line} fill="none" stroke={A.bench} strokeWidth={5} />
        <polyline points={line} fill="none" stroke={mix(A.bench, "#fff", 0.4)} strokeWidth={5} opacity={0.5}
          strokeDasharray="4 20" strokeDashoffset={-frame * 1.8} />
        {head && <circle cx={head[0]} cy={head[1]} r={8} fill={A.bench} stroke={T.bg0} strokeWidth={2} />}
        {/* low marker */}
        {draw > 0.45 && <circle cx={lowPt[0]} cy={lowPt[1]} r={9} fill={A.risk} stroke={T.bg0} strokeWidth={2} />}
      </svg>
      {/* peak label */}
      <div style={{ position: "absolute", left: X - 40, top: yFor(peak) - 66, fontFamily: MONO, fontSize: 26, color: A.money, opacity: p(0.14, 0.24) }}>
        <div style={{ fontWeight: 800, fontSize: 30 }}>{peak.toLocaleString("en-IN")}</div>
        <div style={{ color: T.muted, fontSize: 21 }}>{peakLabel} · peak</div>
      </div>
      {/* low label */}
      <div style={{ position: "absolute", left: lowPt[0] - 70, top: lowPt[1] + 26, fontFamily: MONO, fontSize: 24, color: A.risk, opacity: p(0.46, 0.56), textAlign: "center", width: 240 }}>
        <div style={{ fontWeight: 800, fontSize: 30 }}>{low.toLocaleString("en-IN")}</div>
        <div style={{ color: T.muted, fontSize: 21 }}>{lowDate} · {dropPct}</div>
      </div>
      {/* now label */}
      <div style={{ position: "absolute", left: X + W - 150, top: yFor(now) - 74, fontFamily: MONO, fontSize: 26, color: A.gain, opacity: p(0.72, 0.82), textAlign: "right", width: 280 }}>
        <div style={{ fontWeight: 800, fontSize: 30 }}>~{now.toLocaleString("en-IN")}</div>
        <div style={{ color: T.muted, fontSize: 21 }}>{nowLabel} · {recoverPct} off low</div>
      </div>
      <Foot theme={T} p={p(0.84, 0.93)}>Nifty 50, close levels · Dec-2025 peak to Aug-2026 · still below the peak · schematic path, not a forecast</Foot>
      <Progress p={p(0, 1)} color={A.bench} />
    </Stage>
  );
};

// ============================================================ mw_investor (WORKHORSE)
type Hold = { nm: string; v?: string; pct?: string };
const InvestorScene: React.FC<{
  dur?: number; idx?: number; total?: number; color?: string; name?: string; tag?: string;
  worth?: number; worthUnit?: string; stocks?: number; asOf?: string; holdings?: Hold[];
  strategy?: string; playbook?: string[]; move?: string; steep?: number; dip?: boolean; foot?: string;
}> = ({ dur, idx = 1, total = 8, color = A.money, name = "", tag = "", worth = 0, worthUnit = "cr",
       stocks = 0, asOf = "", holdings = [], strategy = "", playbook = [], move = "", steep = 1.4, dip = false, foot = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <Head theme={T} kicker={`WINNER ${idx} / ${total} · ${tag}`} title={name} color={color} o={p(0, 0.05)} />

      {/* LEFT — disclosed portfolio panel */}
      <Card theme={T} x={100} y={220} w={720} h={660} color={color} o={p(0.06, 0.15)} pad="26px 30px" glow>
        <div style={{ fontFamily: MONO, fontSize: 20, color: T.muted, letterSpacing: 2, marginBottom: 8 }}>DISCLOSED PORTFOLIO · {asOf}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <span style={{ fontFamily: MONO, fontSize: 26, color, fontWeight: 800 }}>₹</span>
          <Counter p={p(0.14, 0.34)} to={worth} color={color} size={64} comma decimals={worth < 100 ? 0 : 0} />
          <span style={{ fontFamily: MONO, fontSize: 30, color, fontWeight: 800 }}>{worthUnit}</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 22, color: T.muted, marginBottom: 18 }}>{stocks > 0 ? `${stocks} disclosed stocks` : ""}</div>
        <div style={{ fontFamily: MONO, fontSize: 20, color: mix(T.muted, color, 0.5), letterSpacing: 2, marginBottom: 8 }}>TOP HOLDINGS</div>
        {holdings.slice(0, 5).map((h, i) => {
          const at = 0.2 + i * 0.06;
          return (
            <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
              borderBottom: `1px solid ${T.line}`, padding: "11px 0", opacity: p(at, at + 0.06) }}>
              <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 25, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 400 }}>{h.nm}</span>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 23, color, whiteSpace: "nowrap" }}>{h.v || ""}{h.v && h.pct ? " · " : ""}{h.pct || ""}</span>
            </div>
          );
        })}
      </Card>

      {/* RIGHT TOP — signature strategy + wealth curve */}
      <div style={{ position: "absolute", left: 880, top: 232, fontFamily: MONO, fontSize: 20, color: color, letterSpacing: 2, opacity: p(0.2, 0.3) }}>
        SIGNATURE STRATEGY
      </div>
      <div style={{ position: "absolute", left: 880, top: 262, width: 920, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: T.text, opacity: p(0.24, 0.36), lineHeight: 1.3 }}>{strategy}</div>
      <EquityCurve x={905} y={420} w={840} h={150} color={color} draw={p(0.3, 0.72)} steep={steep} dip={dip} />
      <Flow x1={905} y1={560} x2={1745} y2={430} color={color} n={5} o={p(0.55, 0.7)} speed={0.006} />
      <div style={{ position: "absolute", left: 905, top: 578, fontFamily: MONO, fontSize: 19, color: T.muted, opacity: p(0.4, 0.5) }}>
        Wealth compounding — schematic, not a price target
      </div>

      {/* RIGHT BOTTOM — the playbook (how they made money) */}
      <div style={{ position: "absolute", left: 880, top: 620, width: 920 }}>
        <div style={{ fontFamily: MONO, fontSize: 20, color, letterSpacing: 2, marginBottom: 12, opacity: p(0.42, 0.5) }}>THE PLAYBOOK</div>
        {playbook.slice(0, 3).map((b, i) => {
          const at = 0.46 + i * 0.1;
          return (
            <div key={i} style={{ display: "flex", gap: 16, marginBottom: 13, opacity: p(at, at + 0.08), transform: `translateY(${(1 - p(at, at + 0.08)) * 14}px)` }}>
              <div style={{ width: 10, height: 10, borderRadius: 6, background: color, marginTop: 11, flex: "0 0 auto", boxShadow: `0 0 12px ${color}` }} />
              <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, lineHeight: 1.32 }}>{b}</div>
            </div>
          );
        })}
      </div>

      {/* the verified recent move chip */}
      {move && (
        <div style={{ position: "absolute", left: 100, top: 900, width: 720, fontFamily: MONO, fontSize: 21, color: A.gain, opacity: p(0.6, 0.7) }}>
          ↳ {move}
        </div>
      )}
      <Foot theme={T} p={p(0.82, 0.92)}>{foot || "Disclosed shareholding (BSE/NSE filings, aggregator) · point-in-time · past performance ≠ future returns · Not investment advice"}</Foot>
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ============================================================ mw_bars
// Generic comparison bars — IPO returns, sector returns, F&O loss stat, etc.
const BarsScene: React.FC<{ dur?: number; kicker?: string; title?: string; unit?: string; color?: string; bars?: { label: string; v: number; c?: string; tag?: string }[]; foot?: string }> =
({ dur, kicker = "", title = "", unit = "%", color = A.money, bars = [], foot = "" }) => {
  const p = useP(dur);
  const maxV = Math.max(1, ...bars.map((b) => b.v));
  const BASE = 800, W = Math.min(250, Math.floor(1560 / Math.max(1, bars.length)));
  const X0 = Math.round((1920 - bars.length * W) / 2);
  const H = 440;
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <Head theme={T} kicker={kicker} title={title} color={color} o={p(0, 0.06)} />
      <div style={{ position: "absolute", left: X0 - 20, top: BASE, width: bars.length * W + 40, height: 2, background: T.line }} />
      {bars.map((b, i) => {
        const grow = p(0.1 + i * 0.08, 0.2 + i * 0.08);
        const h = (b.v / maxV) * H * grow;
        const c = b.c || color;
        const x = X0 + i * W;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x, top: BASE - h, width: W - 40, height: h, borderRadius: "12px 12px 0 0",
              background: `linear-gradient(180deg, ${c}, ${mix(c, T.bg1, 0.5)})`, border: `2px solid ${c}`, borderBottom: "none" }} />
            <div style={{ position: "absolute", left: x - 10, top: BASE - h - 46, width: W - 20, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: c, opacity: grow }}>
              {b.v % 1 === 0 ? b.v : b.v.toFixed(1)}{unit}
            </div>
            <div style={{ position: "absolute", left: x - 20, top: BASE + 14, width: W, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 23, color: T.text, opacity: grow, lineHeight: 1.2, whiteSpace: "pre-line" }}>{b.label}</div>
            {b.tag && <div style={{ position: "absolute", left: x - 20, top: BASE + 78, width: W, textAlign: "center", fontFamily: MONO, fontSize: 19, color: T.muted, opacity: grow }}>{b.tag}</div>}
          </React.Fragment>
        );
      })}
      {foot && <Foot theme={T} p={p(0.8, 0.9)}>{foot}</Foot>}
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ============================================================ mw_checklist
// Numbered checklist — red flags of a fake, or the lessons of the real winners.
const ChecklistScene: React.FC<{ dur?: number; kicker?: string; title?: string; color?: string; items?: { k: string; d: string }[]; mark?: string }> =
({ dur, kicker = "", title = "", color = A.risk, items = [], mark = "!" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const rows = items.slice(0, 6);
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <Head theme={T} kicker={kicker} title={title} color={color} o={p(0, 0.06)} />
      {rows.map((r, i) => {
        const y = 232 + i * 112;
        const at = 0.08 + i * 0.11;
        const hot = Math.floor(frame / 40) % rows.length === i;
        return (
          <div key={i} style={{ position: "absolute", left: 130, top: y, width: 1660, height: 92, borderRadius: 16,
            background: mix(T.panel, color, hot ? 0.16 : 0.07), border: `2.5px solid ${hot ? color : mix(T.line, color, 0.5)}`,
            display: "flex", alignItems: "center", padding: "0 30px", boxSizing: "border-box",
            opacity: p(at, at + 0.09), transform: `translateX(${(1 - p(at, at + 0.09)) * -30}px)` }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: color, color: T.bg0, fontFamily: MONO, fontWeight: 800, fontSize: 26,
              display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>{mark === "#" ? i + 1 : mark}</div>
            <div style={{ marginLeft: 24, width: 420, fontFamily: SANS, fontWeight: 800, fontSize: 30, color }}>{r.k}</div>
            <div style={{ fontFamily: SANS, fontSize: 25, color: T.text, flex: 1 }}>{r.d}</div>
          </div>
        );
      })}
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ============================================================ mw_case  (SEBI case file)
// A "regulatory action" case file for a banned finfluencer. Rose stamp motif.
const CaseScene: React.FC<{
  dur?: number; name?: string; alias?: string; order?: string; amount?: string; amountLabel?: string;
  charge?: string; lesson?: string;
}> = ({ dur, name = "", alias = "", order = "", amount = "", amountLabel = "Impounded", charge = "", lesson = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const color = A.risk;
  const stampO = p(0.5, 0.62);
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <Head theme={T} kicker="CASE FILE · SEBI REGULATORY ACTION" title="When the profits were a lie" color={color} o={p(0, 0.06)} />
      <Card theme={T} x={190} y={230} w={1540} h={620} color={color} o={p(0.06, 0.16)} pad="40px 54px" glow>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, letterSpacing: 2 }}>SUBJECT</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, color: T.text, marginTop: 6 }}>{name}</div>
            {alias && <div style={{ fontFamily: SANS, fontStyle: "italic", fontSize: 30, color, marginTop: 4, opacity: p(0.2, 0.3) }}>“{alias}”</div>}
          </div>
          {/* BANNED stamp */}
          <div style={{ transform: `rotate(-11deg) scale(${0.8 + stampO * 0.2})`, opacity: stampO,
            border: `5px solid ${color}`, borderRadius: 14, padding: "8px 26px", marginTop: 12 }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 46, color, letterSpacing: 4 }}>BARRED</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
          <div style={{ opacity: p(0.3, 0.4) }}>
            <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, letterSpacing: 2 }}>SEBI ORDER</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: T.text, marginTop: 6 }}>{order}</div>
          </div>
          <div style={{ opacity: p(0.36, 0.46) }}>
            <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, letterSpacing: 2 }}>{amountLabel.toUpperCase()}</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color, marginTop: 6, textShadow: `0 0 18px ${mix(T.bg0, color, 0.6)}` }}>{amount}</div>
          </div>
        </div>
        <div style={{ marginTop: 34, opacity: p(0.46, 0.58) }}>
          <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, letterSpacing: 2 }}>THE CHARGE</div>
          <div style={{ fontFamily: SANS, fontSize: 30, color: T.text, marginTop: 8, lineHeight: 1.35 }}>{charge}</div>
        </div>
      </Card>
      {lesson && (
        <div style={{ position: "absolute", left: 190, right: 190, top: 878, textAlign: "center", fontFamily: SANS, fontStyle: "italic", fontWeight: 700, fontSize: 32,
          color, opacity: p(0.66, 0.78) }}>{lesson}</div>
      )}
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ============================================================ mw_quote
const QuoteScene: React.FC<{ dur?: number; quote?: string; who?: string; color?: string }> =
({ dur, quote = "", who = "", color = A.money }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <div style={{ position: "absolute", left: 240, top: 300, fontFamily: SANS, fontWeight: 800, fontSize: 200, color, opacity: p(0.05, 0.15) * 0.25, lineHeight: 0.6 }}>“</div>
      <div style={{ position: "absolute", left: 250, right: 250, top: 360, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, lineHeight: 1.25, color: T.text, letterSpacing: -1, opacity: p(0.08, 0.3) }}>{quote}</div>
        <div style={{ fontFamily: MONO, fontSize: 30, color, marginTop: 40, opacity: p(0.4, 0.55) }}>— {who}</div>
      </div>
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ============================================================ mw_recap
const RecapScene: React.FC<{ dur?: number; title?: string; items?: string[]; closer?: string; color?: string }> =
({ dur, title = "What actually made money", items = [], closer = "", color = A.money }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Bg theme={T} accent={color} />
      <Ticker y={104} o={0.24} speed={0.8} seed={2} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 66, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Kicker theme={T} text="RECAP · THE WHOLE STORY" color={color} cx o={p(0, 0.08)} /></div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 58, color: T.text, marginTop: 16, opacity: p(0.04, 0.14) }}>{title}</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 230, width: 1340 }}>
        {items.slice(0, 7).map((it, i) => {
          const at = 0.08 + i * 0.1;
          return (
            <div key={i} style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 17, opacity: p(at, at + 0.08), transform: `translateX(${(1 - p(at, at + 0.08)) * -24}px)` }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: mix(T.panel, color, 0.2), border: `2px solid ${color}`, color, fontFamily: MONO, fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>{i + 1}</div>
              <div style={{ fontFamily: SANS, fontSize: 29, color: T.text }}>{it}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 200, right: 200, top: 866, textAlign: "center", fontFamily: SANS, fontStyle: "italic", fontWeight: 700, fontSize: 38,
        color, opacity: p(0.8, 0.9), textShadow: `0 0 40px ${mix(T.bg0, color, 0.5 + Math.sin(frame * 0.06) * 0.2)}` }}>{closer}</div>
      <Progress p={p(0, 1)} color={color} />
    </Stage>
  );
};

// ---------------------------------------------------------------- router
export const MWScene: React.FC<{ variant: string; [k: string]: unknown }> = ({ variant, ...props }) => {
  const v = variant.replace(/^mw_/, "");
  switch (v) {
    case "title": return <TitleScene {...props} />;
    case "divider": return <DividerScene {...props} />;
    case "statement": return <StatementScene {...props} />;
    case "macro": return <MacroScene {...props} />;
    case "investor": return <InvestorScene {...props} />;
    case "bars": return <BarsScene {...props} />;
    case "checklist": return <ChecklistScene {...props} />;
    case "case": return <CaseScene {...props} />;
    case "quote": return <QuoteScene {...props} />;
    case "recap": return <RecapScene {...props} />;
    default: return <TitleScene {...props} />;
  }
};
