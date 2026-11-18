#!/usr/bin/env python3
"""Colonna sonora originale "corporate" elegante (pianoforte, pad, basso, ritmo leggero), lunga quanto il video.
Uso: python3 scripts/corporate_music.py out.wav <secondi> [seed]"""
import sys, wave
import numpy as np

SR = 44100
out, T = sys.argv[1], float(sys.argv[2])
seed = int(sys.argv[3]) if len(sys.argv) > 3 else 1
rng = np.random.default_rng(seed)
BPM = 92; BEAT = 60 / BPM; BAR = 4 * BEAT
N = int(T * SR)
L = np.zeros(N); R = np.zeros(N)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def lp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))
def add(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    j = min(N, i + len(x)); x = x[:j - i] * g
    L[i:j] += x * (1 - max(0, pan)); R[i:j] += x * (1 + min(0, pan))

# progressione luminosa: Fmaj7 - Am7 - Dm7 - Csus2/G  (rivoltati, voce media)
PROG = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 57, 60, 65], [55, 60, 62, 67]]
BASS = [41, 45, 38, 43]

def piano(n, dur, vel=1.0):
    k = int(dur * SR); t = np.arange(k) / SR; f = midi(n)
    tone = sum(a * np.sin(2 * np.pi * f * h * t * (1 + 0.0004 * h)) * np.exp(-t * (1.2 + h * 0.9)) for h, a in [(1, 1), (2, .45), (3, .22), (4, .12), (5, .06)])
    att = np.clip(t / 0.004, 0, 1); rel = np.clip((dur - t) / 0.25, 0, 1)
    return tone * att * rel * vel * 0.32
def pad(notes, dur):
    k = int(dur * SR); t = np.arange(k) / SR
    x = sum(np.sin(2 * np.pi * midi(n) * d * t) + 0.3 * np.sin(2 * np.pi * midi(n) * 2 * d * t) for n in notes for d in (0.997, 1.003))
    env = np.clip(t / 1.2, 0, 1) * np.clip((dur - t) / 1.0, 0, 1)
    return lp(x, 1800) * env / (len(notes) * 4)
def bass(n, dur):
    k = int(dur * SR); t = np.arange(k) / SR
    x = np.sin(2 * np.pi * midi(n) * t) + 0.25 * np.sin(2 * np.pi * midi(n) * 2 * t)
    return x * np.clip(t / 0.01, 0, 1) * np.exp(-t * 1.8) * 0.5
def kick():
    k = int(0.35 * SR); t = np.arange(k) / SR
    return np.sin(2 * np.pi * np.cumsum(48 + 70 * np.exp(-t * 30)) / SR) * np.exp(-t * 9) * 0.55
def shaker():
    k = int(0.08 * SR); t = np.arange(k) / SR; x = rng.standard_normal(k)
    return (x - lp(x, 6000)) * np.exp(-t * 60) * 0.08
def clap():
    k = int(0.25 * SR); t = np.arange(k) / SR; x = rng.standard_normal(k)
    return lp(x - lp(x, 900), 7000) * np.exp(-t * 18) * 0.12

nbars = int(np.ceil(T / BAR)) + 1
K, S, CL = kick(), shaker(), clap()
arp = [0, 2, 1, 3, 2, 1, 3, 2]
for b in range(nbars):
    t0 = b * BAR; ch = PROG[b % 4]
    sec = 0 if b < 4 else (1 if b < 12 else 2)          # intro · tema · pieno
    add(pad(ch, BAR + 1.0), t0, 0.9)
    add(bass(BASS[b % 4], BAR * 0.95), t0, 0.55 if sec else 0.3)
    add(bass(BASS[b % 4], BEAT * 1.4), t0 + BEAT * 2.5, 0.35 if sec else 0)
    for e in range(8):                                   # arpeggio di pianoforte in ottavi
        n = ch[arp[e]] + 12
        add(piano(n, BEAT * 1.6, 0.75 + 0.25 * (e % 2 == 0)), t0 + e * BEAT / 2, 0.7, pan=(-0.25 if e % 2 else 0.25))
    if b % 2 == 1 and sec:                               # piccola melodia ogni due battute
        for k_, (dn, dt) in enumerate([(ch[3] + 12, 0), (ch[2] + 12, 1.5), (ch[3] + 14, 2.5)]):
            add(piano(dn, BEAT * 2.2, 0.9), t0 + dt * BEAT, 0.55, pan=0.1)
    if sec:
        for q in range(4):
            if q in (0, 2): add(K, t0 + q * BEAT, 0.8 if sec == 2 else 0.55)
            if q in (1, 3) and sec == 2: add(CL, t0 + q * BEAT, 1.0)
        for e in range(16 if sec == 2 else 8):
            step = BEAT / (4 if sec == 2 else 2)
            add(S, t0 + e * step, 1.0 if e % 2 else 0.6, pan=0.3)

mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.4) / 1.4                           # saturazione morbida
fi, fo = int(2.0 * SR), int(4.0 * SR)
env = np.ones(N); env[:fi] = np.linspace(0, 1, fi); env[-fo:] = np.linspace(1, 0, fo)
mix *= env[:, None]
mix /= np.abs(mix).max() * 1.12
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f"musica {T:.1f}s → {out}")
