# Colonna sonora cinematografica "sottomarina" sintetizzata (originale, senza diritti).
# Re minore, 90 BPM: pad caldi + pianoforte + marimba (tropici) + sub, riverbero a convoluzione,
# riser e impatti sui momenti chiave, ducking calcolato sulla voce (niente pompaggio da compressore).
# Uso: python3 music_cine.py voce.wav sezioni.json out_music.wav out_sfx.wav
import numpy as np, soundfile as sf, json, sys
from scipy.signal import lfilter, butter, sosfilt, fftconvolve

voice_p, cfg_p, out_m, out_s = sys.argv[1:5]
cfg = json.load(open(cfg_p))
SR = 48000; T = cfg['total']; N = int(SR * T); t = np.arange(N) / SR
BPM = 90; beat = 60 / BPM; bar = 4 * beat
rng = np.random.default_rng(11)
note = lambda m: 440 * 2 ** ((m - 69) / 12)
def lp(x, fc):
    sos = butter(2, fc, 'low', fs=SR, output='sos'); return sosfilt(sos, x)
def hp(x, fc):
    sos = butter(2, fc, 'high', fs=SR, output='sos'); return sosfilt(sos, x)

L = np.zeros(N); R = np.zeros(N)
def add(x, i0, g=1.0, pan=0.5):
    i1 = min(N, i0 + len(x)); x = x[: i1 - i0]
    L[i0:i1] += g * x * np.sqrt(1 - pan); R[i0:i1] += g * x * np.sqrt(pan)

# sezioni: [inizio, fine, nome] -> intensità/colore
SEC = cfg['sections']
def sec_at(s):
    for a, b, n in SEC:
        if a <= s < b: return n
    return SEC[-1][2]
INT = {'hook': 0.55, 'intro': 0.7, 'mappa': 0.8, 'storia': 0.6, 'lift': 1.0, 'tropici': 0.9, 'suspense': 0.5, 'finale': 1.0, 'logo': 1.0}

chords = [[50, 57, 62, 65], [46, 53, 58, 62], [53, 57, 60, 65], [48, 55, 60, 64]]  # Dm Bb F C
clen = 2 * bar
# --- pad (armoniche dente di sega, detune, filtro morbido)
for ci in range(int(T / clen) + 1):
    s0 = ci * clen
    if s0 >= T: break
    ch = chords[ci % 4]; d = clen + 2.0; n = int(d * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 1.6) * np.minimum(1, np.maximum(0, (d - tt) / 1.8))
    x = np.zeros(n)
    for m in ch:
        for det in (-0.07, 0.07):
            f = note(m) * 2 ** (det / 12)
            for h in range(1, 7):
                x += np.sin(2 * np.pi * f * h * tt + h * det * 9) / h * (0.8 ** h)
    nm = sec_at(s0 + 0.1)
    fc = {'storia': 900, 'suspense': 700}.get(nm, 1600 if nm in ('lift', 'finale', 'logo') else 1200)
    x = lp(x, fc) * env * 0.022 * (0.8 + 0.4 * INT[nm])
    add(x, int(s0 * SR), 1, 0.38); add(x, int(s0 * SR), 1, 0.62)
    # sub basso
    f = note(ch[0] - 24); bs = np.sin(2 * np.pi * f * tt) * env * 0.11
    add(bs, int(s0 * SR), 1, 0.5)

