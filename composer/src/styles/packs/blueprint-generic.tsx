// BLUEPRINT — the 8 generic, prop-driven archetypes. Drafting layouts: title blocks, section cuts,
// hand-drawn checklists, boxes-and-arrows flows, graph-paper charts, spec sheets. All strokes roughjs.
import React from "react";
import { useCurrentFrame } from "remotion";
import { scaleLinear } from "d3-scale";
import { useP } from "../../lib/primitives";
import { SceneProps, spreadAts, TitleProps, DividerProps, StatementProps, ListProps, FlowProps, ChartProps, VersusProps, RecapProps, StylePack } from "../core";
import { C, HAND, MONO, Sketch, Svg, Hand, Dim, Defs } from "./blueprint";

type P<T> = SceneProps & T;
const Label: React.FC<{ x: number; y: number; o: number; children: React.ReactNode; w?: number; color?: string; size?: number }> = ({ x, y, o, children, w = 800, color = C.faint, size = 22 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: MONO, fontSize: size, color, letterSpacing: 2, opacity: o }}>{children}</div>
);
const Head: React.FC<{ p: (a: number, b: number) => number; kicker?: string; title: string }> = ({ p, kicker, title }) => (
  <>
    {kicker && <Label x={110} y={120} o={p(0, 0.05)}>{kicker.toUpperCase()}</Label>}
    <Hand x={110} y={150} p={p(0, 0.12)} size={78} w={1300}>{title}</Hand>
  </>
);

const Title: React.FC<P<TitleProps>> = ({ dur, kicker, title, subtitle }) => {
  const p = useP(dur);
  const lines = title.split("\n");
  return (
    <>
      <Svg>
        <Defs />
        <Sketch s={{ k: "rect", a: [300, 300, 1320, 420] }} p={p(0.02, 0.16)} base={3} w={4} />
        <Sketch s={{ k: "line", a: [300, 380, 1620, 380] }} p={p(0.1, 0.18)} base={4} color={C.faint} />
        <Dim x1={300} y1={790} x2={1620} y2={790} p={p(0.3, 0.42)} label="" />
        <Dim x1={1680} y1={300} x2={1680} y2={720} p={p(0.36, 0.48)} label="depth" side={-1} />
      </Svg>
      <Label x={330} y={328} o={p(0.1, 0.18)} w={1260}>{(kicker || "DRAWING TITLE").toUpperCase()}</Label>
      {lines.map((l, i) => <Hand key={i} x={340} y={400 + i * 130} p={p(0.12 + i * 0.1, 0.3 + i * 0.1)} size={124} w={1260} color={i === lines.length - 1 && lines.length > 1 ? C.hi : C.ink}>{l}</Hand>)}
      {subtitle && <Label x={300} y={820} o={p(0.4, 0.52)} w={1320} color={C.ink} size={30}>{subtitle}</Label>}
    </>
  );
};

const Divider: React.FC<P<DividerProps>> = ({ dur, n, total, title, sub }) => {
  const p = useP(dur);
  const letter = String.fromCharCode(64 + n);
  return (
    <>
      <Svg>
        <Defs />
        <Sketch s={{ k: "line", a: [160, 540, 1760, 540] }} p={p(0, 0.2)} base={5} color={C.red} w={3} />
        <Sketch s={{ k: "circle", a: [960, 360, 230] }} p={p(0.05, 0.2)} base={6} w={4} />
        <Sketch s={{ k: "path", pts: [[200, 540], [200, 470], [236, 506]] }} p={p(0.15, 0.22)} base={7} color={C.red} />
        <Sketch s={{ k: "path", pts: [[1720, 540], [1720, 470], [1684, 506]] }} p={p(0.15, 0.22)} base={8} color={C.red} />
      </Svg>
      <div style={{ position: "absolute", left: 860, top: 285, width: 200, textAlign: "center", fontFamily: HAND, fontWeight: 700, fontSize: 130, color: C.hi, opacity: p(0.1, 0.2), lineHeight: 1 }}>{letter}</div>
      <Label x={270} y={496} o={p(0.12, 0.2)} color={C.red}>SECTION {letter}–{letter}</Label>
      <Hand x={160} y={590} p={p(0.18, 0.4)} size={110} w={1600}>{title}</Hand>
      {sub && <Label x={165} y={740} o={p(0.35, 0.48)} color={C.ink} size={28} w={1500}>{sub}</Label>}
      <Label x={165} y={800} o={p(0.4, 0.5)}>SECTION {n} OF {total}</Label>
    </>
  );
};

