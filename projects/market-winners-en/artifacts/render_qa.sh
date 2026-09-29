#!/bin/bash
# QA stills for the MWScenes scene set. Renders one PNG per scene variant at a
# mid-animation frame from qa_props.json. Run from anywhere.
set -e
REPO="/Users/appuram/Developer/explainer-forge"
PROPS="$REPO/projects/market-winners-en/artifacts/qa_props.json"
OUT="$REPO/projects/market-winners-en/artifacts/qa"
mkdir -p "$OUT"
cd "$REPO/composer"

# scene_id:frame  (each scene = 14s = 420 frames; mid ~60% = 420*k + 250)
PAIRS=(
  "01_title:250"
  "02_macro:670"
  "03_investor_damani:1090"
  "04_investor_kedia:1510"
  "05_bars_ipo:1930"
  "06_case_asmita:2350"
  "07_checklist_flags:2770"
  "08_statement:3190"
  "09_recap:3610"
  "10_divider:4030"
  "11_quote:4450"
)

for pair in "${PAIRS[@]}"; do
  name="${pair%%:*}"; frame="${pair##*:}"
  echo ">>> rendering $name @ frame $frame"
  npx remotion still Explainer "$OUT/$name.png" --props="$PROPS" --frame="$frame" --log=error
done
echo "ALL QA STILLS DONE -> $OUT"
ls -la "$OUT"
