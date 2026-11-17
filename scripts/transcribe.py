#!/usr/bin/env python3
"""Trascrizione con faster-whisper (large-v3-turbo, CPU int8) con tempi parola-per-parola.
Uso: python3 scripts/transcribe.py <audio_o_video> [out.json] [--model small]
Per registrazioni vocali reali: genera la timeline per i sottotitoli e per i tagli."""
import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

args = [a for a in sys.argv[1:] if not a.startswith("--")]
model = sys.argv[sys.argv.index("--model") + 1] if "--model" in sys.argv else "large-v3-turbo"
if "--model" in sys.argv: args.remove(model)
src = args[0]; out = args[1] if len(args) > 1 else src.rsplit(".", 1)[0] + ".words.json"
m = WhisperModel(model, device="cpu", compute_type="int8")
# decodifica con ffmpeg (evita incompatibilità di PyAV)
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
segs, info = m.transcribe(audio, language="it", word_timestamps=True, vad_filter=True)
words, text = [], []
for s in segs:
    text.append(s.text.strip())
    words += [{"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3), "p": round(w.probability, 2)} for w in s.words]
json.dump({"text": " ".join(text), "words": words}, open(out, "w"), ensure_ascii=False, indent=1)
print(" ".join(text)); print("->", out)
