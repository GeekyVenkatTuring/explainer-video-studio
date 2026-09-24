/**
 * FLAT VECTOR — a Kurzgesagt-inspired identity: deep-space gradient sky, twinkling stars, a slow
 * planet horizon, and everything built from flat two-tone "orbs" (hard shadow split, no blur),
 * rounded capsules and vivid teal / coral / sun / violet. Nunito 800. Springy pops, orbiting moons,
 * comets along dotted paths. Iris / slide transitions.
 * Fits: science, space, biology, health, "big idea" explainers, general-audience topics.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { evolvePath } from "@remotion/paths";
import { useP, rnd, mix } from "../../lib/primitives";
import { StylePack, SceneProps, spreadAts, TitleProps, DividerProps, StatementProps, ListProps, FlowProps, ChartProps, VersusProps, RecapProps } from "../core";

export const C = { sky0: "#140F3A", sky1: "#2A1A63", sky2: "#4A2A86", white: "#FFFFFF", mute: "#C9C3F0", teal: "#2EC4B6", coral: "#FF6B6B", sun: "#FFD93D", violet: "#9B5DE5", mint: "#80ED99", ink: "#140F3A" };
const ACC = [C.teal, C.coral, C.sun, C.violet, C.mint];
export const F = "Nunito, 'Avenir Next', 'Helvetica Neue', sans-serif";
type P<T> = SceneProps & T;

const useSpr = (dur: number, at: number, damping = 11) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(at * dur * fps), fps, config: { damping, stiffness: 140, mass: 0.8 } });
};
/** flat two-tone sphere: a hard diagonal shadow split + a small highlight dot */
export const Orb: React.FC<{ x: number; y: number; r: number; color: string; s?: number; children?: React.ReactNode; ring?: boolean }> = ({ x, y, r, color, s = 1, children, ring }) => {
  const frame = useCurrentFrame();
  if (s <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, transform: `scale(${s})` }}>
      {ring && <div style={{ position: "absolute", left: -r * 0.55, top: r * 0.78, width: r * 3.1, height: r * 0.44, borderRadius: "50%", border: `${Math.max(4, r * 0.06)}px solid ${mix(color, "#FFFFFF", 0.4)}`, transform: `rotate(${-14 + Math.sin(frame * 0.02) * 3}deg)`, opacity: 0.85 }} />}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `linear-gradient(135deg, ${color} 58%, ${mix(color, "#140F3A", 0.28)} 58%)`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: r * 0.42, top: r * 0.32, width: r * 0.26, height: r * 0.26, borderRadius: "50%", background: mix(color, "#FFFFFF", 0.55), opacity: 0.8 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
};
const Pill: React.FC<{ text: string; color: string; o?: number; size?: number }> = ({ text, color, o = 1, size = 24 }) => (
  <span style={{ display: "inline-block", fontFamily: F, fontWeight: 900, fontSize: size, color: C.ink, background: color, padding: "8px 22px", borderRadius: 999, opacity: o, letterSpacing: 1, textTransform: "uppercase" }}>{text}</span>
);
const Pop: React.FC<{ s: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ s, children, style }) =>
  s <= 0.001 ? null : <div style={{ opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 40}px) scale(${0.85 + 0.15 * s})`, transformOrigin: "left center", ...style }}>{children}</div>;
const Head: React.FC<{ dur: number; kicker?: string; title: string }> = ({ dur, kicker, title }) => {
  const s = useSpr(dur, 0);
  return (
    <>
      {kicker && <div style={{ position: "absolute", left: 120, top: 110 }}><Pill text={kicker} color={C.sun} o={Math.min(1, s * 1.5)} size={20} /></div>}
      <Pop s={s} style={{ position: "absolute", left: 120, top: 160, width: 1600, fontFamily: F, fontWeight: 900, fontSize: 70, color: C.white, letterSpacing: -1 }}>{title}</Pop>
    </>
  );
};

// ---------------------------------------------------------------- background: deep space + planet horizon
const Background: React.FC<{ beat: number }> = ({ beat }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${C.sky0} 0%, ${C.sky1} 55%, ${C.sky2} 100%)` }} />
      {Array.from({ length: 70 }).map((_, i) => {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.05 + i * 1.7));
        const r = 1.5 + rnd(i, 3) * 2.5;
        return <div key={i} style={{ position: "absolute", left: rnd(i, 1, beat) * 1920, top: rnd(i, 2, beat) * 760, width: r * 2, height: r * 2, borderRadius: r, background: "#FFFFFF", opacity: tw * 0.7 }} />;
      })}
      <div style={{ position: "absolute", left: -500, top: 920, width: 2920, height: 2920, borderRadius: "50%", background: `linear-gradient(160deg, ${C.violet} 30%, ${mix(C.violet, C.sky0, 0.45)} 30%)`, opacity: 0.55 }} />
      {[0, 1, 2].map((i) => {
        const x = ((frame * (0.4 + i * 0.15) + i * 700 + beat * 211) % 2400) - 240;
        return <div key={i} style={{ position: "absolute", left: x, top: 960 + i * 22 + Math.sin((x / 2400) * Math.PI) * -20, width: 70 - i * 14, height: 26 - i * 5, borderRadius: 30, background: mix(C.violet, C.sky0, 0.6), opacity: 0.8 }} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------- the 8 archetypes
const Title: React.FC<P<TitleProps>> = ({ dur, kicker, title, subtitle }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const lines = title.split("\n");
  const sp = useSpr(dur, 0.02, 13);
  const a = frame * 0.03;
  return (
    <>
      <Orb x={1440} y={420} r={230} color={C.coral} s={sp} ring />
      <Orb x={1440 + Math.cos(a) * 360} y={420 + Math.sin(a) * 120} r={46} color={C.sun} s={sp} />
      <Orb x={1440 + Math.cos(a + 2.4) * 420} y={420 + Math.sin(a + 2.4) * 150} r={28} color={C.teal} s={sp} />
      {kicker && <div style={{ position: "absolute", left: 120, top: 250, opacity: p(0, 0.08) }}><Pill text={kicker} color={C.sun} size={22} /></div>}
      {lines.map((l, i) => {
        const s = useSpr(dur, 0.04 + i * 0.1);
        return <Pop key={i} s={s} style={{ position: "absolute", left: 115, top: 320 + i * 132, fontFamily: F, fontWeight: 900, fontSize: 124, lineHeight: 1, letterSpacing: -3, color: i === lines.length - 1 && lines.length > 1 ? C.sun : C.white, whiteSpace: "nowrap" }}>{l}</Pop>;
      })}
      {subtitle && <div style={{ position: "absolute", left: 122, top: 360 + lines.length * 132, width: 1000, fontFamily: F, fontWeight: 700, fontSize: 38, color: C.mute, opacity: p(0.3, 0.45) }}>{subtitle}</div>}
    </>
  );
};

const Divider: React.FC<P<DividerProps>> = ({ dur, n, total, title, sub }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const s = useSpr(dur, 0, 12); const col = ACC[n % ACC.length];
  return (
    <>
      <Orb x={960} y={380} r={170} color={col} s={s}><span style={{ fontFamily: F, fontWeight: 900, fontSize: 150, color: C.ink }}>{n}</span></Orb>
      {[0, 1, 2].map((k) => { const a = frame * 0.025 + (k / 3) * Math.PI * 2; return <Orb key={k} x={960 + Math.cos(a) * 320} y={380 + Math.sin(a) * 215} r={22 - k * 4} color={ACC[(n + k + 1) % ACC.length]} s={s} />; })}
      <Pop s={useSpr(dur, 0.1)} style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", transformOrigin: "center", fontFamily: F, fontWeight: 900, fontSize: 92, color: C.white, letterSpacing: -2 }}>{title}</Pop>
      {sub && <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 36, color: C.mute, opacity: p(0.25, 0.4) }}>{sub}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", gap: 12, opacity: p(0.3, 0.45) }}>
        {Array.from({ length: total }).map((_, i) => <div key={i} style={{ width: i + 1 === n ? 40 : 14, height: 14, borderRadius: 7, background: i + 1 <= n ? col : "rgba(255,255,255,0.25)" }} />)}
      </div>
    </>
  );
};

const Statement: React.FC<P<StatementProps>> = ({ dur, kicker, lines, accent = -1, big, sub, ats }) => {
  const p = useP(dur);
  const at = spreadAts(lines.length, 0.03, 0.4, ats);
  const bs = useSpr(dur, 0.34, 12);
  return (
    <>
      {kicker && <div style={{ position: "absolute", left: 120, top: 150, opacity: p(0, 0.06) }}><Pill text={kicker} color={C.sun} size={20} /></div>}
      {lines.map((l, i) => {
        const s = useSpr(dur, at[i]);
        return (
          <Pop key={i} s={s} style={{ position: "absolute", left: 110, top: 220 + i * 128, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: F, fontWeight: 900, fontSize: 104, letterSpacing: -2, color: i === accent ? C.ink : C.white, background: i === accent ? C.sun : "transparent", borderRadius: 26, padding: i === accent ? "0 26px" : 0 }}>{l}</span>
          </Pop>
        );
      })}
      {big && <Orb x={1500} y={420} r={210} color={C.teal} s={bs}><span style={{ fontFamily: F, fontWeight: 900, fontSize: Math.min(90, Math.floor(700 / big.length)), color: C.ink, textAlign: "center", lineHeight: 1 }}>{big}</span></Orb>}
      {sub && <div style={{ position: "absolute", left: 120, top: 240 + lines.length * 128 + 30, width: big ? 1100 : 1600, fontFamily: F, fontWeight: 700, fontSize: 36, color: C.mute, opacity: p(0.5, 0.62) }}>{sub}</div>}
    </>
  );
};

const List: React.FC<P<ListProps>> = ({ dur, kicker, title, items, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const at = spreadAts(items.length, 0.1, 0.72, ats);
  const rowH = Math.min(118, Math.floor(620 / items.length));
  const hot = p(0.85, 0.86) > 0.5 ? Math.floor(frame / 30) % items.length : -1;
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      {items.map((it, i) => {
        const s = useSpr(dur, at[i]); const col = ACC[i % ACC.length]; const on = hot === i;
        return (
          <React.Fragment key={i}>
            <Orb x={170} y={300 + i * rowH + rowH / 2 - 8} r={rowH * 0.36 * (on ? 1.12 : 1)} color={col} s={s}><span style={{ fontFamily: F, fontWeight: 900, fontSize: rowH * 0.36, color: C.ink }}>{i + 1}</span></Orb>
            <Pop s={s} style={{ position: "absolute", left: 250, top: 300 + i * rowH, height: rowH - 16, width: 1560, display: "flex", alignItems: "center", gap: 30, borderRadius: 999, background: on ? "rgba(255,255,255,0.1)" : "transparent", paddingLeft: 20 }}>
              <span style={{ fontFamily: F, fontWeight: 900, fontSize: 50, color: C.white }}>{it.h}</span>
              {it.d && <span style={{ fontFamily: F, fontWeight: 700, fontSize: 30, color: C.mute }}>{it.d}</span>}
            </Pop>
          </React.Fragment>
        );
      })}
    </>
  );
};

const Flow: React.FC<P<FlowProps>> = ({ dur, kicker, title, steps, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const n = steps.length; const at = spreadAts(n, 0.1, 0.72, ats);
  const xs = steps.map((_, i) => 230 + (1460 * i) / Math.max(1, n - 1));
  const ys = steps.map((_, i) => 470 + (i % 2 ? -50 : 50));
  const d = "M " + xs.map((x, i) => `${x} ${ys[i]}`).join(" L ");
  const drawn = p(at[0], at[n - 1] + 0.05);
  const ev = evolvePath(drawn, d);
  const R = Math.min(95, 1400 / n / 2.4);
  const t = (frame % 150) / 150; const seg = Math.min(n - 2, Math.floor(t * (n - 1))); const u = t * (n - 1) - seg;
  const cx = xs[seg] + (xs[seg + 1] - xs[seg]) * u, cy = ys[seg] + (ys[seg + 1] - ys[seg]) * u;
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={d} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={6} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
        {drawn >= 1 && <path d={d} fill="none" stroke={C.sky0} strokeWidth={8} strokeDasharray="4 22" strokeDashoffset={-frame * 2} />}
      </svg>
      {steps.map((st, i) => {
        const s = useSpr(dur, at[i]);
        return (
          <React.Fragment key={i}>
            <Orb x={xs[i]} y={ys[i]} r={R} color={ACC[i % ACC.length]} s={s}><span style={{ fontFamily: F, fontWeight: 900, fontSize: R * 0.8, color: C.ink }}>{i + 1}</span></Orb>
            <div style={{ position: "absolute", left: xs[i] - 170, top: ys[i] + R + 18, width: 340, textAlign: "center", opacity: Math.min(1, s * 1.4) }}>
              <div style={{ fontFamily: F, fontWeight: 900, fontSize: 36, color: C.white }}>{st.h}</div>
              {st.d && <div style={{ fontFamily: F, fontWeight: 700, fontSize: 24, color: C.mute, marginTop: 4 }}>{st.d}</div>}
            </div>
          </React.Fragment>
        );
      })}
      {drawn >= 1 && <>
        <div style={{ position: "absolute", left: cx - 60, top: cy - 5, width: 60, height: 10, borderRadius: 5, background: `linear-gradient(90deg, transparent, ${C.sun})` }} />
        <Orb x={cx} y={cy} r={14} color={C.sun} />
      </>}
    </>
  );
};

const Chart: React.FC<P<ChartProps>> = ({ dur, kicker, title, type, unit = "", note, points = [], bars = [], marks = [], ats }) => {
  const p = useP(dur);
  const X0 = 220, X1 = 1680, Y0 = 820, Y1 = 330;
  const noteEl = note && <div style={{ position: "absolute", left: 220, top: 890, fontFamily: F, fontWeight: 700, fontSize: 22, color: C.mute, opacity: p(0.1, 0.2) }}>{note}</div>;
  if (type === "bar") {
    const at = spreadAts(bars.length, 0.12, 0.7, ats);
    const max = Math.max(...bars.map((b) => b.value), 1); const n = bars.length;
    const W = Math.min(200, (X1 - X0) / n - 50), gap = (X1 - X0 - n * W) / n;
    return (
      <>
        <Head dur={dur} kicker={kicker} title={title} />
        {bars.map((b, i) => {
          const s = useSpr(dur, at[i], 14); const h = Math.max(W / 2, (b.value / max) * (Y0 - Y1)) * Math.min(1, s); const x = X0 + gap / 2 + i * (W + gap); const col = ACC[i % ACC.length];
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: x, top: Y0 - h, width: W, height: h, borderRadius: `${W / 2}px ${W / 2}px 14px 14px`, background: `linear-gradient(90deg, ${col} 60%, ${mix(col, C.sky0, 0.25)} 60%)`, opacity: s > 0.01 ? 1 : 0 }} />
              <div style={{ position: "absolute", left: x - 40, top: Y0 - h - 62, width: W + 80, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: n > 4 ? 38 : 46, color: C.white, opacity: Math.min(1, s) }}>{b.value.toLocaleString("en-US")}{unit}</div>
              <div style={{ position: "absolute", left: x - 40, top: Y0 + 14, width: W + 80, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 26, color: C.mute, opacity: Math.min(1, s) }}>{b.label}</div>
            </React.Fragment>
          );
        })}
        {noteEl}
      </>
    );
  }
  const xmin = Math.min(...points.map((q) => q.x)), xmax = Math.max(...points.map((q) => q.x)), ymax = Math.max(...points.map((q) => q.y)) * 1.1;
  const X = (v: number) => X0 + ((v - xmin) / (xmax - xmin || 1)) * (X1 - X0), Y = (v: number) => Y0 - (v / (ymax || 1)) * (Y0 - Y1);
  const d = "M " + points.map((q) => `${X(q.x)} ${Y(q.y)}`).join(" L ");
  const ev = evolvePath(p(0.1, 0.7), d);
  const mAt = spreadAts(marks.length, 0.35, 0.75, marks.map((m) => m.at) as number[]);
  const yAt = (xv: number) => points.reduce((b, q) => (Math.abs(q.x - xv) < Math.abs(b.x - xv) ? q : b), points[0]).y;
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="rgba(255,255,255,0.3)" strokeWidth={4} strokeLinecap="round" />
        <path d={d} fill="none" stroke={C.teal} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      </svg>
      {marks.map((m, i) => {
        const s = useSpr(dur, mAt[i]);
        return (
          <React.Fragment key={i}>
            <Orb x={X(m.x)} y={Y(yAt(m.x))} r={24} color={C.coral} s={s} />
            <div style={{ position: "absolute", left: X(m.x) - 200, top: Y(yAt(m.x)) - 88, width: 180, textAlign: "right", fontFamily: F, fontWeight: 900, fontSize: 38, color: C.sun, opacity: Math.min(1, s) }}>{m.label}</div>
          </React.Fragment>
        );
      })}
      {[xmin, xmax].map((v, i) => <div key={i} style={{ position: "absolute", left: X(v) - 60, top: Y0 + 14, width: 120, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 24, color: C.mute, opacity: p(0.05, 0.12) }}>{v}</div>)}
      {noteEl}
    </>
  );
};

