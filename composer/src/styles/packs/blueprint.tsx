/**
 * BLUEPRINT — an engineering-drawing identity. Blueprint-blue sheet, white grid, drafting title
 * block, Caveat handwriting + JetBrains Mono dimensions. Every shape is drawn with roughjs (hand-
 * sketched), drawn ON via @remotion/paths, and "boils" (seed flips every 6 frames) like classic
 * hand-drawn animation. Fits: system design, engineering, how-it-works, architecture.
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { wipe } from "@remotion/transitions/wipe";
import { evolvePath } from "@remotion/paths";
import rough from "roughjs";
import { scaleLinear } from "d3-scale";
import { useP } from "../../lib/primitives";
import { StylePack, SceneProps, GROWTH, DOUBLINGS, COMPARE, RATE } from "../core";

export const C = { blue: "#0F3B6E", blue2: "#0A2B52", ink: "#F4F8FF", faint: "#8FB6E6", hi: "#FFD166", red: "#FF7A7A" };
export const HAND = "Caveat, 'Bradley Hand', cursive";
export const MONO = "'JetBrains Mono', Menlo, monospace";

// ---------------------------------------------------------------- rough drawing
type Spec =
  | { k: "line"; a: number[] } | { k: "rect"; a: number[] } | { k: "circle"; a: number[] }
  | { k: "ellipse"; a: number[] } | { k: "path"; pts: [number, number][] } | { k: "curve"; pts: [number, number][] };
const GEN = rough.generator();
const CACHE = new Map<string, { d: string; fill?: string }[]>();
const roughPaths = (s: Spec, seed: number, fill?: string): { d: string; fill?: string }[] => {
  const key = JSON.stringify(s) + seed + (fill || "");
  const hit = CACHE.get(key);
  if (hit) return hit;
  const o = { seed, roughness: 1.4, bowing: 1.2, stroke: "#fff", strokeWidth: 3, fill, fillStyle: "hachure" as const, hachureGap: 12, fillWeight: 2 };
  const dr =
    s.k === "line" ? GEN.line(s.a[0], s.a[1], s.a[2], s.a[3], o)
      : s.k === "rect" ? GEN.rectangle(s.a[0], s.a[1], s.a[2], s.a[3], o)
        : s.k === "circle" ? GEN.circle(s.a[0], s.a[1], s.a[2], o)
          : s.k === "ellipse" ? GEN.ellipse(s.a[0], s.a[1], s.a[2], s.a[3], o)
            : s.k === "path" ? GEN.linearPath(s.pts, o) : GEN.curve(s.pts, o);
  const out = GEN.toPaths(dr).map((q) => ({ d: q.d, fill: q.fill && q.fill !== "none" ? q.fill : undefined }));
  CACHE.set(key, out);
  return out;
};
/** hand-drawn shape, drawn on as p goes 0→1, then boiling forever */
export const Sketch: React.FC<{ s: Spec; p: number; color?: string; w?: number; fill?: string; base?: number }> = ({ s, p, color = C.ink, w = 3, fill, base = 1 }) => {
  const frame = useCurrentFrame();
  if (p <= 0) return null;
  const seed = base + (Math.floor(frame / 6) % 3);
  return (
    <g>
      {roughPaths(s, seed, fill).map((q, i) => {
        const ev = evolvePath(Math.min(1, p), q.d);
        return <path key={i} d={q.d} fill="none" stroke={q.fill ? fill : color} strokeWidth={q.fill ? 2 : w} strokeLinecap="round" opacity={q.fill ? 0.55 : 1}
          strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />;
      })}
    </g>
  );
};
export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>
);
/** handwritten text revealed left→right like it is being written */
export const Hand: React.FC<{ x: number; y: number; p: number; size?: number; color?: string; children: React.ReactNode; w?: number; rot?: number }> = ({ x, y, p, size = 56, color = C.ink, children, w = 1200, rot = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: HAND, fontWeight: 700, fontSize: size, color, lineHeight: 1.05, whiteSpace: "nowrap",
    clipPath: `inset(-20% ${100 - Math.max(0, Math.min(1, p)) * 100}% -20% 0)`, transform: `rotate(${rot}deg)` }}>{children}</div>
);
/** engineering dimension line with arrowheads + label */
export const Dim: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; label: string; color?: string; side?: number }> = ({ x1, y1, x2, y2, p, label, color = C.hi, side = -1 }) => {
  if (p <= 0) return null;
  const vert = x1 === x2;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <g opacity={Math.min(1, p * 2)}>
      <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={color} strokeWidth={2} markerStart="url(#bpA)" markerEnd={p > 0.95 ? "url(#bpA)" : undefined} />
      <text x={vert ? mx + side * -18 : mx} y={vert ? my : my + side * 16} textAnchor={vert ? (side < 0 ? "start" : "end") : "middle"} fontFamily={MONO} fontSize={24} fill={color} opacity={p > 0.9 ? 1 : 0}>{label}</text>
    </g>
  );
};
export const Defs = () => (
  <defs>
    <marker id="bpA" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto-start-reverse"><path d="M0,1 L10,6 L0,11" fill="none" stroke={C.hi} strokeWidth="2" /></marker>
  </defs>
);

