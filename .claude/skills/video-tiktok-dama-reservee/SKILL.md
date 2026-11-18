---
name: "video-tiktok-dama-reservee"
description: "Montare video TikTok verticali per il canale Dama Reservèe (ittico/prodotti di nicchia) partendo da un audio vocale: verifica dei fatti, voce pulita e fluida (DeepFilterNet3, pause accorciate, misura DNSMOS), foto CC0 verificate per specie, scene animate Remotion, illustrazioni, logo ufficiale, copertina e didascalia. Usare SEMPRE quando l'utente scrive \"crea video\" o \"genera video\" e manda un vocale."
---

# Video TikTok — stile Dama Reservèe (versione aggiornata nov. 2026)

Obiettivo: video 9:16 (1080×1920, 30 fps), di nicchia, moderni, iper professionali, spiegati bene, per far crescere il canale. Riferimenti: "Gambero rosso di Mazara" e "Rosso o viola?" (v6 finale). Lavorare in autonomia, senza domande; prima di inviare ricontrollare SEMPRE fotogrammi, sincronia, audio, pause e fatti, e correggere da soli. Risposte all'utente brevi, in italiano.

Avvio: l'utente scrive "crea video" (o "genera video") + manda il vocale. Vale in ogni chat e per ogni progetto futuro.
Progetto pronto nel repo **realdama/dama-up** (`remotion/`, `pipeline/`, `CLAUDE.md` con tutte le note tecniche): riusarlo, non ripartire da zero.

## 0. Strumenti (ognuno nel suo ruolo)
- **Whisper** (faster-whisper `small` bozza, `large-v3` per parole dubbie e tempi finali): passare un array numpy da WAV 16 kHz (`pipeline/transcribe.py`).
- **DeepFilterNet3**: pulizia voce (unica elaborazione che migliora davvero la qualità).
- **DNSMOS** (pacchetto `speechmos`, `pipeline/mos.py`): voto oggettivo della voce, perché l'audio non si ascolta.
- **ffmpeg**: tagli, mix, encode. **Remotion**: tutte le grafiche. **HyperFrames** (`npx hyperframes audio`): controllo di dove cadono whoosh/boom e loudness.
- **OpenMontage**: revisione "slideshow risk" (niente durate tutte uguali, ogni scena con uno scopo).
- **yt-dlp** solo per clip libere o dell'utente; **headroom** solo per risparmiare contesto.
- Ricerca web per la verifica dei fatti (WebSearch; Firecrawl/Tavily/Perplexity se hanno le chiavi).

## 1. Verifica dei fatti (OBBLIGATORIA, prima del montaggio)
- Verificare con fonti ogni dato del vocale (numeri, leggi, percentuali, luoghi, specie, biologia).
- Falso o non verificabile → tagliare la frase dall'audio e dirlo all'utente con le fonti. Dubbio ma plausibile → tenerlo e segnalarlo.
- Fatti già verificati: -6% limite gambero rosso 2025 acque IT/FR (Reg. UE 2025/219); limiti di cattura UE per rosso e viola nel Mediterraneo occidentale dal 2022 + limite giorni di pesca (Reg. UE 2022/110); gambero viola famoso a Gallipoli, Liguria, Sardegna. Tolta: "questi gamberi crescono lentamente".

## 2. Audio — regola attuale (l'utente ha bocciato le catene pesanti)
1. Trascrivere; tagliare ripetizioni, esitazioni, frasi confuse o parole equivoche (es. "flotte" che suona "fotte", "terreno" per "Tirreno"); verificare i punti di ripresa con large-v3 su clip montati.
2. Solo tagli + pause ≥0,30 s → 0,22 s (`pipeline/cut_only.py`), niente filtri.
3. **DeepFilterNet3** (`pipeline/dfn_run.py`, venv con torch + deepfilternet, modello `DeepFilterNet3.zip` da raw.githubusercontent.com/Rikorose/DeepFilterNet, `atten_lim_db=12`) → highpass 70 → **atempo 1,04** (mai più veloce, mai rubberband).
4. Volume pareggiato **per frase** (`pipeline/phrase_level.py`, ±6 dB, rampe 80 ms) → gain lineare a -18 LUFS in float → alimiter 0,89.
5. **Pause dentro le frasi** (`pipeline/tighten.py`): tra parole 0,07 s, dopo virgola 0,14 s, fine frase 0,22 s. Deve suonare come un discorso unico e fluido.
6. VIETATO: livellatore parola per parola, compressori, RNNoise/afftdn forti, saturazione (lavorare in float, controllare i picchi).
7. Misure obbligatorie: DNSMOS OVRL della voce finale ≥ originale (a pari RMS); probabilità parole Whisper non peggiore; nessun clipping.
8. Musica originale sintetizzata (90 BPM, pad + arpeggio morbido, niente hi-hat) a volume 0,30 con ducking sotto la voce; whoosh morbidi sulle scene; boom + shimmer sul logo. Mix finale con gain lineare: circa -15,5 LUFS, true peak -1,2.

