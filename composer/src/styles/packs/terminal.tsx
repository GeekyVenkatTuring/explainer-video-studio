/**
 * TERMINAL — phosphor-green CRT console: near-black screen with scanlines and a slow scan beam,
 * monospace everything, `$ prompt` headings, typed output, box-drawn panels, blinking block cursor,
 * ASCII bar charts. JetBrains Mono only (system-installed). Semantic colours: green = ok/output,
 * amber = warning/highlight, cyan = info/path, red = error/loser.
 * Fits: dev tools, CLI/terminal topics, security, DevOps/SRE, hacking-culture, "under the hood" explainers.
 * (This replaces the legacy `primitives` dark look for terminal topics.)
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { useP } from "../../lib/primitives";
import { StylePack, SceneProps, spreadAts, TitleProps, DividerProps, StatementProps, ListProps, FlowProps, ChartProps, VersusProps, RecapProps } from "../core";

export const C = { bg: "#070B08", panel: "#0D140F", line: "#1F3A26", green: "#39FF88", dim: "#5F8F6C", amber: "#FFB627", cyan: "#4FD8FF", red: "#FF5C5C", text: "#D6F5DF" };
export const M = "'JetBrains Mono', 'Space Mono', Menlo, monospace";
type P<T> = SceneProps & T;

/** characters revealed so far for a string that starts typing at fraction `at` of the beat */
const typed = (p: (a: number, b: number) => number, s: string, at: number, span = 0.08) => s.slice(0, Math.round(s.length * p(at, at + span)));
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  return <span style={{ color: C.green, opacity: Math.floor(frame / 15) % 2 ? 0 : 1 }}>█</span>;
};
/** box-drawn panel with a title in the top border */
const Panel: React.FC<{ x: number; y: number; w: number; h: number; title?: string; color?: string; o?: number; children?: React.ReactNode }> = ({ x, y, w, h, title, color = C.line, o = 1, children }) => {
  if (o <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y + (1 - o) * 24, width: w, height: h, boxSizing: "border-box", border: `2px solid ${color}`, background: C.panel, opacity: o }}>
      {title && <div style={{ position: "absolute", left: 20, top: -17, padding: "0 10px", background: C.bg, fontFamily: M, fontWeight: 700, fontSize: 24, color: color === C.line ? C.dim : color, whiteSpace: "nowrap" }}>{title}</div>}
      {children}
    </div>
  );
};
const Head: React.FC<{ dur: number; kicker?: string; title: string }> = ({ dur, kicker, title }) => {
  const p = useP(dur);
  return (
    <>
      {kicker && <div style={{ position: "absolute", left: 110, top: 92, fontFamily: M, fontWeight: 700, fontSize: 26, color: C.amber, opacity: p(0, 0.03) }}># {kicker.toLowerCase()}</div>}
      <div style={{ position: "absolute", left: 110, top: 138, fontFamily: M, fontWeight: 800, fontSize: 60, color: C.green, whiteSpace: "nowrap" }}>
        <span style={{ color: C.dim }}>$ </span>{typed(p, title, 0.01, 0.06)}<Cursor />
      </div>
    </>
  );
};

// ---------------------------------------------------------------- background: CRT screen
const Background: React.FC<{ beat: number; dur?: number; meta?: { project?: string } }> = ({ beat, dur = 30, meta = {} }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const beam = (frame * 5) % 1300 - 110;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, #0E1A12 0%, ${C.bg} 75%)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 4px)" }} />
      <div style={{ position: "absolute", left: 0, top: beam, width: 1920, height: 110, background: "linear-gradient(180deg, transparent, rgba(57,255,136,0.06), transparent)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 42, borderBottom: `2px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 24px", fontFamily: M, fontWeight: 700, fontSize: 20, color: C.dim, gap: 24, boxSizing: "border-box" }}>
        <span style={{ color: C.green }}>●</span><span>{(meta.project ?? "explainer").toLowerCase().replace(/\s+/g, "-")}</span><span>part {beat + 1}</span>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: 1920 * p(0, 1), height: 6, background: C.green }} />
    </>
  );
};