// ---------------------------------------------------------------- background: the drawing sheet
const Background: React.FC<{ beat: number; total: number; meta?: { brand?: string; project?: string; issue?: string; code?: string } }> = ({ beat, total, meta = {} }) => {
  const frame = useCurrentFrame();
  const off = (frame * 0.25) % 30;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, ${C.blue} 0%, ${C.blue2} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)`, backgroundSize: "30px 30px", backgroundPosition: `${off}px ${off}px` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.14) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.14) 1.5px, transparent 1.5px)`, backgroundSize: "150px 150px", backgroundPosition: `${off}px ${off}px` }} />
      <div style={{ position: "absolute", left: 40, top: 40, right: 40, bottom: 40, border: `3px solid rgba(255,255,255,0.65)` }} />
      <div style={{ position: "absolute", left: 52, top: 52, right: 52, bottom: 52, border: `1px solid rgba(255,255,255,0.35)` }} />
      <div style={{ position: "absolute", right: 52, top: 52, width: 520, height: 96, display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", borderLeft: "1px solid rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.5)", fontFamily: MONO, color: C.faint, fontSize: 15 }}>
        {[["PROJECT", (meta.project ?? "EXPLAINER").toUpperCase().slice(0, 16)], ["SHEET", `${beat + 1} / ${total}`], ["SCALE", "1 : 1"]].map(([k, v]) => (
          <div key={k} style={{ borderRight: "1px solid rgba(255,255,255,0.3)", padding: "12px 14px" }}>
            <div>{k}</div><div style={{ color: C.ink, fontSize: 22, marginTop: 6 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 76, top: 62, fontFamily: MONO, fontSize: 16, color: C.faint, letterSpacing: 3 }}>DWG No. {(meta.code ?? "EF-001")}-{String(beat + 1).padStart(2, "0")} · REV A</div>
    </>
  );
};

// ---------------------------------------------------------------- scenes
const Coins: React.FC<{ x: number; base: number; n: number; p: number; seed: number }> = ({ x, base, n, p, seed }) => (
  <>{Array.from({ length: n }).map((_, i) => <Sketch key={i} s={{ k: "ellipse", a: [x, base - i * 34, 170, 50] }} p={p * n - i} base={seed + i} fill={i === n - 1 ? C.hi : undefined} />)}</>
);
const Hook: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  return (
    <>
      <Hand x={110} y={150} p={p(0.02, 0.12)} size={70}>a question —</Hand>
      <Svg>
        <Defs />
        <Coins x={520} base={740} n={4} p={p(0.16, 0.3)} seed={3} />
        <Coins x={1040} base={740} n={8} p={p(0.36, 0.52)} seed={11} />
        <Sketch s={{ k: "curve", pts: [[640, 560], [780, 430], [930, 430]] }} p={p(0.34, 0.42)} color={C.hi} base={21} />
        <Dim x1={1200} y1={765} x2={1200} y2={500} p={p(0.46, 0.56)} label="×2" side={1} />
        <Dim x1={440} y1={830} x2={1120} y2={830} p={p(0.5, 0.6)} label="t = ?  years" />
        <Sketch s={{ k: "circle", a: [1440, 470, 190] }} p={p(0.5, 0.6)} color={C.red} base={33} />
      </Svg>
      <Hand x={330} y={250} p={p(0.16, 0.34)} size={58} color={C.faint}>₹ grows at {RATE}% / yr …</Hand>
      <Hand x={1340} y={392} p={p(0.46, 0.54)} size={150} color={C.red} w={200}>?</Hand>
      <Hand x={1300} y={640} p={p(0.66, 0.78)} size={52} color={C.hi}>→ a trick: do it in your head</Hand>
      <div style={{ position: "absolute", left: 1300 + Math.sin(frame * 0.2) * 6, top: 610 + Math.cos(frame * 0.17) * 4, fontSize: 46, opacity: p(0.66, 0.7) }}>✏️</div>
    </>
  );
};

const Formula: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  return (
    <>
      <Hand x={110} y={150} p={p(0, 0.1)} size={64} color={C.faint}>the rule of 72</Hand>
      <Svg>
        <Defs />
        <Sketch s={{ k: "rect", a: [380, 300, 1160, 300] }} p={p(0.02, 0.14)} base={5} />
        <Sketch s={{ k: "curve", pts: [[980, 610], [1000, 690], [900, 740]] }} p={p(0.28, 0.36)} color={C.hi} base={7} />
        <Sketch s={{ k: "curve", pts: [[1380, 610], [1420, 700], [1520, 740]] }} p={p(0.58, 0.66)} color={C.hi} base={9} />
        <Sketch s={{ k: "line", a: [560, 590, 800, 590] }} p={p(0.1, 0.16)} color={C.faint} base={4} />
      </Svg>
      <Hand x={470} y={300} p={p(0.03, 0.44)} size={240} w={1100}>72 / r = t</Hand>
      <Hand x={560} y={740} p={p(0.3, 0.42)} size={54} color={C.hi}>r = yearly growth (%)</Hand>
      <Hand x={1380} y={750} p={p(0.6, 0.72)} size={54} color={C.hi}>t = years to ×2</Hand>
      <div style={{ position: "absolute", left: 1480, top: 250, transform: `rotate(-12deg)`, opacity: p(0.8, 0.86), border: `4px solid ${C.red}`, padding: "6px 18px", fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.red, letterSpacing: 4 }}>≈ APPROX.</div>
    </>
  );
};

