#!/usr/bin/env python3
"""Lalithaa Jewellery Mart IPO — report explainer (18 Aug 2026).

NUMBERS TABLE (pre-render gate). Re-verified against DRHP markdown + live sources.

=== DRHP (Lalithaa Jewellery Mart Limited; restated; source: filing markdown) ===
Stores: 56 in 46 cities as of 31 Dec 2024; 3 owned / 53 leased.
Gold jewellery mix 9MFY25: 94.89% of revenue.
Revenue FY22 ₹81,394.23 mn → FY24 ₹167,880.52 mn; reported CAGR 43.62%.
PAT FY22 ₹1,667.74 mn → FY24 ₹3,598.33 mn; reported CAGR 46.89%.
Op. EBITDA margin: FY24 4.05% · 9MFY25 4.33% (not annualised).
PAT margin: FY24 2.14% · 9MFY25 2.08% (not annualised).
OCF: FY24 −₹180.02 mn · 9MFY25 +₹2,363.45 mn.
Inventory 31 Dec 2024: ₹53,325.92 mn. Inventory days: 155 (9MFY25) vs 93 (FY24).
Current borrowings 31 Dec 2024: ₹8,651.95 mn vs non-current ₹319.17 mn.
Total debt 30 Apr 2025: ₹12,149.89 mn; floating-rate ST: ₹11,785.30 mn.
Issue (DRHP): fresh up to ₹12,000 mn + OFS up to ₹5,000 mn.
Store capex identified: ₹10,145.04 mn for 12 new stores (DRHP).
Promoter holding pre-offer: 97.72%.
GST ITC demand: ₹1,066.38 mn (order 8 Jan 2025; company admitted error; pending).
Peer P/E in DRHP table: 12.35× (Manoj Vaibhav) – 98.07× (Kalyan).

=== LIVE / RHP (as of 18 Aug 2026) ===
Price band ₹190–201. Lot 74. Retail min ₹14,874 at upper band.
Issue ₹1,700 Cr = fresh ₹1,200 Cr (5,97,32,655 sh) + OFS ₹500 Cr (2,48,75,621 sh).
Dates: open 17 Aug · close 19 Aug · allotment 20 Aug · list 24 Aug (tentative).
Post-issue P/E 11.14× / pre 9.95× at ₹201 (Chittorgarh). ET industry peer P/E 29.69× FY26.
Promoter 97.72% → 82.85%.
RHP objects: 10 new stores; inventory ₹998.68 Cr + fit-outs ₹34.55 Cr.
Later coverage store count: 61 (vs DRHP 56 at 31 Dec 2024).
FY26 restated (Chittorgarh): total income ₹25,039.80 Cr · PAT ₹1,009.82 Cr · borrowings ₹1,604.14 Cr.
Subscription (Moneycontrol citing NSE, ~10:48 IST 18 Aug 2026, PROVISIONAL):
  overall just fully subscribed; Retail 1.13× · NII 1.13× · QIB 0.67×.
  Later same-day aggregator prints were higher — do not freeze a live book.
GMP UNOFFICIAL ~₹30–₹32 (~15% over ₹201). Not a listing prediction.

Sources: company DRHP excerpts; Chittorgarh; Economic Times; Hindu Business Line;
Moneycontrol (NSE-cited subscription). Conflicts on live book → labelled provisional;
GMP labelled unofficial. No averaging of conflicting snapshots.
"""
import json, os, subprocess, time, urllib.request

BASE = "http://127.0.0.1:17493"
PROFILE = "c488e05c-3407-46a3-874d-1b09b3aff78d"
GAP = 0.5
PAUSE = 0.6
ATEMPO = 0.95
PREFIX = "lj"
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
RAW = os.path.join(ROOT, "assets", "raw")
FIN = os.path.join(ROOT, "assets")
for d in (PUBLIC, RAW, os.path.join(ROOT, "artifacts"), os.path.join(ROOT, "renders")):
    os.makedirs(d, exist_ok=True)

