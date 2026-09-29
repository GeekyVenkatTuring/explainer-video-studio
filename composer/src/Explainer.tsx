/**
 * Explainer.tsx — generic timeline player + scene-set registry.
 *
 * A video is a props JSON (produced by the project's build.py) with:
 *   cuts:  [{ id, type, in_seconds, out_seconds, props: { dur, ... } }]
 *   audio: { narration: { src, volume } }   — path relative to public/
 *
 * `type` is "<prefix>_<variant>". The prefix routes to a scene set registered
 * in REGISTRY below. Adding a new video = one scene file + one REGISTRY line.
 * Every cut's props carry `dur` (the beat length in seconds) — scene sets use
 * useP(dur) so animation spans the whole narration. See skills/03-animation.md.
 */
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { DemoScene } from "./scenes/DemoScenes";
import { GDScene } from "./scenes/GDScenes";
import { LLMScene } from "./scenes/LLMScenes";
import { CVScene } from "./scenes/CVScenes";
import { EMScene } from "./scenes/EMScenes";
import { CCScene } from "./scenes/CCScenes";
import { SMScene } from "./scenes/SMScenes";
import { EQScene } from "./scenes/EQScenes";
import { TTScene } from "./scenes/TTScenes";
import { TACScene } from "./scenes/TACScenes";
import { INScene } from "./scenes/INScenes";
import { IAScene } from "./scenes/IAScenes";
import { PEScene } from "./scenes/PEScenes";
import { DIPScene } from "./scenes/DIPScenes";
import { ITScene } from "./scenes/ITScenes";
import { DPScene } from "./scenes/DPScenes";
import { LBRScene } from "./scenes/LBRScenes";
import { BIZScene } from "./scenes/BIZScenes";
import { GPUScene } from "./scenes/GPUScenes";
import { GIScene } from "./scenes/GIScenes";
import { GWScene } from "./scenes/GWScenes";
import { IDMScene } from "./scenes/IDMScenes";
import { AUScene } from "./scenes/AUScenes";
import { KGScene } from "./scenes/KGScenes";
import { SMLScene } from "./scenes/SMLScenes";
import { AITScene } from "./scenes/AITScenes";
import { FAScene } from "./scenes/FAScenes";
import { NBScene } from "./scenes/NBScenes";
import { SolScene } from "./scenes/SolarScenes";
import { LagScene } from "./scenes/LagotScenes";
import { LJScene } from "./scenes/LJScenes";
import { PMScene } from "./scenes/PMScenes";
import { AgenticEngineeringScene } from "./scenes/AgenticEngineeringScenes";
import { TAWScene } from "./scenes/TAWScenes";
import { MC5Scene } from "./scenes/MC5Scenes";
import { FQScene } from "./scenes/FQScenes";
import { GTScene } from "./scenes/GTScenes";
import { PGScene } from "./scenes/PGScenes";
import { MWScene } from "./scenes/MWScenes";
import { DTAScene } from "./scenes/DTAScenes";
import { DAScene } from "./scenes/DAScenes";
import { HFScene } from "./scenes/HFScenes";
import { XAScene } from "./scenes/XAScenes";
import { GHAScene } from "./scenes/GHAScenes";
import { Captions, Cue } from "./Captions";

// ---- scene-set registry: prefix -> component taking { variant, ...props }
const REGISTRY: Record<string, React.FC<{ variant: string;[key: string]: unknown }>> = {
  demo: DemoScene,
  gd: GDScene,
  llm: LLMScene,
  cv: CVScene,
  em: EMScene,
  cc: CCScene,
  sm: SMScene,
  eq: EQScene,
  tt: TTScene,
  tac: TACScene,
  in: INScene,
  ia: IAScene,
  pe: PEScene,
  dip: DIPScene,
  it: ITScene,
  dp: DPScene,
  lbr: LBRScene,
  biz: BIZScene,
  gpu: GPUScene,
  gi: GIScene,
  gw: GWScene,
  idm: IDMScene,
  au: AUScene,
  kg: KGScene,
  sml: SMLScene,
  ait: AITScene,
  fa: FAScene,
  nb: NBScene,
  sol: SolScene,
  lag: LagScene,
  lj: LJScene,
  pm: PMScene,
  aae: AgenticEngineeringScene,
  taw: TAWScene,
  mc5: MC5Scene,
  fq: FQScene,
  gt: GTScene,
  pg: PGScene,
  mw: MWScene,
  dta: DTAScene,
  da: DAScene,
  hf: HFScene,
  xa: XAScene,
  gha: GHAScene,
  // e.g.  ft: FTScene,  — one line per video
};

export interface Cut {
  id: string;
  type: string;
  in_seconds: number;
  out_seconds: number;
  props?: Record<string, unknown>;
}

export interface ExplainerProps {
  cuts?: Cut[];
  audio?: { narration?: { src: string; volume?: number } };
  captions?: Cue[];
  [key: string]: unknown;
}

const Fallback: React.FC<{ type: string }> = ({ type }) => (
  <AbsoluteFill style={{ background: "#200", alignItems: "center", justifyContent: "center" }}>
    <div style={{ color: "#f88", fontFamily: "monospace", fontSize: 40 }}>
      no scene set registered for cut type “{type}”
    </div>
  </AbsoluteFill>
);

export const Explainer: React.FC<ExplainerProps> = ({ cuts = [], audio, captions }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cuts.map((cut) => {
        const from = Math.round(cut.in_seconds * fps);
        const durF = Math.max(1, Math.round((cut.out_seconds - cut.in_seconds) * fps));
        const prefix = cut.type.split("_")[0];
        const SceneSet = REGISTRY[prefix];
        return (
          <Sequence key={cut.id} from={from} durationInFrames={durF} name={cut.id}>
            {SceneSet ? <SceneSet variant={cut.type} {...(cut.props || {})} /> : <Fallback type={cut.type} />}
          </Sequence>
        );
      })}
      {/* burned-in Telugu captions (build.py emits `captions` cues; empty = off) */}
      {captions && captions.length > 0 && <Captions cues={captions} />}
      {audio?.narration?.src && (
        <Audio src={staticFile(audio.narration.src)} volume={audio.narration.volume ?? 1} />
      )}
    </AbsoluteFill>
  );
};
