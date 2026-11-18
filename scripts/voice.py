#!/usr/bin/env python3
"""Argo Maris — voce narrante naturale + timeline parola-per-parola.

projects/<slug>/script.json:
  {"voice": "...", "rate": "+4%", "beatPause": 0.32, "scenes": [
     {"id": "hook", "text": ["Frase uno.", "Frase due."], "pad": 0.5,
      "rates": {"1": "-4%"}, "pauses": {"0": 0.6}}]}
`text` può essere una stringa o una lista di frasi ("beat"): ogni beat viene sintetizzato a parte
e unito con pause calibrate (respiro naturale, come un narratore vero).

Scrive:
  studio/public/<slug>/voice.wav
  studio/src/videos/<slug>/timeline.json   (scene, beat, parole con tempi in secondi)

Uso: python3 scripts/voice.py <slug> [--voice ...] [--only id1,id2]
     python3 scripts/voice.py <slug> --realign
"""
import argparse, asyncio, json, os, re, subprocess, sys, tempfile, time
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
TICKS = 10_000_000
CACHE = ROOT / ".cache" / "tts"


async def tts_once(text, voice, rate, pitch, out_mp3):
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary", proxy=proxy)
    words = []
    with open(out_mp3, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                s = chunk["offset"] / TICKS
                words.append({"w": chunk["text"], "start": round(s, 3), "end": round(s + chunk["duration"] / TICKS, 3)})
    return words


async def tts(text, voice, rate, pitch, sem):
    """sintesi con cache su disco e retry (il servizio a volte risponde vuoto)"""
    import hashlib
    key = hashlib.sha1(f"{voice}|{rate}|{pitch}|{text}".encode()).hexdigest()[:16]
    CACHE.mkdir(parents=True, exist_ok=True)
    mp3, js = CACHE / f"{key}.mp3", CACHE / f"{key}.json"
    if mp3.exists() and js.exists() and mp3.stat().st_size > 0:
        return mp3, json.loads(js.read_text())
    async with sem:
        for attempt in range(8):
            try:
                words = await tts_once(text, voice, rate, pitch, mp3)
                if mp3.stat().st_size > 0:
                    js.write_text(json.dumps(words, ensure_ascii=False))
                    return mp3, words
            except Exception as e:
                print(f"    retry {attempt + 1} [{text[:30]}…]: {e.__class__.__name__}")
            await asyncio.sleep(1.5 * (attempt + 1))
    raise SystemExit(f"TTS fallito: {text}")


def align(text, words):
    """riporta punteggiatura/apostrofi del testo originale sulle parole TTS"""
    toks, j = text.split(), 0
    for w in words:
        core = w["w"].strip(".,!?;:'\"").lower()
        clean = lambda x: re.sub(r"[^a-zà-ù0-9 ]", "", x.lower())
        for k in range(j, min(j + 4, len(toks))):
            if core and clean(core).split() and clean(core).split()[0] in clean(toks[k]):
                w["t"] = " ".join(toks[k:k + len(core.split())]); j = k + len(core.split()); break
        else:
            w["t"] = w["w"]
    return words


def duration(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]))


def ff(*a):
    subprocess.run(["ffmpeg", "-y", "-v", "error", *a], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--voice")
    ap.add_argument("--realign", action="store_true")
    a = ap.parse_args()

    spec = json.loads((ROOT / "projects" / a.slug / "script.json").read_text())
    voice = a.voice or spec.get("voice", "it-IT-GiuseppeMultilingualNeural")
    rate, pitch = spec.get("rate", "+4%"), spec.get("pitch", "+0Hz")
    lead, gap, bp = spec.get("leadIn", 0.8), spec.get("gap", 0.55), spec.get("beatPause", 0.32)
    fps = spec.get("fps", 30)
    pub = ROOT / "studio" / "public" / a.slug
    src = ROOT / "studio" / "src" / "videos" / a.slug
    pub.mkdir(parents=True, exist_ok=True)
    src.mkdir(parents=True, exist_ok=True)

    # 1) sintesi in parallelo di tutti i beat
    jobs = []
    for sc in spec["scenes"]:
        beats = sc["text"] if isinstance(sc["text"], list) else [sc["text"]]
        for bi, b in enumerate(beats):
            r = sc.get("rates", {}).get(str(bi), sc.get("rate", rate))
            say = b
            for k, v in spec.get("pron", {}).items():
                say = say.replace(k, v)
            jobs.append((sc["id"], bi, say, sc.get("voice", voice), r))

    async def run_all():
        sem = asyncio.Semaphore(4)
        return await asyncio.gather(*[tts(b, v, r, pitch, sem) for (_, _, b, v, r) in jobs])

    results = asyncio.run(run_all())
    res = {(j[0], j[1]): r for j, r in zip(jobs, results)}

    # 2) montaggio: lead + [beat, pausa]... + pad scena
    tmp = Path(tempfile.mkdtemp())
    parts, scenes, t = [], [], lead
    sil_cache = {}

    def silence(sec):
        sec = round(max(0.0, sec), 3)
        if sec not in sil_cache:
            p = tmp / f"sil_{len(sil_cache)}.wav"
            ff("-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", f"{sec:.3f}", str(p))
            sil_cache[sec] = p
        return sil_cache[sec]

    parts.append(silence(lead))
    for sc in spec["scenes"]:
        beats = sc["text"] if isinstance(sc["text"], list) else [sc["text"]]
        s0, words, binfo = t, [], []
        for bi, b in enumerate(beats):
            mp3, ws = res[(sc["id"], bi)]
            wav = tmp / f"{sc['id']}_{bi}.wav"
            # rifila il silenzio di coda del TTS per controllare le pause
            ff("-i", str(mp3), "-af", "areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse",
               "-ar", "48000", "-ac", "1", str(wav))
            lead_trim = 0.0  # la testa non viene rifilata: i tempi delle parole restano esatti
            d = duration(wav)
            ws = align(b, [dict(w) for w in ws])
            for w in ws:
                w["start"] = round(w["start"] - lead_trim + t, 3)
                w["end"] = round(min(w["end"] - lead_trim + t, t + d), 3)
                w["beat"] = bi
            words += ws
            binfo.append({"i": bi, "start": round(t, 3), "end": round(t + d, 3), "text": b})
            parts.append(wav)
            t += d
            if bi < len(beats) - 1:
                p = float(sc.get("pauses", {}).get(str(bi), bp))
                parts.append(silence(p)); t += p
        pad = sc.get("pad", gap)
        parts.append(silence(pad)); t += pad
        scenes.append({"id": sc["id"], "start": round(s0, 3), "dur": round(t - s0, 3), "beats": binfo, "words": words,
                       "text": " ".join(beats)})
        print(f"  [{sc['id']}] {t - s0:6.2f}s  {len(beats)} beat  {len(words)} parole")

    tail = spec.get("tail", 3.0)
    parts.append(silence(tail)); t += tail
    lst = tmp / "list.txt"
    lst.write_text("\n".join(f"file '{p}'" for p in parts))
    ff("-f", "concat", "-safe", "0", "-i", str(lst), "-c", "pcm_s16le", str(pub / "voice.wav"))
    tl = {"slug": a.slug, "fps": fps, "voice": voice, "total": round(t, 3), "frames": int(round(t * fps)), "scenes": scenes}
    (src / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1))
    print(f"OK voce {voice} — durata {t:.2f}s ({tl['frames']} frame)")


if __name__ == "__main__":
    sys.exit(main())
