#!/usr/bin/env python3
"""BUILD A DATA HARNESS — agents over PDFs, Excel and SQL for financial analysis (EN, pack = ledger).

  projects/midcap5-picks-en/.venv/bin/python3 projects/data-harness-en/build.py   # TTS + JSON
  bash projects/data-harness-en/render.sh                                         # render + concat

Plan doc: ~/Documents/Claude Docs/AI & ML/Agents/Data Harness for Financial Analysis - Plan.md
Worked example = a FICTIONAL company ("Acme Components") with ILLUSTRATIVE numbers; every derived
figure (margins, YoY, D/E, unit conversions) is COMPUTED below, never typed by hand.
"""
import json, os, re, subprocess
import soundfile as sf
from kokoro_onnx import Kokoro

PACK = "ledger"                          # NEW pack for this video: spreadsheet worksheet (skills/14)
META = {"brand": "Explainer Forge", "project": "data-harness", "issue": "September 2026", "code": "DH"}
PREFIX = "dh"
CAPTIONS = True
GAP, PAUSE, ATEMPO = 0.5, 0.6, 0.95
PRON = [(r"\bLLM\b", "L L M"), (r"\bSQL\b", "sequel"), (r"\bPDFs\b", "P D Fs"), (r"\bPDF\b", "P D F"),
        (r"\bD/E\b", "debt to equity"), (r"\bYoY\b", "year on year"), (r"\bMCP\b", "M C P"), (r"\bAPI\b", "A P I"),
        (r"\bDuckDB\b", "Duck D B"), (r"\bPAT\b", "P A T"), (r"\bKPIs\b", "K P Is"), (r"\bReAct\b", "React"),
        (r"\bQ2FY26\b", "Q2 F Y 26"), (r"\bFY26\b", "F Y 26"), (r"\bBSE\b", "B S E"), (r"\bNSE\b", "N S E"),
        (r"\buv\b", "U V"), (r"\bYAML\b", "yammel"), (r"\bOSS\b", "open source")]

# ------------------------------------------------------------------ the worked example (ILLUSTRATIVE)
Q = ["Q3FY24", "Q4FY24", "Q1FY25", "Q2FY25", "Q3FY25", "Q4FY25", "Q1FY26", "Q2FY26"]
REV = [1012.40, 1060.80, 1118.30, 1094.60, 1150.90, 1203.70, 1261.20, 1248.60]   # ₹ crore
PAT = [71.20, 76.50, 83.90, 80.10, 88.60, 96.30, 104.70, 106.10]                # ₹ crore
MARGIN = [round(p / r * 100, 2) for p, r in zip(PAT, REV)]                        # net margin %
YOY = [None] * 4 + [round((REV[i] / REV[i - 4] - 1) * 100, 2) for i in range(4, 8)]
BS_Y = ["FY24", "FY25", "H1FY26"]
DEBT_LAKH = [52480.00, 47310.00, 41250.00]                                      # Excel is in ₹ LAKH
EQ_LAKH = [148200.00, 158900.00, 165000.00]
DEBT_CR = [round(v / 100, 2) for v in DEBT_LAKH]
EQ_CR = [round(v / 100, 2) for v in EQ_LAKH]
DE = [round(d / e, 2) for d, e in zip(DEBT_CR, EQ_CR)]
f2 = lambda v: f"{v:,.2f}"
MARGIN_PTS = round(MARGIN[7] - MARGIN[3], 2)                                     # vs same quarter last year
WRONG_YOY = 10.40                                                                # what a model "estimated" in its head
assert DE[-1] < DE[0] and MARGIN[7] > MARGIN[3]
PDF_ROWS = [["Revenue from operations", f2(REV[7]), f2(REV[6]), f2(REV[3])],
            ["Total expenses", f2(REV[7] - 142.40), f2(REV[6] - 140.10), f2(REV[3] - 107.50)],
            ["Profit before tax", "142.40", "140.10", "107.50"],
            ["Tax expense", f2(142.40 - PAT[7]), f2(140.10 - PAT[6]), f2(107.50 - PAT[3])],
            ["Net profit", f2(PAT[7]), f2(PAT[6]), f2(PAT[3])]]
# totals tie out: PBT − tax = PAT (checked, not assumed)
for r in range(3): assert abs(float(PDF_ROWS[2][r + 1]) - float(PDF_ROWS[3][r + 1].replace(",", "")) - float(PDF_ROWS[4][r + 1].replace(",", ""))) < 0.01

LEDE = "Illustrative data · fictional company · not investment advice"

