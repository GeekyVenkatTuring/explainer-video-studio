#!/usr/bin/env python3
"""IPO launch briefs — 27 Aug to 03 Sep 2026.

NUMBERS TABLE / DATA GATE (checked 27 Aug 2026, IST)
Scope: offers whose subscription OPENS from 27 Aug through 03 Sep. This deliberately
excludes issues that opened earlier in the week, and excludes live subscription/GMP:
they are time-sensitive and do not belong in a pre-open explainer.

Authoritative terms cross-check: JK Securities' live IPO calendar (27 Aug), Groww IPO
pages, Moneycontrol / broker offer pages where available. Business descriptions come
from the relevant RHP-linked broker page or issuer website. Every stated price, lot and
date below is copied exactly from the calendar; calculations are upper-band price × lot.
SME wording intentionally says "stated lot value", not retail minimum: broker minimum-lot
rules can be two lots and can therefore exceed the retail ceiling.

Lumino: 27–31 Aug, ₹78–82, lot 182, ₹700 Cr, mainboard (Groww; issuer profile).
Kwick: 27–31 Aug, ₹85–90, lot 1,600, ₹51 Cr, SME (JK / issuer site / IPO List).
ESDS: 28 Aug–1 Sep, ₹408–429, lot 34, ₹720 Cr, mainboard, 100% fresh (Moneycontrol; Upstox).
Priority: 28 Aug–1 Sep, ₹190–200, lot 75, ₹91.50 Cr fresh, mainboard (Zerodha; RHP notice).
Complete Sports: 28 Aug–1 Sep, ₹128–135, lot 1,000, ₹74.93 Cr, SME (IIFL / JK).
Paluck: 28 Aug–1 Sep, ₹46–48, lot 3,000, ₹33 Cr, SME (Groww; Upstox).
Ashutosh Fibre: 31 Aug–2 Sep, ₹87–92, lot 1,200, ₹56.35 Cr fresh, SME (ET / NSE data).
Phychem: 31 Aug–2 Sep, ₹51–54, lot 2,000, ₹14.58 Cr, SME (JK / offer page).
Purple Style Labs: 31 Aug–2 Sep, ₹546–575, lot 26, ₹680 Cr fresh, mainboard (IIFL / DRHP).
Shanti Inorganics: 31 Aug–2 Sep, ₹79–83, lot 1,600, SME (JK / issuer investor page).
Rays of Belief: 1–3 Sep, ₹227–239, lot 62, ₹125 Cr fresh, mainboard (m.Stock / RHP page).
Deepa Jewellers: 1–3 Sep, ₹168–177, lot 84, ₹449.05–459.72 Cr, mainboard (JK / Kotak Neo).
Farm Peace: 1–3 Sep, ₹59 fixed, lot 20,000, ₹32 Cr, SME (JK / Kotak Neo).

No forecasts or recommendations. This is public-source education, not investment advice.
"""
import importlib.util, os, sys, subprocess, time

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

# Edge can occasionally exit successfully with a truncated MP3. Validate it
# before conversion so transient network responses do not poison the cache.
def robust_tts_chunk(path, text):
    mp3 = path[:-4] + ".mp3"
    for attempt in range(8):
        if os.path.exists(mp3):
            os.remove(mp3)
        result = subprocess.run(
            ["edge-tts", "--voice", series.VOICE, f"--rate={series.RATE}", "--text", text, "--write-media", mp3],
            capture_output=True, timeout=120,
        )
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
       "Read the final RHP and verify the exchange data before making any decision. Thanks for watching.")