# --- pianoforte (arpeggio a crome con nota alta di melodia)
def piano(f, dur=1.6, vel=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    for k, a in enumerate([1, 0.5, 0.28, 0.16, 0.08]):
        fk = f * (k + 1) * (1 + 0.0004 * (k + 1) ** 2)
        x += a * np.sin(2 * np.pi * fk * tt) * np.exp(-tt * (2.2 + k * 1.3))
    x *= np.minimum(1, tt / 0.003) * vel
    return x
pat = [0, 2, 1, 3, 2, 1, 3, 2]
mel = [74, 72, 69, 72, 74, 77, 76, 74]  # motivo che torna ogni 4 battute
s = 3.4; k = 0
while s < T - 1.0:
    nm = sec_at(s)
    if nm not in ('hook', 'suspense', 'tropici'):
        ch = chords[int(s / clen) % 4]
        m = ch[pat[k % 8]] + 12
        vel = 0.75 + 0.25 * (k % 4 == 0)
        add(piano(note(m), vel=vel), int(s * SR), 0.05 * INT[nm], 0.35 if k % 2 else 0.65)
        if k % 8 == 0 and nm in ('lift', 'finale', 'mappa', 'intro'):
            add(piano(note(mel[(k // 8) % 8]), 2.4, 1.0), int(s * SR), 0.06, 0.5)
    s += beat / 2; k += 1

# --- marimba (mari caldi / tropici)
def marimba(f):
    n = int(0.9 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt * 30)) * np.exp(-tt * 7) * np.minimum(1, tt / 0.002)
s = 0; k = 0
while s < T:
    if sec_at(s) == 'tropici':
        ch = chords[int(s / clen) % 4]
        m = ch[[0, 2, 3, 2, 1, 2, 3, 1][k % 8]] + 12 + (12 if k % 8 in (3, 6) else 0)
        add(marimba(note(m)), int(s * SR), 0.07, 0.3 + 0.4 * (k % 2))
    s += beat / 2; k += 1

# --- battito / timpano morbido
s = 3.4; b = 0
while s < T - 0.5:
    nm = sec_at(s)
    if nm in ('intro', 'mappa', 'lift', 'tropici', 'finale', 'storia'):
        if b % 2 == 0 or nm in ('lift', 'finale'):
            n = int(0.5 * SR); tt = np.arange(n) / SR
            fr = 46 + 70 * np.exp(-tt * 28); x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 7)
            add(x, int(s * SR), 0.20 * (0.6 if nm == 'storia' else 1.0) * (0.75 if b % 2 else 1), 0.5)
    s += beat; b += 1

# --- orologio/tensione sulla curiosità
for a, b2, n in SEC:
    if n == 'suspense':
        s = a
        while s < b2 - 0.2:
            nn = int(0.08 * SR); tt = np.arange(nn) / SR
            x = np.sin(2 * np.pi * 2200 * tt) * np.exp(-tt * 90)
            add(x, int(s * SR), 0.035, 0.7 if int(s / beat * 2) % 2 else 0.3)
            s += beat / 2

# --- riverbero (impulso sintetico 2,6 s)
irn = int(2.6 * SR); it = np.arange(irn) / SR
irL = rng.standard_normal(irn) * np.exp(-it * 2.4); irR = rng.standard_normal(irn) * np.exp(-it * 2.4)
irL = lp(irL, 5000); irR = lp(irR, 5000); irL /= np.sqrt((irL ** 2).sum()); irR /= np.sqrt((irR ** 2).sum())
wetL = fftconvolve(L, irL)[:N]; wetR = fftconvolve(R, irR)[:N]
L = 0.72 * L + 0.42 * wetL; R = 0.72 * R + 0.42 * wetR
L = hp(L, 35); R = hp(R, 35)

# --- dinamica di sezione + fade
g = np.ones(N)
for a, b2, n in SEC:
    i0, i1 = int(a * SR), int(min(T, b2) * SR); g[i0:i1] = 0.75 + 0.35 * INT[n]
g = np.convolve(g, np.ones(int(0.6 * SR)) / int(0.6 * SR), 'same')
g *= np.minimum(1, t / 0.6) * np.minimum(1, np.maximum(0, (T - t) / 2.0))
mus = np.stack([L * g, R * g], 1)

# --- ducking dalla voce (inviluppo, attacco 60 ms, rilascio 450 ms)
v, vsr = sf.read(voice_p); v = v if v.ndim == 1 else v.mean(1)
if vsr != SR: raise SystemExit('voce a 48 kHz')
v = np.pad(v, (0, max(0, N - len(v))))[:N]
w = int(0.05 * SR); env = np.sqrt(np.convolve(v ** 2, np.ones(w) / w, 'same'))
act = (20 * np.log10(env + 1e-9) > -42).astype(float)
a_att = 1 - np.exp(-1 / (0.06 * SR)); a_rel = 1 - np.exp(-1 / (0.45 * SR))
sm = np.empty(N); st = 0.0
for i in range(0, N, 48):  # a blocchi di 1 ms
    tgt = act[i]; a = a_att if tgt > st else a_rel
    st += (tgt - st) * (1 - (1 - a) ** 48); sm[i:i + 48] = st
duck = 10 ** (-9 * sm / 20)
mus *= duck[:, None]
mus /= np.abs(mus).max() / 0.6
sf.write(out_m, mus.astype(np.float32), SR, subtype='FLOAT')

# ---------------- SFX: whoosh, riser, impatti, logo ----------------
sfx = np.zeros((N, 2))
def addS(x, i0, g, pan=0.5):
    i0 = max(0, i0); i1 = min(N, i0 + len(x)); x = x[: i1 - i0]
    sfx[i0:i1, 0] += g * x * np.sqrt(1 - pan); sfx[i0:i1, 1] += g * x * np.sqrt(pan)
def whoosh(at, g=0.09, d=0.55):
    n = int(d * SR); x = np.linspace(0, 1, n); nz = rng.standard_normal(n)
    y = lfilter([0.08], [1, -0.92], nz) * np.sin(np.pi * x) ** 2
    y = hp(y, 300)
    i0 = int((at - d * 0.45) * SR)
    sfx[max(0, i0):max(0, i0) + n, 0] += (g * y * (1 - 0.6 * x))[: N - max(0, i0)]
    sfx[max(0, i0):max(0, i0) + n, 1] += (g * y * (0.4 + 0.6 * x))[: N - max(0, i0)]
def riser(at, d=1.6, g=0.10):
    n = int(d * SR); tt = np.arange(n) / SR; x = tt / d
    nz = hp(lp(rng.standard_normal(n), 3000 + 5000 * 0.5), 400) * x ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 600 * x ** 2) / SR) * x ** 2 * 0.3
    addS((nz * 0.6 + tone), int((at - d) * SR), g)
def impact(at, g=0.55):
    n = int(2.2 * SR); tt = np.arange(n) / SR
    fr = 36 + 80 * np.exp(-tt * 14); boom = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 3.2)
    addS(boom, int(at * SR), g)
for at in cfg['whoosh']: whoosh(at)
for at in cfg['risers']: riser(at)
for at in cfg['impacts']: impact(at)
# pop morbidi su comparse importanti
for at in cfg['pops']:
    n = int(0.12 * SR); tt = np.arange(n) / SR
    addS(np.sin(2 * np.pi * (900 - 2500 * tt) * tt) * np.exp(-tt * 40), int(at * SR), 0.10)
# logo: boom + shimmer
LOGO = cfg['logo']; impact(LOGO - 0.02, 0.8)
n = int(3.0 * SR); tt = np.arange(n) / SR
sh = sum(np.sin(2 * np.pi * f * tt + p) * np.exp(-tt * 1.3) for f, p in ((1760, 0), (2349, 1), (2637, 2), (3520, 3))) * 0.05 * np.minimum(1, tt / 0.12)
addS(sh, int(LOGO * SR), 1, 0.35); addS(sh, int((LOGO + 0.07) * SR), 1, 0.65)
sf.write(out_s, sfx.astype(np.float32), SR, subtype='FLOAT')
print('ok', round(T, 2))
