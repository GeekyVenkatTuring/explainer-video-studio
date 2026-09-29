/**
 * TAWScenes.tsx — "Technical Analysis: The Complete NSE Workbook" scene set.
 *
 * 7-chapter course built from the NCFM Technical Analysis Module. One visual
 * identity: dark navy + semantic accents (green=bullish/demand, rose=bearish/
 * supply, gold=price/hero, cyan=indicators/computed). Recurring motif: the
 * candlestick trio + chart frame.
 *
 * Captions are ON for this video (burned-in, bottom band) so NO scene uses
 * `Foot`; content stays ≤ y900. Every scene carries a SceneProgress bar.
 * Indicators (SMA/EMA/RSI/MACD/Stoch/%R/MFI/Bollinger) are really computed at
 * module scope over a deterministic synthetic series — compute the real thing.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  makeTheme, mix, useP, usePop, rnd, MONO, SANS,
  Bg, Stage, Kicker, Head, Card, Flow, Wire, Counter,
} from "../lib/primitives";

// ---------------------------------------------------------------- identity
const T = makeTheme({ accent: "#F5B841" });
const A = {
  bull: "#34D399", // bullish / demand / support
  bear: "#FB7185", // bearish / supply / resistance
  gold: "#F5B841", // price / hero
  ind: "#5EEAD4",  // indicators / tools / computed
  violet: "#A78BFA",
};

// ---------------------------------------------------------------- shared
/** Universal "this is playing" signal — fills L→R across the whole beat. */
const SceneProgress: React.FC<{ dur?: number; color?: string }> = ({ dur, color }) => {
  const p = useP(dur);
  return (
    <div style={{ position: "absolute", left: 100, bottom: 20, width: 1720, height: 5, borderRadius: 3, background: T.line }}>
      <div style={{
        width: `${p(0, 1) * 100}%`, height: "100%", borderRadius: 3,
        background: color || A.gold, boxShadow: `0 0 12px ${color || A.gold}`, opacity: 0.9,
      }} />
    </div>
  );
};

type OHLC = { o: number; h: number; l: number; c: number };

/** Candlestick renderer on a [pLo..pHi] price scale inside a pixel box. */
const Candles: React.FC<{
  candles: OHLC[]; x0: number; step: number; bw: number;
  pLo: number; pHi: number; yTop: number; yBot: number;
  reveal: number[]; glowIdx?: number;
}> = ({ candles, x0, step, bw, pLo, pHi, yTop, yBot, reveal, glowIdx }) => {
  const frame = useCurrentFrame();
  const Y = (v: number) => yBot - ((v - pLo) / (pHi - pLo)) * (yBot - yTop);
  return (
    <>
      {candles.map((d, i) => {
        const up = d.c >= d.o;
        const col = up ? A.bull : A.bear;
        const bt = Y(Math.max(d.o, d.c));
        const bh = Math.max(7, Math.abs(Y(d.o) - Y(d.c)));
        const cx = x0 + i * step;
        const o = reveal[i] ?? 1;
        return (
          <g key={i} opacity={o} transform={`translateY(${(1 - o) * 16})`}>
            <rect x={cx - 2} y={Y(d.h)} width={4} height={Math.max(2, Y(d.l) - Y(d.h))} fill={col} />
            <rect
              x={cx - bw / 2} y={bt} width={bw} height={bh}
              fill={up ? mix(T.panel, A.bull, 0.35) : mix(T.panel, A.bear, 0.75)}
              stroke={col} strokeWidth={3}
              opacity={glowIdx === i ? 0.75 + Math.sin(frame * 0.09) * 0.25 : 1}
            />
          </g>
        );
      })}
    </>
  );
};

/** Progressive polyline of a value series inside a plot box. */
const PriceLine: React.FC<{
  v: number[]; lo: number; hi: number; x0: number; x1: number; yTop: number; yBot: number;
  prog: number; color: string; w?: number; dash?: boolean; march?: boolean;
}> = ({ v, lo, hi, x0, x1, yTop, yBot, prog, color, w = 4, dash, march }) => {
  const frame = useCurrentFrame();
  const n = v.length;
  const shown = Math.max(2, Math.round(n * Math.max(0, Math.min(1, prog))));
  const pts = v.slice(0, shown).map((val, i) => {
    const px = x0 + (i / (n - 1)) * (x1 - x0);
    const py = yBot - ((val - lo) / (hi - lo)) * (yBot - yTop);
    return `${px},${py}`;
  }).join(" ");
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={w}
        strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray={dash ? `${w * 2.4} ${w * 2.6}` : undefined}
        strokeDashoffset={march && !dash ? -frame * 1.2 : undefined} />
    </svg>
  );
};

/** Plot panel: frame + faint gridlines + optional axis labels. */
const Panel: React.FC<{ x: number; y: number; w: number; h: number; o?: number; color?: string }> =
  ({ x, y, w, h, o = 1, color }) => (
    <div style={{
      position: "absolute", left: x, top: y, width: w, height: h,
      borderRadius: 18, border: `2px solid ${color || T.line}`,
      background: `linear-gradient(180deg, ${mix(T.bg1, T.panel, 0.6)}, ${T.bg1})`, opacity: o,
      overflow: "hidden",
    }}>
      {[0.25, 0.5, 0.75].map((f) => (
        <div key={f} style={{ position: "absolute", left: 0, right: 0, top: h * f, height: 1, background: T.line }} />
      ))}
    </div>
  );

const ChipRow: React.FC<{ chips: { text: string; c: string }[]; p: (a: number, b: number) => number; baseAt: number }> =
  ({ chips, p, baseAt }) => (
    <div style={{ position: "absolute", left: 1240, top: 560, width: 560 }}>
      {chips.map((c, i) => {
        const at = baseAt + i * 0.055;
        return (
          <div key={i} style={{
            fontFamily: MONO, fontWeight: 700, fontSize: 22, lineHeight: 1.3,
            color: c.c, background: mix(T.panel, c.c, 0.1),
            border: `2px solid ${c.c}`, borderRadius: 12,
            padding: "10px 16px", marginBottom: 12,
            opacity: p(at, at + 0.06), transform: `translateX(${(1 - p(at, at + 0.06)) * 24}px)`,
          }}>{c.text}</div>
        );
      })}
    </div>
  );

// ---------------------------------------------------------------- data (module scope)
// Deterministic synthetic market — no Math.random anywhere.
const mkSeries = () => {
  const n = 130;
  const open: number[] = [], high: number[] = [], low: number[] = [], close: number[] = [], vol: number[] = [];
  for (let i = 0; i < n; i++) {
    const wave = Math.sin(i * 0.11) * 9 + Math.sin(i * 0.021 + 1.3) * 24 + i * 0.34;
    const c = 96 + wave + (rnd(i, 7, 11) - 0.5) * 6;
    const o = i === 0 ? c : close[i - 1] + (rnd(i, 1, 5) - 0.5) * 3;
    high.push(Math.max(o, c) + rnd(i, 2, 5) * 5 + 1.2);
    low.push(Math.min(o, c) - rnd(i, 4, 5) * 5 - 1.2);
    open.push(o); close.push(c);
    vol.push(800 + rnd(i, 9, 13) * 700 + Math.abs(wave) * 8);
  }
  return { open, high, low, close, vol };
};
const MKT = mkSeries();

const smaCalc = (v: number[], n: number): number[] => {
  const out: number[] = new Array(v.length).fill(NaN);
  let s = 0;
  for (let i = 0; i < v.length; i++) {
    s += v[i];
    if (i >= n) s -= v[i - n];
    if (i >= n - 1) out[i] = s / n;
  }
  return out;
};
const emaCalc = (v: number[], n: number): number[] => {
  const k = 2 / (n + 1);
  const out: number[] = new Array(v.length).fill(NaN);
  let s = 0;
  for (let i = 0; i < v.length; i++) {
    if (i < n - 1) { s += v[i]; continue; }
    if (i === n - 1) { out[i] = (s + v[i]) / n; continue; }
    out[i] = v[i] * k + out[i - 1] * (1 - k);
  }
  return out;
};
const rsiCalc = (v: number[], n = 14): number[] => {
  const out: number[] = new Array(v.length).fill(NaN);
  let ag = 0, al = 0;
  for (let i = 1; i < v.length; i++) {
    const ch = v[i] - v[i - 1], g = Math.max(ch, 0), ls = Math.max(-ch, 0);
    if (i <= n) { ag += g / n; al += ls / n; if (i === n) out[i] = 100 - 100 / (1 + ag / (al || 1e-9)); }
    else { ag = (ag * (n - 1) + g) / n; al = (al * (n - 1) + ls) / n; out[i] = 100 - 100 / (1 + ag / (al || 1e-9)); }
  }
  return out;
};
const macdCalc = (v: number[]) => {
  const e12 = emaCalc(v, 12), e26 = emaCalc(v, 26);
  const start = 25;
  const line = v.map((_, i) => (i < start ? NaN : e12[i] - e26[i]));
  const valid = line.filter((x) => !isNaN(x));
  const sig = emaCalc(valid, 9);
  const signal = line.map(() => NaN);
  valid.forEach((_, j) => { signal[start + j] = sig[j]; });
  const hist = line.map((x, i) => (isNaN(x) || isNaN(signal[i]) ? NaN : x - signal[i]));
  return { line, signal, hist };
};
const stochCalc = (h: number[], l: number[], c: number[], n = 14) => {
  const k: number[] = new Array(c.length).fill(NaN);
  for (let i = n - 1; i < c.length; i++) {
    const hh = Math.max(...h.slice(i - n + 1, i + 1));
    const ll = Math.min(...l.slice(i - n + 1, i + 1));
    k[i] = ((c[i] - ll) / (hh - ll)) * 100;
  }
  const kv = k.filter((x) => !isNaN(x));
  const dRaw = smaCalc(kv, 3);
  const d = k.map(() => NaN);
  kv.forEach((_, j) => { d[j + n - 1] = dRaw[j]; });
  return { k, d };
};
const willRCalc = (h: number[], l: number[], c: number[], n = 14): number[] => {
  const out: number[] = new Array(c.length).fill(NaN);
  for (let i = n - 1; i < c.length; i++) {
    const hh = Math.max(...h.slice(i - n + 1, i + 1));
    const ll = Math.min(...l.slice(i - n + 1, i + 1));
    out[i] = ((hh - c[i]) / (hh - ll)) * -100;
  }
  return out;
};
const mfiCalc = (h: number[], l: number[], c: number[], vol: number[], n = 14): number[] => {
  const tp = c.map((_, i) => (h[i] + l[i] + c[i]) / 3);
  const out: number[] = new Array(c.length).fill(NaN);
  for (let i = n; i < c.length; i++) {
    let pos = 0, neg = 0;
    for (let j = i - n + 1; j <= i; j++) {
      const mf = tp[j] * vol[j];
      if (tp[j] > tp[j - 1]) pos += mf; else neg += mf;
    }
    out[i] = 100 - 100 / (1 + pos / (neg || 1e-9));
  }
  return out;
};
const bollCalc = (v: number[], n = 20) => {
  const mid = smaCalc(v, n);
  const up: number[] = new Array(v.length).fill(NaN), lo: number[] = new Array(v.length).fill(NaN);
  for (let i = n - 1; i < v.length; i++) {
    const win = v.slice(i - n + 1, i + 1);
    const m = mid[i];
    const sd = Math.sqrt(win.reduce((a, b) => a + (b - m) * (b - m), 0) / n);
    up[i] = m + 2 * sd; lo[i] = m - 2 * sd;
  }
  return { mid, up, lo };
};

