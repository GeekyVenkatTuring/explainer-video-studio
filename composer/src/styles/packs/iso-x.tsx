// ISOMETRIC — extra algorithm archetypes (x_* kinds), prop-compatible with blueprint-x so any script can
// switch packs. Computation is SHARED with blueprint-x (buildHnsw, bm25Params) — identical numbers in both.
// x_diagram · x_code · x_cosine · x_hnsw (stacked iso planes) · x_graph · x_store · x_fusion.
import React from "react";
import { useCurrentFrame } from "remotion";
import { useP, mix } from "../../lib/primitives";
import { SceneProps, spreadAts, StylePack } from "../core";
import { C, F, ACC, IsoBox, iso, poly, Svg, Fade, Head } from "./iso";
import { buildHnsw, bm25Params, Cand, DNode, GN, GE, Op } from "./blueprint-x";

type P<T> = SceneProps & T;
const MONO = "'JetBrains Mono', Menlo, monospace";
const OPC: Record<string, string> = { ADD: C.emerald, UPDATE: C.amber, DELETE: C.rose, NOOP: "#94A3B8" };

/** a raised isometric card: hard stacked shadows give it a solid edge (no blur) */
const Slab: React.FC<{ x: number; y: number; w: number; h: number; color?: string; depth?: number; o?: number; hi?: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({
  x, y, w, h, color = C.white, depth = 10, o = 1, hi, children, style,
}) => {
  if (o <= 0.001) return null;
  const dk = mix(color, "#1E1B4B", 0.32);
  const sh = Array.from({ length: depth }, (_, i) => `${i + 1}px ${i + 1}px 0 ${dk}`).join(",");
  return (
    <div style={{ position: "absolute", left: x, top: y + (1 - o) * 26, width: w, height: h, boxSizing: "border-box", background: color, borderRadius: 12,
      border: `2px solid ${hi ?? mix(color, "#1E1B4B", 0.35)}`, boxShadow: sh, opacity: Math.min(1, o * 1.4), ...style }}>{children}</div>
  );
};
/** a small iso cube centred at a screen point */
const Cube: React.FC<{ x: number; y: number; s: number; color: string; o?: number }> = ({ x, y, s, color, o = 1 }) =>
  <IsoBox pr={iso(x, y + s * 0.5, s)} x={-0.5} y={-0.5} z={0} w={1} d={1} h={1} color={color} o={o} />;
/** a pipe that draws on (p) and then carries cube packets */
const Pipe: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; seed?: number; color?: string }> = ({ x1, y1, x2, y2, p, seed = 0, color = C.indigo }) => {
  const frame = useCurrentFrame();
  if (p <= 0) return null;
  const L = Math.hypot(x2 - x1, y2 - y1);
  const xe = x1 + (x2 - x1) * p, ye = y1 + (y2 - y1) * p;
  return (
    <g>
      <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={mix(color, "#FFFFFF", 0.55)} strokeWidth={14} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={C.white} strokeWidth={6} strokeLinecap="round" />
      {p >= 1 && L > 60 && [0, 0.5].map((k) => { const t = (frame * 0.012 + k + seed * 0.17) % 1; return <Cube key={k} x={x1 + (x2 - x1) * t} y={y1 + (y2 - y1) * t - 4} s={11} color={C.amber} o={Math.sin(t * Math.PI)} />; })}
    </g>
  );
};

