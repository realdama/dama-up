#!/usr/bin/env python3
"""Texture del personaggio 3D (testa con il viso dalla foto, capelli platino, collo con tatuaggio, camicia)."""
import numpy as np, onnxruntime as ort
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
SRC = "/root/.claude/uploads/417330c6-310e-5c17-bcf2-9fdbd936fb13/064ab3ea-image.jpg"
O = "studio/public/ped/"
rng = np.random.default_rng(3)
im = Image.open(SRC).convert("RGB")
# maschera persona (per togliere la neve dietro al viso)
sess = ort.InferenceSession("assets/elite/rmbg.onnx", providers=["CPUExecutionProvider"])
x = np.asarray(im.resize((1024, 1024))).astype(np.float32) / 255 - 0.5
m = sess.run(None, {sess.get_inputs()[0].name: x.transpose(2, 0, 1)[None]})[0][0, 0]
m = (m - m.min()) / (m.max() - m.min())
mask = Image.fromarray((m * 255).astype(np.uint8)).resize(im.size)

fa = np.asarray(im.crop((600, 260, 760, 420))).reshape(-1, 3).astype(np.float32)  # fronte/guancia
skin = np.median(fa, axis=0)
skin_rgb = tuple(int(c) for c in skin)
TW, TH = 2048, 1024
tex = Image.new("RGB", (TW, TH), skin_rgb)
arr = np.asarray(tex).astype(np.float32)
# grana pelle
arr += rng.normal(0, 4, arr.shape)
yy, xx = np.mgrid[0:TH, 0:TW]
theta = yy / TH * 180  # gradi dall'alto
# sfumatura rasata (fade): lati e nuca, scura in alto, pelle in basso
fade = np.clip((theta - 62) / 28, 0, 1)
stubble = skin * 0.26 + np.array([14, 12, 14]) + rng.normal(0, 8, (TH, TW, 1))
arr = arr * fade[..., None] + stubble * (1 - fade[..., None])
# barba che avvolge la mandibola (davanti e ai lati, non sulla nuca)
u = xx / TW
front = np.exp(-((u - 0.25) / 0.17) ** 2)
beard = np.clip((theta - 112) / 10, 0, 1) * np.clip((165 - theta) / 10, 0, 1) * front
bcol = np.array([40, 28, 22], np.float32) + rng.normal(0, 12, (TH, TW, 1))
arr = arr * (1 - beard[..., None] * 0.85) + bcol * beard[..., None] * 0.85
tex = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
# viso dalla foto, centrato davanti (u = 0.25)
face = im.crop((540, 190, 1000, 730)); fm = mask.crop((540, 190, 1000, 730))
fw, fh = 600, 520
face = face.resize((fw, fh)); fm = fm.resize((fw, fh))
feather = Image.new("L", (fw, fh), 0); ImageDraw.Draw(feather).ellipse((70, 60, fw - 60, fh - 20), fill=255)
feather = feather.filter(ImageFilter.GaussianBlur(55))
fm = Image.fromarray((np.asarray(fm).astype(np.float32) * np.asarray(feather) / 255).astype(np.uint8))
tex.paste(face, (int(0.25 * TW - fw / 2), int(58 / 180 * TH)), fm)
tex = ImageEnhance.Contrast(tex).enhance(1.08)
tex.save(O + "head.jpg", quality=92)

# capelli: platino a riccioli corti (twist), radici più scure
H2 = Image.new("RGB", (1024, 512), (205, 205, 210)); d = ImageDraw.Draw(H2)
for _ in range(9000):
    x0, y0 = rng.uniform(0, 1024), rng.uniform(0, 512)
    r = rng.uniform(3, 7); g = int(rng.uniform(150, 255))
    d.arc((x0 - r, y0 - r, x0 + r, y0 + r), rng.uniform(0, 360), rng.uniform(0, 360) + 220, fill=(g, g, g + 4), width=2)
for _ in range(2500):
    x0, y0 = rng.uniform(0, 1024), rng.uniform(0, 512)
    d.point((x0, y0), fill=(90, 85, 85))
H2 = H2.filter(ImageFilter.SMOOTH)
H2.save(O + "hair.jpg", quality=92)

# collo con tatuaggio (corona + Elite) dalla foto
neck = Image.new("RGB", (1024, 256), skin_rgb)
tat = im.crop((420, 640, 700, 860)).resize((300, 236))
tm = Image.new("L", tat.size, 0); ImageDraw.Draw(tm).ellipse((10, 5, 290, 225), fill=255); tm = tm.filter(ImageFilter.GaussianBlur(18))
neck.paste(tat, (256 + 60 - 150, 10), tm)
neck.save(O + "neck.jpg", quality=92)

# camicia hawaiana (ripetibile)
S = Image.new("RGB", (512, 512), (255, 110, 196)); d = ImageDraw.Draw(S)
for i in range(14):
    cx, cy = rng.uniform(0, 512), rng.uniform(0, 512); a = rng.uniform(0, 6.28)
    for k in range(7):
        ang = a + (k - 3) * 0.35; L = 70
        d.line([(cx, cy), (cx + np.cos(ang) * L, cy + np.sin(ang) * L)], fill=(24, 169, 153), width=14)
for i in range(18):
    cx, cy = rng.uniform(0, 512), rng.uniform(0, 512)
    for k in range(5):
        ang = k * 1.256
        d.ellipse((cx + np.cos(ang) * 12 - 10, cy + np.sin(ang) * 12 - 10, cx + np.cos(ang) * 12 + 10, cy + np.sin(ang) * 12 + 10), fill=(255, 228, 94))
    d.ellipse((cx - 6, cy - 6, cx + 6, cy + 6), fill=(255, 154, 60))
S.save(O + "shirt.jpg", quality=92)
print("ok", skin_rgb)