DATA = {
 "lumino": ("Lumino Industries IPO", "MAINBOARD", "27–31 Aug", "₹78–82", "182 shares", "₹14,924", "₹700 Cr", "#FBBF24", [
   ("⚡", "Power T&D platform", "Manufactures conductors, cables and electrical wires for the power transmission and distribution sector.", "ENERGY"),
   ("🏗️", "EPC execution", "Also executes transmission, substations, rail electrification, solar and water-management projects.", "EPC"),
   ("📋", "Order-book lens", "The disclosed March 2026 order book was about ₹3,149.88 Cr; verify the RHP definition and execution assumptions.", "RHP CHECK")]),
 "kwick": ("Kwick Forensic Solutions IPO", "SME", "27–31 Aug", "₹85–90", "1,600 shares", "₹1.44L / stated lot", "₹51 Cr", "#A78BFA", [
   ("🔎", "Evidence-management solutions", "Supplies forensic products and services to law-enforcement and investigation users.", "FORENSICS"),
   ("🚐", "Field to lab", "Its offering spans crime-scene kits, mobile CSI units, cyber and digital forensics, and DNA-lab solutions.", "END-TO-END"),
   ("⚠️", "SME liquidity", "A higher ticket and potentially thinner post-listing liquidity need separate consideration from the business story.", "SME RISK")]),
 "esds": ("ESDS Software Solution IPO", "MAINBOARD", "28 Aug–1 Sep", "₹408–429", "34 shares", "₹14,586", "₹720 Cr", "#22D3EE", [
   ("☁️", "AI-enabled cloud", "Provides cloud, managed services, data-centre infrastructure and software solutions in India.", "CLOUD"),
   ("🖥️", "Infrastructure stack", "The platform includes IaaS, managed services, cybersecurity, backup and GPU-as-a-Service offerings.", "DATA CENTRES"),
   ("✅", "Fresh issue only", "The stated ₹720 Cr offer is a fresh issue; verify the final RHP for the detailed objects of the issue.", "100% FRESH")]),
 "priority": ("Priority Jewels IPO", "MAINBOARD", "28 Aug–1 Sep", "₹190–200", "75 shares", "₹15,000", "₹91.50 Cr", "#FBBF24", [
   ("💎", "Jewellery business", "Review the final RHP for the company’s product mix, sourcing model and customer concentration.", "RHP FIRST"),
   ("🧾", "Fresh capital", "The advertised offer is a fresh issue; fresh proceeds enter the company rather than selling shareholders.", "FRESH ISSUE"),
   ("⚠️", "Gold-cycle lens", "Inventory, metal-price exposure, working capital and margin discipline are the filing sections to test.", "WATCH")]),
 "complete": ("Complete Sports & Management India IPO", "SME", "28 Aug–1 Sep", "₹128–135", "1,000 shares", "₹1.35L / stated lot", "₹74.93 Cr", "#34D399", [
   ("🏏", "Sports-management business", "Read the RHP for the exact revenue streams, client contracts and event-execution responsibilities.", "SPORTS"),
   ("📅", "Execution risk", "Sports and events businesses can depend on contracts, scheduling, talent and collection cycles.", "DUE DILIGENCE"),
   ("⚠️", "SME structure", "Confirm the bid multiple, minimum application and liquidity profile in your broker app before any bid.", "SME")]),
 "paluck": ("Paluck Technologies IPO", "SME", "28 Aug–1 Sep", "₹46–48", "3,000 shares", "₹1.44L / stated lot", "₹33 Cr", "#38BDF8", [
   ("🚧", "Infrastructure support", "Works across automobile services, logistics and equipment rental, and telecom engineering services.", "DIVERSIFIED"),
   ("🚚", "Working-capital intensive", "Fuel, spares, consumables and fleet upkeep are paid before some government and contractor collections.", "CASH CYCLE"),
   ("🏦", "Use-of-proceeds test", "The published objectives include working capital, capex, general purposes and loan prepayment.", "RHP")]),
 "ashutosh": ("Ashutosh Fibre IPO", "SME", "31 Aug–2 Sep", "₹87–92", "1,200 shares", "₹1.10L / stated lot", "₹56.35 Cr", "#EC4899", [
   ("🧵", "Textile-products company", "Use the RHP to identify product categories, customer concentration and raw-material sensitivity.", "TEXTILES"),
   ("🧾", "Fresh issue", "The stated offer is a fresh issue; confirm the final objects and market-maker reservation in the RHP.", "FRESH"),
   ("⚠️", "SME application", "At the cap price, the stated lot value is ₹1.10L; confirm whether your broker requires a two-lot minimum.", "VERIFY")]),
 "phychem": ("Phychem Technologies IPO", "SME", "31 Aug–2 Sep", "₹51–54", "2,000 shares", "₹1.08L / stated lot", "₹14.58 Cr", "#34D399", [
   ("🧪", "Industrial products", "The company’s disclosed product range includes chemical tanks, storage solutions and rotolining-related products.", "INDUSTRIAL"),
   ("🏭", "Project economics", "Capacity utilisation, input costs and customer payment cycles are more useful questions than a headline GMP.", "CHECK"),
   ("⚠️", "Small offer", "The ₹14.58 Cr SME issue merits an explicit liquidity and application-size check.", "SME")]),
 "purple": ("Purple Style Labs IPO", "MAINBOARD", "31 Aug–2 Sep", "₹546–575", "26 shares", "₹14,950", "₹680 Cr", "#A78BFA", [
   ("🛍️", "Fashion and luxury platform", "Use the final RHP to distinguish marketplace growth from inventory, fulfilment and brand economics.", "CONSUMER"),
   ("🧾", "Fresh issue", "The DRHP describes a ₹680 Cr fresh issue; confirm final share count and objects in the RHP.", "FRESH"),
   ("⚠️", "Unit-economics test", "Growth, gross margin, cash burn or profit, returns and working capital all belong in the analysis.", "RHP")]),
 "shanti": ("Shanti Inorganics IPO", "SME", "31 Aug–2 Sep", "₹79–83", "1,600 shares", "₹1.33L / stated lot", "Verify final RHP", "#22D3EE", [
   ("⚗️", "Inorganic-chemicals business", "The issuer’s investor page hosts its offer documents and industry research material.", "CHEMICALS"),
   ("📄", "Document-led review", "Check the RHP for capacity, input-price exposure, environmental compliance and customer concentration.", "RHP"),
   ("⚠️", "SME ticket", "Confirm the broker’s minimum application multiple and the market-maker/liquidity details before bidding.", "SME")]),
 "rays": ("Rays of Belief IPO", "MAINBOARD", "1–3 Sep", "₹227–239", "62 shares", "₹14,818", "₹125 Cr", "#FBBF24", [
   ("🧠", "Neurodevelopmental care", "Mom’s Belief provides multidisciplinary intervention services for neurodevelopmental disorders.", "HEALTHCARE"),
   ("🏥", "Service-delivery model", "The RHP should be the source for centre economics, clinician capacity, outcomes and expansion plans.", "OPERATIONS"),
   ("✅", "Fresh issue only", "The stated ₹125 Cr issue is fresh capital, with no stated offer-for-sale component.", "100% FRESH")]),
 "deepa": ("Deepa Jewellers IPO", "MAINBOARD", "1–3 Sep", "₹168–177", "84 shares", "₹14,868", "₹449.05–459.72 Cr", "#FBBF24", [
   ("💍", "Jewellery offer", "Use the final RHP to understand its product mix, store footprint and revenue concentration.", "JEWELLERY"),
   ("📉", "Capital intensity", "Gold inventory, hedging, working capital and borrowing terms are central to any jewellery-IPO analysis.", "KEY LENS"),
   ("⚠️", "Offer structure", "Confirm fresh-versus-OFS split and every use of proceeds from the final RHP before forming a view.", "RHP")]),
 "farmpeace": ("Farm Peace IPO", "SME", "1–3 Sep", "₹59 fixed", "20,000 shares", "₹11.80L / stated lot", "₹32 Cr", "#34D399", [
   ("🌾", "Agribusiness offer", "Read the final RHP for the business model, sourcing, seasonality and customer concentration.", "AGRI"),
   ("📦", "Working-capital lens", "Inventory, receivables, commodity exposure and cash conversion are the important RHP checkpoints.", "CASH CYCLE"),
   ("⚠️", "Large stated lot", "At ₹59, the stated 20,000-share lot is ₹11.80L—well beyond the usual retail ceiling.", "SME")]),
}

