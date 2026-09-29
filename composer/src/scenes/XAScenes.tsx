/**
 * XAScenes.tsx — "Applied AI on X" (prefix `xa`).
 *
 * A 100-article deep dive built from the X/Twitter Applied-AI compilation
 * (8 themes → 8 chapters). Every article gets one beat; the beat's layout is
 * chosen per article from 7 content archetypes so 100 beats never look alike.
 *
 * IDENTITY
 *   Motif   : the FEED RAIL — a left-edge rail of post ticks that fills as the
 *             beat plays, plus a rank badge + @handle chip on every article beat.
 *   Accents : sky = the source/post · amber = the core claim · violet = mechanism
 *             green = what to do · rose = the failure mode.
 *
 * CONTRACT (skills/02,03,09)
 *   - Every scene phases off useP(dur). Reveals use `revealAt`, whose spacing was
 *     derived from the build's own audio-timed caption cues, so each item appears
 *     when it is spoken. SceneProgress + FeedRail + the chase highlight run the
 *     FULL beat, so the tail of a long beat never reads as frozen.
 *   - Captions are ON for this series, so Foot sits at y=856 (not 924).
 *   - Content zone: y 212 → 840. Margins x 100 → 1820.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  Bg, Brackets, Card, Counter, Flow, Head, MONO, SANS, ScanBeam, Stage, Type, Wire,
  makeTheme, mix, useP as usePfull, usePop, rnd, Theme,
} from "../lib/primitives";

// This series' narration does NOT front-load: it names the article, then walks the
// points in order, one per ~12% of the beat. Measured against the build's audio-timed
// caption cues (skills/06 §4c), the six points of a011 are spoken at
//   p = 0.12 · 0.23 · 0.38 · 0.57 · 0.70 · 0.74
// — i.e. roughly linear from 0.12 to 0.74. So reveals are NOT compressed here; they
// track the spoken position directly via `revealAt`. Compressing them (an earlier
// REVEAL_SPAN of 0.62) put the last card at p≈0.41 and left ~65s of a 113s beat with
// nothing new arriving, which is the frozen-frame defect skills/03 warns about.
const useP = usePfull;

/** Phase for item i of n, matched to where it is actually spoken. */
const revealAt = (i: number, n: number) => 0.12 + i * (0.62 / Math.max(1, n - 1));

// ---------------------------------------------------------------- identity
// NOTE: `line` MUST be a hex colour. mix() parses hex pairs, so the default
// rgba(255,255,255,0.08) makes every mix(T.line, …) return rgb(NaN,NaN,NaN) and the
// border silently disappears. QA caught exactly that on the flow/roster/article cards.
const T = makeTheme({ accent: "#4DA3FF", bg0: "#05070D", bg1: "#090E1A", bg2: "#111A2E",
  panel: "#151D33", line: "#232B44" });

// Article beats share one vertical rhythm: header → thesis (fixed) → content → Foot.
const THESIS_Y = 212, THESIS_H = 106;
const CONTENT_TOP = THESIS_Y + THESIS_H + 18;   // 336
const A = {
  src: "#7DD3FC",   // the post / author / engagement
  idea: "#FBBF24",  // the core claim
  mech: "#A78BFA",  // mechanism, architecture, how it works
  todo: "#34D399",  // the takeaway / what to do
  risk: "#FB7185",  // the failure mode / pitfall
  main: "#4DA3FF",
};
const CYC = [A.src, A.idea, A.mech, A.todo, A.risk];

// Captions occupy the bottom band → takeaway strip sits at 856 (skills/05).
const Foot: React.FC<{ theme: Theme; p: number; color?: string; children: React.ReactNode }> = ({
  theme, p, color, children,
}) => (
  <div style={{
    position: "absolute", left: 100, top: 856, right: 100, fontFamily: MONO, fontSize: 22,
    color: color || theme.muted, opacity: p, lineHeight: 1.35,
    transform: `translateY(${(1 - p) * 12}px)`, textAlign: "center",
  }}>{children}</div>
);

// A thin bar filling L→R across the WHOLE beat — the universal "this is playing" signal.
const SceneProgress: React.FC<{ accent: string; dur?: number }> = ({ accent, dur }) => {
  const p = usePfull(dur);
  const w = p(0, 1);
  return (
    <div style={{
      position: "absolute", left: 0, bottom: 0, height: 5, width: `${w * 100}%`,
      background: `linear-gradient(90deg, ${mix(accent, T.bg0, 0.35)}, ${accent})`,
      boxShadow: `0 0 12px ${accent}`, opacity: 0.85,
    }} />
  );
};

// The recurring motif: a left-edge rail of post ticks that fills as the beat runs.
const FeedRail: React.FC<{ accent: string; dur?: number }> = ({ accent, dur }) => {
  const frame = useCurrentFrame();
  const p = usePfull(dur);
  const fill = p(0, 1);
  const N = 26;
  return (
    <div style={{ position: "absolute", left: 46, top: 150, width: 10, height: 760 }}>
      <div style={{ position: "absolute", left: 4, top: 0, width: 2, height: 760, background: mix(T.bg1, accent, 0.25) }} />
      {Array.from({ length: N }).map((_, i) => {
        const y = (i / (N - 1)) * 748;
        const on = i / (N - 1) <= fill;
        const puls = 0.5 + Math.sin(frame * 0.07 + i * 0.55) * 0.5;
        return (
          <div key={i} style={{
            position: "absolute", left: 0, top: y, width: 10, height: 10, borderRadius: 10,
            background: on ? accent : mix(T.bg1, accent, 0.18),
            opacity: on ? 0.45 + puls * 0.55 : 0.5,
            boxShadow: on ? `0 0 ${6 + puls * 8}px ${accent}` : "none",
          }} />
        );
      })}
    </div>
  );
};

// Engagement sparkline — deterministic, drawn from the article's own like count.
const Spark: React.FC<{ seed: number; color: string; x: number; y: number; w?: number; h?: number; o?: number }> = ({
  seed, color, x, y, w = 200, h = 40, o = 1,
}) => {
  const frame = useCurrentFrame();
  const N = 26;
  const pts = Array.from({ length: N }).map((_, i) => {
    const v = rnd(i, seed, 3) * 0.7 + Math.sin(i * 0.6 + frame * 0.03) * 0.15 + 0.15;
    return `${x + (i / (N - 1)) * w},${y + h - v * h}`;
  }).join(" ");
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: o }} width={1920} height={1080}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} opacity={0.7} />
    </svg>
  );
};

