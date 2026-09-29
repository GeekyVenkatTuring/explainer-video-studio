#!/usr/bin/env python3
"""Technical Analysis: The Complete NSE Workbook Course — build script.

7 chapters × ~10–11 min each, rendered per-chapter and concatenated into a
master video. Captions ON (English), Nova voice, no music.
Source: NSE NCFM "Technical Analysis Module" workbook (~/Downloads/Technical analysis workbook.pdf).

Pipeline per chapter: narration TTS (idempotent) -> concat with gaps ->
artifacts/<ch>.json with caption cues -> remotion render -> ffmpeg concat master.

Run:  python3 build.py ch1 ch2 ...   (or all chapters)
"""
import json, os, re, subprocess, sys, time, urllib.request

BASE = "http://127.0.0.1:17493"
PROFILE = "c488e05c-3407-46a3-874d-1b09b3aff78d"  # "TTS Bright (Nova)"
GAP = 0.5
PAUSE = 0.6
ATEMPO = 0.95
PREFIX = "taw"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
RAW = os.path.join(ROOT, "assets", "raw")
FIN = os.path.join(ROOT, "assets")
for d in (PUBLIC, RAW, os.path.join(ROOT, "artifacts"), os.path.join(ROOT, "renders")):
    os.makedirs(d, exist_ok=True)

BULL, BEAR, GOLD, IND, VIOLET = "#34D399", "#FB7185", "#F5B841", "#5EEAD4", "#A78BFA"

def OH(o, h, l, c):
    return {"o": o, "h": h, "l": l, "c": c}