def cards(kicker, title, color, rows):
    return {"kicker": kicker, "title": title, "color": color,
            "items": [{"emoji": e, "k": k, "v": v, "chip": chip} for e, k, v, chip in rows]}

def chapter(cid, d):
    name, board, dates, band, lot, bid, size, accent, biz = d
    def sc(key, variant, props, narration): return (f"{cid}_{key}", variant, props, narration)
    board_note = ("Mainboard bids use the retail category up to two lakh rupees; allotment can be a lottery when oversubscribed."
                  if board == "MAINBOARD" else
                  "This is an SME issue. Confirm the application multiple and liquidity conditions with the exchange and your broker.")
    upper_price = float(band.split("–")[-1].replace("₹", "").replace(" fixed", ""))
    stated_lot_value = upper_price * float(lot.split()[0].replace(",", ""))
    return [
      sc("title", "sm_ptitle", {"title": name, "sub": f"{board} · opens {dates} · public-source launch brief", "kicker": "IPO LAUNCH BRIEF · NOT ADVICE"},
         f"This is the {name}, opening {dates}. [pause] In this launch brief, we will establish what the company does, the stated offer terms, and the filing checks that matter before a bid. [pause] {DIS}"),
      sc("business", "sm_iconcards", cards("WHAT THE COMPANY DOES", "The business before the buzz", accent, biz),
         "First: the business. [pause] " + " [pause] ".join(f"{k}. {v}" for _, k, v, _ in biz)),
      sc("terms", "sm_iconcards", cards("OFFER TERMS · CHECK FINAL RHP", "Price, lot and ticket", accent, [
          ("🏷️", "Upper price", f"{band} per share.", "PRICE BAND"),
          ("🧮", "Stated lot", f"{lot} for this {board.lower()} offer.", "LOT SIZE"),
          ("💳", "Stated ticket", f"{bid} at the upper price, before any broker-specific SME multiple.", "UPPER BAND"),
          ("📊", "Issue size", f"Stated size: {size}. Re-check the exchange notice for final terms.", "VERIFY")]),
         f"The stated price is {band} per share, and the stated lot is {lot}. [pause] That makes the stated ticket {bid}. [pause] The published issue size is {size}. [pause] Before bidding, confirm every term in the final RHP and the exchange notice; calendars can change."),
      sc("check", "sm_checklist", {"kicker": "THE 5-MINUTE RHP CHECK", "title": "What to verify before a bid", "color": accent, "icon": "✓", "items": [
          "Fresh issue versus OFS: who receives the money?", "Objects of the issue: debt, working capital, capex or general purposes?", "Three-year revenue, profit and operating-cash-flow trend", "Top customers, raw-material exposure and disclosed risk factors", "Final price, lot, subscription and listing dates on NSE or BSE"]},
         "Before you treat an I-P-O calendar as analysis, open the RHP. [pause] First, separate fresh capital from an offer for sale. [pause] Then read the use of proceeds, the three-year financial trend, customer and input risks, and the final exchange terms. [pause] Do not substitute grey-market chatter for the filing."),
      sc("lane", "sm_iconcards", cards("APPLICATION LANE", "Know the market you are entering", accent, [
          ("📌", board, board_note, board),
          ("📄", "Source of truth", "The final RHP and NSE or BSE IPO page are the source for terms and live subscription.", "VERIFY"),
          ("⚠️", "GMP is not used here", "Grey-market premium is unofficial, volatile and not a listing prediction.", "UNOFFICIAL"),
          ("🧭", "Decision framework", "Match the filing evidence to your risk tolerance; this video does not say apply or avoid.", "NOT ADVICE")]),
         f"{board_note} [pause] Use the final RHP and the exchange I-P-O page as the source of truth. [pause] Grey-market premium is unofficial and is not a listing prediction. [pause] This is a framework, not an apply or avoid call."),
      sc("recap", "sm_recap", {"title": name + " — launch recap", "items": [f"Opens {dates} · {board}", f"Price {band} · stated lot {lot}", f"Stated ticket: {bid} · issue size: {size}", "Read final RHP: structure, objects, financials and risks", "Verify live exchange data; no GMP or recommendation here"], "closer": "Public-source education. Verify the RHP; decide for yourself."},
         f"To recap: {name} opens {dates}. [pause] The stated price is {band}, with a stated lot of {lot}. [pause] The stated ticket is {bid}. [pause] Read the final RHP for structure, objects, financials and risk factors, then verify the exchange data. [pause] {DIS}"),
    ]

series.CHAPTERS = {key: chapter(key, value) for key, value in DATA.items()}

def build_chapter_without_captions(ch):
    """Keep narration, but preserve the project's no-captions default."""
    series.build_chapter(ch)
    path = os.path.join(ROOT, "artifacts", f"{ch}.json")
    with open(path) as f:
        props = __import__("json").load(f)
    props.pop("captions", None)
    with open(path, "w") as f:
        __import__("json").dump(props, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    for ch in (sys.argv[1:] or list(series.CHAPTERS)):
        build_chapter_without_captions(ch)
