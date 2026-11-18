#!/usr/bin/env python3
"""Argo Maris — mix audio finale + mastering (v2).
Voce (96 kbps, pulita: passa-alto, de-esser, compressione leggera, presenza) + colonna sonora originale
(corporate_music.py) abbassata automaticamente sotto la voce + transizioni morbide ai cambi scena.
Loudness −14 LUFS, true-peak ≤ −1.5 dBTP.
Uso: python3 scripts/master.py <slug> <video_muto.mp4> <out.mp4>
"""
import json, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
slug, video, out = sys.argv[1], sys.argv[2], sys.argv[3]
tl = json.loads((ROOT / "studio/src/videos" / slug / "timeline.json").read_text())
voice = ROOT / "studio/public" / slug / "voice.wav"
T = tl["total"]
tmp = Path(tempfile.mkdtemp())
run = lambda *a: subprocess.run(["ffmpeg", "-y", "-v", "error", *a], check=True)

# 1) colonna sonora originale lunga quanto il video
subprocess.run([sys.executable, str(ROOT / "scripts/corporate_music.py"), str(tmp / "music.wav"), str(T + 1), str(abs(hash(slug)) % 97)], check=True)

# 2) transizione morbida ai cambi scena: "swish" filtrato, breve e basso
run("-f", "lavfi", "-i", "anoisesrc=d=0.6:c=pink:r=48000:a=0.6",
    "-af", "highpass=f=500,lowpass=f=5200,volume='min(1,t/0.38)*max(0,(0.6-t)/0.22)':eval=frame,aecho=0.5:0.4:45:0.25",
    str(tmp / "swish.wav"))
starts = [s["start"] for s in tl["scenes"][1:]]
inputs, labels, filt = [], [], []
for i, st in enumerate(starts):
    inputs += ["-i", str(tmp / "swish.wav")]
    ms = max(0, int((st - 0.42) * 1000))
    filt.append(f"[{i}]adelay={ms}|{ms},volume=0.22[w{i}]")
    labels.append(f"[w{i}]")
run(*inputs, "-filter_complex", ";".join(filt) + f";{''.join(labels)}amix=inputs={len(labels)}:normalize=0,apad=whole_dur={T}[a]",
    "-map", "[a]", "-ac", "2", "-t", str(T), str(tmp / "sfx.wav"))

# 3) mix: voce pulita al centro, musica abbassata sotto la voce (sidechain), master
run("-i", str(voice), "-i", str(tmp / "music.wav"), "-i", str(tmp / "sfx.wav"), "-filter_complex",
    "[0]aresample=48000,aformat=channel_layouts=mono,highpass=f=75,lowpass=f=15000,"
    "deesser=i=0.35:m=0.5:f=0.5,"
    "equalizer=f=220:t=q:w=1.2:g=-1.5,equalizer=f=3200:t=q:w=1.4:g=1.8,equalizer=f=9500:t=q:w=1.5:g=1.2,"
    "acompressor=threshold=-21dB:ratio=2.2:attack=8:release=160:makeup=2,"
    "aformat=channel_layouts=stereo,asplit[v][sc];"
    "[1]aresample=48000,volume=0.16,highpass=f=40[mus];"
    "[mus][sc]sidechaincompress=threshold=0.025:ratio=6:attack=40:release=650:makeup=1[duck];"
    "[v][duck][2]amix=inputs=3:weights=1 1 0.8:normalize=0,"
    "loudnorm=I=-15:TP=-3:LRA=8,alimiter=limit=0.72:attack=2:release=80:level=disabled[a]",
    "-map", "[a]", "-ar", "48000", "-t", str(T), str(tmp / "mix.wav"))

run("-i", video, "-i", str(tmp / "mix.wav"), "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-shortest", "-movflags", "+faststart", out)
print("OK", out)
