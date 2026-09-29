#!/usr/bin/env python3
"""Render one mid-animation still per ADEPT scene into qa_adept/<id>.png."""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
ED = os.path.join(ROOT, "artifacts", "edit_decisions_adept.json")
QA = os.path.join(ROOT, "qa_adept"); os.makedirs(QA, exist_ok=True)
cuts = json.load(open(ED))["cuts"]; FPS = 30
only = sys.argv[1:] or None
for c in cuts:
    if only and c["id"] not in only and c["type"] not in only: continue
    mid = int(((c["in_seconds"] + c["out_seconds"]) / 2) * FPS)
    out = os.path.join(QA, f"{c['id']}_{c['type']}.png")
    print(f"still {c['id']} {c['type']} @{mid} ...", flush=True)
    subprocess.run(["npx", "remotion", "still", "Explainer", out, f"--frame={mid}", f"--props={ED}", "--log=error"],
                   cwd=os.path.join(REPO, "composer"), check=True)
print("done ->", QA)
