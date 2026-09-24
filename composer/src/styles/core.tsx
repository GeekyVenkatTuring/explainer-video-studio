/**
 * styles/core.tsx — the Style Pack contract.
 *
 * A StylePack is a complete visual identity, not a reskin: its own background, typography,
 * scene archetype components, caption treatment and scene-to-scene transition. Scenes still
 * follow the repo contract (useP(dur) phasing, continuous motion, rnd() determinism, no CSS
 * filter) — only the LOOK changes. Packs live in ./packs/*.tsx and register in ./registry.ts.
 *
 * Archetypes (the "kinds" a beat can be): hook · formula · growth · compare · takeaway.
 * Content/data is shared (computed here); each pack decides how to draw it.
 */
import React from "react";
import type { TransitionPresentation } from "@remotion/transitions";

/** sample-only kinds (Rule of 72 reel) + the 8 GENERIC, prop-driven archetypes used in production */
export type Kind = "hook" | "formula" | "growth" | "compare" | "takeaway"
  | "title" | "divider" | "statement" | "list" | "flow" | "chart" | "versus" | "recap"
  | `x_${string}`;   // pack-specific extra archetypes (e.g. blueprint-x: x_diagram, x_hnsw, x_fusion…)
export type SceneProps = { dur: number; beat: number; total?: number; [k: string]: any };

// ---------------------------------------------------------------- generic archetype props (build.py → beats[].props)
export type Item = { h: string; d?: string };
export interface TitleProps { kicker?: string; title: string; subtitle?: string }            // title may contain "\n"
export interface DividerProps { n: number; total: number; title: string; sub?: string }
export interface StatementProps { kicker?: string; lines: string[]; accent?: number; big?: string; sub?: string; ats?: number[]; tex?: string /* LaTeX; typeset by packs that support maths (chalk) */ }
export interface ListProps { kicker?: string; title: string; items: Item[]; ats?: number[] }    // ≤ 6 items
export interface FlowProps { kicker?: string; title: string; steps: Item[]; ats?: number[] }    // 3–6 steps
export interface ChartProps {
  kicker?: string; title: string; type: "line" | "bar"; unit?: string; note?: string;
  points?: { x: number; y: number }[];                 // line
  bars?: { label: string; value: number }[];           // bar
  marks?: { x: number; label: string; at?: number }[]; // line annotations
  ats?: number[];
}
export interface VersusProps { kicker?: string; title: string; left: { h: string; items: string[] }; right: { h: string; items: string[] }; winner?: "left" | "right" }
export interface RecapProps { title: string; items: string[]; closer?: string; ats?: number[] }

/** reveal times for n items, spread over the narration window [a, b] unless the script overrides them */
export const spreadAts = (n: number, a = 0.1, b = 0.72, ats?: number[]) =>
  Array.from({ length: n }, (_, i) => ats?.[i] ?? (n <= 1 ? a : a + ((b - a) * i) / (n - 1)));

/** per-video identity text used by backgrounds (masthead, title block) */
export interface Meta { brand?: string; project?: string; issue?: string; code?: string }

export interface CaptionStyle {
  font: string; size: number; weight: number; color: string; bg: string; border: string;
  radius: number; upper?: boolean; italic?: boolean; letterSpacing?: number; bottom?: number; pad?: string;
}

export interface StylePack {
  id: string;
  name: string;
  /** full-bleed background; beat index lets packs vary colour per beat */
  Background: React.FC<{ beat: number; kind: Kind; total: number; meta: Meta; dur?: number }>;
  scenes: Partial<Record<Kind, React.FC<SceneProps>>>;
  caption: CaptionStyle;
  /** presentation for the transition INTO beat i (i ≥ 1) */
  transition: (i: number) => TransitionPresentation<Record<string, unknown>>;
  transitionFrames: number;
}

// ---------------------------------------------------------------- shared, computed content
/** Rule of 72: years ≈ 72 / r. Exact: ln 2 / ln(1 + r/100). */
export const rule72 = (r: number) => 72 / r;
export const exactDouble = (r: number) => Math.log(2) / Math.log(1 + r / 100);
export const RATE = 8;
/** ₹ lakh value of ₹1 lakh compounding at RATE for t years (computed, not drawn by hand). */
export const valueAt = (t: number, r = RATE) => Math.pow(1 + r / 100, t);
export const GROWTH = Array.from({ length: 28 }, (_, t) => ({ t, v: valueAt(t) }));
export const DOUBLINGS = [9, 18, 27].map((t) => ({ t, v: valueAt(t), label: `${Math.pow(2, t / 9)}` }));
export const COMPARE = [4, 8, 12].map((r) => ({ r, years: rule72(r), exact: exactDouble(r) }));

// ---------------------------------------------------------------- captions (pack-styled)
export type Cue = [number, number, string];
export const PackCaptions: React.FC<{ cues: Cue[]; t: number; s: CaptionStyle }> = ({ cues, t, s }) => {
  const c = cues.find((q) => t >= q[0] && t < q[1]);
  if (!c) return null;
  const o = Math.max(0, Math.min(1, (t - c[0]) / 0.12, (c[1] - t) / 0.12));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: s.bottom ?? 34, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{
        maxWidth: 1400, padding: s.pad ?? "12px 30px", borderRadius: s.radius, background: s.bg, border: s.border,
        fontFamily: s.font, fontSize: s.size, fontWeight: s.weight, color: s.color, textAlign: "center",
        textTransform: s.upper ? "uppercase" : "none", fontStyle: s.italic ? "italic" : "normal",
        letterSpacing: s.letterSpacing ?? 0, lineHeight: 1.25,
      }}>{c[2]}</div>
    </div>
  );
};
