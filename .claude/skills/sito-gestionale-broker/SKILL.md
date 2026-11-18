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
