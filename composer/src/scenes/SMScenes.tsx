/**
 * SMScenes.tsx — "Indian Stock Market" Telugu full course (prefix `sm`).
 *
 * Identity (skills/04):
 *   theme accent = green (growth). Semantic accents:
 *     up    green  #34D399 — growth, profit, buying, long-term
 *     down  rose   #FB7185 — loss, risk, selling, the trap
 *     mkt   cyan   #22D3EE — market structure / mechanics (neutral)
 *     money amber  #FBBF24 — rupees, capital, charges
 *     deriv violet #A78BFA — derivatives / advanced instruments
 *   Recurring motif: a live candlestick mini-chart (CandleMotif) — title,
 *   dividers, chapter titles.
 *
 * Telugu long-form rules (skills/11): NO letterSpacing on Telugu (kickers are
 * LATIN), first skeleton visible by p≈0.06, content fills y190–880 (captions
 * replace Foot), Telugu ≥ 23px, lineHeight ≥ 1.35, mix() gets HEX only.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  makeTheme, mix, useP, usePop, rnd, MONO, SANS,
  Bg, Stage, Kicker, Head, Card, Flow, Wire, Counter, Brackets, ScanBeam,
} from "../lib/primitives";

const T = makeTheme({ accent: "#34D399" });
const A = { up: "#34D399", down: "#FB7185", mkt: "#22D3EE", money: "#FBBF24", deriv: "#A78BFA" };

// SMHead — Telugu-safe header: Latin kicker (tracked), Telugu title untracked.
const SMHead: React.FC<{ kicker: string; title: string; color?: string; o?: number }> = ({
  kicker, title, color, o = 1,
}) => (
  <div style={{ position: "absolute", left: 100, top: 54, right: 100 }}>
    <Kicker theme={T} text={kicker} color={color} o={o} />
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: T.text, marginTop: 12, letterSpacing: 0, opacity: o }}>{title}</div>
  </div>
);

// ---------------------------------------------------------------- market data
// Deterministic OHLC random walk (module scope, once per worker).
const CANDLES = (() => {
  const out: { o: number; h: number; l: number; c: number }[] = [];
  let px = 100;
  for (let i = 0; i < 60; i++) {
    const drift = 0.35 + Math.sin(i * 0.4) * 0.5;
    const chg = (rnd(i, 7, 3) - 0.45) * 6 + drift;
    const o = px, c = px + chg;
    const h = Math.max(o, c) + rnd(i, 11, 5) * 2.5;
    const l = Math.min(o, c) - rnd(i, 13, 9) * 2.5;
    out.push({ o, h, l, c });
    px = c;
  }
  return out;
})();
const CMIN = Math.min(...CANDLES.map((k) => k.l));
const CMAX = Math.max(...CANDLES.map((k) => k.h));

/** The motif: a live candlestick mini-chart. `k` = how many candles visible. */
const CandleMotif: React.FC<{
  x: number; y: number; w: number; h: number; o?: number; k?: number; dim?: boolean;
}> = ({ x, y, w, h, o = 1, k = 26, dim }) => {
  const frame = useCurrentFrame();
  const n = Math.min(k, CANDLES.length);
  const cw = w / n;
  const sy = (v: number) => y + h - ((v - CMIN) / (CMAX - CMIN)) * h;
  // last candle "ticks" live off raw frame — continuous motion
  const tick = Math.sin(frame * 0.11) * 2.2 + Math.sin(frame * 0.043) * 1.6;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: o * (dim ? 0.35 : 1), pointerEvents: "none" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {CANDLES.slice(0, n).map((c0, i) => {
          const last = i === n - 1;
          const c = last ? { ...c0, c: c0.c + tick, h: Math.max(c0.h, c0.c + tick), l: Math.min(c0.l, c0.c + tick) } : c0;
          const green = c.c >= c.o;
          const col = green ? A.up : A.down;
          const cx = x + i * cw + cw / 2;
          return (
            <g key={i} opacity={0.35 + (i / n) * 0.65}>
              <line x1={cx} y1={sy(c.h)} x2={cx} y2={sy(c.l)} stroke={col} strokeWidth={2} />
              <rect x={cx - cw * 0.32} y={Math.min(sy(c.o), sy(c.c))} width={cw * 0.64}
                height={Math.max(3, Math.abs(sy(c.o) - sy(c.c)))} rx={2} fill={col} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- sm_title
const TitleScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const pop = usePop(dur);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <CandleMotif x={120} y={640} w={640} h={280} o={p(0.08, 0.22)} k={34} dim />
      <CandleMotif x={1240} y={140} w={560} h={240} o={p(0.14, 0.28)} k={26} dim />
      {/* orbiting ₹ dots */}
      {Array.from({ length: 10 }).map((_, i) => {
        const ang = frame * 0.009 + (i / 10) * Math.PI * 2;
        return (
          <div key={i} style={{
            position: "absolute", left: 960 + Math.cos(ang) * (640 + i * 10) - 12,
            top: 540 + Math.sin(ang) * (300 + i * 6) - 12,
            fontFamily: MONO, fontWeight: 800, fontSize: 22, color: i % 2 ? A.up : A.money,
            opacity: 0.15 + rnd(i, 3) * 0.2, textShadow: `0 0 12px ${i % 2 ? A.up : A.money}`,
          }}>₹</div>
        );
      })}
      <div style={{ textAlign: "center", transform: `scale(${0.92 + pop(0) * 0.08})`, zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <Kicker theme={T} text="FULL COURSE · 2026" cx />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 112, lineHeight: 1.08, letterSpacing: 0, color: T.text }}>
          <div>స్టాక్ మార్కెట్</div>
          <div style={{ color: A.up, textShadow: `0 0 70px ${mix(T.bg0, A.up, 0.7)}` }}>సున్నా నుండి పూర్తిగా</div>
        </div>
        <div style={{ height: 6, width: interpolate(p(0.18, 0.45), [0, 1], [0, 560]), background: `linear-gradient(90deg, ${A.up}, ${A.mkt})`, borderRadius: 3, margin: "30px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 36, color: T.muted, opacity: p(0.28, 0.5), lineHeight: 1.4 }}>
          షేర్లు · మ్యూచువల్ ఫండ్స్ · ETFs · ఫ్యూచర్స్ & ఆప్షన్స్
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- sm_ptitle
const PTitleScene: React.FC<{ dur?: number; title?: string; sub?: string; kicker?: string }> = ({
  dur, title = "", sub = "", kicker = "CHAPTER",
}) => {
  const p = useP(dur);
  const pop = usePop(dur);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <CandleMotif x={200} y={660} w={1520} h={220} o={p(0.1, 0.3)} k={44} dim />
      <div style={{ textAlign: "center", transform: `scale(${0.94 + pop(0) * 0.06})` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Kicker theme={T} text={kicker} cx />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, lineHeight: 1.12, letterSpacing: 0, color: T.text, maxWidth: 1560 }}>{title}</div>
        <div style={{ height: 6, width: interpolate(p(0.18, 0.45), [0, 1], [0, 480]), background: `linear-gradient(90deg, ${A.up}, ${A.mkt})`, borderRadius: 3, margin: "28px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 34, color: T.muted, opacity: p(0.28, 0.5), lineHeight: 1.4 }}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- sm_divider
const TOTAL_PARTS = 12;
const DividerScene: React.FC<{ dur?: number; n?: number; title?: string; sub?: string; color?: string }> = ({
  dur, n = 1, title = "", sub = "", color = A.up,
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Brackets x={310} y={290} w={1300} h={490} color={color} o={p(0.02, 0.12)} len={54} />
      <ScanBeam theme={T} x={320} y={300} w={1280} h={470} color={color} o={p(0.05, 0.2)} speed={1.6} />
      <CandleMotif x={1330} y={330} w={230} h={110} o={p(0.2, 0.34)} k={16} dim />
      <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color, letterSpacing: 10, opacity: p(0.05, 0.15) }}>
          PART {n < 10 ? "0" + n : n}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 86, color: T.text, letterSpacing: 0, marginTop: 20, opacity: p(0.12, 0.24), transform: `translateY(${(1 - p(0.12, 0.24)) * 30}px)` }}>{title}</div>
        <div style={{ height: 5, width: interpolate(p(0.2, 0.5), [0, 1], [0, 420]), background: color, borderRadius: 3, margin: "26px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 32, color: T.muted, opacity: p(0.3, 0.45), lineHeight: 1.4 }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, display: "flex", justifyContent: "center", gap: 13, opacity: p(0.3, 0.45) }}>
        {Array.from({ length: TOTAL_PARTS }).map((_, idx) => {
          const i = idx + 1;
          return (
            <div key={i} style={{ width: i === n ? 40 : 13, height: 13, borderRadius: 8,
              background: i <= n ? color : mix(T.panel, color, 0.15), border: `1.5px solid ${i <= n ? color : T.bg2}`,
              opacity: i === n ? 0.7 + Math.sin(frame * 0.1) * 0.3 : 1 }} />
          );
        })}
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_recap
const RecapScene: React.FC<{ dur?: number; items?: string[]; closer?: string; title?: string }> = ({
  dur, items = [], closer = "నేర్చుకున్నాకే పెట్టుబడి — ఇదే బంగారు నియమం.", title = "ఒక్క చూపులో గుర్తుంచుకోండి",
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <AbsoluteFill style={{ padding: "60px 130px", justifyContent: "center" }}>
      <CandleMotif x={1460} y={90} w={330} h={130} o={0.4} k={18} dim />
      <div style={{ opacity: p(0, 0.06), textAlign: "center", marginBottom: 26 }}>
        <Kicker theme={T} text="RECAP" cx />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 58, color: T.text, marginTop: 12, letterSpacing: 0 }}>{title}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 1440, margin: "0 auto", width: "100%" }}>
        {items.map((it, i) => {
          const at = 0.06 + i * 0.08;
          const o = p(at, at + 0.07);
          const ghost = p(0.02, 0.06);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18,
              opacity: Math.max(ghost * 0.25, o), transform: `translateX(${(1 - o) * -26}px)`,
              background: mix(T.panel, A.up, 0.04 + o * 0.04), border: `1.5px solid ${mix(T.bg2, A.up, o * 0.5)}`,
              borderLeft: `4px solid ${o > 0.5 ? A.up : T.bg2}`, borderRadius: 12, padding: "14px 26px" }}>
              <span style={{ color: A.up, fontFamily: MONO, fontWeight: 700, fontSize: 26 }}>{i + 1}</span>
              <span style={{ fontFamily: SANS, fontSize: 29, color: T.text, lineHeight: 1.35 }}>{it}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 30, opacity: p(0.8, 0.9) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 40, color: A.up, textShadow: `0 0 ${28 + Math.sin(frame * 0.06) * 14}px ${mix(T.bg0, A.up, 0.7)}` }}>{closer}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- sm_checklist
// Full-width rows, vertically centered, ghost skeleton from p≈0.04 (skills/11).
const ChecklistScene: React.FC<{ dur?: number; kicker?: string; title?: string; color?: string; items?: string[]; icon?: string }> = ({
  dur, kicker = "CHECKLIST", title = "", color = A.up, items = [], icon = "✅",
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = items.length;
  const rowH = Math.min(112, Math.floor(600 / n) - 10);
  const totalH = n * (rowH + 14);
  const y0 = 210 + Math.max(0, (660 - totalH) / 2);
  const hot = Math.floor(frame / 30) % n;
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={color} o={p(0, 0.06)} />
      {items.map((it, i) => {
        const at = 0.08 + (i * 0.7) / n;
        const o = p(at, at + 0.08);
        const ghost = p(0.03, 0.07);
        const active = hot === i && p(0.8, 0.81) > 0.5;
        return (
          <div key={i} style={{
            position: "absolute", left: 130, top: y0 + i * (rowH + 14), width: 1660, height: rowH,
            display: "flex", alignItems: "center", gap: 24, padding: "0 34px", boxSizing: "border-box",
            borderRadius: 16, opacity: Math.max(ghost * 0.22, o),
            background: mix(T.panel, color, o > 0.5 ? (active ? 0.16 : 0.09) : 0.02),
            border: `2px solid ${o > 0.5 ? mix(T.bg2, color, active ? 1 : 0.6) : T.bg2}`,
            transform: `translateX(${(1 - o) * -30}px) scale(${active ? 1.015 : 1})`,
          }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: mix(T.panel, color, 0.2), border: `2px solid ${color}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, opacity: o }}>{icon}</div>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 27, color, opacity: o }}>{i + 1}</span>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 31, color: T.text, lineHeight: 1.35 }}>{it}</span>
          </div>
        );
      })}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_iconcards
// 2x2 (or 2x3) icon cards, enriched + vertically filling (skills/11).
const IconCardsScene: React.FC<{
  dur?: number; kicker?: string; title?: string; color?: string;
  items?: { emoji: string; k: string; v: string; chip?: string }[];
}> = ({ dur, kicker = "CONCEPTS", title = "", color = A.mkt, items = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const cols = items.length > 4 ? 3 : 2;
  const rows = Math.ceil(items.length / cols);
  const w = cols === 2 ? 810 : 533, gap = 24;
  const h = rows === 2 ? 320 : 210;
  const y0 = 210 + (660 - (rows * h + (rows - 1) * gap)) / 2;
  const hot = Math.floor(frame / 32) % items.length;
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={color} o={p(0, 0.06)} />
      {items.map((it, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const at = 0.1 + i * (0.55 / items.length);
        const o = p(at, at + 0.09);
        const ghost = p(0.03, 0.07);
        const active = hot === i && p(0.78, 0.79) > 0.5;
        return (
          <div key={i} style={{
            position: "absolute", left: 130 + c * (w + gap), top: y0 + r * (h + gap), width: w, height: h,
            borderRadius: 20, boxSizing: "border-box", padding: "26px 30px",
            opacity: Math.max(ghost * 0.22, o), transform: `translateY(${(1 - o) * 22}px) scale(${active ? 1.02 : 1})`,
            background: mix(T.panel, color, o > 0.5 ? (active ? 0.15 : 0.08) : 0.02),
            border: `2.5px solid ${o > 0.5 ? mix(T.bg2, color, active ? 1 : 0.65) : T.bg2}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontSize: h > 250 ? 62 : 46 }}>{it.emoji}</span>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: h > 250 ? 36 : 30, color, lineHeight: 1.25 }}>{it.k}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: h > 250 ? 28 : 25, color: T.text, marginTop: 16, lineHeight: 1.4, opacity: 0.55 + o * 0.45 }}>{it.v}</div>
            {it.chip && (
              <div style={{ position: "absolute", right: 24, bottom: 20, fontFamily: MONO, fontWeight: 700, fontSize: 24,
                color: T.bg0, background: color, borderRadius: 999, padding: "8px 20px", opacity: o }}>{it.chip}</div>
            )}
          </div>
        );
      })}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_compare3
const Compare3Scene: React.FC<{
  dur?: number; kicker?: string; title?: string;
  cols?: { name: string; color: string; emoji?: string; hi?: boolean; rows: { k: string; v: string }[] }[];
}> = ({ dur, kicker = "COMPARE", title = "", cols = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} o={p(0, 0.06)} />
      {cols.map((col, i) => {
        const at = 0.08 + i * 0.16;
        const o = p(at, at + 0.1);
        const ghost = p(0.03, 0.07);
        return (
          <div key={i} style={{
            position: "absolute", left: 140 + i * 560, top: 230, width: 520, height: 640,
            borderRadius: 20, boxSizing: "border-box", padding: "28px 30px",
            opacity: Math.max(ghost * 0.22, o), transform: `translateY(${(1 - o) * 24}px)`,
            background: mix(T.panel, col.color, o > 0.5 ? 0.08 : 0.02),
            border: `2.5px solid ${o > 0.5 ? col.color : T.bg2}`,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 54 }}>{col.emoji}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 33, color: col.color, marginTop: 6, lineHeight: 1.25 }}>{col.name}</div>
            </div>
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 17 }}>
              {col.rows.map((r, ri) => (
                <div key={ri} style={{ opacity: p(at + 0.07 + ri * 0.035, at + 0.13 + ri * 0.035) }}>
                  <div style={{ fontFamily: MONO, fontSize: 22, color: T.muted, lineHeight: 1.35 }}>{r.k}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: T.text, marginTop: 3, lineHeight: 1.35 }}>{r.v}</div>
                </div>
              ))}
            </div>
            {col.hi && (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 8, borderRadius: 4, background: col.color, opacity: 0.5 + Math.sin(frame * 0.08) * 0.3 }} />
            )}
          </div>
        );
      })}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_myths
