/**
 * fq/core.tsx — CLAUDE-owned core scenes: title, the "two lenses" intro, divider, recap.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage, Kicker, Brackets, ScanBeam, useP, usePop } from "../../lib/primitives";
import { T, A, mix, MONO, SANS, SceneProgress, TickStrip, DefBadge, FQHead } from "./kit";

// fq_title -------------------------------------------------------------------
export const TitleScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const pop = usePop(dur);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {/* ambience: candlestick strips at edges + slow orbiting dots (never behind headline) */}
      <TickStrip x={120} y={150} w={520} h={150} color={A.fund} o={p(0.1, 0.4) * 0.9} seed={2} />
      <TickStrip x={1280} y={770} w={520} h={110} color={A.tech} o={p(0.16, 0.46) * 0.9} seed={5} />
      {Array.from({ length: 9 }).map((_, i) => {
        const ang = frame * 0.01 + (i / 9) * Math.PI * 2;
        return (
          <div key={i} style={{ position: "absolute", left: 960 + Math.cos(ang) * (640 + i * 12) - 4,
            top: 540 + Math.sin(ang) * (300 + i * 7) - 4, width: 8, height: 8, borderRadius: 8,
            background: A.main, opacity: 0.18 + rndlike(i) * 0.25, boxShadow: `0 0 12px ${A.main}` }} />
        );
      })}
      <div style={{ textAlign: "center", transform: `scale(${0.93 + pop(0) * 0.07})` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <Kicker theme={T} text="STOCK MARKET ANALYSIS · FROM SCRATCH" cx />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 118, lineHeight: 1.03, letterSpacing: -3, color: T.text }}>
          <div>Read a Portfolio</div>
          <div style={{ color: A.main, textShadow: `0 0 70px ${mix(T.bg0, A.main, 0.7)}` }}>Like a Quant</div>
        </div>
        <div style={{ height: 5, width: interpolate(p(0.18, 0.45), [0, 1], [0, 560]),
          background: `linear-gradient(90deg, ${A.fund}, ${A.main}, ${A.tech})`, borderRadius: 3, margin: "30px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 37, color: T.muted, opacity: p(0.28, 0.5) }}>
          Fundamentals + technicals, taught from zero — on a real ₹59,405 book.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// fq_lenses ------------------------------------------------------------------
export const LensesScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const lens = (x: number, at: number, color: string, tag: string, q: string, pts: string[]) => (
    <div style={{ position: "absolute", left: x, top: 250, width: 740, height: 560, borderRadius: 24,
      background: mix(T.panel, color, 0.08), border: `2.5px solid ${color}`, padding: "34px 38px", boxSizing: "border-box",
      opacity: p(at, at + 0.1), transform: `translateY(${(1 - p(at, at + 0.1)) * 24}px)`,
      boxShadow: `0 0 60px ${mix(T.bg0, color, 0.24 + Math.sin(frame * 0.05) * 0.06)}` }}>
      <DefBadge text={tag} color={color} o={p(at + 0.02, at + 0.1)} />
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: T.text, marginTop: 22, lineHeight: 1.2, opacity: p(at + 0.05, at + 0.14) }}>{q}</div>
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
        {pts.map((pt, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", opacity: p(at + 0.14 + i * 0.06, at + 0.2 + i * 0.06) }}>
            <div style={{ width: 12, height: 12, borderRadius: 12, background: color, boxShadow: `0 0 12px ${color}`, flex: "none" }} />
            <span style={{ fontFamily: SANS, fontSize: 27, color: T.text }}>{pt}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <Stage>
      <SceneProgress p={p} color={A.main} />
      <FQHead kicker="TWO LENSES · ONE STOCK" title="Two ways to size up any stock" color={A.main} p={p} />
      {lens(100, 0.1, A.fund, "Lens 1 · Fundamentals", "Is the business good — and fairly priced?",
        ["How much it earns (profit, growth)", "How well it earns it (returns, debt)", "What you pay for it (valuation)"])}
      {lens(1060, 0.34, A.tech, "Lens 2 · Technicals", "What is the price actually doing?",
        ["The trend — up, down, or sideways", "Momentum — is it hot or oversold?", "Timing — where to enter and exit"])}
      {/* connective tick motif in the gap between the lens cards (840 → 1060) */}
      <TickStrip x={850} y={470} w={200} h={120} color={A.main} o={p(0.55, 0.7) * 0.8} seed={3} />
    </Stage>
  );
};

// fq_divider (parameterized) -------------------------------------------------
export const DividerScene: React.FC<{ dur?: number; n?: number; title?: string; sub?: string; color?: string; pips?: number }> = ({
  dur, n = 1, title = "", sub = "", color = A.main, pips = 5,
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Brackets x={330} y={300} w={1260} h={480} color={color} o={p(0.02, 0.14)} len={54} />
      <ScanBeam theme={T} x={340} y={310} w={1240} h={460} color={color} o={p(0.05, 0.2)} speed={1.6} />
      <TickStrip x={520} y={720} w={880} h={110} color={color} o={p(0.3, 0.5) * 0.7} seed={n} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color, letterSpacing: 10, opacity: p(0.05, 0.15) }}>PART {"0" + n}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, color: T.text, letterSpacing: -2, marginTop: 20,
          opacity: p(0.12, 0.24), transform: `translateY(${(1 - p(0.12, 0.24)) * 30}px)` }}>{title}</div>
        <div style={{ height: 5, width: interpolate(p(0.2, 0.5), [0, 1], [0, 420]), background: color, borderRadius: 3, margin: "26px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 34, color: T.muted, opacity: p(0.3, 0.45) }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", gap: 16, opacity: p(0.3, 0.45) }}>
        {Array.from({ length: pips }).map((_, k) => {
          const i = k + 1;
          return (
            <div key={i} style={{ width: i === n ? 44 : 14, height: 14, borderRadius: 8,
              background: i <= n ? color : mix(T.panel, color, 0.15), border: `1.5px solid ${i <= n ? color : T.line}`,
              opacity: i === n ? 0.7 + Math.sin(frame * 0.1) * 0.3 : 1 }} />
          );
        })}
      </div>
    </Stage>
  );
};

