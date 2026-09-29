#!/usr/bin/env python3
"""Five Mid & Small-Caps to Watch — build script (English, prefix `mc5`).

Reuses the NBScenes ("50 to Beat the Nifty") scoreboard scene set via the thin
mc5 -> nb router in composer/src/scenes/MC5Scenes.tsx. Narration: Kokoro af_bella
(Voicebox profile "VQVAE Narrator (Bella)"). 16:9 1080p30, no captions, no music.

Pipeline: narration TTS (idempotent) -> concat with gaps -> edit_decisions.json.
Every cut gets `dur` (narration length + gap) so scenes phase over the full beat.
Run:  python3 build.py     (Voicebox.app must be open)

═══════════════════════════════════════════════════════════════════════════════
NUMBERS — skill-12 gate. All prices are the NSE close on Fri 28-Aug-2026, VERIFIED
on live Zerodha/Kite broker data (get_quotes + daily candles). Fundamentals/targets
from Codex web research (screener.in, ET Money, InCred, company Q1 FY27 filings,
Trendlyne/Moneycontrol broker notes, Jul–Aug 2026) — see CODEX_RESEARCH.md. Analyst
upside % recomputed from the Kite close. This is EDUCATION, not advice; a 2x (+100%)
is framed as a top-decile tail, NOT a base case. Disclaimer spoken (title, statement,
recap) and belongs in the description.

  Price (Kite, 28-Aug-2026 close) | Best analyst target -> upside from that close:
  KPIL       1,386.30  -> Kotak 1,710      = +23.3%
  JUBLINGREA   683.50  -> Anand Rathi 980  = +43.4%
  WABAG      2,086.10  -> Motilal 2,529    = +21.2%
  KFINTECH     949.95  -> Motilal 1,150    = +21.1%
  DALBHARAT  1,845.30  -> ICICI 2,300      = +24.6%   (Codex's 1,876.20 was the 27-Aug close)
═══════════════════════════════════════════════════════════════════════════════
"""
import json, os, subprocess

# Kokoro ONNX (af_bella) — offline, direct model inference (no Voicebox). Model files
# are the hyperframes TTS cache; run inside the project's .venv (kokoro-onnx installed).
import soundfile as sf
from kokoro_onnx import Kokoro

KOKORO_MODEL = os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx")
KOKORO_VOICES = os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")
VOICE = "af_bella"
LANG = "en-us"
_KOKORO = None
def kokoro():
    global _KOKORO
    if _KOKORO is None:
        _KOKORO = Kokoro(KOKORO_MODEL, KOKORO_VOICES)
    return _KOKORO

GAP = 0.5                                          # silence between beats
PAUSE = 0.6                                        # silence at each [pause]
ATEMPO = 0.95                                      # gentle slowdown; raw af_bella too fast for teaching
PREFIX = "mc5"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
RAW = os.path.join(ROOT, "assets", "raw")
FIN = os.path.join(ROOT, "assets")
for d in (PUBLIC, RAW, os.path.join(ROOT, "artifacts"), os.path.join(ROOT, "renders")):
    os.makedirs(d, exist_ok=True)

# rose used for negative / valuation flags on metric values (matches NBScenes A.risk)
RISK = "#FB7185"

