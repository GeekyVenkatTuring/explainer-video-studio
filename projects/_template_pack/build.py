#!/usr/bin/env python3
"""STYLE-PACK VIDEO TEMPLATE — copy to projects/<slug>/ and edit PACK / META / BEATS.

Pipeline: narration (Kokoro ONNX af_bella) → per-beat WAVs → captions → AUTO-SYNCED reveal
times → artifacts/chNN.json per chapter (composition `StyleReel`, see skills/14-style-packs.md).

  projects/midcap5-picks-en/.venv/bin/python3 projects/<slug>/build.py        # TTS + JSON
  bash projects/<slug>/render.sh                                             # render + concat

BEATS: (kind, props, narration, chapter). Kinds: title · divider · statement · list · flow ·
chart · versus · recap (props documented in composer/src/styles/core.tsx).
AUTO-SYNC: for list/flow/recap items, bar labels and statement lines, the reveal time is set to
the moment the item is SPOKEN (first word of its heading found in the narration), so visuals
never lag the voice. Give props["ats"] yourself to override. Idempotent: delete a beat's WAV to redo it.
"""
import json, os, re, subprocess
import soundfile as sf
from kokoro_onnx import Kokoro

PACK = "editorial"                       # editorial | blueprint | kinetic  (pick by content — skills/14)
META = {"brand": "The Explainer", "project": "Topic", "issue": "September 2026", "code": "EF-001"}  # masthead / title block
PREFIX = "tpl"                           # public/<PREFIX>/ audio folder — make it unique per video
CAPTIONS = True
GAP, PAUSE, ATEMPO = 0.5, 0.6, 0.95
PRON = [(r"\bCI/CD\b", "C I, C D"), (r"\bAPI\b", "A P I")]   # spoken forms (captions keep written text)

BEATS = [
 ("title", {"kicker": "An explainer", "title": "Your Topic,\nExplained", "subtitle": "the promise in one line"},
  "One hook sentence. [pause] What the viewer will get.", 0),
 ("list", {"kicker": "Three things", "title": "What matters", "items": [
     {"h": "First idea", "d": "one-line detail"}, {"h": "Second idea", "d": "one-line detail"}, {"h": "Third idea", "d": "one-line detail"}]},
  "There are three things. [pause] First idea — why it matters. [pause] Second idea — why it matters. [pause] Third idea.", 0),
 ("recap", {"title": "In one breath", "items": ["First idea", "Second idea", "Third idea"], "closer": "The one-line thesis."},
  "Let's recap. [pause] First idea. Second idea. Third idea. [pause] The one-line thesis. Thanks for watching.", 0),
]

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = subprocess.run(["git", "-C", ROOT, "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip()
PUB = os.path.join(REPO, "composer", "public", PREFIX)
RAW, FIN, ART = os.path.join(ROOT, "assets", "raw"), os.path.join(ROOT, "assets"), os.path.join(ROOT, "artifacts")
for d in (PUB, RAW, ART, os.path.join(ROOT, "renders")): os.makedirs(d, exist_ok=True)
_K = None
def kokoro():
    global _K
    if _K is None:
        _K = Kokoro(os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx"), os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin"))
    return _K
def spoken(t):
    for a, b in PRON: t = re.sub(a, b, t)
    return t
def ffdur(p): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
def silence(path, secs):
    if not os.path.exists(path): subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(secs), path], check=True)
    return path

def tts(bid, text):
    fin = os.path.join(FIN, f"{bid}.wav")
    if os.path.exists(fin): return fin
    parts = [p.strip() for p in text.split("[pause]") if p.strip()]
    lines = []
    for i, p in enumerate(parts):
        cp = os.path.join(RAW, f"{bid}_{i}.wav")
        s, sr = kokoro().create(spoken(p), voice="af_bella", speed=1.0, lang="en-us"); sf.write(cp, s, sr, subtype="PCM_16")
        lines.append(f"file '{cp}'")
        if i < len(parts) - 1: lines.append(f"file '{silence(os.path.join(RAW, '_p.wav'), PAUSE)}'")
    lst = os.path.join(RAW, f"{bid}.txt"); open(lst, "w").write("\n".join(lines))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-filter:a", f"atempo={ATEMPO}", "-ar", "24000", "-ac", "1", fin], check=True)
    return fin

