---
name: sito-gestionale-broker
description: Creare siti vetrina e gestionali web (ordini, DDT, fatture/FatturaPA, incassi, scadenzario, spedizioni, mezzi, dipendenti, turni) per aziende del settore ittico/agroalimentare come Argo Maris, anche "prendendo spunto" dalla grafica di un sito esistente senza copiarne i contenuti, e grafiche/schemi futuristici (mappe rotte import, flussi GDO/HoReCa). Usare quando l'utente chiede "crea sito", "crea app/gestionale", "broker", "gestione ordini/fornitori/ddt/fatture/turni/spedizioni", "grafici futuristici", "schema".
---

# Sito + gestionale broker (modello Argo Maris, nov. 2026)

Riferimento completo e funzionante nel repo: `argo-maris/` (leggere `argo-maris/README.md`).
Lavorare in autonomia, risposte brevi in italiano, commit + push sul branch di sessione.

## 1. Sito "ispirato" a un sito esistente
- Prendere SOLO lo stile (palette, font, impaginazione, animazioni). Mai copiare testi, numeri,
  indirizzi, nomi, loghi o foto del sito di riferimento. Contenuti propri; i dati che non si
  conoscono (telefono, indirizzo, P. IVA) restano segnaposto `[da inserire]` e si dice all'utente.
- Se il sito è bloccato dalla rete (proxy 403): `get_environment` → `update_environment`
  con `add_allowed_hosts` (già consentiti: mareitaliasrl.com, www.mareitaliasrl.com).
  Leggere HTML + `styles.css` con curl e estrarre variabili CSS (`--ink`, `--mint`…) e font.
- Se l'utente fornisce un logo, TUTTO si basa su quello: palette, font, marchio, favicon, login,
  intestazioni delle stampe. Ritaglio tondo con PIL (maschera ellittica) in 512/180/64 px.
- Stile Argo Maris (dal logo ufficiale `argo-maris/assets/logo_argo_maris_originale.png`):
  blu notte #0a1a3d/#050d24, giallo #ffd21f, blu #1d5fd1, ciano #3fd6f5, argento (gradiente
  testo); titoli Exo 2 800-900 corsivo, testo Manrope, HUD JetBrains Mono. Hero con il logo
  grande fluttuante a destra (anello tratteggiato che ruota); foto della sede al CAR in "Chi siamo".
- Sezioni: hero foto + onde SVG animate, punti di forza, chi siamo, rete globale (futuristica),
  gamma (card foto), metodo in 4 passi (sfondo scuro), per chi (GDO, HoReCa, pescherie,
  produttori), valori, contatti (modulo → mailto), footer con link "Area riservata" → `/app/`.
- Foto: CC0/pubblico dominio (Openverse `license=cc0,pdm`, Commons, rawpixel) + quelle già in
  `remotion/public/img`. Ridurre a ≤1920 px con ffmpeg. Controllare con un provino (contact sheet).
- Verifica: Playwright screenshot 1440 e 390 px, `scrollWidth` = larghezza (niente scroll
  orizzontale). Per le pagine intere forzare `loading=eager` e `.reveal{opacity:1}`.

## 1b. MAI lo stesso sito due volte
- L'utente ha bocciato il primo sito perché "sempre uguale". Prima di disegnare leggere Hallmark
  (`references/direction.md`, percorso custom) e taste-skill: niente hero diviso standard + tre
  schede + passi numerati + banda con form + footer con logo enorme come piano di default.
- Un'idea sola, vera solo per questo cliente, che regge tutta la pagina (Argo Maris v3: il tabellone
  arrivi e il pavimento del box al CAR). Colori presi dalle foto/logo del cliente, non dalla categoria.
- Regole fisse: colori e font solo come token; titoli interi (mai una parola colorata o in corsivo da
  sola); niente etichette in maiuscolo spaziato; niente numeri, recensioni o loghi inventati; un dato
  mancante = segnaposto tratteggiato; ogni animazione lunga ha un pulsante di pausa e si ferma con
  prefers-reduced-motion; overflow-x: clip; focus visibile; form che invia davvero (al gestionale).

## 2. Grafiche futuristiche (rotte import, schemi)
- Mappa mondo a puntini: `python3 -I argo-maris/tools/dotmap.py ne_110m_land.geojson`
  (Natural Earth da raw.githubusercontent.com) → un solo `<path>` con `h0` + linecap round.
- Rotte: curve `Q` dall'origine all'hub (punto di controllo alzato di 0,35 × distanza),
  `stroke-dasharray` animato + pallino con `<animateMotion>`, nodi con anello "ping",
  hub con 3 anelli sfasati e targhetta "ROMA · CAR". Cornice con angoli neon ed etichette HUD.
- Schema a flusso in HTML/CSS (responsivo): Import (Mondo) → Hub (CAR Roma) → GDO + HoReCa,
  connettori con particella che viaggia; sotto 1100 px diventa verticale.
- Ticker di parole chiave (GDO, HoReCa, Import mondiale, CAR Roma, Catena del freddo…).
- Rispettare `prefers-reduced-motion`. Nessun numero inventato nei grafici.

