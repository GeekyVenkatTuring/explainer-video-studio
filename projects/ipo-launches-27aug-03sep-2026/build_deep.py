#!/usr/bin/env python3
"""Deep re-render of the 7 delivered IPO videos — RESEARCHED & TRIANGULATED 29 Aug 2026 (IST).

The first cut of these were shallow "launch briefs" (business + a generic RHP checklist,
NO financials, NO fresh-vs-OFS, NO peers). This rebuild upgrades all seven to the proven
10-beat ipo-series-en deep-analysis format. Every figure below was triangulated across at
least two independent named sources per skills/12-market-research.md §4.

NUMBERS TABLE / DATA GATE (FY26 = year ended 31 Mar 2026; all ₹ Cr unless noted)

ESDS Software Solution (MAINBOARD, 28 Aug–1 Sep):
  Band ₹408–429, lot 34, min ₹14,586. 100% FRESH ₹720 Cr, OFS nil.
  Rev ₹480.65 (FY25 376.64, +27.6%); PAT ₹120.82 (FY25 55.61, +117.3%); PAT margin ~25.1%; D/E 0.08.
  Use: ~₹576 Cr cloud/data-centre equipment + GCP. Peer: E2E Networks (loss-making, P/E n/a).
  Sources: Groww, IPOWatch, tradebrains, Upstox, Chittorgarh.
Lumino Industries (MAINBOARD, 27–31 Aug):
  Band ₹78–82, lot 182, min ₹14,924. Fresh ₹500 + OFS ₹200 (2,43,90,242 sh) = ₹700 Cr.
  Rev ₹2,089.31 (FY25 1,946.68); PAT ₹160.00 (FY25 124.59). Use: ₹337 debt repay + ₹15.01 capex.
  Priced ~12.1x at ₹82 cap. Peers: KEC 19.81, KEI 58.79, Apar 68.98. Sources: IPOWatch, Business Standard.
Purple Style Labs (MAINBOARD, 31 Aug–2 Sep) — LOSS-MAKING:
  Band ₹546–575, lot 26, min ₹14,950. 100% FRESH ₹680 Cr, OFS nil. Mcap ₹4,603.5 Cr (~8.3x sales).
  Rev ₹557.8 (FY25 489.9, +13.9%); NET LOSS ₹285.3 (FY25 loss 188.3); EBITDA ₹30.37.
  Sources: Business Standard, BusinessToday, Free Press Journal, Kotak Neo.
Priority Jewels (MAINBOARD, 28 Aug–1 Sep):
  Band ₹190–200, lot 75, min ₹15,000. 100% FRESH ₹91.50 Cr, OFS nil.
  Rev ₹539.03 (FY25 435.87); PAT ₹17.65 (FY25 10.51); ~3.3% margin, ~20.5x P/E.
  Peers named (Khazanchi/RBZ/Ashapuri, no P/E given). Sources: Equentis, TradingView, IPOWatch, sahi.
Rays of Belief / Mom's Belief (MAINBOARD, 1–3 Sep):
  Band ₹227–239, lot 62, min ₹14,818. 100% FRESH ₹125 Cr (52.30 lakh sh), OFS nil.
  Rev ₹81.66 (FY25 36.42, +124%); PAT ₹4.96 (FY25 5.88, −16% — profit FELL); EBITDA margin 14.59%.
  Use: ₹41.36 new centres/tech + ₹14.45 leases + ₹10.21 brand + ₹10.13 US. No listed peer.
  Sources: Business Standard, BusinessToday, Free Press Journal, onetrader.
Deepa Jewellers (MAINBOARD, 1–3 Sep):
  Band ₹168–177, lot 84, min ₹14,868. Fresh ₹250 + OFS ₹209.72 (1,18,48,340 sh) = ₹459.72 Cr.
  Rev ₹1,926.7 (FY25 1,400.10, +38%); PAT ₹104.8 (FY25 40.58, +158%); RoE ~56%. ~16.2x P/E (mcap ₹1,701.4).
  Peer P/E range 10.08–57.56x. Use: ₹215 WC + GCP. Sources: BusinessToday, IPOWatch, Chittorgarh, Orient.
Kwick Forensic Solutions (SME, 27–31 Aug):
  Band ₹85–90, lot 1,600 (stated lot ₹1.44L; SME 2-lot min ~₹2,88,000). Fresh ₹41.05 + OFS ₹9.72
  (10,80,000 sh) = ₹50.77 Cr. Rev ₹105.80 (FY25 65.08); PAT ₹13.51 (FY25 8.56); ~12.8% margin.
  No clean listed peer. Sources: Bajaj Broking, IPOWatch, investorgain, Chola Securities.

No forecasts or buy/sell calls. Public-source education; verify the final RHP and exchange data.
"""
import importlib.util, os, sys, subprocess, time, json

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
BASE = os.path.join(REPO, "projects", "ipo-series-en", "build.py")
spec = importlib.util.spec_from_file_location("series_build", BASE)
series = importlib.util.module_from_spec(spec); spec.loader.exec_module(series)
series.ROOT = ROOT
series.PUBLIC = os.path.join(REPO, "composer", "public", "sm")
series.RAW = os.path.join(ROOT, "assets", "raw")
series.FIN = os.path.join(ROOT, "assets")
for d in (series.PUBLIC, series.RAW, series.FIN, os.path.join(ROOT, "artifacts"), os.path.join(ROOT, "renders")):
    os.makedirs(d, exist_ok=True)

