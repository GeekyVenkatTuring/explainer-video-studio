# Props/numbers per research/*.md — Claude owns narration + number accuracy.
# 01_razorpay is the WORKED TEMPLATE (real props + real narration). Codex fills the
# remaining gateway chapters by copying this structure and pulling props from
# research/<gateway>.md; Claude then validates every number + polishes narration.
# Narration uses [pause] between sentences (build.py splits on it).

BLUE = "#3B82F6"


def _title_narr(gateway, tagline, lead):
    opener = lead if lead else f"Let's look at {gateway} from a developer's point of view."
    return (f"{opener} [pause] {tagline}. [pause] We'll walk its docs and KYC, its support channels, "
            f"settlement, success and effort, exact pricing for every payment method, and a real integration call — "
            f"everything you want before you commit.")


def _docs_narr(d):
    sb = ("you get test-mode keys the moment you sign up, before any paperwork clears"
          if d.get("sandbox") else "test access isn't publicly documented")
    kyc = d["kyc"]
    kyc_str = ", ".join(kyc[:3]) + (", and more" if len(kyc) > 3 else "")
    return (f"Everything starts at {d['docsUrl']}. [pause] For access, {sb}. "
            f"[pause] To go live you complete KYC — {kyc_str} — and it's worth confirming the exact list in the live dashboard. "
            f"[pause] The methods you can accept: {', '.join(d['methods'])}.")


def _support_narr(channels):
    live = [c for c in channels if c.get("live")]
    phone = next((c for c in channels if "phone" in c["label"].lower()), None)
    live_labels = ", ".join(c["label"].lower() for c in live) or "the dashboard and docs"
    if phone and phone.get("live"):
        tail = f"And unlike most peers here, a business line is actually published: {phone['value']}."
    else:
        tail = "There's no published phone number — this is a dashboard, ticket and docs-first setup."
    return (f"Now support, shown honestly as published routes, not promised service levels. "
            f"[pause] Your live channels are {live_labels}. [pause] {tail} "
            f"[pause] A grey item means the provider simply doesn't publish that route.")


def _metrics_narr(m):
    return (f"Three operational checks. [pause] On settlement — {m['settleNote']}. "
            f"[pause] On success rate — {m['successNote']}; we won't quote a made-up percentage. "
            f"[pause] And integration effort is {m['complexityLabel']} — {m['complexityWhy']}.")


def _pricing_narr(gateway, rows, foot):
    hi = "; ".join(f"{r['label'].lower()} at {r['rate']}" for r in rows[:3])
    return (f"Now pricing — the part you actually budget for. [pause] {gateway} lists {hi}. "
            f"[pause] Where a row says custom, varies, or contact sales, keep it exactly that vague in your model — "
            f"don't invent a precise number. [pause] {foot}.")


def _flow_narr(steps):
    chain = " → ".join(s["label"] for s in steps)
    return (f"The integration runs: {chain}. [pause] Create the intent on your server, hand the client only what "
            f"checkout needs, then confirm status and signatures server-side before you fulfil. "
            f"[pause] A browser redirect is never proof of payment.")


def _code_narr(c):
    return (f"Here's the representative call — {c['file']}. [pause] {c['caption']} "
            f"[pause] Treat it as a shape, not copy-and-forget code: read the current reference at {c['docUrl']}, "
            f"keep your secrets in server-side config, and validate the final callback or webhook.")


def _recap_narr(gateway, items, closer):
    return f"So, {gateway} in one breath. [pause] " + " [pause] ".join(items) + f". [pause] {closer}"


def gateway_chapter(data):
    """Common eight-scene gateway chapter with data-driven, per-gateway narration."""
    a = data["accent"]
    gateway = data["gateway"]
    lead = data.get("lead", "")
    return {
        "id": data["id"], "title": data["title"], "accent": a,
        "segments": [
            ("title", "pg_title", {"gateway": gateway, "tagline": data["tagline"], "accent": a,
                                   "kicker": "PAYMENT GATEWAYS · DEVELOPER GUIDE"},
             _title_narr(gateway, data["tagline"], lead)),
            ("docs", "pg_docs", {"gateway": gateway, "accent": a, **data["docs"]},
             _docs_narr(data["docs"])),
            ("support", "pg_support", {"gateway": gateway, "accent": a, "channels": data["support"]},
             _support_narr(data["support"])),
            ("metrics", "pg_metrics", {"gateway": gateway, "accent": a, **data["metrics"]},
             _metrics_narr(data["metrics"])),
            ("pricing", "pg_pricing", {"gateway": gateway, "accent": a, "rows": data["pricing"], "foot": data["foot"]},
             _pricing_narr(gateway, data["pricing"], data["foot"])),
            ("flow", "pg_flow", {"gateway": gateway, "accent": a, "steps": data["flow"]},
             _flow_narr(data["flow"])),
            ("code", "pg_code", {"gateway": gateway, "accent": a, **data["code"]},
             _code_narr(data["code"])),
            ("recap", "pg_recap", {"title": f"{gateway} in one breath", "items": data["recap"], "closer": data["closer"]},
             _recap_narr(gateway, data["recap"], data["closer"])),
        ],
    }

