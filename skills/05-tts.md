# Skill 05 — Narration TTS

## DEFAULT (English): Kokoro ONNX, `af_bella`, local, concurrent
This is the standard for every English video. Everything below the next heading
("Legacy: Voicebox") is the OLD path — don't use it unless the user asks.
- In-process `kokoro_onnx`; load `Kokoro(...)` once at module scope (see `kokoro()` in
  `projects/_template_pack/build.py`). Model: `~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx`,
  voices: `~/.cache/hyperframes/tts/voices/voices-v1.0.bin`.
- `create(text, voice="af_bella", speed=..., lang="en-us")` → WAV 24kHz mono per segment.
  The pack template uses `speed=1.0`; the audiobook used 0.90. Tune for pace; keep
  per-segment WAVs, ffprobe-measured durations (they feed `dur`), `[pause]` handling and beat gaps.
- **Concurrency**: synthesize segments in parallel (about 4 workers — a ThreadPool/ProcessPool
  over segments; ONNX sessions are safe per worker; 4 was the proven level, more just contends
  for CPU). Idempotent: skip segments whose WAV exists. Order the concat by beat index, not
  completion order.
- **Length**: af_bella is slower than Nova — measure the printed total and iterate to the target
  (rule 6); don't trust 212 wpm.
- **Captions ON** by default (`CAPTIONS = True` in the pack template); captions and reveal
  timing (`props.ats`) derive from the same measured durations, so sync holds.

## Legacy: Voicebox (Nova) — do not use by default
Local, free TTS via **Voicebox.app** (`/Applications/Voicebox.app`, Kokoro engine).
The HTTP server runs at `http://127.0.0.1:17493` **only while the app is open** —
check first, and if down: `open -a Voicebox`, wait ~5s, re-check.

```bash
curl -s -m 3 http://127.0.0.1:17493/profiles   # up? also lists voice profiles
```

## API (what build.py uses)
- `GET /profiles` — saved voices. Known good: **"TTS Bright (Nova)"**
  `c488e05c-3407-46a3-874d-1b09b3aff78d` (kokoro `af_nova`) — bright, energetic,
  the default for tech explainers. Also "Narrator (Onyx)" (`am_onyx`, deeper male,
  used for system-design videos).
- `POST /generate` `{profile_id, text, engine:"kokoro"}` → `{id}` (async)
- `GET /generate/{id}/status` → SSE-ish lines; poll for `"status":"completed"`
- `GET /audio/{id}` → WAV (24kHz mono)
- New profile: `POST /profiles` `{name, voice_type:"preset", preset_engine:"kokoro",
  preset_voice_id:"af_*|am_*", default_engine:"kokoro"}` — `voice_type:"preset"` is
  required or the profile is broken. Presets: `GET /profiles/presets/kokoro`.

## Rules learned the hard way
- **One generation at a time.** A NEW voice's first generation takes ~30s to load its
  embedding; firing a second request during that load WEDGES the single worker
  (status never completes; `/profiles` still answers). Fix: quit & reopen the app,
  then run ONE patient generation to warm the voice before any batch.
  `osascript -e 'quit app "Voicebox"'; sleep 2; open -a Voicebox`
- No speed parameter — pace is controlled in post. **Default ATEMPO = 0.95** (in the
  build template) because raw Nova (~212 wpm) is too fast for teaching; don't go
  below ~0.9 (muddy). Combined with `[pause]` markers (0.6s inserted silence, split
  and reassembled by build.py) and 0.5s beat gaps, this lands at the ~150–165
  effective wpm comprehension target from skill 02. Feedback that prompted this:
  viewers lose the thread when dense terminology arrives at raw TTS speed.
- **Idempotence**: build.py skips segments whose `assets/<id>.wav` exists. To
  regenerate changed narration, delete only those WAVs. This makes iterate-to-length
  cheap (skill 02).
- Drive the API from Python `urllib` (as in the template) — multi-line shell polling
  loops are flaky in this harness.
- Nova ≈ 212 wpm incl. gaps (the calibration behind skill 02's budget table).

## Swapping TTS backends
Only `gen_one()` in build.py touches Voicebox. Any TTS that yields a WAV per segment
works — keep per-segment files + ffprobe durations + the concat-with-gaps step, since
`dur` injection (the animation contract) depends on real measured durations.

## Localized / non-English narration (e.g. Telugu — proven in projects/credit-cards-te)
Kokoro/Voicebox is English-only. For Indic/other languages use **edge-tts** (free,
offline-ish): voices `te-IN-ShrutiNeural` (f) / `te-IN-MohanNeural` (m), Hindi
`hi-IN-*`, etc. In `tts_chunk()`: `edge-tts --voice <V> --rate=<R> --text <t>
--write-media x.mp3` then ffmpeg → 24kHz mono wav.
- **Gotcha**: pass rate as ONE token `f"--rate={RATE}"` (e.g. `--rate=-4%`). Written as
  two args (`--rate`, `-4%`) argparse reads `-4%` as a flag → exit 2.
- **Recalibrate wpm** per language before writing the budget: Telugu Shruti ≈ 110
  words/min at default (dense words ≈ English 165 wpm — already a good teaching pace).
- **On-screen non-Latin text needs a font — use a SYSTEM font, not a web font.** Append the
  installed system face to the SANS/MONO stacks (macOS Telugu = `'Kohinoor Telugu'`; also
  present: Kannada/Oriya/Myanmar Noto faces) so Latin (brands/₹/numbers) stays Latin and the
  script falls through per-glyph. Chromium resolves system fonts synchronously — no loading,
  no `delayRender`, so a render can't stall. **Do NOT load a web font via `delayRender` at
  module scope**: both `staticFile()` fetch AND base64 data-URI + `new FontFace().load()` gave
  intermittent `delayRender` timeouts that killed full renders (frames 861/1422/3247) even
  though single-frame QA stills passed. If the target script has no system font, install one
  to the OS first rather than loading it in-render.
- **Captions on → drop `Foot`**: burned-in captions occupy the bottom band and collide
  with `Foot` at y924. Put takeaways in-content (≤ y900) instead.