/** Article header: rank badge + @handle + engagement, then a 2-line title. */
const ArticleHead: React.FC<{
  rank?: number; total?: number; ch?: number; chname?: string; title?: string;
  handle?: string; author?: string; likes?: string; color?: string; o?: number;
}> = ({ rank = 1, total = 1, ch = 1, chname = "", title = "", handle = "", author = "", likes = "", color = A.main, o = 1 }) => (
  <>
    <div style={{ position: "absolute", left: 100, top: 44, display: "flex", alignItems: "center", gap: 14, opacity: o }}>
      <div style={{ width: 40, height: 4, borderRadius: 2, background: color }} />
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 21, color, letterSpacing: 5 }}>
        {`CH ${ch} · ${chname} · ${String(rank).padStart(2, "0")}/${total}`.toUpperCase()}
      </div>
    </div>
    <div style={{ position: "absolute", right: 100, top: 38, display: "flex", alignItems: "center", gap: 12, opacity: o }}>
      <div style={{
        fontFamily: MONO, fontWeight: 700, fontSize: 21, color: A.src, padding: "7px 16px", borderRadius: 999,
        background: mix(T.panel, A.src, 0.12), border: `1.5px solid ${mix(T.line, A.src, 0.5)}`, whiteSpace: "nowrap",
      }}>{handle}</div>
      {likes ? (
        <div style={{
          fontFamily: MONO, fontWeight: 700, fontSize: 21, color: T.muted, padding: "7px 14px", borderRadius: 999,
          background: mix(T.panel, T.muted, 0.06), border: `1.5px solid ${T.line}`, whiteSpace: "nowrap",
        }}>♥ {likes}</div>
      ) : null}
    </div>
    {/* 40px/800 ≈ 21px per char → 1620px fits ~76 chars/line, 2 lines ≈ 150 chars */}
    <div style={{
      position: "absolute", left: 100, top: 86, width: 1620, fontFamily: SANS, fontWeight: 800,
      fontSize: 40, lineHeight: 1.22, color: T.text, letterSpacing: -1.1, opacity: o,
    }}>{title}</div>
    {author ? (
      <div style={{ position: "absolute", right: 100, top: 92, fontFamily: MONO, fontSize: 20, color: T.muted, opacity: o * 0.9 }} />
    ) : null}
  </>
);

/** Left-accent thesis strip that sits directly under the article header. */
const Thesis: React.FC<{ text?: string; color?: string; o?: number; y?: number }> = ({
  text = "", color = A.idea, o = 1, y = 212,
}) => (
  // FIXED height (not minHeight): a 2-line thesis used to grow past the content top
  // and sit on top of the first row of cards. QA caught this on article/roster.
  <div style={{
    position: "absolute", left: 100, top: y, width: 1720, height: THESIS_H, boxSizing: "border-box",
    borderLeft: `5px solid ${color}`, background: mix(T.panel, color, 0.07), borderRadius: "0 14px 14px 0",
    padding: "16px 26px", opacity: o, transform: `translateY(${(1 - o) * 14}px)`, overflow: "hidden",
  }}>
    {/* 29px SANS ≈ 14.5px/char → 1668px ≈ 115 chars/line, 2 lines ≈ 230 chars */}
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 29, lineHeight: 1.28, color: T.text }}>{text}</div>
  </div>
);

// =====================================================================================
// 1. TITLE — the video's opening card
// =====================================================================================
const TitleScene: React.FC<{ dur?: number; title?: string; sub?: string; kicker?: string }> = ({
  dur, kicker = "X / APPLIED AI · COMPILED 12 SEP 2026",
  title = "Applied AI on X", sub = "8 themes · 100 articles · every idea explained end to end",
}) => {
  const frame = useCurrentFrame();
  const p = usePfull(dur);
  const pop = usePop(dur);
  return (
    <Stage>
      {/* ambience: post cards drifting up both edges — never behind the headline block */}
      {[0, 1].map((side) =>
        Array.from({ length: 7 }).map((_, i) => {
          const x = side === 0 ? 70 : 1610;
          const drift = ((frame * 0.6 + i * 150) % 1180) - 90;
          const c = CYC[(i + side * 2) % CYC.length];
          return (
            <div key={`${side}-${i}`} style={{
              position: "absolute", left: x, top: 1000 - drift, width: 240, height: 74, borderRadius: 12,
              background: mix(T.panel, c, 0.1), border: `1.5px solid ${mix(T.line, c, 0.45)}`,
              opacity: 0.30 * Math.sin(Math.max(0, Math.min(1, drift / 1080)) * Math.PI), padding: "12px 14px", boxSizing: "border-box",
            }}>
              <div style={{ width: 90, height: 8, borderRadius: 4, background: mix(T.bg1, c, 0.6) }} />
              <div style={{ width: 190, height: 7, borderRadius: 4, background: mix(T.bg1, T.muted, 0.4), marginTop: 12 }} />
              <div style={{ width: 140, height: 7, borderRadius: 4, background: mix(T.bg1, T.muted, 0.3), marginTop: 8 }} />
            </div>
          );
        })
      )}

      {/* 1440px wide at 100px/800 ≈ 53px per char → ~27 chars fits the accent line on ONE
          line. At 118px in a 1200px box it wrapped to three ragged lines. */}
      <div style={{ position: "absolute", left: 240, right: 240, top: 300, textAlign: "center", transform: `scale(${0.94 + pop(0) * 0.06})` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "9px 22px", borderRadius: 999,
          background: mix(T.panel, A.src, 0.12), border: `1.5px solid ${mix(T.line, A.src, 0.55)}`, opacity: p(0.03, 0.14) }}>
          <div style={{ width: 9, height: 9, borderRadius: 9, background: A.src, boxShadow: `0 0 12px ${A.src}` }} />
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: A.src }}>{kicker}</span>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 100, lineHeight: 1.06, letterSpacing: -2.5,
          color: T.text, marginTop: 26, opacity: p(0.08, 0.2) }}>{title}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 100, lineHeight: 1.06, letterSpacing: -2.5,
          color: A.main, textShadow: `0 0 44px ${mix(T.bg0, A.main, 0.75)}`, opacity: p(0.16, 0.3) }}>
          The 100-Article Deep Dive
        </div>
        <div style={{ height: 5, width: interpolate(p(0.24, 0.5), [0, 1], [0, 560]), background: `linear-gradient(90deg, ${A.src}, ${A.idea})`,
          borderRadius: 3, margin: "30px auto 0" }} />
        <div style={{ fontFamily: SANS, fontSize: 37, color: T.muted, marginTop: 26, opacity: p(0.34, 0.52) }}>{sub}</div>
      </div>

      <Spark seed={7} color={A.idea} x={760} y={900} w={400} h={44} o={p(0.5, 0.7) * 0.8} />
    </Stage>
  );
};

