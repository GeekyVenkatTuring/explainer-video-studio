/**
 * GTScenes.tsx — router for "The GTT Buy-Schedule, Explained" (prefix `gt`).
 *
 * IDENTITY: trading terminal (see gt/kit.tsx). The chart is the stage; cards annotate it.
 * Scene files (one owner each, no shared files):
 *   gt/core.tsx    — Title, Hook, Divider, Recap                       (Claude)
 *   gt/gtt.tsx     — OrderTypes, GTTMech, Trigger, OCO                  (Claude)
 *   gt/chart.tsx   — AllAtOnce, TwoLegs, DMA, Legs, StopTarget         (Claude)
 *   gt/worked.tsx  — HAL, Syrma                                        (Claude)
 *   gt/rsi.tsx     — RSI reprise                                       (Codex)
 *   gt/plan.tsx    — RR, Sizing, Schedule, Kite                        (Codex)
 *
 * This file only routes variant → component and wraps each in <TermBg>. Scenes must NOT
 * add their own background. Author on the 1920×1080 Stage (skills/09).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { TermBg, A } from "./gt/kit";
import { TitleScene, HookScene, DividerScene, RecapScene } from "./gt/core";
import { OrderTypesScene, GTTMechScene, OrderbookScene, TriggerScene, OCOScene } from "./gt/gtt";
import { AllAtOnceScene, TwoLegsScene, DMAScene, LegsScene, StopTargetScene } from "./gt/chart";
import { HALScene, SyrmaScene, DixonScene } from "./gt/worked";
import { RSIScene, RSIReadScene } from "./gt/rsi";
import { RRScene, ValuationScene, SizingScene, ScheduleScene, KiteScene, MistakesScene } from "./gt/plan";

const MAP: Record<string, { C: React.FC<any>; accent: string }> = {
  gt_title:       { C: TitleScene,      accent: A.main },
  gt_hook:        { C: HookScene,       accent: A.main },
  gt_divider:     { C: DividerScene,    accent: A.main },
  gt_recap:       { C: RecapScene,      accent: A.main },
  // order types (cyan)
  gt_ordertypes:  { C: OrderTypesScene, accent: A.main },
  gt_gttmech:     { C: GTTMechScene,    accent: A.main },
  gt_orderbook:   { C: OrderbookScene,  accent: A.main },
  gt_trigger:     { C: TriggerScene,    accent: A.trig },
  gt_oco:         { C: OCOScene,        accent: A.tgt },
  // stagger + anchoring (green / amber)
  gt_allatonce:   { C: AllAtOnceScene,  accent: A.buy },
  gt_twolegs:     { C: TwoLegsScene,    accent: A.buy },
  gt_dma:         { C: DMAScene,        accent: A.d50 },
  gt_rsi:         { C: RSIScene,        accent: A.trig },
  gt_rsiread:     { C: RSIReadScene,    accent: A.trig },
  gt_legs:        { C: LegsScene,       accent: A.buy },
  gt_stoptarget:  { C: StopTargetScene, accent: A.tgt },
  gt_rr:          { C: RRScene,         accent: A.main },
  gt_valuation:   { C: ValuationScene,  accent: A.d200 },
  gt_sizing:      { C: SizingScene,     accent: A.buy },
  // in action
  gt_hal:         { C: HALScene,        accent: A.main },
  gt_syrma:       { C: SyrmaScene,      accent: A.trig },
  gt_dixon:       { C: DixonScene,      accent: A.buy },
  gt_schedule:    { C: ScheduleScene,   accent: A.main },
  gt_kite:        { C: KiteScene,       accent: A.main },
  gt_mistakes:    { C: MistakesScene,   accent: A.stop },
};

export const GTScene: React.FC<{ variant: string; [k: string]: unknown }> = ({ variant, ...rest }) => {
  const entry = MAP[variant] || MAP.gt_title;
  const { C, accent } = entry;
  const bgAccent = (rest.color as string) || accent;
  return (
    <AbsoluteFill>
      <TermBg accent={bgAccent} />
      <C {...(rest as any)} />
    </AbsoluteFill>
  );
};

export default GTScene;
