#!/usr/bin/env python3
"""IPO explainers — every Indian IPO open on / opening within 7 days of 28 Sep 2026 (IST).

Scheduled run 28 Sep 2026. Format = the proven 9-beat ipo-series-en / ipo-launches deep template
(Lalithaa / Dhoot / Molbio lineage, `sm_*` scene set): title -> business -> FY26 financials ->
fresh vs OFS -> use of proceeds -> peer valuation -> strengths vs watch-outs -> how to apply -> recap.
TTS = Kokoro ONNX af_bella (speed 0.90). Burned-in captions (Explainer `captions` cues), timed per
[pause]-chunk from the measured chunk WAV durations, so each cue sits inside the audio chunk it belongs to.

ELIGIBILITY SOURCES (primary, fetched 28 Sep 2026)
  * NSE https://www.nseindia.com/api/ipo-current-issue  (8 mainboard + 3 NSE Emerge SME listed as Active)
  * NSE https://www.nseindia.com/api/ipo-detail?symbol=<S>  (issue period, size text, band, bid lot, RHP link)
  * BSE https://www.bseindia.com/publicissue (Live + Forthcoming) + each DisplayIPO page (band, lot, dates, RHP)
FIGURES: from each issue's RED HERRING PROSPECTUS (final RHP filed with RoC; offer price is fixed only after
book-building, so every "at the cap" figure below is COMPUTED at the upper end of the announced band) plus the
exchange issue-detail notice, price-band advertisement, anchor-allocation letter and corrigenda where published.
Secondary calendars were NOT used for any figure.

NUMBERS TABLE / DATA GATE  (₹ Cr; FY = year to 31 Mar; RHP figures in ₹ mn or ₹ lakh converted: mn/10, lakh/100)
MAINBOARD
 orient    Orient Cables (India) 25-29 Sep. Band 258-272, lot 55 (NSE detail). Fresh ₹320.00 + OFS ₹232.00 (85,29,409 sh
           @272) = ₹552.00 [PB ad]. Rev FY26 11,716.54mn / FY25 8,249.58mn; PAT 538.13 / 533.21mn; Q1FY27 rev 4,891.56mn
           PAT 332.17mn [RHP KPI]. EPS 5.27 -> P/E 51.61x at cap [PB ad states 51.61]. Peers P/E RR Kabel 54.85, Polycab
           46.69, KEI 48.99, Havells 42.69, Finolex 26.29; industry avg 128.11 incl. Sterlite 708.38 [RHP]. Objects: ₹155.50
           debt, ₹91.50 capex, GCP [RHP]. Net debt/equity 0.94, RoE 25.84% [RHP KPI]. Networking-cable share ~22.9% (1Lattice).
 moneyview Moneyview 24-28 Sep. Band 32-34, lot 441. Fresh ₹750.00 + OFS 10,04,94,200 sh (@34 = ₹341.68) [NSE/RHP];
           anchor @₹34 [anchor letter]. Rev from ops FY26 33,511.58mn / FY25 23,391.46mn; PAT 2,427.05 / 2,402.75mn;
           PAT pre-exceptional 3,973.44mn; exceptional 2,066.53mn incl ₹1,600mn one-time MD&CEO incentive [RHP].
           Diluted EPS 1.57 -> 21.66x. Peers Bajaj Fin 33.66, SBI Cards 27.98, OnEMI 16.62, PB Fintech 120.33 [RHP].
           Objects ₹325.00 DLG disbursal growth, ₹250.00 WFPL capital, GCP. Users 134.14M; managed AUM 213,801.37mn;
           annualised loss 6.95% FY26; impairment 9,835.28mn FY26 [RHP].
 aonesteel A-One Steels India 24-28 Sep. Band 385-405, lot 37. Fresh ₹355.00 + OFS ₹50.00 = ₹405.00 (incl ₹2 Cr employee
           portion, ₹38 discount) [NSE detail]. Total rev from ops FY26 4,16,732.58L / FY25 3,54,437.28L; PAT 12,740.82L
           / 771.05L; EBITDA margin 7.29% / 4.91%; net debt 98,536.80L; D/E 1.17 [RHP KPI]. EPS 18.47 -> 21.93x. Peers
           Shyam Metalics 28.31, Jai Balaji 45.76, MSP 61.52 [RHP]. Objects ₹250.00 debt prepayment + GCP [RHP].
 acevector AceVector (Snapdeal) 25-29 Sep. Band 30-32, lot 468. Fresh ₹287.00 (after ₹13.00 pre-IPO) + OFS 4,15,62,500 sh
           (@32 = ₹133.00) = ₹420.00. Rev FY26 5,103.81mn / FY25 3,950.19mn; loss 455.06 / 1,263.06mn [RHP]. EPS -1.32
           -> P/E n/a. Peer FSN (Nykaa) 462.50; FirstCry & Meesho loss-making n/a [RHP]. Objects ₹132.00 marketing,
           ₹50.00 tech infra, acquisitions+GCP [RHP]. Customers served 12.16M, repeat 69.65% FY26 [RHP].
 runwal    Runwal Enterprises 25-29 Sep. Band 290-305 (NSE detail + anchor allocation @₹305; NSE current-issue list shows a
           stale "302" -> rejected), lot 49. 100% fresh ₹500.00 (incl ₹3.50 employee, ₹14 discount). Rev FY26 17,989.49mn
           / FY25 10,077.66mn (FY24 24,088.65mn); PAT 1,857.63 / 556.48mn; net debt 27,781.10mn; equity 8,448.16mn [RHP].
           EPS 16.74 -> 18.22x. Peers Sunteck 21.09, Oberoi 25.88, Godrej Prop 27.53, Lodha 33.42, Prestige 51.70 [RHP].
           Objects ₹100.00 own debt + ₹225.00 subsidiary debt + acquisitions/GCP [RHP].
 german    German Green Steel & Power 25-29 Sep. Band 132-139, lot 107; anchor @₹139. Fresh ₹290.00 + OFS 10,00,000 sh (@139
           = ₹13.90) = ₹303.90. Rev FY26 1,67,898.17L / FY25 1,50,757.13L; PAT 7,988.87 / 5,994.36L; TMT bars 1,32,196.23L;
           D/E 0.79 [RHP KPI]. EPS 14.91 -> 9.32x. Peers VMS TMT 8.92, Kamdhenu 14.57, Beekay 22.54, Gallant 27.80 [RHP].
           Objects ₹226.33 Kutch expansion + hybrid wind-solar, ₹7.70 debt, GCP. "German TMT" mark licensed (royalty,
           Haq Steels); H&K cease-and-desist notices re "TMX" [RHP risk factors].
 shah      Shah Investor's Home 28-30 Sep. Band 159-167, lot 85; anchor @₹167. 100% fresh 53,99,200 sh (@167 = ₹90.17).
           Rev FY26 7,147.67L / FY25 9,427.39L; PAT 1,310.64 / 2,341.56L (-44.03%) [RHP]. EPS 8.38 -> 19.93x. Peers SMC 16.28,
           Share India 11.70, Arihant 27.09 [RHP]. Objects ₹60.00 working capital + GCP. RoNW 7.35%.
 srit      SRIT India 28-30 Sep. Band 123-130, lot 115. 100% fresh 1,68,00,000 sh (@130 = ₹218.40). Rev FY26 4,499.99mn /
           FY25 3,893.47mn; PAT 432.89 / 336.04mn; D/E 0.23 [RHP]. EPS 9.47 -> 13.73x. Peers Mastek 12.59, Allied Digital
           15.52, Protean 19.80, RailTel 24.03 [RHP]. Objects ₹124.00 WC, ₹12.86 capex, inorganic+GCP [RHP].
SME (min application = 2 lots and above ₹2 lakh for individuals, per each RHP's "Minimum Application Size")
 benchmark Bench Mark Infotech (NSE Emerge) 25-29 Sep. Band 104-110, lot 1,200. Fresh 34,00,000 sh (₹37.40) + OFS 4,58,000
           sh (₹5.04) = ₹42.44. Rev 6,052.76L / 5,003.85L; PAT 1,021.80 / 583.04L (FY24 loss 148.02L). EPS 9.40 -> 11.70x.
           Peers Esconet 15.66, Dynacons 26.55, Xtranet 50.87. Objects ₹30.00 WC + GCP.
 himalayan Himalayan Solar (NSE Emerge) 25-29 Sep. Band 98-103, lot 1,200. Fresh 58,90,800 sh (₹60.68) + OFS 7,14,000 sh
           (₹7.35) = ₹68.03. Rev 17,034.32L / 14,243.73L; PAT 2,066.61 / 1,643.06L. EPS 12.74 -> 8.08x. Peers Ganesh Green
           7.11, Australian Premium Solar 8.34, Solarium 14.99. Objects ₹12.98 capex, ₹29.50 WC, ₹2.12 debt, GCP. Poly line
           ran to Aug 2024 then obsolete under MNRE/ALMM efficiency norms [RHP risk factors].
 greenasia Green Asia Impex (NSE Emerge) 24-28 Sep. Band 85-90, lot 1,600. Fresh ₹53.10 + OFS ₹7.00 = ₹60.10. Rev 38,380.39L
           / 33,762.21L; PAT 1,561.12 / 1,035.20L. EPS 10.56 -> 8.52x. Peers Essex Marine 4.40, Kings Infra 17.21, Apex
           Frozen 29.16. Objects ₹40.03 seafood-processing capex (project ₹51.27) + GCP. China = 31.29% of FY26 revenue.
 peshwa    Peshwa Wheat (BSE SME) 24-28 Sep. Band 95-101, lot 1,200. 100% fresh 52,99,200 sh (₹53.52). Rev 21,593.52L /
           17,153.50L; PAT 1,580.82 / 1,183.61L; operating history from Dec 2023. EPS 11.51 -> 8.77x. Peers Baba Foods 13.10,
           Megastar 40.93. Objects ₹6.69 P&M, ₹5.01 civil, ₹26.50 WC, GCP.
 roopa     Roopa Screen (BSE SME) 24-28 Sep. Band 60-64, lot 2,000. 100% fresh 30,00,000 sh (₹19.20). Rev 5,072.73L /
           4,534.12L; PAT 648.33 / 468.53L. EPS 8.04 -> 7.96x. Peer Stovec 50.54. Objects ₹9.90 new plant, ₹6.00 WC, GCP.
 saiurja   Sai Urja Indo Ventures (BSE SME) 25-29 Sep (dates per corrigendum). Band 107-113, lot 1,200. Fresh 18,28,800 sh
           (₹20.67) + OFS 3,79,200 sh (₹4.28) = ₹24.95. Rev 8,510.97L / 6,552.42L; PAT 423.57 / 313.74L. EPS 7.29 -> 15.50x
           [price-band ad]. Peer Lakshya Powertech 11.27. Objects ₹8.00 WC, ₹6.60 debt, GCP.
 pind      Pind Hospitality (BSE SME) 28-30 Sep. Band 93-99, lot 1,200. 100% fresh 18,00,000 sh (₹17.82). Rev 2,445.09L /
           2,264.56L; PAT 227.30 / 256.23L (-11.29%). EPS 5.41 -> 18.30x. Peers Speciality Restaurants 31.70, Vikram Kamats
           351.44 (outlier), Barbeque-Nation loss. Objects ₹12.70 Lonavala hotel-cum-banquet ("Haveli") + GCP.
 shreetnb  Shree TNB Polymers (BSE SME) 28 Sep-5 Oct. Band 50-53, lot 2,000. 100% fresh 60,00,000 sh (₹31.80). Rev 19,812.73L /
           17,565.24L; PAT 713.46 / 577.10L. EPS 4.65 -> 11.40x [corrigendum ad]. Peers Malpani 7.70, Texmo 15.69, Captain
           Pipes 40.37. Objects ₹15.86 machinery, ₹2.60 solar, ₹1.32 PEB, ₹5.62 debt, GCP. Noble brand 75.61% of revenue.
OMITTED (BSE SME, final RHP not retrievable from the BSE listing server in this run -> core figures unverifiable):
  Black Opal Consultants, Everestims Technologies, Acme Universal Safezone9, Shivchem Agro, Omara Ventures, Dove Soft.
NOT IPOs: Dudani Retail (FPO), Manoj Jewellers / Salem Erode (rights), Cubical / ECS (buyback offers).
Subscription figures deliberately NOT used (NSE detail pages showed day-one 25 Sep snapshots = stale).
No forecasts, no GMP, no buy/sell calls.

Usage: python3 build.py [key ...]      (default: all)
"""
import json, os, re, subprocess, sys
from decimal import Decimal, ROUND_HALF_UP
import numpy as np, soundfile as sf, kokoro_onnx