// =====================================================================================
// 2. DIVIDER — chapter card (8 pips)
// =====================================================================================
const DividerScene: React.FC<{ dur?: number; n?: number; title?: string; sub?: string; color?: string; pips?: number }> = ({
  dur, n = 1, title = "", sub = "", color = A.main, pips = 8,
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  return (
    <Stage>
      <Brackets x={330} y={300} w={1260} h={470} color={color} o={p(0.02, 0.14)} len={54} />
      <ScanBeam theme={T} x={340} y={310} w={1240} h={450} color={color} o={p(0.05, 0.2)} speed={1.6} />
      <div style={{ position: "absolute", left: 260, right: 260, top: 360, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color, letterSpacing: 10, opacity: p(0.05, 0.15) }}>
          {`CHAPTER ${String(n).padStart(2, "0")}`}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 84, lineHeight: 1.08, color: T.text, letterSpacing: -2,
          marginTop: 18, opacity: p(0.12, 0.26), transform: `translateY(${(1 - p(0.12, 0.26)) * 28}px)` }}>{title}</div>
        <div style={{ height: 5, width: interpolate(p(0.22, 0.52), [0, 1], [0, 420]), background: color, borderRadius: 3, margin: "24px auto" }} />
        <div style={{ fontFamily: SANS, fontSize: 33, color: T.muted, opacity: p(0.34, 0.5) }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, display: "flex", justifyContent: "center", gap: 15, opacity: p(0.36, 0.5) }}>
        {Array.from({ length: pips }).map((_, i) => {
          const k = i + 1;
          return (
            <div key={k} style={{
              width: k === n ? 44 : 14, height: 14, borderRadius: 8,
              background: k <= n ? color : mix(T.panel, color, 0.15), border: `1.5px solid ${k <= n ? color : T.line}`,
              opacity: k === n ? 0.7 + Math.sin(frame * 0.1) * 0.3 : 1,
            }} />
          );
        })}
      </div>
    </Stage>
  );
};

// =====================================================================================
// 3. CHAPTER ROADMAP — the articles in this chapter, revealed on a filling rail
// =====================================================================================
const ChIntroScene: React.FC<{
  dur?: number; ch?: number; chname?: string; headline?: string; color?: string;
  items?: { n?: number; title?: string; handle?: string }[]; ats?: number[];
}> = ({ dur, ch = 1, chname = "", headline = "", color = A.main, items = [], ats }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = items.length || 1;
  const cols = n > 14 ? 3 : n > 7 ? 2 : 1;
  const rows = Math.ceil(n / cols);
  const colW = cols === 3 ? 520 : cols === 2 ? 800 : 1400;
  const colX = cols === 3 ? [140, 700, 1260] : cols === 2 ? [140, 980] : [260];
  // The grid must finish ABOVE the Foot at 856. At 22 items / 3 cols that is 8 rows,
  // which previously overran to y=894 and printed the footer through the last card.
  const GRID_TOP = 224, GRID_BOT = 820, gap = 8;
  const rowH = Math.min(76, Math.floor((GRID_BOT - GRID_TOP - (rows - 1) * gap) / rows));
  const hot = Math.floor(frame / 30) % n;
  return (
    <Stage>
      <Head theme={T} kicker={`CHAPTER ${ch} · ${chname}`} title={headline} color={color} o={p(0.0, 0.08)} />
      <div style={{ position: "absolute", left: 100, top: 190, width: 1720, height: 4, borderRadius: 2,
        background: `linear-gradient(90deg, ${color}, ${mix(T.bg1, color, 0.2)})`,
        transform: `scaleX(${p(0.02, 0.12)})`, transformOrigin: "left" }} />
      {items.map((it, i) => {
        const c = colX[Math.floor(i / rows)] ?? colX[0];
        const y = GRID_TOP + (i % rows) * (rowH + gap);
        const at = ats?.[i] ?? revealAt(i, n);
        const o = p(at, at + 0.06);
        const live = hot === i && o > 0.9;
        return (
          <div key={i} style={{
            position: "absolute", left: c, top: y, width: colW, height: rowH, boxSizing: "border-box",
            borderRadius: 12, background: mix(T.panel, live ? color : A.src, live ? 0.18 : 0.06),
            border: `2px solid ${live ? color : mix(T.line, color, 0.35)}`,
            display: "flex", alignItems: "center", gap: 14, padding: "0 16px",
            opacity: o, transform: `translateY(${(1 - o) * 16}px) scale(${live ? 1.02 : 1})`,
          }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: live ? T.bg0 : color,
              background: live ? color : mix(T.panel, color, 0.2), borderRadius: 7, padding: "5px 9px", minWidth: 34, textAlign: "center" }}>
              {String(it.n ?? i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: cols === 3 ? 21 : 25, color: T.text,
              lineHeight: 1.15, overflow: "hidden", flex: 1 }}>{it.title}</span>
          </div>
        );
      })}
      <Foot theme={T} p={p(0.82, 0.92)} color={mix(T.muted, color, 0.4)}>
        {`${n} articles in this chapter`}
      </Foot>
    </Stage>
  );
};

