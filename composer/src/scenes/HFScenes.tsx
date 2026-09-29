/**
 * HFScenes.tsx — "HyperFrames: Video, Written in HTML" (deep course, prefix `hf`).
 *
 * IDENTITY — "The Seekable Timeline"
 *   theme  : near-black; motif = angle-bracket frame ‹ › (HTML) + a scrub-head
 *            timeline along the bottom (the scene-progress bar IS a playhead —
 *            on-theme because seekability is HyperFrames' whole idea).
 *   accents: html=cyan (DOM / data-*), motion=violet (animation / GSAP),
 *            media=amber (audio / TTS / BGM), ship=green (CLI / validate / render),
 *            warn=rose (determinism bans / silent bugs). Colors MEAN these things.
 *
 * RULES (skills/03): every scene takes `dur` and phases with FRACTIONS. Reveals are
 * compressed into the front ~0.62 of the beat via useR (narration front-loads); the
 * SceneProgress playhead + continuous motion run the FULL beat (usePfull) so nothing
 * ever reads frozen. Determinism: rnd() only. No CSS filter/blur.
 *
 * Parameterized archetypes driven from build.py props (reuse, don't duplicate):
 *   hf_divider, hf_recap, hf_roadmap, hf_pipeline, hf_code, hf_compare, hf_bullets.
 * Bespoke hero scenes have their own components. Router adds Bg + SceneProgress.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  makeTheme, mix, useP, usePop, rnd, MONO, SANS, CL,
  Bg, Stage, Kicker, Head, Foot, Card, Flow, Wire, Counter, Type,
} from "../lib/primitives";
import {
  TracksScene, SeekScene, SubcompScene, DeterminismGridScene, AdaptersScene,
  AudioEngineScene, TtsChainScene, StudioScene, LambdaScene,
} from "./HFHeroScenes";

// ---------------------------------------------------------------- identity
export const T = makeTheme({
  accent: "#38BDF8", bg0: "#06080F", bg1: "#0A0E1A", bg2: "#111A2E", panel: "#141C30",
  text: "#EAF1FC", muted: "#8090AE", line: "rgba(140,170,220,0.10)",
});
export const A = {
  html: "#38BDF8",   // cyan   — HTML / DOM / data-* / structure
  motion: "#A78BFA", // violet — animation / GSAP timeline / motion
  media: "#FBBF24",  // amber  — audio / TTS / BGM / media
  ship: "#34D399",   // green  — CLI / validate / render / "correct"
  warn: "#FB7185",   // rose   — determinism bans / silent bugs
};

// Reveals land in the front REVEAL_SPAN of the beat (narration names things early),
// while the playhead + motion use the FULL beat. Scenes tracking a running process
// (a scrub, a building list) can opt out and use the plain useP(dur) instead.
const REVEAL_SPAN = 0.62;
export const useR = (dur?: unknown) => {
  const p = useP(dur);
  return (a: number, b: number) => p(Math.min(1, a * REVEAL_SPAN), Math.min(1, b * REVEAL_SPAN));
};

// ---------------------------------------------------------------- motif pieces
/** Angle-bracket frame ‹  › — the HTML signature, breathing slowly. */
export const AngleFrame: React.FC<{ x: number; y: number; w: number; h: number; color: string; o?: number; size?: number }> =
({ x, y, w, h, color, o = 1, size = 60 }) => {
  const frame = useCurrentFrame();
  const b = Math.sin(frame * 0.045) * 5;
  const th = 5;
  return (
    <div style={{ position: "absolute", left: x - b, top: y, width: w + b * 2, height: h, opacity: o, pointerEvents: "none" }}>
      {/* left ‹ */}
      <div style={{ position: "absolute", left: 0, top: h / 2 - size * 0.72, width: th, height: size, background: color, borderRadius: 3, transform: "rotate(28deg)", transformOrigin: "bottom" }} />
      <div style={{ position: "absolute", left: 0, top: h / 2, width: th, height: size, background: color, borderRadius: 3, transform: "rotate(-28deg)", transformOrigin: "top" }} />
      {/* right › */}
      <div style={{ position: "absolute", right: 0, top: h / 2 - size * 0.72, width: th, height: size, background: color, borderRadius: 3, transform: "rotate(-28deg)", transformOrigin: "bottom" }} />
      <div style={{ position: "absolute", right: 0, top: h / 2, width: th, height: size, background: color, borderRadius: 3, transform: "rotate(28deg)", transformOrigin: "top" }} />
    </div>
  );
};

