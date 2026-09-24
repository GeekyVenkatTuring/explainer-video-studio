// KINETIC — the 8 generic, prop-driven archetypes. Type IS the image: giant Anton slams, colour
// blocks, split screens, stripe bands. Ink colour is derived from each beat's field (fg/hi helpers).
import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { evolvePath } from "@remotion/paths";
import { scaleLinear } from "d3-scale";
import { useP } from "../../lib/primitives";
import { SceneProps, spreadAts, TitleProps, DividerProps, StatementProps, ListProps, FlowProps, ChartProps, VersusProps, RecapProps, StylePack } from "../core";
import { C, DISPLAY, BODY, Slam, Stripes, Floater, fieldFor, fg, hi } from "./kinetic";

type P<T> = SceneProps & T;
const useInk = (kind: Parameters<typeof fieldFor>[0], beat: number) => { const bg = fieldFor(kind, beat); return { bg, ink: fg(bg), acc: hi(bg) }; };
const useSpring = (dur: number, at: number) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(at * dur * fps), fps, config: { damping: 12, stiffness: 150 } });
};
const Small: React.FC<{ x: number; y: number; o: number; color: string; children: React.ReactNode; w?: number }> = ({ x, y, o, color, children, w = 1600 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: BODY, fontWeight: 800, fontSize: 30, letterSpacing: 5, textTransform: "uppercase", color, opacity: o }}>{children}</div>
);

const Title: React.FC<P<TitleProps>> = ({ dur, beat, kicker, title, subtitle }) => {
  const p = useP(dur);
  const { ink, acc } = useInk("title", beat);
  const lines = title.split("\n");
  const size = lines.length > 1 ? 250 : 300;
  return (
    <>
      <Floater kind="circle" x={1720} y={200} r={130} color={ink} seed={1} stroke />
      <Floater kind="star" x={230} y={880} r={100} color={acc} seed={2} />
      {kicker && <Small x={130} y={170} o={p(0, 0.06)} color={ink}>{kicker}</Small>}
      {lines.map((l, i) => <Slam key={i} dur={dur} at={0.03 + i * 0.1} x={120} y={240 + i * size * 0.95} size={size} color={i === lines.length - 1 ? acc : ink} from={i % 2 ? "right" : "left"}>{l}</Slam>)}
      {subtitle && <Stripes y={800} h={110} color={ink} o={p(0.3, 0.36)} text={subtitle.toUpperCase()} textColor={acc} />}
    </>
  );
};

const Divider: React.FC<P<DividerProps>> = ({ dur, beat, n, total, title, sub }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const { ink, acc } = useInk("divider", beat);
  return (
    <>
      <div style={{ position: "absolute", right: -40, top: -120, fontFamily: DISPLAY, fontSize: 1000, lineHeight: 1, color: acc, opacity: 0.4 * p(0, 0.08), transform: `translateX(${Math.sin(frame * 0.02) * 20}px)` }}>{String(n).padStart(2, "0")}</div>
      <Small x={130} y={380} o={p(0.04, 0.1)} color={ink}>PART {n} / {total}</Small>
      <Slam dur={dur} at={0.08} x={120} y={440} size={200} color={ink} from="scale">{title}</Slam>
      {sub && <Small x={130} y={700} o={p(0.3, 0.4)} color={ink} w={1200}>{sub}</Small>}
    </>
  );
};

const Statement: React.FC<P<StatementProps>> = ({ dur, beat, kicker, lines, accent = -1, big, sub, ats }) => {
  const p = useP(dur);
  const { ink, acc } = useInk("statement", beat);
  const at = spreadAts(lines.length, 0.03, 0.4, ats);
  const size = lines.length > 3 ? 130 : 170;
  return (
    <>
      {kicker && <Small x={130} y={130} o={p(0, 0.05)} color={ink}>{kicker}</Small>}
      {lines.map((l, i) => (
        <React.Fragment key={i}>
          {i === accent && <div style={{ position: "absolute", left: 110, top: 190 + i * size * 1.02 + 6, width: 1100 * p(at[i], at[i] + 0.05), height: size * 0.95, background: acc }} />}
          <Slam dur={dur} at={at[i]} x={130} y={190 + i * size * 1.02} size={size} color={i === accent ? fg(acc) : ink} w={1700}>{l}</Slam>
        </React.Fragment>
      ))}
      {big && <Slam dur={dur} at={0.34} x={130} y={200 + lines.length * size * 1.02 + 30} size={Math.min(200, Math.floor(2600 / big.length))} color={acc} from="scale" w={1700} rot={-4}>{big}</Slam>}
      {sub && <Small x={130} y={800} o={p(0.5, 0.6)} color={ink}>{sub}</Small>}
    </>
  );
};

