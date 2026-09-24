// EDITORIAL — the 8 generic, prop-driven archetypes (see core.tsx for props). Magazine layouts:
// masked serif headlines, numbered serif lists, rules, FT-style charts, pull quotes.
import React from "react";
import { useCurrentFrame } from "remotion";
import { evolvePath } from "@remotion/paths";
import { line as d3line, curveMonotoneX } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { useP } from "../../lib/primitives";
import { SceneProps, spreadAts, TitleProps, DividerProps, StatementProps, ListProps, FlowProps, ChartProps, VersusProps, RecapProps, StylePack } from "../core";
import { C, DISPLAY, BODY, LABEL, Kicker, MaskLine, easeOut, Rule } from "./editorial";

type P<T> = SceneProps & T;
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const drift = (p: (a: number, b: number) => number) => ({ transform: `scale(${1 + p(0, 1) * 0.02})`, transformOrigin: "40% 50%" });

const Title: React.FC<P<TitleProps>> = ({ dur, kicker, title, subtitle }) => {
  const p = useP(dur);
  const lines = title.split("\n");
  return (
    <div style={{ position: "absolute", inset: 0, ...drift(p) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center" }}>
        {kicker && <Kicker text={kicker} o={p(0, 0.08)} />}
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 138, lineHeight: 1.02, color: C.ink, letterSpacing: -3, marginTop: 26 }}>
          {lines.map((l, i) => <MaskLine key={i} p={p(0.04 + i * 0.1, 0.16 + i * 0.1)} style={i === lines.length - 1 && lines.length > 1 ? { fontStyle: "italic", color: C.ox } : {}}>{l}</MaskLine>)}
        </div>
      </div>
      <Rule x={760} y={640} w={400} p={p(0.25, 0.45)} h={3} color={C.ox} />
      {subtitle && <div style={{ position: "absolute", left: 0, right: 0, top: 676, textAlign: "center", fontFamily: BODY, fontStyle: "italic", fontSize: 40, color: C.sub, opacity: p(0.3, 0.45) }}>{subtitle}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 770, textAlign: "center", fontFamily: LABEL, fontSize: 19, letterSpacing: 4, color: C.sub, opacity: p(0.4, 0.55) }}>AN EXPLAINER · READ IT, THEN WATCH IT AGAIN</div>
    </div>
  );
};

const Divider: React.FC<P<DividerProps>> = ({ dur, n, total, title, sub }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: DISPLAY, fontStyle: "italic", fontSize: 250, color: C.ox, opacity: 0.9 * p(0, 0.15), lineHeight: 1 }}>{ROMAN[n] || n}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 104, color: C.ink, letterSpacing: -2 }}>
        <MaskLine p={p(0.1, 0.3)}>{title}</MaskLine>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, opacity: p(0.25, 0.4) }}>
        <div style={{ width: 160, height: 1, background: C.ink }} />
        <span style={{ fontSize: 34, color: C.ox, display: "inline-block", transform: `rotate(${Math.sin(frame * 0.03) * 8}deg)` }}>❦</span>
        <div style={{ width: 160, height: 1, background: C.ink }} />
      </div>
      {sub && <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", fontFamily: BODY, fontStyle: "italic", fontSize: 38, color: C.sub, opacity: p(0.3, 0.45) }}>{sub}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontFamily: LABEL, fontSize: 19, letterSpacing: 5, color: C.sub, opacity: p(0.35, 0.5) }}>PART {n} OF {total}</div>
    </>
  );
};

const Statement: React.FC<P<StatementProps>> = ({ dur, kicker, lines, accent = -1, big, sub, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const at = spreadAts(lines.length, 0.04, 0.4, ats);
  const w = big ? 1050 : 1500;
  return (
    <div style={{ position: "absolute", inset: 0, ...drift(p) }}>
      <div style={{ position: "absolute", left: 150, top: 200 }}>{kicker && <Kicker text={kicker} o={p(0, 0.06)} />}</div>
      <div style={{ position: "absolute", left: 140, top: 250, width: w, fontFamily: DISPLAY, fontWeight: 800, fontSize: big ? 104 : 120, lineHeight: 1.05, color: C.ink, letterSpacing: -2 }}>
        {lines.map((l, i) => <MaskLine key={i} p={p(at[i], at[i] + 0.1)} style={i === accent ? { fontStyle: "italic", color: C.ox } : {}}>{l}</MaskLine>)}
      </div>
      {big && (
        <div style={{ position: "absolute", left: 1220, top: 270, width: 600, textAlign: "center", opacity: p(0.3, 0.42) }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: Math.min(170, Math.floor(1100 / big.length)), whiteSpace: "nowrap", lineHeight: 1.05, color: "transparent", WebkitTextStroke: `3px ${C.ox}`, transform: `scale(${1 + Math.sin(frame * 0.05) * 0.012})` }}>{big}</div>
        </div>
      )}
      <Rule x={150} y={700} w={1620} p={p(0.45, 0.55)} h={1} color={C.rule} />
      {sub && <div style={{ position: "absolute", left: 150, top: 728, width: 1500, fontFamily: BODY, fontStyle: "italic", fontSize: 40, color: C.sub, opacity: p(0.5, 0.62) }}>{sub}</div>}
    </div>
  );
};