// =====================================================================================
// 4. ARTICLE — the canonical beat: thesis strip + numbered point cards
// =====================================================================================
const ArticleScene: React.FC<{
  dur?: number; rank?: number; total?: number; ch?: number; chname?: string; title?: string;
  handle?: string; author?: string; likes?: string; thesis?: string; take?: string; color?: string;
  points?: { label?: string; line?: string }[];
}> = ({ dur, rank, total, ch, chname, title, handle, author, likes, thesis = "", take = "", color = A.main, points = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = Math.max(1, points.length);
  const rows = Math.ceil(n / 2);
  const BAND = 804 - CONTENT_TOP;                     // 336 → 804
  const rowH = Math.min(156, Math.floor((BAND - (rows - 1) * 12) / rows));
  const hot = Math.floor(frame / 28) % n;
  return (
    <Stage>
      <ArticleHead rank={rank} total={total} ch={ch} chname={chname} title={title}
        handle={handle} author={author} likes={likes} color={color} o={p(0.0, 0.06)} />
      <Thesis text={thesis} color={A.idea} o={p(0.05, 0.14)} />
      {points.map((pt, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = col === 0 ? 100 : 980;
        const y = CONTENT_TOP + row * (rowH + 12);
        const at = revealAt(i, n);
        const o = p(at, at + 0.06);
        const c = CYC[i % CYC.length];
        const live = hot === i && o > 0.9;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: 830, height: rowH, boxSizing: "border-box",
            borderRadius: 16, background: mix(T.panel, c, live ? 0.16 : 0.08),
            border: `2.5px solid ${live ? c : mix(T.line, c, 0.55)}`, padding: "14px 20px",
            opacity: o, transform: `translateY(${(1 - o) * 20}px)`,
            boxShadow: live ? `0 0 34px ${mix(T.bg0, c, 0.3)}` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 19, color: T.bg0, background: c,
                borderRadius: 6, padding: "3px 8px" }}>{String(i + 1).padStart(2, "0")}</span>
              {/* 27px/800 ≈ 14.3px/char → ~700px usable ≈ 48 chars */}
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 27, color: c, letterSpacing: -0.4 }}>{pt.label}</span>
            </div>
            {/* 21px SANS ≈ 10.5px/char → 790px ≈ 75 chars/line; 2 lines ≈ 150 chars */}
            <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 21, lineHeight: 1.33, color: T.text,
              opacity: 0.92, marginTop: 8 }}>{pt.line}</div>
          </div>
        );
      })}
      <Foot theme={T} p={p(0.84, 0.94)} color={mix(T.muted, A.todo, 0.55)}>{take ? `→ ${take}` : ""}</Foot>
    </Stage>
  );
};

