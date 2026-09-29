/**
 * gt/kit.tsx — SHARED identity + hero engine for the GTT Buy-Schedule video (prefix `gt`).
 *
 * IDENTITY = "trading terminal": near-black terminal ground, monospace tickers, a faint
 * grid, a candlestick + horizontal trigger-rail motif. Every gt scene imports T, A and the
 * primitives below and composes them — the CHART is the stage, cards are annotations on it.
 *
 * SEMANTIC COLORS (consistent everywhere — never decorate randomly):
 *   A.buy   (green)  = buy fills / accumulation / gains / "good"
 *   A.stop  (rose)   = stop-loss / risk / loss / "danger"
 *   A.tgt   (cyan)   = target / objective / the identity color (== A.main)
 *   A.trig  (amber)  = trigger prices / momentum / caution
 *   A.d50   (blue)   = the 50-day moving average
 *   A.d200  (violet) = the 200-day moving average
 *   A.price (white)  = the live last-traded price
 *
 * Determinism only (rnd, never Math.random); no CSS filter/backdrop-filter.
 * Author on the 1920×1080 Stage. Scenes return <Stage>…</Stage> (or full-bleed for
 * title/divider/recap) and NEVER add their own <Bg> — the router wraps them in <TermBg>.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { makeTheme, mix, MONO, SANS, BW, BH, Head, rnd, CL } from "../../lib/primitives";

// ---------------------------------------------------------------- identity
export const T = makeTheme({
  bg0: "#04060B", bg1: "#070B15", bg2: "#0C1526", panel: "#0E1828",
  text: "#E9EFFA", muted: "#7A88A6", line: "rgba(150,185,255,0.08)",
  accent: "#38BDF8",
});

export const A = {
  main:  "#38BDF8", // cyan — identity / structure / target
  tgt:   "#38BDF8", // cyan — target / objective
  buy:   "#34D399", // green — buy fills / accumulation / gains
  stop:  "#FB7185", // rose — stop-loss / risk / loss
  trig:  "#FBBF24", // amber — trigger prices / momentum / caution
  d50:   "#60A5FA", // blue — 50-DMA
  d200:  "#A78BFA", // violet — 200-DMA
  price: "#EAF2FF", // white — live price
  ok:    "#34D399",
};

export { mix, MONO, SANS, BW, BH };
export const rupee = (v: number, d = 0) =>
  "₹" + v.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

// ---------------------------------------------------------------- candle math (module scope, deterministic)
export type Candle = { o: number; h: number; l: number; c: number };

/**
 * closesFrom — a deterministic daily close tape. `wave(i)` adds a shape (trend + cycles);
 * seeded noise keeps it lifelike but identical across render workers.
 */
export const closesFrom = (
  n: number, seed: number, base: number, wave: (i: number) => number, noise: number
): number[] =>
  Array.from({ length: n }, (_, i) =>
    Number((base + wave(i) + (rnd(i, seed, 13) - 0.5) * noise).toFixed(2)));

/** toCandles — gap-less OHLC from a close tape; seeded intrabar wicks. */
export const toCandles = (closes: number[], seed = 3): Candle[] =>
  closes.map((c, i) => {
    const o = i === 0 ? c - (rnd(i, seed, 2) - 0.5) * (c * 0.004) : closes[i - 1];
    const body = Math.abs(c - o);
    const wickUp = body * (0.4 + rnd(i, seed, 5)) + c * 0.0012;
    const wickDn = body * (0.4 + rnd(i, seed, 8)) + c * 0.0012;
    return { o, c, h: Math.max(o, c) + wickUp, l: Math.min(o, c) - wickDn };
  });

export const sma = (xs: number[], n: number): (number | undefined)[] =>
  xs.map((_, i) => (i + 1 < n ? undefined : Number((xs.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n).toFixed(2))));

