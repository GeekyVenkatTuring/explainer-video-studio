/**
 * LEDGER — the analyst's worksheet. A light spreadsheet sheet (column letters, row numbers, formula
 * bar, sheet tabs) is the stage; the recurring motif is the violet CELL CURSOR (the agent touching
 * data) plus a yellow HIGHLIGHTER swipe that marks verified facts and provenance chips [src · p4].
 * Semantic colours: PDF = orange · Excel = green · SQL = blue · agent/LLM = violet · error = crimson.
 * Fits: data engineering, analytics, agents-over-data, finance workflows, spreadsheets, BI.
 * Implements the 8 generic archetypes; x_* scenes live in ./ledger-x.tsx.
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { wipe } from "@remotion/transitions/wipe";
import { scaleLinear } from "d3-scale";
import { useP, rnd } from "../../lib/primitives";
import { StylePack, SceneProps, spreadAts, TitleProps, DividerProps, StatementProps, ListProps, FlowProps, ChartProps, VersusProps, RecapProps } from "../core";

export const L = {
  paper: "#F6F5F0", paper2: "#EFEDE4", grid: "#E2DFD3", gut: "#E8E5DA", gutText: "#9A968A",
  ink: "#17212B", muted: "#56606B", faint: "#8C929A", white: "#FFFFFF",
  pdf: "#E8590C", xls: "#1F7A4D", sql: "#2E62C9", llm: "#6D46C9", hi: "#FFE066", bad: "#C2255C",
};
export const SANS = "'IBM Plex Sans', Inter, 'Helvetica Neue', sans-serif";
export const MONO = "'IBM Plex Mono', 'JetBrains Mono', Menlo, monospace";
/** semantic tone name → colour ("pdf" | "xls" | "sql" | "llm" | "bad" | "ink" | raw hex) */
export const tone = (c?: string) => (c && (L as Record<string, string>)[c]) || c || L.ink;
export const tint = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
export type PFn = (a: number, b: number) => number;
const abs = "absolute" as const;

// ---------------------------------------------------------------- sheet geometry
export const GX = 52, GY = 76, CW = 132, CH = 44;          // gutter widths + cell size
const COLS = "ABCDEFGHIJKLMNOP";
const cellRef = (c: number, r: number) => `${COLS[c % COLS.length]}${r + 1}`;

