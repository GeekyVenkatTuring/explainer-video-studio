/**
 * EDITORIAL — a print-magazine / financial-paper identity. Light cream paper, Playfair Display
 * headlines, Source Serif body, Inter small-caps labels, oxblood + forest accents, FT-style charts.
 * Motion is elegant: masked line reveals, rules drawing across, charts evolving along their path.
 * Fits: finance, markets, business, policy, long-form "explained" pieces.
 */
import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { evolvePath } from "@remotion/paths";
import { line as d3line, curveMonotoneX } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { useP, rnd } from "../../lib/primitives";
import { StylePack, SceneProps, GROWTH, DOUBLINGS, COMPARE, RATE, rule72 } from "../core";

export const C = { paper: "#F3EDE2", paper2: "#E9E0CF", ink: "#171513", sub: "#5E5850", rule: "#CBBFA8", ox: "#9B2335", green: "#2F5D50", gold: "#A8741E", salmon: "#FBE9DA" };
export const DISPLAY = "'Playfair Display', Georgia, serif";
export const BODY = "'Source Serif 4', Georgia, serif";
export const LABEL = "Inter, 'Helvetica Neue', sans-serif";

// ---------------------------------------------------------------- pieces
export const Kicker: React.FC<{ text: string; o: number; color?: string }> = ({ text, o, color = C.ox }) => (
  <div style={{ fontFamily: LABEL, fontWeight: 700, fontSize: 22, letterSpacing: 5, color, opacity: o, textTransform: "uppercase" }}>{text}</div>
);
/** a line of text that slides up from behind a mask */
export const MaskLine: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => (
  <div style={{ overflow: "hidden", paddingBottom: 6 }}>
    <div style={{ transform: `translateY(${(1 - easeOut(p)) * 105}%)`, opacity: p > 0 ? 1 : 0, ...style }}>{children}</div>
  </div>
);
export const easeOut = (v: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, v)), 3);
export const Rule: React.FC<{ x: number; y: number; w: number; p: number; h?: number; color?: string }> = ({ x, y, w, p, h = 2, color = C.ink }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w * easeOut(p), height: h, background: color }} />
);

// ---------------------------------------------------------------- background: paper + masthead + grain
const Background: React.FC<{ beat: number; meta?: { brand?: string; project?: string; issue?: string } }> = ({ beat, meta = {} }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 3);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 40% 30%, ${C.paper} 0%, ${C.paper2} 100%)` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: 0.5 }}>
        {Array.from({ length: 220 }).map((_, i) => (
          <circle key={i} cx={rnd(i, 1, seed) * 1920} cy={rnd(i, 2, seed) * 1080} r={0.6 + rnd(i, 3) * 1.1} fill={C.sub} opacity={0.18} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 90, right: 90, top: 46, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: LABEL, fontSize: 19, letterSpacing: 3, color: C.sub, textTransform: "uppercase" }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 30, letterSpacing: 0, textTransform: "none", color: C.ink, fontWeight: 800 }}>{meta.brand ?? "The Explainer"}</span>
        <span>{meta.project ?? "Explained, properly"}</span>
        <span>{meta.issue ?? "September 2026"}</span>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 92, height: 3, background: C.ink }} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 99, height: 1, background: C.ink }} />
      <div style={{ position: "absolute", right: 90, bottom: 20, fontFamily: BODY, fontStyle: "italic", fontSize: 20, color: C.sub }}>— {beat + 1} —</div>
    </>
  );
};

// ---------------------------------------------------------------- scenes
const Hook: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const drift = 1 + p(0, 1) * 0.025;
  const u = "M 150 640 C 300 660, 520 628, 700 648";
  const ev = evolvePath(p(0.5, 0.62), u);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${drift})`, transformOrigin: "30% 50%" }}>
      <div style={{ position: "absolute", left: 150, top: 190 }}><Kicker text="A question worth asking" o={p(0, 0.08)} /></div>
      <div style={{ position: "absolute", left: 140, top: 240, width: 1000, fontFamily: DISPLAY, fontWeight: 800, fontSize: 122, lineHeight: 1.02, color: C.ink, letterSpacing: -2 }}>
        <MaskLine p={p(0.14, 0.24)}>How long until</MaskLine>
        <MaskLine p={p(0.26, 0.36)}>your money</MaskLine>
        <MaskLine p={p(0.4, 0.5)}><span style={{ fontStyle: "italic", color: C.ox }}>doubles?</span></MaskLine>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={u} stroke={C.ox} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      </svg>
      <div style={{ position: "absolute", left: 1240, top: 230, width: 560, textAlign: "center", opacity: p(0.28, 0.36) }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 300, lineHeight: 1, color: "transparent", WebkitTextStroke: `4px ${C.ox}`, transform: `scale(${1 + Math.sin(frame * 0.05) * 0.015})` }}>{RATE}%</div>
        <div style={{ fontFamily: BODY, fontStyle: "italic", fontSize: 36, color: C.sub, marginTop: -8 }}>a year, compounding</div>
      </div>
      <Rule x={150} y={720} w={1620} p={p(0.6, 0.7)} h={1} color={C.rule} />
      <div style={{ position: "absolute", left: 150, top: 748, width: 1300, fontFamily: BODY, fontSize: 40, color: C.ink, lineHeight: 1.35, opacity: p(0.66, 0.74) }}>
        <span style={{ float: "left", fontFamily: DISPLAY, fontWeight: 800, fontSize: 104, lineHeight: 0.82, color: C.ox, marginRight: 14, marginTop: 6 }}>T</span>
        here is a trick that answers it — in your head, in about two seconds.
      </div>
    </div>
  );
};

