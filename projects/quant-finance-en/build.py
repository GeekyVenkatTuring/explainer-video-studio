#!/usr/bin/env python3
"""Read a Portfolio Like a Quant — build (English, prefix `fq`).

Teaches fundamental + technical analysis from scratch on a real ₹59,405 Kite book and
a 5-stock pick list. Voice: Kokoro ONNX af_bella (offline, direct — NOT Voicebox).
Burned-in captions ON. 16:9 1080p30. Single master edit_decisions.json.

Run with the kokoro-onnx venv:
  projects/midcap5-picks-en/.venv/bin/python3 projects/quant-finance-en/build.py

NUMBERS (skill-12 gate): all figures verified on live Zerodha/Kite (28-Aug-2026 close) +
Screener fundamentals + S&P consensus EPS. Education, not advice; a double is framed as a
bull-case tail, not a base case. Disclaimer spoken in title + recap.
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
    if _K is None: _K = Kokoro(KOKORO_MODEL, KOKORO_VOICES)
    return _K

GAP, PAUSE, ATEMPO = 0.5, 0.6, 0.95
PREFIX = "fq"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
RAW, FIN = os.path.join(ROOT, "assets", "raw"), os.path.join(ROOT, "assets")
for d in (PUBLIC, RAW, os.path.join(ROOT, "artifacts"), os.path.join(ROOT, "renders")):
    os.makedirs(d, exist_ok=True)

GREEN, AMBER, VIOLET, BLUE = "#34D399", "#FBBF24", "#A78BFA", "#4F8DF5"

# --------------------------------------------------------------- SCREENPLAY
# (seg_id, variant, props, narration)
SEGMENTS = [
 ("t00", "fq_title", {},
  "This is a real stock portfolio — worth fifty-nine thousand rupees. [pause] Seven holdings. "
  "Some winning, some losing. [pause] But how do you actually judge a stock? [pause] In the next "
  "few minutes, we'll learn to read one like a professional — from the very beginning."),

 ("t01", "fq_lenses", {},
  "Every stock can be judged two ways. [pause] The first lens is fundamental analysis. It asks a "
  "simple question — is the business good, and is the price fair? [pause] It looks at how much a "
  "company earns, how well it earns it, and what you pay for that. [pause] The second lens is "
  "technical analysis. It ignores the business, and asks — what is the price actually doing? "
  "[pause] The trend, the momentum, the timing. [pause] Great investors use both. Let's start with the first."),

 ("d1", "fq_divider", {"n": 1, "title": "Fundamentals", "sub": "The health of the business behind the share", "color": GREEN, "pips": 3},
  "Part one. Fundamentals. [pause] The health of the business behind the share — earnings, quality, and value. "
  "Let's build it from zero."),

 ("f01", "fq_share", {},
  "First, what is a share? [pause] It's one tiny slice of a real company. Buy one share of HDFC Bank, and you "
  "own a sliver of that bank — its profits, and its risks. [pause] Today, one slice costs seven hundred and "
  "twenty rupees. [pause] Multiply that price by the total number of shares, and you get the market cap — how "
  "big the whole company is. [pause] That size sorts the market into small-caps, mid-caps, and large-caps. "
  "HDFC Bank is a large-cap."),

 ("f02", "fq_pe", {},
  "Now the most famous number in investing — the P, E. [pause] First, earnings per share, or E P S. That's the "
  "company's yearly profit, split across every share. [pause] The P E is just the price divided by that profit. "
  "[pause] It tells you how many rupees you pay for one rupee of yearly profit. [pause] HDFC Bank at seven-"
  "twenty, with about fifty-one rupees of profit per share, trades near fourteen times. [pause] In plain terms — "
  "you pay fourteen rupees for one rupee of profit. Roughly fourteen years to earn it back. Lower is usually cheaper."),

 ("f03", "fq_pb", {},
  "Next, price to book. [pause] Book value is what a company would be worth if you sold everything and paid off "
  "every debt — its net worth, per share. [pause] Price to book is the price divided by that net worth. [pause] "
  "Below one means you're buying it for less than its own assets. [pause] It matters most for banks. HDFC Bank "
  "trades near one point eight times its book — a fair price for a quality lender."),

 ("f04", "fq_roe", {},
  "Here's the one that separates great businesses from average ones — return on equity. [pause] It's the yearly "
  "profit divided by the shareholders' money in the business. [pause] It answers — for every hundred rupees the "
  "owners put in, how much profit comes back each year? [pause] Infosys earns about thirty-two rupees on every "
  "hundred. That's a thirty-two percent return on equity. [pause] High, consistent returns are a compounding "
  "engine — the single biggest sign of a quality business. Its cousin, return on capital, tells the same story."),

 ("f05", "fq_debt", {},
  "Three quick health checks. [pause] Debt to equity — how much the company borrows against its own money. Low "
  "is safer. [pause] Promoter holding — how much the founders still own. High means their skin is in the game "
  "with yours. [pause] And dividend yield — the cash the company pays you each year, as a percent of the price. "
  "[pause] Together, these tell you if the balance sheet is sound and the owners are aligned."),

 ("f06", "fq_growth", {},
  "A cheap stock isn't always cheap. [pause] What if a company grows its profit fast? [pause] Then a high price "
  "to earnings can still be a bargain. [pause] We measure growth as the yearly rate profits have climbed. [pause] "
  "And we adjust the P E for it, using the P E G — the P E divided by the growth rate. [pause] Dixon trades at "
  "forty-seven times earnings — expensive on the surface. But it grows profits near seventy-seven percent, so "
  "its P E G is about zero point six. Below one — cheap for that growth."),

 ("f07", "fq_apply_fa", {},
  "Let's put it together on one stock — HDFC Bank. [pause] Price to earnings, fourteen — cheap for a big bank. "
  "[pause] Price to book, one point eight — fair. [pause] Return on equity, near fourteen percent — solid and "
  "steady. [pause] Low debt, a dividend, and India's most trusted private bank. [pause] The verdict from "
  "fundamentals alone — a quality business at a reasonable price. [pause] But fundamentals never tell you when "
  "to buy. For that, we need the second lens."),

 ("d2", "fq_divider", {"n": 2, "title": "Technicals", "sub": "Reading the price: trend, momentum, timing", "color": AMBER, "pips": 3},
  "Part two. Technicals. [pause] Now we ignore the business, and read only the price — the trend, the momentum, "
  "and the timing."),

 ("g01", "fq_chart", {},
  "A price chart is just the story of what buyers and sellers have agreed on, over time. [pause] Every point is a "
  "closing price. [pause] The first thing we read is returns — how much the price has moved, over a month, six "
  "months, a year. [pause] Up and to the right is an uptrend. Down is a downtrend. Sideways is indecision. "
  "[pause] But raw price is noisy. To see the real trend, we smooth it."),

 ("g02", "fq_dma", {},
  "That smoothing is a moving average. [pause] It's simple — take the last fifty closing prices and average them. "
  "Do that every day, and you get a smooth line that follows the trend. [pause] Two are famous — the fifty-day "
  "and the two-hundred-day. [pause] The fifty-day is the short-term trend. The two-hundred-day is the long-term "
  "trend. [pause] The rule of thumb — when the price is above the two-hundred-day line, the tide is with you. "
  "Below it, be careful."),

 ("g03", "fq_rsi", {},
  "Next, momentum — how strong a move is. [pause] The tool is the R S I, a number from zero to a hundred. [pause] "
  "It compares the size of recent gains to recent losses. [pause] Above seventy, the stock is overbought — it's "
  "run hot and may pause. [pause] Below thirty, it's oversold — beaten down and may bounce. [pause] Between "
  "forty-five and sixty-five is a healthy, sustainable trend. [pause] The R S I doesn't tell you direction — it "
  "tells you whether a move has gone too far."),

 ("g04", "fq_volbeta", {},
  "Three risk gauges. [pause] Volatility measures how wildly a price swings, day to day. Higher means a bumpier "
  "ride. [pause] Beta compares a stock to the whole market — the Nifty. A beta of one moves with the market. "
  "Above one amplifies it — more reward, more risk. [pause] And maximum drawdown is the worst fall, from a peak "
  "to a low. [pause] It's the pain you'd have had to sit through. Knowing it before you buy keeps you honest."),

 ("g05", "fq_52w", {},
  "One more, and it's intuitive. [pause] The fifty-two-week range is simply the highest and lowest price of the "
  "past year. [pause] Where the price sits inside that range tells you a lot. [pause] Near the high, the stock "
  "has momentum — but less room. Near the low, it's cheap on the chart — but the trend is weak. [pause] Context, in one glance."),

 ("g06", "fq_apply_ta", {},
  "Let's read one chart — Reliance. [pause] The price is below its two-hundred-day line, so the long-term trend "
  "is weak. [pause] Its R S I is around forty-three — neither overbought nor oversold. [pause] And it sits near "
  "the bottom of its yearly range, at just eight percent. [pause] Its beta is under one, so it's calmer than the "
  "market. [pause] The technical read — a weak tape, but a beaten-down, low-risk name. The chart says wait; the "
  "fundamentals said cheap."),

 ("d3", "fq_divider", {"n": 3, "title": "The Plan", "sub": "One verdict — then finding and buying stocks", "color": BLUE, "pips": 3},
  "Part three. The verdict, and the plan. [pause] We'll turn all these numbers into one call — then find new "
  "stocks, and buy them with discipline."),

 ("a01", "fq_score", {},
  "So how do we decide? [pause] We don't trust any single number. [pause] We score each stock on four "
  "independent things — quality, trend, valuation, and risk — each from zero to a hundred. [pause] Then we blend "
  "them, weighting quality and trend the most, into one composite score. [pause] Sixty-four or above, "
  "accumulate. In the mid-fifties, add on dips. In the forties, just hold. Below that, trim. [pause] One number, "
  "four honest inputs."),

 ("a02", "fq_concentration", {},
  "But before any single stock, check the whole portfolio. [pause] Here's the biggest risk in this real book — "
  "and it isn't any one share. [pause] One holding is almost sixty percent of the money. [pause] So even with "
  "seven names, you effectively own only about two and a half independent bets. [pause] That's concentration. "
  "If that one stock stumbles, the whole portfolio does. [pause] And it listed less than three weeks ago. Rule "
  "one of investing — don't put all your eggs in one basket."),

 ("a03", "fq_funnel", {},
  "Now, finding new stocks. [pause] Two thousand companies trade on the exchange. How do you get to five? "
  "[pause] A funnel. [pause] First, keep only names liquid enough to buy and sell easily. [pause] Then only "
  "sectors that are actually growing — defence, electronics, power. [pause] Then only companies with a real "
  "record of rising profits. [pause] Two thousand becomes about forty, then a shortlist of twenty-three worth "
  "studying — and finally, five worth buying."),

 ("a04", "fq_picks", {},
  "And here they are — five to add, one a month. [pause] A defence anchor, an electronics leader, a cables "
  "compounder, and two small-caps with real momentum. [pause] Each scored the same way you just learned. [pause] "
  "Higher potential upside — and, to be honest, higher risk. [pause] These are ideas to research, not promises. "
  "Which brings us to the hardest question of all."),

 ("a05", "fq_targets", {},
  "What is a stock actually worth? [pause] A price target. [pause] Professionals set it three ways. [pause] "
  "One — take a fair price to earnings, and multiply it by next year's expected profit. [pause] Two — average "
  "what many analysts expect. [pause] Three — read the chart, where price has found support and resistance "
  "before. [pause] No single method is right. Good analysts triangulate all three — and treat the answer as a "
  "range, not a promise."),

 ("a06", "fq_valuation", {},
  "The honest way to value a stock is to imagine three futures. [pause] A bad case, where things disappoint. A "
  "middle case. And a good case, where everything goes right. [pause] For each, multiply a fair price to "
  "earnings by expected profit. [pause] Then weight them by how likely each is. [pause] For our top pick, H A L, "
  "that weighted average lands right around today's price. [pause] The bull case is up sixteen percent; the bear "
  "case, down twenty-four. [pause] The lesson — the growth is already in the price. A double would need the bull "
  "case, and then some."),

 ("a07", "fq_gtt", {},
  "Finally, how to actually buy — with a plan, not a panic. [pause] Don't buy everything at once. [pause] Place "
  "two orders below the current price, so you average in as it dips. [pause] These are G T T orders — good, till "
  "triggered. They sit and wait, and only fire when the price hits your level. [pause] And always place a stop-"
  "loss underneath. [pause] If you're wrong, it sells automatically, so one bad call can only cost so much. "
  "[pause] Plan the entry, plan the exit — before emotion arrives."),

 ("p1", "fq_pickdetail", {"tk": "HAL", "theme": "Defence · aircraft", "cap": "Large", "conv": "High", "month": 1,
   "line": "India's fighter-jet monopoly", "color": BLUE,
   "fa": {"pe": 34.9, "pb": 7.92, "roe": 24.0, "roce": 32.0, "de": 0.0, "prom": 71.64, "valflag": "Fair"},
   "ta": {"ltp": 4861.1, "s200": 4383, "d200": 10.9, "rsi": 52.7, "beta": 0.97, "mdd": -29.1, "pos52": 85, "lo52": 3487.2, "hi52": 5099},
   "sc": {"q": 78, "t": 93, "v": 60, "c": 100, "comp": 83},
   "cat": "First Tejas Mk1A jets deliver in FY27; a ₹2.55 lakh-crore order book; Q1 profit already up 14% before jet revenue lands.",
   "bear": "Engine and integration delays; over 90% of sales depend on a single buyer — the Ministry of Defence.",
   "plan": {"leg1": 4760, "leg2": 4560, "avg": 4675, "stop": 4090, "stopPct": -13.2, "tgt": 5099, "tgtPct": 9.1}},
  "Pick one — Hindustan Aeronautics, our highest-conviction name. [pause] A large-cap defence monopoly that builds India's "
  "fighter jets. [pause] The fundamentals are pristine — zero debt, a thirty-two percent return on capital, and the "
  "government owns seventy-two percent. At thirty-five times earnings, a fair price for that quality. [pause] Technically, "
  "it sits eleven percent above its two-hundred-day line — a healthy uptrend — with a calm beta near one. [pause] Composite "
  "score, eighty-three. [pause] The bull case — Tejas jet deliveries and a huge order book. The bear case — it all leans on "
  "one buyer. [pause] The plan — average in near forty-six seventy-five, with a stop at forty-ninety."),

 ("p2", "fq_pickdetail", {"tk": "DIXON", "theme": "Electronics · EMS", "cap": "Mid", "conv": "Medium", "month": 2,
   "line": "India's electronics factory", "color": GREEN,
   "fa": {"pe": 47.7, "pb": 19.05, "roe": 37.4, "roce": 42.0, "de": 0.21, "prom": 28.55, "valflag": "Cheap"},
   "ta": {"ltp": 14650, "s200": 12230, "d200": 19.8, "rsi": 58.7, "beta": 1.53, "mdd": -47.2, "pos52": 57, "lo52": 9673, "hi52": 18177},
   "sc": {"q": 85, "t": 91, "v": 80, "c": 60, "comp": 80},
   "cat": "Vivo joint venture cleared — ₹35–40k crore of new revenue from FY28 — plus PLI 2.0 export incentives; an elite 37% ROE.",
   "bear": "FY27 margins bottom near 3%; PLI rules unfinalised; heavy dependence on a few large clients.",
   "plan": {"leg1": 14300, "leg2": 13700, "avg": 13960, "stop": 12100, "stopPct": -14.0, "tgt": 18177, "tgtPct": 30.2}},
  "Pick two — Dixon Technologies, India's electronics factory. [pause] A mid-cap that assembles phones and appliances for "
  "the world's brands. [pause] The fundamentals are elite — a thirty-seven percent return on equity, forty-two on capital. "
  "It trades at forty-eight times earnings, but with a P-E-G under one, that's actually cheap for the growth. [pause] The "
  "price is nearly twenty percent above its long-term average — but a beta of one-and-a-half means a wild ride, with a "
  "forty-seven percent fall in the past year. [pause] Score, eighty. [pause] Bull — a huge new venture with Vivo. Bear — "
  "thin margins and client concentration. [pause] Buy near fourteen thousand, stop near twelve-one."),

 ("p3", "fq_pickdetail", {"tk": "KEI", "theme": "Cables & wires", "cap": "Mid", "conv": "Medium", "month": 3,
   "line": "the electrification compounder", "color": BLUE,
   "fa": {"pe": 53.4, "pb": 7.99, "roe": 14.8, "roce": 20.1, "de": 0.04, "prom": 35.0, "valflag": "Fair"},
   "ta": {"ltp": 5570, "s200": 4749, "d200": 17.3, "rsi": 54.9, "beta": 1.18, "mdd": -23.3, "pos52": 85, "lo52": 3805.2, "hi52": 5873},
   "sc": {"q": 67, "t": 93, "v": 60, "c": 60, "comp": 71},
   "cat": "India's electrification, data-centre and grid boom; a ₹4,292-crore order book, debt-free, with a new EHV plant by 2027.",
   "bear": "Export disruption and duties; a slower plant ramp; copper-price and competitive pressure.",
   "plan": {"leg1": 5420, "leg2": 5150, "avg": 5310, "stop": 4780, "stopPct": -10.5, "tgt": 5873, "tgtPct": 10.6}},
  "Pick three — K-E-I Industries, a cables and wires compounder. [pause] A mid-cap riding India's electrification and "
  "data-centre boom. [pause] It's debt-free, with a fifteen percent return on equity and steady twenty percent returns on "
  "capital. At fifty-three times earnings, fairly valued for a proven grower. [pause] Technically strong — seventeen percent "
  "above its two-hundred-day line, near the top of its yearly range. [pause] Score, seventy-one. [pause] Bull — a "
  "four-thousand-crore order book and a new plant by twenty twenty-seven. Bear — export disruption and a slower ramp. "
  "[pause] Average in near fifty-three-ten, stop at forty-seven-eighty."),

 ("p4", "fq_pickdetail", {"tk": "SYRMA", "theme": "Electronics · EMS", "cap": "Small", "conv": "Medium", "month": 4,
   "line": "small-cap, pure momentum", "color": AMBER,
   "fa": {"pe": 76.5, "pb": 9.96, "roe": 14.0, "roce": 16.8, "de": 0.14, "prom": 42.28, "valflag": "Fair"},
   "ta": {"ltp": 1474.3, "s200": 1008.4, "d200": 46.2, "rsi": 56.5, "beta": 1.32, "mdd": -29.1, "pos52": 95, "lo52": 640.1, "hi52": 1516.4},
   "sc": {"q": 71, "t": 94, "v": 60, "c": 60, "comp": 73},
   "cat": "Growth already printing — Q1 revenue up 68%, profit nearly doubled; a ₹6,800-crore book and exports up 60%.",
   "bear": "A strategic inventory build dilutes returns on capital; a lower-margin consumer mix.",
   "plan": {"leg1": 1420, "leg2": 1320, "avg": 1376, "stop": 1190, "stopPct": -14.3, "tgt": 1516, "tgtPct": 10.2}},
  "Pick four — Syrma S-G-S, our first small-cap, and pure momentum. [pause] Another electronics maker, but smaller and "
  "faster. [pause] The growth is already printing — revenue up sixty-eight percent, profit nearly doubled. But quality is "
  "only moderate — a fourteen percent return on equity, at seventy-six times earnings. [pause] Technically it's the hottest "
  "of the five — forty-six percent above its two-hundred-day line, near its all-time high, with a high beta. [pause] Score, "
  "seventy-three. [pause] Bull — a sixty-eight-hundred-crore order book. Bear — a stretched balance sheet as it grows. "
  "[pause] Buy near thirteen seventy-six, stop at eleven-ninety."),

 ("p5", "fq_pickdetail", {"tk": "DATAPATTNS", "theme": "Defence electronics", "cap": "Small", "conv": "Medium", "month": 5,
   "line": "radar & avionics, priced for perfection", "color": AMBER,
   "fa": {"pe": 95.8, "pb": 14.92, "roe": 15.2, "roce": 21.9, "de": 0.0, "prom": 42.41, "valflag": "Expensive"},
   "ta": {"ltp": 4624.8, "s200": 3543.5, "d200": 30.5, "rsi": 52.2, "beta": 1.14, "mdd": -29.9, "pos52": 91, "lo52": 2182.5, "hi52": 4866},
   "sc": {"q": 78, "t": 93, "v": 35, "c": 60, "comp": 70},
   "cat": "Fresh ₹771-crore orders, including a ₹586-crore BEL radar contract; up 93% in a year; buying STAC for backward integration.",
   "bear": "A 96-times multiple leaves no room for error; lumpy programme timing; heavy reliance on BEL as a customer.",
   "plan": {"leg1": 4480, "leg2": 4200, "avg": 4349, "stop": 3920, "stopPct": -10.6, "tgt": 4866, "tgtPct": 11.9}},
  "Pick five — Data Patterns, defence electronics, and the most expensive of the lot. [pause] A small-cap that builds radar "
  "and avionics systems. [pause] It's debt-free, with a twenty-two percent return on capital — but at ninety-six times "
  "earnings, the valuation leaves no room for error; our value score is just thirty-five. [pause] Technically it's flying — "
  "thirty percent above its long-term average, up ninety-three percent in a year. [pause] Score, seventy. [pause] Bull — "
  "fresh orders, including a radar contract from B-E-L. Bear — that sky-high multiple and lumpy timing. [pause] Average in "
  "near forty-three-fifty, stop at thirty-nine-twenty. [pause] Five stocks, one method — now you can read any of them yourself."),

 ("r00", "fq_recap", {
   "items": [
     "Fundamentals — is the business good, and fairly priced?",
     "Technicals — what is the price doing: trend, momentum, timing?",
     "One score blends quality, trend, value and risk into a call",
     "Diversify — concentration is the risk you actually control",
     "A price target is a range: value it bear, base, and bull",
     "Buy staggered, on dips — and always set a stop-loss",
   ],
   "closer": "Learn the tools. Then decide for yourself."},
  "So — how to read a portfolio like a quant. [pause] Fundamentals tell you if the business is good, and fairly "
  "priced. Technicals tell you what the price is doing. [pause] Blend four scores into one honest call. [pause] "
  "Diversify — concentration is the risk you control. [pause] Treat a target as a range, and always buy with a "
  "stop. [pause] None of this is investment advice — it's a way of thinking. Learn the tools, then decide for "
  "yourself. Thanks for watching."),
]


def ffdur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=noprint_wrappers=1:nokey=1", path],
                         capture_output=True, text=True, check=True)
    return round(float(out.stdout.strip()), 3)

def tts_chunk(path, text):
    samples, sr = kokoro().create(text, voice=VOICE, speed=1.0, lang=LANG)
    sf.write(path, samples, sr, subtype="PCM_16")

def gen_one(seg_id, text):
    fin = os.path.join(FIN, seg_id + ".wav")
    if os.path.exists(fin):
        return fin, ffdur(fin)
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
    return fin, ffdur(fin)

# ---- captions: proportional per-word timing, wrapped to <=2 lines ----------
def _wrap(text, width=52):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > width and cur:
            lines.append(cur); cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur: lines.append(cur)
    return "\n".join(lines[:2])

def beat_cues(text, dur, t0):
    parts = [p for p in text.split("[pause]")]
    n_pause = len([p for p in text.split("[pause]")]) - 1
    ppause = PAUSE / ATEMPO  # inserted pause is stretched by the same atempo
    all_words = sum(len(p.split()) for p in parts) or 1
    word_time = max(0.0, dur - n_pause * ppause) / all_words
    cues, ct = [], 0.0
    for pi, part in enumerate(parts):
        words = part.split()
        i = 0
        while i < len(words):
            j = min(len(words), i + 9)   # ~9 words per caption card
            chunk = words[i:j]
            d = word_time * len(chunk)
            cues.append([round(t0 + ct, 3), round(t0 + ct + d, 3), _wrap(" ".join(chunk))])
            ct += d; i = j
        if pi < len(parts) - 1:
            ct += ppause
    return cues


manifest, cues, cuts, t = [], [], [], 0.0
for sid, variant, props, text in SEGMENTS:
    path, dur = gen_one(sid, text)
    manifest.append({"id": sid, "wav": path})
    cues.extend(beat_cues(text, dur, t))
    cuts.append({"id": sid, "type": variant, "in_seconds": round(t, 3),
                 "out_seconds": round(t + dur, 3),
                 "props": {**props, "dur": round(dur + GAP, 3)}})
    warn = "  ⚠ LONG >90s" if dur > 90 else ""
    print(f"  {sid:6s} {variant:16s} {dur:6.2f}s{warn}", flush=True)
    t += dur + GAP

# concat narration with gaps
silence = os.path.join(FIN, "_sil.wav")
subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(GAP), silence],
               check=True, capture_output=True)
clist = os.path.join(ROOT, "concat.txt")
with open(clist, "w") as f:
    for i, m in enumerate(manifest):
        f.write(f"file '{m['wav']}'\n")
        if i < len(manifest) - 1:
            f.write(f"file '{silence}'\n")
subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist, "-c", "copy",
                os.path.join(PUBLIC, "narration.wav")], check=True, capture_output=True)

props = {"cuts": cuts, "captions": cues,
         "audio": {"narration": {"src": f"{PREFIX}/narration.wav", "volume": 1.0}}}
json.dump(props, open(os.path.join(ROOT, "artifacts", "edit_decisions.json"), "w"), indent=1)
print(f"\ntotal {t - GAP:.2f}s ({(t-GAP)/60:.2f} min), {len(cuts)} scenes, {len(cues)} caption cues, captions ON")