SEGMENTS = [
 ("s01_title", "lj_title", {},
  "This is the Lalithaa Jewellery Mart I-P-O. [pause] "
  "A research report called Wait — with high confidence. [pause] "
  "We will walk every claim, check the numbers, then look at the live offer. [pause] "
  "This is education from public filings. It is not investment advice."),

 ("s02_roadmap", "lj_roadmap", {},
  "The report is built around five questions. [pause] "
  "Is the business attractive? [pause] "
  "Is the financial quality good enough to fund expansion? [pause] "
  "Is the debt safe? [pause] "
  "Can we even price the offer? [pause] "
  "And are governance and legal risks manageable? [pause] "
  "Each answer is tagged to the draft red herring prospectus. Not to grey-market rumours."),

 ("s03_stance", "lj_stance", {},
  "The stance is Wait. [pause] "
  "That does not mean avoid forever. It does not mean buy. [pause] "
  "It means the filing had blank cells for price, share count, and the company's own P E. [pause] "
  "Without those, you cannot judge whether the offer is cheap or expensive. [pause] "
  "The growth was real. The margins were thin. Cash and debt still needed a test."),

 ("s04_div1", "lj_div",
  {"n": 1, "title": "The business", "sub": "A southern, store-led gold retailer", "color": "#FBBF24"},
  "Part one. The business. [pause] What Lalithaa actually is, and what drives the sales."),

 ("s05_scope", "lj_scope", {},
  "As of December thirty-first, two thousand twenty-four, Lalithaa ran fifty-six company stores. [pause] "
  "Forty-six cities. Tamil Nadu, Andhra, Telangana, Karnataka, and Puducherry. [pause] "
  "Only three stores were owned. Fifty-three were leased. [pause] "
  "Gold jewellery was ninety-four point eight nine percent of nine-month F Y twenty-five revenue. [pause] "
  "This is a brick-and-mortar gold retailer, with an app for schemes. Later coverage cites sixty-one stores. The report's fifty-six is the D R H P date."),

 ("s06_growth", "lj_growth", {},
  "Revenue rose from eighty-one thousand three hundred ninety-four point two three million rupees in F Y twenty-two. [pause] "
  "To one hundred sixty-seven thousand eight hundred eighty point five two million in F Y twenty-four. [pause] "
  "That is a reported forty-three point six two percent C A G R. [pause] "
  "Profit after tax rose from one thousand six hundred sixty-seven point seven four million to three thousand five hundred ninety-eight point three three million. [pause] "
  "A forty-six point eight nine percent C A G R. [pause] "
  "The verdict is a qualified positive. Past growth is not a promise that the next twelve stores will pay back."),

 ("s07_div2", "lj_div",
  {"n": 2, "title": "The money", "sub": "Thin keep · cash conversion · short-term debt", "color": "#34D399"},
  "Part two. The money. [pause] Margins, cash, inventory, and debt — the quality of the growth."),

 ("s08_margins", "lj_margins", {},
  "Jewellery is a high-volume, thin-keep business. [pause] "
  "F Y twenty-four operating E B I T D A margin was four point zero five percent. [pause] "
  "Nine-month F Y twenty-five was four point three three percent — and that is not annualised. [pause] "
  "Profit after tax margin was two point one four percent in F Y twenty-four, and two point zero eight percent in the nine months. [pause] "
  "On one hundred rupees of jewellery sold, about two rupees of profit stayed."),

 ("s09_cash", "lj_cash", {},
  "Here is the report's sharpest financial fact. [pause] "
  "F Y twenty-four profit after tax was three thousand five hundred ninety-eight point three three million rupees. [pause] "
  "Operating cash flow that same year was negative one hundred eighty point zero two million. [pause] "
  "Profit on paper. Cash going out. [pause] "
  "The next nine months then printed plus two thousand three hundred sixty-three point four five million of operating cash. [pause] "
  "So cash conversion — not one year's profit — is the central test."),

 ("s10_inventory", "lj_inventory", {},
  "Why the cash squeeze? Inventory. [pause] "
  "Stock hit fifty-three thousand three hundred twenty-five point nine two million rupees on December thirty-first, two thousand twenty-four. [pause] "
  "That is over five thousand three hundred crore sitting in gold and jewellery. [pause] "
  "Inventory days rose to one hundred fifty-five from ninety-three in F Y twenty-four. [pause] "
  "Do not annualise the nine-month ratio. But the direction is clear: more days in stock means more gold to finance."),

 ("s11_debt", "lj_debt", {},
  "On December thirty-first, two thousand twenty-four, current borrowings were eight thousand six hundred fifty-one point nine five million. [pause] "
  "Non-current was only three hundred nineteen point one seven million. [pause] "
  "Almost all of it was short-term. [pause] "
  "By April thirtieth, two thousand twenty-five, total debt was twelve thousand one hundred forty-nine point eight nine million. [pause] "
  "Including eleven thousand seven hundred eighty-five point three zero million of floating-rate short-term borrowings. [pause] "
  "Covenants are disclosed. Headroom is not. The report will not call this debt safe."),

 ("s12_div3", "lj_div",
  {"n": 3, "title": "The offer", "sub": "Fresh vs OFS · proceeds · then the price arrived", "color": "#38BDF8"},
  "Part three. The offer. [pause] Who gets the money — and why the report could not price it."),

 ("s13_ofs", "lj_ofs", {},
  "The D R H P sized a fresh issue of up to twelve thousand million rupees. [pause] "
  "That is one thousand two hundred crore, into the company. [pause] "
  "And an offer for sale of up to five thousand million — five hundred crore — to the selling promoter. [pause] "
  "Your bid funds both. [pause] "
  "Only the fresh issue builds stores. The offer for sale is cash leaving with Kiran Kumar Jain. That split is the honesty lens."),

 ("s14_proceeds", "lj_proceeds", {},
  "Of the fresh money, ten thousand one hundred forty-five point zero four million was identified for capital expenditure on new stores. [pause] "
  "The D R H P said twelve new stores. [pause] "
  "The later R H P objects table lists ten stores: nine hundred ninety-eight point six eight crore of inventory, and thirty-four point five five crore of fit-outs. [pause] "
  "Neither filing gives store-level ramp, margin, or payback. So expansion is a plan, not a proven return."),

 ("s15_priced", "lj_priced", {},
  "This is why the report said Wait. [pause] "
  "Price band, share counts, and the company P E were blank. [pause] "
  "The peer P E range in the D R H P ran from twelve point three five times to ninety-eight point zero seven times. Too wide to use. [pause] "
  "Those blanks are now filled. Band: one hundred ninety to two hundred one rupees. Lot: seventy-four shares. Minimum: fourteen thousand eight hundred seventy-four rupees. [pause] "
  "Post-issue P E about eleven point one four times at the top of the band. Promoter holding ninety-seven point seven two percent, going to eighty-two point eight five."),

 ("s16_div4", "lj_div",
  {"n": 4, "title": "Risks", "sub": "Control · GST · gold and competition", "color": "#F87171"},
  "Part four. Risks. [pause] Control, related parties, tax, and the gold cycle."),

 ("s17_gov", "lj_gov", {},
  "Promoters held ninety-seven point seven two percent before the offer. [pause] "
  "The principal promoter is chairman and managing director. [pause] "
  "Related-party traffic includes rent, brand-ambassador fees, security deposits, and remuneration. [pause] "
  "The filing itself warns those terms may be less favourable than third-party deals. [pause] "
  "Auditors reported no qualifications. That is a limited positive. It is not proof that conflicts are gone."),

 ("s18_gst", "lj_gst", {},
  "Then the legal overhang. [pause] "
  "The company admitted a G S T input-tax-credit error. [pause] "
  "A pending matter with stated total liability of one thousand sixty-six point three eight million rupees. [pause] "
  "About one hundred seven crore. Order dated January eighth, two thousand twenty-five. [pause] "
  "There are other tax proceedings and pending promoter matters. Treat the outcome as unknown."),

 ("s19_sector", "lj_sector", {},
  "Gold-price spikes and a weaker rupee can lift ticket sizes and cut volumes. [pause] "
  "With ninety-four point eight nine percent of revenue in gold, Lalithaa is especially exposed. [pause] "
  "Duties, G S T, and hallmarking can help organised chains versus smaller cash stores. Pass-through is not disclosed. [pause] "
  "E-commerce schemes began in F Y twenty twenty-three — later than some rivals. Online revenue is undisclosed."),

 ("s20_live", "lj_live", {},
  "As of about ten forty-eight I S T on August eighteenth, two thousand twenty-six, Moneycontrol citing the N S E said the issue was just fully subscribed. [pause] "
  "Retail one point one three times. N I I one point one three times. Q I B zero point six seven times. [pause] "
  "That print is provisional. Later the same day, other snapshots were higher. Re-check the exchange before you treat any multiple as final. [pause] "
  "Grey-market premium around thirty to thirty-two rupees is unofficial. About fifteen percent over two hundred one. It is not a listing prediction. [pause] "
  "F Y twenty-six restated income was twenty-five thousand thirty-nine point eight zero crore. Profit one thousand nine point eight two crore."),

 ("s21_score", "lj_score", {},
  "Put the five answers on one page. [pause] "
  "Business: qualified positive. [pause] "
  "Financial quality: mixed — cash is the test. [pause] "
  "Leverage: not conclusively safe. [pause] "
  "Offer: now priceable, near eleven times F Y twenty-six earnings. [pause] "
  "Governance: a material watch, including that G S T demand. [pause] "
  "The Wait was about missing price. The other four answers did not vanish."),

 ("s22_decide", "lj_decide", {},
  "So — is it good to buy? Split the question. [pause] "
  "If you want a listing flip, you are betting unofficial premium and day-one demand. That is not a store-economics thesis. [pause] "
  "If you want to own the chain, you need comfort with thin margins, gold inventory, floating short-term debt, and the tax overhang — at about eleven times earnings. [pause] "
  "Cheaper than many listed jewellers is a real observation. It is not a buy order. [pause] "
  "This video cannot tell you to apply or skip. Consult a SEBI-registered advisor."),

 ("s23_recap", "lj_recap",
  {"items": [
      "DRHP numbers in the report check out against the filing",
      "Wait meant: no price band, so no valuation — not a forever avoid",
      "Growth 43.62% CAGR; PAT margin only 2.14%; FY24 OCF was negative",
      "Fresh ₹1,200 Cr vs OFS ₹500 Cr; live band ₹190–201, post P/E 11.14×",
      "Promoter 97.72%; GST demand ₹1,066.38 mn pending; GMP unofficial",
      "Demand is live and provisional — re-check NSE; this is not advice",
  ], "closer": "A scaled southern jeweller, now priced — with cash, debt and legal caveats still on the table."},
  "Let's recap. [pause] "
  "The report's D R H P numbers check out. [pause] "
  "Wait meant the offer was unpriceable, not that the business was junk. [pause] "
  "Growth was fast. Keep was thin. F Y twenty-four cash was negative. [pause] "
  "The live issue is one thousand seven hundred crore, mostly fresh, at about eleven times earnings. [pause] "
  "Control, inventory, floating debt, and G S T still need watching. [pause] "
  "Information from public sources, not investment advice. Thanks for watching."),
]


def post(p, b):
    req = urllib.request.Request(BASE + p, data=json.dumps(b).encode(),
                                 headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def get(p):
    with urllib.request.urlopen(BASE + p, timeout=10) as r:
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
