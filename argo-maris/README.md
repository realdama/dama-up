# Argo Maris

- `sito/` — sito vetrina (HTML/CSS/JS statici). Si apre anche da solo (`sito/index.html`).
- `app/` — gestionale broker: ordini, DDT, fatture (con XML FatturaPA), incassi/pagamenti,
  scadenzario, spedizioni, vettori, mezzi, clienti, fornitori, prodotti, dipendenti, turni,
  utenti con ruoli, registro attività, backup, esportazione CSV.

## Avvio

Serve solo Node.js 22.13 o più recente (nessun `npm install`):

```
cd argo-maris/app
node server.js
```

- Sito: http://localhost:3000/
- Gestionale: http://localhost:3000/app/  — primo accesso `admin` / `argomaris`
  (cambiare subito la password da Sistema → Utenti, oppure avviare con `ADMIN_PASSWORD=...`).

Variabili: `PORT` (porta), `DATA_DIR` (cartella del database, default `app/data`),
`ADMIN_PASSWORD` (password iniziale dell'admin, usata solo al primo avvio).

Per provarlo: Sistema → Impostazioni → «Carica dati demo» (solo su archivio vuoto).

## Flusso tipico

Ordine (cliente + fornitore + righe con prezzo d'acquisto e di vendita, margine e provvigione)
→ «Genera DDT» (con nome scientifico, zona FAO, metodo, lotto: Reg. UE 1379/2013)
→ spedizione (vettore o mezzo aziendale, autista, temperatura) → «Fattura cliente»
→ incasso. Dall'ordine si emette anche la fattura di provvigione al fornitore.

## Da completare

- Dati aziendali in Impostazioni (P. IVA, indirizzo, IBAN): servono per DDT, fatture e XML.
- Il file XML FatturaPA va controllato e inviato allo SDI con il proprio intermediario:
  il gestionale non trasmette.
- Sito: telefono, indirizzo e P. IVA sono segnaposto (`[da inserire]`) in `sito/index.html`.
- Foto del sito: CC0 / pubblico dominio (Wikimedia Commons, rawpixel, Openverse).