const List: React.FC<P<ListProps>> = ({ dur, beat, kicker, title, items, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const { ink, acc } = useInk("list", beat);
  const at = spreadAts(items.length, 0.1, 0.72, ats);
  const rowH = Math.min(128, Math.floor(620 / items.length));
  let cur = -1;
  at.forEach((a, i) => { if (p(a, a + 0.01) > 0.5) cur = i; });
  const hot = p(0.85, 0.86) > 0.5 ? Math.floor(frame / 30) % items.length : cur;
  return (
    <>
      {kicker && <Small x={130} y={110} o={p(0, 0.05)} color={ink}>{kicker}</Small>}
      <Slam dur={dur} at={0.0} x={120} y={150} size={110} color={ink}>{title}</Slam>
      {items.map((it, i) => {
        const s = useSpring(dur, at[i]);
        const on = hot === i;
        return (
          <div key={i} style={{ position: "absolute", left: 130, top: 290 + i * rowH, width: 1660, height: rowH - 14, display: "flex", alignItems: "center", gap: 30, opacity: s > 0.01 ? 1 : 0, transform: `translateX(${(1 - s) * -400}px)`, background: on ? ink : "transparent" }}>
            <div style={{ width: rowH - 14, height: rowH - 14, background: acc, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: rowH * 0.6, color: fg(acc) }}>{i + 1}</div>
            <span style={{ fontFamily: DISPLAY, fontSize: rowH * 0.62, color: on ? fieldFor("list", beat) : ink, textTransform: "uppercase" }}>{it.h}</span>
            {it.d && <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 26, color: on ? fieldFor("list", beat) : ink, opacity: 0.85 }}>{it.d}</span>}
          </div>
        );
      })}
    </>
  );
};

const Flow: React.FC<P<FlowProps>> = ({ dur, beat, kicker, title, steps, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const { ink, acc } = useInk("flow", beat);
  const n = steps.length;
  const at = spreadAts(n, 0.1, 0.72, ats);
  const W = Math.floor((1680 - (n - 1) * 60) / n);
  const hot = p(0.85, 0.86) > 0.5 ? Math.floor(frame / 24) % n : -1;
  return (
    <>
      {kicker && <Small x={130} y={110} o={p(0, 0.05)} color={ink}>{kicker}</Small>}
      <Slam dur={dur} at={0.0} x={120} y={150} size={110} color={ink}>{title}</Slam>
      {steps.map((s, i) => {
        const sp = useSpring(dur, at[i]);
        const x = 120 + i * (W + 60);
        const on = hot === i;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x, top: 340, width: W, height: 380, background: on ? acc : ink, transform: `translateY(${(1 - sp) * 500}px)`, opacity: sp > 0.01 ? 1 : 0, padding: "26px 24px", boxSizing: "border-box" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 110, lineHeight: 1, color: on ? fg(acc) : fieldFor("flow", beat) }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: W > 300 ? 56 : 44, lineHeight: 1, color: on ? fg(acc) : fieldFor("flow", beat), textTransform: "uppercase", marginTop: 18 }}>{s.h}</div>
              {s.d && <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, lineHeight: 1.3, color: on ? fg(acc) : fieldFor("flow", beat), marginTop: 14, opacity: 0.85 }}>{s.d}</div>}
            </div>
            {i < n - 1 && <div style={{ position: "absolute", left: x + W + 6, top: 500, fontFamily: DISPLAY, fontSize: 60, color: acc, opacity: p(at[i + 1], at[i + 1] + 0.03) }}>➜</div>}
          </React.Fragment>
        );
      })}
    </>
  );
};

const Chart: React.FC<P<ChartProps>> = ({ dur, beat, kicker, title, type, unit = "", note, points = [], bars = [], marks = [], ats }) => {
  const p = useP(dur);
  const { ink, acc } = useInk("chart", beat);
  const head = (
    <>
      {kicker && <Small x={130} y={110} o={p(0, 0.05)} color={ink}>{kicker}</Small>}
      <Slam dur={dur} at={0.0} x={120} y={150} size={100} color={ink}>{title}</Slam>
      {note && <Small x={130} y={880} o={p(0.1, 0.2)} color={ink}>{note}</Small>}
    </>
  );
  if (type === "bar") {
    const at = spreadAts(bars.length, 0.12, 0.7, ats);
    const max = Math.max(...bars.map((b) => b.value), 1);
    const n = bars.length, W = Math.min(280, 1500 / n - 40);
    return (
      <>
        {head}
        {bars.map((b, i) => {
          const s = useSpring(dur, at[i]);
          const h = (b.value / max) * 420 * s;
          const x = 160 + i * (W + 40);
          return (
            <div key={i} style={{ opacity: s > 0.01 ? 1 : 0 }}>
              <div style={{ position: "absolute", left: x, bottom: 250, width: W, height: h, background: i === n - 1 ? acc : ink }} />
              <div style={{ position: "absolute", left: x, bottom: 260 + h, width: W, textAlign: "center", fontFamily: DISPLAY, fontSize: 80, color: ink, lineHeight: 1 }}>{b.value.toLocaleString("en-IN")}{unit}</div>
              <div style={{ position: "absolute", left: x, bottom: 180, width: W, textAlign: "center", fontFamily: DISPLAY, fontSize: 48, color: ink }}>{b.label}</div>
            </div>
          );
        })}
      </>
    );
  }
  const X0 = 180, X1 = 1500, Y0 = 820, Y1 = 330;
  const xmin = Math.min(...points.map((q) => q.x)), xmax = Math.max(...points.map((q) => q.x));
  const ymax = Math.max(...points.map((q) => q.y));
  const x = scaleLinear().domain([xmin, xmax]).range([X0, X1]);
  const y = scaleLinear().domain([0, ymax]).range([Y0, Y1]);
  const d = "M" + points.map((q) => `${x(q.x)},${y(q.y)}`).join(" L");
  const draw = p(0.1, 0.7);
  const ev = evolvePath(draw, d);
  const last = points[points.length - 1];
  const mAt = spreadAts(marks.length, 0.35, 0.75, marks.map((m) => m.at) as number[]);
  return (
    <>
      {head}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={d} stroke={ink} strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" fill="none" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      </svg>
      {marks.map((m, i) => {
        const q = points.reduce((b, r) => (Math.abs(r.x - m.x) < Math.abs(b.x - m.x) ? r : b), points[0]);
        return <Slam key={i} dur={dur} at={mAt[i]} x={x(q.x) - 90} y={y(q.y) - 130} size={70} color={acc} w={400} from="scale">{m.label}</Slam>;
      })}
      <Slam dur={dur} at={0.72} x={X1 + 20} y={y(last.y) - 60} size={120} color={acc} w={400} from="scale">{last.y.toLocaleString("en-IN")}{unit}</Slam>
    </>
  );
};

