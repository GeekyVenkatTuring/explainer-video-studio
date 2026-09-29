#!/usr/bin/env python3
"""IPO REPORT CARD — "What They FILED vs Where They Are NOW" (ENGLISH).
One comparison video across all 20 mainboard IPOs listed from 30 July through
28 August 2026. Reuses the `sm` scene set (cut type sm_* -> SMScene). TTS =
Kokoro ONNX af_bella (speed 0.90), the user's standard explainer voice.

DATA: see DATA.md in this folder for the full triangulated numbers table + per-figure
sources (web-triangulated 2026-08-29). RHP-side figures come from ipo-series-en/build.py
(RHP-based reporting). "NOW" figures = live price / mcap / Q1 FY27, as-of dates shown.
GMP is UNOFFICIAL. Education, NOT investment advice.

Five lenses: RETURNS (did the pop hold?) · GROWTH (FY26 + Q1 FY27) · MARGINS (FY26 PAT
margin) · VALUATION (P/E now) · LEVERAGE (where the fresh money went).

Usage: python3 build.py            (build the single comparison video -> artifacts/comparison.json)
"""
import json, os, re, subprocess, sys, time
import numpy as np, soundfile as sf, kokoro_onnx

# ---- config ------------------------------------------------------------------------------------
VOICE = "af_bella"; SPEED = 0.90; GAP = 0.5; PAUSE = 0.5; PREFIX = "ir"; CH = "comparison"
MODEL  = os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx")
VOICES = os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")
ROOT = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX); RAW = os.path.join(ROOT, "assets", "raw"); FIN = os.path.join(ROOT, "assets")
for d in (PUBLIC, RAW, os.path.join(ROOT, "artifacts"), os.path.join(ROOT, "renders")):
    os.makedirs(d, exist_ok=True)

DISCLAIMER = ("One last thing, and it matters. [pause] Everything here is compiled from public "
    "sources, with the figures dated on screen. For the newest listings some numbers are still "
    "provisional. [pause] This is education, not investment advice, and not a buy or sell call. "
    "Growth can slow, and prices can fall below where they list. Read the company's own filings, "
    "and speak to a SEBI-registered adviser before you invest. [pause] Thanks for watching.")

# semantic colours
GOOD="#34D399"; WARN="#FBBF24"; BAD="#F87171"; MKT="#38BDF8"; VIO="#A78BFA"; TEAL="#2DD4BF"