/** A horizontal timeline track with clip blocks and a glowing scrub head.
 *  `head` in 0..1 is the playhead position. Continuous dash-march keeps it alive. */
export const TrackBar: React.FC<{
  x: number; y: number; w: number; head: number;
  clips?: { at: number; len: number; c: string; label?: string }[];
  o?: number; h?: number;
}> = ({ x, y, w, head, clips = [], o = 1, h = 12 }) => {
  const frame = useCurrentFrame();
  const hx = x + w * Math.max(0, Math.min(1, head));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: o }}>
      {/* rail */}
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, borderRadius: h, background: mix(T.panel, T.bg0, 0.3), border: `1.5px solid ${T.line}` }} />
      {/* clip blocks */}
      {clips.map((cl, i) => (
        <div key={i} style={{
          position: "absolute", left: w * cl.at, top: -2, width: w * cl.len, height: h + 4, borderRadius: 6,
          background: `linear-gradient(180deg, ${mix(cl.c, T.panel, 0.15)}, ${mix(cl.c, T.bg1, 0.5)})`,
          border: `1.5px solid ${cl.c}`, boxShadow: `0 0 14px ${mix(T.bg0, cl.c, 0.4)}`,
        }}>
          {cl.label && <span style={{ position: "absolute", left: 4, top: -26, fontFamily: MONO, fontSize: 17, color: cl.c, whiteSpace: "nowrap" }}>{cl.label}</span>}
        </div>
      ))}
      {/* dash-march to show "playing" */}
      <div style={{ position: "absolute", left: 0, top: h / 2 - 1, width: w, height: 2, opacity: 0.4,
        backgroundImage: `repeating-linear-gradient(90deg, ${A.html} 0 8px, transparent 8px 22px)`,
        backgroundPositionX: -frame * 1.6 }} />
      {/* scrub head */}
      <div style={{ position: "absolute", left: hx - x - 2, top: -14, width: 4, height: h + 28, background: T.text, boxShadow: `0 0 14px ${A.html}` }} />
      <div style={{ position: "absolute", left: hx - x - 9, top: -22, width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: `12px solid ${T.text}` }} />
    </div>
  );
};

/** data-* attribute pill. */
export const TagChip: React.FC<{ text: string; color: string; o?: number; size?: number }> = ({ text, color, o = 1, size = 22 }) => (
  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: size, color: mix(color, T.text, 0.15),
    background: mix(T.panel, color, 0.14), border: `1.6px solid ${mix(T.line, color, 0.6)}`,
    borderRadius: 8, padding: "6px 13px", opacity: o, whiteSpace: "nowrap" }}>{text}</span>
);