const MythsScene: React.FC<{ dur?: number; kicker?: string; title?: string; pairs?: { m: string; f: string }[]; mythLabel?: string; factLabel?: string }> = ({
  dur, kicker = "MYTH VS FACT", title = "అపోహలు vs నిజాలు", pairs = [], mythLabel = "✗ అపోహ", factLabel = "✓ నిజం",
}) => {
  const p = useP(dur);
  const n = pairs.length;
  const rowH = Math.min(200, Math.floor(640 / n) - 14);
  const y0 = 215 + Math.max(0, (660 - n * (rowH + 16)) / 2);
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={A.down} o={p(0, 0.06)} />
      {pairs.map((pr, i) => {
        const at = 0.08 + (i * 0.62) / n;
        const om = p(at, at + 0.07);
        const of_ = p(at + 0.08, at + 0.15);
        const ghost = p(0.03, 0.07);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 130, top: y0 + i * (rowH + 16), width: 800, height: rowH,
              borderRadius: 16, padding: "18px 26px", boxSizing: "border-box",
              background: mix(T.panel, A.down, om > 0.5 ? 0.08 : 0.02),
              border: `2px solid ${om > 0.5 ? mix(T.bg2, A.down, 0.7) : T.bg2}`,
              opacity: Math.max(ghost * 0.22, om), transform: `translateX(${(1 - om) * -24}px)` }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 21, color: A.down }}>{mythLabel}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, color: T.text, marginTop: 8, lineHeight: 1.35 }}>{pr.m}</div>
            </div>
            <div style={{ position: "absolute", left: 990, top: y0 + i * (rowH + 16), width: 800, height: rowH,
              borderRadius: 16, padding: "18px 26px", boxSizing: "border-box",
              background: mix(T.panel, A.up, of_ > 0.5 ? 0.09 : 0.02),
              border: `2px solid ${of_ > 0.5 ? A.up : T.bg2}`,
              opacity: Math.max(ghost * 0.22, of_), transform: `translateX(${(1 - of_) * 24}px)` }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 21, color: A.up }}>{factLabel}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, color: T.text, marginTop: 8, lineHeight: 1.35 }}>{pr.f}</div>
            </div>
          </React.Fragment>
        );
      })}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_stats
const StatsScene: React.FC<{
  dur?: number; kicker?: string; title?: string; note?: string;
  stats?: { label: string; to: number; prefix?: string; suffix?: string; decimals?: number; color?: string; sub?: string }[];
}> = ({ dur, kicker = "DATA", title = "", note = "", stats = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = stats.length;
  const w = n === 2 ? 810 : n === 3 ? 533 : 390;
  const y0 = note ? 270 : 320;
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={A.money} o={p(0, 0.06)} />
      {stats.map((s, i) => {
        const at = 0.1 + i * (0.5 / n);
        const o = p(at, at + 0.1);
        const ghost = p(0.03, 0.07);
        const c = s.color || A.money;
        return (
          <div key={i} style={{
            position: "absolute", left: 130 + i * (w + 24), top: y0, width: w, height: 360,
            borderRadius: 20, boxSizing: "border-box", padding: "34px 26px", textAlign: "center",
            background: mix(T.panel, c, o > 0.5 ? 0.07 : 0.02), border: `2.5px solid ${o > 0.5 ? mix(T.bg2, c, 0.7) : T.bg2}`,
            opacity: Math.max(ghost * 0.22, o), transform: `translateY(${(1 - o) * 22}px)`,
            boxShadow: o > 0.9 ? `0 0 ${34 + Math.sin(frame * 0.07 + i) * 12}px ${mix(T.bg0, c, 0.22)}` : "none",
          }}>
            <div style={{ fontFamily: SANS, fontSize: 27, color: T.muted, lineHeight: 1.35, minHeight: 76 }}>{s.label}</div>
            <div style={{ marginTop: 18 }}>
              <Counter p={p(at + 0.04, at + 0.22)} to={s.to} prefix={s.prefix || ""} suffix={s.suffix || ""} decimals={s.decimals || 0} color={c} size={n === 2 ? 88 : 68} />
            </div>
            {s.sub && <div style={{ fontFamily: SANS, fontSize: 24, color: T.text, marginTop: 18, lineHeight: 1.4, opacity: p(at + 0.12, at + 0.2) }}>{s.sub}</div>}
          </div>
        );
      })}
      {note && (
        <div style={{ position: "absolute", left: 130, top: 700, width: 1660, textAlign: "center", opacity: p(0.68, 0.8) }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 31, color: T.text, lineHeight: 1.4 }}>{note}</span>
        </div>
      )}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_steps
// Horizontal n-node pipeline with flows; 3–5 nodes. x = 170 + i*340 for 5 (skills/11).
const StepsScene: React.FC<{
  dur?: number; kicker?: string; title?: string; color?: string; note?: string;
  items?: { emoji: string; label: string; sub: string; c?: string }[];
}> = ({ dur, kicker = "FLOW", title = "", color = A.mkt, note = "", items = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = items.length;
  const w = n === 3 ? 420 : n === 4 ? 360 : 290;
  const gapX = n === 3 ? 560 : n === 4 ? 425 : 340;
  const x0 = n === 3 ? 190 : n === 4 ? 165 : 170;
  const y = 400;
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={color} o={p(0, 0.06)} />
      {items.map((it, i) => {
        const c = it.c || color;
        const at = 0.1 + i * (0.55 / n);
        const o = p(at, at + 0.08);
        const ghost = p(0.03, 0.07);
        const x = x0 + i * gapX;
        const active = Math.floor(frame / 24) % n === i && p(0.75, 0.76) > 0.5;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <>
                <Wire x1={x0 + (i - 1) * gapX + w} y1={y + 105} x2={x - 8} y2={y + 105} p={p(at - 0.05, at)} color={c} w={3} />
                <Flow x1={x0 + (i - 1) * gapX + w} y1={y + 105} x2={x - 8} y2={y + 105} color={c} n={4} o={p(at, at + 0.1)} />
              </>
            )}
            <div style={{ position: "absolute", left: x, top: y, width: w, height: 230,
              borderRadius: 18, boxSizing: "border-box", padding: "22px 20px", textAlign: "center",
              background: mix(T.panel, c, o > 0.5 ? (active ? 0.16 : 0.09) : 0.02),
              border: `2.5px solid ${o > 0.5 ? mix(T.bg2, c, active ? 1 : 0.7) : T.bg2}`,
              opacity: Math.max(ghost * 0.22, o), transform: `translateY(${(1 - o) * 20}px) scale(${active ? 1.04 : 1})` }}>
              <div style={{ fontSize: 48 }}>{it.emoji}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 29, color: c, marginTop: 8, lineHeight: 1.25 }}>{it.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 23, color: T.muted, marginTop: 6, lineHeight: 1.35 }}>{it.sub}</div>
            </div>
          </React.Fragment>
        );
      })}
      {note && (
        <div style={{ position: "absolute", left: 150, top: 730, width: 1620, textAlign: "center", opacity: p(0.72, 0.84) }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 31, color: T.text, lineHeight: 1.4 }}>{note}</span>
        </div>
      )}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_whatis