// ================================================================ x_diagram
const XDiagram: React.FC<P<{ kicker?: string; title: string; nodes: DNode[]; edges: [string, string][]; ats?: number[] }>> = ({ dur, kicker, title, nodes, edges, ats }) => {
  const p = useP(dur);
  const at = spreadAts(nodes.length, 0.08, 0.75, ats);
  const idx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));
  let cur = -1; at.forEach((a, i) => { if (p(a, a + 0.01) > 0.5) cur = i; });
  const H = (n: DNode) => n.hh ?? 130;
  const side = (a: DNode, b: DNode): [number, number, number, number] => {
    const ax = a.x + a.w / 2, ay = a.y + H(a) / 2, bx = b.x + b.w / 2, by = b.y + H(b) / 2;
    if (Math.abs(bx - ax) > Math.abs(by - ay) * 1.2) return bx > ax ? [a.x + a.w, ay, b.x, by] : [a.x, ay, b.x + b.w, by];
    return by > ay ? [ax, a.y + H(a), bx, b.y] : [ax, a.y, bx, b.y + H(b)];
  };
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        {edges.map(([a, b], i) => {
          const A = nodes[idx[a]], B = nodes[idx[b]]; if (!A || !B) return null;
          const t0 = Math.max(at[idx[a]], at[idx[b]]); const [x1, y1, x2, y2] = side(A, B);
          return <Pipe key={i} x1={x1} y1={y1} x2={x2} y2={y2} p={p(t0, t0 + 0.05)} seed={i} />;
        })}
      </Svg>
      {nodes.map((n, i) => {
        const on = cur === i; const col = ACC[i % ACC.length];
        return (
          <Slab key={n.id} x={n.x} y={n.y} w={n.w} h={H(n)} depth={on ? 16 : 10} hi={on ? col : undefined} o={p(at[i], at[i] + 0.05)} color={on ? mix("#FFFFFF", col, 0.1) : C.white}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 10, height: "100%", background: col, borderRadius: "10px 0 0 10px" }} />
            <div style={{ position: "absolute", left: 26, top: 14, width: n.w - 40, fontFamily: F, fontWeight: 800, fontSize: n.w > 300 ? 34 : 30, color: C.ink, lineHeight: 1.05 }}>{n.h}</div>
            {n.d && <div style={{ position: "absolute", left: 26, top: 62, width: n.w - 40, fontFamily: F, fontWeight: 600, fontSize: n.w > 300 ? 20 : 18, color: C.sub, lineHeight: 1.25 }}>{n.d}</div>}
          </Slab>
        );
      })}
    </>
  );
};

