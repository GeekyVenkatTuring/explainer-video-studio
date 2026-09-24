/**
 * CHALKBOARD — a classroom identity. Green-black slate with eraser smudges and a wooden frame,
 * Cabin Sketch headings + Patrick Hand body, roughjs strokes rendered as soft chalk (core stroke +
 * dusty halo), writing reveals with chalk-dust bursts, and REAL typeset maths (KaTeX → native
 * MathML, rendered by the system STIX Two Math font — no web fonts, so renders can't stall).
 * Fits: maths, statistics, ML theory, physics, courses and "lesson" formats.
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { wipe } from "@remotion/transitions/wipe";
import { evolvePath } from "@remotion/paths";
import rough from "roughjs";
import katex from "katex";
import { scaleLinear } from "d3-scale";
import { useP, rnd } from "../../lib/primitives";
import { StylePack, SceneProps, spreadAts, TitleProps, DividerProps, StatementProps, ListProps, FlowProps, ChartProps, VersusProps, RecapProps } from "../core";

export const C = { board: "#20382E", board2: "#15261F", chalk: "#F1F0E8", dim: "#B9C4BC", yellow: "#F6DE78", pink: "#F3A5B6", blue: "#9ED2F0", wood: "#7A4E2D", wood2: "#5A361D" };
export const HEAD = "'Cabin Sketch', 'Chalkboard SE', cursive";
export const BODY = "'Patrick Hand', 'Chalkboard SE', cursive";
type P<T> = SceneProps & T;

// ---------------------------------------------------------------- chalk strokes
type Spec = { k: "line" | "rect" | "circle" | "ellipse"; a: number[] } | { k: "path" | "curve"; pts: [number, number][] };
const GEN = rough.generator();
const CACHE = new Map<string, { d: string; fill: boolean }[]>();
const paths = (s: Spec, seed: number, fill?: string) => {
  const key = JSON.stringify(s) + seed + (fill || "");
  const hit = CACHE.get(key); if (hit) return hit;
  const o = { seed, roughness: 2.1, bowing: 1.6, stroke: "#fff", strokeWidth: 3, fill, fillStyle: "hachure" as const, hachureGap: 10, hachureAngle: -50, fillWeight: 2.2 };
  const dr = "pts" in s ? (s.k === "path" ? GEN.linearPath(s.pts, o) : GEN.curve(s.pts, o))
    : s.k === "line" ? GEN.line(s.a[0], s.a[1], s.a[2], s.a[3], o) : s.k === "rect" ? GEN.rectangle(s.a[0], s.a[1], s.a[2], s.a[3], o)
      : s.k === "circle" ? GEN.circle(s.a[0], s.a[1], s.a[2], o) : GEN.ellipse(s.a[0], s.a[1], s.a[2], s.a[3], o);
  const out = GEN.toPaths(dr).map((q) => ({ d: q.d, fill: !!q.fill && q.fill !== "none" }));
  CACHE.set(key, out); return out;
};
/** soft chalk stroke: dusty halo + core line, drawn on with p, faint boil */
export const Chalk: React.FC<{ s: Spec; p: number; color?: string; w?: number; fill?: string; base?: number }> = ({ s, p, color = C.chalk, w = 4, fill, base = 1 }) => {
  const frame = useCurrentFrame();
  if (p <= 0) return null;
  const seed = base + (Math.floor(frame / 9) % 2);
  return (
    <g>
      {paths(s, seed, fill).map((q, i) => {
        const ev = evolvePath(Math.min(1, p), q.d);
        const col = q.fill ? fill : color;
        return (
          <g key={i}>
            <path d={q.d} fill="none" stroke={col} strokeWidth={(q.fill ? 2 : w) + 5} opacity={0.12} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
            <path d={q.d} fill="none" stroke={col} strokeWidth={q.fill ? 2 : w} opacity={q.fill ? 0.5 : 0.88} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
          </g>
        );
      })}
    </g>
  );
};
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>;
/** chalk text written left→right, with a dust burst at the write-head while writing */
export const Write: React.FC<{ x: number; y: number; p: number; size?: number; color?: string; children: React.ReactNode; w?: number; font?: string; align?: "left" | "center" }> = ({
  x, y, p, size = 56, color = C.chalk, children, w = 1400, font = BODY, align = "left",
}) => {
  const frame = useCurrentFrame();
  const q = Math.max(0, Math.min(1, p));
  const writing = q > 0 && q < 1;
  return (
    <>
      <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: align, fontFamily: font, fontSize: size, color, lineHeight: 1.1, whiteSpace: "nowrap", opacity: 0.94,
        textShadow: `0 0 6px rgba(255,255,255,0.18)`, clipPath: align === "center" ? `inset(-20% ${50 - q * 50}% -20% ${50 - q * 50}%)` : `inset(-20% ${100 - q * 100}% -20% 0)` }}>{children}</div>
      {writing && Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: x + (align === "center" ? w / 2 + (q - 0.5) * w * 0.9 : w * q * 0.92) + (rnd(i, frame, 3) - 0.5) * 24, top: y + size * 0.9 + rnd(i, frame, 5) * 40,
          width: 3 + rnd(i, 1) * 3, height: 3 + rnd(i, 1) * 3, borderRadius: 3, background: color, opacity: 0.5 }} />
      ))}
    </>
  );
};
/** typeset maths: KaTeX → MathML, drawn in chalk by the system STIX Two Math font */
export const TeX: React.FC<{ tex: string; x: number; y: number; size?: number; color?: string; o?: number; w?: number }> = ({ tex, x, y, size = 80, color = C.chalk, o = 1, w = 900 }) => {
  const html = React.useMemo(() => katex.renderToString(tex, { output: "mathml", throwOnError: false, displayMode: true }), [tex]);
  return (
    <div style={{ position: x === 0 && y === 0 ? "relative" : "absolute", left: x, top: y, width: w, fontSize: size, color, opacity: o, fontFamily: "'STIX Two Math', serif", textShadow: "0 0 8px rgba(255,255,255,0.2)" }}
      dangerouslySetInnerHTML={{ __html: html.replace("<math", `<math style="font-family:'STIX Two Math';color:${color}"`) }} />
  );
};

