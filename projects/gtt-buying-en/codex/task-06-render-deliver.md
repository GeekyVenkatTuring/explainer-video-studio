# Codex Task 06 — Final render + verify + deliver

Only run this when Claude says QA is done and tsc is clean. It renders the full video.

## Steps
1. Confirm clean: `cd composer && npx tsc --noEmit` (must be exit 0).
2. Make sure narration + props are current: `projects/midcap5-picks-en/.venv/bin/python3 projects/gtt-buying-en/build.py`
   (idempotent; prints total minutes and scene count).
3. Final render (run in BACKGROUND; ~90–110 min for ~16–17 min at concurrency 8):
   ```
   cd composer && npx remotion render Explainer \
     ../projects/gtt-buying-en/renders/final.mp4 \
     --props=../projects/gtt-buying-en/artifacts/edit_decisions.json --concurrency=8
   ```
   Remotion writes the MP4 only at the very end — an empty renders/ dir mid-run is normal.
   Check liveness with `ps aux | grep chrome-headless`.
4. When it finishes, verify:
   ```
   ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 \
     projects/gtt-buying-en/renders/final.mp4
   ffprobe -v error -show_entries stream=codec_type,codec_name -of csv=p=0 \
     projects/gtt-buying-en/renders/final.mp4    # expect h264 + aac
   ```
   Extract 3 spot-check frames (early/mid/late) with `ffmpeg -ss <t> -i final.mp4 -frames:v 1 codex/verify_<t>.png`.
5. Deliver: copy to `~/Downloads/generated_videos/gtt-buy-schedule-explained.mp4`.
6. Write codex/task-06-RESULT.md: duration, size, codecs, scene count, and confirm the delivery path exists.
