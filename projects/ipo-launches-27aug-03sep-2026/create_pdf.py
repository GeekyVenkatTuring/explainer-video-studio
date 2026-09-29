#!/usr/bin/env python3
"""Create the IPO launch-brief PDF from the validated batch research."""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, KeepTogether)

OUT = Path(__file__).resolve().parents[2] / "output" / "pdf" / "ipo-launch-briefs-27aug-03sep-2026.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

IPOS = [
 ("Lumino Industries", "Mainboard", "27-31 Aug", "Rs. 78-82", "182 shares", "Rs. 14,924", "Rs. 700 Cr", "Power T&D manufacturing plus EPC. Conductors, cables, wires, substations, rail electrification, solar and water projects.", "Review order-book conversion, commodity inputs, EPC working capital and final fresh-versus-OFS split."),
 ("Kwick Forensic Solutions", "SME", "27-31 Aug", "Rs. 85-90", "1,600 shares", "Rs. 1.44L / stated lot", "Rs. 51 Cr", "Forensic products and evidence-management solutions: crime-scene kits, mobile CSI units, cyber, digital and DNA forensics.", "SME liquidity, government/order concentration, minimum application multiple and RHP risk factors."),
 ("ESDS Software Solution", "Mainboard", "28 Aug-1 Sep", "Rs. 408-429", "34 shares", "Rs. 14,586", "Rs. 720 Cr", "AI-enabled cloud, managed services, data-centre infrastructure and software, including GPU-as-a-Service.", "The stated offer is fresh issue only. Check RHP objects, capacity use, customer concentration and valuation."),
 ("Priority Jewels", "Mainboard", "28 Aug-1 Sep", "Rs. 190-200", "75 shares", "Rs. 15,000", "Rs. 91.50 Cr", "Jewellery business; use the final RHP for its product mix, sourcing model and customer concentration.", "Fresh issue stated. Test gold-price exposure, inventory, working capital, margins and debt use."),
 ("Complete Sports & Management India", "SME", "28 Aug-1 Sep", "Rs. 128-135", "1,000 shares", "Rs. 1.35L / stated lot", "Rs. 74.93 Cr", "Sports-management and event-execution business; the RHP is needed for exact client and revenue-stream details.", "Contract dependence, collections, event/talent execution risk and broker minimum bid."),
 ("Paluck Technologies", "SME", "28 Aug-1 Sep", "Rs. 46-48", "3,000 shares", "Rs. 1.44L / stated lot", "Rs. 33 Cr", "Engineering and infrastructure support across automobile services, equipment rental, logistics and telecom engineering.", "Cash cycle matters: fuel, spares and fleet costs precede many large-customer collections. Check stated use of proceeds."),
 ("Ashutosh Fibre", "SME", "31 Aug-2 Sep", "Rs. 87-92", "1,200 shares", "Rs. 1.10L / stated lot", "Rs. 56.35 Cr", "Textile-products company. The stated issue is fresh; verify product categories, customers and input sensitivity in the RHP.", "Confirm market-maker reservation and whether the broker requires a two-lot minimum."),
 ("Phychem Technologies", "SME", "31 Aug-2 Sep", "Rs. 51-54", "2,000 shares", "Rs. 1.08L / stated lot", "Rs. 14.58 Cr", "Industrial products including chemical tanks, storage solutions and rotolining-related products.", "For a small SME issue, check capacity, input costs, receivables, cash conversion and post-listing liquidity."),
 ("Purple Style Labs", "Mainboard", "31 Aug-2 Sep", "Rs. 546-575", "26 shares", "Rs. 14,950", "Rs. 680 Cr", "Fashion and luxury platform. The DRHP describes a fresh issue; final terms need RHP confirmation.", "Separate marketplace growth from inventory, fulfilment, returns, margin and working-capital economics."),
 ("Shanti Inorganics", "SME", "31 Aug-2 Sep", "Rs. 79-83", "1,600 shares", "Rs. 1.33L / stated lot", "Verify final RHP", "Inorganic-chemicals business; the issuer hosts offer documents and industry research in its investor section.", "Read the RHP for capacity, input-price exposure, compliance, customers and minimum bid multiple."),
 ("Rays of Belief", "Mainboard", "1-3 Sep", "Rs. 227-239", "62 shares", "Rs. 14,818", "Rs. 125 Cr", "Mom's Belief provides multidisciplinary intervention services for neurodevelopmental disorders.", "Stated fresh issue only. Test centre economics, clinician capacity, expansion plans and final offer terms."),
 ("Deepa Jewellers", "Mainboard", "1-3 Sep", "Rs. 168-177", "84 shares", "Rs. 14,868", "Rs. 449.05-459.72 Cr", "Jewellery offer. The RHP should establish product mix, store footprint and revenue concentration.", "Gold inventory, hedging, working capital, borrowings and final fresh-versus-OFS split are the key checks."),
 ("Farm Peace", "SME", "1-3 Sep", "Rs. 59 fixed", "20,000 shares", "Rs. 11.80L / stated lot", "Rs. 32 Cr", "Agribusiness offer. The RHP is the source for sourcing, seasonality, customer concentration and operations.", "Large stated lot is well above the usual retail ceiling; test inventory, receivables and commodity exposure."),
]

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Cover", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=27, leading=32, textColor=colors.HexColor("#10233F"), alignment=TA_CENTER, spaceAfter=10))
styles.add(ParagraphStyle(name="Sub", parent=styles["BodyText"], fontName="Helvetica", fontSize=11, leading=16, textColor=colors.HexColor("#4B6078"), alignment=TA_CENTER))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=15, leading=18, textColor=colors.HexColor("#0E6F73"), spaceAfter=5))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.3, leading=13, textColor=colors.HexColor("#27364A")))
styles.add(ParagraphStyle(name="Smallx", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.1, leading=11, textColor=colors.HexColor("#526579")))
styles.add(ParagraphStyle(name="Note", parent=styles["BodyText"], fontName="Helvetica-Oblique", fontSize=8.2, leading=11, textColor=colors.HexColor("#6A4A00")))