BEATS = [
 # ---------------------------------------------------------------- 0 · intro
 ("title", {"kicker": "Agent engineering · finance", "title": "Build a\nData Harness",
            "subtitle": "PDFs, Excel and SQL → one agent that answers with cited numbers"},
  "A question about a company is easy to ask. [pause] Answering it correctly is hard. [pause] "
  "In this video, we design a data harness. It's an agent that reads your PDFs, spreadsheets, and databases, "
  "and answers with numbers you can check.", 0),
 ("statement", {"kicker": "The question", "lines": ["Is Acme's margin improving,", "while its debt stays", "under control?"], "accent": 0,
                "sub": "Results in PDFs · the balance sheet in Excel, in ₹ lakh · prices in a SQL database"},
  "Here's the kind of question we want to handle. [pause] Is Acme's margin improving, while its debt stays under control? [pause] "
  "Acme is a made-up company, and all its numbers here are illustrative. [pause] But the mess is real. "
  "The quarterly results are PDFs. The balance sheet sits in an Excel file, in lakh, not crore. And prices live in a SQL database. "
  "[pause] One sentence of question. Three formats of data. Several transformations in between.", 0),
 ("versus", {"kicker": "Why not just a chatbot?", "title": "An assistant fetches. A harness engineers.",
             "left": {"h": "Chat assistant", "items": ["Reads raw documents at question time", "Does arithmetic in its head",
                                                       "Can't tell lakh from crore", "Forgets every correction"]},
             "right": {"h": "Data harness", "items": ["Data prepared before the question", "Metrics defined once, in code",
                                                      "Every number comes from a tool", "Verified, cited, and it learns"]},
             "winner": "right"},
  "Tools like Claude Code and Codex already ship agents. [pause] But used as plain assistants, they fetch text and summarize it. "
  "They read raw documents when you ask, do arithmetic in their head, and forget your corrections. [pause] "
  "A harness is different. The data is prepared before the question. Metrics are defined once, in code. "
  "Every number comes from a tool, and the answer is verified and cited. [pause] That's what we'll build.", 0),
 ("list", {"kicker": "Roadmap", "title": "Six parts, from idea to laptop", "items": [
     {"h": "The harness", "d": "what surrounds the model, and why it matters"},
     {"h": "The data plane", "d": "PDFs, Excel and SQL turned into clean tables"},
     {"h": "Metrics and tools", "d": "a semantic layer and a handful of sharp tools"},
     {"h": "The loop", "d": "context, model, tools, observe, repeat"},
     {"h": "Trust and memory", "d": "verify every number, remember every correction"},
     {"h": "Your build plan", "d": "seven phases, Python, on your laptop"}]},
  "Here's the map. [pause] First, the harness: what surrounds the model. [pause] Second, the data plane, "
  "where PDFs, Excel, and SQL become clean tables. [pause] Third, metrics and tools. [pause] Fourth, the loop itself. "
  "[pause] Fifth, trust and memory. [pause] And sixth, your build plan, phase by phase.", 0),

 # ---------------------------------------------------------------- 1 · the harness
 ("divider", {"n": 1, "total": 6, "title": "The harness", "sub": "the model is the engine; the harness is the car"}, "Part one. The harness. [pause] What surrounds the model, and why it matters more than the model itself.", 1),
 ("list", {"kicker": "What coding-agent harnesses taught us", "title": "Six parts around one model", "items": [
     {"h": "Context builder", "d": "decides exactly what the model sees each turn"},
     {"h": "Tools", "d": "validated, sandboxed actions with compact results"},
     {"h": "The loop", "d": "call the model, run tools, feed results back"},
     {"h": "Memory", "d": "transcripts now, durable learnings later"},
     {"h": "Guardrails", "d": "budgets, approvals, and a verifier"},
     {"h": "Traces and evals", "d": "every step logged, every change scored"}]},
  "Coding agents made one idea famous. [pause] The model is the engine. The harness is the car. [pause] "
  "Small open projects, like Sebastian Raschka's mini coding agent, show the same parts again and again. [pause] "
  "A context builder decides what the model sees. [pause] Tools are its hands. [pause] The loop runs model, then tools, then model again. "
  "[pause] Memory carries things across turns and sessions. [pause] Guardrails set budgets and check the output. "
  "[pause] And traces plus evals tell you if a change made things better. [pause] A data harness keeps this skeleton. "
  "We just swap code tools for data tools.", 1),
 ("x_diagram", {"kicker": "Architecture", "title": "The whole system on one sheet",
   "groups": [{"h": "OFFLINE · DATA PLANE", "x": 120, "y": 280, "w": 760, "hh": 580, "c": "faint", "at": 0.03},
              {"h": "ONLINE · THE HARNESS", "x": 950, "y": 280, "w": 860, "hh": 580, "c": "llm", "at": 0.03}],
   "nodes": [
     {"id": "pdf", "h": "PDFs", "d": "results, reports", "x": 150, "y": 320, "w": 220, "c": "pdf"},
     {"id": "xls", "h": "Excel sheets", "d": "exports, models", "x": 150, "y": 505, "w": 220, "c": "xls"},
     {"id": "sql", "h": "SQL databases", "d": "prices, trades", "x": 150, "y": 690, "w": 220, "c": "sql"},
     {"id": "ing", "h": "Ingest", "d": "parse, normalise, validate", "x": 420, "y": 320, "w": 190, "hh": 480},
     {"id": "facts", "h": "Facts table", "d": "DuckDB", "x": 650, "y": 320, "w": 200},
     {"id": "idx", "h": "Doc index", "d": "text chunks", "x": 650, "y": 505, "w": 200},
     {"id": "cat", "h": "Catalog", "d": "what exists", "x": 650, "y": 690, "w": 200},
     {"id": "sem", "h": "Semantic layer", "d": "metric formulas", "x": 990, "y": 320, "w": 250, "c": "llm"},
     {"id": "tools", "h": "Tools", "d": "seven, read-only", "x": 990, "y": 505, "w": 250, "c": "llm"},
     {"id": "loop", "h": "Agent loop", "d": "context → model → tools", "x": 1290, "y": 505, "w": 240, "c": "llm"},
     {"id": "mem", "h": "Memory", "d": "learnings", "x": 1290, "y": 690, "w": 240, "c": "pdf"},
     {"id": "ver", "h": "Verifier", "d": "numbers ⊆ evidence", "x": 1580, "y": 505, "w": 205, "c": "xls"},
     {"id": "ans", "h": "Cited answer", "d": "with as-of date", "x": 1580, "y": 320, "w": 205}],
   "edges": [["pdf", "ing"], ["xls", "ing"], ["sql", "ing"], ["ing", "facts"], ["ing", "idx"], ["ing", "cat"],
             ["facts", "sem"], ["idx", "tools"], ["sem", "tools"], ["tools", "loop"], ["loop", "mem"], ["loop", "ver"], ["ver", "ans"]]},
  "Here's the whole system on one sheet. [pause] On the left is the offline data plane. PDFs, Excel sheets, and SQL databases "
  "flow into an ingest step, which parses, normalises, and validates. [pause] Out come three things. A facts table for the numbers. "
  "A doc index for the text. And a catalog that records what exists. [pause] On the right is the online harness. "
  "A semantic layer holds the metric formulas. Tools sit on top of it. [pause] The agent loop calls those tools. "
  "Memory stores what it learns. [pause] And a verifier checks every number before a cited answer goes out.", 1),
 ("statement", {"kicker": "The key design decision", "lines": ["Do the heavy lifting", "before the question.", "Numbers become rows.", "Prose becomes chunks."],
                "accent": 1, "sub": "Parse once, validate once, query many times."},
  "If you remember one design decision, make it this one. [pause] Do the heavy lifting before the question. [pause] "
  "A two hundred page annual report should not be parsed while a user waits. That's slow, costly, and different every run. "
  "[pause] Instead, numbers become rows in a table. Prose becomes searchable chunks. [pause] "
  "At question time, the agent queries clean data. [pause] Parse once. Validate once. Query many times.", 1),

 # ---------------------------------------------------------------- 2 · data plane
 ("divider", {"n": 2, "total": 6, "title": "The data plane", "sub": "PDFs, Excel and SQL → one clean store"}, "Part two. The data plane. [pause] How PDFs, spreadsheets, and databases become one clean, trustworthy store.", 2),
 ("x_ingest", {"kicker": "Source 1 · PDFs", "title": "A results PDF becomes rows",
   "src": {"kind": "pdf", "name": "acme_q2fy26_results.pdf", "unit": "(₹ in crore, consolidated)",
           "head": ["Particulars", "Q2FY26", "Q1FY26", "Q2FY25"], "rows": PDF_ROWS},
   "steps": ["Parse layout", "Map row labels", "Tag period + basis"],
   "out": {"cols": ["metric", "period", "value", "locator"],
           "rows": [["revenue", "Q2FY26", f2(REV[7]), "p4:t1:r1"], ["pat", "Q2FY26", f2(PAT[7]), "p4:t1:r5"],
                    ["revenue", "Q1FY26", f2(REV[6]), "p4:t1:r1"], ["pat", "Q1FY26", f2(PAT[6]), "p4:t1:r5"],
                    ["revenue", "Q2FY25", f2(REV[3]), "p4:t1:r1"], ["pat", "Q2FY25", f2(PAT[3]), "p4:t1:r5"]],
           "map": [0, 4, 0, 4, 0, 4]}},
  "Start with PDFs, the hardest source. [pause] A parser like Docling runs locally and turns each page into text plus table objects. "
  "[pause] Then we map row labels to canonical metrics. Revenue from operations, net sales, and total income from operations "
  "can all mean revenue. [pause] Next we tag the period and the basis, consolidated or standalone. [pause] "
  "Each value lands as a row, with a locator: page four, table one, row five. [pause] Later, any number can be traced back to that exact cell. "
  "[pause] One warning from 2026 benchmarks. Local parsers can misread dense tables, so always check that totals tie out.", 2),
 ("x_table", {"kicker": "The heart of the system", "title": "One canonical facts table",
   "cols": [{"h": "company"}, {"h": "metric"}, {"h": "period"}, {"h": "value", "align": "right"}, {"h": "unit"},
            {"h": "basis"}, {"h": "source", "w": 1.7}, {"h": "locator", "w": 1.1}],
   "rows": [["acme", "revenue", "Q2FY26", REV[7], "INR_cr", "consol", "q2fy26_results.pdf", "p4:t1:r1"],
            ["acme", "pat", "Q2FY26", PAT[7], "INR_cr", "consol", "q2fy26_results.pdf", "p4:t1:r5"],
            ["acme", "borrowings", "H1FY26", DEBT_CR[2], "INR_cr", "consol", "balance_sheet.xlsx", "BS!C14"],
            ["acme", "equity", "H1FY26", EQ_CR[2], "INR_cr", "consol", "balance_sheet.xlsx", "BS!C22"],
            ["acme", "close", "2026-09-23", 842.35, "INR", "—", "prices.db", "prices#row"]],
   "marks": [{"r": 1, "c": 3, "key": "value", "tone": "hi", "note": "a value is never alone: unit, basis, source and locator travel with it"},
             {"r": 2, "c": 6, "key": "source", "tone": "ok", "note": "provenance: every number points back to a file and a cell"}],
   "note": "close price illustrative"},
  "Everything numeric converges here, in one canonical facts table. [pause] Each row says which company, which metric, which period, "
  "and the value. [pause] But a value never travels alone. It carries its unit, its basis, its source file, and its locator. "
  "[pause] That's provenance. It means every number can point back to a file and a cell. [pause] "
  "Rows from PDFs, from Excel, and from databases all look the same here. So the agent answers from one place, not three.", 2),
 ("x_ingest", {"kicker": "Source 2 · Excel", "title": "Excel: detect the unit, then convert it",
   "src": {"kind": "xls", "name": "balance_sheet.xlsx", "unit": "Rs. in Lakhs",
           "head": ["Item", *BS_Y], "rows": [["Borrowings", *[f2(v) for v in DEBT_LAKH]], ["Net worth", *[f2(v) for v in EQ_LAKH]]]},
   "steps": ["Read merged headers", "Detect ₹ lakh", "Divide by 100"],
   "out": {"cols": ["metric", "period", "value ₹ cr", "cell"],
           "rows": [["borrowings", BS_Y[i], f2(DEBT_CR[i]), f"BS!{'CDE'[i]}14"] for i in range(3)] +
                   [["equity", BS_Y[i], f2(EQ_CR[i]), f"BS!{'CDE'[i]}22"] for i in range(3)], "map": [0, 0, 0, 1, 1, 1]}},
  "Excel looks easier, and it hides different traps. [pause] Merged header cells, notes in the margins, and units written once, at the top. "
  "[pause] This sheet says: rupees in lakhs. [pause] Our canonical unit is crore, and one crore is a hundred lakh. "
  "So the ingest step detects the unit and divides by a hundred. [pause] Borrowings of forty one thousand, two hundred and fifty lakh "
  "become four hundred and twelve point five crore. [pause] Miss this, and every ratio is off by a factor of a hundred. "
  "It's one of the most common real errors in Indian financial data.", 2),
 ("flow", {"kicker": "Source 3 · SQL databases", "title": "Attach every database to one engine", "steps": [
     {"h": "Attach", "d": "SQLite, Postgres or MySQL, attached into DuckDB"},
     {"h": "Introspect", "d": "tables, columns, sample rows, value ranges"},
     {"h": "Annotate", "d": "human notes: 'close is split-adjusted'"},
     {"h": "Lock down", "d": "read-only, row limits, timeouts"}]},
  "Databases are the friendliest source. [pause] We attach them all to one engine, DuckDB. SQLite, Postgres, even Excel files "
  "can be queried through it, so the agent learns one SQL dialect. [pause] Next we introspect: tables, columns, sample rows, "
  "and value ranges go into the catalog. [pause] Then we annotate. A human adds what the schema can't say, like "
  "close prices are split-adjusted. [pause] Finally, we lock it down. Read-only connections, row limits, and timeouts.", 2),
 ("x_table", {"kicker": "Validate before you trust", "title": "Reconcile sources, don't pick one silently",
   "cols": [{"h": "check", "w": 2.1}, {"h": "PDF", "c": "pdf", "align": "right"}, {"h": "Excel (raw)", "c": "xls", "align": "right"},
            {"h": "Excel → ₹ cr", "computed": "raw / 100", "align": "right"}, {"h": "status", "w": 0.9}],
   "rows": [["PAT Q2FY26", f2(PAT[7]), f2(PAT[7] * 100), f2(PAT[7]), "match"],
            ["Revenue Q2FY26", f2(REV[7]), f2(REV[7] * 100), f2(REV[7]), "match"],
            ["PBT − tax = PAT", "142.40 − 36.30", "—", f2(PAT[7]), "ties out"],
            ["PAT Q1FY26", f2(PAT[6]), f2(104.20 * 100), f2(104.20), "conflict"]],
   "marks": [{"r": 0, "c": 2, "key": "hundred", "tone": "bad", "note": "compare raw values and you'd see a 100× gap: that's a unit slip, not a disagreement"},
             {"r": 2, "c": 4, "key": "tie", "tone": "ok", "note": "arithmetic identities catch parser misreads"},
             {"r": 3, "c": 4, "key": "conflict", "tone": "bad", "note": "real conflict (restatement?): surface both values with sources"}]},
  "Before any number is trusted, we validate it. [pause] First, compare sources. Compare raw PAT in the PDF with raw PAT in Excel, "
  "and you'd see a hundred times gap. That's not a disagreement. It's a unit slip, and conversion fixes it. [pause] "
  "Second, check identities. Profit before tax minus tax must tie out to net profit. That catches parser misreads. [pause] "
  "Third, when two sources truly conflict, perhaps from a restatement, don't silently pick one. Flag the row as a conflict, "
  "and show both values with sources.", 2),
 ("flow", {"kicker": "The text side", "title": "Prose becomes searchable chunks", "steps": [
     {"h": "Split by section", "d": "MD&A, risks, notes, concall Q&A"},
     {"h": "Add context prefix", "d": "Company | Doc | Period | Section"},
     {"h": "Index twice", "d": "vectors for meaning, BM25 for exact terms"},
     {"h": "Audit the corpus", "d": "missing documents are the silent killer"}], "ats": [0.161, 0.328, 0.582, 0.726]},
  "Numbers aren't everything. Management commentary explains why margins moved. [pause] So text is split by section: "
  "discussion and analysis, risks, notes, and the earnings call. [pause] Each chunk gets a context prefix. "
  "Company, document, period, section. [pause] A public FinanceBench write-up found this cut cross-company mix-ups. "
  "[pause] Then we index twice: vectors for meaning, and keyword search for exact terms. [pause] And we audit the corpus. "
  "In that same write-up, simply fixing missing documents lifted retrieval recall from eighty three to ninety four percent.", 2),

 # ---------------------------------------------------------------- 3 · metrics and tools
 ("divider", {"n": 3, "total": 6, "title": "Metrics and tools", "sub": "the model chooses, the code computes"}, "Part three. Metrics and tools. [pause] Where the model stops doing math, and starts choosing.", 3),
 ("chart", {"kicker": "dbt Labs benchmark · 2026", "title": "Semantic layer vs raw text-to-SQL", "type": "bar", "unit": "%",
            "bars": [{"label": "Sonnet 4.6 · SQL", "value": 90.0, "c": "faint"}, {"label": "Sonnet 4.6 · SL", "value": 98.2, "c": "llm"},
                     {"label": "GPT-5.3 · SQL", "value": 84.1, "c": "faint"}, {"label": "GPT-5.3 · SL", "value": 100.0, "c": "llm"}],
            "ats": [0.263, 0.332, 0.464, 0.51], "note": "SL = semantic layer. Source: docs.getdbt.com, 'Semantic Layer vs. Text-to-SQL: 2026 Benchmark Update' (modeled data)"},
  "Why define metrics in code? Look at this 2026 benchmark from dbt Labs. [pause] When Claude Sonnet four point six wrote raw SQL, it scored ninety percent. "
  "Through a semantic layer, ninety eight point two. [pause] For GPT five point three codex, eighty four point one, "
  "versus one hundred. [pause] The failure style matters even more. Raw SQL fails silently, with a plausible wrong number. "
  "The semantic layer fails loudly, with an error. [pause] For numbers investors act on, loud failure is what you want.", 3),
 ("x_code", {"kicker": "Semantic layer", "title": "Metrics are defined once, in code", "file": "semantic/metrics.yaml", "lines": [
     "metrics:",
     "  revenue:        {source: facts, metric: revenue, unit: INR_cr}",
     "  pat:            {source: facts, metric: pat, unit: INR_cr}",
     "  net_margin:     {expr: pat / revenue * 100, unit: pct}",
     "  debt_to_equity: {expr: borrowings / equity, unit: x}",
     "  yoy(m):         {expr: m / lag(m, 4) - 1, unit: pct}",
     "defaults:",
     "  basis: consolidated          # user can override",
     "  fiscal_year: apr_to_mar      # Q1FY26 = Apr–Jun 2025",
     "checks:",
     "  net_margin: [-100, 100]      # outside = unit error",
     "  debt_to_equity: '>= 0'"],
   "notes": [{"a": 4, "b": 5, "key": "formula", "t": "The LLM picks net_margin. It never writes the formula itself."},
             {"a": 6, "b": 6, "key": "four", "t": "YoY compares with the same quarter a year back: lag of four quarters."},
             {"a": 8, "b": 9, "key": "fiscal", "t": "Indian fiscal year: April to March. Say it once, here."},
             {"a": 10, "b": 12, "key": "sanity", "t": "Range checks turn silent unit slips into loud errors."}]},
  "Here's a small semantic layer. [pause] Revenue and PAT come straight from the facts table. [pause] Net margin is PAT over revenue. "
  "Debt to equity is borrowings over equity. The model picks net margin by name. It never writes the formula itself. [pause] "
  "Year on year compares a quarter with the same quarter a year back, so it lags by four. [pause] Defaults live here too. "
  "Consolidated basis, and the Indian fiscal year, April to March. So Q1 FY26 means April to June twenty twenty five. "
  "[pause] And sanity checks. A net margin above a hundred percent is not a great quarter. It's a unit error.", 3),
 ("x_table", {"kicker": "get_metrics(acme, [revenue, pat, net_margin, yoy(revenue)], last 8Q)", "title": "What the semantic layer returns",
   "cols": [{"h": "period"}, {"h": "revenue ₹ cr", "align": "right", "c": "pdf"}, {"h": "PAT ₹ cr", "align": "right", "c": "pdf"},
            {"h": "net margin %", "computed": "pat / revenue", "align": "right"}, {"h": "revenue YoY %", "computed": "rev / lag4 − 1", "align": "right"}],
   "rows": [[Q[i], REV[i], PAT[i], MARGIN[i], YOY[i] if YOY[i] is not None else "—"] for i in range(8)],
   "marks": [{"r": 3, "c": 3, "key": "year", "tone": "hi", "note": f"Q2FY25 margin {MARGIN[3]:.2f}% …"},
             {"r": 7, "c": 3, "key": "now", "tone": "ok", "note": f"… Q2FY26 margin {MARGIN[7]:.2f}%: up {MARGIN_PTS:.2f} points, computed, not guessed"}],
   "note": LEDE},
  "Here's what one tool call returns. Eight quarters for Acme. [pause] Revenue and PAT come from the PDFs. The violet columns are computed "
  "by the semantic layer: net margin, and revenue growth year on year. [pause] The same quarter a year ago had a margin of "
  f"{MARGIN[3]:.2f} percent. [pause] Now it's {MARGIN[7]:.2f} percent. [pause] That's the first half of our answer, "
  "and nobody did the arithmetic in their head.", 3),
 ("list", {"kicker": "The agent's hands", "title": "Six data tools, plus memory", "items": [
     {"h": "list_sources", "d": "what data exists, which periods, as of when"},
     {"h": "get_metrics", "d": "semantic-layer query: deterministic, cited"},
     {"h": "query_sql", "d": "read-only ad-hoc SQL for exploration, 50 rows max"},
     {"h": "search_docs", "d": "hybrid search over commentary, returns doc:page"},
     {"h": "read_table", "d": "open the exact PDF table or Excel range behind a fact"},
     {"h": "run_python", "d": "sandboxed pandas for custom transforms, no network"}]},
  "Now the tools. Keep them few and high level. [pause] List sources tells the agent what data exists and how fresh it is. "
  "[pause] Get metrics is the workhorse, the semantic layer. [pause] Query SQL is for exploration, read-only and capped at fifty rows. "
  "[pause] Search docs finds commentary and returns document and page. [pause] Read table opens the exact table behind any fact, for audits. "
  "[pause] And run python is a sandbox for custom transforms, like a trailing twelve month sum. [pause] Two more, recall and remember, "
  "handle memory. We'll get to those.", 3),
 ("x_code", {"kicker": "Tool design", "title": "Descriptions steer; errors teach", "file": "tools/get_metrics.py", "lines": [
     "@tool",
     "def get_metrics(company: str, metrics: list[str], periods: list[str],",
     "                basis: str = \"consolidated\") -> Result:",
     "    \"\"\"Use for ANY standard metric (revenue, pat, net_margin, D/E, yoy).",
     "    Prefer this over query_sql. Returns values + unit + source.\"\"\"",
     "    unknown = [m for m in metrics if m not in METRICS]",
     "    if unknown:",
     "        raise ToolError(f\"unknown metric {unknown[0]}. \"",
     "            f\"Did you mean {closest(unknown[0])}? Available: {list(METRICS)}\")",
     "    sql = compile_metrics(company, metrics, periods, basis)   # deterministic",
     "    rows = duck.execute(sql).fetchall()[:MAX_ROWS]",
     "    return Result(rows=rows, provenance=trace_cells(rows), sql=sql)"],
   "notes": [{"a": 4, "b": 5, "key": "when", "t": "Say WHEN to use the tool, not just what it does."},
             {"a": 6, "b": 9, "key": "error", "t": "An instructive error lets the model fix itself on the next step."},
             {"a": 10, "b": 12, "key": "compact", "t": "Clip the output, and always return provenance."}]},
  "Tool design matters as much as the model. [pause] Anthropic's guidance on writing tools boils down to a few rules. "
  "[pause] The description says when to use the tool, not only what it does. Here it says: prefer this over raw SQL. "
  "[pause] Errors should teach. Ask for net profit, and the error says: unknown metric, did you mean PAT? "
  "The model fixes itself on the very next step. [pause] And outputs stay compact. Clip the rows, and always return provenance.", 3),

 # ---------------------------------------------------------------- 4 · the loop
 ("divider", {"n": 4, "total": 6, "title": "The agent loop", "sub": "build context → call the model → run tools → repeat"}, "Part four. The agent loop. [pause] The small piece of code that ties everything together.", 4),
 ("x_loop", {"kicker": "The core", "title": "Seven steps, run until the answer is verified", "center": "Claude",
   "steps": [{"h": "Build context", "d": "what the model sees"}, {"h": "Call the model", "d": "plan, pick tools"},
             {"h": "Run tools", "d": "validated, sandboxed"}, {"h": "Observe", "d": "clip, log evidence"},
             {"h": "Verify", "d": "numbers ⊆ evidence"}, {"h": "Answer", "d": "cited, with as-of"},
             {"h": "Remember", "d": "store learnings"}],
   "trace": ["context: 4,180 tok (prefix cached)", "model → plan: 3 sub-questions", "tool: get_metrics(acme, net_margin, 8Q)",
             "observe: 8 rows, 16 cells logged", "verify: 1 number unmatched → retry", "answer: 5 numbers, 5 citations", "memory: +1 learning"]},
  "Here is the loop at the center of it all. [pause] Step one, build context. [pause] Step two, call the model. It plans and picks tools. "
  "[pause] Step three, run tools, with validated arguments. [pause] Step four, observe. Results are clipped, and every number goes into an evidence log. "
  "Then loop back, until the model stops asking for tools. [pause] Step five, verify the draft. [pause] Step six, answer, with citations. "
  "[pause] Step seven, remember anything worth keeping. [pause] Watch the trace on the right. Every step is logged, which is how you debug it later.", 4),
 ("x_context", {"kicker": "Step 1 · the context builder", "title": "What the model sees, and in what order", "budget": 12000,
   "segs": [{"h": "Stable prefix", "d": "role, rules, catalog summary, metric glossary", "tok": 3200, "c": "llm", "cached": True},
            {"h": "Recalled memories", "d": "'user prefers ₹ crore', 'Excel from broker X is in lakh'", "tok": 600, "c": "pdf"},
            {"h": "Conversation", "d": "recent turns verbatim, older ones summarised", "tok": 2600, "c": "faint"},
            {"h": "The question", "d": "entities resolved: Acme → acme, 'last quarter' → Q2FY26", "tok": 180, "c": "ink"},
            {"h": "Tool results", "d": "clipped tables with provenance", "tok": 2400, "c": "xls"}],
   "compact": {"idx": 2, "to": 700, "at": 0.8}},
  "Step one deserves a closer look. The context builder decides what the model sees. [pause] First, a stable prefix. "
  "Role, rules, the catalog summary, and the metric glossary. It barely changes, so prompt caching makes it cheap. [pause] "
  "Then recalled memories, the ones relevant to this question. [pause] Then the conversation. [pause] Then the question itself, "
  "with entities already resolved. Last quarter becomes Q2 FY26. [pause] Then tool results, clipped. [pause] "
  "When the window fills up, older turns are compacted into a summary. The numbers stay safe in the evidence log.", 4),
 ("x_code", {"kicker": "Steps 2 to 6", "title": "The loop is about thirty lines", "file": "harness/loop.py", "lines": [
     "def run(question, session):",
     "    ctx = build_context(question, session)          # step 1",
     "    for step in range(MAX_STEPS):                    # budget: 12",
     "        resp = claude.messages.create(model=MODEL, system=ctx.system,",
     "                    messages=ctx.messages, tools=TOOL_SCHEMAS)",
     "        if resp.stop_reason != \"tool_use\":",
     "            report = verify(resp.text, session.evidence)",
     "            if report.ok: break",
     "            ctx.add_user(f\"VERIFIER: {report.problems}. Fix with tools.\")",
     "            continue",
     "        for call in tool_calls(resp):",
     "            result = TOOLS[call.name].run(**call.input)  # validated",
     "            session.evidence += result.provenance",
     "            ctx.add_tool_result(call.id, clip(result))",
     "    remember_learnings(session)                      # step 7",
     "    return cite(resp.text, session.evidence)"],
   "notes": [{"a": 3, "b": 5, "key": "budget", "t": "A step budget stops runaway loops."},
             {"a": 6, "b": 10, "key": "verifier", "t": "No tool call means a draft answer. Verify it before release."},
             {"a": 11, "b": 14, "key": "evidence", "t": "Every tool result feeds the evidence log."},
             {"a": 15, "b": 16, "key": "remember", "t": "Learn after the answer, and attach citations."}]},
  "In code, the loop is surprisingly small. [pause] Build the context. Then, within a step budget, call the model with the tool schemas. "
  "[pause] If the model didn't ask for a tool, it has a draft answer. Run the verifier. If it passes, we're done. "
  "If not, the problems go back to the model as a message, and it tries again. [pause] If it did ask for tools, run each one, "
  "add its provenance to the evidence, and feed back a clipped result. [pause] At the end, remember what's worth learning, and attach citations.", 4),
 ("x_trace", {"kicker": "Worked example · part 1", "title": "Is Acme's margin improving?", "events": [
     {"k": "user", "body": "Is Acme's margin improving, while its debt stays under control?", "key": "asks"},
     {"k": "memory", "body": "recalled: prefers ₹ crore, consolidated · balance_sheet.xlsx is in ₹ lakh", "key": "recalls"},
     {"k": "plan", "body": "1) net margin trend, 8 quarters  2) debt to equity, 3 periods  3) why: management commentary", "key": "plans"},
     {"k": "call", "body": "get_metrics(company=\"acme\", metrics=[\"net_margin\"], periods=\"last_8q\")", "key": "calls"},
     {"k": "result", "body": "8 rows · source q*_results.pdf p4 · unit pct", "key": "comes",
      "table": {"head": ["period", "Q2FY25", "Q3FY25", "Q4FY25", "Q1FY26", "Q2FY26"], "rows": [["net margin %", *[f"{m:.2f}" for m in MARGIN[3:]]]]}}]},
  "Let's run the example end to end. [pause] The user asks our question. [pause] The harness recalls two memories. The user prefers crore, "
  "and this balance sheet file is in lakh. [pause] The model plans three sub-questions: the margin trend, debt to equity, and why. "
  "[pause] It calls get metrics for net margin, eight quarters. [pause] The result comes back as a small table, with its source and unit. "
  "Every cell is logged as evidence.", 4),
 ("x_trace", {"kicker": "Worked example · part 2", "title": "…and is its debt under control?", "events": [
     {"k": "call", "body": "get_metrics(company=\"acme\", metrics=[\"debt_to_equity\"], periods=[\"FY24\",\"FY25\",\"H1FY26\"])", "key": "calls"},
     {"k": "result", "body": "lakh → crore applied at ingest · source balance_sheet.xlsx BS!C14:E22", "key": "falls",
      "table": {"head": ["period", *BS_Y], "rows": [["borrowings ₹ cr", *[f2(v) for v in DEBT_CR]], ["equity ₹ cr", *[f2(v) for v in EQ_CR]], ["D/E (x)", *[f"{v:.2f}" for v in DE]]]}},
     {"k": "call", "body": "search_docs(\"margin drivers\", company=\"acme\", doc_type=\"concall\", period=\"Q2FY26\")", "key": "searches"},
     {"k": "result", "body": "\"…operating leverage and a better product mix…\"  [acme_q2fy26_concall.pdf · p7]", "key": "quote"}]},
  "Second sub-question. The model calls get metrics for debt to equity. [pause] The conversion from lakh to crore already happened at ingest, "
  f"so the ratio is right. Debt to equity falls from {DE[0]:.2f} to {DE[2]:.2f}. [pause] Third, the why. The model searches the earnings call "
  "for margin drivers. [pause] It gets back a quote, with the document and page. That's all the evidence it needs.", 4),
 ("statement", {"kicker": "Research says: keep the loop simple", "lines": ["A plain ReAct loop", "is enough.", "Add agents only when", "evals say so."], "accent": 1,
                "sub": "arXiv 2608.22651: think → run SQL → observe → fix beat elaborate multi-agent pipelines on text-to-SQL"},
  "Should you build five cooperating agents? Probably not yet. [pause] A 2026 paper titled Iteration Without Elaboration found that a plain "
  "loop of think, run SQL, observe, and fix is enough for text to SQL. [pause] Start with one agent and one loop. "
  "[pause] Add sub-agents later, when your evals show you need them. For example, one per company, in a five-company comparison.", 4),

 # ---------------------------------------------------------------- 5 · trust + memory
 ("divider", {"n": 5, "total": 6, "title": "Trust and memory", "sub": "verify every number · remember every correction"}, "Part five. Trust, and memory. [pause] How the harness checks every number, and learns from every correction.", 5),
 ("x_verify", {"kicker": "Step 5 · the verifier gate", "title": "Every number must match the evidence",
   "claims": [{"t": "Net margin rose from {n} a year ago", "n": f"{MARGIN[3]:.2f}%", "ok": True, "e": 0, "key": "rose"},
              {"t": "to {n} in Q2FY26.", "n": f"{MARGIN[7]:.2f}%", "ok": True, "e": 1, "key": "now"},
              {"t": "Revenue grew {n} year on year.", "n": f"{WRONG_YOY:.2f}%", "ok": False, "e": 2, "fix": f"{YOY[7]:.2f}%", "key": "grew"},
              {"t": "Debt to equity fell to {n}.", "n": f"{DE[2]:.2f}x", "ok": True, "e": 3, "key": "fell"}],
   "evidence": [{"k": "net_margin Q2FY25", "v": f"{MARGIN[3]:.2f}", "src": "q2fy25.pdf p4"},
                {"k": "net_margin Q2FY26", "v": f"{MARGIN[7]:.2f}", "src": "q2fy26.pdf p4"},
                {"k": "yoy(revenue) Q2FY26", "v": f"{YOY[7]:.2f}", "src": "metrics.yaml"},
                {"k": "D/E H1FY26", "v": f"{DE[2]:.2f}", "src": "BS!C14:E22"},
                {"k": "borrowings H1FY26", "v": f2(DEBT_CR[2]), "src": "BS!E14"}]},
  "Now the gate that makes this trustworthy. [pause] The verifier pulls every number out of the draft and looks for it in the evidence log. "
  f"[pause] Net margin rose from {MARGIN[3]:.2f} percent. Found. [pause] To {MARGIN[7]:.2f} now. Found. [pause] "
  f"Revenue grew {WRONG_YOY:.1f} percent. Not found. The model estimated that in its head. [pause] The verifier sends it back, "
  f"the model calls the tool, and the real figure is {YOY[7]:.2f} percent. [pause] Debt to equity fell to {DE[2]:.2f}. Found. "
  "[pause] Zero uncited numbers. Only now does the answer go out.", 5),
 ("list", {"kicker": "Beyond matching", "title": "Sanity rules that catch the rest", "items": [
     {"h": "Units", "d": "a 100× jump between periods is a lakh–crore slip"},
     {"h": "Ranges", "d": "margins within ±100%, D/E never negative"},
     {"h": "Periods", "d": "contiguous quarters, fiscal calendar mapped"},
     {"h": "Conflicts", "d": "if sources disagree, show both, pick neither"},
     {"h": "As-of", "d": "every answer states how fresh its data is"},
     {"h": "Refusal", "d": "'not in the loaded documents' beats a guess"}]},
  "Matching numbers catches most errors. A few simple rules catch the rest. [pause] Units: a hundred times jump is almost always a unit slip. "
  "[pause] Ranges: margins stay within plus or minus a hundred percent. [pause] Periods must be contiguous. [pause] Conflicts are shown, "
  "not hidden. [pause] Every answer states its as-of date. [pause] And refusal is a feature. Not in the loaded documents is a far better answer than a guess.", 5),
 ("x_table", {"kicker": "Measure it", "title": "A golden set, before any clever features",
   "cols": [{"h": "question type", "w": 1.6}, {"h": "example", "w": 3.2}, {"h": "graded by", "w": 1.6}],
   "rows": [["lookup", "Acme PAT in Q2FY26?", "exact ± 0.5%"], ["trend", "Margin over 8 quarters?", "exact series"],
            ["ratio", "D/E in H1FY26?", "exact ± 0.5%"], ["cross-source", "PDF vs Excel PAT agree?", "flags conflict"],
            ["narrative", "Why did margin rise?", "judge + citation"], ["refusal", "Q2FY26 cash flow?", "says 'not loaded'"]],
   "marks": [{"r": 4, "c": 2, "key": "judge", "tone": "bad", "note": "validate the LLM judge against human labels first: one public write-up found it inflated scores by 34%"}]},
  "How do you know it works? Build a golden set before adding clever features. [pause] About fifty questions across a few companies, "
  "mixing lookups, trends, ratios, cross-source checks, narrative whys, and questions it should refuse. [pause] Numbers are graded exactly, "
  "within a small tolerance. [pause] For narrative answers you'll use an LLM judge. But validate that judge against human labels first. "
  "In one public FinanceBench write-up, an unchecked judge inflated scores by thirty four percent.", 5),
 ("x_table", {"kicker": "Memory, Mem0-style", "title": "What to remember, and where",
   "cols": [{"h": "layer", "w": 1.3}, {"h": "what", "w": 3.4}, {"h": "stored in", "w": 1.7}],
   "rows": [["working", "this session's evidence log", "process memory"],
            ["short-term", "the conversation, compacted", "session store"],
            ["preferences", "'show ₹ crore', 'I hold HAL and KEI'", "Mem0 (vector)"],
            ["tribal knowledge", "'broker_x.xlsx is in lakh' — when source = broker_x", "Mem0 + applies_when"],
            ["NOT memory", "financial numbers", "facts table only"]],
   "marks": [{"r": 3, "c": 1, "key": "tribal", "tone": "hi", "note": "Tk-Boost (arXiv 2602.13521): corrections + applicability conditions → +16.9% Spider 2.0, +13.7% BIRD"},
             {"r": 4, "c": 0, "key": "never", "tone": "bad", "note": "numbers live in the facts table, with provenance, never in memory"}]},
  "Now memory, just like the Mem0 system from our last video. [pause] Working memory is this session's evidence. Short-term memory is the conversation. "
  "Preferences are durable facts about the user. [pause] The most valuable layer is tribal knowledge: corrections the agent learned the hard way, "
  "each stored with a condition for when it applies. [pause] A 2026 paper called Tk-Boost did exactly this for SQL agents, and improved accuracy "
  "by up to sixteen point nine percent on Spider two. [pause] One rule. Never keep financial numbers in memory. They live in the facts table, with provenance.", 5),
 ("flow", {"kicker": "The learning loop", "title": "A correction made once, applied forever", "steps": [
     {"h": "User corrects", "d": "'those borrowings are lakh, not crore'"},
     {"h": "Extract learning", "d": "fact + applies_when: source = broker_x.xlsx"},
     {"h": "Store", "d": "ADD, UPDATE or NOOP against existing memories"},
     {"h": "Recall next time", "d": "context builder injects it for matching sources"}]},
  "Here's how a correction becomes a skill. [pause] The user corrects the agent: those borrowings are in lakh. [pause] After the session, "
  "the harness extracts a learning, with a condition: when the source is this broker's file. [pause] It's stored, and like Mem0, it's compared "
  "with existing memories first, to add, update, or skip. [pause] Next session, any question touching that file will recall it in the context builder. "
  "[pause] The same mistake never happens twice.", 5),

 # ---------------------------------------------------------------- 6 · build plan
 ("divider", {"n": 6, "total": 6, "title": "Your build plan", "sub": "Python + uv, on your laptop, in seven phases"}, "Part six. Your build plan. [pause] What to install, what to build first, and how to know it works.", 6),
 ("list", {"kicker": "The stack", "title": "Small, local, and boring on purpose", "items": [
     {"h": "Python + uv", "d": "one repo, pinned deps, uv run cli.py ask …"},
     {"h": "Claude API", "d": "Sonnet 5 for the loop, Haiku 4.5 for extraction"},
     {"h": "DuckDB", "d": "facts, Excel and attached databases in one engine"},
     {"h": "Docling", "d": "local PDF parsing, pdfplumber as fallback"},
     {"h": "LanceDB + BM25", "d": "hybrid search over commentary"},
     {"h": "Mem0 OSS", "d": "long-term memory with applies_when"}]},
  "Here's the stack. Small, local, and boring on purpose. [pause] Python with U V. [pause] The Claude API, with Sonnet five running the loop "
  "and Haiku doing cheap extraction. [pause] DuckDB as the single engine. [pause] Docling to parse PDFs locally. [pause] LanceDB plus keyword search "
  "for commentary. [pause] And Mem0, the open source version, for long-term memory.", 6),
 ("x_code", {"kicker": "Repository layout", "title": "Where everything lives", "file": "data-harness/", "lines": [
     "data/raw/{pdf,excel,db}/        # your inputs",
     "harness/loop.py                 # the agent loop + budgets",
     "harness/context.py              # prefix, memory recall, compaction",
     "harness/tools/                  # list_sources get_metrics query_sql ...",
     "harness/ingest/                 # pdf.py excel.py sql.py reconcile.py",
     "harness/semantic/metrics.yaml   # the semantic layer",
     "harness/verify.py               # numbers-in-evidence gate + sanity rules",
     "harness/memory.py               # Mem0 wrapper with applies_when",
     "harness/trace.py                # JSONL trace of every step",
     "evals/golden.yaml               # ~50 questions with answers",
     "cli.py                          # uv run cli.py ask \"...\""],
   "notes": [{"a": 1, "b": 1, "key": "inputs", "t": "Start with three companies you actually follow."},
             {"a": 5, "b": 7, "key": "ingest", "t": "Ingest, semantic layer and verifier are the value."},
             {"a": 10, "b": 11, "key": "golden", "t": "Evals and a CLI from week one."}]},
  "And here's the repository. [pause] Raw inputs go in the data folder. Seed it with three companies you actually follow. "
  "[pause] The harness folder holds the loop, the context builder, and the tools. [pause] The real value sits in three folders: ingest, "
  "the semantic layer, and the verifier. [pause] Traces go to a J S O N L file. And the golden eval set sits beside a simple command line.", 6),
 ("x_table", {"kicker": "Seven phases", "title": "Build it in this order",
   "cols": [{"h": "phase", "w": 1.9}, {"h": "build", "w": 3.4}, {"h": "done when", "w": 3.0}],
   "rows": [["0 · setup", "uv init, API key, data for 3 companies", "files in data/raw"],
            ["1 · minimal loop", "150-line loop + query_sql over Excel", "answers 'revenue, last 4Q'"],
            ["2 · ingestion", "PDF → facts + chunks; catalog", "totals tie out"],
            ["3 · semantic layer", "metrics.yaml + get_metrics", "margin, D/E, YoY exact"],
            ["4 · verify + cite", "evidence log, gate, refusals", "0 uncited numbers"],
            ["5 · memory", "Mem0 + applies_when", "a correction sticks"],
            ["6 · evals + traces", "golden set, trace viewer", "a score to beat"],
            ["7 · extend", "MCP server, sub-agents, live prices", "5-company compare"]],
   "ats": [0.038, 0.085, 0.309, 0.408, 0.476, 0.554, 0.601, 0.732]},
  "Build it in this order. [pause] Phase zero, setup. [pause] Phase one, a minimal loop with one SQL tool over an Excel file. "
  "You'll have something working on day one. [pause] Phase two, ingestion. PDFs become facts and chunks. [pause] Phase three, the semantic layer. "
  "[pause] Phase four, the verifier and citations. [pause] Phase five, memory. [pause] Phase six, evals and traces. That one never really ends. "
  "[pause] And phase seven, extend. Expose your tools over M C P, so Claude Code can use your harness too. Add sub-agents, and live prices.", 6),
 ("statement", {"kicker": "Where to start this week", "lines": ["Day 1: one loop,", "one tool, one Excel file.", "Then earn every feature", "with an eval."], "accent": 3,
                "sub": "The full plan, with every source, is in the Obsidian note: 'Data Harness for Financial Analysis'."},
  "So where do you start this week? [pause] Day one: one loop, one tool, and one Excel file. Ask it for revenue over four quarters, "
  "and read the trace. [pause] Then earn every new feature with an eval. [pause] The full plan, with the research and every source, "
  "is in the companion note.", 6),
 ("recap", {"title": "A data harness in one breath", "items": [
     "The model is the engine; the harness is the car",
     "Prepare data before the question: rows for numbers, chunks for prose",
     "One facts table: value + unit + basis + source + locator",
     "Metrics in a semantic layer: the model picks, code computes",
     "Few sharp tools, instructive errors, compact results",
     "Loop: context → model → tools → observe → verify → answer",
     "Memory stores corrections, never numbers",
     "Measure everything: golden evals from week one"], "closer": "Every number traceable to a cell."},
  "Let's recap. [pause] The model is the engine. The harness is the car. [pause] Prepare data before the question. [pause] Keep one facts table, "
  "where every value carries its provenance. [pause] Put metrics in a semantic layer, so code computes and the model only chooses. "
  "[pause] Keep tools few and sharp. [pause] Run a simple loop that verifies before it answers. [pause] Let memory store corrections, not numbers. "
  "[pause] And measure everything. [pause] The goal: every number traceable to a cell. [pause] The example numbers were illustrative, and none of this "
  "is investment advice. Thanks for watching.", 6),
]