// ---------------------------------------------------------------- background: the slate
const Background: React.FC<{ beat: number; total: number }> = ({ beat, total }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 45% 40%, ${C.board} 0%, ${C.board2} 100%)` }} />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: rnd(i, 1, beat) * 1700, top: 80 + rnd(i, 2, beat) * 800, width: 380 + rnd(i, 3) * 400, height: 110 + rnd(i, 4) * 120, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 70%)", transform: `rotate(${(rnd(i, 5) - 0.5) * 30}deg)` }} />
      ))}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {Array.from({ length: 160 }).map((_, i) => <circle key={i} cx={rnd(i, 7, beat) * 1920} cy={rnd(i, 8, beat) * 1080} r={0.8 + rnd(i, 9) * 1.4} fill="#fff" opacity={0.05 + rnd(i, 10, Math.floor(frame / 20)) * 0.05} />)}
      </svg>
      <div style={{ position: "absolute", inset: 0, border: `26px solid ${C.wood}`, boxShadow: `inset 0 0 0 4px ${C.wood2}, inset 0 0 60px rgba(0,0,0,0.6)` }} />
      <div style={{ position: "absolute", right: 70, top: 48, fontFamily: BODY, fontSize: 28, color: C.dim }}>{beat + 1} / {total}</div>
    </>
  );
};

// ---------------------------------------------------------------- the 8 archetypes
const Head: React.FC<{ p: (a: number, b: number) => number; kicker?: string; title: string }> = ({ p, kicker, title }) => (
  <>
    {kicker && <Write x={110} y={70} p={p(0, 0.06)} size={34} color={C.yellow}>{kicker}</Write>}
    <Write x={110} y={110} p={p(0.01, 0.12)} size={78} font={HEAD}>{title}</Write>
    <Svg><Chalk s={{ k: "line", a: [115, 210, 115 + Math.min(1300, title.length * 38), 206] }} p={p(0.1, 0.16)} base={2} color={C.yellow} /></Svg>
  </>
);

const Title: React.FC<P<TitleProps>> = ({ dur, kicker, title, subtitle }) => {
  const p = useP(dur);
  const lines = title.split("\n");
  return (
    <>
      {kicker && <Write x={0} y={240} w={1920} align="center" p={p(0, 0.08)} size={40} color={C.yellow}>{kicker}</Write>}
      {lines.map((l, i) => <Write key={i} x={0} y={300 + i * 150} w={1920} align="center" p={p(0.05 + i * 0.12, 0.2 + i * 0.12)} size={140} font={HEAD} color={i === lines.length - 1 && lines.length > 1 ? C.yellow : C.chalk}>{l}</Write>)}
      <Svg>
        <Chalk s={{ k: "line", a: [620, 318 + lines.length * 150, 1300, 312 + lines.length * 150] }} p={p(0.3, 0.4)} base={3} color={C.pink} />
        <Chalk s={{ k: "line", a: [680, 334 + lines.length * 150, 1240, 330 + lines.length * 150] }} p={p(0.36, 0.44)} base={4} color={C.pink} />
        <Chalk s={{ k: "path", pts: [[250, 820], [270, 770], [290, 820], [240, 790], [300, 790], [250, 820]] }} p={p(0.45, 0.6)} base={5} color={C.yellow} />
      </Svg>
      {subtitle && <Write x={0} y={370 + lines.length * 150} w={1920} align="center" p={p(0.4, 0.55)} size={52} color={C.dim}>{subtitle}</Write>}
    </>
  );
};

const Divider: React.FC<P<DividerProps>> = ({ dur, n, total, title, sub }) => {
  const p = useP(dur);
  return (
    <>
      <Write x={0} y={190} w={1920} align="center" p={p(0, 0.08)} size={48} color={C.yellow}>Lesson {n} of {total}</Write>
      <Svg><Chalk s={{ k: "circle", a: [960, 380, 210] }} p={p(0.04, 0.18)} base={6} w={5} /></Svg>
      <Write x={0} y={300} w={1920} align="center" p={p(0.08, 0.18)} size={150} font={HEAD}>{n}</Write>
      <Write x={0} y={530} w={1920} align="center" p={p(0.16, 0.36)} size={110} font={HEAD}>{title}</Write>
      {sub && <Write x={0} y={680} w={1920} align="center" p={p(0.34, 0.5)} size={50} color={C.dim}>{sub}</Write>}
    </>
  );
};

const Statement: React.FC<P<StatementProps & { tex?: string }>> = ({ dur, kicker, lines, accent = -1, big, sub, ats, tex }) => {
  const p = useP(dur);
  const at = spreadAts(lines.length, 0.03, 0.4, ats);
  const side = big || tex;
  return (
    <>
      {kicker && <Write x={110} y={110} p={p(0, 0.06)} size={40} color={C.yellow}>{kicker}</Write>}
      {lines.map((l, i) => <Write key={i} x={120} y={180 + i * 120} p={p(at[i], at[i] + 0.12)} size={96} font={HEAD} w={side ? 1000 : 1650} color={i === accent ? C.yellow : C.chalk}>{l}</Write>)}
      {side && (
        <>
          <Svg><Chalk s={{ k: "rect", a: [1150, 200, 640, 330] }} p={p(0.3, 0.42)} base={9} w={4} color={C.blue} /></Svg>
          {tex ? <div style={{ position: "absolute", left: 1150, top: 200, width: 640, height: 330, display: "flex", alignItems: "center", justifyContent: "center" }}><TeX tex={tex} x={0} y={0} w={640} size={Math.min(96, Math.floor(1800 / Math.max(8, tex.length)))} o={p(0.36, 0.46)} /></div>
            : <Write x={1170} y={310} p={p(0.34, 0.5)} size={Math.min(110, Math.floor(1000 / big!.length))} w={600} font={HEAD} color={C.yellow}>{big}</Write>}
        </>
      )}
      {sub && <Write x={120} y={720} p={p(0.5, 0.66)} size={50} w={1650} color={C.pink}>→ {sub}</Write>}
    </>
  );
};

const List: React.FC<P<ListProps>> = ({ dur, kicker, title, items, ats }) => {
  const p = useP(dur);
  const at = spreadAts(items.length, 0.1, 0.72, ats);
  const rowH = Math.min(122, Math.floor(620 / items.length));
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>{items.map((_, i) => <Chalk key={i} s={{ k: "circle", a: [165, 300 + i * rowH + 30, 68] }} p={p(at[i], at[i] + 0.04)} base={20 + i} color={C.yellow} />)}</Svg>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <Write x={148} y={300 + i * rowH} p={p(at[i], at[i] + 0.03)} size={48} font={HEAD} color={C.yellow} w={40}>{i + 1}</Write>
          <Write x={230} y={292 + i * rowH} p={p(at[i] + 0.01, at[i] + 0.08)} size={62} font={HEAD} w={700}>{it.h}</Write>
          {it.d && <Write x={900} y={306 + i * rowH} p={p(at[i] + 0.04, at[i] + 0.1)} size={42} w={900} color={C.dim}>— {it.d}</Write>}
        </React.Fragment>
      ))}
    </>
  );
};

const Flow: React.FC<P<FlowProps>> = ({ dur, kicker, title, steps, ats }) => {
  const p = useP(dur);
  const n = steps.length;
  const at = spreadAts(n, 0.1, 0.72, ats);
  const xs = steps.map((_, i) => 260 + (1400 * i) / Math.max(1, n - 1));
  const Y = 470, R = 140;
  const colW = Math.min(360, 1400 / Math.max(1, n - 1) - 20);
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        {steps.map((_, i) => (
          <g key={i}>
            <Chalk s={{ k: "circle", a: [xs[i], Y, R * 2] }} p={p(at[i], at[i] + 0.06)} base={40 + i} color={i % 2 ? C.blue : C.chalk} />
            {i < n - 1 && <Chalk s={{ k: "curve", pts: [[xs[i] + R + 10, Y - 20], [(xs[i] + xs[i + 1]) / 2, Y - 90], [xs[i + 1] - R - 14, Y - 20]] }} p={p(at[i + 1] - 0.05, at[i + 1])} base={50 + i} color={C.yellow} />}
            {i < n - 1 && <Chalk s={{ k: "path", pts: [[xs[i + 1] - R - 38, Y - 44], [xs[i + 1] - R - 12, Y - 20], [xs[i + 1] - R - 44, Y - 10]] }} p={p(at[i + 1], at[i + 1] + 0.02)} base={60 + i} color={C.yellow} />}
          </g>
        ))}
      </Svg>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <Write x={xs[i] - R} y={Y - 40} w={R * 2} align="center" p={p(at[i] + 0.02, at[i] + 0.08)} size={s.h.length > 9 ? 44 : 56} font={HEAD}>{s.h}</Write>
          {s.d && <Write x={xs[i] - colW / 2} y={Y + R + 30} w={colW} align="center" p={p(at[i] + 0.04, at[i] + 0.1)} size={34} color={C.dim}>{s.d}</Write>}
        </React.Fragment>
      ))}
    </>
  );
};

const Chart: React.FC<P<ChartProps>> = ({ dur, kicker, title, type, unit = "", note, points = [], bars = [], marks = [], ats }) => {
  const p = useP(dur);
  const X0 = 300, X1 = 1600, Y0 = 820, Y1 = 320;
  if (type === "bar") {
    const at = spreadAts(bars.length, 0.12, 0.7, ats);
    const max = Math.max(...bars.map((b) => b.value), 1);
    const n = bars.length, W = Math.min(210, 1100 / n), gap = (X1 - X0 - n * W) / Math.max(1, n);
    return (
      <>
        <Head p={p} kicker={kicker} title={title} />
        <Svg>
          <Chalk s={{ k: "line", a: [X0 - 40, Y0, X1 + 40, Y0] }} p={p(0, 0.08)} base={2} />
          {bars.map((b, i) => {
            const h = (b.value / max) * (Y0 - Y1); const x = X0 + gap / 2 + i * (W + gap);
            return <Chalk key={i} s={{ k: "rect", a: [x, Y0 - h, W, h] }} p={p(at[i], at[i] + 0.1)} fill={i % 2 ? C.blue : C.yellow} base={70 + i} />;
          })}
        </Svg>
        {bars.map((b, i) => {
          const h = (b.value / max) * (Y0 - Y1); const x = X0 + gap / 2 + i * (W + gap);
          return (
            <React.Fragment key={i}>
              <Write x={x - 40} y={Y0 - h - 70} w={W + 80} align="center" p={p(at[i] + 0.06, at[i] + 0.12)} size={50} font={HEAD}>{b.value.toLocaleString("en-IN")}{unit}</Write>
              <Write x={x - 40} y={Y0 + 16} w={W + 80} align="center" p={p(at[i], at[i] + 0.06)} size={40} color={C.dim}>{b.label}</Write>
            </React.Fragment>
          );
        })}
        {note && <Write x={X0} y={900} p={p(0.1, 0.2)} size={30} color={C.dim}>{note}</Write>}
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
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        <Chalk s={{ k: "line", a: [X0, Y0, X1 + 40, Y0] }} p={p(0.02, 0.08)} base={2} />
        <Chalk s={{ k: "line", a: [X0, Y0, X0, Y1 - 40] }} p={p(0.04, 0.1)} base={3} />
        <Chalk s={{ k: "path", pts: points.map((q) => [x(q.x), y(q.y)] as [number, number]) }} p={p(0.1, 0.7)} base={17} w={5} color={C.yellow} />
        {marks.map((m, i) => <Chalk key={i} s={{ k: "circle", a: [x(m.x), y(yAt(m.x)), 56] }} p={p(mAt[i], mAt[i] + 0.06)} base={80 + i} color={C.pink} />)}
      </Svg>
      {y.ticks(4).map((v) => <Write key={v} x={X0 - 110} y={y(v) - 26} w={90} p={p(0.06, 0.12)} size={34} color={C.dim}>{`${v}${unit}`}</Write>)}
      {x.ticks(5).map((v) => <Write key={v} x={x(v) - 40} y={Y0 + 12} w={80} align="center" p={p(0.06, 0.12)} size={34} color={C.dim}>{String(v)}</Write>)}
      {marks.map((m, i) => <Write key={i} x={x(m.x) - 170} y={y(yAt(m.x)) - 90} w={150} p={p(mAt[i] + 0.03, mAt[i] + 0.07)} size={46} font={HEAD} color={C.pink}>{m.label}</Write>)}
      {note && <Write x={X0} y={900} p={p(0.1, 0.2)} size={30} color={C.dim}>{note}</Write>}
    </>
  );
};

const Versus: React.FC<P<VersusProps>> = ({ dur, kicker, title, left, right, winner }) => {
  const p = useP(dur);
  const col = (s: { h: string; items: string[] }, x: number, a: number, win: boolean) => (
    <>
      <Write x={x} y={290} p={p(a, a + 0.08)} size={80} font={HEAD} w={760} color={win ? C.yellow : C.chalk}>{s.h}</Write>
      {s.items.map((it, i) => <Write key={i} x={x + 10} y={420 + i * 96} p={p(a + 0.08 + i * 0.05, a + 0.14 + i * 0.05)} size={46} w={760} color={C.chalk}>{win ? "✓" : "·"} {it}</Write>)}
    </>
  );
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg><Chalk s={{ k: "line", a: [960, 270, 956, 880] }} p={p(0.3, 0.4)} base={4} color={C.dim} /></Svg>
      {col(left, 130, 0.08, winner === "left")}
      {col(right, 1040, 0.4, winner === "right")}
      {winner && <Svg><Chalk s={{ k: "ellipse", a: [winner === "left" ? 330 : 1240, 330, 440, 130] }} p={p(0.8, 0.9)} base={7} color={C.yellow} /></Svg>}
    </>
  );
};

const Recap: React.FC<P<RecapProps>> = ({ dur, title, items, closer, ats }) => {
  const p = useP(dur);
  const at = spreadAts(items.length, 0.06, 0.7, ats);
  const rowH = Math.min(92, 480 / Math.max(1, items.length));
  return (
    <>
      <Svg><Chalk s={{ k: "rect", a: [250, 150, 1420, 720] }} p={p(0, 0.1)} base={11} color={C.dim} /></Svg>
      <Write x={0} y={170} w={1920} align="center" p={p(0.02, 0.12)} size={84} font={HEAD} color={C.yellow}>{title}</Write>
      {items.map((it, i) => <Write key={i} x={330} y={300 + i * rowH} p={p(at[i], at[i] + 0.07)} size={52} w={1300}>{i + 1}. {it}</Write>)}
      {closer && (
        <>
          <Svg><Chalk s={{ k: "path", pts: [[400, 800], [420, 750], [440, 800], [390, 770], [450, 770], [400, 800]] }} p={p(0.78, 0.88)} base={12} color={C.pink} /></Svg>
          <Write x={480} y={755} p={p(0.8, 0.92)} size={60} font={HEAD} w={1150} color={C.pink}>{closer}</Write>
        </>
      )}
    </>
  );
};

export const chalk: StylePack = {
  id: "chalk",
  name: "Chalkboard",
  Background: Background as StylePack["Background"],
  scenes: { title: Title as any, divider: Divider as any, statement: Statement as any, list: List as any, flow: Flow as any, chart: Chart as any, versus: Versus as any, recap: Recap as any },
  caption: { font: BODY, size: 36, weight: 400, color: C.chalk, bg: "rgba(10,20,15,0.85)", border: `2px dashed rgba(241,240,232,0.5)`, radius: 8, bottom: 56 },
  transition: (i) => wipe({ direction: i % 2 ? "from-right" : "from-left" }) as never,
  transitionFrames: 18,
};