# =================================================================================================
# SCREENPLAY  (id, variant, props, narration)
# =================================================================================================
SEGMENTS = [

("title","sm_ptitle",
 {"title":"IPO Report Card","sub":"What 7 companies FILED  vs  where they are NOW · Aug 2026",
  "kicker":"RHP PROMISES vs Q1 RESULTS & LIVE PRICE · EDUCATION, NOT ADVICE"},
 ("Seven companies. [pause] A few weeks ago, each of these was just a prospectus — a stack of promises on "
  "paper. [pause] Today they are live stocks, with real prices, and for some, their very first results as a "
  "public company. [pause] Manipal Health. Dhoot Transmission. Molbio Diagnostics. Lalithaa Jewellery. "
  "Juniper Green Energy. Ardee Industries. And Technocraft Ventures. [pause] In this video we put what each "
  "one filed right next to where it trades now. [pause] And we ask the only question that matters when you "
  "have money ready. At today's price, is this a good time to buy?")),

("lenses","sm_checklist",
 {"kicker":"HOW WE'LL JUDGE ALL SEVEN","title":"Five Lenses","color":MKT,"icon":"🔎","items":[
   "Returns — did the listing pop actually hold, or melt away?",
   "Growth — is revenue still climbing after the IPO?",
   "Margins — how much profit does each rupee of sales keep?",
   "Valuation — is it cheap, or priced for perfection?",
   "Leverage — how much of the fresh money just went to repay debt?"]},
 ("We'll run every company through the same five lenses. [pause] One. Returns — did the listing-day pop hold, "
  "or did it melt away? [pause] Two. Growth — is revenue still climbing now that it's listed? [pause] Three. "
  "Margins — out of every hundred rupees of sales, how much does the company actually keep? [pause] Four. "
  "Valuation — is the stock cheap, or priced for perfection? [pause] And five. Leverage — how much of the "
  "money you handed over simply went to pay off old debt? [pause] Same five questions, all seven names. Let's "
  "start with the one everyone checks first — the return.")),

# ---------------- LENS 1 · RETURNS ----------------
("d1","sm_divider",{"n":1,"title":"Returns","sub":"Did the listing pop hold?","color":MKT},
 ("Lens one. [pause] Returns since the I-P-O.")),

("returns","sm_peers",
 {"kicker":"LENS 1 · RETURN vs ISSUE PRICE","title":"Where Each Stock Trades vs Its IPO Price",
  "color":GOOD,"unit":"%","dec":2,"peLabel":"gain over issue price (%) · as of ~28 Aug 2026","rows":[
   {"name":"Dhoot Transmission","pe":72.20,"note":"₹871 → ₹1,499.85"},
   {"name":"Technocraft Ventures","pe":55.83,"note":"₹212 → ₹330.37"},
   {"name":"Manipal Health","pe":30.76,"note":"₹590 → ₹771.50"},
   {"name":"Molbio Diagnostics","pe":28.46,"note":"₹807 → ₹1,036.65"},
   {"name":"Lalithaa Jewellery","pe":27.46,"note":"₹201 → ₹256.19"},
   {"name":"Juniper Green","pe":11.91,"note":"₹225 → ₹251.80"},
   {"name":"Ardee Industries","pe":11.89,"note":"listed +35.85%, gave it back","hi":True}],
  "verdict":"Every one is above its issue price — but a listing pop is not the same as a gain you keep."},
 ("Here's every stock against the price it sold shares at. [pause] The good news first — all seven trade above "
  "their I-P-O price. [pause] Dhoot Transmission leads, up seventy-two point two zero percent, from eight "
  "seventy-one to about fifteen hundred rupees. Technocraft is up fifty-five point eight three percent. "
  "[pause] Manipal, Molbio and Lalithaa sit in a tight pack, up roughly twenty-seven to thirty-one percent. "
  "[pause] Now look at the bottom. Ardee Industries — up just eleven point eight nine percent. [pause] That "
  "number hides a story. Ardee listed thirty-six percent higher. Then it handed almost all of it back. "
  "[pause] Which is the trap nobody warns you about.")),

("poptrap","sm_iconcards",
 {"kicker":"LENS 1 · THE LISTING-POP TRAP","title":"The Pop Is Not the Gain","color":WARN,"items":[
   {"emoji":"📉","k":"Ardee: +35.85% → +11.89%","v":"Listed at ₹72 over a ₹53 issue, then slid to ₹59.30 as its first quarter disappointed. The debut buyer is nearly flat","chip":"GAVE IT BACK"},
   {"emoji":"📈","k":"Dhoot & Technocraft: pop HELD","v":"Both listed 30-plus percent up and then climbed further. The market kept believing the story after day one","chip":"HELD & GREW"},
   {"emoji":"🎯","k":"The lesson","v":"Listing day is hype and scarcity. Where a stock settles weeks later, once results arrive, is the real verdict","chip":"WAIT & SEE"}]},
 ("Think about what a listing pop actually is. [pause] On day one, very few shares are available and excitement "
  "is at its peak, so the price jumps. [pause] Ardee jumped almost thirty-six percent — to seventy-two rupees. "
  "[pause] But when its first results landed and disappointed, the price slid all the way down to about "
  "fifty-nine rupees. [pause] Anyone who bought that exciting debut is now barely ahead. [pause] Compare that "
  "with Dhoot and Technocraft, where the pop held and the stock climbed further. [pause] So the lesson for a "
  "buyer today is simple. The pop is hype. Where the stock settles weeks later, once real numbers arrive, is "
  "the honest verdict.")),

# ---------------- LENS 2 · GROWTH ----------------
("d2","sm_divider",{"n":2,"title":"Growth","sub":"Is revenue still climbing?","color":GOOD},
 ("Lens two. [pause] Growth — the engine underneath the price.")),

("growth","sm_peers",
 {"kicker":"LENS 2 · REVENUE GROWTH (FY26, the year they filed)","title":"How Fast Sales Grew Into the IPO",
  "color":GOOD,"unit":"%","dec":1,"peLabel":"FY26 revenue growth, year-on-year (%)","naText":"FY26 YoY not disclosed","rows":[
   {"name":"Ardee Industries","pe":57.0,"note":"but watch the margin — see next"},
   {"name":"Lalithaa Jewellery","pe":48.1,"note":"total income · profit nearly tripled","hi":True},
   {"name":"Molbio Diagnostics","pe":41.6,"note":"Truenat test kits"},
   {"name":"Juniper Green","pe":41.3,"note":"renewable capacity ramp"},
   {"name":"Dhoot Transmission","pe":31.3,"note":"auto wiring · EV tailwind"},
   {"name":"Technocraft Ventures","pe":23.5,"note":"govt EPC order book"},
   {"name":"Manipal Health","pe":None,"note":"hospital roll-up"}],
  "verdict":"Strong top-line growth almost everywhere — but growth alone tells you nothing about profit quality."},
 ("Now the growth engine — how fast sales grew in the year they filed. [pause] And on the surface, it looks "
  "great. [pause] Ardee grew revenue fifty-seven percent. Lalithaa's income rose forty-eight point one "
  "percent, and its profit nearly tripled. [pause] Molbio and Juniper both grew around forty-one percent. "
  "Dhoot thirty-one, Technocraft twenty-three. [pause] These are genuinely fast-growing businesses. [pause] "
  "But here's the catch a beginner misses. [pause] Fast sales growth tells you nothing about whether that "
  "growth is profitable. [pause] A company can sell far more and earn less on each sale. [pause] So the real "
  "test isn't the year they filed — it's the first quarter AFTER listing. Let's look at who has reported.")),

("q1","sm_iconcards",
 {"kicker":"LENS 2 · FIRST QUARTER AS A PUBLIC COMPANY (Q1 FY27)","title":"Growth Quality — the Real Test","color":TEAL,"items":[
   {"emoji":"🏥","k":"Manipal: sales +38%, profit −7.48%","v":"Revenue surged, but interest on debt raised to buy Sahyadri Hospitals pulled net profit DOWN. Adjusted for that, profit rose ~31%","chip":"DEBT DRAG"},
   {"emoji":"🔋","k":"Ardee: sales +36%, margin crushed","v":"Revenue grew, but operating margin fell from 13.44% to 9.90% as scrap costs rose. Profit up only 5.85%","chip":"MARGIN SQUEEZE"},
   {"emoji":"☀️","k":"Juniper: income +79%","v":"Commissioned 601 MWp of solar plus a 403 MWh battery system and signed new power contracts. Capacity is delivering","chip":"ON TRACK"},
   {"emoji":"⏳","k":"The other four: too early","v":"Dhoot, Molbio, Lalithaa and Technocraft listed only days ago — their first post-IPO quarter isn't out. Don't conclude yet","chip":"WAIT"}]},
 ("Only three of the seven have reported their first quarter as a listed company — and they tell three "
  "very different stories. [pause] Manipal grew sales thirty-eight percent, but net profit FELL seven point "
  "four eight percent. [pause] Why? Interest on the debt it took to buy another hospital chain ate the growth. "
  "Strip that out, and profit actually rose about thirty-one percent. [pause] Ardee grew sales thirty-six "
  "percent — but its operating margin was crushed, from thirteen point four four percent down to nine point "
  "nine zero. Profit crawled up under six percent. [pause] Juniper, by contrast, grew income seventy-nine "
  "percent by switching on new solar and battery capacity. [pause] And the other four? They listed only days "
  "ago. Their first quarter isn't out. So for them, the honest answer is — wait.")),

# ---------------- LENS 3 · MARGINS ----------------
("d3","sm_divider",{"n":3,"title":"Margins","sub":"Profit kept per ₹100 of sales","color":WARN},
 ("Lens three. [pause] Margins — the quality of every rupee.")),

("margins","sm_peers",
 {"kicker":"LENS 3 · NET PROFIT MARGIN (FY26)","title":"Profit Kept Out of Every ₹100 of Sales",
  "color":WARN,"unit":"%","dec":2,"peLabel":"FY26 net profit margin (%)","rows":[
   {"name":"Technocraft Ventures","pe":12.48,"note":"EPC · low debt","hi":True},
   {"name":"Molbio Diagnostics","pe":11.28,"note":"test-kit razor-and-blade"},
   {"name":"Manipal Health","pe":8.71,"note":"hospitals"},
   {"name":"Dhoot Transmission","pe":8.70,"note":"auto components"},
   {"name":"Ardee Industries","pe":7.25,"note":"lead recycling"},
   {"name":"Juniper Green","pe":5.03,"note":"capital-heavy power"},
   {"name":"Lalithaa Jewellery","pe":4.04,"note":"jewellery is thin by nature"}],
  "verdict":"Thin margins aren't automatically bad — jewellers and power live there — but they leave less room for error."},
 ("Margins tell you the quality of the growth. [pause] Out of every hundred rupees of sales, how much does the "
  "company keep as profit? [pause] Technocraft keeps the most — twelve point four eight rupees. Molbio is close "
  "behind at eleven point two eight. [pause] Manipal and Dhoot sit near eight point seven. Ardee at seven point "
  "two five. [pause] And at the bottom, Juniper at five, and Lalithaa at just four point zero four. [pause] Now, "
  "a thin margin isn't automatically bad. [pause] Jewellery and power are thin-margin businesses by nature — "
  "Lalithaa makes up for it with huge sales volume and a forty-one percent return on equity. [pause] But a "
  "thin margin does leave less cushion. When costs rise, there's little room before the profit vanishes — "
  "exactly what we just saw happen to Ardee.")),

# ---------------- LENS 4 · VALUATION ----------------
("d4","sm_divider",{"n":4,"title":"Valuation","sub":"Cheap, or priced for perfection?","color":VIO},
 ("Lens four. [pause] Valuation — the price you pay for all of it.")),

("valuation","sm_peers",
 {"kicker":"LENS 4 · PRICE-TO-EARNINGS, NOW","title":"What You Pay for ₹1 of Profit Today",
  "color":VIO,"unit":"×","dec":1,"peLabel":"P/E on FY26 earnings, at today's price · longer = pricier",
  "naText":"capacity play — P/E is the wrong lens","rows":[
   {"name":"Manipal Health","pe":111.2,"note":"≈111× — priced for perfection"},
   {"name":"Dhoot Transmission","pe":81.2,"note":"re-rated up after listing"},
   {"name":"Molbio Diagnostics","pe":78.0,"note":"unique, but no listed peer"},
   {"name":"Technocraft Ventures","pe":28.8,"note":"most reasonable of the group"},
   {"name":"Ardee Industries","pe":22.1,"note":"cheap, but margin risk"},
   {"name":"Lalithaa Jewellery","pe":13.6,"note":"cheapest · 41.6% ROE","hi":True},
   {"name":"Juniper Green","pe":None,"note":"tiny profit vs huge capex"}],
  "verdict":"On today's prices, the valuation gap is enormous: from ~13.6× to ~111× — the same five lenses, wildly different price tags."},
 ("This is the lens that decides your entry. [pause] Price-to-earnings tells you how many rupees you pay today "
  "for one rupee of the company's annual profit. Lower is cheaper. [pause] And the gap here is enormous. "
  "[pause] Manipal costs about a hundred and eleven times its earnings — priced for perfection, with almost no "
  "room for a stumble. [pause] Dhoot and Molbio sit near eighty times. [pause] Technocraft is far more "
  "reasonable at twenty-nine. Ardee looks cheap at twenty-two — but remember its margin problem. [pause] And "
  "the cheapest of them all — Lalithaa, at just thirteen point six times, while earning the best return on "
  "equity in the group. [pause] Juniper I've left off the bar on purpose. Its profit is tiny next to its huge "
  "power assets, so a P/E of three hundred-plus is meaningless — you'd value it on capacity, not earnings. "
  "[pause] Same five lenses. Wildly different price tags.")),

# ---------------- LENS 5 · LEVERAGE / USE OF PROCEEDS ----------------
("d5","sm_divider",{"n":5,"title":"Leverage","sub":"Where did the fresh money go?","color":BAD},
 ("Lens five. [pause] Leverage — and where your money actually went.")),

("proceeds","sm_iconcards",
 {"kicker":"LENS 5 · WHERE THE FRESH MONEY WENT (from the RHP)","title":"Into Growth, or Into Old Debt?","color":BAD,"items":[
   {"emoji":"🏦","k":"Juniper: ~78% to repay debt","v":"Of a fully-fresh ₹1,800 Cr issue, most goes to pay down the company's and its subsidiaries' borrowings — de-risking, not expanding","chip":"DEBT-HEAVY"},
   {"emoji":"🏥","k":"Manipal: ₹5,378 Cr to repay debt","v":"The bulk of an ₹8,000 Cr fresh issue clears acquisition debt — yet interest STILL dragged Q1 profit down","chip":"DEBT-HEAVY"},
   {"emoji":"🏗️","k":"Technocraft: low debt (~₹90 Cr)","v":"Fresh money funds working capital against a ₹1,320 Cr order book — growth spending, not a debt clean-up","chip":"CLEAN SHEET"},
   {"emoji":"💍","k":"Lalithaa: moderate (D/E 0.53)","v":"~71% fresh funds new stores and inventory; only part repays debt. Growth-led, balance sheet already solid","chip":"BALANCED"}]},
 ("Lens five asks a blunt question. [pause] When you buy an I-P-O, is your money funding growth — or just "
  "cleaning up old debt? [pause] The prospectus tells you. [pause] Juniper raised a fully fresh eighteen "
  "hundred crore, and about seventy-eight percent goes to repay borrowings. [pause] Manipal put over five "
  "thousand crore of its raise into clearing acquisition debt — and even then, interest still dragged its "
  "profit down last quarter. [pause] Those are debt clean-ups. Necessary, but not exciting. [pause] Contrast "
  "that with Technocraft, which carries almost no debt and spends its fresh money on a growing order book, "
  "and Lalithaa, which funds new stores off an already-solid balance sheet. [pause] Money into growth beats "
  "money into yesterday's mistakes.")),

# ---------------- SYNTHESIS ----------------
("buckets","sm_iconcards",
 {"kicker":"PUTTING IT TOGETHER","title":"Three Groups, Not One Answer","color":MKT,"items":[
   {"emoji":"✅","k":"Reasonable price, proven quality","v":"Lalithaa (~13.6×, 41.6% ROE) and Technocraft (~29×, fat margin, low debt). The valuation gives you some cushion","chip":"CUSHION"},
   {"emoji":"⚠️","k":"Great business, priced for perfection","v":"Manipal (~111×), Molbio (~78×), Dhoot (~81×). Wonderful companies — but the price already assumes years of flawless growth","chip":"NO ROOM"},
   {"emoji":"⏳","k":"Story stocks, earnings unproven","v":"Juniper (capacity play, debt-heavy) and Ardee (margins slipping). The thesis may work — but you're paying before it's proven","chip":"WAIT FOR PROOF"}]},
 ("So pull it together. [pause] These seven don't collapse into one answer — they fall into three groups. "
  "[pause] First — reasonable price with proven quality. Lalithaa, cheap at thirteen times with the best "
  "return on equity, and Technocraft, fair value with fat margins and almost no debt. Here the valuation "
  "gives you a cushion. [pause] Second — wonderful businesses, priced for perfection. Manipal, Molbio and "
  "Dhoot are excellent — but at seventy to a hundred and eleven times earnings, the price already assumes "
  "years of flawless execution. One stumble and it re-rates. [pause] Third — story stocks whose earnings "
  "aren't proven yet. Juniper's capacity bet and Ardee's slipping margins. The story might work, but you'd "
  "be paying before the proof arrives.")),

("entry","sm_myths",
 {"kicker":"IS NOW A GOOD TIME TO BUY?","title":"How to Think About Your Entry","mythLabel":"⚠️ TRAPS TO AVOID","factLabel":"✅ WHAT ACTUALLY HELPS","pairs":[
   {"m":"Chasing the listing-day pop as if it's free money","f":"Wait for the first post-IPO quarter — it separates hype from reality"},
   {"m":"Buying only because a stock is up since listing","f":"Pay attention to the PRICE — a great company at 111× can still be a poor entry"},
   {"m":"Treating all seven as one 'IPO basket' bet","f":"Judge each on valuation, margin and where the fresh money went"}]},
 ("So — is now a good time to buy? [pause] I can't answer that for you, and anyone who gives you a confident "
  "yes across all seven is selling something. [pause] But the lenses point to clear habits. [pause] Don't "
  "chase the listing pop as if it's free money — Ardee just showed you how fast it vanishes. [pause] Don't "
  "buy simply because a stock is up; pay attention to the price you're paying. A brilliant company at a "
  "hundred and eleven times earnings can still be a bad entry. [pause] And don't treat these seven as one "
  "basket. Judge each on its valuation, its margin, and where your money goes. [pause] For the richly-priced "
  "names, the disciplined move is often to wait — for a better price, or for the next quarter's proof.")),

("recap","sm_recap",
 {"title":"IPO Report Card — at a Glance","items":[
   "All 7 trade above issue — but Ardee gave back nearly all its 36% pop",
   "Q1 filed by 3: Manipal (profit −7.48%), Ardee (margin 13.44→9.90%), Juniper (+79%)",
   "Margins: Technocraft 12.48% best · Lalithaa 4.04% thinnest",
   "Valuation gap is huge: Lalithaa ~13.6× vs Manipal ~111×",
   "Juniper & Manipal poured the fresh money into repaying debt"],
  "closer":"Reasonable-price + proven quality gives cushion; priced-for-perfection needs patience. Do your own homework."},
 ("Let's recap the report card. [pause] All seven trade above their I-P-O price — but Ardee handed back nearly "
  "all of its debut pop once results disappointed. [pause] Of the three that have reported, Manipal's profit "
  "fell despite booming sales, Ardee's margin was squeezed, and only Juniper grew cleanly on new capacity. "
  "[pause] Technocraft keeps the fattest margin; Lalithaa the thinnest, but at the cheapest price and the best "
  "return on equity. [pause] And the valuation gap is enormous — from about thirteen times to a hundred and "
  "eleven. [pause] Reasonable price with proven quality gives you a cushion. Priced-for-perfection needs "
  "patience and a lower entry. " + DISCLAIMER)),
]

