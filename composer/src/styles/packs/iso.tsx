/**
 * ISOMETRIC — clean diagram-3D without WebGL: a light periwinkle stage with an isometric grid,
 * every object an isometric block (3 shaded faces computed from an iso projection, pure SVG),
 * platforms joined by pipes with little cube packets flowing, 3D bar columns, stacked layers.
 * Manrope type. Cheap to render (unlike 3D Studio) and very legible for architecture.
 * Fits: cloud & infrastructure, data pipelines, logistics, supply chains, business processes, SaaS.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { useP, mix } from "../../lib/primitives";
import { StylePack, SceneProps, spreadAts, TitleProps, DividerProps, StatementProps, ListProps, FlowProps, ChartProps, VersusProps, RecapProps } from "../core";

export const C = { bg0: "#F5F7FF", bg1: "#E3E9FF", ink: "#1E1B4B", sub: "#5B5F86", grid: "#C7D2FE", indigo: "#6366F1", sky: "#0EA5E9", emerald: "#10B981", amber: "#F59E0B", rose: "#F43F5E", white: "#FFFFFF" };
export const ACC = [C.indigo, C.sky, C.emerald, C.amber, C.rose];
export const F = "Manrope, Inter, 'Helvetica Neue', sans-serif";
type P<T> = SceneProps & T;

const COS = Math.cos(Math.PI / 6), SIN = 0.5;
/** iso projection: world (x, y, z) → stage px; origin (ox, oy), scale s px per unit */
export const iso = (ox: number, oy: number, s: number) => (x: number, y: number, z: number): [number, number] => [ox + (x - y) * COS * s, oy + (x + y) * SIN * s - z * s];
export const poly = (pts: [number, number][]) => pts.map((q) => q.join(",")).join(" ");
/** an isometric box: top / left / right faces with fixed light (top lightest, right darkest) */
export const IsoBox: React.FC<{ pr: ReturnType<typeof iso>; x: number; y: number; z?: number; w: number; d: number; h: number; color: string; o?: number; stroke?: boolean }> = ({ pr, x, y, z = 0, w, d, h, color, o = 1, stroke = true }) => {
  if (h <= 0.0001 && o <= 0) return null;
  const t = [pr(x, y, z + h), pr(x + w, y, z + h), pr(x + w, y + d, z + h), pr(x, y + d, z + h)];
  const l = [pr(x, y + d, z), pr(x + w, y + d, z), pr(x + w, y + d, z + h), pr(x, y + d, z + h)];
  const r = [pr(x + w, y, z), pr(x + w, y + d, z), pr(x + w, y + d, z + h), pr(x + w, y, z + h)];
  const sw = stroke ? { stroke: mix(color, "#1E1B4B", 0.45), strokeWidth: 1.5, strokeLinejoin: "round" as const } : {};
  return (
    <g opacity={o}>
      <polygon points={poly(l)} fill={color} {...sw} />
      <polygon points={poly(r)} fill={mix(color, "#1E1B4B", 0.28)} {...sw} />
      <polygon points={poly(t)} fill={mix(color, "#FFFFFF", 0.35)} {...sw} />
    </g>
  );
};
export const useSpr = (dur: number, at: number) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(at * dur * fps), fps, config: { damping: 14, stiffness: 120 } });
};
export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>;
export const Fade: React.FC<{ o: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ o, children, style }) => <div style={{ opacity: o, transform: `translateY(${(1 - o) * 18}px)`, ...style }}>{children}</div>;
export const Head: React.FC<{ p: (a: number, b: number) => number; kicker?: string; title: string; w?: number }> = ({ p, kicker, title, w = 1600 }) => (
  <>
    {kicker && <div style={{ position: "absolute", left: 120, top: 110, fontFamily: F, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: C.indigo, textTransform: "uppercase", opacity: p(0, 0.05) }}>{kicker}</div>}
    <Fade o={p(0, 0.06)} style={{ position: "absolute", left: 120, top: 146, width: w, fontFamily: F, fontWeight: 800, fontSize: 62, letterSpacing: -1.5, color: C.ink }}>{title}</Fade>
  </>
);