// A company splits into shares; you own a piece. Computed slice geometry.
const WhatIsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const split = p(0.28, 0.5);           // company block → 10 share tiles
  const own = p(0.55, 0.68);            // one tile flies to "you"
  const tiles = 10;
  return (
    <Stage>
      <SMHead kicker="LESSON · BASICS" title="షేర్ అంటే ఏమిటి?" color={A.up} o={p(0, 0.06)} />
      {/* company */}
      <div style={{ position: "absolute", left: 250, top: 300, width: 480, textAlign: "center", opacity: p(0.06, 0.14) }}>
        <div style={{ fontSize: 76 }}>🏢</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: A.mkt, marginTop: 6 }}>ఒక కంపెనీ</div>
        <div style={{ fontFamily: SANS, fontSize: 25, color: T.muted, marginTop: 4 }}>విలువ: ₹100 కోట్లు</div>
      </div>
      {/* share tiles */}
      {Array.from({ length: tiles }).map((_, i) => {
        const r = Math.floor(i / 5), c = i % 5;
        const gx = 900 + c * 130, gy = 330 + r * 130;
        const sx = 430, sy = 380;
        const isYou = i === 9; // last tile: clear flight lane to "you" (QA fix)
        const fx = isYou ? interpolate(own, [0, 1], [gx, 1490]) : gx;
        const fy = isYou ? interpolate(own, [0, 1], [gy, 620]) : gy;
        const x = interpolate(split, [0, 1], [sx, fx]);
        const yy = interpolate(split, [0, 1], [sy, fy]);
        const wob = Math.sin(frame * 0.05 + i) * 3;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: yy + wob, width: 110, height: 110, borderRadius: 16,
            background: mix(T.panel, isYou && own > 0.5 ? A.up : A.mkt, 0.16),
            border: `2.5px solid ${isYou && own > 0.5 ? A.up : mix(T.bg2, A.mkt, 0.8)}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            opacity: p(0.24, 0.34), boxShadow: isYou && own > 0.5 ? `0 0 26px ${mix(T.bg0, A.up, 0.5)}` : "none",
            zIndex: isYou ? 3 : 1,
          }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.text }}>10%</span>
            <span style={{ fontFamily: MONO, fontSize: 19, color: T.muted }}>షేర్</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 900, top: 250, width: 640, fontFamily: MONO, fontSize: 23, color: T.muted, opacity: p(0.3, 0.4) }}>
        కంపెనీ = చిన్న ముక్కలుగా (షేర్లుగా) విభజన
      </div>
      {/* you */}
      <div style={{ position: "absolute", left: 1430, top: 740, width: 240, textAlign: "center", opacity: p(0.5, 0.6) }}>
        <div style={{ fontSize: 64 }}>🧑</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: A.up, marginTop: 4 }}>మీరు</div>
        <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 2 }}>10% యజమాని</div>
      </div>
      <div style={{ position: "absolute", left: 150, top: 790, width: 1100, opacity: p(0.72, 0.84) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: T.text, lineHeight: 1.4 }}>
          షేర్ కొన్నారు = ఆ కంపెనీలో మీరు <span style={{ color: A.up }}>భాగస్వామి</span>. కంపెనీ పెరిగితే మీ షేర్ విలువా పెరుగుతుంది.
        </span>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_exchange
// Buyers/sellers ↔ exchange hub; SEBI umbrella above. Continuous flows.
const ExchangeScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <SMHead kicker="LESSON · STRUCTURE" title="మార్కెట్ ఎలా ఏర్పడింది?" color={A.mkt} o={p(0, 0.06)} />
      {/* SEBI */}
      <div style={{ position: "absolute", left: 760, top: 215, width: 400, textAlign: "center", opacity: p(0.62, 0.72) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: A.money, background: mix(T.panel, A.money, 0.12), border: `2.5px solid ${A.money}`, borderRadius: 14, padding: "12px 0" }}>🛡️ SEBI</div>
        <div style={{ fontFamily: SANS, fontSize: 23, color: T.muted, marginTop: 6 }}>నియంత్రణ సంస్థ — అంపైర్ లాంటిది</div>
      </div>
      <Wire x1={960} y1={330} x2={960} y2={430} p={p(0.66, 0.72)} color={A.money} w={2.5} arrow={false} />
      {/* buyers */}
      <div style={{ position: "absolute", left: 150, top: 430, width: 330, textAlign: "center", opacity: p(0.08, 0.16) }}>
        <div style={{ fontSize: 84, letterSpacing: -18 }}>🧑🧑🧑</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: A.up, marginTop: 6 }}>కొనేవారు</div>
        <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 4 }}>డబ్బుతో సిద్ధం</div>
      </div>
      {/* sellers */}
      <div style={{ position: "absolute", left: 1440, top: 430, width: 330, textAlign: "center", opacity: p(0.14, 0.22) }}>
        <div style={{ fontSize: 84, letterSpacing: -18 }}>🧑🧑🧑</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: A.down, marginTop: 6 }}>అమ్మేవారు</div>
        <div style={{ fontFamily: SANS, fontSize: 24, color: T.muted, marginTop: 4 }}>షేర్లతో సిద్ధం</div>
      </div>
      {/* exchange hub */}
      <div style={{ position: "absolute", left: 700, top: 450, width: 520, height: 260, borderRadius: 24,
        background: mix(T.panel, A.mkt, 0.1), border: `3px solid ${A.mkt}`, textAlign: "center", boxSizing: "border-box", paddingTop: 30,
        opacity: p(0.26, 0.36), boxShadow: `0 0 ${40 + Math.sin(frame * 0.06) * 16}px ${mix(T.bg0, A.mkt, 0.3)}` }}>
        <div style={{ fontSize: 56 }}>🏛️</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: A.mkt, marginTop: 6 }}>స్టాక్ ఎక్స్ఛేంజ్</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: T.text, marginTop: 8 }}>NSE (1992) · BSE (1875)</div>
      </div>
      <Wire x1={480} y1={570} x2={692} y2={570} p={p(0.4, 0.48)} color={A.up} w={4} />
      <Flow x1={480} y1={570} x2={692} y2={570} color={A.up} n={6} o={p(0.44, 0.54)} />
      <Wire x1={1440} y1={570} x2={1228} y2={570} p={p(0.46, 0.54)} color={A.down} w={4} />
      <Flow x1={1440} y1={570} x2={1228} y2={570} color={A.down} n={6} o={p(0.5, 0.6)} />
      <div style={{ position: "absolute", left: 150, top: 790, width: 1620, textAlign: "center", opacity: p(0.76, 0.88) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 31, color: T.text, lineHeight: 1.4 }}>
          ఎక్స్ఛేంజ్ = కొనేవారు, అమ్మేవారు కలిసే <span style={{ color: A.mkt }}>డిజిటల్ మార్కెట్ యార్డ్</span>. SEBI అందరిపై నిఘా.
        </span>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_pricemove
// Demand/supply pressure bars + live price line. Deterministic walk.
const PRICE_WALK = (() => {
  const pts: number[] = [];
  let v = 500;
  for (let i = 0; i < 240; i++) {
    v += (rnd(i, 21, 4) - 0.48) * 9;
    pts.push(v);
  }
  return pts;
})();
const PriceMoveScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const buyPress = 0.5 + Math.sin(frame * 0.035) * 0.34;
  const idx = Math.floor((frame * 0.9) % (PRICE_WALK.length - 80));
  const seg = PRICE_WALK.slice(idx, idx + 80);
  const mn = Math.min(...seg), mxv = Math.max(...seg);
  const X0 = 700, Y0 = 300, W = 1050, H = 420;
  const pts = seg.map((v, i) => `${X0 + (i / 79) * W},${Y0 + H - ((v - mn) / (mxv - mn || 1)) * H}`);
  const lastY = Y0 + H - ((seg[seg.length - 1] - mn) / (mxv - mn || 1)) * H;
  const drawP = p(0.3, 0.5);
  return (
    <Stage>
      <SMHead kicker="LESSON · PRICE" title="ధర ఎందుకు పెరుగుతుంది, తగ్గుతుంది?" color={A.up} o={p(0, 0.06)} />
      {/* demand vs supply bars */}
      <div style={{ position: "absolute", left: 140, top: 300, width: 440, opacity: p(0.08, 0.18) }}>
        {[{ k: "కొనాలనుకునేవారు", c: A.up, v: buyPress }, { k: "అమ్మాలనుకునేవారు", c: A.down, v: 1 - buyPress }].map((b, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: b.c, marginBottom: 10 }}>{b.k}</div>
            <div style={{ width: 440, height: 46, borderRadius: 10, background: mix(T.panel, b.c, 0.06), border: `2px solid ${mix(T.bg2, b.c, 0.5)}`, overflow: "hidden" }}>
              <div style={{ width: `${Math.round(b.v * 100)}%`, height: "100%", background: `linear-gradient(90deg, ${mix(b.c, T.bg1, 0.35)}, ${b.c})` }} />
            </div>
          </div>
        ))}
        <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, lineHeight: 1.45, marginTop: 8, opacity: p(0.5, 0.62) }}>
          కొనేవారు ఎక్కువ → ధర <span style={{ color: A.up, fontWeight: 800 }}>పైకి</span><br />
          అమ్మేవారు ఎక్కువ → ధర <span style={{ color: A.down, fontWeight: 800 }}>కిందికి</span>
        </div>
      </div>
      {/* live price line */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={X0} y1={Y0 + H} x2={X0 + W} y2={Y0 + H} stroke={T.bg2} strokeWidth={2} />
        <polyline points={pts.slice(0, Math.max(2, Math.round(pts.length * drawP))).join(" ")} fill="none"
          stroke={A.mkt} strokeWidth={4} opacity={p(0.24, 0.34)} />
      </svg>
      {drawP >= 1 - 1e-6 && (
        <div style={{ position: "absolute", left: X0 + W - 10, top: lastY - 10, width: 20, height: 20, borderRadius: 10, background: A.mkt, boxShadow: `0 0 18px ${A.mkt}` }} />
      )}
      <div style={{ position: "absolute", left: X0, top: 250, fontFamily: MONO, fontSize: 23, color: T.muted, opacity: p(0.24, 0.34) }}>
        ధర — ప్రతి సెకనూ మారుతూనే ఉంటుంది (డిమాండ్ & సప్లై)
      </div>
      <div style={{ position: "absolute", left: 700, top: 790, width: 1080, opacity: p(0.72, 0.84) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: T.text, lineHeight: 1.4 }}>
          మంచి వార్త → కొనుగోళ్లు పెరుగుతాయి. చెడు వార్త → అమ్మకాలు పెరుగుతాయి. <span style={{ color: A.mkt }}>ధర = ఆ క్షణపు ఒప్పందం.</span>
        </span>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_index
// Many company dots → weighted average → one line (Sensex/Nifty).
const IndexScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const dots = 30;
  const X0 = 1000, Y0 = 320, W = 760, H = 380;
  const series = Array.from({ length: 70 }).map((_, i) => {
    let s = 0;
    for (let d = 0; d < dots; d++)
      s += Math.sin(i * 0.22 + d * 1.7) * 16 * (0.4 + rnd(d, 5, 2)) + (rnd(i, d, 11) - 0.5) * 14 + i * (0.9 + rnd(d, 9, 6) * 0.5);
    return s / dots;
  });
  const mn = Math.min(...series), mxv = Math.max(...series);
  const pts = series.map((v, i) => `${X0 + (i / 69) * W},${Y0 + H - ((v - mn) / (mxv - mn)) * H}`);
  const drawP = p(0.42, 0.72);
  return (
    <Stage>
      <SMHead kicker="LESSON · INDEX" title="Sensex, Nifty అంటే ఏమిటి?" color={A.mkt} o={p(0, 0.06)} />
      {/* company dots grid */}
      {Array.from({ length: dots }).map((_, i) => {
        const r = Math.floor(i / 6), c = i % 6;
        const wob = Math.sin(frame * 0.06 + i * 1.3) * 4;
        const at = 0.06 + (i / dots) * 0.2;
        return (
          <div key={i} style={{
            position: "absolute", left: 160 + c * 115, top: 330 + r * 100 + wob, width: 86, height: 74,
            borderRadius: 12, background: mix(T.panel, A.mkt, 0.1), border: `1.5px solid ${mix(T.bg2, A.mkt, 0.5)}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, opacity: p(at, at + 0.06),
          }}>🏢</div>
        );
      })}
      <div style={{ position: "absolute", left: 160, top: 250, fontFamily: MONO, fontSize: 23, color: T.muted, opacity: p(0.08, 0.16) }}>
        టాప్ కంపెనీలు — Sensex 30 · Nifty 50
      </div>
      <Wire x1={860} y1={560} x2={990} y2={520} p={p(0.36, 0.44)} color={A.mkt} w={3.5} />
      <Flow x1={860} y1={560} x2={990} y2={520} color={A.mkt} n={5} o={p(0.4, 0.5)} />
      {/* index line */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={X0} y1={Y0 + H} x2={X0 + W} y2={Y0 + H} stroke={T.bg2} strokeWidth={2} />
        <polyline points={pts.slice(0, Math.max(2, Math.round(pts.length * drawP))).join(" ")} fill="none"
          stroke={A.up} strokeWidth={5} opacity={p(0.4, 0.48)} />
      </svg>
      <div style={{ position: "absolute", left: X0, top: 250, fontFamily: MONO, fontSize: 23, color: T.muted, opacity: p(0.4, 0.5) }}>
        అన్నిటి సగటు కదలిక = ఇండెక్స్
      </div>
      <div style={{ position: "absolute", left: 150, top: 800, width: 1620, textAlign: "center", opacity: p(0.76, 0.88) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 31, color: T.text, lineHeight: 1.4 }}>
          "మార్కెట్ పెరిగింది" అంటే — <span style={{ color: A.up }}>ఇండెక్స్</span> పెరిగింది. అది మార్కెట్ మొత్తానికీ <span style={{ color: A.mkt }}>థర్మామీటర్</span>.
        </span>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_growthline
// Parameterized compound-growth race: series of {label, ratePct, color}.
const GrowthLineScene: React.FC<{
  dur?: number; kicker?: string; title?: string; years?: number; monthly?: number;
  series?: { label: string; rate: number; color: string }[]; note?: string; plain?: boolean;
}> = ({ dur, kicker = "LONG TERM", title = "", years = 25, monthly = 5000,
  series = [{ label: "FD ~7%", rate: 7, color: A.money }, { label: "ఈక్విటీ ~12%", rate: 12, color: A.up }], note = "", plain }) => {
  const p = useP(dur);
  const X0 = 220, Y0 = 270, W = 1280, H = 470;
  const N = years * 12;
  const fv = (rate: number, months: number) => {
    const r = rate / 100 / 12;
    return monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  };
  const maxV = Math.max(...series.map((s) => fv(s.rate, N)));
  const drawP = p(0.22, 0.72);
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={A.up} o={p(0, 0.06)} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={X0} y1={Y0 + H} x2={X0 + W} y2={Y0 + H} stroke={T.bg2} strokeWidth={2} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y0 + H} stroke={T.bg2} strokeWidth={2} />
        {series.map((s, si) => {
          const pts = Array.from({ length: 80 }).map((_, i) => {
            const m = (i / 79) * N;
            const v = fv(s.rate, Math.max(1, m));
            return `${X0 + (i / 79) * W},${Y0 + H - (v / maxV) * (H - 30)}`;
          });
          const k = Math.max(2, Math.round(80 * p(0.22 + si * 0.06, 0.68 + si * 0.06)));
          return <polyline key={si} points={pts.slice(0, k).join(" ")} fill="none" stroke={s.color} strokeWidth={5} opacity={p(0.18 + si * 0.06, 0.26 + si * 0.06)} />;
        })}
      </svg>
      {/* end labels */}
      {series.map((s, si) => {
        const v = fv(s.rate, N);
        const yEnd = Y0 + H - (v / maxV) * (H - 30);
        const lakh = v / 100000;
        return (
          <div key={si} style={{ position: "absolute", left: X0 + W + 16, top: yEnd - 34, width: 360, opacity: p(0.68 + si * 0.05, 0.78 + si * 0.05) }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: s.color, lineHeight: 1.3 }}>{s.label}</div>
            {!plain && (
              <Counter p={p(0.7 + si * 0.05, 0.85 + si * 0.05)} to={lakh >= 100 ? lakh / 100 : lakh} decimals={1}
                prefix="₹" suffix={lakh >= 100 ? " కోట్లు" : " లక్షలు"} color={s.color} size={38} />
            )}
          </div>
        );
      })}
      {!plain && (
        <div style={{ position: "absolute", left: X0, top: 220, fontFamily: MONO, fontSize: 23, color: T.muted, opacity: p(0.1, 0.18) }}>
          నెలకు ₹{monthly.toLocaleString("en-IN")} × {years} సంవత్సరాలు
        </div>
      )}
      {note && (
        <div style={{ position: "absolute", left: 150, top: 800, width: 1620, textAlign: "center", opacity: p(0.82, 0.92) }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: T.text, lineHeight: 1.4 }}>{note}</span>
        </div>
      )}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_accounts
const AccountsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const nodes = [
    { at: 0.08, emoji: "🏦", label: "బ్యాంక్ ఖాతా", sub: "డబ్బు ఇక్కడ", c: A.money, x: 190 },
    { at: 0.3, emoji: "📲", label: "ట్రేడింగ్ ఖాతా", sub: "ఆర్డర్లు ఇక్కడ", c: A.mkt, x: 750 },
    { at: 0.52, emoji: "🗄️", label: "డీమ్యాట్ ఖాతా", sub: "షేర్లు ఇక్కడ", c: A.up, x: 1310 },
  ];
  const y = 400;
  return (
    <Stage>
      <SMHead kicker="LESSON · ACCOUNTS" title="పెట్టుబడికి కావాల్సిన 3 ఖాతాలు" color={A.mkt} o={p(0, 0.06)} />
      {nodes.map((n2, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <>
              <Wire x1={nodes[i - 1].x + 420} y1={y + 115} x2={n2.x - 8} y2={y + 115} p={p(n2.at - 0.06, n2.at)} color={n2.c} w={4} />
              <Flow x1={nodes[i - 1].x + 420} y1={y + 115} x2={n2.x - 8} y2={y + 115} color={n2.c} n={5} o={p(n2.at, n2.at + 0.1)} />
            </>
          )}
          <Card theme={T} x={n2.x} y={y} w={420} h={250} color={n2.c} o={p(n2.at, n2.at + 0.1)} glow={i === 2}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 54 }}>{n2.emoji}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 33, color: n2.c, marginTop: 8 }}>{n2.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 25, color: T.muted, marginTop: 6 }}>{n2.sub}</div>
            </div>
          </Card>
        </React.Fragment>
      ))}
      <div style={{ position: "absolute", left: 150, top: 740, width: 1620, textAlign: "center", opacity: p(0.68, 0.8) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 31, color: T.text, lineHeight: 1.45 }}>
          ఈ రోజుల్లో బ్రోకర్ యాప్ ఒక్కటే — <span style={{ color: A.mkt }}>ట్రేడింగ్ + డీమ్యాట్</span> రెండూ కలిపి తెరిచేస్తుంది.<br />
          <span style={{ fontSize: 27, color: T.muted }}>డిపాజిటరీలు: NSDL & CDSL — మీ షేర్లను భద్రంగా ఉంచే సంస్థలు</span>
        </span>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_order
// Order ticket → exchange match → T+1 demat. Market vs limit toggle.
const OrderScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const isLimit = p(0.42, 0.43) > 0.5;
  return (
    <Stage>
      <SMHead kicker="LESSON · FIRST ORDER" title="మొదటి ఆర్డర్ ఎలా పెట్టాలి?" color={A.up} o={p(0, 0.06)} />
      {/* order ticket */}
      <div style={{ position: "absolute", left: 160, top: 260, width: 500, borderRadius: 20, background: mix(T.panel, A.mkt, 0.07),
        border: `2.5px solid ${p(0.06, 0.1) > 0.5 ? A.mkt : T.bg2}`, padding: "26px 30px", boxSizing: "border-box", opacity: p(0.06, 0.14) }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: A.mkt, letterSpacing: 4 }}>BUY ORDER</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { k: "స్టాక్", v: "ABC కంపెనీ", at: 0.1 },
            { k: "పరిమాణం (Qty)", v: "10 షేర్లు", at: 0.16 },
            { k: "ఆర్డర్ రకం", v: isLimit ? "లిమిట్ ఆర్డర్" : "మార్కెట్ ఆర్డర్", at: 0.22 },
            { k: "ధర", v: isLimit ? "₹495 కే కొను" : "ఇప్పుడున్న ధరకే", at: 0.28 },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: p(r.at, r.at + 0.06),
              background: mix(T.panel, A.mkt, 0.05), borderRadius: 10, padding: "12px 18px" }}>
              <span style={{ fontFamily: MONO, fontSize: 22, color: T.muted }}>{r.k}</span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 25, color: T.text }}>{r.v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, textAlign: "center", background: A.up, borderRadius: 12, padding: "12px 0",
          fontFamily: SANS, fontWeight: 800, fontSize: 27, color: T.bg0, opacity: p(0.32, 0.4),
          boxShadow: `0 0 ${20 + Math.sin(frame * 0.09) * 10}px ${mix(T.bg0, A.up, 0.45)}` }}>BUY ✓</div>
      </div>
      {/* market vs limit explainer */}
      <div style={{ position: "absolute", left: 720, top: 260, width: 480 }}>
        {[
          { k: "మార్కెట్ ఆర్డర్", v: "వెంటనే, ఇప్పుడున్న ధరకు కొంటుంది", c: A.up, at: 0.44 },
          { k: "లిమిట్ ఆర్డర్", v: "మీరు చెప్పిన ధరకు వచ్చినప్పుడే కొంటుంది", c: A.mkt, at: 0.52 },
        ].map((r, i) => (
          <div key={i} style={{ marginBottom: 20, opacity: p(r.at, r.at + 0.08), background: mix(T.panel, r.c, 0.08),
            borderLeft: `5px solid ${r.c}`, borderRadius: 12, padding: "18px 24px" }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 29, color: r.c }}>{r.k}</div>
            <div style={{ fontFamily: SANS, fontSize: 25, color: T.text, marginTop: 6, lineHeight: 1.4 }}>{r.v}</div>
          </div>
        ))}
        <div style={{ opacity: p(0.6, 0.68), background: mix(T.panel, A.money, 0.08), borderLeft: `5px solid ${A.money}`, borderRadius: 12, padding: "18px 24px" }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 29, color: A.money }}>స్టాప్-లాస్</div>
          <div style={{ fontFamily: SANS, fontSize: 25, color: T.text, marginTop: 6, lineHeight: 1.4 }}>నష్టం ఒక హద్దు దాటితే ఆటోమేటిక్‌గా అమ్మేస్తుంది</div>
        </div>
      </div>
      {/* T+1 timeline */}
      <div style={{ position: "absolute", left: 1260, top: 260, width: 500, borderRadius: 20, background: mix(T.panel, A.up, 0.05),
        border: `2.5px solid ${p(0.68, 0.72) > 0.5 ? A.up : T.bg2}`, padding: "26px 30px", boxSizing: "border-box", opacity: Math.max(p(0.03, 0.07) * 0.22, p(0.66, 0.74)) }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: A.up, letterSpacing: 4 }}>SETTLEMENT · T+1</div>
        {[
          { d: "ఈ రోజు (T)", v: "ఆర్డర్ మ్యాచ్ → ట్రేడ్ పూర్తి", at: 0.7 },
          { d: "రేపు (T+1)", v: "షేర్లు మీ డీమ్యాట్‌లోకి", at: 0.78 },
        ].map((r, i) => (
          <div key={i} style={{ marginTop: 18, opacity: p(r.at, r.at + 0.07) }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: A.up }}>{r.d}</div>
            <div style={{ fontFamily: SANS, fontSize: 25, color: T.text, marginTop: 4, lineHeight: 1.4 }}>{r.v}</div>
          </div>
        ))}
        <div style={{ marginTop: 20, fontFamily: SANS, fontSize: 23, color: T.muted, lineHeight: 1.4, opacity: p(0.84, 0.9) }}>
          మార్కెట్ వేళలు: ఉదయం 9:15 — మధ్యాహ్నం 3:30 (సోమ–శుక్ర)
        </div>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_candles
