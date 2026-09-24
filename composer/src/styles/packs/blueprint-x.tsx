// BLUEPRINT — extra, computation-heavy archetypes (x_* kinds) for system-design / algorithm videos.
// x_diagram · x_code · x_cosine · x_hnsw · x_graph · x_store · x_fusion. All reveal via useP(dur) phases,
// all keep moving (packets, boiling strokes, sweeps), all numbers are computed here, not typed in.
import React from "react";
import { useCurrentFrame } from "remotion";
import { useP, rnd } from "../../lib/primitives";
import { SceneProps, spreadAts, StylePack } from "../core";
import { C, HAND, MONO, Sketch, Svg, Hand, Defs } from "./blueprint";

type P<T> = SceneProps & T;
type PFn = (a: number, b: number) => number;
const Lbl: React.FC<{ x: number; y: number; o: number; children: React.ReactNode; w?: number; color?: string; size?: number; align?: "left" | "center" | "right" }> = ({ x, y, o, children, w = 800, color = C.faint, size = 22, align = "left" }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: align, fontFamily: MONO, fontSize: size, color, letterSpacing: 1, opacity: o, lineHeight: 1.35 }}>{children}</div>
);
const Head: React.FC<{ p: PFn; kicker?: string; title: string }> = ({ p, kicker, title }) => (
  <>
    {kicker && <Lbl x={110} y={120} o={p(0, 0.05)}>{kicker.toUpperCase()}</Lbl>}
    <Hand x={110} y={150} p={p(0, 0.1)} size={70} w={1250}>{title}</Hand>
  </>
);
/** a dot travelling a segment forever (data flowing) */
const Packet: React.FC<{ x1: number; y1: number; x2: number; y2: number; o: number; seed?: number; color?: string }> = ({ x1, y1, x2, y2, o, seed = 0, color = C.hi }) => {
  const frame = useCurrentFrame();
  if (o <= 0) return null;
  return <>{[0, 0.5].map((k) => { const t = ((frame * 0.012 + k + seed * 0.17) % 1); return <circle key={k} cx={x1 + (x2 - x1) * t} cy={y1 + (y2 - y1) * t} r={6} fill={color} opacity={o * Math.sin(t * Math.PI)} />; })}</>;
};

// ================================================================ x_diagram
export type DNode = { id: string; h: string; d?: string; x: number; y: number; w: number; hh?: number };
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
        <Defs />
        {edges.map(([a, b], i) => {
          const A = nodes[idx[a]], B = nodes[idx[b]]; if (!A || !B) return null;
          const t0 = Math.max(at[idx[a]], at[idx[b]]);
          const [x1, y1, x2, y2] = side(A, B);
          const pe = p(t0, t0 + 0.05);
          return (
            <g key={i}>
              <Sketch s={{ k: "path", pts: [[x1, y1], [x2, y2]] }} p={pe} color={C.faint} w={2.5} base={200 + i} />
              {pe >= 1 && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" markerEnd="url(#bpA)" />}
              <Packet x1={x1} y1={y1} x2={x2} y2={y2} o={pe >= 1 ? 1 : 0} seed={i} />
            </g>
          );
        })}
        {nodes.map((n, i) => <Sketch key={n.id} s={{ k: "rect", a: [n.x, n.y, n.w, H(n)] }} p={p(at[i], at[i] + 0.05)} base={100 + i} w={cur === i ? 4.5 : 3} color={cur === i ? C.hi : C.ink} />)}
      </Svg>
      {nodes.map((n, i) => (
        <React.Fragment key={n.id}>
          <div style={{ position: "absolute", left: n.x + 16, top: n.y + 14, width: n.w - 28, fontFamily: HAND, fontWeight: 700, fontSize: n.w > 300 ? 46 : 40, lineHeight: 1, color: cur === i ? C.hi : C.ink, opacity: p(at[i] + 0.02, at[i] + 0.06) }}>{n.h}</div>
          {n.d && <Lbl x={n.x + 16} y={n.y + 66} w={n.w - 28} o={p(at[i] + 0.03, at[i] + 0.07)} size={n.w > 300 ? 19 : 17}>{n.d}</Lbl>}
        </React.Fragment>
      ))}
    </>
  );
};