const Statement: React.FC<P<StatementProps>> = ({ dur, kicker, lines, accent = -1, big, sub, ats }) => {
  const p = useP(dur);
  const at = spreadAts(lines.length, 0.04, 0.4, ats);
  return (
    <>
      {kicker && <Label x={110} y={150} o={p(0, 0.05)}>{kicker.toUpperCase()}</Label>}
      {lines.map((l, i) => <Hand key={i} x={140} y={210 + i * 118} p={p(at[i], at[i] + 0.14)} size={104} w={big ? 1040 : 1600} color={i === accent ? C.hi : C.ink}>{l}</Hand>)}
      {big && (
        <>
          <Svg><Sketch s={{ k: "rect", a: [1230, 250, 560, 300] }} p={p(0.3, 0.42)} base={9} w={4} /></Svg>
          <Hand x={1255} y={400 - Math.min(120, Math.floor(1000 / big.length)) / 2} p={p(0.34, 0.5)} size={Math.min(120, Math.floor(1000 / big.length))} w={520} color={C.hi}>{big}</Hand>
        </>
      )}
      {sub && (
        <>
          <Svg><Defs /><Sketch s={{ k: "curve", pts: [[180, 620], [200, 700], [300, 740]] }} p={p(0.48, 0.56)} base={10} color={C.red} /></Svg>
          <Hand x={320} y={710} p={p(0.5, 0.66)} size={Math.min(58, Math.floor(2700 / Math.max(1, sub.length)))} w={1450} color={C.red}>{sub}</Hand>
        </>
      )}
    </>
  );
};

const List: React.FC<P<ListProps>> = ({ dur, kicker, title, items, ats }) => {
  const p = useP(dur);
  const at = spreadAts(items.length, 0.1, 0.72, ats);
  const rowH = Math.min(120, Math.floor(600 / items.length));
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        {items.map((_, i) => {
          const y = 290 + i * rowH;
          return (
            <g key={i}>
              <Sketch s={{ k: "rect", a: [140, y + 10, 56, 56] }} p={p(at[i], at[i] + 0.04)} base={20 + i} />
              <Sketch s={{ k: "path", pts: [[150, y + 38], [166, y + 58], [204, y]] }} p={p(at[i] + 0.04, at[i] + 0.08)} base={30 + i} color={C.hi} w={5} />
            </g>
          );
        })}
      </Svg>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <Hand x={240} y={284 + i * rowH} p={p(at[i], at[i] + 0.08)} size={62} w={700}>{it.h}</Hand>
          {it.d && <Label x={880} y={306 + i * rowH} o={p(at[i] + 0.03, at[i] + 0.08)} w={900} color={C.faint} size={24}>{it.d}</Label>}
        </React.Fragment>
      ))}
    </>
  );
};

const Flow: React.FC<P<FlowProps>> = ({ dur, kicker, title, steps, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const n = steps.length;
  const at = spreadAts(n, 0.1, 0.72, ats);
  const W = Math.min(280, Math.floor((1600 - (n - 1) * 60) / n));
  const gap = n > 1 ? (1600 - n * W) / (n - 1) : 0;
  const X = (i: number) => 160 + i * (W + gap);
  const Y = 380, H = 190;
  const lastDone = at[n - 1] + 0.08;
  const t = p(lastDone, lastDone + 0.01) > 0.5 ? (frame % 150) / 150 : -1;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        <Defs />
        {steps.map((_, i) => (
          <g key={i}>
            <Sketch s={{ k: "rect", a: [X(i), Y, W, H] }} p={p(at[i], at[i] + 0.06)} base={40 + i} w={3} />
            {i < n - 1 && <Sketch s={{ k: "path", pts: [[X(i) + W + 8, Y + H / 2], [X(i + 1) - 12, Y + H / 2]] }} p={p(at[i + 1] - 0.04, at[i + 1])} base={50 + i} color={C.hi} />}
            {i < n - 1 && <path d={`M${X(i + 1) - 26},${Y + H / 2 - 12} L${X(i + 1) - 10},${Y + H / 2} L${X(i + 1) - 26},${Y + H / 2 + 12}`} stroke={C.hi} strokeWidth={3} fill="none" opacity={p(at[i + 1], at[i + 1] + 0.02)} />}
          </g>
        ))}
      </Svg>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <Label x={X(i) + 14} y={Y + 12} o={p(at[i], at[i] + 0.06)} w={W - 20} color={C.faint} size={18}>STEP {String(i + 1).padStart(2, "0")}</Label>
          <div style={{ position: "absolute", left: X(i) + 12, top: Y + 44, width: W - 24, fontFamily: HAND, fontWeight: 700, fontSize: W > 240 ? 50 : 42, color: C.ink, lineHeight: 1.0, opacity: p(at[i] + 0.02, at[i] + 0.07) }}>{s.h}</div>
          {s.d && <div style={{ position: "absolute", left: X(i), top: Y + H + 26, width: W, fontFamily: MONO, fontSize: 21, color: C.faint, lineHeight: 1.4, opacity: p(at[i] + 0.04, at[i] + 0.09) }}>{s.d}</div>}
        </React.Fragment>
      ))}
      {t >= 0 && <div style={{ position: "absolute", left: X(0) + W / 2 + (X(n - 1) - X(0)) * t - 20, top: Y - 64, fontSize: 44 }}>✏️</div>}
    </>
  );
};