// Candlestick anatomy (left) + live chart (right).
const CandlesScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const cx = 330, cy = 300;
  return (
    <Stage>
      <SMHead kicker="LESSON · CHARTS" title="క్యాండిల్ చార్ట్ చదవడం" color={A.up} o={p(0, 0.06)} />
      {/* anatomy: one big green candle */}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={cx} y1={cy + interpolate(p(0.1, 0.2), [0, 1], [200, 0])} x2={cx} y2={cy + 440} stroke={A.up} strokeWidth={5} opacity={p(0.1, 0.18)} />
        <rect x={cx - 55} y={cy + 90} width={110} height={260} rx={10} fill={mix(A.up, T.bg1, 0.25)} stroke={A.up} strokeWidth={3.5} opacity={p(0.16, 0.26)} />
      </svg>
      {[
        { at: 0.24, label: "High — గరిష్ఠ ధర", y: cy - 10 },
        { at: 0.34, label: "Close — ముగింపు (పైన = పెరిగింది)", y: cy + 80 },
        { at: 0.44, label: "Open — ప్రారంభ ధర", y: cy + 330 },
        { at: 0.54, label: "Low — కనిష్ఠ ధర", y: cy + 425 },
      ].map((r, i) => (
        <React.Fragment key={i}>
          <Wire x1={cx + 60} y1={r.y + 14} x2={cx + 170} y2={r.y + 14} p={p(r.at, r.at + 0.05)} color={A.mkt} w={2.5} arrow={false} />
          <div style={{ position: "absolute", left: cx + 185, top: r.y - 6, opacity: p(r.at + 0.03, r.at + 0.09) }}>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, color: T.text, background: mix(T.panel, A.mkt, 0.1),
              border: `2px solid ${mix(T.bg2, A.mkt, 0.6)}`, borderRadius: 10, padding: "8px 18px" }}>{r.label}</span>
          </div>
        </React.Fragment>
      ))}
      {/* green vs red mini */}
      <div style={{ position: "absolute", left: 200, top: 790, display: "flex", gap: 40, opacity: p(0.6, 0.7) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: A.up }}>🟩 ఆకుపచ్చ = పెరిగిన రోజు</span>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: A.down }}>🟥 ఎరుపు = తగ్గిన రోజు</span>
      </div>
      {/* live chart */}
      <div style={{ position: "absolute", left: 1000, top: 250, fontFamily: MONO, fontSize: 23, color: T.muted, opacity: p(0.52, 0.6) }}>
        ఒక్కో క్యాండిల్ = ఒక రోజు (లేదా ఒక నిమిషం) కథ
      </div>
      <Brackets x={990} y={290} w={800} h={430} color={A.up} o={p(0.5, 0.58)} />
      <CandleMotif x={1010} y={310} w={760} h={390} o={p(0.52, 0.62)} k={30} />
      <ScanBeam theme={T} x={1000} y={300} w={780} h={410} color={A.up} o={p(0.56, 0.66)} speed={0.8} />
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_daytrade
// Intraday: one day's price walk 9:15→3:30 with buy/sell markers.
const DAY_WALK = (() => {
  const pts: number[] = [];
  let v = 300;
  for (let i = 0; i < 120; i++) {
    v += (rnd(i, 31, 8) - 0.46) * 4 + Math.sin(i * 0.1) * 1.4;
    pts.push(v);
  }
  return pts;
})();
const DayTradeScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const X0 = 220, Y0 = 300, W = 1480, H = 400;
  const mn = Math.min(...DAY_WALK), mxv = Math.max(...DAY_WALK);
  const pts = DAY_WALK.map((v, i) => `${X0 + (i / 119) * W},${Y0 + H - ((v - mn) / (mxv - mn)) * H}`);
  const drawP = p(0.12, 0.5);
  const buyI = 22, sellI = 86;
  const pxy = (i: number) => ({ x: X0 + (i / 119) * W, y: Y0 + H - ((DAY_WALK[i] - mn) / (mxv - mn)) * H });
  const b = pxy(buyI), s = pxy(sellI);
  return (
    <Stage>
      <SMHead kicker="LESSON · INTRADAY" title="ఇంట్రాడే ట్రేడింగ్ అంటే?" color={A.deriv} o={p(0, 0.06)} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={X0} y1={Y0 + H} x2={X0 + W} y2={Y0 + H} stroke={T.bg2} strokeWidth={2} />
        <polyline points={pts.slice(0, Math.max(2, Math.round(pts.length * drawP))).join(" ")} fill="none" stroke={A.mkt} strokeWidth={4} opacity={p(0.1, 0.18)} />
      </svg>
      {/* time labels */}
      {[{ t: "9:15 AM", x: X0 }, { t: "12:00", x: X0 + W * 0.45 }, { t: "3:30 PM", x: X0 + W - 60 }].map((r, i) => (
        <div key={i} style={{ position: "absolute", left: r.x, top: Y0 + H + 16, fontFamily: MONO, fontSize: 23, color: T.muted, opacity: p(0.08, 0.16) }}>{r.t}</div>
      ))}
      {/* buy marker */}
      <div style={{ position: "absolute", left: b.x - 16, top: b.y + 20, opacity: p(0.32, 0.4) }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: A.up, boxShadow: `0 0 18px ${A.up}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>▲</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, color: A.up, marginTop: 8, width: 240 }}>ఉదయం కొన్నారు ₹302</div>
      </div>
      {/* sell marker */}
      <div style={{ position: "absolute", left: s.x - 16, top: s.y - 110, opacity: p(0.52, 0.6) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, color: A.down, marginBottom: 8, width: 260 }}>మధ్యాహ్నం అమ్మారు ₹308</div>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: A.down, boxShadow: `0 0 18px ${A.down}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>▼</div>
      </div>
      {/* square-off warning */}
      <div style={{ position: "absolute", left: X0 + W - 420, top: Y0 - 60, width: 420, opacity: p(0.62, 0.72) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 25, color: A.money, background: mix(T.panel, A.money, 0.12),
          border: `2px solid ${A.money}`, borderRadius: 12, padding: "10px 18px",
          boxShadow: `0 0 ${16 + Math.sin(frame * 0.1) * 8}px ${mix(T.bg0, A.money, 0.3)}` }}>3:20 లోపు తప్పనిసరి క్లోజ్!</span>
      </div>
      <div style={{ position: "absolute", left: 150, top: 800, width: 1620, textAlign: "center", opacity: p(0.74, 0.86) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 31, color: T.text, lineHeight: 1.4 }}>
          అదే రోజు కొని, అదే రోజు అమ్మడం = <span style={{ color: A.deriv }}>ఇంట్రాడే</span>. రాత్రికి ఏమీ మిగలదు — లాభమో నష్టమో మాత్రమే.
        </span>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_lossgrid
// SEBI loss studies: 10x10 people grid → lossPct turn red. Params for reuse.
const LossGridScene: React.FC<{
  dur?: number; kicker?: string; title?: string; lossPct?: number; mainLabel?: string;
  statLabel?: string; statTo?: number; statPrefix?: string; statSuffix?: string; statDecimals?: number;
  source?: string; sourcePrefix?: string; note?: string;
}> = ({ dur, kicker = "SEBI STUDY", title = "", lossPct = 91, mainLabel = "నష్టపోయిన వారు", statLabel = "", statTo = 0,
  statPrefix = "", statSuffix = "", statDecimals = 0, source = "SEBI అధ్యయనం", sourcePrefix = "మూలం: ", note = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const fill = p(0.16, 0.55);
  const redN = Math.round(100 * (lossPct / 100) * fill);
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={A.down} o={p(0, 0.06)} />
      {/* 10x10 grid */}
      <div style={{ position: "absolute", left: 170, top: 250, display: "grid", gridTemplateColumns: "repeat(10, 56px)", gap: 8, opacity: p(0.06, 0.14) }}>
        {Array.from({ length: 100 }).map((_, i) => {
          const red = i < redN;
          const wob = Math.sin(frame * 0.07 + i * 0.7) * 0.06;
          return (
            <div key={i} style={{ width: 56, height: 56, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, background: mix(T.panel, red ? A.down : A.up, red ? 0.26 : 0.1),
              border: `1.5px solid ${red ? A.down : mix(T.bg2, A.up, 0.5)}`,
              transform: `scale(${1 + (red ? wob : 0)})` }}>
              {red ? "😞" : "🙂"}
            </div>
          );
        })}
      </div>
      {/* stats */}
      <div style={{ position: "absolute", left: 940, top: 280, width: 800 }}>
        <div style={{ opacity: p(0.2, 0.3) }}>
          <div style={{ fontFamily: SANS, fontSize: 29, color: T.muted, lineHeight: 1.4 }}>{mainLabel}</div>
          <Counter p={p(0.2, 0.55)} to={lossPct} suffix="%" color={A.down} size={130} />
        </div>
        {statLabel && (
          <div style={{ marginTop: 34, opacity: p(0.55, 0.65) }}>
            <div style={{ fontFamily: SANS, fontSize: 29, color: T.muted, lineHeight: 1.4 }}>{statLabel}</div>
            <Counter p={p(0.58, 0.78)} to={statTo} prefix={statPrefix} suffix={statSuffix} decimals={statDecimals} color={A.money} size={72} />
          </div>
        )}
        <div style={{ marginTop: 30, fontFamily: MONO, fontSize: 23, color: T.muted, opacity: p(0.66, 0.74) }}>{sourcePrefix}{source}</div>
      </div>
      {note && (
        <div style={{ position: "absolute", left: 150, top: 850, width: 1620, textAlign: "center", opacity: p(0.78, 0.9) }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 31, color: A.down, lineHeight: 1.4 }}>{note}</span>
        </div>
      )}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_leverage
// Margin/leverage cuts both ways: ₹1L margin controls ₹10L; ±5% → ±₹50k.
const LeverageScene: React.FC<{
  dur?: number; kicker?: string; title?: string; margin?: number; exposure?: number; movePct?: number;
}> = ({ dur, kicker = "LEVERAGE", title = "లివరేజ్ — రెండు వైపులా కత్తి", margin = 100000, exposure = 1000000, movePct = 5 }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const lev = exposure / margin;
  const pl = exposure * (movePct / 100);
  const plPctOnMargin = (pl / margin) * 100;
  const fmt = (v: number) => (v >= 100000 ? `₹${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1)} లక్ష${v >= 200000 ? "లు" : ""}` : `₹${Math.round(v / 1000)}వేలు`);
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={A.deriv} o={p(0, 0.06)} />
      {/* margin vs exposure bars */}
      <div style={{ position: "absolute", left: 170, top: 270, width: 640 }}>
        <div style={{ opacity: p(0.08, 0.16) }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, color: A.money, marginBottom: 8 }}>మీ మార్జిన్ (పెట్టేది): {fmt(margin)}</div>
          <div style={{ width: 640 * (margin / exposure) + 60, height: 52, borderRadius: 10, background: `linear-gradient(90deg, ${mix(A.money, T.bg1, 0.3)}, ${A.money})` }} />
        </div>
        <div style={{ marginTop: 36, opacity: p(0.2, 0.3) }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, color: A.deriv, marginBottom: 8 }}>కంట్రోల్ చేసే పొజిషన్: {fmt(exposure)}</div>
          <div style={{ width: 640 * p(0.22, 0.36), height: 52, borderRadius: 10, background: `linear-gradient(90deg, ${mix(A.deriv, T.bg1, 0.3)}, ${A.deriv})`,
            boxShadow: `0 0 ${18 + Math.sin(frame * 0.08) * 8}px ${mix(T.bg0, A.deriv, 0.35)}` }} />
        </div>
        <div style={{ marginTop: 30, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: A.deriv, opacity: p(0.34, 0.42) }}>= {lev.toFixed(0)}x లివరేజ్</div>
      </div>
      {/* two outcomes */}
      {[
        { at: 0.48, x: 940, c: A.up, dir: "▲", t: `మార్కెట్ +${movePct}% పెరిగితే`, v: `+${fmt(pl)}`, s: `మీ మార్జిన్‌పై +${plPctOnMargin.toFixed(0)}%` },
        { at: 0.62, x: 940, y2: 590, c: A.down, dir: "▼", t: `మార్కెట్ −${movePct}% తగ్గితే`, v: `−${fmt(pl)}`, s: `మీ మార్జిన్‌లో సగం ఆవిరి!` },
      ].map((r, i) => (
        <div key={i} style={{ position: "absolute", left: r.x, top: i === 0 ? 280 : 590, width: 810, height: 280,
          borderRadius: 20, boxSizing: "border-box", padding: "26px 34px",
          background: mix(T.panel, r.c, p(r.at, r.at + 0.08) > 0.5 ? 0.1 : 0.02),
          border: `2.5px solid ${p(r.at, r.at + 0.08) > 0.5 ? r.c : T.bg2}`,
          opacity: Math.max(p(0.04, 0.08) * 0.22, p(r.at, r.at + 0.08)),
          boxShadow: i === 1 && p(r.at + 0.08, r.at + 0.1) > 0.5 ? `0 0 ${30 + Math.sin(frame * 0.1) * 14}px ${mix(T.bg0, A.down, 0.35)}` : "none" }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: r.c }}>{r.dir} {r.t}</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color: r.c, marginTop: 14 }}>{r.v}</div>
          <div style={{ fontFamily: SANS, fontSize: 26, color: T.text, marginTop: 10, lineHeight: 1.35 }}>{r.s}</div>
        </div>
      ))}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_payoff
// Option payoff diagram. props: kind: "call"|"put", side: "buy"|"sell".
const PayoffScene: React.FC<{
  dur?: number; kind?: "call" | "put"; side?: "buy" | "sell"; strike?: number; premium?: number;
  kicker?: string; title?: string; note?: string;
}> = ({ dur, kind = "call", side = "buy", strike = 100, premium = 5, kicker = "OPTIONS", title = "", note = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const X0 = 360, Y0 = 280, W = 1200, H = 480;
  const yMid = Y0 + H / 2;
  const sMin = strike - 30, sMax = strike + 30;
  const payoff = (s: number) => {
    const intrinsic = kind === "call" ? Math.max(0, s - strike) : Math.max(0, strike - s);
    const buyPL = intrinsic - premium;
    return side === "buy" ? buyPL : -buyPL;
  };
  const maxAbs = 26;
  const pts = Array.from({ length: 100 }).map((_, i) => {
    const s = sMin + (i / 99) * (sMax - sMin);
    const v = Math.max(-maxAbs, Math.min(maxAbs, payoff(s)));
    return { x: X0 + (i / 99) * W, y: yMid - (v / maxAbs) * (H / 2 - 20), v };
  });
  const drawN = Math.max(2, Math.round(100 * p(0.3, 0.62)));
  const be = kind === "call" ? strike + premium : strike - premium;
  const beX = X0 + ((be - sMin) / (sMax - sMin)) * W;
  const strikeX = X0 + ((strike - sMin) / (sMax - sMin)) * W;
  const roleTe = `${kind === "call" ? "కాల్" : "పుట్"} ${side === "buy" ? "కొన్నవారు" : "అమ్మినవారు"}`;
  return (
    <Stage>
      <SMHead kicker={kicker} title={title || `${roleTe} — లాభనష్టాల చిత్రం`} color={A.deriv} o={p(0, 0.06)} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {/* profit / loss zones */}
        <rect x={X0} y={Y0} width={W} height={H / 2} fill={mix(T.bg1, A.up, 0.05)} opacity={p(0.06, 0.12)} />
        <rect x={X0} y={yMid} width={W} height={H / 2} fill={mix(T.bg1, A.down, 0.05)} opacity={p(0.06, 0.12)} />
        <line x1={X0} y1={yMid} x2={X0 + W} y2={yMid} stroke={T.muted} strokeWidth={2} opacity={p(0.08, 0.14)} />
        <line x1={strikeX} y1={Y0} x2={strikeX} y2={Y0 + H} stroke={A.money} strokeWidth={2} strokeDasharray="8 8" opacity={p(0.2, 0.28)} />
        {/* payoff line: loss part rose, profit part green */}
        {pts.slice(0, drawN - 1).map((pt, i) => {
          const nx = pts[i + 1];
          return <line key={i} x1={pt.x} y1={pt.y} x2={nx.x} y2={nx.y}
            stroke={pt.v >= 0 ? A.up : A.down} strokeWidth={6} strokeLinecap="round" />;
        })}
        {/* breakeven marker */}
        {p(0.64, 0.66) > 0.5 && (
          <circle cx={beX} cy={yMid} r={10 + Math.sin(frame * 0.12) * 3} fill={A.mkt} opacity={0.9} />
        )}
      </svg>
      <div style={{ position: "absolute", left: X0 - 230, top: Y0 + 30, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: A.up, opacity: p(0.08, 0.16) }}>లాభం ↑</div>
      <div style={{ position: "absolute", left: X0 - 230, top: Y0 + H - 70, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: A.down, opacity: p(0.08, 0.16) }}>నష్టం ↓</div>
      <div style={{ position: "absolute", left: strikeX - 120, top: Y0 + H + 14, width: 240, textAlign: "center", fontFamily: MONO, fontSize: 23, color: A.money, opacity: p(0.22, 0.3) }}>స్ట్రైక్ ₹{strike}</div>
      <div style={{ position: "absolute", left: beX - 150, top: yMid - 56, width: 300, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 24, color: A.mkt, opacity: p(0.66, 0.74) }}>బ్రేక్-ఈవెన్ ₹{be}</div>
      <div style={{ position: "absolute", left: X0 + W - 260, top: Y0 + H + 14, fontFamily: MONO, fontSize: 23, color: T.muted, opacity: p(0.1, 0.18) }}>ఎక్స్పైరీకి షేర్ ధర →</div>
      {note && (
        <div style={{ position: "absolute", left: 150, top: 850, width: 1620, textAlign: "center", opacity: p(0.76, 0.88) }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: T.text, lineHeight: 1.4 }}>{note}</span>
        </div>
      )}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_theta
// Option time decay: premium melts as expiry nears.
const ThetaScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const X0 = 260, Y0 = 280, W = 1300, H = 440;
  const pts = Array.from({ length: 90 }).map((_, i) => {
    const t = i / 89;                       // 0 → expiry
    const v = Math.sqrt(Math.max(0.0001, 1 - t)); // sqrt-time decay shape
    return `${X0 + t * W},${Y0 + H - v * (H - 30)}`;
  });
  const drawP = p(0.18, 0.55);
  const melt = 1 - p(0.6, 0.85) * 0.75;
  return (
    <Stage>
      <SMHead kicker="OPTIONS · TIME DECAY" title="టైమ్ డికే — కరిగే ఐస్ ముక్క" color={A.down} o={p(0, 0.06)} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={X0} y1={Y0 + H} x2={X0 + W} y2={Y0 + H} stroke={T.bg2} strokeWidth={2} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y0 + H} stroke={T.bg2} strokeWidth={2} />
        <polyline points={pts.slice(0, Math.max(2, Math.round(90 * drawP))).join(" ")} fill="none" stroke={A.deriv} strokeWidth={5} opacity={p(0.14, 0.22)} />
      </svg>
      <div style={{ position: "absolute", left: X0, top: 230, fontFamily: MONO, fontSize: 23, color: T.muted, opacity: p(0.08, 0.16) }}>ఆప్షన్ ప్రీమియంలోని టైమ్ విలువ</div>
      <div style={{ position: "absolute", left: X0 + W - 200, top: Y0 + H + 16, fontFamily: MONO, fontSize: 23, color: A.down, opacity: p(0.2, 0.28) }}>ఎక్స్పైరీ రోజు</div>
      {/* melting ice cube */}
      <div style={{ position: "absolute", left: 1600, top: 320, textAlign: "center" }}>
        <div style={{ fontSize: 150 * melt, opacity: p(0.56, 0.64), transform: `translateY(${(1 - melt) * 60}px)` }}>🧊</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 25, color: A.mkt, marginTop: 14, opacity: p(0.6, 0.68), width: 220, marginLeft: -50, lineHeight: 1.35 }}>
          రోజూ కొంత విలువ ఆవిరి
        </div>
      </div>
      <div style={{ position: "absolute", left: 150, top: 810, width: 1620, textAlign: "center", opacity: p(0.72, 0.84) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 31, color: T.text, lineHeight: 1.4 }}>
          షేర్ కదలకపోయినా, ఆప్షన్ కొన్నవారి ప్రీమియం <span style={{ color: A.down, textShadow: `0 0 ${14 + Math.sin(frame * 0.09) * 8}px ${mix(T.bg0, A.down, 0.6)}` }}>ప్రతి రోజూ కరుగుతుంది</span> — అందుకే టైమ్ అమ్మేవారి పక్షం.
        </span>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_taxbars
