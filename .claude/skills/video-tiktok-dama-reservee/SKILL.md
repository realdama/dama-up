---
name: "video-tiktok-dama-reservee"
description: "Montare video TikTok verticali per il canale Dama Reservèe (ittico/prodotti di nicchia) partendo da un audio vocale: pulizia audio, tagli, footage CC0, sottotitoli moderni, scene animate, logo finale. Usare SEMPRE quando l'utente scrive \"crea video\" o \"genera video\" e manda un vocale."
---

# Video TikTok — stile Dama Reservèe

Obiettivo: video 9:16 (1080×1920, 30 fps), di nicchia, moderni, semplici ma iper professionali, spiegati bene, costruiti per far crescere il canale con video che nessun altro sa fare. STILE DEFINITIVO di riferimento: video "Gambero rosso di Mazara" (nov. 2026) — foto + molte grafiche animate (mappe con effetto viaggio, contatori, checklist, sondaggio finale). Prima di inviare ricontrollare SEMPRE fotogrammi, sincronia, audio e pause e correggere da soli, senza che l'utente debba chiedere.

Avvio: l'utente scrive "crea video" (o "genera video") + manda l'audio. Vale in ogni chat: si parte sempre da queste indicazioni.

## 0. Strumenti (usarli sempre tutti, ognuno nel suo ruolo)
- **Whisper** (faster-whisper small + large-v3): trascrizione, parole dubbie, tempi parola dei sottotitoli.
- **ffmpeg**: pulizia/tagli audio, mix, loudnorm, grana, encode finale.
- **Remotion**: tutte le animazioni (foto con movimento e transizioni, etichette, sottotitoli, mappe, contatori, checklist, sondaggio, logo).
- **HyperFrames** (npm `hyperframes`): controllo audio del mix (`npx hyperframes audio mix.wav`: dove cadono whoosh/boom, loudness, silenzi) e, se utile, composizioni HTML extra.
- **OpenMontage** (github OpenMontageInc/OpenMontage): linee guida da regista/montatore; usare il suo controllo "slideshow risk" (niente durate tutte uguali, ogni scena con uno scopo, sound design) come revisione prima della consegna.
- **yt-dlp**: solo per clip con licenza libera (CC0/pubblico dominio) o fornite dall'utente; mai video protetti.
- **headroom** (`headroom-ai`): compressore di log/output per risparmiare contesto nelle sessioni lunghe; non tocca il video.
- Progetto pronto nel repo realdama/dama-up (`remotion/`, `pipeline/`, CLAUDE.md con note sull'ambiente cloud): riusarlo invece di ripartire da zero.
 Fare tutto in autonomia, senza domande (autorizzato a tagliare e rifinire l'audio come serve). Strumenti: Whisper (trascrizione/sottotitoli), ffmpeg (audio, montaggio, transizioni, export), Remotion (animazione titoli, grafiche e logo). Se il logo non è nella sessione, chiederlo o usare quello allegato.

## 1. Audio (sempre)
- Trascrivere con faster-whisper (modello `small`, lingua it, word_timestamps) da un WAV 16 kHz mono (convertire prima con ffmpeg; non passare il .m4a diretto).
- Tagliare: frasi che l'utente chiede di togliere, ripetizioni, esitazioni, parole poco chiare o sbagliate, domande riempitive tipo "e voi lo sapevate?". Se una frase è confusa, tagliarla piuttosto che lasciarla.
- Pause: rilevarle con silencedetect (-38 dB, d 0,12) sull'audio originale, non con i tempi di Whisper (che allungano le parole). Ogni silenzio ≥ 0,30 s va ridotto a 0,22 s (0,27 s se era ≥ 0,55 s); i silenzi più corti restano; micro-fade 12–25 ms. Dopo il mix verificare che non restino silenzi > 0,3 s a -24 dB.
- Parole dubbie: ricontrollarle con faster-whisper large-v3 su clip brevi. Se una parola suona male o in modo equivoco (es. "flotte" pronunciato "fotte"), tagliare la frase e segnalarlo all'utente.
- Catena: highpass 85 Hz → afftdn → EQ (-2,5 dB a 250 Hz, +3 dB a 3,2 kHz, +2 dB shelf 9 kHz) → compressore 3,5:1 → atempo 1,04 (mai più veloce: l'utente non vuole il parlato accelerato) → limiter → loudnorm.
- Musica: base originale sintetizzata (niente brani protetti), tranquilla ed elegante (~85–95 BPM, pad morbidi), ducking con sidechaincompress sotto la voce, sale sul logo finale.
- SFX: whoosh leggero all'entrata dei titoli, boom + shimmer all'entrata del logo.
- Mix finale a -14 LUFS, true peak -1,2.

## 2. Immagini e video
- SOLO immagini senza obbligo di attribuzione: Openverse con license=cc0,pdm (interrogato via curl). Per Wikimedia scaricare con Special:FilePath/<nome>?width=1920 e uno user-agent dedicato (l'originale dà 429). Niente crediti nella descrizione: l'utente non li vuole.
- Le foto CC0 sono poche: compensare con le scene animate (sezione 3b).
- Ogni cambio ogni 2–3 s, scelto per ciò che si dice in quel momento. Tagli nei punti in cui inizia la frase.
- Se l'utente manda le sue clip/foto, usarle per prime.

## 3. Stile visivo (moderno)
- Tutto schermo 9:16: immagini scalate a 1620×2880 + zoompan (punch-in sui primi 6 frame + push/pull lento alternato). I video vanno ritagliati a 9:16 (hqdn3d + unsharp).
- Sfumatura blu notte in alto e in basso per la leggibilità.
- Transizioni xfade da 0,3 s, a rotazione (smoothleft, zoomin, hblur, smoothup, slideleft, wipeup, circleopen); fadeblack verso il logo.
- Grading: colorbalance caldo/teal, contrasto +5 %, vignetta, grana leggera; barra di avanzamento argento (8 px) in cima.
- Testi ASS (libass):
  - Marchio fisso in alto: "DAMA RESERVÈE" in Cinzel + "— EXCLUSIVE SEAFOOD —".
  - Titoli a etichetta: Inter ExtraBold, riquadro chiaro e testo blu notte, entrata scorrendo da sinistra, y≈340.
  - Sottotitoli: Inter Black fino a 112 px, maiuscolo, 1–2 parole alla volta, pop d'entrata; la parola attiva è arancione (&H0047B4FF&) e scalata al 115 %; y≈1400; dimensione adattata automaticamente per stare entro ~860 px.
  - Correggere sempre a mano gli errori di trascrizione nei sottotitoli.
  - Area sicura TikTok: niente testi oltre y 1550, lato destro libero.
- Momenti chiave (date, numeri, certificazioni) in grande al centro-alto con zoom pop.

## 3b. Scene animate Remotion (stile definitivo)
Testi, sottotitoli e scene sono fatti in Remotion come overlay ProRes 4444 con alpha, sovrapposto al montaggio ffmpeg. Le scene a schermo intero entrano con dissolvenza + sfocatura e sono sincronizzate alle parole:
- Mappa viaggio: Natural Earth (ne_10m_land + ne_50m_admin_0_countries da GitHub raw), proiezione in km, telecamera SVG viewBox animata, aereo su arco tratteggiato arancione (es. Roma → luogo), segnaposto con anelli pulsanti, cartellino Cinzel. Terra #2b3a5e, Italia #3a5799 con bordo chiaro, mare blu notte scuro.
- Mappa distanze: linea tratteggiata con "≈ X KM", barche animate, nomi dei luoghi (le etichette non devono uscire dallo schermo né coprire i sottotitoli).
- Contatori: es. profondità 0 → 500+ M con righello, particelle e sfondo che si scurisce.
- Checklist ("COME RICONOSCERLO"): card chiare con spunta verde / X rossa che entrano sulla parola detta; sfondo con la foto sfocata.
- Sondaggio finale ("CRUDO o COTTO"): schermo diviso con due foto, cerchio centrale, fumetto "SCRIVILO NEI COMMENTI".
- Durante checklist e sondaggio nascondere i sottotitoli.
- Prima del render completo provare i fotogrammi con `remotion still` composti sul montaggio.

## 4. Chiusura
- Logo Dama Reservèe ritagliato a cerchio su sfondo radiale blu notte; scale-in 0,7 s, riflesso argento, alone, scritta "SEGUI PER ALTRE ECCELLENZE".
- Il logo entra quando nell'audio si sente "Dama Reservèe"; poi resta ~3–4 s.
- Nei testi non mettere la firma "Manuel Desio" né "Mare Italia".

## 5. Attirare il pubblico
- Hook nei primi 1–2 s: titolo forte + immagine più spettacolare per prima.
- Ritmo serrato, nessun tempo morto; una curiosità o un dato ogni ~10 s.
- CTA finale chiara (commenta / segui), poi il logo.
- Quando serve, suggerire all'utente un hook o una frase migliore da registrare.

## 6. Consegna
- Encode finale: libx264 crf ~20, maxrate 14M, AAC 256k, faststart (~80 MB per 70 s).
- Controllare i fotogrammi chiave (testi dentro lo schermo, immagini giuste) prima di inviare.
- Controllare anche la griglia di fotogrammi di tutto il video (scene a tempo con le parole) e i silenzi residui; correggere senza chiedere.
- Inviare solo l'MP4; risposta breve in italiano. Dire che l'audio è verificato con misure (non ascoltato) e segnalare le frasi tagliate.