// ---------------------------------------------------------------- background: the worksheet
const Background: React.FC<{ beat: number; total: number; meta?: { project?: string; code?: string; issue?: string }; dur?: number }> = ({ beat, total, meta = {}, dur = 20 }) => {
  const frame = useCurrentFrame();
  // agent cursor: hops between deterministic cells every 46 frames, eased over 12
  const k = Math.floor(frame / 46), f = Math.min(1, (frame % 46) / 12), e = 1 - Math.pow(1 - f, 3);
  const at = (i: number) => ({ c: Math.floor(rnd(i, beat, 3) * 14), r: Math.floor(rnd(i, beat, 7) * 21) });
  const a = at(k - 1), b = at(k);
  const cx = GX + (a.c + (b.c - a.c) * e) * CW, cy = GY + (a.r + (b.r - a.r) * e) * CH;
  const prog = Math.min(1, frame / Math.max(1, dur * 30));
  const sweep = ((frame * 3) % 1400) - 200;                 // slow "recalc" band down the sheet
  return (
    <>
      <div style={{ position: abs, inset: 0, background: L.paper }} />
      <div style={{ position: abs, left: GX, top: GY, right: 0, bottom: 44, backgroundImage: `linear-gradient(${L.grid} 1px, transparent 1px), linear-gradient(90deg, ${L.grid} 1px, transparent 1px)`, backgroundSize: `${CW}px ${CH}px` }} />
      <div style={{ position: abs, left: GX, right: 0, top: GY + sweep, height: 120, background: `linear-gradient(180deg, transparent, ${tint(L.llm, 0.035)}, transparent)` }} />
      {/* agent cursor (motif) */}
      <div style={{ position: abs, left: cx - 1, top: cy - 1, width: CW + 2, height: CH + 2, border: `2.5px solid ${tint(L.llm, 0.45)}` }}>
        <div style={{ position: abs, right: -6, bottom: -6, width: 9, height: 9, background: tint(L.llm, 0.6) }} />
      </div>
      {/* column letters + row numbers */}
      <div style={{ position: abs, left: 0, top: 0, right: 0, height: 30, background: L.gut, borderBottom: `1px solid ${L.grid}` }} />
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} style={{ position: abs, left: GX + i * CW, top: 0, width: CW, height: 30, borderLeft: `1px solid ${L.grid}`, textAlign: "center", fontFamily: MONO, fontSize: 16, lineHeight: "30px", color: i === Math.round((cx - GX) / CW) ? L.llm : L.gutText }}>{COLS[i]}</div>
      ))}
      <div style={{ position: abs, left: 0, top: GY, width: GX, bottom: 44, background: L.gut, borderRight: `1px solid ${L.grid}` }} />
      {Array.from({ length: 22 }).map((_, i) => (
        <div key={i} style={{ position: abs, left: 0, top: GY + i * CH, width: GX, height: CH, textAlign: "center", fontFamily: MONO, fontSize: 15, lineHeight: `${CH}px`, color: i === Math.round((cy - GY) / CH) ? L.llm : L.gutText }}>{i + 1}</div>
      ))}
      {/* formula bar */}
      <div style={{ position: abs, left: 0, top: 30, right: 0, height: 46, background: L.white, borderBottom: `1.5px solid ${L.grid}` }} />
      <div style={{ position: abs, left: 10, top: 36, width: 150, height: 34, border: `1px solid ${L.grid}`, fontFamily: MONO, fontSize: 19, lineHeight: "34px", paddingLeft: 12, color: L.ink }}>{cellRef(b.c, b.r)}</div>
      <div style={{ position: abs, left: 176, top: 36, fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 24, lineHeight: "34px", color: L.faint }}>fx</div>
      <div style={{ position: abs, left: 214, top: 36, width: 1500, fontFamily: MONO, fontSize: 19, lineHeight: "34px", color: L.muted, whiteSpace: "nowrap", overflow: "hidden" }}>
        =HARNESS("{meta.project ?? "data"}"{meta.issue ? `, "${meta.issue}"` : ""}, step {beat + 1} of {total}){frame % 30 < 16 ? "▏" : ""}
      </div>
      {/* sheet tabs + scene progress */}
      <div style={{ position: abs, left: 0, right: 0, bottom: 0, height: 44, background: L.gut, borderTop: `1.5px solid ${L.grid}` }} />
      {[meta.project ?? "analysis", "facts", "metrics", "memory"].map((t, i) => (
        <div key={t} style={{ position: abs, left: 60 + i * 190, bottom: 0, width: 180, height: 40, background: i === 0 ? L.white : "transparent", borderLeft: `1px solid ${L.grid}`, borderRight: `1px solid ${L.grid}`, borderBottom: i === 0 ? `3px solid ${L.xls}` : "none", fontFamily: MONO, fontSize: 17, lineHeight: "40px", textAlign: "center", color: i === 0 ? L.ink : L.gutText, whiteSpace: "nowrap", overflow: "hidden" }}>{t}</div>
      ))}
      <div style={{ position: abs, right: 40, bottom: 12, width: 520, height: 18, border: `1px solid ${L.grid}`, background: L.white }}>
        <div style={{ width: `${prog * 100}%`, height: "100%", background: tint(L.xls, 0.75) }} />
      </div>
      <div style={{ position: abs, right: 574, bottom: 9, fontFamily: MONO, fontSize: 17, color: L.muted }}>{meta.code ?? "DH"} · {String(beat + 1).padStart(2, "0")}/{total}</div>
    </>
  );
};

