/**
 * FQScenes.tsx — router for the "Read a Portfolio Like a Quant" video (prefix `fq`).
 * Teaches fundamentals + technicals from scratch on a real portfolio. Scenes live in fq/:
 *   core.tsx (Claude) · fund.tsx (Cursor) · tech.tsx (Codex) · apply.tsx (Claude).
 * This file only routes variant → component and wraps in <Bg>. See VIDEO_SPEC.md.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg } from "../lib/primitives";
import { T, A } from "./fq/kit";
import { TitleScene, LensesScene, DividerScene, RecapScene } from "./fq/core";
import { ShareScene, PEScene, PBScene, ROEScene, DebtScene, GrowthScene, ApplyFAScene } from "./fq/fund";
import { ChartScene, DMAScene, RSIScene, VolBetaScene, W52Scene, ApplyTAScene } from "./fq/tech";
import { ScoreScene, ConcentrationScene, FunnelScene, PicksScene, TargetsScene, ValuationScene, GTTScene } from "./fq/apply";
import { PickDetailScene } from "./fq/pickdetail";

const MAP: Record<string, { C: React.FC<any>; accent: string }> = {
  fq_title:        { C: TitleScene,        accent: A.main },
  fq_lenses:       { C: LensesScene,       accent: A.main },
  fq_divider:      { C: DividerScene,      accent: A.main },
  fq_recap:        { C: RecapScene,        accent: A.main },
  // fundamentals (green)
  fq_share:        { C: ShareScene,        accent: A.fund },
  fq_pe:           { C: PEScene,           accent: A.fund },
  fq_pb:           { C: PBScene,           accent: A.fund },
  fq_roe:          { C: ROEScene,          accent: A.fund },
  fq_debt:         { C: DebtScene,         accent: A.fund },
  fq_growth:       { C: GrowthScene,       accent: A.fund },
  fq_apply_fa:     { C: ApplyFAScene,      accent: A.fund },
  // technicals (amber)
  fq_chart:        { C: ChartScene,        accent: A.tech },
  fq_dma:          { C: DMAScene,          accent: A.tech },
  fq_rsi:          { C: RSIScene,          accent: A.tech },
  fq_volbeta:      { C: VolBetaScene,      accent: A.tech },
  fq_52w:          { C: W52Scene,          accent: A.tech },
  fq_apply_ta:     { C: ApplyTAScene,      accent: A.tech },
  // application
  fq_score:        { C: ScoreScene,        accent: A.main },
  fq_concentration:{ C: ConcentrationScene,accent: A.risk },
  fq_funnel:       { C: FunnelScene,       accent: A.main },
  fq_picks:        { C: PicksScene,        accent: A.fund },
  fq_pickdetail:   { C: PickDetailScene,   accent: A.main },
  fq_targets:      { C: TargetsScene,      accent: A.val },
  fq_valuation:    { C: ValuationScene,    accent: A.val },
  fq_gtt:          { C: GTTScene,          accent: A.tech },
};

export const FQScene: React.FC<{ variant: string; [k: string]: unknown }> = ({ variant, ...rest }) => {
  const entry = MAP[variant] || MAP.fq_title;
  const { C, accent } = entry;
  // dividers carry their own color prop; else use the scene's semantic accent
  const bgAccent = (rest.color as string) || accent;
  return (
    <AbsoluteFill>
      <Bg theme={T} accent={bgAccent} />
      <C {...(rest as any)} />
    </AbsoluteFill>
  );
};

export default FQScene;
