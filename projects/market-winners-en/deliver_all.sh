#!/bin/bash
# Delivers the master + every chapter video to ~/Downloads/generated_videos/.
# Run AFTER render_chapters.sh has produced all renders/chNN.mp4 + master.mp4.
set -e
OUT="/Users/appuram/Developer/explainer-forge/projects/market-winners-en/renders"
DELIVER="$HOME/Downloads/generated_videos"
CHDIR="$DELIVER/who-actually-made-money-chapters"
mkdir -p "$CHDIR"

# master
cp -f "$OUT/master.mp4" "$DELIVER/who-actually-made-money.mp4"

# descriptive per-chapter names
declare -a NAMES=(
 "ch00:00-cold-open"
 "ch01:01-the-two-questions"
 "ch02:02-radhakishan-damani"
 "ch03:03-vijay-kedia"
 "ch04:04-rekha-jhunjhunwala"
 "ch05:05-ashish-kacholia"
 "ch06:06-mukul-agrawal"
 "ch07:07-dolly-khanna"
 "ch08:08-sunil-singhania"
 "ch09:09-anil-kumar-goel"
 "ch10:10-where-money-flowed"
 "ch11:11-the-2026-ipo-winners"
 "ch12:12-the-boring-winners-sip"
 "ch13:13-spot-the-fake-part1"
 "ch14:14-spot-the-fake-part2"
 "ch15:15-what-actually-works"
 "ch16:16-recap-and-disclaimer"
)
for pair in "${NAMES[@]}"; do
  ch="${pair%%:*}"; nm="${pair##*:}"
  if [ -f "$OUT/$ch.mp4" ]; then
    cp -f "$OUT/$ch.mp4" "$CHDIR/$nm.mp4"
  else
    echo "WARN: missing $OUT/$ch.mp4"
  fi
done

echo "DELIVERED master -> $DELIVER/who-actually-made-money.mp4"
echo "DELIVERED chapters -> $CHDIR/"
ls -la "$DELIVER/who-actually-made-money.mp4"
ls -la "$CHDIR/"
