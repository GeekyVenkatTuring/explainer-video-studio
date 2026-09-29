// QA stills (skills/06): bundle the composer ONCE, then render one still per scene for each IPO.
// Frames: each cut at p≈0.72 (most reveals landed, continuous motion visible) plus optional extra
// fractions (e.g. 0.2 for A/V-sync checks). Usage: node qa_stills.mjs key[,key..] [frac,frac..]
import { createRequire } from "module";
import path from "path";
import fs from "fs";
const COMPOSER = "/Users/appuram/Developer/explainer-forge/composer";
const require = createRequire(path.join(COMPOSER, "package.json"));
const { bundle } = require("@remotion/bundler");
const { selectComposition, renderStill } = require("@remotion/renderer");

const keys = (process.argv[2] || "").split(",").filter(Boolean);
const fracs = (process.argv[3] || "0.72").split(",").map(Number);
const serveUrl = await bundle({ entryPoint: path.join(COMPOSER, "src", "index.ts"), publicDir: path.join(COMPOSER, "public") });
for (const key of keys) {
  const P = `/Users/appuram/Developer/explainer-forge/projects/ipo-28sep-${key}`;
  const inputProps = JSON.parse(fs.readFileSync(`${P}/artifacts/${key}.json`, "utf8"));
  const composition = await selectComposition({ serveUrl, id: "Explainer", inputProps });
  fs.mkdirSync(`${P}/qa`, { recursive: true });
  for (const c of inputProps.cuts) {
    for (const f of fracs) {
      const frame = Math.round((c.in_seconds + f * (c.out_seconds - c.in_seconds)) * 30);
      const out = `${P}/qa/${c.id}_${String(Math.round(f * 100)).padStart(2, "0")}.png`;
      await renderStill({ composition, serveUrl, output: out, frame, inputProps, imageFormat: "png" });
      console.log("OK", out, "frame", frame);
    }
  }
}