const MA20 = smaCalc(MKT.close, 20);
const MA50 = smaCalc(MKT.close, 50);
const EMA20 = emaCalc(MKT.close, 20);
const RSI = rsiCalc(MKT.close);
const MACD = macdCalc(MKT.close);
const STOCH = stochCalc(MKT.high, MKT.low, MKT.close);
const WILLR = willRCalc(MKT.high, MKT.low, MKT.close);
const MFI = mfiCalc(MKT.high, MKT.low, MKT.close, MKT.vol);
const BOLL = bollCalc(MKT.close);

const mkPath = (ctrl: [number, number][], n = 110): number[] => {
  const out: number[] = [];
  for (let k = 0; k < n; k++) {
    const x = (k / (n - 1)) * (ctrl.length - 1);
    const i = Math.min(ctrl.length - 2, Math.floor(x));
    const t = x - i;
    const tt = (1 - Math.cos(t * Math.PI)) / 2;
    out.push(ctrl[i][1] * (1 - tt) + ctrl[i + 1][1] * tt);
  }
  return out;
};

// ---------------------------------------------------------------- title
const TitleScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const pop = usePop(dur);
  const parts = ["Foundations", "Candle Charts", "Pattern Study", "Indicators & Oscillators", "Trading Strategies", "Dow & Elliott Wave", "Psychology & Risk"];
  return (
    <Stage>
      {/* ambient motif: rising candle trio + drifting chart line, corners only */}
      <svg style={{ position: "absolute", left: 90, top: 130, opacity: 0.55 }} width={260} height={170}>
        {[{ h: 60, up: true }, { h: 95, up: false }, { h: 140, up: true }].map((d, i) => (
          <g key={i}>
            <rect x={30 + i * 78} y={160 - d.h} width={26} height={d.h * 0.55} fill={d.up ? A.bull : A.bear} rx={4}
              opacity={0.75 + Math.sin(frame * 0.05 + i) * 0.25} />
            <rect x={41 + i * 78} y={160 - d.h - 22} width={4} height={22} fill={d.up ? A.bull : A.bear} />
          </g>
        ))}
        <polyline points={`0,150 ${[40, 120, 90, 70, 130, 105, 160, 135].map((y, i) => `${15 + i * 36},${150 - y * 0.62}`).join(" ")} 250,58`}
          fill="none" stroke={A.gold} strokeWidth={3} opacity={0.7} strokeDasharray="7 10"
          strokeDashoffset={-frame * 0.9} />
      </svg>
      <svg style={{ position: "absolute", right: 90, top: 780, opacity: 0.45 }} width={300} height={180}>
        <polyline points={[70, 40, 85, 55, 30, 65, 95, 50, 120].map((y, i) => `${i * 37},${165 - y * 1.28}`).join(" ")}
          fill="none" stroke={A.ind} strokeWidth={3.5} strokeDasharray="8 11" strokeDashoffset={-frame * 1.1} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={60 + i * 90} cy={40 + Math.sin(frame * 0.03 + i * 2) * 14 + i * 38} r={7}
            fill={i % 2 ? A.bull : A.bear} opacity={0.7} />
        ))}
      </svg>
      <div style={{ textAlign: "center", transform: `scale(${0.94 + pop(0) * 0.06})` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Kicker theme={T} text="NSE NCFM WORKBOOK · FULL COURSE" cx />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 122, lineHeight: 1.02, letterSpacing: -3, color: T.text }}>
          Technical Analysis<div style={{ color: A.gold, textShadow: `0 0 80px ${mix(T.bg0, A.gold, 0.7)}` }}>The Complete Course</div>
        </div>
        <div style={{ height: 5, width: interpolate(p(0.14, 0.4), [0, 1], [0, 640]), background: `linear-gradient(90deg, ${A.gold}, ${A.ind})`, borderRadius: 3, margin: "30px auto" }} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, width: 1360, margin: "0 auto", marginTop: 8 }}>
          {parts.map((s, i) => {
            const at = 0.3 + i * 0.075;
            return (
              <div key={i} style={{
                fontFamily: MONO, fontWeight: 700, fontSize: 23, color: T.text,
                background: mix(T.panel, i % 2 ? A.ind : A.gold, 0.12),
                border: `1.5px solid ${mix(T.line, i % 2 ? A.ind : A.gold, 0.7)}`,
                borderRadius: 999, padding: "10px 22px",
                opacity: p(at, at + 0.07), transform: `translateY(${(1 - p(at, at + 0.07)) * 18}px)`,
              }}>{`0${i + 1} · ${s}`}</div>
            );
          })}
        </div>
      </div>
      <SceneProgress dur={dur} />
    </Stage>
  );
};

// ---------------------------------------------------------------- chapter title
const ChTitleScene: React.FC<{ dur?: number; n?: number; title?: string; sub?: string }> =
  ({ dur, n = 1, title = "", sub = "" }) => {
    const frame = useCurrentFrame();
    const p = useP(dur);
    return (
      <Stage>
        <BracketsBox color={A.gold} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: A.gold, letterSpacing: 10, opacity: p(0.04, 0.16) }}>CHAPTER {"0" + n}</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 98, color: T.text, letterSpacing: -2, marginTop: 18, opacity: p(0.12, 0.26), transform: `translateY(${(1 - p(0.12, 0.26)) * 30}px)` }}>{title}</div>
          <div style={{ height: 5, width: interpolate(p(0.22, 0.52), [0, 1], [0, 430]), background: A.gold, borderRadius: 3, margin: "26px auto" }} />
          <div style={{ fontFamily: SANS, fontSize: 33, color: T.muted, opacity: p(0.32, 0.48) }}>{sub}</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 850, display: "flex", justifyContent: "center", gap: 15, opacity: p(0.3, 0.46) }}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} style={{
              width: i === n ? 46 : 14, height: 14, borderRadius: 8,
              background: i <= n ? A.gold : mix(T.panel, A.gold, 0.15),
              border: `1.5px solid ${i <= n ? A.gold : T.line}`,
              opacity: i === n ? 0.7 + Math.sin(frame * 0.1) * 0.3 : 1,
            }} />
          ))}
        </div>
        <SceneProgress dur={dur} />
      </Stage>
    );
  };

// corner brackets + scan beam for full-bleed cards
const BracketsBox: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const b = Math.sin(frame * 0.05) * 5;
  return (
    <>
      {([[330, 290], [1330, 290], [330, 760], [1330, 760]] as [number, number][]).map(([bx, by], i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: bx + (i % 2 ? b : -b), top: by + (i > 1 ? b : -b), width: 54, height: 5, background: color, borderRadius: 3, opacity: 0.85 }} />
          <div style={{ position: "absolute", left: bx + (i % 2 ? b : -b), top: by + (i > 1 ? b : -b), width: 5, height: 54, background: color, borderRadius: 3, opacity: 0.85 }} />
        </React.Fragment>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- concept cards
interface ConceptCard { icon: string; label: string; sub?: string; c: string }
const ConceptScene: React.FC<{
  dur?: number; kicker?: string; title?: string; accent?: string;
  cards?: ConceptCard[]; note?: string;
}> = ({ dur, kicker = "", title = "", accent, cards = [], note }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const ac = accent || A.gold;
  const hot = p(0.6, 0.61) > 0.5 ? Math.floor(frame / 26) % cards.length : -1;
  const n = cards.length;
  const W = n <= 3 ? 500 : n === 4 ? 400 : 320;
  const GAP = n <= 3 ? 60 : 34;
  const totalW = n * W + (n - 1) * GAP;
  const X0 = (1920 - totalW) / 2;
  return (
    <Stage>
      <Head theme={T} kicker={kicker} title={title} color={ac} o={p(0, 0.06)} />
      {cards.map((cd, i) => {
        const step = 0.72 / Math.max(n, 1);
        const at = 0.08 + i * step;
        const o = p(at, at + 0.08);
        const active = hot === i && o >= 1;
        return (
          <div key={i} style={{
            position: "absolute", left: X0 + i * (W + GAP), top: 380, width: W, minHeight: 330,
            borderRadius: 22, padding: "30px 28px", boxSizing: "border-box",
            background: mix(T.panel, cd.c, active ? 0.2 : 0.08),
            border: `2.5px solid ${active ? cd.c : mix(T.line, cd.c, 0.55)}`,
            boxShadow: active ? `0 0 44px ${mix(T.bg0, cd.c, 0.4)}` : "none",
            opacity: o, transform: `translateY(${(1 - o) * 24}px)`,
          }}>
            <div style={{ fontSize: 62, lineHeight: 1 }}>{cd.icon}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 31, color: cd.c, marginTop: 18, lineHeight: 1.15 }}>{cd.label}</div>
            {cd.sub && <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 12, lineHeight: 1.35 }}>{cd.sub}</div>}
          </div>
        );
      })}
      {note && (
        <div style={{
          position: "absolute", left: 0, right: 0, top: 780, textAlign: "center",
          fontFamily: SANS, fontSize: 29, color: mix(T.text, T.muted, 0.25),
          opacity: p(0.78, 0.88),
        }}>{note}</div>
      )}
      <SceneProgress dur={dur} color={ac} />
    </Stage>
  );
};

