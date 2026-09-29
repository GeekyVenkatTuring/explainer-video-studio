#!/usr/bin/env python3
"""Narration check: whisper.cpp (small.en) transcribes every segment WAV; report word recall of the
expected spoken text. Segments below 85% recall are flagged for a listen / regeneration."""
import json, os, re, subprocess, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("b", os.path.join(HERE, "build.py")); b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
MODEL = os.path.expanduser("~/.cache/hyperframes/whisper/models/ggml-small.en.bin")
norm = lambda s: re.findall(r"[a-z]+", s.lower())
for key in sys.argv[1:] or list(b.DATA):
    worst = 1.0
    for sid, _, _, text in b.chapter(key):
        wav = os.path.join(b.proj(key), "assets", sid + ".wav"); tmp = f"/tmp/va_{sid}.wav"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", wav, "-ar", "16000", "-ac", "1", tmp], check=True)
        out = subprocess.run(["whisper-cli", "-m", MODEL, "-f", tmp, "-t", "8", "-nt"], capture_output=True, text=True).stdout
        exp = [w for w in norm(re.sub(r"[\d.,%₹]+", " ", text.replace("[pause]", " "))) if len(w) > 3]
        got = set(norm(out)); rec = sum(w in got for w in exp) / max(1, len(exp)); worst = min(worst, rec)
        flag = "  <-- CHECK" if rec < 0.85 else ""
        print(f"{sid:24s} recall {rec:.2f}{flag}", flush=True)
    print(f"== {key}: worst segment recall {worst:.2f}", flush=True)