// One gain, two holding periods → tax split bars (computed).
const TaxBarsScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const gain = 200000;
  const stcgTax = gain * 0.2;
  const ltcgTaxable = Math.max(0, gain - 125000);
  const ltcgTax = ltcgTaxable * 0.125;
  const rows = [
    { at: 0.12, label: "12 నెలల్లోపు అమ్మితే — STCG 20%", tax: stcgTax, c: A.down, sub: `పన్ను ₹${(stcgTax / 1000).toFixed(0)},000` },
    { at: 0.42, label: "12 నెలల తర్వాత అమ్మితే — LTCG 12.5% (₹1.25 లక్షల మినహాయింపు పోగా)", tax: ltcgTax, c: A.up, sub: `పన్ను కేవలం ₹${(ltcgTax / 1000).toFixed(1)},000` },
  ];
  const W = 1100;
  return (
    <Stage>
      <SMHead kicker="TAX · 2026" title="అదే ₹2 లక్షల లాభం — పన్ను తేడా చూడండి" color={A.money} o={p(0, 0.06)} />
      {rows.map((r, i) => {
        const o = p(r.at, r.at + 0.1);
        const grow = p(r.at + 0.08, r.at + 0.24);
        const taxW = (r.tax / gain) * W;
        const netW = W - taxW;
        return (
          <div key={i} style={{ position: "absolute", left: 170, top: 290 + i * 270, width: 1580, opacity: Math.max(p(0.04, 0.08) * 0.22, o) }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: r.c, marginBottom: 16, lineHeight: 1.35 }}>{r.label}</div>
            <div style={{ display: "flex", width: W, height: 74, borderRadius: 14, overflow: "hidden", border: `2px solid ${mix(T.bg2, r.c, 0.5)}` }}>
              <div style={{ width: netW * grow, background: `linear-gradient(90deg, ${mix(A.up, T.bg1, 0.45)}, ${mix(A.up, T.bg1, 0.2)})`,
                display: "flex", alignItems: "center", paddingLeft: 22 }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 25, color: T.text, whiteSpace: "nowrap", opacity: grow }}>మీకు మిగిలేది</span>
              </div>
              <div style={{ width: taxW * grow, background: `linear-gradient(90deg, ${mix(A.down, T.bg1, 0.15)}, ${A.down})`,
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                {taxW > 110 && (
                  <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: T.bg0, whiteSpace: "nowrap", opacity: grow }}>పన్ను</span>
                )}
              </div>
            </div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: r.c, marginTop: 14, opacity: p(r.at + 0.2, r.at + 0.28) }}>{r.sub}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 150, top: 850, width: 1620, textAlign: "center", opacity: p(0.78, 0.9) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: T.text, lineHeight: 1.4 }}>
          ఓపిక = తక్కువ పన్ను. <span style={{ color: A.up }}>దీర్ఘకాలం</span> ప్రభుత్వానికీ ఇష్టమే.
        </span>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_tower
// Stacked charges tower (cookbook §6 adapted).
const TowerScene: React.FC<{
  dur?: number; kicker?: string; title?: string;
  segs?: { label: string; h: number; c: string }[]; note?: string;
}> = ({ dur, kicker = "CHARGES", title = "", segs = [], note = "" }) => {
  const p = useP(dur);
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={A.money} o={p(0, 0.06)} />
      <div style={{ position: "absolute", left: 240, top: 260, width: 420, height: 560, border: `2.5px solid ${T.bg2}`, borderRadius: 18,
        background: T.panel, display: "flex", flexDirection: "column-reverse", overflow: "hidden", opacity: Math.max(p(0.03, 0.07) * 0.4, p(0.06, 0.1)) }}>
        {segs.map((s, i) => {
          const at = 0.1 + i * (0.5 / segs.length);
          return (
            <div key={i} style={{ height: s.h * p(at, at + 0.09), background: `linear-gradient(90deg, ${mix(T.panel, s.c, 0.75)}, ${mix(T.panel, s.c, 0.4)})`,
              borderTop: `2px solid ${s.c}`, display: "flex", alignItems: "center", paddingLeft: 18, boxSizing: "border-box" }}>
              <span style={{ fontFamily: MONO, fontSize: 22, color: T.text, whiteSpace: "nowrap", opacity: p(at + 0.05, at + 0.12) }}>{s.label}</span>
            </div>
          );
        })}
      </div>
      {/* legend */}
      <div style={{ position: "absolute", left: 780, top: 280, width: 980 }}>
        {segs.map((s, i) => {
          const at = 0.12 + i * (0.5 / segs.length);
          const o = p(at, at + 0.1);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22, opacity: Math.max(p(0.04, 0.08) * 0.22, o), transform: `translateX(${(1 - o) * 22}px)` }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: s.c }} />
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 29, color: T.text, lineHeight: 1.35 }}>{s.label}</span>
            </div>
          );
        })}
      </div>
      {note && (
        <div style={{ position: "absolute", left: 150, top: 850, width: 1620, textAlign: "center", opacity: p(0.76, 0.88) }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: T.text, lineHeight: 1.4 }}>{note}</span>
        </div>
      )}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_alloc
// 100% bar splits into slices; params for reuse (diversification, asset allocation).
const AllocScene: React.FC<{
  dur?: number; kicker?: string; title?: string;
  slices?: { label: string; pct: number; c: string }[]; note?: string;
}> = ({ dur, kicker = "PORTFOLIO", title = "", slices = [], note = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const W = 1580, X0 = 170, Y = 360, H = 150;
  const split = p(0.2, 0.45);
  let acc = 0;
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={A.up} o={p(0, 0.06)} />
      <div style={{ position: "absolute", left: X0, top: 270, fontFamily: MONO, fontSize: 24, color: T.muted, opacity: p(0.06, 0.14) }}>
        మీ మొత్తం పెట్టుబడి = 100%
      </div>
      {slices.map((s, i) => {
        const x = X0 + (acc / 100) * W;
        acc += s.pct;
        const w = (s.pct / 100) * W;
        const gap = split * 10;
        const at = 0.16 + i * 0.07;
        const hot = Math.floor(frame / 34) % slices.length === i && p(0.72, 0.73) > 0.5;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x + i * gap - (slices.length - 1) * gap * 0.5 * 0, top: Y + (hot ? -10 : 0), width: w - gap, height: H,
              borderRadius: 16, background: `linear-gradient(180deg, ${mix(s.c, T.bg1, 0.15)}, ${mix(s.c, T.bg1, 0.5)})`,
              border: `2.5px solid ${s.c}`, opacity: p(at, at + 0.08), boxSizing: "border-box",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: hot ? `0 0 26px ${mix(T.bg0, s.c, 0.5)}` : "none" }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: Math.min(44, w / 4), color: T.text }}>{s.pct}%</span>
            </div>
            <div style={{ position: "absolute", left: x, top: Y + H + 26 + (i % 2) * 64, width: Math.max(w, 260), opacity: p(at + 0.05, at + 0.13) }}>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, color: s.c, lineHeight: 1.3 }}>{s.label}</span>
            </div>
          </React.Fragment>
        );
      })}
      {note && (
        <div style={{ position: "absolute", left: 150, top: 790, width: 1620, textAlign: "center", opacity: p(0.76, 0.88) }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 31, color: T.text, lineHeight: 1.45 }}>{note}</span>
        </div>
      )}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_sipavg
// Rupee-cost averaging: NAV wiggles, fixed ₹ buys more units when cheap.
const SIP_NAV = [50, 42, 55, 38, 46, 60, 44, 52];
const SipAvgScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const X0 = 210, Y0 = 300, W = 1100, H = 300;
  const mn = 30, mxv = 65;
  const pts = SIP_NAV.map((v, i) => ({ x: X0 + (i / (SIP_NAV.length - 1)) * W, y: Y0 + H - ((v - mn) / (mxv - mn)) * H, v }));
  const amt = 5000;
  const totalUnits = SIP_NAV.reduce((a, v) => a + amt / v, 0);
  const avgCost = (amt * SIP_NAV.length) / totalUnits;
  const navAvg = SIP_NAV.reduce((a, b) => a + b, 0) / SIP_NAV.length;
  return (
    <Stage>
      <SMHead kicker="SIP · AVERAGING" title="SIP మ్యాజిక్ — తగ్గినప్పుడు ఎక్కువ యూనిట్లు" color={A.up} o={p(0, 0.06)} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={X0} y1={Y0 + H} x2={X0 + W} y2={Y0 + H} stroke={T.bg2} strokeWidth={2} />
        <polyline points={pts.map((q) => `${q.x},${q.y}`).slice(0, Math.max(2, Math.round(pts.length * p(0.08, 0.3)))).join(" ")}
          fill="none" stroke={A.mkt} strokeWidth={4} opacity={p(0.06, 0.14)} />
      </svg>
      {pts.map((q, i) => {
        const at = 0.3 + i * 0.05;
        const o = p(at, at + 0.05);
        const units = amt / q.v;
        const big = q.v < navAvg;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: q.x - 10, top: q.y - 10, width: 20, height: 20, borderRadius: 10,
              background: big ? A.up : A.money, opacity: o, boxShadow: `0 0 12px ${big ? A.up : A.money}` }} />
            <div style={{ position: "absolute", left: q.x - 62, top: Y0 + H + 20, width: 124, textAlign: "center", opacity: o }}>
              <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted }}>NAV ₹{q.v}</div>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: big ? A.up : A.money, marginTop: 4 }}>{units.toFixed(0)} యూ.</div>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: X0, top: 240, fontFamily: MONO, fontSize: 23, color: T.muted, opacity: p(0.06, 0.14) }}>
        ప్రతి నెలా ₹5,000 — NAV ఎలా ఉన్నా
      </div>
      {/* result panel */}
      <div style={{ position: "absolute", left: 1400, top: 300, width: 380, borderRadius: 20, background: mix(T.panel, A.up, 0.08),
        border: `2.5px solid ${p(0.72, 0.76) > 0.5 ? A.up : T.bg2}`, padding: "26px 28px", boxSizing: "border-box",
        opacity: Math.max(p(0.04, 0.08) * 0.22, p(0.7, 0.78)),
        boxShadow: `0 0 ${26 + Math.sin(frame * 0.07) * 10}px ${mix(T.bg0, A.up, 0.2)}` }}>
        <div style={{ fontFamily: SANS, fontSize: 25, color: T.muted, lineHeight: 1.35 }}>సగటు NAV</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: A.money }}>₹{navAvg.toFixed(1)}</div>
        <div style={{ fontFamily: SANS, fontSize: 25, color: T.muted, marginTop: 16, lineHeight: 1.35 }}>మీ సగటు కొనుగోలు ధర</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: A.up }}>₹{avgCost.toFixed(1)}</div>
        <div style={{ fontFamily: SANS, fontSize: 23, color: T.text, marginTop: 14, lineHeight: 1.4, opacity: p(0.82, 0.9) }}>
          సగటు కంటే తక్కువకే కొన్నారు!
        </div>
      </div>
      <div style={{ position: "absolute", left: 150, top: 830, width: 1620, textAlign: "center", opacity: p(0.84, 0.94) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: T.text, lineHeight: 1.4 }}>
          మార్కెట్ తగ్గడం SIPకి <span style={{ color: A.up }}>వరం</span> — అదే రూపీ-కాస్ట్ యావరేజింగ్.
        </span>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_mfpool
