/**
 * KINETIC TYPE — a bold, type-as-image identity. Flat full-bleed colour fields that change every
 * beat, huge Anton caps that slam in on springs, geometric shapes (@remotion/shapes) spinning with
 * organic noise wobble (@remotion/noise), sliding stripe bands. Fits: hooks, Shorts/Reels,
 * intros, listicles, high-energy recaps.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { slide } from "@remotion/transitions/slide";
import { flip } from "@remotion/transitions/flip";
import { Circle, Star, Triangle } from "@remotion/shapes";
import { noise2D } from "@remotion/noise";
import { useP } from "../../lib/primitives";
import { StylePack, SceneProps, COMPARE, Kind } from "../core";

export const C = { yellow: "#FFE600", black: "#0B0B0B", pink: "#FF3D7F", cobalt: "#2B59FF", white: "#FFFFFF", mint: "#3DFFB5" };
export const DISPLAY = "Anton, Impact, 'Arial Narrow', sans-serif";
export const BODY = "Inter, 'Helvetica Neue', sans-serif";
const FIELD: Partial<Record<Kind, string>> = { hook: C.yellow, formula: C.black, growth: C.cobalt, compare: C.pink, takeaway: C.black };
/** generic beats cycle through the palette; fg() gives the readable ink for a field */
export const PALETTE = [C.yellow, C.black, C.cobalt, C.pink, C.mint];
export const fieldFor = (kind: Kind, beat: number) => FIELD[kind] ?? PALETTE[beat % PALETTE.length];
export const fg = (bg: string) => (bg === C.black || bg === C.cobalt ? C.white : C.black);
export const hi = (bg: string) => (bg === C.yellow ? C.pink : bg === C.pink ? C.yellow : bg === C.mint ? C.cobalt : C.yellow);

/** word(s) that slam in on a spring at fraction `at` of the beat; optional exit at `out` */
export const Slam: React.FC<{ dur: number; at: number; out?: number; x: number; y: number; size: number; color: string; children: React.ReactNode; from?: "up" | "scale" | "left" | "right"; rot?: number; w?: number; align?: "left" | "center" }> = ({
  dur, at, out, x, y, size, color, children, from = "up", rot = 0, w = 1700, align = "left",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const F = dur * fps;
  const s = spring({ frame: frame - Math.round(at * F), fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });
  const e = out === undefined ? 0 : spring({ frame: frame - Math.round(out * F), fps, config: { damping: 20, stiffness: 200 } });
  if (s <= 0.001) return null;
  const tr = from === "up" ? `translateY(${(1 - s) * 160}px)` : from === "left" ? `translateX(${(1 - s) * -600}px)` : from === "right" ? `translateX(${(1 - s) * 600}px)` : `scale(${0.3 + 0.7 * s})`;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: align, fontFamily: DISPLAY, fontSize: size, lineHeight: 0.92, color, textTransform: "uppercase", letterSpacing: 1,
      transform: `${tr} rotate(${rot * (1 - s)}deg) scale(${1 - e})`, opacity: Math.min(1, s * 1.5) * (1 - e), transformOrigin: "left center", whiteSpace: "nowrap" }}>{children}</div>
  );
};
export const Stripes: React.FC<{ y: number; h: number; color: string; o: number; speed?: number; text?: string; textColor?: string }> = ({ y, h, color, o, speed = 6, text, textColor = C.black }) => {
  const frame = useCurrentFrame();
  const off = (frame * speed) % 800;
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1920, height: h, overflow: "hidden", opacity: o, background: color }}>
      {text && <div style={{ position: "absolute", top: (h - h * 0.8) / 2, left: -off, whiteSpace: "nowrap", fontFamily: DISPLAY, fontSize: h * 0.72, color: textColor, lineHeight: 1 }}>{Array(6).fill(text + " ★ ").join("")}</div>}
    </div>
  );
};
/** a geometric shape drifting on noise and spinning — pure motion texture */
export const Floater: React.FC<{ kind: "circle" | "star" | "tri"; x: number; y: number; r: number; color: string; seed: number; o?: number; stroke?: boolean }> = ({ kind, x, y, r, color, seed, o = 1, stroke }) => {
  const frame = useCurrentFrame();
  const dx = noise2D(`x${seed}`, frame * 0.008, 0) * 60, dy = noise2D(`y${seed}`, 0, frame * 0.008) * 60;
  const rot = frame * (seed % 2 ? 0.6 : -0.45);
  const common = stroke ? { fill: "none", stroke: color, strokeWidth: 14 } : { fill: color };
  const el = kind === "circle" ? <Circle radius={r} {...common} /> : kind === "star" ? <Star points={5} innerRadius={r * 0.45} outerRadius={r} cornerRadius={8} {...common} /> : <Triangle length={r * 1.7} direction="up" cornerRadius={10} {...common} />;
  return <div style={{ position: "absolute", left: x + dx - r, top: y + dy - r, opacity: o, transform: `rotate(${rot}deg)` }}>{el}</div>;
};