// ---------------------------------------------------------------- shared parts
export const Head: React.FC<{ p: PFn; kicker?: string; title: string }> = ({ p, kicker, title }) => (
  <>
    {kicker && <div style={{ position: abs, left: 110, top: 100, width: 1600, fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: 2, color: L.llm, opacity: p(0, 0.04) }}>▸ {kicker.toUpperCase()}</div>}
    <div style={{ position: abs, left: 108, top: 130, width: 1700, fontFamily: SANS, fontWeight: 700, fontSize: 54, lineHeight: 1.1, letterSpacing: -1, color: L.ink, whiteSpace: "nowrap", opacity: p(0.01, 0.06), transform: `translateY(${(1 - p(0.01, 0.06)) * 18}px)` }}>{title}</div>
    <div style={{ position: abs, left: 110, top: 204, height: 4, width: 180 * p(0.03, 0.1), background: L.ink }} />
  </>
);
/** highlighter swipe behind inline text */
export const Hi: React.FC<{ p: number; children: React.ReactNode; color?: string }> = ({ p, children, color = L.hi }) => (
  <span style={{ backgroundImage: `linear-gradient(90deg, ${color} ${p * 100}%, transparent ${p * 100}%)`, padding: "0 10px", margin: "0 -10px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{children}</span>
);
/** a white cell panel with a coloured header strip */
export const Panel: React.FC<{ x: number; y: number; w: number; h: number; o: number; c?: string; label?: string; right?: string; children?: React.ReactNode; strong?: boolean }> = ({ x, y, w, h, o, c = "ink", label, right, children, strong }) => (
  <div style={{ position: abs, left: x, top: y, width: w, height: h, opacity: o, transform: `translateY(${(1 - o) * 16}px)`, background: L.white, border: `${strong ? 3 : 2}px solid ${tone(c)}`, boxShadow: `6px 6px 0 ${tint(L.ink, 0.1)}` }}>
    {label !== undefined && (
      <div style={{ height: 36, background: tone(c), color: L.white, fontFamily: MONO, fontWeight: 600, fontSize: 19, lineHeight: "36px", padding: "0 14px", display: "flex", justifyContent: "space-between", whiteSpace: "nowrap", overflow: "hidden" }}>
        <span>{label}</span>{right && <span style={{ opacity: 0.85 }}>{right}</span>}
      </div>
    )}
    {children}
  </div>
);
/** selection cursor (motif) around a rect; pulses gently */
export const Sel: React.FC<{ x: number; y: number; w: number; h: number; o: number; c?: string }> = ({ x, y, w, h, o, c = L.llm }) => {
  const frame = useCurrentFrame();
  if (o <= 0) return null;
  return (
    <div style={{ position: abs, left: x - 5, top: y - 5, width: w + 10, height: h + 10, border: `3px solid ${c}`, opacity: o * (0.75 + 0.25 * Math.sin(frame * 0.12)), pointerEvents: "none" }}>
      <div style={{ position: abs, right: -7, bottom: -7, width: 11, height: 11, background: c, border: `2px solid ${L.white}` }} />
    </div>
  );
};
/** provenance chip [src · locator] */
export const Chip: React.FC<{ children: React.ReactNode; c?: string; o?: number; size?: number }> = ({ children, c = "ink", o = 1, size = 19 }) => (
  <span style={{ display: "inline-block", fontFamily: MONO, fontSize: size, fontWeight: 600, color: tone(c), border: `1.5px solid ${tone(c)}`, background: tint(tone(c), 0.07), padding: "1px 8px", opacity: o, whiteSpace: "nowrap" }}>{children}</span>
);
export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: abs, left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
    <defs>
      <marker id="lgA" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={L.ink} /></marker>
    </defs>
    {children}
  </svg>
);
/** an arrow that draws on (p) then carries packets forever */
export const Pipe: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; c?: string; seed?: number; dash?: boolean }> = ({ x1, y1, x2, y2, p, c = L.ink, seed = 0, dash }) => {
  const frame = useCurrentFrame();
  if (p <= 0) return null;
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  return (
    <g>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={c} strokeWidth={2.5} strokeDasharray={dash ? "8 8" : undefined} markerEnd={p >= 1 ? "url(#lgA)" : undefined} />
      {p >= 1 && [0, 0.34, 0.67].map((kk) => {
        const t = (frame * 0.011 + kk + seed * 0.13) % 1;
        return <rect key={kk} x={x1 + (x2 - x1) * t - 6} y={y1 + (y2 - y1) * t - 6} width={12} height={12} fill={c} opacity={Math.sin(t * Math.PI)} />;
      })}
    </g>
  );
};
const fitSize = (text: string, width: number, max: number, k = 0.55) => Math.min(max, Math.floor(width / Math.max(1, text.length * k)));

// ================================================================ generic archetypes
type P<T> = SceneProps & T;

