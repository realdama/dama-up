#!/usr/bin/env python3
"""Colonna sonora synthwave originale (anni '80, 110 BPM) + effetti. Uso: python3 scripts/synthwave.py out_dir"""
import sys, numpy as np, wave
SR = 44100; BPM = 110; BEAT = 60 / BPM; BAR = 4 * BEAT; NB = 26
T = NB * BAR + 3.0
N = int(T * SR)
rng = np.random.default_rng(7)
out = sys.argv[1]

def note(n):  # n = numero MIDI
    return 440.0 * 2 ** ((n - 69) / 12)
def saw(f, t): return 2 * ((f * t) % 1) - 1
def sq(f, t): return np.sign(np.sin(2 * np.pi * f * t))
def lp(x, a):  # filtro passa-basso a un polo
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y
def lp_fast(x, cutoff):
    # passa-basso FFT (veloce)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x))
def env(n, a, d, s=0.0, r=0.0):
    e = np.ones(n); A = int(a * SR); D = int(d * SR)
    if A: e[:A] = np.linspace(0, 1, A)
    if D: e[A:A + D] = np.linspace(1, s, min(D, n - A))[:max(0, min(D, n - A))]
    e[A + D:] = s
    return e
def add(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += x[:j - i] * g

L = np.zeros(N); R = np.zeros(N)
def addst(x, t0, g=1.0, pan=0.0):
    add(L, x, t0, g * (1 - max(0, pan))); add(R, x, t0, g * (1 + min(0, pan)))

# accordi: Am F C G  (radici MIDI)
chords = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]

# --- batteria ---
def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + 0.3 * np.exp(-t * 120) * rng.standard_normal(n) * 0.2
def snare():
    n = int(0.6 * SR); t = np.arange(n) / SR
    body = 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 20)
    noise = rng.standard_normal(n) * np.exp(-t * 9)
    gate = np.where(t < 0.26, 1.0, np.exp(-(t - 0.26) * 60))  # riverbero "gated" anni '80
    tail = lp_fast(rng.standard_normal(n), 6000) * 0.5 * np.exp(-t * 4) * gate
    return (body + lp_fast(noise, 7000) * 0.6 + tail) * gate
def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = x - lp_fast(x, 7000)
    return x * np.exp(-t * (12 if open_ else 70))
K, S, Hc, Ho = kick(), snare(), hat(), hat(True)

for b in range(NB):
    t0 = b * BAR
    full = 4 <= b < 20 or 22 <= b < 25
    if b >= 4 and b not in (20, 21):
        for q in range(4):
            if q in (0, 2) or (b >= 8 and q == 3 and b % 2): addst(K, t0 + q * BEAT, 0.95)
            if q in (1, 3): addst(S, t0 + q * BEAT, 0.55)
        for e in range(8):
            addst(Ho if e % 2 else Hc, t0 + e * BEAT / 2, 0.12 if e % 2 else 0.09, pan=0.3)
    # basso (ottavi)
    root = chords[b % 4][0] - 24
    if b >= 2 and b not in (20,):
        for e in range(8):
            n = int(BEAT / 2 * SR * 0.92); t = np.arange(n) / SR
            f = note(root + (12 if e % 2 else 0))
            x = 0.6 * saw(f, t) + 0.4 * sq(f / 2, t)
            add(L, lp_fast(x, 420 + 250 * (b >= 8)) * np.exp(-t * 6), t0 + e * BEAT / 2, 0.28)
            add(R, lp_fast(x, 420 + 250 * (b >= 8)) * np.exp(-t * 6), t0 + e * BEAT / 2, 0.28)
    # pad (accordo intero, saw detunati)
    n = int(BAR * SR); t = np.arange(n) / SR
    pad = sum(saw(note(m) * d, t) for m in chords[b % 4][1] for d in (0.997, 1.0, 1.004)) / 9
    pad = lp_fast(pad, 1500 if b >= 4 else 900) * env(n, 0.5, 0.2, 0.85)
    pad *= np.clip((BAR - t) / 0.15, 0, 1)
    add(L, pad, t0, 0.28); add(R, np.roll(pad, 400), t0, 0.28)
    # arpeggio (sedicesimi) con delay
    if b >= 1:
        tones = chords[b % 4][1] + [chords[b % 4][1][0] + 12]
        for s in range(16):
            m = tones[[0, 1, 2, 3, 2, 1, 2, 3][s % 8]] + 12
            n = int(BEAT / 4 * SR); t = np.arange(n) / SR
            x = sq(note(m), t) * np.exp(-t * 18)
            x = lp_fast(x, 2600)
            addst(x, t0 + s * BEAT / 4, 0.07, pan=-0.35)
            addst(x, t0 + s * BEAT / 4 + 3 * BEAT / 4, 0.03, pan=0.45)
