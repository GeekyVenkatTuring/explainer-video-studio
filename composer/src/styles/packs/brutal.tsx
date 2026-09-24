/**
 * NEO-BRUTALIST — the loud, honest web-UI look: cream canvas with a dot grid, 5px black borders,
 * hard offset shadows (no blur), flat pastel fills, chunky "app windows", stickers, a marquee ticker,
 * a pointer cursor that clicks things (pressed buttons lose their shadow). Archivo Black + Space Mono.
 * Fits: startups, product, dev tools, tech news, SaaS, "hot takes", developer-audience explainers.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { useP } from "../../lib/primitives";
import { StylePack, SceneProps, spreadAts, TitleProps, DividerProps, StatementProps, ListProps, FlowProps, ChartProps, VersusProps, RecapProps } from "../core";

export const C = { bg: "#FFF4E0", ink: "#111111", sub: "#4A4A4A", pink: "#FF90E8", yellow: "#FFD400", cyan: "#23C9FF", lime: "#B8FF3C", orange: "#FF7A45", white: "#FFFFFF" };
const ACC = [C.yellow, C.pink, C.cyan, C.lime, C.orange];
export const H = "'Archivo Black', Impact, 'Arial Black', sans-serif";
export const M = "'Space Mono', Menlo, monospace";
type P<T> = SceneProps & T;
const B = 5, SH = 10;

const useSpr = (dur: number, at: number) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(at * dur * fps), fps, config: { damping: 9, stiffness: 180, mass: 0.6 } });
};
/** a brutal box: thick border + hard shadow; `press` pushes it into its shadow */
export const Box: React.FC<{ x: number; y: number; w: number; h: number; color?: string; s?: number; press?: boolean; rot?: number; children?: React.ReactNode; from?: "left" | "up" | "right"; shadow?: number }> = ({
  x, y, w, h, color = C.white, s = 1, press, rot = 0, children, from = "up", shadow = SH,
}) => {
  if (s <= 0.001) return null;
  const off = press ? shadow : 0;
  const tr = from === "left" ? `translateX(${(1 - s) * -300}px)` : from === "right" ? `translateX(${(1 - s) * 300}px)` : `translateY(${(1 - s) * 120}px)`;
  return (
    <div style={{ position: "absolute", left: x + off, top: y + off, width: w, height: h, boxSizing: "border-box", background: color, border: `${B}px solid ${C.ink}`, boxShadow: press ? "none" : `${shadow}px ${shadow}px 0 ${C.ink}`, transform: `${tr} rotate(${rot}deg)`, opacity: Math.min(1, s * 2) }}>{children}</div>
  );
};
const Window: React.FC<{ x: number; y: number; w: number; h: number; title: string; color?: string; s?: number; children?: React.ReactNode; press?: boolean }> = ({ x, y, w, h, title, color = C.white, s = 1, children, press }) => (
  <Box x={x} y={y} w={w} h={h} color={color} s={s} press={press}>
    <div style={{ height: 44, borderBottom: `${B}px solid ${C.ink}`, background: C.ink, display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
      {[C.orange, C.yellow, C.lime].map((c) => <div key={c} style={{ width: 16, height: 16, background: c, border: `2px solid ${C.white}` }} />)}
      <span style={{ fontFamily: M, fontWeight: 700, fontSize: 18, color: C.white, marginLeft: 8, whiteSpace: "nowrap", overflow: "hidden" }}>{title}</span>
    </div>
    <div style={{ position: "relative", height: h - 44 - B * 2 }}>{children}</div>
  </Box>
);
const Sticker: React.FC<{ x: number; y: number; text: string; color: string; s: number; rot?: number }> = ({ x, y, text, color, s, rot = -8 }) => {
  const frame = useCurrentFrame();
  return s > 0.001 ? <div style={{ position: "absolute", left: x, top: y, padding: "8px 18px", background: color, border: `4px solid ${C.ink}`, borderRadius: 999, fontFamily: H, fontSize: 24, color: C.ink, transform: `rotate(${rot + Math.sin(frame * 0.08) * 3}deg) scale(${s})`, whiteSpace: "nowrap" }}>{text}</div> : null;
};
const Head: React.FC<{ dur: number; kicker?: string; title: string }> = ({ dur, kicker, title }) => {
  const s = useSpr(dur, 0);
  return (
    <>
      {kicker && <Sticker x={110} y={100} text={kicker.toUpperCase()} color={C.yellow} s={s} rot={-3} />}
      <div style={{ position: "absolute", left: 110, top: 158, fontFamily: H, fontSize: 66, color: C.ink, letterSpacing: -1, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * -60}px)`, whiteSpace: "nowrap" }}>{title}</div>
    </>
  );
};
/** arrow cursor that visits points and "clicks" (scale dip) */
const Cursor: React.FC<{ pts: [number, number][]; o: number; period?: number }> = ({ pts, o, period = 50 }) => {
  const frame = useCurrentFrame();
  if (o <= 0 || !pts.length) return null;
  const k = Math.floor(frame / period) % pts.length, u = (frame % period) / period;
  const a = pts[k], b = pts[(k + 1) % pts.length]; const m = Math.min(1, u * 2.2);
  const ease = 1 - Math.pow(1 - m, 3);
  const x = a[0] + (b[0] - a[0]) * ease, y = a[1] + (b[1] - a[1]) * ease; const click = u > 0.6 && u < 0.72 ? 0.8 : 1;
  return <svg width={48} height={60} style={{ position: "absolute", left: x, top: y, opacity: o, transform: `scale(${click})`, transformOrigin: "0 0" }}><path d="M2 2 L2 46 L14 34 L22 54 L30 50 L22 31 L40 31 Z" fill={C.white} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" /></svg>;
};

// ---------------------------------------------------------------- background: canvas + marquee
const Background: React.FC<{ beat: number; meta?: { project?: string } }> = ({ beat, meta = {} }) => {
  const frame = useCurrentFrame();
  const txt = `${(meta.project ?? "EXPLAINER").toUpperCase()} ✦ PART ${beat + 1} ✦ `;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: C.bg, backgroundImage: `radial-gradient(${C.ink}22 2px, transparent 2.5px)`, backgroundSize: "32px 32px" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 48, background: C.ink, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 8, left: -((frame * 3) % 600), whiteSpace: "nowrap", fontFamily: M, fontWeight: 700, fontSize: 24, color: C.lime }}>{txt.repeat(12)}</div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- the 8 archetypes
const Title: React.FC<P<TitleProps>> = ({ dur, kicker, title, subtitle }) => {
  const lines = title.split("\n");
  const sub = useSpr(dur, 0.3);
  return (
    <>
      {kicker && <Sticker x={130} y={170} text={kicker.toUpperCase()} color={C.lime} s={useSpr(dur, 0)} rot={-4} />}
      {lines.map((l, i) => {
        const s = useSpr(dur, 0.04 + i * 0.1); const w = Math.min(1700, l.length * 90 + 100);
        return <Box key={i} x={120 + i * 40} y={250 + i * 190} w={w} h={160} color={i === lines.length - 1 && lines.length > 1 ? C.pink : C.white} s={s} from={i % 2 ? "right" : "left"}>
          <div style={{ position: "absolute", left: 40, top: 12, fontFamily: H, fontSize: 118, color: C.ink, whiteSpace: "nowrap", letterSpacing: -2 }}>{l}</div>
        </Box>;
      })}
      {subtitle && <Box x={200} y={290 + lines.length * 190} w={Math.min(1500, subtitle.length * 21 + 80)} h={80} color={C.cyan} s={sub}>
        <div style={{ position: "absolute", left: 30, top: 16, fontFamily: M, fontWeight: 700, fontSize: 32, color: C.ink, whiteSpace: "nowrap" }}>{subtitle}</div>
      </Box>}
      <Sticker x={1560} y={190} text="NEW ✦" color={C.yellow} s={useSpr(dur, 0.4)} rot={10} />
    </>
  );
};

const Divider: React.FC<P<DividerProps>> = ({ dur, n, total, title, sub }) => {
  const p = useP(dur); const s = useSpr(dur, 0); const s2 = useSpr(dur, 0.1);
  return (
    <>
      <Box x={760} y={150} w={400} h={360} color={ACC[n % ACC.length]} s={s} rot={-3}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: H, fontSize: 250, color: C.ink }}>{String(n).padStart(2, "0")}</div>
      </Box>
      <Box x={960 - Math.min(800, title.length * 34 + 60)} y={570} w={Math.min(1700, title.length * 72 + 120)} h={150} color={C.ink} s={s2} shadow={12}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 22, textAlign: "center", fontFamily: H, fontSize: 92, color: C.white, whiteSpace: "nowrap" }}>{title}</div>
      </Box>
      {sub && <div style={{ position: "absolute", left: 0, right: 0, top: 758, textAlign: "center", fontFamily: M, fontWeight: 700, fontSize: 30, color: C.ink, opacity: p(0.25, 0.4) }}>{sub}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center", gap: 10, opacity: p(0.3, 0.45) }}>
        {Array.from({ length: total }).map((_, i) => <div key={i} style={{ width: 34, height: 22, border: `4px solid ${C.ink}`, background: i < n ? ACC[i % ACC.length] : C.white }} />)}
      </div>
    </>
  );
};

const Statement: React.FC<P<StatementProps>> = ({ dur, kicker, lines, accent = -1, big, sub, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const at = spreadAts(lines.length, 0.03, 0.4, ats);
  return (
    <>
      {kicker && <Sticker x={110} y={100} text={kicker.toUpperCase()} color={C.yellow} s={useSpr(dur, 0)} rot={-3} />}
      {lines.map((l, i) => {
        const s = useSpr(dur, at[i]); const acc = i === accent;
        return <Box key={i} x={110} y={180 + i * 150} w={Math.min(big ? 1100 : 1680, l.length * 66 + 90)} h={122} color={acc ? C.pink : ACC[(i + 2) % ACC.length]} s={s} from="left" rot={acc ? Math.sin(frame * 0.12) * 1.2 : 0}>
          <div style={{ position: "absolute", left: 34, top: 14, fontFamily: H, fontSize: 88, color: C.ink, whiteSpace: "nowrap" }}>{l}</div>
        </Box>;
      })}
      {big && <Window x={1260} y={210} w={560} h={330} title="result.txt" color={C.cyan} s={useSpr(dur, 0.34)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: H, fontSize: Math.min(110, Math.floor(900 / big.length)), color: C.ink, textAlign: "center" }}>{big}</div>
      </Window>}
      {sub && <div style={{ position: "absolute", left: 120, top: 200 + lines.length * 150 + 20, width: 1500, fontFamily: M, fontWeight: 700, fontSize: 30, color: C.sub, opacity: p(0.5, 0.62) }}>→ {sub}</div>}
    </>
  );
};

const List: React.FC<P<ListProps>> = ({ dur, kicker, title, items, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const at = spreadAts(items.length, 0.1, 0.72, ats);
  const rowH = Math.min(112, Math.floor(620 / items.length));
  const hot = p(0.85, 0.86) > 0.5 ? Math.floor(frame / 40) % items.length : -1;
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      {items.map((it, i) => {
        const s = useSpr(dur, at[i]); const on = hot === i;
        return <Box key={i} x={120} y={280 + i * rowH} w={1640} h={rowH - 22} color={on ? ACC[i % ACC.length] : C.white} s={s} press={on} from="left">
          <div style={{ position: "absolute", left: 22, top: (rowH - 22 - B * 2 - 44) / 2, width: 44, height: 44, border: `4px solid ${C.ink}`, background: ACC[i % ACC.length], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: H, fontSize: 26 }}>✓</div>
          <div style={{ position: "absolute", left: 96, top: 0, height: rowH - 22 - B * 2, display: "flex", alignItems: "center", gap: 28, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: H, fontSize: Math.min(44, rowH * 0.42), color: C.ink }}>{it.h}</span>
            {it.d && <span style={{ fontFamily: M, fontWeight: 700, fontSize: 24, color: C.sub }}>{it.d}</span>}
          </div>
        </Box>;
      })}
    </>
  );
};

const Flow: React.FC<P<FlowProps>> = ({ dur, kicker, title, steps, ats }) => {
  const p = useP(dur);
  const n = steps.length; const at = spreadAts(n, 0.1, 0.72, ats);
  const W = Math.floor((1640 - (n - 1) * 70) / n); const X = (i: number) => 120 + i * (W + 70);
  const done = p(at[n - 1] + 0.06, at[n - 1] + 0.07) > 0.5;
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      {steps.map((st, i) => {
        const s = useSpr(dur, at[i]);
        return (
          <React.Fragment key={i}>
            <Box x={X(i)} y={330} w={W} h={400} color={ACC[i % ACC.length]} s={s}>
              <div style={{ position: "absolute", left: 22, top: 16, fontFamily: H, fontSize: 90, color: C.ink }}>{i + 1}</div>
              <div style={{ position: "absolute", left: 22, top: 140, width: W - 44, fontFamily: H, fontSize: W > 300 ? 42 : 34, color: C.ink, lineHeight: 1.05 }}>{st.h}</div>
              {st.d && <div style={{ position: "absolute", left: 22, top: 270, width: W - 44, fontFamily: M, fontWeight: 700, fontSize: 21, color: C.ink, lineHeight: 1.3 }}>{st.d}</div>}
            </Box>
            {i < n - 1 && <div style={{ position: "absolute", left: X(i) + W + 8, top: 490, width: 54, height: 36, opacity: p(at[i + 1], at[i + 1] + 0.02) }}>
              <div style={{ position: "absolute", left: 0, top: 10, width: 30, height: 16, background: C.ink }} />
              <div style={{ position: "absolute", left: 28, top: 0, width: 0, height: 0, borderTop: "18px solid transparent", borderBottom: "18px solid transparent", borderLeft: `24px solid ${C.ink}` }} />
            </div>}
          </React.Fragment>
        );
      })}
      <Cursor pts={steps.map((_, i) => [X(i) + W * 0.6, 640] as [number, number])} o={done ? 1 : 0} />
    </>
  );
};

const Chart: React.FC<P<ChartProps>> = ({ dur, kicker, title, type, unit = "", note, points = [], bars = [], marks = [], ats }) => {
  const p = useP(dur);
  const X0 = 240, X1 = 1680, Y0 = 820, Y1 = 330;
  const noteEl = note && <div style={{ position: "absolute", left: 240, top: 880, fontFamily: M, fontWeight: 700, fontSize: 21, color: C.sub, opacity: p(0.1, 0.2) }}>{note}</div>;
  if (type === "bar") {
    const at = spreadAts(bars.length, 0.12, 0.7, ats);
    const max = Math.max(...bars.map((b) => b.value), 1); const n = bars.length;
    const W = Math.min(210, (X1 - X0) / n - 50), gap = (X1 - X0 - n * W) / n;
    return (
      <>
        <Head dur={dur} kicker={kicker} title={title} />
        <div style={{ position: "absolute", left: X0 - 20, top: Y0, width: X1 - X0 + 40, height: B, background: C.ink, opacity: p(0.02, 0.06) }} />
        {bars.map((b, i) => {
          const s = useSpr(dur, at[i]); const h = Math.max(30, (b.value / max) * (Y0 - Y1)) * Math.min(1.05, s); const x = X0 + gap / 2 + i * (W + gap);
          return (
            <React.Fragment key={i}>
              <Box x={x} y={Y0 - h} w={W} h={h} color={ACC[i % ACC.length]} s={s > 0.01 ? 1 : 0} />
              <div style={{ position: "absolute", left: x - 40, top: Y0 - h - 64, width: W + 80, textAlign: "center", fontFamily: H, fontSize: n > 4 ? 36 : 44, color: C.ink, opacity: Math.min(1, s) }}>{b.value.toLocaleString("en-US")}{unit}</div>
              <div style={{ position: "absolute", left: x - 40, top: Y0 + 20, width: W + 80, textAlign: "center", fontFamily: M, fontWeight: 700, fontSize: 24, color: C.ink, opacity: Math.min(1, s) }}>{b.label}</div>
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
  const pts = points.slice(0, k).map((q) => `${X(q.x)},${Y(q.y)}`).join(" ");
  const mAt = spreadAts(marks.length, 0.35, 0.75, marks.map((m) => m.at) as number[]);
  const yAt = (xv: number) => points.reduce((b, q) => (Math.abs(q.x - xv) < Math.abs(b.x - xv) ? q : b), points[0]).y;
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      <Window x={X0 - 60} y={Y1 - 70} w={X1 - X0 + 120} h={Y0 - Y1 + 150} title={note ?? "chart.svg"} s={useSpr(dur, 0.02)} />
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <polyline points={pts} fill="none" stroke={C.ink} strokeWidth={14} strokeLinejoin="miter" transform="translate(6,6)" />
        <polyline points={pts} fill="none" stroke={C.pink} strokeWidth={10} strokeLinejoin="miter" />
      </svg>
      {marks.map((m, i) => {
        const s = useSpr(dur, mAt[i]);
        return <React.Fragment key={i}>
          <Box x={X(m.x) - 18} y={Y(yAt(m.x)) - 18} w={36} h={36} color={C.yellow} s={s} shadow={5} />
          <Sticker x={X(m.x) - 160} y={Y(yAt(m.x)) - 84} text={m.label} color={C.lime} s={s} rot={-4} />
        </React.Fragment>;
      })}
    </>
  );
};

const Versus: React.FC<P<VersusProps>> = ({ dur, kicker, title, left, right, winner }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const win = (s: { h: string; items: string[] }, x: number, a: number, w: boolean) => (
    <Window x={x} y={280} w={760} h={540} title={s.h.toLowerCase().replace(/\s+/g, "_") + ".app"} color={w && p(0.8, 0.82) > 0.5 ? C.lime : C.white} s={useSpr(dur, a)}>
      <div style={{ position: "absolute", left: 30, top: 24, fontFamily: H, fontSize: 60, color: C.ink }}>{s.h}</div>
      {s.items.map((it, i) => <div key={i} style={{ position: "absolute", left: 34, top: 120 + i * 76, width: 690, fontFamily: M, fontWeight: 700, fontSize: 28, color: C.ink, opacity: p(a + 0.06 + i * 0.05, a + 0.1 + i * 0.05) }}>{w ? "[✓]" : "[ ]"} {it}</div>)}
    </Window>
  );
  return (
    <>
      <Head dur={dur} kicker={kicker} title={title} />
      {win(left, 110, 0.08, winner === "left")}
      {win(right, 1050, 0.4, winner === "right")}
      <Box x={890} y={490} w={140} h={140} color={C.orange} s={p(0.3, 0.36)} rot={frame * 0.6}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: H, fontSize: 50, color: C.ink, transform: `rotate(${-frame * 0.6}deg)` }}>VS</div>
      </Box>
      {winner && <Sticker x={winner === "left" ? 640 : 1580} y={240} text="WINNER" color={C.yellow} s={useSpr(dur, 0.8)} rot={8} />}
    </>
  );
};

const Recap: React.FC<P<RecapProps>> = ({ dur, title, items, closer, ats }) => {
  const p = useP(dur); const frame = useCurrentFrame();
  const at = spreadAts(items.length, 0.06, 0.7, ats);
  const rowH = Math.min(66, 460 / Math.max(1, items.length));
  return (
    <>
      <Window x={260} y={120} w={1400} h={760} title="~/recap.md" s={useSpr(dur, 0)}>
        <div style={{ position: "absolute", left: 40, top: 30, fontFamily: H, fontSize: 60, color: C.ink }}>{title}</div>
        {items.map((it, i) => <div key={i} style={{ position: "absolute", left: 44, top: 140 + i * rowH, fontFamily: M, fontWeight: 700, fontSize: 30, color: C.ink, opacity: p(at[i], at[i] + 0.05) }}><span style={{ background: ACC[i % ACC.length], padding: "0 8px", border: `3px solid ${C.ink}` }}>{String(i + 1).padStart(2, "0")}</span>  {it}</div>)}
        {closer && <div style={{ position: "absolute", left: 44, top: 160 + items.length * rowH, fontFamily: M, fontWeight: 700, fontSize: 34, color: C.ink, opacity: p(0.8, 0.86) }}>&gt; {closer}<span style={{ opacity: Math.floor(frame / 15) % 2 }}>█</span></div>}
      </Window>
    </>
  );
};

export const brutal: StylePack = {
  id: "brutal",
  name: "Neo-Brutalist",
  Background: Background as StylePack["Background"],
  scenes: { title: Title as any, divider: Divider as any, statement: Statement as any, list: List as any, flow: Flow as any, chart: Chart as any, versus: Versus as any, recap: Recap as any },
  caption: { font: M, size: 30, weight: 700, color: C.ink, bg: C.white, border: `4px solid ${C.ink}`, radius: 0, bottom: 44, pad: "10px 28px" },
  transition: (i) => (i % 2 ? wipe({ direction: "from-left" }) : slide({ direction: "from-bottom" })) as never,
  transitionFrames: 12,
};