VOICE = "af_bella"; SPEED = 0.90; GAP = 0.5; PAUSE = 0.5; PREFIX = "ipo28"; SR = 24000
MODEL = os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx")
VOICES = os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
PUBLIC = os.path.join(REPO, "composer", "public", PREFIX)
os.makedirs(PUBLIC, exist_ok=True)

def proj(key):
    return os.path.join(REPO, "projects", f"ipo-28sep-{key}")

# ---------------------------------------------------------------- formatting (screen) and speech
def q(x, d=2):
    """Half-up rounding on the decimal string (avoids binary-float 171.535 -> 171.53)."""
    return float(Decimal(repr(x)).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP))

def inr(x, d=2):
    """Indian digit grouping: 123456.7 -> 1,23,456.70 (half-up)"""
    neg = x < 0; x = abs(x)
    s = str(Decimal(repr(x)).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP)); whole, _, frac = s.partition(".")
    if len(whole) > 3:
        head, tail = whole[:-3], whole[-3:]
        head = re.sub(r"(\d)(?=(\d\d)+$)", r"\1,", head)
        whole = head + "," + tail
    return ("-" if neg else "") + whole + ("." + frac if frac else "")

def cr(x):       return f"₹{inr(x)} Cr"
def rs(x):       return f"₹{inr(x, 0)}"
def pct(x):      return f"{inr(x)}%"
def tms(x):      return f"{inr(x)}x"

ABBR = [(r"P/E", "P E"), (r"\bFY(\d\d)\b", r"F Y \1"), (r"\bOFS\b", "O F S"), (r"\bSME\b", "S M E"),
        (r"\bSEBI\b", "Sebi"), (r"\bGCP\b", "general corporate purposes"), (r"\bD/E\b", "debt to equity"),
        (r"\bRoE\b", "return on equity"), (r"\bRoNW\b", "return on net worth"), (r"\bQ1\b", "Q 1"),
        (r"\bMW\b", "megawatt"), (r"\bIPO\b", "I P O"), (r"\bIPOs\b", "I P Os"), (r"\bEV\b", "E V"),
        (r"\bUPI\b", "U P I"), (r"\bNII\b", "N I I"), (r"\bKPI\b", "K P I"), (r"\bNBFC\b", "N B F C"),
        (r"\bEPC\b", "E P C"), (r"\bAI\b", "A I"), (r"\bMD\b", "M D"), (r"\bCEO\b", "C E O"), (r"\bTMT\b", "T M T"),
        (r"\bPV\b", "P V"), (r"\bDLG\b", "D L G"), (r"\bAUM\b", "A U M")]

def indian_words(m):
    """2,64,000 -> '2 lakh 64000'; 4,15,62,500 -> '4 crore 15 lakh 62500' (natural Indian reading)."""
    n = int(m.group(0).replace(",", "")); out = []
    c, l, r = n // 10**7, (n % 10**7) // 10**5, n % 10**5
    if c: out.append(f"{c} crore")
    if l: out.append(f"{l} lakh")
    if r: out.append(str(r))
    return " ".join(out)

def spoken(text):
    t = text
    t = re.sub(r"₹\s?([\d,]+(?:\.\d+)?)\s?Cr\b", r"\1 crore rupees", t)
    t = re.sub(r"₹\s?([\d,]+(?:\.\d+)?)\s?lakh\b", r"\1 lakh rupees", t)
    t = re.sub(r"₹\s?([\d,]+(?:\.\d+)?)", r"\1 rupees", t)
    t = re.sub(r"\b\d{1,2}(?:,\d\d)+,\d{3}\b(?!\.\d)", indian_words, t)
    t = re.sub(r"(?<=\d),(?=\d)", "", t)
    t = re.sub(r"(\d+(?:\.\d+)?)x\b", r"\1 times", t)
    t = t.replace("%", " percent")
    def dec(m):
        if set(m.group(2)) == {"0"}: return m.group(1)          # 133.00 -> 133 (still exact)
        return m.group(1) + " point " + " ".join(m.group(2))
    t = re.sub(r"(\d+)\.(\d+)", dec, t)
    for a, b in ABBR:
        t = re.sub(a, b, t)
    t = t.replace("–", " to ").replace("—", ", ").replace("·", ",").replace("→", " to ")
    return re.sub(r"\s+", " ", t).strip()

