/**
 * PAPER CUTOUT — a handmade, crafted identity (the 2026 "anti-polish" trend): kraft-cream desk,
 * torn-edge paper shapes with hard cast shadows, masking tape, pins, index cards, a clothes-line
 * of cards, a paper plane. Everything jitters "on threes" like stop-motion. Fredoka type.
 * Fits: storytelling, history, beginner finance, kids/education, personal & friendly topics.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { slide } from "@remotion/transitions/slide";
import { useP, rnd } from "../../lib/primitives";
import { StylePack, SceneProps, spreadAts, TitleProps, DividerProps, StatementProps, ListProps, FlowProps, ChartProps, VersusProps, RecapProps } from "../core";

export const C = { desk: "#EFE3CB", desk2: "#E3D3B3", ink: "#2B2D42", sub: "#5C5F73", red: "#E4572E", yellow: "#F3B61F", blue: "#3F7CAC", green: "#6A994E", pink: "#F29CA3", white: "#FFFDF7", tape: "rgba(246,226,160,0.8)" };
const ACC = [C.red, C.yellow, C.blue, C.green, C.pink];
export const F = "Fredoka, 'Chalkboard SE', 'Avenir Next Rounded', sans-serif";
type P<T> = SceneProps & T;

/** stop-motion jitter: changes every 3 frames, tiny rotation + offset */
const useJit = (seed: number, amt = 1) => {
  const frame = useCurrentFrame(); const k = Math.floor(frame / 3);
  return { r: (rnd(seed, k, 1) - 0.5) * 1.2 * amt, x: (rnd(seed, k, 2) - 0.5) * 3 * amt, y: (rnd(seed, k, 3) - 0.5) * 3 * amt };
};
const useSpr = (dur: number, at: number) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(at * dur * fps), fps, config: { damping: 12, stiffness: 120 } });
};
/** a torn-edge paper polygon (deterministic from seed), as CSS clip-path */
const torn = (seed: number, jag = 1) => {
  const pts: string[] = [];
  const edge = (n: number, f: (t: number, j: number) => string) => { for (let i = 0; i <= n; i++) pts.push(f(i / n, (rnd(seed, i + pts.length) - 0.5) * 2.2 * jag)); };
  edge(14, (t, j) => `${t * 100}% ${1.2 + j}%`);
  edge(6, (t, j) => `${98.8 + j * 0.5}% ${t * 100}%`);
  edge(14, (t, j) => `${100 - t * 100}% ${98.8 + j}%`);
  edge(6, (t, j) => `${1.2 + j * 0.5}% ${100 - t * 100}%`);
  return `polygon(${pts.join(",")})`;
};
/** paper piece with cast shadow (shadow is a darker copy offset behind — clip-path kills box-shadow) */
export const Paper: React.FC<{ x: number; y: number; w: number; h: number; color?: string; seed?: number; rot?: number; s?: number; children?: React.ReactNode; tape?: boolean; pin?: string; round?: boolean }> = ({
  x, y, w, h, color = C.white, seed = 1, rot = 0, s = 1, children, tape, pin, round,
}) => {
  const j = useJit(seed);
  if (s <= 0.001) return null;
  const clip = round ? "circle(49% at 50% 50%)" : torn(seed);
  return (
    <div style={{ position: "absolute", left: x + j.x, top: y + j.y, width: w, height: h, transform: `rotate(${rot + j.r + (1 - s) * 14}deg) scale(${0.6 + 0.4 * s}) translateY(${(1 - s) * 60}px)`, opacity: Math.min(1, s * 1.5) }}>
      <div style={{ position: "absolute", left: 7, top: 10, width: w, height: h, background: "rgba(43,45,66,0.22)", clipPath: clip }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, background: color, clipPath: clip }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(43,45,66,0.06) 1px, transparent 1.5px)", backgroundSize: "7px 7px" }} />
      </div>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      {tape && <div style={{ position: "absolute", left: w / 2 - 60, top: -16, width: 120, height: 34, background: C.tape, transform: `rotate(${(rnd(seed, 9) - 0.5) * 10}deg)` }} />}
      {pin && <div style={{ position: "absolute", left: w / 2 - 14, top: -10, width: 28, height: 28, borderRadius: 14, background: pin, boxShadow: "3px 4px 0 rgba(43,45,66,0.3)" }} />}
    </div>
  );
};
const Title: React.FC<{ text: string; y?: number; s: number; size?: number; seed?: number; color?: string }> = ({ text, y = 110, s, size = 64, seed = 3, color = C.white }) => (
  <Paper x={110} y={y} w={Math.min(1600, text.length * size * 0.55 + 90)} h={size + 50} color={color} seed={seed} rot={-1.2} s={s}>
    <div style={{ position: "absolute", left: 44, top: 20, fontFamily: F, fontWeight: 700, fontSize: size, color: C.ink, whiteSpace: "nowrap" }}>{text}</div>
  </Paper>
);
const Kick: React.FC<{ text?: string; s: number }> = ({ text, s }) => text ? (
  <div style={{ position: "absolute", left: 130, top: 70, padding: "6px 20px", background: C.tape, fontFamily: F, fontWeight: 600, fontSize: 24, color: C.ink, transform: "rotate(-2deg)", opacity: Math.min(1, s * 1.5) }}>{text}</div>
) : null;