# =================================================================================================
# EXPANDED AUGUST 2026 CUT — all 20 newly listed mainboard companies.
#
# Claude's original seven-company screenplay above is intentionally retained as
# an audit trail. The active SEGMENTS list is replaced below. Prices and listing
# opens are official NSE values; the factor inputs are documented in DATA.md.
# =================================================================================================

STOCKS = [
    # id, company, NSE symbol, listing date, issue, NSE listing open, NSE 28-Aug close,
    # normalized growth input, PAT margin, current multiple, multiple kind,
    # leverage risk (0 low ... 3 severe), leverage display, growth basis, key watch-out.
    dict(id="indomim", name="Indo-MIM", ticker="INDOMIM", listed="30 JUL", issue=485.00, listing=700.00, current=868.05,
         growth=26.00, margin=12.74, multiple=72.07, kind="P/E", lev=1, leverage="MODERATE",
         growth_basis="FY26 revenue and profit both grew 26%", watch="The stock is already far above both issue and listing prices; valuation compression is the main risk."),
    dict(id="lohia", name="Lohia Corp", ticker="LCL", listed="30 JUL", issue=425.00, listing=461.00, current=565.10,
         growth=25.00, margin=11.24, multiple=24.61, kind="P/E", lev=0, leverage="LOW",
         growth_basis="the lower of 25% revenue growth and 64% profit growth", watch="The issue was entirely an OFS, so none of the IPO cash entered the business."),
    dict(id="xtranet", name="Xtranet Technologies", ticker="XTRANET", listed="30 JUL", issue=127.00, listing=136.00, current=197.11,
         growth=32.00, margin=11.20, multiple=18.07, kind="P/E", lev=1, leverage="MODERATE",
         growth_basis="the lower of 32% revenue growth and 36% profit growth", watch="It is a small, working-capital-heavy IT services company, so execution volatility remains high."),
    dict(id="manipal", name="Manipal Health", ticker="MANIPALHOS", listed="05 AUG", issue=590.00, listing=652.00, current=771.65,
         growth=-7.48, margin=8.71, multiple=103.38, kind="P/E", lev=3, leverage="SEVERE",
         growth_basis="Q1 profit fell 7.48% despite 38.12% revenue growth", watch="Acquisition-debt interest is still dragging reported profit after the IPO."),
    dict(id="juniper", name="Juniper Green Energy", ticker="JNPR", listed="06 AUG", issue=225.00, listing=245.00, current=258.23,
         growth=11.00, margin=5.03, multiple=241.65, kind="P/E", lev=3, leverage="SEVERE",
         growth_basis="FY26 profit growth of 11%; Q1 income growth lacks a comparable PAT", watch="This is a capital-heavy capacity story; P/E is noisy and most fresh money repays debt."),
    dict(id="mvelectro", name="MV Electrosystems", ticker="MVELECTRO", listed="06 AUG", issue=425.00, listing=520.00, current=719.55,
         growth=-21.09, margin=-25.36, multiple=39.70, kind="P/S", lev=2, leverage="HIGH",
         growth_basis="FY26 revenue fell 21.09% and the company moved into loss", watch="The ₹921.64 crore order book is large, but Q1 losses widened and execution must convert orders into cash."),
    dict(id="ardee", name="Ardee Industries", ticker="ARDEE", listed="12 AUG", issue=53.00, listing=72.00, current=61.16,
         growth=5.85, margin=7.25, multiple=22.80, kind="P/E", lev=3, leverage="SEVERE",
         growth_basis="Q1 profit grew only 5.85% as operating margin compressed", watch="The listing pop largely vanished after EBITDA margin fell from 13.44% to 9.90%."),
    dict(id="technocraft", name="Technocraft Ventures", ticker="TECHNOCRAF", listed="14 AUG", issue=212.00, listing=284.00, current=373.83,
         growth=23.50, margin=12.48, multiple=25.98, kind="P/E", lev=0, leverage="LOW",
         growth_basis="FY26 revenue growth of 23.50%, below 53.60% profit growth", watch="Its ₹1,320.70 crore order book helps visibility, but government EPC timing can be lumpy."),
    dict(id="leap", name="LEAP India", ticker="LEAPIND", listed="14 AUG", issue=159.00, listing=165.90, current=168.40,
         growth=35.00, margin=8.34, multiple=112.27, kind="P/E", lev=3, leverage="SEVERE",
         growth_basis="growth is capped at 35% after revenue and profit rose faster", watch="Debt doubled beyond ₹1,000 crore and 81% of the IPO was an OFS."),
    dict(id="dhoot", name="Dhoot Transmission", ticker="DHOOTTRANS", listed="17 AUG", issue=871.00, listing=1200.00, current=1454.90,
         growth=12.14, margin=8.70, multiple=59.63, kind="P/E", lev=2, leverage="HIGH",
         growth_basis="the lower 12.14% profit growth versus 31.33% revenue growth", watch="The post-listing return is strong, but profit growth trails sales and the auto cycle can turn."),
    dict(id="molbio", name="Molbio Diagnostics", ticker="MOLBIO", listed="17 AUG", issue=807.00, listing=980.00, current=1094.75,
         growth=14.80, margin=11.52, multiple=74.12, kind="P/E", lev=1, leverage="MODERATE",
         growth_basis="the lower 14.80% profit growth versus 41.70% revenue growth", watch="The platform is differentiated, but there is no clean listed peer and the multiple is demanding."),
    dict(id="milkymist", name="Milky Mist Dairy Food", ticker="MILKYMIST", listed="18 AUG", issue=140.00, listing=165.00, current=214.31,
         growth=33.55, margin=4.04, multiple=108.79, kind="P/E", lev=3, leverage="SEVERE",
         growth_basis="FY26 revenue growth of 33.55%, below the 175.76% profit surge", watch="The brand is scaling, but debt-to-equity was 3.61 and the valuation exceeds listed dairy peers."),
    dict(id="beharilal", name="Behari Lal Engineering", ticker="BLEL", listed="19 AUG", issue=285.00, listing=465.00, current=457.45,
         growth=5.90, margin=11.83, multiple=27.63, kind="P/E", lev=1, leverage="MODERATE",
         growth_basis="the lower 5.90% revenue growth versus 22% profit growth", watch="Margins improved, but revenue growth is modest and roughly 69% of the IPO was an OFS."),
    dict(id="shiprocket", name="Shiprocket", ticker="SHIPROCKET", listed="19 AUG", issue=97.00, listing=131.00, current=125.40,
         growth=24.00, margin=-3.91, multiple=4.53, kind="P/S", lev=1, leverage="MODERATE",
         growth_basis="FY26 revenue growth of 24%; losses are shrinking but remain negative", watch="It has no positive earnings yet, so this target uses sales and carries very low confidence."),
    dict(id="horizon", name="Horizon Industrial Parks", ticker="HORIZONIND", listed="24 AUG", issue=60.00, listing=60.25, current=58.05,
         growth=35.00, margin=-29.45, multiple=24.21, kind="P/S", lev=3, leverage="SEVERE",
         growth_basis="77.10% revenue growth capped at 35%; the company remains loss-making", watch="Debt was about ₹6,884 crore and the stock is already below its issue price."),
    dict(id="lalithaa", name="Lalithaa Jewellery Mart", ticker="LALITHAA", listed="24 AUG", issue=201.00, listing=265.00, current=265.24,
         growth=35.00, margin=4.04, multiple=13.13, kind="P/E", lev=1, leverage="MODERATE",
         growth_basis="growth is capped at 35% after income rose 48% and profit 176.90%", watch="The valuation is low and ROE strong, but thin jewellery margins and inventory needs add risk."),
    dict(id="shankesh", name="Shankesh Jewellers", ticker="SHANKESH", listed="25 AUG", issue=93.00, listing=103.30, current=91.73,
         growth=16.17, margin=6.54, multiple=10.10, kind="P/E", lev=1, leverage="MODERATE",
         growth_basis="the lower 16.17% income growth versus 164.60% profit growth", watch="It trades below issue despite high ROE; wholesale concentration and growth durability need proof."),
    dict(id="sunshine", name="Sunshine Pictures", ticker="SUNSHINE", listed="25 AUG", issue=360.00, listing=395.90, current=429.75,
         growth=-25.00, margin=52.47, multiple=28.09, kind="P/E", lev=0, leverage="LOW",
         growth_basis="FY26 revenue decline is capped at minus 25% for the model", watch="Profitability is high and debt low, but film and series revenue is extremely project-dependent."),
    dict(id="gaja", name="Gaja Alternative Asset Management", ticker="GAJA", listed="26 AUG", issue=160.00, listing=185.00, current=158.66,
         growth=28.00, margin=50.44, multiple=22.14, kind="P/E", lev=0, leverage="LOW",
         growth_basis="the lower 28% income growth versus 33.80% profit growth", watch="The fee model is highly profitable, but private-equity exits and fundraising make earnings lumpy."),
    dict(id="tempsens", name="Tempsens Instruments", ticker="TEMPSENS", listed="28 AUG", issue=300.00, listing=634.00, current=586.65,
         growth=13.60, margin=15.97, multiple=70.43, kind="P/E", lev=0, leverage="LOW",
         growth_basis="the lower 13.60% profit growth versus 17.53% revenue growth", watch="The business is profitable and lightly levered, but 85% of the IPO was an OFS and the debut premium was extreme."),
]

