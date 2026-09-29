#!/usr/bin/env python3
"""The Psychology of Money — chaptered explainer + captioned master.

SOURCE / DATA GATE (skills/12)
  Primary source: Morgan Housel, *The Psychology of Money* (Harriman House, 2020).
  This is a transformative educational summary of the book's stories and published
  figures — not a reprint, not investment advice, not live market data.

  Book-dated figures used on screen (as of the 2020 text, not today's quotes):
    Ronald Read estate > $8 million (died 2014); $2m to family, >$6m to hospital/library
    2,813,503 U.S. deaths in 2014; fewer than 4,000 estates over $8 million
    Read house $12,000 at age 38; Fuscone Greenwich home >$90,000/month; foreclosure −75%
    Buffett (book): $84.5bn NW; $84.2bn after age 50; $81.5bn after mid-60s; ~22%/yr
    Age-30 NW $1m (~$9.3m inflation-adj.); thought experiment $25k at 30, retire 60 → $11.9m
    Jim Simons (book): ~66%/yr since 1988; NW $21bn
    Bessembinder 1926–2016: top ~4% of listed firms explain net U.S. equity wealth creation
    Russell 3000 since 1980 (JPM AM, as cited): 40% lost ≥70% never recovered; ~7% drove returns
    VC 2004–2014 (Correlation Ventures, as cited): 65% lost money; 0.5% returned 50x+
    Sue/Jim/Tom $1/month 1900–2019: $435,551 / $257,386 / $234,476
    U.S. stocks 50/50 one day; 68% one year; 88% ten years; 100% twenty years (book)
    Netflix 2002–2018: >35,000% return, below ATH 94% of days
    Monster 1995–2018: 319,000%, below high 95% of days
    Student loans $1.6tn, 10.8% default (book-dated)
    Household debt-to-income just over 100% vs below 60% through 1970s (postscript)

  Disclaimer (title + recap): education, not advice. Consult a SEBI-registered adviser
  for personal decisions. Historical book figures are not current prices or forecasts.

Commands:
  python3 build.py tts [ch00 ...]
  python3 build.py qa [ch00 ...]
  python3 build.py render [ch00 ...]
  python3 build.py master
  python3 build.py deliver
"""
import argparse, json, os, subprocess, sys, time, urllib.request
from chapters import CHAPTERS

BASE = "http://127.0.0.1:17493"
PROFILE = "c488e05c-3407-46a3-874d-1b09b3aff78d"  # TTS Bright (Nova)
GAP, PAUSE, ATEMPO = 0.5, 0.6, 0.95
PREFIX = "pm"
CAP_MAXWORDS, CAP_WRAP = 8, 42
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
COMPOSER = os.path.join(REPO, "composer")
PUBLIC = os.path.join(COMPOSER, "public", PREFIX)
RAW = os.path.join(ROOT, "assets", "raw")
FIN = os.path.join(ROOT, "assets")
ART = os.path.join(ROOT, "artifacts")
REND = os.path.join(ROOT, "renders")
QADIR = os.path.join(ROOT, "qa-stills")
SLUG = "psychology-of-money"
DELIVER = os.path.expanduser(f"~/Downloads/generated_videos/{SLUG}")
for d in (PUBLIC, RAW, FIN, ART, REND, QADIR):
    os.makedirs(d, exist_ok=True)