const List: React.FC<P<ListProps>> = ({ dur, kicker, title, items, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const at = spreadAts(items.length, 0.1, 0.72, ats);
  const n = items.length;
  const rowH = Math.min(128, Math.floor(620 / n));
  let cur = -1;
  at.forEach((a, i) => { if (p(a, a + 0.01) > 0.5) cur = i; });
  const done = p(0.85, 0.86) > 0.5;
  const hot = done ? Math.floor(frame / 40) % n : cur;
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 150 }}>{kicker && <Kicker text={kicker} o={p(0, 0.05)} />}</div>
      <div style={{ position: "absolute", left: 150, top: 190, fontFamily: DISPLAY, fontWeight: 800, fontSize: 66, color: C.ink, opacity: p(0, 0.06) }}>{title}</div>
      {items.map((it, i) => {
        const o = p(at[i], at[i] + 0.06);
        return (
          <div key={i} style={{ position: "absolute", left: 150, top: 300 + i * rowH, width: 1620, height: rowH - 10, display: "flex", alignItems: "center", gap: 36, opacity: o, transform: `translateY(${(1 - easeOut(o)) * 24}px)`, borderBottom: `1px dotted ${C.rule}` }}>
            <div style={{ width: 8, alignSelf: "stretch", margin: "14px 0", background: hot === i ? C.ox : "transparent" }} />
            <span style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 700, fontSize: 60, color: C.ox, width: 90 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, color: C.ink, width: 560 }}>{it.h}</span>
            {it.d && <span style={{ fontFamily: BODY, fontSize: 32, color: C.sub, flex: 1 }}>{it.d}</span>}
          </div>
        );
      })}
    </>
  );
};

