#!/usr/bin/env python3
"""Render one mid-animation still per scene into qa/<id>.png (QA rule 5)."""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
ED = os.path.join(ROOT, "artifacts", "edit_decisions.json")
QA = os.path.join(ROOT, "qa"); os.makedirs(QA, exist_ok=True)
data = json.load(open(ED))
cuts = data["cuts"]
FPS = 30
only = sys.argv[1:] if len(sys.argv) > 1 else None
for c in cuts:
    cid, typ = c["id"], c["type"]
    if only and cid not in only and typ not in only:
        continue
    mid = int(((c["in_seconds"] + c["out_seconds"]) / 2) * FPS)
    out = os.path.join(QA, f"{cid}_{typ}.png")
    print(f"still {cid} {typ} @frame {mid} ...", flush=True)
    subprocess.run(
        ["npx", "remotion", "still", "Explainer", out,
         f"--frame={mid}", f"--props={ED}", "--log=error"],
        cwd=os.path.join(REPO, "composer"), check=True)
print("QA stills done ->", QA)