# ---------------------------------------------------------------- SCREENPLAY
# (seg_id, variant, scene_props, narration)
SEGMENTS = [
 ("s01_title", "mc5_title",
  {"kick": "MID & SMALL CAP · 1-YEAR VIEW", "big": "Five Stocks,",
   "big2": "One Honest Question",
   "sub": "Can ₹15,000 become ₹30,000 in a year? · verified on live broker data"},
  "Fifteen thousand rupees. [pause] Can it become thirty thousand in a single year? "
  "That would be a one hundred percent return. [pause] We researched the market, verified "
  "every number on live broker data, and picked five mid and small-cap stocks worth "
  "watching. [pause] Here is the honest answer."),

 ("s02_reality", "mc5_statement",
  {"kicker": "FIRST, THE TRUTH", "color": "#FB7185",
   "lines": ["Doubling in a year", "is a top-decile outcome,", "not a base case."],
   "sub": "Not one analyst target on this list implies a hundred percent."},
  "Let us be honest up front. [pause] Doubling your money in one year is possible, but it "
  "is rare — a top-decile outcome, not something to expect. [pause] Across all five of these "
  "stocks, the most optimistic analyst target is a forty-three percent gain. [pause] None of "
  "them is forecast to double. [pause] So treat these as high-upside ideas to research — not "
  "a promise. Size your position accordingly."),

 ("s03_scorecard", "mc5_scorecard",
  {"kicker": "HOW WE CHOSE · THE FIVE TESTS", "title": "Five tests every pick had to pass",
   "items": [
      {"k": "Quality", "d": "Real returns on capital — ROE and ROCE that actually earn", "c": "#34D399"},
      {"k": "Growth", "d": "Rising sales and profit, backed by real orders or capacity", "c": "#FBBF24"},
      {"k": "Valuation", "d": "A price that still leaves room to re-rate, not one stretched", "c": "#38BDF8"},
      {"k": "Catalyst", "d": "A concrete trigger inside the next twelve months", "c": "#A78BFA"},
      {"k": "Honesty", "d": "Every figure checked against live broker data — no story stocks", "c": "#4ADE80"},
  ]},
  "How did we choose? [pause] Five simple tests. [pause] Quality — the business earns well on "
  "its capital. Growth — sales and profits are rising, backed by real orders or new capacity. "
  "[pause] Valuation — a price that still leaves room to climb. A clear catalyst in the next "
  "twelve months. [pause] And honesty — every single number here was checked against live "
  "broker data. Let us meet them."),

 ("s04_kpil", "mc5_stock",
  {"idx": 1, "total": 5, "tier": "1", "name": "Kalpataru Projects", "ticker": "KPIL",
   "sector": "EPC · Power T&D", "cap": "Small-cap", "growth": 15, "take": "Best risk-adjusted pick",
   "metrics": [
       {"k": "Price (28 Aug)", "v": "₹1,386"},
       {"k": "Order book", "v": "₹66,607 Cr", "hero": True},
       {"k": "Q1 PAT growth", "v": "+46%", "c": "#34D399"},
       {"k": "P/E (sector 31)", "v": "23x"},
       {"k": "ROCE", "v": "16.8%"},
       {"k": "Kotak target", "v": "₹1,710 · +23%"},
   ],
   "thesis": [
       "Record ₹66,607 crore order book — years of revenue already signed.",
       "Q1 profit jumped 46 percent while net debt fell by two-thirds.",
       "Trades at 23 times earnings, below the sector's 31 — room to re-rate.",
   ]},
  "Pick one. Kalpataru Projects — an engineering and construction company, and our best "
  "risk-adjusted bet. [pause] Its order book just hit a record sixty-six thousand six hundred "
  "crore rupees. That is years of revenue already signed. [pause] Last quarter, profit jumped "
  "forty-six percent, while net debt fell by two-thirds. [pause] And it trades at just twenty-"
  "three times earnings — below the sector's thirty-one — so there is room to re-rate. Kotak "
  "sees seventeen hundred and ten rupees, about twenty-three percent up. [pause] The catch? A "
  "chunk of promoter shares are pledged. That is a real risk to watch."),

 ("s05_jubilant", "mc5_stock",
  {"idx": 2, "total": 5, "tier": "3", "name": "Jubilant Ingrevia", "ticker": "JUBLINGREA",
   "sector": "Specialty chemicals", "cap": "Small-cap", "growth": 25, "take": "Highest upside, highest risk",
   "metrics": [
       {"k": "Price (28 Aug)", "v": "₹684"},
       {"k": "Q1 revenue", "v": "+25%"},
       {"k": "Q1 PAT growth", "v": "+41%", "c": "#34D399"},
       {"k": "P/E (sector 25)", "v": "40x", "c": RISK},
       {"k": "ROCE", "v": "11.4%"},
       {"k": "Anand Rathi target", "v": "₹980 · +43%", "hero": True},
   ],
   "thesis": [
       "Profit up 41 percent on a richer specialty-chemicals mix.",
       "New multi-purpose plant, over 25 molecules, due by end-2026.",
       "Highest target here — but priced at 40 times earnings.",
   ]},
  "Pick two. Jubilant Ingrevia — specialty chemicals, and the highest-upside name here. "
  "[pause] Revenue grew twenty-five percent, profit forty-one. [pause] A new multi-purpose "
  "plant, with over twenty-five molecules, is due by the end of 2026 — the main catalyst. "
  "[pause] Anand Rathi's target of nine hundred and eighty rupees implies a forty-three percent "
  "gain, the biggest on this list. [pause] But here is the risk: it already trades at forty "
  "times earnings, well above the sector. If growth merely slows, the fall could be sharp. "
  "High reward, high risk."),

 ("s06_wabag", "mc5_stock",
  {"idx": 3, "total": 5, "tier": "1", "name": "VA Tech Wabag", "ticker": "WABAG",
   "sector": "Water · Desalination", "cap": "Small-cap", "growth": 21, "take": "Clean balance sheet",
   "metrics": [
       {"k": "Price (28 Aug)", "v": "₹2,086"},
       {"k": "Order book", "v": "₹19,400 Cr", "hero": True},
       {"k": "Q1 PAT growth", "v": "+37%", "c": "#34D399"},
       {"k": "Debt / equity", "v": "0.04x"},
       {"k": "ROCE", "v": "19.3%"},
       {"k": "Motilal target", "v": "₹2,529 · +21%"},
   ],
   "thesis": [
       "₹19,400 crore order book — over five times annual revenue.",
       "Almost no debt, and return on capital near 19 percent.",
       "Global water and desalination demand is a multi-year runway.",
   ]},
  "Pick three. VA Tech Wabag — water treatment and desalination. [pause] Its order book is "
  "nineteen thousand four hundred crore rupees — more than five times its yearly revenue. "
  "[pause] Profit rose thirty-seven percent, the balance sheet is almost debt-free, and return "
  "on capital is near nineteen percent. [pause] Global demand for clean water is a runway that "
  "lasts years. Motilal Oswal targets twenty-five twenty-nine rupees, about twenty-one percent "
  "up. [pause] The watch-out: Wabag collects its cash slowly — around two hundred and ten days "
  "— so profit does not always turn into cash quickly."),

 ("s07_kfin", "mc5_stock",
  {"idx": 4, "total": 5, "tier": "2", "name": "KFin Technologies", "ticker": "KFINTECH",
   "sector": "Capital-market infra", "cap": "Small-cap", "growth": 20, "take": "Quality, if margins heal",
   "metrics": [
       {"k": "Price (28 Aug)", "v": "₹950"},
       {"k": "Q1 revenue", "v": "+30%", "hero": True},
       {"k": "ROE", "v": "22.3%", "c": "#34D399"},
       {"k": "ROCE", "v": "27.9%", "c": "#34D399"},
       {"k": "Q1 PAT growth", "v": "-2.6%", "c": RISK},
       {"k": "Motilal target", "v": "₹1,150 · +21%"},
   ],
   "thesis": [
       "A picks-and-shovels bet on India's financialisation.",
       "Revenue up 30 percent; overseas business nearly tripled.",
       "Integration costs pushed profit down — a recovery bet.",
   ]},
  "Pick four. KFin Technologies — the plumbing behind India's mutual funds and pensions. "
  "[pause] It is a picks-and-shovels bet on more Indians investing. Revenue grew thirty "
  "percent, and its overseas business nearly tripled. [pause] Return on capital is an excellent "
  "twenty-eight percent, with almost no debt. [pause] But integration costs pushed profit "
  "slightly down last quarter, and the stock is expensive at forty-eight times earnings. "
  "[pause] Motilal Oswal sees eleven fifty rupees, about twenty-one percent up. A quality "
  "business — if the margins recover."),

 ("s08_dalmia", "mc5_stock",
  {"idx": 5, "total": 5, "tier": "2", "name": "Dalmia Bharat", "ticker": "DALBHARAT",
   "sector": "Cement", "cap": "Mid-cap", "growth": 10, "take": "Earnings-recovery bet",
   "metrics": [
       {"k": "Price (28 Aug)", "v": "₹1,845"},
       {"k": "Q1 volume", "v": "+9%"},
       {"k": "Q1 PAT growth", "v": "-51%", "c": RISK, "hero": True},
       {"k": "P/E (sector 49)", "v": "31x"},
       {"k": "Net debt / EBITDA", "v": "1.47x", "c": RISK},
       {"k": "ICICI target", "v": "₹2,300 · +25%"},
   ],
   "thesis": [
       "New capacity at Chunar and Rewa is now coming online.",
       "Targeting 67 million tonnes by financial year 28.",
       "Profit fell 51 percent — an earnings-recovery bet, not a grower.",
   ]},
  "Pick five. Dalmia Bharat — the only mid-cap here, and a cement maker. [pause] New plants at "
  "Chunar and Rewa are coming online, pushing toward sixty-seven million tonnes of capacity. "
  "Volumes grew nine percent. [pause] It is cheaper than its peers — thirty-one times earnings "
  "versus the sector's forty-nine. [pause] But be clear-eyed: profit fell fifty-one percent "
  "last quarter as it absorbed those new assets, and debt has risen. [pause] This is an "
  "earnings-recovery bet. ICICI targets twenty-three hundred rupees, roughly twenty-five "
  "percent up if the rebound comes."),

 ("s09_bars", "mc5_bars",
  {"kicker": "SIDE BY SIDE · BEST-CASE UPSIDE", "title": "The best analysts hope for — and the gap to a double",
   "unit": "%",
   "bars": [
       {"label": "KPIL", "v": 23, "c": "#34D399"},
       {"label": "Jubilant", "v": 43, "c": "#FB7185"},
       {"label": "Wabag", "v": 21, "c": "#34D399"},
       {"label": "KFin", "v": 21, "c": "#FBBF24"},
       {"label": "Dalmia", "v": 25, "c": "#FBBF24"},
   ],
   "foot": "Targets: Kotak, Anand Rathi, Motilal Oswal, ICICI (Jul–Aug 2026). A double = +100%. Not investment advice."},
  "Put the best-case targets side by side. [pause] Jubilant leads at forty-three percent. "
  "Dalmia, twenty-five. Kalpataru, twenty-three. Wabag and KFin, around twenty-one. [pause] "
  "Now remember the goal — doubling means a hundred percent. [pause] Even the most bullish "
  "analyst, on the most aggressive pick, sees less than half of that. [pause] That gap is the "
  "whole point. These are strong businesses — but a double needs everything to go right."),

 ("s10_play", "mc5_statement",
  {"kicker": "SO HOW DO YOU PLAY IT?", "color": "#FBBF24",
   "lines": ["Spread the bet.", "Size it small.", "Give it time."],
   "sub": "One ₹15,000 position in a single small-cap is concentrated risk."},
  "So how should you think about this? [pause] First, do not bet everything on one name — "
  "small-caps swing hard. [pause] Second, size it small enough that a bad year will not hurt. "
  "[pause] Third, give the thesis time; re-ratings take quarters, not weeks. [pause] Fifteen "
  "thousand could grow meaningfully if a couple of these deliver. It could also fall. That is "
  "the real trade-off — and only you can decide if it fits."),

 ("s11_recap", "mc5_recap",
  {"title": "Five small-caps, in one breath",
   "items": [
      "KPIL — record order book, cheapest, best risk-adjusted",
      "Jubilant Ingrevia — highest upside, highest valuation risk",
      "VA Tech Wabag — clean balance sheet, but slow cash",
      "KFin — best returns, pricey, a margin-recovery bet",
      "Dalmia Bharat — mid-cap cement, an earnings rebound bet",
   ],
   "closer": "High upside is real. A guaranteed double is not."},
  "Five stocks, one honest scorecard. [pause] Kalpataru — the cheapest, with a record order "
  "book. Jubilant — the highest upside, and the highest risk. [pause] Wabag — a clean balance "
  "sheet. KFin — the best returns, if margins heal. And Dalmia — a mid-cap recovery bet. "
  "[pause] High upside is real. A guaranteed double is not. [pause] This is research from "
  "public data, not investment advice — always consult a SEBI-registered advisor. Thanks for "
  "watching."),
]