const Flow: React.FC<P<FlowProps>> = ({ dur, kicker, title, steps, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const n = steps.length;
  const at = spreadAts(n, 0.1, 0.72, ats);
  const X0 = 220, X1 = 1700, Y = 470;
  const xs = steps.map((_, i) => X0 + ((X1 - X0) * i) / Math.max(1, n - 1));
  const railP = p(at[0], at[n - 1] + 0.06);
  const dot = X0 + ((frame * 4) % (X1 - X0));
  const colW = Math.min(320, (X1 - X0) / Math.max(1, n - 1) - 30);
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 150 }}>{kicker && <Kicker text={kicker} o={p(0, 0.05)} />}</div>
      <div style={{ position: "absolute", left: 150, top: 190, fontFamily: DISPLAY, fontWeight: 800, fontSize: 66, color: C.ink, opacity: p(0, 0.06) }}>{title}</div>
      <div style={{ position: "absolute", left: X0, top: Y, width: (X1 - X0) * easeOut(railP), height: 2, background: C.ink }} />
      {railP >= 1 && <div style={{ position: "absolute", left: dot - 7, top: Y - 6, width: 14, height: 14, borderRadius: 7, background: C.ox }} />}
      {steps.map((s, i) => {
        const o = p(at[i], at[i] + 0.06);
        return (
          <div key={i} style={{ opacity: o }}>
            <div style={{ position: "absolute", left: xs[i] - 44, top: Y - 44, width: 88, height: 88, borderRadius: 44, background: C.paper, border: `3px solid ${C.ox}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 700, fontSize: 44, color: C.ox }}>{i + 1}</div>
            <div style={{ position: "absolute", left: xs[i] - colW / 2, top: Y + 70, width: colW, textAlign: "center" }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 36, color: C.ink, lineHeight: 1.15 }}>{s.h}</div>
              {s.d && <div style={{ fontFamily: BODY, fontStyle: "italic", fontSize: 26, color: C.sub, marginTop: 10, lineHeight: 1.3 }}>{s.d}</div>}
            </div>
          </div>
        );
      })}
    </>
  );
};

const Chart: React.FC<P<ChartProps>> = ({ dur, kicker, title, type, unit = "", note, points = [], bars = [], marks = [], ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const X0 = 240, X1 = 1640, Y0 = 790, Y1 = 330;
  const head = (
    <>
      <div style={{ position: "absolute", left: 120, top: 150, width: 1680, height: 740, background: C.salmon, border: `1px solid ${C.rule}`, opacity: p(0, 0.05) }} />
      <div style={{ position: "absolute", left: 160, top: 172 }}>{kicker && <Kicker text={kicker} o={p(0, 0.05)} />}</div>
      <div style={{ position: "absolute", left: 160, top: 208, fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, color: C.ink, opacity: p(0, 0.06) }}>{title}</div>
      {note && <div style={{ position: "absolute", left: 160, top: 848, fontFamily: LABEL, fontSize: 19, color: C.sub, opacity: p(0.1, 0.2) }}>{note}</div>}
    </>
  );
  if (type === "bar") {
    const at = spreadAts(bars.length, 0.12, 0.7, ats);
    const max = Math.max(...bars.map((b) => b.value), 1);
    const rowH = Math.min(110, 460 / Math.max(1, bars.length));
    return (
      <>
        {head}
        {bars.map((b, i) => {
          const o = p(at[i], at[i] + 0.08);
          const w = (b.value / max) * 1050 * easeOut(o);
          return (
            <div key={i} style={{ position: "absolute", left: 160, top: 320 + i * rowH, opacity: Math.max(0.15, o) }}>
              <div style={{ position: "absolute", width: 300, fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: C.ink, top: rowH * 0.25 }}>{b.label}</div>
              <div style={{ position: "absolute", left: 320, top: rowH * 0.2, height: rowH * 0.55, width: w, background: i % 2 ? C.green : C.ox }} />
              <div style={{ position: "absolute", left: 340 + w, top: rowH * 0.18, fontFamily: DISPLAY, fontStyle: "italic", fontSize: 40, color: C.ink, whiteSpace: "nowrap", opacity: o }}>{b.value.toLocaleString("en-IN")}{unit}</div>
            </div>
          );
        })}
      </>
    );
  }
  const xmin = Math.min(...points.map((q) => q.x)), xmax = Math.max(...points.map((q) => q.x));
  const ymax = Math.max(...points.map((q) => q.y)) * 1.1;
  const x = scaleLinear().domain([xmin, xmax]).range([X0, X1]);
  const y = scaleLinear().domain([0, ymax]).range([Y0, Y1]);
  const d = d3line<{ x: number; y: number }>().x((q) => x(q.x)).y((q) => y(q.y)).curve(curveMonotoneX)(points) || "";
  const draw = p(0.1, 0.7);
  const ev = evolvePath(draw, d);
  const ticks = y.ticks(4);
  const mAt = spreadAts(marks.length, 0.35, 0.75, marks.map((m) => m.at ?? NaN).map((v) => (isNaN(v) ? undefined : v)) as number[]);
  const yAt = (xv: number) => points.reduce((best, q) => (Math.abs(q.x - xv) < Math.abs(best.x - xv) ? q : best), points[0]).y;
  const tDot = xmin + ((frame * 0.004) % 1) * (xmax - xmin);
  return (
    <>
      {head}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {ticks.map((v) => (
          <g key={v} opacity={p(0.03, 0.1)}>
            <line x1={X0} x2={X1} y1={y(v)} y2={y(v)} stroke={C.rule} strokeWidth={1} />
            <text x={X0 - 16} y={y(v) + 7} textAnchor="end" fontFamily={LABEL} fontSize={20} fill={C.sub}>{v}{unit}</text>
          </g>
        ))}
        {x.ticks(6).map((v) => <text key={v} x={x(v)} y={Y0 + 32} textAnchor="middle" fontFamily={LABEL} fontSize={20} fill={C.sub} opacity={p(0.03, 0.1)}>{v}</text>)}
        <path d={d} stroke={C.ox} strokeWidth={5} fill="none" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
        {marks.map((m, i) => {
          const o = p(mAt[i], mAt[i] + 0.05);
          const yy = y(yAt(m.x));
          return (
            <g key={i} opacity={o}>
              <line x1={x(m.x)} x2={x(m.x)} y1={Y0} y2={yy} stroke={C.ink} strokeDasharray="4 6" strokeWidth={1.5} />
              <circle cx={x(m.x)} cy={yy} r={9} fill={C.paper} stroke={C.ox} strokeWidth={4} />
              <text x={x(m.x) - 16} y={yy - 20} textAnchor="end" fontFamily={DISPLAY} fontStyle="italic" fontWeight={700} fontSize={32} fill={C.ink}>{m.label}</text>
            </g>
          );
        })}
        {draw >= 1 && <circle cx={x(tDot)} cy={y(points.reduce((b, q) => (Math.abs(q.x - tDot) < Math.abs(b.x - tDot) ? q : b), points[0]).y)} r={7} fill={C.ox} opacity={0.6} />}
      </svg>
    </>
  );
};

const Versus: React.FC<P<VersusProps>> = ({ dur, kicker, title, left, right, winner }) => {
  const p = useP(dur);
  const col = (side: { h: string; items: string[] }, x: number, a: number, win: boolean) => (
    <div style={{ position: "absolute", left: x, top: 320, width: 720 }}>
      <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 700, fontSize: 60, color: win ? C.ox : C.ink, opacity: p(a, a + 0.06) }}>{side.h}</div>
      <Rule x={0} y={86} w={720} p={p(a + 0.03, a + 0.12)} h={2} color={win ? C.ox : C.ink} />
      {side.items.map((it, i) => (
        <div key={i} style={{ position: "absolute", top: 120 + i * 92, width: 720, fontFamily: BODY, fontSize: 34, color: C.ink, opacity: p(a + 0.06 + i * 0.05, a + 0.1 + i * 0.05) }}>— {it}</div>
      ))}
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 150 }}>{kicker && <Kicker text={kicker} o={p(0, 0.05)} />}</div>
      <div style={{ position: "absolute", left: 150, top: 190, fontFamily: DISPLAY, fontWeight: 800, fontSize: 66, color: C.ink, opacity: p(0, 0.06) }}>{title}</div>
      {col(left, 150, 0.08, winner === "left")}
      <div style={{ position: "absolute", left: 959, top: 320, width: 1, height: 520 * easeOut(p(0.3, 0.45)), background: C.rule }} />
      <div style={{ position: "absolute", left: 910, top: 540, width: 100, textAlign: "center", fontFamily: LABEL, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: C.sub, background: C.paper, opacity: p(0.3, 0.4) }}>VS</div>
      {col(right, 1050, 0.4, winner === "right")}
    </>
  );
};

const Recap: React.FC<P<RecapProps>> = ({ dur, title, items, closer, ats }) => {
  const p = useP(dur);
  const at = spreadAts(items.length, 0.06, 0.7, ats);
  return (
    <>
      <div style={{ position: "absolute", left: 360, top: 150, width: 1200, height: 740, border: `2px solid ${C.ink}`, background: "#FFFDF8", opacity: p(0, 0.05) }} />
      <div style={{ position: "absolute", left: 360, top: 176, width: 1200, textAlign: "center" }}><Kicker text="In brief" o={p(0, 0.05)} /></div>
      <div style={{ position: "absolute", left: 360, top: 212, width: 1200, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 60, color: C.ink, opacity: p(0, 0.06) }}>{title}</div>
      {items.map((it, i) => (
        <div key={i} style={{ position: "absolute", left: 430, top: 320 + i * Math.min(78, 420 / Math.max(1, items.length)), width: 1060, display: "flex", gap: 22, fontFamily: BODY, fontSize: 32, color: C.ink, opacity: p(at[i], at[i] + 0.05) }}>
          <span style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 700, color: C.ox, width: 40 }}>{i + 1}.</span><span>{it}</span>
        </div>
      ))}
      {closer && <div style={{ position: "absolute", left: 360, top: 790, width: 1200, textAlign: "center", fontFamily: DISPLAY, fontStyle: "italic", fontSize: 42, color: C.ox, opacity: p(0.78, 0.88) }}>{closer}</div>}
    </>
  );
};

export const editorialGeneric: StylePack["scenes"] = {
  title: Title as any, divider: Divider as any, statement: Statement as any, list: List as any,
  flow: Flow as any, chart: Chart as any, versus: Versus as any, recap: Recap as any,
};
