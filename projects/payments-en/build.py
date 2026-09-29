#!/usr/bin/env python3
"""Payment Gateways for Developers — build plumbing (English, prefix `pg`).

Run with the Kokoro ONNX environment:
  projects/midcap5-picks-en/.venv/bin/python3 projects/payments-en/build.py tts 01_razorpay

Modes:
  tts [chapter...]  generate/cache narration WAVs and per-chapter props JSON
  qa [chapter...]   render a mid-animation still per scene
  render [chapter...] render each selected chapter and deliver its MP4
  master            concatenate rendered chapters and deliver the master MP4
  deliver [chapter...] copy existing chapter MP4s to the delivery directory

Screenplay and payment facts belong in chapters.py/research; this file only builds them.
"""
import argparse
import json
import os
import subprocess
import sys
import time

import soundfile as sf
from chapters import CHAPTERS
from kokoro_onnx import Kokoro

KOKORO_MODEL = os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx")
KOKORO_VOICES = os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")
VOICE, LANG = "af_bella", "en-us"
_K = None


def kokoro():
    global _K
    if _K is None:
        _K = Kokoro(KOKORO_MODEL, KOKORO_VOICES)
    return _K


def tts_chunk(path, text):
    samples, sr = kokoro().create(text, voice=VOICE, speed=1.0, lang=LANG)
    sf.write(path, samples, sr, subtype="PCM_16")


PREFIX = "pg"
GAP = 0.5
PAUSE = 0.55
ATEMPO = 0.95
SLUG = "payment-gateways-dev"
CAP_MAXWORDS = 8
CAP_WRAP = 52

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
COMPOSER = os.path.join(REPO, "composer")
PUBLIC = os.path.join(COMPOSER, "public", PREFIX)
RAW = os.path.join(ROOT, "assets", "raw")
FIN = os.path.join(ROOT, "assets")
ART = os.path.join(ROOT, "artifacts")
REND = os.path.join(ROOT, "renders")
QADIR = os.path.join(ROOT, "qa-stills")
DELIVER = os.path.expanduser(f"~/Downloads/generated_videos/{SLUG}")
for directory in (PUBLIC, RAW, FIN, ART, REND, QADIR):
    os.makedirs(directory, exist_ok=True)


def ffdur(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True, check=True,
    )
    return round(float(out.stdout.strip()), 3)


def gen_one(seg_id, text):
    fin = os.path.join(FIN, seg_id + ".wav")
    if os.path.exists(fin):
        return fin, ffdur(fin)
    chunks = [chunk.strip() for chunk in text.split("[pause]") if chunk.strip()]
    if not chunks:
        raise ValueError(f"empty narration for {seg_id}")
    paths = []
    for chunk_index, chunk in enumerate(chunks):
        chunk_path = os.path.join(RAW, f"{seg_id}_c{chunk_index}.wav")
        if not os.path.exists(chunk_path):
            tts_chunk(chunk_path, chunk)
        paths.append(chunk_path)
    pause_path = os.path.join(RAW, "_pause.wav")
    if not os.path.exists(pause_path):
        subprocess.run(
            ["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
             "-t", str(PAUSE), pause_path],
            check=True, capture_output=True,
        )
    concat_list = os.path.join(RAW, f"{seg_id}_concat.txt")
    with open(concat_list, "w") as handle:
        for index, path in enumerate(paths):
            handle.write(f"file '{path}'\n")
            if index < len(paths) - 1:
                handle.write(f"file '{pause_path}'\n")
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list,
         "-filter:a", f"atempo={ATEMPO}", fin],
        check=True, capture_output=True,
    )
    return fin, ffdur(fin)


def _wrap(text):
    lines, current = [], ""
    for word in text.split():
        if current and len(current) + 1 + len(word) > CAP_WRAP:
            lines.append(current)
            current = word
        else:
            current = (current + " " + word).strip()
    if current:
        lines.append(current)
    return "\n".join(lines)


def beat_cues(text, dur, t0):
    parts = text.split("[pause]")
    ppause = PAUSE
    n_pause = len(parts) - 1
    all_words = sum(len(part.split()) for part in parts) or 1
    word_time = max(0.0, dur - n_pause * ppause) / all_words
    cues, ct = [], 0.0
    for part_index, part in enumerate(parts):
        words = part.split()
        i = 0
        while i < len(words):
            j = min(i + CAP_MAXWORDS, len(words))
            for k in range(i + 1, j):
                if words[k - 1][-1:] in ".?!,;:":
                    j = k
                    break
            chunk = words[i:j]
            d = word_time * len(chunk)
            cues.append([round(t0 + ct, 3), round(t0 + ct + d, 3), _wrap(" ".join(chunk))])
            ct += d
            i = j
        if part_index < len(parts) - 1:
            ct += ppause
    return cues


def pick(names):
    if not names:
        return CHAPTERS
    selected = [chapter for chapter in CHAPTERS
                if chapter["id"] in names or chapter["id"].replace("ch", "") in names]
    if not selected:
        sys.exit(f"no chapter matched {names}; known: {[chapter['id'] for chapter in CHAPTERS]}")
    return selected