/** Wilder-style RSI over a close tape (default 14). Leading values are undefined. */
export const rsiSeries = (xs: number[], n = 14): (number | undefined)[] => {
  const out: (number | undefined)[] = xs.map(() => undefined);
  let ag = 0, al = 0;
  for (let i = 1; i < xs.length; i++) {
    const ch = xs[i] - xs[i - 1];
    const g = Math.max(0, ch), l = Math.max(0, -ch);
    if (i <= n) { ag += g; al += l; if (i === n) { ag /= n; al /= n; out[i] = 100 - 100 / (1 + ag / Math.max(al, 1e-9)); } }
    else { ag = (ag * (n - 1) + g) / n; al = (al * (n - 1) + l) / n; out[i] = 100 - 100 / (1 + ag / Math.max(al, 1e-9)); }
  }
  return out;
};

/**
 * stockTape — a deterministic ~130-session close tape that drifts up toward `ltp` and ends
 * exactly at it, wobbling inside [lo, hi]. Used to draw worked-example charts at real price
 * scales (e.g. HAL ≈ ₹4,800) so rails/markers sit at true rupee levels.
 */
export const stockTape = (ltp: number, lo: number, hi: number, seed: number, n = 130): number[] => {
  const amp = (hi - lo) * 0.15;
  const startBand = lo + (hi - lo) * 0.32;
  const raw = Array.from({ length: n }, (_, i) => {
    const trend = startBand + (ltp - startBand) * (i / (n - 1));
    const wob = amp * Math.sin(i * 0.11 + seed) + amp * 0.5 * Math.sin(i * 0.29 + seed * 2) + (rnd(i, seed, 5) - 0.5) * amp * 0.6
      - Math.max(0, i - 118) * (hi - lo) * 0.01;
    return trend + wob;
  });
  const out = raw.map((v) => Number(Math.max(lo + (hi - lo) * 0.04, Math.min(hi - (hi - lo) * 0.04, v)).toFixed(2)));
  out[n - 1] = ltp;
  return out;
};

// A generic teaching tape reused as the recurring centerpiece (≈130 sessions, trend + pullback).
export const TAPE = closesFrom(130, 91, 100,
  (i) => i * 0.16 + 6.5 * Math.sin(i * 0.09) + 3 * Math.sin(i * 0.27) - Math.max(0, (i - 108)) * 0.9, 2.4);
export const TAPE_C = toCandles(TAPE, 3);
export const TAPE_50 = sma(TAPE, 50);
export const TAPE_200 = sma(TAPE, 40); // shorter proxy for a 200-DMA on a short tape
export const TAPE_RSI = rsiSeries(TAPE, 14);

// ---------------------------------------------------------------- timing helpers (kept local for convenience)
export const useP = (dur?: unknown) => {
  const frame = useCurrentFrame();
  const F = Math.max(45, (typeof dur === "number" ? dur : 14) * 30);
  return (a: number, b: number) => interpolate(frame, [a * F, b * F], [0, 1], CL);
};
export const usePop = (dur?: unknown) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const F = Math.max(45, (typeof dur === "number" ? dur : 14) * 30);
  return (at: number) => spring({ frame: frame - Math.round(at * F), fps, config: { damping: 14, stiffness: 120 } });
};

