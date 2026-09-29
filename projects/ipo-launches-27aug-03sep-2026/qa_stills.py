#!/usr/bin/env python3
"""Render one mid-animation still per scene for each chapter (QA rule 5).
Frame is taken at ~72% through each cut so counters land near final values.
Usage: python3 qa_stills.py [ch ...]
"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
COMPOSER = os.path.abspath(os.path.join(ROOT, "..", "..", "composer"))
OUT = os.path.join(ROOT, "qa")
os.makedirs(OUT, exist_ok=True)
chs = sys.argv[1:] or ["esds","lumino","purple","priority","rays","deepa","kwick"]
for ch in chs:
    art = os.path.join(ROOT, "artifacts", f"{ch}.json")
    cuts = json.load(open(art))["cuts"]
    for c in cuts:
        f = round((c["in_seconds"] + 0.72*(c["out_seconds"]-c["in_seconds"]))*30)
        png = os.path.join(OUT, f"{ch}__{c['id']}.png")
        r = subprocess.run(["npx","remotion","still","Explainer",png,
                            f"--props={art}", f"--frame={f}"],
                           cwd=COMPOSER, capture_output=True, text=True)
        ok = "OK" if r.returncode==0 and os.path.exists(png) else "FAIL"
        print(f"{ok} {ch}__{c['id']} @f{f}", flush=True)
        if r.returncode!=0: print(r.stderr[-400:])
