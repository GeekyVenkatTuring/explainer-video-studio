#!/usr/bin/env python3
"""Offline Kokoro ONNX af_bella smoke test for the GTT explainer."""
import os
import subprocess

import soundfile as sf
from kokoro_onnx import Kokoro

KOKORO_MODEL = os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx")
KOKORO_VOICES = os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")
VOICE = "af_bella"
LANG = "en-us"
ATEMPO = 0.95

ROOT = os.path.dirname(os.path.abspath(__file__))
RAW_WAV = os.path.join(ROOT, "smoke.raw.wav")
WAV = os.path.join(ROOT, "smoke.wav")
TEXT = (
    "A normal order lives for a single trading day. If it does not fill by the closing "
    "bell, it simply dies. A G T T order is different. It is a resting instruction that "
    "waits, patiently, for up to one full year. It does nothing until the price you chose "
    "is finally touched. Only then does it fire, and place your order automatically."
)


def duration(path: str) -> float:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", path,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def main() -> None:
    samples, sample_rate = Kokoro(KOKORO_MODEL, KOKORO_VOICES).create(
        TEXT, voice=VOICE, speed=1.0, lang=LANG
    )
    sf.write(RAW_WAV, samples, sample_rate, subtype="PCM_16")
    subprocess.run(
        ["ffmpeg", "-y", "-i", RAW_WAV, "-filter:a", f"atempo={ATEMPO}", WAV],
        check=True,
    )
    os.remove(RAW_WAV)
    print(f"{duration(WAV):.6f}")


if __name__ == "__main__":
    main()
