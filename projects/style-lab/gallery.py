#!/usr/bin/env python3
"""Archetype gallery: the 8 generic archetypes × every pack, silent, 6s each (props are real + computed)."""
import json, os
ROOT = os.path.dirname(os.path.abspath(__file__))
g = lambda r, t: round((1 + r) ** t, 2)                                    # compound growth, computed
line = [{"x": t, "y": g(0.12, t)} for t in range(0, 21)]
BEATS = [
 ("title", {"kicker": "Personal finance · explained", "title": "The Magic of\nCompounding", "subtitle": "why time beats timing"}),
 ("divider", {"n": 2, "total": 4, "title": "How it grows", "sub": "interest on interest"}),
 ("statement", {"kicker": "The key idea", "lines": ["You earn returns", "on your returns."], "accent": 1,
                "big": f"₹1 → ₹{g(0.12, 20)}", "tex": r"(1.12)^{20} \approx " + str(g(0.12, 20)), "sub": "₹1 at 12% a year, left alone for 20 years (computed)"}),
 ("list", {"kicker": "Three levers you control", "title": "What makes it work", "items": [
     {"h": "Start early", "d": "time does the heavy lifting"}, {"h": "Stay invested", "d": "every exit resets the clock"},
     {"h": "Reinvest", "d": "let the returns earn returns"}, {"h": "Keep costs low", "d": "fees compound too"}]}),
 ("flow", {"kicker": "One cycle, repeated", "title": "How a SIP compounds", "steps": [
     {"h": "Invest", "d": "a fixed amount each month"}, {"h": "Earn", "d": "returns on the whole pot"},
     {"h": "Reinvest", "d": "returns join the principal"}, {"h": "Grow", "d": "a bigger base next month"}]}),
 ("chart", {"kicker": "₹1 at 12% a year", "title": "The curve bends upward", "type": "line", "unit": "",
            "points": line, "note": "value of ₹1, computed as 1.12^t",
            "marks": [{"x": 6, "label": f"×{g(0.12, 6)}"}, {"x": 12, "label": f"×{g(0.12, 12)}"}, {"x": 18, "label": f"×{g(0.12, 18)}"}]}),
 ("versus", {"kicker": "₹1 lakh · 12% · 20 years", "title": "Simple vs compound", "winner": "right",
             "left": {"h": "Simple", "items": ["interest on principal only", f"ends at ₹{round(1 + 0.12 * 20, 2)} lakh", "a straight line"]},
             "right": {"h": "Compound", "items": ["interest on interest", f"ends at ₹{g(0.12, 20)} lakh", "a curve that bends up"]}}),
 ("recap", {"title": "Compounding in one breath", "items": ["Returns earn returns", "Time matters more than timing",
            "Stay invested, reinvest, keep fees low", f"₹1 → ₹{g(0.12, 20)} in 20 years at 12%"], "closer": "Start early. Then wait."}),
]
for pk in ["editorial", "blueprint", "kinetic", "chalk", "studio", "flat", "paper", "brutal", "iso"]:
    beats = [{"id": f"g{i}", "kind": k, "dur": 6.0, "props": p} for i, (k, p) in enumerate(BEATS)]
    json.dump({"pack": pk, "beats": beats, "captions": [], "label": True, "meta": {"brand": "The Money Edit", "project": "Compounding", "issue": "No. 12 · September 2026", "code": "EF-012"}}, open(os.path.join(ROOT, "artifacts", f"gallery_{pk}.json"), "w"), indent=1)
print("ok", g(0.12, 20), g(0.12, 6), g(0.12, 12), g(0.12, 18))