// ================================================================ x_code
const XCode: React.FC<P<{ kicker?: string; title: string; file?: string; lines: string[]; notes?: { a: number; b: number; at: number; t: string }[] }>> = ({ dur, kicker, title, file, lines, notes = [] }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const shown = p(0.02, 0.14) * lines.length;
  let cur = -1; notes.forEach((n, i) => { if (p(n.at, n.at + 0.01) > 0.5) cur = i; });
  const rowH = Math.min(46, Math.floor(560 / Math.max(1, lines.length)));
  const fs = rowH > 40 ? 24 : 21;
  const hi = cur >= 0 ? notes[cur] : null;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg><Sketch s={{ k: "rect", a: [110, 260, 1130, lines.length * rowH + 90] }} p={p(0, 0.06)} base={301} w={3} /></Svg>
      {file && <Lbl x={130} y={274} o={p(0.02, 0.06)} color={C.hi} size={20}>▸ {file}</Lbl>}
      {hi && hi.a >= 0 && <div style={{ position: "absolute", left: 124, top: 320 + hi.a * rowH - 4, width: 1100, height: (hi.b - hi.a + 1) * rowH + 4, background: `rgba(255,209,102,${0.14 + Math.sin(frame * 0.1) * 0.04})`, borderLeft: `4px solid ${C.hi}` }} />}
      {lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: 140, top: 320 + i * rowH, width: 1080, height: rowH, display: "flex", alignItems: "center", fontFamily: MONO, fontSize: fs, color: l.trim().startsWith("#") || l.includes("  #") ? C.ink : C.ink, whiteSpace: "pre", opacity: Math.max(0, Math.min(1, shown - i)) }}>
          {l.split(/(#.*$)/).map((seg, k) => <span key={k} style={{ color: seg.startsWith("#") ? C.faint : l.startsWith("→") ? C.hi : C.ink }}>{seg}</span>)}
        </div>
      ))}
      {notes.map((n, i) => {
        const o = p(n.at, n.at + 0.04);
        return (
          <div key={i} style={{ position: "absolute", left: 1290, top: 260 + i * 150, width: 530, opacity: o * (cur === i ? 1 : 0.6), transform: `translateX(${(1 - o) * 30}px)` }}>
            <div style={{ fontFamily: MONO, fontSize: 18, color: cur === i ? C.hi : C.faint }}>{n.a >= 0 ? `L${n.a + 1}${n.b > n.a ? "–" + (n.b + 1) : ""}` : "NOTE"}</div>
            <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 38, lineHeight: 1.05, color: cur === i ? C.hi : C.ink }}>{n.t}</div>
          </div>
        );
      })}
    </>
  );
};