def word_times(text, dur):
    """(word, t_start_fraction) for every narration word — same proportional model as the captions."""
    parts = text.split("[pause]"); words = sum(len(p.split()) for p in parts) or 1
    pp = PAUSE / ATEMPO; wt = max(0.01, dur - (len(parts) - 1) * pp) / words; t, out = 0.0, []
    for i, p in enumerate(parts):
        for w in p.split(): out.append((w, t / dur)); t += wt
        if i < len(parts) - 1: t += pp
    return out

STOP = {"the", "and", "for", "with", "from", "into", "your", "about", "that", "this", "what", "how", "why", "are", "its", "one", "new"}

def autosync(kind, props, text, dur):
    """Set props['ats'] so each item reveals as it is spoken (≈0.03 early). Never overrides a given ats."""
    if "ats" in props: return props
    h = lambda x: x["h"] if isinstance(x, dict) else str(x)
    heads = ([h(i) for i in props.get("items", [])] if kind in ("list", "recap") else
             [h(s) for s in props.get("steps", [])] if kind == "flow" else
             props.get("lines", []) if kind == "statement" else
             [b["label"] for b in props.get("bars", [])] if kind == "chart" else
             [h(n) for n in props.get("nodes", [])] if kind == "x_diagram" else None)   # x_diagram-style custom kinds
    if not heads: return props
    wt = word_times(text, dur); norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
    ats, cursor = [], 0
    for h in heads:
        key = next((norm(w) for w in h.split() if len(norm(w)) > 2 and norm(w) not in STOP and not norm(w).isdigit()), "")
        hit = next((k for k in range(cursor, len(wt)) if norm(wt[k][0]).startswith(key)), None) if key else None
        if hit is None: ats.append(None); continue
        ats.append(round(max(0.0, wt[hit][1] - 0.03), 3)); cursor = hit + 1
    if all(a is None for a in ats): return props
    return {**props, "ats": [a if a is not None else (ats[i - 1] or 0) + 0.05 for i, a in enumerate(ats)]}

def cues_for(text, dur, t0):
    parts = text.split("[pause]"); words = sum(len(p.split()) for p in parts) or 1
    pp = PAUSE / ATEMPO; wt = max(0.01, dur - (len(parts) - 1) * pp) / words; ct, out = t0, []
    for i, p in enumerate(parts):
        w = p.split()
        for k in range(0, len(w), 8):
            ch = w[k:k + 8]; out.append([round(ct, 3), round(ct + wt * len(ch), 3), " ".join(ch)]); ct += wt * len(ch)
        if i < len(parts) - 1: ct += pp
    return out

if __name__ == "__main__":
    chapters = {}
    for n, (kind, props, text, ch) in enumerate(BEATS):
        bid = f"b{n:02d}"; wav = tts(bid, text); d = ffdur(wav)
        chapters.setdefault(ch, []).append((bid, kind, autosync(kind, props, text, d), text, wav, d))
        print(f"ch{ch:02d} {bid} {kind:10s} {d:6.2f}s")
    gap = silence(os.path.join(RAW, "_g.wav"), GAP); total = 0.0; out = []
    for ch, beats in sorted(chapters.items()):
        lst = os.path.join(RAW, f"_ch{ch:02d}.txt"); open(lst, "w").write("\n".join(f"file '{b[4]}'\nfile '{gap}'" for b in beats))
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", os.path.join(PUB, f"ch{ch:02d}.wav")], check=True)
        t, cues, rb = 0.0, [], []
        for bid, kind, props, text, wav, d in beats:
            cues += cues_for(text, d, t); rb.append({"id": bid, "kind": kind, "dur": round(d + GAP, 3), "props": props}); t += d + GAP
        j = os.path.join(ART, f"ch{ch:02d}.json")
        json.dump({"pack": PACK, "meta": META, "beats": rb, "captions": cues if CAPTIONS else [], "audio": f"{PREFIX}/ch{ch:02d}.wav"}, open(j, "w"), indent=1)
        out.append(j); total += t; print(f"  → {os.path.basename(j)}  {t:.1f}s")
    words = sum(len(b[2].replace("[pause]", " ").split()) for b in BEATS)
    print(f"TOTAL {total:.1f}s ({total/60:.2f} min) · {len(BEATS)} beats · {words} words · pack={PACK}")
