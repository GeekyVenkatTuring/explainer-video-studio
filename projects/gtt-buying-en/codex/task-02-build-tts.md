# Codex Task 02 — Run the narration TTS build

Claude has written `projects/gtt-buying-en/build.py` (full screenplay, Kokoro af_bella,
captions). Run it and report timings. Do NOT edit build.py or anything under `composer/`.

## Do exactly this

1. Run:
   ```
   projects/midcap5-picks-en/.venv/bin/python3 projects/gtt-buying-en/build.py
   ```
   It generates per-segment WAVs into `assets/`, concatenates narration to
   `composer/public/gt/narration.wav`, and writes `artifacts/edit_decisions.json`.
   It prints each segment's duration and a final total.

2. If it errors, fix ONLY environment issues (missing dirs, ffmpeg availability) — do
   NOT change the narration text or numbers. Re-run until it completes.

3. Write `codex/task-02-RESULT.md` with:
   - the full per-segment duration table it printed,
   - the total minutes,
   - any segment flagged `⚠ LONG >90s`,
   - confirmation `composer/public/gt/narration.wav` and `artifacts/edit_decisions.json` exist.

Then STOP and wait. This is idempotent — reruns skip existing WAVs, so it's cheap.
