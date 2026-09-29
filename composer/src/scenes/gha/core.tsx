/**
 * gha/core.tsx — identity + shared parts for "GitHub Actions, Explained" (prefix gha).
 *
 * Identity: GitHub-dark "workflow run graph".
 *   A.evt  amber  = events / triggers
 *   A.run  blue   = runners / jobs / compute
 *   A.act  violet = actions / code / data
 *   A.ok   green  = success / deploy / shipped
 *   A.bad  red    = failure / danger / security
 * Motif: RunRail — a chain of job pills whose status icons cycle queued → running → ✓
 * forever (the thing you see on every GitHub run page). Used in title/dividers/corners.
 *
 * Rules (skills/03): reveals phase with useReveal/useP fractions of `dur`; continuous motion
 * off raw frame; rnd() only; no CSS filter. Captions are ON → content stays above y≈890.
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import { makeTheme, mix, useP, MONO, SANS, Kicker } from "../../lib/primitives";

export const T = makeTheme({
  bg0: "#010409", bg1: "#0A0E14", bg2: "#131A24", panel: "#161B22",
  text: "#E6EDF3", muted: "#8B949E", line: "#1E2631", accent: "#58A6FF",
});
export const A = {
  evt: "#F2A93B", run: "#58A6FF", act: "#BC8CFF", ok: "#3FB950", bad: "#F85149",
  gray: "#6E7681", key: "#7EE787", str: "#A5D6FF", cyan: "#39D0D8",
};

/** reveals compressed into the front of the beat (front-loaded narration; skills/02 A/V-lag). */
export const SPAN = 0.72;
export const useReveal = (dur?: unknown) => {
  const p = useP(dur);
  return (a: number, b: number) => p(Math.min(1, a * SPAN), Math.min(1, b * SPAN));
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);

// ---------------------------------------------------------------- status icon
export type St = "queued" | "running" | "ok" | "fail" | "skip" | "cancel" | "wait";
export const StatusIcon: React.FC<{ s: St; size?: number }> = ({ s, size = 26 }) => {
  const frame = useCurrentFrame();
  const r = size / 2;
  if (s === "running") {
    return (
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={r} cy={r} r={r - 3} stroke={mix(T.panel, A.evt, 0.35)} strokeWidth={3} fill="none" />
        <circle cx={r} cy={r} r={r - 3} stroke={A.evt} strokeWidth={3} fill="none"
          strokeDasharray={`${(r - 3) * 2.2} 999`} transform={`rotate(${frame * 9} ${r} ${r})`} strokeLinecap="round" />
      </svg>
    );
  }
  const col = s === "ok" ? A.ok : s === "fail" ? A.bad : s === "wait" ? A.evt : T.muted;
  const glyph = s === "ok" ? "✓" : s === "fail" ? "✕" : s === "skip" ? "⤼" : s === "cancel" ? "⊘" : s === "wait" ? "⏸" : "";
  return (
    <div style={{
      width: size, height: size, borderRadius: size, flexShrink: 0,
      background: s === "ok" || s === "fail" ? col : "transparent",
      border: s === "queued" ? `2.5px dashed ${T.muted}` : `2.5px solid ${col}`, boxSizing: "border-box",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: SANS, fontWeight: 800, fontSize: size * 0.6, color: s === "ok" || s === "fail" ? T.bg0 : col, lineHeight: 1,
    }}>{glyph}</div>
  );
};

