import React from "react";
import { Card, Flow, Stage } from "../../lib/primitives";
import { A, Chip, DefBadge, GTHead, mix, MONO, RSIPanel, SANS, SceneProgress, T, TAPE, useP, Verdict } from "./kit";

/** RSI is computed from the shared deterministic close tape, not illustrated as a static dial. */
export const RSIScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  const bands = [
    { value: "70+", label: "OVERBOUGHT", color: A.stop, at: 0.55 },
    { value: "45–65", label: "HEALTHY", color: A.buy, at: 0.63 },
    { value: "30−", label: "OVERSOLD", color: A.trig, at: 0.71 },
  ];
  return (
    <Stage>
      <SceneProgress p={p} color={A.trig} />
      <GTHead kicker="ANCHORS · MOMENTUM" title="RSI: has the move gone too far?" color={A.trig} p={p} />
      <Card theme={T} x={110} y={185} w={720} h={120} color={A.trig} o={p(0.08, 0.18)} pad="18px 22px">
        <DefBadge text="DEFINITION" color={A.trig} o={p(0.1, 0.16)} />
        <div style={{ width: 650, marginTop: 11, fontFamily: SANS, fontSize: 26, lineHeight: 1.3, color: T.text }}>
          Momentum on a 0–100 scale — recent gains vs recent losses.
        </div>
      </Card>
      <Card theme={T} x={870} y={185} w={840} h={120} color={A.trig} o={p(0.2, 0.3)} pad="32px 24px">
        <div style={{ width: 790, fontFamily: MONO, fontSize: 26, fontWeight: 800, color: T.text }}>
          <span style={{ color: A.trig }}>RSI</span> = 100 − 100 ÷ (1 + avg gain ÷ avg loss)
        </div>
      </Card>
      <RSIPanel x={140} y={340} w={1120} h={300} closes={TAPE} reveal={p(0.3, 0.8)} title="COMPUTED TAPE · RSI(14)" />
      <div style={{ position: "absolute", left: 1330, top: 360, width: 420, display: "flex", flexDirection: "column", gap: 18 }}>
        {bands.map((band) => (
          <Chip key={band.label} label={band.label} value={band.value} color={band.color} hero={band.label === "HEALTHY"} o={p(band.at, band.at + 0.09)} />
        ))}
      </div>
      <Flow x1={180} y1={690} x2={1190} y2={690} curve={-26} color={A.trig} n={10} speed={0.012} size={7} o={p(0.48, 0.62)} />
      <Verdict color={A.trig} o={p(0.82, 0.9)} text="RSI measures how far, not which way — near the top of its range, wait for a deeper leg." />
    </Stage>
  );
};

const PracticeMeter: React.FC<{ ticker: string; value: number; color: string; chip: string; at: number; p: (a: number, b: number) => number }> = ({ ticker, value, color, chip, at, p }) => {
  const o = p(at, at + 0.1);
  const marker = Math.min(value, value * p(at + 0.08, at + 0.28));
  return <div style={{ position: "absolute", left: 180, top: ticker === "HAL" ? 310 : 535, width: 1560, height: 160, opacity: o }}>
    <div style={{ position: "absolute", left: 0, top: 46, width: 150, fontFamily: MONO, fontWeight: 800, fontSize: 32, color }}>{ticker}</div>
    <div style={{ position: "absolute", left: 170, top: 58, width: 700, height: 26, borderRadius: 20, overflow: "hidden", background: T.bg2, border: `1.5px solid ${T.line}` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: "30%", height: "100%", background: mix(A.buy, T.bg0, 0.2) }} />
      <div style={{ position: "absolute", left: "45%", top: 0, width: "20%", height: "100%", background: mix(A.buy, T.bg0, 0.05), borderLeft: `1px solid ${A.buy}`, borderRight: `1px solid ${A.buy}` }} />
      <div style={{ position: "absolute", right: 0, top: 0, width: "30%", height: "100%", background: mix(A.stop, T.bg0, 0.2) }} />
      <div style={{ position: "absolute", left: `${marker}%`, top: -11, width: 48, height: 48, marginLeft: -24, borderRadius: 28, background: color, border: `5px solid ${T.bg0}`, boxShadow: `0 0 24px ${color}` }} />
    </div>
    <div style={{ position: "absolute", left: 170, top: 96, width: 700, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 19, color: T.muted }}><span>0</span><span>30</span><span>45–65 healthy</span><span>70</span><span>100</span></div>
    <div style={{ position: "absolute", left: 895, top: 46, width: 115, fontFamily: MONO, fontWeight: 800, fontSize: 36, color }}>{value}</div>
    <div style={{ position: "absolute", left: 1080, top: 34 }}><Chip label="RSI READ" value={chip} color={color} hero /></div>
  </div>;
};

export const RSIReadScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);
  return <Stage>
    <SceneProgress p={p} color={A.trig} />
    <GTHead kicker="ANCHORS · RSI IN PRACTICE" title="Same tool, opposite message" color={A.trig} p={p} />
    <div style={{ position: "absolute", left: 180, top: 225, width: 1320, fontFamily: SANS, fontSize: 29, color: T.text, opacity: p(0.08, 0.18) }}>
      RSI paces the entry. It does not choose the stock.
    </div>
    <PracticeMeter ticker="HAL" value={53} color={A.buy} chip="STEP IN — calm middle" at={0.2} p={p} />
    <PracticeMeter ticker="SYRMA" value={66} color={A.stop} chip="WAIT — stretched, near the top" at={0.5} p={p} />
    <Flow x1={240} y1={770} x2={1650} y2={770} curve={-18} color={A.trig} n={11} speed={0.011} size={7} o={p(0.62, 0.78)} />
    <Verdict color={A.trig} o={p(0.82, 0.9)} text="RSI doesn't pick the stock — it paces your entry." />
  </Stage>;
};