// ---------------------------------------------------------------- candle anatomy
const AnatomyScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  // hero candle geometry (stage coords): wick 290→740, body 392→588
  const labelsBull = [
    { t: "HIGH — top of upper shadow", y: 288 },
    { t: "CLOSE — top of body", y: 386 },
    { t: "OPEN — bottom of body", y: 582 },
    { t: "LOW — bottom of lower shadow", y: 734 },
  ];
  return (
    <Stage>
      <Head theme={T} kicker="CANDLE CHARTS · ANATOMY" title="One candle tells the whole session" color={A.gold} o={p(0, 0.06)} />
      {/* bullish candle */}
      <Panel x={190} y={220} w={420} h={560} o={p(0.06, 0.14)} />
      <svg style={{ position: "absolute", left: 190, top: 220, opacity: p(0.12, 0.24) }} width={420} height={560}>
        <line x1={210} y1={70} x2={210} y2={520} stroke={A.bull} strokeWidth={5} />
        <rect x={168} y={172} width={84} height={196} fill={mix(T.panel, A.bull, 0.4)} stroke={A.bull} strokeWidth={4} rx={6}
          opacity={0.85 + Math.sin(frame * 0.05) * 0.15} />
      </svg>
      <div style={{ position: "absolute", left: 190, top: 800, width: 480, fontFamily: SANS, fontSize: 27, color: A.bull, opacity: p(0.64, 0.74) }}>
        Close ABOVE open — buying pressure won.
      </div>
      {labelsBull.map((lb, i) => {
        const at = 0.26 + i * 0.09;
        return (
          <React.Fragment key={i}>
            <Wire x1={404} y1={lb.y} x2={680} y2={lb.y} p={p(at, at + 0.05)} color={A.ind} w={2.5} arrow={false} />
            <div style={{
              position: "absolute", left: 692, top: lb.y - 15, fontFamily: MONO, fontSize: 23,
              color: A.ind, opacity: p(at + 0.03, at + 0.08),
            }}>{lb.t}</div>
          </React.Fragment>
        );
      })}
      {/* bearish counterpart */}
      <Panel x={1250} y={220} w={420} h={560} o={p(0.42, 0.5)} />
      <svg style={{ position: "absolute", left: 1250, top: 220, opacity: p(0.48, 0.58) }} width={420} height={560}>
        <line x1={210} y1={70} x2={210} y2={520} stroke={A.bear} strokeWidth={5} />
        <rect x={168} y={172} width={84} height={196} fill={mix(T.bg0, A.bear, 0.72)} stroke={A.bear} strokeWidth={4} rx={6} />
      </svg>
      {[["OPEN — top of body", 372], ["CLOSE — bottom of body", 572]].map(([t, yy], i) => (
        <div key={i} style={{
          position: "absolute", left: 1290, top: yy as number, fontFamily: MONO, fontSize: 23,
          color: A.bear, opacity: p(0.56 + i * 0.08, 0.62 + i * 0.08),
        }}>{t}</div>
      ))}
      <div style={{
        position: "absolute", left: 1250, top: 800, width: 480, fontFamily: SANS, fontSize: 27,
        color: A.bear, opacity: p(0.72, 0.82),
      }}>Close BELOW open — selling pressure won.</div>
      <SceneProgress dur={dur} color={A.gold} />
    </Stage>
  );
};