// ---------------------------------------------------------------- motif: RunRail
/** A chain of job pills; a run sweeps through them forever (queued→running→✓). */
export const RunRail: React.FC<{
  x: number; y: number; labels?: string[]; o?: number; scale?: number; period?: number; phase?: number; color?: string;
}> = ({ x, y, labels = ["push", "build", "test", "deploy"], o = 1, scale = 1, period = 46, phase = 0, color = A.run }) => {
  const frame = useCurrentFrame();
  const n = labels.length;
  const cyc = n + 2;
  const k = Math.floor((frame + phase) / period) % cyc; // which job is running
  const sub = ((frame + phase) % period) / period;
  const W = 170, G = 60;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `scale(${scale})`, transformOrigin: "left top" }}>
      {labels.map((l, i) => {
        const st: St = i < k ? "ok" : i === k ? "running" : "queued";
        const done = k >= n;
        const s2: St = done ? "ok" : st;
        return (
          <React.Fragment key={i}>
            {i < n - 1 && (
              <div style={{ position: "absolute", left: i * (W + G) + W, top: 27, width: G, height: 3, background: i < k ? A.ok : T.line }}>
                {i === k - 1 && !done && <div style={{ position: "absolute", left: sub * G - 5, top: -4, width: 11, height: 11, borderRadius: 6, background: A.ok, boxShadow: `0 0 10px ${A.ok}` }} />}
              </div>
            )}
            <div style={{
              position: "absolute", left: i * (W + G), top: 0, width: W, height: 56, borderRadius: 12, boxSizing: "border-box",
              background: mix(T.panel, s2 === "ok" ? A.ok : s2 === "running" ? A.evt : color, s2 === "queued" ? 0.05 : 0.14),
              border: `2px solid ${s2 === "ok" ? mix(T.line, A.ok, 0.7) : s2 === "running" ? A.evt : T.line}`,
              display: "flex", alignItems: "center", gap: 10, padding: "0 14px",
            }}>
              <StatusIcon s={s2} size={24} />
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: T.text }}>{l}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- window chrome
export const Win: React.FC<{
  x: number; y: number; w: number; h: number; title?: string; color?: string; o?: number; children?: React.ReactNode; glow?: boolean;
}> = ({ x, y, w, h, title, color = A.run, o = 1, children, glow }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 16, overflow: "hidden",
      background: T.bg1, border: `2px solid ${mix(T.line, color, 0.55)}`, opacity: o,
      transform: `translateY(${(1 - o) * 22}px)`,
      boxShadow: glow ? `0 0 50px ${mix(T.bg0, color, 0.25 + Math.sin(frame * 0.06) * 0.07)}` : "0 20px 50px rgba(0,0,0,0.45)",
    }}>
      <div style={{ height: 46, background: T.panel, borderBottom: `1.5px solid ${T.line}`, display: "flex", alignItems: "center", gap: 9, padding: "0 18px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c, opacity: 0.8 }} />)}
        {title && <span style={{ marginLeft: 14, fontFamily: MONO, fontSize: 20, color: T.muted, whiteSpace: "nowrap", overflow: "hidden" }}>{title}</span>}
      </div>
      <div style={{ position: "relative", width: "100%", height: h - 46 }}>{children}</div>
    </div>
  );
};

// ---------------------------------------------------------------- YAML line renderer
const tokenStyle = (s: string): React.ReactNode => {
  // highlight ${{ ... }} expressions in amber inside any value
  const parts = s.split(/(\$\{\{[^}]*\}\})/g);
  return parts.map((pt, i) =>
    pt.startsWith("${{")
      ? <span key={i} style={{ color: A.evt, fontWeight: 700 }}>{pt}</span>
      : <span key={i} style={{ color: /^\s*["']/.test(pt) ? A.str : A.str }}>{pt}</span>);
};
export const YLine: React.FC<{ line: string; size?: number }> = ({ line, size = 25 }) => {
  if (/^\s*#/.test(line)) return <span style={{ color: T.muted, fontStyle: "italic" }}>{line}</span>;
  const m = line.match(/^(\s*)(- )?([\w.\-/]+)(:)(.*)$/);
  if (!m) {
    const d = line.match(/^(\s*)(- )(.*)$/);
    if (d) return <span><span style={{ whiteSpace: "pre" }}>{d[1]}</span><span style={{ color: T.muted }}>{d[2]}</span>{tokenStyle(d[3])}</span>;
    return <span style={{ whiteSpace: "pre", color: T.text }}>{tokenStyle(line)}</span>;
  }
  return (
    <span style={{ fontSize: size }}>
      <span style={{ whiteSpace: "pre" }}>{m[1]}</span>
      {m[2] && <span style={{ color: T.muted }}>{m[2]}</span>}
      <span style={{ color: A.key }}>{m[3]}</span>
      <span style={{ color: T.muted }}>{m[4]}</span>
      <span style={{ whiteSpace: "pre" }}>{tokenStyle(m[5])}</span>
    </span>
  );
};

/** A code block: lines appear progressively (reveal 0..1), optional highlighted range. */
export const CodeBlock: React.FC<{
  lines: string[]; reveal: number; x: number; y: number; w: number; size?: number; lh?: number;
  hi?: { a: number; b: number; c: string } | null; numbers?: boolean;
}> = ({ lines, reveal, x, y, w, size = 25, lh = 1.52, hi, numbers = true }) => {
  const frame = useCurrentFrame();
  const shown = reveal * lines.length;
  const rowH = size * lh;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: MONO, fontSize: size }}>
      {hi && hi.a >= 0 && (
        <div style={{
          position: "absolute", left: -12, top: hi.a * rowH - 2, width: w + 12, height: (hi.b - hi.a + 1) * rowH + 4,
          background: mix(T.bg1, hi.c, 0.16 + Math.sin(frame * 0.1) * 0.04), borderLeft: `4px solid ${hi.c}`, borderRadius: 6,
        }} />
      )}
      {lines.map((ln, i) => {
        const o = clamp01(shown - i);
        return (
          <div key={i} style={{ position: "relative", height: rowH, display: "flex", alignItems: "center", opacity: o, whiteSpace: "pre" }}>
            {numbers && <span style={{ width: 44, color: mix(T.muted, T.bg0, 0.35), fontSize: size * 0.8, flexShrink: 0 }}>{i + 1}</span>}
            <YLine line={ln} size={size} />
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- small pieces
export const Chip: React.FC<{ text: string; color: string; o?: number; size?: number; solid?: boolean; style?: React.CSSProperties }> = ({
  text, color, o = 1, size = 22, solid, style,
}) => (
  <span style={{
    display: "inline-flex", alignItems: "center", fontFamily: MONO, fontWeight: 700, fontSize: size, opacity: o,
    color: solid ? T.bg0 : color, background: solid ? color : mix(T.panel, color, 0.14),
    border: `2px solid ${solid ? color : mix(T.line, color, 0.7)}`, borderRadius: 999, padding: "6px 16px", whiteSpace: "nowrap", ...style,
  }}>{text}</span>
);

export const HeadC: React.FC<{ kicker: string; title: string; color: string; o?: number }> = ({ kicker, title, color, o = 1 }) => (
  <div style={{ position: "absolute", left: 100, top: 50, right: 100, opacity: o }}>
    <Kicker theme={T} text={kicker} color={color} />
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, color: T.text, marginTop: 10, letterSpacing: -1.5, whiteSpace: "nowrap" }}>{title}</div>
  </div>
);

export const Label: React.FC<{ x: number; y: number; w: number; text: React.ReactNode; color?: string; size?: number; o?: number; align?: "left" | "center" | "right"; mono?: boolean; weight?: number }> = ({
  x, y, w, text, color = T.text, size = 26, o = 1, align = "left", mono, weight = 600,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: align, fontFamily: mono ? MONO : SANS, fontSize: size, fontWeight: weight, color, opacity: o, lineHeight: 1.3 }}>{text}</div>
);

/** A dot (commit / event) travelling a polyline of points; t in 0..1. */
export const along = (pts: [number, number][], t: number): [number, number] => {
  const segs = pts.length - 1;
  const f = clamp01(t) * segs;
  const i = Math.min(segs - 1, Math.floor(f));
  const u = f - i;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
};

export const SceneProgress: React.FC<{ accent: string; dur?: number }> = ({ accent, dur }) => {
  const p = useP(dur);
  return (
    <div style={{ position: "absolute", left: 0, bottom: 0, height: 6, width: `${p(0, 1) * 100}%`, background: `linear-gradient(90deg, ${mix(accent, T.bg0, 0.4)}, ${accent})`, boxShadow: `0 0 12px ${accent}`, opacity: 0.9 }} />
  );
};
