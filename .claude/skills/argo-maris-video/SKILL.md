---
name: argo-maris-video
description: Produrre video iper professionali per Argo Maris (buyer/broker del pesce per la GDO) e progetti collegati (Coop, Mare Italia, soci, social): copione, voce italiana naturale, scene animate Remotion/HyperFrames, foto reali del CAR, mastering e verifica Whisper. Usare per qualsiasi nuovo video o aggiornamento di video Argo Maris.
---

# Video Argo Maris — procedura completa

Leggere prima `CLAUDE.md` (contenuti, numeri, preferenze). Usare sempre i 7 programmi: Remotion, HyperFrames,
OpenMontage, ffmpeg, Whisper, yt-dlp, headroom.

## 1. Brief e regia (OpenMontage)
- Pipeline `tools/OpenMontage/pipeline_defs/animated-explainer.yaml`: research → proposal → script → scene → assets → compose → review.
- Se l'utente manda video/foto di riferimento: estrarre fotogrammi (`ffmpeg ... tile`), trascrivere (Whisper), comprimere
  (`scripts/compress.py`), poi riscrivere meglio. Video dai suoi artifact: `Artifact read` + `paths` per scaricare i file.
- Ricerca con WebSearch `extended` per dati di settore; dichiarare i dati indicativi.

## 2. Copione (`projects/<slug>/script.json`)
- `scenes[]` con `id` e `text` = lista di beat (una frase ciascuno); `pauses`, `rates` per beat; `pron` per la sola voce.
- Ordine tipico video catena: hook → intro (HyperFrames) → rotta comune con loghi → chi siamo → ufficio → piattaforma →
  esempio concreto → contatto unico → mercato di Roma → foto CAR → Tirreno (marinerie) → specie → Adriatico → rotazione →
  allevato → frutti di mare → come compriamo → logistica → consegna diretta → freschezza → etichetta → FAO → garanzie →
  broker vs diretto → importazioni (plus finale) → perché noi → chiusura HyperFrames.
- Le scene `Pro.tsx` hanno beat fissi: usare i testi standard (vedi `git log` "v3: copioni" o copiare da un video esistente)
  e lo stesso numero di beat. Le parole chiamate dalle animazioni (`Wd`) devono comparire nel testo (es. "pietro", "rosa", "rossi").
- Regole di scrittura per la voce: niente liste di nomi isolati; sigle via `pron`; evitare "hub" a inizio frase.

## 3. Voce
`python3 scripts/voice.py <slug>` (edge-tts 96 kbps, retry automatici, cache in `.cache/tts`). Provare le frasi delicate
con Whisper prima del render (script di test con faster-whisper).

## 4. Scene (Remotion, `studio/`)
- `src/videos/<slug>/{Scenes,Video}.tsx`; registrare in `src/Root.tsx`; in `Video.tsx` unire `proScenes(client, logo)` e
  `PRO_CHAPTERS`; `partnerImg` per mettere il logo cliente nell'intestazione.
- Grafica: palette abyss/deep/sea/aqua/gold/coral, Montserrat 800/900; tutto vettoriale + foto reali dell'utente.
- Controllo: `npx remotion still` su 6–14 frame chiave → mosaico → guardarlo e correggere sovrapposizioni (titolo
  in alto fino a y≈250, sottotitoli in basso da y≈930).

## 5. Aperture/chiusure (HyperFrames)
`python3 scripts/hf_brand.py studio/public/<slug>/hf_intro.mp4 <dur> "<riga1>" "<riga2>" ["<partner>"] [--partner-img=…] [--layout=end]`
(durata = durata scena + 1 s; GSAP locale; niente clipPath animati).

## 6. Render e master
Render in background in coda (lento): `npx remotion render ... --muted --crf=19`, poi `python3 scripts/master.py`
(musica originale + ducking + −15 LUFS, TP ≤ −1.5). Controllare `ebur128`.

## 7. Verifica e consegna
- Whisper sul file finale + `scripts/checkwords.py` (ignorare numeri in cifre e parole unite).
- Mandare i video in chat con `SendUserFile`; copiarli in `renders/` (comprimere con crf 24–25 se >100 MB); commit e push
  (le `voice.wav` restano fuori da git).
- Riassunto all'utente in italiano semplice: cosa contiene ogni video, cosa è stato verificato, eventuali limiti.