# ------------------------------------------------------------------ pipeline (from projects/_template_pack)
ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = subprocess.run(["git", "-C", ROOT, "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip()
PUB = os.path.join(REPO, "composer", "public", PREFIX)
RAW, FIN, ART = os.path.join(ROOT, "assets", "raw"), os.path.join(ROOT, "assets"), os.path.join(ROOT, "artifacts")
for d in (PUB, RAW, ART, os.path.join(ROOT, "renders")): os.makedirs(d, exist_ok=True)
_K = None
def kokoro():
    global _K
    if _K is None:
        _K = Kokoro(os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx"), os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin"))
    return _K
def spoken(t):
    for a, b in PRON: t = re.sub(a, b, t)
    return t
def ffdur(p): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
def silence(path, secs):
    if not os.path.exists(path): subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", str(secs), path], check=True)
    return path

def tts(bid, text):
    fin = os.path.join(FIN, f"{bid}.wav")
    if os.path.exists(fin): return fin
    parts = [p.strip() for p in text.split("[pause]") if p.strip()]
    lines = []
    for i, p in enumerate(parts):
        cp = os.path.join(RAW, f"{bid}_{i}.wav")
        s, sr = kokoro().create(spoken(p), voice="af_bella", speed=1.0, lang="en-us"); sf.write(cp, s, sr, subtype="PCM_16")
        lines.append(f"file '{cp}'")
        if i < len(parts) - 1: lines.append(f"file '{silence(os.path.join(RAW, '_p.wav'), PAUSE)}'")
    lst = os.path.join(RAW, f"{bid}.txt"); open(lst, "w").write("\n".join(lines))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-filter:a", f"atempo={ATEMPO}", "-ar", "24000", "-ac", "1", fin], check=True)
    return fin

def word_times(text, dur):
    parts = text.split("[pause]"); words = sum(len(p.split()) for p in parts) or 1
    pp = PAUSE / ATEMPO; wt = max(0.01, dur - (len(parts) - 1) * pp) / words; t, out = 0.0, []
    for i, p in enumerate(parts):
        for w in p.split(): out.append((w, t / dur)); t += wt
        if i < len(parts) - 1: t += pp
    return out

STOP = {"the", "and", "for", "with", "from", "into", "your", "about", "that", "this", "what", "how", "why", "are", "its", "one", "new", "plus"}
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())

