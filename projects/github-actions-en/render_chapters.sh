#!/bin/bash
# Render each chapter → deliver it to ~/Downloads/generated_videos/github-actions-chapters/ as soon as it's done.
# Then concat a master, verify it, deliver it, and (per the brief) delete every intermediate chapter MP4.
set -e
REPO="/Users/appuram/Developer/explainer-forge"
P="$REPO/projects/github-actions-en"
OUT="$P/renders"; CH="$P/artifacts/ch"
DL="$HOME/Downloads/generated_videos"; DLCH="$DL/github-actions-chapters"
MASTER="$DL/github-actions-explained.mp4"
mkdir -p "$OUT" "$DLCH"
cd "$REPO/composer"
: > "$OUT/_concat.txt"
for j in $(ls "$CH"/ch*.json | sort); do
  n=$(basename "$j" .json); mp4="$OUT/$n.mp4"
  if [ ! -s "$mp4" ]; then
    echo ">>> $(date +%H:%M:%S) rendering $n"
    npx remotion render Explainer "$mp4" --props="$j" --concurrency=5 --log=error
  fi
  cp -f "$mp4" "$DLCH/$n.mp4"
  echo "=== $(date +%H:%M:%S) $n done ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$mp4")s) → delivered"
  echo "file '$mp4'" >> "$OUT/_concat.txt"
done
echo ">>> concatenating master"
ffmpeg -y -v error -f concat -safe 0 -i "$OUT/_concat.txt" -c copy -movflags +faststart "$OUT/master.mp4"
cp -f "$OUT/master.mp4" "$MASTER"
echo "MASTER → $MASTER ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$MASTER")s)"
echo ALL_DONE