// ---------------------------------------------------------------- the 8 archetypes
const Title: React.FC<P<TitleProps>> = ({ dur, kicker, title, subtitle }) => {
  const p = useP(dur);
  const lines = title.split("\n");
  return (
    <>
      <div style={{ position: "absolute", left: 130, top: 200, fontFamily: M, fontWeight: 700, fontSize: 30, color: C.dim, opacity: p(0, 0.03) }}>Last login: today on ttys001</div>
      {kicker && <div style={{ position: "absolute", left: 130, top: 260, fontFamily: M, fontWeight: 700, fontSize: 34, color: C.amber, opacity: p(0.02, 0.06) }}>[ {kicker.toUpperCase()} ]</div>}
      {lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: 130, top: 330 + i * 150, fontFamily: M, fontWeight: 800, fontSize: Math.min(120, Math.floor(1660 / (l.length * 0.62))), color: i ? C.green : C.text, whiteSpace: "nowrap" }}>
          {i === 0 && <span style={{ color: C.dim }}>$ </span>}{typed(p, l, 0.05 + i * 0.12, 0.1)}{i === lines.length - 1 && <Cursor />}
        </div>
      ))}
      {subtitle && <div style={{ position: "absolute", left: 130, top: 360 + lines.length * 150, fontFamily: M, fontWeight: 500, fontSize: 34, color: C.cyan, opacity: p(0.3, 0.4) }}>// {subtitle}</div>}
    </>
  );
};

const Divider: React.FC<P<DividerProps>> = ({ dur, n, total, title, sub }) => {
  const p = useP(dur);
  const bar = "█".repeat(n) + "░".repeat(Math.max(0, total - n));
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: M, fontWeight: 800, fontSize: 200, color: C.green, opacity: p(0, 0.05) }}>[{String(n).padStart(2, "0")}]</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", fontFamily: M, fontWeight: 800, fontSize: 80, color: C.text, whiteSpace: "nowrap", opacity: p(0.05, 0.12) }}>{title}</div>
      {sub && <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: M, fontWeight: 500, fontSize: 32, color: C.cyan, opacity: p(0.2, 0.3) }}>// {sub}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", fontFamily: M, fontWeight: 700, fontSize: 36, color: C.dim, opacity: p(0.25, 0.35) }}>[{bar}] {n}/{total}</div>
    </>
  );
};