// Many investors → pool → fund manager → diversified basket.
const MFPoolScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const basket = ["🏦", "💊", "🚗", "💻", "🛒", "⚡"];
  return (
    <Stage>
      <SMHead kicker="LESSON · MUTUAL FUNDS" title="మ్యూచువల్ ఫండ్ అంటే ఏమిటి?" color={A.up} o={p(0, 0.06)} />
      {/* investors */}
      {Array.from({ length: 5 }).map((_, i) => {
        const y = 280 + i * 110;
        const at = 0.06 + i * 0.03;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 170, top: y, width: 200, display: "flex", alignItems: "center", gap: 14, opacity: p(at, at + 0.06) }}>
              <span style={{ fontSize: 44 }}>🧑</span>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 23, color: A.money }}>₹500+</span>
            </div>
            <Flow x1={370} y1={y + 26} x2={640} y2={520} color={A.money} n={3} o={p(0.16, 0.26)} />
          </React.Fragment>
        );
      })}
      {/* pool */}
      <div style={{ position: "absolute", left: 650, top: 420, width: 300, height: 210, borderRadius: 24,
        background: mix(T.panel, A.money, 0.12), border: `3px solid ${A.money}`, textAlign: "center", boxSizing: "border-box", paddingTop: 24,
        opacity: p(0.18, 0.28), boxShadow: `0 0 ${30 + Math.sin(frame * 0.06) * 12}px ${mix(T.bg0, A.money, 0.25)}` }}>
        <div style={{ fontSize: 48 }}>💰</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: A.money, marginTop: 6 }}>ఉమ్మడి ఫండ్</div>
      </div>
      <Wire x1={950} y1={525} x2={1090} y2={525} p={p(0.32, 0.4)} color={A.mkt} w={4} />
      <Flow x1={950} y1={525} x2={1090} y2={525} color={A.mkt} n={5} o={p(0.36, 0.46)} />
      {/* fund manager */}
      <div style={{ position: "absolute", left: 1100, top: 430, width: 260, height: 190, borderRadius: 20,
        background: mix(T.panel, A.mkt, 0.1), border: `2.5px solid ${A.mkt}`, textAlign: "center", boxSizing: "border-box", paddingTop: 20,
        opacity: p(0.38, 0.48) }}>
        <div style={{ fontSize: 46 }}>👩‍💼</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 27, color: A.mkt, marginTop: 6 }}>ఫండ్ మేనేజర్</div>
      </div>
      {/* basket */}
      {basket.map((e, i) => {
        const r = Math.floor(i / 2), c = i % 2;
        const at = 0.5 + i * 0.045;
        const hot = Math.floor(frame / 26) % basket.length === i && p(0.75, 0.76) > 0.5;
        return (
          <React.Fragment key={i}>
            <Flow x1={1360} y1={525} x2={1490 + c * 150} y2={300 + r * 150 + 55} color={A.up} n={3} o={p(at, at + 0.08)} />
            <div style={{ position: "absolute", left: 1450 + c * 150, top: 300 + r * 150, width: 120, height: 110, borderRadius: 16,
              background: mix(T.panel, A.up, hot ? 0.2 : 0.1), border: `2px solid ${hot ? A.up : mix(T.bg2, A.up, 0.5)}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46,
              opacity: p(at, at + 0.07), transform: `scale(${hot ? 1.08 : 1})` }}>{e}</div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 1440, top: 250, fontFamily: MONO, fontSize: 22, color: T.muted, opacity: p(0.5, 0.6) }}>
        ఎన్నో రంగాల షేర్లు
      </div>
      <div style={{ position: "absolute", left: 150, top: 820, width: 1620, textAlign: "center", opacity: p(0.78, 0.9) }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 31, color: T.text, lineHeight: 1.4 }}>
          అందరి డబ్బు కలిపి, నిపుణులు నడిపే <span style={{ color: A.up }}>రెడీమేడ్ పోర్ట్‌ఫోలియో</span> — ₹500 తోనే మొదలుపెట్టవచ్చు.
        </span>
      </div>
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_stairs
// Wealth-journey staircase: steps rising L→R (foundation first).
const StairsScene: React.FC<{
  dur?: number; kicker?: string; title?: string;
  steps?: { emoji: string; label: string; sub?: string; c?: string }[]; note?: string;
}> = ({ dur, kicker = "ROADMAP", title = "", steps = [], note = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = steps.length;
  const w = Math.min(330, Math.floor(1620 / n) - 16);
  const baseY = 760, riser = Math.min(110, Math.floor(420 / n));
  const walker = Math.min(n - 1, Math.floor(p(0.7, 0.95) * n));
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={A.up} o={p(0, 0.06)} />
      {steps.map((s, i) => {
        const c = s.c || A.up;
        const at = 0.08 + i * (0.55 / n);
        const o = p(at, at + 0.08);
        const x = 150 + i * (w + 16);
        const y = baseY - i * riser;
        const active = walker === i;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: 190 + i * riser,
            borderRadius: "16px 16px 0 0", boxSizing: "border-box", padding: "18px 20px",
            background: `linear-gradient(180deg, ${mix(T.panel, c, o > 0.5 ? 0.14 : 0.03)}, ${mix(T.panel, c, 0.03)})`,
            borderTop: `4px solid ${o > 0.5 ? c : T.bg2}`, borderLeft: `2px solid ${o > 0.5 ? mix(T.bg2, c, 0.5) : T.bg2}`,
            borderRight: `2px solid ${o > 0.5 ? mix(T.bg2, c, 0.5) : T.bg2}`,
            opacity: Math.max(p(0.03, 0.07) * 0.25, o),
            boxShadow: active ? `0 0 ${26 + Math.sin(frame * 0.09) * 10}px ${mix(T.bg0, c, 0.3)}` : "none" }}>
            <div style={{ fontSize: 42 }}>{s.emoji}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 27, color: c, marginTop: 8, lineHeight: 1.3 }}>{s.label}</div>
            {s.sub && <div style={{ fontFamily: SANS, fontSize: 23, color: T.muted, marginTop: 6, lineHeight: 1.35 }}>{s.sub}</div>}
            <div style={{ position: "absolute", top: -46, left: 12, fontFamily: MONO, fontWeight: 800, fontSize: 26, color: c, opacity: o }}>{i + 1}</div>
          </div>
        );
      })}
      {/* walker */}
      <div style={{ position: "absolute", left: 150 + walker * (w + 16) + w / 2 - 24, top: baseY - walker * riser - 64,
        fontSize: 48, opacity: p(0.68, 0.76), transform: `translateY(${Math.sin(frame * 0.12) * 4}px)` }}>🚶</div>
      {note && (
        <div style={{ position: "absolute", left: 150, top: 210, width: 1620, opacity: p(0.1, 0.2) }}>
          <span style={{ fontFamily: SANS, fontSize: 28, color: T.muted, lineHeight: 1.4 }}>{note}</span>
        </div>
      )}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_peers
// Competitor valuation: horizontal P/E bars, the IPO's own bar highlighted, a
// verdict line. Handles null P/E ("n/a") for no-listed-peer / loss-making cases.
const PeersScene: React.FC<{
  dur?: number; kicker?: string; title?: string; color?: string; peLabel?: string;
  rows?: { name: string; pe: number | null; note?: string; hi?: boolean; display?: string }[];
  verdict?: string; unit?: string; dec?: number; naText?: string;
}> = ({ dur, kicker = "COMPETITORS · VALUATION", title = "", color = A.mkt,
  peLabel = "P/E (×) — longer bar = pricier", rows = [], verdict = "",
  unit = "×", dec, naText = "no comparable P/E" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = rows.length || 1;
  const vals = rows.map((r) => r.pe).filter((x): x is number => x != null);
  const mx = vals.length ? Math.max(...vals) : 1;
  const rowH = Math.min(116, Math.floor(560 / n) - 12);
  const totalH = n * (rowH + 16);
  const y0 = 258 + Math.max(0, (560 - totalH) / 2);
  const NAMEW = 380, BARW = 980, PEW = 150;
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={color} o={p(0, 0.06)} />
      <div style={{ position: "absolute", left: 130 + NAMEW + 26, top: y0 - 34, width: BARW,
        fontFamily: MONO, fontSize: 20, color: T.muted, opacity: p(0.06, 0.14), letterSpacing: 1.5 }}>{peLabel}</div>
      {rows.map((r, i) => {
        const at = 0.1 + i * (0.5 / n);
        const o = p(at, at + 0.09);
        const ghost = p(0.03, 0.07);
        const c = r.hi ? color : A.mkt;
        const fill = r.pe != null ? (r.pe / mx) * BARW * p(at + 0.05, at + 0.32) : 0;
        const y = y0 + i * (rowH + 16);
        return (
          <div key={i} style={{
            position: "absolute", left: 130, top: y, width: NAMEW + 26 + BARW + 26 + PEW + 48, height: rowH,
            display: "flex", alignItems: "center", borderRadius: 14, boxSizing: "border-box", padding: "0 24px",
            opacity: Math.max(ghost * 0.22, o),
            background: mix(T.panel, c, r.hi ? (o > 0.5 ? 0.15 : 0.03) : (o > 0.5 ? 0.06 : 0.02)),
            border: `${r.hi ? 3 : 2}px solid ${o > 0.5 ? mix(T.bg2, c, r.hi ? 1 : 0.5) : T.bg2}`,
            boxShadow: r.hi && o > 0.85 ? `0 0 ${22 + Math.sin(frame * 0.08) * 12}px ${mix(T.bg0, c, 0.32)}` : "none",
            transform: `translateX(${(1 - o) * -22}px)` }}>
            <div style={{ width: NAMEW, flexShrink: 0 }}>
              <div style={{ fontFamily: SANS, fontWeight: r.hi ? 800 : 700, fontSize: 27, color: r.hi ? color : T.text, lineHeight: 1.2 }}>
                {r.hi ? "▶ " : ""}{r.name}</div>
              {r.note && <div style={{ fontFamily: SANS, fontSize: 19, color: T.muted, marginTop: 3, lineHeight: 1.25 }}>{r.note}</div>}
            </div>
            <div style={{ position: "relative", width: BARW, height: 24, marginLeft: 26, borderRadius: 6,
              background: mix(T.panel, c, 0.05), overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center" }}>
              {r.pe != null
                ? <div style={{ width: fill, height: "100%", borderRadius: 6,
                    background: `linear-gradient(90deg, ${mix(c, T.bg1, 0.4)}, ${c})` }} />
                : <span style={{ fontFamily: MONO, fontSize: 18, color: T.muted, paddingLeft: 12, opacity: o }}>{naText}</span>}
            </div>
            <div style={{ width: PEW, marginLeft: 26, textAlign: "right", flexShrink: 0,
              fontFamily: MONO, fontWeight: 800, fontSize: 34, color: r.pe != null ? (r.hi ? color : T.text) : T.muted,
              opacity: p(at + 0.12, at + 0.26) }}>
              {r.pe != null ? (r.display || `${r.pe.toFixed(dec != null ? dec : (r.pe % 1 ? 1 : 0))}${unit}`) : "n/a"}</div>
          </div>
        );
      })}
      {verdict && (
        <div style={{ position: "absolute", left: 130, top: 848, width: 1660, textAlign: "center", opacity: p(0.7, 0.82) }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: T.text, lineHeight: 1.4 }}>{verdict}</span>
        </div>
      )}
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_reportcard
// One consistent five-factor report card for a newly listed stock. The price
// journey, factor row and two-quarter model path deliberately share the same
// geometry across every company so viewers can compare without relearning the
// frame. Always-on motion: live candles, travelling rail pulse and edge progress.
const ReportCardScene: React.FC<{
  dur?: number; index?: number; total?: number; name?: string; ticker?: string;
  listed?: string; issue?: string; listing?: string; current?: string;
  listGain?: string; returnPct?: string; status?: string; statusTone?: string;
  factors?: { label: string; value: string; note: string; tone?: string }[];
  target1?: string; target2?: string; confidence?: string; modelNote?: string;
}> = ({
  dur, index = 1, total = 20, name = "", ticker = "", listed = "",
  issue = "", listing = "", current = "", listGain = "", returnPct = "",
  status = "", statusTone = A.mkt, factors = [], target1 = "", target2 = "",
  confidence = "LOW", modelNote = "",
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const priceNodes = [
    { label: "ISSUE", value: issue, note: "offer price", color: A.money },
    { label: "LISTING", value: listing, note: listGain, color: A.mkt },
    { label: "28 AUG CLOSE", value: current, note: returnPct, color: statusTone },
  ];
  const railPulse = ((frame * 5) % 1450);
  return (
    <Stage>
      <CandleMotif x={1420} y={70} w={350} h={110} o={0.22 + Math.sin(frame * 0.06) * 0.05} k={22} dim />
      <div style={{ position: "absolute", left: 100, top: 48, right: 100 }}>
        <Kicker theme={T} text={`STOCK ${String(index).padStart(2, "0")} / ${total} · NSE:${ticker} · LISTED ${listed}`} color={statusTone} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50, color: T.text, letterSpacing: 0, opacity: p(0, 0.05) }}>{name}</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: statusTone,
            padding: "9px 18px", borderRadius: 999, border: `2px solid ${statusTone}`,
            background: mix(T.panel, statusTone, 0.13), opacity: p(0.04, 0.10) }}>{status}</div>
        </div>
      </div>

      {/* price journey */}
      <div style={{ position: "absolute", left: 130, top: 185, width: 1660, height: 190,
        borderRadius: 20, background: mix(T.panel, A.mkt, 0.045), border: `2px solid ${mix(T.bg2, A.mkt, 0.42)}` }}>
        {priceNodes.map((node, i) => {
          const at = 0.05 + i * 0.07;
          const o = p(at, at + 0.07);
          const x = 28 + i * 390;
          return (
            <React.Fragment key={node.label}>
              <div style={{ position: "absolute", left: x, top: 24, width: 330, height: 140,
                borderRadius: 16, padding: "18px 22px", boxSizing: "border-box",
                opacity: o, transform: `translateY(${(1 - o) * 16}px)`,
                background: mix(T.panel, node.color, 0.09), border: `2px solid ${mix(T.bg2, node.color, 0.62)}` }}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 18, letterSpacing: 2, color: node.color }}>{node.label}</div>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 39, color: T.text, marginTop: 8 }}>{node.value}</div>
                <div style={{ fontFamily: SANS, fontSize: 19, color: T.muted, marginTop: 3 }}>{node.note}</div>
              </div>
              {i < 2 && <div style={{ position: "absolute", left: x + 340, top: 89, color: A.mkt,
                fontFamily: MONO, fontWeight: 800, fontSize: 28, opacity: p(at + 0.04, at + 0.1) }}>→</div>}
            </React.Fragment>
          );
        })}
        <div style={{ position: "absolute", right: 28, top: 24, width: 420, height: 140,
          borderRadius: 16, padding: "18px 22px", boxSizing: "border-box", textAlign: "center",
          opacity: p(0.22, 0.3), background: mix(T.panel, statusTone, 0.12), border: `2.5px solid ${statusTone}`,
          boxShadow: `0 0 ${18 + Math.sin(frame * 0.08) * 8}px ${mix(T.bg0, statusTone, 0.28)}` }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 18, letterSpacing: 2, color: statusTone }}>MARKET SCORE</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text, marginTop: 13, lineHeight: 1.2 }}>{status}</div>
          <div style={{ fontFamily: MONO, fontSize: 18, color: T.muted, marginTop: 7 }}>vs issue price</div>
        </div>
      </div>

      {/* the same five lenses on every company */}
      <div style={{ position: "absolute", left: 130, top: 408, width: 1660, display: "flex", gap: 16 }}>
        {factors.map((f, i) => {
          const c = f.tone || A.mkt;
          const at = 0.22 + i * 0.045;
          const o = p(at, at + 0.07);
          const hot = Math.floor(frame / 34) % Math.max(1, factors.length) === i;
          return (
            <div key={f.label} style={{ width: 319, height: 220, borderRadius: 16, boxSizing: "border-box", padding: "19px 18px",
              opacity: o, transform: `translateY(${(1 - o) * 18}px) scale(${hot && p(0.55, 0.6) > 0.5 ? 1.015 : 1})`,
              background: mix(T.panel, c, hot ? 0.13 : 0.07), border: `2px solid ${mix(T.bg2, c, hot ? 0.82 : 0.48)}` }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 17, color: c, letterSpacing: 1.5 }}>{f.label}</div>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 29, color: T.text, marginTop: 17, lineHeight: 1.1 }}>{f.value}</div>
              <div style={{ fontFamily: SANS, fontSize: 18, color: T.muted, lineHeight: 1.32, marginTop: 14 }}>{f.note}</div>
            </div>
          );
        })}
      </div>

      {/* uniform two-quarter base-case target rail */}
      <div style={{ position: "absolute", left: 130, top: 666, width: 1660, height: 240,
        borderRadius: 20, boxSizing: "border-box", padding: "20px 28px",
        opacity: p(0.48, 0.56), background: mix(T.panel, A.deriv, 0.07), border: `2px solid ${mix(T.bg2, A.deriv, 0.58)}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 19, color: A.deriv, letterSpacing: 2 }}>UNIFORM FACTOR MODEL · BASE CASE</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 18, color: A.money }}>CONFIDENCE: {confidence}</div>
        </div>
        <div style={{ position: "absolute", left: 70, right: 70, top: 104, height: 4, background: mix(T.bg2, A.deriv, 0.42), borderRadius: 4 }} />
        <div style={{ position: "absolute", left: 70 + railPulse, top: 96, width: 20, height: 20, borderRadius: 20,
          background: A.deriv, boxShadow: `0 0 22px ${A.deriv}` }} />
        {[
          { x: 70, label: "CURRENT", value: current, color: statusTone },
          { x: 710, label: "NEXT QUARTER", value: target1, color: A.mkt },
          { x: 1350, label: "FOLLOWING QUARTER", value: target2, color: A.deriv },
        ].map((n, i) => (
          <div key={n.label} style={{ position: "absolute", left: n.x, top: 68, width: 240, textAlign: "center",
            opacity: p(0.53 + i * 0.06, 0.61 + i * 0.06), transform: `translateY(${(1 - p(0.53 + i * 0.06, 0.61 + i * 0.06)) * 12}px)` }}>
            <div style={{ width: 18, height: 18, margin: "27px auto 8px", borderRadius: 18, background: n.color, border: `3px solid ${T.bg0}` }} />
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 17, color: n.color, letterSpacing: 1 }}>{n.label}</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 31, color: T.text, marginTop: 6 }}>{n.value}</div>
          </div>
        ))}
        <div style={{ position: "absolute", left: 310, right: 310, bottom: 14, textAlign: "center",
          fontFamily: SANS, fontSize: 17, color: T.muted, lineHeight: 1.28 }}>{modelNote}</div>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: `${p(0, 1) * 100}%`, height: 6,
        background: `linear-gradient(90deg, ${A.mkt}, ${statusTone}, ${A.deriv})` }} />
    </Stage>
  );
};

