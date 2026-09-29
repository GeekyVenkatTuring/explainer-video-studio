/**
 * PMScenes.tsx — Psychology of Money. DENSE frames only.
 *
 * Contract (user feedback on the Avoid-Losses video): every name, number, and
 * claim the narration speaks MUST already be printed on this frame. No headline
 * cards with a hidden story in the audio. Reveals follow spoken order.
 *
 * Identity: gold vault slate. gold=time/wealth · coral=ruin · emerald=survival
 * violet=behaviour · sky=luck/tails · amber=temptation.
 * Captions ON → content ≤ y848.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  makeTheme, mix, useP, usePop, rnd, MONO, SANS,
  Bg, Stage, Kicker, Head, Brackets, ScanBeam,
} from "../lib/primitives";

const T = makeTheme({ accent: "#E8B86D", bg0: "#07060A", bg1: "#100E14", bg2: "#1A1620", panel: "#221C28" });
const A = {
  gold: "#E8B86D", cost: "#F87171", profit: "#34D399", mind: "#A78BFA",
  luck: "#38BDF8", debt: "#FBBF24", gray: "#8B93B0",
};

const SPAN = 0.70;
const useReveal = (dur?: unknown) => {
  const p = useP(dur);
  return (a: number, b: number) => p(Math.min(1, a * SPAN), Math.min(1, b * SPAN));
};

const CoinMotif: React.FC<{ x: number; y: number; cols: number; rows: number; cell?: number; color?: string; o?: number; seed?: number }> = ({
  x, y, cols, rows, cell = 22, color = A.gold, o = 1, seed = 0,
}) => {
  const frame = useCurrentFrame();
  const wave = (frame * 0.85) % (rows + 5) - 2.5;
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "grid", gridTemplateColumns: `repeat(${cols}, ${cell * 1.6}px)`, gridAutoRows: `${cell}px`, gap: 7, opacity: o }}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const heat = Math.max(0, 1 - Math.abs(r - wave + Math.sin(c * 1.3 + seed) * 1.1) / 2.3);
        return (
          <div key={i} style={{
            width: cell * 0.72, height: cell * 0.72, borderRadius: cell,
            background: mix(T.panel, color, 0.1 + heat * 0.5),
            border: `1.5px solid ${mix(T.line, color, 0.2 + heat * 0.7)}`,
            boxShadow: heat > 0.5 ? `0 0 8px ${mix(T.bg0, color, heat)}` : "none",
          }} />
        );
      })}
    </div>
  );
};

const SceneProgress: React.FC<{ dur?: unknown; color?: string }> = ({ dur, color = A.gold }) => {
  const p = useP(dur);
  return (
    <div style={{ position: "absolute", left: 0, bottom: 0, width: 1920, height: 5, background: "rgba(255,255,255,0.05)" }}>
      <div style={{ height: "100%", width: `${p(0, 1) * 1920}px`, background: `linear-gradient(90deg, ${A.luck}, ${color}, ${A.profit})`, boxShadow: `0 0 12px ${color}` }} />
    </div>
  );
};

const Frame: React.FC<{ dur?: unknown; color?: string; children: React.ReactNode }> = ({ dur, color, children }) => (
  <>
    <Bg theme={T} accent={color || A.gold} />
    <Stage>{children}</Stage>
    <SceneProgress dur={dur} color={color} />
  </>
);

/** Title with on-screen bullets — narration may only speak these bullets + the title. */
const TitleScene: React.FC<{
  dur?: number; kicker?: string; line1?: string; line2?: string; sub?: string; points?: string[]; color?: string;
}> = ({ dur, kicker = "BEHAVIOUR · TIME · SURVIVAL", line1 = "The Psychology", line2 = "of Money",
  sub = "Morgan Housel, 2020 · every figure from the book", points = [], color = A.gold }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const pop = usePop(dur);
  const rp = useReveal(dur);
  return (
    <>
      <Bg theme={T} accent={color} />
      <AbsoluteFill>
        <Stage>
          <CoinMotif x={70} y={80} cols={4} rows={8} cell={26} color={color} o={0.28} />
          <CoinMotif x={1580} y={620} cols={4} rows={8} cell={26} color={A.mind} o={0.24} seed={3} />
          {Array.from({ length: 8 }).map((_, i) => {
            const ang = frame * 0.01 + (i / 8) * Math.PI * 2;
            return <div key={i} style={{
              position: "absolute", left: 960 + Math.cos(ang) * (620 + i * 8) - 4, top: 540 + Math.sin(ang) * (280 + i * 6) - 4,
              width: 8, height: 8, borderRadius: 8, background: i % 2 ? color : A.profit, opacity: 0.16 + rnd(i, 2) * 0.25,
            }} />;
          })}
          <div style={{ position: "absolute", left: 200, right: 200, top: 88, textAlign: "center", transform: `scale(${0.94 + pop(0) * 0.06})` }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <Kicker theme={T} text={kicker} color={color} cx />
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, lineHeight: 1.02, letterSpacing: -2.5, color: T.text }}>
              <div>{line1}</div>
              <div style={{ color, textShadow: `0 0 60px ${mix(T.bg0, color, 0.65)}` }}>{line2}</div>
            </div>
            <div style={{ height: 5, width: interpolate(p(0.12, 0.32), [0, 1], [0, 480]), background: color, borderRadius: 3, margin: "22px auto" }} />
            <div style={{ fontFamily: SANS, fontSize: 30, color: T.muted, opacity: rp(0.18, 0.32) }}>{sub}</div>
          </div>
          {points.map((pt, i) => {
            const at = 0.28 + i * 0.12;
            const o = rp(at, at + 0.1);
            return (
              <div key={i} style={{
                position: "absolute", left: 280, top: 520 + i * 78, width: 1360, opacity: o,
                background: mix(T.panel, color, 0.1), border: `2px solid ${mix(T.line, color, 0.5)}`,
                borderRadius: 14, padding: "14px 24px", boxSizing: "border-box",
                fontFamily: SANS, fontSize: 28, color: T.text, lineHeight: 1.3,
              }}>{pt}</div>
            );
          })}
        </Stage>
      </AbsoluteFill>
      <SceneProgress dur={dur} color={color} />
    </>
  );
};