const Title: React.FC<P<TitleProps>> = ({ dur, kicker, title, subtitle }) => {
  const p = useP(dur);
  const lines = title.split("\n");
  const src = [["PDF", "pdf"], ["EXCEL", "xls"], ["SQL", "sql"], ["HARNESS", "llm"], ["ANSWER ✓", "ink"]];
  return (
    <>
      <div style={{ position: abs, left: 0, right: 0, top: 200, textAlign: "center", fontFamily: MONO, fontSize: 28, fontWeight: 600, color: L.llm, letterSpacing: 3, opacity: p(0.01, 0.06) }}>= {(kicker ?? "").toUpperCase()}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ position: abs, left: 0, right: 0, top: 262 + i * 134, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 122, letterSpacing: -3, lineHeight: 1.05, color: L.ink, opacity: p(0.03 + i * 0.05, 0.1 + i * 0.05), transform: `translateY(${(1 - p(0.03 + i * 0.05, 0.1 + i * 0.05)) * 30}px)` }}>
          {i === lines.length - 1 && lines.length > 1 ? <Hi p={p(0.14, 0.26)}>{l}</Hi> : l}
        </div>
      ))}
      <Sel x={330} y={250} w={1260} h={lines.length * 134 + 30} o={p(0.1, 0.16)} />
      {subtitle && <div style={{ position: abs, left: 260, width: 1400, top: 290 + lines.length * 134, textAlign: "center", fontFamily: SANS, fontSize: 36, color: L.muted, opacity: p(0.18, 0.28) }}>{subtitle}</div>}
      <Svg>
        {src.slice(0, 4).map((_, i) => <Pipe key={i} x1={280 + i * 290 + 200} y1={810} x2={280 + (i + 1) * 290} y2={810} p={p(0.3 + i * 0.05, 0.36 + i * 0.05)} c={tone(src[i + 1][1])} seed={i} />)}
      </Svg>
      {src.map(([h, c], i) => (
        <div key={h} style={{ position: abs, left: 280 + i * 290, top: 770, width: 200, height: 80, background: L.white, border: `2.5px solid ${tone(c)}`, boxShadow: `5px 5px 0 ${tint(L.ink, 0.1)}`, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: tone(c), display: "flex", alignItems: "center", justifyContent: "center", opacity: p(0.28 + i * 0.05, 0.33 + i * 0.05) }}>{h}</div>
      ))}
    </>
  );
};

const Divider: React.FC<P<DividerProps>> = ({ dur, n, total, title, sub }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const sweep = (frame * 4) % 420;
  return (
    <>
      <div style={{ position: abs, left: 110, top: 290, width: 330, height: 440, background: L.gut, border: `2px solid ${L.grid}`, overflow: "hidden", opacity: p(0, 0.08) }}>
        <div style={{ position: abs, left: 0, right: 0, top: sweep, height: 20, background: tint(L.llm, 0.12) }} />
        <div style={{ position: abs, left: 0, right: 0, top: 40, textAlign: "center", fontFamily: MONO, fontSize: 30, letterSpacing: 8, color: L.muted }}>PART</div>
        <div style={{ position: abs, left: 0, right: 0, top: 90, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 230, lineHeight: 1, color: L.llm }}>{String(n).padStart(2, "0")}</div>
        <div style={{ position: abs, left: 0, right: 0, top: 360, textAlign: "center", fontFamily: MONO, fontSize: 24, color: L.muted }}>of {String(total).padStart(2, "0")}</div>
      </div>
      <div style={{ position: abs, left: 500, top: 350, width: 1310, fontFamily: SANS, fontWeight: 700, fontSize: 96, letterSpacing: -2, lineHeight: 1.05, color: L.ink, opacity: p(0.08, 0.2), transform: `translateX(${(1 - p(0.08, 0.2)) * 40}px)` }}>
        <Hi p={p(0.2, 0.4)}>{title}</Hi>
      </div>
      {sub && <div style={{ position: abs, left: 500, top: 490, width: 1300, fontFamily: SANS, fontSize: 36, color: L.muted, opacity: p(0.25, 0.4) }}>{sub}</div>}
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ position: abs, left: 500 + i * 170, top: 640, width: 160, height: 46, background: i + 1 === n ? L.white : L.gut, border: `1.5px solid ${i + 1 === n ? L.ink : L.grid}`, borderBottom: i + 1 === n ? `4px solid ${L.llm}` : undefined, fontFamily: MONO, fontSize: 19, lineHeight: "44px", textAlign: "center", color: i + 1 <= n ? L.ink : L.faint, opacity: p(0.3 + i * 0.02, 0.36 + i * 0.02) }}>part {i + 1}</div>
      ))}
      <Sel x={500 + (n - 1) * 170} y={640} w={160} h={46} o={p(0.45, 0.5)} />
    </>
  );
};

