#!/usr/bin/env python3
"""The GTT Buy-Schedule, Explained — build (English, prefix `gt`).

Teaches from zero: what a GTT order is, single vs OCO, why you stagger an entry into
two legs below price, how each number is derived from technicals (50/200-DMA, RSI), the
stop and target, reward:risk with valuation honesty, position sizing, then two worked
examples (HAL clean; SYRMA "don't chase"), the 5-month schedule, and placing it in Kite.

Identity: "trading terminal". Voice: Kokoro ONNX af_bella (offline, direct — NOT Voicebox).
Burned-in captions ON. 16:9 1080p30. Single master edit_decisions.json.

Run with the kokoro-onnx venv:
  projects/midcap5-picks-en/.venv/bin/python3 projects/gtt-buying-en/build.py

NUMBERS: illustrative of a real Aug-2026 analysis (live Kite + Screener), matching the
published artifact & Obsidian note. Education, NOT investment advice; a double is framed as
a bull-case tail, never a base case. Disclaimer spoken in the recap.
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
PREFIX = "gt"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
RAW, FIN = os.path.join(ROOT, "assets", "raw"), os.path.join(ROOT, "assets")
for d in (PUBLIC, RAW, os.path.join(ROOT, "artifacts"), os.path.join(ROOT, "renders")):
    os.makedirs(d, exist_ok=True)

# semantic colors mirrored from gt/kit.tsx (dividers pass a color)
CYAN, GREEN, AMBER, VIOLET, ROSE = "#38BDF8", "#34D399", "#FBBF24", "#A78BFA", "#FB7185"

# worked-example data (illustrative, Aug-2026)
HAL = {
    "tk": "HAL", "name": "Hindustan Aeronautics", "sector": "Defence · aircraft", "cap": "Large-cap",
    "ltp": 4861.1, "d50": 4652.9, "d200": 4383, "hi52": 5099, "rsi": 53, "beta": 0.97,
    "leg1": 4760, "trig1": 4775, "q1": 4, "dip1": -1.8,
    "leg2": 4560, "trig2": 4575, "q2": 4, "dip2": -5.9,
    "avg": 4675, "sh": 8, "outlay": 37400,
    "stop": 4090, "stopTrig": 4060, "stopPct": -13.2, "stopRs": 4920, "stopDip": -16.5,
    "tgt": 5099, "tgtPct": 9.1, "rr": 3.8, "up50": 7012, "up100": 9350,
    "note": "Above the 50-DMA; both legs are ordinary pullbacks. High conviction.",
}
SYRMA = {
    "tk": "SYRMA", "name": "Syrma SGS", "sector": "Small-cap · EMS", "cap": "Small-cap",
    "ltp": 1474.3, "d50": 1411, "d200": 1008, "hi52": 1516.4, "pos52": 95, "rsi": 65,
    "leg1": 1420, "trig1": 1428, "q1": 14, "dip1": -3.1,
    "leg2": 1320, "trig2": 1328, "q2": 15, "dip2": -9.9,
    "avg": 1376.3, "sh": 29, "outlay": 39912,
    "stop": 1190, "stopTrig": 1180, "stopPct": -14.3, "stopRs": 5692, "stopDip": -20.0,
    "tgt": 1516.4, "tgtPct": 10.2, "rr": 3.5, "up50": 2064, "up100": 2753,
    "note": "Extended — sitting at its 52-week high. Be patient; do not chase.",
}
DIXON = {
    "tk": "DIXON", "name": "Dixon Technologies", "sector": "Electronics · EMS", "cap": "Mid-cap",
    "ltp": 14650, "d50": 13689, "d200": 12230, "hi52": 18177, "beta": 1.53,
    "leg1": 14300, "trig1": 14360, "q1": 1, "dip1": -2.0,
    "leg2": 13700, "trig2": 13760, "q2": 2, "dip2": -6.1,
    "avg": 13960, "sh": 3, "outlay": 41880,
    "stop": 12100, "stopTrig": 12000, "stopPct": -14.0, "stopRs": 5880, "stopDip": -18.1,
    "tgt": 18177, "tgtPct": 30.2, "rr": 3.6, "up50": 20940, "up100": 27920,
    "note": "₹14.6k/share — only 2–3 shares fit. High beta (1.53): wider legs, roomier stop.",
}
SCHEDULE = [
    {"tk": "HAL", "m": 1, "cap": "Large", "sector": "Defence", "color": CYAN,
     "leg1": 4760, "leg2": 4560, "avg": 4675, "stop": 4090, "tgt": 5099, "rr": 3.8, "outlay": 37400},
    {"tk": "DIXON", "m": 2, "cap": "Mid", "sector": "EMS", "color": GREEN,
     "leg1": 14300, "leg2": 13700, "avg": 13960, "stop": 12100, "tgt": 18177, "rr": 3.6, "outlay": 41880},
    {"tk": "KEI", "m": 3, "cap": "Mid", "sector": "Cables", "color": CYAN,
     "leg1": 5420, "leg2": 5150, "avg": 5310, "stop": 4780, "tgt": 5873, "rr": 4.7, "outlay": 42480},
    {"tk": "SYRMA", "m": 4, "cap": "Small", "sector": "EMS", "color": AMBER,
     "leg1": 1420, "leg2": 1320, "avg": 1376, "stop": 1190, "tgt": 1516, "rr": 3.5, "outlay": 39912},
    {"tk": "DATAPATTNS", "m": 5, "cap": "Small", "sector": "Defence elec.", "color": AMBER,
     "leg1": 4480, "leg2": 4200, "avg": 4349, "stop": 3920, "tgt": 4866, "rr": 4.7, "outlay": 39145},
]

# --------------------------------------------------------------- SCREENPLAY
# (seg_id, variant, props, narration)
SEGMENTS = [
 ("t00", "gt_title", {},
  "You found a good stock. [pause] Now comes the question nobody teaches — how do you actually "
  "buy it well? [pause] In the next half hour, we'll build one complete plan: a staggered G T T "
  "buy-schedule. [pause] From what a G T T even is, to the exact price where every order rests. "
  "From the very beginning."),

 ("t01", "gt_hook", {},
  "Here's the trap. [pause] You like a stock, so you buy your whole position today, at today's "
  "price. [pause] That's a bet on a single moment. [pause] If it dips the next morning, you feel "
  "the whole fall — and you've got no cash left to buy cheaper. [pause] A professional does the "
  "opposite. [pause] They decide, in advance and in writing, exactly where to buy, how much, "
  "where to quit, and where they're aiming. [pause] Then they let orders wait in the market, so "
  "emotion never gets a vote. [pause] That written plan is what we're going to build."),

 ("d1", "gt_divider", {"n": 1, "title": "Order Types", "sub": "Market, limit, and the resting GTT", "color": CYAN, "pips": 4},
  "Part one. Order types. [pause] Before the plan, you need the tool. [pause] Let's meet the three "
  "kinds of order — and the one that makes a schedule possible."),

 ("o01", "gt_ordertypes", {},
  "Every order answers two questions — what price, and for how long. [pause] A market order says: "
  "buy right now, at whatever the price is. Fast, but you don't control the price. [pause] A limit "
  "order says: buy only at my price or better — but it's only valid for today. If it doesn't fill "
  "by the closing bell, it dies. [pause] Then there's the G T T. [pause] It says: buy at my price "
  "— and stay alive, waiting, for up to one whole year. [pause] That single difference — patience "
  "— is what lets you plan an entry weeks before it happens."),

 ("o02", "gt_gttmech", {},
  "G T T stands for Good Till Triggered. [pause] Think of it as a resting instruction. [pause] You "
  "set a trigger price. Then the order just sits there, dormant, doing nothing. [pause] It watches "
  "the last-traded price, tick by tick. [pause] The moment the price touches your trigger, it wakes "
  "up and places your order — automatically. [pause] You don't have to be watching. You don't have "
  "to be awake. [pause] Good till triggered — it waits, patiently, until your condition is finally "
  "met. That's the whole idea."),

 ("o2b", "gt_orderbook", {},
  "So where does this resting order actually sit? [pause] Picture the market as a ladder of prices. "
  "[pause] A normal limit order joins a public queue at the exchange — visible to everyone, and valid "
  "only for today. [pause] A G T T is different. It waits quietly at your broker, not in the exchange "
  "book. [pause] Nobody else sees it. [pause] Only when the price ladder falls to your trigger does "
  "your broker send the real order down to the exchange. [pause] Until then, it simply rests — one "
  "rung on the ladder, waiting for the market to come to it."),

 ("o03", "gt_trigger", {},
  "There are actually two prices in a G T T. [pause] The trigger price — the level that wakes the "
  "order up. [pause] And the limit price — the price the order is then placed at. [pause] For a buy, "
  "you set the trigger a few rupees above your limit. [pause] Why? So that when it fires, the price "
  "is already moving through your limit, and the order actually fills. [pause] For our first stock, "
  "the trigger sits at forty-seven seventy-five, and the limit just below, at forty-seven sixty. "
  "[pause] A small gap — but it's what makes the order marketable when it triggers."),

 ("o04", "gt_oco", {},
  "G T T comes in two flavours. [pause] The first is Single — one trigger, one order. That's your "
  "entry. [pause] The second is O C O: One Cancels the Other. [pause] It holds two triggers on the "
  "same stock at once — a target above the price, and a stop-loss below it. [pause] Whichever one "
  "fires first, the other is cancelled automatically. [pause] So you can bracket a position: if it "
  "runs up, you sell into strength; if it falls, the stop protects you. [pause] One order, two exits, "
  "and you never have to choose in the heat of the moment."),

 ("d2", "gt_divider", {"n": 2, "title": "The Staggered Entry", "sub": "Why two legs beat one buy", "color": GREEN, "pips": 4},
  "Part two. The staggered entry. [pause] Now that we have the tool, here's the core idea of the "
  "whole method — and the simple reason it works."),

 ("s01", "gt_allatonce", {},
  "Let's see the problem clearly. [pause] Buy everything at once, and your average cost is exactly "
  "today's price — one dot on the chart. [pause] Markets don't move in straight lines. Good stocks "
  "still dip five, eight, ten percent along the way. [pause] If you're all-in at the top, that dip "
  "is pure pain, and you have no cash to answer it. [pause] But what if you split the buy? [pause] "
  "Place part of it lower, and part of it lower still. [pause] If the dip comes, you buy it — and "
  "your average cost falls. If it doesn't, you still own a starter position. [pause] You win either way."),

 ("s02", "gt_twolegs", {},
  "So we stagger the entry into two legs, both resting below today's price. [pause] Leg one is a "
  "shallow dip — a normal pullback, one to three percent down. [pause] Leg two is a deeper dip — a "
  "more serious correction, six to ten percent down. [pause] Each leg is a G T T buy, waiting at its "
  "own price. [pause] For H A L, trading near forty-eight sixty, leg one rests at forty-seven sixty, "
  "leg two down at forty-five sixty. [pause] Buy some higher, more lower — and your average lands in "
  "between, at forty-six seventy-five. [pause] Lower than where you started, without predicting a thing."),

 ("d3", "gt_divider", {"n": 3, "title": "Anchor to the Chart", "sub": "Where the numbers actually come from", "color": AMBER, "pips": 4},
  "Part three. Anchoring to the chart. [pause] Those leg prices weren't guesses. [pause] Every "
  "number in the plan is pinned to something real on the chart. Let's see what."),

 ("a01", "gt_dma", {},
  "The anchors are moving averages. [pause] A moving average is just the average of the last N "
  "closing prices, drawn as a smooth line that follows the trend. [pause] Two matter most. [pause] "
  "The fifty-day average — the short-term trend. And the two-hundred-day average — the long-term "
  "trend. [pause] Price tends to fall back toward these lines and bounce. So they act as support. "
  "[pause] For H A L, the fifty-day sits near forty-six fifty, the two-hundred-day near forty-three "
  "eighty. [pause] Leg one hangs at the fifty-day. Leg two reaches toward the deeper support below. "
  "The chart chooses the prices, not us."),

 ("a02", "gt_rsi", {},
  "Now momentum — and this is the R S I, the Relative Strength Index. [pause] It's a single number "
  "from zero to a hundred. [pause] It compares the size of recent gains to recent losses, over "
  "fourteen days. The formula: R S I equals one hundred, minus one hundred over one plus average "
  "gain divided by average loss. [pause] Above seventy, the stock is overbought — it's run hot and "
  "may pause. [pause] Below thirty, it's oversold — beaten down, and may bounce. [pause] Between "
  "forty-five and sixty-five is a healthy, sustainable trend. [pause] One crucial thing: R S I does "
  "not tell you direction. [pause] It only tells you whether a move has gone too far — and that's "
  "exactly what helps you decide whether to chase, or to wait for a deeper leg."),

 ("a2b", "gt_rsiread", {},
  "Let's read R S I on our two names. [pause] H A L sits around fifty-three — right in the calm, "
  "healthy middle. Momentum is fine; there's no rush, and no froth. [pause] So buying the first leg "
  "near the price is reasonable. [pause] Syrma is the opposite. Its R S I is hot, near the top of its "
  "range. [pause] That's the market telling you the move is stretched. [pause] Same tool, opposite "
  "message — one says you may step in; the other says wait for a deeper leg. [pause] R S I doesn't "
  "pick the stock. It paces your entry."),

 ("a03", "gt_legs", {},
  "Let's derive the two legs properly, for H A L. [pause] Start from the price, forty-eight "
  "sixty-one. [pause] Leg one: a shallow pullback of one-point-eight percent, down to forty-seven "
  "sixty — right at the fifty-day line. That's a normal breather in an uptrend. [pause] Leg two: a "
  "deeper dip of nearly six percent, down to forty-five sixty — the kind of correction that only "
  "comes on a bad week. [pause] Notice: leg one you'll probably get; leg two only fills if the "
  "market really sells off. [pause] That's the point. You're not predicting the dip — you're ready "
  "for it, at a price you decided calmly."),

 ("a04", "gt_stoptarget", {},
  "Every entry needs an exit — two, in fact. [pause] First, the stop-loss. [pause] We place it "
  "below leg two, under the two-hundred-day line, at forty ninety. [pause] It's sized so that from "
  "your average of forty-six seventy-five, the most you can lose is about thirteen percent — a "
  "bounded, known amount. If the thesis breaks, the O C O sells automatically. [pause] Second, the "
  "target. [pause] The first objective is the fifty-two-week high, fifty ninety-nine — about nine "
  "percent up. [pause] And to be honest about the dream: a fifty-percent gain needs seventy "
  "twelve; a double needs ninety-three fifty. [pause] Worth knowing — so the goal stays real."),

 ("a05", "gt_rr", {},
  "Now weigh it. [pause] Reward to risk. [pause] For H A L, you're risking about thirteen percent "
  "to your stop, to make about nine percent to the first target — but because the stop is far and "
  "sized in rupees, the plan's reward-to-risk works out near three-point-eight to one. [pause] "
  "Good on paper. [pause] But here's the honesty most videos skip. [pause] The valuation says H A L "
  "is roughly fairly priced already. [pause] The bull case is up sixteen percent; the bear case, "
  "down twenty-four. [pause] So that plus-fifty, plus-hundred? That's a bull tail — a lovely "
  "maybe, not the base case. The growth is already in the price."),

 ("a5b", "gt_valuation", {},
  "There's an even more honest way to check the target — imagine three futures. [pause] A bear case, "
  "where things disappoint. A base case, the middle. And a bull case, where everything goes right. "
  "[pause] For each, you multiply a fair price-to-earnings by the profit you expect. [pause] Then you "
  "weight them by how likely each one is. [pause] For H A L, that weighted value lands right around "
  "today's price. [pause] The bull case is up sixteen percent; the bear case, down twenty-four. "
  "[pause] So the schedule's reward-to-risk looks great, but the valuation says the name is roughly "
  "fair. [pause] Both are true. Hold them together."),

 ("a06", "gt_sizing", {},
  "Last piece — how many shares. [pause] The rule here is one stock a month, with a budget of "
  "thirty to fifty thousand rupees. [pause] You split that budget across the two legs. [pause] For "
  "H A L near forty-seven hundred a share, four shares at leg one and four at leg two — eight "
  "shares in total, an outlay of about thirty-seven thousand four hundred. [pause] The math has to "
  "land on whole shares, so you round. [pause] A pricey stock like Dixon, at fourteen thousand a "
  "share, might only fit two or three shares — that's fine. Size to the budget, not to the ego."),

 ("d4", "gt_divider", {"n": 4, "title": "The Plan in Action", "sub": "Two worked examples, then the schedule", "color": CYAN, "pips": 4},
  "Part four. The plan in action. [pause] Enough theory. Let's run the whole thing end to end on "
  "real names — one clean, one that tests your discipline."),

 ("w01", "gt_hal", {"stock": HAL},
  "Watch the full plan fire, on H A L. [pause] The price drifts down. [pause] It touches forty-"
  "seven sixty — leg one triggers, and four shares are bought. [pause] A rough week takes it lower, "
  "to forty-five sixty — leg two triggers, four more shares. [pause] Eight shares now, at an "
  "average of forty-six seventy-five. [pause] Two exits rest in the market: a stop at forty ninety, "
  "a target at fifty ninety-nine. [pause] If it climbs, the target sells and the stop cancels. If "
  "it breaks, the stop sells and the target cancels. [pause] One plan, placed once — and then you "
  "simply let it work."),

 ("w02", "gt_syrma", {"stock": SYRMA},
  "Now the hard one — Syrma. [pause] Great little company, but look where it's trading: right at its "
  "fifty-two-week high, ninety-five percent of the way up its yearly range. [pause] Its R S I is hot. "
  "[pause] Chase it here, and you're buying the very top. [pause] So the plan demands patience. Leg "
  "one waits three percent down; leg two waits almost ten percent down, on a real correction. [pause] "
  "And here's the discipline: if only leg one fills and the stock just keeps running, you do not "
  "chase leg two higher. [pause] You let it go, and roll that budget to next month. [pause] The plan "
  "protects you from your own excitement."),

 ("w2b", "gt_dixon", {"stock": DIXON},
  "A third example, at a very different scale — Dixon, the electronics maker. [pause] Here one share "
  "costs about fourteen thousand six hundred rupees. [pause] At a monthly budget of forty thousand, "
  "you can only buy two or three shares — one at leg one, two at leg two. [pause] That's fine. [pause] "
  "And Dixon swings hard. Its beta is over one-and-a-half, so it moves faster than the market, both "
  "ways. [pause] So the legs sit a little wider, and the stop, at twelve thousand one hundred, gives "
  "it room to breathe. [pause] Same method — sized and spaced for a wilder, pricier stock."),

 ("w03", "gt_schedule", {"rows": SCHEDULE},
  "Put it together, and you get a schedule — one pick a month, for five months. [pause] H A L, then "
  "Dixon, K E I, Syrma, and Data Patterns. [pause] A defence anchor, two electronics makers, a "
  "cables compounder, and a radar specialist. [pause] Each with the same four numbers: two legs, a "
  "stop, and a target — every one anchored to its own chart. [pause] Spreading the buys across "
  "months is itself a stagger — in time, not just in price. [pause] You're never forced to deploy "
  "everything into one week's mood."),

 ("k01", "gt_kite", {},
  "Finally, placing it — in Kite, conceptually. [pause] You open the stock, choose G T T, and pick "
  "Single for each buy leg — trigger and limit, quantity, done. [pause] For the exits, you choose "
  "O C O, and set the target above and the stop below in one order. [pause] Three golden rules. "
  "[pause] One — never buy blind; always know your stop before you enter. [pause] Two — a G T T "
  "lasts up to a year, so review it; prices and stories change. [pause] Three — this is a plan, not "
  "a promise. The market can gap straight through a trigger. [pause] Discipline is the edge — the "
  "orders just enforce it."),

 ("k1b", "gt_mistakes", {},
  "Before you go, four ways this plan goes wrong. [pause] One — a gap. If bad news hits, the price can "
  "leap straight past your trigger, and you fill lower than planned. The plan bounds risk; it can't "
  "erase it. [pause] Two — a stop set too tight. Put it just under the price, and normal noise will "
  "knock you out. Give it room, below real support. [pause] Three — chasing. The whole point is "
  "patience; if you cancel the wait and buy the top, you've thrown the plan away. [pause] Four — never "
  "reviewing. A G T T lives for a year; check it, because companies and prices change. [pause] Avoid "
  "these four, and the method does its job."),

 ("r00", "gt_recap", {
   "items": [
     "GTT = Good Till Triggered: a resting order, alive up to a year",
     "Single = one entry · OCO = target + stop, one cancels the other",
     "Stagger into two legs BELOW price — average down on dips",
     "Anchor every price to the chart: 50/200-DMA and RSI",
     "Bound the loss with a stop; aim at the 52-week high",
     "Be honest: a double is a bull tail, not the base case",
     "Size to the monthly budget — and never chase a runner",
   ],
   "closer": "Plan the entry and the exit — before emotion arrives."},
  "So — that's the whole staggered G T T buy-schedule. [pause] A G T T is a patient, resting order. "
  "Single is your entry; O C O brackets the exit. [pause] You stagger into two legs below the price, "
  "anchored to the fifty and two-hundred-day lines and read against R S I. [pause] You bound the "
  "loss with a stop, aim at the fifty-two-week high, and stay honest that a double is only the bull "
  "case. [pause] Size to your budget, and never chase. [pause] None of this is investment advice — "
  "it's a way of thinking, and a way of removing emotion from the decision. [pause] Plan the entry, "
  "and the exit, before emotion arrives. Thanks for watching."),
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
    ppause = PAUSE / ATEMPO
    all_words = sum(len(p.split()) for p in parts) or 1
    word_time = max(0.0, dur - n_pause * ppause) / all_words
    cues, ct = [], 0.0
    for pi, part in enumerate(parts):
        words = part.split()
        i = 0
        while i < len(words):
            j = min(len(words), i + 9)
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