// ---------------------------------------------------------------- identity chrome
/** TermBg — the terminal ground: dense grid, drifting scanline, corner ticks. Router-level. */
export const TermBg: React.FC<{ accent?: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const ac = accent || A.main;
  const scan = ((frame * 1.4) % (BH + 200)) - 100;
  const pulse = (Math.sin(frame * 0.02) + 1) / 2;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 8%, ${T.bg2} 0%, ${T.bg1} 52%, ${T.bg0} 100%)` }}>
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${T.line} 1px, transparent 1px), linear-gradient(90deg, ${T.line} 1px, transparent 1px)`,
        backgroundSize: "48px 48px", opacity: 0.55,
        maskImage: "radial-gradient(ellipse at center, black 55%, transparent 96%)",
      }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 0%, ${mix(T.bg1, ac, 0.5)} 0%, transparent 42%)`, opacity: 0.22 + pulse * 0.14 }} />
      {/* horizontal terminal scanline */}
      <div style={{ position: "absolute", left: 0, right: 0, top: scan, height: 2, background: `linear-gradient(90deg, transparent, ${mix(T.bg0, ac, 0.7)}, transparent)`, opacity: 0.5 }} />
    </AbsoluteFill>
  );
};

/** GTHead — Head that fades in over the first 6% of the beat. Use in every content scene. */
export const GTHead: React.FC<{ kicker: string; title: string; color?: string; p: (a: number, b: number) => number }> = ({
  kicker, title, color, p,
}) => <Head theme={T} kicker={kicker} title={title} color={color || A.main} o={p(0, 0.06)} />;

/** SceneProgress — thin top-edge bar filling L→R over the whole beat. Never collides with captions. */
export const SceneProgress: React.FC<{ p: (a: number, b: number) => number; color?: string }> = ({ p, color }) => (
  <div style={{ position: "absolute", left: 0, top: 0, height: 3, width: `${p(0, 1) * 100}%`,
    background: `linear-gradient(90deg, ${color || A.main}, ${mix(color || A.main, "#ffffff", 0.4)})`,
    boxShadow: `0 0 10px ${color || A.main}`, borderRadius: 2 }} />
);

/** DefBadge — a small mono-caps pill flagging a teaching moment. */
export const DefBadge: React.FC<{ text: string; color?: string; o?: number }> = ({ text, color, o = 1 }) => (
  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: 2, textTransform: "uppercase",
    color: T.bg0, background: color || A.main, borderRadius: 6, padding: "5px 11px", opacity: o }}>{text}</span>
);

/** TapeStrip — a faint drifting candlestick ribbon for title/divider ambience. */
export const TapeStrip: React.FC<{ x: number; y: number; w: number; h: number; o?: number; seed?: number; color?: string }> = ({
  x, y, w, h, o = 1, seed = 1, color,
}) => {
  const frame = useCurrentFrame();
  const n = 30, cw = w / n;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: o, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const s = Math.sin(i * 1.3 + seed * 3.1) * 0.5 + Math.sin(i * 0.5 + frame * 0.012 + seed) * 0.5;
        const up = s > 0;
        const bh = 8 + Math.abs(s) * (h * 0.4);
        const col = up ? (color || A.buy) : A.stop;
        return (
          <div key={i} style={{ position: "absolute", left: i * cw + cw * 0.3, top: h / 2 - bh / 2,
            width: cw * 0.4, height: bh, borderRadius: 2, background: mix(T.panel, col, 0.5),
            border: `1.5px solid ${col}`, opacity: 0.3 + Math.abs(s) * 0.4 }} />
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- the hero: CandleChart
export type Rail = {
  price: number; label: string; color: string;
  fired?: number;        // 0..1 fire animation (0 = resting, 1 = fully fired)
  dashed?: boolean;      // resting orders are dashed; fired go solid
  side?: "buy" | "sell";
};
export type Dma = { values: (number | undefined)[]; color: string; label?: string; w?: number };

/** priceY — map a price to a Y inside a chart box. Exported so scenes can align outside labels. */
export const priceY = (price: number, lo: number, hi: number, y: number, h: number) =>
  y + h - ((price - lo) / (hi - lo)) * h;

/**
 * CandleChart — THE recurring centerpiece. Streams candles in over `reveal`, overlays DMAs,
 * draws horizontal trigger rails (resting = dashed; fired = solid + pulsing band), and a live
 * price marker that you position by `marker.price` (descend it with a phase in the scene).
 * All coordinates are inside the Stage. Pass explicit lo/hi for a stable scale across a scene.
 */
export const CandleChart: React.FC<{
  x: number; y: number; w: number; h: number;
  candles: Candle[]; lo: number; hi: number;
  reveal?: number;                 // 0..1 fraction of candles shown
  dmas?: Dma[];
  rails?: Rail[];
  marker?: { price: number; o?: number; label?: string; color?: string };
  o?: number;
  axis?: boolean;                  // right-side price axis ticks
  xlabels?: [string, string];     // [left, right] time labels
  grid?: number;                   // number of horizontal gridlines
}> = ({ x, y, w, h, candles, lo, hi, reveal = 1, dmas = [], rails = [], marker, o = 1, axis = true, xlabels, grid = 4 }) => {
  const frame = useCurrentFrame();
  const n = candles.length;
  const shown = Math.max(1, Math.floor(n * Math.max(0, Math.min(1, reveal))));
  const cw = w / n;
  const bodyW = Math.max(2, cw * 0.62);
  const Y = (price: number) => y + h - ((price - lo) / (hi - lo)) * h;
  const polyPts = (vals: (number | undefined)[]) =>
    vals.slice(0, shown).map((v, i) => (v === undefined ? "" : `${x + i * cw + cw / 2},${Y(v)}`)).filter(Boolean).join(" ");
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
      <svg width={BW} height={BH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {/* frame + grid */}
        <rect x={x} y={y} width={w} height={h} fill={mix(T.bg0, T.bg2, 0.5)} stroke={T.line} strokeWidth={1} rx={10} />
        {Array.from({ length: grid + 1 }).map((_, i) => (
          <line key={i} x1={x} y1={y + (i * h) / grid} x2={x + w} y2={y + (i * h) / grid} stroke={T.line} strokeWidth={1} />
        ))}
        {/* fired rail bands (under candles) */}
        {rails.map((r, i) => {
          const ry = Y(r.price); const f = r.fired || 0;
          if (f <= 0) return null;
          const glow = 0.5 + Math.sin(frame * 0.18) * 0.5;
          return <rect key={`b${i}`} x={x} y={ry - 13} width={w} height={26} fill={r.color} opacity={0.06 + f * 0.12 * glow} />;
        })}
        {/* candles */}
        {candles.slice(0, shown).map((c, i) => {
          const up = c.c >= c.o; const col = up ? A.buy : A.stop;
          const cx = x + i * cw + cw / 2;
          const bt = Y(Math.max(c.o, c.c)), bb = Y(Math.min(c.o, c.c));
          return (
            <g key={i}>
              <line x1={cx} y1={Y(c.h)} x2={cx} y2={Y(c.l)} stroke={col} strokeWidth={Math.max(1, bodyW * 0.14)} opacity={0.9} />
              <rect x={cx - bodyW / 2} y={bt} width={bodyW} height={Math.max(1.4, bb - bt)} rx={1.5}
                fill={up ? mix(T.bg0, col, 0.7) : mix(T.bg0, col, 0.5)} stroke={col} strokeWidth={1} />
            </g>
          );
        })}
        {/* DMA overlays */}
        {dmas.map((d, i) => (
          <polyline key={i} points={polyPts(d.values)} fill="none" stroke={d.color} strokeWidth={d.w || 3} opacity={0.92} strokeLinejoin="round" />
        ))}
        {/* rails (horizontal lines + travelling dashes) */}
        {rails.map((r, i) => {
          const ry = Y(r.price); const f = r.fired || 0;
          const solid = !r.dashed || f > 0.5;
          return (
            <g key={`r${i}`}>
              <line x1={x} y1={ry} x2={x + w} y2={ry} stroke={r.color} strokeWidth={f > 0.5 ? 3 : 2}
                strokeDasharray={solid ? undefined : "9 9"} strokeDashoffset={solid ? 0 : -frame * 1.4} opacity={0.55 + f * 0.45} />
            </g>
          );
        })}
        {/* price axis ticks */}
        {axis && Array.from({ length: grid + 1 }).map((_, i) => {
          const pr = hi - ((hi - lo) * i) / grid;
          return <text key={i} x={x + w + 10} y={y + (i * h) / grid + 6} fill={T.muted} fontFamily={MONO} fontSize={17}>{rupee(pr, 0)}</text>;
        })}
        {xlabels && <>
          <text x={x + 4} y={y + h + 26} fill={T.muted} fontFamily={MONO} fontSize={17}>{xlabels[0]}</text>
          <text x={x + w - 90} y={y + h + 26} fill={T.muted} fontFamily={MONO} fontSize={17}>{xlabels[1]}</text>
        </>}
      </svg>
      {/* rail label chips (HTML) — anchored at the LEFT inside edge so the whole right side
          stays free for annotation columns. Sit just above each rail line. */}
      {rails.map((r, i) => {
        const ry = Y(r.price); const f = r.fired || 0;
        const pulse = f > 0 ? 0.7 + Math.sin(frame * 0.2) * 0.3 : 1;
        return (
          <div key={`lc${i}`} style={{ position: "absolute", left: x + 10, top: ry - 15, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 19, color: T.bg0, background: r.color,
              borderRadius: 6, padding: "4px 9px", opacity: (f > 0 ? pulse : 0.92), whiteSpace: "nowrap",
              boxShadow: f > 0.5 ? `0 0 18px ${r.color}` : "none" }}>{r.label}</div>
          </div>
        );
      })}
      {/* live price marker */}
      {marker && (() => {
        const my = Y(marker.price); const mo = marker.o ?? 1; const col = marker.color || A.price;
        const g = 0.6 + Math.sin(frame * 0.12) * 0.4;
        return (
          <>
            <div style={{ position: "absolute", left: x + w - 6, top: my - 9, width: 18, height: 18, borderRadius: 12,
              background: col, opacity: mo, boxShadow: `0 0 ${10 + g * 14}px ${col}` }} />
            <div style={{ position: "absolute", left: x + w - 220, top: my - 15, width: 200, textAlign: "right",
              fontFamily: MONO, fontWeight: 800, fontSize: 24, color: col, opacity: mo, textShadow: `0 0 12px ${mix(T.bg0, col, 0.6)}` }}>
              {marker.label || rupee(marker.price, 0)}
            </div>
          </>
        );
      })()}
    </div>
  );
};

// ---------------------------------------------------------------- OrderTicket
/** OrderTicket — pops when a rail fires: "BUY 4 @ ₹4,760 ✓". Position at the fired rail. */
export const OrderTicket: React.FC<{
  x: number; y: number; side: "BUY" | "SELL"; qty: number; price: number; o?: number; note?: string; color?: string;
}> = ({ x, y, side, qty, price, o = 1, note, color }) => {
  const col = color || (side === "BUY" ? A.buy : A.stop);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: Math.max(0, Math.min(1, o)),
      transform: `translateY(${(1 - Math.max(0, Math.min(1, o))) * 14}px) scale(${0.9 + Math.max(0, Math.min(1, o)) * 0.1})`,
      background: mix(T.panel, col, 0.16), border: `2px solid ${col}`, borderRadius: 12, padding: "10px 16px",
      boxShadow: `0 0 26px ${mix(T.bg0, col, 0.5)}`, display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap" }}>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: T.bg0, background: col, borderRadius: 5, padding: "3px 9px" }}>{side}</span>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.text }}>{qty} @ {rupee(price, 0)}</span>
      <span style={{ fontSize: 22, color: col }}>✓</span>
      {note && <span style={{ fontFamily: MONO, fontSize: 18, color: T.muted }}>{note}</span>}
    </div>
  );
};

/** FillMeter — accumulates filled quantity + running average price. */
export const FillMeter: React.FC<{ x: number; y: number; qty: number; total: number; avg: number; o?: number }> = ({
  x, y, qty, total, avg, o = 1,
}) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o, background: mix(T.panel, A.buy, 0.1),
    border: `2px solid ${mix(T.line, A.buy, 0.5)}`, borderRadius: 14, padding: "14px 20px", minWidth: 250 }}>
    <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>Filled</div>
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: A.buy, marginTop: 4 }}>{qty} / {total} sh</div>
    <div style={{ fontFamily: MONO, fontSize: 21, color: T.text, marginTop: 6 }}>avg {rupee(avg, 0)}</div>
  </div>
);

// ---------------------------------------------------------------- PriceLadder (order book / depth)
/** Ladder — a vertical price ladder; rows are resting orders that light up when hit. */
export const Ladder: React.FC<{
  x: number; y: number; w?: number;
  rows: { price: number; label?: string; color?: string; hit?: number; qty?: number }[];
  o?: number; title?: string;
}> = ({ x, y, w = 360, rows, o = 1, title }) => {
  const frame = useCurrentFrame();
  const rowH = 46;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: o }}>
      {title && <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 1.5, textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>{title}</div>}
      <div style={{ border: `1.5px solid ${T.line}`, borderRadius: 12, overflow: "hidden", background: mix(T.bg0, T.bg2, 0.5) }}>
        {rows.map((r, i) => {
          const col = r.color || T.muted; const hit = r.hit || 0;
          const glow = hit > 0 ? 0.6 + Math.sin(frame * 0.2) * 0.4 : 0;
          return (
            <div key={i} style={{ height: rowH, display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px", borderTop: i ? `1px solid ${T.line}` : "none",
              background: hit > 0 ? mix(T.panel, col, 0.14 + glow * 0.14) : "transparent" }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: hit > 0 ? col : T.text }}>{rupee(r.price, 0)}</span>
              <span style={{ fontFamily: MONO, fontSize: 18, color: hit > 0 ? col : T.muted, whiteSpace: "nowrap" }}>
                {r.label || (r.qty ? `${r.qty} sh` : "")}{hit > 0 ? " ✓" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- OCO bracket
/**
 * OCOBracket — target (above) / stop (below) around an entry line, on the right rail of a chart.
 * `fired`: "target" | "stop" | null — the loser greys out (one-cancels-the-other).
 */
export const OCOBracket: React.FC<{
  x: number; yEntry: number; yTgt: number; yStop: number; w?: number;
  tgtLabel: string; stopLabel: string; entryLabel?: string; fired?: "target" | "stop" | null; o?: number;
}> = ({ x, yEntry, yTgt, yStop, w = 300, tgtLabel, stopLabel, entryLabel, fired = null, o = 1 }) => {
  const frame = useCurrentFrame();
  const dead = (side: "target" | "stop") => (fired && fired !== side ? 0.28 : 1);
  const live = (side: "target" | "stop") => (fired === side ? 0.6 + Math.sin(frame * 0.2) * 0.4 : 1);
  const chip = (yy: number, label: string, col: string, side: "target" | "stop") => (
    <div style={{ position: "absolute", left: x + 14, top: yy - 16, opacity: o * dead(side),
      fontFamily: MONO, fontWeight: 800, fontSize: 19, color: T.bg0, background: col, borderRadius: 6, padding: "5px 10px",
      boxShadow: fired === side ? `0 0 18px ${col}` : "none" }}>
      <span style={{ opacity: live(side) }}>{label}</span>
    </div>
  );
  return (
    <>
      <svg width={BW} height={BH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={x} y1={yTgt} x2={x} y2={yStop} stroke={T.muted} strokeWidth={2} opacity={o * 0.6} />
        <line x1={x - 8} y1={yTgt} x2={x + 8} y2={yTgt} stroke={A.tgt} strokeWidth={3} opacity={o * dead("target")} />
        <line x1={x - 8} y1={yStop} x2={x + 8} y2={yStop} stroke={A.stop} strokeWidth={3} opacity={o * dead("stop")} />
        <line x1={x - 8} y1={yEntry} x2={x + 8} y2={yEntry} stroke={A.buy} strokeWidth={3} opacity={o} strokeDasharray="4 4" />
      </svg>
      {chip(yTgt, tgtLabel, A.tgt, "target")}
      {chip(yStop, stopLabel, A.stop, "stop")}
      {entryLabel && (
        <div style={{ position: "absolute", left: x + 14, top: yEntry - 15, opacity: o, fontFamily: MONO, fontWeight: 700, fontSize: 18, color: A.buy }}>{entryLabel}</div>
      )}
    </>
  );
};

// ---------------------------------------------------------------- RSI panel
/**
 * RSIPanel — RSI oscillator computed on a close tape, with 30/70 shaded bands, a line sliced by
 * `reveal`, and an end marker. Reuse across the RSI reprise and worked-example scenes.
 */
export const RSIPanel: React.FC<{
  x: number; y: number; w: number; h: number; closes: number[]; reveal?: number; o?: number; period?: number; title?: string;
}> = ({ x, y, w, h, closes, reveal = 1, o = 1, period = 14, title }) => {
  const frame = useCurrentFrame();
  const rsi = React.useMemo(() => rsiSeries(closes, period), [closes, period]);
  const defined = rsi.map((v, i) => [i, v] as [number, number | undefined]).filter(([, v]) => v !== undefined) as [number, number][];
  const n = closes.length;
  const shown = Math.max(1, Math.floor(defined.length * Math.max(0, Math.min(1, reveal))));
  const Yv = (v: number) => y + h - (v / 100) * h;
  const Xv = (i: number) => x + (i / (n - 1)) * w;
  const pts = defined.slice(0, shown).map(([i, v]) => `${Xv(i)},${Yv(v)}`).join(" ");
  const last = defined[Math.min(defined.length - 1, shown - 1)];
  const glow = 0.6 + Math.sin(frame * 0.14) * 0.4;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
      <svg width={BW} height={BH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <rect x={x} y={y} width={w} height={h} fill={mix(T.bg0, T.bg2, 0.4)} stroke={T.line} strokeWidth={1} rx={10} />
        {/* overbought / oversold bands */}
        <rect x={x} y={Yv(100)} width={w} height={Yv(70) - Yv(100)} fill={A.stop} opacity={0.09} />
        <rect x={x} y={Yv(30)} width={w} height={Yv(0) - Yv(30)} fill={A.buy} opacity={0.09} />
        <line x1={x} y1={Yv(70)} x2={x + w} y2={Yv(70)} stroke={A.stop} strokeWidth={1.5} strokeDasharray="7 7" opacity={0.7} />
        <line x1={x} y1={Yv(30)} x2={x + w} y2={Yv(30)} stroke={A.buy} strokeWidth={1.5} strokeDasharray="7 7" opacity={0.7} />
        <line x1={x} y1={Yv(50)} x2={x + w} y2={Yv(50)} stroke={T.line} strokeWidth={1} />
        <polyline points={pts} fill="none" stroke={A.trig} strokeWidth={3.5} strokeLinejoin="round" />
        {last && <circle cx={Xv(last[0])} cy={Yv(last[1])} r={7} fill={A.trig} opacity={glow} />}
        <text x={x + 10} y={Yv(70) - 8} fill={A.stop} fontFamily={MONO} fontSize={17}>70 · overbought</text>
        <text x={x + 10} y={Yv(30) + 22} fill={A.buy} fontFamily={MONO} fontSize={17}>30 · oversold</text>
        {title && <text x={x + 10} y={y - 10} fill={T.muted} fontFamily={MONO} fontSize={18}>{title}</text>}
      </svg>
      {last && (
        <div style={{ position: "absolute", left: x + w + 14, top: Yv(last[1]) - 16, fontFamily: MONO, fontWeight: 800, fontSize: 26, color: A.trig }}>
          {last[1].toFixed(1)}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------- small chips
/** Chip — a labeled value chip (mono value over mono caps label). */
export const Chip: React.FC<{ label: string; value: string; color?: string; o?: number; hero?: boolean; sub?: string }> = ({
  label, value, color, o = 1, hero, sub,
}) => (
  <div style={{ opacity: o, background: mix(T.panel, color || A.main, hero ? 0.16 : 0.07),
    border: `2px solid ${hero ? (color || A.main) : mix(T.line, color || A.main, 0.4)}`, borderRadius: 13, padding: "11px 15px", minWidth: 140 }}>
    <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 800, color: color || T.text, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 0.5, textTransform: "uppercase", color: T.muted, marginTop: 3 }}>{label}</div>
    {sub && <div style={{ fontFamily: SANS, fontSize: 18, color: mix(T.muted, color || A.main, 0.5), marginTop: 4 }}>{sub}</div>}
  </div>
);

/** Verdict — one-line plain-English takeaway, sits low in the content zone (captions occupy y>930). */
export const Verdict: React.FC<{ text: string; o: number; color?: string; y?: number }> = ({ text, o, color, y = 862 }) => (
  <div style={{ position: "absolute", left: 130, top: y, width: 1480, borderLeft: `5px solid ${color || A.main}`,
    paddingLeft: 18, fontFamily: SANS, fontWeight: 700, fontSize: 27, color: T.text, opacity: o, lineHeight: 1.28 }}>{text}</div>
);
