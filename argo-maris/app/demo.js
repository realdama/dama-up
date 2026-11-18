// Dati dimostrativi (nomi di fantasia) per provare il gestionale.
module.exports = function demo({ saveRow, db, user, generaDDT, generaFattura, generaProvvigione }) {
  if (db.prepare('SELECT COUNT(*) n FROM ordini').get().n) throw Object.assign(new Error('Ci sono già ordini: i dati demo si caricano solo su un archivio vuoto'), { code: 400 });
  const iso = d => d.toISOString().slice(0, 10);
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const S = (e, b) => saveRow(e, null, b, user);

  const clienti = [
    ['Trattoria Il Faro (demo)', 'Ristorante', 'Roma', 'RM', 'Bonifico 30 gg d.f.'],
    ['Pescheria Onda Blu (demo)', 'Pescheria', 'Latina', 'LT', 'RiBa 30 gg'],
    ['SuperMercati Centro (demo)', 'GDO', 'Frosinone', 'FR', 'Bonifico 60 gg d.f.'],
    ['Osteria del Porto (demo)', 'Ristorante', 'Civitavecchia', 'RM', 'Rimessa diretta'],
    ['Catering Mareblu (demo)', 'Catering', 'Viterbo', 'VT', 'Bonifico 30 gg f.m.'],
    ['Ittica Rivabella (demo)', 'Grossista', 'Napoli', 'NA', 'Bonifico 30 gg d.f.'],
  ].map(([r, tipo, citta, prov, pag], i) => S('clienti', { ragione_sociale: r, tipo, canale: { Ristorante: 'HoReCa', Catering: 'HoReCa', GDO: 'GDO', Pescheria: 'Pescheria', Grossista: 'Grossista' }[tipo] || 'Altro', citta, provincia: prov, pagamento: pag, piva: String(10000000000 + i * 1234567), indirizzo: `Via del Mare ${10 + i}`, cap: '00100', telefono: `06 000 00${i}0`, email: `ordini${i}@esempio.it` }));
  const fornitori = [
    ['Cooperativa Pescatori Adriatico (demo)', 'Armatore / pescatore', 'Ancona', '37.2.1', 3],
    ['Gamberi del Canale (demo)', 'Armatore / pescatore', 'Mazara del Vallo', '37.2.2', 4],
    ['Allevamenti Laguna (demo)', 'Allevamento', 'Orbetello', '', 3],
    ['Atlantic Seafood Import (demo)', 'Importatore', 'Milano', '27, 21', 2.5],
    ['Tonnare del Sud (demo)', 'Armatore / pescatore', 'Trapani', '37.1.3', 3],
  ].map(([r, tipo, citta, fao, pv], i) => S('fornitori', { ragione_sociale: r, tipo, citta, zone_fao: fao, provvigione_pct: pv, pagamento: 'Bonifico 30 gg d.f.', piva: String(20000000000 + i * 7654321), riconoscimento_ce: `IT ${100 + i} CE` }));
  const F = fornitori.map(f => f.id);
  const prodotti = [
    ['GR01', 'Gambero rosso di Mazara', 'Aristaeomorpha foliacea', 'Crostacei', 'FAO 37.2.2 Canale di Sicilia', 'Pescato', 'Reti da traino', 'Fresco', '1ª cat. 10-15 pz/kg', 'kg', 38, 52, F[1]],
    ['GV01', 'Gambero viola', 'Aristeus antennatus', 'Crostacei', 'FAO 37.1.3 Tirreno', 'Pescato', 'Reti da traino', 'Fresco', '2ª cat.', 'kg', 32, 44, F[1]],
    ['SC01', 'Scampo', 'Nephrops norvegicus', 'Crostacei', 'FAO 37.2.1 Adriatico', 'Pescato', 'Reti da traino', 'Fresco', '20-30 pz/kg', 'kg', 30, 41, F[0]],
    ['AL01', 'Alici', 'Engraulis encrasicolus', 'Fresco', 'FAO 37.2.1 Adriatico', 'Pescato', 'Reti da circuizione', 'Fresco', '', 'kg', 3.2, 5.5, F[0]],
    ['SG01', 'Sgombro', 'Scomber scombrus', 'Fresco', 'FAO 37.2.1 Adriatico', 'Pescato', 'Reti da circuizione', 'Fresco', '', 'kg', 3.8, 6.2, F[0]],
    ['SP01', 'Spigola di allevamento', 'Dicentrarchus labrax', 'Fresco', 'Italia', 'Allevato', '', 'Fresco', '400-600 g', 'kg', 7.5, 10.5, F[2]],
    ['OR01', 'Orata di allevamento', 'Sparus aurata', 'Fresco', 'Italia', 'Allevato', '', 'Fresco', '300-400 g', 'kg', 6.8, 9.6, F[2]],
    ['TO01', 'Tonno rosso, lombo', 'Thunnus thynnus', 'Grandi pelagici', 'FAO 37.1.3', 'Pescato', 'Reti da circuizione', 'Fresco', 'lombo 3-5 kg', 'kg', 24, 33, F[4]],
    ['PS01', 'Pesce spada, trancio', 'Xiphias gladius', 'Grandi pelagici', 'FAO 37.2.2', 'Pescato', 'Ami e palangari', 'Fresco', '', 'kg', 15, 21, F[4]],
    ['CO01', 'Cozze', 'Mytilus galloprovincialis', 'Molluschi', 'Italia', 'Allevato', '', 'Fresco', 'retina 5 kg', 'kg', 1.6, 2.6, F[2]],
    ['PO01', 'Polpo', 'Octopus vulgaris', 'Molluschi', 'FAO 37.2.1', 'Pescato', 'Nasse e trappole', 'Fresco', '1-2 kg', 'kg', 11, 15.5, F[0]],
    ['MA01', 'Mazzancolle tropicali', 'Penaeus vannamei', 'Congelato', 'Ecuador', 'Allevato', '', 'Surgelato', '16/20', 'cartone', 48, 62, F[3]],
    ['AS01', 'Astice canadese', 'Homarus americanus', 'Crostacei', 'FAO 21 Atlantico nord-occidentale', 'Pescato', 'Nasse e trappole', 'Fresco', '500-600 g', 'kg', 26, 35, F[3]],
    ['MZ01', 'Merluzzo nordico, filetti', 'Gadus morhua', 'Congelato', 'FAO 27 Atlantico nord-orientale', 'Pescato', 'Reti da traino', 'Surgelato', '', 'kg', 9, 12.8, F[3]],
  ].map(([codice, nome, sci, cat, fao, met, att, st, pez, un, pa, pv, f]) => S('prodotti', { codice, nome, nome_scientifico: sci, categoria: cat, zona_fao: fao, metodo: met, attrezzo: att, stato_fisico: st, pezzatura: pez, unita: un, prezzo_acquisto: pa, prezzo_vendita: pv, iva: 10, fornitore_id: f, temperatura: st === 'Surgelato' ? '-18 °C' : '0/+4 °C', attivo: 1 }));
  // prezzi per canale e listini fornitori (attuale + precedente) per il confronto
  for (const p of prodotti) db.prepare('UPDATE prodotti SET prezzo_gdo=?, prezzo_horeca=? WHERE id=?').run(Math.round(p.prezzo_acquisto * 1.15 * 100) / 100, Math.round(p.prezzo_acquisto * 1.32 * 100) / 100, p.id);
  for (const [fi, forn] of fornitori.entries()) {
    const scelti = prodotti.filter((p, j) => p.fornitore_id === forn.id || (j + fi) % 3 === 0);
    for (const [k, giorni] of [[0, -14], [1, -2]]) {
      S('listini', { fornitore_id: forn.id, data: day(giorni), valido_fino: day(giorni + 7), titolo: k ? 'Listino settimana corrente' : 'Listino settimana precedente', stato: k ? 'Attivo' : 'Archiviato',
        righe: scelti.map(p => ({ prodotto_id: p.id, descrizione: p.nome.toUpperCase(), origine: p.zona_fao, pezzatura: p.pezzatura, unita: p.unita,
          prezzo: Math.round(p.prezzo_acquisto * (0.9 + rnd() * 0.22) * 100) / 100 })) });
    }
  }
  const vettori = [['Frigo Express (demo)', 'Tariffa a collo, consegna in giornata'], ['Trasporti Isotermici Sud (demo)', 'A viaggio'], ['Logistica Freddo Italia (demo)', 'Groupage refrigerato']]
    .map(([r, t], i) => S('vettori', { ragione_sociale: r, tariffa: t, telefono: `06 111 11${i}`, piva: String(30000000000 + i * 11) }));
  const mezzi = [['AB123CD', 'Iveco Daily isotermico', 'Furgone isotermico', 30], ['EF456GH', 'Fiat Ducato frigo', 'Furgone frigo', 70], ['IL789MN', 'Mercedes Atego frigo', 'Camion frigo', 200]]
    .map(([t, m, tipo, gg]) => S('mezzi', { targa: t, modello: m, tipo, proprieta: 'Aziendale', portata_kg: tipo === 'Camion frigo' ? 5000 : 1200, atp_scadenza: day(gg), revisione_scadenza: day(gg + 120), assicurazione_scadenza: day(gg + 40) }));
  const dip = [
    ['Marco', 'Rinaldi', 'Commerciale / broker', '#3e8186', 40, 'B'], ['Giulia', 'Ferri', 'Amministrazione', '#7c6bc4', 38, 'B'],
    ['Luca', 'Esposito', 'Autista', '#d98e3b', 40, 'C, CQC'], ['Paolo', 'De Santis', 'Autista', '#c95f5f', 40, 'C, CQC'],
    ['Sara', 'Colombo', 'Logistica', '#4a8fd9', 40, 'B'], ['Antonio', 'Greco', 'Magazzino', '#5aa469', 30, 'B'],
  ].map(([n, c, r, col, ore, pat], i) => S('dipendenti', { nome: n, cognome: c, ruolo: r, colore: col, ore_settimanali: ore, patente: pat, contratto: ore < 36 ? 'Part-time' : 'Tempo indeterminato', data_assunzione: day(-400 - i * 90), haccp_scadenza: day(20 + i * 70), patente_scadenza: day(200 + i * 50), telefono: `333 000 000${i}`, attivo: 1 }));

  // ordini degli ultimi 6 mesi
  const autisti = dip.filter(d => d.ruolo === 'Autista');
  for (let k = 0; k < 36; k++) {
    const back = Math.max(0, Math.round(178 - k * 5.3));
    const cli = pick(clienti);
    const forn = pick(fornitori);
    let prods = prodotti.filter(p => p.fornitore_id === forn.id);
    if (!prods.length) prods = prodotti;
    const righe = Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => {
      const p = pick(prods);
      const q = p.unita === 'cartone' ? 2 + Math.floor(rnd() * 8) : 5 + Math.round(rnd() * 40);
      return { prodotto_id: p.id, descrizione: p.nome, quantita: q, unita: p.unita, prezzo_acquisto: p.prezzo_acquisto, prezzo_vendita: p.prezzo_vendita, iva: 10, lotto: `L${String(1000 + k * 7)}` };
    });
    const data = day(-back);
    const o = S('ordini', { data, cliente_id: cli.id, fornitore_id: forn.id, data_consegna: day(Math.max(-back + 1, k % 3)), luogo_consegna: `${cli.citta} (${cli.provincia})`, stato: 'Confermato', provvigione_pct: forn.provvigione_pct, righe });
    const recent = back < 5;
    if (back > 1) {
      const d = generaDDT(o.id, user);
      db.prepare('UPDATE ddt SET data=?, colli=? WHERE id=?').run(data, righe.length * 2, d.id);
      const sp = S('spedizioni', { data_partenza: `${data}T05:30`, arrivo_previsto: `${data}T11:00`, arrivo_effettivo: recent ? null : `${data}T10:${String(10 + k).slice(-2)}`, origine: forn.citta, destinazione: cli.citta, vettore_id: k % 3 ? pick(vettori).id : null, mezzo_id: k % 3 ? null : pick(mezzi).id, autista_id: k % 3 ? null : pick(autisti).id, temperatura: '0/+4 °C', temp_rilevata: recent ? null : 2, costo: 60 + Math.round(rnd() * 120), stato: recent ? 'In viaggio' : 'Consegnata' });
      db.prepare('UPDATE ddt SET spedizione_id=?, vettore_id=? WHERE id=?').run(sp.id, sp.vettore_id, d.id);
      if (!recent) {
        db.prepare("UPDATE ordini SET stato='Consegnato' WHERE id=?").run(o.id);
        const f = generaFattura(o.id, user);
        db.prepare('UPDATE fatture SET data=?, scadenza=date(?, ?) WHERE id=?').run(data, data, cli.pagamento.includes('60') ? '+60 days' : cli.pagamento.includes('30') ? '+30 days' : '+0 days', f.id);
        const fa = S('fatture', { tipo: 'Acquisto', numero: `${100 + k}/F`, data, fornitore_id: forn.id, ordine_id: o.id, pagamento: 'Bonifico 30 gg d.f.', stato: 'Emessa', righe: righe.map(r => ({ descrizione: r.descrizione, quantita: r.quantita, unita: r.unita, prezzo: r.prezzo_acquisto, iva: 10 })) });
        if (back > 50 || (back > 25 && k % 2)) {
          const fr = db.prepare('SELECT totale FROM fatture WHERE id=?').get(f.id);
          S('pagamenti', { data: day(-back + 30 > 0 ? -1 : -back + 30), fattura_id: f.id, importo: fr.totale, metodo: 'Bonifico' });
          db.prepare("UPDATE ordini SET stato='Chiuso' WHERE id=?").run(o.id);
        }
        if (back > 40) {
          const ta = db.prepare('SELECT totale FROM fatture WHERE id=?').get(fa.id);
          S('pagamenti', { data: day(-back + 30), fattura_id: fa.id, importo: ta.totale, metodo: 'Bonifico' });
        }
        if (k % 4 === 0) generaProvvigione(o.id, user);
      }
    } else if (k % 2) db.prepare("UPDATE ordini SET stato='Bozza' WHERE id=?").run(o.id);
  }

  // turni settimana scorsa e corrente
  const monday = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })();
  const orari = { 'Commerciale / broker': ['04:30', '12:30', 'Mercato notturno'], Amministrazione: ['08:30', '17:00', 'Lavoro'], Autista: ['05:00', '13:00', 'Consegne'], Logistica: ['04:00', '12:00', 'Lavoro'], Magazzino: ['05:00', '11:00', 'Lavoro'] };
  for (let w = -7; w < 7; w++) {
    const d = new Date(monday); d.setDate(d.getDate() + w); const ds = iso(d); const dow = (d.getDay() + 6) % 7;
    if (dow === 6) continue;
    dip.forEach((p, i) => {
      if (dow === 5 && i % 2) return;
      if (w === 2 && i === 4) return S('turni', { dipendente_id: p.id, data: ds, tipo: 'Ferie' });
      const [ini, fin, tipo] = orari[p.ruolo];
      S('turni', { dipendente_id: p.id, data: ds, tipo, inizio: ini, fine: fin, pausa_min: p.ruolo === 'Amministrazione' ? 60 : 30 });
    });
  }
};
