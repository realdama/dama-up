# Dama Reservèe — memoria video TikTok

Canale TikTok **Dama Reservèe** (exclusive seafood, prodotti ittici di nicchia). L'utente manda un vocale
(.m4a) e scrive **"crea video"** (o "genera video"): si fa tutto in autonomia, senza domande,
seguendo la skill `video-tiktok-dama-reservee` (versione aggiornata in `.claude/skills/` e zip per
claude.ai in `skills-upload/video-tiktok-dama-reservee.zip`: la skill è il riassunto operativo, questo file i dettagli).
Strumenti da usare SEMPRE: Remotion, HyperFrames, OpenMontage, ffmpeg, Whisper, yt-dlp, headroom
(ruoli nella sezione 0 della skill). Risposte all'utente: brevi, in italiano.

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

## Audio — REGOLA ATTUALE (sostituisce le catene sotto; l'utente ha giudicato "pessima" la v3)
- Misurare SEMPRE con DNSMOS (`pipeline/mos.py`, pacchetto speechmos, confronto a pari RMS):
  la voce finale non deve avere OVRL più basso dell'originale. Originale 2,97; catena RNNoise+rider 2,73 (peggio!).
- Catena buona (OVRL 2,99, BAK 4,03): `pipeline/cut_only.py` (solo tagli) → DeepFilterNet3
  (`pipeline/dfn_run.py`, venv con torch/deepfilternet, modello da raw.githubusercontent.com
  Rikorose/DeepFilterNet models/DeepFilterNet3.zip, atten_lim_db=12) → highpass 70 → atempo 1,04
  (NON rubberband: peggiora) → `pipeline/phrase_level.py` (guadagno per FRASE ±6 dB, rampe 80 ms)
  → gain lineare a -18 LUFS in float → alimiter 0,89 → mix con musica 0,30 e sfx 0,6, gain
  lineare finale (≈ -15,6 LUFS, TP -1,2).