const Growth: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  const X0 = 260, X1 = 1300, Y0 = 820, Y1 = 280;
  const x = scaleLinear().domain([0, 27]).range([X0, X1]);
  const y = scaleLinear().domain([0, 8.5]).range([Y0, Y1]);
  const drawn = p(0.28, 0.72);
  const pts = GROWTH.map((q) => [x(q.t), y(q.v)] as [number, number]);
  const ats = [0.42, 0.6, 0.68];
  return (
    <>
      <Hand x={1380} y={200} p={p(0.02, 0.18)} size={96} color={C.hi} w={500}>72/8 = 9</Hand>
      <Svg>
        <Defs />
        <Sketch s={{ k: "line", a: [X0, Y0, X1 + 40, Y0] }} p={p(0.03, 0.1)} base={2} />
        <Sketch s={{ k: "line", a: [X0, Y0, X0, Y1 - 30] }} p={p(0.05, 0.12)} base={3} />
        {[2, 4, 6, 8].map((v) => <text key={v} x={X0 - 20} y={y(v) + 8} textAnchor="end" fontFamily={MONO} fontSize={22} fill={C.faint} opacity={p(0.1, 0.16)}>{v}L</text>)}
        <Sketch s={{ k: "path", pts }} p={drawn} color={C.ink} w={4} base={17} />
        {DOUBLINGS.map((q, i) => (
          <g key={q.t}>
            <Sketch s={{ k: "circle", a: [x(q.t), y(q.v), 54] }} p={p(ats[i], ats[i] + 0.06)} color={C.red} base={40 + i} />
            <text x={x(q.t) - 40} y={y(q.v) - 36} textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize={48} fill={C.red} opacity={p(ats[i] + 0.03, ats[i] + 0.06)}>₹{q.label}L</text>
            <line x1={x(q.t)} y1={Y0} x2={x(q.t)} y2={y(q.v) + 26} stroke={C.faint} strokeDasharray="6 8" opacity={p(ats[i], ats[i] + 0.06)} />
          </g>
        ))}
        {[0, 9, 18].map((t, i) => <Dim key={t} x1={x(t)} y1={Y0 + 50} x2={x(t + 9)} y2={Y0 + 50} p={p(0.8 + i * 0.04, 0.86 + i * 0.04)} label="9 yrs" side={-1} />)}
      </Svg>
      <Hand x={X0 - 40} y={220} p={p(0.28, 0.36)} size={44} color={C.faint}>₹1L @ {RATE}% (computed 1.08ᵗ)</Hand>
    </>
  );
};

