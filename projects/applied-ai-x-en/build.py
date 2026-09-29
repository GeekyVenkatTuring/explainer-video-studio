#!/usr/bin/env python3
"""Applied AI on X — the 100-Article Deep Dive (English, Kokoro af_bella).

SCOPE (this build): articles 1-15 of the compilation —
  Chapter 1  Learning Paths & Skill Maps   (all 10)
  Chapter 2  Skills, Tools & MCP           (first 5)

Source: ~/Downloads/X-Applied-AI-Articles-2026-09-12.pdf (100 articles, 8 themes).
Every article beat is an ORIGINAL summary in our own words, on-screen attributed to
its author's @handle — the article text itself is never reproduced.

Article beats (variant + props + narration) are generated into beats/bNNN.json;
the chapter scaffolding (title, dividers, roadmaps, recaps, end card) is authored
here. Scene set: composer/src/scenes/XAScenes.tsx (prefix `xa`).

Captions are ON. Cue timing is anchored to the MEASURED duration of each TTS chunk
(not estimated across the beat), so captions cannot drift from the audio.

Rendering is chunked by frame range off ONE timeline, so the concatenated master is
continuous and perfectly A/V aligned by construction. See artifacts/chapters.json.

Run:  ../midcap5-picks-en/.venv/bin/python build.py
"""
import json, os, subprocess

import soundfile as sf
from kokoro_onnx import Kokoro

KOKORO_MODEL = os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx")
KOKORO_VOICES = os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")
VOICE, LANG = "af_bella", "en-us"
_K = None
def kokoro():
    global _K
    if _K is None:
        _K = Kokoro(KOKORO_MODEL, KOKORO_VOICES)
    return _K

GAP = 0.5        # silence between beats
PAUSE = 0.6      # silence inserted at each [pause] marker
ATEMPO = 0.95    # gentle slowdown — raw af_bella is too fast for teaching
FPS = 30
PREFIX = "xa"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
RAW = os.path.join(ROOT, "assets", "raw")
FIN = os.path.join(ROOT, "assets")
BEATS = os.path.join(ROOT, "beats")
for d in (PUBLIC, RAW, FIN, BEATS, os.path.join(ROOT, "artifacts"), os.path.join(ROOT, "renders")):
    os.makedirs(d, exist_ok=True)

SKY, IDEA, MECH, TODO, RISK = "#7DD3FC", "#FBBF24", "#A78BFA", "#34D399", "#FB7185"

# ---------------------------------------------------------------- scaffolding
# Chapter cards are authored here; the 15 article beats are loaded from beats/.
CH1_ITEMS = [
    {"n": 1, "title": "Become an AI engineer in six months"},
    {"n": 2, "title": "Master AI in thirty days"},
    {"n": 3, "title": "Twenty AI concepts for 2026"},
    {"n": 4, "title": "Zero to hireable in four months"},
    {"n": 5, "title": "Agentic engineer in six weeks, part one"},
    {"n": 6, "title": "Graph architect from zero"},
    {"n": 7, "title": "The fourteen-step graph roadmap"},
    {"n": 8, "title": "AI agents: the complete course"},
    {"n": 9, "title": "Agentic engineer in six weeks, part two"},
    {"n": 10, "title": "The twenty-five concepts you need"},
]
CH2_ITEMS = [
    {"n": 1, "title": "The AI engineering skills map"},
    {"n": 2, "title": "Top fifty Claude skills and repos"},
    {"n": 3, "title": "Skills map: building and deploying"},
    {"n": 4, "title": "Sixty-seven skills for one subscription"},
    {"n": 5, "title": "Skills map: using coding agents"},
]

OPEN = [
 ("s000_title", "xa_title",
  {"kicker": "X / APPLIED AI · COMPILED 12 SEP 2026"},
  "Someone collected the hundred best applied A I articles on X. [pause] "
  "Roadmaps, skill maps, agent harnesses, retrieval, inference, evals. "
  "Together they are over three hundred thousand words. [pause] "
  "This series reads all of them, so you don't have to. "
  "We start where everybody starts — with the learning paths."),

 ("s001_d1", "xa_divider",
  {"n": 1, "title": "Learning Paths\n& Skill Maps", "sub": "Ten roadmaps for getting into applied AI",
   "color": SKY, "pips": 8},
  "Chapter one. Learning paths and skill maps. [pause] "
  "Ten of the most-shared roadmaps for breaking into applied A I."),

 ("s002_c1intro", "xa_chintro",
  {"ch": 1, "chname": "LEARNING PATHS", "headline": "Ten roadmaps, ranked by reach",
   "color": SKY, "items": CH1_ITEMS},
  "Here is what chapter one covers. [pause] "
  "Two long-form roadmaps open it — six months to A I engineer, and thirty days to "
  "a working foundation. Then two concept maps, one with twenty ideas, one with twenty-five. "
  "[pause] A four-month path to being hireable. A two-part agentic engineering course. "
  "And three guides to graph engineering, which is the newest of these tracks. "
  "[pause] They disagree about timelines. They agree almost completely about content. "
  "Watch for that pattern as we go."),
]