# ============================================================ CHAPTER 1 — FOUNDATIONS
CHAPTERS = {}
CHAPTERS["ch1"] = [
 ("c01_title", "taw_chtitle", {"n": 1, "title": "Foundations",
   "sub": "What technical analysis is — and why it works"},
  "Welcome to the complete Technical Analysis course, built on the official "
  "N S E workbook on technical analysis. [pause] Seven chapters take you from "
  "first principles to a full trading toolkit. [pause] Chapter one. The foundations."),

 ("c01_what", "taw_concept", {
   "kicker": "FOUNDATIONS · DEFINITION", "title": "What is technical analysis?",
   "cards": [
     {"icon": "📈", "label": "PRICE", "sub": "where the instrument has traded", "c": GOLD},
     {"icon": "📊", "label": "VOLUME", "sub": "how many shares changed hands", "c": IND},
     {"icon": "🔗", "label": "OPEN INTEREST", "sub": "live derivative contracts", "c": VIOLET},
   ],
   "note": "patterns + indicators applied to these → judge the NEXT move"},
  "So what exactly is technical analysis? [pause] It is the art and science of "
  "forecasting future prices by studying past price movements. Reading the market's "
  "behavior, not its balance sheet. [pause] We work with three raw ingredients. "
  "Price. Where the stock has been. Volume. How many shares changed hands. And open "
  "interest, which matters in futures and options. [pause] Plot them on a chart, then "
  "apply patterns and indicators to judge where price may go next. Time frames run from "
  "one-minute intraday charts to monthly charts spanning decades. Same tools at every "
  "scale. [pause] Fundamental analysis asks what to buy. Technical analysis asks when. "
  "This course answers the when."),

 ("c01_discount", "taw_chart", {
   "kicker": "FOUNDATIONS · PILLAR ONE", "title": "Price discounts everything",
   "path": [[0, 34], [12, 37], [24, 45], [36, 51], [48, 58], [60, 67], [72, 73], [84, 71], [100, 83]],
   "marks": [{"x": 78, "y": 74, "label": "RESULTS ANNOUNCED HERE", "c": GOLD, "at": 0.56}],
   "note": "the rally led the news — the price had already discounted it", "noteAt": 0.82},
  "Pillar one. Price discounts everything. [pause] Doctor Alexander Elder said it best. "
  "Every price is a momentary consensus of every participant. Large commercial interests, "
  "fund managers, analysts, small traders, and gamblers too. All their knowledge meets in "
  "one number. [pause] Watch this stock rally steadily through the year. The great earnings "
  "announcement lands only here — near the top. The price had already moved long before the "
  "headline existed. Someone knew something. Everyone acted on it. [pause] So technicians never "
  "argue with price. Our job is not to know more than the market. It is to read what the "
  "market is already saying."),

 ("c01_trend", "taw_chart", {
   "kicker": "FOUNDATIONS · PILLAR TWO", "title": "Price movements are not totally random",
   "path": [[0, 25], [10, 39], [16, 32], [28, 47], [34, 41], [48, 59], [54, 52], [68, 69], [74, 63], [88, 81], [96, 75], [100, 86]],
   "marks": [
     {"x": 10, "y": 40, "label": "higher top", "c": BULL, "at": 0.42},
     {"x": 16, "y": 31, "label": "higher bottom", "c": IND, "at": 0.5},
     {"x": 48, "y": 60, "label": "higher top", "c": BULL, "at": 0.58},
     {"x": 54, "y": 53, "label": "higher bottom", "c": IND, "at": 0.66}],
   "accent": BULL,
   "note": "an uptrend announces itself: each peak and trough higher than the last", "noteAt": 0.84},
  "Pillar two. Price movements are not totally random. [pause] Look across centuries of "
  "charts and one truth keeps appearing. Prices move in trends. [pause] Once a trend "
  "establishes itself, the next move is more likely to continue it than reverse it. That "
  "single tendency is the foundation of this entire craft. [pause] See this stock? Higher "
  "top. Higher bottom. Higher top again. Each step up the staircase announces the uptrend. "
  "[pause] The technician's job is simple to state. Identify the trend early. Trade in its "
  "direction. Stay with it while it lasts. If prices were pure noise, no chart could ever "
  "help you. They help — often enough to build a discipline on."),

 ("c01_whatwhy", "taw_compare", {
   "kicker": "FOUNDATIONS · PILLAR THREE", "title": "\u201CWhat\u201D matters more than \u201Cwhy\u201D",
   "left": {"t": "THE TECHNICIAN", "c": IND, "items": [
     "Watches WHAT the price did", "Lives on charts, patterns, indicators",
     "Works on any instrument or timeframe", "Asks: WHEN to buy or sell"]},
   "right": {"t": "THE FUNDAMENTALIST", "c": VIOLET, "items": [
     "Studies WHY the price moved", "Earnings, management, economy",
     "Deep company research", "Asks: WHAT to buy"]}},
  "Pillar three. What matters more than why. [pause] A fundamentalist studies why the price "
  "moved. Earnings. Management quality. Interest rates. A technician studies only what the "
  "price actually did. Nothing else. [pause] Why did the stock rise? Simple. More buyers than "
  "sellers. Demand beat supply. That is the complete answer. [pause] There is an old joke. A "
  "technical analyst knows the price of everything, and the value of nothing. Fair. But value "
  "is an opinion that changes with every analyst. Price is a fact printed on every screen. "
  "[pause] And these methods are universal. Stocks, commodities, currencies, bonds. Any time "
  "frame. What happened always arrives before why."),

 ("c01_assume", "taw_rules", {
   "kicker": "FOUNDATIONS · THE THREE ASSUMPTIONS", "title": "Everything stands on three legs",
   "items": [
     "The market discounts everything — news, hopes, fears are already in the price",
     "Prices move in trends — once established, a trend tends to persist",
     "History repeats — human psychology reprints the same patterns decade after decade"],
   "closer": "Fear, greed, hope — same actors, different decade, same play."},
  "Everything you will learn in this course rests on three assumptions. Memorize them. "
  "[pause] Assumption one. The market discounts everything. Company fundamentals, the "
  "economy, mass psychology — all of it is already reflected in the current price. That is "
  "why we can ignore news and still trade well. [pause] Assumption two. Prices move in "
  "trends. Once established, persistence beats reversal. Every system in this course stands "
  "on this leg. [pause] Assumption three. History repeats itself. Human beings run the "
  "market, and human nature does not change. So the same patterns keep reappearing on "
  "charts, year after year."),

 ("c01_funnel", "taw_funnel", {},
  "How do professionals analyze thousands of stocks? Top-down. Always top-down. [pause] "
  "Step one, study the overall market. Is the index bullish or bearish? Everything starts "
  "there. [pause] Step two, drop to sector charts and shortlist the three to five industry "
  "groups showing the most promise. [pause] Step three, inside each group scan ten to twenty "
  "individual stock charts. Apply your criteria ruthlessly. [pause] You end up with nine to "
  "twelve finalists. Tighten the filters again, and maybe three or four survive. [pause] Zoom "
  "from the ocean down to the right fish. Never start from a hot tip about one fish."),

 ("c01_strengths", "taw_rules", {
   "kicker": "FOUNDATIONS · STRENGTHS", "title": "Why traders rely on it", "accent": BULL,
   "items": [
     "Universal — stocks, futures, forex, commodities, any timeframe",
     "Price leads — chart turns often precede economic data by six to nine months",
     "Timing — spots demand at support and breakouts for better entries",
     "Pictorial history — trends, volatility, volume in one glance"],
   "accent_note": ""},
  "Why has technical analysis survived a century of markets? Four big reasons. [pause] One, "
  "it is universal. The identical tools read a steel stock, gold, the rupee, or a currency "
  "pair. Learn once, apply everywhere. [pause] Two, price leads the economy. Major tops and "
  "bottoms have historically appeared six to nine months before official data confirmed the "
  "turn. Markets sniff change early. [pause] Three, it sharpens timing. Fundamentals may tell "
  "you what deserves buying. Charts show when buyers are actually stepping in — near support, "
  "or on a breakout. Entry timing drives returns. [pause] Four, a chart is pictorial history. "
  "Trends, volatility, volume surges, reactions to events. All visible in one glance."),

 ("c01_weak", "taw_rules", {
   "kicker": "FOUNDATIONS · WEAKNESSES", "title": "Know the limits first", "accent": BEAR,
   "items": [
     "Analyst bias — a permanent bull sees bullish charts everywhere",
     "Open to interpretation — two experts can read one chart opposite ways",
     "Late signals — much of the move may pass before a trend confirms",
     "\u201CAlways another level\u201D — hedged calls, fence-sitting",
     "Settings differ stock by stock — test on the instrument you trade"],
   "closer": "Interpretation, not proof."},
  "Now the honest part. The weaknesses. Know them before you lean on any chart. [pause] "
  "Analyst bias. This is interpretation, not science. A permanent bull will somehow find "
  "bullish patterns everywhere he looks. Awareness is your only defense. [pause] Open to "
  "interpretation. Show the same chart to two experts and they may see opposite things, each "
  "with logical levels to justify the view. [pause] Signals come late. By the time a trend "
  "confirms, a chunk of the move is already behind you. [pause] And technicians hedge forever "
  "— there is always another level, another indicator, one more condition before committing. "
  "Finally, settings differ stock by stock. A fifty-day average may suit Infosys, while "
  "Reliance prefers seventy. Test everything on what you actually trade."),

 ("c01_riskcap", "taw_concept", {
   "kicker": "FOUNDATIONS · THE BIGGEST LESSON", "title": "Control risk before chasing profit",
   "cards": [
     {"icon": "🏦", "label": "CAPITAL IS SCARCE", "sub": "lose it and the game is over", "c": BEAR},
     {"icon": "♻️", "label": "OPPORTUNITIES ARE PLENTIFUL", "sub": "thousands more arrive tomorrow", "c": BULL},
     {"icon": "🛡️", "label": "DISCIPLINE PROTECTS BOTH", "sub": "exact rules for exiting losers", "c": GOLD},
   ],
   "note": "you can be right a thousand times — and be wiped out managing risk badly once"},
  "One lesson towers above everything else in this chapter. Controlling risk matters more "
  "than maximizing profit. [pause] Here is the asymmetry. Your capital is finite. "
  "Opportunities are almost infinite. Miss today's move, and thousands more arrive tomorrow. "
  "But lose your capital... and tomorrow's opportunities mean nothing. [pause] The easiest "
  "thing in trading is getting stubborn on a losing trade. Riding it down while telling "
  "yourself it will come back. Sometimes it does not. [pause] Practiced with discipline, "
  "technical analysis gives you exact parameters for exiting losers. Follow them without "
  "emotion. Waste what is plentiful. Preserve what is scarce."),

 ("c01_recap", "taw_recap", {
   "items": [
     "Technical analysis reads price, volume, open interest — to time the market",
     "Price discounts everything · prices trend · history repeats",
     "\u201CWhat\u201D beats \u201Cwhy\u201D — the price is the fact",
     "Top-down: index → sectors → stocks → finalists",
     "Powerful but subjective — respect bias and late signals",
     "Protect capital first; profit follows survival"],
   "closer": "Charts don't predict the future — they reveal the present."},
  "Let us lock in the foundations. Technical analysis reads price, volume, and open interest "
  "to time markets. Everything rests on three assumptions. Price discounts everything. Prices "
  "move in trends. History repeats. Technicians care about what happened more than why. "
  "Analysis flows top-down, from index to sector to stock. The method is powerful but "
  "subjective, so respect bias and late signals. And protect capital before chasing profit. "
  "[pause] Next chapter — the language traders actually read on screen. Candlesticks."),
]