// ---------------------------------------------------------------- code panel
/** One code line = ordered [text, color] tokens. Non-token spaces preserved. */
export type Tok = [string, string];
export const CodePanel: React.FC<{
  x: number; y: number; w: number; lines: Tok[][]; p: (a: number, b: number) => number;
  title?: string; start?: number; step?: number; size?: number;
}> = ({ x, y, w, lines, p, title = "composition.html", start = 0.08, step = 0.03, size = 24 }) => {
  const lh = size * 1.5;
  const h = 64 + lines.length * lh + 22;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 16,
      background: mix(T.panel, T.bg0, 0.35), border: `2px solid ${T.line}`, overflow: "hidden", opacity: p(start - 0.05, start) }}>
      {/* title bar */}
      <div style={{ height: 42, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", background: mix(T.panel, T.bg1, 0.4), borderBottom: `1.5px solid ${T.line}` }}>
        {["#FB7185", "#FBBF24", "#34D399"].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 12, background: c, opacity: 0.8 }} />)}
        <span style={{ fontFamily: MONO, fontSize: 18, color: T.muted, marginLeft: 6 }}>{title}</span>
      </div>
      <div style={{ padding: "16px 22px" }}>
        {lines.map((toks, i) => {
          const at = start + 0.04 + i * step;
          return (
            <div key={i} style={{ fontFamily: MONO, fontSize: size, lineHeight: `${lh}px`, whiteSpace: "pre", opacity: p(at, at + 0.04) }}>
              {toks.map((t, j) => <span key={j} style={{ color: t[1] }}>{t[0]}</span>)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- SceneProgress (playhead)
/** Thin scrub-head bar filling L→R over the WHOLE beat — the "this is playing"
 *  guarantee, themed as the seekable-timeline playhead. Router mounts it globally. */
const SceneProgress: React.FC<{ accent: string; dur?: number }> = ({ accent, dur }) => {
  const p = useP(dur);
  const w = p(0, 1);
  return (
    <>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 5, width: `${w * 100}%`,
        background: `linear-gradient(90deg, ${mix(accent, T.bg0, 0.4)}, ${accent})`, boxShadow: `0 0 12px ${accent}`, opacity: 0.9 }} />
      <div style={{ position: "absolute", left: `${w * 100}%`, bottom: -3, width: 0, height: 0, marginLeft: -6,
        borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: `9px solid ${accent}`, opacity: 0.95 }} />
    </>
  );
};

// ================================================================ TITLE
const TitleScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const pop = usePop(dur);
  // ambient: frames resolving out of a scrub, top and bottom edges
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: 14 }).map((_, i) => {
        const t = ((frame * 1.1 + i * 90) % 1400) / 1400;
        return <div key={i} style={{ position: "absolute", left: t * 1920 - 40, top: 90 + (i % 2) * 812,
          width: 64, height: 40, borderRadius: 5, border: `2px solid ${mix(T.line, A.html, 0.5)}`,
          background: mix(T.panel, A.html, 0.05), opacity: (0.1 + rnd(i, 3) * 0.25) * p(0.05, 0.3) }} />;
      })}
      <AngleFrame x={250} y={300} w={1420} h={480} color={mix(A.html, T.bg1, 0.15)} o={p(0.04, 0.2)} size={120} />
      <div style={{ textAlign: "center", transform: `scale(${0.92 + pop(0) * 0.08})` }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <Kicker theme={T} text="HYPERFRAMES · THE FULL COURSE" cx />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 116, lineHeight: 1.02, letterSpacing: -3, color: T.text }}>
          <div>Video, Written</div>
          <div style={{ color: A.html, textShadow: `0 0 70px ${mix(T.bg0, A.html, 0.7)}` }}>in HTML</div>
        </div>
        <div style={{ height: 5, width: interpolate(p(0.2, 0.5), [0, 1], [0, 560]), background: `linear-gradient(90deg, ${A.html}, ${A.motion})`, borderRadius: 3, margin: "34px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 37, color: T.muted, opacity: p(0.3, 0.52) }}>
          one HTML file · one seekable timeline · deterministic frames
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ================================================================ ROADMAP (developing intro)
const PARTS = [
  { n: 1, t: "What it is", c: A.html }, { n: 2, t: "The contract", c: A.html },
  { n: 3, t: "Motion", c: A.motion }, { n: 4, t: "Creative direction", c: A.media },
  { n: 5, t: "Media & audio", c: A.media }, { n: 6, t: "Dev loop & ship", c: A.ship },
];
const RoadmapScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const p = useP(dur);           // full-beat: the rail fills as parts are named
  return (
    <Stage>
      <Head theme={T} kicker="THE MAP · SIX PARTS" title="Where this course goes" o={p(0, 0.05)} />
      {/* filling rail */}
      <div style={{ position: "absolute", left: 150, top: 520, width: 1620, height: 6, borderRadius: 3, background: mix(T.panel, T.bg0, 0.3) }} />
      <div style={{ position: "absolute", left: 150, top: 520, width: interpolate(p(0.08, 0.9), [0, 1], [0, 1620]), height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${A.html}, ${A.ship})`, boxShadow: `0 0 12px ${A.html}` }} />
      {PARTS.map((pt, i) => {
        const at = 0.08 + i * 0.13;
        const o = p(at, at + 0.06);
        const cx = 150 + 60 + i * 300;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: cx - 9, top: 511, width: 22, height: 22, borderRadius: 22, background: pt.c, boxShadow: `0 0 14px ${pt.c}`, opacity: o }} />
            <div style={{ position: "absolute", left: cx - 120, top: (i % 2) ? 578 : 356, width: 240, textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * 16}px)` }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: pt.c, letterSpacing: 3 }}>PART {pt.n}</div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: T.text, marginTop: 6 }}>{pt.t}</div>
            </div>
            <div style={{ position: "absolute", left: cx - 1, top: (i % 2) ? 543 : 462, width: 2, height: (i % 2) ? 32 : 58, background: mix(pt.c, T.bg0, 0.3), opacity: o }} />
          </React.Fragment>
        );
      })}
      <Foot theme={T} p={p(0.9, 0.97)}>From "what is it" to a rendered MP4 — every layer of the stack.</Foot>
    </Stage>
  );
};