CHAPTERS = [
    {"id": "00_intro", "title": "Payment Gateways for Developers", "accent": "#22C55E", "segments": [
        ("title", "pg_title", {"gateway": "Payment Gateways", "tagline": "For developers — docs, support, metrics, pricing & a real integration, across 8 India gateways", "kicker": "DEVELOPER GUIDE · 8 GATEWAYS", "accent": "#22C55E"},
         "This is a practical guide to eight Indian payment options, through the eyes of the developer who must ship and support the checkout. [pause] We will look at documentation, KYC, support, settlement, published pricing, and the integration shape behind every screen. [pause] The goal is not to crown one universal winner. [pause] It is to give you an honest map, so the gateway you choose matches your payment mix, your team, and your scale."),
        ("flow", "pg_flow", {"gateway": "How a gateway works", "accent": "#22C55E", "steps": [{"emoji": "🛒", "label": "Checkout", "sub": "customer pays on your site"}, {"emoji": "🔐", "label": "Gateway", "sub": "tokenizes + routes"}, {"emoji": "🏦", "label": "Bank / network", "sub": "authorizes"}, {"emoji": "✅", "label": "Verify", "sub": "your server confirms"}, {"emoji": "💸", "label": "Settlement", "sub": "money to your bank, T+n"}]},
         "Every payment gateway follows the same broad model. [pause] Your customer checks out, the gateway tokenizes and routes the request, and the bank or network decides whether to authorize it. [pause] Then comes the step developers cannot skip: your server verifies the final state. [pause] A browser redirect is not proof of payment. [pause] Confirm the status and signature or webhook on your server, then fulfil. [pause] Finally, funds settle to your bank on the provider's stated cycle."),
        ("divider", "pg_div", {"n": 1, "title": "5 things we check", "sub": "Docs · Support · Metrics · Pricing · Integration", "color": "#22C55E"},
         "We will use five lenses for every provider. [pause] First, docs and access: can you test early, and what is required to go live? [pause] Second, support: who can you reach when checkout breaks? [pause] Third, operational metrics: settlement and implementation effort. [pause] Fourth, pricing, with unknown rates left visibly unknown. [pause] And fifth, the actual integration flow and server-side code shape. [pause] Those five questions matter more than a brand name."),
        ("disclaimer", "pg_disclaimer", {"asOf": "August 2026", "points": ["Published rates and promos can change", "Negotiated enterprise slabs vary", "Verify KYC and settlement in your dashboard", "Always verify payments server-side"]},
         "One honesty note before we begin. [pause] These are published figures and documented flows as of August twenty twenty-six, not a commercial quote. [pause] Promotions expire, enterprise slabs are negotiated, and KYC or settlement eligibility can change by merchant category. [pause] Where a provider does not publish a figure, we say so. [pause] Before production, confirm current terms in your dashboard and on the official site. [pause] And whatever gateway you choose, verify payments on your server."),
    ]},
    {
        "id": "01_razorpay",
        "title": "Razorpay",
        "accent": BLUE,
        "segments": [
            ("title", "pg_title", {
                "gateway": "Razorpay", "accent": BLUE,
                "kicker": "PAYMENT GATEWAYS · DEVELOPER GUIDE",
                "tagline": "Docs, pricing, support & a real integration — end to end",
            },
             "Let's start with Razorpay — for a lot of Indian developers, this is the default first choice. "
             "[pause] Over the next few minutes we'll walk through its documentation and KYC, its support channels, "
             "settlement and success behaviour, exact pricing for every payment method, and a real integration call — "
             "everything you want to know before you commit."),

            ("docs", "pg_docs", {
                "gateway": "Razorpay", "accent": BLUE, "url": "razorpay.com/docs",
                "docsUrl": "razorpay.com/docs", "signupUrl": "dashboard.razorpay.com/signup",
                "sandbox": True,
                "kyc": ["Business PAN + signatory PAN", "Bank proof (cancelled cheque)",
                        "GST / incorporation proof", "Live site with policies"],
                "methods": ["Cards", "UPI", "Net banking", "Wallets", "EMI"],
            },
             "Everything starts at razorpay dot com slash docs — one of the cleanest developer references in Indian fintech. "
             "[pause] You sign up and get test-mode API keys instantly, before any paperwork clears. "
             "[pause] To go live you complete KYC: your business and signatory PAN, a bank proof like a cancelled cheque, "
             "a GST or incorporation document, and a live site carrying your privacy, refund and terms pages. "
             "[pause] Cards, UPI, net banking, wallets and EMI all work out of the box."),

            ("support", "pg_support", {
                "gateway": "Razorpay", "accent": BLUE,
                "channels": [
                    {"icon": "📞", "label": "Phone", "value": "not published", "live": False},
                    {"icon": "✉️", "label": "Email / ticket", "value": "razorpay.com/support", "live": True},
                    {"icon": "💬", "label": "Dashboard chat", "value": "in-dashboard", "live": True},
                    {"icon": "📚", "label": "Docs", "value": "razorpay.com/docs", "live": True},
                ],
            },
             "Now, support — and here's the honest picture. "
             "[pause] Razorpay does not publish a phone number. "
             "[pause] You reach them through the dashboard: email tickets and in-dashboard chat, backed by that strong documentation. "
             "[pause] For most integration questions the docs answer you faster than any hotline would — but if a printed "
             "support line matters to your business, factor this in."),

            ("metrics", "pg_metrics", {
                "gateway": "Razorpay", "accent": BLUE, "settleDay": 1,
                "settleNote": "standard cycle", "instant": True,
                "successNote": "No official figure published",
                "complexity": 1, "complexityLabel": "Easy",
                "complexityWhy": "Hosted checkout + SDKs + plugins",
            },
             "Three things every developer should check. "
             "[pause] Settlement lands on a T-plus-one cycle by default, with instant settlement available as a paid add-on — "
             "so your money reaches your bank the next working day. "
             "[pause] On success rate, we won't quote a number: Razorpay markets smart routing to lift acceptance, "
             "but it doesn't publish a fixed percentage, and neither will we. "
             "[pause] And effort? This is the easy end of the scale — hosted checkout, official SDKs in every major language, "
             "and drop-in plugins for Shopify and WooCommerce."),

            ("pricing", "pg_pricing", {
                "gateway": "Razorpay", "accent": BLUE,
                "rows": [
                    {"icon": "💳", "label": "Credit / debit cards", "rate": "2%", "feePct": 2.0},
                    {"icon": "🟣", "label": "UPI", "rate": "2%", "feePct": 2.0, "note": "MDR 0 + platform fee"},
                    {"icon": "🏦", "label": "Net banking", "rate": "2%", "feePct": 2.0},
                    {"icon": "👛", "label": "Wallets", "rate": "2%", "feePct": 2.0},
                    {"icon": "🌐", "label": "International cards", "rate": "up to 3%", "feePct": 3.0},
                ],
                "foot": "Setup ₹0 · AMC ₹0 · GST 18% on the platform fee · corporate cards 2.15%",
            },
             "Now the part you actually care about — what each payment costs. "
             "[pause] Razorpay runs a flat two percent platform fee across domestic cards, UPI, net banking and wallets. "
             "[pause] UPI's own MDR is zero, but the two percent platform fee still applies. "
             "[pause] International cards go up to three percent. "
             "[pause] There's no setup fee and no annual maintenance charge — you only add eighteen percent GST on the fee itself. "
             "So on a one-thousand-rupee payment, the fee is about twenty rupees, and you keep the rest."),

            ("flow", "pg_flow", {
                "gateway": "Razorpay", "accent": BLUE,
                "steps": [
                    {"emoji": "🧾", "label": "Create order", "sub": "server · Orders API"},
                    {"emoji": "🛒", "label": "Checkout", "sub": "client · order_id"},
                    {"emoji": "💳", "label": "Customer pays", "sub": "card / UPI / …"},
                    {"emoji": "🔔", "label": "Webhook + verify", "sub": "signature check"},
                    {"emoji": "🏦", "label": "Settlement", "sub": "T+1 to your bank"},
                ],
            },
             "Here's the integration in five steps. "
             "[pause] Your server creates an order through the Orders API. "
             "[pause] The client opens Checkout with that order id. "
             "[pause] The customer pays — by card, UPI, or whatever they prefer. "
             "[pause] Razorpay fires a webhook and hands back a signature your server must verify. "
             "[pause] And then the money settles to your bank. "
             "[pause] The golden rule: never trust the browser — always verify the payment on your server before you fulfil the order."),

            ("code", "pg_code", {
                "gateway": "Razorpay", "accent": BLUE, "lang": "node", "file": "create-order.js",
                "docUrl": "razorpay.com/docs/api/orders",
                "lines": [
                    "const rzp = new Razorpay({ key_id, key_secret });",
                    "const order = await rzp.orders.create({",
                    "  amount: 50000,      // paise = ₹500.00",
                    "  currency: \"INR\",",
                    "  receipt: \"rcpt_11\",",
                    "});",
                    "// send order.id to the client to open Checkout",
                ],
                "caption": "Server creates the order; the client only ever sees an order_id.",
            },
             "And here's what that first step actually looks like. "
             "[pause] On your server, you create an order with the amount in paise — fifty thousand paise is five hundred rupees — "
             "the currency, and a receipt id. "
             "[pause] You send only that order id to the client. "
             "[pause] After payment, you verify the signature — an HMAC of the order and payment ids using your key secret — "
             "before you trust anything. "
             "[pause] That's the whole trust model, in a few lines."),

            ("recap", "pg_recap", {
                "title": "Razorpay in one breath",
                "items": [
                    "Cleanest docs · instant test keys",
                    "Flat 2% · ₹0 setup · no AMC",
                    "T+1 settlement · instant add-on",
                    "Dashboard support · no phone line",
                    "Order → Checkout → verify → webhook",
                ],
                "closer": "The fastest path from zero to a live payment in India.",
            },
             "So, Razorpay in one breath: "
             "[pause] the cleanest docs and instant test keys, "
             "[pause] a flat two percent with zero setup and no annual charge, "
             "[pause] T-plus-one settlement, "
             "[pause] dashboard-based support with no phone line, "
             "[pause] and a simple order, checkout, verify, webhook flow. "
             "[pause] If you want the fastest path from zero to a live payment in India, this is usually it."),
        ],
    },
    gateway_chapter({
        "id": "02_cashfree", "title": "Cashfree Payments", "gateway": "Cashfree", "accent": "#14B8A6", "tagline": "Fast settlements, deep APIs — cards to payouts",
        "docs": {"url": "cashfree.com", "docsUrl": "cashfree.com/docs", "signupUrl": "merchant.cashfree.com", "sandbox": True, "kyc": ["Business & signatory PAN", "Bank proof", "Business-registration / GST", "Address proof", "Website/app with policies"], "methods": ["Cards", "UPI", "Net banking", "Wallets", "Payouts"]},
        "support": [{"icon": "☎", "label": "Phone", "value": "not published", "live": False}, {"icon": "✉️", "label": "Email / ticket", "value": "cashfree.com/docs/help", "live": True}, {"icon": "💬", "label": "Dashboard tickets", "value": "merchant dashboard", "live": True}, {"icon": "📚", "label": "Docs", "value": "cashfree.com/docs", "live": True}],
        "metrics": {"settleDay": 1, "settleNote": "standard cycle", "instant": True, "successNote": "No official figure published", "complexity": 2, "complexityLabel": "Easy–Medium", "complexityWhy": "Drop-in + SDKs + plugins"},
        "pricing": [{"icon": "💳", "label": "Cards", "rate": "1.95%", "feePct": 1.95}, {"icon": "🟣", "label": "UPI", "rate": "1.95%", "feePct": 1.95}, {"icon": "🏦", "label": "Net banking", "rate": "1.95%", "feePct": 1.95}, {"icon": "👛", "label": "Wallets", "rate": "1.95%", "feePct": 1.95}, {"icon": "🌐", "label": "International cards", "rate": "2.99%", "feePct": 2.99}],
        "foot": "Setup ₹0 · AMC ₹0 · GST on platform fee · 0% promo for new merchants till Mar 2027 (≤₹20L/mo)",
        "flow": [{"emoji": "🧾", "label": "Create order", "sub": "server · POST /pg/orders"}, {"emoji": "🛒", "label": "Open Drop-in", "sub": "client · payment_session_id"}, {"emoji": "💳", "label": "Customer pays", "sub": "chosen method"}, {"emoji": "🔔", "label": "Verify + webhook", "sub": "GET order status"}, {"emoji": "🏦", "label": "Settlement", "sub": "T+1 / instant"}],
        "code": {"lang": "node", "file": "create-order.js", "lines": ["const res = await fetch(\"https://api.cashfree.com/pg/orders\", {", "  method: \"POST\",", "  headers: { \"x-client-id\": ID, \"x-client-secret\": SECRET },", "  body: JSON.stringify({ order_amount: 500, order_currency: \"INR\" }),", "});", "const { payment_session_id } = await res.json();"], "docUrl": "cashfree.com/docs", "caption": "Create the order server-side; hand payment_session_id to Cashfree.js."},
        "recap": ["T+1 standard · instant available", "1.95% domestic · 2.99% international", "₹0 setup and AMC", "Drop-in, SDKs, plugins, plus payouts", "Dashboard/ticket support · no public phone"], "closer": "A strong fit when payments and payouts both need deep APIs.",
    }),
    gateway_chapter({
        "id": "03_payu", "title": "PayU India", "gateway": "PayU", "accent": "#8B5CF6", "tagline": "Broad methods, hosted checkout — the enterprise workhorse",
        "docs": {"url": "payu.in", "docsUrl": "docs.payu.in", "signupUrl": "payu.in/business/payment-gateway", "sandbox": True, "kyc": ["Business & signatory PAN", "Bank proof", "Business-registration / GST", "Address proof", "Website/app with policies"], "methods": ["Cards", "UPI", "Netbanking", "Wallets", "EMI", "BNPL"]},
        "support": [{"icon": "☎", "label": "Phone", "value": "not published", "live": False}, {"icon": "📚", "label": "Docs", "value": "docs.payu.in", "live": True}, {"icon": "💬", "label": "Dashboard", "value": "integration help", "live": True}],
        "metrics": {"settleDay": 2, "settleNote": "standard cycle (same-day/priority available)", "instant": True, "successNote": "No official figure published", "complexity": 3, "complexityLabel": "Medium", "complexityWhy": "Request hash (SHA-512) adds a step"},
        "pricing": [{"icon": "💳", "label": "Cards", "rate": "2%", "feePct": 2.0}, {"icon": "🏦", "label": "Net banking", "rate": "2%", "feePct": 2.0}, {"icon": "👛", "label": "Wallets", "rate": "2%", "feePct": 2.0}, {"icon": "🛍️", "label": "BNPL", "rate": "2%", "feePct": 2.0}, {"icon": "🟣", "label": "UPI", "rate": "varies by category", "note": "merchant UPI is category-specific"}, {"icon": "💳", "label": "Diners / Amex", "rate": "3%", "feePct": 3.0}, {"icon": "📆", "label": "EMI", "rate": "3%", "feePct": 3.0}, {"icon": "🌐", "label": "International cards", "rate": "3%", "feePct": 3.0}],
        "foot": "No setup/onboarding/annual fees · GST 18%",
        "flow": [{"emoji": "🔐", "label": "Build hash", "sub": "server · SHA-512"}, {"emoji": "🧾", "label": "Post payment", "sub": "server → PayU"}, {"emoji": "🛒", "label": "Hosted checkout", "sub": "customer pays"}, {"emoji": "🔔", "label": "Verify response", "sub": "hash + webhook"}, {"emoji": "🏦", "label": "Settlement", "sub": "T+2 / priority"}],
        "code": {"lang": "node", "file": "create-order.js", "lines": ["const crypto = require(\"crypto\");", "const str = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;", "const hash = crypto.createHash(\"sha512\").update(str).digest(\"hex\");", "// POST payment params and hash to PayU", "// Verify the response hash on the server."], "docUrl": "docs.payu.in", "caption": "The request hash is part of the server-side trust boundary."},
        "recap": ["Broad cards, UPI, wallets, EMI and BNPL", "Domestic published rates 2%; UPI varies", "T+2 standard · priority available", "SHA-512 request and response verification", "Dashboard + docs · no public phone"], "closer": "A broad enterprise stack when you are comfortable owning the hash step.",
    }),
    gateway_chapter({
        "id": "04_juspay", "title": "Juspay", "gateway": "Juspay", "accent": "#F59E0B", "tagline": "Not a gateway — the orchestration layer above them",
        "lead": "Juspay routes across more than three hundred payment aggregators, gateways, and methods; it is not a payment aggregator or gateway itself.",
        "docs": {"url": "juspay.io/in", "docsUrl": "juspay.io/in/docs", "signupUrl": "juspay.io (enterprise)", "sandbox": True, "kyc": ["Enterprise onboarding (contract-based)"], "methods": ["300+ PSPs / methods"]},
        "support": [{"icon": "☎", "label": "Phone", "value": "not published", "live": False}, {"icon": "🤝", "label": "Solutions / integration team", "value": "enterprise team", "live": True}, {"icon": "📚", "label": "Docs", "value": "juspay.io/in/docs", "live": True}],
        "metrics": {"settleDay": 0, "settleNote": "settles via the routed PA/PG", "instant": False, "settleUnknown": True, "successNote": "Juspay's claim: routing lifts acceptance & cuts cost up to ~30% (their figure)", "complexity": 3, "complexityLabel": "Enterprise", "complexityWhy": "One integration fronts 300+ PSPs"},
        "pricing": [{"icon": "🔀", "label": "Orchestration fee", "rate": "custom", "note": "per contract"}, {"icon": "💳", "label": "Underlying MDR", "rate": "your PG's rate"}, {"icon": "🛠️", "label": "Hyperswitch (OSS)", "rate": "self-host"}],
        "foot": "Custom enterprise pricing — a cost layer ON TOP of your PG(s), not a per-instrument MDR",
        "flow": [{"emoji": "📱", "label": "Init HyperSDK", "sub": "client"}, {"emoji": "🧾", "label": "Create order", "sub": "server · /orders"}, {"emoji": "🛒", "label": "Unified checkout", "sub": "one experience"}, {"emoji": "🔀", "label": "Route", "sub": "best PA / PG"}, {"emoji": "🔔", "label": "Callback + settlement", "sub": "via that PG"}],
        "code": {"lang": "bash", "file": "create-order.sh", "lines": ["curl https://api.juspay.in/orders", "  -u \"<API_KEY>:\"", "  -d order_id=\"o11\" -d amount=500 -d currency=INR", "  -d customer_id=\"c1\"", "  -d return_url=\"https://site/return\"", "# initialise HyperSDK with the returned order token"], "docUrl": "juspay.io/in/docs", "caption": "Juspay creates an orchestration order; the routed PG still settles funds."},
        "recap": ["Not a PA/PG: it orchestrates many", "One integration can front 300+ PSPs", "Settlement and MDR remain with routed PG", "Custom fee sits above underlying MDR", "Best fit: enterprise, scale, multi-PG routing"], "closer": "Choose Juspay to orchestrate payment partners, not to replace them.",
    }),
    gateway_chapter({
        "id": "05_phonepe", "title": "PhonePe Payment Gateway", "gateway": "PhonePe", "accent": "#5F259F", "tagline": "UPI-native scale, promo pricing — details on request",
        "docs": {"url": "business.phonepe.com/payment-gateway", "docsUrl": "developer.phonepe.com", "signupUrl": "business.phonepe.com/dashboard", "sandbox": True, "kyc": ["Business & signatory PAN", "Bank proof", "Business-registration / GST", "Address proof", "Website/app"], "methods": ["UPI", "Cards", "Net banking", "Hosted PG"]},
        "support": [{"icon": "🕐", "label": "24/7 dashboard support", "value": "Business Dashboard", "live": True}, {"icon": "✉️", "label": "Contact", "value": "phonepe.com/contact-us", "live": True}, {"icon": "📚", "label": "Docs", "value": "developer.phonepe.com", "live": True}, {"icon": "☎", "label": "Phone", "value": "not published", "live": False}],
        "metrics": {"settleDay": 0, "settleNote": "not disclosed on the PG page — verify", "instant": False, "settleUnknown": True, "successNote": "No official figure (markets high UPI acceptance)", "complexity": 2, "complexityLabel": "Easy–Medium", "complexityWhy": "Order → redirect → status-check flow"},
        "pricing": [{"icon": "💳", "label": "All methods (promo)", "rate": "1.99%*", "feePct": 1.99, "note": "limited-period offer"}, {"icon": "📋", "label": "Per-method breakdown", "rate": "contact sales"}],
        "foot": "Setup ₹0 · per-instrument card not public — contact sales",
        "flow": [{"emoji": "🧾", "label": "Create pay request", "sub": "server · X-VERIFY"}, {"emoji": "↪️", "label": "Redirect", "sub": "customer → PhonePe"}, {"emoji": "💳", "label": "Customer pays", "sub": "chosen method"}, {"emoji": "🔔", "label": "Callback", "sub": "server receives result"}, {"emoji": "✅", "label": "Status check", "sub": "server confirms"}],
        "code": {"lang": "node", "file": "pay.js", "lines": ["const payload = Buffer.from(JSON.stringify(body)).toString(\"base64\");", "const xVerify = sha256(payload + \"/pg/v1/pay\" + SALT_KEY)", "  + \"###\" + SALT_INDEX;", "// POST { request: payload }", "// with header X-VERIFY: xVerify", "// Check final status server-side."], "docUrl": "developer.phonepe.com", "caption": "Sign the request and query final status from your server."},
        "recap": ["UPI-native positioning", "1.99% limited promo; method breakdown not public", "₹0 setup", "Settlement timing not disclosed publicly", "Dashboard support and X-VERIFY flow"], "closer": "Strong UPI positioning, but obtain the commercial detail in writing.",
    }),
    gateway_chapter({
        "id": "06_paytm", "title": "Paytm Payment Gateway", "gateway": "Paytm", "accent": "#00BAF2", "tagline": "0% UPI + RuPay — the cost edge",
        "docs": {"url": "business.paytm.com/payment-gateway", "docsUrl": "business.paytm.com/docs", "signupUrl": "business.paytm.com", "sandbox": True, "kyc": ["Business & signatory PAN", "Bank proof", "Business-registration / GST", "Address proof"], "methods": ["Cards", "UPI", "Netbanking", "Wallets", "EMI"]},
        "support": [{"icon": "☎", "label": "Business phone", "value": "+91 120 4890600", "live": True}, {"icon": "💬", "label": "Support", "value": "business.paytm.com/support", "live": True}, {"icon": "📚", "label": "Docs", "value": "business.paytm.com/docs", "live": True}],
        "metrics": {"settleDay": 1, "settleNote": "next-day default (same-day/on-demand available)", "instant": True, "successNote": "No official figure published", "complexity": 3, "complexityLabel": "Medium", "complexityWhy": "All-in-One SDK + checksum signing"},
        "pricing": [{"icon": "🟣", "label": "UPI", "rate": "0%", "feePct": 0.0}, {"icon": "💳", "label": "RuPay cards", "rate": "0%", "feePct": 0.0}, {"icon": "💳", "label": "Credit / debit cards", "rate": "~1.8%", "feePct": 1.8, "note": "varies by source"}, {"icon": "🏦", "label": "Net banking", "rate": "~1.8%", "feePct": 1.8, "note": "varies by source"}, {"icon": "👛", "label": "Wallets", "rate": "~1.8%", "feePct": 1.8, "note": "varies by source"}],
        "foot": "No setup/AMC · GST applicable · 0% UPI + RuPay is the edge",
        "flow": [{"emoji": "🔐", "label": "Initiate transaction", "sub": "server · checksum"}, {"emoji": "🎟️", "label": "Get txnToken", "sub": "server response"}, {"emoji": "🛒", "label": "All-in-One Checkout", "sub": "client"}, {"emoji": "✅", "label": "Status + webhook", "sub": "server verifies"}, {"emoji": "🏦", "label": "Settlement", "sub": "T+1 / on-demand"}],
        "code": {"lang": "node", "file": "initiate-transaction.js", "lines": ["const { generateSignature } = require(\"paytmchecksum\");", "const body = { requestType: \"Payment\", mid: MID, orderId: \"o11\",", "  txnAmount: { value: \"500.00\", currency: \"INR\" } };", "const signature = await generateSignature(JSON.stringify(body), MERCHANT_KEY);", "// POST { body, head: { signature } }", "// to initiateTransaction."], "docUrl": "business.paytm.com/docs", "caption": "Generate the checksum on the server before initiating checkout."},
        "recap": ["0% UPI and RuPay are the cost edge", "~1.8% elsewhere, but source-dependent", "T+1 default · same-day/on-demand available", "All-in-One SDK + checksum", "Published business contact, not a 24/7 tech hotline"], "closer": "A clear option when UPI and RuPay economics matter most.",
    }),
    gateway_chapter({
        "id": "07_ccavenue", "title": "CCAvenue", "gateway": "CCAvenue", "accent": "#EF4444", "tagline": "The traditional heavyweight — broadest reach, real fees",
        "docs": {"url": "ccavenue.com", "docsUrl": "ccavenue.com (dashboard kit)", "signupUrl": "dashboard.ccavenue.com", "sandbox": True, "kyc": ["Business PAN", "Bank proof", "Business-registration", "Address proof", "Website with policies"], "methods": ["Cards", "Net banking", "Cash cards", "UPI", "Multi-currency"]},
        "support": [{"icon": "✉️", "label": "Email", "value": "contact@ccavenue.com", "live": True}, {"icon": "🌐", "label": "Contact page", "value": "ccavenue.com/contactUs.jsp", "live": True}, {"icon": "🤝", "label": "Relationship manager", "value": "Privilege", "live": True}, {"icon": "☎", "label": "Phone", "value": "verify on contact page", "live": False}],
        "metrics": {"settleDay": 0, "settleNote": "~T+2 to T+4, scheme-dependent", "instant": False, "settleUnknown": True, "successNote": "No official figure published", "complexity": 3, "complexityLabel": "Medium–Hard", "complexityWhy": "AES-encrypted request/response, older DX"},
        "pricing": [{"icon": "💳", "label": "Cards / net banking / cash cards", "rate": "3.75%+tax", "feePct": 3.75}, {"icon": "💳", "label": "American Express", "rate": "5%", "feePct": 5.0}, {"icon": "🟣", "label": "UPI", "rate": "debit-card rate"}],
        "foot": "Privilege scheme: ₹40,000 setup + monthly ASUC — the fee-heavy traditional option; schemes vary",
        "flow": [{"emoji": "🧾", "label": "Build order params", "sub": "server"}, {"emoji": "🔐", "label": "Encrypt request", "sub": "AES encRequest"}, {"emoji": "🛒", "label": "Billing page", "sub": "customer pays"}, {"emoji": "🔓", "label": "Decrypt response", "sub": "server verifies"}, {"emoji": "🏦", "label": "Settlement", "sub": "scheme-dependent"}],
        "code": {"lang": "node", "file": "encrypt-request.js", "lines": ["const crypto = require(\"crypto\");", "const key = crypto.createHash(\"md5\").update(WORKING_KEY).digest();", "const c = crypto.createCipheriv(\"aes-128-cbc\", key, iv);", "const encRequest = c.update(plainOrderString, \"utf8\", \"hex\")", "  + c.final(\"hex\");", "// POST encRequest and access_code to CCAvenue."], "docUrl": "ccavenue.com (dashboard kit)", "caption": "Encrypt before redirecting, then decrypt and verify the response server-side."},
        "recap": ["Traditional breadth and multi-currency reach", "3.75%+tax baseline; Amex 5%", "₹40,000 Privilege setup plus ASUC", "AES request/response integration", "Settlement and scheme terms require verification"], "closer": "Choose for reach and a relationship model, with eyes open on cost.",
    }),
    gateway_chapter({
        "id": "08_instamojo", "title": "Instamojo", "gateway": "Instamojo", "accent": "#EC4899", "tagline": "Collect with zero website — the SMB on-ramp",
        "docs": {"url": "instamojo.com", "docsUrl": "docs.instamojo.com", "signupUrl": "instamojo.com/signup", "sandbox": True, "kyc": ["PAN", "Bank proof", "Business proof (for company accounts)"], "methods": ["Payment links", "Cards", "UPI", "Net banking", "Wallets"]},
        "support": [{"icon": "❔", "label": "Help center", "value": "Instamojo support", "live": True}, {"icon": "💬", "label": "Dashboard tickets", "value": "merchant dashboard", "live": True}, {"icon": "✉️", "label": "Email", "value": "support route", "live": True}, {"icon": "☎", "label": "Phone", "value": "not published", "live": False}],
        "metrics": {"settleDay": 3, "settleNote": "T+3 default — slowest here; instant/same-day at extra cost", "instant": True, "successNote": "No official figure published", "complexity": 1, "complexityLabel": "Easy", "complexityWhy": "No-code payment links + simple API"},
        "pricing": [{"icon": "💳", "label": "Cards / UPI / Net banking / Wallets (Growth)", "rate": "2% + ₹3", "feePct": 2.0, "note": "+ ₹3 flat / txn"}, {"icon": "🏢", "label": "Corporate cards", "rate": "3% + ₹3", "feePct": 3.0}, {"icon": "🪶", "label": "Lite / Starter plans", "rate": "5% + ₹3", "feePct": 5.0}],
        "foot": "GST 18% · plan fee ₹0–₹14,999/yr sets your % · settlement T+3",
        "flow": [{"emoji": "🔗", "label": "Create Payment Request", "sub": "server"}, {"emoji": "↪️", "label": "Use longurl", "sub": "redirect buyer"}, {"emoji": "💳", "label": "Customer pays", "sub": "link checkout"}, {"emoji": "🔔", "label": "Redirect + webhook", "sub": "payment status"}, {"emoji": "✅", "label": "Verify", "sub": "server API"}],
        "code": {"lang": "bash", "file": "create-payment-request.sh", "lines": ["curl https://api.instamojo.com/v2/payment_requests/", "  -H \"Authorization: Bearer <ACCESS_TOKEN>\"", "  -d amount=500 -d purpose=\"Order 11\"", "  -d redirect_url=\"https://site/return\"", "  -d send_email=false", "# redirect to response.payment_request.longurl"], "docUrl": "docs.instamojo.com", "caption": "A payment link can collect without a website; still verify status server-side."},
        "recap": ["Payment links work with no website", "2% + ₹3 on Growth; tier changes fees", "T+3 default; faster settlement costs extra", "Simple API and no-code checkout", "PAN and bank proof required to withdraw"], "closer": "The lowest-friction path from a shareable link to a real collection.",
    }),
    {"id": "09_compare", "title": "Compare Payment Gateways", "accent": "#64748B", "segments": [
        ("title", "pg_title", {"gateway": "Head to Head", "tagline": "Eight gateways on one screen", "kicker": "COMPARE · DECIDE", "accent": "#64748B"},
         "Now put the eight options on one screen. [pause] This is not a leaderboard, because a low headline fee can be less important than support, routing, settlement, or the payment methods your customers actually use. [pause] Read this as a shortlisting map. [pause] Then verify current terms directly with the providers that match your product, volume, and operational constraints before you sign or integrate."),
        ("compare", "pg_compare", {"title": "Eight gateways, side by side", "cols": ["Cards", "UPI", "Settle", "Setup", "Effort"], "rows": [{"gateway": "Razorpay", "accent": "#3B82F6", "cells": ["2%", "2%", "T+1", "₹0", "Easy"]}, {"gateway": "Cashfree", "accent": "#14B8A6", "cells": ["1.95%", "1.95%", "T+1", "₹0", "Easy"]}, {"gateway": "PayU", "accent": "#8B5CF6", "cells": ["2%", "custom", "T+2", "₹0", "Med"]}, {"gateway": "Juspay", "accent": "#F59E0B", "cells": ["orch.", "orch.", "via PG", "custom", "Ent."]}, {"gateway": "PhonePe", "accent": "#5F259F", "cells": ["1.99%*", "—", "n/d", "₹0", "Easy"]}, {"gateway": "Paytm", "accent": "#00BAF2", "cells": ["~1.8%", "0%", "T+1", "₹0", "Med"]}, {"gateway": "CCAvenue", "accent": "#EF4444", "cells": ["3.75%", "deb.", "~T+2", "₹40k", "Med+"]}, {"gateway": "Instamojo", "accent": "#EC4899", "cells": ["2%+₹3", "2%+₹3", "T+3", "plan", "Easy"]}], "foot": "Rates as published Aug 2026 — promos & negotiated slabs vary. Verify on each official site."},
         "Here is the compact comparison. [pause] Notice the difference between a published rate, a custom rate, and a missing public disclosure. [pause] Juspay is orchestration, so its card and UPI cells point back to the routed gateway. [pause] PhonePe's per-method breakdown is not public. [pause] CCAvenue's row is scheme-specific. [pause] Those caveats are useful information, not missing polish. [pause] They tell you where a sales conversation is required."),
        ("decision", "pg_decision", {"title": "Which one should you pick?", "branches": [{"q": "Fastest, cleanest DX", "pick": "Razorpay / Cashfree", "why": "hosted checkout, SDKs, ₹0 fees", "accent": "#3B82F6"}, {"q": "UPI-heavy, cost-sensitive", "pick": "Paytm PG", "why": "0% UPI + RuPay", "accent": "#00BAF2"}, {"q": "Many PGs, big scale", "pick": "Juspay", "why": "orchestrate + least-cost routing", "accent": "#F59E0B"}, {"q": "No website, just a link", "pick": "Instamojo", "why": "collect with zero site", "accent": "#EC4899"}]},
         "Start with your use case, not a logo. [pause] For the fastest conventional developer experience, shortlist Razorpay and Cashfree. [pause] For a UPI-heavy, cost-sensitive mix, Paytm's zero-percent UPI and RuPay position is distinctive. [pause] If you already operate multiple gateways at enterprise scale, Juspay solves the routing layer. [pause] And if you do not have a website at all, Instamojo can start with a payment link. [pause] Then test the exact flow that your customers will use."),
        ("recap", "pg_recap", {"title": "The whole map in one breath", "items": ["A gateway = checkout → verify on server → webhook → settlement.", "Razorpay/Cashfree: ₹0-fee, ~2%, easiest DX.", "Paytm's edge is 0% UPI; CCAvenue is the fee-heavy traditional option.", "Juspay isn't a PG — it routes across many for scale.", "Always verify server-side and confirm live pricing."], "closer": "Pick for your payment mix and your scale — not for the logo."},
         "So the whole map in one breath. [pause] A gateway runs checkout, but your server must verify the payment, process the webhook, and wait for settlement. [pause] Razorpay and Cashfree are the straightforward near-two-percent developer options. [pause] Paytm's edge is zero-percent UPI, while CCAvenue is the fee-heavy traditional choice. [pause] Juspay routes across gateways at scale. [pause] Always verify server-side and confirm live pricing. [pause] Pick for your payment mix and your scale, not for the logo. Thanks for watching."),
    ]},
]