// ================================================================ x_code
const XCode: React.FC<P<{ kicker?: string; title: string; file?: string; lines: string[]; notes?: { a: number; b: number; at: number; t: string }[] }>> = ({ dur, kicker, title, file, lines, notes = [] }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const shown = p(0.02, 0.14) * lines.length;
  let cur = -1; notes.forEach((n, i) => { if (p(n.at, n.at + 0.01) > 0.5) cur = i; });
  const rowH = Math.min(46, Math.floor(540 / Math.max(1, lines.length)));
  const fs = rowH > 40 ? 23 : 20; const hi = cur >= 0 ? notes[cur] : null; const hcol = cur >= 0 ? ACC[cur % ACC.length] : C.indigo;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Slab x={110} y={250} w={1140} h={lines.length * rowH + 100} color={C.ink} depth={14} o={p(0, 0.06)}>
        <div style={{ position: "absolute", left: 20, top: 16, display: "flex", gap: 8 }}>{[C.rose, C.amber, C.emerald].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}</div>
        {file && <div style={{ position: "absolute", left: 90, top: 10, fontFamily: MONO, fontSize: 19, color: "#A5B4FC" }}>{file}</div>}
        {hi && hi.a >= 0 && <div style={{ position: "absolute", left: 14, top: 58 + hi.a * rowH - 3, width: 1106, height: (hi.b - hi.a + 1) * rowH + 4, borderRadius: 8, background: `rgba(165,180,252,${0.2 + Math.sin(frame * 0.1) * 0.04})`, borderLeft: `5px solid ${hcol}` }} />}
        {lines.map((l, i) => (
          <div key={i} style={{ position: "absolute", left: 34, top: 58 + i * rowH, height: rowH, display: "flex", alignItems: "center", fontFamily: MONO, fontSize: fs, whiteSpace: "pre", opacity: Math.max(0, Math.min(1, shown - i)) }}>
            {l.split(/(#.*$)/).map((seg, k) => <span key={k} style={{ color: seg.startsWith("#") ? "#8B93C7" : l.startsWith("→") ? C.amber : "#EEF0FF" }}>{seg}</span>)}
          </div>
        ))}
      </Slab>
      {notes.map((n, i) => {
        const o = p(n.at, n.at + 0.04); const on = cur === i; const col = ACC[i % ACC.length];
        return (
          <Slab key={i} x={1300} y={250 + i * 150} w={520} h={126} depth={on ? 14 : 8} hi={on ? col : undefined} o={o} style={{ opacity: Math.min(1, o * 1.4) * (on ? 1 : 0.7) }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 10, height: "100%", background: col, borderRadius: "10px 0 0 10px" }} />
            <div style={{ position: "absolute", left: 26, top: 12, fontFamily: MONO, fontSize: 17, color: col, fontWeight: 700 }}>{n.a >= 0 ? `L${n.a + 1}${n.b > n.a ? "–" + (n.b + 1) : ""}` : "NOTE"}</div>
            <div style={{ position: "absolute", left: 26, top: 38, width: 470, fontFamily: F, fontWeight: 700, fontSize: 25, color: C.ink, lineHeight: 1.2 }}>{n.t}</div>
          </Slab>
        );
      })}
    </>
  );
};

// ================================================================ x_cosine (vectors lying on an iso floor)
const XCosine: React.FC<P<{ kicker?: string; title: string; query: { label: string; v: number[] }; mems: { label: string; v: number[] }[]; k?: number }>> = ({ dur, kicker, title, query, mems, k = 2 }) => {
  const p = useP(dur);
  const cos = (a: number[], b: number[]) => (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1]));
  const rows = mems.map((m) => ({ ...m, c: cos(query.v, m.v) }));
  const ranked = [...rows].sort((a, b) => b.c - a.c);
  const R = 4.6; const pr = iso(600, 560, 62);
  const at2 = (v: number[]) => { const n = Math.hypot(v[0], v[1]); return pr((v[0] / n) * R, (-v[1] / n) * R, 0); };
  const O = pr(0, 0, 0);
  const ring = Array.from({ length: 73 }, (_, i) => pr(Math.cos((i / 72) * Math.PI * 2) * R, Math.sin((i / 72) * Math.PI * 2) * R, 0));
  const showRank = p(0.72, 0.8) > 0.5;
  const colPr = (i: number) => iso(1270 + i * 165, 790, 38);
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        <polygon points={poly(ring)} fill={mix(C.bg1, C.indigo, 0.08)} stroke={C.grid} strokeWidth={3} opacity={p(0.04, 0.12)} />
        <line x1={pr(-R - 0.6, 0, 0)[0]} y1={pr(-R - 0.6, 0, 0)[1]} x2={pr(R + 0.6, 0, 0)[0]} y2={pr(R + 0.6, 0, 0)[1]} stroke={C.grid} strokeWidth={2} opacity={p(0.04, 0.12)} />
        <line x1={pr(0, -R - 0.6, 0)[0]} y1={pr(0, -R - 0.6, 0)[1]} x2={pr(0, R + 0.6, 0)[0]} y2={pr(0, R + 0.6, 0)[1]} stroke={C.grid} strokeWidth={2} opacity={p(0.04, 0.12)} />
        {rows.map((m, i) => { const [x, y] = at2(m.v); const o = p(0.6 + i * 0.02, 0.66 + i * 0.02); const top = showRank && ranked.indexOf(m) < k; return (
          <g key={i} opacity={o}><line x1={O[0]} y1={O[1]} x2={x} y2={y} stroke={top ? C.indigo : "#94A3B8"} strokeWidth={top ? 6 : 4} strokeLinecap="round" /><Cube x={x} y={y - 8} s={20} color={top ? C.indigo : "#CBD5E1"} /></g>); })}
        <g opacity={p(0.46, 0.52)}><line x1={O[0]} y1={O[1]} x2={at2(query.v)[0]} y2={at2(query.v)[1]} stroke={C.rose} strokeWidth={7} strokeLinecap="round" /><Cube x={at2(query.v)[0]} y={at2(query.v)[1] - 10} s={24} color={C.rose} /></g>
      </Svg>
      {rows.map((m, i) => { const [x, y] = at2(m.v); return <Fade key={i} o={p(0.62 + i * 0.02, 0.68 + i * 0.02)} style={{ position: "absolute", left: x - 150, top: y - 70, width: 300, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 24, color: C.ink }}>{m.label}</Fade>; })}
      <Fade o={p(0.46, 0.54)} style={{ position: "absolute", left: 120, top: 880 - 60, fontFamily: F, fontWeight: 800, fontSize: 28, color: C.rose }}>query: {query.label}</Fade>
      <Slab x={1180} y={250} w={640} h={120} o={p(0.25, 0.32)}>
        <div style={{ position: "absolute", left: 24, top: 18, fontFamily: MONO, fontSize: 28, fontWeight: 700, color: C.ink }}>cos θ = a·b / (|a| |b|)</div>
        <div style={{ position: "absolute", left: 24, top: 66, fontFamily: F, fontSize: 21, fontWeight: 600, color: C.sub }}>1 = same direction · 0 = unrelated · computed</div>
      </Slab>
      <Svg>{(showRank ? ranked : rows).map((m, i) => { const top = showRank && i < k; return <IsoBox key={m.label} pr={colPr(i)} x={0} y={0} z={0} w={1.6} d={1.6} h={Math.max(0.05, m.c) * 7 * p(0.6 + i * 0.02, 0.66 + i * 0.02)} color={top ? C.indigo : m.c < 0 ? C.rose : "#94A3B8"} />; })}</Svg>
      {(showRank ? ranked : rows).map((m, i) => { const pr2 = colPr(i); const [tx, ty] = pr2(0.8, 0.8, Math.max(0.05, m.c) * 7); const [bx, by] = pr2(1.6, 1.6, 0); const o = p(0.6 + i * 0.02, 0.66 + i * 0.02); return (
        <React.Fragment key={m.label}>
          <div style={{ position: "absolute", left: tx - 60, top: ty - 40, width: 120, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.ink, opacity: o }}>{m.c.toFixed(2)}</div>
          <div style={{ position: "absolute", left: pr2(0.8, 0.8, 0)[0] - 78, top: by + 8, width: 156, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 17, lineHeight: 1.15, color: showRank && i < k ? C.indigo : C.sub, opacity: o }}>{showRank ? <b>#{i + 1}<br /></b> : null}{m.label}</div>
        </React.Fragment>); })}
    </>
  );
};

