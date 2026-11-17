#!/usr/bin/env python3
"""Argo Maris — mix audio finale + mastering.
voce + ambiente marino sintetico + whoosh sui cambi scena, ducking automatico
della musica/ambiente sotto la voce, loudness -14 LUFS e true-peak -1.5 dBTP
(headroom per le piattaforme social). Poi mux con il video renderizzato.

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

# 1) ambiente: onde del mare (rumore marrone filtrato con respiro lento) + pad caldo
run("-f", "lavfi", "-i", f"anoisesrc=d={T}:c=brown:r=48000:a=0.5",
    "-f", "lavfi", "-i", f"aevalsrc='0.05*sin(2*PI*110*t)+0.035*sin(2*PI*164.81*t)+0.03*sin(2*PI*220*t)+0.02*sin(2*PI*277.18*t)':s=48000:d={T}",
    "-filter_complex",
    "[0]lowpass=f=900,highpass=f=60,volume='0.55+0.45*sin(2*PI*t/7)':eval=frame[w];"
    "[1]tremolo=f=0.15:d=0.4,lowpass=f=1200,aecho=0.8:0.7:120|240:0.35|0.25[p];"
    f"[w][p]amix=inputs=2:weights=1 0.8,afade=t=in:d=1.5,afade=t=out:st={T-2.5}:d=2.5[a]",
    "-map", "[a]", "-ac", "2", str(tmp / "amb.wav"))

# 2) whoosh: rumore rosa con sweep di filtro, piazzato a ogni cambio scena
run("-f", "lavfi", "-i", "anoisesrc=d=0.7:c=pink:r=48000",
    "-af", "bandpass=f=1800:w=1.2,volume='min(1,t/0.35)*max(0,(0.7-t)/0.35)':eval=frame,aecho=0.6:0.5:60:0.3",
    str(tmp / "whoosh.wav"))
starts = [s["start"] for s in tl["scenes"][1:]]
inputs, labels, filt = [], [], []
for i, st in enumerate(starts):
    inputs += ["-i", str(tmp / "whoosh.wav")]
    ms = max(0, int((st - 0.35) * 1000))
    filt.append(f"[{i}]adelay={ms}|{ms},volume=0.5[w{i}]")
    labels.append(f"[w{i}]")
run(*inputs, "-filter_complex", ";".join(filt) + f";{''.join(labels)}amix=inputs={len(labels)}:normalize=0,apad=whole_dur={T}[a]",
    "-map", "[a]", "-ac", "2", "-t", str(T), str(tmp / "sfx.wav"))

# 3) mix: ambiente duckato dalla voce, voce con EQ/compressione, loudnorm
run("-i", str(voice), "-i", str(tmp / "amb.wav"), "-i", str(tmp / "sfx.wav"), "-filter_complex",
    "[0]aformat=channel_layouts=stereo,highpass=f=80,equalizer=f=3000:t=q:w=1:g=2.5,"
    "acompressor=threshold=-20dB:ratio=3:attack=5:release=120,asplit[v][sc];"
    "[1]volume=0.22[amb];[amb][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[duck];"
    "[v][duck][2]amix=inputs=3:weights=1 1 0.6:normalize=0,"
    "loudnorm=I=-14:TP=-1.5:LRA=9[a]",
    "-map", "[a]", "-ar", "48000", str(tmp / "mix.wav"))

run("-i", video, "-i", str(tmp / "mix.wav"), "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", out)
print("OK", out)