const Statement: React.FC<P<StatementProps>> = ({ dur, kicker, lines, accent = -1, big, sub, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const at = spreadAts(lines.length, 0.04, 0.4, ats);
  const W = big ? 1060 : 1640;
  const size = Math.min(84, ...lines.map((l) => fitSize(l, W, 84, 0.53)));
  const rowH = size * 1.42;
  const top = 250;
  const lastShown = at.filter((a) => p(a, a + 0.01) > 0.5).length - 1;
  return (
    <>
      {kicker && <div style={{ position: abs, left: 110, top: 150, fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: 2, color: L.llm, opacity: p(0, 0.05) }}>▸ {kicker.toUpperCase()}</div>}
      {lines.map((l, i) => (
        <React.Fragment key={i}>
          <div style={{ position: abs, left: 110, top: top + i * rowH + size * 0.3, width: 56, fontFamily: MONO, fontSize: 22, color: L.faint, opacity: p(at[i], at[i] + 0.05) }}>{String(i + 1).padStart(2, "0")}</div>
          <div style={{ position: abs, left: 180, top: top + i * rowH, width: W, fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -1.5, lineHeight: 1.2, color: i === accent ? L.ink : L.ink, opacity: p(at[i], at[i] + 0.06), transform: `translateY(${(1 - p(at[i], at[i] + 0.06)) * 22}px)` }}>
            {i === accent ? <Hi p={p(at[i] + 0.05, at[i] + 0.14)}>{l}</Hi> : l}
            {i === lastShown && !big && <span style={{ color: L.llm, opacity: frame % 30 < 16 ? 1 : 0 }}>▏</span>}
          </div>
        </React.Fragment>
      ))}
      {big && (
        <Panel x={1300} y={250} w={500} h={330} o={p(0.3, 0.4)} c="llm" label="RESULT CELL" right="fx">
          <div style={{ position: abs, left: 0, right: 0, top: 36, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: fitSize(big, 440, 118, 0.62), color: L.llm }}>{big}</div>
        </Panel>
      )}
      {big && <Sel x={1300} y={250} w={500} h={330} o={p(0.42, 0.46)} />}
      {sub && (
        <div style={{ position: abs, left: 180, top: Math.max(top + lines.length * rowH + 40, big ? 640 : 0), width: 1600, borderLeft: `6px solid ${L.llm}`, paddingLeft: 24, fontFamily: SANS, fontSize: 38, lineHeight: 1.3, color: L.muted, opacity: p(0.46, 0.58) }}>{sub}</div>
      )}
    </>
  );
};

const List: React.FC<P<ListProps>> = ({ dur, kicker, title, items, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const at = spreadAts(items.length, 0.1, 0.72, ats);
  const n = items.length;
  const rowH = Math.min(104, Math.floor(600 / n));
  const Y0 = 290, X = 110, W = 1700;
  const shown = at.filter((a) => p(a, a + 0.01) > 0.5).length;
  const allDone = p(at[n - 1] + 0.1, at[n - 1] + 0.11) > 0.5;
  const cur = allDone ? Math.floor(frame / 40) % n : shown - 1;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <div style={{ position: abs, left: X, top: Y0 - 44, width: W, height: 44, background: L.gut, border: `1.5px solid ${L.grid}`, display: "flex", fontFamily: MONO, fontSize: 19, color: L.muted, lineHeight: "42px", opacity: p(0.04, 0.1) }}>
        <div style={{ width: 80, textAlign: "center" }}>#</div><div style={{ width: 600, paddingLeft: 18 }}>ITEM</div><div style={{ flex: 1, paddingLeft: 18 }}>WHAT IT MEANS</div><div style={{ width: 90, textAlign: "center" }}>OK</div>
      </div>
      {items.map((it, i) => {
        const o = p(at[i], at[i] + 0.05);
        return (
          <div key={i} style={{ position: abs, left: X, top: Y0 + i * rowH, width: W, height: rowH, background: L.white, borderLeft: `1.5px solid ${L.grid}`, borderRight: `1.5px solid ${L.grid}`, borderBottom: `1.5px solid ${L.grid}`, display: "flex", alignItems: "center", opacity: o, transform: `translateX(${(1 - o) * 30}px)` }}>
            <div style={{ width: 80, textAlign: "center", fontFamily: MONO, fontSize: 24, color: L.faint }}>{i + 1}</div>
            <div style={{ width: 600, paddingLeft: 18, fontFamily: SANS, fontWeight: 700, fontSize: rowH > 80 ? 36 : 31, color: L.ink, lineHeight: 1.1 }}>{it.h}</div>
            <div style={{ flex: 1, paddingLeft: 18, paddingRight: 12, fontFamily: SANS, fontSize: rowH > 80 ? 27 : 24, color: L.muted, lineHeight: 1.3 }}>{it.d}</div>
            <div style={{ width: 90, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 32, color: L.xls, opacity: p(at[i] + 0.04, at[i] + 0.07) }}>✓</div>
          </div>
        );
      })}
      {cur >= 0 && <Sel x={X} y={Y0 + cur * rowH} w={W} h={rowH} o={1} />}
    </>
  );
};

const Flow: React.FC<P<FlowProps>> = ({ dur, kicker, title, steps, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const n = steps.length;
  const at = spreadAts(n, 0.1, 0.72, ats);
  const W = Math.min(270, Math.floor((1640 - (n - 1) * 70) / n));
  const gap = n > 1 ? (1640 - n * W) / (n - 1) : 0;
  const X = (i: number) => 140 + i * (W + gap);
  const Y = 390, H = 210;
  const done = p(at[n - 1] + 0.08, at[n - 1] + 0.09) > 0.5;
  const shown = at.filter((a) => p(a, a + 0.01) > 0.5).length;
  const cur = done ? Math.floor(frame / 45) % n : shown - 1;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>{steps.slice(0, -1).map((_, i) => <Pipe key={i} x1={X(i) + W + 8} y1={Y + H / 2 + 18} x2={X(i + 1) - 10} y2={Y + H / 2 + 18} p={p(at[i + 1] - 0.03, at[i + 1])} c={L.llm} seed={i} />)}</Svg>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <Panel x={X(i)} y={Y} w={W} h={H} o={p(at[i], at[i] + 0.05)} c={i === cur ? "llm" : "ink"} label={`STEP ${String(i + 1).padStart(2, "0")}`}>
            <div style={{ position: abs, left: 14, right: 14, top: 36, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: fitSize(s.h, W * 1.6, 38, 0.5), lineHeight: 1.12, color: L.ink }}>{s.h}</div>
          </Panel>
          {s.d && <div style={{ position: abs, left: X(i), top: Y + H + 26, width: W, fontFamily: SANS, fontSize: 24, lineHeight: 1.35, color: L.muted, opacity: p(at[i] + 0.03, at[i] + 0.08) }}>{s.d}</div>}
        </React.Fragment>
      ))}
      {cur >= 0 && <Sel x={X(cur)} y={Y} w={W} h={H} o={1} />}
    </>
  );
};

