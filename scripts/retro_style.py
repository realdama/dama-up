#!/usr/bin/env python3
"""Stile illustrazione anni '80 (poster neon): posterizza, colora viola/rosa/oro, contorno nero."""
import sys, numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance

def stylize(im, outline=10, levels=6):
    im = im.convert("RGBA")
    a = im.getchannel("A")
    rgb = im.convert("RGB")
    rgb = ImageEnhance.Contrast(rgb).enhance(1.35)
    rgb = ImageEnhance.Color(rgb).enhance(1.25)
    k = max(5, (min(rgb.size) // 180) | 1)
    rgb = rgb.filter(ImageFilter.MedianFilter(k)).filter(ImageFilter.MedianFilter(k))
    rgb = ImageOps.posterize(rgb, 3).filter(ImageFilter.MedianFilter(5))
    arr = np.asarray(rgb).astype(np.float32) / 255
    lum = arr.mean(axis=2, keepdims=True)
    shadow = np.array([0.30, 0.08, 0.45]); high = np.array([1.0, 0.82, 0.62])
    tint = shadow * (1 - lum) + high * lum
    arr = np.clip(arr * 0.72 + tint * 0.36, 0, 1)
    rgb = Image.fromarray((arr * 255).astype(np.uint8))
    edges = rgb.convert("L").filter(ImageFilter.GaussianBlur(1.2)).filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 38 else 0).filter(ImageFilter.MedianFilter(5))
    ink = Image.new("RGB", rgb.size, (20, 6, 40))
    rgb = Image.composite(ink, rgb, edges.point(lambda v: int(v * 0.55)))
    out = rgb.convert("RGBA"); out.putalpha(a)
    a_hard = a.point(lambda v: 255 if v > 110 else 0)
    stroke = a_hard.filter(ImageFilter.MaxFilter(outline * 2 + 1))
    base = Image.new("RGBA", im.size, (20, 6, 40, 0)); base.putalpha(stroke)
    base.alpha_composite(out)
    return base

def pad(im, p=24):
    c = Image.new("RGBA", (im.width + 2 * p, im.height + 2 * p), (0, 0, 0, 0)); c.paste(im, (p, p)); return c

E = "assets/elite/"; O = "studio/public/elite/"
neve = Image.open(E + "cut_neve.png"); rit = Image.open(E + "cut_ritratto.png")
# 1) poster: tu + cane (foto sulla neve), 2) ritratto
stylize(pad(neve), outline=9).save(O + "poster_tu_cane.png")
stylize(pad(rit), outline=10).save(O + "ritratto.png")
# 3) testa (dal ritratto): maschera ovale su viso e collo, senza la giacca
W, H = rit.size
head = rit.crop((int(W * 0.22), 0, int(W * 0.78), int(H * 0.70)))
hw, hh = head.size
yy, xx = np.mgrid[0:hh, 0:hw].astype(np.float32)
cx, cy, rx, ry = hw * 0.52, hh * 0.42, hw * 0.40, hh * 0.56
d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
ell = np.clip((1.0 - d) / 0.12, 0, 1)
a = np.asarray(head.getchannel("A")).astype(np.float32) * ell
head.putalpha(Image.fromarray(a.astype(np.uint8)))
stylize(pad(head), outline=7).save(O + "testa.png")
# 4) testa del cane (foto sulla neve): testa senza le gambe dietro, sfumata in basso
w2, h2 = neve.size
dog = neve.crop((0, int(h2 * 0.515), int(w2 * 0.40), int(h2 * 0.72)))
g = np.ones((dog.height, dog.width), np.float32)
f0 = int(dog.height * 0.70); g[f0:, :] = np.linspace(1, 0, dog.height - f0)[:, None]
xr = int(dog.width * 0.80); g[:, xr:] *= np.linspace(1, 0, dog.width - xr)[None, :]
dog.putalpha(Image.fromarray((np.asarray(dog.getchannel("A")).astype(np.float32) * g).astype(np.uint8)))
stylize(pad(dog), outline=6).save(O + "cane_testa.png")
# 5) ritratto del cane (foto sul divano) per il riquadro "il socio"
U = "/root/.claude/uploads/417330c6-310e-5c17-bcf2-9fdbd936fb13/461eb275-image.jpg"
sofa = Image.open(U).convert("RGBA")
sw, sh = sofa.size
face = sofa.crop((int(sw * 0.12), int(sh * 0.05), int(sw * 0.95), int(sh * 0.62)))
stylize(face, outline=2).save(O + "cane_ritratto.png")
print("ok")