# ---------------------------------------------------------------- data (see numbers table above)
# rev/pat in ₹ Cr (pat < 0 = loss). eps = FY26 diluted EPS. fresh/ofs ₹ Cr at the cap.
MB, SME = "MAINBOARD", "SME"
DATA = {
"orient": dict(
 name="Orient Cables (India) IPO", board=MB, exch="NSE & BSE", dates="25–29 Sep 2026", say_dates="the twenty-fifth to the twenty-ninth of September",
 lo=258, hi=272, lot=55, fresh=320.00, ofs=232.00, rev26=1171.654, rev25=824.958, pat26=53.813, pat25=53.321, eps=5.27, accent="#38BDF8",
 kicker="IPO ANALYSIS · MAINBOARD · FRESH + OFS", sub="Networking & specialty cables · ₹552.00 Cr · 25–29 Sep 2026",
 biz=[("🔌", "Networking-cable specialist", "LAN, specialty power and optical-fibre cables plus harnesses and EV-charging cable assemblies.", "CABLES"),
      ("📡", "About 22.9% share", "A top-four Indian networking-cable maker, with about 22.9% share in FY26 per the RHP's industry report.", "SCALE"),
      ("🏭", "Plants in Bhiwadi + Bengaluru", "Two Rajasthan plants and a Bengaluru plant that started in May 2026.", "CAPACITY")],
 n_biz=("First, the business. [pause] Orient Cables makes networking cables, the LAN cables inside offices and data rooms, "
        "plus specialty power cables, optical-fibre cables and cable harnesses, including E V charging-gun assemblies. [pause] "
        "The RHP's industry report puts it among India's top four networking-cable makers, with about 22.9% share in FY26. [pause] "
        "It runs two plants in Bhiwadi, Rajasthan, and a new Bengaluru plant that started in May 2026."),
 finnote="Revenue jumped 42.03%, but PAT was flat: ₹53.81 Cr vs ₹53.32 Cr. Q1 FY27 alone: ₹489.16 Cr revenue, ₹33.22 Cr PAT.",
 n_fin_extra=("Here is the catch. [pause] Revenue grew 42.03%, but profit barely moved, from ₹53.32 Cr to ₹53.81 Cr, "
              "so the margin fell from 6.46% to 4.59%. [pause] The June 2026 quarter looked stronger: ₹489.16 Cr of revenue and ₹33.22 Cr of profit, "
              "though a single quarter is not a full year."),
 use=[("🏦", "₹155.50 Cr debt repayment", "The largest use of the fresh money: repaying borrowings. Net debt to equity was 0.94 in FY26.", "DEBT"),
      ("⚙️", "₹91.50 Cr capex", "Machinery, equipment and civil works at its plants, spread over FY27 to FY29.", "CAPEX"),
      ("👥", "₹232.00 Cr offer for sale", "Promoter Vipul Nagpal, Garima Nagpal and two family trusts sell shares; the company gets none of it.", "OFS")],
 n_use=("Where does the money go? [pause] Of the ₹320.00 Cr fresh issue, ₹155.50 Cr repays debt. [pause] "
        "₹91.50 Cr goes to machinery and civil works, and the rest to general corporate purposes. [pause] "
        "The ₹232.00 Cr offer for sale goes to the promoter family and its two trusts, whose average acquisition cost the ad lists as between zero and ₹0.01 a share."),
 peers=[("Finolex Cables", 26.29, "cables peer"), ("Havells India", 42.69, "electricals + cables"), ("Polycab India", 46.69, "cables leader"),
        ("KEI Industries", 48.99, "cables peer"), ("RR Kabel", 54.85, "wires & cables")],
 peerverdict="At 51.61x FY26 earnings, Orient is priced near the top of its large, established cable peers.",
 n_peer=("Now, valuation. [pause] At the ₹272 cap, the price is 51.61x FY26 earnings per share of ₹5.27. [pause] "
         "That sits near the top of its listed cable peers: Finolex at 26.29x, Havells 42.69x, Polycab 46.69x, KEI 48.99x and R R Kabel 54.85x. [pause] "
         "The RHP's 128.11x industry average is pulled up by Sterlite Technologies at 708.38x, so the peer range is the fairer yardstick."),
 verdict=[("PAT flat while revenue grew 42.03%", "About 22.9% share of India's networking-cable market"),
          ("51.61x P/E, near the top of listed peers", "Strong Q1 FY27: ₹33.22 Cr PAT in one quarter"),
          ("42.03% of the offer is promoter OFS", "₹155.50 Cr of fresh money cuts debt")],
 sources="Final RHP + price-band ad (NSE), NSE issue page, anchor letter",
),
"moneyview": dict(
 name="Moneyview IPO", board=MB, exch="NSE & BSE", dates="24–28 Sep 2026", say_dates="the twenty-fourth to the twenty-eighth of September, closing today",
 lo=32, hi=34, lot=441, fresh=750.00, ofs=341.68, rev26=3351.158, rev25=2339.146, pat26=242.705, pat25=240.275, eps=1.57, accent="#A78BFA",
 kicker="IPO ANALYSIS · MAINBOARD · DIGITAL LENDING", sub="Digital personal-loan platform · ₹1,091.68 Cr · 24–28 Sep 2026",
 biz=[("📱", "Digital credit platform", "An app-led personal-loan platform: 134.14 million registered users by March 2026.", "FINTECH"),
      ("🤝", "Partner-funded + own NBFC", "Loans come from 48 financial partners plus its own NBFC, Whizdm Finance.", "MODEL"),
      ("📊", "₹21,380.14 Cr managed book", "Managed AUM of unsecured personal loans; annualised losses fell to 6.95% in FY26.", "SCALE")],
 n_biz=("First, the business. [pause] Moneyview is a digital lending platform. Its app had 134.14 million registered users by March 2026. [pause] "
        "Most personal loans are funded by 48 financial partners, with its own NBFC, Whizdm Finance, also lending. [pause] "
        "The managed book of unsecured personal loans was ₹21,380.14 Cr, and annualised losses on those loans eased to 6.95% in FY26."),
 finnote="FY26 PAT of ₹242.71 Cr is after a ₹206.65 Cr exceptional charge, including a ₹160 Cr one-time CEO incentive. Before it: ₹397.34 Cr.",
 n_fin_extra=("One detail matters here. [pause] Reported profit includes a ₹206.65 Cr exceptional charge, mostly a one-time ₹160 Cr performance incentive to the MD and CEO. "
              "Before exceptional items, FY26 profit was ₹397.34 Cr. [pause] Also note loan impairments of ₹983.53 Cr in FY26, the core risk in unsecured lending."),
 use=[("🛡️", "₹325.00 Cr for DLG-backed growth", "Default-loss-guarantee deposits that let partners disburse more loans.", "GROWTH"),
      ("🏦", "₹250.00 Cr into Whizdm Finance", "Capital for its NBFC subsidiary's lending base.", "CAPITAL"),
      ("👥", "₹341.68 Cr offer for sale", "Accel, Internet Fund III, Ribbit and the founders sell part of their stakes.", "OFS")],
 n_use=("Where does the money go? [pause] Of the ₹750.00 Cr fresh issue, ₹325.00 Cr funds default-loss-guarantee arrangements, "
        "the deposits that let lending partners disburse more loans through Moneyview. [pause] ₹250.00 Cr strengthens the capital of its NBFC, Whizdm Finance. [pause] "
        "The offer for sale is about ₹341.68 Cr at the cap, sold by investors including Accel, Internet Fund III and Ribbit, and by the founders."),
 peers=[("OnEMI Technology", 16.62, "digital lending"), ("SBI Cards", 27.98, "consumer credit"), ("Bajaj Finance", 33.66, "consumer NBFC"),
        ("PB Fintech", 120.33, "fintech platform")],
 peerverdict="At 21.66x reported FY26 EPS, Moneyview is below Bajaj Finance and SBI Cards, above OnEMI.",
 n_peer=("Valuation. [pause] At the ₹34 cap, the price is 21.66x reported FY26 diluted earnings of ₹1.57 a share. [pause] "
         "Listed peers range from OnEMI at 16.62x, SBI Cards 27.98x and Bajaj Finance 33.66x, to PB Fintech at 120.33x. [pause] "
         "Remember the reported figure already carries the one-time charge; on pre-exceptional profit the multiple would be lower."),
 verdict=[("Unsecured loans: ₹983.53 Cr impairment in FY26", "Revenue up 43.26% to ₹3,351.16 Cr"),
          ("Default-loss guarantees keep credit risk on its books", "Profit before exceptional items up 65.37%"),
          ("31.30% of the offer is investor OFS", "21.66x P/E, below Bajaj Finance and SBI Cards")],
 sources="Final RHP (NSE), NSE issue page, anchor allocation @₹34",
),
"aonesteel": dict(
 name="A-One Steels India IPO", board=MB, exch="NSE & BSE", dates="24–28 Sep 2026", say_dates="the twenty-fourth to the twenty-eighth of September, closing today",
 lo=385, hi=405, lot=37, fresh=355.00, ofs=50.00, rev26=4167.3258, rev25=3544.3728, pat26=127.4082, pat25=7.7105, eps=18.47, accent="#F59E0B",
 kicker="IPO ANALYSIS · MAINBOARD · STEEL", sub="Integrated steel, south India · ₹405.00 Cr · 24–28 Sep 2026",
 biz=[("🏗️", "Backward-integrated steel", "A south-India steel maker (Karnataka) with a diversified steel-product portfolio.", "STEEL"),
      ("♻️", "Green-energy use", "The RHP highlights green power use and a certified green product range.", "ESG"),
      ("📈", "Margins recovered in FY26", "EBITDA margin rose to 7.29% from 4.91%, lifting profit sharply.", "CYCLE")],
 n_biz=("First, the business. [pause] A-One Steels is a backward-integrated steel maker based in Karnataka, selling a range of steel products across south India. [pause] "
        "The RHP highlights green-energy use and a certified green product portfolio. [pause] "
        "FY26 was a recovery year: the EBITDA margin rose to 7.29% from 4.91%."),
 finnote="FY25 PAT was just ₹7.71 Cr; FY26 jumped to ₹127.41 Cr. Net debt ₹985.37 Cr; debt-to-equity 1.17.",
 n_fin_extra=("Context matters. [pause] FY25 profit was only ₹7.71 Cr, so the jump to ₹127.41 Cr shows how cyclical steel earnings are. [pause] "
              "Net debt was ₹985.37 Cr at March 2026, with debt to equity of 1.17."),
 use=[("🏦", "₹250.00 Cr debt prepayment", "Most of the fresh money prepays borrowings from its lenders.", "DEBT"),
      ("🧰", "General corporate purposes", "The balance of the ₹355.00 Cr fresh issue, capped at 25% of gross proceeds.", "GCP"),
      ("👥", "₹50.00 Cr offer for sale", "Promoter selling shareholders receive this part, not the company.", "OFS")],
 n_use=("Where does the money go? [pause] Of the ₹355.00 Cr fresh issue, ₹250.00 Cr prepays debt, and the rest is for general corporate purposes. [pause] "
        "The ₹50.00 Cr offer for sale goes to promoter selling shareholders. [pause] Eligible employees get a ₹38 discount in a small ₹2 Cr reserved portion."),
 peers=[("Shyam Metalics", 28.31, "integrated steel"), ("Jai Balaji Industries", 45.76, "steel & ferro alloys"), ("MSP Steel & Power", 61.52, "steel & power")],
 peerverdict="At 21.93x FY26 EPS, A-One is priced below all three listed steel peers in its RHP.",
 n_peer=("Valuation. [pause] At the ₹405 cap, the price is 21.93x FY26 earnings of ₹18.47 a share. [pause] "
         "The RHP's peers trade higher: Shyam Metalics at 28.31x, Jai Balaji 45.76x and M S P Steel 61.52x. [pause] "
         "But a single strong year after a weak one makes any P E on steel earnings fragile."),
 verdict=[("FY25 PAT was only ₹7.71 Cr: earnings are cyclical", "FY26 PAT ₹127.41 Cr on ₹4,167.33 Cr revenue"),
          ("Net debt ₹985.37 Cr, D/E 1.17", "₹250.00 Cr of fresh money prepays debt"),
          ("Thin 3.06% PAT margin", "21.93x P/E, below listed steel peers")],
 sources="Final RHP (NSE), NSE issue page, anchor letter",
),
"acevector": dict(
 name="AceVector (Snapdeal) IPO", board=MB, exch="NSE & BSE", dates="25–29 Sep 2026", say_dates="the twenty-fifth to the twenty-ninth of September",
 lo=30, hi=32, lot=468, fresh=287.00, ofs=133.00, rev26=510.381, rev25=395.019, pat26=-45.506, pat25=-126.306, eps=None, accent="#FB7185",
 kicker="IPO ANALYSIS · MAINBOARD · LOSS-MAKING", sub="Snapdeal · Unicommerce · Stellaro · ₹420.00 Cr · 25–29 Sep 2026",
 biz=[("🛒", "Snapdeal marketplace", "A value-focused lifestyle e-commerce marketplace; 12.16 million customers served in FY26.", "VALUE"),
      ("🧩", "Unicommerce SaaS", "E-commerce enablement software for sellers and brands.", "SAAS"),
      ("🏷️", "Stellaro brands", "Its own consumer brands, the third leg of the group.", "BRANDS")],
 n_biz=("First, the business. [pause] AceVector is the parent of Snapdeal, a value-focused lifestyle marketplace that served 12.16 million customers in FY26, "
        "with 69.65% of them repeat buyers. [pause] It also owns Unicommerce, which sells e-commerce software to sellers and brands, "
        "and Stellaro, its consumer-brands arm."),
 finnote="Still loss-making: FY26 net loss ₹45.51 Cr, narrowed from ₹126.31 Cr. Revenue grew 29.20% to ₹510.38 Cr.",
 n_fin_extra=("The trend is improving. [pause] The loss narrowed from ₹126.31 Cr to ₹45.51 Cr as revenue grew 29.20%. "
              "But until it reports a profit, there is no earnings multiple to anchor the price."),
 use=[("📣", "₹132.00 Cr marketing", "Marketing and business promotion for the Snapdeal marketplace.", "GROWTH"),
      ("🖥️", "₹50.00 Cr technology", "Technology infrastructure costs of the marketplace.", "TECH"),
      ("👥", "₹133.00 Cr offer for sale", "Existing shareholders sell 4,15,62,500 shares.", "OFS")],
 n_use=("Where does the money go? [pause] Of the ₹287.00 Cr fresh issue, ₹132.00 Cr goes to marketing and ₹50.00 Cr to technology infrastructure for Snapdeal. [pause] "
        "The rest can fund acquisitions and general corporate purposes. [pause] "
        "Existing shareholders sell 4,15,62,500 shares, worth ₹133.00 Cr at the cap, in the offer for sale."),
 peers=[("FSN E-Commerce (Nykaa)", 462.50, "only profitable peer"), ("Brainbees (FirstCry)", None, "loss-making"),
        ("Meesho", None, "loss-making"), ("AceVector", None, "loss-making")],
 peerverdict="No P/E: AceVector and two of three listed peers are loss-making; Nykaa trades at 462.50x.",
 n_peer=("Valuation. [pause] AceVector made a loss, so it has no P E. [pause] Of its RHP peers, FirstCry's parent and Meesho are also loss-making, "
         "and Nykaa's parent trades at 462.50x earnings. [pause] So judge this one on the path to profit and on revenue growth, not on a multiple."),
 verdict=[("Still loss-making: ₹45.51 Cr FY26 loss", "Loss narrowed from ₹126.31 Cr"),
          ("Proceeds mostly fund marketing spend", "Revenue up 29.20% to ₹510.38 Cr"),
          ("Negative return on net worth: -59.54%", "Diversified: marketplace, SaaS and brands")],
 sources="Final RHP + price-band ad (NSE), NSE issue page",
),
"runwal": dict(
 name="Runwal Enterprises IPO", board=MB, exch="NSE & BSE", dates="25–29 Sep 2026", say_dates="the twenty-fifth to the twenty-ninth of September",
 lo=290, hi=305, lot=49, fresh=500.00, ofs=0.0, rev26=1798.949, rev25=1007.766, pat26=185.763, pat25=55.648, eps=16.74, accent="#34D399",
 kicker="IPO ANALYSIS · MAINBOARD · 100% FRESH", sub="Mumbai residential real estate · ₹500.00 Cr · 25–29 Sep 2026",
 biz=[("🏙️", "Mumbai residential developer", "A prominent Mumbai residential brand with ongoing and upcoming projects.", "REALTY"),
      ("🏘️", "Township specialist", "Large townships with schools, malls and retail built in.", "TOWNSHIPS"),
      ("📉", "Lumpy revenue", "FY24 revenue ₹2,408.87 Cr, FY25 ₹1,007.77 Cr, FY26 ₹1,798.95 Cr: recognition follows project completion.", "CYCLE")],
 n_biz=("First, the business. [pause] Runwal is a Mumbai residential real-estate developer, known for large townships "
        "that include schools, malls and shopping arcades. [pause] Real-estate revenue is lumpy: ₹2,408.87 Cr in FY24, "
        "₹1,007.77 Cr in FY25, and ₹1,798.95 Cr in FY26, because sales are recognised as projects complete."),
 finnote="FY26 PAT ₹185.76 Cr vs ₹55.65 Cr. Net debt ₹2,778.11 Cr against equity of ₹844.82 Cr at March 2026.",
 n_fin_extra=("The balance sheet is the key lens. [pause] Net debt was ₹2,778.11 Cr at March 2026, against total equity of ₹844.82 Cr, "
              "so net debt is about 3.29x equity."),
 use=[("🏦", "₹100.00 Cr own debt", "Repaying the company's own borrowings.", "DEBT"),
      ("🏢", "₹225.00 Cr subsidiary debt", "Investment in Evie Real Estate and Runwal Residency to repay their loans.", "DEBT"),
      ("🗺️", "Future land + GCP", "The balance funds acquisitions of future projects and general corporate purposes.", "GROWTH")],
 n_use=("Where does the money go? [pause] The whole ₹500.00 Cr is fresh money; there is no offer for sale. [pause] "
        "₹100.00 Cr repays the company's own debt, and ₹225.00 Cr goes into two subsidiaries, Evie Real Estate and Runwal Residency, to repay theirs. [pause] "
        "The balance can fund future project acquisitions and general corporate purposes."),
 peers=[("Sunteck Realty", 21.09, "Mumbai developer"), ("Oberoi Realty", 25.88, "Mumbai developer"), ("Godrej Properties", 27.53, "national developer"),
        ("Lodha Developers", 33.42, "Mumbai developer"), ("Prestige Estates", 51.70, "national developer")],
 peerverdict="At 18.22x FY26 EPS, Runwal is priced below every listed peer in its RHP.",
 n_peer=("Valuation. [pause] At the ₹305 cap, the price is 18.22x FY26 earnings of ₹16.74 a share. [pause] "
         "That is below all its listed peers: Sunteck at 21.09x, Oberoi 25.88x, Godrej Properties 27.53x, Lodha 33.42x and Prestige 51.70x. [pause] "
         "The discount partly reflects much higher leverage and lumpy profits."),
 verdict=[("Net debt ~3.29x equity", "100% fresh: no promoter selling"),
          ("Lumpy revenue: FY25 fell to ₹1,007.77 Cr", "FY26 PAT up to ₹185.76 Cr"),
          ("₹325.00 Cr of proceeds only repays debt", "18.22x P/E, below listed Mumbai peers")],
 sources="Final RHP (NSE), NSE issue page, anchor allocation @₹305",
),
"german": dict(
 name="German Green Steel and Power IPO", board=MB, exch="NSE & BSE", dates="25–29 Sep 2026", say_dates="the twenty-fifth to the twenty-ninth of September",
 lo=132, hi=139, lot=107, fresh=290.00, ofs=13.90, rev26=1678.9817, rev25=1507.5713, pat26=79.8887, pat25=59.9436, eps=14.91, accent="#84CC16",
 kicker="IPO ANALYSIS · MAINBOARD · TMT STEEL", sub="TMT bars, Gujarat · ₹303.90 Cr · 25–29 Sep 2026",
 biz=[("🏗️", "TMT bars, Gujarat", "TMT bars were 78.74% of FY26 revenue; also billets and sponge iron.", "STEEL"),
      ("⚡", "Integrated with captive power", "A vertically integrated set-up in Kutch, including a captive power plant.", "INTEGRATED"),
      ("🛣️", "Gujarat distribution", "An extensive dealer network in Gujarat with long customer relationships.", "REACH")],
 n_biz=("First, the business. [pause] German Green Steel and Power makes TMT bars, the reinforcement steel used in construction, "
        "which were 78.74% of FY26 revenue. It also sells billets and sponge iron. [pause] "
        "Its plant in Kutch, Gujarat, is vertically integrated with a captive power plant, and it sells through a wide Gujarat dealer network."),
 finnote="Revenue +11.37% to ₹1,678.98 Cr; PAT +33.27% to ₹79.89 Cr. EBITDA margin 9.94%; debt-to-equity 0.79.",
 n_fin_extra=("Profit grew faster than revenue: 33.27% against 11.37%, with the EBITDA margin up to 9.94%. [pause] "
              "Debt to equity eased to 0.79."),
 use=[("🏭", "₹226.33 Cr expansion", "Expanding the Samakhiyali, Kutch plant plus a hybrid wind-solar power plant.", "CAPEX"),
      ("🏦", "₹7.70 Cr debt", "Prepaying part of its borrowings.", "DEBT"),
      ("👥", "₹13.90 Cr offer for sale", "Two promoters sell 5,00,000 shares each.", "OFS")],
 n_use=("Where does the money go? [pause] Of the ₹290.00 Cr fresh issue, ₹226.33 Cr funds expansion at Samakhiyali in Kutch and a hybrid wind and solar power plant. [pause] "
        "₹7.70 Cr repays debt, and the rest is for general corporate purposes. [pause] Two promoters sell 10,00,000 shares, about ₹13.90 Cr at the cap."),
 peers=[("VMS TMT", 8.92, "TMT peer"), ("Kamdhenu", 14.57, "TMT brand"), ("Beekay Steel", 22.54, "steel peer"), ("Gallant Ispat", 27.80, "integrated steel")],
 peerverdict="At 9.32x FY26 EPS, German Green Steel sits at the low end of its listed peers.",
 n_peer=("Valuation. [pause] At the ₹139 cap, the price is 9.32x FY26 earnings of ₹14.91 a share. [pause] "
         "Listed peers range from V M S TMT at 8.92x and Kamdhenu at 14.57x to Beekay at 22.54x and Gallant Ispat at 27.80x. [pause] "
         "So the pricing is at the low end of the range."),
 verdict=[("The 'German TMT' brand is licensed, not owned", "9.32x P/E, at the low end of peers"),
          ("Trademark notices from H&K over 'TMX' use", "PAT up 33.27% to ₹79.89 Cr"),
          ("₹226.33 Cr expansion must be executed", "95.43% of the offer is fresh capital")],
 sources="Final RHP + price-band ad (NSE), NSE issue page, anchor allocation @₹139",
),
"shah": dict(
 name="Shah Investor's Home IPO", board=MB, exch="NSE & BSE", dates="28–30 Sep 2026", say_dates="the twenty-eighth to the thirtieth of September",
 lo=159, hi=167, lot=85, fresh=90.17, ofs=0.0, rev26=71.4767, rev25=94.2739, pat26=13.1064, pat25=23.4156, eps=8.38, accent="#F472B6",
 kicker="IPO ANALYSIS · MAINBOARD · 100% FRESH", sub="Stock broking, Gujarat · ₹90.17 Cr · 28–30 Sep 2026",
 biz=[("📈", "Stock broking", "A Gujarat-based broking house with a sizeable client base across the state.", "BROKING"),
      ("💻", "Technology-led service", "Online platforms to serve and retain clients.", "TECH"),
      ("📉", "A weaker FY26", "Revenue fell 24.18% and profit fell 44.03% in FY26.", "WATCH")],
 n_biz=("First, the business. [pause] Shah Investor's Home is a stock broker with a sizeable client base across Gujarat, "
        "using online platforms to serve clients. [pause] Broking income moves with market activity, and FY26 was weaker: "
        "revenue fell 24.18% and profit fell 44.03%."),
 finnote="FY26 revenue ₹71.48 Cr (FY25 ₹94.27 Cr); PAT ₹13.11 Cr (FY25 ₹23.42 Cr). Return on net worth 7.35%.",
 n_fin_extra=("Both lines went down. [pause] Profit fell to ₹13.11 Cr from ₹23.42 Cr, and the return on net worth was 7.35%."),
 use=[("💼", "₹60.00 Cr working capital", "Most of the proceeds fund working capital for the broking business.", "WC"),
      ("🧰", "General corporate purposes", "The balance, capped at 25% of gross proceeds.", "GCP"),
      ("✅", "No offer for sale", "All 53,99,200 shares are new; the whole ₹90.17 Cr enters the company.", "FRESH")],
 n_use=("Where does the money go? [pause] It is a 100% fresh issue of 53,99,200 shares, about ₹90.17 Cr at the cap. [pause] "
        "₹60.00 Cr funds working capital, and the balance is for general corporate purposes. [pause] No existing shareholder is selling."),
 peers=[("Share India Securities", 11.70, "broking peer"), ("SMC Global", 16.28, "broking peer"), ("Arihant Capital", 27.09, "broking peer")],
 peerverdict="At 19.93x FY26 EPS, Shah sits in the middle of its broking peers, after a falling year.",
 n_peer=("Valuation. [pause] At the ₹167 cap, the price is 19.93x FY26 earnings of ₹8.38 a share. [pause] "
         "Broking peers range from Share India at 11.70x and S M C Global at 16.28x to Arihant Capital at 27.09x. [pause] "
         "That is mid-range, but it is priced on a year when profit fell 44.03%."),
 verdict=[("FY26 PAT fell 44.03%", "100% fresh, no promoter exit"),
          ("Low 7.35% return on net worth", "Established Gujarat client base"),
          ("Income tied to market activity", "19.93x P/E, mid-range of peers")],
 sources="Final RHP + price-band ad (NSE), NSE issue page, anchor allocation @₹167",
),
"srit": dict(
 name="SRIT India IPO", board=MB, exch="NSE & BSE", dates="28–30 Sep 2026", say_dates="the twenty-eighth to the thirtieth of September",
 lo=123, hi=130, lot=115, fresh=218.40, ofs=0.0, rev26=449.999, rev25=389.347, pat26=43.289, pat25=33.604, eps=9.47, accent="#22D3EE",
 kicker="IPO ANALYSIS · MAINBOARD · 100% FRESH", sub="Digital platforms for government & enterprise · ₹218.40 Cr · 28–30 Sep 2026",
 biz=[("🏛️", "Government digital platforms", "Designs, builds and runs platforms for governments and enterprises: healthcare, e-governance, telecom.", "GOVTECH"),
      ("🧠", "Products + integration", "Software products with system integration and managed services; AI video analytics and conversational AI.", "STACK"),
      ("⏳", "26-year track record", "Operating for twenty-six years, in India and select overseas markets.", "TRACK")],
 n_biz=("First, the business. [pause] SRIT India builds and runs digital platforms for governments and enterprises, in healthcare, "
        "e-governance, and telecom and broadband. [pause] It combines its own software products with system integration and managed services, "
        "and has added AI video analytics and conversational AI. [pause] It has a twenty-six-year track record."),
 finnote="Revenue +15.58% to ₹450.00 Cr; PAT +28.82% to ₹43.29 Cr. Debt-to-equity 0.23; return on equity 29.98%.",
 n_fin_extra=("Profit grew faster than revenue: 28.82% against 15.58%. [pause] Debt to equity fell to 0.23, and return on equity was 29.98%."),
 use=[("💼", "₹124.00 Cr working capital", "The largest use: government projects tie up working capital.", "WC"),
      ("🛠️", "₹12.86 Cr capex", "Modernising and redeveloping existing products.", "CAPEX"),
      ("🧩", "Acquisitions + GCP", "The balance funds unidentified acquisitions and general corporate purposes.", "GROWTH")],
 n_use=("Where does the money go? [pause] It is a 100% fresh issue of 1,68,00,000 shares, about ₹218.40 Cr at the cap. [pause] "
        "₹124.00 Cr funds working capital, and ₹12.86 Cr modernises its products. [pause] "
        "The rest can go to acquisitions and general corporate purposes. The working-capital need shows how much cash government contracts tie up."),
 peers=[("Mastek", 12.59, "IT services"), ("Allied Digital", 15.52, "IT infra services"), ("Protean eGov", 19.80, "e-governance"), ("RailTel", 24.03, "govt telecom & IT")],
 peerverdict="At 13.73x FY26 EPS, SRIT is priced at the lower end of its listed peers.",
 n_peer=("Valuation. [pause] At the ₹130 cap, the price is 13.73x FY26 earnings of ₹9.47 a share. [pause] "
         "Peers range from Mastek at 12.59x and Allied Digital at 15.52x to Protean at 19.80x and RailTel at 24.03x. [pause] "
         "So it is at the lower end of the range."),
 verdict=[("Working-capital heavy government contracts", "PAT up 28.82% to ₹43.29 Cr"),
          ("₹124.00 Cr of proceeds go to working capital", "Low debt: D/E 0.23"),
          ("Acquisition funds not yet identified", "13.73x P/E, lower end of peers")],
 sources="Final RHP + price-band ad (NSE), NSE issue page, anchor letter",
),
"benchmark": dict(
 name="Bench Mark Infotech IPO", board=SME, exch="NSE Emerge", dates="25–29 Sep 2026", say_dates="the twenty-fifth to the twenty-ninth of September",
 lo=104, hi=110, lot=1200, fresh=37.40, ofs=5.04, rev26=60.5276, rev25=50.0385, pat26=10.218, pat25=5.8304, eps=9.40, accent="#38BDF8",
 kicker="IPO ANALYSIS · SME · NSE EMERGE", sub="IT & digital infrastructure, Kolkata · ₹42.44 Cr · 25–29 Sep 2026",
 biz=[("🌐", "IT & digital infrastructure", "Networks, wireless, surveillance, audio-visual and smart classrooms.", "INFRA"),
      ("🏛️", "Government-heavy clients", "Government departments, PSUs, institutions and private clients across India.", "CLIENTS"),
      ("🧾", "19 years, Kolkata", "Incorporated in Kolkata in 2007; a single-window design-to-maintain partner.", "TRACK")],
 n_biz=("First, the business. [pause] Bench Mark Infotech, from Kolkata, designs, installs and maintains IT and digital infrastructure: "
        "networks, wireless systems, surveillance, audio-visual set-ups and smart classrooms. [pause] "
        "Its customers are mostly government departments, public-sector undertakings and institutions, plus private clients."),
 finnote="Revenue +20.96% to ₹60.53 Cr; PAT ₹10.22 Cr vs ₹5.83 Cr. FY24 was a ₹1.48 Cr loss.",
 n_fin_extra=("The turnaround is recent. [pause] FY24 was a ₹1.48 Cr loss; FY25 made ₹5.83 Cr and FY26 ₹10.22 Cr."),
 use=[("💼", "₹30.00 Cr working capital", "Funding receivables and project working capital.", "WC"),
      ("🧰", "General corporate purposes", "The balance of the ₹37.40 Cr fresh issue.", "GCP"),
      ("👥", "₹5.04 Cr offer for sale", "A promoter sells 4,58,000 shares.", "OFS")],
 n_use=("Where does the money go? [pause] Of the ₹37.40 Cr fresh issue, ₹30.00 Cr funds working capital, and the rest general corporate purposes. [pause] "
        "A promoter also sells 4,58,000 shares, about ₹5.04 Cr at the cap."),
 peers=[("Esconet Technologies", 15.66, "IT infra peer"), ("Dynacons Systems", 26.55, "IT infra peer"), ("Xtranet Technologies", 50.87, "IT infra peer")],
 peerverdict="At 11.70x FY26 EPS, Bench Mark is priced below its three listed IT-infrastructure peers.",
 n_peer=("Valuation. [pause] At the ₹110 cap, the price is 11.70x FY26 earnings of ₹9.40 a share. [pause] "
         "Listed peers trade higher: Esconet at 15.66x, Dynacons 26.55x and Xtranet 50.87x. [pause] "
         "Small S M E stocks also trade thinly, which a P E comparison does not capture."),
 verdict=[("Recent turnaround: FY24 was a loss", "PAT up to ₹10.22 Cr, a 16.88% margin"),
          ("Government receivables need working capital", "11.70x P/E, below listed peers"),
          ("SME: ₹2,64,000 minimum, thin liquidity", "88.12% of the offer is fresh capital")],
 sources="Final RHP (NSE Emerge), NSE issue page",
),
"himalayan": dict(
 name="Himalayan Solar IPO", board=SME, exch="NSE Emerge", dates="25–29 Sep 2026", say_dates="the twenty-fifth to the twenty-ninth of September",
 lo=98, hi=103, lot=1200, fresh=60.68, ofs=7.35, rev26=170.3432, rev25=142.4373, pat26=20.6661, pat25=16.4306, eps=12.74, accent="#FBBF24",
 kicker="IPO ANALYSIS · SME · NSE EMERGE", sub="Solar PV modules, Haryana · ₹68.03 Cr · 25–29 Sep 2026",
 biz=[("☀️", "Solar PV modules", "Makes and sells solar modules, largely to government departments and contractors.", "SOLAR"),
      ("🔄", "Technology switch", "Its 40 MW polycrystalline line ran until August 2024, then lost out to Mono-PERC under new efficiency norms.", "KEY RISK"),
      ("📝", "50 MW of Mono-PERC LoIs", "Letters of intent for 50 MW; plans to add solar EPC and dealer sales.", "PIPELINE")],
 n_biz=("First, the business. [pause] Himalayan Solar makes solar PV modules in Panchkula, Haryana, selling mainly to government departments and contractors. [pause] "
        "Its 40 megawatt polycrystalline line ran until August 2024, when new efficiency norms for government tenders shifted demand to Mono-PERC modules. [pause] "
        "It has letters of intent for 50 megawatt of Mono-PERC modules and plans to move into solar EPC."),
 finnote="Revenue +19.59% to ₹170.34 Cr; PAT +25.78% to ₹20.67 Cr. Return on net worth 44.04%.",
 n_fin_extra=("Profit grew 25.78%, ahead of revenue at 19.59%, and return on net worth was 44.04%. [pause] "
              "The RHP also warns that capacity utilisation has been low."),
 use=[("💼", "₹29.50 Cr working capital", "The largest use of the fresh issue.", "WC"),
      ("🏭", "₹12.98 Cr capex", "Expanding and upgrading the manufacturing facility.", "CAPEX"),
      ("🏦", "₹2.12 Cr debt + OFS ₹7.35 Cr", "Some debt repaid; selling shareholders sell 7,14,000 shares.", "MIX")],
 n_use=("Where does the money go? [pause] Of the ₹60.68 Cr fresh issue, ₹29.50 Cr funds working capital, ₹12.98 Cr upgrades and expands the plant, "
        "and ₹2.12 Cr repays debt. [pause] Selling shareholders also offer 7,14,000 shares, about ₹7.35 Cr at the cap."),
 peers=[("Ganesh Green Bharat", 7.11, "solar peer"), ("Australian Premium Solar", 8.34, "module maker"), ("Solarium Green", 14.99, "solar EPC")],
 peerverdict="At 8.08x FY26 EPS, Himalayan Solar sits within its low-multiple solar SME peer range.",
 n_peer=("Valuation. [pause] At the ₹103 cap, the price is 8.08x FY26 earnings of ₹12.74 a share. [pause] "
         "Its listed solar peers trade at 7.11x for Ganesh Green, 8.34x for Australian Premium Solar and 14.99x for Solarium. [pause] "
         "So it sits within that range."),
 verdict=[("Old poly line became obsolete in 2024", "PAT up 25.78% to ₹20.67 Cr"),
          ("Low capacity utilisation, per the RHP", "8.08x P/E, within peer range"),
          ("SME: ₹2,47,200 minimum, thin liquidity", "50 MW of Mono-PERC letters of intent")],
 sources="Final RHP (NSE Emerge), NSE issue page",
),
"greenasia": dict(
 name="Green Asia Impex IPO", board=SME, exch="NSE Emerge", dates="24–28 Sep 2026", say_dates="the twenty-fourth to the twenty-eighth of September, closing today",
 lo=85, hi=90, lot=1600, fresh=53.10, ofs=7.00, rev26=383.8039, rev25=337.6221, pat26=15.6112, pat25=10.352, eps=10.56, accent="#2DD4BF",
 kicker="IPO ANALYSIS · SME · NSE EMERGE", sub="Shrimp & dried-chilli exports · ₹60.10 Cr · 24–28 Sep 2026",
 biz=[("🦐", "Shrimp and dried chillies", "Processes and exports shrimp and dried red chillies.", "EXPORTS"),
      ("🇨🇳", "China = 31.29% of revenue", "Sales to China were ₹120.09 Cr in FY26, 31.29% of revenue.", "CONCENTRATION"),
      ("🏭", "New seafood plant", "The IPO funds a new seafood processing facility.", "CAPEX")],
 n_biz=("First, the business. [pause] Green Asia Impex processes and exports shrimp and dried red chillies. [pause] "
        "China is a big market: ₹120.09 Cr of FY26 sales, or 31.29% of revenue, though China's share of chilli sales fell from 87.41% to 32.74%. [pause] "
        "The IPO funds a new seafood processing plant."),
 finnote="Revenue +13.68% to ₹383.80 Cr; PAT +50.80% to ₹15.61 Cr. PAT margin 4.07%.",
 n_fin_extra=("Profit grew much faster than revenue: 50.80% against 13.68%. [pause] But the margin is still thin at 4.07%, typical of commodity exports."),
 use=[("🏭", "₹40.03 Cr seafood plant", "From the fresh issue, toward a ₹51.27 Cr seafood processing facility.", "CAPEX"),
      ("🧰", "General corporate purposes", "The balance of the ₹53.10 Cr fresh issue.", "GCP"),
      ("👥", "₹7.00 Cr offer for sale", "Promoters Pasupuleti Venkata Ramarao and Pasupuleti Meenakshi sell shares.", "OFS")],
 n_use=("Where does the money go? [pause] Of the ₹53.10 Cr fresh issue, ₹40.03 Cr goes toward a ₹51.27 Cr seafood processing facility, "
        "with the rest from internal accruals. [pause] The ₹7.00 Cr offer for sale goes to the two promoters."),
 peers=[("Essex Marine", 4.40, "seafood exporter"), ("Kings Infra Ventures", 17.21, "aquaculture"), ("Apex Frozen Foods", 29.16, "shrimp exporter")],
 peerverdict="At 8.52x FY26 EPS, Green Asia sits between Essex Marine and Kings Infra.",
 n_peer=("Valuation. [pause] At the ₹90 cap, the price is 8.52x FY26 earnings of ₹10.56 a share. [pause] "
         "Seafood peers range from Essex Marine at 4.40x and Kings Infra at 17.21x to Apex Frozen Foods at 29.16x. [pause] "
         "So it sits at the lower middle of the range."),
 verdict=[("China is 31.29% of revenue", "PAT up 50.80% to ₹15.61 Cr"),
          ("Thin 4.07% PAT margin; biosecurity risk", "8.52x P/E, lower-middle of peers"),
          ("SME: ₹2,88,000 minimum, thin liquidity", "88.35% of the offer is fresh capital")],
 sources="Final RHP (NSE Emerge), NSE issue page",
),
"peshwa": dict(
 name="Peshwa Wheat IPO", board=SME, exch="BSE SME", dates="24–28 Sep 2026", say_dates="the twenty-fourth to the twenty-eighth of September, closing today",
 lo=95, hi=101, lot=1200, fresh=53.52, ofs=0.0, rev26=215.9352, rev25=171.535, pat26=15.8082, pat25=11.8361, eps=11.51, accent="#FBBF24",
 kicker="IPO ANALYSIS · SME · BSE SME · 100% FRESH", sub="Wheat products, Indore · ₹53.52 Cr · 24–28 Sep 2026",
 biz=[("🌾", "Wheat processing", "Atta (wheat flour), sortex wheat and other wheat-based products.", "FOOD"),
      ("📍", "Indore-based", "Operating history from December 2023, so the track record is short.", "TRACK"),
      ("📈", "Scaling fast", "FY26 revenue ₹215.94 Cr, up 25.88%.", "GROWTH")],
 n_biz=("First, the business. [pause] Peshwa Wheat, based in Indore, processes wheat into atta, sortex-cleaned wheat and other wheat products. [pause] "
        "Its restated financials start from a period ending December 2023, so the track record is short. [pause] Revenue grew 25.88% in FY26."),
 finnote="Revenue ₹215.94 Cr (FY25 ₹171.54 Cr); PAT ₹15.81 Cr (FY25 ₹11.84 Cr). Return on net worth 36.71%.",
 n_fin_extra=("Profit rose 33.56% to ₹15.81 Cr, a 7.32% margin, and return on net worth was 36.71%."),
 use=[("💼", "₹26.50 Cr working capital", "The largest use: grain buying ties up cash.", "WC"),
      ("⚙️", "₹11.70 Cr capex", "₹6.69 Cr plant and machinery plus ₹5.01 Cr civil construction.", "CAPEX"),
      ("✅", "No offer for sale", "All 52,99,200 shares are new; the full ₹53.52 Cr enters the company.", "FRESH")],
 n_use=("Where does the money go? [pause] It is a 100% fresh issue of 52,99,200 shares, about ₹53.52 Cr at the cap. [pause] "
        "₹26.50 Cr funds working capital, ₹6.69 Cr buys plant and machinery, and ₹5.01 Cr goes to civil construction. [pause] No one is selling existing shares."),
 peers=[("Baba Foods Processing", 13.10, "flour & foods"), ("Megastar Foods", 40.93, "wheat products")],
 peerverdict="At 8.77x FY26 EPS, Peshwa is priced below both listed peers in its RHP.",
 n_peer=("Valuation. [pause] At the ₹101 cap, the price is 8.77x FY26 earnings of ₹11.51 a share. [pause] "
         "The two listed peers trade higher: Baba Foods at 13.10x and Megastar Foods at 40.93x. [pause] Its short history is one reason for a lower multiple."),
 verdict=[("Short track record: from Dec 2023", "PAT up 33.56% to ₹15.81 Cr"),
          ("Commodity inputs, working-capital heavy", "100% fresh, no promoter exit"),
          ("SME: ₹2,42,400 minimum, thin liquidity", "8.77x P/E, below listed peers")],
 sources="Final RHP (BSE SME), BSE issue page",
),
"roopa": dict(
 name="Roopa Screen IPO", board=SME, exch="BSE SME", dates="24–28 Sep 2026", say_dates="the twenty-fourth to the twenty-eighth of September, closing today",
 lo=60, hi=64, lot=2000, fresh=19.20, ofs=0.0, rev26=50.7273, rev25=45.3412, pat26=6.4833, pat25=4.6853, eps=8.04, accent="#F472B6",
 kicker="IPO ANALYSIS · SME · BSE SME · 100% FRESH", sub="Rotary nickel screens for textile printing · ₹19.20 Cr · 24–28 Sep 2026",
 biz=[("🧵", "Rotary nickel screens", "Consumable screens for rotary screen-printing machines in textile printing.", "NICHE"),
      ("🔁", "A consumable product", "Screens wear out, so demand repeats with printing volumes.", "REPEAT"),
      ("🏭", "New plant planned", "The IPO funds a new manufacturing facility.", "CAPEX")],
 n_biz=("First, the business. [pause] Roopa Screen makes rotary nickel screens, a consumable used in rotary screen-printing machines for textiles. [pause] "
        "Screens wear out, so demand repeats with printing volumes. [pause] It was incorporated in 2013 and is now building a new plant."),
 finnote="Revenue +11.88% to ₹50.73 Cr; PAT +38.38% to ₹6.48 Cr. Return on net worth 39.60%.",
 n_fin_extra=("Profit grew 38.38%, far ahead of revenue at 11.88%, for a 12.78% margin."),
 use=[("🏭", "₹9.90 Cr new facility", "Civil works, electricals and machinery for a ₹10.61 Cr plant.", "CAPEX"),
      ("💼", "₹6.00 Cr working capital", "Funding inventory and receivables.", "WC"),
      ("✅", "No offer for sale", "All 30,00,000 shares are new: ₹19.20 Cr at the cap.", "FRESH")],
 n_use=("Where does the money go? [pause] It is a 100% fresh issue of 30,00,000 shares, about ₹19.20 Cr at the cap. [pause] "
        "₹9.90 Cr builds a new manufacturing facility costing ₹10.61 Cr in total, and ₹6.00 Cr funds working capital."),
 peers=[("Stovec Industries", 50.54, "only listed peer")],
 peerverdict="At 7.96x FY26 EPS vs Stovec's 50.54x; Stovec is a larger, broader textile-printing business.",
 n_peer=("Valuation. [pause] At the ₹64 cap, the price is 7.96x FY26 earnings of ₹8.04 a share. [pause] "
         "The only listed peer, Stovec Industries, trades at 50.54x, but the RHP itself notes Stovec's business is broader. [pause] "
         "With a single, dissimilar peer, the comparison is weak."),
 verdict=[("Tiny issue; single-product business", "PAT up 38.38% to ₹6.48 Cr"),
          ("Tied to textile-printing demand", "100% fresh, no promoter exit"),
          ("SME: ₹2,56,000 minimum, thin liquidity", "7.96x P/E")],
 sources="Final RHP (BSE SME), BSE issue page",
),
"saiurja": dict(
 name="Sai Urja Indo Ventures IPO", board=SME, exch="BSE SME", dates="25–29 Sep 2026", say_dates="the twenty-fifth to the twenty-ninth of September",
 lo=107, hi=113, lot=1200, fresh=20.67, ofs=4.28, rev26=85.1097, rev25=65.5242, pat26=4.2357, pat25=3.1374, eps=7.29, accent="#60A5FA",
 kicker="IPO ANALYSIS · SME · BSE SME", sub="Power-plant O&M services · ₹24.95 Cr · 25–29 Sep 2026",
 biz=[("⚙️", "Power-plant O&M", "Operations and maintenance of electrical, mechanical and instrumentation systems.", "SERVICES"),
      ("🚂", "Coal handling", "Runs coal-handling and merry-go-round rail systems at power plants.", "NICHE"),
      ("🧹", "Housekeeping + manpower", "Industrial housekeeping, overhauls and manpower supply.", "LABOUR")],
 n_biz=("First, the business. [pause] Sai Urja Indo Ventures provides operations and maintenance services at power plants: electrical, mechanical and instrumentation work. [pause] "
        "It also runs coal-handling and merry-go-round rail systems, and supplies industrial housekeeping and manpower."),
 finnote="Revenue +29.89% to ₹85.11 Cr; PAT ₹4.24 Cr (FY25 ₹3.14 Cr): a thin 4.98% margin.",
 n_fin_extra=("This is a thin-margin services business: ₹4.24 Cr of profit on ₹85.11 Cr of revenue is a 4.98% margin."),
 use=[("💼", "₹8.00 Cr working capital", "Funding contract receivables.", "WC"),
      ("🏦", "₹6.60 Cr debt repayment", "Repaying part of its borrowings.", "DEBT"),
      ("👥", "₹4.28 Cr offer for sale", "Promoters sell 3,79,200 shares.", "OFS")],
 n_use=("Where does the money go? [pause] Of the ₹20.67 Cr fresh issue, ₹8.00 Cr funds working capital and ₹6.60 Cr repays debt. [pause] "
        "Promoters also sell 3,79,200 shares, about ₹4.28 Cr at the cap. [pause] The offer dates were moved by a corrigendum to the twenty-fifth to twenty-ninth."),
 peers=[("Sai Urja IPO", 15.50, "at ₹113 cap"), ("Lakshya Powertech", 11.27, "only listed peer")],
 peerverdict="At 15.50x FY26 EPS, Sai Urja is priced above its only listed peer at 11.27x.",
 n_peer=("Valuation. [pause] The price-band ad puts the P E at 15.50x FY26 earnings at the ₹113 cap. [pause] "
         "Its only listed peer, Lakshya Powertech, trades at 11.27x. [pause] So this issue is priced above its peer."),
 verdict=[("Priced above its only peer: 15.50x vs 11.27x", "Revenue up 29.89% to ₹85.11 Cr"),
          ("Thin 4.98% PAT margin", "Part of proceeds cuts debt"),
          ("SME: ₹2,71,200 minimum, thin liquidity", "Return on net worth 42.44%")],
 sources="Final RHP + corrigendum + pre-issue ad (BSE SME), BSE issue page",
),
"pind": dict(
 name="Pind Hospitality IPO", board=SME, exch="BSE SME", dates="28–30 Sep 2026", say_dates="the twenty-eighth to the thirtieth of September",
 lo=93, hi=99, lot=1200, fresh=17.82, ofs=0.0, rev26=24.4509, rev25=22.6456, pat26=2.273, pat25=2.5623, eps=5.41, accent="#FB923C",
 kicker="IPO ANALYSIS · SME · BSE SME · 100% FRESH", sub="Restaurants, Pune + a Lonavala banquet project · ₹17.82 Cr · 28–30 Sep 2026",
 biz=[("🍽️", "Restaurants in Pune", "Runs restaurants including Baner and Camp outlets in Pune.", "DINING"),
      ("🏰", "Haveli project, Lonavala", "Building a hotel-cum-banquet hall in Lonavala.", "EXPANSION"),
      ("📉", "Profit dipped in FY26", "PAT fell 11.29% even as revenue grew 7.97%.", "WATCH")],
 n_biz=("First, the business. [pause] Pind Hospitality runs restaurants in Pune, including outlets in Baner and Camp. [pause] "
        "It is now building a hotel-cum-banquet hall in Lonavala, called the Haveli project. [pause] In FY26 revenue grew 7.97%, but profit fell 11.29%."),
 finnote="Revenue ₹24.45 Cr (FY25 ₹22.65 Cr); PAT ₹2.27 Cr (FY25 ₹2.56 Cr). Return on net worth 15.65%.",
 n_fin_extra=("This is a small company: ₹2.27 Cr of profit, down from ₹2.56 Cr. [pause] The IPO is almost as big as its annual revenue."),
 use=[("🏰", "₹12.70 Cr Haveli project", "Balance cost of the ₹21.42 Cr Lonavala hotel-cum-banquet project.", "CAPEX"),
      ("🧰", "General corporate purposes", "The rest of the ₹17.82 Cr fresh issue.", "GCP"),
      ("✅", "No offer for sale", "All 18,00,000 shares are new.", "FRESH")],
 n_use=("Where does the money go? [pause] It is a 100% fresh issue of 18,00,000 shares, about ₹17.82 Cr at the cap. [pause] "
        "₹12.70 Cr funds the rest of the ₹21.42 Cr Lonavala project, after ₹8.72 Cr already spent from internal accruals. [pause] "
        "A corrigendum changed the allocation between individual and non-institutional investors."),
 peers=[("Pind Hospitality IPO", 18.30, "at ₹99 cap"), ("Speciality Restaurants", 31.70, "restaurant peer"), ("Barbeque-Nation", None, "loss-making")],
 peerverdict="At 18.30x FY26 EPS, Pind is below Speciality Restaurants; Vikram Kamats' 351.44x is an outlier.",
 n_peer=("Valuation. [pause] At the ₹99 cap, the price is 18.30x FY26 earnings of ₹5.41 a share. [pause] "
         "Speciality Restaurants trades at 31.70x, Barbeque-Nation is loss-making, and Vikram Kamats at 351.44x is an outlier that inflates the RHP's 191.57x average. [pause] "
         "Look at the range, not the average."),
 verdict=[("FY26 PAT fell 11.29%", "100% fresh, no promoter exit"),
          ("One big project vs a small company", "Established Pune restaurant brand"),
          ("SME: ₹2,37,600 minimum, thin liquidity", "18.30x P/E, below Speciality Restaurants")],
 sources="Final RHP + corrigendum (BSE SME), BSE issue page",
),
"shreetnb": dict(
 name="Shree TNB Polymers IPO", board=SME, exch="BSE SME", dates="28 Sep–5 Oct 2026", say_dates="the twenty-eighth of September to the fifth of October",
 lo=50, hi=53, lot=2000, fresh=31.80, ofs=0.0, rev26=198.1273, rev25=175.6524, pat26=7.1346, pat25=5.771, eps=4.65, accent="#4ADE80",
 kicker="IPO ANALYSIS · SME · BSE SME · 100% FRESH", sub="Polymer products (Noble brand) · ₹31.80 Cr · 28 Sep–5 Oct 2026",
 biz=[("🧪", "Polymer products", "Manufactures polymer products under three brands; peers in its RHP are pipe makers.", "POLYMERS"),
      ("🏷️", "Noble = 75.61% of sales", "Noble brand ₹149.80 Cr; Tirupati and Balaji (Wellpack) the rest.", "BRAND"),
      ("📊", "Revenue recovering", "FY24 ₹207.86 Cr, FY25 ₹175.65 Cr, FY26 ₹198.13 Cr.", "CYCLE")],
 n_biz=("First, the business. [pause] Shree TNB Polymers makes polymer products sold under three brands, and the peers in its RHP are pipe makers. [pause] "
        "The Noble brand alone was 75.61% of FY26 revenue, with Tirupati and Balaji Wellpack making up the rest. [pause] "
        "Revenue dipped in FY25 and recovered to ₹198.13 Cr in FY26."),
 finnote="Revenue +12.80% to ₹198.13 Cr; PAT +23.63% to ₹7.13 Cr. A thin 3.60% PAT margin.",
 n_fin_extra=("Profit grew 23.63% to ₹7.13 Cr, but the margin is thin at 3.60%."),
 use=[("⚙️", "₹15.86 Cr machinery", "New extrusion lines and machinery.", "CAPEX"),
      ("☀️", "₹3.92 Cr solar + building", "₹2.60 Cr rooftop solar and ₹1.32 Cr pre-engineered building.", "CAPEX"),
      ("🏦", "₹5.62 Cr debt repayment", "Repaying part of its borrowings.", "DEBT")],
 n_use=("Where does the money go? [pause] It is a 100% fresh issue of 60,00,000 shares, about ₹31.80 Cr at the cap. [pause] "
        "₹15.86 Cr buys machinery, ₹2.60 Cr rooftop solar, ₹1.32 Cr a pre-engineered building, and ₹5.62 Cr repays debt."),
 peers=[("Malpani Pipes", 7.70, "pipes peer"), ("Shree TNB IPO", 11.40, "at ₹53 cap"), ("Texmo Pipes", 15.69, "pipes peer"), ("Captain Pipes", 40.37, "pipes peer")],
 peerverdict="At 11.40x FY26 EPS (per the price-band corrigendum), TNB sits inside its pipe-peer range.",
 n_peer=("Valuation. [pause] The price-band corrigendum puts the P E at 11.40x FY26 earnings at the ₹53 cap. [pause] "
         "Peers range from Malpani Pipes at 7.70x and Texmo at 15.69x to Captain Pipes at 40.37x. [pause] So it sits inside the range."),
 verdict=[("One brand is 75.61% of revenue", "PAT up 23.63% to ₹7.13 Cr"),
          ("Thin 3.60% PAT margin", "100% fresh; most funds go to capacity"),
          ("SME: ₹2,12,000 minimum, thin liquidity", "11.40x P/E, inside peer range")],
 sources="Final RHP + corrigendum ad (BSE SME), BSE issue page",
),
}