# ============================================================ CHAPTER 2 — CANDLE CHARTS
CHAPTERS["ch2"] = [
 ("c02_title", "taw_chtitle", {"n": 2, "title": "Candle Charts",
   "sub": "Reading the market's mind — one candle at a time"},
  "Chapter two. Candle charts. [pause] The most popular way to read price action anywhere in "
  "the world. Perfected by Japanese rice traders centuries ago, and still the trader's "
  "favorite view today."),

 ("c02_charts", "taw_concept", {
   "kicker": "CANDLE CHARTS · THE FAMILY", "title": "Three ways to draw a market",
   "cards": [
     {"icon": "📈", "label": "LINE", "sub": "closing prices joined — the clean big picture", "c": IND},
     {"icon": "📊", "label": "BAR", "sub": "high–low bar, ticks for open and close", "c": VIOLET},
     {"icon": "🕯️", "label": "CANDLESTICK", "sub": "body + shadows — psychology made visible", "c": GOLD},
   ],
   "note": "x-axis = time · y-axis = price — every chart is just these two"},
  "Every chart simply plots price against time. X axis, time. Y axis, price. [pause] The line "
  "chart connects closing prices only. Clean and simple — perfect for seeing the big trend at "
  "a glance. [pause] The bar chart adds detail. A vertical bar spans the period's high and low. "
  "A tick on the left marks the open. A tick on the right marks the close. [pause] But the star "
  "of this course is the candlestick. The same four numbers — open, high, low, close — drawn as "
  "a thick body with thin shadows. Instantly readable, instantly emotional. Where bars give you "
  "data, candles give you psychology."),

 ("c02_anatomy", "taw_anatomy", {},
  "Let us dissect a single candle. [pause] The thick rectangle is the real body. It stretches "
  "from the open to the close. The thin lines above and below are shadows — wicks or tails — "
  "and they mark the session's high and low. [pause] Color carries the message. If price closed "
  "above its open, we draw a hollow or green candle. Buyers won that session. If price closed "
  "below its open, we draw a filled red candle. Sellers won. [pause] One glance now tells you "
  "who controlled the session, how far price traveled, and where the fight ended. No formulas. "
  "That is why the world switched to candles."),

 ("c02_hammer", "taw_pattern", {
   "kicker": "ONE-CANDLE PATTERNS", "title": "The Hammer — hammering out a bottom",
   "pre": [74, 68, 62, 57], "range": [26, 78],
   "candles": [OH(56, 60, 34, 59)],
   "anns": [
     {"x": 800, "y": 320, "text": "long lower shadow ≥ 2× body", "c": IND},
     {"x": 800, "y": 470, "text": "small body at top of range", "c": GOLD}],
   "verdict": {"text": "Sellers slammed it down… buyers slammed it back.", "c": BULL},
   "crit": [
     {"text": "lower shadow ≥ 2× body", "c": IND},
     {"text": "little / no upper shadow", "c": IND},
     {"text": "next day: strong green confirm", "c": GOLD}]},
  "Our first pattern. The hammer. [pause] Late in a downtrend, sellers drive price sharply "
  "lower during the day. Then buyers storm back and close it near the high. The shape looks "
  "like a hammer — long lower shadow, small body at the top of the range. [pause] Three checks. "
  "The lower shadow must stretch at least twice the body. Little or no upper shadow. And the "
  "next day must confirm with a strong green candle. [pause] Feel the psychology. Bears pushed "
  "with full force — and failed completely. Their confidence cracks here. A longer shadow means "
  "a harder rejection, and heavy volume on the day makes the signal even more credible."),

 ("c02_hangman", "taw_pattern", {
   "kicker": "ONE-CANDLE PATTERNS", "title": "The Hanging Man — a warning at the top",
   "pre": [28, 35, 43, 50], "range": [22, 78],
   "candles": [OH(57, 61, 35, 59)],
   "anns": [
     {"x": 800, "y": 330, "text": "same shape as a hammer…", "c": IND},
     {"x": 800, "y": 470, "text": "but AFTER an uptrend", "c": BEAR}],
   "verdict": {"text": "First real crack in the rally.\nDemand confirmation.", "c": BEAR},
   "crit": [
     {"text": "appears after an uptrend", "c": BEAR},
     {"text": "body any color, near the top", "c": IND},
     {"text": "confirm: red day or gap down", "c": GOLD}]},
  "Same shape. Opposite meaning. The hanging man. [pause] It appears after an uptrend, not a "
  "decline. During the session, price is knocked far below the open. Buyers rescue it by the "
  "close. Sounds bullish, right? [pause] Think deeper. For the first time in a long rally, "
  "sellers pushed price dramatically lower. Even though buyers recovered, that crack in "
  "confidence is a warning shot. [pause] The body can be either color. Confirmation is "
  "everything — wait for a red candle, or better a gap down, the next day. No follow-through? "
  "No signal."),

 ("c02_star", "taw_pattern", {
   "kicker": "ONE-CANDLE PATTERNS", "title": "Shooting Star & Inverted Hammer",
   "pre": [30, 38, 46, 55], "range": [24, 92],
   "candles": [OH(62, 88, 58, 61)],
   "anns": [
     {"x": 800, "y": 300, "text": "upper shadow ≥ 2× body", "c": IND},
     {"x": 800, "y": 450, "text": "euphoria met a wall\nof sellers", "c": BEAR}],
   "verdict": {"text": "Rally rejected from above.\nTop reversal warning.", "c": BEAR},
   "crit": [
     {"text": "gaps/rallies to new highs… fails", "c": BEAR},
     {"text": "small body near the lows", "c": IND},
     {"text": "confirm: black day or gap down", "c": GOLD}]},
  "Now the shooting star — and its cousin, the inverted hammer. Both carry a small body with a "
  "long upper shadow, at least twice the body. [pause] The inverted hammer appears after a "
  "decline. Bulls push hard intraday, sellers knock price back down — but bulls showed up for "
  "the fight. If the next day opens higher and closes strong, the bottom may be forming. "
  "[pause] The shooting star appears at the END of an uptrend. Price gaps up, spikes to a new "
  "high like a comet... then falls back to close near the low. Euphoria met a wall of supply. "
  "[pause] A black candle, or a gap-down close, the following day confirms the top."),

 ("c02_bullengulf", "taw_pattern", {
   "kicker": "TWO-CANDLE PATTERNS", "title": "Bullish Engulfing",
   "pre": [76, 70, 65, 61], "range": [36, 80],
   "candles": [OH(52, 56, 46, 48), OH(47, 64, 44, 61)],
   "anns": [
     {"x": 810, "y": 310, "text": "day 2 swallows\nday 1 completely", "c": BULL},
     {"x": 810, "y": 480, "text": "opens below prior close\ncloses above prior open", "c": IND}],
   "verdict": {"text": "Buyers overwhelm sellers\nin a single session.", "c": BULL},
   "crit": [
     {"text": "after a clear downtrend", "c": IND},
     {"text": "large body engulfs prior body", "c": BULL},
     {"text": "expanding volume = stronger", "c": GOLD}]},
  "Two-candle patterns now. The bullish engulfing. [pause] After a decline, day one closes as a "
  "small red candle. Sellers still look in charge. [pause] Day two opens lower... and buyers "
  "take absolute control, driving the close ABOVE the prior day's open. The big green body "
  "completely swallows the little red one. [pause] The larger the engulfing body, the more force "
  "behind the reversal. Expanding volume seals it. [pause] The emotion flipped inside one "
  "session. Sellers opened confident. By the close, they were trapped."),

 ("c02_bearengulf", "taw_pattern", {
   "kicker": "TWO-CANDLE PATTERNS", "title": "Bearish Engulfing",
   "pre": [30, 37, 44, 50], "range": [24, 70],
   "candles": [OH(48, 55, 45, 52), OH(54, 57, 39, 42)],
   "anns": [
     {"x": 810, "y": 310, "text": "red body swallows\nthe green one whole", "c": BEAR},
     {"x": 810, "y": 480, "text": "every yesterday-buyer\nis now underwater", "c": IND}],
   "verdict": {"text": "Supply has arrived in size.\nRally in danger.", "c": BEAR},
   "crit": [
     {"text": "after a clear uptrend", "c": IND},
     {"text": "large red body engulfs prior", "c": BEAR},
     {"text": "strongest if shadows engulfed too", "c": GOLD}]},
  "The mirror image. The bearish engulfing. [pause] An uptrend prints a small green candle. "
  "Buyers look comfortable. The next day opens higher — then sellers overwhelm everything, "
  "closing BELOW the prior day's open. A large red body swallows the green one whole. [pause] "
  "Message received. Supply has arrived in size at these prices. Every buyer from yesterday "
  "is suddenly underwater and looking for the exit. [pause] Strongest after a clear rally, with "
  "expanding volume — and most powerful when the red body engulfs not just the prior body, but "
  "its shadows too."),

 ("c02_piercing", "taw_pattern", {
   "kicker": "TWO-CANDLE PATTERNS", "title": "The Piercing Pattern",
   "pre": [78, 72, 66, 62], "range": [30, 84],
   "candles": [OH(64, 67, 38, 42), OH(39, 59, 36, 56)],
   "anns": [
     {"x": 820, "y": 320, "text": "gap-down open…\nthen buyers flood in", "c": BULL},
     {"x": 820, "y": 500, "text": "close > halfway up\nday 1's red body", "c": GOLD}],
   "verdict": {"text": "The deeper the pierce,\nthe stronger the reversal.", "c": BULL},
   "crit": [
     {"text": "long red day one, downtrend", "c": IND},
     {"text": "day 2 opens BELOW day 1 close", "c": IND},
     {"text": "closes above the midpoint", "c": BULL}]},
  "Next, the piercing pattern — a two-candle bottom reversal. [pause] Day one is a long red "
  "candle extending the downtrend. Day two gaps down at the open. Bears feel invincible. "
  "[pause] Then buyers flood in and push price all the way back, closing MORE than halfway up "
  "the prior day's red body. [pause] That halfway rule is the whole game. A feeble close in the "
  "lower half changes nothing. A deep pierce announces genuine demand. [pause] The deeper the "
  "white candle finishes inside the black one, the stronger the signal. Long candles on both "
  "days add force, and heavy volume across the pair confirms it."),

 ("c02_harami", "taw_pattern", {
   "kicker": "TWO-CANDLE PATTERNS · HARAMI = “PREGNANT”", "title": "Harami — the trend catches its breath",
   "fam": [
     {"label": "BULLISH HARAMI — after a fall", "c": BULL,
      "candles": [OH(64, 67, 37, 40), OH(44, 57, 41, 54)]},
     {"label": "BEARISH HARAMI — after a rise", "c": BEAR,
      "candles": [OH(40, 65, 37, 62), OH(56, 58, 44, 47)]},
     {"label": "HARAMI CROSS — doji inside", "c": GOLD,
      "candles": [OH(62, 66, 38, 40), OH(50, 62, 40, 50)]}],
   "verdict": {"text": "Small body inside the big one:\npressure suddenly gone. Confirm next day.", "c": GOLD}},
  "Harami means pregnant in Japanese. A big candle followed by a small one tucked entirely "
  "inside the prior body. [pause] The bullish version forms in downtrends. A long red candle, "
  "then a small body — often green — hiding within it. Selling pressure evaporated overnight. "
  "Shorts get nervous and start covering. [pause] The bearish version appears at tops. A long "
  "green candle, then a small body inside it. The rally has stalled mid-air. [pause] When the "
  "second candle is a doji, we call it a harami cross — maximum indecision, minimum reliability. "
  "Either way, let the next session choose the direction before you act."),

 ("c02_morningstar", "taw_pattern", {
   "kicker": "THREE-CANDLE PATTERNS", "title": "Morning Star — sunrise after the fall",
   "pre": [82, 74, 66, 58], "range": [28, 92],
   "candles": [OH(66, 69, 40, 44), OH(41, 45, 36, 43), OH(46, 60, 44, 58)],
   "anns": [
     {"x": 850, "y": 290, "text": "capitulation", "c": BEAR},
     {"x": 850, "y": 380, "text": "exhaustion — the star", "c": GOLD},
     {"x": 850, "y": 480, "text": "conviction — closes >halfway\nup candle 1", "c": BULL}],
   "verdict": {"text": "Ownership changed hands.\nThe downtrend is breaking.", "c": BULL},
   "crit": [
     {"text": "long red candle in downtrend", "c": IND},
     {"text": "small-bodied star gapping down", "c": GOLD},
     {"text": "green candle deep into body 1", "c": BULL}]},
  "Three-candle stories now. First, the morning star — sunrise for a beaten-down stock. "
  "[pause] Candle one, a long red candle. Downtrend in full flow, capitulation everywhere. "
  "Candle two gaps lower but trades in a tiny range. Exhaustion. The star. [pause] Candle three "
  "is a strong green candle closing at least halfway up the first candle's body. Conviction has "
  "returned. [pause] The story is beautiful. Panic, pause, then power. Ownership changed hands "
  "across those three sessions. Gaps before and after the star make the signal stronger, and "
  "heavy volume proves real money did the moving."),

 ("c02_eveningstar", "taw_pattern", {
   "kicker": "THREE-CANDLE PATTERNS", "title": "Evening Star — darkness after the party",
   "pre": [26, 34, 43, 52], "range": [16, 84],
   "candles": [OH(38, 42, 35, 60), OH(63, 70, 60, 62), OH(58, 60, 42, 45)],
   "anns": [
     {"x": 850, "y": 280, "text": "euphoria", "c": BULL},
     {"x": 850, "y": 360, "text": "stall — the star", "c": GOLD},
     {"x": 850, "y": 470, "text": "sellers seize control\nclose >halfway down body 1", "c": BEAR}],
   "verdict": {"text": "Buyers exhausted at the top.\nSmart money used the exit.", "c": BEAR},
   "crit": [
     {"text": "long green candle in uptrend", "c": IND},
     {"text": "small star gapping up", "c": GOLD},
     {"text": "red candle deep into body 1", "c": BEAR}]},
  "And its dark twin, the evening star. The evening star means darkness is coming. [pause] "
  "Candle one, a long green candle extending the uptrend. Euphoria. Candle two gaps up and "
  "stalls in a tiny range. The star — hesitation at the top. Candle three, a red candle closing "
  "at least halfway down the first body. [pause] Buyers exhausted themselves exactly where "
  "smart money wanted liquidity to sell into. [pause] The deeper the third candle cuts into the "
  "first, the more violent the reversal tends to be. As always, volume reveals the truth "
  "behind the pretty shape."),

 ("c02_doji", "taw_pattern", {
   "kicker": "INDECISION", "title": "The Doji Family",
   "fam": [
     {"label": "DOJI — perfect standoff", "c": GOLD,
      "candles": [OH(50, 72, 29, 50)]},
     {"label": "GRAVESTONE — rally rejected", "c": BEAR,
      "candles": [OH(50, 82, 48, 51)]},
     {"label": "DRAGONFLY — selloff absorbed", "c": BULL,
      "candles": [OH(50, 52, 20, 50)]},
     {"label": "LONG-LEGGED — violent seesaw", "c": VIOLET,
      "candles": [OH(51, 82, 19, 50)]}],
   "verdict": {"text": "Open = close. Nobody won.\nSerious warning at tops; demand proof at bottoms.", "c": GOLD}},
  "Finally, the doji family. Open equals close — a perfect stalemate between buyers and "
  "sellers. [pause] The classic doji is a clean standoff. The gravestone doji stretches a long "
  "shadow upward — a rally completely rejected. The dragonfly stretches downward — a sell-off "
  "completely absorbed. The long-legged doji whipsaws both directions before settling nowhere. "
  "[pause] Context decides everything. At the top of a long rally, a doji is a serious alarm — "
  "indecision among bulls cannot sustain an advance. At bottoms, markets can fall of their own "
  "weight, so demand extra proof there. [pause] One caution. On charts under thirty minutes, "
  "almost every candle looks like a doji. Ignore them there."),
]
