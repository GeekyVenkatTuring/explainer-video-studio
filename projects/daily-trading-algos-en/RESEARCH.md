# Daily Trading Algorithms — research brief (India-focused)

**Research date:** 1 September 2026. **Use:** factual foundation for an educational video, not investment advice. Every market/regulatory number below is tied to a source. Worked examples are deliberately non-numeric and illustrative, not historical claims.

## Executive takeaways

- “Algo trading” is automated order generation/execution from pre-set logic; it includes slow execution tools as well as fast trading. High-frequency trading (HFT) is a subset, not a synonym. [SEBI, 4 Feb 2025](https://www.sebi.gov.in/sebi_data/attachdocs/feb-2025/1738665456458.pdf); [IMF, Oct 2024](https://www.imf.org/-/media/files/publications/gfsr/2024/october/english/ch3.pdf)
- Do not say “most Indian trading is algo” without defining exchange, segment and period. Official NSE figures classify **13.1%** of FY25 cash turnover (through May 2024) as “Algo”; co-location and DMA are separate modes and are not a proxy for algo. [NSE Market Pulse, June 2024](https://nsearchives.nseindia.com/web/sites/default/files/inline-files/MarketPulse_June2024.pdf)
- The retail API framework was issued on 4 February 2025, but the operative glide path makes it applicable to **all stockbrokers from 1 April 2026**. At NSE, the current documented threshold is **10 orders/second per exchange/segment**, with exchange-issued IDs even for below-threshold API algos. [SEBI, 4 Feb 2025](https://www.sebi.gov.in/sebi_data/attachdocs/feb-2025/1738665456458.pdf); [SEBI, 30 Sep 2025](https://www.ncdex.com/public/uploads/circulars/Extension%20of%20timeline%20for%20implementation%20of%20SEBI%20Circular%20dated%20February%2004,%202025%20on%20%E2%80%98Safer%20participation%20of%20retail%20investors%20in%20Algorithmic%20trading%E2%80%99_1759244184.pdf); [NSE, 5 May 2025](https://nsearchives.nseindia.com/content/circulars/INVG67858.pdf)
- Automation removes hesitation; it does not create an edge. SEBI found **93%** of over **one crore** individual equity F&O traders lost money in FY22–FY24, including costs. That study measures individual F&O traders, not “algo users,” so it must not be presented as an algo-profitability rate. [SEBI, 23 Sep 2024](https://www.sebi.gov.in/sebi_data/attachdocs/sep-2024/1727086965496.pdf)

## 1. Meaning, access, speed and market share

### What it means

SEBI describes algo orders as orders generated using automated execution logic, and NSE defines automated trading as software/facility which, after specified parameters are met, automatically generates and sends buy/sell orders to the exchange without manual order entry. It can therefore be as simple as “buy when a rule fires” or as sophisticated as an institutional execution engine. [SEBI, 4 Feb 2025](https://www.sebi.gov.in/sebi_data/attachdocs/feb-2025/1738665456458.pdf); [NSE, updated 27 May 2026](https://www.nseindia.com/static/trade/platform-services-non-neat-decision-support-tools-algorithm-trading)

- **DMA (Direct Market Access):** an institutional-market-access arrangement through which an investor can trade through algorithms via the broker. It is not synonymous with retail broker APIs. SEBI specifically names DMA as an existing institutional mechanism. [SEBI, 4 Feb 2025](https://www.sebi.gov.in/sebi_data/attachdocs/feb-2025/1738665456458.pdf)
- **Co-location / proximity hosting:** placing participant systems at or near exchange infrastructure to reduce network travel time. NSE reports it separately from “Algo”; it is an infrastructure/access mode, not proof that every colocated order is an algo order. [NSE Market Pulse, June 2024](https://nsearchives.nseindia.com/web/sites/default/files/inline-files/MarketPulse_June2024.pdf)
- **Latency:** elapsed time from an event to the action that depends on it. Fast communications and computing reduce it. HFT is an algo subtype rather than the whole category. [CFA Institute, 2026 curriculum](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/trading-costs-and-electronic-markets); [IMF, Oct 2024](https://www.imf.org/-/media/files/publications/gfsr/2024/october/english/ch3.pdf)

### Verified volume facts — use exact labels on screen

| Venue / segment / period | Officially reported mode share | Interpretation |
|---|---:|---|
| NSE capital-market cash, FY24 | Algo **12.8%**; DMA **5.8%**; Colo **34.3%** | Gross turnover; categories presented separately by NSE. |
| NSE capital-market cash, FY25-to-May 2024 | Algo **12.6%**; DMA **6.7%**; Colo **36.2%** | Partial financial year, not a full-year result. |
| NSE capital-market cash, May 2024 | Algo **13.2%**; DMA **7.2%**; Colo **36.3%** | One month only. |
| NSE equity derivatives, FY24 | Algo **1.4%**; DMA **4.6%**; Colo **61.6%** | Notional turnover for futures/options. |
| NSE equity derivatives, May 2024 | Algo **2.4%**; DMA **5.7%**; Colo **61.1%** | Notional turnover; one month only. |

Source for all rows: [NSE Market Pulse, June 2024, tables 98–99](https://nsearchives.nseindia.com/web/sites/default/files/inline-files/MarketPulse_June2024.pdf). NSE explicitly says the cash figures are gross turnover and the derivative figures use notional turnover.

**BSE and India-wide HFT share:** **UNVERIFIED for this report.** BSE has a mode-of-trading report linked by SEBI, but no BSE current figure was independently retrieved and checked here. Do not convert NSE “algo,” DMA, or colo categories into an India-wide or HFT share. [SEBI market-data directory](https://www.sebi.gov.in/curation/equity_cash_market.html)

**Global comparison:** a precise global aggregate was not found in a primary global dataset, so it is **UNVERIFIED**. A safe, scoped comparison is: the IMF reported in October 2024 that algorithmic trading was about **70% of US equities trading** and more than half of US futures trading (its wording is US-specific, not global). [IMF, Oct 2024](https://www.imf.org/-/media/files/publications/gfsr/2024/october/english/ch3.pdf)

## 2. Canonical daily-strategy taxonomy

These are strategy families, not recommendations. A rule needs a data feed, decision rule, position/risk rules and execution logic. The examples below are intentionally symbolic; they are not claims of profit.

| Family | Plain-English mechanism and illustrative rule/example | Data needed; common timeframe | Main failure mode |
|---|---|---|---|
| **Trend / momentum** | Ride a persistent move. Buy when a fast moving average crosses above a slow moving average; exit/reverse when it crosses back. Example: if the short average moves above the long average after the open, the system opens/keeps a long according to its sizing rule. | OHLCV bars; intraday minutes to days. | Whipsaws in a sideways market: repeated false entries/exits and costs. |
| **Mean reversion** | Bet that an abnormal move returns toward its recent average. Buy below a lower Bollinger band / low RSI, or long one stock and short its paired stock when their spread is unusually wide. | OHLCV, volatility/RSI; for pairs, synchronized prices and a tested relationship; minutes to days. | A genuine trend or structural break can make “cheap” become cheaper; pair relationship can break. |
| **Breakout / opening-range breakout (ORB)** | Define the initial range, then trade a break above/below it with an exit/stop rule. Example: after the opening range is fixed, a trade is allowed only if price crosses its upper/lower boundary and risk limits permit it. | Tick/minute OHLCV; typically opening minutes through same-day close. | False breakouts, gap/news reversals, opening-auction noise and spread/slippage. |
| **VWAP / TWAP execution** | Execution, not necessarily a directional alpha strategy. VWAP tries to trade in line with expected/observed volume; TWAP slices a parent order evenly through time. Example: a large buy order is divided into smaller child orders instead of being sent at once. | Live quotes, trades/volume, parent-order size, order-book/liquidity; minutes to a day. | Market impact, bad volume forecast, information leakage, missed fill / opportunity cost. |
| **Market making** | Quote bid and ask, earn spread if both sides trade, continually control inventory. Example: quote both sides around a fair-value estimate; widen/withdraw if inventory/risk limit is reached. | Order book, trades, inventory, volatility and latency; milliseconds to minutes. | Adverse selection: informed flow trades against stale quotes; inventory can become one-sided in a fast move. |
| **Arbitrage** | Buy the relatively cheap equivalent and sell the relatively expensive equivalent, locking a spread only if all costs/constraints are covered. Cash–futures example: buy cash and sell an overpriced futures contract, subject to funding, borrow/settlement and costs. | Synchronized cash/futures/index/component/cross-venue quotes, costs, borrow and margin data; sub-second to days. | Legging, basis/funding/borrow risk, limits, taxes and costs can erase the apparent spread. |
| **News / event / sentiment** | Convert a scheduled result, filing, headline or text signal into a defined trade/risk response. Example: only trade an earnings surprise if the source is authenticated and the order can be sent within the strategy’s risk constraints. | Corporate-action calendar, exchange filings/news, text/sentiment feed, prices; seconds to days. | Late/false/ambiguous news, model misclassification, gaps before a fill, regulatory/insider-information risk. |
| **ML / reinforcement learning (optional)** | ML estimates a score/probability from features; reinforcement learning optimizes actions against a reward objective. It is a technique layered on top of the same data, cost and risk constraints—not a guarantee of an edge. | Historical/live features plus labels/reward and rigorous out-of-sample testing; any timeframe. | Overfitting, data leakage, regime change, non-explainability and model drift. |

Useful conceptual sources: [Zerodha Varsity — moving averages](https://zerodha.com/varsity/chapter/moving-averages/), [technical indicators / RSI / Bollinger bands](https://zerodha.com/varsity/chapter/technical-indicators/), [pair-trading mean reversion](https://zerodha.com/varsity/chapter/the-density-curve/), [VWAP](https://zerodha.com/varsity/chapter/supplementary-notes-1/), [arbitrage](https://zerodha.com/varsity/chapter/synthetic-long-arbitrage/), [CFA Institute — electronic trading and costs](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/trading-costs-and-electronic-markets). **Publication dates:** Varsity webpages do not display a reliable publication date in retrieved material; mark as **undated, accessed 1 Sep 2026**. CFA curriculum is **2026**.

## 3. India regulatory reality — current framework checked against SEBI/NSE

### The hierarchy and timeline

1. **SEBI circular SEBI/HO/MIRSD/MIRSD-PoD/P/CIR/2025/0000013, 4 Feb 2025:** created the retail-algo framework. Its original effective date was 1 Aug 2025. [SEBI circular](https://www.sebi.gov.in/sebi_data/attachdocs/feb-2025/1738665456458.pdf)
2. **NSE/INVG/67858, 5 May 2025:** issued the implementation standards, including static IP, TOPS and tagging detail. [NSE circular](https://nsearchives.nseindia.com/content/circulars/INVG67858.pdf)
3. **SEBI/HO/MIRSD/MIRSD-PoD/P/CIR/2025/132, 30 Sep 2025:** documents the implementation glide path; brokers ready could go live 1 Oct 2025; **from 1 Apr 2026 the framework, standards and exchange modalities apply to all stockbrokers.** [SEBI circular reproduced by NCDEX](https://www.ncdex.com/public/uploads/circulars/Extension%20of%20timeline%20for%20implementation%20of%20SEBI%20Circular%20dated%20February%2004,%202025%20on%20%E2%80%98Safer%20participation%20of%20retail%20investors%20in%20Algorithmic%20trading%E2%80%99_1759244184.pdf)
4. NSE’s retail-algo page was updated 27 May 2026 and points Client Direct API users to consolidated circular **NSE/INVG/73992 dated 30 Apr 2026**. [NSE](https://www.nseindia.com/static/trade/platform-services-non-neat-decision-support-tools-algorithm-trading)

### Exact rules worth using in narration/on screen

- **Broker is principal; provider is agent.** SEBI: for API algo trading, brokers “shall be the principal” and the algo provider/vendor “shall act as its agent.” Brokers must use empanelled providers and handle related complaints. [SEBI, 4 Feb 2025](https://www.sebi.gov.in/sebi_data/attachdocs/feb-2025/1738665456458.pdf)
- **Threshold:** NSE’s implementation standard sets TOPS initially at **not exceeding 10 OPS**. Below **10 OPS per exchange**, a client need not register its algo; the broker-server calendar second is the measurement basis. Above **10 OPS**, the client must register its algorithm with each exchange where it will be used. The same NSE document also expresses the limit as **10 OPS per exchange/segment**; use that fuller wording on screen. The exchange may adjust it after notice. [NSE, 5 May 2025](https://nsearchives.nseindia.com/content/circulars/INVG67858.pdf)
- **IDs and audit trail:** all algo orders—below and above threshold—must be tagged with an exchange-provided unique identifier. Below-threshold API algos receive a **generic algo ID**; registered algos receive exchange registration IDs. [NSE, 5 May 2025](https://nsearchives.nseindia.com/content/circulars/INVG67858.pdf)
- **Static IP and authentication:** broker APIs cannot be open. Access must use a unique vendor/client-specific API key plus broker-whitelisted static IP; OAuth authentication and two-factor authentication are required. NSE permits one primary static IP and an optional secondary for redundancy; mapping changes no more than once per calendar week (exception process exists); API sessions must log out daily before the next trading day. [SEBI, 4 Feb 2025](https://www.sebi.gov.in/sebi_data/attachdocs/feb-2025/1738665456458.pdf); [NSE, 5 May 2025](https://nsearchives.nseindia.com/content/circulars/INVG67858.pdf)
- **Broker responsibility / controls:** brokers must detect/categorize orders over threshold, monitor API activity, maintain RMS controls, and are fully responsible and liable for orders from their API systems. Audit-trail data must be available for **at least five years**. Exchanges retain a kill switch for a particular algo ID. [SEBI, 4 Feb 2025](https://www.sebi.gov.in/sebi_data/attachdocs/feb-2025/1738665456458.pdf); [NSE, 5 May 2025](https://nsearchives.nseindia.com/content/circulars/INVG67858.pdf)
- **White-box vs black-box:** white-box/execution algos have disclosed, replicable logic. Black-box logic is unknown to the user/not replicable; the provider must register as a **Research Analyst**, maintain a detailed research report for each algo, and treat a logic change as a fresh algo. [SEBI, 4 Feb 2025](https://www.sebi.gov.in/sebi_data/attachdocs/feb-2025/1738665456458.pdf)
- **No “guaranteed returns” marketing:** the legal rule is more precise than that shorthand. Stockbrokers providing algo services must not directly/indirectly refer to past or expected future return/performance of an algorithm, or associate with a platform that does. In April 2025 SEBI added a narrow exception for risk-return metrics verified by PaRRVA in the SEBI-specified manner. So: do **not** say “all performance discussion is banned”; do say **“no unverified promised, expected or past-return marketing by brokers/algo platforms.”** [SEBI circular 2022/117, 2 Sep 2022](https://www.sebi.gov.in/sebi_data/attachdocs/sep-2022/1662126014448.pdf); [SEBI circular, 2025](https://www.sebi.gov.in/sebi_data/attachdocs/apr-2025/1743761581547.pdf)

## 4. A real daily algo: infrastructure and operations

`Market data / filings → data validation → signal → portfolio & pre-trade risk checks → OMS/RMS → broker API/order routing → exchange matching → fills/reconciliation → real-time monitoring / kill switch → end-of-day review.`

- **Data:** live quote/trade/order-book data; corporate actions and instrument metadata; strategy-specific inputs (calendar/news/text). Validate timestamps, stale feeds, splits/rolls, missing values and market status before calculating a signal.
- **Signal and sizing:** turn the tested rule into a desired position, then cap it by cash/margin, instrument/sector exposure, max order size, price bands and daily loss limits. These controls are part of the system, not an afterthought.
- **Routing/execution:** OMS turns desired trades into child orders; RMS blocks orders outside limits; broker API sends authenticated, tagged orders. For a retail API workflow, the current SEBI/NSE requirements above determine the identity, IP, tagging and audit trail.
- **Monitoring:** dashboards should compare intended position/orders with exchange acknowledgements and fills; detect stale feed, rejected order, duplicate order, latency spike, unexpected exposure and daily loss. Exchange-level kill capability is explicitly contemplated by SEBI. [SEBI, 4 Feb 2025](https://www.sebi.gov.in/sebi_data/attachdocs/feb-2025/1738665456458.pdf)

### Backtest versus live

A backtest replays historical data under stated assumptions. Live trading faces current spreads, queue position, partial fills, feed/API outages, price impact and changing regimes. Good testing uses train/validation/test separation, avoids look-ahead and survivorship bias, models costs and compares live execution with backtest assumptions. [Zerodha — trend-following validation and costs, undated/accessed 1 Sep 2026](https://zerodha.com/z-connect/varsity/could-trend-following-be-a-successful-trading-strategy-part-i); [CFA Institute, 2026](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/trading-costs-and-electronic-markets); [CFA Institute — AI bias, undated/accessed 1 Sep 2026](https://www.cfainstitute.org/insights/articles/good-bad-and-ugly-of-bias-in-ai)

**Costs/slippage:** explicit costs include brokerage, taxes, stamp duties and exchange fees; implicit costs include bid–ask spread, market impact, delay and unfilled orders. Slippage is not a discretionary “small adjustment”—it can decide whether a high-turnover strategy survives. [CFA Institute, 2026](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/trading-costs-and-electronic-markets)

### Current India cost facts (verify again before production)

As of 1 April 2026, NSE lists STT of **0.05%** on sale of securities futures, **0.15%** on sale of options (on premium), and **0.15%** on exercised options (on intrinsic value). NSE notes the derivatives changes came from Finance Act 2026. [NSE, updated 1 Apr 2026](https://www.nseindia.com/static/products-services/equity-derivatives-securities-transaction-tax)

Brokerage is broker-specific, not an NSE rate. A current retail example: Zerodha lists futures brokerage as **0.03% or ₹20 per executed order, whichever is lower**, options as **₹20 per executed order**, and its displayed NSE transaction charges as **0.00183%** for equity futures and **0.03553% of premium** for equity options; it also lists GST at **18%** on brokerage + SEBI charges + transaction charges. Do not imply those brokerage rates apply to all brokers. [Zerodha charges, accessed 1 Sep 2026](https://zerodha.com/charges/)

## 5. Honest reality check

### What the evidence says

- SEBI’s 23 September 2024 update: **93%** of over **one crore** individual equity F&O traders lost money over FY22–FY24; aggregate losses exceeded **₹1.8 lakh crore**; the average loss was about **₹2 lakh** per losing individual, inclusive of transaction costs. **Only 1%** made profits over **₹1 lakh** after costs. [SEBI](https://www.sebi.gov.in/sebi_data/attachdocs/sep-2024/1727086965496.pdf)
- In FY24, individual traders spent **₹26,000 per person on average** in F&O transaction costs; individuals collectively spent about **₹50,000 crore** on transaction costs across FY22–FY24. SEBI also reported that **97%** of FPI profits and **96%** of proprietary-trader profits in FY24 came from algorithmic trading. These are descriptive findings by participant class, not proof that any retail strategy should be copied. [SEBI](https://www.sebi.gov.in/sebi_data/attachdocs/sep-2024/1727086965496.pdf)
- **Retail algo profitability statistic:** **UNVERIFIED.** No official study retrieved here isolates the profitability of Indian retail API/algo users. The SEBI F&O-loss study should be used only for the population it studied.

### Recurring failure modes / myths

- **Myth: “Automated = profitable.”** Reality: it repeats the rule faster and more consistently; a bad rule, bad data or an ignored cost is automated too.
- **Myth: “Backtest return = live return.”** Reality: price assumptions, LTP-versus-executable quote, spreads, slippage, fees, fills and regime changes can break the translation. [Zerodha — LTP/backtest pitfall, undated/accessed 1 Sep 2026](https://zerodha.com/z-connect/varsity/perils-of-using-the-last-traded-price-ltp)
- **Myth: “HFT is what a retail API bot does.”** Reality: HFT is a special latency-sensitive subset; retail API systems must also operate within broker/exchange identity and rate controls.
- **Myth: “An algo provider can promise a return.”** Reality: the applicable broker restriction covers references to past/expected algorithm returns except for the specified verified-metric route; SEBI’s enforcement history is a reason to treat guaranteed-return claims as a red flag. [SEBI, 2 Sep 2022](https://www.sebi.gov.in/sebi_data/attachdocs/sep-2022/1662126014448.pdf)
- **Failure modes to portray:** overfitting/data leakage; regime change; costs; adverse selection; stale/incorrect data; outage/API rejection; duplicate/runaway orders; excess leverage; illiquidity and gap risk; model drift; and human failure to monitor/disable the system. [CFA Institute, 2026](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/trading-costs-and-electronic-markets)

## 6. Glossary

- **Algorithmic trading:** automated generation/execution of orders using programmed logic.
- **API:** software interface used by applications to exchange data/instructions.
- **DMA:** institutional direct market access through a broker.
- **Co-location:** hosting systems near exchange infrastructure to reduce network delay.
- **Latency:** time from an event to the dependent action.
- **HFT:** latency-sensitive high-frequency subset of algo trading.
- **OMS / RMS:** order-management system / risk-management system.
- **TOPS / OPS:** threshold orders per second / orders per second.
- **Algo ID:** exchange-provided identifier that tags algo orders for an audit trail.
- **White box / black box:** respectively disclosed-replicable / undisclosed-nonreplicable algo logic.
- **VWAP / TWAP:** volume-weighted / time-weighted average price execution benchmark.
- **Slippage:** difference between assumed/decision price and executable fill, including delay/impact effects.
- **Market impact:** a trade’s own pressure moves the price.
- **Spread:** difference between best bid and best ask.
- **Overfitting:** fitting historical noise so well that the model fails on new data.

## 7. Screen-safe numeric facts (all scope-labelled)

1. **10 OPS** — initial NSE retail API algo threshold, per exchange/segment; can change after notice. [NSE, 5 May 2025](https://nsearchives.nseindia.com/content/circulars/INVG67858.pdf)
2. **1 April 2026** — framework applicability date for all stockbrokers under the SEBI glide path. [SEBI, 30 Sep 2025](https://www.ncdex.com/public/uploads/circulars/Extension%20of%20timeline%20for%20implementation%20of%20SEBI%20Circular%20dated%20February%2004,%202025%20on%20%E2%80%98Safer%20participation%20of%20retail%20investors%20in%20Algorithmic%20trading%E2%80%99_1759244184.pdf)
3. **5 years** — NSE-required availability of IBT/STWT/API audit-trail data. [NSE, 5 May 2025](https://nsearchives.nseindia.com/content/circulars/INVG67858.pdf)
4. **13.2%** — NSE cash-market algo share in May 2024, gross turnover. [NSE Market Pulse, June 2024](https://nsearchives.nseindia.com/web/sites/default/files/inline-files/MarketPulse_June2024.pdf)
5. **36.3%** — NSE cash-market colo share in May 2024, gross turnover; not an algo/HFT share. [NSE Market Pulse, June 2024](https://nsearchives.nseindia.com/web/sites/default/files/inline-files/MarketPulse_June2024.pdf)
6. **70%** — IMF’s approximate US-equities algo share (October 2024); label US, not global or India. [IMF](https://www.imf.org/-/media/files/publications/gfsr/2024/october/english/ch3.pdf)
7. **93%** — individual equity F&O traders who lost money in SEBI’s FY22–FY24 study. [SEBI, 23 Sep 2024](https://www.sebi.gov.in/sebi_data/attachdocs/sep-2024/1727086965496.pdf)
8. **₹1.8 lakh crore** — aggregate individual F&O losses in that three-year study. [SEBI, 23 Sep 2024](https://www.sebi.gov.in/sebi_data/attachdocs/sep-2024/1727086965496.pdf)
9. **0.05%** — current sell-side STT on securities futures from 1 April 2026. [NSE, updated 1 Apr 2026](https://www.nseindia.com/static/products-services/equity-derivatives-securities-transaction-tax)
10. **0.15%** — current option-sale STT on premium from 1 April 2026. [NSE, updated 1 Apr 2026](https://www.nseindia.com/static/products-services/equity-derivatives-securities-transaction-tax)

## Production cautions

- Recheck all regulatory pages and all tax/charge rates on the day the video is locked; rules and broker pricing change.
- Never depict illustrative strategy rules as a recommendation, a backtest as proof, or generic algo participation as HFT share.
- Insert: “Educational information from public sources, not investment advice. Consult a SEBI-registered adviser.”
- For any future India-wide/BSE/HFT volume claim or retail-algo ROI statistic, keep the label **UNVERIFIED** unless a primary source and date are added.
