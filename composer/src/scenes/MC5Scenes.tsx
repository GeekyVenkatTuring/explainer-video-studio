/**
 * MC5Scenes.tsx — "5 Mid & Small-Caps to Watch" (prefix `mc5`).
 *
 * This video reuses the proven NBScenes ("50 to Beat the Nifty") scene set — a
 * scoreboard identity built for exactly this shape (per-stock scorecard, alpha
 * chart, honest disclaimer foot). Rather than duplicate ~470 lines, this is a thin
 * router that remaps `mc5_*` variants to `nb_*` and delegates to NBScene, so the
 * gold-tested layout/animation code is shared verbatim while this video keeps its
 * own narration path (composer/public/mc5/) and REGISTRY entry.
 *
 * Honesty (skills/12): every metric is real, verified on live Zerodha/Kite broker
 * data (28-Aug-2026 close); the alpha chart is SCHEMATIC (labelled), never a price
 * forecast; the target for a 2x is explicitly framed as a top-decile tail, not a
 * base case. Numbers arrive via props from projects/midcap5-picks-en/build.py.
 */
import React from "react";
import { NBScene } from "./NBScenes";

export const MC5Scene: React.FC<{ variant: string; [k: string]: unknown }> = ({ variant, ...props }) => {
  const v = variant.replace(/^mc5_/, "nb_");
  return <NBScene variant={v} {...props} />;
};