CH1_RECAP = [
 ("s013_c1recap", "xa_recap",
  {"n": 1, "chname": "LEARNING PATHS", "heading": "What all ten roadmaps agree on",
   "color": SKY,
   "items": [
     "Build end-to-end apps on existing models — do not train from scratch",
     "Python, APIs and backend basics come before any model theory",
     "Prompting, structured outputs and tool calling are the core loop",
     "Add retrieval only when the model needs facts it cannot hold",
     "Agents are the frontier, and graphs are how the newest guides frame them",
     "Ship and deploy publicly — every roadmap ends at a portfolio, not a certificate",
   ],
   "closer": "The timelines are marketing. The syllabus underneath is remarkably consistent."},
  "So what did ten roadmaps actually agree on? [pause] "
  "Build on existing models instead of training your own. "
  "Learn Python, A P Is and backend basics before model theory. "
  "[pause] Treat prompting, structured outputs and tool calling as the core loop. "
  "Add retrieval only when the model needs facts it cannot hold. "
  "Then move to agents, which the newest guides describe as graphs. "
  "[pause] And every single one ends the same way — with something shipped and public. "
  "[pause] The timelines are marketing. Thirty days, six weeks, four months, six months. "
  "The syllabus underneath barely changes."),
]

CH2_OPEN = [
 ("s014_d2", "xa_divider",
  {"n": 2, "title": "Skills, Tools\n& MCP", "sub": "Skill maps, Claude skills, and the tool layer",
   "color": TODO, "pips": 8},
  "Chapter two. Skills, tools, and M C P. [pause] "
  "Where the roadmaps end, the tooling begins."),

 ("s015_c2intro", "xa_chintro",
  {"ch": 2, "chname": "SKILLS & MCP", "headline": "The five most-shared, to start",
   "color": TODO, "items": CH2_ITEMS},
  "Chapter two runs to fifteen articles. We cover the first five here. [pause] "
  "Three of them are Andrew Ng's skills map, published in parts — the single most "
  "shared item in the whole collection. [pause] "
  "Between them sit two very large lists of Claude skills and repositories. "
  "One promises fifty. The other promises sixty-seven. "
  "[pause] Ng's pieces are about judgment. The lists are about inventory. "
  "You need both, and it helps to know which one you are reading."),
]

CLOSE = [
 ("s021_end", "xa_end",
  {"items": [
     "Fifteen of the hundred articles, covered end to end",
     "Ten roadmaps that disagree on time and agree on content",
     "Build on existing models; learn the plumbing first",
     "Prompt, structure the output, call the tool — that is the loop",
     "Retrieval when facts are missing; agents when steps are needed",
     "Andrew Ng's skills map is about judgment, not tools",
     "The big skill lists are inventory — useful, but not a curriculum",
   ],
   "closer": "The roadmaps get you started. The tool layer is where the work actually happens."},
  "That is the first fifteen articles. [pause] "
  "Ten roadmaps that argue about timelines and agree about substance. "
  "Five tooling pieces that split cleanly into judgment and inventory. "
  "[pause] The through-line is simple. Learn the plumbing, build on models that already exist, "
  "and ship something people can open. [pause] "
  "Everything after this — context, memory, harnesses, retrieval, inference, evals — "
  "assumes you have done that part. [pause] Thanks for watching."),
]

# ---------------------------------------------------------------- assemble
def load_beats(lo, hi):
    out = []
    for i in range(lo, hi + 1):
        f = os.path.join(BEATS, f"b{i:03d}.json")
        if not os.path.exists(f):
            raise SystemExit(f"missing {f} — run the beats generation step first")
        b = json.load(open(f))
        out.append((f"a{i:03d}", b["variant"], b["props"], b["narration"]))
    return out

SEGMENTS = OPEN + load_beats(1, 10) + CH1_RECAP + CH2_OPEN + load_beats(11, 15) + CLOSE