/** Divider prints the spoken lines — not a title with a hidden paragraph. */
const DividerScene: React.FC<{ dur?: number; n?: number; total?: number; title?: string; lines?: string[]; color?: string }> = ({
  dur, n = 1, total = 20, title = "", lines = [], color = A.gold,
}) => {
  const frame = useCurrentFrame();
  const rp = useReveal(dur);
  return (
    <Frame dur={dur} color={color}>
      <CoinMotif x={80} y={280} cols={3} rows={8} cell={24} color={color} o={0.22} />
      <Brackets x={360} y={200} w={1200} h={620} color={color} o={rp(0.02, 0.12)} len={48} />
      <ScanBeam theme={T} x={370} y={210} w={1180} h={600} color={color} o={rp(0.06, 0.18)} speed={1.4} />
      <div style={{ position: "absolute", left: 400, right: 400, top: 240, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color, letterSpacing: 8, opacity: rp(0.04, 0.14) }}>CHAPTER {("0" + n).slice(-2)} / {total}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 72, color: T.text, letterSpacing: -1.5, marginTop: 14, opacity: rp(0.1, 0.22) }}>{title}</div>
        <div style={{ height: 4, width: interpolate(rp(0.18, 0.36), [0, 1], [0, 360]), background: color, borderRadius: 3, margin: "20px auto" }} />
      </div>
      {lines.map((ln, i) => (
        <div key={i} style={{
          position: "absolute", left: 430, top: 470 + i * 88, width: 1060, opacity: rp(0.32 + i * 0.14, 0.44 + i * 0.14),
          fontFamily: SANS, fontSize: 30, color: T.text, lineHeight: 1.35, textAlign: "center",
        }}>{ln}</div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, display: "flex", justifyContent: "center", gap: 10, opacity: rp(0.4, 0.52) }}>
        {Array.from({ length: total }).map((_, i) => {
          const k = i + 1;
          return <div key={k} style={{
            width: k === n ? 22 : 7, height: 7, borderRadius: 6,
            background: k <= n ? color : mix(T.panel, color, 0.15),
            opacity: k === n ? 0.7 + Math.sin(frame * 0.1) * 0.3 : 1,
          }} />;
        })}
      </div>
    </Frame>
  );
};