# melodia lead (battute 8-19 e 22-25)
motif = [(76, 1.5), (74, .5), (72, 1), (74, 1), (76, 1.5), (79, .5), (77, 1), (76, 1),
         (72, 1.5), (74, .5), (76, 1), (72, 1), (71, 2), (74, 2)]
def play_lead(start_bar, bars):
    t0 = start_bar * BAR; tt = t0
    while tt < t0 + bars * BAR - 0.01:
        for m, d in motif:
            if tt >= t0 + bars * BAR - 0.01: break
            n = int(d * BEAT * SR); t = np.arange(n) / SR
            vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t * 3, 0, 1)
            x = (saw(note(m) * vib, t) + saw(note(m) * 1.006 * vib, t)) / 2
            x = lp_fast(x, 3200) * env(n, 0.02, 0.15, 0.7) * np.clip((d * BEAT - t) / 0.06, 0, 1)
            addst(x, tt, 0.13, pan=0.1); addst(x, tt + 0.27, 0.05, pan=-0.4)
            tt += d * BEAT
play_lead(8, 12); play_lead(22, 3)
# riser prima del drop (battuta 21)
n = int(BAR * SR); t = np.arange(n) / SR
riser = lp_fast(rng.standard_normal(n), 3000) * (t / BAR) ** 2 * 0.35
add(L, riser, 21 * BAR); add(R, riser, 21 * BAR)

mix = np.stack([L, R], 1)
fade = np.ones(N); fo = int(3.5 * SR); fade[-fo:] = np.linspace(1, 0, fo); mix *= fade[:, None]
mix /= np.abs(mix).max() * 1.05
def wav(path, x):
    x = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2 if x.ndim == 2 else 1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
wav(f"{out}/music.wav", mix)

# --- effetti ---
n = int(3.5 * SR); t = np.arange(n) / SR   # motore che sale di giri
rpm = 55 + 70 * (1 - np.exp(-t * 1.2))
eng = saw(1, np.cumsum(rpm) / SR) * 0.5 + sq(1, np.cumsum(rpm * 2) / SR) * 0.2
eng = lp_fast(eng + 0.15 * rng.standard_normal(n), 900) * np.clip(t * 4, 0, 1) * np.clip((3.5 - t) / 0.6, 0, 1)
wav(f"{out}/engine.wav", np.stack([eng, eng], 1) / np.abs(eng).max() * 0.9)
n = int(0.9 * SR); t = np.arange(n) / SR    # ka-ching
cash = (np.sin(2 * np.pi * 2093 * t) * np.exp(-t * 6) + np.sin(2 * np.pi * 2637 * np.clip(t - 0.08, 0, None)) * np.exp(-np.clip(t - 0.08, 0, None) * 6) * (t > 0.08)
        + rng.standard_normal(n) * np.exp(-t * 40) * 0.4)
wav(f"{out}/cash.wav", np.stack([cash, cash], 1) / np.abs(cash).max() * 0.8)
n = int(8 * SR); t = np.arange(n) / SR      # onde del mare
sea = lp_fast(rng.standard_normal(n), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * t / 4))
wav(f"{out}/waves.wav", np.stack([sea, np.roll(sea, 3000)], 1) / np.abs(sea).max() * 0.7)
print(f"musica {T:.1f}s, battuta {BAR:.4f}s")
