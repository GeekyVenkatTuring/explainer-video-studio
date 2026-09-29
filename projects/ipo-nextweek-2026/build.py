#!/usr/bin/env python3
"""Evidence-first IPO chapters, researched 19 Aug 2026.

Primary evidence bundles (IPOAgents):
- /Users/appuram/Developer/IPOAgents/reports/augmont-enterprises/evidence.json
- /Users/appuram/Developer/IPOAgents/reports/tempsens-instruments-india/evidence.json
- /Users/appuram/Developer/IPOAgents/reports/skyways-air-services/evidence.json

Facts are drawn from RHP/DRHP pages. Tempsens terms marked PROVISIONAL because the
pipeline could only retrieve its DRHP. All results are education, never advice.
"""
import importlib.util, os, sys

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

DIS = ("This is public-source education, not investment advice or a buy or sell call. "
       "Read the final RHP, verify live subscription and consult a SEBI-registered advisor. Thanks for watching.")

DATA = {
"augmont": dict(
 name="Augmont Enterprises IPO", kicker="IPO ANALYSIS · MAINBOARD", accent="#FBBF24",
 sub="Gold & silver platform · ₹825 Cr · 21–25 Aug 2026",
 biz=[("🥇","Integrated bullion platform","Refining, trading, digital gold and jewellery: Augmont connects the precious-metals value chain.","GOLD + SILVER"),
      ("📱","B2B and consumer rails","Its platforms serve enterprise/international sales and consumers, online and offline.","PLATFORM"),
      ("⚠️","Metal-price sensitivity","Reported revenue moves mechanically with gold and silver prices; scale is not the same as margin.","KEY LENS")],
 revenue="₹94,186.21 Cr", pat="₹348.30 Cr", margin="0.37% PAT margin", borrow="Not disclosed in headline", borrow_num=None, issue="₹825 Cr", fresh="₹620 Cr", ofs="₹205 Cr", retail="₹14,972 (19 shares × ₹788)",
 finnote="FY26 revenue rose with precious-metals throughput; the thin 0.37% PAT margin is the more useful quality check.",
 use=[("📦","₹465 Cr working capital","Funds inventory procurement, maintenance and advance margins — the core use of the fresh issue.","75% OF FRESH"),
      ("👥","₹205 Cr to selling promoters","The OFS proceeds do not go into Augmont.","OFS"),
      ("⚠️","Gold-price and concentration risk","The RHP flags revenue linkage to metal prices and reliance on key customers.","RHP RISKS")],
 peers=[("Augmont IPO",None,"RHP says no true listed peer",True),("No comparable listed peer",None,"No P/E benchmark supplied",False)],
 peerverdict="No clean listed peer: assess working-capital intensity and margin, not a borrowed peer multiple.",
 verdict=[("Revenue is mechanically linked to gold/silver prices","Fresh capital supports inventory and working-capital scale"),("Very thin FY26 PAT margin: 0.37%","Integrated platform across bullion, digital and jewellery"),("A quarter of the deal is promoter OFS","RHP-backed disclosure, not a grey-market thesis")],
 sources="Final RHP: Augmont Enterprises, FY26 financials / Objects of Offer / risk factors; price terms from offer announcement.",
),
"tempsens": dict(
 name="Tempsens Instruments IPO", kicker="IPO ANALYSIS · MAINBOARD · PROVISIONAL TERMS", accent="#38BDF8",
 sub="Thermal engineering · about ₹650 Cr · terms pending final RHP",
 biz=[("🌡️","Thermal engineering","Makes temperature sensors, calibration equipment, electrical heating and specialised cable solutions.","INSTRUMENTATION"),
      ("🏭","Projects and OEMs","About 69% of FY25 revenue came from projects/OEM work; the rest from MRO business.","B2B"),
      ("🌍","Industrial end markets","Serves metals, power, chemicals and other process industries where temperature control matters.","INDUSTRIAL")],
 revenue="₹378.53 Cr", pat="₹62.56 Cr", margin="16.36% PAT margin", borrow="₹71.83 Cr", borrow_num=71.83, issue="~₹650 Cr*", fresh="~₹95 Cr*", ofs="~₹555 Cr*", retail="₹15,000* (50 shares × ₹300)",
 finnote="DRHP FY25: revenue ₹378.53 Cr, PAT ₹62.56 Cr and borrowings ₹71.83 Cr. Asterisks mean terms need final-RHP confirmation.",
 use=[("🏦","Debt repayment","DRHP earmarks ₹55 Cr of the original ₹118 Cr fresh issue for borrowing repayment.","DRHP"),
      ("⚙️","₹35.38 Cr capex","Electrical-heating and specialised-cable capacity are named expansion uses.","DRHP"),
      ("⚠️","Terms changed after DRHP","Fresh/OFS values and price band in this chapter are provisional until a final RHP is published.","VERIFY")],
 peers=[("Tempsens IPO",None,"No final price / peer P/E",True),("No exact listed peer",None,"DRHP disclosure",False)],
 peerverdict="The DRHP says there is no exact comparable listed peer; final valuation must wait for the final RHP and price band.",
 verdict=[("Most of the quoted final issue is expected to be OFS","Profitable DRHP business: 16.36% FY25 PAT margin"),("Final offer terms are not in the available RHP","Fresh proceeds are directed to debt reduction and capex"),("Project/OEM mix carries industrial-cycle exposure","Specialised thermal-engineering products")],
 sources="DRHP dated 29 Sep 2025 (NSE archive): FY25 financials, objects and peer disclosure. *Offer terms require final-RHP verification.",
),
"skyways": dict(
 name="Skyways Air Services IPO", kicker="IPO ANALYSIS · MAINBOARD", accent="#A78BFA",
 sub="Freight forwarding & logistics · ₹582.80 Cr · 24–27 Aug 2026",
 biz=[("✈️","Air-first freight forwarder","Handles air, ocean and land freight, express cargo and parcel logistics across twelve countries.","12 COUNTRIES"),
      ("📦","Scale metrics","FY26: 9,504 customers, 83,924 air-cargo tonnes and 28,275 ocean containers handled.","VOLUME"),
      ("🌏","Asia concentration","Asia was 85.51% of FY26 revenue — reach is broad, but exposure is not evenly distributed.","RHP RISK")],
 revenue="₹2,812.90 Cr", pat="₹63.52 Cr", margin="2.26% PAT margin", borrow="₹624.06 Cr", borrow_num=624.06, issue="₹582.80 Cr", fresh="₹398.80 Cr", ofs="₹184.00 Cr", retail="₹13,800 (100 shares × ₹138)",
 finnote="Final RHP FY26: revenue ₹2,812.90 Cr (+25.14%), PAT ₹63.52 Cr and total borrowings ₹624.06 Cr.",
 use=[("🏦","₹216.79 Cr debt repayment","For Skyways and subsidiary Forin Container Line — the largest stated fresh-issue use.","RHP"),
      ("📦","₹130 Cr working capital","Funding growth in a business with substantial receivables and working-capital needs.","RHP"),
      ("👥","₹184 Cr OFS","That portion goes to selling shareholders, not the operating company.","OFS")],
 peers=[("Skyways IPO",38.8,"₹138 cap / FY26 EPS ₹3.56",True),("TVS Supply Chain",54,"RHP peer set",False),("Shadowfax",104,"RHP peer set",False),("Delhivery",260,"RHP peer set",False),("Mahindra Logistics",1548,"RHP peer set; low EPS",False)],
 peerverdict="At the ₹138 cap, Skyways is ~38.8× FY26 EPS — below the disclosed peer-set low of 54×, but business models are not strictly comparable.",
 verdict=[("Thin 2.26% FY26 PAT margin","Revenue +25.14% and operating scale expanded"),("₹624.06 Cr borrowings; working-capital funding matters","Fresh proceeds repay debt and support working capital"),("85.51% of revenue from Asia","Peer multiple is lower, but comparability is limited")],
 sources="Final RHP: Skyways Air Services, pages 72–74, 109–110 and 132–133; offer terms from final price-band announcement.",
),
}