def p(txt, style="Bodyx"):
    return Paragraph(txt.replace("&", "&amp;"), styles[style])

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#D8E2EB")); canvas.line(18*mm, 13*mm, 192*mm, 13*mm)
    canvas.setFillColor(colors.HexColor("#60758A")); canvas.setFont("Helvetica", 8)
    canvas.drawString(18*mm, 8.5*mm, "IPO Launch Briefs | 27 Aug-3 Sep 2026 | Public-source education")
    canvas.drawRightString(192*mm, 8.5*mm, f"Page {doc.page}")
    canvas.restoreState()

story = [Spacer(1, 38*mm), p("INDIA IPO LAUNCH BRIEFS", "Cover"), p("13 offers opening from 27 August to 3 September 2026", "Sub"), Spacer(1, 7*mm),
         p("Prepared 27 August 2026 (IST). This report uses public IPO calendars, RHP-linked broker pages and issuer disclosures. It excludes live subscription and GMP because they are intraday and volatile.", "Sub"), Spacer(1, 17*mm)]

summary = [[p("Company", "Smallx"), p("Board", "Smallx"), p("Opens", "Smallx"), p("Price", "Smallx"), p("Stated ticket", "Smallx")]]
for name, board, dates, band, lot, ticket, size, business, check in IPOS:
    summary.append([p(name, "Smallx"), p(board, "Smallx"), p(dates, "Smallx"), p(band, "Smallx"), p(ticket, "Smallx")])
t = Table(summary, colWidths=[45*mm, 22*mm, 29*mm, 27*mm, 42*mm], repeatRows=1)
t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), colors.HexColor("#10233F")), ("TEXTCOLOR", (0,0), (-1,0), colors.white), ("GRID", (0,0), (-1,-1), .35, colors.HexColor("#D8E2EB")), ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5), ("BACKGROUND", (0,1), (-1,-1), colors.HexColor("#F7FAFC"))]))
story += [t, Spacer(1, 8*mm), p("Important: ‘stated lot value’ is price multiplied by the published lot. For SME IPOs, broker/exchange rules can require multiple lots; verify the actual application minimum before bidding.", "Note"), PageBreak()]

for i, (name, board, dates, band, lot, ticket, size, business, check) in enumerate(IPOS):
    terms = [[p("Open / close", "Smallx"), p("Price band", "Smallx"), p("Lot", "Smallx"), p("Stated ticket", "Smallx"), p("Issue size", "Smallx")],
             [p(dates, "Bodyx"), p(band, "Bodyx"), p(lot, "Bodyx"), p(ticket, "Bodyx"), p(size, "Bodyx")]]
    tt = Table(terms, colWidths=[33*mm, 31*mm, 30*mm, 40*mm, 37*mm])
    tt.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), colors.HexColor("#E5F4F4")), ("GRID", (0,0), (-1,-1), .35, colors.HexColor("#BCD7D7")), ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5)]))
    card = [p(f"{i+1:02d}. {name} <font color='#5A738D'>({board})</font>", "H2x"), tt, Spacer(1, 3*mm), p(f"<b>Business:</b> {business}"), p(f"<b>What to verify:</b> {check}"), Spacer(1, 6*mm)]
    story.append(KeepTogether(card))
    if i in (3, 7, 11):
        story.append(PageBreak())
        if i == 7:
            # This section's first card needs a little breathing room beneath
            # the running header on some ReportLab pagination paths.
            story.append(Spacer(1, 8*mm))

story += [Spacer(1, 4*mm), p("Sources and method", "H2x"), p("Offer-calendar terms were cross-checked on 27 Aug 2026 against JK Securities' live IPO calendar; Groww, Moneycontrol, Zerodha, Kotak Neo, Upstox, m.Stock and issuer pages were used where available. Primary documents remain the final RHP and the NSE/BSE issue notice. GMP is not included and no recommendation is made."), Spacer(1, 4*mm), p("Disclaimer", "H2x"), p("This is public-source education, not investment advice, a buy/sell recommendation or a listing-gain forecast. IPO terms can change. Read the final RHP and consult a SEBI-registered advisor where appropriate.", "Note")]

doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=16*mm, bottomMargin=20*mm, title="India IPO Launch Briefs")
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(OUT)
