# IPO Report Card — 20 Mainboard Listings (pre-render numbers gate)

**Video dateline:** 29 August 2026. **Market-price dateline:** official NSE close,
28 August 2026. Scope is every newly listed Indian **mainboard equity** from
30 July through 28 August 2026. Cube Highways Trust is excluded because the 2026
transaction was an OFS in an already-listed InvIT, not a new equity listing.

All rupee prices and percentages are shown to two decimals. “Target” means this
project's transparent base-case factor-model estimate. It does **not** mean broker
consensus, a bank research target, a guaranteed price, or a recommendation.

## 1. Official market-price gate

| # | Company (NSE symbol) | Listed | Issue | NSE listing open | Listing gain | NSE close 28 Aug | Return vs issue |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | Indo-MIM (`INDOMIM`) | 30 Jul | ₹485.00 | ₹700.00 | +44.33% | ₹868.05 | +78.98% |
| 2 | Lohia Corp (`LCL`) | 30 Jul | ₹425.00 | ₹461.00 | +8.47% | ₹565.10 | +32.96% |
| 3 | Xtranet Technologies (`XTRANET`) | 30 Jul | ₹127.00 | ₹136.00 | +7.09% | ₹197.11 | +55.20% |
| 4 | Manipal Health (`MANIPALHOS`) | 05 Aug | ₹590.00 | ₹652.00 | +10.51% | ₹771.65 | +30.79% |
| 5 | Juniper Green Energy (`JNPR`) | 06 Aug | ₹225.00 | ₹245.00 | +8.89% | ₹258.23 | +14.77% |
| 6 | MV Electrosystems (`MVELECTRO`) | 06 Aug | ₹425.00 | ₹520.00 | +22.35% | ₹719.55 | +69.31% |
| 7 | Ardee Industries (`ARDEE`) | 12 Aug | ₹53.00 | ₹72.00 | +35.85% | ₹61.16 | +15.40% |
| 8 | Technocraft Ventures (`TECHNOCRAF`) | 14 Aug | ₹212.00 | ₹284.00 | +33.96% | ₹373.83 | +76.33% |
| 9 | LEAP India (`LEAPIND`) | 14 Aug | ₹159.00 | ₹165.90 | +4.34% | ₹168.40 | +5.91% |
| 10 | Dhoot Transmission (`DHOOTTRANS`) | 17 Aug | ₹871.00 | ₹1,200.00 | +37.77% | ₹1,454.90 | +67.04% |
| 11 | Molbio Diagnostics (`MOLBIO`) | 17 Aug | ₹807.00 | ₹980.00 | +21.44% | ₹1,094.75 | +35.66% |
| 12 | Milky Mist Dairy Food (`MILKYMIST`) | 18 Aug | ₹140.00 | ₹165.00 | +17.86% | ₹214.31 | +53.08% |
| 13 | Behari Lal Engineering (`BLEL`) | 19 Aug | ₹285.00 | ₹465.00 | +63.16% | ₹457.45 | +60.51% |
| 14 | Shiprocket (`SHIPROCKET`) | 19 Aug | ₹97.00 | ₹131.00 | +35.05% | ₹125.40 | +29.28% |
| 15 | Horizon Industrial Parks (`HORIZONIND`) | 24 Aug | ₹60.00 | ₹60.25 | +0.42% | ₹58.05 | −3.25% |
| 16 | Lalithaa Jewellery Mart (`LALITHAA`) | 24 Aug | ₹201.00 | ₹265.00 | +31.84% | ₹265.24 | +31.96% |
| 17 | Shankesh Jewellers (`SHANKESH`) | 25 Aug | ₹93.00 | ₹103.30 | +11.08% | ₹91.73 | −1.37% |
| 18 | Sunshine Pictures (`SUNSHINE`) | 25 Aug | ₹360.00 | ₹395.90 | +9.97% | ₹429.75 | +19.38% |
| 19 | Gaja Alternative Asset Management (`GAJA`) | 26 Aug | ₹160.00 | ₹185.00 | +15.62% | ₹158.66 | −0.84% |
| 20 | Tempsens Instruments (`TEMPSENS`) | 28 Aug | ₹300.00 | ₹634.00 | +111.33% | ₹586.65 | +95.55% |

### Price sources

- Official NSE 28 August 2026 security bhavcopy:
  `https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_28082026.csv`