type Fact = { k: string; v: string; c?: string };
/** Full-width fact sheet: each spoken claim is a row. */
const SheetScene: React.FC<{ dur?: number; kicker?: string; title?: string; rows?: Fact[]; note?: string; color?: string }> = ({
  dur, kicker = "", title = "", rows = [], note = "", color = A.gold,
}) => {
  const rp = useReveal(dur);
  const frame = useCurrentFrame();
  const n = Math.max(1, rows.length);
  const y0 = 214, rowH = Math.min(78, 600 / n);
  const hot = Math.floor(frame / 24) % n;
  return (
    <Frame dur={dur} color={color}>
      <Head theme={T} kicker={kicker} title={title} color={color} o={rp(0, 0.08)} />
      <ScanBeam theme={T} x={120} y={210} w={1680} h={n * rowH + 16} color={color} o={0.35} speed={1.1} />
      {rows.map((r, i) => {
        const at = 0.08 + i * (0.78 / n);
        const o = rp(at, at + 0.1);
        const y = y0 + i * rowH;
        const rc = r.c || color;
        const active = hot === i && o > 0.85;
        return (
          <div key={i} style={{
            position: "absolute", left: 130, top: y, width: 1660, height: rowH - 10, opacity: o,
            display: "flex", alignItems: "center", gap: 22, padding: "0 22px", boxSizing: "border-box",
            background: mix(T.panel, rc, active ? 0.2 : 0.08),
            border: `2px solid ${mix(T.line, rc, active ? 0.85 : 0.45)}`, borderRadius: 12,
            transform: `translateX(${(1 - o) * 18}px)`,
          }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 18, color: rc, width: 200, flexShrink: 0, letterSpacing: 0.3 }}>{r.k}</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: T.text, lineHeight: 1.28, width: 1390 }}>{r.v}</div>
          </div>
        );
      })}
      {note ? <div style={{ position: "absolute", left: 130, top: 848, width: 1660, fontFamily: MONO, fontSize: 20, color: T.muted, opacity: rp(0.82, 0.92) }}>{note}</div> : null}
    </Frame>
  );
};

type DualCol = { name: string; tag?: string; c: string; lines: string[] };
/** Two dossiers. Every spoken detail is a wrapping line inside a column. */
const DualScene: React.FC<{ dur?: number; kicker?: string; title?: string; left?: DualCol; right?: DualCol; note?: string; color?: string }> = ({
  dur, kicker = "", title = "", left, right, note = "", color = A.gold,
}) => {
  const rp = useReveal(dur);
  const cols = [left, right].filter(Boolean) as DualCol[];
  return (
    <Frame dur={dur} color={color}>
      <Head theme={T} kicker={kicker} title={title} color={color} o={rp(0, 0.08)} />
      {cols.map((col, ci) => {
        const x = 120 + ci * 860;
        const oCol = rp(0.06 + ci * 0.08, 0.16 + ci * 0.08);
        return (
          <div key={ci} style={{
            position: "absolute", left: x, top: 210, width: 820, height: 610, opacity: oCol,
            background: mix(T.panel, col.c, 0.1), border: `2.5px solid ${col.c}`, borderRadius: 18, padding: "22px 26px", boxSizing: "border-box",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: col.c }}>{col.name}</span>
              {col.tag ? <span style={{ fontFamily: MONO, fontSize: 20, color: T.muted }}>{col.tag}</span> : null}
            </div>
            <div style={{ height: 3, background: mix(T.line, col.c, 0.7), marginBottom: 12 }} />
            {col.lines.map((ln, i) => {
              const at = 0.16 + ci * 0.06 + i * 0.09;
              return (
                <div key={i} style={{
                  fontFamily: SANS, fontSize: 23, color: T.text, lineHeight: 1.32, marginBottom: 10, opacity: rp(at, at + 0.08),
                  paddingLeft: 12, borderLeft: `3px solid ${mix(T.line, col.c, 0.8)}`,
                }}>{ln}</div>
              );
            })}
          </div>
        );
      })}
      {note ? <div style={{ position: "absolute", left: 130, top: 848, width: 1660, fontFamily: MONO, fontSize: 20, color: T.muted, opacity: rp(0.84, 0.94) }}>{note}</div> : null}
    </Frame>
  );
};