// ================================================================ DIVIDER (parameterized)
const Divider: React.FC<{ dur?: number; n?: number; title?: string; sub?: string; color?: string }> =
({ dur, n = 1, title = "", sub = "", color = A.html }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <AngleFrame x={330} y={300} w={1260} h={480} color={color} o={p(0.04, 0.18)} size={110} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color, letterSpacing: 10, opacity: p(0.05, 0.16) }}>PART {"0" + n}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, color: T.text, letterSpacing: -2, marginTop: 20, opacity: p(0.12, 0.26), transform: `translateY(${(1 - p(0.12, 0.26)) * 28}px)` }}>{title}</div>
        <div style={{ height: 5, width: interpolate(p(0.2, 0.5), [0, 1], [0, 420]), background: color, borderRadius: 3, margin: "26px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 33, color: T.muted, opacity: p(0.3, 0.46) }}>{sub}</div>
      </div>
      {/* progress pips */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 840, display: "flex", justifyContent: "center", gap: 16, opacity: p(0.3, 0.45) }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ width: i === n ? 46 : 14, height: 14, borderRadius: 8,
            background: i <= n ? color : mix(T.panel, color, 0.15), border: `1.5px solid ${i <= n ? color : T.line}`,
            opacity: i === n ? 0.7 + Math.sin(frame * 0.1) * 0.3 : 1 }} />
        ))}
      </div>
    </Stage>
  );
};

