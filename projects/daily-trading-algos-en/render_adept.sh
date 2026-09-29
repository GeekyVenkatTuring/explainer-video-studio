#!/bin/bash
# Render the 5 ADEPT chapters sequentially (8GB RAM), concat to master, make SRT.
set -e
REPO=/Users/appuram/Developer/explainer-forge
PROJ=$REPO/projects/daily-trading-algos-en
OUT=$PROJ/renders/adept
mkdir -p "$OUT"
cd "$REPO/composer"
CONC=5
for n in 01 02 03 04 05; do
  ED="$PROJ/artifacts/edit_decisions_adept_ch$n.json"
  MP4="$OUT/ch$n.mp4"
  if [ -f "$MP4" ]; then echo "SKIP ch$n"; continue; fi
  echo "=== RENDER adept ch$n @concurrency=$CONC ==="
  npx remotion render Explainer "$MP4" --props="$ED" --concurrency=$CONC --log=error
  dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$MP4")
  echo "DONE ch$n -> ${dur}s"
done
CL="$OUT/concat.txt"; : > "$CL"
for n in 01 02 03 04 05; do echo "file 'ch$n.mp4'" >> "$CL"; done
echo "=== CONCAT MASTER ==="
ffmpeg -y -f concat -safe 0 -i "$CL" -c copy "$OUT/daily-trading-algorithms-adept.mp4" 2>&1 | tail -1
mdur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT/daily-trading-algorithms-adept.mp4")
echo "MASTER duration: ${mdur}s"
echo "ALL RENDERS COMPLETE"
