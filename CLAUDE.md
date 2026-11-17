# Argo Maris — Studio Video (memoria di progetto)

In questo repository si montano i **video per i progetti Argo Maris**. Obiettivo fisso:
**lasciare a bocca aperta chi guarda**.

## Regole creative (sempre)
- **Voce**: sociale, calda, bella, in italiano, dà del "tu". Default `it-IT-GiuseppeMultilingualNeural`
  (alternative: `it-IT-IsabellaNeural`, `it-IT-DiegoNeural`, `it-IT-ElsaNeural`), rate `+6%`.
- **Spiegazioni**: tutto spiegato in maniera assoluta, passo per passo, con **esempi animati**
  (ogni concetto ha la sua animazione: gocce, ioni, contatori, grafici che si muovono).
- **Niente immagini e niente crediti**: solo grafica vettoriale animata (SVG/React/HTML) creata da noi.
  Nessuna foto/stock, nessuna schermata di crediti.
- Struttura: hook nei primi 2 s → spiegazione a step → numero "wow" → CTA "Seguici" con wordmark ARGO MARIS.
- Formato default 9:16 1080×1920 30 fps; sottotitoli social parola-per-parola (2-4 parole, parole chiave colorate).
- Palette: abyss `#020B1A`, deep `#06244A`, sea `#1C8FD6`, aqua `#3FE0D0`, gold `#FFC94A`, coral `#FF6B6B`.
  Font: Montserrat 800/900 (+ Space Grotesk per formule). Kit in `studio/src/lib/kit.tsx`.
- Audio: voce + ambiente marino + whoosh ai cambi scena, ducking sotto la voce,
  master **−14 LUFS, true-peak −1.5 dBTP** (headroom per i social).
- Verifica sempre: still dei frame chiave prima del render, Whisper sul file finale.

## Strumenti (installare con `bash scripts/setup.sh` in un container nuovo)
| Strumento | Uso |
|---|---|
| **Remotion 4** (`studio/`) | motore principale: scene animate in React/SVG |
| **HyperFrames** (`hyperframes` CLI) | composizioni HTML→video, alternativa per motion/slide; `hyperframes beats/audio` per analisi audio |
| **OpenMontage** (`tools/OpenMontage`, non versionato) | pipeline agentiche (animated-explainer, clip-factory, ...). Leggere il suo `AGENT_GUIDE.md` prima di usarlo |
| **ffmpeg** | mix, mastering, mux, tagli |
| **faster-whisper** large-v3-turbo | trascrizione con tempi parola (`scripts/transcribe.py`) |
| **yt-dlp** | download di riferimenti (YouTube è bloccato dalla rete dell'ambiente: serve aprirlo) |
| **edge-tts** | voce neurale (host `speech.platform.bing.com` aperto nell'ambiente `dama-up`; serve `--proxy`/`proxy=` HTTPS_PROXY) |
| **headroom** (`headroom-ai`) | compressione di trascrizioni/log lunghi per il contesto dell'LLM |

## Pipeline (un video = una cartella `projects/<slug>/script.json`)
```bash
python3 scripts/voice.py <slug>                 # voce per scena + timeline.json (tempi parola)
# scrivi/adatta studio/src/videos/<slug>/{Scenes,Video}.tsx e registra in studio/src/Root.tsx
cd studio && npx remotion still src/index.ts <Comp> /tmp/f.png --frame=300 --scale=0.5   # controllo
npx remotion render src/index.ts <Comp> ../out/<slug>_video.mp4 --props='{"withVoice":false}' --muted --crf=18
cd .. && python3 scripts/master.py <slug> out/<slug>_video.mp4 out/<slug>_FINAL.mp4
python3 scripts/transcribe.py out/<slug>_FINAL.mp4 /tmp/check.json   # verifica
```
- Nelle scene usa `useCue(p)('parola')` per far partire le animazioni esattamente quando la voce dice la parola.
- Se l'utente manda una sua registrazione vocale: `transcribe.py` → timeline → stesse scene.
- Note tecniche: Chrome per Remotion = `/opt/pw-browsers/chromium_headless_shell-1243/...` (in `remotion.config.ts`);
  edge-tts a volte risponde vuoto → `voice.py` riprova da solo.

## Video fatti
- `mare-salato` — "Perché il mare è salato?" (74.8 s, demo dello stile).