- Official NSE listing-day bhavcopies use the same URL pattern for 30 July;
  5, 6, 12, 14, 17, 18, 19, 24, 25, 26 and 28 August 2026.
- NSE/Kite symbol mapping was verified against Zerodha's public instrument master:
  `https://api.kite.trade/instruments`.
- Critical symbol corrections versus the interrupted Claude session:
  Behari Lal is `BLEL`, not `BLIL`; Horizon is `HORIZONIND`, not `HORIZON`;
  Tempsens is `TEMPSENS` and was missing from the first pull.

## 2. Uniform target model

This is an **institutional-style factor model**, not a claim to reproduce a
particular bank's proprietary model.

### Step A — normalized operating growth

For profitable firms, use the lower of revenue growth and PAT growth so one
exceptional line item cannot dominate. Where a comparable Q1 FY27 result exists,
it overrides FY26. Cap the annual input to `[-25%, +35%]`.

For loss-makers, use revenue growth under the same cap.

### Step B — quality-adjusted fair multiple

Profitable firms:

```text
fair P/E = clamp(14 + 0.35×max(growth,0)
                    + 0.18×max(PAT margin,0)
                    − 2.50×leverage risk,
                 10, 45)
```

Loss-makers:

```text
fair P/S = clamp(1.50 + 0.05×max(growth,0)
                       − 0.25×leverage risk,
                 1, 6)
```

Leverage risk is a disclosed ordinal score: 0 low, 1 moderate, 2 high, 3 severe.
It incorporates debt-to-equity, absolute debt and whether IPO proceeds primarily
repay old borrowings.

### Step C — quarterly target path

For quarter `q ∈ {1,2}`:

```text
forward fundamental = (1 + annual growth)^(q/4)
multiple_q = current multiple + (fair multiple − current multiple) × 0.12 × q
target_q = current price × forward fundamental × multiple_q / current multiple
```

Only 12% of the valuation gap closes per quarter. This avoids pretending that a
new listing reaches fair value instantly. There are **no company-specific target
overrides**.

## 3. Model input and output gate

| # | Company | Growth input | FY26 PAT margin | Current multiple | Fair multiple | Leverage | Next quarter | Following quarter |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | Indo-MIM | +26.00% | +12.74% | 72.07× P/E | 22.89× | Moderate (1/3) | ₹844.38 (−2.73%) | ₹814.82 (−6.13%) |
| 2 | Lohia Corp | +25.00% | +11.24% | 24.61× P/E | 24.77× | Low (0/3) | ₹598.00 (+5.82%) | ₹632.81 (+11.98%) |
| 3 | Xtranet Technologies | +32.00% | +11.20% | 18.07× P/E | 24.72× | Moderate (1/3) | ₹220.60 (+11.92%) | ₹246.45 (+25.03%) |
| 4 | Manipal Health | −7.48% | +8.71% | 103.38× P/E | 10.00× | Severe (3/3) | ₹674.77 (−12.56%) | ₹581.33 (−24.66%) |
| 5 | Juniper Green Energy | +11.00% | +5.03% | 241.65× P/E | 11.26× | Severe (3/3) | ₹234.73 (−9.10%) | ₹209.81 (−18.75%) |
| 6 | MV Electrosystems | −21.09% | −25.36% | 39.70× P/S* | 1.00× | High (2/3) | ₹598.85 (−16.77%) | ₹489.65 (−31.95%) |
| 7 | Ardee Industries | +5.85% | +7.25% | 22.80× P/E* | 10.00× | Severe (3/3) | ₹57.86 (−5.40%) | ₹54.45 (−10.98%) |
| 8 | Technocraft Ventures | +23.50% | +12.48% | 25.98× P/E | 24.47× | Low (0/3) | ₹391.34 (+4.68%) | ₹409.65 (+9.58%) |
| 9 | LEAP India | +35.00% | +8.34% | 112.27× P/E | 20.25× | Severe (3/3) | ₹163.67 (−2.81%) | ₹157.17 (−6.67%) |
| 10 | Dhoot Transmission | +12.14% | +8.70% | 59.63× P/E | 14.81× | High (2/3) | ₹1,362.15 (−6.37%) | ₹1,262.79 (−13.20%) |
| 11 | Molbio Diagnostics | +14.80% | +11.52% | 74.12× P/E | 18.75× | Moderate (1/3) | ₹1,031.61 (−5.77%) | ₹962.68 (−12.06%) |
| 12 | Milky Mist Dairy Food | +33.55% | +4.04% | 108.79× P/E | 18.97× | Severe (3/3) | ₹207.56 (−3.15%) | ₹198.59 (−7.34%) |
| 13 | Behari Lal Engineering | +5.90% | +11.83% | 27.63× P/E | 15.69× | Moderate (1/3) | ₹440.00 (−3.82%) | ₹421.95 (−7.76%) |
| 14 | Shiprocket | +24.00% | −3.91% | 4.53× P/S* | 2.45× | Moderate (1/3) | ₹125.04 (−0.29%) | ₹124.25 (−0.92%) |
| 15 | Horizon Industrial Parks | +35.00% | −29.45% | 24.21× P/S* | 2.50× | Severe (3/3) | ₹55.84 (−3.81%) | ₹52.93 (−8.82%) |
| 16 | Lalithaa Jewellery Mart | +35.00% | +4.04% | 13.13× P/E | 24.48× | Moderate (1/3) | ₹315.56 (+18.97%) | ₹372.10 (+40.29%) |
| 17 | Shankesh Jewellers | +16.17% | +6.54% | 10.10× P/E | 18.34× | Moderate (1/3) | ₹104.55 (+13.98%) | ₹118.22 (+28.88%) |
| 18 | Sunshine Pictures | −25.00% | +52.47% | 28.09× P/E | 23.44× | Low (0/3) | ₹391.99 (−8.79%) | ₹357.40 (−16.83%) |
| 19 | Gaja Alternative Asset Management | +28.00% | +50.44% | 22.14× P/E | 32.88× | Low (0/3) | ₹178.58 (+12.56%) | ₹200.40 (+26.31%) |
| 20 | Tempsens Instruments | +13.60% | +15.97% | 70.43× P/E | 21.63× | Low (0/3) | ₹555.30 (−5.34%) | ₹521.30 (−11.14%) |

