/**
 * fq/pickdetail.tsx — CLAUDE-owned per-pick DEEP DIVE (variant fq_pickdetail).
 * One scene per pick: real fundamentals + technicals + score + bull/bear + buy plan.
 * All numbers arrive as props from build.py (sourced from live Kite + Screener data).
 * Three columns (FA | TA | Score) over y 200–620, then a buy-plan strip and
 * bull/bear cards. Content stays y≤864 (captions ON). Phases with useP(dur).
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage, Counter, useP } from "../../lib/primitives";
import { T, A, mix, MONO, SANS, SceneProgress, FQHead, DefBadge } from "./kit";

export interface FA { pe: number; pb: number; roe: number; roce: number; de: number; prom: number; valflag: string; }
export interface TA { ltp: number; s200: number; d200: number; rsi: number; beta: number; mdd: number; pos52: number; lo52: number; hi52: number; }
export interface SC { q: number; t: number; v: number; c: number; comp: number; }
export interface Plan { leg1: number; leg2: number; avg: number; stop: number; stopPct: number; tgt: number; tgtPct: number; rr?: number; }
export interface PickProps {
  dur?: number; tk?: string; theme?: string; cap?: string; conv?: string; month?: number;
  line?: string; color?: string; fa?: FA; ta?: TA; sc?: SC; cat?: string; bear?: string; plan?: Plan;
}

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

// one labeled metric row inside a column
const Row: React.FC<{ y: number; label: string; value: string; color?: string; o: number; good?: "up" | "down" | null }> = ({
  y, label, value, color, o, good,
}) => (
  <div style={{ position: "absolute", left: 0, top: y, width: "100%", display: "flex", alignItems: "baseline", justifyContent: "space-between", opacity: o }}>
    <span style={{ fontFamily: SANS, fontSize: 24, color: T.muted }}>{label}</span>
    <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: color || T.text, fontVariantNumeric: "tabular-nums" }}>{value}</span>
  </div>
);

export const PickDetailScene: React.FC<PickProps> = ({
  dur, tk = "", theme = "", cap = "", conv = "", month = 1, line = "", color = A.main,
  fa, ta, sc, cat = "", bear = "", plan,
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const F = fa!, TAd = ta!, S = sc!, PL = plan!;
  // 52-week position marker (0..1)
  const pos = Math.max(0, Math.min(1, TAd.pos52 / 100));
  const scoreRows: [string, number, string][] = [
    ["Quality", S.q, A.fund], ["Trend", S.t, A.tech], ["Valuation", S.v, A.val], ["Risk-adj", S.c, A.risk],
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={color} />
      <FQHead kicker={`PICK ${month} · ${theme.toUpperCase()}`} title={`${tk} — ${line}`} color={color} p={p} />
      {/* conviction + cap chip, top-right under header */}
      <div style={{ position: "absolute", left: 1470, top: 118, display: "flex", gap: 10, opacity: p(0.04, 0.12) }}>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: T.bg0, background: color, borderRadius: 7, padding: "5px 12px" }}>{conv.toUpperCase()} CONVICTION</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: color, border: `2px solid ${color}`, borderRadius: 7, padding: "3px 12px" }}>{cap.toUpperCase()}-CAP</span>
      </div>

      {/* ---- Column A: Fundamentals ---- */}
      <div style={{ position: "absolute", left: 100, top: 200, width: 520, height: 430, borderRadius: 20, background: mix(T.panel, A.fund, 0.07), border: `2px solid ${mix(T.line, A.fund, 0.5)}`, padding: "22px 28px", boxSizing: "border-box", opacity: p(0.08, 0.18) }}>
        <DefBadge text="Fundamentals" color={A.fund} o={p(0.1, 0.16)} />
        <div style={{ position: "relative", marginTop: 22 }}>
          <Row y={0} label="P / E" value={`${F.pe}×`} o={p(0.14, 0.2)} />
          <Row y={58} label="P / B" value={`${F.pb}×`} o={p(0.17, 0.23)} />
          <Row y={116} label="Return on equity" value={`${F.roe}%`} color={A.fund} o={p(0.2, 0.26)} />
          <Row y={174} label="Return on capital" value={`${F.roce}%`} color={A.fund} o={p(0.23, 0.29)} />
          <Row y={232} label="Debt / equity" value={`${F.de}`} color={F.de <= 0.2 ? A.fund : T.text} o={p(0.26, 0.32)} />
          <Row y={290} label="Promoter holding" value={`${F.prom}%`} o={p(0.29, 0.35)} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 596, fontFamily: MONO, fontSize: 20, color: F.valflag === "Cheap" ? A.fund : F.valflag === "Expensive" ? A.risk : T.muted, opacity: p(0.32, 0.4) }}>VALUATION: {F.valflag.toUpperCase()}</div>

      {/* ---- Column B: Technicals ---- */}
      <div style={{ position: "absolute", left: 690, top: 200, width: 500, height: 430, borderRadius: 20, background: mix(T.panel, A.tech, 0.07), border: `2px solid ${mix(T.line, A.tech, 0.5)}`, padding: "22px 28px", boxSizing: "border-box", opacity: p(0.18, 0.28) }}>
        <DefBadge text="Technicals" color={A.tech} o={p(0.2, 0.26)} />
        <div style={{ position: "relative", marginTop: 22 }}>
          <Row y={0} label="Price" value={inr(TAd.ltp)} o={p(0.24, 0.3)} />
          <Row y={54} label="vs 200-DMA" value={`+${TAd.d200}%`} color={TAd.d200 >= 0 ? A.fund : A.risk} o={p(0.27, 0.33)} />
          <Row y={112} label="RSI" value={`${TAd.rsi}`} color={TAd.rsi > 70 ? A.risk : TAd.rsi < 30 ? A.fund : A.tech} o={p(0.3, 0.36)} />
          <Row y={170} label="Beta (vs Nifty)" value={`${TAd.beta}`} o={p(0.33, 0.39)} />
          <Row y={228} label="Max drawdown" value={`${TAd.mdd}%`} color={A.risk} o={p(0.36, 0.42)} />
        </div>
        {/* 52-week position bar */}
        <div style={{ position: "absolute", left: 28, right: 28, top: 356 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 18, color: T.muted, opacity: p(0.4, 0.46) }}>
            <span>{inr(TAd.lo52)}</span><span>52-WEEK RANGE</span><span>{inr(TAd.hi52)}</span>
          </div>
          <div style={{ position: "relative", height: 12, borderRadius: 8, background: mix(T.panel, A.tech, 0.12), marginTop: 8, opacity: p(0.4, 0.46) }}>
            <div style={{ position: "absolute", left: `${pos * 100}%`, top: -6, width: 6, height: 24, borderRadius: 3, background: A.tech, boxShadow: `0 0 12px ${A.tech}`, transform: "translateX(-3px)" }} />
          </div>
        </div>
      </div>

      {/* ---- Column C: Score ---- */}
      <div style={{ position: "absolute", left: 1260, top: 200, width: 560, height: 430, borderRadius: 20, background: mix(T.panel, color, 0.09), border: `2.5px solid ${color}`, padding: "22px 28px", boxSizing: "border-box", opacity: p(0.28, 0.38), boxShadow: `0 0 50px ${mix(T.bg0, color, 0.18 + Math.sin(frame * 0.05) * 0.05)}` }}>
        <DefBadge text="The Score" color={color} o={p(0.3, 0.36)} />
        <div style={{ position: "relative", marginTop: 20 }}>
          {scoreRows.map(([lab, val, c], i) => {
            const at = 0.34 + i * 0.05;
            const grow = p(at, at + 0.1);
            return (
              <div key={i} style={{ position: "absolute", top: i * 52, left: 0, right: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 21, color: T.text, opacity: p(at - 0.02, at) }}>
                  <span>{lab}</span><span style={{ fontFamily: MONO, fontWeight: 800, color: c }}>{Math.round(val * grow)}</span>
                </div>
                <div style={{ height: 10, borderRadius: 6, background: mix(T.panel, c as string, 0.12), marginTop: 5 }}>
                  <div style={{ height: "100%", width: `${val * grow}%`, borderRadius: 6, background: c as string, boxShadow: `0 0 10px ${c}` }} />
                </div>
              </div>
            );
          })}
        </div>
        {/* composite */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 2, textTransform: "uppercase", color: T.muted, opacity: p(0.56, 0.64) }}>Composite</div>
          <div style={{ marginTop: -6 }}><Counter p={p(0.58, 0.72)} to={S.comp} color={color} size={82} /></div>
        </div>
      </div>

      {/* ---- Buy-plan strip ---- */}
      <div style={{ position: "absolute", left: 100, top: 654, width: 1720, height: 54, borderRadius: 12, background: mix(T.panel, A.main, 0.08), border: `1.5px solid ${mix(T.line, A.main, 0.5)}`, display: "flex", alignItems: "center", gap: 26, padding: "0 26px", boxSizing: "border-box", opacity: p(0.66, 0.74) }}>
        {[
          ["BUY", `${inr(PL.leg1)} · ${inr(PL.leg2)}`, A.tech],
          ["AVG", inr(PL.avg), T.text],
          ["STOP", `${inr(PL.stop)} (${PL.stopPct}%)`, A.risk],
          ["TARGET (52w hi)", `${inr(PL.tgt)} (+${PL.tgtPct}%)`, A.fund],
        ].map(([lab, val, c], i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 1, color: T.muted }}>{lab}</span>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 23, color: c as string, fontVariantNumeric: "tabular-nums" }}>{val}</span>
          </div>
        ))}
      </div>

      {/* ---- Bull / Bear cards ---- */}
      <div style={{ position: "absolute", left: 100, top: 724, width: 845, height: 140, borderRadius: 14, background: mix(T.panel, A.fund, 0.08), borderLeft: `4px solid ${A.fund}`, border: `1.5px solid ${mix(T.line, A.fund, 0.4)}`, padding: "16px 22px", boxSizing: "border-box", opacity: p(0.74, 0.82) }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: 1, color: A.fund }}>▲ THE BULL CASE</div>
        <div style={{ fontFamily: SANS, fontSize: 21, color: T.text, marginTop: 8, lineHeight: 1.3 }}>{cat}</div>
      </div>
      <div style={{ position: "absolute", left: 975, top: 724, width: 845, height: 140, borderRadius: 14, background: mix(T.panel, A.risk, 0.08), borderLeft: `4px solid ${A.risk}`, border: `1.5px solid ${mix(T.line, A.risk, 0.4)}`, padding: "16px 22px", boxSizing: "border-box", opacity: p(0.8, 0.88) }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: 1, color: A.risk }}>▼ THE BEAR CASE</div>
        <div style={{ fontFamily: SANS, fontSize: 21, color: T.text, marginTop: 8, lineHeight: 1.3 }}>{bear}</div>
      </div>
    </Stage>
  );
};