DIS = ("This video is public-source education from the red herring prospectus and exchange notices. "
       "It is not investment advice and not a buy or sell call. Read the final documents, check live subscription on the exchange, "
       "and consult a SEBI-registered adviser. Thanks for watching.")

# ---------------------------------------------------------------- computed fields (hard rule 3)
def derive(d):
    d = dict(d)
    d["issue"] = q(d["fresh"] + d["ofs"])
    d["fresh_pct"] = d["fresh"] / d["issue"] * 100
    d["rev_g"] = (d["rev26"] / d["rev25"] - 1) * 100
    d["margin"] = d["pat26"] / d["rev26"] * 100
    d["margin25"] = d["pat25"] / d["rev25"] * 100
    d["pat_g"] = (d["pat26"] / d["pat25"] - 1) * 100 if d["pat25"] > 0 and d["pat26"] > 0 else None
    d["pe"] = q(d["hi"] / d["eps"]) if d.get("eps") else None
    lots = 2 if d["board"] == SME else 1
    d["min_sh"] = d["lot"] * lots
    d["min_amt"] = d["min_sh"] * d["hi"]
    return d

def cards(kicker, title, color, rows):
    return {"kicker": kicker, "title": title, "color": color,
            "items": [{"emoji": e, "k": k, "v": v, "chip": c} for e, k, v, c in rows]}