// ================================================================ HOOK — HTML → frames (computed)
// The core reveal: a DOM tree on the left, scrubbed by a playhead, resolves into a
// filmstrip of rendered frames on the right. This is the whole thesis in one image.
const HookScene: React.FC<{ dur?: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const head = p(0.2, 0.9);   // full-beat scrub — this scene tracks a running process
  const nFrames = 6;
  const shown = Math.floor(head * nFrames + 0.001);
  const domLines: Tok[][] = [
    [["<div ", T.muted], ["data-duration", A.html], ["=", T.muted], ["\"6\"", A.ship], [">", T.muted]],
    [["  <h1 ", T.muted], ["class", A.html], ["=", T.muted], ["\"clip\"", A.ship], [">Hello</h1>", T.muted]],
    [["  <img ", T.muted], ["data-start", A.html], ["=", T.muted], ["\"2\"", A.ship], [">", T.muted]],
    [["</div>", T.muted]],
  ];
  return (
    <Stage>
      <Head theme={T} kicker="THE IDEA" title="HyperFrames renders video from HTML" o={p(0, 0.06)} />
      {/* left: the HTML */}
      <CodePanel x={130} y={250} w={760} lines={domLines} p={p} title="composition.html" start={0.08} step={0.05} size={26} />
      {/* scrub arrow */}
      <Wire x1={910} y1={430} x2={1010} y2={430} p={p(0.28, 0.36)} color={A.html} w={4} />
      <Flow x1={910} y1={430} x2={1010} y2={430} color={A.html} n={5} o={p(0.34, 0.44)} />
      <div style={{ position: "absolute", left: 905, top: 470, width: 120, fontFamily: MONO, fontSize: 18, color: T.muted, opacity: p(0.3, 0.4) }}>seek → t</div>
      {/* right: filmstrip of rendered frames */}
      <div style={{ position: "absolute", left: 1040, top: 300, display: "flex", gap: 10, opacity: p(0.24, 0.34) }}>
        {Array.from({ length: nFrames }).map((_, i) => {
          const on = i < shown;
          const hue = mix(A.html, A.motion, i / (nFrames - 1));
          return (
            <div key={i} style={{ width: 118, height: 150, borderRadius: 10, border: `2px solid ${on ? hue : T.line}`,
              background: on ? `linear-gradient(160deg, ${mix(T.panel, hue, 0.22)}, ${mix(T.bg1, hue, 0.08)})` : mix(T.panel, T.bg0, 0.3),
              boxShadow: on ? `0 0 20px ${mix(T.bg0, hue, 0.4)}` : "none", position: "relative", transition: "none" }}>
              <span style={{ position: "absolute", left: 8, bottom: 6, fontFamily: MONO, fontSize: 15, color: on ? hue : T.muted }}>f{i}</span>
              {on && <div style={{ position: "absolute", left: 14, top: 18, width: 44 + i * 8, height: 8, borderRadius: 4, background: hue, opacity: 0.8 }} />}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 1040, top: 300, width: 748 }}>
        <TrackBar x={0} y={175} w={748} head={head} clips={[{ at: 0, len: 1, c: A.motion }]} o={p(0.3, 0.4)} />
      </div>
      <Foot theme={T} p={p(0.82, 0.92)}>The DOM declares timing; a seekable runtime turns each moment into a frame.</Foot>
    </Stage>
  );
};

// ================================================================ PIPELINE (parameterized)
// Horizontal Cards + Wires + Flow. Props: steps:[{label,sub,c}], kicker, title, foot.
const PipelineScene: React.FC<{
  dur?: number; kicker?: string; title?: string; foot?: string; color?: string;
  steps?: { label: string; sub: string; c?: string }[];
}> = ({ dur, kicker = "PIPELINE", title = "", foot = "", color = A.ship, steps = [] }) => {
  const p = useR(dur);
  const n = Math.max(1, steps.length);
  const gap = 40, w = Math.min(320, (1620 - (n - 1) * gap) / n);
  const x0 = 150;
  const yc = 520;
  return (
    <Stage>
      <Head theme={T} kicker={kicker} title={title} color={color} o={p(0, 0.06)} />
      {steps.map((s, i) => {
        const c = s.c || color;
        const x = x0 + i * (w + gap);
        const at = 0.08 + i * 0.13;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <>
                <Wire x1={x0 + (i - 1) * (w + gap) + w} y1={yc + 60} x2={x - 6} y2={yc + 60} p={p(at - 0.06, at)} color={c} w={3.5} />
                <Flow x1={x0 + (i - 1) * (w + gap) + w} y1={yc + 60} x2={x - 6} y2={yc + 60} color={c} n={5} o={p(at + 0.02, at + 0.1)} />
              </>
            )}
            <Card theme={T} x={x} y={yc} w={w} h={200} color={c} o={p(at, at + 0.08)} glow>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: c, letterSpacing: 2 }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.text, marginTop: 10 }}>{s.label}</div>
              <div style={{ fontFamily: MONO, fontSize: 20, color: T.muted, marginTop: 12, lineHeight: 1.35 }}>{s.sub}</div>
            </Card>
          </React.Fragment>
        );
      })}
      {foot ? <Foot theme={T} p={p(0.82, 0.92)}>{foot}</Foot> : null}
    </Stage>
  );
};

