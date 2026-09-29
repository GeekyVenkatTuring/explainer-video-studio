# TASK — CURSOR (screenplay + narration + captions)

Read `projects/money-habit-60s/BRIEF.md` first. You own the WORDS and the AUDIO.

## 1. Write `projects/money-habit-60s/SCRIPT.md`
A 60-second screenplay for the locked topic (automate investing on salary day).
Structure it as 5 short beats: HOOK, FLIP, PROOF-1 (willpower), PROOF-2 (averaging over
time), CTA. For each beat give:
- **Narration** — the exact spoken line(s). Conversational, punchy, Indian-investor voice,
  ₹ framing. NO stock picks, NO specific return %, NO fabricated numbers.
- **On-screen text** — the 3–6 word phrase(s) that will appear as kinetic overlay (a
  title, lower-thirds, and a CTA card). Keep them SHORT — they render as big type.
- **Shot intent** — one line on what real human should be on screen (e.g. "person checking
  banking app on phone, relieved", "hands putting cash in wallet", "young professional
  walking confidently"). Claude/Codex map these to real clips.

**Length budget:** total narration ~150–165 words (comfortable 60s at a natural reel pace
with small pauses — NOT crammed). End with the line "Educational, not investment advice."

## 2. Generate the narration audio + captions
Use edge-tts (installed at /opt/homebrew/bin/edge-tts). Use an Indian English voice:
`en-IN-NeerjaNeural` (warm female) OR `en-IN-PrabhatNeural` (male) — pick Neerja.
Concatenate all narration lines into one script text, then:

```
cd /Users/appuram/Developer/explainer-forge/projects/money-habit-60s
edge-tts --voice en-IN-NeerjaNeural --rate=-4% \
  --file audio/narration.txt \
  --write-media audio/narration.mp3 \
  --write-subtitles audio/captions.srt
```
(Write your final narration plain text to `audio/narration.txt` first — no on-screen-text,
no stage directions, just the spoken words.)

Then print the audio duration so we can verify ≤60s:
```
ffprobe -v error -show_entries format=duration -of csv=p=0 audio/narration.mp3
```
If it's over ~60s, tighten the script (delete words) and regenerate. Target 55–60s.

## 3. Report
When done, print exactly:
`DONE CURSOR: narration=<seconds>s words=<n> script+audio+srt written`

Do NOT touch clips/, overlays/, or build/ — those belong to Codex and Claude.