// =====================================================================================
// 5. ROADMAP — phases on a filling rail (courses, "X in N weeks", step-by-step guides)
// =====================================================================================
const RoadmapScene: React.FC<{
  dur?: number; rank?: number; total?: number; ch?: number; chname?: string; title?: string;
  handle?: string; likes?: string; thesis?: string; take?: string; color?: string;
  phases?: { label?: string; line?: string }[];
}> = ({ dur, rank, total, ch, chname, title, handle, likes, thesis = "", take = "", color = A.mech, phases = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = Math.max(1, phases.length);
  const perRow = n > 5 ? Math.ceil(n / 2) : n;
  const twoRow = n > 5;
  // Each row occupies ry → ry+188 (circle 54 + card ~110). Two rows must finish
  // above the Foot at 856 — QA caught row 2 colliding with the takeaway strip.
  const rowsY = twoRow ? [392, 612] : [470];
  const slotW = Math.floor(1660 / perRow);
  const nodeW = Math.min(280, slotW - 26);
  return (
    <Stage>
      <ArticleHead rank={rank} total={total} ch={ch} chname={chname} title={title}
        handle={handle} likes={likes} color={color} o={p(0.0, 0.06)} />
      <Thesis text={thesis} color={A.idea} o={p(0.05, 0.14)} />
      {rowsY.map((ry, r) => {
        const idxs = phases.map((_, i) => i).filter((i) => (twoRow ? Math.floor(i / perRow) === r : true));
        if (!idxs.length) return null;
        const railW = idxs.length * slotW - (slotW - nodeW);
        const railX = 130 + Math.floor((1660 - railW) / 2);
        return (
          <React.Fragment key={r}>
            {/* the rail itself: a track that fills as the phases land */}
            <div style={{ position: "absolute", left: railX + 30, top: ry + 34, width: railW - 60, height: 4,
              borderRadius: 2, background: mix(T.bg1, color, 0.25) }} />
            <div style={{ position: "absolute", left: railX + 30, top: ry + 34, height: 4, borderRadius: 2,
              width: (railW - 60) * p(0.16, 0.72), background: `linear-gradient(90deg, ${color}, ${A.todo})`,
              boxShadow: `0 0 14px ${color}` }} />
            {idxs.map((i, k) => {
              const x = railX + k * slotW;
              const at = revealAt(i, n);
              const o = p(at, at + 0.06);
              const c = CYC[i % CYC.length];
              const glow = 0.5 + Math.sin(frame * 0.07 + i) * 0.5;
              return (
                <React.Fragment key={i}>
                  {k > 0 && (
                    <Flow x1={x - slotW + nodeW} y1={ry + 36} x2={x} y2={ry + 36} color={c} n={4} speed={0.013} size={7}
                      o={o * 0.8} />
                  )}
                  <div style={{ position: "absolute", left: x + nodeW / 2 - 27, top: ry + 9, width: 54, height: 54,
                    borderRadius: 54, background: mix(T.panel, c, 0.28), border: `3px solid ${c}`,
                    display: "flex", alignItems: "center", justifyContent: "center", opacity: o,
                    boxShadow: `0 0 ${10 + glow * 16}px ${mix(T.bg0, c, 0.55)}` }}>
                    <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: c }}>{i + 1}</span>
                  </div>
                  <div style={{ position: "absolute", left: x, top: ry + 78, width: nodeW, boxSizing: "border-box",
                    borderRadius: 14, background: mix(T.panel, c, 0.08), border: `2px solid ${mix(T.line, c, 0.5)}`,
                    padding: "12px 14px", opacity: o, transform: `translateY(${(1 - o) * 16}px)` }}>
                    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 23, color: c, lineHeight: 1.16 }}>{phases[i]?.label}</div>
                    <div style={{ fontFamily: SANS, fontSize: 19, color: T.text, opacity: 0.9, lineHeight: 1.3, marginTop: 7 }}>
                      {phases[i]?.line}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
      <Foot theme={T} p={p(0.84, 0.94)} color={mix(T.muted, A.todo, 0.55)}>{take ? `→ ${take}` : ""}</Foot>
    </Stage>
  );
};

// =====================================================================================
// 6. STACK — layered architecture (harness, memory systems, platform anatomies)
// =====================================================================================
const StackScene: React.FC<{
  dur?: number; rank?: number; total?: number; ch?: number; chname?: string; title?: string;
  handle?: string; likes?: string; thesis?: string; take?: string; color?: string;
  layers?: { label?: string; line?: string }[]; topLabel?: string; botLabel?: string;
}> = ({ dur, rank, total, ch, chname, title, handle, likes, thesis = "", take = "", color = A.mech,
  layers = [], topLabel = "", botLabel = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = Math.max(1, layers.length);
  const BAND = 812 - CONTENT_TOP;                     // 336 → 812
  const h = Math.min(104, Math.floor((BAND - (n - 1) * 12) / n));
  const hot = Math.floor(frame / 30) % n;
  return (
    <Stage>
      <ArticleHead rank={rank} total={total} ch={ch} chname={chname} title={title}
        handle={handle} likes={likes} color={color} o={p(0.0, 0.06)} />
      <Thesis text={thesis} color={A.idea} o={p(0.05, 0.14)} />
      {/* topLabel/botLabel are right-aligned to the STACK's right edge (1620), not the
          frame edge — pinning them to right:120 pushed them off-stage past x=1820. */}
      {topLabel ? (
        <div style={{ position: "absolute", left: 1180, top: CONTENT_TOP - 26, width: 440, textAlign: "right",
          fontFamily: MONO, fontSize: 19, color: T.muted, opacity: p(0.2, 0.3) }}>{topLabel}</div>
      ) : null}
      {layers.map((L, i) => {
        // stack builds BOTTOM-UP (foundation first) — metaphor direction matters
        const row = n - 1 - i;
        const y = CONTENT_TOP + row * (h + 12);
        const at = revealAt(i, n);
        const o = p(at, at + 0.06);
        const c = CYC[i % CYC.length];
        const live = hot === i && o > 0.9;
        return (
          <React.Fragment key={i}>
            <div style={{
              position: "absolute", left: 300, top: y, width: 1320, height: h, boxSizing: "border-box",
              borderRadius: 14, background: `linear-gradient(90deg, ${mix(T.panel, c, live ? 0.26 : 0.14)}, ${mix(T.panel, c, 0.05)})`,
              border: `2.5px solid ${live ? c : mix(T.line, c, 0.55)}`, padding: "0 24px",
              display: "flex", alignItems: "center", gap: 20, opacity: o,
              transform: `translateX(${(1 - o) * -26}px)`,
              boxShadow: live ? `0 0 34px ${mix(T.bg0, c, 0.3)}` : "none",
            }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: T.bg0, background: c,
                borderRadius: 6, padding: "4px 9px" }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, color: c, width: 300, lineHeight: 1.14 }}>{L.label}</span>
              <span style={{ fontFamily: SANS, fontSize: 21, color: T.text, opacity: 0.92, lineHeight: 1.3, flex: 1 }}>{L.line}</span>
            </div>
            {/* particles rising through the stack — continuous. x=272 keeps them clear of
                the rotated "BUILDS UPWARD" label sitting at x≈236. */}
            {i < n - 1 && (
              <Flow x1={272} y1={y + h} x2={272} y2={y} color={c} n={3} speed={0.012} size={7} o={o * 0.75} />
            )}
          </React.Fragment>
        );
      })}
      {botLabel ? (
        <div style={{ position: "absolute", left: 1180, top: CONTENT_TOP + (n - 1) * (h + 12) + h + 8,
          width: 440, textAlign: "right",
          fontFamily: MONO, fontSize: 19, color: T.muted, opacity: p(0.24, 0.34) }}>{botLabel}</div>
      ) : null}
      {/* rotate(-90deg) with origin "left top" extends the text UPWARD from `top`, so
          anchoring it at y=300 drove it straight through the article title. Anchor it
          at the BOTTOM of the stack instead, in the clear margin left of the bars. */}
      <div style={{ position: "absolute", left: 236, top: 790, fontFamily: MONO, fontSize: 18,
        color: mix(T.muted, color, 0.5), transform: "rotate(-90deg)", transformOrigin: "left top",
        opacity: p(0.3, 0.42), letterSpacing: 4, whiteSpace: "nowrap" }}>
        BUILDS UPWARD ↑
      </div>
      <Foot theme={T} p={p(0.84, 0.94)} color={mix(T.muted, A.todo, 0.55)}>{take ? `→ ${take}` : ""}</Foot>
    </Stage>
  );
};

// =====================================================================================
// 7. FLOW — a left→right pipeline (RAG, inference, serving, request paths)
// =====================================================================================
const FlowScene: React.FC<{
  dur?: number; rank?: number; total?: number; ch?: number; chname?: string; title?: string;
  handle?: string; likes?: string; thesis?: string; take?: string; color?: string;
  nodes?: { label?: string; sub?: string; emoji?: string }[]; note?: string;
}> = ({ dur, rank, total, ch, chname, title, handle, likes, thesis = "", take = "", color = A.src, nodes = [], note = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = Math.max(1, nodes.length);
  const slotW = Math.floor(1660 / n);
  const nodeW = Math.min(300, slotW - 40);
  const X0 = 130 + Math.floor((1660 - (n * slotW - (slotW - nodeW))) / 2);
  const NY = 400, NH = 210;
  const hot = Math.floor(frame / 30) % n;
  return (
    <Stage>
      <ArticleHead rank={rank} total={total} ch={ch} chname={chname} title={title}
        handle={handle} likes={likes} color={color} o={p(0.0, 0.06)} />
      <Thesis text={thesis} color={A.idea} o={p(0.05, 0.14)} />
      {/* wires first so the line ends tuck under the cards (z-order, skills/09 §5) */}
      {nodes.map((_, i) => {
        if (i === 0) return null;
        const x1 = X0 + (i - 1) * slotW + nodeW, x2 = X0 + i * slotW;
        const at = revealAt(i, n);
        return <Wire key={`w${i}`} x1={x1} y1={NY + NH / 2} x2={x2} y2={NY + NH / 2}
          p={p(at - 0.04, at + 0.01)} color={mix(T.line, CYC[i % CYC.length], 0.8)} w={3} />;
      })}
      {nodes.map((nd, i) => {
        const x = X0 + i * slotW;
        const at = revealAt(i, n);
        const o = p(at, at + 0.06);
        const c = CYC[i % CYC.length];
        const live = hot === i && o > 0.9;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <Flow x1={X0 + (i - 1) * slotW + nodeW} y1={NY + NH / 2} x2={x} y2={NY + NH / 2}
                color={c} n={5} speed={0.014} size={8} o={o * 0.85} />
            )}
            <Card theme={T} x={x} y={NY} w={nodeW} h={NH} color={live ? c : mix(T.line, c, 0.75)} o={o} glow={live} pad="18px 18px">
              <div style={{ fontSize: 38, lineHeight: 1 }}>{nd.emoji}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, color: c, marginTop: 10, lineHeight: 1.15 }}>{nd.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 19, color: T.text, opacity: 0.88, lineHeight: 1.3, marginTop: 8 }}>{nd.sub}</div>
            </Card>
            <div style={{ position: "absolute", left: x, top: NY - 34, width: nodeW, textAlign: "center",
              fontFamily: MONO, fontWeight: 700, fontSize: 19, color: mix(T.muted, c, 0.6), opacity: o }}>
              {`STEP ${i + 1}`}
            </div>
          </React.Fragment>
        );
      })}
      {note ? (
        <div style={{ position: "absolute", left: 130, top: 672, width: 1660, textAlign: "center",
          fontFamily: SANS, fontSize: 24, color: mix(T.muted, A.risk, 0.4), opacity: p(0.7, 0.82),
          lineHeight: 1.34 }}>{note}</div>
      ) : null}
      <div style={{ position: "absolute", left: 130, top: 742, width: 1660, height: 3, borderRadius: 2,
        background: mix(T.bg1, color, 0.3), opacity: 0.7 }} />
      <div style={{ position: "absolute", left: 130, top: 742, height: 3, borderRadius: 2,
        width: 1660 * (((frame * 0.004) % 1)), background: color, boxShadow: `0 0 10px ${color}`, opacity: 0.6 }} />
      <Foot theme={T} p={p(0.84, 0.94)} color={mix(T.muted, A.todo, 0.55)}>{take ? `→ ${take}` : ""}</Foot>
    </Stage>
  );
};

