# Argo Maris — Studio Video (memoria di progetto)

Qui si producono i **video per i progetti Argo Maris** (buyer/broker del pesce per la GDO, Roma) e i video
personali/social dell'utente. Obiettivo fisso: **video iper professionali che lasciano a bocca aperta**.
Prima di ogni nuovo video leggere anche la skill `.claude/skills/argo-maris-video/SKILL.md` (procedura completa).

## Chi è Argo Maris (contenuti da rispettare)
- **Buyer / broker senza deposito**: riceve un solo ordine dalla catena, compra al **Mercato di Roma (CAR, oltre 400
  aziende — dire "uno dei più grandi", non "il più grande")**, alle **aste** e dalle **barche**, rivende con il suo margine.
  Niente magazzino, niente banco.
  Al CAR ci sono **circa 50 fornitori di pesce, confrontati a rotazione** (dato dell'utente: citarlo sempre). Un solo fornitore, un solo referente, una sola fattura.
- **NIENTE "ufficio commerciale"/squadra**: l'utente è il **buyer di fiducia** — ascolta richieste, riceve ordini e trova tutto
  (mercato di Roma, aste, barche) → "Voi chiedete, io trovo". Ordine REALE: il cliente manda l'ordine (e-mail, messaggio,
  telefono) e **poi parte la ricerca**, poi conferma e consegna (NON un portale con listino da tablet).
- **Focus sul locale**: prima il **Tirreno** (11 marinerie: Viareggio, Livorno, Piombino, Castiglione della Pescaia,
  Porto Santo Stefano, Porto Ercole, Civitavecchia, Fiumicino, Anzio, Terracina, Gaeta), poi l'**Adriatico** (13: Chioggia,
  Rimini, Cesenatico, Fano, Ancona, Civitanova Marche, San Benedetto del Tronto, Giulianova, Pescara, Ortona, Vasto, Termoli,
  Manfredonia) → "due mari, una sola regia". Poi il **Sud**: **Sicilia per le alici** (Sciacca, Porticello) e
  **mercati ittici della Puglia** (Bari, Molfetta, Manfredonia). L'**estero** è un **plus, quasi alla fine**.
- **Specie da citare sempre (tante!)**: locale (triglie, scorfani, gallinelle, San Pietro, pagelli, dentici, saraghi, ricciole,
  lecce, spigole, orate, cefali, sogliole, rombi), azzurro (alici, sardine, sgombri, palamite, tonno, pesce spada), molluschi
  (seppie, calamari, polpi, moscardini), crostacei (gamberi rosa e rossi, mazzancolle, scampi, aragoste), **frutti di mare**
  (cozze, vongole veraci, telline, fasolari, cannolicchi, ostriche: zone classificate A/B, centri di depurazione/spedizione,
  venduti vivi, etichetta con specie, zona, n° centro, data), **allevato** (orate, spigole, ombrine: Italia, Grecia, Turchia, Croazia).
- **Zone FAO**: 37 Mediterraneo; 37.1.3 Tirreno; 37.2.1 Adriatico; 37.2.2 Ionio; 27 Atlantico NE; 34 Atlantico centro-est.
- **Import (fine video)**: Norvegia (salmone, merluzzo), Francia (ostriche, cozze), Spagna (cozze, alici, gamberi), Portogallo (polpo, sardine),
  Marocco/Senegal (polpo, seppie, pesce atlantico), Tunisia/Egitto (Mediterraneo sud, anche allevato). Esempi tipici, non dati
  reali. Extra UE: certificati sanitari + controlli ai posti di frontiera.
- Argomenti di vendita: piattaforma/area clienti (ordine in pochi secondi, stato in tempo reale, fattura unica, documenti),
  **un contatto che si occupa di tutto**, **broker vs contatto diretto** (10 fornitori/telefonate/fatture → 1), qualità
  (occhio, branchie, pelle, carne, odore; ghiaccio fondente; lotto non perfetto = non parte), consegna diretta, rotazione.
- Numeri del progetto (verificati): 7.000 €/g × 4 × 52 = 1.456.000 €/anno; utile 7% 25–54k, 15% 120–149k, 20% 172–202k;
  10 cent/kg ≈ 21.000 €/anno; cassa asta 21.000 → 4.200 € con anticipo fatture 80%; socio al 50% ≈ 2.980 €/mese (centrale),
  ≈ 880 €/mese (prudente). Cifre sempre "indicative, da verificare con il commercialista".
- Partner/clienti: **Unicoop Etruria** (insegna in primo piano nel suo video), **Mare Italia** (grossista CAR, box 46–47,
  iscritta 2015, Guidonia, ~16 persone; logo non disponibile → nome in grafica). La foto "magazzino Argo Maris" NON va usata.

