#!/usr/bin/env python3
"""Render one QA still per scene at ~55% through its cut, straight from the real
edit_decisions.json (real durations). Output PNGs to codex/stills/<id>.png.
Run from the repo root; it cd's into composer/ for each `npx remotion still`.
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.abspath(__file__))            # .../projects/gtt-buying-en/codex
PROJ = os.path.dirname(ROOT)                                 # .../projects/gtt-buying-en
REPO = os.path.abspath(os.path.join(PROJ, "..", ".."))
COMPOSER = os.path.join(REPO, "composer")
PROPS = os.path.join(PROJ, "artifacts", "edit_decisions.json")
OUT = os.path.join(ROOT, "stills")
os.makedirs(OUT, exist_ok=True)

cuts = json.load(open(PROPS))["cuts"]
only = set(sys.argv[1:])  # optional: pass scene ids to render just those
FPS = 30
for c in cuts:
    if only and c["id"] not in only:
        continue
    frac = 0.55
    t = c["in_seconds"] + frac * (c["out_seconds"] - c["in_seconds"])
    frame = round(t * FPS)
    outpng = os.path.join(OUT, f"{c['id']}_{c['type']}.png")
    print(f"still {c['id']:6s} {c['type']:16s} frame={frame}", flush=True)
    r = subprocess.run(
        ["npx", "remotion", "still", "Explainer", outpng, f"--props={PROPS}", f"--frame={frame}"],
        cwd=COMPOSER, capture_output=True, text=True)
    if r.returncode != 0:
        print("  ERROR:", r.stderr[-800:], flush=True)
        break
print("done ->", OUT)