def clamp(x, lo, hi): return max(lo, min(hi, x))

def enrich(s):
    """Uniform base-case model; no company-specific target overrides."""
    g = clamp(s["growth"], -25.0, 35.0)
    if s["kind"] == "P/E":
        fair = clamp(14.0 + 0.35 * max(g, 0) + 0.18 * max(s["margin"], 0) - 2.5 * s["lev"], 10.0, 45.0)
    else:
        fair = clamp(1.5 + 0.05 * max(g, 0) - 0.25 * s["lev"], 1.0, 6.0)
    targets = []
    for q in (1, 2):
        # Earnings/sales compound for q quarters; 12% of the multiple gap closes per quarter.
        growth_factor = (1 + g / 100.0) ** (q / 4.0)
        multiple_q = s["multiple"] + (fair - s["multiple"]) * (0.12 * q)
        targets.append(s["current"] * growth_factor * multiple_q / s["multiple"])
    s.update(
        growth=g,
        fair=fair,
        list_gain=(s["listing"] / s["issue"] - 1) * 100,
        ret=(s["current"] / s["issue"] - 1) * 100,
        target1=targets[0], target2=targets[1],
        target1_ret=(targets[0] / s["current"] - 1) * 100,
        target2_ret=(targets[1] / s["current"] - 1) * 100,
    )
    return s