// ================================================================ x_cosine (computed)
const XCosine: React.FC<P<{ kicker?: string; title: string; query: { label: string; v: number[] }; mems: { label: string; v: number[] }[]; k?: number }>> = ({ dur, kicker, title, query, mems, k = 2 }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const cos = (a: number[], b: number[]) => { const d = a[0] * b[0] + a[1] * b[1]; return d / (Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1])); };
  const rows = mems.map((m) => ({ ...m, c: cos(query.v, m.v) }));
  const ranked = [...rows].sort((a, b) => b.c - a.c);
  const O = [520, 640], R = 330;
  const pt = (v: number[]) => { const n = Math.hypot(v[0], v[1]); return [O[0] + (v[0] / n) * R, O[1] - (v[1] / n) * R] as [number, number]; };
  const qPt = pt(query.v);
  const qa = Math.atan2(query.v[1], query.v[0]), ta = Math.atan2(ranked[0].v[1], ranked[0].v[0]);
  const arcP = p(0.5, 0.58);
  const sweep = qa + (ta - qa) * arcP;
  const showRank = p(0.72, 0.8) > 0.5;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        <Defs />
        <Sketch s={{ k: "line", a: [O[0] - 380, O[1], O[0] + 380, O[1]] }} p={p(0.04, 0.1)} color={C.faint} w={2} base={401} />
        <Sketch s={{ k: "line", a: [O[0], O[1] + 80, O[0], O[1] - 380] }} p={p(0.04, 0.1)} color={C.faint} w={2} base={402} />
        <Sketch s={{ k: "circle", a: [O[0], O[1], R * 2] }} p={p(0.06, 0.16)} color={C.faint} w={1.5} base={403} />
        {rows.map((m, i) => { const [x, y] = pt(m.v); return <Sketch key={i} s={{ k: "path", pts: [[O[0], O[1]], [x, y]] }} p={p(i === 0 ? 0.5 : 0.6, i === 0 ? 0.56 : 0.66)} color={showRank && ranked.indexOf(m) < k ? C.hi : C.ink} w={3} base={410 + i} />; })}
        <Sketch s={{ k: "path", pts: [[O[0], O[1]], qPt] }} p={p(0.46, 0.52)} color={C.red} w={5} base={420} />
        {arcP > 0 && <path d={`M ${O[0] + Math.cos(qa) * 120} ${O[1] - Math.sin(qa) * 120} A 120 120 0 0 ${ta > qa ? 0 : 1} ${O[0] + Math.cos(sweep) * 120} ${O[1] - Math.sin(sweep) * 120}`} fill="none" stroke={C.hi} strokeWidth={3} />}
        <circle cx={O[0] + Math.cos(frame * 0.02) * R} cy={O[1] - Math.sin(frame * 0.02) * R} r={5} fill={C.faint} opacity={0.6} />
      </Svg>
      {rows.map((m, i) => { const [x, y] = pt(m.v); return <Hand key={i} x={x + (m.v[0] < 0 ? -330 : 14)} y={y - 30 + (m === ranked[0] ? 34 : 0)} p={p(i === 0 ? 0.52 : 0.62, i === 0 ? 0.58 : 0.7)} size={36} w={330} color={C.ink}>{m.label}</Hand>; })}
      <Hand x={O[0] + 30} y={O[1] + 40} p={p(0.46, 0.54)} size={38} w={560} color={C.red}>query: {query.label}</Hand>
      <Lbl x={1180} y={270} o={p(0.25, 0.32)} w={640} color={C.ink} size={26}>cos(θ) = a·b / (|a| |b|)</Lbl>
      <Lbl x={1180} y={316} o={p(0.28, 0.34)} w={640} size={19}>1 = same direction · 0 = unrelated · computed below</Lbl>
      {(showRank ? ranked : rows).map((m, i) => {
        const o = p(0.6 + i * 0.02, 0.64 + i * 0.02); const top = showRank && i < k;
        return (
          <div key={m.label} style={{ position: "absolute", left: 1180, top: 400 + i * 96, width: 640, height: 80, display: "flex", alignItems: "center", gap: 18, opacity: o }}>
            <span style={{ fontFamily: MONO, fontSize: 22, width: 60, color: top ? C.hi : C.faint }}>{showRank ? `#${i + 1}` : ""}</span>
            <span style={{ fontFamily: HAND, fontWeight: 700, fontSize: 34, width: 300, color: top ? C.hi : C.ink }}>{m.label}</span>
            <div style={{ width: 160 * Math.max(0, m.c), height: 20, background: top ? C.hi : C.faint, opacity: 0.8 }} />
            <span style={{ fontFamily: MONO, fontSize: 24, color: top ? C.hi : C.ink }}>{m.c.toFixed(2)}</span>
          </div>
        );
      })}
      {showRank && <Lbl x={1180} y={800} o={p(0.78, 0.84)} w={820} color={C.hi} size={24}>top k = {k} → candidates</Lbl>}
    </>
  );
};

