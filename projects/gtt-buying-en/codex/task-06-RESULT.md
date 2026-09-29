# Task 06 — Final render and delivery result

- Final render: `renders/final.mp4`
- Duration: **946.709333 seconds** (**15:46.71**)
- Size: **143,599,988 bytes** (~137 MB)
- Streams: **H.264 video + AAC audio**
- Scene count: **28**
- Delivery: `/Users/appuram/Downloads/generated_videos/gtt-buy-schedule-explained.mp4`
  exists and byte-matches the rendered source.

Verification completed:

- `ffprobe` passed on both the rendered file and the delivered copy.
- Spot-check frames extracted and visually reviewed from the final MP4:
  `codex/verify_60.png`, `codex/verify_473.png`, and `codex/verify_900.png`.

The render was run at concurrency 8. A temporary launch-service restart occurred after the
successful first encode; it was stopped before it could replace the completed output.