const Chart: React.FC<P<ChartProps>> = ({ dur, kicker, title, type, unit = "", note, points = [], bars = [], marks = [], ats }) => {
  const p = useP(dur);
  const X0 = 280, X1 = 1600, Y0 = 820, Y1 = 320;
  const common = (
    <>
      <Head p={p} kicker={kicker} title={title} />
      {note && <Label x={X0} y={880} o={p(0.1, 0.2)} w={1300} size={19}>{note}</Label>}
    </>
  );
  if (type === "bar") {
    const at = spreadAts(bars.length, 0.12, 0.7, ats);
    const max = Math.max(...bars.map((b) => b.value), 1);
    const n = bars.length, W = Math.min(200, 1100 / n), gap = (X1 - X0 - n * W) / Math.max(1, n);
    return (
      <>
        {common}
        <Svg>
          <Defs />
          <Sketch s={{ k: "line", a: [X0 - 30, Y0, X1 + 30, Y0] }} p={p(0, 0.08)} base={2} />
          {bars.map((b, i) => {
            const h = (b.value / max) * (Y0 - Y1);
            const x = X0 + gap / 2 + i * (W + gap);
            return (
              <g key={i}>
                <Sketch s={{ k: "rect", a: [x, Y0 - h, W, h] }} p={p(at[i], at[i] + 0.1)} fill={i % 2 ? C.faint : C.hi} base={60 + i} />
                <Dim x1={x + W + 10} y1={Y0} x2={x + W + 10} y2={Y0 - h} p={p(at[i] + 0.06, at[i] + 0.12)} label="" side={-1} />
                <text x={x + W / 2} y={Y0 - h - 16} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={n > 4 ? 40 : 48} fill={C.hi} opacity={p(at[i] + 0.06, at[i] + 0.12)}>{b.value.toLocaleString("en-US")}{unit}</text>
                <text x={x + W / 2} y={Y0 + 44} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={26} fill={C.ink} opacity={p(at[i], at[i] + 0.05)}>{b.label}</text>
              </g>
            );
          })}
        </Svg>
      </>
    );
  }
  const xmin = Math.min(...points.map((q) => q.x)), xmax = Math.max(...points.map((q) => q.x));
  const ymax = Math.max(...points.map((q) => q.y)) * 1.1;
  const x = scaleLinear().domain([xmin, xmax]).range([X0, X1]);
  const y = scaleLinear().domain([0, ymax]).range([Y0, Y1]);
  const mAt = spreadAts(marks.length, 0.35, 0.75, marks.map((m) => m.at) as number[]);
  const yAt = (xv: number) => points.reduce((b, q) => (Math.abs(q.x - xv) < Math.abs(b.x - xv) ? q : b), points[0]).y;
  return (
    <>
      {common}
      <Svg>
        <Defs />
        <Sketch s={{ k: "line", a: [X0, Y0, X1 + 40, Y0] }} p={p(0.02, 0.08)} base={2} />
        <Sketch s={{ k: "line", a: [X0, Y0, X0, Y1 - 40] }} p={p(0.04, 0.1)} base={3} />
        {y.ticks(4).map((v) => <text key={v} x={X0 - 18} y={y(v) + 8} textAnchor="end" fontFamily={MONO} fontSize={21} fill={C.faint} opacity={p(0.08, 0.14)}>{v}{unit}</text>)}
        {x.ticks(6).map((v) => <text key={v} x={x(v)} y={Y0 + 36} textAnchor="middle" fontFamily={MONO} fontSize={21} fill={C.faint} opacity={p(0.08, 0.14)}>{v}</text>)}
        <Sketch s={{ k: "path", pts: points.map((q) => [x(q.x), y(q.y)] as [number, number]) }} p={p(0.1, 0.7)} base={17} w={4} />
        {marks.map((m, i) => (
          <g key={i}>
            <Sketch s={{ k: "circle", a: [x(m.x), y(yAt(m.x)), 54] }} p={p(mAt[i], mAt[i] + 0.06)} color={C.red} base={40 + i} />
            <text x={x(m.x) - 38} y={y(yAt(m.x)) - 34} textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize={46} fill={C.red} opacity={p(mAt[i] + 0.03, mAt[i] + 0.06)}>{m.label}</text>
          </g>
        ))}
      </Svg>
    </>
  );
};