// =====================================================================================
// 8. COMPARE — 2–3 columns (X vs Y debates, tradeoffs, before/after)
// =====================================================================================
const CompareScene: React.FC<{
  dur?: number; rank?: number; total?: number; ch?: number; chname?: string; title?: string;
  handle?: string; likes?: string; thesis?: string; take?: string; color?: string; verdict?: string;
  cols?: { title?: string; c?: string; items?: string[] }[];
}> = ({ dur, rank, total, ch, chname, title, handle, likes, thesis = "", take = "", color = A.main,
  verdict = "", cols = [] }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = Math.max(1, cols.length);
  const colW = n === 3 ? 520 : n === 2 ? 790 : 1100;
  const colX = n === 3 ? [140, 700, 1260] : n === 2 ? [140, 990] : [410];
  return (
    <Stage>
      <ArticleHead rank={rank} total={total} ch={ch} chname={chname} title={title}
        handle={handle} likes={likes} color={color} o={p(0.0, 0.06)} />
      <Thesis text={thesis} color={A.idea} o={p(0.05, 0.14)} />
      {cols.map((col, ci) => {
        const c = col.c || CYC[ci % CYC.length];
        const x = colX[ci] ?? colX[0];
        const at = revealAt(ci, n);
        const o = p(at, at + 0.07);
        const glow = 0.5 + Math.sin(frame * 0.06 + ci * 1.6) * 0.5;
        return (
          <div key={ci} style={{
            position: "absolute", left: x, top: CONTENT_TOP, width: colW, height: 808 - CONTENT_TOP, boxSizing: "border-box",
            borderRadius: 18, background: mix(T.panel, c, 0.08), border: `2.5px solid ${mix(T.line, c, 0.7)}`,
            padding: "20px 22px", opacity: o, transform: `translateY(${(1 - o) * 22}px)`,
            boxShadow: `0 0 ${18 + glow * 20}px ${mix(T.bg0, c, 0.22)}`,
          }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: c, lineHeight: 1.14,
              borderBottom: `2px solid ${mix(T.line, c, 0.5)}`, paddingBottom: 12 }}>{col.title}</div>
            {(col.items || []).map((it, i) => {
              const iat = at + 0.08 + i * 0.05;
              const io = p(iat, iat + 0.05);
              return (
                <div key={i} style={{ display: "flex", gap: 10, marginTop: 14, opacity: io,
                  transform: `translateX(${(1 - io) * 14}px)` }}>
                  <span style={{ color: c, fontFamily: MONO, fontWeight: 800, fontSize: 20, marginTop: 2 }}>▸</span>
                  {/* 21px SANS ≈ 10.5/char → 3-col usable 440px ≈ 42 chars/line */}
                  <span style={{ fontFamily: SANS, fontSize: 21, color: T.text, lineHeight: 1.32, opacity: 0.93 }}>{it}</span>
                </div>
              );
            })}
          </div>
        );
      })}
      {verdict ? (
        <div style={{ position: "absolute", left: 140, top: 818, width: 1640, textAlign: "center",
          fontFamily: SANS, fontWeight: 700, fontSize: 25, color: A.todo, opacity: p(0.76, 0.88) }}>{verdict}</div>
      ) : null}
      <Foot theme={T} p={p(0.86, 0.95)} color={mix(T.muted, A.todo, 0.55)}>{take ? `→ ${take}` : ""}</Foot>
    </Stage>
  );
};

// =====================================================================================
// 9. ROSTER — a named list of tools / repos / servers, with a cycling spotlight
// =====================================================================================
const RosterScene: React.FC<{
  dur?: number; rank?: number; total?: number; ch?: number; chname?: string; title?: string;
  handle?: string; likes?: string; thesis?: string; take?: string; color?: string;
  items?: { name?: string; note?: string }[]; count?: number; countLabel?: string;
}> = ({ dur, rank, total, ch, chname, title, handle, likes, thesis = "", take = "", color = A.todo,
  items = [], count = 0, countLabel = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = Math.max(1, items.length);
  const cols = n > 10 ? 3 : n > 5 ? 2 : 1;
  const rows = Math.ceil(n / cols);
  const colW = cols === 3 ? 520 : cols === 2 ? 800 : 1100;
  const colX = cols === 3 ? [140, 700, 1260] : cols === 2 ? [140, 980] : [410];
  const BAND = (count ? 712 : 804) - CONTENT_TOP;      // leave room for the counter strip
  const rowH = Math.min(104, Math.floor((BAND - (rows - 1) * 10) / rows));
  const hot = Math.floor(frame / 24) % n;
  return (
    <Stage>
      <ArticleHead rank={rank} total={total} ch={ch} chname={chname} title={title}
        handle={handle} likes={likes} color={color} o={p(0.0, 0.06)} />
      <Thesis text={thesis} color={A.idea} o={p(0.05, 0.14)} />
      {items.map((it, i) => {
        const x = colX[Math.floor(i / rows)] ?? colX[0];
        const y = CONTENT_TOP + (i % rows) * (rowH + 10);
        const at = revealAt(i, n);
        const o = p(at, at + 0.05);
        const c = CYC[i % CYC.length];
        const live = hot === i && o > 0.9;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: colW, height: rowH, boxSizing: "border-box",
            borderRadius: 13, background: mix(T.panel, live ? c : A.src, live ? 0.2 : 0.06),
            border: `2px solid ${live ? c : mix(T.line, c, 0.4)}`, padding: "10px 16px",
            opacity: o, transform: `translateY(${(1 - o) * 14}px) scale(${live ? 1.03 : 1})`,
            boxShadow: live ? `0 0 26px ${mix(T.bg0, c, 0.32)}` : "none",
          }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: cols === 3 ? 21 : 24,
              color: live ? c : T.text, letterSpacing: -0.2, lineHeight: 1.1 }}>{it.name}</div>
            <div style={{ fontFamily: SANS, fontSize: cols === 3 ? 18 : 20, color: T.muted, opacity: 0.95,
              lineHeight: 1.26, marginTop: 6 }}>{it.note}</div>
          </div>
        );
      })}
      {/* The headline number ("fifty tools", "sixty-seven skills") is spoken in the FIRST
          sentence of these beats, so the counter must land early. Running it to p=0.88
          left the on-screen figure reading 27 while the narration had already said 50. */}
      {count ? (
        <div style={{ position: "absolute", left: 140, top: 736, width: 1640, textAlign: "center", opacity: p(0.06, 0.16) }}>
          <Counter p={p(0.08, 0.24)} to={count} color={color} size={54} />
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: T.muted, marginLeft: 14 }}>{countLabel}</span>
        </div>
      ) : null}
      <Foot theme={T} p={p(0.86, 0.95)} color={mix(T.muted, A.todo, 0.55)}>{take ? `→ ${take}` : ""}</Foot>
    </Stage>
  );
};