`*` Estimated current multiple. MV, Shiprocket and Horizon are loss-making, so
P/S is used. Ardee's current P/E is estimated from FY26 earnings and the 28 August
price. Every P/S output is **very low confidence**; every P/E output is **low
confidence** because no stock has even one month of public-market history.

## 4. Fundamental sources and reconciliation notes

- RHP baseline inputs for the first 19 names are retained in
  [`../ipo-series-en/build.py`](../ipo-series-en/build.py), whose screenplay was
  built from each issuer's RHP. Revenue, PAT, proceeds and leverage notes in this
  report card reconcile to that source.
- Tempsens RHP figures: FY26 revenue ₹444.88 crore, PAT ₹71.07 crore, PAT margin
  15.97%, revenue growth 17.53%, PAT growth 13.60%, D/E 0.15. RHP mirror:
  `https://nsearchives.nseindia.com/corporate/TempsensInstruments(India)Limited_RHP.zip`.
- MV Electrosystems Q1 FY27 loss and revenue were checked against the official NSE
  integrated filing:
  `https://nsearchives.nseindia.com/corporate/ixbrl/INTEGRATED_FILING_INDAS_189543_25082026163548_iXBRL_WEB.html`.
- Current P/E inputs were captured 29 August from StockAnalysis NSE quote pages
  (`https://stockanalysis.com/quote/nse/<SYMBOL>/`). Where the site had no usable
  multiple, the table marks the estimate with `*`.
- Manipal and Ardee use their comparable Q1 FY27 profit growth because those
  filings arrived after the RHP. Juniper keeps FY26 PAT growth because its Q1
  update disclosed income growth but no comparable PAT. All other profitable
  names use the lower of FY26 revenue and PAT growth.
- Milky Mist FY26 revenue ₹3,145.01 crore vs ₹2,354.79 crore (+33.55%) and D/E
  3.61 were checked against its restated consolidated financials.
- Tempsens had conflicting secondary-site PAT values (₹67.35 crore vs ₹71.07
  crore). The restated RHP/financial-statement value ₹71.07 crore is used.

## 5. Mandatory disclaimer

This analysis uses public information and a dated, simplified model. Newly listed
stocks are volatile; current prices, earnings and valuation inputs can change
immediately. Targets are scenarios, not promises, and are not broker consensus or
buy/sell calls. Read the company's own filings and consult a SEBI-registered
investment adviser before acting.