- PAUSE DENTRO LE FRASI (l'utente: "troppe pause, deve sembrare un'unica frase"): `pipeline/tighten.py`
  → tra parole 0,07 s, dopo virgola 0,14 s, fine frase 0,22 s. Il video si riallinea senza
  rifare le scene con `src/rv/Warp.tsx` (Sequence annidate: salta gli stessi istanti). VIETATI: vocal rider per parola, compressori, afftdn/arnndn forti.

## Audio (storico, verificato con misure, non ascoltato)
- Whisper: faster-whisper `small` per bozza, `large-v3` per verificare parole dubbie e per i
  tempi parola finali (ritrascrivere la voce GIÀ montata: tempi più precisi).
- Il rumore di fondo dei vocali è alto: silencedetect a -38 dB non trova nulla sull'originale.
  Usare -34 dB su una copia denoised (highpass 85 + afftdn) per trovare le pause.
- Pause ≥0,30 s → 0,22 s (≥0,55 s → 0,27 s). atempo 1,04 (mai di più). Mix -14 LUFS, TP -1,2.
- Catena voce ANTI-INTERFERENZE (l'utente ha segnalato audio poco chiaro): highpass 90 →
  arnndn (RNNoise, modello `pipeline/sh.rnnn`, mix 0,85) → afftdn leggero (nr 10) → adeclick →
  EQ (-2,5 dB 250 Hz, +2 dB 3 kHz, +1 dB shelf 9 kHz) → deesser → compressore 3:1 → atempo 1,04
  → limiter; normalizzazione lineare (non loudnorm dinamico). Misurare SNR e click prima/dopo.
- LIVELLO COSTANTE (l'utente ha segnalato audio che "fa su e giù"): dopo la catena (senza
  compressore) passare `pipeline/vocal_rider.py` (livella frasi/parole al target, pause -5 dB,
  gain -8/+9 dB smussato 60 ms) → volume a -17 → compressore 2,5:1 → limiter → EQ -2,5 dB 130 Hz
  (scoppi delle P) → trim a -16,3 LUFS. De-plosive: adynamicequalizer sotto 150 Hz all'inizio.
  arnndn mix 0,7 (0,85 rendeva le consonanti meno nitide). Verifica: deviazione loudness
  short-term < 0,8 dB, probabilità parole Whisper (clar.py) non peggiore della versione prima.
- Musica senza hi-hat (rumore percepito come interferenza), whoosh morbidi (gain 0,10),
  ducking più profondo (sidechain ratio 8, musica 0,45).
- "flotte" viene pronunciato/letto come "fotte": tagliare la frase ("ha una delle flotte più
  importanti d'Italia") e segnalarlo. Whisper scrive "cambero/Mazzara": correggere in GAMBERO/MAZARA.
- Musica originale sintetizzata in numpy (90 BPM, Am–F–C–G, pad + arpeggio + kick morbido),
  ducking con sidechaincompress; whoosh sulle etichette/scene, boom + shimmer sul logo.

## Verifica dei fatti (OBBLIGATORIA prima del montaggio)
- Controllare con ricerca web ogni dato/affermazione del vocale (numeri, leggi, percentuali,
  luoghi, biologia). Se è falso o non verificabile → tagliare la frase dall'audio e dirlo
  all'utente con le fonti. Es.: "-6% gambero rosso 2025 acque IT/FR" = VERO (Reg. UE 2025/219,
  GSA 8-11); "questi gamberi crescono lentamente" = tolta (i limiti UE sono per sovrasfruttamento).
- Dopo un taglio a metà video: spostare scene/foto con uno shift (vedi `rvSh` in
  `src/rv/timeline.ts`) invece di riscrivere tutti i tempi.

## Strumenti e ambiente (cloud)
- Foto: Wikimedia e live.staticflickr.com possono andare in 429 per ore (IP bloccato). Alternativa che funziona:
  iNaturalist CC0 (inaturalist-open-data.s3.amazonaws.com, trovate via Openverse source=inaturalist; i tag nel nome
  comune coreano/hawaiano confermano la specie) e images.rawpixel.com. Se manca la foto di una specie: illustrazione SVG
  (Still Remotion) invece di foto dubbie. URL di extmetadata hanno `?utm_...`: toglierli.
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
- LOGO UFFICIALE (sempre, in ogni video): `assets/DAMA_Reservee_BRUT_logo_1080.png`
  (DR con chela e conchiglia, "DAMA Reservèe BRUT", argento su blu notte). Copia ritagliata a
  cerchio in `remotion/public/logo.png`, usata in `Outro` (Scenes.tsx): scale-in, riflesso argento,
  alone, sfondo radiale blu notte, "SEGUI PER ALTRE ECCELLENZE" sotto. Mai rifarlo tipografico.
- Per cambiare solo la chiusura: `remotion render ... --frames=1660-1787` e unire con ffmpeg
  (trim end_frame + concat) invece di rifare tutto il render.

## Libreria scene Remotion (riusabili)
- `src/Maps.tsx`: Base/Pin/Tag/Boat, TravelMap, DistanceMap. `src/Scenes.tsx`: Depth, Checklist, Poll, Outro.
- `src/rv/Scenes.tsx` (video "Rosso o viola"): Hook VS a schermo diviso, MedMap, IdCard
  (carta identikit con foto, nome, latino, righe ✓ sulle parole), ZoneMap (mappa generica con
  segnaposto/etichette/barche), Calibro (vassoio 1 KG con gamberi SVG), UE (stelle, barra limite
  con STOP, calendario giorni di pesca), Meno6 (anno + barra + percentuale), Chain (catena causa→effetto),
  Stamps (timbri), TeamPoll. Ogni video nuovo: cartella `src/<nome>/` + Composition in Root.tsx.
- Tagli di frase in `pipeline/audio_cut_clean.py`: CUTS = (tieni fino a, riprendi da) dentro i
  silenzi, pausa generata 0,08 s; verificare il punto di ripresa con large-v3 su clip montati.

## Server MCP del progetto (`.mcp.json`)
- firecrawl, tavily, perplexity (npx) e posthog (remoto). Nessuna chiave nel file: le chiavi
  vere vanno salvate come segreti di rete dell'ambiente dama-up (host api.firecrawl.dev,
  api.tavily.com, api.perplexity.ai, mcp.posthog.com, header Authorization: Bearer), il proxy
  le inserisce. Finché non ci sono le chiavi questi server non funzionano.

## Struttura repo
- `remotion/src/timeline.ts`: tempi foto, etichette, scene (secondi sulla voce montata).
- `remotion/src/words.json`: sottotitoli (gruppi di parole con tempi).
- `pipeline/`: trascrizione, taglio/pulizia audio, musica+SFX.
- `videos/`: MP4 finali consegnati.

## Storico video
- 2026-11-20 — "Il tonno è tutto uguale?" (vocale "Via Paolo Buzzi 180 45"): 95,6 s, nessuna frase tagliata (tutto verificato:
  quota IT 2026-28 6.182,61 t/anno +17% sul 2025 = decreto Masaf 1/4/2026, 50% alla Sicilia; ICCAT piano 2006; asta Toyosu
  gen. 2026 510 mln yen ≈ 3,2 mln $). Voce DNSMOS 3,18 = originale, Whisper prob 0,942→0,960. Codice `remotion/src/tonno/`
  (Tuna.tsx = tonno SVG per specie, mappa larga `wide.json` da `scripts/prep-wide.mjs`, scene esempi: uomo vs 3 m,
  8 persone = 600 kg, tachimetro, grafico stock, carne, profondità, asta $).
- 2026-11-18 — "Rosso o viola?" v6 FINALE: 76,2 s, pause dentro le frasi accorciate (tighten + Warp), voce DNSMOS 3,02.
- 2026-11-18 — "Rosso o viola?" v5: audio DeepFilterNet3 (OVRL 2,99), foto dubbie sostituite: Team rosso = foto NOAA A. foliacea, crudo = viola crudo (Palamós). Foto rawpixel 'hook' e piatto flickr 'crudo2' NON usare (specie incerta).
- 2026-11-18 — "Rosso o viola?" v4: illustrazioni incise (ill_rosso/ill_viola), raggi+bolle, transizioni a scia, copertina (Still RvCover) e didascalia in videos/.
- 2026-11-17 — "Rosso o viola?" v2 (vocale "Via Paolo Buzzi 180 37"): 80,25 s, audio RNNoise; tagliate anche "questi gamberi crescono lentamente, così" (non verificabile); logo a 76,37 s. v1: tagliate "Oltre al
  Tirreno" (si sente "terreno") ed "E poi le quote UE" (incomprensibile); logo a 78,84 s.
  Foto viola: Commons "Gamba de Palamós" (CC0) = Aristeus antennatus.
- 2026-11-17 — Gambero rosso di Mazara del Vallo (v2, vocale "Via Paolo Buzzi 180 35"):
  59,6 s; tagliata la frase sulle "flotte"; logo su "Dama Reservèe" a 55,7 s.