def chapter(key):
    d = derive(DATA[key]); a = d["accent"]; loss = d["pat26"] < 0
    def sc(x, v, p, n): return (f"{key}_{x}", v, p, n)
    board_word = "mainboard" if d["board"] == MB else f"S M E issue on {d['exch']}"
    n_title = (f"This is the {d['name'].replace(' IPO', '')} I P O, a {board_word} offer, open from {d['say_dates']}. [pause] "
               f"The price band is ₹{d['lo']} to ₹{d['hi']}. Every figure here comes from the final red herring prospectus and exchange notices; "
               f"the final price is fixed after bidding, so valuations are computed at the ₹{d['hi']} cap.")
    # ---- financial beat
    if loss:
        n_fin = (f"The financial checkpoint. [pause] FY26 revenue was {cr(d['rev26'])}, up from {cr(d['rev25'])}. "
                 f"The company made a net loss of {cr(abs(d['pat26']))}. [pause] {d['n_fin_extra']}")
    else:
        n_fin = (f"The financial checkpoint. [pause] FY26 revenue was {cr(d['rev26'])}, against {cr(d['rev25'])} in FY25, "
                 f"a change of {'+' if d['rev_g'] >= 0 else '-'}{pct(abs(d['rev_g']))}. [pause] Profit after tax was {cr(d['pat26'])}, "
                 f"a margin of {pct(d['margin'])}. [pause] {d['n_fin_extra']}")
    n_fin = n_fin.replace("+", "")
    pat_stat = {"label": "Net loss" if loss else "Profit after tax", "to": abs(d["pat26"]), "prefix": "−₹" if loss else "₹",
                "suffix": " Cr", "decimals": 2, "color": "#FB7185" if loss else "#34D399",
                "sub": (f"FY25: loss {cr(abs(d['pat25']))}" if d["pat25"] < 0 else f"FY25: {cr(d['pat25'])}")}
    rev_stat = {"label": "Revenue from operations", "to": d["rev26"], "prefix": "₹", "suffix": " Cr", "decimals": 2,
                "color": "#38BDF8", "sub": f"FY25: {cr(d['rev25'])} · {'+' if d['rev_g'] >= 0 else '−'}{pct(abs(d['rev_g']))}"}
    m_stat = {"label": "PAT margin (computed)", "to": abs(d["margin"]), "prefix": "−" if loss else "", "suffix": "%",
              "decimals": 2, "color": "#FB7185" if loss else "#FBBF24", "sub": f"FY25: {pct(d['margin25'])}"}
    # ---- issue beat
    fresh_only = d["ofs"] <= 0
    if fresh_only:
        n_issue = (f"The offer size at the cap is {cr(d['issue'])}, and it is 100% fresh issue. [pause] "
                   "All of that money goes into the company; no existing shareholder is selling in this deal.")
        issue_note = "100% fresh issue: every rupee raised goes to the company."
    else:
        n_issue = (f"The offer size at the cap is {cr(d['issue'])}. [pause] {cr(d['fresh'])} is fresh issue that goes into the company, "
                   f"and {cr(d['ofs'])} is an offer for sale that goes to selling shareholders. [pause] "
                   f"So {pct(d['fresh_pct'])} of the deal is new capital, and {pct(100 - d['fresh_pct'])} is an exit for existing holders.")
        issue_note = f"{pct(d['fresh_pct'])} fresh capital · {pct(100 - d['fresh_pct'])} offer for sale (computed at the cap)"
    issue_stats = [
        {"label": "Total offer (at cap)", "to": d["issue"], "prefix": "₹", "suffix": " Cr", "decimals": 2, "color": a, "sub": f"band ₹{d['lo']}–₹{d['hi']}"},
        {"label": "Fresh issue → company", "to": d["fresh"], "prefix": "₹", "suffix": " Cr", "decimals": 2, "color": "#34D399", "sub": "new capital"},
        {"label": "Offer for sale → sellers", "to": d["ofs"], "prefix": "₹", "suffix": " Cr", "decimals": 2, "color": "#FB7185",
         "sub": "none: 100% fresh" if fresh_only else "shareholder exit"}]
    # ---- peers
    rows = []
    if d["pe"] is not None and not any(r[0].endswith("IPO") for r in d["peers"]):
        rows.append({"name": d["name"].replace(" IPO", ""), "pe": d["pe"], "note": f"₹{d['hi']} cap ÷ FY26 EPS ₹{d['eps']:.2f}", "hi": True, "display": tms(d["pe"])})
    for n, pe, note in d["peers"]:
        own = n.endswith("IPO") or (key == "acevector" and n == "AceVector")
        rows.append({"name": n.replace(" IPO", ""), "pe": pe, "note": note, "hi": own, "display": (tms(pe) if pe is not None else None)})
    rows.sort(key=lambda r: (not r["hi"],))
    # ---- apply
    if d["board"] == MB:
        min_txt = f"{d['lot']} shares × ₹{d['hi']} = {rs(d['min_amt'])}"
        n_ret = (f"How to apply. [pause] The minimum bid is one lot of {d['lot']} shares, which is {rs(d['min_amt'])} at the cap. [pause] "
                 "Retail investors can bid up to two lakh rupees, and allotment is by lottery if retail is oversubscribed. [pause] "
                 "Check live subscription on the N S E or B S E website, not social media.")
        apply = [("🧑", "Retail: up to ₹2 lakh", "Individual bids up to ₹2,00,000; lottery allotment if oversubscribed.", "RETAIL"),
                 ("💰", "Minimum bid", min_txt, "1 LOT"),
                 ("📅", "Bidding window", f"{d['dates']} · UPI mandate by 5 PM on the last day.", "DATES"),
                 ("🔎", "Verify live", "Live subscription on NSE/BSE; the final RHP for everything else.", "SOURCES")]
    else:
        min_txt = f"2 lots = {d['min_sh']:,} shares × ₹{d['hi']} = {rs(d['min_amt'])}".replace(",", ",")
        n_ret = (f"How to apply. [pause] This is an S M E issue on {d['exch']}. One lot is {d['lot']} shares, and the minimum application for individuals is two lots, "
                 f"{d['min_sh']} shares, or {rs(d['min_amt'])} at the cap. [pause] "
                 "S M E shares trade thinly after listing, with a market maker, so exiting can be harder than on the mainboard.")
        apply = [("🏢", f"Lists on {d['exch']}", "A separate small-company platform, not the mainboard.", "SME"),
                 ("💰", "Minimum application", f"2 lots = {inr(d['min_sh'], 0)} shares × ₹{d['hi']} = {rs(d['min_amt'])}", "MIN"),
                 ("📅", "Bidding window", d["dates"], "DATES"),
                 ("⚠️", "Thin liquidity", "SME stocks trade thinly; invest only money you can lock up.", "RISK")]
    # ---- recap
    fin_line = (f"FY26: revenue {cr(d['rev26'])} · " + (f"net loss {cr(abs(d['pat26']))}" if loss else f"PAT {cr(d['pat26'])} ({pct(d['margin'])} margin)"))
    off_line = (f"Offer {cr(d['issue'])} · 100% fresh" if fresh_only else f"Offer {cr(d['issue'])} · fresh {cr(d['fresh'])} · OFS {cr(d['ofs'])}")
    val_line = (f"Valuation: {tms(d['pe'])} FY26 EPS at the ₹{d['hi']} cap" if d["pe"] is not None else "Valuation: loss-making, no P/E")
    recap = [fin_line, off_line, val_line, f"Minimum: {rs(d['min_amt'])} · {d['dates']}"]
    n_recap = ("Let's recap. [pause] " + f"FY26 revenue {cr(d['rev26'])}, " +
               (f"with a net loss of {cr(abs(d['pat26']))}. " if loss else f"profit {cr(d['pat26'])}. ") +
               ("The offer is 100% fresh. " if fresh_only else f"The offer is {cr(d['issue'])}, of which {cr(d['ofs'])} is offer for sale. ") +
               (f"Valuation is {tms(d['pe'])} earnings at the cap. " if d["pe"] is not None else "There is no P/E because of losses. ") +
               f"The minimum investment is {rs(d['min_amt'])}. [pause] " + DIS)
    n_ver = "Now balance the evidence. [pause] " + " [pause] ".join(f"Watch-out: {m}. Strength: {f}." for m, f in d["verdict"])
    return [
        sc("title", "sm_ptitle", {"title": d["name"], "sub": d["sub"], "kicker": d["kicker"]}, n_title),
        sc("biz", "sm_iconcards", cards("WHAT THE COMPANY DOES", "Business Model", a, d["biz"]), d["n_biz"]),
        sc("fin", "sm_stats", {"kicker": "FINANCIAL QUALITY · RESTATED (RHP)", "title": "FY26 Financials", "stats": [rev_stat, pat_stat, m_stat],
                               "note": d["finnote"]}, n_fin),
        sc("issue", "sm_stats", {"kicker": "OFFER STRUCTURE · COMPUTED AT CAP", "title": "Fresh Issue vs Offer for Sale", "stats": issue_stats,
                                 "note": issue_note}, n_issue),
        sc("proceeds", "sm_iconcards", cards("USE OF PROCEEDS · RHP OBJECTS", "Where The Money Goes", a, d["use"]), d["n_use"]),
        sc("peers", "sm_peers", {"kicker": "VALUATION · P/E AT CAP vs LISTED PEERS", "title": "Peer Comparison", "color": a,
                                 "rows": rows, "verdict": d["peerverdict"]}, d["n_peer"]),
        sc("verdict", "sm_myths", {"kicker": "BALANCED ANALYSIS", "title": "Strengths vs Watch-outs", "mythLabel": "⚠️ WATCH-OUTS",
                                   "factLabel": "✅ EVIDENCE-BACKED STRENGTHS", "pairs": [{"m": m, "f": f} for m, f in d["verdict"]]}, n_ver),
        sc("apply", "sm_iconcards", cards("HOW TO APPLY", "Check Terms Before You Bid", a, apply), n_ret),
        sc("recap", "sm_recap", {"title": d["name"] + " — Recap", "items": recap,
                                 "closer": "Education, not advice: read the RHP, decide for yourself."}, n_recap),
    ]