// ---------------------------------------------------------------- background: iso grid stage
const Background: React.FC<{ beat: number }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const off = (frame * 0.4) % 60;
  const lines: React.ReactNode[] = [];
  for (let k = -40; k < 60; k++) {
    const b = k * 60 + off;
    lines.push(<line key={"a" + k} x1={0} y1={b} x2={1920} y2={b + 1920 * Math.tan(Math.PI / 6)} stroke={C.grid} strokeWidth={1} />);
    lines.push(<line key={"b" + k} x1={0} y1={b} x2={1920} y2={b - 1920 * Math.tan(Math.PI / 6)} stroke={C.grid} strokeWidth={1} />);
  }
  const pr = iso(1780, 980, 26);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${C.bg0} 0%, ${C.bg1} 100%)` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: 0.55 }}>{lines}</svg>
      <Svg>{[0, 1, 2].map((i) => <IsoBox key={i} pr={pr} x={-i * 1.6} y={i * 0.8} z={Math.sin(frame * 0.04 + i + beat) * 0.3} w={1} d={1} h={1} color={ACC[(i + beat) % ACC.length]} o={0.5} />)}</Svg>
    </>
  );
};

// ---------------------------------------------------------------- the 8 archetypes
const Title: React.FC<P<TitleProps>> = ({ dur, kicker, title, subtitle }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const lines = title.split("\n");
  const pr = iso(1380, 560, 60);
  const layers = [0, 1, 2, 3].map((i) => useSpr(dur, 0.04 + i * 0.06));
  return (
    <>
      <Svg>
        {layers.map((s, i) => <IsoBox key={i} pr={pr} x={-i * 0.4} y={-i * 0.4} z={i * 1.2 + (1 - s) * 6} w={4 - i * 0.8 + i * 0.8} d={4} h={0.9} color={ACC[i]} o={Math.min(1, s * 1.5)} />)}
        <IsoBox pr={pr} x={1.4} y={1.4} z={5 + Math.sin(frame * 0.06) * 0.25 + (1 - layers[3]) * 6} w={1.2} d={1.2} h={1.2} color={C.rose} o={layers[3]} />
      </Svg>
      {kicker && <div style={{ position: "absolute", left: 120, top: 270, fontFamily: F, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: C.indigo, textTransform: "uppercase", opacity: p(0, 0.08) }}>{kicker}</div>}
      {lines.map((l, i) => <Fade key={i} o={p(0.04 + i * 0.1, 0.16 + i * 0.1)} style={{ position: "absolute", left: 115, top: 320 + i * 128, fontFamily: F, fontWeight: 800, fontSize: 116, letterSpacing: -4, color: i === lines.length - 1 && lines.length > 1 ? C.indigo : C.ink, whiteSpace: "nowrap" }}>{l}</Fade>)}
      {subtitle && <div style={{ position: "absolute", left: 122, top: 350 + lines.length * 128, width: 900, fontFamily: F, fontWeight: 600, fontSize: 36, color: C.sub, opacity: p(0.3, 0.45) }}>{subtitle}</div>}
    </>
  );
};

const Divider: React.FC<P<DividerProps>> = ({ dur, n, total, title, sub }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const s = useSpr(dur, 0); const pr = iso(960, 330, 70); const col = ACC[n % ACC.length];
  return (
    <>
      <Svg>
        <IsoBox pr={pr} x={-1.5} y={-1.5} z={0} w={3} d={3} h={0.5} color={C.white} />
        <IsoBox pr={pr} x={-1} y={-1} z={0.5 + (1 - s) * 5 + Math.sin(frame * 0.05) * 0.1} w={2} d={2} h={1.6 * s} color={col} o={Math.min(1, s * 1.5)} />
      </Svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 450, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 80, color: C.ink, opacity: p(0.08, 0.16) }}>{String(n).padStart(2, "0")}</div>
      <Fade o={p(0.1, 0.24)} style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 92, letterSpacing: -2, color: C.ink }}>{title}</Fade>
      {sub && <div style={{ position: "absolute", left: 0, right: 0, top: 710, textAlign: "center", fontFamily: F, fontWeight: 600, fontSize: 34, color: C.sub, opacity: p(0.25, 0.4) }}>{sub}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 780, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 22, letterSpacing: 5, color: col, opacity: p(0.3, 0.45) }}>PART {n} / {total}</div>
    </>
  );
};

const Statement: React.FC<P<StatementProps>> = ({ dur, kicker, lines, accent = -1, big, sub, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const at = spreadAts(lines.length, 0.03, 0.4, ats);
  const pr = iso(1500, 520, 52);
  const cubes: [number, number, number][] = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [0, 0, 2]];
  return (
    <>
      <Svg>
        {cubes.map(([x, y, z], i) => { const s = useSpr(dur, 0.1 + i * 0.03); return <IsoBox key={i} pr={pr} x={x * 1.05} y={y * 1.05} z={z * 1.05 + (1 - s) * 7} w={1} d={1} h={1} color={ACC[i % ACC.length]} o={Math.min(1, s * 2)} />; })}
      </Svg>
      {kicker && <div style={{ position: "absolute", left: 120, top: 180, fontFamily: F, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: C.indigo, textTransform: "uppercase", opacity: p(0, 0.06) }}>{kicker}</div>}
      {lines.map((l, i) => <Fade key={i} o={p(at[i], at[i] + 0.1)} style={{ position: "absolute", left: 115, top: 230 + i * 118, fontFamily: F, fontWeight: 800, fontSize: 96, letterSpacing: -3, color: i === accent ? C.indigo : C.ink, whiteSpace: "nowrap" }}>{l}</Fade>)}
      {big && <Fade o={p(0.34, 0.46)} style={{ position: "absolute", left: 1200, top: 730, width: 620, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: Math.min(80, Math.floor(1000 / big.length)), color: C.indigo, whiteSpace: "nowrap", transform: `translateY(${Math.sin(frame * 0.05) * 4}px)` }}>{big}</Fade>}
      {sub && <div style={{ position: "absolute", left: 120, top: 250 + lines.length * 118 + 30, width: 1000, fontFamily: F, fontWeight: 600, fontSize: 34, color: C.sub, opacity: p(0.5, 0.62) }}>{sub}</div>}
    </>
  );
};

const List: React.FC<P<ListProps>> = ({ dur, kicker, title, items, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const at = spreadAts(items.length, 0.1, 0.72, ats);
  const rowH = Math.min(118, Math.floor(620 / items.length));
  let cur = -1; at.forEach((a, i) => { if (p(a, a + 0.01) > 0.5) cur = i; });
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      {items.map((it, i) => {
        const s = useSpr(dur, at[i]); const y0 = 300 + i * rowH; const pr = iso(200, y0 + rowH * 0.2, rowH * 0.34); const on = cur === i;
        return (
          <React.Fragment key={i}>
            <Svg><IsoBox pr={pr} x={-1} y={-1} z={on ? Math.abs(Math.sin(frame * 0.1)) * 0.25 : 0} w={2} d={2} h={0.8 * s} color={ACC[i % ACC.length]} o={Math.min(1, s * 2)} /></Svg>
            <Fade o={Math.min(1, s)} style={{ position: "absolute", left: 320, top: y0 + 6, height: rowH - 20, display: "flex", alignItems: "center", gap: 28, whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: F, fontWeight: 800, fontSize: 26, color: ACC[i % ACC.length] }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: F, fontWeight: 800, fontSize: 46, color: C.ink }}>{it.h}</span>
              {it.d && <span style={{ fontFamily: F, fontWeight: 600, fontSize: 28, color: C.sub }}>{it.d}</span>}
            </Fade>
          </React.Fragment>
        );
      })}
    </>
  );
};

const Flow: React.FC<P<FlowProps>> = ({ dur, kicker, title, steps, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const n = steps.length; const at = spreadAts(n, 0.1, 0.72, ats);
  const pr = iso(360, 440, 64);
  const gx = (i: number) => i * (12 / Math.max(1, n - 1));
  const pos = steps.map((_, i) => ({ x: gx(i), y: -gx(i) * 0.15 + 0.5 }));
  const done = p(at[n - 1] + 0.05, at[n - 1] + 0.06) > 0.5;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        {pos.slice(0, -1).map((q, i) => { const r = pos[i + 1]; const pp = p(at[i + 1] - 0.04, at[i + 1]); return <IsoBox key={"p" + i} pr={pr} x={q.x + 1} y={q.y + 0.35} z={0.25} w={Math.max(0.01, (r.x - q.x - 1) * pp)} d={0.3} h={0.3} color={C.white} />; })}
        {pos.map((q, i) => { const s = useSpr(dur, at[i]); return <IsoBox key={i} pr={pr} x={q.x} y={q.y - 0.2} z={(1 - s) * 4} w={1.4} d={1.4} h={0.6} color={ACC[i % ACC.length]} o={Math.min(1, s * 2)} />; })}
        {done && pos.slice(0, -1).map((q, i) => { const r = pos[i + 1]; const t = ((frame * 0.02 + i * 0.3) % 1); return <IsoBox key={"k" + i} pr={pr} x={q.x + 1 + (r.x - q.x - 1) * t} y={q.y + 0.4} z={0.55} w={0.22} d={0.22} h={0.22} color={C.amber} />; })}
      </Svg>
      {steps.map((st, i) => {
        const q = pos[i]; const [sx, sy] = pr(q.x + 0.7, q.y + 0.5, 0);
        return (
          <Fade key={i} o={p(at[i] + 0.02, at[i] + 0.07)} style={{ position: "absolute", left: sx - 150, top: sy + 70, width: 300, textAlign: "center" }}>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: ACC[i % ACC.length] }}>STEP {i + 1}</div>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 34, color: C.ink }}>{st.h}</div>
            {st.d && <div style={{ fontFamily: F, fontWeight: 600, fontSize: 22, color: C.sub, marginTop: 4 }}>{st.d}</div>}
          </Fade>
        );
      })}
    </>
  );
};

const Chart: React.FC<P<ChartProps>> = ({ dur, kicker, title, type, unit = "", note, points = [], bars = [], marks = [], ats }) => {
  const p = useP(dur);
  // a "skyline" of iso columns on a screen-horizontal baseline — reads left→right like any chart
  let cols: { label: string; value: number }[]; let isLine = false;
  if (type === "bar") cols = bars;
  else {
    isLine = true; const N = Math.min(points.length, 12);
    cols = Array.from({ length: N }, (_, k) => points[Math.round((k * (points.length - 1)) / Math.max(1, N - 1))]).map((q) => ({ label: String(q.x), value: q.y }));
  }
  const n = cols.length; const max = Math.max(...cols.map((c) => c.value), 1);
  const at = isLine ? cols.map((_, k) => 0.1 + (0.6 * k) / Math.max(1, n - 1)) : spreadAts(n, 0.12, 0.7, ats);
  const X0 = 300, SPAN = 1300, BASE = 800; const s = Math.min(48, SPAN / n / 1.9); const Hmax = 420 / s;
  const prs = cols.map((_, k) => iso(X0 + (k * SPAN) / Math.max(1, n - 1), BASE, s));
  const hs = cols.map((c, k) => (c.value / max) * Hmax * Math.min(1, useSpr(dur, at[k])));
  const tops = prs.map((pr, k) => pr(0.5, 0.5, hs[k]));
  const nearest = (xv: number) => cols.reduce((bi, c, k) => (Math.abs(Number(c.label) - xv) < Math.abs(Number(cols[bi].label) - xv) ? k : bi), 0);
  const mAt = spreadAts(marks.length, 0.35, 0.75, marks.map((m) => m.at) as number[]);
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      {note && <div style={{ position: "absolute", left: 120, top: 240, fontFamily: F, fontWeight: 600, fontSize: 22, color: C.sub, opacity: p(0.1, 0.2) }}>{note}</div>}
      <Svg>
        {prs.map((pr, k) => <IsoBox key={k} pr={pr} x={0} y={0} z={0} w={1} d={1} h={Math.max(0.02, hs[k])} color={isLine ? C.sky : ACC[k % ACC.length]} o={hs[k] > 0.01 ? 1 : 0} />)}
        {isLine && <polyline points={poly(tops.filter((_, k) => hs[k] > 0.01))} fill="none" stroke={C.indigo} strokeWidth={6} strokeLinejoin="round" />}
      </Svg>
      {!isLine && cols.map((c, k) => { const [tx, ty] = tops[k]; const [bx, by] = prs[k](1, 1, 0); return (
        <React.Fragment key={k}>
          <div style={{ position: "absolute", left: tx - 110, top: ty - 62, width: 220, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: n > 4 ? 32 : 40, color: C.ink, opacity: hs[k] > 0.01 ? 1 : 0 }}>{c.value.toLocaleString("en-US")}{unit}</div>
          <div style={{ position: "absolute", left: bx - 130, top: by + 8, width: 220, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 22, color: C.sub, opacity: hs[k] > 0.01 ? 1 : 0 }}>{c.label}</div>
        </React.Fragment>); })}
      {isLine && [0, n - 1].map((k) => { const [bx, by] = prs[k](1, 1, 0); return <div key={k} style={{ position: "absolute", left: bx - 130, top: by + 8, width: 220, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 22, color: C.sub, opacity: p(0.05, 0.12) }}>{cols[k].label}</div>; })}
      {isLine && marks.map((m, i) => { const k = nearest(m.x); const [tx, ty] = tops[k]; return <Fade key={i} o={p(mAt[i], mAt[i] + 0.05)} style={{ position: "absolute", left: tx - 110, top: ty - 70, width: 220, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 36, color: C.rose }}>{m.label}</Fade>; })}
    </>
  );
};

const Versus: React.FC<P<VersusProps>> = ({ dur, kicker, title, left, right, winner }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const side = (s: { h: string; items: string[] }, ox: number, a: number, win: boolean, col: string) => {
    const sp = useSpr(dur, a); const pr = iso(ox + 200, 560, 50); const lift = win ? p(0.8, 0.88) * 2 : 0;
    return (
      <>
        <Svg>
          <IsoBox pr={pr} x={-1.6} y={-1.6} z={0} w={3.2} d={3.2} h={0.4} color={C.white} o={sp} />
          <IsoBox pr={pr} x={-0.8} y={-0.8} z={0.4} w={1.6} d={1.6} h={(1.5 + lift) * sp} color={col} o={sp} />
          {win && lift > 0.1 && <IsoBox pr={pr} x={-0.25} y={-0.25} z={0.4 + (1.5 + lift) + 0.2 + Math.sin(frame * 0.08) * 0.15} w={0.5} d={0.5} h={0.5} color={C.amber} />}
        </Svg>
        <Fade o={sp} style={{ position: "absolute", left: ox + 420, top: 330, width: 420, fontFamily: F, fontWeight: 800, fontSize: 52, color: win ? C.indigo : C.ink }}>{s.h}</Fade>
        {s.items.map((it, i) => <div key={i} style={{ position: "absolute", left: ox + 420, top: 420 + i * 66, width: 420, fontFamily: F, fontWeight: 600, fontSize: 28, color: C.ink, opacity: p(a + 0.06 + i * 0.05, a + 0.1 + i * 0.05) }}>— {it}</div>)}
      </>
    );
  };
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      {side(left, 60, 0.08, winner === "left", "#94A3B8")}
      {side(right, 980, 0.4, winner === "right", C.indigo)}
      <div style={{ position: "absolute", left: 930, top: 520, width: 60, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 30, color: C.sub, opacity: p(0.3, 0.36) }}>vs</div>
    </>
  );
};

const Recap: React.FC<P<RecapProps>> = ({ dur, title, items, closer, ats }) => {
  const p = useP(dur);
  const at = spreadAts(items.length, 0.06, 0.7, ats);
  const n = items.length; const pr = iso(1450, 760, 70);
  const rowH = Math.min(70, 460 / Math.max(1, n));
  return (
    <>
      <Head p={p} kicker="Recap" title={title} w={1100} />
      <Svg>{items.map((_, i) => { const s = useSpr(dur, at[i]); return <IsoBox key={i} pr={pr} x={-1.5} y={-1.5} z={i * 0.55 + (1 - s) * 5} w={3} d={3} h={0.45} color={ACC[i % ACC.length]} o={Math.min(1, s * 2)} />; })}</Svg>
      {items.map((it, i) => <Fade key={i} o={p(at[i], at[i] + 0.05)} style={{ position: "absolute", left: 120, top: 290 + i * rowH, width: 1000, display: "flex", gap: 22, fontFamily: F, fontWeight: 700, fontSize: 34, color: C.ink }}><span style={{ color: ACC[i % ACC.length], fontWeight: 800, width: 44 }}>{String(i + 1).padStart(2, "0")}</span><span>{it}</span></Fade>)}
      {closer && <Fade o={p(0.8, 0.88)} style={{ position: "absolute", left: 120, top: 320 + n * rowH, width: 1100, fontFamily: F, fontWeight: 800, fontSize: 50, color: C.indigo }}>{closer}</Fade>}
    </>
  );
};

export const isoPack: StylePack = {
  id: "iso",
  name: "Isometric",
  Background: Background as StylePack["Background"],
  scenes: { title: Title as any, divider: Divider as any, statement: Statement as any, list: List as any, flow: Flow as any, chart: Chart as any, versus: Versus as any, recap: Recap as any },
  caption: { font: F, size: 32, weight: 700, color: C.white, bg: "rgba(30,27,75,0.88)", border: "none", radius: 14, bottom: 40, pad: "12px 32px" },
  transition: (i) => (i % 2 ? fade() : slide({ direction: "from-right" })) as never,
  transitionFrames: 16,
};