# chapter boundaries by segment id — used to slice the render into chunks
CHAPTERS = [
    {"n": 1, "label": "ch1-learning-paths", "first": "s000_title", "last": "s013_c1recap"},
    {"n": 2, "label": "ch2-skills-mcp", "first": "s014_d2", "last": "s021_end"},
]

# ---------------------------------------------------------------- TTS
def ffdur(p):
    o = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=noprint_wrappers=1:nokey=1", p],
                       capture_output=True, text=True, check=True)
    return float(o.stdout.strip())


def tts_chunk(path, text):
    samples, sr = kokoro().create(text, voice=VOICE, speed=1.0, lang=LANG)
    sf.write(path, samples, sr, subtype="PCM_16")


def gen_one(seg_id, text):
    """Build one beat's WAV and return (path, total_dur, [(chunk_text, chunk_dur)]).

    Chunk durations are the REAL measured ones (divided by ATEMPO, which the final
    concat applies), so caption cues can be anchored to them exactly.
    """
    fin = os.path.join(FIN, seg_id + ".wav")
    chunks = [c.strip() for c in text.split("[pause]") if c.strip()]
    paths = []
    for ci, chunk in enumerate(chunks):
        cp = os.path.join(RAW, f"{seg_id}_c{ci}.wav")
        if not os.path.exists(cp):
            tts_chunk(cp, chunk)
        paths.append(cp)
    spans = [(chunks[i], ffdur(p) / ATEMPO) for i, p in enumerate(paths)]

    if not os.path.exists(fin):
        psil = os.path.join(RAW, "_pause.wav")
        if not os.path.exists(psil):
            subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                            "-t", str(PAUSE), psil], check=True, capture_output=True)
        clist = os.path.join(RAW, f"{seg_id}_concat.txt")
        with open(clist, "w") as f:
            for i2, p2 in enumerate(paths):
                f.write(f"file '{p2}'\n")
                if i2 < len(paths) - 1:
                    f.write(f"file '{psil}'\n")
        af = f"atempo={ATEMPO}" if ATEMPO != 1.0 else "anull"
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist,
                        "-filter:a", af, fin], check=True, capture_output=True)
    return fin, round(ffdur(fin), 3), spans


# ---------------------------------------------------------------- captions
def wrap(text, width=52):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > width and cur:
            lines.append(cur); cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur:
        lines.append(cur)
    return "\n".join(lines[:2])


# don't end a caption card on one of these — "… continuous learning. The" reads badly
DANGLE = {"the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for", "with",
          "that", "is", "are", "as", "at", "by", "from", "it", "its", "this", "their"}


def beat_cues(spans, t0):
    """Cues anchored to each chunk's MEASURED span — no drift across the beat."""
    ppause = PAUSE / ATEMPO
    cues, ct = [], 0.0
    for si, (text, dur) in enumerate(spans):
        words = text.split()
        wt = dur / max(1, len(words))
        i = 0
        while i < len(words):
            j = min(len(words), i + 9)
            # pull a trailing function word onto the NEXT card (up to 2 back)
            for _ in range(2):
                if j > i + 4 and j < len(words) and words[j - 1].strip(",.;:").lower() in DANGLE:
                    j -= 1
            # avoid orphaning 1-2 words into a final card
            if len(words) - j in (1, 2):
                j = len(words)
            chunk = words[i:j]
            d = wt * len(chunk)
            cues.append([round(t0 + ct, 3), round(t0 + ct + d, 3), wrap(" ".join(chunk))])
            ct += d
            i = j
        if si < len(spans) - 1:
            ct += ppause
    return cues


# ---------------------------------------------------------------- reveal timing
# List scenes (recap / end card / chapter roadmap) name their items one by one in the
# narration. Rather than guessing the spacing, locate each item's anchor word in this
# beat's own audio-timed cues and hand the scene the real phases as `ats`. Measured
# drift before this: recap item 6 appeared 8.6s early, end-card item 1 4.2s late.
STOP = {"the","and","for","with","that","this","your","from","into","not","are","you",
        "every","each","what","when","only","then","than","they","them","their",
        "before","after","without","just","more","most","some","one","two","all","its",
        "over","under","about","which","while","have","has","been","was","were","will"}


