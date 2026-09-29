#!/usr/bin/env python3
"""Build the original two-hour Agentic AI Engineering companion course.

Usage: python3 build.py plan | sample | tts | qa | chapter-props | render-chapters | master
`tts` uses the local Voicebox Nova profile serially and is idempotent.  It may take
several hours for this 176-cut course; rerunning resumes from cached WAV files.
"""
import json, os, subprocess, sys, time, urllib.request
from chapters import CHAPTERS

BASE, PROFILE = "http://127.0.0.1:17493", "c488e05c-3407-46a3-874d-1b09b3aff78d"
GAP, PAUSE, ATEMPO, PREFIX = 0.5, 0.6, 0.95, "aae"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
ASSETS, RAW, ART, REND = (os.path.join(ROOT, x) for x in ("assets", "assets/raw", "artifacts", "renders"))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
for d in (ASSETS, RAW, ART, REND, PUBLIC): os.makedirs(d, exist_ok=True)

INTRO = ("Most agent projects can produce a convincing answer. Production systems must do more. "
         "They must use context, tools, memory, controls, and people responsibly. [pause] "
         "This original course follows the public chapter structure of Agentic AI Engineering and turns each topic into a practical engineering lesson.")
OUTRO = ("You now have a map for building agents as accountable systems. Engineer the loop, bound authority, measure behavior, and preserve a path for human judgment. [pause] "
         "That is how a capable model becomes a production-grade cognitive system. Thanks for watching.")

def word_count(text): return len(text.replace("[pause]", "").split())
def estimate(text): return round(word_count(text) / 2.75 + text.count("[pause]") * PAUSE / ATEMPO, 3)
def duration(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path], text=True).strip())

def entries():
    yield {"id": "title", "variant": "aae_title", "props": {}, "narration": INTRO}
    parts = [(1, 1, "Foundations", "Orient the discipline, runtime, security, and visibility."), (5, 2, "Control Planes", "Protocols, governance, knowledge, and context."), (9, 3, "Cognitive Systems", "Memory, reasoning, models, orchestration, and design."), (14, 4, "Trust in Use", "UX, integration, cognition, trust, operations, and quality."), (20, 5, "Organizational Scale", "Lifecycle, product, teams, maturity, and transformation.")]
    part_at = {start: (n, title, focus) for start, n, title, focus in parts}
    for chapter in CHAPTERS:
        if chapter["number"] in part_at:
            n, title, focus = part_at[chapter["number"]]
            yield {"id": f"part{n}", "variant": "aae_divider", "props": {"part": n, "title": title, "focus": focus}, "narration": f"Part {n}. {title}. {focus}"}
        for seg in chapter["segments"]:
            yield {"id": f'{chapter["id"]}_{seg["id"]}', "variant": seg["variant"], "props": seg["props"], "narration": seg["narration"]}
    yield {"id": "recap", "variant": "aae_recap", "props": {}, "narration": OUTRO}

def write_estimated_props():
    t, cuts = 0.0, []
    for item in entries():
        d = estimate(item["narration"])
        cuts.append({"id": item["id"], "type": item["variant"], "in_seconds": round(t, 3), "out_seconds": round(t + d, 3), "props": {**item["props"], "dur": round(d + GAP, 3)}})
        t += d + GAP
    path = os.path.join(ART, "estimated_edit_decisions.json")
    json.dump({"cuts": cuts}, open(path, "w"), indent=2)
    print(f"Wrote {path}: {len(cuts)} cuts, estimated {(t-GAP)/60:.1f} minutes.")
    return cuts

def post(path, body):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r: return json.loads(r.read().decode())
def get(path):
    with urllib.request.urlopen(BASE + path, timeout=30) as r: return r.read()

def synthesize(sid, text):
    out = os.path.join(ASSETS, sid + ".wav")
    if os.path.exists(out): return out, duration(out)
    chunks, paths = [x.strip() for x in text.split("[pause]") if x.strip()], []
    for i, chunk in enumerate(chunks):
        raw = os.path.join(RAW, f"{sid}_{i}.wav")
        if not os.path.exists(raw):
            job = post("/generate", {"profile_id": PROFILE, "text": chunk, "engine": "kokoro"})["id"]
            for _ in range(600):
                data = get(f"/generate/{job}/status").decode()
                rows = [x[5:].strip() for x in data.splitlines() if x.startswith("data:")]
                if rows and json.loads(rows[-1]).get("status") == "completed": break
                time.sleep(1)
            else: raise RuntimeError(f"Voicebox did not complete {sid}")
            open(raw, "wb").write(get(f"/audio/{job}"))
        paths.append(raw)
    pause = os.path.join(RAW, "pause.wav")
    if not os.path.exists(pause): subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(PAUSE), pause], check=True, capture_output=True)
    manifest = os.path.join(RAW, sid + ".txt")
    with open(manifest, "w") as f:
        for i, path in enumerate(paths):
            f.write(f"file '{path}'\n")
            if i < len(paths) - 1: f.write(f"file '{pause}'\n")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", manifest, "-filter:a", f"atempo={ATEMPO}", out], check=True, capture_output=True)
    return out, duration(out)