// ================================================================ x_hnsw (layers as stacked iso planes)
const XHnsw: React.FC<P<{ kicker?: string; title: string; n?: number; seed?: number }>> = ({ dur, kicker, title, n = 90, seed = 7 }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const H = buildHnsw(n, seed);
  const U = 7, GAP = 3.4; const pr = iso(720, 560, 42);
  const at3 = (i: number, L: number) => pr(H.pts[i].x * U, H.pts[i].y * U, L * GAP);
  const qAt = (L: number) => pr(H.q[0] * U, H.q[1] * U, L * GAP);
  const layerAt = [0.12, 0.22, 0.25];
  const segP = [p(0.62, 0.72), p(0.55, 0.6), p(0.45, 0.52)];   // indexed by layer L
  const done = p(0.72, 0.8);
  const pulse = 0.6 + Math.sin(frame * 0.15) * 0.4;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        {[0, 1, 2].map((L) => {
          const o = p(layerAt[L], layerAt[L] + 0.06);
          const ids = H.pts.map((q, i) => (q.lv >= L ? i : -1)).filter((i) => i >= 0);
          const lp = H.path[2 - L]; const sp = segP[L]; const nSeg = Math.max(1, lp.length - 1);
          const plane = [pr(0, 0, L * GAP), pr(U, 0, L * GAP), pr(U, U, L * GAP), pr(0, U, L * GAP)];
          return (
            <g key={L} opacity={o}>
              <polygon points={poly(plane)} fill={mix("#FFFFFF", ACC[L], 0.14)} fillOpacity={0.55} stroke={ACC[L]} strokeWidth={2.5} />
              {ids.flatMap((i) => H.adj[L][i].filter((j) => j > i).map((j) => { const a = at3(i, L), b = at3(j, L); return <line key={i + "-" + j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={mix(ACC[L], "#FFFFFF", 0.35)} strokeWidth={1.4} />; }))}
              {sp > 0 && lp.slice(0, -1).map((a, k) => { const t = Math.max(0, Math.min(1, sp * nSeg - k)); if (t <= 0) return null; const A = at3(a, L), B = at3(lp[k + 1], L); return <line key={"s" + k} x1={A[0]} y1={A[1]} x2={A[0] + (B[0] - A[0]) * t} y2={A[1] + (B[1] - A[1]) * t} stroke={C.amber} strokeWidth={5} strokeLinecap="round" />; })}
              {ids.map((i) => { const [x, y] = at3(i, L); const hit = L === 0 && done > 0.5 && H.topk.includes(i); return <Cube key={i} x={x} y={y - 4} s={hit ? 14 : L === 0 ? 7 : 9} color={hit ? C.amber : ACC[L]} />; })}
              {(() => { const [x, y] = qAt(L); return <Cube x={x} y={y - 6} s={13} color={C.rose} o={p(0.38, 0.42) * pulse} />; })()}
            </g>
          );
        })}
        {/* descent: dashed drop from each layer's final node to the same node one layer down */}
        {[2, 1].map((L) => { const lp = H.path[2 - L]; const last = lp[lp.length - 1]; const a = at3(last, L), b = at3(last, L - 1); return segP[L] >= 1 && <line key={"d" + L} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.amber} strokeWidth={3} strokeDasharray="6 6" />; })}
        {done > 0.5 && (() => { const [x, y] = qAt(0); return <ellipse cx={x} cy={y} rx={62} ry={36} fill="none" stroke={C.amber} strokeWidth={3} strokeDasharray="6 6" opacity={pulse} />; })()}
      </Svg>
      {[2, 1, 0].map((L, k) => {
        const cnt = H.pts.filter((q) => q.lv >= L).length;
        return (
          <Slab key={L} x={1260} y={260 + k * 130} w={560} h={104} o={p(layerAt[L], layerAt[L] + 0.06)} hi={segP[L] > 0 && segP[L] < 1 ? ACC[L] : undefined}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 10, height: "100%", background: ACC[L], borderRadius: "10px 0 0 10px" }} />
            <div style={{ position: "absolute", left: 26, top: 14, fontFamily: F, fontWeight: 800, fontSize: 28, color: C.ink }}>Layer {L} · {cnt} nodes</div>
            <div style={{ position: "absolute", left: 26, top: 56, fontFamily: F, fontWeight: 600, fontSize: 20, color: C.sub }}>{L === 2 ? "sparse express lane · fixed entry point" : L === 1 ? "greedy hops toward the query" : "every vector · best k found here"}</div>
          </Slab>
        );
      })}
      <Fade o={p(0.84, 0.9)} style={{ position: "absolute", left: 1260, top: 670, width: 560, fontFamily: F, fontWeight: 800, fontSize: 26, color: C.amber }}>visited {H.visited} of {n} nodes → best k = 3 (computed)</Fade>
    </>
  );
};

