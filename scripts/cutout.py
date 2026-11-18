#!/usr/bin/env python3
"""Scontorno (RMBG-1.4 ONNX): python3 scripts/cutout.py in.jpg out.png"""
import sys, numpy as np, onnxruntime as ort
from PIL import Image
sess = ort.InferenceSession("assets/elite/rmbg.onnx", providers=["CPUExecutionProvider"])
im = Image.open(sys.argv[1]).convert("RGB")
x = np.asarray(im.resize((1024, 1024), Image.BILINEAR)).astype(np.float32) / 255.0
x = (x - 0.5) / 1.0
x = x.transpose(2, 0, 1)[None]
out = sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0]
out = (out - out.min()) / (out.max() - out.min() + 1e-8)
mask = Image.fromarray((out * 255).astype(np.uint8)).resize(im.size, Image.BILINEAR)
rgba = im.copy(); rgba.putalpha(mask)
bb = mask.point(lambda v: 255 if v > 30 else 0).getbbox()
rgba.crop(bb).save(sys.argv[2])
print(sys.argv[2], rgba.crop(bb).size)