def find_seq(keys, wt):
    """spoken-time fraction for each key word, searched in order (≈0.03 early)."""
    ats, cursor = [], 0
    for key in keys:
        hit = next((k for k in range(cursor, len(wt)) if key and norm(wt[k][0]).startswith(key)), None) if key else None
        if hit is None: ats.append(None); continue
        ats.append(round(max(0.0, wt[hit][1] - 0.03), 3)); cursor = hit + 1
    return ats

def autosync(kind, props, text, dur):
    """Reveal each item as it is SPOKEN. Items: list/recap/flow/statement/chart/x_diagram/x_loop/x_context heads;
    any dict list whose entries carry a spoken 'key' (x_code notes, x_trace events, x_table marks, x_verify claims)."""
    wt = word_times(text, dur)
    props = dict(props)
    for field in ("notes", "events", "marks", "claims"):
        if field in props and any("key" in e for e in props[field]):
            ats = find_seq([norm(e.get("key", "")) for e in props[field]], wt)
            if field == "notes" or field == "marks":
                props[field] = [{**e, "at": a if a is not None else e.get("at", 0.5)} for e, a in zip(props[field], ats)]
            else:
                props["ats"] = [a if a is not None else (ats[i - 1] or 0) + 0.05 for i, a in enumerate(ats)]
            print(f"      sync {field}: {ats}")
    if "ats" in props: return props
    h = lambda x: x["h"] if isinstance(x, dict) else str(x)
    heads = ([h(i) for i in props.get("items", [])] if kind in ("list", "recap") else
             [h(s) for s in props.get("steps", [])] if kind in ("flow", "x_loop") else
             props.get("lines", []) if kind == "statement" else
             [b["label"] for b in props.get("bars", [])] if kind == "chart" else
             [h(n) for n in props.get("nodes", [])] if kind == "x_diagram" else
             [h(s) for s in props.get("segs", [])] if kind == "x_context" else None)
    if not heads: return props
    keys = [next((norm(w) for w in hd.replace("_", " ").split() if len(norm(w)) > 2 and norm(w) not in STOP and not norm(w).isdigit()), "") for hd in heads]
    ats = find_seq(keys, wt)
    if all(a is None for a in ats): return props
    print(f"      sync heads: {ats}")
    return {**props, "ats": [a if a is not None else (ats[i - 1] or 0) + 0.05 for i, a in enumerate(ats)]}