/** Numbered sentences — the list IS the narration. */
const ListScene: React.FC<{ dur?: number; kicker?: string; title?: string; items?: string[]; note?: string; color?: string }> = ({
  dur, kicker = "", title = "", items = [], note = "", color = A.gold,
}) => {
  const rp = useReveal(dur);
  const frame = useCurrentFrame();
  const n = Math.max(1, items.length);
  const y0 = 214, rowH = Math.min(86, 610 / n);
  const hot = Math.floor(frame / 26) % n;
  return (
    <Frame dur={dur} color={color}>
      <Head theme={T} kicker={kicker} title={title} color={color} o={rp(0, 0.08)} />
      {items.map((it, i) => {
        const at = 0.08 + i * (0.78 / n);
        const o = rp(at, at + 0.1);
        const active = hot === i && o > 0.85;
        return (
          <div key={i} style={{
            position: "absolute", left: 140, top: y0 + i * rowH, width: 1640, height: rowH - 12, opacity: o,
            display: "flex", alignItems: "center", gap: 20, padding: "0 20px", boxSizing: "border-box",
            background: mix(T.panel, color, active ? 0.18 : 0.07), borderRadius: 12,
            border: `2px solid ${mix(T.line, color, active ? 0.8 : 0.4)}`,
          }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color, width: 48 }}>{("0" + (i + 1)).slice(-2)}</span>
            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 27, color: T.text, lineHeight: 1.28, width: 1520 }}>{it}</span>
          </div>
        );
      })}
      {note ? <div style={{ position: "absolute", left: 140, top: 848, width: 1640, fontFamily: MONO, fontSize: 20, color: T.muted, opacity: rp(0.84, 0.94) }}>{note}</div> : null}
    </Frame>
  );
};

type CSeries = { label: string; start: number; rate: number; years: number; c: string; endLabel: string };
const CompoundScene: React.FC<{ dur?: number; kicker?: string; title?: string; series?: CSeries[]; facts?: Fact[]; note?: string; color?: string }> = ({
  dur, kicker = "", title = "", series = [], facts = [], note = "", color = A.gold,
}) => {
  const rp = useReveal(dur);
  const x0 = 130, y0 = 760, W = 980, H = 430;
  const curves = series.map((s) => {
    const pts: number[] = [];
    let v = s.start;
    for (let i = 0; i <= s.years; i++) { pts.push(v); v *= 1 + s.rate; }
    return { ...s, pts };
  });
  const maxV = Math.max(1, ...curves.flatMap((c) => c.pts));
  const draw = (c: typeof curves[0], frac: number) => {
    const n = Math.max(2, Math.round((c.pts.length - 1) * frac) + 1);
    return c.pts.slice(0, n).map((v, i) => `${x0 + (i / Math.max(1, c.pts.length - 1)) * W},${y0 - (v / maxV) * H}`).join(" ");
  };
  return (
    <Frame dur={dur} color={color}>
      <Head theme={T} kicker={kicker} title={title} color={color} o={rp(0, 0.08)} />
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        <line x1={x0} y1={y0} x2={x0 + W} y2={y0} stroke={T.line} strokeWidth={2} />
        <line x1={x0} y1={y0} x2={x0} y2={y0 - H} stroke={T.line} strokeWidth={2} />
        {curves.map((c, i) => (
          <polyline key={i} points={draw(c, rp(0.14 + i * 0.12, 0.7))} fill="none" stroke={c.c} strokeWidth={5} />
        ))}
      </svg>
      {curves.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: 150, top: 230 + i * 46, fontFamily: MONO, fontSize: 22, color: c.c, opacity: rp(0.12 + i * 0.1, 0.24) }}>
          {c.label} → {c.endLabel}
        </div>
      ))}
      {facts.map((f, i) => {
        const at = 0.22 + i * 0.12;
        return (
          <div key={i} style={{
            position: "absolute", left: 1160, top: 230 + i * 92, width: 640, opacity: rp(at, at + 0.1),
            background: mix(T.panel, f.c || color, 0.12), border: `2px solid ${f.c || color}`, borderRadius: 12, padding: "12px 16px",
          }}>
            <div style={{ fontFamily: MONO, fontSize: 18, color: f.c || color, fontWeight: 700 }}>{f.k}</div>
            <div style={{ fontFamily: SANS, fontSize: 24, color: T.text, marginTop: 6, lineHeight: 1.28 }}>{f.v}</div>
          </div>
        );
      })}
      {note ? <div style={{ position: "absolute", left: 130, top: 848, width: 1660, fontFamily: MONO, fontSize: 20, color: T.muted, opacity: rp(0.84, 0.94) }}>{note}</div> : null}
    </Frame>
  );
};