const Formula: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const mark = p(0.58, 0.7);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center" }}><Kicker text="The Rule of 72" o={p(0, 0.06)} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 40, fontFamily: DISPLAY, color: C.ink }}>
        <MaskLine p={p(0.03, 0.14)} style={{ fontSize: 250, fontWeight: 900, letterSpacing: -6 }}>72</MaskLine>
        <MaskLine p={p(0.25, 0.34)} style={{ fontSize: 150, fontWeight: 400, color: C.sub }}>÷</MaskLine>
        <MaskLine p={p(0.3, 0.4)} style={{ fontSize: 170, fontStyle: "italic", color: C.ox }}>rate</MaskLine>
        <MaskLine p={p(0.56, 0.64)} style={{ fontSize: 150, fontWeight: 400, color: C.sub }}>=</MaskLine>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: -10, right: -10, bottom: 40, height: 60, background: C.gold, opacity: 0.35, transform: `scaleX(${mark})`, transformOrigin: "left" }} />
          <MaskLine p={p(0.6, 0.7)} style={{ fontSize: 170, fontStyle: "italic", color: C.green }}>years</MaskLine>
        </div>
      </div>
      <Rule x={560} y={640} w={800} p={p(0.34, 0.5)} h={1} color={C.rule} />
      <div style={{ position: "absolute", left: 360, top: 668, width: 1200, textAlign: "center", fontFamily: BODY, fontSize: 36, color: C.ink, opacity: p(0.64, 0.74) }}>
        …roughly how many years your money needs to <em>double</em>.
      </div>
      <div style={{ position: "absolute", left: 360, top: 760, width: 1200, textAlign: "center", fontFamily: BODY, fontStyle: "italic", fontSize: 24, color: C.sub, opacity: p(0.82, 0.9) }}>
        * An approximation. The exact doubling time is ln 2 ÷ ln(1 + r). At 8%: {(Math.log(2) / Math.log(1.08)).toFixed(2)} years.
      </div>
      <div style={{ position: "absolute", left: 820, top: 560, width: 360, textAlign: "center", fontFamily: BODY, fontStyle: "italic", fontSize: 26, color: C.ox, opacity: p(0.34, 0.42), transform: `translateY(${Math.sin(frame * 0.04) * 3}px)` }}>
        ↑ yearly growth, in %
      </div>
    </>
  );
};

