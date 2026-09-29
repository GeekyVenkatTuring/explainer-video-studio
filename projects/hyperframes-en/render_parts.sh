#!/bin/bash
# Disk-safe chunked render: render each PART separately, then concat to master.
set -e
REPO="/Users/appuram/Developer/explainer-forge"
PROJ="$REPO/projects/hyperframes-en"
RENDERS="$PROJ/renders"
mkdir -p "$RENDERS"
cd "$REPO/composer"

echo "== chunked render start: $(date) =="
: > "$RENDERS/concat.txt"
for p in 0 1 2 3 4 5 6 7; do
  J="$PROJ/artifacts/ch/p${p}.json"
  OUT="$RENDERS/p${p}.mp4"
  if [ -f "$OUT" ] && [ -s "$OUT" ]; then
    echo "-- p${p}: already rendered, skip"
  else
    echo "-- p${p}: rendering @ $(date) ; free: $(df -h / | awk 'NR==2{print $4}')"
    npx remotion render Explainer "$OUT" --props="$J" --concurrency=5 2>&1 | tail -3
    [ -s "$OUT" ] || { echo "!! p${p} produced no output"; exit 1; }
  fi
  echo "file '$OUT'" >> "$RENDERS/concat.txt"
done

echo "== concat -> master @ $(date) =="
ffmpeg -y -v error -f concat -safe 0 -i "$RENDERS/concat.txt" -c copy "$RENDERS/hyperframes.mp4"
echo "== DONE: $(ls -la $RENDERS/hyperframes.mp4) =="
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 "$RENDERS/hyperframes.mp4"
