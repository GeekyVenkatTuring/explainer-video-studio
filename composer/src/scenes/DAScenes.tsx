/**
 * DAScenes.tsx — "Daily Trading Algorithms", ADEPT (visible rail) + Feynman edition. Prefix `da`.
 * Rewrite of the fast `dta` video: ONE concept per beat, walked Analogy→Diagram→Example→Plain→
 * Technical. Every teaching scene carries the ADEPT rail + 5-line ledger (gold MET) that light up
 * stage by stage, while the left panel builds the real, COMPUTED diagram. Feynman: everyday words,
 * intuition first, jargon last. Slow pace (build_adept.py). Facts restricted to RESEARCH.md; strategy
 * charts are synthetic illustrations. Education, NOT investment advice.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { makeTheme, mix, MONO, SANS, useP, usePop, rnd, Stage, Bg, Head, Kicker, Foot, Flow } from "../lib/primitives";

const T = makeTheme({ bg0: "#040711", bg1: "#081221", bg2: "#0D1C31", panel: "#111E34",
  text: "#ECF7FF", muted: "#91A6BD", line: "rgba(255,255,255,.09)", accent: "#38BDF8" });
const DATA = "#38BDF8", BUY = "#34D399", RISK = "#FB7185", SIG = "#FBBF24", EXEC = "#A78BFA", MET = "#E9D8A6";
type P = (a: number, b: number) => number;

// ── computed synthetic series (rule 3: compute the real thing) ───────────────
type Bar = { o: number; h: number; l: number; c: number; v: number };
const price = (seed: number, n = 56, drift = 0.12): Bar[] => {
  let x = 100; return Array.from({ length: n }, (_, i) => {
    const o = x, d = (rnd(i, 3, seed) - 0.48) * 3.2 + drift + (i > 32 ? drift * 0.5 : 0);
    const c = Math.max(35, o + d), h = Math.max(o, c) + 0.5 + rnd(i, 8, seed) * 2, l = Math.min(o, c) - 0.5 - rnd(i, 9, seed) * 2;
    x = c; return { o, h, l, c, v: 80 + Math.round(rnd(i, 6, seed) * 150) };
  });
};
const sma = (x: number[], n: number) => x.map((_, i) => i < n - 1 ? NaN : x.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n);
const std = (x: number[], n: number) => x.map((_, i) => {
  if (i < n - 1) return NaN; const s = x.slice(i - n + 1, i + 1), m = s.reduce((a, b) => a + b, 0) / n;
  return Math.sqrt(s.reduce((a, b) => a + (b - m) ** 2, 0) / n);
});
const MOM = price(31, 56, 0.16), MC = sma(MOM.map(b => b.c), 8), MS = sma(MOM.map(b => b.c), 22);
const MR = price(52, 56, -0.02), MRMA = sma(MR.map(b => b.c), 18), MRSD = std(MR.map(b => b.c), 18);
const ORB = price(91, 52, 0.14);
const ORB_HI = Math.max(...ORB.slice(0, 10).map(b => b.h)), ORB_LO = Math.min(...ORB.slice(0, 10).map(b => b.l));
const _obi = ORB.findIndex((b, i) => i >= 10 && b.c > ORB_HI), ORB_BRK = _obi < 0 ? 20 : _obi;
const VW = price(12, 52, 0.05);
const VWAP = (() => { let pv = 0, v = 0; return VW.map(x => { pv += x.c * x.v; v += x.v; return pv / v; }); })();
const PA = price(77, 52, 0.08), PB = PA.map((b, i) => ({ ...b, c: b.c * 0.93 + (rnd(i, 2, 5) - 0.5) * 4 }));
const SP = PA.map((b, i) => b.c - PB[i].c), SPM = sma(SP, 16), SPS = std(SP, 16);
const ZS = SP.map((v, i) => (SPS[i] ? (v - SPM[i]) / SPS[i] : 0));

// ════════════════════════════════════════════ ADEPT method layer (gold)
const STAGES = [
  { k: "A", w: "ANALOGY", d: "think of it like…" }, { k: "D", w: "DIAGRAM", d: "picture it" },
  { k: "E", w: "EXAMPLE", d: "work a real case" }, { k: "P", w: "PLAIN", d: "in plain words" },
  { k: "T", w: "TECHNICAL", d: "the real term" },
];
const TH = [0.2, 0.4, 0.6, 0.8];
const Rail: React.FC<{ p: P }> = ({ p }) => {
  const f = useCurrentFrame(); const cur = p(0, 1); const active = TH.filter(t => cur >= t).length;
  const x0 = 1140, y0 = 62, pw = 108, gap = 20, railW = 5 * pw + 4 * gap;
  return (<>
    <div style={{ position: "absolute", left: x0, top: y0 + 26, width: railW, height: 3, background: mix(T.panel, MET, 0.3), borderRadius: 2 }} />
    <div style={{ position: "absolute", left: x0, top: y0 + 26, width: Math.min(1, cur) * railW, height: 3, background: MET, borderRadius: 2, boxShadow: `0 0 8px ${MET}` }} />
    {STAGES.map((s, i) => { const done = i < active, on = i === active; return (
      <div key={i} style={{ position: "absolute", left: x0 + i * (pw + gap), top: y0, width: pw, height: 54, borderRadius: 12, boxSizing: "border-box",
        background: on ? MET : done ? mix(T.panel, MET, 0.28) : "transparent", border: `2px solid ${on || done ? MET : mix(T.line, MET, 0.5)}`,
        display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${on ? 1.08 : 1})`,
        boxShadow: on ? `0 0 ${14 + Math.sin(f * 0.12) * 5}px ${mix(T.bg0, MET, 0.6)}` : "none" }}>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: on ? T.bg0 : done ? MET : mix(T.muted, MET, 0.4) }}>{s.k}</span>
      </div>); })}
    <div style={{ position: "absolute", left: x0, top: y0 + 66, width: railW, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 19, color: MET, letterSpacing: 2 }}>
      {STAGES[active].w} · {STAGES[active].d}</div>
  </>);
};
type Ledg = { t: string; c: string };
const Ledger: React.FC<{ p: P; lines: Ledg[] }> = ({ p, lines }) => (<>
  {lines.map((ln, i) => { const at = 0.2 * i + 0.02, lo = p(at, at + 0.06); return (
    <div key={i} style={{ position: "absolute", left: 1140, top: 210 + i * 122, width: 680, height: 106, borderRadius: 14,
      background: mix(T.panel, ln.c, 0.07), border: `2px solid ${mix(T.line, ln.c, 0.5)}`, display: "flex", alignItems: "center", gap: 16,
      padding: "0 20px", boxSizing: "border-box", opacity: lo, transform: `translateX(${(1 - lo) * 18}px)` }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: mix(T.panel, MET, 0.2), border: `2px solid ${MET}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 22, color: MET }}>{STAGES[i].k}</div>
      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: T.text, lineHeight: 1.26 }}>{ln.t}</span>
    </div>); })}
</>);
const Progress: React.FC<{ dur?: number; c?: string }> = ({ dur, c = MET }) => {
  const p = useP(dur); return <div style={{ position: "absolute", bottom: 0, left: 0, height: 5, width: interpolate(p(0, 1), [0, 1], [0, 1920]), background: c, opacity: 0.8 }} />;
};
const Teach: React.FC<{ dur?: number; kicker: string; title: string; color: string; lines: Ledg[]; foot: string; children: React.ReactNode }> =
({ dur, kicker, title, color, lines, foot, children }) => { const p = useP(dur); return (
  <AbsoluteFill><Bg theme={T} accent={color} /><Stage>
    <div style={{ position: "absolute", left: 100, top: 50, width: 1000 }}>
      <Kicker theme={T} text={kicker} color={color} o={p(0.03, 0.12)} />
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: T.text, marginTop: 8, letterSpacing: -1, opacity: p(0.03, 0.12) }}>{title}</div>
    </div>
    <Rail p={p} /><Ledger p={p} lines={lines} />
    <div style={{ position: "absolute", left: 100, top: 236, width: 960, height: 566 }}>{children}</div>
    <Foot theme={T} p={p(0.86, 0.95)}>{foot}</Foot><Progress dur={dur} />
  </Stage></AbsoluteFill>); };

// ── left-panel candlestick chart, scaled to fit beside the ledger ────────────
const Candles: React.FC<{ p: P; bars: Bar[]; overlays?: { v: number[]; c: string }[]; marks?: number[];
  range?: { hi: number; lo: number; b: number; c: string }; tagColor?: string }> =
({ p, bars, overlays = [], marks = [], range, tagColor = SIG }) => {
  const x0 = 20, y0 = 30, w = 900, h = 420;
  const allV = [...bars.map(b => b.l), ...bars.map(b => b.h), ...overlays.flatMap(o => o.v.filter(Number.isFinite))];
  const lo = Math.min(...allV) - 2, hi = Math.max(...allV) + 2;
  const yy = (v: number) => y0 + h - (v - lo) / (hi - lo) * h, xx = (i: number) => x0 + i * w / (bars.length - 1);
  const show = Math.floor(Math.max(0, Math.min(1, p(0.24, 0.8))) * bars.length);
  return (<>
    <div style={{ position: "absolute", right: 6, top: -8, fontFamily: MONO, fontSize: 16, fontWeight: 800, color: T.bg0, background: tagColor, borderRadius: 7, padding: "6px 11px" }}>ILLUSTRATIVE · SYNTHETIC DATA</div>
    {range && <div style={{ position: "absolute", left: xx(0), top: yy(range.hi), width: xx(9) - xx(0), height: yy(range.lo) - yy(range.hi),
      background: mix(T.panel, range.c, 0.1), border: `2px dashed ${range.c}`, opacity: p(0.3, 0.44) }} />}
    <svg width={960} height={520} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {bars.slice(0, show).map((b, i) => { const c = b.c >= b.o ? BUY : RISK; return (
        <g key={i}><line x1={xx(i)} y1={yy(b.h)} x2={xx(i)} y2={yy(b.l)} stroke={c} strokeWidth={2} />
          <rect x={xx(i) - 5} y={yy(Math.max(b.o, b.c))} width={10} height={Math.max(3, Math.abs(yy(b.o) - yy(b.c)))} fill={c} rx={2} /></g>); })}
      {overlays.map((o, j) => <polyline key={j} fill="none" stroke={o.c} strokeWidth={4}
        points={o.v.slice(0, show).map((v, i) => Number.isFinite(v) ? `${xx(i)},${yy(v)}` : "").filter(Boolean).join(" ")} />)}
      {marks.filter(m => m < show).map((m, j) => <polygon key={j} points={`${xx(m)},${yy(bars[m].h) - 12} ${xx(m) - 9},${yy(bars[m].h) - 28} ${xx(m) + 9},${yy(bars[m].h) - 28}`} fill={SIG} />)}
    </svg>
  </>);
};
const Note: React.FC<{ p: P; t: string; c?: string }> = ({ p, t, c = SIG }) =>
  <div style={{ position: "absolute", left: 20, top: 500, fontFamily: MONO, fontSize: 22, color: c, opacity: p(0.5, 0.62) }}>{t}</div>;

// ════════════════════════════════════════════ per-concept diagrams (left panel)
const Diagram: React.FC<{ kind: string; p: P }> = ({ kind, p }) => {
  const f = useCurrentFrame();
  if (kind === "momentum") return <><Candles p={p} bars={MOM} overlays={[{ v: MC, c: BUY }, { v: MS, c: SIG }]} marks={[MC.findIndex((v, i) => i > 24 && Number.isFinite(v) && v > MS[i])].filter(m => m > 0)} /><Note p={p} t="FAST SMA crosses SLOW SMA → signal" /></>;
  if (kind === "meanrev") return <><Candles p={p} bars={MR} overlays={[{ v: MRMA.map((v, i) => v + 2 * (MRSD[i] || 0)), c: RISK }, { v: MRMA, c: SIG }, { v: MRMA.map((v, i) => v - 2 * (MRSD[i] || 0)), c: BUY }]} /><Note p={p} t="Band poke ≠ guaranteed reversal" /></>;
  if (kind === "breakout") return <><Candles p={p} bars={ORB} range={{ hi: ORB_HI, lo: ORB_LO, b: 10, c: SIG }} marks={[ORB_BRK]} /><Note p={p} t="Opening range → break → stop" /></>;
  if (kind === "vwap") return <><Candles p={p} bars={VW} overlays={[{ v: VWAP, c: SIG }]} tagColor={EXEC} /><Note p={p} t="Slice the parent order · track VWAP" c={EXEC} /></>;
  if (kind === "loop") { const N = ["DATA", "SIGNAL", "RISK", "ORDER", "FILL"], C = [DATA, SIG, RISK, EXEC, BUY]; const hot = Math.floor(f / 16) % 5;
    return <>{N.map((s, i) => { const x = 10 + i * 190; return <React.Fragment key={s}>
      <div style={{ position: "absolute", left: x, top: 180, width: 150, height: 120, borderRadius: 14, boxSizing: "border-box", padding: "14px 12px",
        background: mix(T.panel, C[i], 0.14), border: `2px solid ${C[i]}`, opacity: p(0.04 + i * 0.07, 0.12 + i * 0.07), boxShadow: hot === i ? `0 0 16px ${mix(T.bg0, C[i], 0.6)}` : "none" }}>
        <div style={{ fontFamily: MONO, fontSize: 16, color: C[i], fontWeight: 800 }}>{String(i + 1).padStart(2, "0")}</div>
        <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 800, color: T.text, marginTop: 20 }}>{s}</div></div>
      {i < 4 && <div style={{ position: "absolute", left: x + 152, top: 232, color: C[i], fontSize: 30, opacity: p(0.1 + i * 0.07, 0.2 + i * 0.07) }}>→</div>}
    </React.Fragment>; })}
    <div style={{ position: "absolute", left: 10, top: 360, width: 900, fontFamily: MONO, fontSize: 20, color: MET, opacity: p(0.66, 0.78) }}>if price crosses the line → buy one lot</div></>; }
  if (kind === "market") { const rows = [["12.8%", "ALGO · NSE CASH · FY24", DATA], ["34.3%", "CO-LOCATION · NOT ALGO", EXEC], ["~70%", "ALGO · US EQUITIES · IMF", SIG]];
    return <>{rows.map((r, i) => <React.Fragment key={i}>
      <div style={{ position: "absolute", left: 20, top: 40 + i * 130, width: 300, fontFamily: SANS, fontWeight: 800, fontSize: 58, color: r[2] as string, opacity: p(0.08 + i * 0.12, 0.18 + i * 0.12) }}>{r[0]}</div>
      <div style={{ position: "absolute", left: 340, top: 66 + i * 130, width: 560, fontFamily: MONO, fontSize: 22, color: T.muted, opacity: p(0.1 + i * 0.12, 0.2 + i * 0.12) }}>{r[1]}</div>
    </React.Fragment>)}
    <div style={{ position: "absolute", left: 20, top: 448, fontFamily: MONO, fontSize: 20, color: RISK, opacity: p(0.62, 0.74) }}>India-wide / HFT share — UNVERIFIED</div></>; }
  if (kind === "pairs") { const x0 = 20, w = 900, y0 = 20, h = 300, ca = PA.map(b => b.c), cb = PB.map(b => b.c);
    const lo = Math.min(...ca, ...cb) - 2, hi = Math.max(...ca, ...cb) + 2, yy = (v: number) => y0 + h - (v - lo) / (hi - lo) * h, xx = (i: number) => x0 + i * w / (ca.length - 1);
    const show = Math.floor(Math.max(0, Math.min(1, p(0.24, 0.8))) * ca.length);
    const zy0 = 360, zh = 130, zmax = 3.2, zy = (z: number) => zy0 + zh / 2 - Math.max(-zmax, Math.min(zmax, z)) / zmax * (zh / 2);
    return <><div style={{ position: "absolute", right: 6, top: -8, fontFamily: MONO, fontSize: 16, fontWeight: 800, color: T.bg0, background: SIG, borderRadius: 7, padding: "6px 11px" }}>ILLUSTRATIVE · SYNTHETIC DATA</div>
      <svg width={960} height={520} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {[[ca, DATA], [cb, EXEC]].map((s, j) => <polyline key={j} fill="none" stroke={s[1] as string} strokeWidth={4} points={(s[0] as number[]).slice(0, show).map((v, i) => `${xx(i)},${yy(v)}`).join(" ")} />)}
        <line x1={x0} y1={zy(2)} x2={x0 + w} y2={zy(2)} stroke={RISK} strokeDasharray="6 6" strokeWidth={2} />
        <line x1={x0} y1={zy(-2)} x2={x0 + w} y2={zy(-2)} stroke={RISK} strokeDasharray="6 6" strokeWidth={2} />
        <line x1={x0} y1={zy(0)} x2={x0 + w} y2={zy(0)} stroke={T.line} strokeWidth={2} />
        <polyline fill="none" stroke={SIG} strokeWidth={4} points={ZS.slice(0, show).map((z, i) => `${xx(i)},${zy(z)}`).join(" ")} /></svg>
      <div style={{ position: "absolute", left: 20, top: 8, fontFamily: MONO, fontSize: 18, color: DATA, fontWeight: 800 }}>SERIES A</div>
      <div style={{ position: "absolute", left: 150, top: 8, fontFamily: MONO, fontSize: 18, color: EXEC, fontWeight: 800 }}>SERIES B</div>
      <Note p={p} t="Z-SCORE · trade the spread when |z| > 2" /></>; }
  if (kind === "making") return <div style={{ position: "absolute", left: 10, top: 60, width: 900, height: 380, borderRadius: 16, boxSizing: "border-box", padding: 34, background: mix(T.panel, EXEC, 0.08), border: `2px solid ${EXEC}`, opacity: p(0.08, 0.2) }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: T.text }}>Market making</div>
      <div style={{ fontFamily: MONO, fontSize: 34, color: BUY, marginTop: 54, letterSpacing: 2 }}>BID  ←  FAIR VALUE  →  ASK</div>
      <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 40 }}>Quote both sides. Earn the spread. Control inventory.</div>
      <div style={{ fontFamily: MONO, fontSize: 22, color: RISK, marginTop: 40 }}>RISK · adverse selection — informed flow hits a stale quote</div></div>;
  if (kind === "arb") return <div style={{ position: "absolute", left: 10, top: 60, width: 900, height: 380, borderRadius: 16, boxSizing: "border-box", padding: 34, background: mix(T.panel, SIG, 0.08), border: `2px solid ${SIG}`, opacity: p(0.08, 0.2) }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: T.text }}>Arbitrage</div>
      <div style={{ fontFamily: MONO, fontSize: 34, color: SIG, marginTop: 54, letterSpacing: 2 }}>CASH  ↔  FUTURES</div>
      <div style={{ fontFamily: SANS, fontSize: 26, color: T.muted, marginTop: 40 }}>Buy the cheap one, sell the dear one — lock the gap.</div>
      <div style={{ fontFamily: MONO, fontSize: 22, color: RISK, marginTop: 40 }}>RISK · only survives after funding, legging, and every cost</div></div>;
  if (kind === "sebi") { const it = [["4 FEB 2025", "SEBI framework", SIG], ["1 APR 2026", "all brokers", DATA], ["10 OPS", "per exchange / segment", BUY], ["ALGO ID", "tag every order", EXEC], ["STATIC IP + 2FA", "daily logout", RISK], ["≥5 YEARS", "audit trail", SIG]];
    return <>{it.map((v, i) => <div key={i} style={{ position: "absolute", left: 10 + (i % 3) * 305, top: 60 + Math.floor(i / 3) * 200, width: 285, height: 168, borderRadius: 12, boxSizing: "border-box", padding: 18, background: mix(T.panel, v[2] as string, 0.09), border: `2px solid ${v[2] as string}`, opacity: p(0.05 + i * 0.07, 0.13 + i * 0.07) }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: v[2] as string }}>{v[0]}</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: T.text, marginTop: 22 }}>{v[1]}</div></div>)}</>; }
  if (kind === "costs") { const g = [40, 62, 86, 112, 140, 170], n = g.map((x, i) => x - i * i * 3.4);
    return <><div style={{ position: "absolute", left: 20, top: 40, width: 880, height: 380, borderBottom: `3px solid ${T.line}`, borderLeft: `3px solid ${T.line}` }}>
      {g.map((x, i) => <React.Fragment key={i}><div style={{ position: "absolute", left: 40 + i * 140, bottom: 0, width: 52, height: x * 1.9, background: BUY, opacity: p(0.1, 0.42) }} />
        <div style={{ position: "absolute", left: 100 + i * 140, bottom: 0, width: 52, height: Math.max(3, n[i]) * 1.9, background: RISK, opacity: p(0.34, 0.62) }} /></React.Fragment>)}</div>
    <Note p={p} t="Gross (green) minus costs → net (red). Turnover → " /><div style={{ position: "absolute", left: 20, top: 462, fontFamily: MONO, fontSize: 20, color: RISK, opacity: p(0.6, 0.72) }}>SEBI FY22–24: 93% of 1cr+ individual F&O traders lost · ₹1.8L cr</div></>; }
  if (kind === "stack") { const s = ["DATA", "VALIDATE", "SIGNAL", "RISK", "OMS/RMS", "API", "EXCHANGE", "FILLS", "MONITOR", "EOD"], C = [DATA, DATA, SIG, RISK, EXEC, EXEC, BUY, BUY, RISK, SIG];
    return <>{s.map((x, i) => { const px = 10 + (i % 5) * 185, py = 100 + Math.floor(i / 5) * 200; return <React.Fragment key={x}>
      <div style={{ position: "absolute", left: px, top: py, width: 150, height: 108, borderRadius: 12, boxSizing: "border-box", padding: 12, background: mix(T.panel, C[i], 0.1), border: `2px solid ${C[i]}`, opacity: p(0.04 + i * 0.05, 0.11 + i * 0.05) }}>
        <div style={{ fontFamily: MONO, fontSize: 15, color: C[i] }}>{String(i + 1).padStart(2, "0")}</div>
        <div style={{ fontFamily: SANS, fontSize: 21, fontWeight: 800, color: T.text, marginTop: 14 }}>{x}</div></div>
      {i % 5 < 4 && <div style={{ position: "absolute", left: px + 152, top: py + 40, color: C[i], fontSize: 24, opacity: p(0.08 + i * 0.05, 0.18 + i * 0.05) }}>→</div>}</React.Fragment>; })}</>; }
  if (kind === "backtest") { const curve = (bad: boolean) => Array.from({ length: 60 }, (_, i) => bad ? (i < 34 ? 60 - i * 1.1 : 22 + (i - 34) * 0.15) : 60 - i * 0.62);
    const x0 = 20, y0 = 20, w = 880, h = 400, sx = (i: number) => x0 + i / 59 * w, sy = (v: number) => y0 + v * 6.2, show = Math.floor(p(0.24, 0.8) * 60);
    return <><svg width={960} height={470} style={{ position: "absolute", left: 0, top: 0 }}>
      <line x1={x0 + w * 0.56} y1={y0} x2={x0 + w * 0.56} y2={y0 + h} stroke={SIG} strokeDasharray="6 6" strokeWidth={2} />
      {[curve(true), curve(false)].map((v, j) => <polyline key={j} fill="none" stroke={j ? EXEC : BUY} strokeWidth={5} points={v.slice(0, show).map((z, i) => `${sx(i)},${sy(z)}`).join(" ")} />)}</svg>
    <div style={{ position: "absolute", left: 40, top: 452, fontFamily: MONO, fontSize: 19, color: BUY, opacity: p(0.5, 0.62) }}>IN-SAMPLE · looks great</div>
    <div style={{ position: "absolute", left: 560, top: 452, fontFamily: MONO, fontSize: 19, color: RISK, opacity: p(0.5, 0.62) }}>WALK-FORWARD · real test</div></>; }
  if (kind === "live") return <><div style={{ position: "absolute", left: 10, top: 30, width: 900, borderRadius: 14, boxSizing: "border-box", padding: "22px 26px", background: mix(T.panel, EXEC, 0.08), border: `2px solid ${EXEC}`, opacity: p(0.06, 0.16) }}>
      <pre style={{ fontFamily: MONO, fontSize: 24, lineHeight: 1.6, color: T.text, margin: 0 }}>
<span style={{ color: DATA }}>if</span> fast_sma {'>'} slow_sma:{"\n"}  want = long{"\n"}<span style={{ color: SIG }}>if</span> cash & margin & size & daily_loss <span style={{ color: SIG }}>ok</span>:{"\n"}  <span style={{ color: EXEC }}>send_tagged_order()</span>{"\n"}<span style={{ color: RISK }}>else</span>: reject_and_alert()</pre></div>
    <div style={{ position: "absolute", left: 10, top: 330, display: "flex", gap: 14, flexWrap: "wrap", width: 900 }}>
      {["STALE FEED", "REJECTED", "DUPLICATE", "LATENCY", "DAILY LOSS", "KILL SWITCH"].map((a, i) => <div key={a} style={{ fontFamily: MONO, fontSize: 19, fontWeight: 800, color: i === 5 ? T.bg0 : SIG, background: i === 5 ? RISK : mix(T.panel, SIG, 0.12), border: `2px solid ${i === 5 ? RISK : SIG}`, borderRadius: 9, padding: "12px 16px", opacity: p(0.4 + i * 0.06, 0.5 + i * 0.06) }}>{a}</div>)}</div></>;
  return null;
};

// ── ledger content per concept (A/D/E/P/T) ──────────────────────────────────
const L = (t: string, c: string): Ledg => ({ t, c });
const LINES: Record<string, { kicker: string; title: string; color: string; foot: string; lines: Ledg[] }> = {
  loop: { kicker: "WHAT A RULE DOES", title: "A Trading Algorithm Is Just a Rule", color: DATA, foot: "A recipe a computer follows exactly — no hope, no fear, no hesitation.",
    lines: [L("Like a vending machine — meet the condition, it acts, no emotion.", SIG), L("A loop: DATA → SIGNAL → RISK → ORDER → FILL.", DATA), L("\"If price crosses the line, buy one lot\" — once.", DATA), L("A rule that turns data into orders, then watches itself.", BUY), L("Algorithmic trading; access via DMA.", MET)] },
  market: { kicker: "MARKET STRUCTURE", title: "Not Everything Fast Is an Algo", color: DATA, foot: "Automation, speed, and access are three separate choices — don't blur them.",
    lines: [L("A highway: self-driving cars, a fast lane, a rented on-ramp.", DATA), L("Algo 12.8% vs co-location 34.3% (NSE cash, FY24); US ~70%.", DATA), L("A co-located order can still be placed by a human.", EXEC), L("Speed, access, and automation are different things.", BUY), L("HFT is a latency-sensitive subset; India-wide share unverified.", MET)] },
  momentum: { kicker: "STRATEGY · TREND", title: "Momentum — Ride a Move Underway", color: BUY, foot: "It only works while a trend lasts; in a flat market it churns and pays costs.",
    lines: [L("Like pushing a swing — push while it's already moving your way.", SIG), L("A fast moving average and a slow one, on the price.", BUY), L("Fast crosses above slow → go long; below → exit.", DATA), L("Ride a move that has already started.", BUY), L("Trend / momentum; failure mode = whipsaw in chop.", MET)] },
  meanrev: { kicker: "STRATEGY · REVERSION", title: "Mean Reversion — Snap Back", color: SIG, foot: "A stretched market can stretch further — cheap can always get cheaper.",
    lines: [L("Like a rubber band — stretch it too far, it snaps back.", SIG), L("Volatility bands drawn around a moving average.", SIG), L("Price pokes the lower band / RSI low → possible bounce.", BUY), L("Bet an extreme move returns toward the average.", BUY), L("Mean reversion; failure mode = a real trend keeps going.", MET)] },
  breakout: { kicker: "STRATEGY · BREAKOUT", title: "Breakout — Escape the Range", color: BUY, foot: "Many breakouts are false — the stop, decided first, is what bounds the loss.",
    lines: [L("Like water behind a dam — pressure builds, then it escapes.", SIG), L("The opening range: the first window's high and low.", DATA), L("Price breaks the high → enter; stop sits just below.", BUY), L("Trade the moment price escapes a quiet range.", BUY), L("Opening-range breakout; failure = false breakout / gap.", MET)] },
  vwap: { kicker: "STRATEGY · EXECUTION", title: "VWAP — How You Buy, Not What", color: EXEC, foot: "This isn't a bet on direction — it's about not moving the price against yourself.",
    lines: [L("Like buying a huge order in small sips, not one gulp.", SIG), L("A VWAP line the child orders try to track.", EXEC), L("One big parent order split into many small slices.", DATA), L("It's about HOW you trade, cutting your own footprint.", BUY), L("VWAP / TWAP execution — not directional alpha.", MET)] },
  pairs: { kicker: "STRATEGY · RELATIVE VALUE", title: "Pairs — Trade the Gap, Not the Market", color: DATA, foot: "The bet is neutral to the market — but not to a relationship that can simply break.",
    lines: [L("Like two dancers who usually move together — watch the gap between them.", SIG), L("Track the spread between two related names, and its z-score.", DATA), L("When the z-score passes two, go long one leg, short the other.", BUY), L("You bet the pair snaps back to its normal distance.", BUY), L("Statistical arbitrage; the danger is a broken relationship.", MET)] },
  making: { kicker: "STRATEGY · LIQUIDITY", title: "Market Making — Earn the Spread", color: EXEC, foot: "The maker's nightmare is adverse selection — being picked off by someone who knows more.",
    lines: [L("Like a shopkeeper — buy at the bid, sell at the ask, keep the margin.", SIG), L("Quote a bid and an ask around a fair-value estimate.", EXEC), L("Both sides trade → you pocket the spread and manage inventory.", BUY), L("You get paid to provide liquidity, not to predict direction.", BUY), L("Market making; risk = adverse selection on a stale quote.", MET)] },
  arb: { kicker: "STRATEGY · ARBITRAGE", title: "Arbitrage — Lock a Price Gap", color: SIG, foot: "The apparent free lunch is eaten by funding, borrow, taxes, and execution.",
    lines: [L("Like buying cheaper in one bazaar to sell dearer in another.", SIG), L("Compare two prices for the same value — say cash vs futures.", SIG), L("Buy the cheap leg, sell the dear leg — only if it beats costs.", DATA), L("A tiny locked gap, chased by very fast competitors.", BUY), L("Cash-futures arbitrage; basis, legging, and funding risk.", MET)] },
  sebi: { kicker: "INDIA REALITY · SEBI/NSE", title: "Your Bot Needs a Licence Plate", color: SIG, foot: "The rules are for traceability and supervision — never a promise of profit.",
    lines: [L("Like a driving licence and number plate for your bot.", SIG), L("Dates, a rate cap, an ID, a static IP, and controls.", DATA), L("At or below 10 orders/sec → a generic Algo ID; above → register.", BUY), L("Every bot must be identified, rate-limited, supervised.", EXEC), L("SEBI retail-algo framework; all brokers from 1 Apr 2026.", MET)] },
  costs: { kicker: "INDIA REALITY · COSTS", title: "Costs Decide If Turnover Survives", color: RISK, foot: "Automation repeats a rule faster — a bad rule, or ignored costs, is automated too.",
    lines: [L("Every trade leaks a little through friction — a leaky bucket.", SIG), L("Gross returns fall into net after each cost.", RISK), L("STT 0.05%/0.15% + ₹20 brokerage + 18% GST (Zerodha eg).", DATA), L("Automation is not an edge; costs decide survival.", BUY), L("SEBI FY22–24: 93% of individual F&O traders lost money.", MET)] },
  stack: { kicker: "BUILD · THE STACK", title: "Code Is One Part of a System", color: EXEC, foot: "A kill switch is part of the design, not an emergency afterthought.",
    lines: [L("Like a factory line — with a foreman and an emergency stop.", SIG), L("Data → validate → signal → risk → route → fills → monitor.", EXEC), L("Every hand-off is observable; the kill switch is tested.", DATA), L("The code is one part; the controls make it a system.", BUY), L("OMS / RMS, reconciliation, kill switch.", MET)] },
  backtest: { kicker: "BUILD · TESTING", title: "A Backtest Challenges the Idea", color: SIG, foot: "If a result survives only one narrow setting, it is fragile — not proven.",
    lines: [L("Like a dress rehearsal versus opening night.", SIG), L("In-sample curve (great) vs walk-forward curve (real).", BUY), L("Split train/validation/test; model costs; no look-ahead.", DATA), L("A test attacks the idea; it doesn't sell it.", BUY), L("Overfitting; survivorship and look-ahead bias.", MET)] },
  live: { kicker: "BUILD · GOING LIVE", title: "Checks Before Takeoff", color: RISK, foot: "The strongest line of code is often the one that prevents a trade.",
    lines: [L("Like a pilot's pre-flight checklist before takeoff.", SIG), L("Risk checks sit BEFORE the order is ever sent.", RISK), L("Check cash, margin, size, daily-loss — then send tagged.", DATA), L("Paper-trade first, size small, monitor, be ready to stop.", BUY), L("Pre-trade RMS; discipline beats clever code.", MET)] },
};

// ════════════════════════════════════════════ non-teaching scenes
const Title: React.FC<{ dur?: number }> = ({ dur }) => { const p = useP(dur), pop = usePop(dur);
  return <AbsoluteFill><Bg theme={T} accent={DATA} /><Stage>
    <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 22, color: DATA, letterSpacing: 8, opacity: p(0.04, 0.14) }}>DAILY TRADING ALGORITHMS · FROM FIRST PRINCIPLES · THE ADEPT METHOD</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 288, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 104, color: T.text, letterSpacing: -3, opacity: p(0.1, 0.22), transform: `scale(${0.92 + pop(0.1) * 0.08})` }}>Trading Algorithms</div>
    <div style={{ position: "absolute", left: 560, right: 560, top: 430, height: 5, borderRadius: 3, background: DATA, transform: `scaleX(${p(0.24, 0.5)})` }} />
    <div style={{ position: "absolute", left: 300, right: 300, top: 470, textAlign: "center", fontFamily: SANS, fontSize: 32, color: T.muted, opacity: p(0.4, 0.56) }}>What the machines do · the strategies · the India reality · build one</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", gap: 16, opacity: p(0.6, 0.76) }}>
      {STAGES.map((s, i) => <div key={i} style={{ width: 150, borderRadius: 12, border: `2px solid ${MET}`, background: mix(T.panel, MET, 0.12), padding: "12px 0", textAlign: "center", opacity: p(0.6 + i * 0.03, 0.7 + i * 0.03) }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: MET }}>{s.k}</div>
        <div style={{ fontFamily: MONO, fontSize: 13, color: mix(T.muted, MET, 0.5), letterSpacing: 1 }}>{s.w}</div></div>)}</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontFamily: SANS, fontSize: 24, color: T.muted, opacity: p(0.7, 0.84) }}>Educational — not investment advice.</div>
    <Progress dur={dur} c={DATA} /></Stage></AbsoluteFill>; };

const Hook: React.FC<{ dur?: number }> = ({ dur }) => { const p = useP(dur); const f = useCurrentFrame();
  return <AbsoluteFill><Bg theme={T} accent={SIG} /><Stage>
    <Head theme={T} kicker="THE PUZZLE" title="Who Sent the Order?" color={SIG} />
    <div style={{ position: "absolute", left: 160, top: 320, width: 1600, display: "flex", justifyContent: "space-between" }}>
      {["A RULE", "A COMPUTER", "THE EXCHANGE"].map((s, i) => <React.Fragment key={s}>
        <div style={{ width: 420, height: 200, borderRadius: 16, boxSizing: "border-box", padding: 26, background: mix(T.panel, [SIG, EXEC, BUY][i], 0.12), border: `2px solid ${[SIG, EXEC, BUY][i]}`, opacity: p(0.1 + i * 0.16, 0.2 + i * 0.16) }}>
          <div style={{ fontFamily: MONO, fontSize: 20, color: [SIG, EXEC, BUY][i] }}>STEP 0{i + 1}</div>
          <div style={{ fontFamily: SANS, fontSize: 44, fontWeight: 800, color: T.text, marginTop: 40 }}>{s}</div></div>
        {i < 2 && <div style={{ alignSelf: "center", color: DATA, fontSize: 40, opacity: 0.5 + Math.sin(f * 0.1 + i) * 0.3 }}>→</div>}</React.Fragment>)}</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", fontFamily: SANS, fontSize: 40, fontWeight: 800, color: T.text, opacity: p(0.5, 0.62) }}>An order hit the exchange in a blink. A human didn't click — a rule did.</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontFamily: MONO, fontSize: 26, color: DATA, opacity: p(0.66, 0.78) }}>By FY24, 12.8% of NSE cash-market turnover was algo.</div>
    <Foot theme={T} p={p(0.82, 0.92)}>We'll build the whole idea from scratch — every concept from something you already know.</Foot>
    <Progress dur={dur} c={SIG} /></Stage></AbsoluteFill>; };

const Div: React.FC<{ dur?: number; n?: number; title?: string; sub?: string; color?: string }> = ({ dur, n = 1, title = "", sub = "", color = DATA }) => {
  const p = useP(dur), f = useCurrentFrame();
  return <AbsoluteFill><Bg theme={T} accent={color} /><Stage>
    <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color, letterSpacing: 10, opacity: p(0.05, 0.16) }}>PART {String(n).padStart(2, "0")}</div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 84, color: T.text, letterSpacing: -2, marginTop: 16, opacity: p(0.12, 0.26) }}>{title}</div>
      <div style={{ height: 5, width: interpolate(p(0.22, 0.52), [0, 1], [0, 460]), background: color, borderRadius: 3, margin: "22px auto" }} />
      <div style={{ fontFamily: SANS, fontSize: 31, color: T.muted, opacity: p(0.32, 0.48) }}>{sub}</div></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", gap: 14, opacity: p(0.32, 0.5) }}>
      {[1, 2, 3, 4].map(i => <div key={i} style={{ width: i === n ? 44 : 14, height: 14, borderRadius: 8, background: i <= n ? color : mix(T.panel, color, 0.15), border: `1.5px solid ${i <= n ? color : T.line}`, opacity: i === n ? 0.7 + Math.sin(f * 0.1) * 0.3 : 1 }} />)}</div>
    <Progress dur={dur} c={color} /></Stage></AbsoluteFill>; };

const Recap: React.FC<{ dur?: number; items?: string[]; closer?: string }> = ({ dur, items = [], closer = "" }) => { const p = useP(dur);
  return <AbsoluteFill><Bg theme={T} accent={DATA} /><Stage>
    <Head theme={T} kicker="RECAP · THE WHOLE MAP" title="Daily Trading Algorithms" color={DATA} />
    <div style={{ position: "absolute", left: 260, top: 236, width: 1400 }}>
      {items.slice(0, 7).map((x, i) => <div key={i} style={{ height: 74, fontFamily: SANS, fontSize: 29, color: T.text, opacity: p(0.05 + i * 0.08, 0.12 + i * 0.08) }}>
        <span style={{ fontFamily: MONO, color: DATA, marginRight: 18 }}>{String(i + 1).padStart(2, "0")}</span>{x}</div>)}
      <div style={{ fontFamily: SANS, fontStyle: "italic", fontWeight: 800, fontSize: 36, color: SIG, marginTop: 12, opacity: p(0.74, 0.86) }}>{closer}</div>
      <div style={{ fontFamily: MONO, fontSize: 19, color: T.muted, marginTop: 24, opacity: p(0.82, 0.94) }}>Educational information from public sources, not investment advice. Consult a SEBI-registered adviser.</div></div>
    <Progress dur={dur} c={DATA} /></Stage></AbsoluteFill>; };

const Teachable: React.FC<{ dur?: number; kind: string }> = ({ dur, kind }) => { const c = LINES[kind]; const p = useP(dur);
  return <Teach dur={dur} kicker={c.kicker} title={c.title} color={c.color} lines={c.lines} foot={c.foot}><Diagram kind={kind} p={p} /></Teach>; };

export const DAScene: React.FC<{ variant: string; [key: string]: unknown }> = ({ variant, ...rest }) => {
  if (variant === "da_title") return <Title {...(rest as any)} />;
  if (variant === "da_hook") return <Hook {...(rest as any)} />;
  if (variant === "da_div") return <Div {...(rest as any)} />;
  if (variant === "da_recap") return <Recap {...(rest as any)} />;
  return <Teachable dur={(rest as any).dur} kind={variant.replace("da_", "")} />;
};
export default DAScene;