// ================================================================ x_graph (entities as iso blocks, relations as pipes)
const XGraph: React.FC<P<{ kicker?: string; title: string; nodes: GN[]; edges: GE[] }>> = ({ dur, kicker, title, nodes, edges }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const nodeAt = (id: string) => Math.min(0.1 + (id === nodes[0].id ? 0 : 1), ...edges.filter((e) => e.a === id || e.b === id).map((e) => e.at));
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        {edges.map((e, i) => {
          const A = N[e.a], B = N[e.b]; const pe = p(e.at, e.at + 0.05);
          const inv = e.invalid !== undefined && p(e.invalid, e.invalid + 0.02) > 0.5;
          if (inv) return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={C.rose} strokeWidth={5} strokeDasharray="12 10" />;
          return <Pipe key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} p={pe} seed={i} />;
        })}
        {nodes.map((n, i) => { const s = p(nodeAt(n.id), nodeAt(n.id) + 0.05); return <IsoBox key={n.id} pr={iso(n.x, n.y + 40, 58)} x={-0.9} y={-0.9} z={(1 - s) * 3 + (i === 0 ? Math.sin(frame * 0.06) * 0.08 : 0)} w={1.8} d={1.8} h={0.9} color={ACC[i % ACC.length]} o={Math.min(1, s * 2)} />; })}
      </Svg>
      {edges.map((e, i) => {
        const A = N[e.a], B = N[e.b]; const inv = e.invalid !== undefined && p(e.invalid, e.invalid + 0.02) > 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: (A.x + B.x) / 2 - 150, top: (A.y + B.y) / 2 - 30, width: 300, textAlign: "center", opacity: p(e.at + 0.03, e.at + 0.06) }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: inv ? C.rose : C.indigo, background: C.white, padding: "3px 12px", borderRadius: 8, border: `2px solid ${inv ? C.rose : "#C7D2FE"}`, textDecoration: inv ? "line-through" : "none" }}>{e.r}</span>
            {inv && <div style={{ fontFamily: F, fontWeight: 800, fontSize: 18, letterSpacing: 3, color: C.rose, marginTop: 6 }}>INVALID · KEPT</div>}
          </div>
        );
      })}
      {nodes.map((n) => { const o = p(nodeAt(n.id) + 0.02, nodeAt(n.id) + 0.06); return (
        <div key={n.id} style={{ position: "absolute", left: n.x - 150, top: n.y < 450 ? n.y + 100 : n.y - 124, width: 300, textAlign: "center", opacity: o }}>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 32, color: C.ink }}>{n.label}</div>
          <div style={{ fontFamily: F, fontWeight: 700, fontSize: 18, color: C.sub }}>{n.type}</div>
        </div>); })}
    </>
  );
};