// fq_recap (parameterized) ---------------------------------------------------
export const RecapScene: React.FC<{ dur?: number; items?: string[]; closer?: string }> = ({
  dur, items = [], closer = "",
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <AbsoluteFill style={{ padding: "60px 130px", justifyContent: "center" }}>
      <SceneProgress p={p} color={A.main} />
      <div style={{ opacity: p(0, 0.06), textAlign: "center", marginBottom: 26 }}>
        <Kicker theme={T} text="RECAP · THE WHOLE MAP" cx />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, color: T.text, marginTop: 12, letterSpacing: -1.5 }}>The method in one breath</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 1360, margin: "0 auto", width: "100%" }}>
        {items.map((it, i) => {
          const at = 0.05 + i * 0.085;
          const o = p(at, at + 0.06);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: o, transform: `translateX(${(1 - o) * -24}px)`,
              background: mix(T.panel, A.main, 0.05), border: `1.5px solid ${T.line}`, borderLeft: `4px solid ${A.main}`, borderRadius: 12, padding: "13px 26px" }}>
              <span style={{ color: A.main, fontFamily: MONO, fontWeight: 700, fontSize: 25 }}>{i + 1}</span>
              <span style={{ fontFamily: SANS, fontSize: 28, color: T.text, lineHeight: 1.25 }}>{it}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 30, opacity: p(0.78, 0.9) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 40, color: A.main,
          textShadow: `0 0 ${28 + Math.sin(frame * 0.06) * 14}px ${mix(T.bg0, A.main, 0.7)}` }}>{closer}</div>
      </div>
    </AbsoluteFill>
  );
};

// tiny deterministic jitter for title dots (avoids importing rnd just for this)
function rndlike(i: number) { const x = Math.sin(i * 91.7) * 43758.5; return x - Math.floor(x); }
