#!/bin/sh
# Render approved keys from queue.txt one at a time (after earlier queues finish). "END" stops.
cd /Users/appuram/Developer/explainer-forge/projects/ipo-live-28sep-2026
while pgrep -f "render_deliver.py (orient|acevector)" >/dev/null; do sleep 10; done
touch done.txt
while true; do
  k=$(grep -vxF -f done.txt queue.txt | head -1)
  [ "$k" = "END" ] && exit 0
  if [ -z "$k" ]; then sleep 15; continue; fi
  python3 render_deliver.py "$k"; echo "$k" >> done.txt
done