// ================================================================ CODE scene (parameterized)
// Props: lines (Tok[][]), title, kicker, headline, notes:[{at,text,c}], color, foot.
const CodeScene: React.FC<{
  dur?: number; kicker?: string; title?: string; codeTitle?: string; color?: string; foot?: string;
  lines?: Tok[][]; notes?: { text: string; c?: string }[];
}> = ({ dur, kicker = "CONTRACT", title = "", codeTitle = "composition.html", color = A.html, foot = "", lines = [], notes = [] }) => {
  const p = useR(dur);
  return (
    <Stage>
      <Head theme={T} kicker={kicker} title={title} color={color} o={p(0, 0.06)} />
      <CodePanel x={130} y={250} w={1040} lines={lines} p={p} title={codeTitle} start={0.1} step={0.045} size={24} />
      <div style={{ position: "absolute", left: 1230, top: 270, width: 560 }}>
        {notes.map((nt, i) => {
          const at = 0.3 + i * 0.13;
          const o = p(at, at + 0.07);
          const c = nt.c || color;
          return (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 22, opacity: o, transform: `translateX(${(1 - o) * 22}px)` }}>
              <div style={{ minWidth: 10, width: 10, height: 10, borderRadius: 10, marginTop: 12, background: c, boxShadow: `0 0 10px ${c}` }} />
              <div style={{ fontFamily: SANS, fontSize: 27, color: T.text, lineHeight: 1.4 }}>{nt.text}</div>
            </div>
          );
        })}
      </div>
      {foot ? <Foot theme={T} p={p(0.84, 0.93)}>{foot}</Foot> : null}
    </Stage>
  );
};

// ================================================================ COMPARE (do / don't, parameterized)
const CompareScene: React.FC<{
  dur?: number; kicker?: string; title?: string; foot?: string;
  left?: { head: string; items: string[]; c?: string; bad?: boolean };
  right?: { head: string; items: string[]; c?: string; bad?: boolean };
}> = ({ dur, kicker = "RULE", title = "", foot = "", left, right }) => {
  const p = useR(dur);
  const cols = [left, right].filter(Boolean) as NonNullable<typeof left>[];
  return (
    <Stage>
      <Head theme={T} kicker={kicker} title={title} o={p(0, 0.06)} />
      {cols.map((col, ci) => {
        const c = col.c || (col.bad ? A.warn : A.ship);
        const x = ci === 0 ? 130 : 990;
        return (
          <React.Fragment key={ci}>
            <Card theme={T} x={x} y={260} w={800} h={560} color={c} o={p(0.06 + ci * 0.06, 0.16 + ci * 0.06)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: c }}>{col.bad ? "✗" : "✓"}</span>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.text }}>{col.head}</span>
              </div>
              <div style={{ marginTop: 24 }}>
                {col.items.map((it, i) => {
                  const at = 0.2 + ci * 0.06 + i * 0.1;
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 18, opacity: p(at, at + 0.07) }}>
                      <span style={{ color: c, fontFamily: MONO, fontSize: 24, marginTop: 2 }}>—</span>
                      <span style={{ fontFamily: SANS, fontSize: 26, color: T.text, lineHeight: 1.38 }}>{it}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </React.Fragment>
        );
      })}
      {foot ? <Foot theme={T} p={p(0.84, 0.93)}>{foot}</Foot> : null}
    </Stage>
  );
};

// ================================================================ BULLETS (flexible list, parameterized)
const BulletsScene: React.FC<{
  dur?: number; kicker?: string; title?: string; foot?: string; color?: string;
  items?: { h: string; sub?: string; c?: string; icon?: string }[];
}> = ({ dur, kicker = "", title = "", foot = "", color = A.html, items = [] }) => {
  const p = useR(dur);
  const n = items.length;
  const rowH = Math.min(120, 560 / Math.max(1, n));
  return (
    <Stage>
      <Head theme={T} kicker={kicker} title={title} color={color} o={p(0, 0.06)} />
      <div style={{ position: "absolute", left: 150, top: 270, width: 1620 }}>
        {items.map((it, i) => {
          const at = 0.08 + i * 0.11;
          const o = p(at, at + 0.07);
          const c = it.c || color;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, height: rowH - 14, marginBottom: 14,
              background: mix(T.panel, c, 0.06), border: `1.5px solid ${T.line}`, borderLeft: `5px solid ${c}`, borderRadius: 14,
              padding: "0 28px", opacity: o, transform: `translateX(${(1 - o) * -24}px)` }}>
              <span style={{ fontSize: 40 }}>{it.icon || ""}</span>
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.text }}>{it.h}</div>
                {it.sub && <div style={{ fontFamily: MONO, fontSize: 21, color: T.muted, marginTop: 4 }}>{it.sub}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {foot ? <Foot theme={T} p={p(0.86, 0.94)}>{foot}</Foot> : null}
    </Stage>
  );
};