## 3. Foto e illustrazioni
- Solo CC0 / pubblico dominio (Openverse cc0,pdm; Wikimedia Commons con licenza CC0/PD; NOAA = pubblico dominio). Niente crediti nella descrizione.
- **Verificare la specie di ogni foto** (descrizione/categoria Commons o fonte) prima di usarla; mai foto generiche o piatti misti spacciati per la specie. Gambero rosso: NOAA "Fish4525" (*Aristaeomorpha foliacea*). Gambero viola: Commons "Gamba de Palamós" (*Aristeus antennatus*). Da NON usare: rawpixel "prawns" e il piatto flickr "GAMBERI ROSSI".
- Illustrazioni: tavole scientifiche in pubblico dominio trasformate in linee luminose (`ill_viola.png`), o illustrazione ricavata dalla foto scientifica (`ill_rosso.png`); usarle su mappe e schede.
- Se l'utente manda foto/clip sue, usarle per prime.

## 4. Stile visivo (Remotion)
- Marchio fisso "DAMA RESERVÈE" (Cinzel) + "— EXCLUSIVE SEAFOOD —"; barra di avanzamento argento 8 px.
- Etichette con barra sfumata rosso→arancio→viola, testo blu notte, entrano da sinistra a y≈318.
- Sottotitoli Inter Black ≤112 px, 1–2 parole, parola attiva arancione #FFB447 al 115 % (non deve sovrapporsi alla vicina), y≈1400; correggere a mano gli errori di trascrizione; nasconderli durante checklist, timbri, sondaggio e logo. Area sicura: niente testi sotto y 1550.
- Scene blu con raggi di luce e bolle; transizioni a "scia" colorata ai cambi scena; foto con punch-in e push/pull lento.
- Libreria pronta: mappa viaggio (aereo), mappa distanze (≈ KM + barche), mappa zone con segnaposto, contatore profondità, checklist ✓/✗, carta identikit (foto, nome, nome latino, righe ✓ sulle parole + illustrazione), calibro (vassoio 1 KG), Unione Europea (stelle, barra limite con STOP, calendario giorni di pesca), anno + percentuale, catena causa→effetto, timbri, sondaggio a schermo diviso ("TEAM X o TEAM Y").
- Hook nei primi 2 s: schermo diviso o titolo forte + domanda ("QUALE SCEGLI?"). CTA "SCRIVILO NEI COMMENTI".
- Se si tagliano pause/frasi a video già fatto: riallineare con lo shift (`rvSh`) o con `Warp.tsx` (Sequence annidate), senza riscrivere le scene.

## 5. Chiusura
- Logo UFFICIALE sempre: `assets/DAMA_Reservee_BRUT_logo_1080.png` (DR con chela e conchiglia, "DAMA Reservèe BRUT"), ritagliato a cerchio, sfondo radiale blu notte, scale-in, riflesso argento, alone, "SEGUI PER ALTRE ECCELLENZE". Entra quando si sente "Dama Reservèe", resta ~3–4 s.
- Mai firma "Manuel Desio" né "Mare Italia".

## 6. Consegna
- Encode libx264 crf ~20, maxrate 14M, AAC 256k, faststart.
- Controllare la griglia di fotogrammi di tutto il video (1 ogni 2 s) e i punti di giunzione.
- Inviare **MP4 + copertina TikTok (Still con titolo grande + logo) + didascalia con hashtag**.
- Nella risposta: cosa è cambiato, frasi tagliate, fatti verificati con fonti, misure audio (dire che è verificato con misure, non ascoltato).
- Salvare tutto nel repo (`videos/`, `CLAUDE.md` storico) e fare push.
