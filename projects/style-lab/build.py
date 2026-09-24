#!/usr/bin/env python3
"""Style Lab — one ~60s script ("The Rule of 72") rendered in several style packs.
Voice: Kokoro ONNX af_bella. Emits artifacts/reel.json = {beats:[{id,kind,dur}], captions, audio}.
The StyleReel composition renders it with props.pack = editorial | blueprint | kinetic.
Run: projects/midcap5-picks-en/.venv/bin/python3 projects/style-lab/build.py
"""
import json, os, subprocess
import soundfile as sf
from kokoro_onnx import Kokoro
ROOT = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(ROOT, "..", "..", "composer", "public", "sl")
RAW = os.path.join(ROOT, "assets", "raw"); FIN = os.path.join(ROOT, "assets")
for d in (PUB, RAW, os.path.join(ROOT, "artifacts"), os.path.join(ROOT, "renders")): os.makedirs(d, exist_ok=True)
PAUSE, GAP, ATEMPO = 0.6, 0.4, 0.95
K = Kokoro(os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx"),
           os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin"))

BEATS = [
 ("hook", "Here's a question. [pause] If your money grows at eight percent a year, how long until it doubles? "
          "[pause] There's a trick that answers it in your head."),
 ("formula", "It's called the Rule of 72. [pause] Divide seventy two by the yearly growth rate. [pause] "
             "The answer is roughly how many years it takes your money to double."),
 ("growth", "At eight percent, seventy two divided by eight is nine. [pause] So one lakh becomes two lakh in "
            "about nine years. Four lakh by eighteen. Eight lakh by twenty seven. [pause] Every nine years, it doubles again."),
 ("compare", "Now change the rate. [pause] At four percent, doubling takes eighteen years. At twelve percent, "
             "just six. [pause] Triple the rate, and the wait shrinks to a third."),
 ("takeaway", "So small differences in rate make huge differences in time. [pause] Seventy two, divided by the "
              "rate. Keep that number in your pocket."),
]

def dur(p): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p],capture_output=True,text=True).stdout)
psil = os.path.join(RAW, "_p.wav"); gsil = os.path.join(RAW, "_g.wav")
for f, t in ((psil, PAUSE), (gsil, GAP)):
    if not os.path.exists(f): subprocess.run(["ffmpeg","-y","-v","error","-f","lavfi","-i","anullsrc=r=24000:cl=mono","-t",str(t),f],check=True)
beats, cues, t0, wavs = [], [], 0.0, []
for bid, text in BEATS:
    fin = os.path.join(FIN, bid + ".wav")
    parts = [p.strip() for p in text.split("[pause]") if p.strip()]
    if not os.path.exists(fin):
        lst = os.path.join(RAW, bid + ".txt"); lines = []
        for i, p in enumerate(parts):
            cp = os.path.join(RAW, f"{bid}_{i}.wav")
            s, sr = K.create(p, voice="af_bella", speed=1.0, lang="en-us"); sf.write(cp, s, sr, subtype="PCM_16")
            lines.append(f"file '{cp}'")
            if i < len(parts) - 1: lines.append(f"file '{psil}'")
        open(lst, "w").write("\n".join(lines))
        subprocess.run(["ffmpeg","-y","-v","error","-f","concat","-safe","0","-i",lst,"-filter:a",f"atempo={ATEMPO}","-ar","24000","-ac","1",fin],check=True)
    d = dur(fin)
    # captions: per-part proportional timing, ~8 words each
    words = sum(len(p.split()) for p in parts); wt = (d - (len(parts)-1)*PAUSE/ATEMPO) / words; ct = t0
    for i, p in enumerate(parts):
        w = p.split()
        for k in range(0, len(w), 8):
            ch = w[k:k+8]; cues.append([round(ct,3), round(ct+wt*len(ch),3), " ".join(ch)]); ct += wt*len(ch)
        ct += PAUSE/ATEMPO
    beats.append({"id": bid, "kind": bid, "dur": round(d + GAP, 3)}); wavs.append(fin); t0 += d + GAP
    print(f"{bid:9s} {d:6.2f}s")
lst = os.path.join(RAW, "_all.txt")
open(lst, "w").write("\n".join(f"file '{w}'\nfile '{gsil}'" for w in wavs))
subprocess.run(["ffmpeg","-y","-v","error","-f","concat","-safe","0","-i",lst,"-c","copy",os.path.join(PUB,"narration.wav")],check=True)
json.dump({"beats": beats, "captions": cues, "audio": "sl/narration.wav"}, open(os.path.join(ROOT,"artifacts","reel.json"),"w"), indent=1)
print(f"TOTAL {t0:.1f}s")
