#!/usr/bin/env python3
"""Render -> verify (ffprobe streams/duration + extracted frames) -> copy to ~/Downloads/generated_videos
-> verify the Downloads copy -> ONLY THEN delete this run's MP4 from the project renders/ folder.
Usage: python3 render_deliver.py key [key ...]"""
import json, os, shutil, subprocess, sys, hashlib
REPO = "/Users/appuram/Developer/explainer-forge"; COMPOSER = f"{REPO}/composer"
DELIVER = os.path.expanduser("~/Downloads/generated_videos"); os.makedirs(DELIVER, exist_ok=True)
SLUG = {"orient": "orient-cables-ipo", "moneyview": "moneyview-ipo", "aonesteel": "a-one-steels-ipo", "acevector": "acevector-snapdeal-ipo",
        "runwal": "runwal-enterprises-ipo", "german": "german-green-steel-ipo", "shah": "shah-investors-home-ipo", "srit": "srit-india-ipo",
        "benchmark": "bench-mark-infotech-sme-ipo", "himalayan": "himalayan-solar-sme-ipo", "greenasia": "green-asia-impex-sme-ipo",
        "peshwa": "peshwa-wheat-sme-ipo", "roopa": "roopa-screen-sme-ipo", "saiurja": "sai-urja-indo-ventures-sme-ipo",
        "pind": "pind-hospitality-sme-ipo", "shreetnb": "shree-tnb-polymers-sme-ipo"}

def probe(f):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height",
                        "-of", "json", f], capture_output=True, text=True)
    return json.loads(r.stdout)

def check(f, expect):
    j = probe(f); st = {s["codec_type"]: s for s in j["streams"]}
    dur = float(j["format"]["duration"]); size = int(j["format"]["size"])
    ok = ("video" in st and "audio" in st and st["video"]["codec_name"] == "h264" and st["video"]["width"] == 1920
          and st["video"]["height"] == 1080 and size > 1_000_000 and abs(dur - expect) < 2.5)
    return ok, dur, size

def sha(f):
    h = hashlib.sha256()
    with open(f, "rb") as fh:
        for blk in iter(lambda: fh.read(1 << 20), b""): h.update(blk)
    return h.hexdigest()

for key in sys.argv[1:]:
    P = f"{REPO}/projects/ipo-28sep-{key}"; art = f"{P}/artifacts/{key}.json"; out = f"{P}/renders/{key}.mp4"
    props = json.load(open(art)); expect = props["cuts"][-1]["out_seconds"] + 1.0
    print(f"=== {key}: rendering ({expect:.1f}s)", flush=True)
    r = subprocess.run(["node", os.path.join(os.path.dirname(os.path.abspath(__file__)), "render.mjs"), key])
    if r.returncode or not os.path.exists(out): print(f"RENDER FAILED {key}"); continue
    ok, dur, size = check(out, expect)
    for frac in (0.1, 0.5, 0.9):  # extracted-frame check from the actual MP4
        fr = f"{P}/qa/final_{int(frac*100)}.png"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{dur*frac:.2f}", "-i", out, "-frames:v", "1", fr], check=True)
        ok = ok and os.path.getsize(fr) > 50_000
    if not ok: print(f"VERIFY FAILED {key}: dur {dur:.2f} size {size}"); continue
    dst = f"{DELIVER}/{SLUG[key]}.mp4"; shutil.copy2(out, dst)
    ok2, dur2, size2 = check(dst, expect)
    if ok2 and size2 == size and sha(dst) == sha(out):
        os.remove(out)
        print(f"DELIVERED {dst} ({dur2/60:.2f} min, {size2/1e6:.1f} MB); deleted {out}", flush=True)
    else:
        print(f"DOWNLOADS COPY FAILED VERIFY {key}; project MP4 kept", flush=True)
