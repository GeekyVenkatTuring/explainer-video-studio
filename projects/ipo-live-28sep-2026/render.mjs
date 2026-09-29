// Bundle once with a SLIM public dir (hardlinked narration WAVs only — the full composer/public is 2.9 GB
// and filled the disk when copied into the bundle), then render each key. Usage: node render.mjs key[,key..]
import { createRequire } from "module";
import path from "path";
import fs from "fs";
const COMPOSER = "/Users/appuram/Developer/explainer-forge/composer";
const require = createRequire(path.join(COMPOSER, "package.json"));
const { bundle } = require("@remotion/bundler");
const { selectComposition, renderMedia } = require("@remotion/renderer");
const keys = process.argv[2].split(",");
const slim = `/Users/appuram/Developer/explainer-forge/projects/ipo-live-28sep-2026/slim_public_${process.argv[3] || "render"}`;
fs.mkdirSync(`${slim}/ipo28`, { recursive: true });
for (const k of keys) { const dst = `${slim}/ipo28/${k}.wav`; if (fs.existsSync(dst)) fs.unlinkSync(dst); fs.linkSync(`${COMPOSER}/public/ipo28/${k}.wav`, dst); }
const serveUrl = await bundle({ entryPoint: path.join(COMPOSER, "src", "index.ts"), publicDir: slim });
try {
  for (const key of keys) {
    const P = `/Users/appuram/Developer/explainer-forge/projects/ipo-28sep-${key}`;
    const inputProps = JSON.parse(fs.readFileSync(`${P}/artifacts/${key}.json`, "utf8"));
    const composition = await selectComposition({ serveUrl, id: "Explainer", inputProps });
    const mode = process.argv[3] || "render";
    if (mode === "stills") {
      const { renderStill } = require("@remotion/renderer");
      for (const c of inputProps.cuts) {
        const frame = Math.round((c.in_seconds + 0.72 * (c.out_seconds - c.in_seconds)) * 30);
        await renderStill({ composition, serveUrl, output: `${P}/qa/${c.id}_72.png`, frame, inputProps });
      }
      console.log("STILLS", key); continue;
    }
    let last = -1;
    await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: `${P}/renders/${key}.mp4`, inputProps, concurrency: 4,
      timeoutInMilliseconds: 120000,
      onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`${key} ${p * 10}%`); } } });
    console.log("RENDERED", key);
  }
} finally { fs.rmSync(serveUrl, { recursive: true, force: true }); }