# ---------------------------------------------------------------- TTS (Kokoro ONNX af_bella) + captions
_k = None
def kok():
    global _k
    if _k is None:
        _k = kokoro_onnx.Kokoro(MODEL, VOICES)
        assert VOICE in _k.get_voices(), f"{VOICE} missing"
    return _k

def ffdur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of",
                                 "default=noprint_wrappers=1:nokey=1", p], capture_output=True, text=True).stdout.strip())

def tts_chunk(path, text):
    samples, sr = kok().create(spoken(text), voice=VOICE, speed=SPEED, lang="en-us")
    assert sr == SR and len(samples) > sr * 0.3, f"bad TTS output for: {text[:60]}"
    sf.write(path, samples, SR, subtype="PCM_16")

def split_cues(text, maxc=64):
    parts = re.split(r"(?<=[.?!:;])\s+", text.strip()); out = []
    for pt in parts:
        if len(pt) <= maxc: out.append(pt); continue
        buf = ""
        for w in re.split(r"(?<=,)\s+|\s+(?=—)", pt):
            if buf and len(buf) + len(w) + 1 > maxc:
                out.append(buf); buf = w
            else:
                buf = (buf + " " + w).strip()
        if buf: out.append(buf)
    # hard-wrap any leftover long cue on spaces
    res = []
    for c in out:
        while len(c) > maxc + 16:
            cut = c.rfind(" ", 0, maxc); res.append(c[:cut]); c = c[cut + 1:]
        res.append(c)
    return [c for c in res if c]