// ---------------------------------------------------------------- pattern scenes
interface PatternProps {
  dur?: number; kicker?: string; title?: string;
  pre?: number[];
  candles?: OHLC[];
  range?: [number, number];
  anns?: { x: number; y: number; text: string; c: string }[];
  verdict?: { text: string; c: string };
  crit?: { text: string; c: string }[];
  fam?: { label: string; candles: OHLC[]; c: string }[];
}
const PatternScene: React.FC<PatternProps> = ({
  dur, kicker = "", title = "", pre, candles = [], range = [0, 100], anns = [],
  verdict, crit = [], fam,
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const [lo, hi] = range;
  if (fam) {
    const W = 400, GAP = 32;
    const total = fam.length * W + (fam.length - 1) * GAP;
    const X0 = (1920 - total) / 2;
    return (
      <Stage>
        <Head theme={T} kicker={kicker} title={title} color={A.gold} o={p(0, 0.06)} />
        {fam.map((f, fi) => {
          const at = 0.1 + fi * 0.2;
          return (
            <div key={fi} style={{ position: "absolute", left: X0 + fi * (W + GAP), top: 280 }}>
              <Panel x={0} y={0} w={W} h={430} o={p(at, at + 0.07)} />
              <svg style={{ position: "absolute", left: 0, top: 0 }} width={W} height={430}>
                <Candles candles={f.candles} x0={W / 2 - (f.candles.length - 1) * 55} step={110} bw={64}
                  pLo={0} pHi={100} yTop={50} yBot={380} reveal={f.candles.map((_, ci) => p(at + 0.04 + ci * 0.03, at + 0.07 + ci * 0.03))} />
              </svg>
              <div style={{
                position: "absolute", left: 0, top: 450, width: W, textAlign: "center",
                fontFamily: MONO, fontWeight: 800, fontSize: 26, color: f.c, opacity: p(at + 0.08, at + 0.13),
              }}>{f.label}</div>
            </div>
          );
        })}
        {verdict && (
          <div style={{
            position: "absolute", left: 0, right: 0, top: 790, textAlign: "center",
            fontFamily: SANS, fontWeight: 800, fontSize: 34, color: verdict.c,
            opacity: p(0.82, 0.92), textShadow: `0 0 30px ${mix(T.bg0, verdict.c, 0.6)}`,
          }}>{verdict.text}</div>
        )}
        <SceneProgress dur={dur} color={A.gold} />
      </Stage>
    );
  }
  const PX = 150, PW = 1020, PY = 235, PH = 520;
  const cw = candles.length > 2 ? 150 : 210;
  const x0 = PX + PW / 2 - (candles.length - 1) * (cw / 2);
  return (
    <Stage>
      <Head theme={T} kicker={kicker} title={title} color={verdict?.c || A.gold} o={p(0, 0.06)} />
      <ScanBeamBox x={PX} y={PY} w={PW} h={PH} color={A.gold} o={p(0.08, 0.2)} />
      <Panel x={PX} y={PY} w={PW} h={PH} o={p(0.06, 0.12)} />
      {pre && (
        <PriceLine v={pre} lo={lo} hi={hi} x0={PX + 20} x1={PX + PW - 20} yTop={PY + 24} yBot={PY + PH - 24}
          prog={p(0.1, 0.3)} color={mix(T.muted, T.bg1, 0.25)} w={3.5} dash march />
      )}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        <Candles candles={candles} x0={x0} step={cw} bw={cw * 0.42} pLo={lo} pHi={hi} yTop={PY + 26} yBot={PY + PH - 26}
          reveal={candles.map((_, i) => p(0.16 + i * 0.09, 0.24 + i * 0.09))}
          glowIdx={p(0.5, 0.51) > 0.5 ? Math.floor(frame / 30) % candles.length : -1} />
      </svg>
      {anns.map((an, i) => {
        const at = 0.3 + i * 0.09;
        return (
          <div key={i} style={{
            position: "absolute", left: an.x, top: an.y, width: 300,
            fontFamily: MONO, fontSize: 22, lineHeight: 1.3, color: an.c,
            opacity: p(at, at + 0.07),
          }}>{an.text}</div>
        );
      })}
      {verdict && (
        <div style={{
          position: "absolute", left: 1230, top: 300, width: 560,
          fontFamily: SANS, fontWeight: 800, fontSize: 40, lineHeight: 1.2, color: verdict.c,
          opacity: p(0.5, 0.6), transform: `translateX(${(1 - p(0.5, 0.6)) * 30}px)`,
          textShadow: `0 0 34px ${mix(T.bg0, verdict.c, 0.55)}`,
        }}>{verdict.text}</div>
      )}
      {crit.length > 0 && <ChipRow chips={crit} p={p} baseAt={0.58} />}
      <SceneProgress dur={dur} color={verdict?.c} />
    </Stage>
  );
};

const ScanBeamBox: React.FC<{ x: number; y: number; w: number; h: number; color: string; o?: number }> =
  ({ x, y, w, h, color, o }) => {
    const frame = useCurrentFrame();
    const t = ((frame * 0.5) % (h + 60)) - 30;
    return (
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", opacity: o ?? 1, pointerEvents: "none", borderRadius: 18 }}>
        <div style={{ position: "absolute", left: 0, top: t, width: "100%", height: 3, background: color, boxShadow: `0 0 16px ${color}`, opacity: 0.8 }} />
      </div>
    );
  };

// ---------------------------------------------------------------- generic chart
interface ChartProps {
  dur?: number; kicker?: string; title?: string; accent?: string;
  path: [number, number][];
  levels?: { y: number; label: string; c: string; at: number }[];
  zones?: { y0: number; y1: number; label: string; c: string; at: number }[];
  marks?: { x: number; y: number; label: string; c: string; at: number }[];
  arrow?: { x0: number; y0: number; x1: number; y1: number; label: string; c: string; at: number };
  gaps?: { x0: number; y0: number; x1: number; y1: number; label: string; c: string; at: number }[];
  bands?: { x0: number; x1: number; label: string; c: string; at: number }[];
  note?: string; noteAt?: number;
}
const ChartScene: React.FC<ChartProps> = ({
  dur, kicker = "", title = "", accent, path, levels = [], zones = [], marks = [], arrow, gaps = [], bands = [], note, noteAt = 0.86,
}) => {
  const p = useP(dur);
  const ac = accent || A.gold;
  const PX = 170, PY = 225, PW = 1580, PH = 600;
  const xs = path.map((q) => q[0]), ys = path.map((q) => q[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = (maxY - minY) * 0.12 + 4;
  const SX = (x: number) => PX + ((x - minX) / (maxX - minX)) * (PW - 80) + 40;
  const SY = (y: number) => PY + PH - 30 - ((y - minY) / (maxY - minY)) * (PH - 80);
  const ptsStr = path.map((q) => `${SX(q[0])},${SY(q[1])}`).join(" ");
  const nPts = path.length;
  const shown = Math.max(2, Math.round(nPts * p(0.08, 0.62)));
  const drawn = ptsStr.split(" ").slice(0, shown).join(" ");
  const frame = useCurrentFrame();
  return (
    <Stage>
      <Head theme={T} kicker={kicker} title={title} color={ac} o={p(0, 0.06)} />
      <Panel x={PX} y={PY} w={PW} h={PH} o={p(0.04, 0.1)} />
      <ScanBeamBox x={PX} y={PY} w={PW} h={PH} color={ac} o={p(0.1, 0.24)} />
      {zones.map((z, i) => (
        <div key={"z" + i} style={{
          position: "absolute", left: PX + 2, top: SY(z.y1), width: PW - 4, height: SY(z.y0) - SY(z.y1),
          background: mix(T.bg0, z.c, 0.14), borderTop: `2px dashed ${z.c}`, borderBottom: `2px dashed ${z.c}`,
          opacity: p(z.at, z.at + 0.06),
        }}>
          <span style={{ position: "absolute", right: 14, top: 8, fontFamily: MONO, fontSize: 22, color: z.c, fontWeight: 700 }}>{z.label}</span>
        </div>
      ))}
      {levels.map((lv, i) => (
        <div key={"l" + i} style={{ position: "absolute", left: PX + 2, top: SY(lv.y) - 1.5, width: PW - 4, opacity: p(lv.at, lv.at + 0.06) }}>
          <div style={{ height: 3, background: lv.c, boxShadow: `0 0 12px ${mix(T.bg0, lv.c, 0.6)}` }} />
          <span style={{ position: "absolute", left: 14, top: 8, fontFamily: MONO, fontSize: 22, color: lv.c, fontWeight: 700 }}>{lv.label}</span>
        </div>
      ))}
      {bands.map((b, i) => (
        <div key={"b" + i} style={{
          position: "absolute", left: SX(b.x0), top: PY + 4, width: SX(b.x1) - SX(b.x0), height: PH - 34,
          background: mix(T.bg0, b.c, 0.1), borderLeft: `2.5px dashed ${b.c}`, borderRight: `2.5px dashed ${b.c}`,
          opacity: p(b.at, b.at + 0.06),
        }}>
          <span style={{ position: "absolute", left: "50%", top: -34, transform: "translateX(-50%)", fontFamily: MONO, fontSize: 22, color: b.c, whiteSpace: "nowrap" }}>{b.label}</span>
        </div>
      ))}
      {gaps.map((g, i) => (
        <div key={"g" + i} style={{
          position: "absolute", left: SX(g.x0), top: SY(g.y0), width: SX(g.x1) - SX(g.x0),
          height: SY(g.y1) - SY(g.y0), background: mix(T.bg0, g.c, 0.3),
          border: `2px solid ${g.c}`, borderRadius: 6, opacity: p(g.at, g.at + 0.06),
        }}>
          <span style={{ position: "absolute", left: 8, top: -32, fontFamily: MONO, fontSize: 21, color: g.c, whiteSpace: "nowrap", fontWeight: 700 }}>{g.label}</span>
        </div>
      ))}
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
        <polyline points={drawn} fill="none" stroke={ac} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" />
        {p(0.62, 0.63) > 0.5 && (
          <polyline points={ptsStr} fill="none" stroke={ac} strokeWidth={3} opacity={0.4}
            strokeDasharray="7 12" strokeDashoffset={-frame * 1.1} />
        )}
      </svg>
      {marks.map((m, i) => (
        <div key={"m" + i} style={{
          position: "absolute", left: SX(m.x) - 8, top: SY(m.y) - 46, transform: "translateX(-50%)",
          textAlign: "center", opacity: p(m.at, m.at + 0.05),
        }}>
          <div style={{ width: 16, height: 16, borderRadius: 9, background: m.c, margin: "0 auto", boxShadow: `0 0 14px ${m.c}` }} />
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: m.c, marginTop: 6, whiteSpace: "nowrap" }}>{m.label}</div>
        </div>
      ))}
      {arrow && (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
          <defs>
            <marker id="tawArrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={arrow.c} />
            </marker>
          </defs>
          <line x1={SX(arrow.x0)} y1={SY(arrow.y0)} x2={SX(arrow.x1)} y2={SY(arrow.y1)}
            stroke={arrow.c} strokeWidth={3.5} strokeDasharray="10 8" markerEnd="url(#tawArrow)"
            opacity={p(arrow.at, arrow.at + 0.08)} />
        </svg>
      )}
      {arrow && (
        <div style={{
          position: "absolute", left: (SX(arrow.x0) + SX(arrow.x1)) / 2 - 160, top: (SY(arrow.y0) + SY(arrow.y1)) / 2 - 44,
          width: 320, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 23, color: arrow.c,
          opacity: p(arrow.at + 0.04, arrow.at + 0.1),
        }}>{arrow.label}</div>
      )}
      {note && (
        <div style={{
          position: "absolute", left: PX, top: PY + PH + 26, width: 1560,
          fontFamily: SANS, fontSize: 28, color: mix(T.text, T.muted, 0.2), opacity: p(noteAt, noteAt + 0.08),
        }}>{note}</div>
      )}
      <SceneProgress dur={dur} color={ac} />
    </Stage>
  );
};

// ---------------------------------------------------------------- indicator scenes
const IND_KINDS = ["sma", "ema", "multi", "rsi", "stoch", "wpr", "macd", "mfi", "bb", "impulse"] as const;
type IndKind = typeof IND_KINDS[number];

const IndicatorScene: React.FC<{ dur?: number; kind?: IndKind; title?: string; kicker?: string; note?: string }> =
  ({ dur, kind = "sma", title = "", kicker = "", note }) => {
    const p = useP(dur);
    const frame = useCurrentFrame();
    const PX = 170, PW = 1580;
    const PPY = 225, PPH = 360;
    const IPY = 625, IPH = 255;
    const closes = MKT.close;
    const cLo = Math.min(...MKT.low) - 4, cHi = Math.max(...MKT.high) + 4;

    const crossMarks = (a: number[], b: number[]) => {
      const out: { i: number; up: boolean }[] = [];
      for (let i = 1; i < a.length; i++) {
        if (!isNaN(a[i]) && !isNaN(b[i]) && !isNaN(a[i - 1]) && !isNaN(b[i - 1])) {
          if (a[i - 1] <= b[i - 1] && a[i] > b[i]) out.push({ i, up: true });
          if (a[i - 1] >= b[i - 1] && a[i] < b[i]) out.push({ i, up: false });
        }
      }
      return out;
    };

    const indLine = (arr: number[], lo: number, hi: number, color: string, from: number, to: number, w = 3.5, dash?: boolean) =>
      arr.some((x) => !isNaN(x)) ? (
        <PriceLine v={arr.map((x) => (isNaN(x) ? lo : x))} lo={lo} hi={hi} x0={PX + 10} x1={PX + PW - 10}
          yTop={IPY + 16} yBot={IPY + IPH - 30} prog={interpolate(p(from, to), [0, 1], [0.28, 1])} color={color} w={w} dash={dash} />
      ) : null;

    const zoneBand = (lo: number, hi: number, c: string, label: string, at: number) => (
      <div style={{
        position: "absolute", left: PX + 2, top: IPY + 16 + ((100 - hi) / 100) * (IPH - 46),
        width: PW - 4, height: ((hi - lo) / 100) * (IPH - 46),
        background: mix(T.bg0, c, 0.13), opacity: p(at, at + 0.06),
      }}>
        <span style={{ position: "absolute", left: 12, top: 6, fontFamily: MONO, fontSize: 20, color: c, fontWeight: 700 }}>{label}</span>
      </div>
    );
    const refLine = (val: number, c: string, at: number) => (
      <div style={{
        position: "absolute", left: PX + 2, top: IPY + 16 + ((100 - val) / 100) * (IPH - 46) - 1.5,
        width: PW - 4, height: 2.5, background: c, opacity: p(at, at + 0.05),
      }} />
    );

    const legend = (items: { t: string; c: string }[]) => (
      <div style={{ position: "absolute", left: PX, top: 176, display: "flex", gap: 26, opacity: p(0.14, 0.22) }}>
        {items.map((it, i) => (
          <div key={i} style={{ fontFamily: MONO, fontSize: 22, color: it.c, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 4, borderRadius: 2, background: it.c }} />{it.t}
          </div>
        ))}
      </div>
    );

    return (
      <Stage>
        <Head theme={T} kicker={kicker || "INDICATORS · COMPUTED LIVE"} title={title} color={A.ind} o={p(0, 0.06)} />
        <Panel x={PX} y={PPY} w={PW} h={PPH} o={p(0.04, 0.1)} />
        <Panel x={PX} y={IPY} w={PW} h={IPH} o={p(0.2, 0.28)} color={mix(T.line, A.ind, 0.4)} />
        <PriceLine v={closes} lo={cLo} hi={cHi} x0={PX + 10} x1={PX + PW - 10} yTop={PPY + 20} yBot={PPY + PPH - 26}
          prog={p(0.06, 0.3)} color={A.gold} w={4} march />

        {(kind === "sma" || kind === "ema") && legend([{ t: "PRICE", c: A.gold }, { t: kind === "sma" ? "SMA 20" : "EMA 20", c: A.ind }, ...(kind === "ema" ? [{ t: "SMA 20 (reference)", c: T.muted }] : [])])}
        {(kind === "sma" || kind === "ema") && (
          <PriceLine v={(kind === "sma" ? MA20 : EMA20).map((x) => (isNaN(x) ? closes[0] : x))} lo={cLo} hi={cHi}
            x0={PX + 10} x1={PX + PW - 10} yTop={PPY + 20} yBot={PPY + PPH - 26}
            prog={p(0.3, 0.62)} color={A.ind} w={4} />
        )}
        {kind === "sma" && (() => {
          const wi = 20 + Math.floor(((frame * 0.35) % (closes.length - 40)));
          const wx0 = PX + 10 + (wi / (closes.length - 1)) * (PW - 20);
          const ww = (19 / (closes.length - 1)) * (PW - 20);
          return p(0.3, 0.31) > 0.3 ? (
            <div style={{ position: "absolute", left: wx0 - ww, top: PPY + 6, width: ww, height: PPH - 12, border: `2px dashed ${A.ind}`, borderRadius: 8, opacity: 0.55 }} />
          ) : null;
        })()}
        {kind === "ema" && (
          <PriceLine v={MA20.map((x) => (isNaN(x) ? closes[0] : x))} lo={cLo} hi={cHi}
            x0={PX + 10} x1={PX + PW - 10} yTop={PPY + 20} yBot={PPY + PPH - 26}
            prog={p(0.42, 0.62)} color={T.muted} w={3} dash />
        )}

        {kind === "multi" && legend([{ t: "PRICE", c: A.gold }, { t: "SMA 20", c: A.ind }, { t: "SMA 50", c: A.violet }])}
        {kind === "multi" && (<>
          <PriceLine v={MA20.map((x) => (isNaN(x) ? closes[0] : x))} lo={cLo} hi={cHi} x0={PX + 10} x1={PX + PW - 10}
            yTop={PPY + 20} yBot={PPY + PPH - 26} prog={p(0.24, 0.5)} color={A.ind} w={3.5} />
          <PriceLine v={MA50.map((x) => (isNaN(x) ? closes[0] : x))} lo={cLo} hi={cHi} x0={PX + 10} x1={PX + PW - 10}
            yTop={PPY + 20} yBot={PPY + PPH - 26} prog={p(0.3, 0.55)} color={A.violet} w={3.5} />
          {crossMarks(MA20, MA50).slice(0, 4).map((cr, i) => {
            const at = 0.56 + i * 0.07;
            const mx = PX + 10 + (cr.i / (closes.length - 1)) * (PW - 20);
            return (
              <div key={i} style={{ position: "absolute", left: mx - 17, top: cr.up ? PPY + 40 : PPY + PPH - 90, opacity: p(at, at + 0.06), textAlign: "center" }}>
                <div style={{ width: 34, height: 34, borderRadius: 18, background: cr.up ? A.bull : A.bear, color: T.bg0, fontFamily: MONO, fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px ${cr.up ? A.bull : A.bear}` }}>
                  {cr.up ? "▲" : "▼"}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 20, color: cr.up ? A.bull : A.bear, marginTop: 4 }}>{cr.up ? "BUY" : "SELL"}</div>
              </div>
            );
          })}
        </>)}

        {kind === "bb" && legend([{ t: "PRICE", c: A.gold }, { t: "SMA 20", c: A.ind }, { t: "+2σ / −2σ BANDS", c: A.violet }])}
        {kind === "bb" && (<>
          {([["up", 0.34, 0.56], ["lo", 0.38, 0.6]] as const).map(([k, f0, f1]) => (
            <PriceLine key={k} v={BOLL[k].map((x) => (isNaN(x) ? closes[0] : x))} lo={cLo} hi={cHi}
              x0={PX + 10} x1={PX + PW - 10} yTop={PPY + 20} yBot={PPY + PPH - 26}
              prog={p(f0, f1)} color={A.violet} w={3} dash />
          ))}
          <PriceLine v={BOLL.mid.map((x) => (isNaN(x) ? closes[0] : x))} lo={cLo} hi={cHi}
            x0={PX + 10} x1={PX + PW - 10} yTop={PPY + 20} yBot={PPY + PPH - 26}
            prog={p(0.3, 0.52)} color={A.ind} w={3} />
          <div style={{
            position: "absolute", left: PX + PW * 0.32, top: PPY + 10, width: PW * 0.14, height: PPH - 20,
            borderLeft: `2.5px dashed ${A.gold}`, borderRight: `2.5px dashed ${A.gold}`, opacity: p(0.62, 0.68) * 0.8,
          }}>
            <div style={{ position: "absolute", left: "50%", top: -34, transform: "translateX(-50%)", fontFamily: MONO, fontSize: 21, color: A.gold, whiteSpace: "nowrap" }}>THE SQUEEZE</div>
          </div>
        </>)}

        {(kind === "rsi" || kind === "stoch" || kind === "wpr" || kind === "mfi") && legend([{ t: "PRICE", c: A.gold }, { t: kind === "rsi" ? "RSI 14 (lower panel)" : kind === "stoch" ? "%K / %D (lower)" : kind === "wpr" ? "WILLIAMS %R 14 (lower)" : "MFI 14 (lower)", c: A.ind }])}
        {(kind === "rsi" || kind === "stoch" || kind === "wpr" || kind === "mfi") && (<>
          {zoneBand(70, 100, A.bear, "OVERBOUGHT", 0.4)}
          {zoneBand(0, 30, A.bull, "OVERSOLD", 0.44)}
          {refLine(70, mix(A.bear, T.bg1, 0.3), 0.42)}
          {refLine(30, mix(A.bull, T.bg1, 0.3), 0.46)}
          {kind === "rsi" && indLine(RSI, 0, 100, A.ind, 0.46, 0.8)}
          {kind === "stoch" && (<>
            {indLine(STOCH.k, 0, 100, A.ind, 0.46, 0.78)}
            {indLine(STOCH.d, 0, 100, A.violet, 0.5, 0.82, 3, true)}
          </>)}
          {kind === "wpr" && indLine(WILLR.map((x) => (isNaN(x) ? -50 : x)), 0, 100, A.ind, 0.46, 0.8)}
          {kind === "mfi" && indLine(MFI, 0, 100, A.ind, 0.46, 0.8)}
          {kind === "stoch" && (
            <div style={{ position: "absolute", left: PX, top: 900, fontFamily: MONO, fontSize: 21, color: T.muted, opacity: p(0.84, 0.92) }}>
              solid = %K · dotted = %D (3-period average of %K)
            </div>
          )}
          {(kind === "wpr" || kind === "mfi") && (
            <div style={{ position: "absolute", left: PX, top: 900, fontFamily: MONO, fontSize: 21, color: T.muted, opacity: p(0.84, 0.92) }}>
              {kind === "wpr" ? "scale runs 0 (top) to −100 (bottom) — mirrored vs stochastic" : "volume-weighted: money flowing IN vs OUT"}
            </div>
          )}
        </>)}

        {kind === "macd" && legend([{ t: "MACD LINE (EMA12 − EMA26)", c: A.ind }, { t: "SIGNAL (EMA9)", c: A.violet }, { t: "HISTOGRAM", c: T.muted }])}
        {kind === "macd" && (<>
          <div style={{ position: "absolute", left: PX + 2, top: IPY + 16 + (IPH - 46) / 2, width: PW - 4, height: 2.5, background: T.muted, opacity: p(0.4, 0.46) }} />
          <span style={{ position: "absolute", left: PX + 12, top: IPY + 16 + (IPH - 46) / 2 - 30, fontFamily: MONO, fontSize: 20, color: T.muted, opacity: p(0.42, 0.5) }}>ZERO LINE</span>
          {MACD.hist.map((hv, i) => isNaN(hv) ? null : (() => {
            const zeroY = IPY + 16 + (IPH - 46) / 2;
            const scale = (IPH - 60) / 14;
            const hh = Math.abs(hv) * scale;
            return (
              <div key={i} style={{
                position: "absolute", left: PX + 10 + (i / (closes.length - 1)) * (PW - 20) - 4,
                top: hv > 0 ? zeroY - hh : zeroY, width: 8, height: Math.max(2, hh),
                background: mix(hv > 0 ? A.bull : A.bear, T.bg1, 0.25), opacity: p(0.52, 0.86) * 0.85,
              }} />
            );
          })())}
          {indLine(MACD.line, -7, 7, A.ind, 0.44, 0.76, 4)}
          {indLine(MACD.signal, -7, 7, A.violet, 0.5, 0.8, 3.5, true)}
          {crossMarks(MACD.line, MACD.signal).filter((c) => c.i > 60).slice(0, 3).map((cr, i) => {
            const at = 0.82 + i * 0.05;
            const mx = PX + 10 + (cr.i / (closes.length - 1)) * (PW - 20);
            return (
              <div key={i} style={{ position: "absolute", left: mx - 15, top: cr.up ? IPY + 8 : IPY + IPH - 62, opacity: p(at, at + 0.05), fontFamily: MONO, fontWeight: 800, fontSize: 20, color: cr.up ? A.bull : A.bear }}>
                {cr.up ? "▲ long" : "▼ short"}
              </div>
            );
          })}
        </>)}

        {kind === "impulse" && (<>
          <Head theme={T} kicker="STRATEGIES · ELDER IMPULSE SYSTEM" title={title} color={A.ind} o={p(0, 0.06)} />
          {legend([{ t: "PRICE + EMA 13 (inertia)", c: A.gold }, { t: "MACD HISTOGRAM (momentum)", c: A.ind }])}
          <PriceLine v={closes} lo={cLo} hi={cHi} x0={PX + 10} x1={PX + PW - 10} yTop={PPY + 20} yBot={PPY + PPH - 26}
            prog={p(0.06, 0.3)} color={A.gold} w={4} march />
          <PriceLine v={emaCalc(closes, 13).map((x) => (isNaN(x) ? closes[0] : x))} lo={cLo} hi={cHi}
            x0={PX + 10} x1={PX + PW - 10} yTop={PPY + 20} yBot={PPY + PPH - 26}
            prog={p(0.24, 0.44)} color={A.ind} w={4} />
          {(() => {
            const zeroY = IPY + 16 + (IPH - 46) / 2;
            const scale = (IPH - 60) / 14;
            return MACD.hist.map((hv, i) => {
              if (isNaN(hv)) return null;
              const rising = i > 0 && !isNaN(MACD.hist[i - 1]) && hv > MACD.hist[i - 1];
              const green = rising;
              const hh = Math.abs(hv) * scale;
              return (
                <div key={i} style={{
                  position: "absolute", left: PX + 10 + (i / (closes.length - 1)) * (PW - 20) - 4,
                  top: hv > 0 ? zeroY - hh : zeroY, width: 8, height: Math.max(2, hh),
                  background: green ? A.bull : A.bear, opacity: p(0.46, 0.8) * 0.9,
                }} />
              );
            });
          })()}
          {[
            { t: "ENTER when BOTH rise — inertia + momentum agree", c: A.bull, at: 0.62 },
            { t: "EXIT the moment EITHER one turns down", c: A.bear, at: 0.74 },
          ].map((r, i) => (
            <div key={i} style={{
              position: "absolute", left: PX, top: 906 + i * 0, width: 1560, fontFamily: MONO, fontSize: 22,
              fontWeight: 700, color: r.c, opacity: p(r.at, r.at + 0.06), textAlign: "center",
            }}>{r.t}</div>
          ))}
        </>)}

        {note && (
          <div style={{
            position: "absolute", left: PX, top: 906, width: 1560, fontFamily: MONO, fontSize: 21,
            color: T.muted, opacity: p(0.86, 0.94), textAlign: "center",
          }}>{note}</div>
        )}
        <SceneProgress dur={dur} color={A.ind} />
      </Stage>
    );
  };

// ---------------------------------------------------------------- compare
const CompareScene: React.FC<{
  dur?: number; kicker?: string; title?: string;
  left?: { t: string; c: string; items: string[] }; right?: { t: string; c: string; items: string[] };
}> = ({ dur, kicker = "", title = "", left, right }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const L = left || { t: "", c: A.ind, items: [] };
  const R = right || { t: "", c: A.violet, items: [] };
  const side = (s: typeof L, x: number) => (
    <div style={{ position: "absolute", left: x, top: 270, width: 800 }}>
      <div style={{
        fontFamily: SANS, fontWeight: 800, fontSize: 40, color: s.c, marginBottom: 22,
        opacity: p(0.06, 0.14), borderBottom: `3px solid ${s.c}`, paddingBottom: 10,
      }}>{s.t}</div>
      {s.items.map((it, i) => {
        const at = 0.16 + i * 0.075;
        const hotSide = Math.floor(frame / 40) % 2 === (x < 960 ? 0 : 1);
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 16, marginBottom: 16,
            background: mix(T.panel, s.c, hotSide ? 0.12 : 0.05),
            border: `2px solid ${hotSide ? mix(s.c, T.panel, 0.2) : T.line}`,
            borderRadius: 14, padding: "16px 22px", boxSizing: "border-box",
            opacity: p(at, at + 0.07), transform: `translateY(${(1 - p(at, at + 0.07)) * 18}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: s.c }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontFamily: SANS, fontSize: 27, color: T.text, lineHeight: 1.3 }}>{it}</span>
          </div>
        );
      })}
    </div>
  );
  return (
    <Stage>
      <Head theme={T} kicker={kicker} title={title} o={p(0, 0.06)} />
      {side(L, 130)}
      {side(R, 990)}
      <div style={{
        position: "absolute", left: 910, top: 520, width: 100, height: 100, borderRadius: 50,
        background: mix(T.panel, A.gold, 0.2), border: `2.5px solid ${A.gold}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: SANS, fontWeight: 800, fontSize: 34, color: A.gold,
        opacity: p(0.12, 0.2), boxShadow: `0 0 ${30 + Math.sin(frame * 0.06) * 12}px ${mix(T.bg0, A.gold, 0.5)}`,
      }}>vs</div>
      <SceneProgress dur={dur} color={A.gold} />
    </Stage>
  );
};

// ---------------------------------------------------------------- rules list
const RulesScene: React.FC<{ dur?: number; kicker?: string; title?: string; items?: string[]; accent?: string; closer?: string }> =
  ({ dur, kicker = "", title = "", items = [], accent, closer }) => {
    const p = useP(dur);
    const frame = useCurrentFrame();
    const ac = accent || A.gold;
    const hot = p(0.55, 0.56) > 0.5 ? Math.floor(frame / 26) % items.length : -1;
    return (
      <Stage>
        <Head theme={T} kicker={kicker} title={title} color={ac} o={p(0, 0.06)} />
        <div style={{ position: "absolute", left: 240, top: 240, width: 1440 }}>
          {items.map((it, i) => {
            const at = 0.07 + i * (0.68 / Math.max(items.length, 1));
            const o = p(at, at + 0.06);
            const active = hot === i;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 20, marginBottom: 14,
                background: mix(T.panel, ac, active ? 0.16 : 0.05),
                borderLeft: `5px solid ${ac}`, borderRadius: 12,
                padding: "15px 26px",
                opacity: o, transform: `translateX(${(1 - o) * -26}px)`,
                boxShadow: active ? `0 0 30px ${mix(T.bg0, ac, 0.35)}` : "none",
              }}>
                <span style={{ color: ac, fontFamily: MONO, fontWeight: 800, fontSize: 26, minWidth: 44 }}>{i + 1}</span>
                <span style={{ fontFamily: SANS, fontSize: 28, color: T.text, lineHeight: 1.3 }}>{it}</span>
              </div>
            );
          })}
        </div>
        {closer && (
          <div style={{
            position: "absolute", left: 0, right: 0, top: 830, textAlign: "center",
            fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 34, color: ac,
            opacity: p(0.82, 0.92), textShadow: `0 0 ${26 + Math.sin(frame * 0.06) * 10}px ${mix(T.bg0, ac, 0.6)}`,
          }}>{closer}</div>
        )}
        <SceneProgress dur={dur} color={ac} />
      </Stage>
    );
  };

// ---------------------------------------------------------------- funnel (top-down TA)
const FunnelScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const stages = [
    { label: "THE MARKET — the index", sub: "is the broad market bullish?", w: 1500, c: A.gold, icon: "📊" },
    { label: "SECTORS — pick 3–5 groups", sub: "which sectors show the most promise?", w: 1160, c: A.ind, icon: "🏭" },
    { label: "STOCKS — 10–20 charts per group", sub: "scan each shortlist on its own chart", w: 840, c: A.violet, icon: "🔍" },
    { label: "THE FEW — 9 to 12 finalists", sub: "apply your strictest criteria last", w: 520, c: A.bull, icon: "⭐" },
  ];
  return (
    <Stage>
      <Head theme={T} kicker="FOUNDATIONS · TOP-DOWN APPROACH" title="Zoom from market to stock" color={A.gold} o={p(0, 0.06)} />
      {stages.map((s, i) => {
        const at = 0.1 + i * 0.17;
        const o = p(at, at + 0.08);
        return (
          <React.Fragment key={i}>
            <div style={{
              position: "absolute", left: (1920 - s.w) / 2, top: 265 + i * 155, width: s.w,
              borderRadius: 18, padding: "20px 34px", boxSizing: "border-box",
              background: mix(T.panel, s.c, 0.1), border: `2.5px solid ${s.c}`,
              opacity: o, transform: `translateY(${(1 - o) * 22}px)`,
              display: "flex", alignItems: "center", gap: 22,
            }}>
              <span style={{ fontSize: 44 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: s.c }}>{s.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 22, color: T.muted, marginTop: 6 }}>{s.sub}</div>
              </div>
            </div>
            {i < stages.length - 1 && (
              <Flow x1={960} y1={265 + i * 155 + 118} x2={960} y2={265 + (i + 1) * 155 - 8} color={s.c} n={3} size={9} o={o * 0.9} speed={0.02} />
            )}
          </React.Fragment>
        );
      })}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 900, textAlign: "center",
        fontFamily: MONO, fontSize: 22, color: T.muted, opacity: p(0.84, 0.94),
      }}>every stage uses the same tools — trend, support, resistance</div>
      <SceneProgress dur={dur} color={A.gold} />
    </Stage>
  );
};

// ---------------------------------------------------------------- Elliott waves
const WaveScene: React.FC<{ dur?: number; mode?: "five" | "abc" | "fractal"; chars?: string[] }> =
  ({ dur, mode = "five", chars = [] }) => {
    const p = useP(dur);
    const frame = useCurrentFrame();
    // rising five-wave control shape (price units 0..100)
    const fiveCtrl: [number, number][] = [[0, 18], [14, 34], [24, 26], [52, 62], [62, 48], [82, 78]];
    const abcCtrl: [number, number][] = [[82, 78], [88, 58], [93, 68], [100, 44]];
    const all = mode === "abc" ? [...fiveCtrl, ...abcCtrl.slice(1)] : fiveCtrl;
    const PX = 200, PY = 230, PW = 1520, PH = 560;
    const SX = (t: number) => PX + t * PW;
    const SY = (v: number) => PY + PH - (v / 100) * PH;
    const waveMarks = [
      { t: 0.14, v: 34, l: "1" }, { t: 0.24, v: 26, l: "2" }, { t: 0.52, v: 62, l: "3" },
      { t: 0.62, v: 48, l: "4" }, { t: 0.82, v: 78, l: "5" },
    ];
    const abcMarks = [
      { t: 0.88, v: 58, l: "A" }, { t: 0.93, v: 68, l: "B" }, { t: 0.995, v: 44, l: "C" },
    ];
    const marks = mode === "five" || mode === "fractal" ? waveMarks : [...waveMarks, ...abcMarks];
    const defaultChars = [
      "Wave 1 — weak rally, few believers",
      "Wave 2 — vicious sell-off, but holds above the start",
      "Wave 3 — the longest, most powerful wave",
      "Wave 4 — profit-taking correction on lighter volume",
      "Wave 5 — new high, but weaker volume than wave 3",
    ];
    const cs = chars.length === 5 ? chars : defaultChars;
    const charIdx = mode === "five" ? Math.min(4, Math.floor(p(0.14, 0.9) * 5.4)) : -1;
    const ptsStr = all.map((q) => `${SX(q[0] / 100)},${SY(q[1])}`).join(" ");
    const totalLen = all.length;
    const shownSegs = mode === "five" ? p(0.08, 0.78) : p(0.06, 0.6);
    const abcProg = mode === "abc" ? p(0.6, 0.92) : 0;
    const segShown = Math.max(2, Math.floor(totalLen * Math.min(shownSegs, 1)));
    return (
      <Stage>
        <Head theme={T} kicker="DOW & ELLIOTT · WAVE STRUCTURE"
          title={mode === "abc" ? "Then the market corrects: A–B–C" : mode === "fractal" ? "Waves within waves — fractals" : "The dominant trend moves in five waves"}
          color={mode === "abc" ? A.bear : A.gold} o={p(0, 0.06)} />
        <Panel x={PX} y={PY} w={PW} h={PH} o={p(0.04, 0.1)} />
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
          <polyline points={all.slice(0, segShown).map((q) => `${SX(q[0] / 100)},${SY(q[1])}`).join(" ")}
            fill="none" stroke={A.gold} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
          {mode !== "five" && abcProg > 0 && (() => {
            const nABC = 1 + Math.floor(abcProg * 3.99);
            return (
              <polyline points={abcCtrl.slice(0, nABC + 1).map((q) => `${SX(q[0] / 100)},${SY(q[1])}`).join(" ")}
                fill="none" stroke={A.bear} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
            );
          })()}
          {p(0.85, 0.86) > 0.5 && (
            <polyline points={ptsStr} fill="none" stroke={A.gold} strokeWidth={3} opacity={0.35}
              strokeDasharray="7 11" strokeDashoffset={-frame * 1.1} />
          )}
        </svg>
        {marks.map((m, i) => {
          const isAbc = "ABC".includes(m.l) && !(m.l === "A" && mode === "five");
          const at = isAbc ? 0.62 + ("ABC".indexOf(m.l)) * 0.09 : 0.1 + i * 0.115;
          const c = isAbc ? A.bear : A.bull;
          return (
            <div key={m.l} style={{ position: "absolute", left: SX(m.t) - 30, top: SY(m.v) - 84, width: 60, textAlign: "center", opacity: p(at, at + 0.05) }}>
              <div style={{
                width: 56, height: 56, borderRadius: 28, margin: "0 auto",
                background: mix(T.panel, c, 0.25), border: `3px solid ${c}`,
                fontFamily: MONO, fontWeight: 800, fontSize: 30, color: c,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 20px ${mix(T.bg0, c, 0.5)}`,
              }}>{m.l}</div>
            </div>
          );
        })}
        {mode === "fractal" && (() => {
          const zo = p(0.55, 0.68);
          if (zo <= 0) return null;
          const mini: [number, number][] = [[0, 60], [14, 82], [24, 70], [52, 118], [62, 98], [86, 140]];
          return (
            <div style={{
              position: "absolute", left: 1310, top: 600, width: 480, height: 340, borderRadius: 16,
              border: `2.5px solid ${A.ind}`, background: T.bg1, opacity: zo, padding: 10,
            }}>
              <svg width={460} height={280} viewBox="0 0 100 160">
                <polyline points={mini.map((q) => `${q[0]},${160 - q[1]}`).join(" ")}
                  fill="none" stroke={A.ind} strokeWidth={2.5} strokeLinejoin="round" />
                {[[14, 82, "1"], [24, 70, "2"], [52, 118, "3"], [62, 98, "4"], [86, 140, "5"]].map(([x, y, l], i) => (
                  <text key={i} x={(x as number)} y={160 - (y as number) - 8} fill={A.bull}
                    fontFamily={MONO} fontSize={11} textAnchor="middle">{l}</text>
                ))}
              </svg>
              <div style={{ fontFamily: MONO, fontSize: 21, color: A.ind, textAlign: "center" }}>zoom in → same 5-wave shape repeats</div>
            </div>
          );
        })()}
        {(mode === "five") && (
          <div style={{
            position: "absolute", left: 200, top: 850, width: 1520, textAlign: "center",
            fontFamily: SANS, fontWeight: 700, fontSize: 31, color: A.bull,
            opacity: charIdx >= 0 ? p(0.12 + charIdx * 0.115, 0.16 + charIdx * 0.115) : 0,
          }}>{charIdx >= 0 ? cs[charIdx] : ""}</div>
        )}
        {mode === "abc" && (
          <div style={{
            position: "absolute", left: 200, top: 850, width: 1520, textAlign: "center",
            fontFamily: SANS, fontWeight: 700, fontSize: 31, color: A.bear,
            opacity: p(0.66, 0.74),
          }}>A and C push with the new trend · B is the fake-out rally on lighter volume</div>
        )}
        {mode === "fractal" && (
          <div style={{
            position: "absolute", left: 200, top: 850, width: 1520, textAlign: "center",
            fontFamily: SANS, fontWeight: 700, fontSize: 31, color: A.ind,
            opacity: p(0.7, 0.78),
          }}>Every impulse wave subdivides into 5 smaller waves — near looks like far</div>
        )}
        <SceneProgress dur={dur} color={A.gold} />
      </Stage>
    );
  };