// =====================================================================================
// 10. METRIC — progressive bar chart for benchmark / cost / latency articles
// =====================================================================================
const MetricScene: React.FC<{
  dur?: number; rank?: number; total?: number; ch?: number; chname?: string; title?: string;
  handle?: string; likes?: string; thesis?: string; take?: string; color?: string; note?: string;
  bars?: { label?: string; v?: number; show?: string; c?: string }[]; unit?: string;
}> = ({ dur, rank, total, ch, chname, title, handle, likes, thesis = "", take = "", color = A.idea,
  bars = [], unit = "", note = "" }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const n = Math.max(1, bars.length);
  const maxV = Math.max(1, ...bars.map((b) => b.v || 0));
  // HMAX is chosen so the TALLEST bar's value label (Y0 - h - 50) still clears the
  // thesis strip: 752 - 340 - 50 = 362 > CONTENT_TOP. QA caught the label colliding
  // with the chart note when HMAX was 380.
  const Y0 = 752, HMAX = 340;
  const slotW = Math.floor(1560 / n);
  const barW = Math.min(190, slotW - 44);
  const X0 = 180 + Math.floor((1560 - (n * slotW - (slotW - barW))) / 2);
  return (
    <Stage>
      <ArticleHead rank={rank} total={total} ch={ch} chname={chname} title={title}
        handle={handle} likes={likes} color={color} o={p(0.0, 0.06)} />
      <Thesis text={thesis} color={A.idea} o={p(0.05, 0.14)} />
      {/* baseline + gridlines drawn early */}
      <div style={{ position: "absolute", left: 150, top: Y0, width: 1620, height: 3, background: mix(T.line, color, 0.5),
        transform: `scaleX(${p(0.12, 0.22)})`, transformOrigin: "left" }} />
      {[0.25, 0.5, 0.75, 1].map((g, i) => (
        <div key={i} style={{ position: "absolute", left: 150, top: Y0 - HMAX * g, width: 1620, height: 1,
          background: T.line, opacity: p(0.16, 0.26) * 0.8 }} />
      ))}
      {bars.map((b, i) => {
        const at = revealAt(i, n);
        const grow = p(at, at + 0.1);
        const c = b.c || CYC[i % CYC.length];
        const h = ((b.v || 0) / maxV) * HMAX * grow;
        const x = X0 + i * slotW;
        const glow = 0.5 + Math.sin(frame * 0.06 + i * 1.3) * 0.5;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x, top: Y0 - h, width: barW, height: h,
              borderRadius: "12px 12px 0 0", background: `linear-gradient(180deg, ${c}, ${mix(c, T.bg1, 0.55)})`,
              border: `2px solid ${c}`, borderBottom: "none",
              boxShadow: `0 0 ${10 + glow * 16}px ${mix(T.bg0, c, 0.3)}` }} />
            <div style={{ position: "absolute", left: x - 30, top: Y0 - h - 50, width: barW + 60, textAlign: "center",
              fontFamily: MONO, fontWeight: 800, fontSize: 30, color: c, opacity: grow }}>
              {b.show ?? `${Math.round((b.v || 0) * grow)}${unit}`}
            </div>
            <div style={{ position: "absolute", left: x - 30, top: Y0 + 14, width: barW + 60, textAlign: "center",
              fontFamily: SANS, fontWeight: 700, fontSize: 21, color: T.text, opacity: grow * 0.92, lineHeight: 1.24 }}>
              {b.label}
            </div>
          </React.Fragment>
        );
      })}
      {/* the note sits BELOW the chart — above it, it collided with the tallest bar's value */}
      {note ? (
        <div style={{ position: "absolute", left: 150, top: 812, width: 1620, fontFamily: SANS, fontSize: 23,
          color: mix(T.muted, color, 0.4), opacity: p(0.66, 0.8), textAlign: "center" }}>{note}</div>
      ) : null}
      <Foot theme={T} p={p(0.86, 0.95)} color={mix(T.muted, A.todo, 0.55)}>{take ? `→ ${take}` : ""}</Foot>
    </Stage>
  );
};

