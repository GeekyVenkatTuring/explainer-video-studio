#!/usr/bin/env python3
"""Daily Trading Algorithms — ADEPT (visible rail) + Feynman edition. Prefix `da`.

Rewrite of the fast `dta` video, paced SLOW: one concept per beat, narration walks the
five ADEPT stages Analogy -> Diagram -> Example -> Plain -> Technical, with a [pause] at
EACH stage boundary so the on-screen A-D-E-P-T rail + 5-line ledger light up in sync.
Kokoro ONNX af_bella, captions ON, 16:9 1080p30. Facts restricted to RESEARCH.md;
strategy charts are synthetic illustrations. Education, NOT investment advice.

Run: projects/midcap5-picks-en/.venv/bin/python3 projects/daily-trading-algos-en/build_adept.py
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

# SLOWER than v1 (0.95/0.6/0.5): more dwell time per frame.
GAP, PAUSE, ATEMPO = 0.6, 0.65, 0.92
PREFIX = "da"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
RAW, FIN = os.path.join(ROOT, "assets_adept", "raw"), os.path.join(ROOT, "assets_adept")
for d in (PUBLIC, RAW, FIN, os.path.join(ROOT, "artifacts"), os.path.join(ROOT, "qa_adept")):
    os.makedirs(d, exist_ok=True)

CYAN, GREEN, AMBER, VIOLET, ROSE = "#38BDF8", "#34D399", "#FBBF24", "#A78BFA", "#FB7185"

# (seg_id, variant, props, narration). Teaching beats: 5 ADEPT stages, [pause] at each boundary.
SEGMENTS = [
 ("s01_title", "da_title", {},
  "A promise before we start. [pause] Every idea here, I'll explain with something you already "
  "know. [pause] We'll use a method called ADEPT — analogy, diagram, example, plain words, then "
  "the technical term. [pause] Today's topic: daily trading algorithms. How machines actually "
  "trade, and the India reality. [pause] None of this is investment advice. It's a way of thinking."),

 ("s02_hook", "da_hook", {},
  "Here's a puzzle. [pause] An order hits the exchange in the blink of an eye. [pause] Nobody "
  "clicked a button. A rule did — a computer following instructions, with no emotion. [pause] "
  "By financial year twenty twenty-four, twelve point eight percent of N S E cash-market turnover "
  "was classified as algo. [pause] That's one scoped number, not a claim about all trading. "
  "[pause] So what is that rule really doing? Let's build it up, from the very beginning."),

 ("s03_div1", "da_div", {"n": 1, "title": "What a Rule Really Does", "sub": "The loop behind every trading bot", "color": CYAN},
  "Part one. [pause] What a trading rule actually does — the simple loop hiding inside every bot."),

 ("s04_loop", "da_loop", {},
  "Think of a vending machine. [pause] You meet its one condition — insert the coin — and it acts, "
  "the same way every single time, with no mood and no hesitation. [pause] A trading algorithm has a "
  "loop just like that: it takes in data, forms a signal, checks risk, sends an order, and receives a "
  "fill. [pause] Here's a real case. Suppose I decide: if the price crosses a line I chose, buy exactly "
  "one lot. The computer watches every tick, and the instant that line is crossed, the order goes — "
  "just one, exactly as written. [pause] In plain words, an algorithm turns incoming data into "
  "controlled orders, and then keeps watching itself. [pause] The technical name for all of this is "
  "algorithmic trading, and the authenticated pipe it sends orders through is called direct market "
  "access, or D M A."),

 ("s05_market", "da_market", {},
  "Now, not everything fast is an algo. [pause] Picture a highway: some cars drive themselves, some "
  "sit in a fast lane near the toll, and some rented the on-ramp. [pause] Those are three different "
  "things. On N S E cash market in financial year twenty twenty-four, algo was twelve point eight "
  "percent of turnover, while co-location was thirty-four point three percent — and co-location is "
  "not an algo share. [pause] In the United States, the I M F put algo near seventy percent of equity "
  "trading — a U S figure, not India. [pause] Here's the example that matters: a co-located order can "
  "still be placed by a human. [pause] Plainly: automation, speed, and access are three separate "
  "choices. [pause] The technical point — high-frequency trading is just a fast subset; the India-wide "
  "share stays unverified."),

 ("s06_div2", "da_div", {"n": 2, "title": "The Strategies", "sub": "Four everyday ideas, on synthetic charts", "color": GREEN},
  "Part two. [pause] The strategies. [pause] These charts use illustrative, synthetic data — never a "
  "backtest, never a promise."),

 ("s07_momentum", "da_momentum", {},
  "Our first strategy is momentum. [pause] Think of pushing a child on a swing — you don't fight it, "
  "you push while it's already moving your way. [pause] To see the trend, we draw two moving averages "
  "on the price: a fast one that reacts quickly, and a slow one that reacts gently. [pause] Here's the "
  "rule in action. When the fast line crosses above the slow line, the recent trend has turned up, so "
  "the algorithm can go long; when the fast line crosses back below, the trend has faded, and it "
  "exits. Notice it never tries to catch the exact bottom — it waits for the turn to be confirmed. "
  "[pause] In plain words, you're riding a move that has already begun, and letting it carry you. "
  "[pause] The technical name is trend, or momentum, trading — and its failure mode is chop: a flat, "
  "sideways market that fakes you long and short, again and again, paying costs each time."),

 ("s08_meanrev", "da_meanrev", {},
  "The next strategy believes the opposite of momentum. [pause] Think of a rubber band — stretch it "
  "too far, and it wants to snap back. [pause] To measure the stretch, we draw volatility bands around "
  "a moving average: an upper band and a lower band that widen when the market gets wild. [pause] For "
  "example, when price pokes below the lower band, and a momentum gauge like R S I looks washed out, "
  "the rule may bet on a bounce back toward the middle. [pause] In plain words, you're betting that an "
  "unusually large move returns toward its own average. [pause] The technical name is mean reversion — "
  "and its danger is the one thing it can't handle: a genuine trend, where cheap simply keeps getting "
  "cheaper, and the band breaks instead of holding."),

 ("s09_breakout", "da_breakout", {},
  "Our third strategy waits for a build-up. [pause] Think of water behind a dam — pressure gathers "
  "quietly, and then it escapes all at once. [pause] On the chart, we take the first stretch of the "
  "session and mark its highest high and lowest low. That box is called the opening range. [pause] "
  "Here's the example. If price pushes above the top of the box, the rule buys the breakout, and "
  "immediately places a stop just below — the exit is decided before the entry. [pause] In plain "
  "words, you're trading the exact moment price escapes a quiet range and starts to run. [pause] The "
  "technical name is the opening-range breakout — and its classic failure is the false breakout, where "
  "price pokes out, sucks everyone in, and snaps right back, often on a news gap."),

 ("s10_vwap", "da_vwap", {},
  "This next one is different — it isn't about what to buy, but how to buy it. [pause] Imagine you "
  "have to buy a huge quantity. Slam it in at once and you'll push the price against yourself; instead "
  "you take small sips, so you don't spook the market. [pause] On the chart, a V W A P line traces the "
  "volume-weighted average price — a fair benchmark for the day — and your child orders try to track "
  "it. [pause] For example, one big parent order of a thousand lots is chopped into twenty small "
  "slices, released through the day so each blends into normal volume. [pause] In plain words, this is "
  "execution: quietly cutting your own footprint, not predicting direction at all. [pause] The "
  "technical names are V W A P and T W A P execution; the risks are market impact and information "
  "leakage — letting others see what you're doing."),

 ("s11_pairs", "da_pairs", {},
  "Here's a cleverer cousin of mean reversion. [pause] Think of two dancers who almost always move "
  "together; you stop watching each one, and just watch the gap between them. [pause] On the chart, "
  "we track the spread between two related stocks, and turn it into a z-score — a number that says how "
  "unusual today's gap is. [pause] For example, when that z-score stretches past two, the rule buys "
  "the cheap leg and shorts the expensive leg, betting the gap closes. [pause] In plain words, you're "
  "trading the relationship, not the market direction. [pause] The technical name is statistical "
  "arbitrage, or pairs trading — and its real danger is a relationship that simply breaks."),

 ("s12_making", "da_making", {},
  "Now, who is on the other side of all these trades? [pause] Often a market maker — think of a "
  "shopkeeper who'll always buy from you at one price and sell at a slightly higher one. [pause] The "
  "picture: the maker posts a bid and an ask around fair value, on both sides at once. [pause] For "
  "example, if both a buyer and a seller trade with those quotes, the maker keeps the little gap "
  "between them — the spread — while carefully managing leftover inventory. [pause] In plain words, "
  "they get paid to provide liquidity, not to predict direction. [pause] The technical risk is "
  "adverse selection — being picked off by someone who knows the price is about to move."),

 ("s13_arb", "da_arb", {},
  "The last strategy is the closest thing to a free lunch — and it usually isn't. [pause] Arbitrage "
  "is like buying mangoes cheaper in one bazaar to sell them dearer in another, at the same moment. "
  "[pause] The picture: compare two prices for the same underlying value — say a stock's cash price "
  "against its futures price. [pause] For example, buy the cheaper leg and sell the dearer leg, and "
  "lock the gap — but only if it beats funding, borrowing, taxes, and fees. [pause] In plain words, "
  "these are tiny, locked gaps, chased instantly by very fast competitors. [pause] The technical name "
  "is cash-futures arbitrage, and its risks are basis, legging, and funding."),

 ("s12_div3", "da_div", {"n": 3, "title": "The India Reality", "sub": "The rulebook, and the honest numbers", "color": AMBER},
  "Part three. [pause] The India reality. [pause] A bot doesn't run in a vacuum — it runs inside a "
  "broker and an exchange rulebook."),

 ("s13_sebi", "da_sebi", {},
  "Think of a driving licence and a number plate — for your bot. [pause] The rulebook has dates, a "
  "speed cap, an identity, and controls. [pause] Here are the pieces. S E B I issued the framework "
  "on the fourth of February twenty twenty-five, and it applies to all brokers from the first of April "
  "twenty twenty-six. [pause] The example threshold: at or below ten orders per second, an A P I algo "
  "gets a generic Algo I D; above it, the algo must be registered. Access needs a static I P and two-"
  "factor login. [pause] Plainly, every bot must be identified, rate-limited, and supervised — the "
  "broker is the principal. [pause] Technically, that's the S E B I retail-algo framework, with an "
  "exchange kill switch and a five-year audit trail."),

 ("s14_costs", "da_costs", {},
  "Now the part that decides everything: costs. [pause] Every trade leaks a little, like a slightly "
  "leaky bucket. [pause] On the chart, gross returns fall into smaller net returns as trading picks "
  "up. [pause] For example: securities-transaction tax of zero point zero five percent on futures, "
  "zero point one five percent on options, plus about twenty rupees a broker order and eighteen "
  "percent G S T — that's a Zerodha example, not every broker. [pause] Plainly, automation is not an "
  "edge; costs decide whether high turnover can survive. [pause] The sobering technical fact: a "
  "S E B I study found ninety-three percent of over one crore individual futures-and-options traders "
  "lost money across financial years twenty twenty-two to twenty-four — losses above one point eight "
  "lakh crore rupees. That's F and O traders, not algo users."),

 ("s15_div4", "da_div", {"n": 4, "title": "Build & Run One", "sub": "The stack, the test, the checklist", "color": VIOLET},
  "Part four. [pause] Building and running one. [pause] The code is the easy part; the controls are "
  "what make it a system."),

 ("s16_stack", "da_stack", {},
  "So how do you actually build one? [pause] Picture a factory line — with a foreman watching, and a "
  "big red emergency stop within reach. [pause] The line runs in order: market data comes in, it's "
  "validated, a signal forms, risk checks it, an order-and-risk system shapes it, the broker A P I "
  "sends it, the exchange fills it, and monitoring plus an end-of-day review close the loop. [pause] "
  "For example, every hand-off should be observable — at any moment you can answer what data arrived, "
  "which check approved it, and which order actually left. If you can't answer that, you can't safely "
  "debug it. [pause] In plain words, the strategy code is just one part; the controls are what make it "
  "a real system. [pause] The technical pieces are the O M S and R M S, reconciliation of intent "
  "against reality, and a kill switch that is tested — not decorative."),

 ("s17_backtest", "da_backtest", {},
  "Before you risk real money, you test the rule on history — but a test will lie to you if you let "
  "it. [pause] Think of a dress rehearsal versus opening night; a perfect rehearsal guarantees "
  "nothing. [pause] On the chart, watch two curves. An overfit strategy looks absolutely brilliant on "
  "the data it was tuned on — that's in-sample — and then flattens or falls apart on fresh data it "
  "never saw, walked forward in time. [pause] So, for example, you split your history into train, "
  "validation, and test; you model every cost and slippage; and you never let the strategy peek at "
  "the future. [pause] In plain words, a good backtest attacks your idea — it doesn't sell it to you. "
  "If it only wins in one narrow setting, it's fragile. [pause] The technical traps are overfitting, "
  "and survivorship and look-ahead bias."),

 ("s18_live", "da_live", {},
  "Finally, going live — treat it like a pilot's checklist before takeoff. [pause] The most important "
  "code doesn't come after the signal; it sits right before the order. [pause] Here it is, in order: "
  "the moment the rule wants to trade, check that there's enough cash and margin, that the order size "
  "is within limits, and that you haven't blown your daily-loss cap — and only then send the tagged "
  "order. If any check fails, reject it and raise an alert. [pause] For example, you paper-trade "
  "first to prove the plumbing, then go live with tiny size, watching for stale feeds, rejected "
  "orders, and duplicates. [pause] In plain words: size small, monitor everything, and be as ready to "
  "stop as you are to trade. [pause] Technically, that's pre-trade risk management — and very often, "
  "the strongest line of code you write is the one that prevents a trade."),

 ("s19_recap", "da_recap", {
   "items": [
     "A trading algorithm is a rule: data -> signal -> risk -> order -> fill",
     "Not everything fast is an algo — HFT is a subset, not the whole",
     "Momentum, mean reversion, breakout, VWAP — each a simple rule, each fails a way",
     "India: your bot needs an Algo ID, static IP, and supervision (SEBI, 1 Apr 2026)",
     "Costs decide survival — and 93% of individual F&O traders lost money",
     "Backtest attacks the idea; controls and a kill switch make it a system",
     "Automation is not an edge — synthetic charts here are not backtests",
   ],
   "closer": "Build systems that can say no."},
  "So, the whole map. [pause] A trading algorithm is a rule connected to data, risk, routing, and "
  "monitoring. [pause] The strategies differ — momentum, mean reversion, breakout, execution — but "
  "each can fail through costs, bad assumptions, or a changing market. [pause] India adds identity, "
  "rate limits, and audit trails. [pause] Automation is not an edge. [pause] Educational information "
  "from public sources, not investment advice. Please consult a S E B I-registered adviser. [pause] "
  "Thanks for watching."),
]

CHAPTERS = [range(0, 5), range(5, 10), range(10, 13), range(13, 16), range(16, 21)]

def ffdur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=noprint_wrappers=1:nokey=1", path], capture_output=True, text=True, check=True)
    return round(float(out.stdout.strip()), 3)

def tts_chunk(path, text):
    samples, sr = kokoro().create(text, voice=VOICE, speed=1.0, lang=LANG)
    sf.write(path, samples, sr, subtype="PCM_16")

def gen_one(seg_id, text):
    fin = os.path.join(FIN, seg_id + ".wav")
    if os.path.exists(fin): return fin, ffdur(fin)
    chunks = [c.strip() for c in text.split("[pause]") if c.strip()]
    paths = []
    for ci, chunk in enumerate(chunks):
        cp = os.path.join(RAW, f"{seg_id}_c{ci}.wav")
        if not os.path.exists(cp): tts_chunk(cp, chunk)
        paths.append(cp)
    psil = os.path.join(RAW, "_pause.wav")
    if not os.path.exists(psil):
        subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(PAUSE), psil], check=True, capture_output=True)
    clist = os.path.join(RAW, f"{seg_id}_concat.txt")
    with open(clist, "w") as f:
        for i2, p2 in enumerate(paths):
            f.write(f"file '{p2}'\n")
            if i2 < len(paths) - 1: f.write(f"file '{psil}'\n")
    af = f"atempo={ATEMPO}" if ATEMPO != 1.0 else "anull"
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist, "-filter:a", af, fin], check=True, capture_output=True)
    return fin, ffdur(fin)

def _wrap(text, width=52):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > width and cur: lines.append(cur); cur = w
        else: cur = (cur + " " + w).strip()
    if cur: lines.append(cur)
    return "\n".join(lines[:2])

def beat_cues(text, dur, t0):
    parts = [p for p in text.split("[pause]")]
    n_pause = len(parts) - 1
    ppause = PAUSE / ATEMPO
    all_words = sum(len(p.split()) for p in parts) or 1
    word_time = max(0.0, dur - n_pause * ppause) / all_words
    cues, ct = [], 0.0
    for pi, part in enumerate(parts):
        words = part.split(); i = 0
        while i < len(words):
            j = min(len(words), i + 9); chunk = words[i:j]; d = word_time * len(chunk)
            cues.append([round(t0 + ct, 3), round(t0 + ct + d, 3), _wrap(" ".join(chunk))]); ct += d; i = j
        if pi < len(parts) - 1: ct += ppause
    return cues

def concat_wavs(paths, out):
    sil = os.path.join(FIN, "_gap.wav")
    subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(GAP), sil], check=True, capture_output=True)
    lst = os.path.join(FIN, "_join.txt")
    with open(lst, "w") as f:
        for i, p in enumerate(paths):
            f.write(f"file '{p}'\n")
            if i < len(paths) - 1: f.write(f"file '{sil}'\n")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out], check=True, capture_output=True)

# generate all + master
manifest, cues, cuts, t = [], [], [], 0.0
durs = []
for sid, variant, props, text in SEGMENTS:
    path, dur = gen_one(sid, text)
    manifest.append(path); durs.append(dur)
    cues.extend(beat_cues(text, dur, t))
    cuts.append({"id": sid, "type": variant, "in_seconds": round(t, 3), "out_seconds": round(t + dur, 3),
                 "props": {**props, "dur": round(dur + GAP, 3)}})
    print(f"  {sid:14s} {variant:14s} {dur:6.2f}s" + ("  ⚠ LONG >90s" if dur > 90 else ""), flush=True)
    t += dur + GAP

concat_wavs(manifest, os.path.join(PUBLIC, "narration.wav"))
json.dump({"cuts": cuts, "captions": cues, "audio": {"narration": {"src": f"{PREFIX}/narration.wav", "volume": 1.0}}},
          open(os.path.join(ROOT, "artifacts", "edit_decisions_adept.json"), "w"), indent=1)

# per-chapter
for ci, idxs in enumerate(CHAPTERS, 1):
    cc, qc, ct, pp = [], [], 0.0, []
    for i in idxs:
        sid, variant, props, text = SEGMENTS[i]; d = durs[i]; pp.append(manifest[i])
        cc.append({"id": sid, "type": variant, "in_seconds": round(ct, 3), "out_seconds": round(ct + d, 3),
                   "props": {**props, "dur": round(d + GAP, 3)}})
        qc.extend(beat_cues(text, d, ct)); ct += d + GAP
    concat_wavs(pp, os.path.join(PUBLIC, f"ch{ci:02}.wav"))
    json.dump({"cuts": cc, "captions": qc, "audio": {"narration": {"src": f"{PREFIX}/ch{ci:02}.wav", "volume": 1.0}}},
              open(os.path.join(ROOT, "artifacts", f"edit_decisions_adept_ch{ci:02}.json"), "w"), indent=1)
    print(f"CH{ci:02} {ct - GAP:6.2f}s ({(ct - GAP)/60:.2f} min)")

print(f"\nTOTAL {t - GAP:.2f}s ({(t - GAP)/60:.2f} min) · {len(cuts)} scenes · {len(cues)} caption cues · af_bella · ADEPT")
