# Design-QA — `quant-finance-en` (prefix `fq`)

Stills: `projects/quant-finance-en/qa-stills/<id>.png` (mid-cut, ~60% of each beat).
Checked against VIDEO_SPEC §3 and skills/09 §9. **Cursor owns `fund.tsx` only.** Core / tech / apply issues are flagged here, not patched.

**EDL note:** `artifacts/edit_decisions.json` was not present after waiting on Codex TTS. Stills used skill-06 30s stub props (same cut ids / variants / divider+recap props as `build.py`). Re-QA on the real EDL if durs differ a lot.

**Kit-wide:** `StatChip` labels are 13px in `fq/kit.tsx` (below the ≥19 floor). Not edited here.

---

## Fixed in `fund.tsx` (re-stilled f01–f07)

| id | Issue | Fix |
|---|---|---|
| f01 | Bottom ₹720 / ₹59,405 strip landed at p≈0.78 — mid-still was empty below the cap cards | Strip at p≈0.52–0.62 |
| f02 | Comparison chips at p≈0.78; P/E counter still tweening; labels 16–18px | Chips + 14-bar fill front-loaded; labels ≥20 |
| f03 | Counter showed **1.63×** mid-tween vs copy **1.85×**; chips late | Counter/fill done by ~p 0.50; chips earlier |
| f04 | Years 3–4 bars not grown at mid; chips at p≈0.7+ | Bar phases compressed; chips ~p 0.50; bar max height trimmed so year labels stay in the card |
| f05 | Takeaway at p≈0.80; gauge titles 15px | Takeaway ~p 0.58; titles 20px; gauges earlier |
| f06 | PEG counter showed **0.3** vs copy **0.6**; pick row at p≈0.72 | Counter completes to 0.6 by p 0.50; picks ~p 0.52 |
| f07 | Verdict + Div-yield missing at mid; `Flow` used stage coords inside the verdict box (would paint off-frame / into the caption band) | Metrics + verdict by ~p 0.52; Flow local to the verdict card |
| all fund | Mono labels 15–18px | Bumped to 20 |

---

## Flagged — `core.tsx` (Claude)

- **t00 Title:** TickStrip at `y=800, h=150` is specified to reach y=950 (into the caption band). Mid-still looked OK; verify on a late frame and with captions ON.
- **t01 Lenses:** Third TA bullet (“Timing”) phases in around p≈0.60 — missing on the mid-still. TickStrip at x=790 sits in the gap between cards (decorative; watch overlap if cards grow). Right card `x=1060, w=760` → 1820 exactly.
- **d1/d2/d3 Dividers:** Layout OK at mid. Pips at `y=860` are tight vs y=900 once captions burn in. TickStrip under the title can sit close to the subtitle.
- **r00 Recap:** Mid-still clean (6 items, closer not yet). Closer at p≈0.78 — confirm it does not collide with captions. No `SceneProgress` motion besides the top bar.

---

## Flagged — `tech.tsx` (Codex)

- **g01 Chart:** SVG label `DAILY CLOSE · COMPUTED TAPE` overlaps the definition **DEFINITION** badge (chart `top=235` vs cards `y=190`). Chart `overflow:visible` collides with the teaching cards. `fontSize=18` on DAY 1/130. Cards at y=190 enter the header zone (content should start ≥200).
- **g02 DMA:** Same chart/card overlap. Definition body looked double-printed / smeared on the still. `Motion` Flow at y=820 with `curve={90}` can dip toward y=900. Reliance chips at x=1290 sit on the chart.
- **g03 RSI:** Large **0.0 / 0/0** over the dial (Counter/text on the needle). Worked RSI chip very low contrast at mid. Cards y=190 (header zone).
- **g04 Vol/beta:** Mid-still OK for chips. Nifty β track + Reliance 0.94 chip + Verdict at y=805 land late — empty lower third at 60%. `Motion y={850}` is in the caption keep-out. Computed β 0.04 vs brief **0.94** is a teaching mismatch (tape vs Reliance).
- **g05 52w:** Marker used **computed** tape position (near the high) vs narration **Reliance at 8% of range**. Worked chips / verdict late at mid. `Motion y={850}`.
- **g06 Apply TA:** 2×2 grid OK; verdict band `top=690` + `Verdict` at y=805 not on at p=0.6 (blank lower third). Wire/Flow through the card gap is fine. Head kicker is long.

---

## Flagged — `apply.tsx` (Claude)

- **a01 Score:** Composite **Counter** still **8** at mid (target 62) — finish the count by ~p 0.55. Threshold ladder `y=700` not visible yet. Weight labels `fontSize={18}`. Composite card `x=1200, w=600` → 1800.
- **a02 Concentration:** Effective-bets Counter still **0.00** at mid (target 2.46). Formula `= 1 ÷ Σ w²` may overflow the 470px callout. Takeaway at p≈0.82 missing. ARDEE 59.7% bar ×900px + label can crowd the callout at x=1330.
- **a03 Funnel:** Stage 5 label clipped to **“ortlist”** (bar width 380×o too narrow for “23 Shortlist studied”). Last stage y=250+500=750; Flow into the next stage plus a low green stem risk y>900. Stage 6 (“5 Picks”) not on at mid.
- **a04 Picks:** Mid-still OK. `MONTH` 17px, theme line 18px, `SCORE` 14px (below 19). `scale(1.03)` on the hot card — keep x+w≤1820 (DATAPATTNS at x=1476, w=320).
- **a05 Targets:** Mid-still OK. Empty band below ~y=710.
- **a06 Valuation:** Bull bar Counter mid-tween (**₹3,229** vs **₹5,651**) so bull is the *shortest* bar. “now ₹4,861” at `left: 1630` may clip past x=1820. Labels at `Y0+12=772`; bull value labels at `Y0 - h - 68` can enter the header when fully grown (~y=184). Takeaway at p≈0.72 missing at mid.
- **a07 GTT:** Price-now **dot overlaps “4” in ₹4,861**. Target row `y=300` (`₹5,099`) not on at mid. Ladder lines `width: 900` from x=700 → 1600 (OK). Stop at y=720 is safe vs 900.

---

## Not a layout defect (numbers)

Fund stills use VIDEO_SPEC figures (HDFC ₹720, P/E 14, P/B 1.85, DIXON PEG ~0.6, etc.). Tech 52-week marker and computed beta do not match the Reliance worked example in the brief.
