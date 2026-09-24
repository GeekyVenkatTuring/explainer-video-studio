// LEDGER — x_* archetypes for agents-over-data videos. x_diagram · x_code · x_table · x_ingest ·
// x_loop · x_context · x_trace · x_verify. All phased by useP(dur), all keep moving (packets, cursor,
// scan beam, orbit, caret). Numbers shown are whatever build.py COMPUTED — scenes never invent data.
import React from "react";
import { useCurrentFrame } from "remotion";
import { useP } from "../../lib/primitives";
import { SceneProps, spreadAts, StylePack } from "../core";
import { L, SANS, MONO, tone, tint, Head, Hi, Panel, Sel, Chip, Svg, Pipe, PFn } from "./ledger";

type P<T> = SceneProps & T;
const abs = "absolute" as const;
const shownIdx = (p: PFn, at: number[]) => at.filter((a) => p(a, a + 0.01) > 0.5).length - 1;

// ================================================================ x_diagram
type DNode = { id: string; h: string; d?: string; x: number; y: number; w: number; hh?: number; c?: string };
type Group = { h: string; x: number; y: number; w: number; hh: number; c?: string; at?: number };
const XDiagram: React.FC<P<{ kicker?: string; title: string; nodes: DNode[]; edges: [string, string][]; groups?: Group[]; ats?: number[] }>> = ({ dur, kicker, title, nodes, edges, groups = [], ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const at = spreadAts(nodes.length, 0.06, 0.7, ats);
  const idx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));
  const H = (n: DNode) => n.hh ?? 110;
  const shown = shownIdx(p, at);
  const cur = shown === nodes.length - 1 && p(at[nodes.length - 1] + 0.08, at[nodes.length - 1] + 0.09) > 0.5 ? Math.floor(frame / 42) % nodes.length : shown;
  const side = (a: DNode, b: DNode): [number, number, number, number] => {
    let ax = a.x + a.w / 2, ay = a.y + H(a) / 2, bx = b.x + b.w / 2, by = b.y + H(b) / 2;
    // route straight when the boxes overlap on the cross axis (shared lane = middle of the overlap)
    const yLo = Math.max(a.y, b.y), yHi = Math.min(a.y + H(a), b.y + H(b));
    const xLo = Math.max(a.x, b.x), xHi = Math.min(a.x + a.w, b.x + b.w);
    const horiz = xHi < xLo && (yHi - yLo > 24 || Math.abs(bx - ax) > Math.abs(by - ay) * 1.2);
    if (horiz) {
      if (yHi - yLo > 24) ay = by = (yLo + yHi) / 2;
      return bx > ax ? [a.x + a.w + 6, ay, b.x - 8, by] : [a.x - 6, ay, b.x + b.w + 8, by];
    }
    if (xHi - xLo > 24) ax = bx = (xLo + xHi) / 2;
    return by > ay ? [ax, a.y + H(a) + 6, bx, b.y - 8] : [ax, a.y - 6, bx, b.y + H(b) + 8];
  };
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      {groups.map((g, i) => {
        const o = p(g.at ?? 0.03, (g.at ?? 0.03) + 0.05);
        return (
          <div key={i} style={{ position: abs, left: g.x, top: g.y, width: g.w, height: g.hh, border: `2px dashed ${tone(g.c ?? "faint")}`, background: tint(tone(g.c ?? "faint"), 0.04), opacity: o }}>
            <div style={{ position: abs, left: -2, top: -30, height: 30, padding: "0 12px", background: tone(g.c ?? "faint"), color: L.white, fontFamily: MONO, fontWeight: 600, fontSize: 18, lineHeight: "30px", whiteSpace: "nowrap" }}>{g.h}</div>
          </div>
        );
      })}
      <Svg>
        {edges.map(([a, b], i) => {
          const A = nodes[idx[a]], B = nodes[idx[b]];
          if (!A || !B) return null;
          const t0 = Math.max(at[idx[a]], at[idx[b]]);
          const [x1, y1, x2, y2] = side(A, B);
          return <Pipe key={i} x1={x1} y1={y1} x2={x2} y2={y2} p={p(t0, t0 + 0.04)} c={tone(B.c ?? "ink")} seed={i} />;
        })}
      </Svg>
      {nodes.map((n, i) => {
        const o = p(at[i], at[i] + 0.05);
        const c = tone(n.c ?? "ink");
        return (
          <div key={n.id} style={{ position: abs, left: n.x, top: n.y, width: n.w, height: H(n), background: L.white, border: `2px solid ${c}`, borderLeft: `10px solid ${c}`, boxShadow: `5px 5px 0 ${tint(L.ink, 0.1)}`, opacity: o, transform: `scale(${0.94 + 0.06 * o})`, padding: "12px 14px", boxSizing: "border-box" }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: n.w >= 300 ? 29 : 25, lineHeight: 1.12, color: L.ink }}>{n.h}</div>
            {n.d && <div style={{ marginTop: 6, fontFamily: SANS, fontSize: n.w >= 300 ? 21 : 19, lineHeight: 1.3, color: L.muted }}>{n.d}</div>}
          </div>
        );
      })}
      {cur >= 0 && <Sel x={nodes[cur].x} y={nodes[cur].y} w={nodes[cur].w} h={H(nodes[cur])} o={1} />}
    </>
  );
};