// ---------------------------------------------------------------- background: flat colour field per beat
const Background: React.FC<{ beat: number; kind: Kind }> = ({ kind, beat }) => {
  const frame = useCurrentFrame();
  const bg = fieldFor(kind, beat);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: bg }} />
      {kind === "takeaway" && <div style={{ position: "absolute", inset: 0, background: C.yellow, clipPath: `polygon(0 0, ${58 + Math.sin(frame * 0.03) * 2}% 0, ${38 + Math.sin(frame * 0.03) * 2}% 100%, 0 100%)` }} />}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${bg === C.black ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} 2px, transparent 2.5px)`, backgroundSize: "36px 36px", backgroundPosition: `${frame % 36}px 0` }} />
    </>
  );
};

// ---------------------------------------------------------------- scenes
const Hook: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  return (
    <>
      <Floater kind="circle" x={1560} y={300} r={220} color={C.black} seed={1} stroke />
      <Floater kind="star" x={250} y={860} r={110} color={C.pink} seed={2} />
      <Slam dur={dur} at={0.0} out={0.14} x={120} y={330} size={240} color={C.black}>HERE'S A</Slam>
      <Slam dur={dur} at={0.04} out={0.14} x={120} y={560} size={240} color={C.pink}>QUESTION.</Slam>
      <Slam dur={dur} at={0.16} out={0.4} x={120} y={200} size={200} color={C.black} from="left">YOUR MONEY</Slam>
      <Slam dur={dur} at={0.24} out={0.4} x={120} y={400} size={200} color={C.black} from="left">GROWS <span style={{ color: C.pink }}>8%</span></Slam>
      <Slam dur={dur} at={0.32} out={0.4} x={120} y={600} size={200} color={C.black} from="left">A YEAR.</Slam>
      <Slam dur={dur} at={0.42} x={120} y={170} size={290} color={C.black} from="scale" rot={-8}>HOW LONG</Slam>
      <Slam dur={dur} at={0.5} x={120} y={440} size={290} color={C.pink} from="scale" rot={6}>TO DOUBLE?</Slam>
      <Stripes y={760} h={130} color={C.black} o={p(0.66, 0.7)} text="THERE'S A TRICK" textColor={C.yellow} />
    </>
  );
};

const Formula: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  return (
    <>
      <Floater kind="star" x={1450} y={450} r={300} color={C.pink} seed={5} o={p(0.03, 0.08) * 0.85} stroke />
      <Slam dur={dur} at={0.0} x={120} y={140} size={150} color={C.white}>RULE OF</Slam>
      <Slam dur={dur} at={0.04} x={1180} y={160} size={560} color={C.yellow} from="scale" w={600}>72</Slam>
      <div style={{ position: "absolute", left: 120, top: 400, width: 900 * p(0.25, 0.3), height: 190, background: C.pink }} />
      <Slam dur={dur} at={0.26} x={150} y={410} size={180} color={C.black}>÷ THE RATE</Slam>
      <div style={{ position: "absolute", left: 120, top: 640, width: 1060 * p(0.56, 0.62), height: 190, background: C.mint }} />
      <Slam dur={dur} at={0.57} x={150} y={650} size={180} color={C.black}>= YEARS TO ×2</Slam>
      <div style={{ position: "absolute", left: 1220, top: 700, fontFamily: BODY, fontWeight: 800, fontSize: 30, color: C.white, opacity: p(0.8, 0.86) * (0.7 + Math.sin(frame * 0.2) * 0.3), letterSpacing: 4 }}>(ROUGHLY.)</div>
    </>
  );
};

const Growth: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  const steps = [{ v: "₹1L", y: 0, at: 0.24 }, { v: "₹2L", y: 9, at: 0.4 }, { v: "₹4L", y: 18, at: 0.58 }, { v: "₹8L", y: 27, at: 0.68 }];
  let cur = 0;
  steps.forEach((s, i) => { if (p(s.at, s.at + 0.01) > 0.5) cur = i; });
  return (
    <>
      <Slam dur={dur} at={0.0} x={120} y={120} size={130} color={C.yellow}>72 ÷ 8 = 9</Slam>
      {steps.map((s, i) => (
        <Slam key={s.v} dur={dur} at={s.at} out={i < 3 ? steps[i + 1].at : undefined} x={100} y={300} size={420} color={C.white} from="scale" w={1100}>{s.v}</Slam>
      ))}
      <div style={{ position: "absolute", left: 120, top: 760, fontFamily: DISPLAY, fontSize: 90, color: C.yellow, opacity: p(0.24, 0.28) }}>YEAR {steps[cur].y}</div>
      {steps.map((s, i) => {
        const h = 60 * Math.pow(2, i) * Math.min(1, p(s.at, s.at + 0.05) * 1.2);
        return <div key={i} style={{ position: "absolute", left: 1150 + i * 170, bottom: 190, width: 140, height: h, background: i === cur ? C.yellow : C.white, opacity: p(s.at, s.at + 0.02) }} />;
      })}
      <Stripes y={900} h={100} color={C.yellow} o={p(0.82, 0.86)} text="EVERY 9 YEARS ×2" />
    </>
  );
};

const Compare: React.FC<SceneProps> = ({ dur }) => {
  const p = useP(dur);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ats = [0.18, 0.06, 0.44];
  return (
    <>
      <Slam dur={dur} at={0.0} x={120} y={110} size={140} color={C.black}>CHANGE THE RATE</Slam>
      {COMPARE.map((c, i) => {
        const s = spring({ frame: frame - Math.round(ats[i] * dur * fps), fps, config: { damping: 12, stiffness: 140 } });
        const h = c.years * 26 * s;
        const x = 180 + i * 420;
        return (
          <div key={c.r} style={{ opacity: s > 0.01 ? 1 : 0 }}>
            <div style={{ position: "absolute", left: x, bottom: 200, width: 300, height: h, background: C.black }} />
            <div style={{ position: "absolute", left: x, bottom: 210 + h, width: 300, textAlign: "center", fontFamily: DISPLAY, fontSize: 120, color: C.white, lineHeight: 1 }}>{c.years}</div>
            <div style={{ position: "absolute", left: x, bottom: 110, width: 300, textAlign: "center", fontFamily: DISPLAY, fontSize: 64, color: C.black }}>{c.r}%</div>
          </div>
        );
      })}
      <Slam dur={dur} at={0.64} x={1420} y={330} size={130} color={C.yellow} w={480} rot={-10}>3× RATE</Slam>
      <Slam dur={dur} at={0.72} x={1420} y={470} size={130} color={C.black} w={480} rot={8}>⅓ WAIT</Slam>
      <Floater kind="tri" x={1640} y={820} r={90} color={C.yellow} seed={9} />
    </>
  );
};

const Takeaway: React.FC<SceneProps> = ({ dur }) => (
  <>
    <Slam dur={dur} at={0.0} out={0.44} x={110} y={200} size={230} color={C.black}>SMALL RATE.</Slam>
    <Slam dur={dur} at={0.16} out={0.44} x={560} y={500} size={230} color={C.yellow} from="right">HUGE TIME.</Slam>
    <Slam dur={dur} at={0.47} x={0} y={260} size={400} color={C.pink} from="scale" w={1920} align="center">72 ÷ RATE</Slam>
    <Slam dur={dur} at={0.8} x={0} y={700} size={120} color={C.white} w={1920} align="center">KEEP IT IN YOUR POCKET</Slam>
    <Floater kind="circle" x={200} y={880} r={70} color={C.pink} seed={4} />
  </>
);

export const kinetic: StylePack = {
  id: "kinetic",
  name: "Kinetic Type",
  Background,
  scenes: { hook: Hook, formula: Formula, growth: Growth, compare: Compare, takeaway: Takeaway },
  caption: { font: BODY, size: 30, weight: 800, upper: true, letterSpacing: 1, color: C.white, bg: C.black, border: "none", radius: 0, bottom: 36, pad: "10px 26px" },
  transition: (i) => (i === 1 ? clockWipe({ width: 1920, height: 1080 }) : i === 2 ? slide({ direction: "from-bottom" }) : i === 3 ? flip({ direction: "from-right" }) : slide({ direction: "from-left" })) as never,
  transitionFrames: 14,
};