# Edge can exit 0 with a truncated MP3; validate before converting so a bad response
# does not poison the WAV cache.
def robust_tts_chunk(path, text):
    mp3 = path[:-4] + ".mp3"
    for attempt in range(8):
        if os.path.exists(mp3):
            os.remove(mp3)
        try:
            result = subprocess.run(
                ["edge-tts", "--voice", series.VOICE, f"--rate={series.RATE}", "--text", text, "--write-media", mp3],
                capture_output=True, timeout=120)
        except subprocess.TimeoutExpired:
            time.sleep(3 + attempt * 2); continue
        valid = result.returncode == 0 and os.path.exists(mp3) and os.path.getsize(mp3) > 1024
        if valid:
            probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                    "-of", "default=noprint_wrappers=1:nokey=1", mp3], capture_output=True)
            valid = probe.returncode == 0
        if valid:
            subprocess.run(["ffmpeg", "-y", "-i", mp3, "-ar", "24000", "-ac", "1", path],
                           check=True, capture_output=True)
            os.remove(mp3)
            return
        time.sleep(3 + attempt * 2)
    raise RuntimeError(f"TTS failed after retries: {path}")

series.tts_chunk = robust_tts_chunk

DIS = ("This is public-source education, not investment advice or a buy or sell call. "
       "Read the final RHP, verify live subscription and consult a SEBI-registered advisor. Thanks for watching.")

