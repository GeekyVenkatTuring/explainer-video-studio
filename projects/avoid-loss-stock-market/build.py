#!/usr/bin/env python3
"""Build the chapter videos and master for *Avoid Loss and Earn Consistently*.

SOURCE / DATA GATE
  Primary source: Prasenjit Paul, *How to Avoid Loss and Earn Consistently in the
  Stock Market* (2017), user-supplied PDF, 116 pages. This is a transformative
  educational summary: historical company examples and the book's dated rates are
  discussed as examples, not current quotes or recommendations.

  No live price, tax rate, settlement rule, lot size, or return is used. Therefore
  the video deliberately avoids stale figures from the 2017 book. It says that an
  adviser should be SEBI-registered, but makes no claim about a current regulation
  beyond that general investor-protection direction. Current verification source:
  SEBI Investor, "Understanding Investment Advisors" (accessed 2026-08-19), and
  SEBI's 2026 Master Circular / IA Regulations directory. Every chapter repeats that
  this is education, not investment advice.

Commands:
  python3 build.py tts [ch01 ...]      # generate/cache narration + props
  python3 build.py qa [ch01 ...]       # one mid-animation still per scene
  python3 build.py render [ch01 ...]   # render and deliver chapter MP4s
  python3 build.py master              # concatenate all rendered chapters
"""
import argparse, json, os, shutil, subprocess, sys, time, urllib.request
from chapters import CHAPTERS

BASE = "http://127.0.0.1:17493"
PROFILE = "c488e05c-3407-46a3-874d-1b09b3aff78d"  # TTS Bright (Nova)
GAP, PAUSE, ATEMPO = 0.5, 0.6, 0.95
PREFIX, SLUG = "fa", "avoid-loss-stock-market"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
COMPOSER = os.path.join(REPO, "composer")
PUBLIC = os.path.join(COMPOSER, "public", PREFIX)
ASSETS, RAW = os.path.join(ROOT, "assets"), os.path.join(ROOT, "assets", "raw")
ART, REND, QADIR = (os.path.join(ROOT, x) for x in ("artifacts", "renders", "qa-stills"))
DELIVER = os.path.expanduser(f"~/Downloads/generated_videos/{SLUG}")
for d in (PUBLIC, ASSETS, RAW, ART, REND, QADIR): os.makedirs(d, exist_ok=True)

def ffdur(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path], capture_output=True, text=True, check=True)
    return round(float(r.stdout.strip()), 3)

def request(path, body=None):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode() if body else None,
        headers={"Content-Type": "application/json"}, method="POST" if body else "GET")
    with urllib.request.urlopen(req, timeout=35) as r: return r.read()

def raw_tts(out, text):
    gid = json.loads(request("/generate", {"profile_id": PROFILE, "text": text, "engine": "kokoro"}))["id"]
    for _ in range(300):
        raw = request(f"/generate/{gid}/status").decode()
        lines = [x for x in raw.splitlines() if x.startswith("data:")]
        status = json.loads(lines[-1][5:].strip()) if lines else {}
        if status.get("status") == "completed":
            with open(out, "wb") as f: f.write(request(f"/audio/{gid}"))
            return
        time.sleep(1)
    raise RuntimeError(f"TTS timed out: {out}")

def make_wav(sid, text):
    final = os.path.join(ASSETS, sid + ".wav")
    if os.path.exists(final): return final, ffdur(final)
    chunks, paths = [x.strip() for x in text.split("[pause]") if x.strip()], []
    for i, chunk in enumerate(chunks):
        path = os.path.join(RAW, f"{sid}-{i}.wav")
        if not os.path.exists(path): raw_tts(path, chunk)
        paths.append(path)
    pause = os.path.join(RAW, "pause.wav")
    if not os.path.exists(pause):
        subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(PAUSE), pause], capture_output=True, check=True)
    listing = os.path.join(RAW, f"{sid}.txt")
    with open(listing, "w") as f:
        for i, path in enumerate(paths):
            f.write(f"file '{path}'\n")
            if i < len(paths) - 1: f.write(f"file '{pause}'\n")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", listing, "-filter:a", f"atempo={ATEMPO}", final], capture_output=True, check=True)
    return final, ffdur(final)