def cards(kicker, title, color, rows):
    return {"kicker":kicker,"title":title,"color":color,"items":[{"emoji":e,"k":k,"v":v,"chip":c} for e,k,v,c in rows]}

def chapter(cid, d):
    a=d["accent"]
    def sc(x,v,p,n): return (f"{cid}_{x}",v,p,n)
    if d["borrow_num"] is None:
        third_stat={"label":"PAT margin","to":0.37,"prefix":"","suffix":"%","decimals":2,"color":"#FBBF24","sub":"reported FY26 margin"}
    else:
        third_stat={"label":"Borrowings","to":d["borrow_num"],"prefix":"₹","suffix":" Cr","decimals":2,"color":"#FBBF24","sub":d["borrow"]}
    ntitle=f"This is {d['name']}. [pause] We will use the IPOAgents filing evidence to test the business, financial quality, where the money goes, competitors and risks. [pause] This is education, not investment advice."
    nbiz="First, the business. [pause] " + " [pause] ".join(x[1]+". "+x[2] for x in d["biz"])
    nfin=f"The financial checkpoint is revenue {d['revenue']}, profit after tax {d['pat']}, and {d['margin']}. [pause] {d['finnote']}"
    nissue=f"The offer is {d['issue']}: {d['fresh']} is fresh money and {d['ofs']} is offer for sale. [pause] Fresh money enters the company. Offer-for-sale money goes to selling shareholders."
    nuse="Where does fresh money go? [pause] " + " [pause] ".join(x[1]+". "+x[2] for x in d["use"])
    npeer="Now competitors and valuation. [pause] " + d["peerverdict"]
    nver="Balance the evidence. [pause] " + " [pause] ".join("Watch-out: "+m+". Strength: "+f+"." for m,f in d["verdict"])
    nret=f"For retail investors, the stated minimum is {d['retail']}. [pause] Retail bids are capped at two lakh rupees and allotment can be a lottery when an offer is oversubscribed. [pause] Check the exchange pages and final RHP before making any decision."
    recap=[f"FY data: revenue {d['revenue']} · PAT {d['pat']} · {d['margin']}",f"Offer: {d['issue']} · fresh {d['fresh']} · OFS {d['ofs']}","Competitor lens: "+d["peerverdict"],"Evidence: "+d["sources"]]
    return [
      sc("title","sm_ptitle",{"title":d["name"],"sub":d["sub"],"kicker":d["kicker"]},ntitle),
      sc("biz","sm_iconcards",cards("WHAT THE COMPANY DOES","Business Model",a,d["biz"]),nbiz),
      sc("fin","sm_stats",{"kicker":"FINANCIAL QUALITY","title":"FY Financials","stats":[{"label":"Revenue","to":float(d["revenue"].replace("₹","").replace(" Cr","").replace(",","")),"prefix":"₹","suffix":" Cr","color":"#34D399","sub":"filing evidence"},{"label":"Profit after tax","to":float(d["pat"].replace("₹","").replace(" Cr","").replace(",","")),"prefix":"₹","suffix":" Cr","color":"#34D399","sub":d["margin"]},third_stat],"note":d["finnote"]},nfin),
      sc("issue","sm_stats",{"kicker":"OFFER STRUCTURE","title":"Fresh Issue vs OFS","stats":[{"label":"Total offer","to":float(d["issue"].replace("~","").replace("₹","").replace(" Cr*","").replace(" Cr","").replace(",","")),"prefix":"₹","suffix":" Cr","color":a,"sub":"offer terms"},{"label":"Fresh — company receives","to":float(d["fresh"].replace("~","").replace("₹","").replace(" Cr*","").replace(" Cr","").replace(",","")),"prefix":"₹","suffix":" Cr","color":"#34D399","sub":"new capital"},{"label":"OFS — sellers receive","to":float(d["ofs"].replace("~","").replace("₹","").replace(" Cr*","").replace(" Cr","").replace(",","")),"prefix":"₹","suffix":" Cr","color":"#FB7185","sub":"shareholder exit"}],"note":"Fresh funds enter the company. OFS proceeds go to selling shareholders."},nissue),
      sc("proceeds","sm_iconcards",cards("USE OF PROCEEDS","What Fresh Capital Funds",a,d["use"]),nuse),
      sc("peers","sm_peers",{"kicker":"COMPETITORS · VALUATION","title":"Peer Comparison","color":a,"rows":[{"name":n,"pe":p,"note":note,"hi":hi} for n,p,note,hi in d["peers"]],"verdict":d["peerverdict"]},npeer),
      sc("verdict","sm_myths",{"kicker":"CONSOLIDATED ANALYSIS","title":"Strengths vs Watch-outs","mythLabel":"⚠️ WATCH-OUTS","factLabel":"✅ EVIDENCE-BACKED STRENGTHS","pairs":[{"m":m,"f":f} for m,f in d["verdict"]]},nver),
      sc("retail","sm_iconcards",cards("HOW TO APPLY · RETAIL VS HNI","Check Terms Before You Bid",a,[("🧑","Retail cap","Up to ₹2 lakh; allocation can be lottery-based when oversubscribed.","RII"),("💼","HNI","Above ₹2 lakh; allocation is proportionate.","NII"),("💰","Minimum bid",d["retail"],"MIN BID"),("🔎","Verify live","Read the final RHP and the NSE/BSE subscription data.","SOURCES")]),nret),
      sc("recap","sm_recap",{"title":d["name"]+" — Evidence Recap","items":recap,"closer":"Read the final RHP. Decide for yourself."},"Let's recap. [pause] "+" [pause] ".join(recap)+" [pause] "+DIS),
    ]

series.CHAPTERS={k:chapter(k,v) for k,v in DATA.items()}
if __name__ == "__main__":
    for ch in (sys.argv[1:] or list(DATA)): series.build_chapter(ch)