// ================================================================ x_code
const KW = /\b(def|for|in|if|else|return|while|break|continue|import|from|class|with|as|not|and|or|None|True|False|SELECT|FROM|WHERE|GROUP BY|ORDER BY|CREATE|TABLE|JOIN|ON|AS|LIMIT)\b/;
const tokenLine = (s: string) => {
  const out: { t: string; c: string }[] = [];
  const cm = s.search(/(#|--|\/\/)/);
  const code = cm >= 0 ? s.slice(0, cm) : s;
  const re = /("[^"]*"|'[^']*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]+\b|\s+|.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    const t = m[0];
    out.push({ t, c: /^["']/.test(t) ? L.xls : /^\d/.test(t) ? L.pdf : KW.test(t) && t.match(KW)![0] === t ? L.llm : L.ink });
  }
  if (cm >= 0) out.push({ t: s.slice(cm), c: L.faint });
  return out;
};
const XCode: React.FC<P<{ kicker?: string; title: string; file?: string; lines: string[]; notes?: { a: number; b: number; at: number; t: string }[]; c?: string }>> = ({ dur, kicker, title, file = "harness.py", lines, notes = [], c = "ink" }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const shown = p(0.02, 0.16) * lines.length;
  let cur = -1;
  notes.forEach((n, i) => { if (p(n.at, n.at + 0.01) > 0.5) cur = i; });
  const hi = cur >= 0 ? notes[cur] : null;
  const W = notes.length ? 1180 : 1700;
  const rowH = Math.min(40, Math.floor(600 / Math.max(1, lines.length)));
  const fs = rowH >= 36 ? 24 : rowH >= 30 ? 21 : 19;
  const Y = 240;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Panel x={110} y={Y} w={W} h={rowH * lines.length + 60} o={p(0, 0.04)} c={c} label={file} right={`${lines.length} lines`}>
        {lines.map((ln, i) => {
          const vis = Math.max(0, Math.min(1, shown - i));
          const lit = hi && i + 1 >= hi.a && i + 1 <= hi.b;
          return (
            <div key={i} style={{ position: abs, left: 0, right: 0, top: 46 + i * rowH, height: rowH, display: "flex", alignItems: "center", background: lit ? tint(L.hi, 0.75) : "transparent", opacity: vis }}>
              <div style={{ width: 56, textAlign: "right", paddingRight: 14, fontFamily: MONO, fontSize: fs - 3, color: L.faint }}>{i + 1}</div>
              <div style={{ fontFamily: MONO, fontSize: fs, whiteSpace: "pre", color: L.ink }}>
                {tokenLine(ln).map((tk, k) => <span key={k} style={{ color: tk.c }}>{tk.t}</span>)}
                {i === Math.floor(shown) - 1 && shown < lines.length && <span style={{ color: L.llm }}>▏</span>}
              </div>
            </div>
          );
        })}
      </Panel>
      {hi && <Sel x={110} y={Y + 46 + (hi.a - 1) * rowH} w={W} h={(hi.b - hi.a + 1) * rowH} o={1} />}
      {notes.map((n, i) => {
        const o = i === cur ? p(n.at, n.at + 0.03) : 0;
        if (o <= 0) return null;
        const y = Math.min(Y + 46 + (n.a - 1) * rowH - 10, 720);
        return (
          <div key={i} style={{ position: abs, left: 1330, top: y, width: 480, background: L.white, border: `2px solid ${L.llm}`, borderLeft: `8px solid ${L.llm}`, padding: "14px 18px", fontFamily: SANS, fontSize: 26, lineHeight: 1.32, color: L.ink, opacity: o, boxShadow: `5px 5px 0 ${tint(L.ink, 0.1)}` }}>
            <div style={{ fontFamily: MONO, fontSize: 18, color: L.llm, marginBottom: 6 }}>NOTE · lines {n.a}–{n.b}{frame % 30 < 16 ? " ▏" : ""}</div>{n.t}
          </div>
        );
      })}
    </>
  );
};

// ================================================================ x_table
type Col = { h: string; w?: number; align?: "left" | "right" | "center"; c?: string; computed?: string };
type Mark = { r: number; c: number; at: number; tone?: "hi" | "bad" | "ok"; note?: string };
const XTable: React.FC<P<{ kicker?: string; title: string; cols: Col[]; rows: (string | number)[][]; ats?: number[]; marks?: Mark[]; note?: string; x?: number; w?: number }>> = ({ dur, kicker, title, cols, rows, ats, marks = [], note, x = 110, w = 1700 }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const at = spreadAts(rows.length, 0.08, 0.6, ats);
  const tw = cols.reduce((s, c) => s + (c.w ?? 1), 0);
  const cx = (j: number) => x + (cols.slice(0, j).reduce((s, c) => s + (c.w ?? 1), 0) / tw) * w;
  const cw = (j: number) => ((cols[j].w ?? 1) / tw) * w;
  const rowH = Math.min(58, Math.floor(540 / Math.max(1, rows.length)));
  const fs = rowH >= 50 ? 25 : rowH >= 42 ? 22 : 20;
  const Y0 = 250, HY = 64;
  const shown = shownIdx(p, at);
  const allDone = p(at[rows.length - 1] + 0.06, at[rows.length - 1] + 0.07) > 0.5;
  let mk = -1;
  marks.forEach((m, i) => { if (p(m.at, m.at + 0.01) > 0.5) mk = i; });
  const curRow = allDone && mk < 0 ? Math.floor(frame / 34) % rows.length : shown;
  const bottom = Y0 + HY + rows.length * rowH;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      {cols.map((c, j) => (
        <div key={j} style={{ position: abs, left: cx(j), top: Y0, width: cw(j), height: HY, background: c.computed ? L.llm : c.c ? tone(c.c) : L.ink, color: L.white, borderRight: `1px solid ${L.white}`, fontFamily: MONO, fontWeight: 600, fontSize: 20, lineHeight: 1.15, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 12px", boxSizing: "border-box", textAlign: c.align ?? "left", opacity: p(0.02, 0.06) }}>
          <div style={{ whiteSpace: "nowrap", overflow: "hidden" }}>{c.h}</div>
          {c.computed && <div style={{ fontSize: 19, fontWeight: 400, opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden" }}>= {c.computed}</div>}
        </div>
      ))}
      {rows.map((r, i) => {
        const o = p(at[i], at[i] + 0.04);
        return r.map((v, j) => {
          const oc = cols[j].computed ? p(at[i] + 0.03, at[i] + 0.06) : o;
          return (
            <div key={`${i}-${j}`} style={{ position: abs, left: cx(j), top: Y0 + HY + i * rowH, width: cw(j), height: rowH, background: cols[j].computed ? tint(L.llm, 0.06) : L.white, borderRight: `1px solid ${L.grid}`, borderBottom: `1px solid ${L.grid}`, borderLeft: j === 0 ? `1px solid ${L.grid}` : undefined, fontFamily: typeof v === "number" || cols[j].align === "right" ? MONO : SANS, fontSize: fs, color: cols[j].computed ? L.llm : L.ink, fontWeight: cols[j].computed ? 700 : 400, lineHeight: `${rowH}px`, padding: "0 12px", boxSizing: "border-box", textAlign: cols[j].align ?? (typeof v === "number" ? "right" : "left"), whiteSpace: "nowrap", overflow: "hidden", opacity: oc }}>
              {typeof v === "number" ? v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : v}
            </div>
          );
        });
      })}
      {marks.map((m, i) => {
        const o = p(m.at, m.at + 0.04);
        if (o <= 0) return null;
        const col = m.tone === "bad" ? L.bad : m.tone === "ok" ? L.xls : "#E0B400";
        return <div key={i} style={{ position: abs, left: cx(m.c) + 2, top: Y0 + HY + m.r * rowH + 2, width: cw(m.c) - 4, height: rowH - 4, border: `3px solid ${col}`, background: m.tone === "hi" || !m.tone ? tint(L.hi, 0.55) : tint(col, 0.08), opacity: o }} />;
      })}
      {curRow >= 0 && curRow < rows.length && <Sel x={x} y={Y0 + HY + curRow * rowH} w={w} h={rowH} o={0.9} />}
      {mk >= 0 && marks[mk].note && (
        <div style={{ position: abs, left: x, top: Math.min(bottom + 24, 830), width: w, fontFamily: SANS, fontSize: 28, color: L.ink, opacity: p(marks[mk].at, marks[mk].at + 0.04) }}>
          <Chip c={marks[mk].tone === "bad" ? "bad" : marks[mk].tone === "ok" ? "xls" : "llm"} size={20}>{marks[mk].tone === "bad" ? "✗ CHECK" : marks[mk].tone === "ok" ? "✓ OK" : "NOTE"}</Chip>
          <span style={{ marginLeft: 14 }}>{marks[mk].note}</span>
        </div>
      )}
      {note && mk < 0 && <div style={{ position: abs, left: x, top: Math.min(bottom + 24, 840), width: w, fontFamily: MONO, fontSize: 21, color: L.muted, opacity: p(0.62, 0.7) }}>{note}</div>}
    </>
  );
};

// ================================================================ x_ingest
type SrcDoc = { kind: "pdf" | "xls"; name: string; head: string[]; rows: string[][]; unit?: string };
const XIngest: React.FC<P<{ kicker?: string; title: string; src: SrcDoc; steps: string[]; out: { cols: string[]; rows: string[][]; map?: number[] }; ats?: number[] }>> = ({ dur, kicker, title, src, steps, out, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const c = src.kind === "pdf" ? L.pdf : L.xls;
  const sAt = spreadAts(steps.length, 0.14, 0.34);
  const oAt = spreadAts(out.rows.length, 0.36, 0.62, ats);
  const DX = 110, DW = 640, DY = 250, DH = 610;
  const tY = src.kind === "pdf" ? DY + 200 : DY + 90;
  const rH = Math.min(62, Math.floor((DY + DH - tY - 40) / (src.rows.length + 1)));
  const beam = tY + ((frame * 2.2) % ((src.rows.length + 1) * rH));
  const c0 = (DW - 30) * (src.kind === "pdf" ? 0.4 : 0.27), colW = (DW - 30 - c0) / (src.head.length - 1);
  const colX = (j: number) => 15 + (j === 0 ? 0 : c0 + (j - 1) * colW);
  const OX = 1180, OW = 630, ORH = Math.min(58, Math.floor(480 / Math.max(1, out.rows.length)));
  const ocw = OW / out.cols.length;
  const shownOut = shownIdx(p, oAt);
  const srcHi = shownOut >= 0 ? (out.map ? out.map[shownOut] : shownOut) : -1;   // source row feeding the latest fact
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Panel x={DX} y={DY} w={DW} h={DH} o={p(0, 0.05)} c={src.kind} label={src.name} right={src.kind === "pdf" ? "page 4" : "Sheet1"}>
        {src.kind === "pdf" && [0, 1, 2, 3].map((i) => <div key={i} style={{ position: abs, left: 24, top: 60 + i * 26, width: [520, 560, 440, 300][i], height: 10, background: L.grid }} />)}
        {src.unit && <div style={{ position: abs, left: 24, top: src.kind === "pdf" ? 166 : 54, fontFamily: MONO, fontSize: 19, color: L.ink, fontStyle: "italic" }}><Hi p={p(0.3, 0.36)}>{src.unit}</Hi></div>}
      </Panel>
      <div style={{ position: abs, left: DX, top: 0, opacity: p(0.03, 0.08) }}>
        {[src.head, ...src.rows].map((r, i) => r.map((v, j) => (
          <div key={`${i}-${j}`} style={{ position: abs, left: colX(j), top: tY + i * rH, width: j === 0 ? c0 : colW, height: rH, borderBottom: `1px solid ${L.grid}`, borderRight: src.kind === "xls" ? `1px solid ${L.grid}` : undefined, fontFamily: j === 0 ? SANS : MONO, fontWeight: i === 0 ? 700 : 400, fontSize: 20, color: L.ink, lineHeight: `${rH}px`, padding: "0 8px", boxSizing: "border-box", textAlign: j === 0 ? "left" : "right", whiteSpace: "nowrap", overflow: "hidden", background: i > 0 && i - 1 === srcHi ? tint(L.hi, 0.6) : "transparent" }}>{v}</div>
        )))}
      </div>
      <div style={{ position: abs, left: DX + 10, top: beam, width: DW - 20, height: rH, background: `linear-gradient(180deg, transparent, ${tint(c, 0.16)} 70%, ${tint(c, 0.55)})`, borderBottom: `2px solid ${tint(c, 0.6)}`, opacity: p(0.08, 0.12) }} />
      <Svg>
        <Pipe x1={DX + DW + 10} y1={560} x2={808} y2={560} p={p(sAt[0] - 0.02, sAt[0])} c={c} />
        <Pipe x1={1112} y1={560} x2={OX - 12} y2={560} p={p(oAt[0] - 0.02, oAt[0])} c={L.llm} seed={3} />
      </Svg>
      {steps.map((s, i) => (
        <div key={i} style={{ position: abs, left: 820, top: 330 + i * 150, width: 290, height: 110, background: L.white, border: `2px solid ${L.llm}`, boxShadow: `5px 5px 0 ${tint(L.ink, 0.1)}`, opacity: p(sAt[i], sAt[i] + 0.04), padding: "10px 14px", boxSizing: "border-box" }}>
          <div style={{ fontFamily: MONO, fontSize: 17, color: L.llm }}>STAGE {i + 1}</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: L.ink, lineHeight: 1.15, marginTop: 4 }}>{s}</div>
        </div>
      ))}
      {steps.map((_, i) => i < steps.length - 1 && <div key={`l${i}`} style={{ position: abs, left: 963, top: 440 + i * 150, width: 3, height: 40, background: L.llm, opacity: p(sAt[i + 1], sAt[i + 1] + 0.03) }} />)}
      <div style={{ position: abs, left: OX, top: DY, width: OW, height: 40, background: L.llm, color: L.white, fontFamily: MONO, fontWeight: 600, fontSize: 19, lineHeight: "40px", paddingLeft: 12, opacity: p(oAt[0] - 0.04, oAt[0]) }}>facts  (canonical, ₹ crore)</div>
      {[out.cols, ...out.rows].map((r, i) => r.map((v, j) => (
        <div key={`o${i}-${j}`} style={{ position: abs, left: OX + j * ocw, top: DY + 40 + i * ORH, width: ocw, height: ORH, background: i === 0 ? L.gut : L.white, border: `1px solid ${L.grid}`, fontFamily: MONO, fontWeight: i === 0 ? 600 : 400, fontSize: i === 0 ? 17 : 19, color: i === 0 ? L.muted : L.ink, lineHeight: `${ORH}px`, padding: "0 8px", boxSizing: "border-box", whiteSpace: "nowrap", overflow: "hidden", opacity: i === 0 ? p(oAt[0] - 0.04, oAt[0]) : p(oAt[i - 1], oAt[i - 1] + 0.04), transform: i === 0 ? undefined : `translateX(${(1 - p(oAt[i - 1], oAt[i - 1] + 0.04)) * -40}px)` }}>{v}</div>
      )))}
      {shownOut >= 0 && <Sel x={OX} y={DY + 40 + (shownOut + 1) * ORH} w={OW} h={ORH} o={1} />}
    </>
  );
};

// ================================================================ x_loop
const XLoop: React.FC<P<{ kicker?: string; title: string; steps: { h: string; d?: string }[]; center?: string; trace?: string[]; ats?: number[] }>> = ({ dur, kicker, title, steps, center = "LLM", trace = [], ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const n = steps.length;
  const at = spreadAts(n, 0.06, 0.66, ats);
  const CX = 600, CY = 565, R = 330, BW = 236, BH = 92;
  const pos = (i: number) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return { x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R * 0.8 }; };
  const shown = shownIdx(p, at);
  const all = p(at[n - 1] + 0.06, at[n - 1] + 0.07) > 0.5;
  const orbit = all ? (frame / 55) % n : Math.max(0, shown);
  const cur = all ? Math.floor(orbit) : shown;
  const ta = -Math.PI / 2 + (orbit / n) * Math.PI * 2;
  const tAt = spreadAts(trace.length, at[0], at[n - 1] + 0.04);
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        <ellipse cx={CX} cy={CY} rx={R} ry={R * 0.8} fill="none" stroke={L.grid} strokeWidth={3} strokeDasharray="10 10" opacity={p(0.02, 0.06)} />
        {steps.map((_, i) => {
          if (i === 0 && !all) return null;
          const a = pos((i + n - 1) % n), b = pos(i);
          const o = p(at[i], at[i] + 0.04);
          return <line key={i} x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * o} y2={a.y + (b.y - a.y) * o} stroke={L.llm} strokeWidth={3} opacity={0.5} />;
        })}
        {shown >= 0 && <circle cx={CX + Math.cos(ta) * R} cy={CY + Math.sin(ta) * R * 0.8} r={14} fill={L.hi} stroke={L.ink} strokeWidth={2.5} />}
      </Svg>
      <div style={{ position: abs, left: CX - 110, top: CY - 110, width: 220, height: 220, borderRadius: 999, background: L.llm, color: L.white, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 34, boxShadow: `0 0 0 ${10 + 6 * Math.sin(frame * 0.1)}px ${tint(L.llm, 0.15)}`, opacity: p(0, 0.05) }}>
        {center}<div style={{ fontFamily: MONO, fontWeight: 400, fontSize: 18, opacity: 0.85, marginTop: 6 }}>the model</div>
      </div>
      {steps.map((s, i) => {
        const q = pos(i);
        const o = p(at[i], at[i] + 0.04);
        return (
          <div key={i} style={{ position: abs, left: q.x - BW / 2, top: q.y - BH / 2, width: BW, height: BH, background: i === cur ? L.white : L.white, border: `2.5px solid ${i === cur ? L.llm : L.ink}`, boxShadow: `5px 5px 0 ${tint(L.ink, 0.1)}`, opacity: o, transform: `scale(${0.9 + 0.1 * o})`, padding: "8px 12px", boxSizing: "border-box" }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: L.ink, whiteSpace: "nowrap" }}><span style={{ fontFamily: MONO, color: L.llm, fontSize: 20 }}>{i + 1} </span>{s.h}</div>
            {s.d && <div style={{ fontFamily: SANS, fontSize: 18, color: L.muted, marginTop: 3, lineHeight: 1.2 }}>{s.d}</div>}
          </div>
        );
      })}
      {cur >= 0 && <Sel x={pos(cur).x - BW / 2} y={pos(cur).y - BH / 2} w={BW} h={BH} o={1} />}
      {trace.length > 0 && (
        <Panel x={1080} y={250} w={730} h={610} o={p(0.04, 0.08)} c="ink" label="trace.jsonl" right="live">
          {trace.map((t, i) => (
            <div key={i} style={{ position: abs, left: 16, right: 16, top: 52 + i * Math.min(62, 540 / trace.length), fontFamily: MONO, fontSize: 19, lineHeight: 1.3, color: i === cur ? L.ink : L.muted, opacity: p(tAt[i], tAt[i] + 0.03) }}>
              <span style={{ color: L.llm }}>{String(i + 1).padStart(2, "0")} </span>{t}
            </div>
          ))}
        </Panel>
      )}
    </>
  );
};

// ================================================================ x_context
type Seg = { h: string; d?: string; tok: number; c?: string; cached?: boolean };
const XContext: React.FC<P<{ kicker?: string; title: string; segs: Seg[]; budget: number; compact?: { idx: number; to: number; at: number }; ats?: number[] }>> = ({ dur, kicker, title, segs, budget, compact, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const at = spreadAts(segs.length, 0.08, 0.6, ats);
  const cp = compact ? p(compact.at, compact.at + 0.06) : 0;
  const tok = segs.map((s, i) => (compact && compact.idx === i ? s.tok + (compact.to - s.tok) * cp : s.tok) * p(at[i], at[i] + 0.05));
  const used = tok.reduce((a, b) => a + b, 0);
  const BX = 150, BY = 250, BW = 300, BH = 600;
  const scale = BH / budget;
  let y = BY;
  const rowH = Math.min(96, Math.floor(600 / segs.length));
  const flick = Math.floor(frame / 3) % 2;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <div style={{ position: abs, left: BX, top: BY, width: BW, height: BH, border: `2.5px solid ${L.ink}`, background: L.white, opacity: p(0, 0.04) }} />
      <div style={{ position: abs, left: BX, top: BY - 32, width: BW, textAlign: "center", fontFamily: MONO, fontSize: 18, color: L.muted, opacity: p(0, 0.04) }}>CONTEXT WINDOW</div>
      {segs.map((s, i) => {
        const h = tok[i] * scale;
        const top = y; y += h;
        const c = tone(s.c ?? "ink");
        const ly = BY + i * rowH + rowH / 2;
        return (
          <React.Fragment key={i}>
            <div style={{ position: abs, left: BX + 3, top: top + 1, width: BW - 6, height: Math.max(0, h - 2), background: tint(c, 0.8), borderBottom: h > 2 ? `2px solid ${L.white}` : undefined }}>
              {s.cached && h > 24 && <div style={{ position: abs, right: 8, top: 4, fontFamily: MONO, fontSize: 17, color: L.white }}>⚡ cached</div>}
            </div>
            <svg width={1920} height={1080} style={{ position: abs, left: 0, top: 0, pointerEvents: "none", opacity: p(at[i], at[i] + 0.04) }}>
              <polyline points={`${BX + BW + 4},${top + h / 2} ${BX + BW + 60},${top + h / 2} ${560},${ly}`} fill="none" stroke={c} strokeWidth={2} />
            </svg>
            <div style={{ position: abs, left: 580, top: ly - rowH / 2 + 6, width: 860, height: rowH - 10, opacity: p(at[i], at[i] + 0.04) }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: L.ink }}>
                <span style={{ display: "inline-block", width: 16, height: 16, background: c, marginRight: 12 }} />{s.h}
                <span style={{ fontFamily: MONO, fontWeight: 400, fontSize: 21, color: c, marginLeft: 14 }}>{Math.round(compact && compact.idx === i ? s.tok + (compact.to - s.tok) * cp : s.tok).toLocaleString("en-US")} tok</span>
                {compact && compact.idx === i && cp > 0.5 && <span style={{ marginLeft: 12 }}><Chip c="llm">compacted</Chip></span>}
              </div>
              {s.d && <div style={{ fontFamily: SANS, fontSize: 22, color: L.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden" }}>{s.d}</div>}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: abs, left: BX, top: BY + used * scale - 2, width: BW, height: 4, background: L.ink, opacity: flick ? 1 : 0.6 }} />
      <Panel x={1480} y={250} w={330} h={250} o={p(0.1, 0.15)} c="llm" label="BUDGET">
        <div style={{ position: abs, left: 0, right: 0, top: 58, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 56, color: L.llm }}>{Math.round(used).toLocaleString("en-US")}</div>
        <div style={{ position: abs, left: 0, right: 0, top: 136, textAlign: "center", fontFamily: MONO, fontSize: 21, color: L.muted }}>of {budget.toLocaleString("en-US")} tokens</div>
        <div style={{ position: abs, left: 30, right: 30, top: 186, height: 16, background: L.gut }}><div style={{ width: `${Math.min(100, (used / budget) * 100)}%`, height: "100%", background: L.llm }} /></div>
      </Panel>
    </>
  );
};

// ================================================================ x_trace
type Ev = { k: "user" | "plan" | "call" | "result" | "memory" | "answer" | "verify"; body: string; c?: string; table?: { head: string[]; rows: string[][] } };
const EVC: Record<Ev["k"], string> = { user: L.ink, plan: L.llm, call: L.sql, result: L.xls, memory: L.pdf, answer: L.ink, verify: L.xls };
const XTrace: React.FC<P<{ kicker?: string; title: string; events: Ev[]; ats?: number[] }>> = ({ dur, kicker, title, events, ats }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const at = spreadAts(events.length, 0.04, 0.7, ats);
  const X = 110, W = 1700, TAG = 170, TOP = 240, AV = 640;
  const hOf = (e: Ev) => {
    const mono = e.k === "call" || e.k === "result";
    const cpl = Math.floor((W - TAG - 40) / ((mono ? 0.6 : 0.52) * (mono ? 22 : 27)));
    const lines = e.body.split("\n").reduce((s, l) => s + Math.max(1, Math.ceil(l.length / cpl)), 0);
    return 22 + lines * (mono ? 31 : 37) + (e.table ? (e.table.rows.length + 1) * 36 + 12 : 0) + 14;
  };
  const hs = events.map(hOf);
  const tops = hs.map((_, i) => hs.slice(0, i).reduce((a, b) => a + b + 12, 0));
  let off = 0;
  events.forEach((_, i) => { const r = p(at[i], at[i] + 0.05); if (r > 0) off = Math.max(off, tops[i] + hs[i] * r - AV); });
  const cur = shownIdx(p, at);
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <div style={{ position: abs, left: X - 10, top: TOP - 6, width: W + 20, height: AV + 12, overflow: "hidden" }}>
        {events.map((e, i) => {
          const o = p(at[i], at[i] + 0.04);
          const c = e.c ? tone(e.c) : EVC[e.k];
          const mono = e.k === "call" || e.k === "result";
          const chars = Math.floor(e.body.length * p(at[i], at[i] + (mono ? 0.05 : 0.08)));
          return (
            <div key={i} style={{ position: abs, left: 10, top: 6 + tops[i] - off, width: W, height: hs[i], display: "flex", background: e.k === "answer" ? tint(L.hi, 0.35) : L.white, border: `2px solid ${i === cur ? c : L.grid}`, opacity: o }}>
              <div style={{ width: TAG, background: c, color: L.white, fontFamily: MONO, fontWeight: 700, fontSize: 20, padding: "12px 14px", boxSizing: "border-box", letterSpacing: 1 }}>{e.k.toUpperCase()}</div>
              <div style={{ flex: 1, padding: "10px 18px", boxSizing: "border-box" }}>
                <div style={{ fontFamily: mono ? MONO : SANS, fontSize: mono ? 22 : 27, lineHeight: mono ? "31px" : "37px", color: L.ink, whiteSpace: "pre-wrap", fontWeight: e.k === "user" ? 700 : 400 }}>
                  {e.body.slice(0, chars)}{i === cur && chars < e.body.length && frame % 20 < 12 ? "▏" : ""}
                </div>
                {e.table && (
                  <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: `repeat(${e.table.head.length}, 1fr)`, border: `1px solid ${L.grid}`, opacity: p(at[i] + 0.04, at[i] + 0.07) }}>
                    {[e.table.head, ...e.table.rows].map((r, ri) => r.map((v, ci) => (
                      <div key={`${ri}-${ci}`} style={{ height: 36, lineHeight: "36px", padding: "0 10px", fontFamily: MONO, fontSize: 19, background: ri === 0 ? L.gut : L.white, color: ri === 0 ? L.muted : L.ink, borderRight: `1px solid ${L.grid}`, borderTop: ri ? `1px solid ${L.grid}` : undefined, whiteSpace: "nowrap", overflow: "hidden", textAlign: ci === 0 ? "left" : "right" }}>{v}</div>
                    )))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ================================================================ x_verify
type Claim = { t: string; n: string; ok: boolean; e?: number; fix?: string };
const XVerify: React.FC<P<{ kicker?: string; title: string; claims: Claim[]; evidence: { k: string; v: string; src: string }[]; ats?: number[]; verdict?: string }>> = ({ dur, kicker, title, claims, evidence, ats, verdict = "0 uncited numbers · answer released" }) => {
  const p = useP(dur);
  const at = spreadAts(claims.length, 0.16, 0.66, ats);
  const cur = shownIdx(p, at);
  const cH = Math.min(118, Math.floor(520 / claims.length));
  const eH = Math.min(64, Math.floor(520 / evidence.length));
  const curE = cur >= 0 ? claims[cur].e : undefined;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Panel x={110} y={250} w={1010} h={600} o={p(0, 0.05)} c="ink" label="DRAFT ANSWER" right="before release" />
      {claims.map((c, i) => {
        const chk = p(at[i], at[i] + 0.03);
        const fx = c.fix ? p(at[i] + 0.06, at[i] + 0.1) : 0;
        const [a, b] = c.t.split("{n}");
        return (
          <div key={i} style={{ position: abs, left: 134, top: 306 + i * cH, width: 960, height: cH - 10, display: "flex", alignItems: "center", gap: 18, opacity: p(0.02 + i * 0.02, 0.06 + i * 0.02) }}>
            <div style={{ width: 44, height: 44, flex: "none", border: `2.5px solid ${chk > 0.5 ? (c.ok || fx > 0.5 ? L.xls : L.bad) : L.grid}`, color: c.ok || fx > 0.5 ? L.xls : L.bad, fontFamily: MONO, fontWeight: 700, fontSize: 30, textAlign: "center", lineHeight: "40px" }}>{chk > 0.5 ? (c.ok || fx > 0.5 ? "✓" : "✗") : ""}</div>
            <div style={{ fontFamily: SANS, fontSize: 29, lineHeight: 1.3, color: L.ink }}>
              {a}
              <span style={{ fontFamily: MONO, fontWeight: 700, color: chk > 0.5 && !c.ok ? L.bad : L.ink, textDecoration: chk > 0.5 && !c.ok ? "line-through" : "none", background: chk > 0.5 && c.ok ? tint(L.hi, 0.8) : "transparent", padding: "0 4px" }}>{c.n}</span>
              {fx > 0 && <span style={{ fontFamily: MONO, fontWeight: 700, marginLeft: 10, marginRight: 8, opacity: fx }}><Hi p={fx}>{c.fix}</Hi></span>}
              {b}
            </div>
          </div>
        );
      })}
      {cur >= 0 && <Sel x={120} y={300 + cur * cH} w={990} h={cH - 2} o={1} c={claims[cur].ok ? L.llm : L.bad} />}
      <Panel x={1160} y={250} w={650} h={600} o={p(0.06, 0.11)} c="xls" label="EVIDENCE LOG" right="from tool results" />
      {evidence.map((e, i) => (
        <div key={i} style={{ position: abs, left: 1176, top: 300 + i * eH, width: 618, height: eH - 6, display: "flex", alignItems: "center", gap: 12, background: curE === i ? tint(L.hi, 0.7) : "transparent", opacity: p(0.08 + i * 0.015, 0.12 + i * 0.015), borderBottom: `1px solid ${L.grid}` }}>
          <div style={{ width: 230, paddingLeft: 8, fontFamily: SANS, fontSize: 22, color: L.ink, whiteSpace: "nowrap", overflow: "hidden" }}>{e.k}</div>
          <div style={{ width: 130, textAlign: "right", fontFamily: MONO, fontWeight: 700, fontSize: 22, color: L.ink }}>{e.v}</div>
          <div style={{ marginLeft: 8 }}><Chip c="xls" size={16}>{e.src}</Chip></div>
        </div>
      ))}
      <div style={{ position: abs, left: 110, top: 872, opacity: p(0.8, 0.86) }}><Chip c="xls" size={24}>✓ {verdict}</Chip></div>
    </>
  );
};

export const ledgerX: StylePack["scenes"] = {
  x_diagram: XDiagram as never, x_code: XCode as never, x_table: XTable as never, x_ingest: XIngest as never,
  x_loop: XLoop as never, x_context: XContext as never, x_trace: XTrace as never, x_verify: XVerify as never,
};