def item_ats(items, beat_cue_list, t0, dur, lead=0.02):
    """Phase for each list item = when its anchor word is actually spoken."""
    if not items or not beat_cue_list:
        return None
    toks = []
    for it in items:
        ws = [w.strip(".,;:—-()").lower() for w in str(it).split()]
        toks.append([w for w in ws if len(w) >= 5 and w not in STOP])
    # rarest-first: a word used by only one item is the most reliable anchor
    freq = {}
    for ws in toks:
        for w in set(ws):
            freq[w] = freq.get(w, 0) + 1
    ats, cursor = [], 0.0
    for i, ws in enumerate(toks):
        ws = sorted(ws, key=lambda w: (freq[w], -len(w)))
        hit = None
        for w in ws:
            for c0, _c1, txt in beat_cue_list:
                p = (c0 - t0) / dur
                if p < cursor - 0.02:          # never search backwards past the last item
                    continue
                if w in txt.lower().replace("\n", " "):
                    hit = p
                    break
            if hit is not None:
                break
        if hit is None:                        # fall back to even spacing for this item
            hit = cursor + (0.8 - cursor) / max(1, len(items) - i)
        # floor at 0.04 so the first item still animates in rather than being pre-painted
        hit = max(cursor, 0.04, min(0.88, hit - lead))
        ats.append(round(hit, 3))
        cursor = hit + 0.012
    return ats


# ---------------------------------------------------------------- build
manifest, cues, cuts, t = [], [], [], 0.0
bounds = {}
print(f"\nBuilding {len(SEGMENTS)} beats (Kokoro af_bella, atempo {ATEMPO}) …\n")
for sid, variant, props, text in SEGMENTS:
    path, dur, spans = gen_one(sid, text)
    manifest.append({"id": sid, "wav": path})
    my_cues = beat_cues(spans, t)
    cues.extend(my_cues)
    bounds[sid] = (t, t + dur)
    extra = {}
    # ONLY the recap and end card walk their list item-by-item in the narration, so only
    # they have a real per-item spoken position to lock onto. The chapter roadmaps
    # describe the articles loosely rather than reading the titles out, so anchor
    # matching there just clustered 3 items onto the same frame — they keep even spacing.
    if variant in ("xa_recap", "xa_end") and props.get("items"):
        ats = item_ats(props["items"], my_cues, t, dur)
        if ats:
            extra["ats"] = ats
    cuts.append({"id": sid, "type": variant,
                 "in_seconds": round(t, 3), "out_seconds": round(t + dur, 3),
                 "props": {**props, **extra, "dur": round(dur + GAP, 3)}})
    warn = "  ⚠ LONG >90s" if dur > 90 else ""
    print(f"  {sid:14s} {variant:12s} {dur:6.2f}s  {len(text.split()):4d}w{warn}", flush=True)
    t += dur + GAP

# concat narration with inter-beat gaps
sil = os.path.join(FIN, "_sil.wav")
subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(GAP), sil],
               check=True, capture_output=True)
clist = os.path.join(ROOT, "concat.txt")
with open(clist, "w") as f:
    for i, m in enumerate(manifest):
        f.write(f"file '{m['wav']}'\n")
        if i < len(manifest) - 1:
            f.write(f"file '{sil}'\n")
subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist, "-c", "copy",
                os.path.join(PUBLIC, "narration.wav")], check=True, capture_output=True)

total = t - GAP
props = {"cuts": cuts, "captions": cues,
         "audio": {"narration": {"src": f"{PREFIX}/narration.wav", "volume": 1.0}}}
json.dump(props, open(os.path.join(ROOT, "artifacts", "edit_decisions.json"), "w"), indent=1)

# frame ranges for chunked rendering off this single timeline
chs = []
for c in CHAPTERS:
    s = bounds[c["first"]][0]
    e = bounds[c["last"]][1]
    chs.append({**c, "start_s": round(s, 3), "end_s": round(e, 3),
                "start_frame": int(round(s * FPS)),
                "end_frame": int(round(e * FPS)) - 1})
json.dump({"fps": FPS, "total_seconds": round(total, 3),
           "total_frames": int(round(total * FPS)), "chapters": chs},
          open(os.path.join(ROOT, "artifacts", "chapters.json"), "w"), indent=1)

words = sum(len(s[3].split()) for s in SEGMENTS)
print(f"\ntotal {total:.2f}s ({total/60:.2f} min), {len(cuts)} scenes, "
      f"{len(cues)} caption cues, {words} words, captions ON")
for c in chs:
    print(f"  chapter {c['n']} {c['label']:22s} frames {c['start_frame']}-{c['end_frame']} "
          f"({(c['end_s']-c['start_s'])/60:.2f} min)")
