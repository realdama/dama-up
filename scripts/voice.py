#!/usr/bin/env python3
"""Argo Maris — voce narrante + timeline parola-per-parola.

Legge projects/<slug>/script.json, genera una clip vocale per scena con
Microsoft Edge neural TTS (via proxy), poi scrive:
  studio/public/<slug>/voice.wav        traccia voce unica
  studio/src/videos/<slug>/timeline.json  scene + parole con tempi (secondi)

Uso: python3 scripts/voice.py <slug> [--voice it-IT-GiuseppeMultilingualNeural]
"""
import argparse, asyncio, json, os, subprocess, sys, tempfile, time
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
TICKS = 10_000_000  # edge-tts usa unità da 100ns


async def tts(text, voice, rate, pitch, out_mp3):
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch,
                               boundary="WordBoundary", proxy=proxy)
    words = []
    with open(out_mp3, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                s = chunk["offset"] / TICKS
                words.append({"w": chunk["text"], "start": round(s, 3),
                              "end": round(s + chunk["duration"] / TICKS, 3)})
    return words


def align(text, words):
    """riporta punteggiatura/apostrofi del testo originale sulle parole TTS"""
    toks, j = text.split(), 0
    for w in words:
        core = w["w"].strip(".,!?;:'\"").lower()
        for k in range(j, min(j + 4, len(toks))):
            if core and core in toks[k].lower():
                w["t"] = toks[k]; j = k + 1; break
        else:
            w["t"] = w["w"]
    return words


def duration(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
                                   "format=duration", "-of", "csv=p=0", str(path)])
    return float(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--voice")
    a = ap.parse_args()

    spec = json.loads((ROOT / "projects" / a.slug / "script.json").read_text())
    voice = a.voice or spec.get("voice", "it-IT-GiuseppeMultilingualNeural")
    rate, pitch = spec.get("rate", "+6%"), spec.get("pitch", "+0Hz")
    lead, gap = spec.get("leadIn", 0.6), spec.get("gap", 0.45)
    fps = spec.get("fps", 30)

    pub = ROOT / "studio" / "public" / a.slug
    src = ROOT / "studio" / "src" / "videos" / a.slug
    pub.mkdir(parents=True, exist_ok=True)
    src.mkdir(parents=True, exist_ok=True)

    tmp = Path(tempfile.mkdtemp())
    scenes, parts, t = [], [], lead
    for i, sc in enumerate(spec["scenes"]):
        mp3 = tmp / f"s{i:02d}.mp3"
        for attempt in range(6):  # il servizio a volte risponde vuoto: riprova
            try:
                words = asyncio.run(tts(sc["text"], sc.get("voice", voice), sc.get("rate", rate), pitch, mp3))
                if mp3.stat().st_size > 0:
                    break
            except Exception as e:
                print(f"    retry {attempt + 1}: {e.__class__.__name__}")
            time.sleep(1.5 * (attempt + 1))
        else:
            raise SystemExit(f"TTS fallito per la scena {sc['id']}")
        wav = tmp / f"s{i:02d}.wav"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-ar", "48000", "-ac", "1", str(wav)], check=True)
        words = align(sc["text"], words)
        d = duration(wav)
        pad = sc.get("pad", gap)
        scenes.append({"id": sc["id"], "start": round(t, 3), "voiceDur": round(d, 3),
                       "dur": round(d + pad, 3), "text": sc["text"],
                       "words": [{**w, "start": round(w["start"] + t, 3), "end": round(w["end"] + t, 3)} for w in words]})
        parts.append((wav, pad))
        t += d + pad
        print(f"  [{sc['id']}] {d:5.2f}s  {len(words)} parole")

    # concatena con silenzi: lead-in + clip + pad ...
    sil = lambda s, p: subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i",
                                       "anullsrc=r=48000:cl=mono", "-t", f"{s:.3f}", str(p)], check=True)
    lst = tmp / "list.txt"
    lines = []
    sil(lead, tmp / "lead.wav"); lines.append("file 'lead.wav'")
    for i, (wav, pad) in enumerate(parts):
        lines.append(f"file '{wav.name}'")
        sil(pad, tmp / f"p{i:02d}.wav"); lines.append(f"file 'p{i:02d}.wav'")
    tail = spec.get("tail", 2.5)
    sil(tail, tmp / "tail.wav"); lines.append("file 'tail.wav'")
    lst.write_text("\n".join(lines))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-c", "pcm_s16le", str(pub / "voice.wav")], check=True)

    total = t + tail
    timeline = {"slug": a.slug, "fps": fps, "voice": voice, "total": round(total, 3),
                "frames": int(round(total * fps)), "scenes": scenes}
    (src / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
    print(f"OK voce {voice} — durata {total:.2f}s ({timeline['frames']} frame)")


def realign(slug):
    p = ROOT / "studio" / "src" / "videos" / slug / "timeline.json"
    tl = json.loads(p.read_text())
    for sc in tl["scenes"]:
        align(sc["text"], sc["words"])
    p.write_text(json.dumps(tl, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[2] == "--realign":
        realign(sys.argv[1]); sys.exit(0)
    sys.exit(main())