// =====================================================================================
// 11. RECAP — end of every chapter
// =====================================================================================
const RecapScene: React.FC<{
  dur?: number; n?: number; chname?: string; items?: string[]; closer?: string; color?: string;
  heading?: string; ats?: number[];
}> = ({ dur, n = 1, chname = "", items = [], closer = "", color = A.main, heading = "", ats }) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const k = Math.max(1, items.length);
  const rowH = Math.min(72, Math.floor(460 / k));
  return (
    <Stage>
      <Brackets x={200} y={150} w={1520} h={760} color={color} o={p(0.02, 0.12) * 0.5} len={46} />
      <div style={{ position: "absolute", left: 200, right: 200, top: 178, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 8, color,
          opacity: p(0.02, 0.1) }}>{`RECAP · CHAPTER ${String(n).padStart(2, "0")} · ${chname}`.toUpperCase()}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 58, color: T.text, letterSpacing: -1.6,
          marginTop: 14, opacity: p(0.06, 0.16), lineHeight: 1.1 }}>{heading}</div>
      </div>
      {items.slice(0, 8).map((it, i) => {
        const at = ats?.[i] ?? 0.14 + i * 0.075;   // build.py derives ats from the real cues
        const o = p(at, at + 0.06);
        const c = CYC[i % CYC.length];
        const y = 322 + i * (rowH + 6);
        return (
          <div key={i} style={{
            position: "absolute", left: 290, top: y, width: 1340, height: rowH, boxSizing: "border-box",
            borderLeft: `5px solid ${c}`, background: mix(T.panel, c, 0.06), borderRadius: "0 12px 12px 0",
            display: "flex", alignItems: "center", gap: 16, padding: "0 20px",
            opacity: o, transform: `translateX(${(1 - o) * 22}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 19, color: T.bg0, background: c,
              borderRadius: 6, padding: "3px 8px" }}>{String(i + 1).padStart(2, "0")}</span>
            {/* 26px SANS ≈ 13/char → 1220px ≈ 93 chars */}
            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: T.text, lineHeight: 1.2 }}>{it}</span>
          </div>
        );
      })}
      {closer ? (
        <div style={{ position: "absolute", left: 260, right: 260, top: 812, textAlign: "center",
          fontFamily: SANS, fontStyle: "italic", fontWeight: 700, fontSize: 34, color,
          textShadow: `0 0 ${24 + Math.sin(frame * 0.06) * 10}px ${mix(T.bg0, color, 0.6)}`,
          opacity: p(0.8, 0.92), lineHeight: 1.24 }}>{closer}</div>
      ) : null}
    </Stage>
  );
};

// =====================================================================================
// 12. END — the final card of the whole series
// =====================================================================================
const EndScene: React.FC<{ dur?: number; items?: string[]; closer?: string; ats?: number[] }> = ({
  dur, items = [], closer = "", ats,
}) => {
  const frame = useCurrentFrame();
  const p = useP(dur);
  const pop = usePop(dur);
  return (
    <Stage>
      {Array.from({ length: 8 }).map((_, i) => {
        const ang = (i / 8) * Math.PI * 2 + frame * 0.004;
        const x = 960 + Math.cos(ang) * 780, y = 540 + Math.sin(ang) * 420;
        const c = CYC[i % CYC.length];
        return (
          <div key={i} style={{ position: "absolute", left: x - 6, top: y - 6, width: 12, height: 12, borderRadius: 12,
            background: c, opacity: 0.35 + Math.sin(frame * 0.05 + i) * 0.25, boxShadow: `0 0 16px ${c}` }} />
        );
      })}
      <div style={{ position: "absolute", left: 260, right: 260, top: 176, textAlign: "center",
        transform: `scale(${0.95 + pop(0.02) * 0.05})` }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 9, color: A.src, opacity: p(0.02, 0.1) }}>
          THE WHOLE MAP · 100 ARTICLES · 8 THEMES
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 62, color: T.text, letterSpacing: -1.8,
          marginTop: 16, opacity: p(0.06, 0.16) }}>Applied AI on X, in one breath</div>
      </div>
      {items.slice(0, 8).map((it, i) => {
        const at = ats?.[i] ?? 0.14 + i * 0.075;   // build.py derives ats from the real cues
        const o = p(at, at + 0.06);
        const c = CYC[i % CYC.length];
        return (
          <div key={i} style={{
            position: "absolute", left: 300, top: 320 + i * 62, width: 1320, height: 54, boxSizing: "border-box",
            borderLeft: `5px solid ${c}`, background: mix(T.panel, c, 0.06), borderRadius: "0 12px 12px 0",
            display: "flex", alignItems: "center", gap: 16, padding: "0 20px",
            opacity: o, transform: `translateX(${(1 - o) * 22}px)`,
          }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 19, color: T.bg0, background: c,
              borderRadius: 6, padding: "3px 8px" }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 25, color: T.text, lineHeight: 1.2 }}>{it}</span>
          </div>
        );
      })}
      {/* 790, not 838: a 2-line closer at 838 reached y≈928 and crowded the caption band */}
      <div style={{ position: "absolute", left: 260, right: 260, top: 790, textAlign: "center",
        fontFamily: SANS, fontStyle: "italic", fontWeight: 700, fontSize: 36, color: A.main,
        textShadow: `0 0 ${26 + Math.sin(frame * 0.06) * 12}px ${mix(T.bg0, A.main, 0.6)}`,
        opacity: p(0.8, 0.92), lineHeight: 1.24 }}>{closer}</div>
    </Stage>
  );
};

// =====================================================================================
export const XAScene: React.FC<{ variant: string;[key: string]: unknown }> = ({ variant, ...rest }) => {
  let content: React.ReactNode;
  let accent = (rest as { color?: string }).color || A.main;
  const isArticle = ["xa_article", "xa_roadmap", "xa_stack", "xa_flow", "xa_compare", "xa_roster", "xa_metric"]
    .includes(variant);
  switch (variant) {
    case "xa_title": content = <TitleScene {...(rest as any)} />; accent = A.main; break;
    case "xa_divider": content = <DividerScene {...(rest as any)} />; break;
    case "xa_chintro": content = <ChIntroScene {...(rest as any)} />; break;
    case "xa_article": content = <ArticleScene {...(rest as any)} />; break;
    case "xa_roadmap": content = <RoadmapScene {...(rest as any)} />; break;
    case "xa_stack": content = <StackScene {...(rest as any)} />; break;
    case "xa_flow": content = <FlowScene {...(rest as any)} />; break;
    case "xa_compare": content = <CompareScene {...(rest as any)} />; break;
    case "xa_roster": content = <RosterScene {...(rest as any)} />; break;
    case "xa_metric": content = <MetricScene {...(rest as any)} />; break;
    case "xa_recap": content = <RecapScene {...(rest as any)} />; break;
    case "xa_end": content = <EndScene {...(rest as any)} />; break;
    default: content = <TitleScene {...(rest as any)} />; break;
  }
  return (
    <AbsoluteFill>
      <Bg theme={T} accent={accent} />
      {isArticle && <FeedRail accent={accent} dur={(rest as any).dur} />}
      {content}
      <SceneProgress accent={accent} dur={(rest as any).dur} />
    </AbsoluteFill>
  );
};

export default XAScene;