const Chart: React.FC<P<ChartProps>> = ({ dur, kicker, title, type, unit = "", note, points = [], bars = [], marks = [], ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const X0 = 250, X1 = 1760, Y0 = 790, Y1 = 300;
  const grid = (ticks: number[], y: (v: number) => number) => ticks.map((v) => (
    <g key={v} opacity={p(0.04, 0.1)}>
      <line x1={X0} x2={X1} y1={y(v)} y2={y(v)} stroke={L.grid} strokeWidth={1.5} />
      <text x={X0 - 16} y={y(v) + 7} textAnchor="end" fontFamily={MONO} fontSize={20} fill={L.muted}>{v}{unit}</text>
    </g>
  ));
  const noteEl = note && <div style={{ position: abs, left: X0, top: 868, width: 1500, fontFamily: MONO, fontSize: 20, color: L.muted, opacity: p(0.1, 0.2) }}>{note}</div>;
  if (type === "bar") {
    const at = spreadAts(bars.length, 0.12, 0.7, ats);
    const max = Math.max(...bars.map((b) => b.value), 1);
    const y = scaleLinear().domain([0, max * 1.12]).range([Y0, Y1]);
    const n = bars.length, W = Math.min(190, 1100 / n), gap = (X1 - X0 - n * W) / n;
    const shown = at.filter((a) => p(a, a + 0.01) > 0.5).length;
    const cur = shown === n ? Math.floor(frame / 40) % n : shown - 1;
    return (
      <>
        <Head p={p} kicker={kicker} title={title} />
        {noteEl}
        <Svg>
          {grid(y.ticks(4), y)}
          <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke={L.ink} strokeWidth={2.5} />
          {bars.map((b, i) => {
            const g = p(at[i], at[i] + 0.08);
            const x = X0 + gap / 2 + i * (W + gap);
            const h = (Y0 - y(b.value)) * g;
            const c = tone((b as { c?: string }).c ?? (i % 2 ? "llm" : "ink"));
            return (
              <g key={i}>
                <rect x={x} y={Y0 - h} width={W} height={h} fill={tint(c, 0.85)} stroke={c} strokeWidth={2} />
                {cur === i && <rect x={x - 6} y={Y0 - h - 6} width={W + 12} height={h + 12} fill="none" stroke={L.llm} strokeWidth={3} />}
                <text x={x + W / 2} y={Y0 - h - 16} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={c} opacity={p(at[i] + 0.05, at[i] + 0.09)}>{b.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}{unit}</text>
                <text x={x + W / 2} y={Y0 + 40} textAnchor="middle" fontFamily={MONO} fontWeight={600} fontSize={W > 150 ? 21 : 19} fill={L.ink} opacity={p(at[i], at[i] + 0.04)}>{b.label}</text>
              </g>
            );
          })}
        </Svg>
      </>
    );
  }
  const xmin = Math.min(...points.map((q) => q.x)), xmax = Math.max(...points.map((q) => q.x));
  const ymax = Math.max(...points.map((q) => q.y)) * 1.15;
  const x = scaleLinear().domain([xmin, xmax]).range([X0 + 20, X1 - 20]);
  const y = scaleLinear().domain([0, ymax]).range([Y0, Y1]);
  const draw = p(0.12, 0.6);
  const k = Math.max(2, Math.round(points.length * draw));
  const mAt = spreadAts(marks.length, 0.35, 0.75, marks.map((m) => m.at) as number[]);
  const yAt = (xv: number) => points.reduce((b, q) => (Math.abs(q.x - xv) < Math.abs(b.x - xv) ? q : b), points[0]).y;
  const tip = points[Math.min(points.length - 1, k - 1)];
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      {noteEl}
      <Svg>
        {grid(y.ticks(4), y)}
        <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke={L.ink} strokeWidth={2.5} />
        {x.ticks(6).map((v) => <text key={v} x={x(v)} y={Y0 + 36} textAnchor="middle" fontFamily={MONO} fontSize={20} fill={L.muted} opacity={p(0.04, 0.1)}>{v}</text>)}
        <polyline points={points.slice(0, k).map((q) => `${x(q.x)},${y(q.y)}`).join(" ")} fill="none" stroke={L.llm} strokeWidth={5} />
        {draw > 0 && <circle cx={x(tip.x)} cy={y(tip.y)} r={9 + Math.sin(frame * 0.2) * 3} fill={L.llm} />}
        {marks.map((m, i) => (
          <g key={i} opacity={p(mAt[i], mAt[i] + 0.05)}>
            <rect x={x(m.x) - 14} y={y(yAt(m.x)) - 14} width={28} height={28} fill="none" stroke={L.xls} strokeWidth={3} />
            <text x={x(m.x)} y={y(yAt(m.x)) - 30} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={L.xls}>{m.label}</text>
          </g>
        ))}
      </Svg>
    </>
  );
};