def chosen(names):
    wanted = set(names)
    out = [c for c in CHAPTERS if not wanted or c["id"] in wanted]
    if not out: sys.exit("No matching chapter. Use ch01 through ch11.")
    return out

def tts(names):
    for ch in chosen(names):
        cuts, audio, now = [], [], 0.0
        for sid, kind, props, narration in ch["segments"]:
            full = f"{ch['id']}_{sid}"; path, dur = make_wav(full, narration)
            cuts.append({"id": full, "type": kind, "in_seconds": round(now, 3), "out_seconds": round(now + dur, 3), "props": {**props, "dur": round(dur + GAP, 3)}})
            audio.append(path); now += dur + GAP
            print(f"  {full:25} {dur:6.2f}s", flush=True)
        gap = os.path.join(ASSETS, "gap.wav")
        if not os.path.exists(gap): subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(GAP), gap], capture_output=True, check=True)
        listing = os.path.join(ART, f"{ch['id']}_audio.txt")
        with open(listing, "w") as f:
            for i, path in enumerate(audio):
                f.write(f"file '{path}'\n")
                if i < len(audio) - 1: f.write(f"file '{gap}'\n")
        wav = os.path.join(PUBLIC, f"{SLUG}-{ch['id']}.wav")
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", listing, "-c", "copy", wav], capture_output=True, check=True)
        props = {"cuts": cuts, "audio": {"narration": {"src": f"{PREFIX}/{SLUG}-{ch['id']}.wav", "volume": 1.0}}}
        with open(os.path.join(ART, f"{ch['id']}.json"), "w") as f: json.dump(props, f, indent=2)
        words = sum(len(s[3].replace("[pause]", "").split()) for s in ch["segments"])
        print(f"{ch['id']}: {len(cuts)} scenes, {words} words, {(now-GAP)/60:.2f} min", flush=True)

def qa(names):
    for ch in chosen(names):
        prop = os.path.join(ART, f"{ch['id']}.json")
        if not os.path.exists(prop): sys.exit(f"Run tts first: {ch['id']}")
        for cut in json.load(open(prop))["cuts"]:
            out = os.path.join(QADIR, f"{cut['id']}.png")
            frame = round((cut["in_seconds"] + (cut["out_seconds"] - cut["in_seconds"]) * .60) * 30)
            subprocess.run(["npx", "remotion", "still", "Explainer", out, f"--props={prop}", f"--frame={frame}"], cwd=COMPOSER, check=True)
            print(f"QA {cut['id']} @ {frame}", flush=True)

def render(names):
    os.makedirs(DELIVER, exist_ok=True)
    for ch in chosen(names):
        prop, out = os.path.join(ART, f"{ch['id']}.json"), os.path.join(REND, f"{ch['id']}.mp4")
        if not os.path.exists(prop): sys.exit(f"Run tts first: {ch['id']}")
        subprocess.run(["npx", "remotion", "render", "Explainer", out, f"--props={prop}", "--concurrency=4", "--timeout=900000"], cwd=COMPOSER, check=True)
        shutil.copy2(out, os.path.join(DELIVER, f"{SLUG}-{ch['id']}.mp4"))
        print(f"Rendered {ch['id']}: {ffdur(out)/60:.2f} min", flush=True)

def master(_):
    files = [os.path.join(REND, f"{c['id']}.mp4") for c in CHAPTERS]
    missing = [x for x in files if not os.path.exists(x)]
    if missing: sys.exit("Render every chapter before master; missing: " + ", ".join(os.path.basename(x) for x in missing))
    listing = os.path.join(ART, "master.txt")
    with open(listing, "w") as f:
        for path in files: f.write(f"file '{path}'\n")
    out = os.path.join(REND, f"{SLUG}-master.mp4")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", listing, "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-c:a", "aac", "-b:a", "192k", out], check=True)
    os.makedirs(DELIVER, exist_ok=True); shutil.copy2(out, os.path.join(DELIVER, os.path.basename(out)))
    print(f"Master: {ffdur(out)/60:.2f} min → {DELIVER}")

if __name__ == "__main__":
    p = argparse.ArgumentParser(); p.add_argument("mode", choices=["tts", "qa", "render", "master"]); p.add_argument("names", nargs="*")
    a = p.parse_args(); {"tts": tts, "qa": qa, "render": render, "master": master}[a.mode](a.names)