def run_tts(names):
    for chapter in pick(names):
        if not chapter["segments"]:
            print(f"  {chapter['id']}: no segments yet; skipping", flush=True)
            continue
        manifest, cues, cuts, timeline = [], [], [], 0.0
        for segment in chapter["segments"]:
            seg_id = f'{chapter["id"]}_{segment[0]}'
            path, duration = gen_one(seg_id, segment[3])
            manifest.append((seg_id, path))
            cues.extend(beat_cues(segment[3], duration, timeline))
            cuts.append({
                "id": seg_id,
                "type": segment[1],
                "in_seconds": round(timeline, 3),
                "out_seconds": round(timeline + duration, 3),
                "props": {**segment[2], "dur": round(duration + GAP, 3)},
            })
            warning = "  ⚠ LONG >90s" if duration > 90 else ""
            print(f"    {seg_id:28s} {duration:6.2f}s{warning}", flush=True)
            timeline = round(timeline + duration + GAP, 3)
        gap_path = os.path.join(FIN, "_gap.wav")
        if not os.path.exists(gap_path):
            subprocess.run(
                ["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                 "-t", str(GAP), gap_path],
                check=True, capture_output=True,
            )
        audio_list = os.path.join(ART, f'{chapter["id"]}_audio.txt')
        with open(audio_list, "w") as handle:
            for index, (_, path) in enumerate(manifest):
                handle.write(f"file '{path}'\n")
                if index < len(manifest) - 1:
                    handle.write(f"file '{gap_path}'\n")
        chapter_wav = os.path.join(PUBLIC, f'{chapter["id"]}.wav')
        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", audio_list,
             "-c", "copy", chapter_wav],
            check=True, capture_output=True,
        )
        props = {
            "cuts": cuts,
            "captions": cues,
            "audio": {"narration": {"src": f'{PREFIX}/{chapter["id"]}.wav', "volume": 1.0}},
        }
        with open(os.path.join(ART, f'{chapter["id"]}.json'), "w") as handle:
            json.dump(props, handle, indent=1)
        words = sum(len(segment[3].replace("[pause]", " ").split()) for segment in chapter["segments"])
        total_duration = timeline - GAP
        print(f"  {chapter['id']}: {total_duration / 60:5.2f} min  {len(cuts)} scenes  "
              f"{words:5d} words  {words / (total_duration / 60):.0f} wpm", flush=True)


def run_qa(names):
    for chapter in pick(names):
        props_path = os.path.join(ART, f'{chapter["id"]}.json')
        if not os.path.exists(props_path):
            sys.exit(f"run tts first for {chapter['id']}")
        data = json.load(open(props_path))
        for cut in data["cuts"]:
            midpoint = (cut["in_seconds"] + cut["out_seconds"]) / 2
            frame = round(midpoint * 30)
            output = os.path.join(QADIR, f'{cut["id"]}.png')
            result = subprocess.run(
                ["npx", "remotion", "still", "Explainer", output,
                 f"--props={props_path}", f"--frame={frame}"],
                cwd=COMPOSER, capture_output=True, text=True,
            )
            if result.returncode != 0:
                print(result.stdout[-800:], result.stderr[-800:])
                sys.exit(f"still failed {cut['id']}")
            print(f"  QA {cut['id']} @f{frame}", flush=True)
    print(f"\nLOOK at every PNG in {QADIR}/ before render.")


def render_one(chapter, attempts=3):
    props_path = os.path.join(ART, f'{chapter["id"]}.json')
    output = os.path.join(REND, f'{chapter["id"]}.mp4')
    for attempt in range(1, attempts + 1):
        result = subprocess.run(
            ["npx", "remotion", "render", "Explainer", output,
             f"--props={props_path}", "--concurrency=8", "--timeout=120000"],
            cwd=COMPOSER, capture_output=True, text=True,
        )
        if result.returncode == 0 and os.path.exists(output):
            os.makedirs(DELIVER, exist_ok=True)
            subprocess.run(["cp", output, os.path.join(DELIVER, f'{SLUG}-{chapter["id"]}.mp4')], check=True)
            return output
        print(f"  render attempt {attempt}/{attempts} failed for {chapter['id']}:\n"
              + (result.stderr or result.stdout)[-700:], flush=True)
        if os.path.exists(output):
            os.remove(output)
        time.sleep(5)
    print(f"  GAVE UP on {chapter['id']} after {attempts} attempts", flush=True)
    return None


def run_render(names):
    for chapter in pick(names):
        output = render_one(chapter)
        if output:
            print(f"  rendered + delivered {chapter['id']} ({ffdur(output) / 60:.2f} min) → {DELIVER}", flush=True)


def run_master(_names):
    files = [os.path.join(REND, f'{chapter["id"]}.mp4') for chapter in CHAPTERS]
    files = [path for path in files if os.path.exists(path)]
    if not files:
        sys.exit("no chapter MP4s rendered yet")
    concat_list = os.path.join(REND, "master_concat.txt")
    with open(concat_list, "w") as handle:
        for path in files:
            handle.write(f"file '{path}'\n")
    output = os.path.join(REND, "master.mp4")
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list,
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", output],
        check=True,
    )
    os.makedirs(DELIVER, exist_ok=True)
    subprocess.run(["cp", output, os.path.join(DELIVER, f"{SLUG}-master.mp4")], check=True)
    print(f"master: {len(files)} chapters → {ffdur(output) / 60:.2f} min → {DELIVER}")


def run_deliver(names):
    os.makedirs(DELIVER, exist_ok=True)
    count = 0
    for chapter in pick(names):
        source = os.path.join(REND, f'{chapter["id"]}.mp4')
        if os.path.exists(source):
            subprocess.run(["cp", source, os.path.join(DELIVER, f'{SLUG}-{chapter["id"]}.mp4')], check=True)
            count += 1
    print(f"delivered {count} chapter videos → {DELIVER}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["tts", "qa", "render", "master", "deliver"], nargs="?", default="tts")
    parser.add_argument("names", nargs="*")
    args = parser.parse_args()
    {"tts": run_tts, "qa": run_qa, "render": run_render,
     "master": run_master, "deliver": run_deliver}[args.mode](args.names)