# rev/pat in ₹ Cr; pat negative == loss. issue/fresh/ofs in ₹ Cr. pe None -> "n/a".
DATA = {
"esds": dict(
 name="ESDS Software Solution IPO", board="MAINBOARD", accent="#22D3EE",
 kicker="IPO ANALYSIS · MAINBOARD · 100% FRESH",
 sub="AI-enabled cloud & data centres · ₹720 Cr · 28 Aug–1 Sep 2026",
 biz=[("☁️","AI-enabled cloud & data centres","ESDS runs managed cloud, data-centre infrastructure, cybersecurity and GPU-as-a-service for Indian enterprises and government.","CLOUD"),
      ("🏛️","Government & BFSI heavy","Its community-cloud and compliance focus skews to public-sector, banking and regulated customers.","REGULATED"),
      ("📈","Profitable and scaling","FY26 revenue grew about 28% and profit more than doubled, with debt-equity of only 0.08.","QUALITY")],
 rev26=480.65, rev25=376.64, pat26=120.82, pat25=55.61, issue=720.0, fresh=720.0, ofs=0.0,
 retail="₹14,586 (34 shares × ₹429)",
 finnote="FY26 revenue ₹480.65 Cr (FY25 ₹376.64), PAT ₹120.82 Cr (FY25 ₹55.61, +117%); PAT margin about 25% with debt-equity of 0.08.",
 use=[("🖥️","About ₹576 Cr cloud & data-centre kit","The bulk of the fresh issue funds cloud-computing equipment and data-centre build-out.","80% OF FRESH"),
      ("🧰","General corporate purposes","The remainder is for general corporate purposes per the RHP.","GCP"),
      ("✅","No promoter exit","With no offer for sale, all ₹720 Cr of proceeds enter the company.","100% FRESH")],
 peers=[("ESDS IPO",None,"AI-enabled cloud + data centres",True),("E2E Networks",None,"only listed peer; loss-making, P/E n/a",False)],
 peerverdict="There is no clean profitable listed peer: judge ESDS on its own roughly 25% PAT margin, 25% return on equity and a low 0.08 debt-equity.",
 verdict=[("Valuation is rich after a very strong FY26","Profitable, cash-generative cloud with about 25% PAT margin"),
          ("Competition from global hyperscalers","Profit more than doubled; debt-equity just 0.08"),
          ("The only listed peer is loss-making, hard to benchmark","100% fresh capital funds capacity, no promoter exit")],
 sources="RHP-based reporting: Groww, IPOWatch, tradebrains, Upstox, Chittorgarh (FY26 financials, objects, terms).",
),
"lumino": dict(
 name="Lumino Industries IPO", board="MAINBOARD", accent="#FBBF24",
 kicker="IPO ANALYSIS · MAINBOARD",
 sub="Power T&D conductors & EPC · ₹700 Cr · 27–31 Aug 2026",
 biz=[("⚡","Power T&D platform","Manufactures conductors, power cables and electrical wires for transmission and distribution.","ENERGY"),
      ("🏗️","EPC execution","Also executes transmission lines, substations, rail electrification, solar and water projects.","EPC"),
      ("💹","Strong value for the sector","FY26 revenue ₹2,089 Cr with ₹160 Cr profit; priced around 12 times earnings, below its listed peers.","VALUE")],
 rev26=2089.31, rev25=1946.68, pat26=160.00, pat25=124.59, issue=700.0, fresh=500.0, ofs=200.0,
 retail="₹14,924 (182 shares × ₹82)",
 finnote="FY26 revenue ₹2,089.31 Cr (FY25 ₹1,946.68), PAT ₹160.00 Cr (FY25 ₹124.59); priced about 12 times FY26 earnings at the ₹82 cap.",
 use=[("🏦","₹337 Cr debt repayment","The largest fresh-issue use is repaying outstanding borrowings.","RHP"),
      ("⚙️","₹15.01 Cr capex","Equipment and machinery to add capacity.","RHP"),
      ("👥","₹200 Cr offer for sale","Almost a third of the deal goes to selling shareholders, not the company.","OFS")],
 peers=[("Lumino IPO",12.1,"₹82 cap / FY26 earnings",True),("KEC International",19.81,"T&D EPC peer",False),("KEI Industries",58.79,"cables peer",False),("Apar Industries",68.98,"conductors peer",False)],
 peerverdict="At about 12 times earnings, Lumino is priced well below its listed transmission and cable peers — but those peers are larger and more diversified.",
 verdict=[("The sector is competitive and capital-intensive","Priced about 12x, below listed T&D and cable peers"),
          ("₹200 Cr of the deal is an offer for sale","FY26 revenue ₹2,089 Cr and PAT ₹160 Cr, growing"),
          ("Order-book quality needs RHP confirmation","₹337 Cr of fresh money reduces debt")],
 sources="RHP-based reporting: IPOWatch, Business Standard, Chittorgarh, IPOJi (FY26 financials, peer set, objects).",
),
"purple": dict(
 name="Purple Style Labs IPO", board="MAINBOARD", accent="#A78BFA",
 kicker="IPO ANALYSIS · MAINBOARD · LOSS-MAKING",
 sub="Luxury-fashion platform · ₹680 Cr · 31 Aug–2 Sep 2026",
 biz=[("🛍️","Luxury-fashion platform","Owns Pernia's Pop-Up Shop and related luxury and designer retail across online and offline.","LUXURY"),
      ("📊","Growth with losses","FY26 revenue ₹557.8 Cr grew about 14%, but the net loss widened to ₹285.3 Cr.","BURN"),
      ("⚠️","Unit-economics test","At a ₹4,603 Cr valuation on loss-making sales, the path to profit in the filing is the key read.","KEY LENS")],
 rev26=557.8, rev25=489.9, pat26=-285.3, pat25=-188.3, issue=680.0, fresh=680.0, ofs=0.0,
 retail="₹14,950 (26 shares × ₹575)",
 finnote="FY26 revenue ₹557.8 Cr (up about 14%), but the net loss WIDENED to ₹285.3 Cr from ₹188.3 Cr; EBITDA was ₹30.37 Cr.",
 use=[("🛒","Working capital & inventory","Fresh proceeds fund inventory, technology and store and marketplace growth.","GROWTH"),
      ("🧰","General corporate purposes","The balance is for general corporate purposes per the RHP.","GCP"),
      ("⚠️","Funding the losses","With losses widening, watch how long fresh capital sustains the current burn.","KEY LENS")],
 peers=[("Purple Style Labs IPO",None,"loss-making; about 8.3x FY26 sales",True),("No clean listed peer",None,"judge on price-to-sales, not P/E",False)],
 peerverdict="With no profit there is no P/E: at a ₹4,603 Cr valuation on ₹557.8 Cr of sales it is priced around 8.3 times sales while losses widened.",
 verdict=[("The net loss WIDENED to ₹285 Cr in FY26","Revenue grew about 14% to ₹557.8 Cr"),
          ("A ₹4,603 Cr valuation on loss-making sales","A distinctive luxury-fashion positioning"),
          ("No profit means no P/E, only about 8.3x sales","100% fresh capital, no promoter exit")],
 sources="RHP/DRHP-based reporting: Business Standard, BusinessToday, Free Press Journal, Kotak Neo (FY26 financials, valuation, terms).",
),
"priority": dict(
 name="Priority Jewels IPO", board="MAINBOARD", accent="#FBBF24",
 kicker="IPO ANALYSIS · MAINBOARD · 100% FRESH",
 sub="Diamond & fine jewellery · ₹91.50 Cr · 28 Aug–1 Sep 2026",
 biz=[("💎","Diamond & fine jewellery","Designs, manufactures and sells diamond-studded gold and platinum fine jewellery.","JEWELLERY"),
      ("🧾","100% fresh capital","The entire ₹91.50 Cr is a fresh issue; proceeds repay working-capital borrowings.","FRESH"),
      ("📉","Thin margins","FY26 profit of ₹17.65 Cr on ₹539 Cr revenue is about a 3.3% margin, at roughly 20 times earnings.","WATCH")],
 rev26=539.03, rev25=435.87, pat26=17.65, pat25=10.51, issue=91.50, fresh=91.50, ofs=0.0,
 retail="₹15,000 (75 shares × ₹200)",
 finnote="FY26 revenue ₹539.03 Cr (FY25 ₹435.87), PAT ₹17.65 Cr (FY25 ₹10.51); about a 3.3% margin and roughly 20 times FY26 earnings at the cap.",
 use=[("🏦","Repay working-capital borrowings","The primary stated use is prepaying working-capital debt.","RHP"),
      ("🧰","General corporate purposes","Remaining proceeds are for general corporate purposes.","GCP"),
      ("✅","No promoter exit","100% fresh — all ₹91.50 Cr enters the company.","FRESH")],
 peers=[("Priority Jewels IPO",20.5,"₹200 cap / FY26 earnings",True),("Khazanchi Jewellers",None,"listed jewellery peer",False),("RBZ Jewellers",None,"listed jewellery peer",False),("Ashapuri Gold",None,"listed jewellery peer",False)],
 peerverdict="At about 20 times FY26 earnings, Priority is not cheap for a small jeweller; the disclosed peers differ in scale and mix, so treat the comparison as directional.",
 verdict=[("A thin, roughly 3.3% PAT margin","100% fresh issue — no promoter exit"),
          ("About 20 times earnings for a small jeweller","Profit grew to ₹17.65 Cr from ₹10.51 Cr"),
          ("Gold-price and inventory-cycle risk","Fresh money repays working-capital debt")],
 sources="RHP-based reporting: Equentis, TradingView, IPOWatch, sahi, InvestorGain (FY26 financials, terms).",
),
"rays": dict(
 name="Rays of Belief IPO", board="MAINBOARD", accent="#34D399",
 kicker="IPO ANALYSIS · MAINBOARD · 100% FRESH",
 sub="Neurodevelopmental care (Mom's Belief) · ₹125 Cr · 1–3 Sep 2026",
 biz=[("🧠","Neurodevelopmental care","Mom's Belief provides multidisciplinary intervention for children with neurodevelopmental disorders.","HEALTHCARE"),
      ("📈","Revenue doubled","FY26 revenue more than doubled to ₹81.66 Cr as its centres scaled.","GROWTH"),
      ("⚠️","Profit slipped","Despite the revenue jump, FY26 profit fell to ₹4.96 Cr from ₹5.88 Cr — watch unit economics.","KEY LENS")],
 rev26=81.66, rev25=36.42, pat26=4.96, pat25=5.88, issue=125.0, fresh=125.0, ofs=0.0,
 retail="₹14,818 (62 shares × ₹239)",
 finnote="FY26 revenue ₹81.66 Cr (FY25 ₹36.42, up 124%), but PAT FELL to ₹4.96 Cr from ₹5.88 Cr; EBITDA margin was 14.59%.",
 use=[("🏥","₹41.36 Cr new centres & tech","Funds 319 new intervention centres planned across FY27 to FY29, plus technology.","EXPANSION"),
      ("🏢","₹14.45 Cr leases · ₹10.21 Cr brand","Existing-centre lease payments and brand outreach.","RHP"),
      ("🌍","₹10.13 Cr US subsidiary","Overseas expansion of the US arm.","RHP")],
 peers=[("Rays of Belief IPO",None,"no comparable listed peer",True),("No listed peer",None,"per the RHP disclosure",False)],
 peerverdict="The RHP says there is no comparable listed peer, so there is no P/E benchmark; the standout is that profit fell even as revenue doubled.",
 verdict=[("FY26 profit FELL even as revenue doubled","Revenue more than doubled to ₹81.66 Cr"),
          ("An aggressive 319-centre expansion to fund","100% fresh capital for growth, no OFS"),
          ("No listed peer to benchmark valuation","Addresses a large, underserved care need")],
 sources="RHP-based reporting: Business Standard, BusinessToday, Free Press Journal, onetrader (FY26 financials, objects, terms).",
),
"deepa": dict(
 name="Deepa Jewellers IPO", board="MAINBOARD", accent="#FBBF24",
 kicker="IPO ANALYSIS · MAINBOARD",
 sub="Jewellery retail · ₹459.72 Cr · 1–3 Sep 2026",
 biz=[("💍","Jewellery retail","Designs and retails gold and diamond jewellery with a strong regional footprint.","JEWELLERY"),
      ("🚀","Fast growth, high returns","FY26 revenue ₹1,927 Cr, up 38%, and profit ₹104.8 Cr, up 158%, with return on equity near 56%.","GROWTH"),
      ("⚖️","Part offer for sale","₹250 Cr is fresh and ₹209.7 Cr is an offer for sale — nearly half the deal goes to selling promoters.","STRUCTURE")],
 rev26=1926.70, rev25=1400.10, pat26=104.80, pat25=40.58, issue=459.72, fresh=250.0, ofs=209.72,
 retail="₹14,868 (84 shares × ₹177)",
 finnote="FY26 revenue ₹1,926.7 Cr (FY25 ₹1,400.10, +38%), PAT ₹104.8 Cr (FY25 ₹40.58, +158%); return on equity near 56% and about 16 times earnings.",
 use=[("📦","₹215 Cr working capital","Most of the fresh money funds inventory procurement and scale-up.","RHP"),
      ("🧰","General corporate purposes","The balance is for general corporate purposes.","GCP"),
      ("👥","₹209.7 Cr offer for sale","Selling promoters receive nearly half of the total deal.","OFS")],
 peers=[("Deepa Jewellers IPO",16.2,"₹177 cap / FY26 PAT",True),("Listed jewellery peers",None,"P/E range 10.08 to 57.56x",False)],
 peerverdict="At about 16 times earnings, Deepa sits in the lower half of the disclosed jewellery peer P/E range of 10 to 57 times, with a much higher return on equity.",
 verdict=[("Nearly half the deal is a promoter offer for sale","FY26 profit up 158%, return on equity near 56%"),
          ("Gold inventory and working-capital intensity","Revenue up 38% to ₹1,927 Cr"),
          ("Jewellery-cycle and metal-price exposure","About 16x P/E, in the lower half of the peer range")],
 sources="RHP-based reporting: BusinessToday, IPOWatch, Chittorgarh, Orient Publication (FY26 financials, peer P/E range, terms).",
),
"kwick": dict(
 name="Kwick Forensic Solutions IPO", board="SME", accent="#38BDF8",
 kicker="IPO ANALYSIS · SME",
 sub="Forensic solutions · ₹50.77 Cr · 27–31 Aug 2026",
 biz=[("🔎","Forensic solutions","Supplies crime-scene kits, mobile CSI units, cyber and digital forensics, and DNA-lab solutions.","FORENSICS"),
      ("📈","Profitable SME","FY26 revenue ₹105.8 Cr with ₹13.51 Cr profit — about a 12.8% margin.","QUALITY"),
      ("⚠️","High SME ticket","The stated lot is about ₹1.44 lakh and brokers often require two lots — near ₹2.88 lakh to apply.","SME RISK")],
 rev26=105.80, rev25=65.08, pat26=13.51, pat25=8.56, issue=50.77, fresh=41.05, ofs=9.72,
 retail="Stated lot ₹1,44,000 (1,600 × ₹90); SME two-lot minimum about ₹2,88,000",
 finnote="FY26 revenue ₹105.80 Cr (FY25 ₹65.08), PAT ₹13.51 Cr (FY25 ₹8.56); about a 12.8% margin.",
 use=[("📦","Working capital","Fresh proceeds fund working capital for the forensics business.","RHP"),
      ("🧰","General corporate purposes","The balance is for general corporate purposes.","GCP"),
      ("👥","₹9.72 Cr offer for sale","Part of the deal is an offer for sale to existing holders.","OFS")],
 peers=[("Kwick Forensic IPO",None,"SME; no clean listed peer",True),("No comparable listed peer",None,"thin SME disclosure",False)],
 peerverdict="This is an SME with no clean listed peer: assess the roughly 12.8% margin and the thin post-listing liquidity rather than a borrowed multiple.",
 verdict=[("A high SME ticket, about ₹2.88 lakh for two lots","FY26 revenue ₹105.8 Cr, PAT ₹13.51 Cr, about 12.8% margin"),
          ("Thin SME liquidity after listing","Niche forensics demand from law-enforcement users"),
          ("No clean listed peer to benchmark","Fresh capital funds working capital")],
 sources="RHP-based reporting: Bajaj Broking, IPOWatch, InvestorGain, Chola Securities (FY26 financials, terms).",
),
}