def gen_segment(key, sid, text):
    P = proj(key); RAW = os.path.join(P, "assets", "raw"); os.makedirs(RAW, exist_ok=True)
    chunks = [c.strip() for c in text.split("[pause]") if c.strip()]
    seg = os.path.join(P, "assets", sid + ".wav")
    meta_p = os.path.join(RAW, sid + "_chunks.json")
    if os.path.exists(seg) and os.path.exists(meta_p) and json.load(open(meta_p))["chunks"] == chunks:
        return seg, json.load(open(meta_p))["durs"], chunks
    audio, durs = [], []
    sil = np.zeros(int(PAUSE * SR), dtype=np.float32)
    for i, c in enumerate(chunks):
        cp = os.path.join(RAW, f"{sid}_c{i}.wav")
        tts_chunk(cp, c)
        x, _ = sf.read(cp, dtype="float32"); durs.append(len(x) / SR)
        audio.append(x)
        if i < len(chunks) - 1: audio.append(sil)
    sf.write(seg, np.concatenate(audio), SR, subtype="PCM_16")
    json.dump({"chunks": chunks, "durs": durs}, open(meta_p, "w"), ensure_ascii=False)
    return seg, durs, chunks

def build(key):
    P = proj(key)
    for d in ("assets", "artifacts", "renders", "qa"): os.makedirs(os.path.join(P, d), exist_ok=True)
    segs = chapter(key); t = 0.0; cuts = []; cues = []; parts = []
    gap = np.zeros(int(GAP * SR), dtype=np.float32)
    for i, (sid, variant, props, text) in enumerate(segs):
        seg, durs, chunks = gen_segment(key, sid, text)
        x, _ = sf.read(seg, dtype="float32"); dur = len(x) / SR
        parts.append(x)
        if i < len(segs) - 1: parts.append(gap)
        cuts.append({"id": sid, "type": variant, "in_seconds": round(t, 3), "out_seconds": round(t + dur, 3),
                     "props": {**props, "dur": round(dur + GAP, 3)}})
        ct = t
        for c, cd in zip(chunks, durs):
            pieces = split_cues(c); tot = sum(len(p) for p in pieces) or 1; pt = ct
            for pc in pieces:
                dd = cd * len(pc) / tot
                cues.append([round(pt, 3), round(pt + dd, 3), pc]); pt += dd
            ct += cd + PAUSE
        flag = "  ⚠ LONG" if dur > 75 else ""
        print(f"  {sid:22s} {dur:6.2f}s{flag}", flush=True)
        t += dur + GAP
    total = t - GAP
    wav = os.path.join(PUBLIC, f"{key}.wav")
    sf.write(wav, np.concatenate(parts), SR, subtype="PCM_16")
    props = {"cuts": cuts, "captions": cues, "audio": {"narration": {"src": f"{PREFIX}/{key}.wav", "volume": 1.0}}}
    json.dump(props, open(os.path.join(P, "artifacts", f"{key}.json"), "w"), ensure_ascii=False, indent=1)
    # SRT sidecar (same cues as the burned-in captions)
    def ts(s):
        h = int(s // 3600); m = int(s % 3600 // 60); sec = s % 60
        return f"{h:02d}:{m:02d}:{int(sec):02d},{int(round((sec % 1) * 1000)) % 1000:03d}"
    with open(os.path.join(P, "artifacts", f"{key}.srt"), "w") as f:
        for i, (s, e, c) in enumerate(cues, 1): f.write(f"{i}\n{ts(s)} --> {ts(e)}\n{c}\n\n")
    words = sum(len(s[3].replace("[pause]", " ").split()) for s in segs)
    print(f"{key}: {total:.2f}s ({total/60:.2f} min), {len(cuts)} scenes, {len(cues)} cues, {words} words", flush=True)

if __name__ == "__main__":
    keys = sys.argv[1:] or list(DATA)
    if keys == ["--dry"]:
        for k in DATA:
            d = derive(DATA[k]); print(k, cr(d["issue"]), "pe", d["pe"], "rev_g", pct(d["rev_g"]), "m", pct(d["margin"]), "m25", pct(d["margin25"]),
                                        "pat_g", None if d["pat_g"] is None else pct(d["pat_g"]), "min", rs(d["min_amt"]), "fresh", pct(d["fresh_pct"]),
                                        "rev", cr(d["rev26"]), cr(d["rev25"]), "pat", cr(d["pat26"]), cr(d["pat25"]))
        sys.exit()
    for k in keys: build(k)