// ---------------------------------------------------------------- background: the craft desk
const Background: React.FC<{ beat: number }> = ({ beat }) => {
  const frame = useCurrentFrame(); const k = Math.floor(frame / 4);
  const hills = [C.green, C.yellow, C.red];
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${C.desk} 0%, ${C.desk2} 100%)` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity: 0.35 }}>
        {Array.from({ length: 160 }).map((_, i) => <circle key={i} cx={rnd(i, 1, beat) * 1920} cy={rnd(i, 2, beat) * 1080} r={0.8 + rnd(i, 3) * 1.6} fill="#8A7A5A" />)}
      </svg>
      {hills.map((c, i) => {
        const x = -200 + ((frame * (0.3 + i * 0.12) + i * 400) % 300) - 150;
        return <div key={i} style={{ position: "absolute", left: x + (rnd(i, k) - 0.5) * 3, top: 960 + i * 30, width: 2600, height: 260, background: c, clipPath: torn(40 + i, 3), opacity: 0.9 - i * 0.15 }} />;
      })}
      <div style={{ position: "absolute", right: 70, top: 40, fontFamily: F, fontWeight: 600, fontSize: 24, color: C.sub, transform: `rotate(${(rnd(7, k) - 0.5) * 2}deg)` }}>page {beat + 1}</div>
    </>
  );
};

// ---------------------------------------------------------------- the 8 archetypes
const TitleS: React.FC<P<TitleProps>> = ({ dur, kicker, title, subtitle }) => {
  const p = useP(dur); const lines = title.split("\n");
  const stars = [0, 1, 2, 3].map((i) => useSpr(dur, 0.2 + i * 0.05));
  return (
    <>
      {lines.map((l, i) => {
        const s = useSpr(dur, 0.03 + i * 0.1); const col = i === lines.length - 1 && lines.length > 1 ? C.red : C.white;
        return <Paper key={i} x={150 + i * 60} y={240 + i * 190} w={Math.min(1500, l.length * 62 + 120)} h={170} color={col} seed={11 + i} rot={i % 2 ? 1.6 : -1.8} s={s} tape={i === 0}>
          <div style={{ position: "absolute", left: 50, top: 22, fontFamily: F, fontWeight: 700, fontSize: 112, color: col === C.red ? C.white : C.ink, whiteSpace: "nowrap" }}>{l}</div>
        </Paper>;
      })}
      {kicker && <div style={{ position: "absolute", left: 170, top: 170, padding: "8px 22px", background: C.tape, fontFamily: F, fontWeight: 600, fontSize: 28, color: C.ink, transform: "rotate(-3deg)", opacity: p(0, 0.08) }}>{kicker}</div>}
      {subtitle && <Paper x={220} y={270 + lines.length * 190} w={Math.min(1300, subtitle.length * 21 + 80)} h={70} color={C.yellow} seed={19} rot={-1} s={useSpr(dur, 0.3)}>
        <div style={{ position: "absolute", left: 40, top: 14, fontFamily: F, fontWeight: 500, fontSize: 34, color: C.ink, whiteSpace: "nowrap" }}>{subtitle}</div>
      </Paper>}
      {stars.map((s, i) => <Paper key={i} x={[1500, 1640, 1560, 1720][i]} y={[180, 300, 440, 560][i]} w={90} h={90} color={ACC[i]} seed={50 + i} rot={i * 20} s={s} round />)}
    </>
  );
};

const Divider: React.FC<P<DividerProps>> = ({ dur, n, total, title, sub }) => {
  const p = useP(dur); const s = useSpr(dur, 0); const s2 = useSpr(dur, 0.1);
  return (
    <>
      <Paper x={780} y={140} w={360} h={360} color={ACC[n % ACC.length]} seed={60 + n} s={s} round>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontWeight: 700, fontSize: 210, color: C.white }}>{n}</div>
      </Paper>
      <Paper x={960 - Math.min(760, title.length * 30 + 80)} y={560} w={Math.min(1520, title.length * 60 + 160)} h={150} color={C.white} seed={70 + n} rot={-1.5} s={s2} tape>
        <div style={{ position: "absolute", left: 0, right: 0, top: 24, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 96, color: C.ink, whiteSpace: "nowrap" }}>{title}</div>
      </Paper>
      {sub && <div style={{ position: "absolute", left: 0, right: 0, top: 750, textAlign: "center", fontFamily: F, fontWeight: 500, fontSize: 36, color: C.sub, opacity: p(0.25, 0.4) }}>{sub}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: F, fontWeight: 600, fontSize: 24, color: C.sub, opacity: p(0.3, 0.45) }}>chapter {n} of {total}</div>
    </>
  );
};

const Statement: React.FC<P<StatementProps>> = ({ dur, kicker, lines, accent = -1, big, sub, ats }) => {
  const p = useP(dur);
  const at = spreadAts(lines.length, 0.03, 0.4, ats);
  const bs = useSpr(dur, 0.34);
  return (
    <>
      <Kick text={kicker} s={useSpr(dur, 0)} />
      {lines.map((l, i) => {
        const s = useSpr(dur, at[i]); const acc = i === accent;
        return <Paper key={i} x={120 + (i % 2) * 40} y={150 + i * 150} w={Math.min(big ? 1050 : 1600, l.length * 50 + 100)} h={124} color={acc ? C.yellow : C.white} seed={80 + i} rot={i % 2 ? 1.2 : -1.2} s={s}>
          <div style={{ position: "absolute", left: 44, top: 18, fontFamily: F, fontWeight: 700, fontSize: 88, color: C.ink, whiteSpace: "nowrap" }}>{l}</div>
        </Paper>;
      })}
      {big && <Paper x={1290} y={200} w={500} h={500} color={C.red} seed={90} s={bs} round pin={C.yellow}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40, fontFamily: F, fontWeight: 700, fontSize: Math.min(96, Math.floor(820 / big.length)), color: C.white, lineHeight: 1.05 }}>{big}</div>
      </Paper>}
      {sub && <div style={{ position: "absolute", left: 140, top: 190 + lines.length * 150 + 20, width: big ? 1050 : 1600, fontFamily: F, fontWeight: 500, fontSize: 36, color: C.sub, opacity: p(0.5, 0.62) }}>{sub}</div>}
    </>
  );
};

const List: React.FC<P<ListProps>> = ({ dur, kicker, title, items, ats }) => {
  const at = spreadAts(items.length, 0.1, 0.72, ats);
  const cols = items.length > 3 ? 3 : items.length; const rows = Math.ceil(items.length / cols);
  const W = Math.min(520, (1680 - (cols - 1) * 40) / cols), H = rows > 1 ? 300 : 380;
  return (
    <>
      <Kick text={kicker} s={useSpr(dur, 0)} />
      <Title text={title} s={useSpr(dur, 0)} />
      {items.map((it, i) => {
        const s = useSpr(dur, at[i]); const c = i % cols, r = Math.floor(i / cols);
        return <Paper key={i} x={120 + c * (W + 40)} y={280 + r * (H + 30)} w={W} h={H} color={C.white} seed={100 + i} rot={((i * 37) % 7) - 3} s={s} pin={ACC[i % ACC.length]}>
          <div style={{ position: "absolute", left: 36, top: 40, fontFamily: F, fontWeight: 700, fontSize: 64, color: ACC[i % ACC.length] }}>{i + 1}</div>
          <div style={{ position: "absolute", left: 36, top: 120, width: W - 72, fontFamily: F, fontWeight: 700, fontSize: 44, color: C.ink, lineHeight: 1.05 }}>{it.h}</div>
          {it.d && <div style={{ position: "absolute", left: 36, top: H - 110, width: W - 72, fontFamily: F, fontWeight: 400, fontSize: 28, color: C.sub, lineHeight: 1.2 }}>{it.d}</div>}
        </Paper>;
      })}
    </>
  );
};

const Flow: React.FC<P<FlowProps>> = ({ dur, kicker, title, steps, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const n = steps.length; const at = spreadAts(n, 0.1, 0.72, ats);
  const sag = (x: number) => 320 + 80 * Math.sin(((x - 100) / 1720) * Math.PI);
  const W = Math.min(300, 1600 / n - 30);
  const xs = steps.map((_, i) => 130 + ((1660 - W) * i) / Math.max(1, n - 1) + W / 2);
  const t = (frame % 180) / 180; const px = 100 + t * 1720;
  return (
    <>
      <Kick text={kicker} s={useSpr(dur, 0)} />
      <Title text={title} s={useSpr(dur, 0)} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={`M 100 ${sag(100)} Q 960 ${sag(960) + 90} 1820 ${sag(1820)}`} fill="none" stroke={C.sub} strokeWidth={3} strokeDasharray="10 6" opacity={p(0.05, 0.12)} />
      </svg>
      {steps.map((st, i) => {
        const s = useSpr(dur, at[i]); const y = sag(xs[i]) + 20;
        return (
          <React.Fragment key={i}>
            <Paper x={xs[i] - W / 2} y={y} w={W} h={330} color={i % 2 ? C.white : C.yellow} seed={120 + i} rot={((i * 53) % 9) - 4} s={s}>
              <div style={{ position: "absolute", left: W / 2 - 12, top: -30, width: 24, height: 60, background: C.blue, borderRadius: 6 }} />
              <div style={{ position: "absolute", left: 28, top: 50, fontFamily: F, fontWeight: 700, fontSize: 60, color: C.red }}>{i + 1}</div>
              <div style={{ position: "absolute", left: 28, top: 130, width: W - 56, fontFamily: F, fontWeight: 700, fontSize: 40, color: C.ink, lineHeight: 1.05 }}>{st.h}</div>
              {st.d && <div style={{ position: "absolute", left: 28, top: 230, width: W - 56, fontFamily: F, fontWeight: 400, fontSize: 24, color: C.sub, lineHeight: 1.2 }}>{st.d}</div>}
            </Paper>
          </React.Fragment>
        );
      })}
      {p(at[n - 1] + 0.06, at[n - 1] + 0.07) > 0.5 && (
        <div style={{ position: "absolute", left: px - 40, top: sag(px) - 150 + Math.sin(frame * 0.1) * 12, width: 90, height: 60, background: C.white, clipPath: "polygon(0 60%, 100% 0, 45% 100%, 40% 70%)", transform: "rotate(-8deg)", boxShadow: "none" }} />
      )}
    </>
  );
};

const Chart: React.FC<P<ChartProps>> = ({ dur, kicker, title, type, unit = "", note, points = [], bars = [], marks = [], ats }) => {
  const p = useP(dur);
  const X0 = 220, X1 = 1680, Y0 = 820, Y1 = 330;
  const noteEl = note && <div style={{ position: "absolute", left: 220, top: 880, fontFamily: F, fontWeight: 500, fontSize: 24, color: C.sub, opacity: p(0.1, 0.2) }}>{note}</div>;
  if (type === "bar") {
    const at = spreadAts(bars.length, 0.12, 0.7, ats);
    const max = Math.max(...bars.map((b) => b.value), 1); const n = bars.length;
    const W = Math.min(210, (X1 - X0) / n - 50), gap = (X1 - X0 - n * W) / n;
    return (
      <>
        <Kick text={kicker} s={useSpr(dur, 0)} />
        <Title text={title} s={useSpr(dur, 0)} />
        {bars.map((b, i) => {
          const s = useSpr(dur, at[i]); const h = Math.max(40, (b.value / max) * (Y0 - Y1)); const x = X0 + gap / 2 + i * (W + gap);
          return (
            <React.Fragment key={i}>
              <Paper x={x} y={Y0 - h} w={W} h={h + 20} color={ACC[i % ACC.length]} seed={140 + i} s={s} />
              <div style={{ position: "absolute", left: x - 40, top: Y0 - h - 70, width: W + 80, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: n > 4 ? 40 : 48, color: C.ink, opacity: Math.min(1, s * 1.4) }}>{b.value.toLocaleString("en-US")}{unit}</div>
              <div style={{ position: "absolute", left: x - 40, top: Y0 + 34, width: W + 80, textAlign: "center", fontFamily: F, fontWeight: 600, fontSize: 28, color: C.sub, opacity: Math.min(1, s * 1.4) }}>{b.label}</div>
            </React.Fragment>
          );
        })}
        {noteEl}
      </>
    );
  }
  const xmin = Math.min(...points.map((q) => q.x)), xmax = Math.max(...points.map((q) => q.x)), ymax = Math.max(...points.map((q) => q.y)) * 1.1;
  const X = (v: number) => X0 + ((v - xmin) / (xmax - xmin || 1)) * (X1 - X0), Y = (v: number) => Y0 - (v / (ymax || 1)) * (Y0 - Y1);
  const k = Math.max(2, Math.round(points.length * p(0.1, 0.7)));
  const d = "M " + points.slice(0, k).map((q) => `${X(q.x)} ${Y(q.y)}`).join(" L ");
  const mAt = spreadAts(marks.length, 0.35, 0.75, marks.map((m) => m.at) as number[]);
  const yAt = (xv: number) => points.reduce((b, q) => (Math.abs(q.x - xv) < Math.abs(b.x - xv) ? q : b), points[0]).y;
  return (
    <>
      <Kick text={kicker} s={useSpr(dur, 0)} />
      <Title text={title} s={useSpr(dur, 0)} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.sub} strokeWidth={4} strokeDasharray="14 8" />
        <path d={d} fill="none" stroke="rgba(43,45,66,0.25)" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" transform="translate(5,7)" />
        <path d={d} fill="none" stroke={C.red} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30 6" />
      </svg>
      {marks.map((m, i) => {
        const s = useSpr(dur, mAt[i]);
        return <React.Fragment key={i}>
          <Paper x={X(m.x) - 30} y={Y(yAt(m.x)) - 30} w={60} h={60} color={C.yellow} seed={160 + i} s={s} round />
          <div style={{ position: "absolute", left: X(m.x) - 210, top: Y(yAt(m.x)) - 90, width: 180, textAlign: "right", fontFamily: F, fontWeight: 700, fontSize: 40, color: C.ink, opacity: Math.min(1, s * 1.4) }}>{m.label}</div>
        </React.Fragment>;
      })}
      {noteEl}
    </>
  );
};

const Versus: React.FC<P<VersusProps>> = ({ dur, kicker, title, left, right, winner }) => {
  const p = useP(dur);
  const sheet = (s: { h: string; items: string[] }, x: number, a: number, win: boolean, seed: number) => (
    <Paper x={x} y={270} w={780} h={560} color={win ? C.white : "#F7F0E3"} seed={seed} rot={x < 900 ? -1.5 : 1.5} s={useSpr(dur, a)} tape>
      <div style={{ position: "absolute", left: 50, top: 50, fontFamily: F, fontWeight: 700, fontSize: 66, color: win ? C.red : C.ink }}>{s.h}</div>
      {s.items.map((it, i) => <div key={i} style={{ position: "absolute", left: 56, top: 170 + i * 80, width: 680, fontFamily: F, fontWeight: 500, fontSize: 34, color: C.ink, opacity: p(a + 0.06 + i * 0.05, a + 0.1 + i * 0.05) }}>✂ {it}</div>)}
    </Paper>
  );
  return (
    <>
      <Kick text={kicker} s={useSpr(dur, 0)} />
      <Title text={title} s={useSpr(dur, 0)} />
      {sheet(left, 110, 0.08, winner === "left", 170)}
      {sheet(right, 1030, 0.4, winner === "right", 171)}
      <Paper x={890} y={500} w={140} h={140} color={C.blue} seed={172} s={useSpr(dur, 0.32)} round>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontWeight: 700, fontSize: 52, color: C.white }}>vs</div>
      </Paper>
      {winner && <Paper x={winner === "left" ? 740 : 1660} y={230} w={130} h={130} color={C.yellow} seed={173} s={useSpr(dur, 0.8)} round>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>★</div>
      </Paper>}
    </>
  );
};

const Recap: React.FC<P<RecapProps>> = ({ dur, title, items, closer, ats }) => {
  const p = useP(dur);
  const at = spreadAts(items.length, 0.06, 0.7, ats);
  const rowH = Math.min(72, 480 / Math.max(1, items.length));
  return (
    <>
      <Paper x={300} y={90} w={1320} h={800} color={C.white} seed={180} rot={-0.8} s={useSpr(dur, 0)} tape>
        <div style={{ position: "absolute", left: 110, top: 0, width: 3, height: 800, background: "rgba(228,87,46,0.5)" }} />
        {Array.from({ length: 11 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 150 + i * 60, height: 2, background: "rgba(63,124,172,0.2)" }} />)}
        <div style={{ position: "absolute", left: 140, top: 50, fontFamily: F, fontWeight: 700, fontSize: 64, color: C.ink }}>{title}</div>
        {items.map((it, i) => <div key={i} style={{ position: "absolute", left: 140, top: 180 + i * rowH, width: 1100, fontFamily: F, fontWeight: 500, fontSize: 38, color: C.ink, opacity: p(at[i], at[i] + 0.05) }}><span style={{ color: C.red, fontWeight: 700 }}>{i + 1}.</span> {it}</div>)}
      </Paper>
      {closer && <div style={{ position: "absolute", left: 420, top: 780, padding: "10px 30px", background: C.tape, fontFamily: F, fontWeight: 700, fontSize: 46, color: C.ink, transform: "rotate(-2deg)", opacity: p(0.8, 0.88) }}>{closer}</div>}
    </>
  );
};

export const paper: StylePack = {
  id: "paper",
  name: "Paper Cutout",
  Background: Background as StylePack["Background"],
  scenes: { title: TitleS as any, divider: Divider as any, statement: Statement as any, list: List as any, flow: Flow as any, chart: Chart as any, versus: Versus as any, recap: Recap as any },
  caption: { font: F, size: 34, weight: 600, color: C.ink, bg: "rgba(255,253,247,0.95)", border: "2px solid rgba(43,45,66,0.2)", radius: 6, bottom: 40, pad: "10px 30px" },
  transition: (i) => slide({ direction: i % 2 ? "from-bottom" : "from-right" }) as never,
  transitionFrames: 16,
};