def cards(kicker, title, color, rows):
    return {"kicker":kicker,"title":title,"color":color,"items":[{"emoji":e,"k":k,"v":v,"chip":c} for e,k,v,c in rows]}

def money(x):
    return f"₹{x:,.2f} Cr" if abs(x) < 1000 else f"₹{x:,.0f} Cr"

def chapter(cid, d):
    a = d["accent"]
    def sc(x, v, p, n): return (f"{cid}_{x}", v, p, n)
    rev, pat = d["rev26"], d["pat26"]
    loss = pat < 0
    margin = pat / rev * 100.0
    # Financial-quality beat: revenue, profit/loss, margin.
    pat_stat = {"label":("Net loss" if loss else "Profit after tax"),
                "to":abs(pat), "prefix":("−₹" if loss else "₹"), "suffix":" Cr",
                "decimals":2, "color":("#FB7185" if loss else "#34D399"), "sub":"filing evidence"}
    margin_stat = {"label":"PAT margin", "to":abs(margin), "prefix":("−" if margin < 0 else ""),
                   "suffix":"%", "decimals":2, "color":("#FB7185" if margin < 0 else "#FBBF24"),
                   "sub":("net loss FY26" if loss else "reported FY26 margin")}
    growth = "revenue grew" if rev >= d["rev25"] else "revenue moved to"
    board_note = ("Mainboard retail bids run up to two lakh rupees; allotment can be a lottery when oversubscribed."
                  if d["board"] == "MAINBOARD" else
                  "This is an SME issue: confirm the application multiple and the thinner post-listing liquidity with your broker.")
    # narration
    ntitle = (f"This is the {d['name']}, a {d['board'].lower()} offer. [pause] We will use triangulated "
              f"filing figures to test the business, financial quality, where the money goes, competitors and risks. "
              f"[pause] This is education, not investment advice.")
    nbiz = "First, the business. [pause] " + " [pause] ".join(x[1] + ". " + x[2] for x in d["biz"])
    if loss:
        nfin = (f"The financial checkpoint. [pause] FY26 revenue was {money(rev)}, but the company is loss-making: "
                f"a net loss of {money(abs(pat))}. [pause] {d['finnote']}")
    else:
        nfin = (f"The financial checkpoint. [pause] FY26 revenue was {money(rev)}, profit after tax {money(pat)}, "
                f"about a {abs(margin):.1f} percent margin. [pause] {d['finnote']}")
    if d["ofs"] <= 0:
        nissue = (f"The offer is {money(d['issue'])}, and it is one hundred percent fresh — all of it enters the "
                  f"company. [pause] There is no offer for sale, so no promoter is cashing out in this deal.")
    else:
        nissue = (f"The offer is {money(d['issue'])}: {money(d['fresh'])} is fresh money that enters the company, "
                  f"and {money(d['ofs'])} is an offer for sale that goes to selling shareholders. [pause] "
                  f"Watch that split — fresh capital funds the business; offer-for-sale money does not.")
    nuse = "Where does the money go? [pause] " + " [pause] ".join(x[1] + ". " + x[2] for x in d["use"])
    npeer = "Now competitors and valuation. [pause] " + d["peerverdict"]
    nver = "Balance the evidence. [pause] " + " [pause] ".join("Watch-out: " + m + ". Strength: " + f + "." for m, f in d["verdict"])
    nret = (f"For applying, the stated minimum is {d['retail']}. [pause] {board_note} [pause] "
            f"Grey-market premium is unofficial and is not a listing prediction. [pause] "
            f"Read the final RHP and verify live subscription on the exchange before any decision.")
    recap = [f"FY26: revenue {money(rev)} · " + ("net loss " + money(abs(pat)) if loss else "PAT " + money(pat)),
             (f"Offer: {money(d['issue'])} · 100% fresh" if d["ofs"] <= 0 else f"Offer: {money(d['issue'])} · fresh {money(d['fresh'])} · OFS {money(d['ofs'])}"),
             "Competitor lens: " + d["peerverdict"],
             "Evidence: " + d["sources"]]
    # offer-structure stats (skip OFS stat when 100% fresh so the chart reads cleanly)
    issue_stats = [{"label":"Total offer","to":d["issue"],"prefix":"₹","suffix":" Cr","decimals":2,"color":a,"sub":"offer size"},
                   {"label":"Fresh — company receives","to":d["fresh"],"prefix":"₹","suffix":" Cr","decimals":2,"color":"#34D399","sub":"new capital"}]
    if d["ofs"] > 0:
        issue_stats.append({"label":"OFS — sellers receive","to":d["ofs"],"prefix":"₹","suffix":" Cr","decimals":2,"color":"#FB7185","sub":"shareholder exit"})
    else:
        issue_stats.append({"label":"OFS — sellers receive","to":0.0,"prefix":"₹","suffix":" Cr","decimals":2,"color":"#FB7185","sub":"none — 100% fresh"})
    return [
      sc("title","sm_ptitle",{"title":d["name"],"sub":d["sub"],"kicker":d["kicker"]},ntitle),
      sc("biz","sm_iconcards",cards("WHAT THE COMPANY DOES","Business Model",a,d["biz"]),nbiz),
      sc("fin","sm_stats",{"kicker":"FINANCIAL QUALITY","title":"FY26 Financials","stats":[
          {"label":"Revenue","to":rev,"prefix":"₹","suffix":" Cr","decimals":2,"color":"#34D399","sub":"FY26 filing"},
          pat_stat, margin_stat],"note":d["finnote"]},nfin),
      sc("issue","sm_stats",{"kicker":"OFFER STRUCTURE","title":"Fresh Issue vs OFS","stats":issue_stats,
          "note":"Fresh funds enter the company. Offer-for-sale proceeds go to selling shareholders."},nissue),
      sc("proceeds","sm_iconcards",cards("USE OF PROCEEDS","What The Capital Funds",a,d["use"]),nuse),
      sc("peers","sm_peers",{"kicker":"COMPETITORS · VALUATION","title":"Peer Comparison","color":a,
          "rows":[{"name":n,"pe":p,"note":note,"hi":hi} for n,p,note,hi in d["peers"]],"verdict":d["peerverdict"]},npeer),
      sc("verdict","sm_myths",{"kicker":"CONSOLIDATED ANALYSIS","title":"Strengths vs Watch-outs",
          "mythLabel":"⚠️ WATCH-OUTS","factLabel":"✅ EVIDENCE-BACKED STRENGTHS",
          "pairs":[{"m":m,"f":f} for m,f in d["verdict"]]},nver),
      sc("retail","sm_iconcards",cards("HOW TO APPLY","Check Terms Before You Bid",a,[
          ("🧑","Retail cap","Retail bids up to ₹2 lakh; allocation can be lottery-based when oversubscribed.","RII"),
          ("💰","Minimum bid",d["retail"],"MIN BID"),
          ("📌",d["board"],board_note,d["board"]),
          ("🔎","Verify live","Read the final RHP and the NSE or BSE subscription data before bidding.","SOURCES")]),nret),
      sc("recap","sm_recap",{"title":d["name"]+" — Evidence Recap","items":recap,
          "closer":"Read the final RHP. Decide for yourself."},"Let's recap. [pause] "+" [pause] ".join(recap)+" [pause] "+DIS),
    ]

series.CHAPTERS = {k: chapter(k, v) for k, v in DATA.items()}

def build_no_captions(ch):
    """Preserve the delivered set's no-captions look."""
    series.build_chapter(ch)
    p = os.path.join(ROOT, "artifacts", f"{ch}.json")
    props = json.load(open(p))
    props.pop("captions", None)
    json.dump(props, open(p, "w"), ensure_ascii=False, indent=2)

if __name__ == "__main__":
    for ch in (sys.argv[1:] or list(DATA)):
        build_no_captions(ch)