## REGOLA FISSA: usare SEMPRE tutti e 7 i programmi
**Remotion, HyperFrames, OpenMontage, ffmpeg, Whisper, yt-dlp, headroom** — ruoli:
OpenMontage = regia (pipeline `animated-explainer`, leggere `AGENT_GUIDE.md`); yt-dlp = riferimenti (YouTube bloccato in rete:
chiedere di aprirlo); Whisper = trascrizione riferimenti + **controllo parola per parola del video finale**; headroom =
comprimere trascrizioni lunghe (`scripts/compress.py`); Remotion = scene; HyperFrames = aperture/chiusure con GSAP
(`scripts/hf_brand.py`) + `hyperframes beats`; ffmpeg = mix e mastering. Se uno non funziona, dirlo, non saltarlo.

## Preferenze dell'utente (imparate in chat)
- Video di progetto **16:9 1920×1080**; social **9:16**. Tono B2B: "voi" alla catena, "ti" a chi avvia il progetto.
- **Voce naturale e bella**: frasi brevi, un "beat" per frase, pause calibrate. Voce **`it-IT-DiegoNeural`** (nativa italiana, rate +2%):
  la Giuseppe *Multilingual* "parla strano", non usarla. **Qualità 96 kbps** (patch in `voice.py`; il default 48 kbps suonava male).
- **Mai liste di nomi isolati** (accento straniero): scrivere "ci sono le triglie e le alici, i calamari e i gamberi…".
  Pronunce in `"pron"` (solo voce): "Unicoop Etruria"→"Unicoop, Etruria", "HACCP"→"H.A.C.C.P."; non dire "hub" a inizio
  frase (suona "lab") → "centro logistico"; FAO a parole ("trentasette punto uno punto tre"); "Questa è Argo Maris" non "Ecco…".
- **Audio**: niente rumori sintetici (fruscio "mare", droni): colonna sonora originale `scripts/corporate_music.py`
  (pianoforte/pad 92 BPM) con ducking sotto la voce, "swish" morbidi ai cambi scena; master −14/−15 LUFS, true-peak ≤ −1.5 dB.
- **Tantissimi esempi animati concreti** (ordine 40 kg orate + 25 kg calamari, confronto offerte, mare grosso → Adriatico,
  etichette, calcoli che si costruiscono, chat WhatsApp, cartoon dei buyer), grafica senza sovrapposizioni.
- Foto e clip **reali dell'utente** (pesci del CAR) si usano: `studio/public/car/`. Niente stock, niente crediti.
- L'utente vuole che venga **controllato tutto** (fotogrammi chiave + Whisper) prima di consegnare, e i video **mandati in chat**.
- Video "stile gioco" con ped 3D: **bocciato** ("brutto, non cinematografico") — per realismo serve video IA con API key.

## Pipeline (un video = `projects/<slug>/script.json`)
```bash
python3 scripts/voice.py <slug>                    # voce per beat + timeline.json (tempi parola)
cd studio && npx remotion still src/index.ts <Comp> /tmp/f.png --frame=N --scale=0.5     # controllo frame
npx remotion render src/index.ts <Comp> ../out/<slug>_video.mp4 --props='{"withVoice":false}' --muted --crf=19
cd .. && python3 scripts/master.py <slug> out/<slug>_video.mp4 out/<slug>_FINAL.mp4
python3 scripts/transcribe.py out/<slug>_FINAL.mp4 /tmp/c.json && python3 scripts/checkwords.py <slug> /tmp/c.json
```
- Scene 16:9: `useScene(p)` → `B(i)` (inizio beat), `Wd('parola')` (frame della parola). Kit: `lib/wide/ui.tsx` (40 specie
  vettoriali `SPECIES`, Icon, Card, Title, Header con `partnerImg`), `MapView.tsx` (viste lazio/centro/italia/europa/
  tirrenoV/adriaticoV/fao + zone FAO), `Shared.tsx` (marinerie, consegna), `Pro.tsx` (Ufficio, Piattaforma, Specie, CarFoto,
  Allevato, FruttiMare, Fao, Import, BrokerVsDiretto, Contatto, Freschezza, `Person` cartoon; `proScenes()` per registrarle).
- Render lenti (≈10 min di video → 1h45): lanciare in background in coda e avvisare l'utente.
- `studio/public/*/voice.wav` NON su git (>100 MB); i video finali in `renders/` (comprimere se >100 MB).
- Rete: edge-tts richiede `proxy=HTTPS_PROXY`; GSAP in locale (CDN bloccata); HF ok (RMBG-1.4, Whisper).

## Video fatti
- `mare-salato` (demo 9:16) · `coop-etruria` v3 (~10 min) · `gdo-v6` v3 (~20 min, spiegazione per l'utente) ·
  `mare-italia` v3 (~7 min) · `socio` v3 (~8 min) · `elite-city` (video personale stile Miami anni '80, 9:16).