const Compare: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  const BY = 820, SC = 26, W = 200;
  const xs = [360, 760, 1160];
  const ats = [0.18, 0.06, 0.44];
  return (
    <>
      <Hand x={110} y={150} p={p(0, 0.1)} size={64} color={C.faint}>years to double, by rate</Hand>
      <Svg>
        <Defs />
        <Sketch s={{ k: "line", a: [260, BY, 1500, BY] }} p={p(0, 0.08)} base={2} />
        {COMPARE.map((c, i) => {
          const h = c.years * SC;
          const o = p(ats[i], ats[i] + 0.1);
          return (
            <g key={c.r}>
              <Sketch s={{ k: "rect", a: [xs[i], BY - h, W, h] }} p={o} fill={i === 1 ? C.faint : C.hi} base={60 + i} />
              <Dim x1={xs[i] + W + 30} y1={BY} x2={xs[i] + W + 30} y2={BY - h} p={p(ats[i] + 0.06, ats[i] + 0.12)} label={`${c.years} yrs`} side={-1} />
              <text x={xs[i] + W / 2} y={BY + 56} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={38} fill={C.ink} opacity={o}>{c.r}%</text>
            </g>
          );
        })}
        <Sketch s={{ k: "curve", pts: [[470, 320], [880, 330], [1250, 620]] }} p={p(0.64, 0.74)} color={C.red} base={70} />
        <Sketch s={{ k: "path", pts: [[1215, 600], [1252, 628], [1262, 584]] }} p={p(0.72, 0.76)} color={C.red} base={71} />
      </Svg>
      <Hand x={1460} y={320} p={p(0.66, 0.8)} size={58} color={C.red} w={440}>3× rate →<br />⅓ the wait</Hand>
    </>
  );
};

const Takeaway: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  return (
    <>
      <Hand x={140} y={170} p={p(0.02, 0.2)} size={70}>small Δ rate  →  big Δ time</Hand>
      <Svg>
        <Defs />
        <Sketch s={{ k: "rect", a: [460, 380, 1000, 330] }} p={p(0.42, 0.52)} base={80} w={4} />
        <Sketch s={{ k: "line", a: [460, 470, 1460, 470] }} p={p(0.48, 0.54)} base={81} color={C.faint} />
      </Svg>
      <div style={{ position: "absolute", left: 480, top: 398, width: 960, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 20, color: C.faint, opacity: p(0.48, 0.52) }}><span>SPEC · RULE OF 72</span><span>FOR MENTAL MATH</span></div>
      <Hand x={600} y={500} p={p(0.5, 0.68)} size={170} w={900}>t ≈ 72 / r</Hand>
      <div style={{ position: "absolute", left: 1330, top: 640, transform: `rotate(-14deg) scale(${p(0.8, 0.84) > 0 ? 1.4 - 0.4 * p(0.8, 0.84) : 1})`, opacity: p(0.8, 0.84), border: `5px solid ${C.red}`, borderRadius: 10, padding: "8px 22px", fontFamily: MONO, fontWeight: 800, fontSize: 36, color: C.red, letterSpacing: 5 }}>✓ KEEP</div>
    </>
  );
};

export const blueprint: StylePack = {
  id: "blueprint",
  name: "Blueprint",
  Background: Background as StylePack["Background"],
  scenes: { hook: Hook, formula: Formula, growth: Growth, compare: Compare, takeaway: Takeaway },
  caption: { font: MONO, size: 28, weight: 600, color: C.ink, bg: "rgba(10,43,82,0.92)", border: "2px dashed rgba(255,255,255,0.7)", radius: 4, bottom: 70 },
  transition: (i) => wipe({ direction: i % 2 ? "from-left" : "from-top-left" }) as never,
  transitionFrames: 16,
};
