#!/usr/bin/env python3
"""HyperFrames — sequenze di marchio Argo Maris (apertura/chiusura) in HTML+GSAP, renderizzate in MP4.
Uso: python3 scripts/hf_brand.py <out.mp4> <durata_s> "<riga1>" "<riga2>" ["<partner>"] [--layout intro|end]
"""
import json, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HF = ROOT / "hf"
args = [a for a in sys.argv[1:] if not a.startswith("--")]
layout = "end" if "--layout=end" in sys.argv else "intro"
out, dur, line1, line2 = args[0], float(args[1]), args[2], args[3]
partner = args[4] if len(args) > 4 else ""
proj = HF / ("brand_" + Path(out).stem)
if proj.exists():
    shutil.rmtree(proj)
shutil.copytree(HF / "test", proj, ignore=shutil.ignore_patterns("*.mp4", "renders"))
fonts = sorted((HF / "node_modules/@fontsource/montserrat/files").glob("montserrat-latin-*-normal.woff2"))
(proj / "fonts").mkdir(exist_ok=True)
for f in fonts:
    shutil.copy(f, proj / "fonts" / f.name)
shutil.copy(HF / "emblem.svg", proj / "emblem.svg")

letters = "".join(f'<span class="ch">{c if c != " " else "&nbsp;"}</span>' for c in "ARGO MARIS")
waves = "".join(
    f'<path class="wv wv{i}" d="" fill="{c}" opacity="{o}"/>' for i, (c, o) in enumerate([("#0A4C8C", 0.9), ("#1C8FD6", 0.55), ("#3FE0D0", 0.18)])
)
html = f"""<!doctype html>
<html lang="it" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="gsap.min.js"></script>
<style>
@font-face {{ font-family: M; font-weight: 600; src: url(fonts/montserrat-latin-600-normal.woff2); }}
@font-face {{ font-family: M; font-weight: 800; src: url(fonts/montserrat-latin-800-normal.woff2); }}
@font-face {{ font-family: M; font-weight: 900; src: url(fonts/montserrat-latin-900-normal.woff2); }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: 1920px; height: 1080px; overflow: hidden; background: #020B1A; }}
#root {{ position: relative; width: 1920px; height: 1080px; font-family: M, sans-serif; color: #E8FBFF;
  background: radial-gradient(80% 90% at 50% 30%, #0B3D6E 0%, #06244A 40%, #020B1A 85%); overflow: hidden; }}
#rays {{ position: absolute; inset: 0; }}
#emblem {{ position: absolute; left: 50%; top: {"130" if layout == "intro" else "170"}px; width: 250px; height: 250px; margin-left: -125px; }}
#name {{ position: absolute; top: {"390" if layout == "intro" else "430"}px; width: 100%; text-align: center; font-weight: 900; font-size: 150px; letter-spacing: 26px; }}
.ch {{ display: inline-block; }}
#l2 {{ position: absolute; top: {"585" if layout == "intro" else "625"}px; width: 100%; text-align: center; font-weight: 800; font-size: 54px; color: #3FE0D0; }}
#l3 {{ position: absolute; top: {"670" if layout == "intro" else "710"}px; width: 100%; text-align: center; font-weight: 800; font-size: 40px; letter-spacing: 10px; color: #FFC94A; }}
#line {{ position: absolute; top: {"565" if layout == "intro" else "605"}px; left: 50%; width: 760px; height: 4px; margin-left: -380px; background: linear-gradient(90deg, transparent, #FFC94A, transparent); }}
#sea {{ position: absolute; left: 0; bottom: 0; width: 1920px; height: 260px; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{dur}" data-width="1920" data-height="1080">
  <svg id="rays" class="clip" data-start="0" data-duration="{dur}" data-track-index="0" viewBox="0 0 1920 1080">
    <polygon class="ray" points="700,0 860,0 760,1080 420,1080" fill="#3FE0D0" opacity="0.05"/>
    <polygon class="ray" points="1100,0 1220,0 1400,1080 1120,1080" fill="#3FE0D0" opacity="0.04"/>
  </svg>
  <div id="emblem" class="clip" data-start="0" data-duration="{dur}" data-track-index="1">
    <svg id="ringsvg" viewBox="-100 -100 200 200" width="250" height="250" style="position:absolute;left:0;top:0"><circle id="ring" r="96" fill="none" stroke="#3FE0D0" stroke-width="7" stroke-dasharray="604" stroke-dashoffset="604" transform="rotate(-90)"/></svg>
    <img id="disc" src="emblem.svg" style="position:absolute;left:0;top:0;width:250px;height:250px"/>
  </div>
  <div id="name" class="clip" data-start="0" data-duration="{dur}" data-track-index="2">{letters}</div>
  <div id="line" class="clip" data-start="0" data-duration="{dur}" data-track-index="3"></div>
  <div id="l2" class="clip" data-start="0" data-duration="{dur}" data-track-index="4">{line1}</div>
  <div id="l3" class="clip" data-start="0" data-duration="{dur}" data-track-index="5">{line2}</div>
  <svg id="sea" class="clip" data-start="0" data-duration="{dur}" data-track-index="6" viewBox="0 0 1920 260">{waves}</svg>
</div>
<script>
  const tl = gsap.timeline({{ paused: true }});
  const D = {dur};
  // onde: il path viene ricalcolato a ogni tick in base al tempo della timeline
  const state = {{ t: 0 }};
  const draw = () => {{
    document.querySelectorAll('.wv').forEach((el, k) => {{
      let d = 'M 0 260';
      for (let x = 0; x <= 1920; x += 24) d += ' L ' + x + ' ' + (110 + k * 40 + Math.sin(x / (170 + k * 40) + state.t * (1.6 + k * 0.5)) * (22 - k * 4));
      el.setAttribute('d', d + ' L 1920 260 Z');
    }});
    gsap.set('#disc', {{ y: Math.sin(state.t * 2.2) * 4, rotation: Math.sin(state.t * 1.4) * 3 }});
  }};
  tl.to(state, {{ t: D, duration: D, ease: 'none', onUpdate: draw }}, 0);
  tl.fromTo('.ray', {{ opacity: 0 }}, {{ opacity: 0.06, duration: 1.5, stagger: 0.3 }}, 0);
  tl.fromTo('#sea', {{ y: 260 }}, {{ y: 0, duration: 1.2, ease: 'power3.out' }}, 0);
  tl.fromTo('#ring', {{ attr: {{ 'stroke-dashoffset': 604 }} }}, {{ attr: {{ 'stroke-dashoffset': 0 }}, duration: 1.1, ease: 'power2.inOut' }}, 0.2);
  tl.fromTo('#disc', {{ scale: 0, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.8)' }}, 0.6);
  tl.fromTo('#emblem', {{ scale: 0.6, rotation: -30 }}, {{ scale: 1, rotation: 0, duration: 1.2, ease: 'back.out(1.6)' }}, 0.2);
  tl.fromTo('.ch', {{ opacity: 0, y: 80, filter: 'blur(12px)' }}, {{ opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.06, ease: 'power4.out' }}, 1.0);
  tl.fromTo('#line', {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.9, ease: 'power3.inOut' }}, 1.7);
  tl.fromTo('#l2', {{ opacity: 0, y: 30 }}, {{ opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }}, 2.0);
  tl.fromTo('#l3', {{ opacity: 0, y: 24 }}, {{ opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }}, 2.5);
  tl.to('#name', {{ scale: 1.03, duration: D - 3, ease: 'sine.inOut' }}, 3);
  {"tl.to('#root', { opacity: 0, duration: 0.8 }, D - 0.8);" if layout == "end" else ""}
  draw();
  window.__timelines['main'] = tl;
  tl.seek(0);
</script>
</body>
</html>
"""
(proj / "index.html").write_text(html)
cfg = json.loads((proj / "hyperframes.json").read_text()) if (proj / "hyperframes.json").exists() else {}
r = subprocess.run(["hyperframes", "render", "-o", str(Path(out).resolve()), "-q", "delivery", "--quiet", "-f", "30"], cwd=proj, capture_output=True, text=True)
print(r.stdout[-400:], r.stderr[-800:])
print("OK" if Path(out).exists() else "FAIL", out)
