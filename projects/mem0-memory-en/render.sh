#!/bin/bash
# Render every artifacts/chNN.json with the StyleReel composition, then concat to renders/master.mp4.
set -e
P="$(cd "$(dirname "$0")" && pwd)"; cd "$(git -C "$P" rev-parse --show-toplevel)/composer"
: > "$P/renders/_concat.txt"
for j in $(ls "$P"/artifacts/ch*.json | sort); do
  n=$(basename "$j" .json); out="$P/renders/$n.mp4"
  [ -s "$out" ] || npx remotion render StyleReel "$out" --props="$j" --concurrency=5 --gl=angle --log=error </dev/null
  echo "file '$out'" >> "$P/renders/_concat.txt"; echo "done $n"
done
ffmpeg -y -v error -f concat -safe 0 -i "$P/renders/_concat.txt" -c copy -movflags +faststart "$P/renders/master.mp4"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$P/renders/master.mp4"