const Growth: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const X0 = 190, X1 = 1130, Y0 = 800, Y1 = 330;
  const x = scaleLinear().domain([0, 27]).range([X0, X1]);
  const y = scaleLinear().domain([0, 8.5]).range([Y0, Y1]);
  const d = d3line<{ t: number; v: number }>().x((q) => x(q.t)).y((q) => y(q.v)).curve(curveMonotoneX)(GROWTH) || "";
  const draw = p(0.28, 0.72);
  const ev = evolvePath(draw, d);
  const ats = [0.4, 0.6, 0.68];
  const dotT = ((frame * 0.08) % 27);
  return (
    <>
      <div style={{ position: "absolute", left: 120, top: 170, width: 1090, height: 710, background: C.salmon, border: `1px solid ${C.rule}`, opacity: p(0, 0.06) }} />
      <div style={{ position: "absolute", left: 160, top: 196, fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: C.ink, opacity: p(0.02, 0.08) }}>₹1 lakh at {RATE}% a year</div>
      <div style={{ position: "absolute", left: 160, top: 250, fontFamily: LABEL, fontSize: 20, color: C.sub, opacity: p(0.02, 0.08) }}>Value, ₹ lakh · computed as 1.08<sup>t</sup></div>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 2, 4, 6, 8].map((v) => (
          <g key={v} opacity={p(0.04, 0.12)}>
            <line x1={X0} x2={X1} y1={y(v)} y2={y(v)} stroke={C.rule} strokeWidth={1} />
            <text x={X0 - 16} y={y(v) + 7} textAnchor="end" fontFamily={LABEL} fontSize={20} fill={C.sub}>{v}</text>
          </g>
        ))}
        {[0, 9, 18, 27].map((t) => (
          <text key={t} x={x(t)} y={Y0 + 32} textAnchor="middle" fontFamily={LABEL} fontSize={20} fill={C.sub} opacity={p(0.04, 0.12)}>{t === 0 ? "Year 0" : t}</text>
        ))}
        <path d={d} stroke={C.ox} strokeWidth={5} fill="none" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
        {DOUBLINGS.map((q, i) => {
          const o = p(ats[i], ats[i] + 0.05);
          return (
            <g key={q.t} opacity={o}>
              <line x1={x(q.t)} x2={x(q.t)} y1={Y0} y2={y(q.v)} stroke={C.ink} strokeDasharray="4 6" strokeWidth={1.5} />
              <circle cx={x(q.t)} cy={y(q.v)} r={9} fill={C.paper} stroke={C.ox} strokeWidth={4} />
              <text x={x(q.t) - 16} y={y(q.v) - 20} textAnchor="end" fontFamily={DISPLAY} fontStyle="italic" fontWeight={700} fontSize={34} fill={C.ink}>₹{q.label} lakh</text>
            </g>
          );
        })}
        {draw >= 1 && <circle cx={x(dotT)} cy={y(Math.pow(1.08, dotT))} r={7} fill={C.ox} opacity={0.7} />}
      </svg>
      <div style={{ position: "absolute", left: 1280, top: 210, width: 520 }}>
        <Kicker text="The arithmetic" o={p(0, 0.06)} />
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 96, color: C.ink, marginTop: 14 }}>
          <MaskLine p={p(0.02, 0.12)}>72 ÷ 8</MaskLine>
          <MaskLine p={p(0.12, 0.22)}><span style={{ color: C.ox }}>= 9 years</span></MaskLine>
        </div>
        <Rule x={0} y={330} w={520} p={p(0.22, 0.3)} h={1} color={C.rule} />
        <div style={{ position: "absolute", top: 360, width: 520, fontFamily: BODY, fontSize: 32, lineHeight: 1.45, color: C.ink }}>
          {[["2 lakh", "9 years", 0.4], ["4 lakh", "18 years", 0.6], ["8 lakh", "27 years", 0.68]].map(([a, b, at]) => (
            <div key={a as string} style={{ opacity: p(at as number, (at as number) + 0.05), display: "flex", justifyContent: "space-between", borderBottom: `1px dotted ${C.rule}`, padding: "6px 0" }}>
              <span>₹{a}</span><span style={{ fontStyle: "italic", color: C.sub }}>{b}</span>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: 580, width: 520, fontFamily: DISPLAY, fontStyle: "italic", fontSize: 36, color: C.green, opacity: p(0.82, 0.9) }}>Every nine years, it doubles again.</div>
      </div>
    </>
  );
};