def post(p, b):
    req = urllib.request.Request(BASE + p, data=json.dumps(b).encode(),
                                 headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def get(p):
    with urllib.request.urlopen(BASE + p, timeout=30) as r:
        return r.read()


def tts_chunk(path, text):
    gid = post("/generate", {"profile_id": PROFILE, "text": text, "engine": "kokoro"})["id"]
    for _ in range(300):
        raw = get(f"/generate/{gid}/status").decode()
        line = [l for l in raw.splitlines() if l.startswith("data:")]
        st = json.loads(line[-1][5:].strip()) if line else None
        if st and st.get("status") == "completed":
            break
        time.sleep(1)
    open(path, "wb").write(get(f"/audio/{gid}"))


def dur_of(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=noprint_wrappers=1:nokey=1", path],
                         capture_output=True, text=True, check=True)
    return round(float(out.stdout.strip()), 3)


def gen_one(seg_id, text):
    fin = os.path.join(FIN, seg_id + ".wav")
    if os.path.exists(fin):
        return fin, dur_of(fin)
    chunks = [c.strip() for c in text.split("[pause]") if c.strip()]
    paths = []
    for ci, chunk in enumerate(chunks):
        cp = os.path.join(RAW, f"{seg_id}_c{ci}.wav")
        if not os.path.exists(cp):
            tts_chunk(cp, chunk)
        paths.append(cp)
    psil = os.path.join(RAW, "_pause.wav")
    if not os.path.exists(psil):
        subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                        "-t", str(PAUSE), psil], check=True, capture_output=True)
    clist = os.path.join(RAW, f"{seg_id}_concat.txt")
    with open(clist, "w") as f:
        for i, p in enumerate(paths):
            f.write(f"file '{p}'\n")
            if i < len(paths) - 1:
                f.write(f"file '{psil}'\n")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist,
                    "-filter:a", f"atempo={ATEMPO}", fin], check=True, capture_output=True)
    return fin, dur_of(fin)


def _wrap(text):
    lines, cur = [], ""
    for w in text.split():
        if cur and len(cur) + 1 + len(w) > CAP_WRAP:
            lines.append(cur); cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur:
        lines.append(cur)
    return "\n".join(lines)


def beat_cues(text, dur, t0):
    parts = text.split("[pause]")
    ppause = PAUSE / ATEMPO
    n_pause = len(parts) - 1
    all_words = sum(len(p.split()) for p in parts) or 1
    word_time = max(0.0, dur - n_pause * ppause) / all_words
    cues, ct = [], 0.0
    for pi, part in enumerate(parts):
        words = part.split()
        i = 0
        while i < len(words):
            j = min(i + CAP_MAXWORDS, len(words))
            for k in range(i + 1, j):
                if words[k - 1][-1:] in ".?!,;:":
                    j = k; break
            chunk = words[i:j]
            d = word_time * len(chunk)
            cues.append([round(t0 + ct, 3), round(t0 + ct + d, 3), _wrap(" ".join(chunk))])
            ct += d
            i = j
        if pi < len(parts) - 1:
            ct += ppause
    return cues


def chapters_arg(names):
    if not names:
        return CHAPTERS
    return [c for c in CHAPTERS if c["id"] in names]


def run_tts(names):
    grand_total, grand_words = 0.0, 0
    for ch in chapters_arg(names):
        manifest, cues, cuts, t = [], [], [], 0.0
        for seg in ch["segments"]:
            sid = f'{ch["id"]}_{seg["id"]}'
            path, d = gen_one(sid, seg["narration"])
            if d > 90:
                print(f"  ⚠ LONG >90s  {sid}  {d:.1f}s", flush=True)
            manifest.append((sid, path))
            cues.extend(beat_cues(seg["narration"], d, t))
            cuts.append({"id": sid, "type": seg["variant"],
                         "in_seconds": round(t, 3), "out_seconds": round(t + d, 3),
                         "props": {**seg.get("props", {}), "dur": round(d + GAP, 3)}})
            t = round(t + d + GAP, 3)
            print(f"  {sid:28s} {d:6.2f}s", flush=True)
        sil = os.path.join(FIN, "_gap.wav")
        if not os.path.exists(sil):
            subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                            "-t", str(GAP), sil], check=True, capture_output=True)
        clist = os.path.join(ART, f'{ch["id"]}_audio.txt')
        with open(clist, "w") as f:
            for i, (sid, path) in enumerate(manifest):
                f.write(f"file '{path}'\n")
                if i < len(manifest) - 1:
                    f.write(f"file '{sil}'\n")
        wav_out = os.path.join(PUBLIC, f'{ch["id"]}.wav')
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist, "-c", "copy",
                        wav_out], check=True, capture_output=True)
        props = {"cuts": cuts, "captions": cues,
                 "audio": {"narration": {"src": f'{PREFIX}/{ch["id"]}.wav', "volume": 1.0}}}
        json.dump(props, open(os.path.join(ART, f'{ch["id"]}.json'), "w"), indent=1)
        words = sum(len(s["narration"].replace("[pause]", " ").split()) for s in ch["segments"])
        dur = t - GAP
        grand_total += dur; grand_words += words
        print(f'{ch["id"]}: {dur/60:.2f} min  {len(ch["segments"])} scenes  {words} words', flush=True)
    if grand_total:
        print(f'\nBATCH {grand_total/60:.2f} min · {grand_words} words · '
              f'effective {grand_words/(grand_total/60):.0f} wpm')


