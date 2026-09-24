/**
 * MoneyHabit.tsx — a "real humans" explainer: stock human footage (OffthreadVideo)
 * as the base layer, with studio kinetic-type overlays + motif + progress bar on top.
 * One composition, one render. Driven by a props JSON (public/mh/plan.json shape),
 * passed at render time via --props.
 *
 * Every reveal phases off the beat's own length (narration-driven), per the repo contract.
 */
import React from "react";
import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile,
  interpolate, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { SANS, CL, mix } from "./lib/primitives";

const INK = "#060a14";
const TEXT = "#f8fafc";
const MUTED = "#9fb0c8";
const ACCENTS: Record<string, string> = {
  green: "#34d399", amber: "#fbbf24", red: "#f87171", blue: "#60a5fa",
};

export type MHBeat = {
  clip: string;          // staticFile path, e.g. "mh/hook.mp4"
  clipStart?: number;    // seconds into the source clip to start from
  in: number;            // beat start (seconds, on the timeline)
  out: number;           // beat end (seconds)
  kicker: string;        // small uppercase label
  head: string;          // headline; wrap the emphasis word in *stars* -> accent color
  sub?: string;          // supporting line
  accent?: keyof typeof ACCENTS;
  center?: boolean;      // center the text block (title / CTA)
  panX?: number;         // ken-burns horizontal drift direction (-1..1)
};

export type MoneyHabitProps = {
  audioSrc: string;      // "mh/narration.mp3"
  beats: MHBeat[];
};

const FPS = 30;
const OV = 10; // crossfade overlap frames

/** Emphasis parser: "*flip* it" -> colored "flip" + normal " it". */
const Head: React.FC<{ text: string; accent: string; size: number }> = ({ text, accent, size }) => {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, color: TEXT, lineHeight: 1.04, letterSpacing: -0.5 }}>
      {parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*")
          ? <span key={i} style={{ color: accent }}>{p.slice(1, -1)}</span>
          : <span key={i}>{p}</span>
      )}
    </div>
  );
};

/** Recurring motif: a rupee coin with an auto up-arrow, gently pulsing. */
const Motif: React.FC<{ accent: string; o: number }> = ({ accent, o }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.06 * Math.sin(frame / 9);
  return (
    <div style={{ position: "absolute", right: 92, bottom: 300, opacity: o, transform: `scale(${pulse})` }}>
      <div style={{
        width: 92, height: 92, borderRadius: 92, border: `3px solid ${accent}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(6,10,20,0.35)", boxShadow: `0 0 26px ${accent}55`,
      }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: accent }}>₹</span>
      </div>
      <div style={{ position: "absolute", top: -14, right: -10, fontSize: 30, color: accent, transform: "rotate(-8deg)" }}>↑</div>
    </div>
  );
};

const Beat: React.FC<{ beat: MHBeat }> = ({ beat }) => {
  const frame = useCurrentFrame();               // local to this Sequence
  const { durationInFrames } = useVideoConfig();
  const len = durationInFrames;
  const accent = ACCENTS[beat.accent || "green"];

  // crossfade in/out
  const fade = interpolate(frame, [0, OV, len - OV, len], [0, 1, 1, 0], CL);

  // ken burns
  const z = interpolate(frame, [0, len], [1.06, 1.16], CL);
  const pan = (beat.panX ?? 0) * interpolate(frame, [0, len], [0, 26], CL);

  // text entrance (front-loaded, narration-driven)
  const te = interpolate(frame, [OV + 2, OV + 16], [0, 1], CL);
  const rise = (1 - te) * 34;
  // accent underline wipe
  const uw = interpolate(frame, [OV + 10, OV + 30], [0, 1], { ...CL, easing: Easing.out(Easing.cubic) });

  const blockStyle: React.CSSProperties = beat.center
    ? { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-end", textAlign: "center", padding: "0 160px 130px" }
    : { position: "absolute", left: 110, right: 480, bottom: 150 };

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      {/* base footage */}
      <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
        <OffthreadVideo
          src={staticFile(beat.clip)}
          startFrom={Math.round((beat.clipStart || 0) * FPS)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover",
            transform: `scale(${z}) translateX(${pan}px)` }}
        />
      </AbsoluteFill>
      {/* legibility scrim: vignette + bottom wash */}
      <AbsoluteFill style={{ background:
        "radial-gradient(120% 90% at 50% 40%, rgba(6,10,20,0) 40%, rgba(6,10,20,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: beat.center
        ? "linear-gradient(180deg, rgba(6,10,20,0.55) 0%, rgba(6,10,20,0.35) 50%, rgba(6,10,20,0.7) 100%)"
        : "linear-gradient(180deg, rgba(6,10,20,0) 42%, rgba(6,10,20,0.82) 100%)" }} />

      {/* text block */}
      <div style={{ ...blockStyle, opacity: te, transform: `translateY(${rise}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18,
          justifyContent: beat.center ? "center" : "flex-start" }}>
          <div style={{ width: 30, height: 4, borderRadius: 4, background: accent }} />
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 3,
            color: accent, textTransform: "uppercase" }}>{beat.kicker}</div>
        </div>
        <Head text={beat.head} accent={accent} size={beat.center ? 108 : 84} />
        {/* underline wipe */}
        <div style={{ height: 5, marginTop: 20, borderRadius: 5, background: mix(accent, INK, 0.15),
          width: `${uw * (beat.center ? 44 : 62)}%`,
          marginLeft: beat.center ? "auto" : 0, marginRight: beat.center ? "auto" : 0 }} />
        {beat.sub && (
          <div style={{ marginTop: 22, fontFamily: SANS, fontWeight: 500, fontSize: 34, color: MUTED,
            maxWidth: beat.center ? 1100 : 900 }}>{beat.sub}</div>
        )}
      </div>

      {!beat.center && <Motif accent={accent} o={te} />}
    </AbsoluteFill>
  );
};

/** Bottom progress bar across the whole video. */
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], CL);
  return (
    <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 6, background: "rgba(255,255,255,0.08)" }}>
      <div style={{ height: "100%", width: `${p * 100}%`,
        background: "linear-gradient(90deg,#34d399,#fbbf24)" }} />
    </div>
  );
};

export const MoneyHabit: React.FC<MoneyHabitProps> = ({ audioSrc, beats }) => {
  return (
    <AbsoluteFill style={{ background: INK }}>
      {beats.map((b, i) => {
        const from = Math.round(b.in * FPS) - (i === 0 ? 0 : OV);
        const to = Math.round(b.out * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={to - from} layout="none">
            <Beat beat={b} />
          </Sequence>
        );
      })}
      <Progress />
      {audioSrc && <Audio src={staticFile(audioSrc)} />}
    </AbsoluteFill>
  );
};
