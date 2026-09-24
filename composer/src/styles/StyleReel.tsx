/**
 * StyleReel — renders a beat list with ONE style pack, using @remotion/transitions between
 * scenes (no more hard cuts). Props: { pack, beats:[{id,kind,dur}], captions, audio }.
 *
 * Timing: every sequence except the last is extended by T frames and followed by a T-frame
 * transition, so scene k still ENTERS exactly when its narration starts and the outgoing
 * scene dissolves over the first T frames — total length == sum of beats (audio stays synced).
 */
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { Stage } from "../lib/primitives";
import { PackCaptions, Kind, Cue, Meta } from "./core";
import { PACKS } from "./registry";

export interface StyleReelProps {
  pack?: string;
  beats?: { id: string; kind: Kind; dur: number; props?: Record<string, unknown> }[];
  captions?: Cue[];
  audio?: string;
  /** show a "STYLE: <name>" tag for the first 3s (sampler reels) */
  label?: boolean;
  /** masthead / title-block text: { brand, project, issue } */
  meta?: Meta;
  [k: string]: unknown;
}

export const StyleReel: React.FC<StyleReelProps> = ({ pack = "editorial", beats = [], captions = [], audio, label, meta = {} }) => {
  const P = PACKS[pack] ?? PACKS.editorial;
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const T = P.transitionFrames;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <TransitionSeries>
        {beats.map((b, i) => {
          const Scene = P.scenes[b.kind] ?? (() => null);
          const len = Math.round(b.dur * fps) + (i < beats.length - 1 ? T : 0);
          return (
            <React.Fragment key={b.id}>
              {i > 0 && <TransitionSeries.Transition presentation={P.transition(i)} timing={linearTiming({ durationInFrames: T })} />}
              <TransitionSeries.Sequence durationInFrames={len}>
                <AbsoluteFill>
                  <Stage><P.Background beat={i} kind={b.kind} total={beats.length} meta={meta} dur={b.dur} /><Scene total={beats.length} {...(b.props || {})} dur={b.dur} beat={i} /></Stage>
                </AbsoluteFill>
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>
      {label && (
        <Stage>
          <div style={{ position: "absolute", left: 0, right: 0, top: 128, display: "flex", justifyContent: "center", opacity: Math.max(0, Math.min(1, frame / 8, (95 - frame) / 12)) }}>
            <div style={{ padding: "10px 26px", borderRadius: 999, background: "rgba(0,0,0,0.78)", color: "#fff", fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: 4 }}>STYLE · {P.name.toUpperCase()}</div>
          </div>
        </Stage>
      )}
      <Stage><PackCaptions cues={captions} t={frame / fps} s={P.caption} /></Stage>
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