// ---------------------------------------------------------------- sm_financials
// Three-statement view: Income Statement · Balance Sheet · Cash Flow side by side.
// Each column = a statement with labelled rows (val is a pre-formatted string so we
// can show "Not disclosed" honestly where the DRHP summary omits a line). A hero row
// (hi:true) is emphasised. Always-on motion: sine glow on the active column + a scan
// highlight sweeping the columns in the back half.
const FinancialsScene: React.FC<{
  dur?: number; kicker?: string; title?: string; color?: string; note?: string;
  cols?: { name: string; icon?: string; accent?: string;
           rows: { label: string; val: string; sub?: string; hi?: boolean }[] }[];
}> = ({ dur, kicker = "FINANCIALS · 3 STATEMENTS", title = "", color = A.money, note = "", cols = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = cols.length || 1;
  const gap = 30;
  const w = Math.floor((1660 - gap * (n - 1)) / n);
  const y0 = 250;
  const H = note ? 560 : 620;
  const sweep = p(0.62, 1);                                  // back-half column sweep
  const active = sweep > 0 ? Math.floor((frame / 30) % n) : -1;
  return (
    <Stage>
      <SMHead kicker={kicker} title={title} color={color} o={p(0, 0.06)} />
      {cols.map((col, i) => {
        const c = col.accent || color;
        const at = 0.08 + i * (0.42 / n);
        const o = p(at, at + 0.1);
        const ghost = p(0.03, 0.07);
        const x = 130 + i * (w + gap);
        const isActive = active === i;
        const rows = col.rows || [];
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y0, width: w, height: H,
            borderRadius: 20, boxSizing: "border-box", padding: "24px 22px",
            background: mix(T.panel, c, o > 0.5 ? (isActive ? 0.12 : 0.06) : 0.02),
            border: `2.5px solid ${o > 0.5 ? mix(T.bg2, c, isActive ? 1 : 0.65) : T.bg2}`,
            opacity: Math.max(ghost * 0.2, o), transform: `translateY(${(1 - o) * 24}px)`,
            boxShadow: o > 0.9 ? `0 0 ${26 + Math.sin(frame * 0.06 + i * 1.3) * 12}px ${mix(T.bg0, c, isActive ? 0.34 : 0.18)}` : "none",
          }}>
            {/* header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14,
              borderBottom: `2px solid ${mix(T.bg2, c, 0.5)}` }}>
              {col.icon && <div style={{ fontSize: 34 }}>{col.icon}</div>}
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 27, color: c, lineHeight: 1.15 }}>{col.name}</div>
            </div>
            {/* rows */}
            {rows.map((r, j) => {
              const rat = at + 0.08 + j * 0.05;
              const ro = p(rat, rat + 0.08);
              const disclosed = !/^not disclosed/i.test(r.val);
              const negative = disclosed && /^[−-]/.test(r.val.trim());
              const valColor = !disclosed ? T.muted : negative ? A.down : (r.hi ? c : T.text);
              return (
                <div key={j} style={{
                  marginTop: j === 0 ? 18 : 12, opacity: ro, transform: `translateX(${(1 - ro) * -14}px)`,
                  borderRadius: 10, padding: r.hi ? "8px 10px" : "0 10px",
                  background: r.hi ? mix(T.panel, c, 0.14) : "transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontFamily: SANS, fontSize: 22, color: r.hi ? T.text : T.muted, lineHeight: 1.25 }}>{r.label}</span>
                    <span style={{ fontFamily: MONO, fontWeight: r.hi ? 800 : 700, fontSize: r.hi ? 27 : 24,
                      color: valColor, textAlign: "right", whiteSpace: "nowrap",
                      fontStyle: disclosed ? "normal" : "italic" }}>{r.val}</span>
                  </div>
                  {r.sub && <div style={{ fontFamily: SANS, fontSize: 17, color: T.muted, marginTop: 2, lineHeight: 1.25 }}>{r.sub}</div>}
                </div>
              );
            })}
          </div>
        );
      })}
      {note && (
        <div style={{ position: "absolute", left: 130, top: 860, width: 1660, textAlign: "center", opacity: p(0.7, 0.82) }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 29, color: T.text, lineHeight: 1.4 }}>{note}</span>
        </div>
      )}
    </Stage>
  );
};

// ---------------------------------------------------------------- dispatcher
export const SMScene: React.FC<{ variant: string;[key: string]: unknown }> = ({ variant, ...rest }) => {
  let content: React.ReactNode = null;
  let accent = T.accent;
  switch (variant) {
    case "sm_title": content = <TitleScene {...(rest as any)} />; break;
    case "sm_ptitle": content = <PTitleScene {...(rest as any)} />; break;
    case "sm_divider": content = <DividerScene {...(rest as any)} />; accent = ((rest as any).color as string) || A.up; break;
    case "sm_recap": content = <RecapScene {...(rest as any)} />; break;
    case "sm_checklist": content = <ChecklistScene {...(rest as any)} />; accent = ((rest as any).color as string) || A.up; break;
    case "sm_iconcards": content = <IconCardsScene {...(rest as any)} />; accent = ((rest as any).color as string) || A.mkt; break;
    case "sm_compare3": content = <Compare3Scene {...(rest as any)} />; break;
    case "sm_myths": content = <MythsScene {...(rest as any)} />; accent = A.down; break;
    case "sm_stats": content = <StatsScene {...(rest as any)} />; accent = A.money; break;
    case "sm_steps": content = <StepsScene {...(rest as any)} />; accent = ((rest as any).color as string) || A.mkt; break;
    case "sm_whatis": content = <WhatIsScene {...(rest as any)} />; accent = A.up; break;
    case "sm_exchange": content = <ExchangeScene {...(rest as any)} />; accent = A.mkt; break;
    case "sm_pricemove": content = <PriceMoveScene {...(rest as any)} />; accent = A.mkt; break;
    case "sm_index": content = <IndexScene {...(rest as any)} />; accent = A.mkt; break;
    case "sm_growthline": content = <GrowthLineScene {...(rest as any)} />; accent = A.up; break;
    case "sm_accounts": content = <AccountsScene {...(rest as any)} />; accent = A.mkt; break;
    case "sm_order": content = <OrderScene {...(rest as any)} />; accent = A.up; break;
    case "sm_candles": content = <CandlesScene {...(rest as any)} />; accent = A.up; break;
    case "sm_daytrade": content = <DayTradeScene {...(rest as any)} />; accent = A.deriv; break;
    case "sm_lossgrid": content = <LossGridScene {...(rest as any)} />; accent = A.down; break;
    case "sm_leverage": content = <LeverageScene {...(rest as any)} />; accent = A.deriv; break;
    case "sm_payoff": content = <PayoffScene {...(rest as any)} />; accent = A.deriv; break;
    case "sm_theta": content = <ThetaScene {...(rest as any)} />; accent = A.down; break;
    case "sm_taxbars": content = <TaxBarsScene {...(rest as any)} />; accent = A.money; break;
    case "sm_tower": content = <TowerScene {...(rest as any)} />; accent = A.money; break;
    case "sm_alloc": content = <AllocScene {...(rest as any)} />; accent = A.up; break;
    case "sm_sipavg": content = <SipAvgScene {...(rest as any)} />; accent = A.up; break;
    case "sm_mfpool": content = <MFPoolScene {...(rest as any)} />; accent = A.up; break;
    case "sm_stairs": content = <StairsScene {...(rest as any)} />; accent = A.up; break;
    case "sm_peers": content = <PeersScene {...(rest as any)} />; accent = ((rest as any).color as string) || A.mkt; break;
    case "sm_reportcard": content = <ReportCardScene {...(rest as any)} />; accent = ((rest as any).statusTone as string) || A.mkt; break;
    case "sm_financials": content = <FinancialsScene {...(rest as any)} />; accent = ((rest as any).color as string) || A.money; break;
    default:
      content = (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "#f88", fontFamily: MONO, fontSize: 40 }}>unknown sm variant “{variant}”</div>
        </AbsoluteFill>
      );
  }
  return (
    <AbsoluteFill>
      <Bg theme={T} accent={accent} />
      {content}
    </AbsoluteFill>
  );
};