const Versus: React.FC<P<VersusProps>> = ({ dur, kicker, title, left, right, winner }) => {
  const p = useP(dur);
  const panel = (side: { h: string; items: string[] }, x: number, a: number, tag: string, win: boolean, base: number) => (
    <>
      <Svg><Sketch s={{ k: "rect", a: [x, 290, 780, 560] }} p={p(a, a + 0.08)} base={base} w={win ? 5 : 3} color={win ? C.hi : C.ink} /></Svg>
      <Label x={x + 24} y={306} o={p(a, a + 0.06)} color={win ? C.hi : C.faint}>{tag}</Label>
      <Hand x={x + 24} y={340} p={p(a + 0.02, a + 0.1)} size={70} w={740} color={win ? C.hi : C.ink}>{side.h}</Hand>
      {side.items.map((it, i) => <Label key={i} x={x + 30} y={460 + i * 80} o={p(a + 0.08 + i * 0.05, a + 0.12 + i * 0.05)} w={720} color={C.ink} size={26}>› {it}</Label>)}
    </>
  );
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      {panel(left, 110, 0.08, "OPTION A", winner === "left", 70)}
      {panel(right, 1030, 0.4, "OPTION B", winner === "right", 71)}
      {winner && <div style={{ position: "absolute", left: winner === "left" ? 650 : 1570, top: 300, transform: "rotate(-12deg)", opacity: p(0.8, 0.84), border: `4px solid ${C.red}`, padding: "4px 16px", fontFamily: MONO, fontWeight: 800, fontSize: 26, color: C.red, letterSpacing: 4 }}>PREFERRED</div>}
    </>
  );
};

const Recap: React.FC<P<RecapProps>> = ({ dur, title, items, closer, ats }) => {
  const p = useP(dur);
  const at = spreadAts(items.length, 0.06, 0.7, ats);
  const rowH = Math.min(70, 440 / Math.max(1, items.length));
  return (
    <>
      <Svg>
        <Sketch s={{ k: "rect", a: [260, 200, 1400, 640] }} p={p(0, 0.1)} base={80} w={4} />
        <Sketch s={{ k: "line", a: [260, 300, 1660, 300] }} p={p(0.04, 0.1)} base={81} color={C.faint} />
        {items.map((_, i) => <Sketch key={i} s={{ k: "line", a: [260, 300 + (i + 1) * rowH, 1660, 300 + (i + 1) * rowH] }} p={p(at[i], at[i] + 0.04)} base={82 + i} color={C.faint} w={1.5} />)}
      </Svg>
      <Label x={290} y={222} o={p(0, 0.06)} w={400}>SPECIFICATION</Label>
      <Hand x={560} y={210} p={p(0.02, 0.12)} size={64} w={1080}>{title}</Hand>
      {items.map((it, i) => (
        <div key={i} style={{ position: "absolute", left: 290, top: 300 + i * rowH, height: rowH, display: "flex", alignItems: "center", gap: 26, opacity: p(at[i], at[i] + 0.05) }}>
          <span style={{ fontFamily: MONO, fontSize: 22, color: C.faint, width: 60 }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{ fontFamily: MONO, fontSize: 28, color: C.ink }}>{it}</span>
        </div>
      ))}
      {closer && <Hand x={300} y={865} p={p(0.78, 0.92)} size={56} w={1320} color={C.hi}>{closer}</Hand>}
    </>
  );
};

export const blueprintGeneric: StylePack["scenes"] = {
  title: Title as any, divider: Divider as any, statement: Statement as any, list: List as any,
  flow: Flow as any, chart: Chart as any, versus: Versus as any, recap: Recap as any,
};
