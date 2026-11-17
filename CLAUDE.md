# Dama Reservèe — memoria video TikTok

Canale TikTok **Dama Reservèe** (exclusive seafood, prodotti ittici di nicchia). L'utente manda un vocale
(.m4a) e chiede "genera video": si fa tutto in autonomia, senza domande, seguendo la skill
`video-tiktok-dama-reservee`. Risposte all'utente: brevi, in italiano.

## Stile definitivo (riferimento: "Gambero rosso di Mazara", nov. 2026)
- 9:16, 1080×1920, 30 fps, ~60 s. Foto CC0/pubblico dominio + molte scene animate Remotion.
- Marchio fisso in alto "DAMA RESERVÈE" (Cinzel) + "— EXCLUSIVE SEAFOOD —"; barra argento 8 px.
- Titoli a etichetta (crema, testo blu notte, bordo arancione) a y≈318, entrano da sinistra.
- Sottotitoli Inter Black ≤112 px, 1–2 parole, parola attiva arancione #FFB447 al 115 %, y≈1400.
  Nascosti durante checklist, sondaggio e logo. Nessun testo sotto y 1550, lato destro libero.
- Scene: mappa viaggio (aereo Roma → luogo), mappa distanze (≈ KM + barche), contatore
  profondità, checklist ✓/✗, sondaggio finale a schermo diviso, logo con riflesso argento.
- Hook nei primi 2 s (titolo grande + foto più spettacolare). CTA "scrivilo nei commenti" + logo.
- Mai firma "Manuel Desio" né "Mare Italia". Mai crediti nelle descrizioni.

## Audio (verificato con misure, non ascoltato)
- Whisper: faster-whisper `small` per bozza, `large-v3` per verificare parole dubbie e per i
  tempi parola finali (ritrascrivere la voce GIÀ montata: tempi più precisi).
- Il rumore di fondo dei vocali è alto: silencedetect a -38 dB non trova nulla sull'originale.
  Usare -34 dB su una copia denoised (highpass 85 + afftdn) per trovare le pause.
- Pause ≥0,30 s → 0,22 s (≥0,55 s → 0,27 s). atempo 1,04 (mai di più). Mix -14 LUFS, TP -1,2.
- "flotte" viene pronunciato/letto come "fotte": tagliare la frase ("ha una delle flotte più
  importanti d'Italia") e segnalarlo. Whisper scrive "cambero/Mazzara": correggere in GAMBERO/MAZARA.
- Musica originale sintetizzata in numpy (90 BPM, Am–F–C–G, pad + arpeggio + kick morbido),
  ducking con sidechaincompress; whoosh sulle etichette/scene, boom + shimmer sul logo.

## Strumenti e ambiente (cloud)
- Ambiente cloud personale **dama-up**: host aperti per Hugging Face (huggingface.co,
  cas-server.xethub.hf.co, us.aws.cdn.hf.co…), Openverse, Wikimedia (commons + upload),
  live.staticflickr.com, pd.w.org, images.rawpixel.com.
- Hugging Face: usare `HF_HUB_DISABLE_XET=1` se il download xet fallisce.
- faster-whisper + PyAV recente: `transcribe(path)` fallisce (`metadata_errors`) → passare un
  array numpy letto dal WAV 16 kHz (vedi `pipeline/transcribe.py`).
- Wikimedia: `Special:FilePath` reindirizza a thumb.wikimedia.org (bloccato) → scaricare da
  `upload.wikimedia.org/wikipedia/commons/thumb/<h0>/<h0h1>/<File>/1920px-<File>` (h = md5 nome).
  Openverse e Commons API vanno in 429 facilmente: poche query, pause di qualche secondo.
- Remotion 4 (in `remotion/`), browser: chrome-headless-shell di /opt/pw-browsers.
  Prova fotogrammi con `npx remotion still src/index.ts Main out.png --frame=N --scale=0.5`.
  Render completo ~50 min su 4 core (blur CSS costosi).
- Mappe: Natural Earth (ne_10m_land, ne_50m_admin_0_countries) da raw.githubusercontent.com,
  pre-proiettate in km con `remotion/scripts/prep-map.mjs` → `src/mapdata.json`.
- HyperFrames (npm `hyperframes`) esiste; OpenMontage non è su npm; `headroom-ai` è un
  compressore di contesto per LLM (non serve al montaggio). yt-dlp installato ma non usato:
  i video YouTube non sono CC0.
- Logo: l'utente non l'ha ancora allegato in questa sessione → logo tipografico Remotion
  (cerchio blu notte, DAMA / RESERVÈE in Cinzel). Se arriva il file, sostituirlo in `Outro`.

## Struttura repo
- `remotion/src/timeline.ts`: tempi foto, etichette, scene (secondi sulla voce montata).
- `remotion/src/words.json`: sottotitoli (gruppi di parole con tempi).
- `pipeline/`: trascrizione, taglio/pulizia audio, musica+SFX.
- `videos/`: MP4 finali consegnati.

## Storico video
- 2026-11-17 — Gambero rosso di Mazara del Vallo (v2, vocale "Via Paolo Buzzi 180 35"):
  59,6 s; tagliata la frase sulle "flotte"; logo su "Dama Reservèe" a 55,7 s.