// ================================================================ x_hnsw (computed: build + greedy search)
type HN = { x: number; y: number; lv: number };
const HCACHE: Record<string, { pts: HN[]; adj: number[][][]; entry: number; q: [number, number]; path: number[][]; topk: number[]; visited: number }> = {};
export const buildHnsw = (n: number, seed: number) => {
  const key = `${n}:${seed}`; if (HCACHE[key]) return HCACHE[key];
  const M = 4, mL = 1 / Math.log(M);
  const pts: HN[] = Array.from({ length: n }, (_, i) => {
    const u = Math.max(1e-6, rnd(i, 3, seed));
    return { x: 0.05 + rnd(i, 1, seed) * 0.9, y: 0.07 + rnd(i, 2, seed) * 0.86, lv: Math.min(2, Math.floor(-Math.log(u) * mL)) };
  });
  const d2 = (a: { x: number; y: number }, b: { x: number; y: number }) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  // per-layer graph: link each node to its M nearest nodes present on that layer (symmetric)
  const adj: number[][][] = [0, 1, 2].map((L) => {
    const ids = pts.map((p, i) => (p.lv >= L ? i : -1)).filter((i) => i >= 0);
    const g: number[][] = pts.map(() => []);
    ids.forEach((i) => {
      ids.filter((j) => j !== i).sort((a, b) => d2(pts[i], pts[a]) - d2(pts[i], pts[b])).slice(0, L === 0 ? M : M - 1)
        .forEach((j) => { if (!g[i].includes(j)) g[i].push(j); if (!g[j].includes(i)) g[j].push(i); });
    });
    return g;
  });
  const q: [number, number] = [0.8, 0.78];
  const Q = { x: q[0], y: q[1] };
  const entry = pts.findIndex((p) => p.lv === 2);
  const path: number[][] = [];
  let cur = entry; const seen = new Set<number>([entry]);
  for (let L = 2; L >= 0; L--) {
    const lp = [cur];
    for (;;) {
      let best = cur;
      for (const nb of adj[L][cur]) { seen.add(nb); if (d2(pts[nb], Q) < d2(pts[best], Q)) best = nb; }
      if (best === cur) break;
      cur = best; lp.push(cur);
    }
    path.push(lp);
  }
  // layer-0 candidate list (ef): expand neighbours of the final region, keep best 3
  const cand = new Set<number>([cur, ...adj[0][cur]]);
  adj[0][cur].forEach((nb) => adj[0][nb].forEach((x) => { cand.add(x); seen.add(x); }));
  const topk = [...cand].sort((a, b) => d2(pts[a], Q) - d2(pts[b], Q)).slice(0, 3);
  HCACHE[key] = { pts, adj, entry, q, path, topk, visited: seen.size };
  return HCACHE[key];
};
const XHnsw: React.FC<P<{ kicker?: string; title: string; n?: number; seed?: number }>> = ({ dur, kicker, title, n = 90, seed = 7 }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const H = buildHnsw(n, seed);
  const panels = [{ L: 2, x: 110, at: 0.25 }, { L: 1, x: 690, at: 0.22 }, { L: 0, x: 1270, at: 0.12 }];
  const PW = 540, PH = 520, PY = 290;
  const pos = (i: number, px: number) => [px + H.pts[i].x * PW, PY + H.pts[i].y * PH] as [number, number];
  const segP = [p(0.45, 0.52), p(0.55, 0.6), p(0.62, 0.72)];
  const done = p(0.72, 0.8);
  const pulse = 0.6 + Math.sin(frame * 0.15) * 0.4;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      {panels.map((P_, pi) => {
        const ids = H.pts.map((q, i) => (q.lv >= P_.L ? i : -1)).filter((i) => i >= 0);
        const o = p(P_.at, P_.at + 0.06);
        const lp = H.path[2 - P_.L];
        const sp = segP[2 - P_.L];
        const nSeg = Math.max(1, lp.length - 1);
        const [qx, qy] = [P_.x + H.q[0] * PW, PY + H.q[1] * PH];
        return (
          <React.Fragment key={P_.L}>
            <Lbl x={P_.x} y={PY - 44} o={o} color={C.hi} size={22}>LAYER {P_.L} · {ids.length} nodes{P_.L === 2 ? " · entry" : P_.L === 0 ? " · every vector" : ""}</Lbl>
            <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: o }}>
              <rect x={P_.x - 8} y={PY - 8} width={PW + 16} height={PH + 16} fill="none" stroke="rgba(255,255,255,0.35)" strokeDasharray="6 8" />
              {ids.flatMap((i) => H.adj[P_.L][i].filter((j) => j > i).map((j) => { const a = pos(i, P_.x), b = pos(j, P_.x); return <line key={i + "-" + j} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(143,182,230,0.35)" strokeWidth={1.4} />; }))}
              {ids.map((i) => { const [x, y] = pos(i, P_.x); const hit = P_.L === 0 && done > 0.5 && H.topk.includes(i); return <circle key={i} cx={x} cy={y} r={hit ? 9 : P_.L === 0 ? 4 : 6} fill={hit ? C.hi : C.ink} opacity={hit ? 1 : 0.85} />; })}
              {sp > 0 && lp.slice(0, -1).map((a, k) => {
                const segT = Math.max(0, Math.min(1, sp * nSeg - k)); if (segT <= 0) return null;
                const A = pos(a, P_.x), B = pos(lp[k + 1], P_.x);
                return <line key={k} x1={A[0]} y1={A[1]} x2={A[0] + (B[0] - A[0]) * segT} y2={A[1] + (B[1] - A[1]) * segT} stroke={C.hi} strokeWidth={4} />;
              })}
              {sp > 0 && (() => { const [x, y] = pos(lp[0], P_.x); return <circle cx={x} cy={y} r={11} fill="none" stroke={C.hi} strokeWidth={3} />; })()}
              <circle cx={qx} cy={qy} r={10} fill={C.red} opacity={p(0.38, 0.42) * pulse} />
              {P_.L === 0 && done > 0.5 && <circle cx={qx} cy={qy} r={70} fill="none" stroke={C.hi} strokeDasharray="5 7" opacity={pulse} />}
            </svg>
            {pi < 2 && <div style={{ position: "absolute", left: P_.x + PW + 8, top: PY + PH / 2 - 30, fontFamily: HAND, fontWeight: 700, fontSize: 52, color: C.hi, opacity: segP[pi] >= 1 ? 1 : 0.25 }}>↘</div>}
          </React.Fragment>
        );
      })}
      <Lbl x={110} y={830} o={p(0.38, 0.44)} w={900} color={C.red} size={22}>● query</Lbl>
      <Lbl x={400} y={830} o={p(0.84, 0.9)} w={1400} color={C.hi} size={24}>visited {H.visited} of {n} nodes · greedy descent, then best k = 3 at layer 0 (computed)</Lbl>
    </>
  );
};

// ================================================================ x_graph
export type GN = { id: string; label: string; type: string; x: number; y: number };
export type GE = { a: string; b: string; r: string; at: number; invalid?: number };
const XGraph: React.FC<P<{ kicker?: string; title: string; nodes: GN[]; edges: GE[] }>> = ({ dur, kicker, title, nodes, edges }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const nodeAt = (id: string) => Math.min(0.1 + (id === nodes[0].id ? 0 : 1), ...edges.filter((e) => e.a === id || e.b === id).map((e) => e.at));
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Svg>
        <Defs />
        {edges.map((e, i) => {
          const A = N[e.a], B = N[e.b]; const pe = p(e.at, e.at + 0.05);
          const inv = e.invalid !== undefined && p(e.invalid, e.invalid + 0.02) > 0.5;
          const ang = Math.atan2(B.y - A.y, B.x - A.x); const r = 95;
          const x1 = A.x + Math.cos(ang) * r, y1 = A.y + Math.sin(ang) * r, x2 = B.x - Math.cos(ang) * r, y2 = B.y - Math.sin(ang) * r;
          return (
            <g key={i}>
              <Sketch s={{ k: "path", pts: [[x1, y1], [x2, y2]] }} p={pe} color={inv ? C.red : C.hi} w={inv ? 2 : 3.5} base={500 + i} />
              {pe >= 1 && !inv && <Packet x1={x1} y1={y1} x2={x2} y2={y2} o={1} seed={i} />}
              {inv && <line x1={(x1 + x2) / 2 - 40} y1={(y1 + y2) / 2 - 40} x2={(x1 + x2) / 2 + 40} y2={(y1 + y2) / 2 + 40} stroke={C.red} strokeWidth={5} />}
            </g>
          );
        })}
        {nodes.map((n, i) => <Sketch key={n.id} s={{ k: "circle", a: [n.x, n.y, 190] }} p={p(nodeAt(n.id), nodeAt(n.id) + 0.05)} base={600 + i} w={3.5} />)}
      </Svg>
      {edges.map((e, i) => {
        const A = N[e.a], B = N[e.b]; const inv = e.invalid !== undefined && p(e.invalid, e.invalid + 0.02) > 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: (A.x + B.x) / 2 - 150, top: (A.y + B.y) / 2 - 56, width: 300, textAlign: "center", opacity: p(e.at + 0.03, e.at + 0.06) }}>
            <span style={{ fontFamily: MONO, fontSize: 24, color: inv ? C.red : C.hi, background: "rgba(10,43,82,0.85)", padding: "2px 10px", textDecoration: inv ? "line-through" : "none" }}>{e.r}</span>
            {inv && <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: C.red, marginTop: 6, letterSpacing: 3, opacity: 0.7 + Math.sin(frame * 0.15) * 0.3 }}>INVALID · KEPT</div>}
          </div>
        );
      })}
      {nodes.map((n) => {
        const o = p(nodeAt(n.id) + 0.02, nodeAt(n.id) + 0.06);
        return (
          <div key={n.id} style={{ position: "absolute", left: n.x - 140, top: n.y - 34, width: 280, textAlign: "center", opacity: o }}>
            <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: n.label.length > 10 ? 36 : 46, color: C.ink, lineHeight: 1 }}>{n.label}</div>
            <div style={{ fontFamily: MONO, fontSize: 18, color: C.faint, marginTop: 6 }}>{n.type}</div>
          </div>
        );
      })}
      <Lbl x={1480} y={170} o={p(0.14, 0.2)} w={340} size={20}>node = type · embedding · created_at</Lbl>
      <Lbl x={1480} y={216} o={p(0.2, 0.26)} w={340} size={20} color={C.hi}>edge = (source, relation, destination)</Lbl>
    </>
  );
};