def build_tts():
    t, cuts, audio = 0.0, [], []
    all_entries = list(entries())
    for i, item in enumerate(all_entries, 1):
        wav, d = synthesize(item["id"], item["narration"])
        print(f"[{i:03d}/{len(all_entries)}] {item['id']:24s} {d:5.1f}s", flush=True)
        audio.append(wav)
        cuts.append({"id": item["id"], "type": item["variant"], "in_seconds": round(t, 3), "out_seconds": round(t+d, 3), "props": {**item["props"], "dur": round(d+GAP, 3)}})
        t += d + GAP
    gap = os.path.join(RAW, "gap.wav")
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(GAP), gap], check=True, capture_output=True)
    concat = os.path.join(ART, "narration.txt")
    with open(concat, "w") as f:
        for i, wav in enumerate(audio):
            f.write(f"file '{wav}'\n")
            if i < len(audio)-1: f.write(f"file '{gap}'\n")
    narration = os.path.join(PUBLIC, "narration.wav")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat, "-c", "copy", narration], check=True, capture_output=True)
    json.dump({"cuts": cuts, "audio": {"narration": {"src": f"{PREFIX}/narration.wav", "volume": 1}}}, open(os.path.join(ART, "edit_decisions.json"), "w"), indent=2)
    print(f"Complete: {len(cuts)} cuts, {t/60:.1f} minutes. Props and narration are ready to render.")

def run_qa():
    real = os.path.join(ART, "edit_decisions.json")
    props_path = real if os.path.exists(real) else os.path.join(ART, "estimated_edit_decisions.json")
    if not os.path.exists(props_path): write_estimated_props()
    cuts = json.load(open(props_path))["cuts"]
    qa = os.path.join(ROOT, "qa-stills"); os.makedirs(qa, exist_ok=True)
    # One still per scene is intentionally explicit: review all before calling render.
    for i, cut in enumerate(cuts):
        frame = int((cut["in_seconds"] + (cut["out_seconds"]-cut["in_seconds"])*0.60)*30)
        out = os.path.join(qa, f"{i:03d}_{cut['id']}.png")
        if os.path.exists(out):
            print(f"[skip {i+1:03d}/{len(cuts)}] {cut['id']}", flush=True)
            continue
        subprocess.run(["npx", "remotion", "still", "Explainer", out, "--props=" + props_path, "--frame=" + str(frame)], cwd=os.path.join(REPO, "composer"), check=True)

def make_chapter_props():
    """Split the validated master timeline into independently renderable chapters.
    Chapter 1/5/9/14/20 retain their wayfinding divider; intro and recap are their
    own clips. Each fragment receives a rebased timeline and matching audio WAV.
    """
    full = json.load(open(os.path.join(ART, "edit_decisions.json")))
    all_cuts, narration = full["cuts"], os.path.join(PUBLIC, "narration.wav")
    groups = [("00_intro", ["title"])]
    part_for = {1: "part1", 5: "part2", 9: "part3", 14: "part4", 20: "part5"}
    for ch in CHAPTERS:
        ids = ([part_for[ch["number"]]] if ch["number"] in part_for else []) + [f'{ch["id"]}_{s["id"]}' for s in ch["segments"]]
        groups.append((ch["id"], ids))
    groups.append(("25_recap", ["recap"]))
    lookup = {c["id"]: c for c in all_cuts}
    manifest = []
    for gid, ids in groups:
        selected = [lookup[x] for x in ids]
        start, end = selected[0]["in_seconds"], selected[-1]["out_seconds"]
        cuts = [{**c, "in_seconds": round(c["in_seconds"] - start, 3), "out_seconds": round(c["out_seconds"] - start, 3)} for c in selected]
        wav = os.path.join(PUBLIC, f"{gid}.wav")
        # Re-encode PCM WAV to retain accurate trim boundaries.
        subprocess.run(["ffmpeg", "-y", "-ss", str(start), "-t", str(end-start), "-i", narration,
                        "-ar", "24000", "-ac", "1", wav], check=True, capture_output=True)
        props = {"cuts": cuts, "audio": {"narration": {"src": f"{PREFIX}/{gid}.wav", "volume": 1}}}
        prop_path = os.path.join(ART, f"{gid}.json")
        json.dump(props, open(prop_path, "w"), indent=2)
        manifest.append({"id": gid, "props": prop_path, "duration": round(end-start, 3), "output": os.path.join(REND, f"{gid}.mp4")})
    json.dump(manifest, open(os.path.join(ART, "chapter_manifest.json"), "w"), indent=2)
    print(f"Wrote {len(manifest)} independently renderable chapter timelines.")

def render_chapters():
    manifest_path = os.path.join(ART, "chapter_manifest.json")
    if not os.path.exists(manifest_path): make_chapter_props()
    for item in json.load(open(manifest_path)):
        if os.path.exists(item["output"]):
            print(f"[skip] {item['id']}", flush=True); continue
        print(f"[render] {item['id']} ({item['duration']/60:.1f} min)", flush=True)
        subprocess.run(["npx", "remotion", "render", "Explainer", item["output"], "--props=" + item["props"], "--concurrency=8"], cwd=os.path.join(REPO, "composer"), check=True)

def concat_master():
    manifest = json.load(open(os.path.join(ART, "chapter_manifest.json")))
    missing = [x["id"] for x in manifest if not os.path.exists(x["output"])]
    if missing: raise SystemExit("Missing chapter renders: " + ", ".join(missing))
    flist = os.path.join(ART, "master_concat.txt")
    with open(flist, "w") as f:
        for item in manifest: f.write(f"file '{item['output']}'\n")
    out = os.path.join(REND, "agentic-ai-engineering-course-master.mp4")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", flist, "-c", "copy", out], check=True)
    print(f"Master complete: {out}")

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "plan"
    if mode == "plan": write_estimated_props()
    elif mode == "sample":
        wav, d = synthesize("title", INTRO)
        print(f"Opening sample ready: {wav} ({d:.1f}s)")
    elif mode == "tts": build_tts()
    elif mode == "qa": run_qa()
    elif mode == "chapter-props": make_chapter_props()
    elif mode == "render-chapters": render_chapters()
    elif mode == "master": concat_master()
    else: raise SystemExit("Use: plan | sample | tts | qa | chapter-props | render-chapters | master")