STOCKS = [enrich(s) for s in STOCKS]

def money(v): return f"₹{v:,.2f}"
def pct(v): return f"{v:+.2f}%"

def tone_return(v):
    if v < 0: return BAD
    if v >= 25: return GOOD
    if v < 10: return WARN
    return MKT

def tone_growth(v): return BAD if v < 0 else WARN if v < 10 else GOOD
def tone_margin(v): return BAD if v < 0 else WARN if v < 8 else GOOD

def report_props(s, i):
    val_ratio = s["multiple"] / s["fair"]
    val_tone = BAD if val_ratio > 2 else WARN if val_ratio > 1.2 else GOOD
    lev_tone = BAD if s["lev"] == 3 else WARN if s["lev"] == 2 else GOOD
    status = "BELOW ISSUE" if s["ret"] < 0 else "STRONG POST-LISTING GAIN" if s["ret"] >= 25 else "ABOVE ISSUE"
    confidence = "VERY LOW" if s["kind"] == "P/S" else "LOW"
    return {
        "index": i, "total": len(STOCKS), "name": s["name"], "ticker": s["ticker"], "listed": s["listed"],
        "issue": money(s["issue"]), "listing": money(s["listing"]), "current": money(s["current"]),
        "listGain": f"listing {pct(s['list_gain'])}", "returnPct": f"vs issue {pct(s['ret'])}",
        "status": status, "statusTone": tone_return(s["ret"]),
        "factors": [
            {"label":"RETURN", "value":pct(s["ret"]), "note":"28 Aug close versus issue", "tone":tone_return(s["ret"])},
            {"label":"GROWTH", "value":pct(s["growth"]), "note":"normalized model input", "tone":tone_growth(s["growth"])},
            {"label":"PAT MARGIN", "value":pct(s["margin"]), "note":"FY26; negative means loss", "tone":tone_margin(s["margin"])},
            {"label":"VALUATION", "value":f"{s['multiple']:.2f}× {s['kind']}", "note":f"model fair {s['fair']:.2f}×", "tone":val_tone},
            {"label":"LEVERAGE", "value":s["leverage"], "note":f"risk score {s['lev']} of 3", "tone":lev_tone},
        ],
        "target1":money(s["target1"]), "target2":money(s["target2"]), "confidence":confidence,
        "modelNote":"Base case = forward earnings/sales × quality-adjusted fair multiple; 12% mean reversion per quarter · not broker consensus",
    }

