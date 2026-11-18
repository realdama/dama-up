# Argo Maris — Studio Video (memoria di progetto)

In questo repository si montano i **video per i progetti Argo Maris**. Obiettivo fisso:
**lasciare a bocca aperta chi guarda**.

## REGOLA FISSA: usare SEMPRE tutti e 7 i programmi
In **ogni** video Argo Maris si usano sempre, tutti insieme:
**Remotion, HyperFrames, OpenMontage, ffmpeg, Whisper, yt-dlp, headroom.**
Ruolo di ciascuno in ogni produzione:
1. **OpenMontage** — regia: scegli la pipeline (`tools/OpenMontage/pipeline_defs/`, di solito
   `animated-explainer`), leggi il suo `AGENT_GUIDE.md` e le skill di stage per struttura, script e revisione.
2. **yt-dlp** — scarica i video/audio di riferimento o le sorgenti fornite dall'utente (solo come
   riferimento di ritmo e stile, mai nel video finale: niente immagini né crediti).
3. **Whisper** (faster-whisper) — trascrive riferimenti e registrazioni vocali, dà i tempi parola per parola,
   e fa il controllo finale del video renderizzato.
4. **headroom** — comprime trascrizioni e log lunghi (riferimenti, output Whisper) prima di analizzarli.
5. **Remotion** — motore principale delle scene animate, sincronizzate con la voce.
6. **HyperFrames** — scene/inserti in HTML (titoli, grafiche cinetiche, schede numeriche) renderizzati e
   montati con Remotion/ffmpeg; usa anche `hyperframes beats` / `hyperframes audio` per analizzare il ritmo.
7. **ffmpeg** — mix voce/ambiente/effetti, ducking, mastering −14 LUFS / −1.5 dBTP, montaggio e mux finale.
Se uno strumento non può funzionare (per esempio la rete blocca un sito), dirlo all'utente e chiedere di sbloccarlo, senza saltarlo in silenzio.

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

## Preferenze dell'utente (aggiornate)
- Video Argo Maris "di progetto" (GDO, Coop): formato **16:9 1920×1080**, tono B2B ("voi" verso la catena,
  "ti" quando si spiega il progetto a chi lo avvia). I social restano 9:16.
- **Focus sul locale**: prima il **Tirreno** (barche e aste di Civitavecchia, Fiumicino, Anzio + Mercato di Roma/CAR),
  poi l'**Adriatico** ("due mari, una sola regia"). L'**estero** (Scozia, Olanda, Grecia, Croazia, Turchia)
  è solo un **plus, quasi alla fine**.
- Voce **naturale**: frasi brevi, una frase per "beat", pause calibrate (voice.py con `text` come lista).
  ATTENZIONE: la voce multilingue legge le **liste di nomi isolati** con accento straniero ("Trigley, Alisai").
  Scrivere sempre con articoli e congiunzioni: "ci sono le triglie e le alici, i calamari e i gamberi…".
  Prima di renderizzare, provare le frasi delicate con Whisper (sigle, nomi, liste).
  Controllo completo parole: `python3 scripts/checkwords.py <slug> <whisper.json>` (script vs voce).
  Pronunce: `"pron"` in script.json cambia solo la voce, non i sottotitoli
  ("Unicoop Etruria"→"Unicoop, Etruria", "HACCP"→"H.A.C.C.P."). "hub" a inizio frase suona "lab": dire "centro logistico".
- Loghi: `assets/brand/argo-maris-logo.png` (logo del cliente, ritagliato in tondo) e `unicoop-etruria-insegna.jpg`
  (dalla foto dell'insegna). La foto "magazzino Argo Maris" NON va usata: Argo Maris è broker senza deposito.
- Marinerie: Tirreno (Viareggio→Gaeta, 11) e Adriatico (Chioggia→Manfredonia, 13) in `lib/wide/Shared.tsx`.
- Tantissimi **esempi animati** (confronto offerte, ordine diviso tra fornitori, mare grosso → Adriatico, etichetta pesce,
  calcoli che si costruiscono). Nessuna foto, nessun logo di terzi (Coop solo come testo).
- Precisione: verificare i numeri (i conti del GDO v6 tornano: 7.000 €×4×52 = 1.456.000 €; utile 7% 25–54k,
  15% 120–149k, 20% 172–202k; 10 cent/kg ≈ 21.000 €/anno). "CAR = primo mercato d'Italia" → dire "uno dei più grandi".

## Kit 16:9 (studio/src/lib/wide)
- `ui.tsx`: Backdrop oceano, Header con capitoli, Captions16, Title cinetico, Card, Icon (30 icone vettoriali),
  Fish (specie: triglia, alice, calamaro, gambero, spada, ricciola, orata, spigola, salmone, merluzzo), Boat, Truck, Emblem.
- `MapView.tsx`: mappe Natural Earth pre-calcolate (`scripts/mkmap.mjs` → `maps.json`, viste lazio/centro/italia/europa),
  Port, Route, Fleet, Storm, SeaLabel, camera animata.
- `WideVideo.tsx`: monta scene + transizioni + header + sottotitoli. Scene: `useScene(p)` → `B(i)` inizio beat, `Wd('parola')`.
- HyperFrames: `python3 scripts/hf_brand.py out.mp4 <dur> "<riga>" "<riga2>" [--layout=end]` (apertura/chiusura con GSAP).
  GSAP va copiato in locale (CDN bloccata). Evitare clipPath negli SVG animati in HyperFrames (usare `hf/emblem.svg`).
- headroom: `python3 scripts/compress.py <file.words.json>` (SmartCrusher: −57% token sulle trascrizioni).

## Video fatti
- `mare-salato` — "Perché il mare è salato?" (74.8 s, demo dello stile).
- `coop-etruria` — Argo Maris × Unicoop Etruria (16:9, 4:33). Rifatto dall'originale dell'artifact "Argo Maris – Video progetto".
- `gdo-v6` — Argo Maris GDO v6, il progetto completo (16:9, v2 15:36).
- `coop-etruria` v2 (6:27): loghi, 24 marinerie, come compriamo, consegna diretta, garanzie.
- `mare-italia` — proposta di partnership Mare Italia × Argo Maris (3:11). Dati pubblici: grossista CAR Roma,
  box 46–47, iscritta 2015, Guidonia, ~16 persone. Logo Mare Italia NON disponibile: nome in grafica (`MareItaliaMark`).
- `socio` — il progetto per il futuro socio (4:25): costi (< 10.000 €), guadagni al 50% (≈2.980 €/mese centrale,
  ≈880 €/mese prudente), ruoli, quote, rischi.
- `elite-city` — video personale in stile "Miami anni '80" (9:16, 59,8 s): omaggio di genere ORIGINALE
  (nessun logo/font/HUD/musica del gioco). Musica synthwave generata (`scripts/synthwave.py`, 110 BPM),
  scontorno foto con RMBG-1.4 ONNX (`scripts/cutout.py`), stile illustrazione (`scripts/retro_style.py`).
