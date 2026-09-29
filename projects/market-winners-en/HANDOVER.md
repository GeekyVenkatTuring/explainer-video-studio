# HANDOVER — "Who Actually Made Money" (prefix `mw`)

## Status
- Scene set `composer/src/scenes/MWScenes.tsx` built, registered (`mw:` in Explainer.tsx), QA-passed.
- Screenplay + TTS DONE for all 17 chapters (`build.py`). Kokoro `af_bella`, captions ON.
- Master total: **23.37 min, 50 scenes, 465 caption cues.**
- Per-chapter props: `artifacts/ch/ch00.json … ch16.json`. Narration: `composer/public/mw/narration_chNN.wav`.
- Renders done: ch00, ch01, ch02. **ch03–ch16 still to render.**

## THE ONE COMMAND TO FINISH (renders remaining chapters → concat → deliver)
```
bash /Users/appuram/Developer/explainer-forge/projects/market-winners-en/render_chapters.sh 2>&1 | tail -80
```
- Idempotent: skips ch00–02 (already rendered), renders ch03–16, concatenates `renders/master.mp4`,
  and copies it to `~/Downloads/generated_videos/who-actually-made-money.mp4`.
- ~2–3 min render per chapter (1080p30, concurrency 4). Total ~30–40 min. Runs in the terminal
  independent of the agent — if the agent stops, the shell keeps going; check `renders/*.mp4` on disk.

## QA after render (do this)
1. `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 renders/master.mp4` → expect ~1402s.
2. Extract a frame from 2–3 new chapters and eyeball (captions burned in, no overlap):
   `ffmpeg -y -ss 40 -i renders/ch13.mp4 -frames:v 1 artifacts/qa/v_ch13.png -loglevel error`
   (ch13 = SEBI case files; ch10/ch11 = bars; ch16 = recap.)
3. Report the MASTER DURATION line + any ffmpeg/remotion ERROR lines.

## To regenerate narration/props (only if text/numbers change)
`projects/midcap5-picks-en/.venv/bin/python3 projects/market-winners-en/build.py`
Delete a chapter's `renders/chNN.mp4` to force it to re-render.

## Honesty notes (do NOT "fix" by inventing)
- Runtime is ~23 min because only VERIFIED stories were used (RESEARCH.md has every source).
  Do not pad to 60–90 min with unverifiable viral claims — that was the explicit constraint.
- Every number is a public disclosure / SEBI order / AMFI data, dated. Kite MCP was DOWN during
  build; IPO & BEL prices are web-sourced with datelines (see RESEARCH.md) — verify via Kite if it returns.
- Disclaimer is spoken (ch16) + must go in the video description: "Education, not investment advice;
  figures from public disclosures & SEBI orders; consult a SEBI-registered adviser."
