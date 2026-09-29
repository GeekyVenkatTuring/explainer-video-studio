# Codex task — write the delivery collateral for the HyperFrames explainer

Work in `/Users/appuram/Developer/explainer-forge`. A ~28.7-minute English explainer video
about **HyperFrames** (a framework that renders video from HTML) is currently rendering.
Your job is to write the delivery collateral. Create ONE file:
**`projects/hyperframes-en/DELIVERY.md`**. Do not touch anything else, do not render.

## Source material
- The full narration/screenplay is in `projects/hyperframes-en/build.py` (the SEGMENTS list).
  Read it to know exactly what the video says, part by part.
- The video is 28:40 long, 49 scenes, 6 parts + intro + recap.

## Chapter timestamps (use verbatim)
```
00:00  Intro — Video, Written in HTML
02:21  Part 1 · The Workflows
04:17  Part 2 · The Contract
11:44  Part 3 · Motion
15:57  Part 4 · Creative Direction
18:40  Part 5 · Media & Audio
22:34  Part 6 · Ship It
27:47  Recap
```

## DELIVERY.md must contain these sections
1. **Title options** — 3 YouTube title candidates (<=70 chars each), punchy, accurate.
2. **YouTube description** — 2 short paragraphs on what the video teaches and who it's for,
   then the chapter list above as clickable timestamps, then a one-line honest note that
   every visual was generated (no stock footage) and the narration is a synthetic voice.
3. **Chapter summaries** — one or two sentences per part (Intro through Recap) describing
   what that section actually covers, grounded in the real narration in build.py. Be specific
   (e.g. Part 2 covers data-composition-id/data-duration, clips, tracks & z-order, the single
   paused seekable timeline, standalone vs sub-composition/<template>, framework-owned media,
   variables, determinism, the transform allowlist, and the silent bugs).
4. **Key concepts covered** — a flat bullet list (~15 items) of the concrete HyperFrames
   concepts taught, for anyone scanning whether the video is complete.
5. **Tags** — ~12 comma-separated YouTube tags.

Keep it accurate to the actual narration — do NOT invent features the video doesn't mention.
Write it cleanly in Markdown. When done, reply with just "DELIVERY.md written" and a 1-line note.