const Statement: React.FC<P<StatementProps>> = ({ dur, kicker, lines, accent = -1, big, sub, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const at = spreadAts(lines.length, 0.03, 0.4, ats);
  return (
    <>
      {kicker && <div style={{ position: "absolute", left: 110, top: 92, fontFamily: M, fontWeight: 700, fontSize: 26, color: C.amber, opacity: p(0, 0.03) }}># {kicker.toLowerCase()}</div>}
      {lines.map((l, i) => {
        const acc = i === accent; const size = Math.min(84, Math.floor((big ? 1000 : 1650) / (l.length * 0.62)));
        return <div key={i} style={{ position: "absolute", left: 110, top: 170 + i * 130, fontFamily: M, fontWeight: 800, fontSize: size, color: acc ? C.amber : C.text, whiteSpace: "nowrap", opacity: p(at[i], at[i] + 0.02) }}>
          <span style={{ color: C.dim }}>&gt; </span>{typed(p, l, at[i], 0.06)}
        </div>;
      })}
      {big && <Panel x={1210} y={220} w={600} h={340} title="result" color={C.green} o={p(0.34, 0.4)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: M, fontWeight: 800, fontSize: Math.min(120, Math.floor(520 / (big.length * 0.62))), color: C.green, opacity: 0.85 + 0.15 * Math.sin(frame * 0.12) }}>{big}</div>
      </Panel>}
      {sub && <div style={{ position: "absolute", left: 110, top: 200 + lines.length * 130, width: 1500, fontFamily: M, fontWeight: 500, fontSize: 30, color: C.cyan, opacity: p(0.5, 0.62) }}>// {sub}</div>}
    </>
  );
};

const List: React.FC<P<ListProps>> = ({ dur, kicker, title, items, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const at = spreadAts(items.length, 0.1, 0.72, ats);
  const rowH = Math.min(110, Math.floor(620 / items.length));
  const hot = p(0.85, 0.86) > 0.5 ? Math.floor(frame / 40) % items.length : -1;
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      {items.map((it, i) => (
        <Panel key={i} x={110} y={270 + i * rowH} w={1700} h={rowH - 18} color={hot === i ? C.amber : C.line} o={p(at[i], at[i] + 0.04)}>
          <div style={{ position: "absolute", left: 24, top: 0, height: "100%", display: "flex", alignItems: "center", gap: 26, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: M, fontWeight: 800, fontSize: 34, color: C.green }}>[{hot === i ? "x" : "✓"}]</span>
            <span style={{ fontFamily: M, fontWeight: 800, fontSize: Math.min(42, rowH * 0.42), color: C.text }}>{it.h}</span>
            {it.d && <span style={{ fontFamily: M, fontWeight: 500, fontSize: 24, color: C.dim }}># {it.d}</span>}
          </div>
        </Panel>
      ))}
    </>
  );
};

const Flow: React.FC<P<FlowProps>> = ({ dur, kicker, title, steps, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const n = steps.length; const at = spreadAts(n, 0.1, 0.72, ats);
  const W = Math.floor((1700 - (n - 1) * 60) / n); const X = (i: number) => 110 + i * (W + 60);
  const active = p(at[n - 1] + 0.05, at[n - 1] + 0.06) > 0.5 ? Math.floor(frame / 30) % n : -1;
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      {steps.map((st, i) => (
        <React.Fragment key={i}>
          <Panel x={X(i)} y={330} w={W} h={380} title={`step_${i + 1}`} color={active === i ? C.amber : C.green} o={p(at[i], at[i] + 0.04)}>
            <div style={{ position: "absolute", left: 20, top: 40, width: W - 40, fontFamily: M, fontWeight: 800, fontSize: W > 300 ? 38 : 30, color: C.text, lineHeight: 1.1 }}>{st.h}</div>
            {st.d && <div style={{ position: "absolute", left: 20, top: 200, width: W - 40, fontFamily: M, fontWeight: 500, fontSize: 21, color: C.dim, lineHeight: 1.35 }}>{st.d}</div>}
          </Panel>
          {i < n - 1 && <div style={{ position: "absolute", left: X(i) + W + 6, top: 500, width: 48, textAlign: "center", fontFamily: M, fontWeight: 800, fontSize: 40, color: C.green, opacity: p(at[i + 1], at[i + 1] + 0.02) }}>|&gt;</div>}
        </React.Fragment>
      ))}
    </>
  );
};

const Chart: React.FC<P<ChartProps>> = ({ dur, kicker, title, type, unit = "", note, points = [], bars = [], marks = [], ats }) => {
  const p = useP(dur);
  const X0 = 240, X1 = 1700, Y0 = 820, Y1 = 330;
  const noteEl = note && <div style={{ position: "absolute", left: X0, top: 890, fontFamily: M, fontWeight: 500, fontSize: 22, color: C.dim, opacity: p(0.1, 0.2) }}># {note}</div>;
  if (type === "bar") {
    const at = spreadAts(bars.length, 0.12, 0.7, ats);
    const max = Math.max(...bars.map((b) => b.value), 1);
    const rowH = Math.min(96, Math.floor((Y0 - Y1 + 60) / Math.max(1, bars.length)));
    return (
      <>
        <Head dur={dur} kicker={kicker} title={title} />
        {bars.map((b, i) => {
          const o = p(at[i], at[i] + 0.05); const cells = Math.round(40 * (b.value / max) * o);
          return <div key={i} style={{ position: "absolute", left: 110, top: 290 + i * rowH, width: 1700, fontFamily: M, fontWeight: 700, fontSize: Math.min(36, rowH * 0.4), color: C.text, whiteSpace: "nowrap", opacity: Math.min(1, o * 4) }}>
            <span style={{ display: "inline-block", width: 380, color: C.cyan }}>{b.label}</span>
            <span style={{ color: i === 0 ? C.amber : C.green }}>{"█".repeat(cells)}</span>
            <span style={{ color: C.dim }}> {b.value.toLocaleString("en-US")}{unit}</span>
          </div>;
        })}
        {noteEl}
      </>
    );
  }
  const xmin = Math.min(...points.map((q) => q.x)), xmax = Math.max(...points.map((q) => q.x)), ymax = Math.max(...points.map((q) => q.y)) * 1.1;
  const X = (v: number) => X0 + ((v - xmin) / (xmax - xmin || 1)) * (X1 - X0), Y = (v: number) => Y0 - (v / (ymax || 1)) * (Y0 - Y1);
  const k = Math.max(2, Math.round(points.length * p(0.1, 0.7)));
  const pts = points.slice(0, k).map((q) => `${X(q.x)},${Y(q.y)}`).join(" ");
  const mAt = spreadAts(marks.length, 0.35, 0.75, marks.map((m) => m.at) as number[]);
  const yAt = (xv: number) => points.reduce((b, q) => (Math.abs(q.x - xv) < Math.abs(b.x - xv) ? q : b), points[0]).y;
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      <Panel x={X0 - 60} y={Y1 - 50} w={X1 - X0 + 120} h={Y0 - Y1 + 110} title={note ?? "plot"} o={p(0.02, 0.08)} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={X0} x2={X1} y1={Y0 - f * (Y0 - Y1)} y2={Y0 - f * (Y0 - Y1)} stroke={C.line} strokeWidth={1} strokeDasharray="4 8" />)}
        <polyline points={pts} fill="none" stroke={C.green} strokeWidth={5} strokeLinejoin="round" />
      </svg>
      {marks.map((m, i) => {
        const o = p(mAt[i], mAt[i] + 0.04);
        return <React.Fragment key={i}>
          <div style={{ position: "absolute", left: X(m.x) - 10, top: Y(yAt(m.x)) - 10, width: 20, height: 20, background: C.amber, opacity: o }} />
          <div style={{ position: "absolute", left: X(m.x) - 140, top: Y(yAt(m.x)) - 64, fontFamily: M, fontWeight: 700, fontSize: 26, color: C.amber, whiteSpace: "nowrap", opacity: o }}>&gt; {m.label}</div>
        </React.Fragment>;
      })}
    </>
  );
};