// ---------------------------------------------------------------- Fibonacci
const FibScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
  const ratios = [23.6, 38.2, 50, 61.8, 78.6];
  const LO = 30, HI = 100; // leg from 30 -> 100 ; retracement levels computed for real
  const PX = 760, PY = 235, PW = 1010, PH = 560;
  const SY = (v: number) => PY + PH - ((v - LO) / (HI - LO)) * PH;
  const legCtrl: [number, number][] = [[0, 30], [30, 52], [45, 46], [70, 78], [100, 100]];
  const retrCtrl: [number, number][] = [[0, 30], [30, 52], [45, 46], [70, 78], [100, 100], [112, HI - (HI - LO) * 0.618], [128, HI - (HI - LO) * 0.382], [142, 104]];
  const full = retrCtrl;
  const SX = (t: number) => PX + (t / 142) * PW;
  return (
    <Stage>
      <Head theme={T} kicker="DOW & ELLIOTT · FIBONACCI" title="The market breathes in golden ratios" color={A.violet} o={p(0, 0.06)} />
      {/* sequence column */}
      <div style={{ position: "absolute", left: 150, top: 250, width: 540 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {fib.map((f, i) => {
            const at = 0.06 + i * 0.035;
            return (
              <div key={i} style={{
                fontFamily: MONO, fontWeight: 800, fontSize: 26, color: i > 1 ? T.text : A.violet,
                background: mix(T.panel, A.violet, 0.12), border: `2px solid ${mix(T.line, A.violet, 0.6)}`,
                borderRadius: 10, padding: "8px 16px", opacity: p(at, at + 0.05),
              }}>{f}{i > 1 && (
                <span style={{ fontSize: 19, color: A.violet, marginLeft: 8 }}>{(fib[i] / fib[i - 1]).toFixed(3)}</span>
              )}</div>
            );
          })}
        </div>
        <div style={{ marginTop: 26, opacity: p(0.56, 0.66) }}>
          <span style={{ fontFamily: MONO, fontSize: 22, color: T.muted }}>each term ÷ previous → </span>
          <Counter p={p(0.56, 0.72)} to={1.618} decimals={3} color={A.violet} size={52} />
        </div>
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, marginTop: 18, opacity: p(0.72, 0.8), lineHeight: 1.4 }}>
          The golden ratio — where waves find support and resistance.
        </div>
      </div>
      <Panel x={PX} y={PY} w={PW} h={PH} o={p(0.08, 0.14)} />
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
        <polyline points={legCtrl.map((q) => `${SX(q[0])},${SY(q[1])}`).join(" ")}
          fill="none" stroke={A.bull} strokeWidth={4.5} strokeLinejoin="round" opacity={p(0.12, 0.3)} />
        <polyline points={full.slice(4).map((q) => `${SX(q[0])},${SY(q[1])}`).join(" ")}
          fill="none" stroke={A.gold} strokeWidth={4.5} strokeLinejoin="round"
          strokeDasharray="1 0" opacity={p(0.4, 0.55)}
          style={{ strokeDashoffset: 0 }} />
      </svg>
      {ratios.map((r, i) => {
        const lvl = HI - (HI - LO) * (r / 100);
        const at = 0.3 + i * 0.07;
        return (
          <React.Fragment key={i}>
            <div style={{
              position: "absolute", left: PX + 2, top: SY(lvl) - 1.5, width: PW - 4, height: 2.5,
              background: i === 3 ? A.violet : mix(T.muted, T.bg1, 0.2), opacity: p(at, at + 0.05),
            }} />
            <div style={{
              position: "absolute", left: PX + 14, top: SY(lvl) - 30, fontFamily: MONO,
              fontWeight: 700, fontSize: 22, color: i === 3 ? A.violet : T.muted, opacity: p(at, at + 0.06),
            }}>{r.toFixed(1)}%</div>
          </React.Fragment>
        );
      })}
      <div style={{
        position: "absolute", left: PX, top: PY + PH + 22, width: PW, fontFamily: MONO, fontSize: 22, color: T.muted, opacity: p(0.8, 0.9),
      }}>retracement = pullback depth measured against the prior swing — 38.2% shallow · 61.8% deep</div>
      <SceneProgress dur={dur} color={A.violet} />
    </Stage>
  );
};

