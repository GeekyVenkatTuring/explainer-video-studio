// Style pack registry — add a pack = one import + one line. See styles/core.tsx for the contract.
// Each pack = its own sample scenes + the 8 generic prop-driven archetypes (packs/*-generic.tsx).
import type { StylePack } from "./core";
import { editorial } from "./packs/editorial";
import { blueprint } from "./packs/blueprint";
import { kinetic } from "./packs/kinetic";
import { editorialGeneric } from "./packs/editorial-generic";
import { blueprintGeneric } from "./packs/blueprint-generic";
import { blueprintX } from "./packs/blueprint-x";
import { kineticGeneric } from "./packs/kinetic-generic";
import { chalk } from "./packs/chalk";
import { studio } from "./packs/studio";
import { flat } from "./packs/flat";
import { paper } from "./packs/paper";
import { brutal } from "./packs/brutal";
import { isoPack } from "./packs/iso";
import { isoX } from "./packs/iso-x";
import { ledger } from "./packs/ledger";
import { ledgerX } from "./packs/ledger-x";

const withGeneric = (p: StylePack, g: StylePack["scenes"]): StylePack => ({ ...p, scenes: { ...p.scenes, ...g } });

export const PACKS: Record<string, StylePack> = {
  editorial: withGeneric(editorial, editorialGeneric),
  blueprint: withGeneric(blueprint, { ...blueprintGeneric, ...blueprintX }),
  kinetic: withGeneric(kinetic, kineticGeneric),
  chalk,   // implements the 8 generic archetypes natively
  studio,  // 3D — render with --gl=angle
  flat,    // Kurzgesagt-style flat vector
  paper,   // paper cutout, stop-motion
  brutal,  // neo-brutalist UI
  iso: withGeneric(isoPack, isoX), // isometric diagrams (2D SVG) + algorithm scenes
  ledger: withGeneric(ledger, ledgerX), // spreadsheet worksheet + agents-over-data scenes
};