def report_narration(s, i):
    metric = "price to earnings" if s["kind"] == "P/E" else "price to sales, because earnings are negative"
    confidence = "very low" if s["kind"] == "P/S" else "low"
    return (
        f"Stock {i} of {len(STOCKS)}. {s['name']}. [pause] Issue price {money(s['issue'])}; N-S-E listing open {money(s['listing'])}; "
        f"August twenty-eighth close {money(s['current'])}. Return versus issue: {pct(s['ret'])}. "
        f"[pause] Model inputs are {pct(s['growth'])} growth, {pct(s['margin'])} margin, and {s['leverage'].lower()} leverage. "
        f"The current {metric} is {s['multiple']:.2f} times; model fair value is {s['fair']:.2f} times. "
        f"[pause] The same algorithm gives {money(s['target1'])} next quarter and {money(s['target2'])} the following quarter, with {confidence} confidence. "
        f"[pause] Watch-out: {s['watch']}"
    )

def peer_pages(items, prefix, kicker, title, field, note_fn, verdict, color):
    out = []
    for page, start in enumerate(range(0, len(items), 7), 1):
        batch = items[start:start+7]
        rows = [{"name":s["name"], "pe":abs(s[field]), "display":pct(s[field]), "note":note_fn(s), "hi":page == 1 and j == 0}
                for j, s in enumerate(batch)]
        narration = " ".join(f"{s['name']}, {pct(s[field])}." for s in batch)
        out.append((f"{prefix}{page}", "sm_peers",
                    {"kicker":f"{kicker} · PAGE {page}", "title":title, "color":color, "unit":"%", "dec":2,
                     "peLabel":"absolute bar length; signed value shown at right", "rows":rows, "verdict":verdict},
                    f"Page {page}. [pause] {narration} [pause] {verdict}"))
    return out