// ---------------------------------------------------------------- risk gauge
const GaugeScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const CX = 640, CY = 640, R = 330;
  const ang = (frac: number) => Math.PI * (1 - frac); // 0=left, 1=right, semicircle top
  const needleFrac = interpolate(p(0.3, 0.6), [0, 1], [0.12, 0.72]);
  const arc = (f0: number, f1: number, c: string, wd: number) => {
    const a0 = ang(f0), a1 = ang(f1);
    const x0 = CX + Math.cos(a0) * R, y0 = CY - Math.sin(a0) * R;
    const x1 = CX + Math.cos(a1) * R, y1 = CY - Math.sin(a1) * R;
    return <path d={`M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`} fill="none" stroke={c} strokeWidth={wd} strokeLinecap="round" />;
  };
  return (
    <Stage>
      <Head theme={T} kicker="PSYCHOLOGY & RISK · REWARD-RISK RATIO" title="Every trade must clear this bar" color={A.gold} o={p(0, 0.06)} />
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill={T.bg1} stroke={T.line} strokeWidth={2} />
        {arc(0, 0.28, A.bear, 26)}
        {arc(0.28, 0.47, mix(A.gold, T.bg1, 0.3), 26)}
        {arc(0.47, 1, A.bull, 26)}
        <line x1={CX + Math.cos(ang(needleFrac)) * 40} y1={CY - Math.sin(ang(needleFrac)) * 40}
          x2={CX + Math.cos(ang(needleFrac)) * (R - 30)} y2={CY - Math.sin(ang(needleFrac)) * (R - 30)}
          stroke={T.text} strokeWidth={7} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={22} fill={T.text} />
        <line x1={CX + Math.cos(ang(0.47)) * (R - 60)} y1={CY - Math.sin(ang(0.47)) * (R - 60)}
          x2={CX + Math.cos(ang(0.47)) * (R + 34)} y2={CY - Math.sin(ang(0.47)) * (R + 34)}
          stroke={A.gold} strokeWidth={5} opacity={p(0.5, 0.6)} />
      </svg>
      {[["0", 0], ["1.5 — minimum", 0.47], ["3+", 0.94]].map(([t, f], i) => (
        <div key={i} style={{
          position: "absolute", left: CX + Math.cos(ang(f as number)) * (R + 70) - 110,
          top: CY - Math.sin(ang(f as number)) * (R + 70) - 18, width: 220, textAlign: "center",
          fontFamily: MONO, fontWeight: 700, fontSize: 23, color: i === 1 ? A.gold : T.muted,
          opacity: p(0.24 + i * 0.06, 0.3 + i * 0.06),
        }}>{t}</div>
      ))}
      <Counter p={p(0.34, 0.58)} to={1.8} decimals={1} prefix="reward : risk = " suffix=" : 1" color={A.gold} size={46} />
      <div style={{ position: "absolute", left: 1210, top: 300, width: 580 }}>
        {[
          { t: "TARGET — where the chart says take profit", c: A.bull, at: 0.14 },
          { t: "STOP LOSS — where the idea is proven wrong", c: A.bear, at: 0.2 },
          { t: "below 1.5 : 1 — do not take the trade", c: A.gold, at: 0.62 },
          { t: "trail the stop once the trade works", c: A.ind, at: 0.72 },
        ].map((r, i) => (
          <div key={i} style={{
            fontFamily: MONO, fontWeight: 700, fontSize: 24, lineHeight: 1.35, color: r.c,
            background: mix(T.panel, r.c, 0.09), border: `2px solid ${mix(T.line, r.c, 0.6)}`,
            borderRadius: 14, padding: "16px 22px", marginBottom: 16,
            opacity: p(r.at, r.at + 0.07), transform: `translateX(${(1 - p(r.at, r.at + 0.07)) * 26}px)`,
          }}>{r.t}</div>
        ))}
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 880, textAlign: "center",
        fontFamily: SANS, fontSize: 28, color: T.muted, opacity: 0.5 + Math.sin(frame * 0.07) * 0.2,
      }}>risk is controlled BEFORE entry — not after</div>
      <SceneProgress dur={dur} color={A.gold} />
    </Stage>
  );
};