const Versus: React.FC<P<VersusProps>> = ({ dur, kicker, title, left, right, winner }) => {
  const p = useP(dur);
  const col = (side: { h: string; items: string[] }, x: number, a: number, win: boolean, c: string) => {
    const rowH = Math.min(92, Math.floor(480 / Math.max(1, side.items.length)));
    const ph = 36 + 24 + side.items.length * rowH + 30;
    return (
      <>
        <Panel x={x} y={270} w={820} h={ph} o={p(a, a + 0.06)} c={c} strong={win} label={side.h.toUpperCase()} right={win ? "✓ BUILD THIS" : ""}>
          {side.items.map((it, i) => (
            <div key={i} style={{ position: abs, left: 0, right: 0, top: 36 + 24 + i * rowH, height: rowH, borderBottom: `1.5px solid ${L.grid}`, display: "flex", alignItems: "center", gap: 18, paddingLeft: 24, paddingRight: 20, opacity: p(a + 0.05 + i * 0.03, a + 0.09 + i * 0.03) }}>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: win ? L.xls : L.bad, width: 28 }}>{win ? "✓" : "✗"}</span>
              <span style={{ fontFamily: SANS, fontSize: 30, color: L.ink, lineHeight: 1.2 }}>{win ? <Hi p={p(0.8 + i * 0.02, 0.86 + i * 0.02)}>{it}</Hi> : it}</span>
            </div>
          ))}
        </Panel>
      </>
    );
  };
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      {col(left, 110, 0.06, winner === "left", winner === "left" ? "llm" : "faint")}
      {col(right, 990, 0.4, winner === "right", winner === "right" ? "llm" : "faint")}
      {winner && <Sel x={winner === "left" ? 110 : 990} y={270} w={820} h={36 + 24 + (winner === "left" ? left : right).items.length * Math.min(92, Math.floor(480 / Math.max(1, (winner === "left" ? left : right).items.length))) + 30} o={p(0.78, 0.82)} />}
    </>
  );
};