const Versus: React.FC<P<VersusProps>> = ({ dur, kicker, title, left, right, winner }) => {
  const p = useP(dur);
  const side = (s: { h: string; items: string[] }, x: number, a: number, w: boolean) => {
    const won = winner ? (w ? p(0.8, 0.82) > 0.5 : false) : false;
    const col = won ? C.green : winner && p(0.8, 0.82) > 0.5 ? C.red : C.cyan;
    return (
      <Panel x={x} y={280} w={800} h={540} title={s.h.toLowerCase().replace(/\s+/g, "_")} color={col} o={p(a, a + 0.05)}>
        {s.items.map((it, i) => <div key={i} style={{ position: "absolute", left: 34, top: 50 + i * 80, width: 730, fontFamily: M, fontWeight: 700, fontSize: 28, color: C.text, opacity: p(a + 0.06 + i * 0.05, a + 0.1 + i * 0.05) }}>
          <span style={{ color: col }}>{won ? "[+]" : "[ ]"}</span> {it}
        </div>)}
      </Panel>
    );
  };
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      {side(left, 110, 0.08, winner === "left")}
      {side(right, 1010, 0.4, winner === "right")}
      <div style={{ position: "absolute", left: 910, top: 520, width: 100, textAlign: "center", fontFamily: M, fontWeight: 800, fontSize: 40, color: C.amber, opacity: p(0.3, 0.36) }}>vs</div>
    </>
  );
};

const Recap: React.FC<P<RecapProps>> = ({ dur, title, items, closer, ats }) => {
  const p = useP(dur);
  const at = spreadAts(items.length, 0.06, 0.7, ats);
  const rowH = Math.min(66, 460 / Math.max(1, items.length));
  return (
    <Panel x={230} y={150} w={1460} h={760} title="~/recap.md" color={C.green} o={p(0, 0.05)}>
      <div style={{ position: "absolute", left: 44, top: 40, fontFamily: M, fontWeight: 800, fontSize: 56, color: C.green }}><span style={{ color: C.dim }}>$ </span>{title}</div>
      {items.map((it, i) => <div key={i} style={{ position: "absolute", left: 48, top: 150 + i * rowH, fontFamily: M, fontWeight: 700, fontSize: 30, color: C.text, opacity: p(at[i], at[i] + 0.05) }}><span style={{ color: C.amber }}>{String(i + 1).padStart(2, "0")}</span>  {it}</div>)}
      {closer && <div style={{ position: "absolute", left: 48, top: 170 + items.length * rowH, fontFamily: M, fontWeight: 800, fontSize: 34, color: C.green, opacity: p(0.8, 0.86) }}>&gt; {closer} <Cursor /></div>}
    </Panel>
  );
};

export const terminal: StylePack = {
  id: "terminal",
  name: "Terminal",
  Background: Background as StylePack["Background"],
  scenes: { title: Title as any, divider: Divider as any, statement: Statement as any, list: List as any, flow: Flow as any, chart: Chart as any, versus: Versus as any, recap: Recap as any },
  caption: { font: M, size: 30, weight: 700, color: C.green, bg: "rgba(7,11,8,0.92)", border: `2px solid ${C.line}`, radius: 0, bottom: 44, pad: "10px 28px" },
  transition: (i) => (i % 3 === 0 ? slide({ direction: "from-bottom" }) : fade()) as never,
  transitionFrames: 10,
};