// ================================================================ x_store (replays ops onto a live table)
export type Op = [string, string, string];
const OPC: Record<string, string> = { ADD: "#6EE7A8", UPDATE: C.hi, DELETE: C.red, NOOP: C.faint };
const XStore: React.FC<P<{ kicker?: string; title: string; mode?: "v2" | "v3"; steps: { say: string; ops: Op[]; at: number }[] }>> = ({ dur, kicker, title, mode = "v2", steps }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  let k = -1; steps.forEach((s, i) => { if (p(s.at, s.at + 0.01) > 0.5) k = i; });
  const rows: { id: string; text: string; old?: string; dead?: boolean; last?: string; lastStep?: number }[] = [];
  const history: string[] = [];
  steps.slice(0, k + 1).forEach((s, si) => s.ops.forEach(([op, id, text]) => {
    const r = rows.find((x) => x.id === id);
    history.push(`${op} ${id}`);
    if (op === "ADD") rows.push({ id, text, last: op, lastStep: si });
    else if (r && op === "UPDATE") { r.old = r.text; r.text = text; r.last = op; r.lastStep = si; }
    else if (r && op === "DELETE") { r.dead = mode === "v2"; r.last = op; r.lastStep = si; }
    else if (r && op === "NOOP") { r.last = op; r.lastStep = si; }
  }));
  const flash = 0.5 + Math.sin(frame * 0.2) * 0.5;
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Lbl x={110} y={262} o={p(0.02, 0.06)} color={C.hi}>CONVERSATION</Lbl>
      {steps.map((s, i) => {
        const o = p(s.at - 0.02, s.at + 0.02);
        return (
          <div key={i} style={{ position: "absolute", left: 110, top: 300 + i * 108, width: 640, opacity: o * (i === k ? 1 : 0.55) }}>
            <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 36, color: i === k ? C.ink : C.faint, lineHeight: 1.05 }}>“{s.say}”</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>{s.ops.map(([op], j) => <span key={j} style={{ fontFamily: MONO, fontWeight: 800, fontSize: 18, color: "#0A2B52", background: OPC[op], padding: "2px 10px", opacity: p(s.at + 0.02, s.at + 0.05) }}>{op}</span>)}</div>
          </div>
        );
      })}
      <Svg><Sketch s={{ k: "rect", a: [820, 250, 1000, 560] }} p={p(0.02, 0.08)} base={701} /></Svg>
      <Lbl x={840} y={262} o={p(0.04, 0.08)} color={C.hi}>MEMORY STORE (user: riya)</Lbl>
      {rows.map((r, i) => {
        const fresh = r.lastStep === k;
        return (
          <div key={r.id} style={{ position: "absolute", left: 840, top: 310 + i * 92, width: 960, height: 80, display: "flex", alignItems: "center", gap: 18, opacity: r.dead ? 0.45 : 1 }}>
            <span style={{ fontFamily: MONO, fontSize: 22, color: C.faint, width: 50 }}>{r.id}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 38, color: r.dead ? C.red : C.ink, textDecoration: r.dead ? "line-through" : "none", lineHeight: 1 }}>{r.text}</div>
              {r.old && <div style={{ fontFamily: MONO, fontSize: 18, color: C.faint, textDecoration: "line-through" }}>was: {r.old}</div>}
            </div>
            {fresh && r.last && <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: "#0A2B52", background: OPC[r.last], padding: "4px 12px", opacity: 0.6 + flash * 0.4 }}>{r.last}</span>}
          </div>
        );
      })}
      <Lbl x={820} y={826} o={p(0.8, 0.86)} w={1000} size={20}>history: {history.join(" · ")}</Lbl>
    </>
  );
};