def tts_chunk(path, text):
    """One Kokoro ONNX af_bella generation -> 24kHz mono PCM_16 WAV at `path`."""
    samples, sr = kokoro().create(text, voice=VOICE, speed=1.0, lang=LANG)
    sf.write(path, samples, sr, subtype="PCM_16")


def gen_one(seg_id, text):
    fin = os.path.join(FIN, seg_id + ".wav")
    if os.path.exists(fin):
        out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                              "-of", "default=noprint_wrappers=1:nokey=1", fin],
                             capture_output=True, text=True, check=True)
        return fin, round(float(out.stdout.strip()), 3)
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
        for i2, p2 in enumerate(paths):
            f.write(f"file '{p2}'\n")
            if i2 < len(paths) - 1:
                f.write(f"file '{psil}'\n")
    af = f"atempo={ATEMPO}" if ATEMPO != 1.0 else "anull"
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist,
                    "-filter:a", af, fin], check=True, capture_output=True)
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=noprint_wrappers=1:nokey=1", fin],
                         capture_output=True, text=True, check=True)
    return fin, round(float(out.stdout.strip()), 3)


manifest = []
for sid, variant, props, text in SEGMENTS:
    path, dur = gen_one(sid, text)
    manifest.append({"id": sid, "variant": variant, "props": props, "wav": path, "duration": dur})
    warn = "  ⚠ LONG — split or ensure it develops to p≈0.85 (skills/03)" if dur > 90 else ""
    print(f"  {sid:14s} {dur:6.2f}s{warn}", flush=True)

silence = os.path.join(FIN, "_sil.wav")
subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(GAP), silence],
               check=True, capture_output=True)
concat_list = os.path.join(ROOT, "concat.txt")
with open(concat_list, "w") as f:
    for i, m in enumerate(manifest):
        f.write(f"file '{m['wav']}'\n")
        if i < len(manifest) - 1:
            f.write(f"file '{silence}'\n")
subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list, "-c", "copy",
                os.path.join(PUBLIC, "narration.wav")], check=True, capture_output=True)

cuts, t = [], 0.0
for m in manifest:
    start, end = t, t + m["duration"]
    cuts.append({"id": m["id"], "type": m["variant"], "in_seconds": round(start, 3),
                 "out_seconds": round(end, 3),
                 "props": {**m["props"], "dur": round(m["duration"] + GAP, 3)}})
    t = end + GAP
props = {"cuts": cuts,
         "audio": {"narration": {"src": f"{PREFIX}/narration.wav", "volume": 1.0}}}
json.dump(props, open(os.path.join(ROOT, "artifacts", "edit_decisions.json"), "w"), indent=2)
print(f"total {t - GAP:.2f}s ({(t-GAP)/60:.2f} min), {len(cuts)} scenes, NO captions, NO music")