const Compare: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const rows = [COMPARE[0], COMPARE[1], COMPARE[2]];
  const ats = [0.18, 0.06, 0.44];
  const SC = 40;
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 180 }}><Kicker text="Change the rate" o={p(0, 0.06)} /></div>
      <div style={{ position: "absolute", left: 150, top: 220, fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: C.ink, opacity: p(0, 0.08) }}>Years to double, by growth rate</div>
      {rows.map((r, i) => {
        const o = p(ats[i], ats[i] + 0.08);
        const w = r.years * SC * easeOut(o);
        const dim = r.r === 8;
        const tick = (frame * 0.12 + i * 5) % r.years;
        return (
          <div key={r.r} style={{ position: "absolute", left: 150, top: 380 + i * 150, opacity: Math.max(0.15, o) }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 60, color: dim ? C.sub : C.ink, width: 180, position: "absolute", top: 8 }}>{r.r}%</div>
            <div style={{ position: "absolute", left: 200, top: 18, height: 64, width: w, background: dim ? C.rule : r.r === 4 ? C.ox : C.green }}>
              {o >= 1 && <div style={{ position: "absolute", left: tick * SC, top: 26, width: 12, height: 12, borderRadius: 6, background: C.paper, opacity: 0.8 }} />}
            </div>
            <div style={{ position: "absolute", left: 220 + w, top: 12, width: 360, fontFamily: DISPLAY, fontStyle: "italic", fontSize: 54, color: C.ink, whiteSpace: "nowrap", opacity: o }}>{r.years} years</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 1400, top: 400, width: 420, opacity: p(0.64, 0.74), borderLeft: `3px solid ${C.ox}`, paddingLeft: 30 }}>
        <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontSize: 52, lineHeight: 1.15, color: C.ox }}>Triple the rate,<br />a third of the wait.</div>
        <div style={{ fontFamily: BODY, fontSize: 26, color: C.sub, marginTop: 18 }}>{rule72(4)} → {rule72(12)} years</div>
      </div>
    </>
  );
};

const Takeaway: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - Math.round(0.47 * dur * fps), fps, config: { damping: 14 } });
  const per = 2 * (760 + 250);
  const sc = ((frame * 4) % per);
  const scPos = sc < 760 ? [sc, 0] : sc < 1010 ? [760, sc - 760] : sc < 1770 ? [760 - (sc - 1010), 250] : [0, 250 - (sc - 1770)];
  return (
    <>
      <div style={{ position: "absolute", left: 150, top: 130, fontFamily: DISPLAY, fontSize: 340, color: C.ox, opacity: 0.25 * p(0, 0.05), lineHeight: 1 }}>“</div>
      <div style={{ position: "absolute", left: 260, top: 230, width: 1400, fontFamily: DISPLAY, fontStyle: "italic", fontSize: 76, lineHeight: 1.15, color: C.ink }}>
        <MaskLine p={p(0.02, 0.12)}>Small differences in rate</MaskLine>
        <MaskLine p={p(0.14, 0.26)}>make <span style={{ color: C.ox }}>huge</span> differences in time.</MaskLine>
      </div>
      <Rule x={260} y={470} w={700} p={p(0.28, 0.4)} h={2} color={C.ox} />
      <div style={{ position: "absolute", left: 580, top: 540, width: 760, height: 250, opacity: p(0.47, 0.52), transform: `scale(${0.9 + 0.1 * s})` }}>
        <div style={{ position: "absolute", inset: 0, border: `3px dashed ${C.ink}`, background: "#FFFDF8" }} />
        <div style={{ position: "absolute", left: scPos[0] - 20, top: scPos[1] - 24, fontSize: 38 }}>✂️</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", fontFamily: LABEL, fontWeight: 700, fontSize: 20, letterSpacing: 5, color: C.ox }}>CLIP & KEEP</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: DISPLAY, fontWeight: 900, fontSize: 104, color: C.ink }}>72 ÷ <span style={{ fontStyle: "italic", color: C.ox }}>rate</span></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: BODY, fontStyle: "italic", fontSize: 34, color: C.sub, opacity: p(0.8, 0.88) }}>Keep that number in your pocket.</div>
    </>
  );
};

export const editorial: StylePack = {
  id: "editorial",
  name: "Editorial",
  Background: Background as StylePack["Background"],
  scenes: { hook: Hook, formula: Formula, growth: Growth, compare: Compare, takeaway: Takeaway },
  caption: { font: BODY, size: 34, weight: 500, italic: true, color: C.ink, bg: "rgba(255,253,248,0.94)", border: `1px solid ${C.rule}`, radius: 2, bottom: 40 },
  transition: (i) => (i % 2 ? slide({ direction: "from-right" }) : fade()) as never,
  transitionFrames: 18,
};
