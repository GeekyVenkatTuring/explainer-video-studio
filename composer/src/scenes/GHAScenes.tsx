/**
 * GHAScenes.tsx — router for "GitHub Actions, Explained" (prefix `gha`).
 * Scenes live in ./gha/* (core identity, generic, intro, runners, data, ship, platform).
 * Every scene sits on the animated Bg and gets a SceneProgress bar (never a frozen frame).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bg } from "../lib/primitives";
import { T, A, SceneProgress } from "./gha/core";
import { TitleScene, RoadmapScene, Divider, YamlScene, CompareScene, BulletsScene, RecapScene } from "./gha/generic";
import { ManualScene, TimelineScene, CicdScene, HierarchyScene, StepsScene, LifecycleScene, RunLogScene } from "./gha/intro";
import { EventsScene, FilterScene, CronScene, DispatchScene, HostedScene, SelfHostedScene, DagScene, MatrixScene, ServicesScene } from "./gha/runners";
import { MarketplaceScene, ActionTypesScene, ReuseScene, ExprScene, SecretsScene, OutputsScene, CacheScene } from "./gha/data";
import { PipelineScene, ConcurrencyScene, OidcScene, PermissionsScene, SupplyScene, InjectionScene } from "./gha/ship";
import { BillingScene, SpeedScene, DebugScene, BeyondScene, PlatformScene, PrScene, IssuesScene, CodespacesScene, CopilotScene, GhasScene } from "./gha/platform";

const MAP: Record<string, [React.FC<any>, string]> = {
  gha_title: [TitleScene, A.run], gha_roadmap: [RoadmapScene, A.run], gha_divider: [Divider, A.run],
  gha_yaml: [YamlScene, A.act], gha_compare: [CompareScene, A.run], gha_bullets: [BulletsScene, A.ok], gha_recap: [RecapScene, A.ok],
  gha_manual: [ManualScene, A.evt], gha_timeline: [TimelineScene, A.run], gha_cicd: [CicdScene, A.run], gha_hierarchy: [HierarchyScene, A.run],
  gha_steps: [StepsScene, A.act], gha_lifecycle: [LifecycleScene, A.evt], gha_runlog: [RunLogScene, A.ok],
  gha_events: [EventsScene, A.evt], gha_filter: [FilterScene, A.evt], gha_cron: [CronScene, A.evt], gha_dispatch: [DispatchScene, A.evt],
  gha_hosted: [HostedScene, A.run], gha_selfhosted: [SelfHostedScene, A.run], gha_dag: [DagScene, A.run], gha_matrix: [MatrixScene, A.run], gha_services: [ServicesScene, A.run],
  gha_marketplace: [MarketplaceScene, A.act], gha_actiontypes: [ActionTypesScene, A.act], gha_reuse: [ReuseScene, A.act],
  gha_expr: [ExprScene, A.act], gha_secrets: [SecretsScene, A.act], gha_outputs: [OutputsScene, A.act], gha_cache: [CacheScene, A.act],
  gha_pipeline: [PipelineScene, A.ok], gha_concurrency: [ConcurrencyScene, A.ok], gha_oidc: [OidcScene, A.ok],
  gha_permissions: [PermissionsScene, A.bad], gha_supply: [SupplyScene, A.bad], gha_injection: [InjectionScene, A.bad],
  gha_billing: [BillingScene, A.evt], gha_speed: [SpeedScene, A.evt], gha_debug: [DebugScene, A.bad], gha_beyond: [BeyondScene, A.evt],
  gha_platform: [PlatformScene, A.ok], gha_pr: [PrScene, A.run], gha_issues: [IssuesScene, A.evt], gha_codespaces: [CodespacesScene, A.act],
  gha_copilot: [CopilotScene, A.act], gha_ghas: [GhasScene, A.bad],
};

export const GHAScene: React.FC<{ variant: string;[key: string]: unknown }> = ({ variant, ...rest }) => {
  const [Comp, base] = MAP[variant] || MAP.gha_title;
  const accent = (rest as any).color || base;
  return (
    <AbsoluteFill>
      <Bg theme={T} accent={accent} />
      <Comp {...(rest as any)} />
      <SceneProgress accent={accent} dur={(rest as any).dur} />
    </AbsoluteFill>
  );
};

export default GHAScene;