def cues_for(text, dur, t0):
    parts = text.split("[pause]"); words = sum(len(p.split()) for p in parts) or 1
    pp = PAUSE / ATEMPO; wt = max(0.01, dur - (len(parts) - 1) * pp) / words; ct, out = t0, []
    for i, p in enumerate(parts):
        w = p.split()
        for k in range(0, len(w), 8):
            ch = w[k:k + 8]; out.append([round(ct, 3), round(ct + wt * len(ch), 3), " ".join(ch)]); ct += wt * len(ch)
        if i < len(parts) - 1: ct += pp
    return out

if __name__ == "__main__":
    import sys
    if "--words" in sys.argv:
        for n, b in enumerate(BEATS): print(f"b{n:02d} {b[0]:10s} {len(b[2].replace('[pause]', ' ').split()):4d}")
        print("TOTAL words", sum(len(b[2].replace("[pause]", " ").split()) for b in BEATS)); raise SystemExit
    chapters = {}
    for n, (kind, props, text, ch) in enumerate(BEATS):
        bid = f"b{n:02d}"; wav = tts(bid, text); d = ffdur(wav)
        print(f"ch{ch:02d} {bid} {kind:10s} {d:6.2f}s{'  ⚠ LONG >90s' if d > 90 else ''}")
        chapters.setdefault(ch, []).append((bid, kind, autosync(kind, props, text, d), text, wav, d))
    gap = silence(os.path.join(RAW, "_g.wav"), GAP); total = 0.0; out = []
    for ch, beats in sorted(chapters.items()):
        lst = os.path.join(RAW, f"_ch{ch:02d}.txt"); open(lst, "w").write("\n".join(f"file '{b[4]}'\nfile '{gap}'" for b in beats))
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", os.path.join(PUB, f"ch{ch:02d}.wav")], check=True)
        t, cues, rb = 0.0, [], []
        for bid, kind, props, text, wav, d in beats:
            cues += cues_for(text, d, t); rb.append({"id": bid, "kind": kind, "dur": round(d + GAP, 3), "props": props}); t += d + GAP
        j = os.path.join(ART, f"ch{ch:02d}.json")
        PARTS = ["intro", "part 1 · harness", "part 2 · data plane", "part 3 · metrics + tools", "part 4 · loop", "part 5 · trust + memory", "part 6 · build plan"]
        json.dump({"pack": PACK, "meta": {**META, "issue": PARTS[ch], "code": f"DH · {'P' + str(ch) if ch else 'intro'}"}, "beats": rb, "captions": cues if CAPTIONS else [], "audio": f"{PREFIX}/ch{ch:02d}.wav"}, open(j, "w"), indent=1, ensure_ascii=False)
        out.append(j); total += t; print(f"  → {os.path.basename(j)}  {t:.1f}s")
    words = sum(len(b[2].replace("[pause]", " ").split()) for b in BEATS)
    print(f"TOTAL {total:.1f}s ({total/60:.2f} min) · {len(BEATS)} beats · {words} words · pack={PACK}")