type Chip = { n: number; title: string; c: string };
const GridMapScene: React.FC<{ dur?: number; kicker?: string; title?: string; chips?: Chip[]; note?: string; color?: string }> = ({
  dur, kicker = "", title = "", chips = [], note = "", color = A.gold,
}) => {
  const rp = useReveal(dur);
  const frame = useCurrentFrame();
  const cols = 5, w = 312, h = 118, gapX = 18, gapY = 14, x0 = 130, y0 = 214;
  const hot = Math.floor(frame / 22) % Math.max(1, chips.length);
  return (
    <Frame dur={dur} color={color}>
      <Head theme={T} kicker={kicker} title={title} color={color} o={rp(0, 0.08)} />
      {chips.map((ch, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const at = 0.06 + i * 0.032;
        const o = rp(at, at + 0.08);
        const x = x0 + col * (w + gapX), y = y0 + row * (h + gapY);
        const active = hot === i;
        return (
          <div key={ch.n} style={{
            position: "absolute", left: x, top: y, width: w, height: h, opacity: o, boxSizing: "border-box",
            background: mix(T.panel, ch.c, active ? 0.22 : 0.1), border: `2.5px solid ${ch.c}`, borderRadius: 14, padding: "14px 16px",
            transform: `translateY(${active ? -3 : 0}px)`, boxShadow: active ? `0 0 16px ${mix(T.bg0, ch.c, 0.4)}` : "none",
          }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 18, color: ch.c }}>{("0" + ch.n).slice(-2)}</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 23, color: T.text, marginTop: 6, lineHeight: 1.2 }}>{ch.title}</div>
          </div>
        );
      })}
      {note ? <div style={{ position: "absolute", left: 130, top: 848, width: 1660, fontFamily: MONO, fontSize: 20, color: T.muted, opacity: rp(0.8, 0.92) }}>{note}</div> : null}
    </Frame>
  );
};

const RecapScene: React.FC<{ dur?: number; kicker?: string; title?: string; items?: string[]; closer?: string; color?: string }> = ({
  dur, kicker = "RECAP — ON SCREEN", title = "", items = [], closer = "", color = A.gold,
}) => {
  const rp = useReveal(dur);
  const frame = useCurrentFrame();
  const y0 = 250, rowH = Math.min(68, 520 / Math.max(1, items.length));
  return (
    <Frame dur={dur} color={color}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 100, textAlign: "center", opacity: rp(0, 0.08) }}>
        <Kicker theme={T} text={kicker} color={color} cx />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 48, color: T.text, marginTop: 12 }}>{title}</div>
      </div>
      {items.map((it, i) => {
        const at = 0.08 + i * (0.55 / Math.max(1, items.length));
        const o = rp(at, at + 0.08);
        return (
          <div key={i} style={{ position: "absolute", left: 220, top: y0 + i * rowH, width: 1480, opacity: o, display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 6, height: rowH - 22, background: color, borderRadius: 3 }} />
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color }}>{("0" + (i + 1)).slice(-2)}</span>
            <span style={{ fontFamily: SANS, fontSize: 26, color: T.text }}>{it}</span>
          </div>
        );
      })}
      {closer ? (
        <div style={{
          position: "absolute", left: 240, right: 240, top: y0 + items.length * rowH + 18, textAlign: "center",
          fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: 30, color: mix(T.text, color, 0.4),
          opacity: rp(0.62, 0.74), textShadow: `0 0 24px ${mix(T.bg0, color, 0.4 + Math.sin(frame * 0.05) * 0.1)}`,
        }}>{closer}</div>
      ) : null}
    </Frame>
  );
};

export const PMScene: React.FC<{ variant: string; [k: string]: unknown }> = ({ variant, ...props }) => {
  const v = variant.replace(/^pm_/, "");
  switch (v) {
    case "title": return <TitleScene {...props} />;
    case "divider": return <DividerScene {...props} />;
    case "sheet": return <SheetScene {...props} />;
    case "dual": return <DualScene {...props} />;
    case "list": return <ListScene {...props} />;
    case "compound": return <CompoundScene {...props} />;
    case "grid": return <GridMapScene {...props} />;
    case "recap": return <RecapScene {...props} />;
    default: return <SheetScene {...props} />;
  }
};

export default PMScene;
