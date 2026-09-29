/**
 * fq/kit.tsx — SHARED identity + helpers for the "Quant Finance from Scratch" video.
 *
 * Prefix `fq`. Every fq scene file (core/fund/tech/apply) imports T, A and the
 * helpers below. Router (FQScenes.tsx) wraps each scene in <Bg theme={T} accent>.
 * Scenes must return <Stage>…</Stage> (or a full-bleed AbsoluteFill for title/divider/recap)
 * and NEVER add their own <Bg>. Author on the 1920×1080 Stage (skills/09).
 *
 * SEMANTIC COLORS (consistent everywhere — never decorate randomly):
 *   A.fund (green)  = fundamentals / quality / a "good" reading
 *   A.tech (amber)  = technicals / momentum / caution
 *   A.val  (violet) = valuation / models / targets
 *   A.risk (rose)   = risk / loss / concentration / a "bad" reading
 *   A.main (blue)   = structure / neutral accent / the identity color
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { makeTheme, mix, MONO, SANS, BW, Head } from "../../lib/primitives";

export const T = makeTheme({
  bg0: "#05070E", bg1: "#0A0E1B", bg2: "#111A32", panel: "#141C36",
  text: "#EDF1FB", muted: "#8A94B4", line: "rgba(255,255,255,0.075)",
  accent: "#4F8DF5",
});

export const A = {
  main: "#4F8DF5",  // blue — structure / identity
  fund: "#34D399",  // green — fundamentals / quality / good
  tech: "#FBBF24",  // amber — technicals / momentum / caution
  val:  "#A78BFA",  // violet — valuation / models
  risk: "#FB7185",  // rose — risk / loss / concentration
  ok:   "#34D399",
};

export { mix, MONO, SANS };

/** FQHead — Head wrapper that fades in over the first 6% of the beat. Use in every content scene. */
export const FQHead: React.FC<{ kicker: string; title: string; color?: string; p: (a: number, b: number) => number }> = ({
  kicker, title, color, p,
}) => <Head theme={T} kicker={kicker} title={title} color={color || A.main} o={p(0, 0.06)} />;

/**
 * SceneProgress — a thin bar pinned to the TOP edge (y=0) that fills L→R over the
 * whole beat. The universal "this is playing" signal (skills/03). Top edge, so it
 * never collides with the bottom caption band. Add once per content scene.
 */
export const SceneProgress: React.FC<{ p: (a: number, b: number) => number; color?: string }> = ({ p, color }) => (
  <div style={{ position: "absolute", left: 0, top: 0, height: 3, width: `${p(0, 1) * 100}%`,
    background: `linear-gradient(90deg, ${color || A.main}, ${mix(color || A.main, "#ffffff", 0.35)})`,
    boxShadow: `0 0 10px ${color || A.main}`, borderRadius: 2 }} />
);

/**
 * DefBadge — a small "DEFINITION" (or any label) pill in mono caps, colored.
 * Use to flag teaching moments: what a term MEANS, in one plain sentence.
 */
export const DefBadge: React.FC<{ text: string; color?: string; o?: number }> = ({ text, color, o = 1 }) => (
  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: 2,
    textTransform: "uppercase", color: T.bg0, background: color || A.main, borderRadius: 7,
    padding: "5px 12px", opacity: o }}>{text}</span>
);

/**
 * Formula — a mono formula line rendered big and clear, e.g.  P/E = Price ÷ EPS.
 * Parts render as [text, colorOrNull]. Highlighted parts use the given color.
 * size ~40 for the hero formula. Author inside a Card or absolute box with a width.
 */
export const Formula: React.FC<{ parts: [string, string?][]; size?: number; o?: number }> = ({ parts, size = 40, o = 1 }) => (
  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, letterSpacing: -0.5, opacity: o,
    display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
    {parts.map(([t, c], i) => (
      <span key={i} style={{ color: c || T.text }}>{t}</span>
    ))}
  </div>
);

/**
 * StatChip — a labeled value chip (mono value, mono label under). For metric rows.
 */
export const StatChip: React.FC<{ label: string; value: string; color?: string; o?: number; hero?: boolean }> = ({
  label, value, color, o = 1, hero,
}) => (
  <div style={{ opacity: o, background: mix(T.panel, color || A.main, hero ? 0.16 : 0.07),
    border: `2px solid ${hero ? (color || A.main) : mix(T.line, color || A.main, 0.4)}`,
    borderRadius: 14, padding: "12px 16px", minWidth: 150 }}>
    <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 800, color: color || T.text, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 0.5, textTransform: "uppercase", color: T.muted, marginTop: 4 }}>{label}</div>
  </div>
);

/**
 * Tick motif — a faint candlestick/price-tick strip for title/divider ambience.
 * Runs off raw frame (drifts). Deterministic via a seeded pseudo-series.
 */
export const TickStrip: React.FC<{ x: number; y: number; w: number; h: number; color: string; o?: number; seed?: number }> = ({
  x, y, w, h, color, o = 1, seed = 1,
}) => {
  const frame = useCurrentFrame();
  const n = 26, cw = w / n;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: o, pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const s = Math.sin(i * 1.7 + seed * 3.1) * 0.5 + Math.sin(i * 0.6 + frame * 0.01 + seed) * 0.5;
        const up = s > 0;
        const bh = 10 + Math.abs(s) * (h * 0.42);
        const mid = y + h / 2;
        return (
          <div key={i} style={{ position: "absolute", left: i * cw + cw * 0.28 - x + x, top: mid - y - bh / 2,
            width: cw * 0.44, height: bh, borderRadius: 3,
            background: up ? mix(T.panel, color, 0.5) : mix(T.panel, A.risk, 0.4),
            border: `1.5px solid ${up ? color : A.risk}`, opacity: 0.35 + Math.abs(s) * 0.4 }} />
        );
      })}
    </div>
  );
};

// re-export BW for convenience in scene files
export { BW };