// ================================================================ RECAP (parameterized)
const RecapScene: React.FC<{ dur?: number; items?: string[]; closer?: string }> = ({
  dur, items = [], closer = "One HTML file. One seekable timeline. Deterministic frames.",
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <AbsoluteFill style={{ padding: "60px 130px", justifyContent: "center" }}>
      <div style={{ opacity: p(0, 0.06), textAlign: "center", marginBottom: 26 }}>
        <Kicker theme={T} text="RECAP — THE WHOLE MAP" cx />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, color: T.text, marginTop: 12, letterSpacing: -1.5 }}>HyperFrames in one breath</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, maxWidth: 1360, margin: "0 auto", width: "100%" }}>
        {items.map((it, i) => {
          const at = 0.06 + i * 0.09;
          const o = p(at, at + 0.06);
          const c = [A.html, A.html, A.motion, A.media, A.media, A.ship, A.ship, A.warn][i % 8];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: o, transform: `translateX(${(1 - o) * -24}px)`,
              background: mix(T.panel, c, 0.05), border: `1.5px solid ${T.line}`, borderLeft: `4px solid ${c}`, borderRadius: 12, padding: "14px 26px" }}>
              <span style={{ color: c, fontFamily: MONO, fontWeight: 700, fontSize: 25 }}>{i + 1}</span>
              <span style={{ fontFamily: SANS, fontSize: 28, color: T.text, lineHeight: 1.25 }}>{it}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 30, opacity: p(0.8, 0.9) }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 40, color: A.html, textShadow: `0 0 ${28 + Math.sin(frame * 0.06) * 12}px ${mix(T.bg0, A.html, 0.7)}` }}>{closer}</div>
      </div>
    </AbsoluteFill>
  );
};

// ================================================================ ROUTER
export const HFScene: React.FC<{ variant: string;[key: string]: unknown }> = ({ variant, ...rest }) => {
  let content: React.ReactNode;
  let accent = A.html;
  switch (variant) {
    case "hf_title": content = <TitleScene {...(rest as any)} />; break;
    case "hf_roadmap": content = <RoadmapScene {...(rest as any)} />; break;
    case "hf_divider": content = <Divider {...(rest as any)} />; accent = (rest as any).color || A.html; break;
    case "hf_hook": content = <HookScene {...(rest as any)} />; break;
    case "hf_pipeline": content = <PipelineScene {...(rest as any)} />; accent = (rest as any).color || A.ship; break;
    case "hf_code": content = <CodeScene {...(rest as any)} />; accent = (rest as any).color || A.html; break;
    case "hf_compare": content = <CompareScene {...(rest as any)} />; accent = A.warn; break;
    case "hf_bullets": content = <BulletsScene {...(rest as any)} />; accent = (rest as any).color || A.html; break;
    case "hf_tracks": content = <TracksScene {...(rest as any)} />; break;
    case "hf_seek": content = <SeekScene {...(rest as any)} />; break;
    case "hf_subcomp": content = <SubcompScene {...(rest as any)} />; break;
    case "hf_determinismgrid": content = <DeterminismGridScene {...(rest as any)} />; accent = A.warn; break;
    case "hf_adapters": content = <AdaptersScene {...(rest as any)} />; accent = A.motion; break;
    case "hf_audioengine": content = <AudioEngineScene {...(rest as any)} />; accent = A.media; break;
    case "hf_ttschain": content = <TtsChainScene {...(rest as any)} />; accent = A.media; break;
    case "hf_studio": content = <StudioScene {...(rest as any)} />; accent = A.ship; break;
    case "hf_lambda": content = <LambdaScene {...(rest as any)} />; accent = A.ship; break;
    case "hf_recap": content = <RecapScene {...(rest as any)} />; break;
    default: content = <TitleScene {...(rest as any)} />;
  }
  return (
    <AbsoluteFill>
      <Bg theme={T} accent={accent} />
      {content}
      <SceneProgress accent={accent} dur={(rest as any).dur} />
    </AbsoluteFill>
  );
};

export default HFScene;