// ================================================================ x_fusion (the real scoring formula)
export type Cand = { text: string; sem: number; bm25: number; esim: number; en: number };
export const bm25Params = (terms: number): [number, number] => (terms <= 3 ? [5, 0.7] : terms <= 6 ? [7, 0.6] : terms <= 9 ? [9, 0.5] : terms <= 15 ? [10, 0.5] : [12, 0.5]);
const XFusion: React.FC<P<{ kicker?: string; title: string; query: string; terms: number; threshold?: number; cands: Cand[]; phases?: number[] }>> = ({ dur, kicker, title, query, terms, threshold = 0.1, cands, phases = [0.2, 0.32, 0.46, 0.6, 0.7] }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const [mid, steep] = bm25Params(terms);
  const rows = cands.map((c) => {
    const gated = c.sem < threshold;
    const b = c.bm25 > 0 ? 1 / (1 + Math.exp(-steep * (c.bm25 - mid))) : 0;
    const w = 1 / (1 + 0.001 * (Math.max(c.en, 1) - 1) ** 2);
    const e = c.esim >= 0.5 ? c.esim * 0.5 * w : 0;
    return { ...c, gated, b, e };
  });
  const hasB = rows.some((r) => r.b > 0), hasE = rows.some((r) => r.e > 0);
  const maxP = 1 + (hasB ? 1 : 0) + (hasE ? 0.5 : 0);
  const scored = rows.map((r) => ({ ...r, comb: r.gated ? 0 : Math.min((r.sem + r.b + r.e) / maxP, 1) }));
  const order = [...scored].map((r, i) => ({ r, i })).filter((x) => !x.r.gated).sort((a, b) => b.r.comb - a.r.comb).map((x) => x.i);
  const semOrder = [...scored].map((r, i) => ({ r, i })).sort((a, b) => b.r.sem - a.r.sem).map((x) => x.i);
  const [g0, b0, e0, c0, r0] = phases;
  const tGate = p(g0, g0 + 0.04), tB = p(b0, b0 + 0.06), tE = p(e0, e0 + 0.06), tC = p(c0, c0 + 0.06), tR = p(r0, r0 + 0.035);
  const rowY = (i: number) => {
    const a = semOrder.indexOf(i); const gatedRow = scored[i].gated;
    const b = gatedRow ? scored.length - 1 : order.indexOf(i);
    return 350 + (a + (b - a) * tR) * 92;
  };
  const cols = [{ h: "semantic", x: 900 }, { h: "BM25 → σ", x: 1080 }, { h: "entity boost", x: 1290 }, { h: "combined", x: 1520 }];
  return (
    <>
      <Head p={p} kicker={kicker} title={title} />
      <Lbl x={110} y={250} o={p(0.1, 0.16)} w={1400} color={C.ink} size={24}>query: “{query}” · {terms} lemmatized terms → σ midpoint {mid}, steepness {steep} · threshold {threshold}</Lbl>
      {cols.map((c, i) => <Lbl key={c.h} x={c.x} y={300} o={[1, tB, tE, tC][i] * p(0.12, 0.16)} w={220} color={C.hi} size={20}>{c.h}</Lbl>)}
      {scored.map((r, i) => {
        const y = rowY(i); const gatedNow = r.gated && tGate > 0.5; const rank = order.indexOf(i);
        const moves = !r.gated && semOrder.indexOf(i) !== order.indexOf(i);
        const mid = Math.sin(Math.PI * tR);                        // 0 → 1 → 0 during the swap
        const dx = moves ? (order.indexOf(i) < semOrder.indexOf(i) ? -1 : 1) * 60 * mid : 0;
        return (
          <div key={i} style={{ position: "absolute", left: 110 + dx, top: y, width: 1710, height: 80, display: "flex", alignItems: "center", opacity: p(0.12 + i * 0.015, 0.16 + i * 0.015) * (gatedNow ? 0.35 : 1) * (moves ? 1 - 0.75 * mid : 1) }}>
            <span style={{ fontFamily: MONO, fontSize: 22, width: 56, color: C.hi }}>{tR > 0.95 && rank >= 0 ? `#${rank + 1}` : ""}</span>
            <span style={{ fontFamily: HAND, fontWeight: 700, fontSize: 34, width: 734, color: gatedNow ? C.red : C.ink, textDecoration: gatedNow ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden" }}>{r.text}</span>
            <span style={{ fontFamily: MONO, fontSize: 26, width: 180, color: C.ink }}>{r.sem.toFixed(2)}{gatedNow ? " < t" : ""}</span>
            <span style={{ fontFamily: MONO, fontSize: 24, width: 210, color: C.ink, opacity: tB }}>{r.bm25 ? `${r.bm25} → ${r.b.toFixed(2)}` : "—"}</span>
            <span style={{ fontFamily: MONO, fontSize: 24, width: 230, color: C.ink, opacity: tE }}>{r.e ? r.e.toFixed(2) : "—"}</span>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, width: 110, color: rank === 0 && tR > 0.9 ? C.hi : C.ink, opacity: tC }}>{r.gated ? "—" : r.comb.toFixed(2)}</span>
            {!r.gated && <div style={{ width: 180 * r.comb * tC, height: 16, background: rank === 0 ? C.hi : C.faint, opacity: 0.8 }} />}
          </div>
        );
      })}
      <Lbl x={110} y={836} o={tC} w={1700} color={C.hi} size={23}>combined = (semantic + σ(BM25) + sim × 0.5 × 1/(1+0.001(n−1)²)) / {maxP} · BM25 & entity only re-rank semantic candidates</Lbl>
      <div style={{ position: "absolute", left: 1790, top: 250, width: 20, height: 20, borderRadius: 10, background: C.hi, opacity: 0.4 + Math.sin(frame * 0.12) * 0.4 }} />
    </>
  );
};

export const blueprintX: StylePack["scenes"] = {
  x_diagram: XDiagram as any, x_code: XCode as any, x_cosine: XCosine as any, x_hnsw: XHnsw as any,
  x_graph: XGraph as any, x_store: XStore as any, x_fusion: XFusion as any,
};