// ================================================================ x_store (the memory table as stacked slabs)
const XStore: React.FC<P<{ kicker?: string; title: string; mode?: "v2" | "v3"; steps: { say: string; ops: Op[]; at: number }[] }>> = ({ dur, kicker, title, mode = "v2", steps }) => {
  const p = useP(dur);
  let k = -1; steps.forEach((s, i) => { if (p(s.at, s.at + 0.01) > 0.5) k = i; });
  const rows: { id: string; text: string; old?: string; dead?: boolean; last?: string; lastStep?: number }[] = [];
  const history: string[] = [];
  steps.slice(0, k + 1).forEach((s, si) => s.ops.forEach(([op, id, text]) => {
    const r = rows.find((x) => x.id === id); history.push(`${op} ${id}`);
    if (op === "ADD") rows.push({ id, text, last: op, lastStep: si });
    else if (r && op === "UPDATE") { r.old = r.text; r.text = text; r.last = op; r.lastStep = si; }
    else if (r && op === "DELETE") { r.dead = mode === "v2"; r.last = op; r.lastStep = si; }
    else if (r && op === "NOOP") { r.last = op; r.lastStep = si; }
  }));
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      {steps.map((s, i) => { const o = p(s.at - 0.02, s.at + 0.02); return (
        <Slab key={i} x={110} y={260 + i * 112} w={660} h={94} depth={i === k ? 12 : 6} o={o} hi={i === k ? C.indigo : undefined} style={{ opacity: Math.min(1, o * 1.4) * (i === k ? 1 : 0.6) }}>
          <div style={{ position: "absolute", left: 20, top: 12, width: 620, fontFamily: F, fontWeight: 700, fontSize: 24, color: C.ink, whiteSpace: "nowrap", overflow: "hidden" }}>“{s.say}”</div>
          <div style={{ position: "absolute", left: 20, top: 52, display: "flex", gap: 8 }}>{s.ops.map(([op], j) => <span key={j} style={{ fontFamily: MONO, fontWeight: 800, fontSize: 16, color: C.white, background: OPC[op], padding: "2px 10px", borderRadius: 6, opacity: p(s.at + 0.02, s.at + 0.05) }}>{op}</span>)}</div>
        </Slab>); })}
      <div style={{ position: "absolute", left: 830, top: 250, fontFamily: F, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: C.indigo, opacity: p(0.04, 0.08) }}>MEMORY STORE</div>
      {rows.map((r, i) => { const fresh = r.lastStep === k; const col = r.last ? OPC[r.last] : C.indigo; return (
        <Slab key={r.id} x={830} y={290 + i * 104} w={990} h={86} depth={fresh ? 14 : 8} hi={fresh ? col : undefined} color={r.dead ? "#F1F5F9" : C.white} style={{ opacity: r.dead ? 0.55 : 1 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 10, height: "100%", background: r.dead ? C.rose : C.indigo, borderRadius: "10px 0 0 10px" }} />
          <div style={{ position: "absolute", left: 28, top: 14, fontFamily: MONO, fontSize: 20, color: C.sub }}>{r.id}</div>
          <div style={{ position: "absolute", left: 90, top: r.old ? 8 : 22, fontFamily: F, fontWeight: 800, fontSize: 30, color: r.dead ? C.rose : C.ink, textDecoration: r.dead ? "line-through" : "none", whiteSpace: "nowrap" }}>{r.text}</div>
          {r.old && <div style={{ position: "absolute", left: 90, top: 50, fontFamily: F, fontSize: 18, fontWeight: 600, color: C.sub, textDecoration: "line-through" }}>was: {r.old}</div>}
          {fresh && r.last && <span style={{ position: "absolute", right: 18, top: 24, fontFamily: MONO, fontWeight: 800, fontSize: 18, color: C.white, background: col, padding: "4px 12px", borderRadius: 6 }}>{r.last}</span>}
        </Slab>); })}
      <Fade o={p(0.8, 0.86)} style={{ position: "absolute", left: 830, top: 840, width: 990, fontFamily: MONO, fontSize: 18, color: C.sub }}>history: {history.join(" · ")}</Fade>
    </>
  );
};

