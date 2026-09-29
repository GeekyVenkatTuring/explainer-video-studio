#!/usr/bin/env python3
"""Who Actually Made Money — build (English, prefix `mw`).

A chaptered documentary on people who genuinely made money in Indian markets over
the last six months (Mar–Aug 2026) — against a tape that CRASHED then recovered —
plus two chapters that dissect the FAKE viral profit claims (SEBI orders + red flags).

Every figure is verifiable: disclosed shareholdings (BSE/NSE filings via aggregators),
AMFI/SEBI data, exchange IPO prices. See RESEARCH.md for the numbers table + sources.

Identity: "the market tape". Voice: Kokoro ONNX af_bella (offline, direct). Captions ON.
16:9 1080p30. Renders PER CHAPTER, then concatenates to a master (user's brief).

Run with the kokoro-onnx venv:
  projects/midcap5-picks-en/.venv/bin/python3 projects/market-winners-en/build.py

Idempotent: existing WAVs are reused; delete a seg's assets/<id>.wav to regenerate it.
NOT investment advice; disclaimer spoken in the recap + written in the description.
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
PREFIX = "mw"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
RAW, FIN = os.path.join(ROOT, "assets", "raw"), os.path.join(ROOT, "assets")
CHDIR = os.path.join(ROOT, "artifacts", "ch")
for d in (PUBLIC, RAW, os.path.join(ROOT, "artifacts"), CHDIR, os.path.join(ROOT, "renders")):
    os.makedirs(d, exist_ok=True)

# semantic colors (mirror MWScenes A{})
MONEY, GAIN, BENCH, THEME, RISK = "#FBBF24", "#34D399", "#38BDF8", "#A78BFA", "#FB7185"

# chapter titles (for the master table-of-contents / render manifest)
CHAPTERS = {
    0:  "Cold open — who really got rich?",
    1:  "The Two Questions",
    2:  "The Retail King — Radhakishan Damani",
    3:  "The SMILE Investor — Vijay Kedia",
    4:  "The Big Bull's Legacy — Rekha Jhunjhunwala",
    5:  "The Small-Cap Hunter — Ashish Kacholia",
    6:  "The Diversifier — Mukul Agrawal",
    7:  "The Quiet One — Dolly Khanna",
    8:  "The Professional — Sunil Singhania",
    9:  "The Sugar Baron — Anil Kumar Goel",
    10: "The Sector That Carried the Recovery",
    11: "The 2026 IPO Winners",
    12: "The Boring Winners — SIP & the April Dip",
    13: "Spot the Fake I — The Finfluencer Machine",
    14: "Spot the Fake II — The Red-Flag Checklist",
    15: "What Actually Works",
    16: "Recap & Disclaimer",
}

# ---------- reusable investor-scene props (verified; see RESEARCH.md) ----------
DAMANI = {
    "idx": 1, "total": 8, "color": MONEY, "name": "Radhakishan Damani", "tag": "THE RETAIL KING",
    "worth": 198328, "worthUnit": "cr", "stocks": 13, "asOf": "Apr 2026",
    "holdings": [
        {"nm": "Avenue Supermarts (DMart)", "pct": "67.2%"},
        {"nm": "VST Industries", "pct": "29.1%"},
        {"nm": "3M India", "pct": "1.5%"},
        {"nm": "United Breweries", "pct": "1.2%"},
        {"nm": "India Cements / others", "pct": ""},
    ],
    "strategy": "Extreme concentration in one quality compounder he controls — and near-total silence.",
    "playbook": [
        "~99% of the disclosed book is a single business he built: DMart",
        "Owns companies, not tickers — decade-plus holding periods",
        "No course, no channel, no calls — just patience"],
    "move": "DMart parent Avenue Supermarts anchors a ~1.98 lakh-crore disclosed book",
    "steep": 1.7,
    "foot": "Disclosed shareholding (BSE/NSE filings, aggregator) · as of Apr-2026 · not investment advice",
}
KEDIA = {
    "idx": 2, "total": 8, "color": GAIN, "name": "Vijay Kedia", "tag": "THE SMILE INVESTOR",
    "worth": 1406, "worthUnit": "cr", "stocks": 23, "asOf": "Jun 2026",
    "holdings": [
        {"nm": "Tejas Networks", "pct": ""},
        {"nm": "Atul Auto", "pct": ""},
        {"nm": "Cera Sanitaryware", "pct": ""},
        {"nm": "Heritage Foods", "pct": ""},
        {"nm": "Precision Camshafts", "pct": ""},
    ],
    "strategy": "SMILE: Small in size, Medium in experience, Large aspiration, Extra-large market. Hold 5–10 years.",
    "playbook": [
        "Buys tiny companies with huge runways — then waits, for years",
        "His own rags-to-riches is real: arrived in Mumbai with little, c.1990",
        "Conviction over diversification — a few bets, held through the noise"],
    "move": "Added Eimco Elecon (1.45%) in Jun-2026; still actively compounding",
    "steep": 1.9, "dip": True,
    "foot": "Disclosed shareholding (Trendlyne, BSE/NSE filings) · as of Jun-2026 · not investment advice",
}
REKHA = {
    "idx": 3, "total": 8, "color": MONEY, "name": "Rekha Jhunjhunwala", "tag": "THE BIG BULL'S LEGACY",
    "worth": 46982, "worthUnit": "cr", "stocks": 26, "asOf": "21 Jul 2026",
    "holdings": [
        {"nm": "Titan Company", "pct": "5.3%"},
        {"nm": "Tata Motors", "pct": ""},
        {"nm": "Indian Hotels (Taj)", "pct": ""},
        {"nm": "Metro Brands", "pct": ""},
        {"nm": "Canara Bank / others", "pct": ""},
    ],
    "strategy": "Carry a concentrated, high-conviction book for decades — and prune ruthlessly when a thesis breaks.",
    "playbook": [
        "Book rose ~₹7,756 cr in the Jun-2026 quarter — beating a flat market",
        "Titan is still the engine: a 5.3% stake worth ~₹22,100 cr",
        "Cut a loser hard: Star Health slashed from 15.6% to 3.0%"],
    "move": "₹39,226 cr (31 Mar) → ₹46,982 cr (21 Jul 2026) · +~₹7,756 cr",
    "steep": 1.5,
    "foot": "Portfolio value per Business Standard / disclosed filings · 21-Jul-2026 · not investment advice",
}
KACHOLIA = {
    "idx": 4, "total": 8, "color": BENCH, "name": "Ashish Kacholia", "tag": "THE SMALL-CAP HUNTER",
    "worth": 3274, "worthUnit": "cr", "stocks": 48, "asOf": "Jun 2026",
    "holdings": [
        {"nm": "Shaily Engineering", "v": "₹709 cr"},
        {"nm": "Beta Drugs", "v": "₹278 cr"},
        {"nm": "Knowledge Marine Engg", "v": "₹165 cr"},
        {"nm": "Safa Systems", "v": ""},
        {"nm": "MAN Industries", "v": ""},
    ],
    "strategy": "Cast a wide net of small-cap bets, do brutal homework, and let two or three winners carry the pack.",
    "playbook": [
        "~48 disclosed small-caps — diversified, VC-style position sizing",
        "Book jumped ~47% Q/Q: ₹2,229 cr (Mar) → ₹3,274 cr (Jun-2026)",
        "Early, not loud — names most people have never heard of"],
    "move": "₹2,229 cr (Mar) → ₹3,274 cr (Jun-2026) disclosed · +~47%",
    "steep": 2.1,
    "foot": "Disclosed shareholding (BSE/NSE filings, aggregator) · Jun-2026; below-1% stakes not captured · not advice",
}
MUKUL = {
    "idx": 5, "total": 8, "color": THEME, "name": "Mukul Agrawal", "tag": "THE DIVERSIFIER",
    "worth": 6425, "worthUnit": "cr", "stocks": 73, "asOf": "Dec 2025",
    "holdings": [
        {"nm": "Neuland Laboratories", "v": "₹497 cr"},
        {"nm": "Radico Khaitan", "v": "₹379 cr"},
        {"nm": "ASM Technologies", "v": "₹339 cr"},
        {"nm": "Nuvama Wealth", "v": "₹295 cr"},
        {"nm": "Zota Health Care", "v": "₹292 cr"},
    ],
    "strategy": "One of India's widest star-books — dozens of positions blending momentum with fundamentals.",
    "playbook": [
        "~73 disclosed stocks worth ~₹6,425 cr — breadth as risk control",
        "High hit-rate on multibaggers across pharma, spirits, tech",
        "Kept buying in 2026: added Sudeep Pharma, HCC, Sirca Paints"],
    "move": "Added Sudeep Pharma, HCC & Sirca Paints in 2026; trimmed the froth",
    "steep": 1.8,
    "foot": "Disclosed shareholding (BSE/NSE filings, aggregator) · as of Dec-2025 filing · not investment advice",
}
DOLLY = {
    "idx": 6, "total": 8, "color": GAIN, "name": "Dolly Khanna", "tag": "THE QUIET ONE",
    "worth": 223, "worthUnit": "cr", "stocks": 10, "asOf": "Dec 2025",
    "holdings": [
        {"nm": "Prakash Industries", "v": "₹61 cr"},
        {"nm": "GHCL", "v": "₹50 cr"},
        {"nm": "SOM Distilleries", "v": "₹36 cr"},
        {"nm": "Southern Petrochem (SPIC)", "v": "₹35 cr"},
        {"nm": "Emkay Global", "v": "₹15 cr"},
    ],
    "strategy": "A tiny, patient micro-cap book (run by husband Rajiv Khanna) — buy unloved cyclicals early, exit into strength.",
    "playbook": [
        "Just ~10 disclosed names, ~₹223 cr — proof you don't need scale",
        "Cyclicals bought before the crowd: chemicals, metals, spirits",
        "Low turnover, high patience — the anti-day-trader"],
    "move": "Added Coffee Day, IFB Agro; raised Mangalore Chemicals in recent filings",
    "steep": 1.6,
    "foot": "Disclosed shareholding (BSE/NSE filings) · filings managed by Rajiv Khanna · Dec-2025 · not advice",
}
SINGHANIA = {
    "idx": 7, "total": 8, "color": BENCH, "name": "Sunil Singhania", "tag": "THE PROFESSIONAL",
    "worth": 2290, "worthUnit": "cr", "stocks": 24, "asOf": "Dec 2025",
    "holdings": [
        {"nm": "Himatsingka Seide", "pct": "6.8%"},
        {"nm": "All Time Plastics", "pct": "6.2%"},
        {"nm": "Carysil", "pct": "5.3%"},
        {"nm": "Hindware Home Innovation", "pct": "4.6%"},
        {"nm": "Sarda Energy / others", "pct": ""},
    ],
    "strategy": "A CFA-charterholder's institutional value framework — earnings, valuation and management, applied with discipline.",
    "playbook": [
        "Founder of Abakkus Asset Management (est. 2018); ~₹2,290 cr personal book",
        "Value across capital goods, consumer durables, manufacturing",
        "Process over hunches — the professional's edge is repeatability"],
    "move": "Runs money for others too; the personal book is only the visible part",
    "steep": 1.7,
    "foot": "Disclosed personal shareholding (BSE/NSE filings, aggregator) · as of Dec-2025 · not investment advice",
}
GOEL = {
    "idx": 8, "total": 8, "color": MONEY, "name": "Anil Kumar Goel", "tag": "THE SUGAR BARON",
    "worth": 1974, "worthUnit": "cr", "stocks": 36, "asOf": "Jun 2026",
    "holdings": [
        {"nm": "Triveni Engineering", "pct": "4.6%"},
        {"nm": "TCPL Packaging", "pct": "9.1%"},
        {"nm": "KRBL", "pct": "4.4%"},
        {"nm": "Dalmia Bharat Sugar", "pct": "6.5%"},
        {"nm": "Karnataka Bank", "pct": "1.5%"},
    ],
    "strategy": "Master of unglamorous cyclicals — sugar, rice, paper, textiles — bought cheap and held through the cycle.",
    "playbook": [
        "~36 disclosed stocks, ~₹1,900–2,000 cr — a whole book of 'boring' names",
        "Understands operating leverage: cheap cyclicals, huge upside in an upcycle",
        "Long holding periods; ignores short-term market noise"],
    "move": "Concentrated in the sugar & agri cycle most retail investors overlook",
    "steep": 1.5,
    "foot": "Disclosed shareholding (BSE/NSE filings, aggregator) · Jun-2026; vendor values vary · not advice",
}

# --------------------------------------------------------------- SCREENPLAY
# (seg_id, variant, props, narration, chapter_num)
SEGMENTS = [
 # ===================================================== CH00 · COLD OPEN
 ("t00", "mw_title", {},
  "Over the last six months, your feed was full of it. [pause] Screenshots of one lakh turning "
  "into forty-four. Anonymous traders posing with Lamborghinis. [pause] Everyone, apparently, "
  "got rich. [pause] So here's the honest question this video answers: who actually made money in "
  "the Indian market since the spring — and how much of what you saw was real? [pause] We'll only "
  "use things we can verify — public shareholding disclosures, exchange filings, and SEBI orders. "
  "No invented rags-to-riches. [pause] Let's separate the winners from the fiction.", 0),

 ("t01", "mw_statement",
  {"kicker": "START HERE", "color": RISK,
   "lines": ["Most of what went viral", "was never true.", "But some people", "genuinely got richer.", "This is how."]},
  "Here's the twist those viral posts hide. [pause] The market didn't go up over these six months. "
  "[pause] It fell — hard — and then clawed its way back. [pause] So the people who genuinely made "
  "money did it against the tape, not with it. [pause] That makes their methods worth studying — and "
  "it makes the fakes much easier to spot, once you know what you're looking at.", 0),

 ("t02", "mw_macro",
  {"peak": 26130, "low": 22182.55, "now": 24080, "lowDate": "2 Apr 2026", "nowLabel": "Aug 2026",
   "peakLabel": "Dec 2025", "dropPct": "-16%", "recoverPct": "+9%"},
  "Look at the actual tape. [pause] At the end of December, the Nifty fifty sat near twenty-six "
  "thousand one hundred and thirty — an all-time high. [pause] Then it fell. By the second of April, "
  "it had crashed to twenty-two thousand one hundred and eighty-two — down about sixteen percent in "
  "roughly three months. [pause] From there it recovered, and today it trades near twenty-four "
  "thousand — still below where it began the year. [pause] Read that again. Six months, and the "
  "index is down. [pause] So anyone who tells you this was an easy market to get rich quick in is, "
  "at best, forgetting — and at worst, selling you something.", 0),

 # ===================================================== CH01 · THE TWO QUESTIONS
 ("d01", "mw_divider", {"n": 1, "title": "The Two Questions", "sub": "What 'making money' really means", "color": MONEY, "total": 14},
  "Before we meet the winners, we need two questions. [pause] They sound almost too simple. And "
  "almost nobody actually applies them.", 1),

 ("c11", "mw_statement",
  {"kicker": "QUESTION ONE · IS IT VERIFIABLE?", "color": BENCH,
   "lines": ["Did they truly", "hold the position —", "or just post", "a screenshot?"],
   "sub": "Ownership you can verify beats any claim you can't."},
  "Question one — is it verifiable? [pause] A screenshot of a profit-and-loss screen proves nothing; "
  "it takes thirty seconds to fake. [pause] But when an investor crosses one percent of a listed "
  "company, the exchange forces them to disclose it — by law. [pause] That paper trail — quarterly "
  "shareholding filings — is how we know what India's big investors truly own. [pause] Not what they "
  "claim. What they filed.", 1),

 ("c12", "mw_statement",
  {"kicker": "QUESTION TWO · OVER WHAT, VERSUS WHAT?", "color": THEME,
   "lines": ["A gain means nothing", "without its time frame", "and its benchmark."],
   "sub": "Every real number here comes with its date and its comparison."},
  "Question two — over what time frame, and compared to what? [pause] Doubling your money sounds "
  "incredible — until you learn it took ten years, which is just seven percent a year. [pause] Or "
  "that the whole market doubled right alongside you. [pause] Every real number in this video comes "
  "with its date and its benchmark. [pause] Hold both questions in your head. They are the "
  "difference between an investor and an audience.", 1),

 # ===================================================== CH02 · DAMANI
 ("d02", "mw_divider", {"n": 2, "title": "The Retail King", "sub": "Radhakishan Damani — the man who owns one stock", "color": MONEY, "total": 14},
  "Chapter two. The Retail King. [pause] Our first verified winner made his fortune by doing the "
  "opposite of everything the internet tells you. [pause] He owns, essentially, one stock — and he "
  "almost never talks about it.", 2),

 ("w02", "mw_investor", DAMANI,
  "Meet Radhakishan Damani. [pause] By public filings, his disclosed equity is worth around one "
  "point nine eight lakh crore rupees — nearly two trillion. [pause] And here's the astonishing "
  "part: almost all of it sits in a single company he founded and still controls — Avenue "
  "Supermarts, the parent of DMart. [pause] Sixty-seven percent of it. [pause] The rest — VST "
  "Industries, a slice of three-M India, a little United Breweries — barely moves the needle. "
  "[pause] Damani didn't spread himself across a hundred tips. He built one great business, and "
  "refused to sell it. [pause] No interviews. No course. No channel. No calls. [pause] Just "
  "decades of owning something excellent, and the patience to let it compound. [pause] That "
  "patience is the entire strategy — and it's the rarest thing on your feed.", 2),

 ("c22", "mw_statement",
  {"kicker": "THE LESSON", "color": MONEY,
   "lines": ["He got rich slowly,", "in one thing,", "in silence."],
   "sub": "As a rule: the more someone posts their trades, the less you should trust the returns."},
  "Sit with that. [pause] The richest retail investor in the country got there slowly, in one "
  "business, in near-total silence. [pause] The loudest voices online, meanwhile, are usually "
  "selling access to a secret they don't have. [pause] Here's a rule of thumb worth keeping: the "
  "more someone posts about their trades, the less you should trust their returns.", 2),

 # ===================================================== CH03 · KEDIA
 ("d03", "mw_divider", {"n": 3, "title": "The SMILE Investor", "sub": "Vijay Kedia — small bets, giant patience", "color": GAIN, "total": 14},
  "Chapter three. The SMILE investor. [pause] If Damani is silence, our next winner is the "
  "opposite — loud, joyful, and completely open about how he does it. [pause] And his own life is "
  "the real version of the rags-to-riches dream the fakes only imitate.", 3),

 ("w03", "mw_investor", KEDIA,
  "Vijay Kedia came to Mumbai around nineteen ninety with very little, after his family business "
  "faltered. [pause] He learned the market the slow, painful way — and built a disclosed portfolio "
  "worth roughly one thousand crore rupees today, across about twenty-one companies. [pause] His "
  "method even has a name — SMILE. [pause] Small in size. Medium in experience. Large in "
  "aspiration. Extra-large in market potential. [pause] In plain terms: he buys tiny companies with "
  "room to become big ones — names like Tejas Networks, Atul Auto, Cera Sanitaryware — and then he "
  "does the hardest thing in investing. [pause] He waits. Five years. Ten years. [pause] Even now "
  "he's still adding — a fresh stake in Eimco Elecon this June. [pause] His edge isn't a secret "
  "indicator. It's conviction — and a decade of holding through the noise.", 3),

 ("c32", "mw_quote",
  {"color": GAIN, "quote": "Bulls make money, bears make money — but pigs get slaughtered.",
   "who": "a market maxim Kedia lives by · greed is the real risk"},
  "Kedia likes to say the market rewards courage but punishes greed. [pause] Bulls make money. "
  "Bears make money. But pigs — the greedy ones chasing every hot tip — get slaughtered. [pause] "
  "Every winner in this video, in their own way, learned to sit still. [pause] That's the muscle "
  "the fakes never show you building.", 3),

 # ===================================================== CH04 · REKHA JHUNJHUNWALA
 ("d04", "mw_divider", {"n": 4, "title": "The Big Bull's Legacy", "sub": "Rekha Jhunjhunwala — carrying Rakesh's book", "color": MONEY, "total": 14},
  "Chapter four. The Big Bull's legacy. [pause] India's most famous investor, Rakesh Jhunjhunwala, "
  "passed away in twenty twenty-two. [pause] But his portfolio didn't die with him — his wife, "
  "Rekha, now stewards it. And over these six months, it did something remarkable.", 4),

 ("w04", "mw_investor", REKHA,
  "Rekha Jhunjhunwala's disclosed portfolio was worth about forty-six thousand nine hundred and "
  "eighty-two crore rupees on the twenty-first of July. [pause] That's up nearly seven thousand "
  "seven hundred and fifty crore from thirty-nine thousand two hundred crore at the end of March. "
  "[pause] Now hold that against our earlier chart. [pause] While the index was still clawing back "
  "from its April low, her book jumped almost twenty percent. She didn't just recover — she beat "
  "the market. [pause] The engine, as ever, is Titan — a five-point-three percent stake worth "
  "around twenty-two thousand crore. Titan alone made her richer by roughly three and a half "
  "thousand crore since April. [pause] The rest is classic Jhunjhunwala — Tata Motors, Indian "
  "Hotels, private banks. [pause] And notice what she also did: she cut a losing bet, slashing "
  "Star Health from about sixteen percent down to three. [pause] Concentrated conviction, held for "
  "years, pruned when a thesis breaks. That is how you beat a flat market.", 4),

 ("c42", "mw_statement",
  {"kicker": "THE PATTERN SO FAR", "color": MONEY,
   "lines": ["Three winners.", "Three fortunes.", "Zero day-trading."],
   "sub": "Every one of them owns businesses — and waits."},
  "Stop and notice the pattern. [pause] Three winners in, and not one of them made their money "
  "day-trading, or chasing tips, or timing the market. [pause] They own businesses. They wait. "
  "[pause] Keep that in mind as the names get smaller — because the method doesn't change.", 4),

 # ===================================================== CH05 · KACHOLIA
 ("d05", "mw_divider", {"n": 5, "title": "The Small-Cap Hunter", "sub": "Ashish Kacholia — fifty tiny bets", "color": BENCH, "total": 14},
  "Chapter five. The small-cap hunter. [pause] Not every winner concentrates. Our next investor "
  "does the opposite — dozens of small, careful bets, letting the winners carry the pack.", 5),

 ("w05", "mw_investor", KACHOLIA,
  "Ashish Kacholia is one of India's most respected small-cap specialists. [pause] His disclosed "
  "portfolio spans roughly forty-eight companies — a deliberately wide net across engineering, "
  "pharma, and niche manufacturing. [pause] And it worked, hard, this year: his disclosed book "
  "jumped about forty-seven percent in a single quarter — from around two thousand two hundred "
  "crore in March to over three thousand two hundred crore by June. [pause] His largest bet, "
  "Shaily Engineering Plastics, is worth over seven hundred crore. [pause] The philosophy is "
  "simple to say and brutally hard to do. [pause] Find small companies before the crowd. Do the "
  "homework nobody else will. Size each position so a single mistake can't sink you. [pause] Then "
  "let the two or three that truly work compound into the bulk of your returns. [pause] It's the "
  "venture-capital mindset, applied to listed small-caps — and you've never heard of most of his "
  "names. That's exactly the point. He's early, not loud.", 5),

 ("c52", "mw_statement",
  {"kicker": "CONCENTRATE OR DIVERSIFY?", "color": BENCH,
   "lines": ["Damani owns one stock.", "Kacholia owns fifty.", "Both are right."],
   "sub": "The common factor isn't the count — it's the discipline behind each pick."},
  "Here's something important. [pause] Damani won by owning essentially one stock. Kacholia won by "
  "owning nearly fifty. [pause] So which is correct? [pause] Both. [pause] Concentration and "
  "diversification are just two honest answers to risk. What they share is the discipline behind "
  "every single position — and the patience to hold it. That's the constant.", 5),

 # ===================================================== CH06 · MUKUL AGRAWAL
 ("d06", "mw_divider", {"n": 6, "title": "The Diversifier", "sub": "Mukul Agrawal — breadth as a strategy", "color": THEME, "total": 14},
  "Chapter six. The diversifier. [pause] If Kacholia casts a wide net, our next winner casts the "
  "widest of all — and turns sheer breadth into a strategy.", 6),

 ("w06", "mw_investor", MUKUL,
  "Mukul Agrawal runs one of the broadest star portfolios in India — around seventy-three disclosed "
  "companies, worth roughly six thousand four hundred crore rupees. [pause] Where a beginner sees "
  "chaos, he sees risk control: no single bet can wreck him, so he can hold high-growth names "
  "through gut-wrenching volatility. [pause] His top positions read like a tour of new India — "
  "Neuland Laboratories in pharma, Radico Khaitan in premium spirits, Nuvama in wealth management. "
  "[pause] And crucially, he kept buying through this year's turmoil — adding Sudeep Pharma, "
  "Hindustan Construction, and Sirca Paints while others panicked. [pause] Breadth, plus the nerve "
  "to keep deploying into weakness. That combination is why his hit-rate on multibaggers is among "
  "the best in the business.", 6),

 # ===================================================== CH07 · DOLLY KHANNA
 ("d07", "mw_divider", {"n": 7, "title": "The Quiet One", "sub": "Dolly Khanna — you don't need crores to start", "color": GAIN, "total": 14},
  "Chapter seven. The quiet one. [pause] The names so far command tens of thousands of crores. Our "
  "next winner proves you can play this game brilliantly with a fraction of that.", 7),

 ("w07", "mw_investor", DOLLY,
  "The name Dolly Khanna is famous in Indian markets — though the portfolio is actually run by her "
  "husband, Rajiv, and that's worth saying plainly. [pause] Their disclosed book holds just about "
  "ten stocks, worth a little over two hundred crore rupees. [pause] Tiny, by star-investor "
  "standards — and that's the lesson. [pause] They hunt unloved cyclical companies — chemicals, "
  "metals, sugar, textiles — and buy them before the market cares. Prakash Industries. GHCL. SOM "
  "Distilleries. [pause] Then they hold, quietly, for years, and sell into strength when the crowd "
  "finally arrives. [pause] Low turnover. High patience. No noise. [pause] It's a reminder that the "
  "method scales down — you don't need a fortune to invest like this. You need temperament.", 7),

 ("c72", "mw_statement",
  {"kicker": "THE DEMOCRATISING TRUTH", "color": GAIN,
   "lines": ["A ten-stock,", "two-hundred-crore book", "beat most 'experts'."],
   "sub": "The edge was never capital. It was behaviour."},
  "Let that sink in. [pause] A ten-stock portfolio, run patiently, quietly, from home — outperformed "
  "the vast majority of loud, leveraged 'experts' online. [pause] The edge was never the size of "
  "the account. [pause] It was behaviour. And behaviour is the one thing you can copy for free.", 7),

 # ===================================================== CH08 · SUNIL SINGHANIA
 ("d08", "mw_divider", {"n": 8, "title": "The Professional", "sub": "Sunil Singhania — process over hunches", "color": BENCH, "total": 14},
  "Chapter eight. The professional. [pause] So far, individuals. Now the institutional mind — a "
  "man who turned a repeatable process into a fund empire.", 8),

 ("w08", "mw_investor", SINGHANIA,
  "Sunil Singhania is a chartered financial analyst who founded Abakkus Asset Management in twenty "
  "eighteen. [pause] His personal disclosed book — around twenty-four stocks, worth roughly two "
  "thousand three hundred crore — is only the visible tip; he manages far more for others. [pause] "
  "What sets him apart isn't a hot tip. It's a framework: durable earnings, sane valuations, "
  "trustworthy management — applied the same way, every time, across capital goods, consumer "
  "durables, and manufacturing. [pause] Names like Carysil and Hindware. [pause] The amateur "
  "chases the next big thing. The professional builds a process that survives being wrong — because "
  "over enough decisions, repeatability beats brilliance. [pause] That's the quiet superpower the "
  "finfluencers can never sell you, because you can't fake a process.", 8),

 # ===================================================== CH09 · ANIL KUMAR GOEL
 ("d09", "mw_divider", {"n": 9, "title": "The Sugar Baron", "sub": "Anil Kumar Goel — getting rich on boring", "color": MONEY, "total": 14},
  "Chapter nine. The sugar baron. [pause] Our last individual winner made a fortune in the least "
  "glamorous corner of the market — the one everybody else scrolls past.", 9),

 ("w09", "mw_investor", GOEL,
  "Anil Kumar Goel is known as the sugar baron of Dalal Street. [pause] His disclosed portfolio — "
  "around thirty-six stocks worth close to two thousand crore rupees — is a whole book of 'boring' "
  "names: sugar, rice, paper, packaging, textiles. [pause] Triveni Engineering. Dalmia Bharat "
  "Sugar. K-R-B-L, the basmati company. [pause] Why boring? Because Goel understands operating "
  "leverage. [pause] Buy a cheap, out-of-favour cyclical near the bottom of its cycle, and when the "
  "upturn comes, profits explode — and so does the stock. [pause] He holds for years and ignores "
  "the daily noise completely. [pause] There is no hot sector here, no story stock, no hype. Just a "
  "deep understanding of unglamorous businesses — and the patience to wait for the cycle to turn.", 9),

 ("c92", "mw_statement",
  {"kicker": "NINE WINNERS · ONE THREAD", "color": MONEY,
   "lines": ["Loud or quiet.", "Big or small.", "They all did", "the boring thing."],
   "sub": "Now — the ways ordinary investors made money too."},
  "Nine verified winners. Loud and quiet, giant and tiny, concentrated and diversified. [pause] And "
  "underneath, the same boring thread: own good things, and wait. [pause] But you don't have to be "
  "a billionaire to have made money these six months. [pause] Let's look at how ordinary investors "
  "did it — starting with where the money actually flowed.", 9),

 # ===================================================== CH10 · THE SECTOR
 ("d10", "mw_divider", {"n": 10, "title": "Where the Money Flowed", "sub": "Defence & capex carried the recovery", "color": BENCH, "total": 14},
  "Chapter ten. Where the money actually flowed. [pause] In a market that fell and recovered, the "
  "gains weren't spread evenly. One theme did the heavy lifting.", 10),

 ("s10a", "mw_statement",
  {"kicker": "THE ENGINE OF THE RECOVERY", "color": BENCH,
   "lines": ["When India rebuilt,", "it rearmed.", "Defence led the way."],
   "sub": "Order books, indigenisation, and a record defence budget."},
  "As the market clawed back from its April low, one sector led the charge — defence, and the "
  "broader capital-expenditure story behind it. [pause] Record government spending, a national push "
  "to build weapons at home instead of importing them, and multi-year order books turned companies "
  "like Bharat Electronics and Hindustan Aeronautics into the engines of the recovery.", 10),

 ("s10b", "mw_bars",
  {"kicker": "THE RECOVERY, UNEVENLY SHARED", "title": "One stock, one sector, one index — off the April low", "unit": "%", "color": BENCH,
   "bars": [
     {"label": "Bharat\nElectronics", "v": 55, "c": GAIN, "tag": "from Apr low"},
     {"label": "Defence\nsector", "v": 24, "c": THEME, "tag": "2026 YTD"},
     {"label": "Nifty 50", "v": 9, "c": BENCH, "tag": "off Apr low"}],
   "foot": "BEL rebound per Business Standard (23-May-2026); defence sector YTD (late-Aug); Nifty off its 2-Apr low · not advice"},
  "Look at the gap. [pause] From the April bottom, Bharat Electronics rebounded about fifty-five "
  "percent to record highs. [pause] The defence sector as a whole was up roughly twenty-four "
  "percent for the year. [pause] The Nifty? Up about nine percent off the low. [pause] Same six "
  "months, wildly different outcomes. [pause] The people who made real money weren't smarter than "
  "the index — they were simply standing where the tailwind was blowing.", 10),

 ("s10c", "mw_statement",
  {"kicker": "THE HONEST FOOTNOTE", "color": RISK,
   "lines": ["A tailwind is not", "a guarantee.", "You are seeing this", "after it happened."],
   "sub": "Chasing last quarter's winner is how the next correction finds you."},
  "But here's the honesty most videos skip. [pause] You're seeing this rally after it already "
  "happened. [pause] A structural tailwind is real, but it is not a promise — defence stocks have "
  "run hard, and hot sectors are exactly where the next correction tends to start. [pause] "
  "Recognising a trend is useful. Chasing it blindly, at the top, is how the fakes get their "
  "screenshots.", 10),

 # ===================================================== CH11 · IPO WINNERS
 ("d11", "mw_divider", {"n": 11, "title": "The 2026 IPO Winners", "sub": "Who really made money on listings — and who didn't", "color": MONEY, "total": 14},
  "Chapter eleven. The IPO winners. [pause] If any story fits 'made money in six months', it's the "
  "new listings. A handful genuinely doubled. But the headline hides the truth.", 11),

 ("i11", "mw_bars",
  {"kicker": "IN-WINDOW WINNERS · 2026 IPOs", "title": "The listings that doubled — and the average that didn't", "unit": "%", "color": MONEY,
   "bars": [
     {"label": "Omnitech\nEngineering", "v": 158.4, "c": GAIN, "tag": "since 5 Mar"},
     {"label": "SEDEMAC\nMechatronics", "v": 126.3, "c": GAIN, "tag": "since 11 Mar"},
     {"label": "Shadowfax\nTech", "v": 100.2, "c": GAIN, "tag": "since 28 Jan"},
     {"label": "Avg 2026\nlisting gain", "v": 6.56, "c": RISK, "tag": "across 32 IPOs"}],
   "foot": "Gain from issue price to recent price · avg across ~32 IPOs · most were NOT multibaggers · not advice"},
  "The winners are real. [pause] Omnitech Engineering, listed in March, is up over one hundred and "
  "fifty-eight percent from its issue price. [pause] SEDEMAC Mechatronics, up a hundred and "
  "twenty-six. [pause] Shadowfax, up a hundred percent — a clean double. [pause] Now look at the "
  "last bar. [pause] The average listing gain across all thirty-two IPOs this year? Six-point-five "
  "percent. [pause] For every headline double, there were many that barely moved — or fell.", 11),

 ("i11b", "mw_statement",
  {"kicker": "THE LOTTERY NOBODY MENTIONS", "color": RISK,
   "lines": ["To win the IPO,", "you first have to", "be allotted it.", "Most retail buyers", "aren't."],
   "sub": "Survivorship bias with an official stamp."},
  "And there's a catch even the average hides. [pause] To make that money, you first had to be "
  "allotted the shares — and popular IPOs are so oversubscribed that most small applicants get "
  "nothing at all. [pause] So the viral 'I doubled my money on the IPO' post is survivorship bias "
  "with an official stamp: you hear from the lucky few who got the allotment and the pop — never "
  "from the thousands who applied, got nothing, or bought a dud. [pause] Real, but not "
  "repeatable-on-demand. Know the difference.", 11),

 # ===================================================== CH12 · THE BORING WINNERS
 ("d12", "mw_divider", {"n": 12, "title": "The Boring Winners", "sub": "The SIP investor who quietly beat the experts", "color": GAIN, "total": 14},
  "Chapter twelve. The boring winners. [pause] This is the most important chapter for most of you — "
  "because it's the one strategy on this list that anyone can actually copy.", 12),

 ("s12a", "mw_statement",
  {"kicker": "THE INVISIBLE MAJORITY", "color": GAIN,
   "lines": ["No screenshots.", "No stock tips.", "No timing.", "Just a monthly SIP."],
   "sub": "The most boring plan in India quietly won."},
  "There's a winner these six months who posted nothing, tipped nothing, and timed nothing. [pause] "
  "The ordinary investor with a simple monthly S-I-P — a systematic investment plan into mutual "
  "funds. [pause] The most boring strategy in India. [pause] And when the market crashed in April, "
  "it did something the panicking traders couldn't.", 12),

 ("s12b", "mw_statement",
  {"kicker": "AMFI DATA · MAR 2026", "color": GAIN,
   "lines": ["₹32,087 crore.", "In a single month.", "Bought automatically —", "right into the crash."],
   "sub": "A record monthly SIP flow; five straight months above ₹31,000 crore."},
  "In March, Indians poured a record thirty-two thousand and eighty-seven crore rupees into SIPs — "
  "in a single month. [pause] More than thirty-one thousand crore, every month, for five straight "
  "months. [pause] Here's the magic: those SIP instalments kept buying automatically, on schedule, "
  "right through the April low. [pause] No courage required. No forecast. [pause] The plan bought "
  "the exact bottom that the tip-chasers were too scared to touch.", 12),

 ("s12c", "mw_statement",
  {"kicker": "THE QUIET VICTORY", "color": GAIN,
   "lines": ["The dip you feared", "was the SIP's", "best friend."],
   "sub": "Rupee-cost averaging turns volatility from an enemy into an ally."},
  "That's the whole trick of a SIP. [pause] When prices fall, your fixed rupees simply buy more "
  "units — so a crash lowers your average cost instead of your resolve. [pause] The volatility that "
  "terrified everyone else quietly worked in the SIP investor's favour. [pause] They didn't beat "
  "the market with genius. They beat it with a standing instruction — and the discipline to leave "
  "it alone.", 12),

 # ===================================================== CH13 · SPOT THE FAKE I
 ("d13", "mw_divider", {"n": 13, "title": "Spot the Fake — Part 1", "sub": "The finfluencer machine SEBI is dismantling", "color": RISK, "total": 14},
  "Chapter thirteen. Now the other half of the story — the fakes. [pause] Because while real "
  "investors were quietly compounding, an entire industry was manufacturing fake success. And the "
  "regulator has receipts.", 13),

 ("k13a", "mw_case",
  {"name": "Avadhut Sathe", "alias": "Sathe Trading Academy (ASTA)", "order": "4 Dec 2025",
   "amount": "Rs 546.16 cr", "amountLabel": "Disgorge",
   "charge": "Collected ~Rs 601 cr from over 3.37 lakh people under the cover of 'education' — SEBI called it unregistered advisory built on selective profit-showcasing, and ordered Rs 546.16 cr disgorged.",
   "lesson": "\"Education\" that shows you only the winning trades is not education."},
  "Start with the biggest. [pause] In December twenty twenty-five, SEBI came down on Avadhut Sathe "
  "and his trading academy. [pause] Over eight years, they had collected around six hundred and one "
  "crore rupees from more than three lakh people — under the banner of 'education'. [pause] SEBI "
  "found it was really unregistered investment advice, built on showing off selective wins — and "
  "ordered five hundred and forty-six crore disgorged. [pause] Read that number again. That is the "
  "size of the fake-success industry.", 13),

 ("k13b", "mw_case",
  {"name": "Asmita Patel", "alias": "The She-Wolf of the stock market", "order": "6 Feb 2025",
   "amount": "Rs 53.67 cr", "amountLabel": "Impounded",
   "charge": "Marketed 'courses' that were really unregistered buy/sell advisory; of ~Rs 104 cr earned, SEBI impounded Rs 53.67 cr and barred her and five entities.",
   "lesson": "A glamorous nickname is a marketing budget, not a track record."},
  "Then there's Asmita Patel, who branded herself the she-wolf of the stock market and the options "
  "queen. [pause] SEBI barred her in February twenty twenty-five. [pause] Her 'courses', the "
  "regulator said, were really unregistered buy-and-sell advice — and of roughly one hundred and "
  "four crore rupees earned, more than fifty-three crore was impounded. [pause] The glamorous "
  "nickname wasn't a track record. It was a marketing budget.", 13),

 ("k13c", "mw_case",
  {"name": "Md Nasiruddin Ansari", "alias": "Baap of Chart", "order": "Oct 2023",
   "amount": "Rs 17.2 cr", "amountLabel": "Disgorge",
   "charge": "Built a massive following as a chart 'guru', then sold unregistered advisory; SEBI barred him and ordered Rs 17.2 cr disgorged.",
   "lesson": "A catchy handle and a big following prove reach — never returns."},
  "And the one that named the whole genre — 'Baap of Chart', the self-styled father of charts. "
  "[pause] A huge following, a confident persona, and, SEBI found, unregistered advisory underneath "
  "— with seventeen crore rupees ordered disgorged back in twenty twenty-three. [pause] Three "
  "names, one template. [pause] Build an audience, promise the dream, sell the course. The trading "
  "profits were never the business. You were.", 13),

 # ===================================================== CH14 · SPOT THE FAKE II
 ("d14", "mw_divider", {"n": 14, "title": "Spot the Fake — Part 2", "sub": "The anatomy of a '1 lakh to 44 lakh' claim", "color": RISK, "total": 14},
  "Chapter fourteen. So how do you protect yourself? [pause] Let's dissect the exact claim that "
  "probably brought you here — one lakh turned into forty-four — and build a checklist you can use "
  "on any post, forever.", 14),

 ("f14a", "mw_statement",
  {"kicker": "THE NUMBER THAT ENDS THE DEBATE", "color": RISK,
   "lines": ["SEBI studied", "the traders.", "93% lost money."],
   "sub": "Individual F&O traders, FY22–24. Net losses over ₹1.8 lakh crore."},
  "Before the checklist, one number settles the whole argument. [pause] SEBI studied every "
  "individual trader in the futures and options market. [pause] Ninety-three percent of them lost "
  "money — together, more than one point eight lakh crore rupees over three years. [pause] And "
  "losses got worse the next year, not better. [pause] So when someone shows you one lakh becoming "
  "forty-four, remember: for every account like that — if it's even real — there are roughly nine "
  "that quietly blew up, and you will never see a single one of them.", 14),

 ("f14b", "mw_checklist",
  {"kicker": "SPOT THE FAKE", "title": "Six red flags in a viral profit claim", "color": RISK, "mark": "!",
   "items": [
     {"k": "No SEBI reg number", "d": "A real advisor shows an RIA registration; a finfluencer shows a lifestyle."},
     {"k": "Screenshots, not statements", "d": "Cropped P&L pop-ups are trivially faked; audited broker statements aren't."},
     {"k": "Survivorship only", "d": "You see the one win, never the nine blown accounts behind it."},
     {"k": "'Guaranteed / sure-shot'", "d": "No one can guarantee a market return. The word itself is the tell."},
     {"k": "The course upsell", "d": "The money is made selling you the dream, not trading it."},
     {"k": "One trade, no record", "d": "'1 lakh to 44 lakh' once proves luck — never a repeatable skill."}]},
  "So here's your defence — six red flags. [pause] One: no SEBI registration number — a real "
  "adviser shows one; a finfluencer shows a lifestyle. [pause] Two: screenshots instead of audited "
  "statements — one takes seconds to fake, the other doesn't. [pause] Three: survivorship only — "
  "you see the win, never the losses. [pause] Four: the words 'guaranteed' or 'sure-shot' — an "
  "instant disqualifier. [pause] Five: the course upsell — the real product is the dream. [pause] "
  "Six: a single lucky trade with no track record. [pause] See two or more, and close the tab.", 14),

 # ===================================================== CH15 · WHAT ACTUALLY WORKS
 ("d15", "mw_divider", {"n": 15, "title": "What Actually Works", "sub": "The threads every real winner shared", "color": MONEY, "total": 14},
  "Chapter fifteen. Let's pull it together. [pause] Across nine verified investors and every "
  "ordinary winner, the same handful of threads keep appearing. Copy these, not the screenshots.", 15),

 ("s15", "mw_checklist",
  {"kicker": "THE COMMON THREADS", "title": "Six things every real winner shared", "color": MONEY, "mark": "#",
   "items": [
     {"k": "Quality first", "d": "Great businesses, or a diversified basket of them — never hot tips."},
     {"k": "Time, not timing", "d": "Holding periods measured in years and decades, not days."},
     {"k": "Position sizing", "d": "Never so much in one idea that a single mistake ends the game."},
     {"k": "No ruinous leverage", "d": "They compounded patiently; they did not gamble on borrowed money."},
     {"k": "Bought weakness", "d": "The April crash was treated as a discount, not a disaster."},
     {"k": "Temperament", "d": "The real edge was patience and skepticism — not a secret indicator."}]},
  "Six threads. [pause] One: quality first — own good businesses, or a wide basket of them. [pause] "
  "Two: time, not timing — hold for years. [pause] Three: position sizing — never bet the farm on "
  "one idea. [pause] Four: no ruinous leverage — they compounded, they didn't gamble. [pause] "
  "Five: they bought weakness — the crash was a discount, not a disaster. [pause] Six, and biggest: "
  "temperament. [pause] Every real edge in this video was patience and skepticism. None of it was a "
  "secret indicator. All of it, you can copy — for free.", 15),

 # ===================================================== CH16 · RECAP
 ("r16", "mw_recap",
  {"title": "Who actually made money", "color": MONEY,
   "items": [
     "The winners held quality businesses for years — not days",
     "Some concentrated (Damani), some diversified (Kacholia) — all patient",
     "Rekha Jhunjhunwala's book beat a flat market: +₹7,756 cr in a quarter",
     "Real IPO doubles existed — but the average gain was just 6.6%",
     "The boring SIP investor auto-bought the April crash and won",
     "SEBI barred the finfluencers: Sathe ₹546 cr, Patel ₹53 cr, 'Baap' ₹17 cr",
     "93% of F&O traders lose — assume every unverified 44x is marketing"],
   "closer": "Wealth was built by patience — and protected by skepticism."},
  "So — who actually made money? [pause] Not the loudest accounts. The patient ones. [pause] The "
  "big bulls who held quality for years. Rekha Jhunjhunwala, whose book beat a flat market by "
  "nearly eight thousand crore in a single quarter. [pause] The lucky, disciplined IPO investors — "
  "remembering the average gain was just six percent. [pause] And the quiet SIP investor who "
  "automatically bought the crash everyone else feared. [pause] Meanwhile SEBI was busy barring the "
  "fakes and impounding their crores. [pause] The lesson is almost boring. Wealth was built by "
  "patience — and protected by skepticism.", 16),

 ("r16b", "mw_statement",
  {"kicker": "ONE LAST THING", "color": BENCH,
   "lines": ["This is education,", "not advice.", "Verify everything —", "including this."],
   "sub": "Every figure here is from public disclosures & SEBI orders. Consult a SEBI-registered adviser."},
  "One last thing, and it matters. [pause] Nothing in this video is investment advice — it's a way "
  "of thinking. [pause] Every number came from public disclosures and SEBI orders, and you should "
  "verify all of it yourself, including everything I just told you. [pause] Before you act on any "
  "idea, talk to a SEBI-registered adviser. [pause] The winners weren't the ones with the loudest "
  "claims. They were the ones who could prove them. [pause] Be that investor. Thanks for watching.", 16),
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

# ---- captions: proportional per-word timing, wrapped to <=2 lines --------
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
    n_pause = len(parts) - 1
    ppause = PAUSE / ATEMPO
    all_words = sum(len(p.split()) for p in parts) or 1
    word_time = max(0.0, dur - n_pause * ppause) / all_words
    cues, ct = [], 0.0
    for pi, part in enumerate(parts):
        words = part.split(); i = 0
        while i < len(words):
            j = min(len(words), i + 9)
            chunk = words[i:j]; d = word_time * len(chunk)
            cues.append([round(t0 + ct, 3), round(t0 + ct + d, 3), _wrap(" ".join(chunk))])
            ct += d; i = j
        if pi < len(parts) - 1:
            ct += ppause
    return cues

def make_silence():
    silence = os.path.join(FIN, "_sil.wav")
    if not os.path.exists(silence):
        subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(GAP), silence],
                       check=True, capture_output=True)
    return silence

def concat_wavs(wavs, out):
    silence = make_silence()
    clist = os.path.join(RAW, "_master_concat_%s.txt" % os.path.basename(out).replace(".wav", ""))
    with open(clist, "w") as f:
        for i, w in enumerate(wavs):
            f.write(f"file '{w}'\n")
            if i < len(wavs) - 1:
                f.write(f"file '{silence}'\n")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", clist, "-c", "copy", out],
                   check=True, capture_output=True)

# 1) TTS every beat
built = []  # (seg_id, variant, props, ch, wav, dur)
print("== TTS ==")
for sid, variant, props, text, ch in SEGMENTS:
    path, dur = gen_one(sid, text)
    built.append((sid, variant, props, ch, path, dur, text))
    warn = "  ⚠ LONG >90s" if dur > 90 else ""
    print(f"  ch{ch:02d} {sid:6s} {variant:14s} {dur:6.2f}s{warn}", flush=True)

# 2) per-chapter emission (narration + props JSON, each renders independently)
chapters = sorted(set(ch for *_, ch, _p, _d, _t in [(b[0], b[1], b[2], b[3], b[4], b[5], b[6]) for b in built]))
render_list = []
print("\n== per-chapter artifacts ==")
for ch in sorted(CHAPTERS):
    segs = [b for b in built if b[3] == ch]
    if not segs:
        continue
    wavs = [b[4] for b in segs]
    ch_wav = os.path.join(PUBLIC, f"narration_ch{ch:02d}.wav")
    concat_wavs(wavs, ch_wav)
    cuts, cues, t = [], [], 0.0
    for (sid, variant, props, _ch, wav, dur, text) in segs:
        cues.extend(beat_cues(text, dur, t))
        cuts.append({"id": sid, "type": variant, "in_seconds": round(t, 3),
                     "out_seconds": round(t + dur, 3), "props": {**props, "dur": round(dur + GAP, 3)}})
        t += dur + GAP
    ch_json = os.path.join(CHDIR, f"ch{ch:02d}.json")
    json.dump({"cuts": cuts, "captions": cues,
               "audio": {"narration": {"src": f"{PREFIX}/narration_ch{ch:02d}.wav", "volume": 1.0}}},
              open(ch_json, "w"), indent=1)
    render_list.append({"ch": ch, "json": ch_json, "seconds": round(t - GAP, 2), "title": CHAPTERS.get(ch, "")})
    print(f"  ch{ch:02d}  {t-GAP:6.2f}s  {len(cuts)} scenes  -> {os.path.basename(ch_json)}")

# 3) master narration + master props (single continuous timeline)
master_wavs = [b[4] for b in built]
concat_wavs(master_wavs, os.path.join(PUBLIC, "narration.wav"))
mcuts, mcues, t = [], [], 0.0
for (sid, variant, props, _ch, wav, dur, text) in built:
    mcues.extend(beat_cues(text, dur, t))
    mcuts.append({"id": sid, "type": variant, "in_seconds": round(t, 3),
                  "out_seconds": round(t + dur, 3), "props": {**props, "dur": round(dur + GAP, 3)}})
    t += dur + GAP
json.dump({"cuts": mcuts, "captions": mcues,
           "audio": {"narration": {"src": f"{PREFIX}/narration.wav", "volume": 1.0}}},
          open(os.path.join(ROOT, "artifacts", "edit_decisions.json"), "w"), indent=1)

# 4) render manifest (for Codex): per-chapter render + concat to master
json.dump(render_list, open(os.path.join(ROOT, "artifacts", "render_list.json"), "w"), indent=1)

total = t - GAP
print(f"\nMASTER total {total:.2f}s ({total/60:.2f} min) · {len(mcuts)} scenes · {len(mcues)} caption cues · captions ON")
print(f"chapters emitted: {[r['ch'] for r in render_list]}")