SEGMENTS = [
    ("all_title", "sm_ptitle",
     {"title":"IPO Report Card","sub":"All 20 mainboard listings · 30 Jul–28 Aug 2026","kicker":"RHP FACTS · OFFICIAL NSE PRICES · TWO-QUARTER MODEL"},
     ("Twenty mainboard I-P-Os listed in the last four weeks. [pause] This is one equal, apples-to-apples report card for every one of them. "
      "We compare issue price, N-S-E listing open, and the official August twenty-eighth close. Then we run the same transparent factor model on all twenty "
      "to estimate a base-case price for next quarter and the quarter after that. [pause] These are model scenarios, not targets from a bank, not broker consensus, and not investment advice.")),
    ("all_method", "sm_iconcards",
     {"kicker":"ONE MODEL · EVERY STOCK","title":"How the Two-Quarter Targets Are Built","color":VIO,"items":[
         {"emoji":"📈","k":"1 · Normalize growth","v":"Use the lower of revenue and PAT growth; cap the input between −25% and +35%. Latest Q1 overrides FY26 when comparable","chip":"NO CHERRY-PICKING"},
         {"emoji":"⚖️","k":"2 · Estimate a fair multiple","v":"Start from a base multiple, reward growth and margin, subtract a leverage penalty, and apply hard valuation bounds","chip":"QUALITY-ADJUSTED"},
         {"emoji":"🧮","k":"3 · Project two quarters","v":"Compound earnings or sales, while closing 12% of the gap between current and fair valuation each quarter","chip":"PARTIAL REVERSION"},
         {"emoji":"🛡️","k":"4 · Mark uncertainty","v":"P/E for profitable firms; P/S for loss-makers. Every output is low confidence because these stocks have under one month of history","chip":"BASE CASE ONLY"}]},
     ("Here is the algorithm. [pause] First, normalize business growth using the lower of revenue and profit growth, capped between minus twenty-five and plus thirty-five percent. "
      "Second, calculate a quality-adjusted fair multiple: growth and margin add to it, while leverage subtracts. [pause] Third, project earnings or sales forward, and assume only twelve percent "
      "of the gap between today's multiple and fair value closes each quarter. Profitable firms use P-E; loss-makers use price-to-sales. [pause] This resembles an institutional factor model, but it is our transparent framework, not any bank's proprietary algorithm.")),
    ("returns_div", "sm_divider", {"n":1,"title":"The Market Scoreboard","sub":"Official NSE close · 28 Aug 2026","color":MKT},
     "Part one. [pause] What the market has already done since each issue."),
]

RETURNS_SORTED = sorted(STOCKS, key=lambda s:s["ret"], reverse=True)
SEGMENTS += peer_pages(
    RETURNS_SORTED, "returns_", "RETURN vs ISSUE", "Where the 20 Stocks Stand Now", "ret",
    lambda s:f"{money(s['issue'])} → {money(s['current'])}",
    "A large listing gain is momentum, not proof of fair value; three names already trade below issue.", GOOD)

SEGMENTS.append(("cards_div", "sm_divider", {"n":2,"title":"Twenty Equal Report Cards","sub":"Return · growth · margin · valuation · leverage · targets","color":GOOD},
                 "Part two. [pause] The same five lenses and the same target algorithm, one company at a time."))

for i, s in enumerate(STOCKS, 1):
    SEGMENTS.append((f"card_{s['id']}", "sm_reportcard", report_props(s, i), report_narration(s, i)))

TARGETS_SORTED = sorted(STOCKS, key=lambda s:s["target2_ret"], reverse=True)
SEGMENTS.append(("targets_div", "sm_divider", {"n":3,"title":"The Model's Ranking","sub":"Following-quarter upside/downside from the 28 Aug close","color":VIO},
                 "Part three. [pause] Rank the same base-case outputs by the following-quarter move from today's price."))
SEGMENTS += peer_pages(
    TARGETS_SORTED, "targets_", "MODEL OUTPUT · Q+2", "Following-Quarter Scenario vs Current", "target2_ret",
    lambda s:f"{money(s['current'])} → {money(s['target2'])} · {s['kind']}",
    "This ranking is a sensitivity map, not a buy list; low confidence and valuation mean-reversion drive the result.", VIO)

