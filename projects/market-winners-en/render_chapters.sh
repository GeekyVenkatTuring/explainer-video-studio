#!/bin/bash
# Renders every per-chapter props JSON to renders/chNN.mp4, then concatenates a
# master.mp4. Idempotent: existing chNN.mp4 are skipped (delete one to re-render).
# Auto-discovers new chapters as build.py emits them. Run from anywhere.
set -e
REPO="/Users/appuram/Developer/explainer-forge"
CH="$REPO/projects/market-winners-en/artifacts/ch"
OUT="$REPO/projects/market-winners-en/renders"
mkdir -p "$OUT"
cd "$REPO/composer"

CONCAT="$OUT/_concat.txt"; : > "$CONCAT"
for j in $(ls "$CH"/ch*.json | sort); do
  name=$(basename "$j" .json)
  mp4="$OUT/$name.mp4"
  if [ ! -f "$mp4" ]; then
    echo ">>> rendering $name ..."
    npx remotion render Explainer "$mp4" --props="$j" --concurrency=4 --log=error
  else
    echo "=== $name.mp4 exists — skip"
  fi
  echo "file '$mp4'" >> "$CONCAT"
done

echo ">>> concatenating master.mp4"
ffmpeg -y -f concat -safe 0 -i "$CONCAT" -c copy "$OUT/master.mp4" -loglevel error
echo "MASTER DONE -> $OUT/master.mp4"
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT/master.mp4"

# ---- deliver to the user's generated_videos folder ----
DELIVER="$HOME/Downloads/generated_videos"
mkdir -p "$DELIVER"
cp -f "$OUT/master.mp4" "$DELIVER/who-actually-made-money.mp4"
echo "DELIVERED -> $DELIVER/who-actually-made-money.mp4"
ls -la "$OUT"/*.mp4
echo "MASTER DURATION (s):"; ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$DELIVER/who-actually-made-money.mp4"