// ================================================================ x_fusion (the real scoring formula, iso bars)
const XFusion: React.FC<P<{ kicker?: string; title: string; query: string; terms: number; threshold?: number; cands: Cand[]; phases?: number[] }>> = ({ dur, kicker, title, query, terms, threshold = 0.1, cands, phases = [0.2, 0.32, 0.46, 0.6, 0.7] }) => {
  const p = useP(dur);
  const [mid, steep] = bm25Params(terms);
  const rows = cands.map((c) => {
    const gated = c.sem < threshold;
    const b = c.bm25 > 0 ? 1 / (1 + Math.exp(-steep * (c.bm25 - mid))) : 0;
    const w = 1 / (1 + 0.001 * (Math.max(c.en, 1) - 1) ** 2);
    const e = c.esim >= 0.5 ? c.esim * 0.5 * w : 0;
    return { ...c, gated, b, e };
  });
  const maxP = 1 + (rows.some((r) => r.b > 0) ? 1 : 0) + (rows.some((r) => r.e > 0) ? 0.5 : 0);
  const scored = rows.map((r) => ({ ...r, comb: r.gated ? 0 : Math.min((r.sem + r.b + r.e) / maxP, 1) }));
  const order = scored.map((r, i) => ({ r, i })).filter((x) => !x.r.gated).sort((a, b) => b.r.comb - a.r.comb).map((x) => x.i);
  const semOrder = scored.map((r, i) => ({ r, i })).sort((a, b) => b.r.sem - a.r.sem).map((x) => x.i);
  const [g0, b0, e0, c0, r0] = phases;
  const tGate = p(g0, g0 + 0.04), tB = p(b0, b0 + 0.06), tE = p(e0, e0 + 0.06), tC = p(c0, c0 + 0.06), tR = p(r0, r0 + 0.035);
  const mid2 = Math.sin(Math.PI * tR);
  const rowY = (i: number) => { const a = semOrder.indexOf(i); const b = scored[i].gated ? scored.length - 1 : order.indexOf(i); return 350 + (a + (b - a) * tR) * 96; };
  const cols = [{ h: "semantic", x: 880 }, { h: "BM25 → σ", x: 1040 }, { h: "entity", x: 1250 }, { h: "combined", x: 1430 }];
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Fade o={p(0.1, 0.16)} style={{ position: "absolute", left: 120, top: 240, width: 1700, fontFamily: F, fontWeight: 700, fontSize: 23, color: C.sub }}>query “{query}” · {terms} terms → σ midpoint {mid}, steepness {steep} · threshold {threshold}</Fade>
      {cols.map((c, i) => <div key={c.h} style={{ position: "absolute", left: c.x, top: 300, fontFamily: F, fontWeight: 800, fontSize: 19, letterSpacing: 2, color: C.indigo, textTransform: "uppercase", opacity: [1, tB, tE, tC][i] * p(0.12, 0.16) }}>{c.h}</div>)}
      {scored.map((r, i) => {
        const gatedNow = r.gated && tGate > 0.5; const rank = order.indexOf(i);
        const moves = !r.gated && semOrder.indexOf(i) !== rank; const dx = moves ? (rank < semOrder.indexOf(i) ? -1 : 1) * 60 * mid2 : 0;
        const top = rank === 0 && tR > 0.9;
        return (
          <Slab key={i} x={110 + dx} y={rowY(i)} w={1710} h={80} depth={top ? 14 : 6} hi={top ? C.indigo : undefined} color={gatedNow ? "#F1F5F9" : C.white}
            o={p(0.12 + i * 0.015, 0.16 + i * 0.015)} style={{ opacity: Math.min(1, p(0.12 + i * 0.015, 0.16 + i * 0.015) * 1.4) * (gatedNow ? 0.45 : 1) * (moves ? 1 - 0.7 * mid2 : 1) }}>
            <span style={{ position: "absolute", left: 20, top: 22, fontFamily: MONO, fontWeight: 700, fontSize: 22, color: C.indigo }}>{tR > 0.95 && rank >= 0 ? `#${rank + 1}` : ""}</span>
            <span style={{ position: "absolute", left: 80, top: 20, width: 670, fontFamily: F, fontWeight: 800, fontSize: 28, color: gatedNow ? C.rose : C.ink, textDecoration: gatedNow ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden" }}>{r.text}</span>
            <span style={{ position: "absolute", left: 770, top: 22, fontFamily: MONO, fontSize: 24, color: C.ink }}>{r.sem.toFixed(2)}{gatedNow ? " < t" : ""}</span>
            <span style={{ position: "absolute", left: 930, top: 22, fontFamily: MONO, fontSize: 22, color: C.ink, opacity: tB }}>{r.bm25 ? `${r.bm25} → ${r.b.toFixed(2)}` : "—"}</span>
            <span style={{ position: "absolute", left: 1140, top: 22, fontFamily: MONO, fontSize: 22, color: C.ink, opacity: tE }}>{r.e ? r.e.toFixed(2) : "—"}</span>
            <span style={{ position: "absolute", left: 1320, top: 18, fontFamily: MONO, fontWeight: 800, fontSize: 28, color: top ? C.indigo : C.ink, opacity: tC }}>{r.gated ? "—" : r.comb.toFixed(2)}</span>
            {!r.gated && <div style={{ position: "absolute", left: 1420, top: 26, width: 260 * r.comb * tC, height: 24, borderRadius: 6, background: top ? C.indigo : "#A5B4FC", boxShadow: `4px 4px 0 ${mix(top ? C.indigo : "#A5B4FC", "#1E1B4B", 0.35)}` }} />}
          </Slab>
        );
      })}
      <Fade o={tC} style={{ position: "absolute", left: 120, top: 840, width: 1700, fontFamily: MONO, fontSize: 20, color: C.indigo }}>combined = (semantic + σ(BM25) + sim × 0.5 × 1/(1+0.001(n−1)²)) / {maxP} · BM25 & entity only re-rank semantic candidates</Fade>
    </>
  );
};

export const isoX: StylePack["scenes"] = {
  x_diagram: XDiagram as any, x_code: XCode as any, x_cosine: XCosine as any, x_hnsw: XHnsw as any,
  x_graph: XGraph as any, x_store: XStore as any, x_fusion: XFusion as any,
};
