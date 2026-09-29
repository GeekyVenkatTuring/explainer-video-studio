# Money-Habit-60s — Shared Brief (3-agent build)

**Deliverable:** ONE explainer video, ≤ 60 seconds, 16:9 1920x1080 30fps.
**What's different this time:** REAL HUMANS on screen (free CC0 stock footage), not
faceless abstract frames. Studio motion-graphics overlays go ON TOP of the human footage.

## Creative (locked)
- **Topic:** "The one money habit that quietly builds wealth."
- **Core idea:** Automate your investing — pay yourself first. The day your salary lands,
  a fixed amount auto-invests (auto-SIP) BEFORE you can spend it. Wealth comes from the
  system, not willpower.
- **Arc (60s):** HOOK (most people save what's left after spending — that's backwards) →
  IDEA (flip it: automate a fixed % on salary day) → PROOF (removes willpower + averages
  your buys over time) → CTA (set one auto-SIP this week).
- **Audience:** Indian investors/salaried earners. Rupee framing (₹). No stock picks, no
  specific return %, no fabricated numbers. End tag: "Educational, not investment advice."

## Visual identity (both agents align to this)
- Dark premium fintech look. Deep charcoal/navy base.
- Accent colors (semantic): MINT/GREEN #34d399 = growth/wealth (positive); AMBER #fbbf24 =
  the habit / attention; muted RED #f87171 = the wrong way (used once, sparingly).
- Motif: a small rupee coin / upward auto-arrow that recurs.
- Type: clean sans (Inter / system UI). Progress bar along the bottom edge.

## Files (everyone writes into projects/money-habit-60s/)
- `audio/narration.mp3`, `audio/captions.srt`  ← CURSOR
- `SCRIPT.md`  ← CURSOR (narration lines + on-screen text strings + per-line shot intent)
- `clips/*.mp4` + `clips/manifest.json`  ← CODEX (real-human CC0 clips, normalized 1080p)
- `overlays/`, `build/`, final composite  ← CLAUDE (director)

## Ownership
- **CURSOR:** screenplay + narration audio + captions. See TASK_CURSOR.md.
- **CODEX:** source, download, normalize the real-human stock clips. See TASK_CODEX.md.
- **CLAUDE:** visual identity, Remotion overlay layer, ffmpeg composite, QA, delivery.

Post a one-line "DONE: <what>" to your own pane when finished so Claude can integrate.
