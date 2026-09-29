# Codex Task 01 — TTS toolchain smoke-test + scaffold

You are the build/render worker for the **GTT Buy-Schedule explainer** video. Claude is
designing the scenes in parallel. This first task ONLY verifies the audio pipeline and
scaffolds folders — do NOT touch anything under `composer/` (Claude owns that).

## Do exactly this

1. Create these dirs if missing (inside `projects/gtt-buying-en/`):
   `assets/raw/`, `artifacts/`, `renders/`, `codex/`.

2. Write a throwaway script `codex/tts_smoke.py` that uses **Kokoro ONNX af_bella**
   (offline, direct — NOT Voicebox) exactly like `projects/quant-finance-en/build.py`:
   - `KOKORO_MODEL=~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx`
   - `KOKORO_VOICES=~/.cache/hyperframes/tts/voices/voices-v1.0.bin`
   - `VOICE="af_bella"`, `LANG="en-us"`, `ATEMPO=0.95`
   - Generate this exact 60-word paragraph to `codex/smoke.wav`, apply `atempo=0.95`
     via ffmpeg, then print the ffprobe duration in seconds:

   > "A normal order lives for a single trading day. If it does not fill by the closing
   > bell, it simply dies. A G T T order is different. It is a resting instruction that
   > waits, patiently, for up to one full year. It does nothing until the price you chose
   > is finally touched. Only then does it fire, and place your order automatically."

3. Run it with the venv:
   `projects/midcap5-picks-en/.venv/bin/python3 projects/gtt-buying-en/codex/tts_smoke.py`

4. Report back (write your answer to `codex/task-01-RESULT.md`):
   - the measured duration in seconds of `smoke.wav`,
   - the implied words-per-minute = 60 words / (duration/60),
   - confirmation that af_bella loaded and the WAV plays (ffprobe shows a valid audio stream),
   - any error you hit and how you fixed it.

Keep going until `task-01-RESULT.md` exists with a real measured number. Then STOP and wait —
do not start any other work. Do not edit `composer/`, `build.py`, or any `.tsx`.