const Recap: React.FC<P<RecapProps>> = ({ dur, title, items, closer, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const at = spreadAts(items.length, 0.06, 0.7, ats);
  const n = items.length;
  const rowH = Math.min(66, Math.floor(500 / n));
  const cur = Math.floor(frame / 36) % n;
  return (
    <>
      <div style={{ position: abs, left: 0, right: 0, top: 110, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: 4, color: L.llm, opacity: p(0, 0.04) }}>RECAP · THE WHOLE SHEET</div>
      <div style={{ position: abs, left: 0, right: 0, top: 150, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 62, letterSpacing: -1.5, color: L.ink, opacity: p(0.01, 0.06) }}>{title}</div>
      {items.map((it, i) => (
        <div key={i} style={{ position: abs, left: 250, top: 260 + i * rowH, width: 1420, height: rowH, background: L.white, border: `1.5px solid ${L.grid}`, display: "flex", alignItems: "center", opacity: p(at[i], at[i] + 0.05) }}>
          <div style={{ width: 70, height: "100%", background: L.gut, textAlign: "center", fontFamily: MONO, fontSize: 22, color: L.muted, lineHeight: `${rowH}px` }}>{i + 1}</div>
          <div style={{ paddingLeft: 22, fontFamily: SANS, fontSize: rowH > 56 ? 30 : 27, color: L.ink, whiteSpace: "nowrap" }}>{it}</div>
        </div>
      ))}
      {p(at[n - 1], at[n - 1] + 0.01) > 0.5 && <Sel x={250} y={260 + cur * rowH} w={1420} h={rowH} o={0.7} />}
      {closer && <div style={{ position: abs, left: 160, right: 160, top: 290 + n * rowH, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: 40, color: L.ink, opacity: p(0.8, 0.9) }}><Hi p={p(0.84, 0.95)}>{closer}</Hi></div>}
    </>
  );
};

export const ledger: StylePack = {
  id: "ledger",
  name: "Ledger",
  Background: Background as StylePack["Background"],
  scenes: {
    title: Title as never, divider: Divider as never, statement: Statement as never, list: List as never,
    flow: Flow as never, chart: Chart as never, versus: Versus as never, recap: Recap as never,
  },
  caption: { font: SANS, size: 29, weight: 500, color: L.ink, bg: "rgba(255,255,255,0.96)", border: `2px solid ${L.ink}`, radius: 0, bottom: 62, pad: "10px 26px" },
  transition: (i) => wipe({ direction: i % 2 ? "from-left" : "from-top" }) as never,
  transitionFrames: 14,
};