const Versus: React.FC<P<VersusProps>> = ({ dur, kicker, title, left, right, winner }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const sl = useSpr(dur, 0.08), sr = useSpr(dur, 0.4), w = p(0.8, 0.86);
  const col = (s: { h: string; items: string[] }, x: number, sp: number, color: string, a: number, win: boolean) => (
    <>
      <Orb x={x + 110} y={400} r={100 * (win ? 1 + 0.08 * w : 1)} color={color} s={sp} ring={win && w > 0.5} />
      <Pop s={sp} style={{ position: "absolute", left: x + 250, top: 350, fontFamily: F, fontWeight: 900, fontSize: 60, color: win ? C.sun : C.white }}>{s.h}{win && w > 0.5 ? " ★" : ""}</Pop>
      {s.items.map((it, i) => <div key={i} style={{ position: "absolute", left: x + 40, top: 540 + i * 70, width: 740, fontFamily: F, fontWeight: 700, fontSize: 32, color: C.white, opacity: p(a + 0.06 + i * 0.05, a + 0.1 + i * 0.05) }}>• {it}</div>)}
    </>
  );
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      {col(left, 110, sl, C.mute, 0.08, winner === "left")}
      {col(right, 1000, sr, C.teal, 0.4, winner === "right")}
      <Orb x={960} y={600} r={48} color={C.coral} s={p(0.3, 0.36)}><span style={{ fontFamily: F, fontWeight: 900, fontSize: 34, color: C.ink, transform: `rotate(${Math.sin(frame * 0.08) * 8}deg)` }}>VS</span></Orb>
    </>
  );
};

