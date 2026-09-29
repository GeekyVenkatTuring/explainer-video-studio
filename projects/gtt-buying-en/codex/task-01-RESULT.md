# Task 01 — TTS smoke-test result

- Measured `smoke.wav` duration: **21.724750 seconds**
- Implied rate: **165.71 words per minute** (`60 / (21.724750 / 60)`)
- `af_bella` loaded successfully: the direct Kokoro ONNX generation completed with
  `VOICE="af_bella"` and `LANG="en-us"`.
- WAV verification passed: `ffprobe` reports one `pcm_s16le` audio stream at
  24,000 Hz, mono; a complete `ffmpeg` decode to the null output completed without
  errors.
- Errors encountered: none.