const Versus: React.FC<P<VersusProps>> = ({ dur, kicker, title, left, right, winner }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const split = p(0.02, 0.1);
  const side = (s: { h: string; items: string[] }, x: number, ink: string, a: number, win: boolean) => (
    <>
      <Slam dur={dur} at={a} x={x} y={260} size={120} color={ink} w={760}>{s.h}{win ? " ✓" : ""}</Slam>
      {s.items.map((it, i) => <Slam key={i} dur={dur} at={a + 0.08 + i * 0.06} x={x} y={430 + i * 110} size={60} color={ink} w={760} from={x < 900 ? "left" : "right"}>{it}</Slam>)}
    </>
  );
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 960 * split, height: 1080, background: C.black }} />
      <div style={{ position: "absolute", right: 0, top: 0, width: 960 * split, height: 1080, background: C.yellow }} />
      {kicker && <Small x={0} y={96} o={p(0, 0.05)} color={C.pink} w={1920}><div style={{ textAlign: "center" }}>{kicker}</div></Small>}
      <Slam dur={dur} at={0.02} x={0} y={146} size={70} color={C.pink} w={1920} align="center">{title}</Slam>
      {side(left, 100, C.white, 0.08, winner === "left")}
      {side(right, 1060, C.black, 0.4, winner === "right")}
      <div style={{ position: "absolute", left: 875, top: 455, width: 170, height: 170, borderRadius: 85, border: `8px dashed ${C.pink}`, boxSizing: "border-box", transform: `rotate(${frame * 1.2}deg) scale(${p(0.3, 0.38)})` }} />
      <div style={{ position: "absolute", left: 890, top: 470, width: 140, height: 140, borderRadius: 70, background: C.pink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: 64, color: C.white, transform: `scale(${p(0.3, 0.38) * (1 + Math.sin(frame * 0.15) * 0.05)})` }}>VS</div>
    </>
  );
};

const Recap: React.FC<P<RecapProps>> = ({ dur, beat, title, items, closer, ats }) => {
  const p = useP(dur);
  const { ink, acc } = useInk("recap", beat);
  const at = spreadAts(items.length, 0.06, 0.7, ats);
  const rowH = Math.min(84, 560 / Math.max(1, items.length));
  return (
    <>
      <Slam dur={dur} at={0.0} x={120} y={110} size={110} color={ink}>{title}</Slam>
      {items.map((it, i) => {
        const s = useSpring(dur, at[i]);
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: 260 + i * rowH, width: 1920, height: rowH - 10, background: i % 2 ? ink : acc, transform: `translateX(${(1 - s) * (i % 2 ? 1920 : -1920)}px)`, display: "flex", alignItems: "center", paddingLeft: 130, boxSizing: "border-box", fontFamily: DISPLAY, fontSize: rowH * 0.62, color: i % 2 ? fieldFor("recap", beat) : fg(acc), textTransform: "uppercase" }}>
            {i + 1}. {it}
          </div>
        );
      })}
      {closer && <Slam dur={dur} at={0.8} x={0} y={260 + items.length * rowH + 20} size={90} color={acc} w={1920} align="center" from="scale">{closer}</Slam>}
    </>
  );
};

export const kineticGeneric: StylePack["scenes"] = {
  title: Title as any, divider: Divider as any, statement: Statement as any, list: List as any,
  flow: Flow as any, chart: Chart as any, versus: Versus as any, recap: Recap as any,
};
