#!/usr/bin/env python3
"""Render the 7 deep IPO chapters and stage them to ~/Downloads/generated_videos/.
Usage: python3 render_deep.py [ch ...]
"""
import json, os, subprocess, sys, shutil
ROOT = os.path.dirname(os.path.abspath(__file__))
COMPOSER = os.path.abspath(os.path.join(ROOT, "..", "..", "composer"))
RENDERS = os.path.join(ROOT, "renders")
DELIVER = os.path.expanduser("~/Downloads/generated_videos")
os.makedirs(RENDERS, exist_ok=True); os.makedirs(DELIVER, exist_ok=True)
NAMES = {
 "esds":"esds-software-solution-ipo","lumino":"lumino-industries-ipo",
 "purple":"purple-style-labs-ipo","priority":"priority-jewels-ipo",
 "rays":"rays-of-belief-ipo","deepa":"deepa-jewellers-ipo",
 "kwick":"kwick-forensic-solutions-ipo",
}
chs = sys.argv[1:] or list(NAMES)
for ch in chs:
    art = os.path.join(ROOT, "artifacts", f"{ch}.json")
    out = os.path.join(RENDERS, f"{ch}.mp4")
    print(f"=== rendering {ch} ===", flush=True)
    r = subprocess.run(["npx","remotion","render","Explainer",out,
                        f"--props={art}","--concurrency=3","--timeout=90000"],
                       cwd=COMPOSER)
    if r.returncode!=0 or not os.path.exists(out):
        print(f"RENDER FAILED: {ch}"); continue
    dst = os.path.join(DELIVER, f"{NAMES[ch]}.mp4")
    shutil.copy2(out, dst)
    dur = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                          "-of","default=noprint_wrappers=1:nokey=1",out],
                         capture_output=True,text=True).stdout.strip()
    print(f"DELIVERED {ch} -> {dst}  ({float(dur)/60:.2f} min)", flush=True)
