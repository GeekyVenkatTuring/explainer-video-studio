#!/bin/bash
# Render all 8 chapters sequentially (8GB RAM -> no parallel renders), concat to master.
set -e
REPO=/Users/appuram/Developer/explainer-forge
PROJ=$REPO/projects/daily-trading-algos-en
OUT=$PROJ/renders
mkdir -p "$OUT"
cd "$REPO/composer"
CONC=5
for n in 01 02 03 04 05 06 07 08; do
  ED="$PROJ/artifacts/edit_decisions_ch$n.json"
  MP4="$OUT/ch$n.mp4"
  if [ -f "$MP4" ]; then echo "SKIP ch$n (exists)"; continue; fi
  echo "=== RENDER ch$n @concurrency=$CONC ==="
  npx remotion render Explainer "$MP4" --props="$ED" --concurrency=$CONC --log=error
  dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$MP4")
  echo "DONE ch$n -> ${dur}s"
done
# concat master
CL="$OUT/concat.txt"; : > "$CL"
for n in 01 02 03 04 05 06 07 08; do echo "file 'ch$n.mp4'" >> "$CL"; done
echo "=== CONCAT MASTER ==="
ffmpeg -y -f concat -safe 0 -i "$CL" -c copy "$OUT/daily-trading-algorithms.mp4" 2>&1 | tail -2
mdur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT/daily-trading-algorithms.mp4")
echo "MASTER duration: ${mdur}s ($(echo "scale=2;$mdur/60"|bc) min)"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of default=noprint_wrappers=1 "$OUT/daily-trading-algorithms.mp4"
echo "ALL RENDERS COMPLETE"