const Recap: React.FC<P<RecapProps>> = ({ dur, title, items, closer, ats }) => {
  const at = spreadAts(items.length, 0.06, 0.7, ats);
  const rowH = Math.min(84, 520 / Math.max(1, items.length));
  const cs = useSpr(dur, 0.8);
  return (
    <>
      <Head dur={dur} kicker="Recap" title={title} />
      {items.map((it, i) => {
        const s = useSpr(dur, at[i]); const col = ACC[i % ACC.length];
        return (
          <Pop key={i} s={s} style={{ position: "absolute", left: 120, top: 290 + i * rowH, height: rowH - 14, display: "flex", alignItems: "center", gap: 20, background: "rgba(255,255,255,0.08)", borderRadius: 999, paddingRight: 36 }}>
            <span style={{ width: rowH - 14, height: rowH - 14, borderRadius: "50%", background: col, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontWeight: 900, fontSize: rowH * 0.4, color: C.ink }}>{i + 1}</span>
            <span style={{ fontFamily: F, fontWeight: 800, fontSize: 34, color: C.white }}>{it}</span>
          </Pop>
        );
      })}
      {closer && <Pop s={cs} style={{ position: "absolute", left: 120, top: 310 + items.length * rowH, fontFamily: F, fontWeight: 900, fontSize: 54, color: C.sun }}>{closer}</Pop>}
    </>
  );
};

export const flat: StylePack = {
  id: "flat",
  name: "Flat Vector",
  Background: Background as StylePack["Background"],
  scenes: { title: Title as any, divider: Divider as any, statement: Statement as any, list: List as any, flow: Flow as any, chart: Chart as any, versus: Versus as any, recap: Recap as any },
  caption: { font: F, size: 34, weight: 800, color: C.white, bg: "rgba(20,15,58,0.85)", border: "none", radius: 999, bottom: 40, pad: "12px 36px" },
  transition: (i) => (i % 2 ? iris({ width: 1920, height: 1080 }) : slide({ direction: "from-right" })) as never,
  transitionFrames: 18,
};
