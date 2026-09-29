# TASK — CODEX (source, download & normalize real-human stock clips)

Read `projects/money-habit-60s/BRIEF.md` first. You own the FOOTAGE (real humans, free).

Source: **Mixkit Free License** (free to use in videos incl. commercial, no attribution,
no redistribution of the raw stock). Direct MP4, no API key needed. URL pattern:
`https://assets.mixkit.co/videos/<ID>/<ID>-1080.mp4`  (fallback `<ID>-720.mp4` if 1080 404s).

## 1. Download this curated pool into `clips/pool/` (12 clips, 2 per story beat)
```
918? no. Use EXACTLY these ID:label pairs:
42136  hook_shopping        (Woman exploring an online sales page on her cell phone)
4801   hook_scrolling       (Young man sitting scrolling on his cell phone)
4805   flip_pro_phone       (Well dressed businessman sending messages on his cell phone)
43270  flip_woman_phone     (Woman typing on her cell phone)
43375  proof_coffee_dance   (Woman dancing and drinking coffee in the morning)
32137  proof_coffee_laptop  (Waking up and drinking coffee in front of a laptop)
46446  steady_walk_three    (Three business people walk outside office)
315    steady_walk_two      (Two business people walk in an office hall)
32847  cta_thumbsup         (Woman with thumbs up in nature, portrait)
33031  cta_celebrate        (Entrepreneur who wears a suit celebrating)
4915   hands_phone          (Hands of a person typing on a cell phone)
144    hands_texting        (Hands shown texting on a smartphone)
```
For each, download to `clips/pool/<ID>_<label>.mp4`. Use curl with a browser UA:
`curl -fL -A "Mozilla/5.0" -o clips/pool/<ID>_<label>.mp4 https://assets.mixkit.co/videos/<ID>/<ID>-1080.mp4`
If a 1080 gives HTTP 404/403, retry the `-720.mp4` variant. Log any that fail.

## 2. Build a contact sheet so Claude can pick the final clips
For every downloaded clip, grab a frame from ~1.5s in, scaled to 480px wide, then tile them
into ONE image `clips/contactsheet.png` (3 columns) with the filename labeled on each tile.
```
for f in clips/pool/*.mp4; do
  b=$(basename "$f" .mp4)
  ffmpeg -y -ss 1.5 -i "$f" -frames:v 1 -vf "scale=480:-1,drawtext=text='$b':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6" "clips/pool/$b.jpg" 2>/dev/null
done
# tile 3-wide
montage clips/pool/*.jpg -tile 3x -geometry +6+6 -background black clips/contactsheet.png 2>/dev/null \
  || ffmpeg -y -pattern_type glob -i 'clips/pool/*.jpg' -filter_complex tile=3x4 clips/contactsheet.png 2>/dev/null
```
(If ImageMagick `montage` isn't installed, the ffmpeg tile fallback is fine.)

## 3. Write `clips/manifest.json`
An array of objects: `{"id","label","file","duration_s","width","height","fps","has_1080"}`.
Get duration/res/fps via `ffprobe`. This tells Claude what's usable.

## 4. Report
Print exactly:
`DONE CODEX: <n> clips downloaded, contactsheet.png + manifest.json ready`
List any IDs that failed to download.

Do NOT touch SCRIPT.md, audio/, or overlays/. Do NOT edit the clips beyond frame grabs —
Claude does the final trims/crops during the composite.
