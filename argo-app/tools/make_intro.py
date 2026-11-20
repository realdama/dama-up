"""Intro rock originale di ARGO (~9 s): chitarre distorte doppiate L/R, basso, batteria, piatto finale.
Solo numpy. Uso: python3 make_intro.py out.wav"""
import sys, wave
import numpy as np

SR = 44100
BPM = 132
B = 60 / BPM          # una battuta da 1/4
E = B / 2             # croma
rng = np.random.default_rng(7)


def lp(x, fc):
    """passa-basso a 1 polo, applicato due volte (12 dB/oct) via FFT-free IIR vettoriale"""
    a = np.exp(-2 * np.pi * fc / SR)
    from itertools import accumulate  # noqa
    y = np.empty_like(x)
    for _ in range(2):
        acc = 0.0
        out = np.empty_like(x)
        # IIR semplice: veloce abbastanza su pochi secondi
        b = 1 - a
        for i in range(len(x)):
            acc = b * x[i] + a * acc
            out[i] = acc
        x = out
    return x


def fft_filter(x, lo=None, hi=None, peak=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if hi:
        g *= 1 / np.sqrt(1 + (f / hi) ** 8)
    if lo:
        g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    if peak:
        fc, gain_db, q = peak
        g *= 1 + (10 ** (gain_db / 20) - 1) * np.exp(-((f - fc) / (fc / q)) ** 2)
    return np.fft.irfft(X * g, len(x))


def saw(freq, n, detune=0.0):
    t = np.arange(n) / SR
    ph = (freq * (1 + detune) * t + rng.random()) % 1
    return 2 * ph - 1


def guitar_note(root, dur, mute, detune):
    n = int(dur * SR)
    sig = np.zeros(n)
    for ratio in (1, 1.4983, 2):                      # power chord: tonica, quinta, ottava
        sig += saw(root * ratio, n, detune) + 0.6 * saw(root * ratio, n, -detune * 1.7)
    t = np.arange(n) / SR
    att = np.minimum(1, t / 0.004)
    if mute:
        env = att * np.exp(-t / 0.07)
    else:
        env = att * (0.55 + 0.45 * np.exp(-t / 0.25))
    rel = np.minimum(1, (n - np.arange(n)) / (0.015 * SR))
    pre = sig * env * rel * 0.22
    return np.tanh(pre * 9) * (0.6 if mute else 1.0)  # distorsione


def bass_note(root, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * root / 2 * t) + 0.35 * saw(root / 2, n)
    env = np.minimum(1, t / 0.005) * (0.6 + 0.4 * np.exp(-t / 0.3)) * np.minimum(1, (n - np.arange(n)) / (0.02 * SR))
    return np.tanh(s * env * 1.6) * 0.5


def kick(n=int(0.35 * SR)):
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    click = rng.standard_normal(n) * np.exp(-t / 0.002) * 0.4
    return (np.sin(ph) * np.exp(-t / 0.16) + click) * 1.0


def snare(n=int(0.3 * SR)):
    t = np.arange(n) / SR
    noise = fft_filter(rng.standard_normal(n), lo=900, hi=9000) * np.exp(-t / 0.09)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
    return (noise * 0.9 + body * 0.6)


def hat(n=int(0.06 * SR), v=0.18):
    t = np.arange(n) / SR
    return fft_filter(rng.standard_normal(n), lo=7000) * np.exp(-t / 0.018) * v


def crash(n=int(3.2 * SR)):
    t = np.arange(n) / SR
    return fft_filter(rng.standard_normal(n), lo=3500, hi=14000) * np.exp(-t / 0.9) * 0.45


def tom(f0, n=int(0.4 * SR)):
    t = np.arange(n) / SR
    f = f0 * (1 + 0.5 * np.exp(-t / 0.05))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.2) * 0.8


TOTAL = 10.5
L = np.zeros(int(TOTAL * SR)); R = np.zeros_like(L); Dr = np.zeros_like(L); Bs = np.zeros_like(L)


def put(buf, sig, t, g=1.0):
    i = int(t * SR); j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * g


t = 0.15
# 1) fill di tom + rullante (1 battuta)
for k, f in enumerate([220, 220, 165, 165, 120, 120, 90, 90]):
    put(Dr, tom(f) if k % 2 == 0 else snare(), t + k * E / 2, 0.8)
t += 4 * E / 2 * 2

# 2) riff: E5 chug, G5, A5, chug, D5 C5 B5...
E2, G2, A2, D3, C3, B2, Bb2 = 82.41, 98.0, 110.0, 146.83, 130.81, 123.47, 116.54
riff = [(E2, 1, 1), (E2, 1, 1), (G2, 2, 0), (E2, 1, 1), (A2, 2, 0), (E2, 1, 1),
        (C3, 1, 0), (B2, 1, 0), (Bb2, 1, 0), (A2, 2, 0), (E2, 1, 1), (E2, 1, 1),
        (G2, 2, 0), (E2, 1, 1), (A2, 2, 0), (E2, 1, 1), (D3, 2, 0), (C3, 2, 0)]
start = t
put(Dr, crash(), t, 0.9)
for root, ln, mute in riff:
    d = ln * E
    put(L, guitar_note(root, d * 0.97, mute, 0.003), t)
    put(R, guitar_note(root, d * 0.97, mute, -0.004), t + 0.006)  # doppiatura
    put(Bs, bass_note(root, d * 0.95), t)
    t += ln * E
end = t
# batteria sul riff
beats = int(round((end - start) / B))
for b in range(beats):
    bt = start + b * B
    put(Dr, kick(), bt)
    if b % 2: put(Dr, snare(), bt, 0.9)
    put(Dr, hat(), bt); put(Dr, hat(v=0.1), bt + E)
    if b % 4 == 3: put(Dr, kick(), bt + E, 0.8)
# 3) colpo finale: E5 tenuto, crash, kick
put(Dr, crash(), end, 1.0); put(Dr, kick(), end, 1.2)
for g in (L, R):
    put(g, guitar_note(E2, 3.0, 0, 0.003 if g is L else -0.004), end)
put(Bs, bass_note(E2, 2.6), end)

# cassa chitarra: taglio alti + presenza
L = fft_filter(L, lo=90, hi=4200, peak=(1800, 4, 1.5))
R = fft_filter(R, lo=90, hi=4200, peak=(1800, 4, 1.5))
Bs = fft_filter(Bs, hi=900)
mixL = 0.55 * L + 0.18 * R + 0.55 * Bs + 0.7 * Dr
mixR = 0.18 * L + 0.55 * R + 0.55 * Bs + 0.7 * Dr
st = np.stack([mixL, mixR], 1)
# dissolvenza finale e normalizzazione con limiter morbido
fade = np.ones(len(st)); n0 = int((TOTAL - 1.6) * SR); fade[n0:] = np.linspace(1, 0, len(st) - n0) ** 2
st *= fade[:, None]
st /= np.max(np.abs(st)) / 0.9
st = np.tanh(st * 1.4) / np.tanh(1.4) * 0.92
pcm = (st * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', len(pcm) / SR, 's  fine riff a', round(end, 2))