## 2b. Scena 3D guidata dallo scroll (stile "Websites in 2026")
- three.js scaricato con `npm pack three@0.160.0` e copiato in `sito/vendor/` (modulo ES, nessun CDN).
- Modelli tutti procedurali (nave = Shape estrusa + container InstancedMesh; pesci = ellissoide con
  colori dorso/ventre + coda/pinne estruse, uniti con un merge proprio; gamberi = sfere su arco;
  polpo = TubeGeometry), oceano low-poly con onde sulla CPU, fog diversa sopra/sotto l'acqua.
- Camera su chiavi (progresso scroll 0..1) con smoothstep e "cut" coperto da dissolvenza; capitoli
  HTML che entrano/escono per intervallo; render solo quando la sezione è visibile.
- InstancedMesh: frustumCulled=false. Fallback statico senza WebGL o con reduced-motion.

## 3. Gestionale (Node ≥22.13, zero dipendenze)
- `server.js`: `node:http` + `node:sqlite`; serve il sito su `/` e l'app su `/app/`; API `/app/api/*`.
- `schema.js`: UNA definizione per entità (campi, tipi, ref, list, righe) che genera tabelle
  (con migrazione colonne), API CRUD generiche e moduli/liste del client. Per aggiungere un
  campo basta lo schema.
- Entità: clienti, fornitori (provvigione %, bollo CE, zone FAO), prodotti (nome scientifico,
  zona FAO, metodo, attrezzo: Reg. UE 1379/2013), ordini (righe con prezzo acquisto/vendita,
  margine), DDT (numerazione n/anno), fatture (Vendita, Provvigione, Acquisto, Nota di credito;
  IVA pesce 10 %, provvigioni 22 %), pagamenti (aggiornano lo stato fattura), spedizioni,
  vettori, mezzi (scadenze ATP/revisione), dipendenti (HACCP, patente), turni, utenti
  (admin/operatore/lettura), impostazioni, registro attività.
- Flussi: ordine → genera DDT → fattura cliente → incasso; ordine → fattura provvigione.
  Scadenza calcolata da "30 gg d.f." / "f.m.". XML FatturaPA FPR12 (bozza da far controllare:
  il gestionale non invia allo SDI). Stampe DDT/fattura/conferma d'ordine/foglio di viaggio.
- Sicurezza: password scrypt, cookie HttpOnly SameSite, limite tentativi login, campi
  whitelisted dallo schema, path traversal bloccato. Primo accesso admin/argomaris (o ADMIN_PASSWORD).
- Dati demo (nomi "(demo)") in transazione, solo su archivio vuoto.
- Trappole già risolte: `clean()` deve trattare `null` come vuoto; transazioni annidate con
  contatore; listener nelle viste ricreate vanno messi su un contenitore nuovo.
- Test: server su porta di prova con `DATA_DIR` nello scratchpad, curl per API/ruoli, Playwright
  per il flusso completo (login → demo → ordine → DDT → fattura → incasso → turno → mobile).

## 3a. Listini, confronto prezzi e AI
- Listini fornitore = entità con righe (prodotto abbinato, descrizione originale, origine, pezzatura,
  U.M., prezzo) + campo `files` (foto/PDF, caricamento base64 con ridimensionamento a 2000 px nel
  browser, salvati in DATA_DIR/uploads, serviti solo dietro login).
- Lettura con AI: SDK ufficiale `@anthropic-ai/sdk` (non fetch), `client.beta.messages.create` con
  model `claude-opus-5-5`, `betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default'`,
  `output_config: { effort, format: { type: 'json_schema', schema } }` (null con anyOf), immagini
  `{type:'image', source:{type:'base64'}}` e PDF `{type:'document'}`; passare il catalogo prodotti per
  l'abbinamento, prezzo null se illeggibile, l'utente controlla e salva. Gestire refusal/max_tokens ed
  errori tipizzati (AuthenticationError, RateLimitError, APIConnectionError, APIError).
- Confronto: ultimo listino Attivo per fornitore, chiave = prodotto_id o descrizione normalizzata,
  trend vs listino precedente, ricarichi per canale nelle Impostazioni, link "Ordina" che precompila l'ordine.
- Assistente: contesto JSON (listini attivi, anagrafica, vendite 60 gg, ricarichi), risposte brevi in
  italiano senza inventare prezzi; storia breve in sessionStorage.
- Chiave: ANTHROPIC_API_KEY tra le variabili del servizio (mai in chat o nel repo). Test con finto
  endpoint Messages (ANTHROPIC_BASE_URL) e Playwright.

## 3b. App per telefono (PWA)
- Quando chiedono "l'app": rendere il gestionale installabile (manifest con scope /app/,
  start_url /app/#/, display standalone, theme blu notte; icone quadrate dal logo su fondo blu
  192/512 + maskable con margine 20 % + apple-touch-icon 180; meta apple-mobile-web-app-*;
  viewport-fit=cover e safe-area). Service worker: interfaccia dalla cache aggiornata in
  background, MAI cache delle /api. Server: MIME .webmanifest. Barra in basso su mobile
  (Home, Ordini, Viaggi, Turni, Menu). Pulsante install: beforeinstallprompt su Android,
  istruzioni Safari su iPhone. Testare con Playwright devices['iPhone 13'].
- App Store/Play Store solo se l'utente lo chiede (servono account sviluppatore).

## 4. Consegna
- Screenshot all'utente (SendUserFile), riepilogo breve: cosa c'è, come avviarlo, cosa va
  completato (dati aziendali, segnaposto). Proporre la messa online (es. Railway).