best = TARGETS_SORTED[:3]; worst = TARGETS_SORTED[-3:]
SEGMENTS.append(("all_recap", "sm_recap",
    {"title":"20 IPOs — What the Uniform Model Says","items":[
        f"Top Q+2 scenarios: {best[0]['name']} {pct(best[0]['target2_ret'])} · {best[1]['name']} {pct(best[1]['target2_ret'])} · {best[2]['name']} {pct(best[2]['target2_ret'])}",
        f"Lowest Q+2 scenarios: {worst[0]['name']} {pct(worst[0]['target2_ret'])} · {worst[1]['name']} {pct(worst[1]['target2_ret'])} · {worst[2]['name']} {pct(worst[2]['target2_ret'])}",
        "High growth does not rescue an extreme multiple immediately; valuation can overwhelm earnings growth",
        "Loss-makers use P/S and carry VERY LOW confidence; profitable names still carry LOW confidence",
        "Re-run after each quarterly result — targets are dated scenarios, never permanent truths"],
     "closer":"One formula improves consistency, not certainty. Verify the filings and manage risk."},
    ("The uniform model produces a ranking, not a recommendation. [pause] Its highest following-quarter scenarios are "
     f"{best[0]['name']}, {best[1]['name']}, and {best[2]['name']}. Its lowest are {worst[0]['name']}, {worst[1]['name']}, and {worst[2]['name']}. "
     "[pause] The core lesson is that growth and price must be judged together. A fast business at an extreme multiple can still produce a lower base-case target, while a profitable company at a modest multiple can have more room. "
     "[pause] Re-run the model after every result. Do not treat any two-quarter estimate as a promise. " + DISCLAIMER)))

# =================================================================================================
# TTS — Kokoro ONNX af_bella (speed 0.90), per-segment WAV, [pause] -> silence, then measure dur
# =================================================================================================
_kokoro = None
def _kok():
    global _kokoro
    if _kokoro is None:
        _kokoro = kokoro_onnx.Kokoro(MODEL, VOICES)
    return _kokoro

SR = 24000
def ffdur(p): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",p],capture_output=True,text=True).stdout.strip())

def tts_chunk(path, text):
    samples, sr = _kok().create(text, voice=VOICE, speed=SPEED, lang="en-us")
    if sr != SR:
        # resample to 24k mono via ffmpeg to keep the pipeline uniform
        tmp = path + ".raw.wav"; sf.write(tmp, samples, sr, subtype="PCM_16")
        subprocess.run(["ffmpeg","-y","-i",tmp,"-ar",str(SR),"-ac","1",path],check=True,capture_output=True); os.remove(tmp)
    else:
        sf.write(path, samples, SR, subtype="PCM_16")

def gen_one(seg_id, text):
    fin = os.path.join(FIN, seg_id+".wav")
    if os.path.exists(fin): return fin, ffdur(fin)
    chunks = [c.strip() for c in text.split("[pause]") if c.strip()]; paths=[]
    for ci,chunk in enumerate(chunks):
        cp = os.path.join(RAW, f"{seg_id}_c{ci}.wav")
        if not os.path.exists(cp): tts_chunk(cp, chunk)
        paths.append(cp)
    psil = os.path.join(RAW,"_pause.wav")
    if not os.path.exists(psil):
        subprocess.run(["ffmpeg","-y","-f","lavfi","-i",f"anullsrc=r={SR}:cl=mono","-t",str(PAUSE),psil],check=True,capture_output=True)
    clist = os.path.join(RAW, f"{seg_id}_concat.txt")
    with open(clist,"w") as f:
        for i2,p2 in enumerate(paths):
            f.write(f"file '{p2}'\n")
            if i2 < len(paths)-1: f.write(f"file '{psil}'\n")
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",clist,"-c","copy",fin],check=True,capture_output=True)
    return fin, ffdur(fin)

def caption_cues(text, start, end):
    clean = re.sub(r"\s+"," ",text.replace("[pause]"," ")).strip()
    parts = re.split(r"(?<=[.?!])\s+", clean); cues=[]
    for pt in parts:
        pt=pt.strip()
        if not pt: continue
        if len(pt)>60 and ("," in pt or "—" in pt):
            buf=""
            for s in re.split(r"(?<=[,—])\s+", pt):
                if len(buf)+len(s)>60 and buf: cues.append(buf.strip()); buf=s
                else: buf=(buf+" "+s).strip()
            if buf: cues.append(buf.strip())
        else: cues.append(pt)
    total=sum(len(c) for c in cues) or 1; span,out,t=end-start,[],start
    for c in cues:
        d=span*(len(c)/total); out.append([round(t,3),round(t+d,3),c]); t+=d
    if out: out[-1][1]=round(end,3)
    return out

def build():
    manifest=[]; words=0
    for sid,variant,props,text in SEGMENTS:
        path,dur=gen_one(sid,text)
        words += len(re.sub(r"\[pause\]"," ",text).split())
        manifest.append({"id":sid,"variant":variant,"props":props,"wav":path,"duration":dur,"narration":text})
        print(f"  {sid:12s} {dur:6.2f}s",flush=True)
    silence=os.path.join(FIN,"_sil.wav")
    if not os.path.exists(silence):
        subprocess.run(["ffmpeg","-y","-f","lavfi","-i",f"anullsrc=r={SR}:cl=mono","-t",str(GAP),silence],check=True,capture_output=True)
    clist=os.path.join(ROOT,f"concat_{CH}.txt")
    with open(clist,"w") as f:
        for i,m in enumerate(manifest):
            f.write(f"file '{m['wav']}'\n")
            if i<len(manifest)-1: f.write(f"file '{silence}'\n")
    subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",clist,"-c","copy",os.path.join(PUBLIC,f"{CH}.wav")],check=True,capture_output=True)
    cuts,cues,t=[],[],0.0
    for m in manifest:
        start,end=t,t+m["duration"]
        cuts.append({"id":m["id"],"type":m["variant"],"in_seconds":round(start,3),"out_seconds":round(end,3),"props":{**m["props"],"dur":round(m["duration"]+GAP,3)}})
        cues.extend(caption_cues(m["narration"],start,end)); t=end+GAP
    # English 16:9 default for this project is no burned-in captions.
    out={"cuts":cuts,"captions":[],"audio":{"narration":{"src":f"{PREFIX}/{CH}.wav","volume":1.0}}}
    json.dump(out,open(os.path.join(ROOT,"artifacts",f"{CH}.json"),"w"),ensure_ascii=False,indent=2)
    total=t-GAP
    print(f"\n{CH}: total {total:.2f}s ({total/60:.2f} min), {len(cuts)} scenes, {words} words, {len(cues)} cues")
    print(f"effective pace: {words/(total/60):.1f} wpm")

if __name__=="__main__":
    build()