def run_qa(names):
    for ch in chapters_arg(names):
        props = os.path.join(ART, f'{ch["id"]}.json')
        if not os.path.exists(props):
            sys.exit("run tts first")
        data = json.load(open(props))
        for cut in data["cuts"]:
            mid = (cut["in_seconds"] + cut["out_seconds"]) / 2
            frame = round(mid * 30)
            out = os.path.join(QADIR, f'{cut["id"]}.png')
            r = subprocess.run(["npx", "remotion", "still", "Explainer", out,
                                f"--props={props}", f"--frame={frame}"],
                               cwd=COMPOSER, capture_output=True, text=True)
            if r.returncode != 0:
                print(r.stdout[-800:], r.stderr[-800:]); sys.exit(f"still failed {cut['id']}")
            print(f'  QA {cut["id"]} @f{frame}', flush=True)
    print(f"\nLOOK at every png in {QADIR}/ before render")


def render_one(ch):
    props = os.path.join(ART, f'{ch["id"]}.json')
    out = os.path.join(REND, f'{ch["id"]}.mp4')
    r = subprocess.run(["npx", "remotion", "render", "Explainer", out,
                        f"--props={props}", "--concurrency=8", "--timeout=900000"],
                       cwd=COMPOSER, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout[-1200:], r.stderr[-1200:]); sys.exit(f"render failed {ch['id']}")
    os.makedirs(DELIVER, exist_ok=True)
    subprocess.run(["cp", out, os.path.join(DELIVER, f'{ch["id"]}.mp4')], check=True)
    return out


def run_render(names):
    for ch in chapters_arg(names):
        out = render_one(ch)
        print(f'  rendered {ch["id"]} ({dur_of(out)/60:.2f} min)', flush=True)


def run_master():
    clist = os.path.join(ART, "master_concat.txt")
    with open(clist, "w") as f:
        for ch in CHAPTERS:
            mp4 = os.path.join(REND, f'{ch["id"]}.mp4')
            if not os.path.exists(mp4):
                sys.exit(f"missing {mp4} — render it first")
            f.write(f"file '{mp4}'\n")
    master = os.path.join(REND, "master.mp4")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", clist,
                    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", master], check=True)
    print(f"master: {master} ({dur_of(master)/60:.2f} min)")


def run_deliver():
    os.makedirs(DELIVER, exist_ok=True)
    n = 0
    for ch in CHAPTERS:
        src = os.path.join(REND, f'{ch["id"]}.mp4')
        if os.path.exists(src):
            subprocess.run(["cp", src, os.path.join(DELIVER, f'{ch["id"]}.mp4')], check=True); n += 1
    master = os.path.join(REND, "master.mp4")
    if os.path.exists(master):
        subprocess.run(["cp", master, os.path.join(DELIVER, f"{SLUG}-master.mp4")], check=True)
    print(f"delivered {n} chapters + master → {DELIVER}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["tts", "qa", "render", "master", "deliver"], nargs="?", default="tts")
    ap.add_argument("names", nargs="*")
    a = ap.parse_args()
    {"tts": run_tts, "qa": run_qa, "render": run_render, "master": lambda n: run_master(),
     "deliver": lambda n: run_deliver()}[a.mode](a.names)