// ---------------------------------------------------------------- equity curve
const EquityScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const eqCtrl: [number, number][] = [
    [0, 100], [8, 96], [16, 104], [24, 99], [34, 112], [40, 106],
    [50, 122], [58, 114], [66, 126], [74, 118], [84, 134], [92, 127], [100, 145],
  ];
  const PX = 190, PY = 245, PW = 1030, PH = 520;
  const LO = 88, HI = 152;
  const SX = (t: number) => PX + (t / 100) * PW;
  const SY = (v: number) => PY + PH - ((v - LO) / (HI - LO)) * PH;
  return (
    <Stage>
      <Head theme={T} kicker="PSYCHOLOGY & RISK · THE EQUITY CURVE" title="Survive first — compound second" color={A.bull} o={p(0, 0.06)} />
      <Panel x={PX} y={PY} w={PW} h={PH} o={p(0.04, 0.1)} />
      {/* drawdown shading under dips */}
      {[[8, 16, "loss"], [24, 30, ""], [40, 47, ""], [58, 64, ""], [74, 81, ""], [92, 97, ""]].map(([a, b], i) => (
        <div key={i} style={{
          position: "absolute", left: SX(a as number), top: PY + 6, width: SX(b as number) - SX(a as number),
          height: PH - 12, background: mix(T.bg0, A.bear, 0.09), opacity: p(0.5, 0.58),
        }} />
      ))}
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
        <polyline points={eqCtrl.slice(0, Math.max(2, Math.floor(eqCtrl.length * p(0.08, 0.62)))).map((q) => `${SX(q[0])},${SY(q[1])}`).join(" ")}
          fill="none" stroke={A.bull} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {[[16, 104, "cut fast"], [50, 122, "risk small"], [84, 134, "stay alive"]].map(([t, v, l], i) => (
        <div key={i} style={{
          position: "absolute", left: SX(t as number) - 70, top: SY(v as number) - 64, width: 140,
          textAlign: "center", fontFamily: MONO, fontSize: 22, color: A.bull, opacity: p(0.6 + i * 0.08, 0.66 + i * 0.08),
        }}>{l}</div>
      ))}
      <div style={{ position: "absolute", left: 1280, top: 280, width: 520 }}>
        {[
          { big: "60–65%", sub: "even great systems lose ~4 trades in 10", c: A.ind, at: 0.14 },
          { big: "≤ 2–5%", sub: "max loss per trade, ever", c: A.gold, at: 0.3 },
          { big: "≤ 10%", sub: "max exposure in any one sector", c: A.violet, at: 0.46 },
          { big: "5–8", sub: "losses in a row WILL happen — size so it can't kill you", c: A.bear, at: 0.62 },
        ].map((r, i) => (
          <div key={i} style={{
            background: mix(T.panel, r.c, 0.09), border: `2.5px solid ${r.c}`, borderRadius: 16,
            padding: "18px 26px", marginBottom: 18, opacity: p(r.at, r.at + 0.08),
            transform: `translateY(${(1 - p(r.at, r.at + 0.08)) * 20}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 42, color: r.c }}>{r.big}</span>
            <div style={{ fontFamily: SANS, fontSize: 24, color: T.text, marginTop: 6, lineHeight: 1.3 }}>{r.sub}</div>
          </div>
        ))}
      </div>
      <div style={{
        position: "absolute", left: 190, top: 800, width: 1030, fontFamily: SANS, fontSize: 26, color: T.muted, opacity: p(0.78, 0.88),
      }}>red strips = drawdowns. Small trade size turns them into bruises, not funerals.</div>
      <SceneProgress dur={dur} color={A.bull} />
    </Stage>
  );
};

// ---------------------------------------------------------------- trading session clock
const SessionScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const X0 = 170, W = 1580, Y = 430, H = 120;
  const hr = (h: number) => X0 + ((h - 9.25) / 6.25) * W; // 9:15..15:30
  const blocks = [
    { x0: hr(9.25), x1: hr(10.25), label: "FIRST HOUR — highest volatility", c: A.bull, at: 0.12 },
    { x0: hr(12.0), x1: hr(14.0), label: "LUNCH LULL — volume dries up, choppy", c: T.muted, at: 0.3 },
    { x0: hr(14.5), x1: hr(15.5), label: "LAST HOUR — volatility returns", c: A.bear, at: 0.48 },
  ];
  return (
    <Stage>
      <Head theme={T} kicker="STRATEGIES · WHEN MOMENTUM TRADERS TRADE" title="Trade the edges of the day" color={A.gold} o={p(0, 0.06)} />
      <div style={{ position: "absolute", left: X0, top: Y, width: W, height: H, borderRadius: 16, background: T.bg2, border: `2px solid ${T.line}`, opacity: p(0.06, 0.14) }} />
      {blocks.map((b, i) => (
        <React.Fragment key={i}>
          <div style={{
            position: "absolute", left: b.x0, top: Y, width: b.x1 - b.x0, height: H,
            background: `linear-gradient(180deg, ${mix(T.bg0, b.c, 0.4)}, ${mix(T.bg0, b.c, 0.18)})`,
            border: `2.5px solid ${b.c}`, borderRadius: 12, opacity: p(b.at, b.at + 0.06),
          }} />
          <div style={{
            position: "absolute", left: b.x0, top: Y + H + 18, width: b.x1 - b.x0, textAlign: "center",
            fontFamily: MONO, fontWeight: 700, fontSize: 22, color: b.c, opacity: p(b.at + 0.04, b.at + 0.1),
            whiteSpace: "normal", lineHeight: 1.3,
          }}>{b.label}</div>
        </React.Fragment>
      ))}
      {/* activity sparkline above */}
      <svg style={{ position: "absolute", left: X0, top: Y - 190 }} width={W} height={170}>
        <polyline points={Array.from({ length: 60 }, (_, i) => {
          const h = 9.25 + (i / 59) * 6.25;
          const act = (h < 10.25 || h > 14.5 ? 120 : h >= 12 && h <= 14 ? 26 : 60) * (0.8 + rnd(i, 3) * 0.4);
          return `${(i / 59) * W},${160 - act}`;
        }).join(" ")} fill="none" stroke={A.gold} strokeWidth={4} opacity={p(0.1, 0.3)} strokeDasharray="6 9" strokeDashoffset={-frame * 0.9} />
        <text x={4} y={26} fill={T.muted} fontFamily={MONO} fontSize={21}>activity through the day</text>
      </svg>
      {[["09:15", 9.25], ["12:00", 12], ["15:30", 15.5]].map(([t, h], i) => (
        <div key={i} style={{
          position: "absolute", left: hr(h as number) - 40, top: Y - 44, width: 80, textAlign: "center",
          fontFamily: MONO, fontSize: 22, color: T.muted, opacity: p(0.08, 0.16),
        }}>{t}</div>
      ))}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", width: 1920,
        fontFamily: SANS, fontWeight: 700, fontSize: 30, color: T.text, opacity: p(0.62, 0.72),
      }}>Limit momentum trades to the first and the last hour.</div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 730, textAlign: "center", width: 1920,
        fontFamily: SANS, fontSize: 27, color: T.muted, opacity: p(0.74, 0.84),
      }}>Exit at the moment volume fades and bearish candles start appearing.</div>
      <SceneProgress dur={dur} color={A.gold} />
    </Stage>
  );
};

// ---------------------------------------------------------------- divergence
const DivScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  // bearish: price higher high, oscillator lower high | bullish: price lower low, osc higher low
  const priceBear: [number, number][] = [[0, 30], [18, 55], [30, 44], [50, 68], [62, 56], [80, 40]];
  const oscBear: [number, number][] = [[0, 35], [18, 70], [30, 45], [50, 58], [62, 38], [80, 18]];
  const priceBull: [number, number][] = [[0, 70], [18, 42], [30, 55], [50, 32], [62, 48], [80, 72]];
  const oscBull: [number, number][] = [[0, 60], [18, 25], [30, 52], [50, 38], [62, 66], [80, 88]];
    const panel = (x: number, title: string, c: string, pr: typeof priceBear, os: typeof oscBear,
      pAt: number, marks: { x: number; top?: boolean; l: string }[], at0: number) => {
    const PX = x, PY = 260, PW = 790, PH = 250;
    const SX = (t: number) => PX + 20 + (t / 80) * (PW - 40);
    const SYp = (v: number) => PY + 16 + ((100 - v) / 100) * (PH - 32);
    const SYo = (v: number) => PY + PH + 130 + 16 + ((100 - v) / 100) * (PH - 32);
    return (
      <div style={{ position: "absolute", left: x, top: 210 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: c, marginBottom: 14, opacity: p(pAt, pAt + 0.06) }}>{title}</div>
        <Panel x={PX} y={PY} w={PW} h={PH} o={p(pAt, pAt + 0.05)} />
        <Panel x={PX} y={PY + PH + 130} w={PW} h={PH} o={p(pAt, pAt + 0.05)} color={mix(T.line, c, 0.4)} />
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
          <polyline points={pr.map((q) => `${SX(q[0])},${SYp(q[1])}`).join(" ")}
            fill="none" stroke={A.gold} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" opacity={p(at0, at0 + 0.1)} />
          <polyline points={os.map((q) => `${SX(q[0])},${SYo(q[1])}`).join(" ")}
            fill="none" stroke={c} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" opacity={p(at0 + 0.08, at0 + 0.2)} />
        </svg>
        <span style={{ position: "absolute", left: PX + 12, top: PY - 34, fontFamily: MONO, fontSize: 21, color: T.muted, opacity: p(at0, at0 + 0.08) }}>PRICE</span>
        <span style={{ position: "absolute", left: PX + 12, top: PY + PH + 96, fontFamily: MONO, fontSize: 21, color: c, opacity: p(at0 + 0.08, at0 + 0.16) }}>OSCILLATOR</span>
        {marks.map((m, i) => (
          <div key={i} style={{
            position: "absolute", left: SX(m.x) - 10,
            top: m.top ? PY - 46 : PY + PH + 130 - 46,
            width: 220, fontFamily: MONO, fontWeight: 700, fontSize: 22, color: c, opacity: p(at0 + 0.24 + i * 0.09, at0 + 0.3 + i * 0.09),
          }}>{m.l}</div>
        ))}
      </div>
    );
  };
  return (
    <Stage>
      <Head theme={T} kicker="INDICATORS · DIVERGENCE" title="When price and momentum disagree" color={A.ind} o={p(0, 0.06)} />
      {panel(140, "BEARISH divergence", A.bear, priceBear, oscBear, 0.08, [
        { x: 50, top: true, l: "higher high ↑" },
        { x: 50, l: "lower peak ↓" },
      ], 0.14)}
      {panel(990, "BULLISH divergence", A.bull, priceBull, oscBull, 0.42, [
        { x: 50, top: true, l: "lower low ↓" },
        { x: 50, l: "higher trough ↑" },
      ], 0.5)}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 880, textAlign: "center",
        fontFamily: SANS, fontSize: 28, color: T.muted, opacity: p(0.82, 0.92),
      }}>the move is running out of fuel — a reversal may be near</div>
      <SceneProgress dur={dur} color={A.ind} />
    </Stage>
  );
};

// ---------------------------------------------------------------- recap
const RecapScene: React.FC<{ dur?: number; items?: string[]; closer?: string }> =
  ({ dur, items = [], closer = "" }) => {
    const frame = useCurrentFrame();
    const p = useP(dur);
    return (
      <Stage>
        <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", opacity: p(0, 0.06) }}>
          <Kicker theme={T} text="CHAPTER RECAP" cx />
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 58, color: T.text, marginTop: 12, letterSpacing: -1.5 }}>What we just learned</div>
        </div>
        <div style={{ position: "absolute", left: 290, right: 290, top: 300 }}>
          {items.slice(0, 7).map((it, i) => {
            const at = 0.08 + i * (0.62 / Math.max(items.length, 1));
            const o = p(at, at + 0.06);
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 18, marginBottom: 15,
                background: mix(T.panel, A.gold, 0.05), border: `1.5px solid ${T.line}`,
                borderLeft: `4px solid ${A.gold}`, borderRadius: 12, padding: "14px 24px",
                opacity: o, transform: `translateX(${(1 - o) * -26}px)`,
              }}>
                <span style={{ color: A.gold, fontFamily: MONO, fontWeight: 700, fontSize: 24 }}>{i + 1}</span>
                <span style={{ fontFamily: SANS, fontSize: 27, color: T.text, lineHeight: 1.3 }}>{it}</span>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", opacity: p(0.78, 0.9) }}>
          <div style={{
            fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 38, color: A.gold,
            textShadow: `0 0 ${30 + Math.sin(frame * 0.06) * 14}px ${mix(T.bg0, A.gold, 0.7)}`,
          }}>{closer}</div>
        </div>
        <SceneProgress dur={dur} />
      </Stage>
    );
  };

// ===========================================================================
export const TAWScene: React.FC<{ variant: string;[key: string]: unknown }> = ({ variant, ...rest }) => {
  let content: React.ReactNode;
  let accent = A.gold;
  switch (variant) {
    case "taw_title": content = <TitleScene {...(rest as any)} />; break;
    case "taw_chtitle": content = <ChTitleScene {...(rest as any)} />; break;
    case "taw_concept": content = <ConceptScene {...(rest as any)} />; break;
    case "taw_anatomy": content = <AnatomyScene {...(rest as any)} />; accent = A.ind; break;
    case "taw_pattern": content = <PatternScene {...(rest as any)} />; break;
    case "taw_chart": content = <ChartScene {...(rest as any)} />; break;
    case "taw_indicator": content = <IndicatorScene {...(rest as any)} />; accent = A.ind; break;
    case "taw_div": content = <DivScene {...(rest as any)} />; accent = A.ind; break;
    case "taw_compare": content = <CompareScene {...(rest as any)} />; break;
    case "taw_rules": content = <RulesScene {...(rest as any)} />; break;
    case "taw_funnel": content = <FunnelScene {...(rest as any)} />; break;
    case "taw_wave": content = <WaveScene {...(rest as any)} />; break;
    case "taw_fib": content = <FibScene {...(rest as any)} />; accent = A.violet; break;
    case "taw_gauge": content = <GaugeScene {...(rest as any)} />; break;
    case "taw_equity": content = <EquityScene {...(rest as any)} />; accent = A.bull; break;
    case "taw_session": content = <SessionScene {...(rest as any)} />; break;
    case "taw_recap": content = <RecapScene {...(rest as any)} />; break;
    default: content = <TitleScene {...(rest as any)} />;
  }
  return (
    <AbsoluteFill>
      <Bg theme={T} accent={accent} />
      {content}
    </AbsoluteFill>
  );
};

export default TAWScene;
