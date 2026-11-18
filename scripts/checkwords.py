#!/usr/bin/env python3
"""Confronta la trascrizione Whisper con lo script: segnala parole sbagliate o poco chiare.
Uso: python3 scripts/checkwords.py <slug> <words.json>"""
import json, re, sys, difflib
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
NUM = {'2,7': 'due virgola sette', '24%': 'ventiquattro per cento', '4%': 'quattro per cento', '26%': 'ventisei per cento'}
def norm(t):
    t = t.lower().replace("’", "'")
    t = re.sub(r"[^a-zà-ù0-9' ]", " ", t)
    return [w for w in t.replace("'", " ").split() if w]
spec = json.loads((ROOT / "projects" / sys.argv[1] / "script.json").read_text())
ref = " ".join(" ".join(s["text"]) if isinstance(s["text"], list) else s["text"] for s in spec["scenes"])
hyp = json.load(open(sys.argv[2]))
hw = hyp["words"]
R, Hn = norm(ref), []
idx = []
for i, w in enumerate(hw):
    for x in norm(w["w"]):
        Hn.append(x); idx.append(i)
sm = difflib.SequenceMatcher(None, R, Hn, autojunk=False)
issues = 0
for op, a1, a2, b1, b2 in sm.get_opcodes():
    if op == "equal":
        continue
    r, h = " ".join(R[a1:a2]), " ".join(Hn[b1:b2])
    t = hw[idx[b1]]["start"] if b1 < len(idx) else hw[-1]["end"]
    ctx = " ".join(R[max(0, a1 - 4):a1])
    issues += 1
    print(f"[{int(t // 60)}:{t % 60:04.1f}] script: «{r}»  →  sentito: «{h}»   (…{ctx})")
lowp = [w for w in hw if w.get("p", 1) < 0.5]
print(f"\n{len(R)} parole nello script, {issues} differenze; parole con bassa sicurezza: {len(lowp)}")
for w in lowp[:40]:
    print(f"   ? {w['w']} ({w['p']}) a {w['start']:.1f}s")
