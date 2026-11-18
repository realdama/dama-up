// Argo Maris — gestionale broker ittico.
// Server Node.js senza dipendenze: http + node:sqlite (Node >= 22.13).
// Avvio: node server.js   (porta da PORT, default 3000; database in data/argomaris.db)

process.removeAllListeners('warning');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { entities, GROUPS, SETTINGS } = require('./schema');

const PORT = +process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PUBLIC = path.join(__dirname, 'public');
const SITE = process.env.SITE_DIR || path.join(__dirname, '..', 'sito');
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_FILE = path.join(DATA_DIR, 'argomaris.db');
const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');

// ---------------------------------------------------------------- schema DB
const SQLTYPE = { number: 'REAL', money: 'REAL', bool: 'INTEGER', ref: 'INTEGER' };
const EXTRA = { // colonne interne non mostrate nei moduli
  ordini: { costo: 'REAL', imponibile: 'REAL', anno: 'INTEGER', progressivo: 'INTEGER' },
  ddt: { anno: 'INTEGER', progressivo: 'INTEGER' },
  fatture: { anno: 'INTEGER', progressivo: 'INTEGER', xml_inviato: 'TEXT' },
  spedizioni: { anno: 'INTEGER', progressivo: 'INTEGER' },
  utenti: { hash: 'TEXT', salt: 'TEXT' },
};
function ensureTable(table, cols) {
  db.exec(`CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  const have = new Set(db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name));
  for (const [name, type] of Object.entries(cols)) if (!have.has(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
}
for (const [key, e] of Object.entries(entities)) {
  const cols = {};
  for (const f of e.fields) if (f.type !== 'password') cols[f.name] = SQLTYPE[f.type] || 'TEXT';
  Object.assign(cols, EXTRA[key] || {});
  ensureTable(key, cols);
  if (e.lines) {
    const lc = { parent_id: 'INTEGER', pos: 'INTEGER' };
    for (const f of e.lines.fields) lc[f.name] = SQLTYPE[f.type] || 'TEXT';
    ensureTable(e.lines.table, lc);
    db.exec(`CREATE INDEX IF NOT EXISTS ix_${e.lines.table}_p ON ${e.lines.table}(parent_id)`);
  }
}
db.exec(`CREATE TABLE IF NOT EXISTS sessioni (token TEXT PRIMARY KEY, utente_id INTEGER, scade TEXT);
CREATE TABLE IF NOT EXISTS impostazioni (chiave TEXT PRIMARY KEY, valore TEXT);
CREATE TABLE IF NOT EXISTS registro (id INTEGER PRIMARY KEY AUTOINCREMENT, quando TEXT DEFAULT CURRENT_TIMESTAMP, utente TEXT, azione TEXT, entita TEXT, rif INTEGER, dettaglio TEXT);
CREATE INDEX IF NOT EXISTS ix_turni_data ON turni(data);`);

// ---------------------------------------------------------------- utilità
const today = () => new Date().toISOString().slice(0, 10);
const r2 = n => Math.round((+n || 0) * 100) / 100;
const hashPw = (pw, salt) => crypto.scryptSync(String(pw), salt, 64).toString('hex');
function setting(k) {
  const row = db.prepare('SELECT valore FROM impostazioni WHERE chiave=?').get(k);
  return row ? row.valore : (SETTINGS.find(s => s.name === k) || {}).default || '';
}
function allSettings() { const o = {}; for (const s of SETTINGS) o[s.name] = setting(s.name); return o; }
function log(user, azione, entita, rif, dettaglio = '') {
  db.prepare('INSERT INTO registro (utente, azione, entita, rif, dettaglio) VALUES (?,?,?,?,?)').run(user?.username || 'sistema', azione, entita, rif ?? null, String(dettaglio).slice(0, 300));
}
let txDepth = 0;
function tx(fn) {
  if (txDepth) { txDepth++; try { return fn(); } finally { txDepth--; } }
  db.exec('BEGIN'); txDepth = 1;
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; } finally { txDepth = 0; }
}
class HttpError extends Error { constructor(code, msg) { super(msg); this.code = code; } }

// primo avvio: utente amministratore
if (!db.prepare('SELECT COUNT(*) n FROM utenti').get().n) {
  const salt = crypto.randomBytes(16).toString('hex');
  const pw = process.env.ADMIN_PASSWORD || 'argomaris';
  db.prepare('INSERT INTO utenti (username, nome, ruolo, attivo, hash, salt) VALUES (?,?,?,?,?,?)').run('admin', 'Amministratore', 'admin', 1, hashPw(pw, salt), salt);
  console.log(`Creato utente "admin" con password "${pw}" — cambiala da Sistema → Utenti.`);
}

// ---------------------------------------------------------------- numerazione
function nextNumber(entity, data, tipo) {
  const anno = +(data || today()).slice(0, 4);
  let where = 'anno=?'; const args = [anno];
  if (entity === 'fatture') { where += " AND tipo IN ('Vendita','Provvigione','Nota di credito')"; }
  const n = (db.prepare(`SELECT MAX(progressivo) m FROM ${entity} WHERE ${where}`).get(...args).m || 0) + 1;
  const pre = entities[entity].numbered;
  const numero = entity === 'fatture' || entity === 'ddt' ? `${n}/${anno}` : `${pre}-${anno}-${String(n).padStart(4, '0')}`;
  return { anno, progressivo: n, numero };
}

function calcScadenza(data, pagamento) {
  if (!data) return null;
  const d = new Date(data + 'T12:00:00Z');
  const m = /(\d+)\s*gg/.exec(pagamento || '');
  if (!m) return data;
  d.setUTCDate(d.getUTCDate() + +m[1]);
  if (/f\.m\./.test(pagamento)) { d.setUTCMonth(d.getUTCMonth() + 1, 0); }
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------- totali
function recalc(entity, id) {
  if (entity === 'ordini') {
    const t = db.prepare('SELECT COALESCE(SUM(quantita*prezzo_vendita),0) v, COALESCE(SUM(quantita*prezzo_acquisto),0) a FROM ordini_righe WHERE parent_id=?').get(id);
    db.prepare('UPDATE ordini SET totale=?, imponibile=?, costo=?, margine=? WHERE id=?').run(r2(t.v), r2(t.v), r2(t.a), r2(t.v - t.a), id);
  }
  if (entity === 'fatture') {
    const rows = db.prepare('SELECT quantita, prezzo, sconto, iva FROM fatture_righe WHERE parent_id=?').all(id);
    let imp = 0, iva = 0;
    for (const r of riepilogo(rows)) { imp += r.imponibile; iva += r.imposta; }
    const pagato = db.prepare('SELECT COALESCE(SUM(importo),0) p FROM pagamenti WHERE fattura_id=?').get(id).p;
    const f = db.prepare('SELECT stato FROM fatture WHERE id=?').get(id);
    const tot = r2(imp + iva);
    let stato = f.stato;
    if (!['Bozza', 'Annullata'].includes(stato)) {
      if (pagato > 0 && pagato >= tot - 0.005) stato = 'Pagata';
      else if (pagato > 0) stato = 'Parzialmente pagata';
      else if (['Pagata', 'Parzialmente pagata'].includes(stato)) stato = 'Emessa';
    }
    db.prepare('UPDATE fatture SET imponibile=?, imposta=?, totale=?, pagato=?, stato=? WHERE id=?').run(r2(imp), r2(iva), tot, r2(pagato), stato, id);
  }
}
function riepilogo(rows) {
  const by = {};
  for (const r of rows) {
    const al = +r.iva || 0;
    const imp = (+r.quantita || 0) * (+r.prezzo || 0) * (1 - (+r.sconto || 0) / 100);
    by[al] = (by[al] || 0) + imp;
  }
  return Object.entries(by).map(([al, imp]) => ({ aliquota: +al, imponibile: r2(imp), imposta: r2(imp * al / 100) }));
}

// ---------------------------------------------------------------- CRUD generico
function refJoins(e) {
  return e.fields.filter(f => f.type === 'ref').map(f => {
    const re = entities[f.ref];
    return `(SELECT ${re.display} FROM ${f.ref} r WHERE r.id = t.${f.name}) AS ${f.name}__label`;
  });
}
function listRows(entity, q) {
  const e = entities[entity];
  const where = []; const args = [];
  if (q.q) {
    const txt = e.fields.filter(f => ['text', 'email', 'tel', 'select', 'textarea'].includes(f.type)).map(f => `t.${f.name}`);
    const refs = e.fields.filter(f => f.type === 'ref').map(f => `(SELECT ${entities[f.ref].display} FROM ${f.ref} r WHERE r.id=t.${f.name})`);
    const all = [...txt, ...refs];
    if (all.length) { where.push('(' + all.map(c => `COALESCE(${c},'') LIKE ?`).join(' OR ') + ')'); all.forEach(() => args.push(`%${q.q}%`)); }
  }
  for (const f of e.fields) {
    if (q[f.name] !== undefined && q[f.name] !== '') { where.push(`t.${f.name} = ?`); args.push(q[f.name]); }
  }
  const dateField = e.fields.find(f => f.type === 'date' || f.type === 'datetime');
  if (dateField && q.da) { where.push(`substr(t.${dateField.name},1,10) >= ?`); args.push(q.da); }
  if (dateField && q.a) { where.push(`substr(t.${dateField.name},1,10) <= ?`); args.push(q.a); }
  if (q.aperte === '1' && entity === 'fatture') where.push("t.stato NOT IN ('Pagata','Annullata','Bozza') AND t.tipo <> 'Nota di credito'");
  const cols = ['t.*', ...refJoins(e)];
  let sort = e.defaultSort ? e.defaultSort.split(',').map(s => 't.' + s.trim()).join(', ') : `t.${e.fields[0].name}`;
  if (q.sort && e.fields.some(f => f.name === q.sort)) sort = `t.${q.sort} ${q.dir === 'desc' ? 'DESC' : 'ASC'}`;
  const limit = Math.min(+q.limit || 1000, 5000);
  const sql = `SELECT ${cols.join(', ')} FROM ${entity} t ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${sort} LIMIT ${limit}`;
  const rows = db.prepare(sql).all(...args);
  if (entity === 'utenti') rows.forEach(r => { delete r.hash; delete r.salt; });
  return rows;
}
function getRow(entity, id) {
  const e = entities[entity];
  const row = db.prepare(`SELECT ${['t.*', ...refJoins(e)].join(', ')} FROM ${entity} t WHERE t.id=?`).get(id);
  if (!row) throw new HttpError(404, 'Non trovato');
  if (e.lines) {
    const lf = e.lines.fields.filter(f => f.type === 'ref').map(f => `(SELECT ${entities[f.ref].display} FROM ${f.ref} r WHERE r.id=l.${f.name}) AS ${f.name}__label`);
    row.righe = db.prepare(`SELECT l.* ${lf.length ? ',' + lf.join(',') : ''} FROM ${e.lines.table} l WHERE parent_id=? ORDER BY pos, id`).all(id);
  }
  if (entity === 'utenti') { delete row.hash; delete row.salt; }
  return row;
}
function clean(fields, body) {
  const out = {};
  for (const f of fields) {
    if (f.computed || f.readonly || f.type === 'password' || !(f.name in body)) continue;
    let v = body[f.name];
    if (v === '' || v === undefined || v === null) v = null;
    else if (['number', 'money'].includes(f.type)) { v = +String(v).replace(',', '.'); if (Number.isNaN(v)) throw new HttpError(400, `${f.label}: numero non valido`); }
    else if (f.type === 'bool') v = v ? 1 : 0;
    else if (f.type === 'ref') v = +v || null;
    else if (f.type === 'files') {
      let arr = v; if (typeof arr === 'string') { try { arr = JSON.parse(arr); } catch { arr = []; } }
      arr = (Array.isArray(arr) ? arr : []).filter(n => FILE_RE.test(n)).slice(0, f.max || 10);
      v = arr.length ? JSON.stringify(arr) : null;
    }
    else v = String(v).trim();
    out[f.name] = v;
  }
  return out;
}
function saveRow(entity, id, body, user) {
  const e = entities[entity];
  const data = clean(e.fields, body);
  if (!id) for (const f of e.fields) if (f.default !== undefined && (data[f.name] === null || data[f.name] === undefined) && !f.computed)
    data[f.name] = f.default === 'today' ? today() : f.default;
  for (const f of e.fields) if (f.required && !id && (data[f.name] === null || data[f.name] === undefined)) throw new HttpError(400, `Campo obbligatorio: ${f.label}`);
  if (entity === 'fatture') {
    const tipo = data.tipo || (id && db.prepare('SELECT tipo FROM fatture WHERE id=?').get(id)?.tipo);
    if (tipo === 'Acquisto' && !data.fornitore_id && !id) throw new HttpError(400, 'Indica il fornitore');
    if (tipo !== 'Acquisto' && tipo !== 'Provvigione' && !data.cliente_id && !id) throw new HttpError(400, 'Indica il cliente');
    if (tipo === 'Provvigione' && !data.fornitore_id && !id) throw new HttpError(400, 'Indica il fornitore a cui fatturare la provvigione');
    if (!data.scadenza && data.data) data.scadenza = calcScadenza(data.data, data.pagamento);
  }
  if (entity === 'utenti') {
    if (body.password) { if (String(body.password).length < 6) throw new HttpError(400, 'Password: almeno 6 caratteri'); data.salt = crypto.randomBytes(16).toString('hex'); data.hash = hashPw(body.password, data.salt); }
    else if (!id) throw new HttpError(400, 'Imposta una password');
  }
  if (entity === 'turni' && data.inizio && data.fine === null) throw new HttpError(400, 'Indica l\'orario di fine');
  return tx(() => {
    if (!id) {
      if (e.numbered) {
        const tipo = data.tipo;
        if (!(entity === 'fatture' && tipo === 'Acquisto')) {
          const n = nextNumber(entity, data.data || data.data_partenza, tipo);
          data.anno = n.anno; data.progressivo = n.progressivo;
          data[entity === 'spedizioni' ? 'codice' : 'numero'] = n.numero;
        } else data.anno = +(data.data || today()).slice(0, 4);
      }
      const keys = Object.keys(data);
      const r = db.prepare(`INSERT INTO ${entity} (${keys.join(',') || 'id'}) VALUES (${keys.map(() => '?').join(',') || 'NULL'})`).run(...keys.map(k => data[k]));
      id = Number(r.lastInsertRowid);
      log(user, 'creato', entity, id, data.numero || data.codice || data.ragione_sociale || data.nome || '');
    } else {
      const keys = Object.keys(data);
      if (keys.length) db.prepare(`UPDATE ${entity} SET ${keys.map(k => `${k}=?`).join(',')}, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(...keys.map(k => data[k]), id);
      log(user, 'modificato', entity, id, keys.filter(k => !['hash', 'salt'].includes(k)).join(', '));
    }
    if (e.lines && Array.isArray(body.righe)) {
      db.prepare(`DELETE FROM ${e.lines.table} WHERE parent_id=?`).run(id);
      body.righe.forEach((riga, i) => {
        const d = clean(e.lines.fields, riga);
        if (Object.values(d).every(v => v === null)) return;
        const keys = ['parent_id', 'pos', ...Object.keys(d)];
        db.prepare(`INSERT INTO ${e.lines.table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`).run(id, i, ...Object.values(d));
      });
    }
    if (entity === 'pagamenti') { recalc('fatture', data.fattura_id || db.prepare('SELECT fattura_id f FROM pagamenti WHERE id=?').get(id).f); }
    recalc(entity, id);
    return getRow(entity, id);
  });
}
function deleteRow(entity, id, user) {
  const e = entities[entity];
  const row = getRow(entity, id);
  tx(() => {
    if (e.lines) db.prepare(`DELETE FROM ${e.lines.table} WHERE parent_id=?`).run(id);
    if (entity === 'fatture') db.prepare('DELETE FROM pagamenti WHERE fattura_id=?').run(id);
    // scollega riferimenti in altre tabelle
    for (const [k, other] of Object.entries(entities))
      for (const f of other.fields) if (f.type === 'ref' && f.ref === entity) db.prepare(`UPDATE ${k} SET ${f.name}=NULL WHERE ${f.name}=?`).run(id);
    for (const other of Object.values(entities)) if (other.lines)
      for (const f of other.lines.fields) if (f.type === 'ref' && f.ref === entity) db.prepare(`UPDATE ${other.lines.table} SET ${f.name}=NULL WHERE ${f.name}=?`).run(id);
    if (entity === 'dipendenti') db.prepare('DELETE FROM turni WHERE dipendente_id IS NULL').run();
    db.prepare(`DELETE FROM ${entity} WHERE id=?`).run(id);
    if (entity === 'pagamenti' && row.fattura_id) recalc('fatture', row.fattura_id);
  });
  log(user, 'eliminato', entity, id, row.numero || row.codice || row.ragione_sociale || row.nome || '');
}

// ---------------------------------------------------------------- flussi documentali
function generaDDT(ordineId, user) {
  const o = getRow('ordini', ordineId);
  const cli = db.prepare('SELECT * FROM clienti WHERE id=?').get(o.cliente_id) || {};
  const righe = o.righe.map(r => {
    const p = r.prodotto_id ? db.prepare('SELECT * FROM prodotti WHERE id=?').get(r.prodotto_id) || {} : {};
    return {
      prodotto_id: r.prodotto_id, descrizione: r.descrizione || p.nome, nome_scientifico: p.nome_scientifico,
      zona_fao: p.zona_fao, metodo: [p.metodo, p.attrezzo].filter(Boolean).join(' – '), lotto: r.lotto,
      quantita: r.quantita, unita: r.unita || p.unita,
    };
  });
  const peso = o.righe.filter(r => (r.unita || 'kg') === 'kg').reduce((s, r) => s + (+r.quantita || 0), 0);
  const ddt = saveRow('ddt', null, {
    data: today(), ordine_id: o.id, cliente_id: o.cliente_id, fornitore_id: o.fornitore_id,
    destinazione: o.luogo_consegna || [cli.indirizzo, cli.cap, cli.citta, cli.provincia].filter(Boolean).join(' '),
    causale: 'Vendita', trasporto: 'Vettore', peso_kg: peso || null, aspetto: 'Casse in polistirolo con ghiaccio', stato: 'Emesso', righe,
  }, user);
  if (['Bozza', 'Confermato', 'In preparazione'].includes(o.stato)) db.prepare("UPDATE ordini SET stato='In consegna' WHERE id=?").run(o.id);
  return ddt;
}
function generaFattura(ordineId, user, ddtId) {
  const o = getRow('ordini', ordineId);
  const cli = db.prepare('SELECT * FROM clienti WHERE id=?').get(o.cliente_id) || {};
  const ddts = db.prepare('SELECT numero, data FROM ddt WHERE ordine_id=? ORDER BY id').all(o.id);
  const rif = ddtId ? db.prepare('SELECT numero, data FROM ddt WHERE id=?').all(ddtId) : ddts;
  const f = saveRow('fatture', null, {
    tipo: 'Vendita', data: today(), cliente_id: o.cliente_id, ordine_id: o.id,
    rif_ddt: rif.map(d => `DDT ${d.numero} del ${d.data.split('-').reverse().join('/')}`).join('; '),
    pagamento: cli.pagamento || 'Rimessa diretta', stato: 'Emessa',
    righe: o.righe.map(r => ({ prodotto_id: r.prodotto_id, descrizione: [r.descrizione, r.lotto ? `lotto ${r.lotto}` : ''].filter(Boolean).join(' – '), quantita: r.quantita, unita: r.unita, prezzo: r.prezzo_vendita, sconto: 0, iva: r.iva ?? 10 })),
  }, user);
  db.prepare("UPDATE ordini SET stato='Fatturato' WHERE id=? AND stato NOT IN ('Chiuso','Annullato')").run(o.id);
  db.prepare("UPDATE ddt SET stato='Fatturato' WHERE ordine_id=? AND stato<>'Annullato'").run(o.id);
  return f;
}
function generaProvvigione(ordineId, user) {
  const o = getRow('ordini', ordineId);
  const forn = db.prepare('SELECT * FROM fornitori WHERE id=?').get(o.fornitore_id) || {};
  const pct = o.provvigione_pct ?? forn.provvigione_pct ?? +setting('provvigione_pct');
  const base = o.totale || 0;
  return saveRow('fatture', null, {
    tipo: 'Provvigione', data: today(), fornitore_id: o.fornitore_id, ordine_id: o.id, pagamento: 'Bonifico 30 gg d.f.', stato: 'Emessa',
    righe: [{ descrizione: `Provvigione d'intermediazione ${pct}% su ordine ${o.numero} (${o.cliente_id__label || ''}) – venduto € ${base.toFixed(2)}`, quantita: 1, unita: 'servizio', prezzo: r2(base * pct / 100), sconto: 0, iva: +setting('iva_provvigione') }],
  }, user);
}

// ---------------------------------------------------------------- dashboard e scadenze
function dashboard() {
  const t = today();
  const m0 = t.slice(0, 7) + '-01';
  const q = (sql, ...a) => db.prepare(sql).get(...a);
  const kpi = {
    ordini_aperti: q("SELECT COUNT(*) n FROM ordini WHERE stato IN ('Bozza','Confermato','In preparazione','In consegna')").n,
    venduto_mese: q("SELECT COALESCE(SUM(totale),0) v FROM ordini WHERE data>=? AND stato<>'Annullato'", m0).v,
    margine_mese: q("SELECT COALESCE(SUM(margine),0) v FROM ordini WHERE data>=? AND stato<>'Annullato'", m0).v,
    da_incassare: q("SELECT COALESCE(SUM(totale-COALESCE(pagato,0)),0) v FROM fatture WHERE tipo IN ('Vendita','Provvigione') AND stato NOT IN ('Pagata','Annullata','Bozza')").v,
    scaduto: q("SELECT COALESCE(SUM(totale-COALESCE(pagato,0)),0) v FROM fatture WHERE tipo IN ('Vendita','Provvigione') AND stato NOT IN ('Pagata','Annullata','Bozza') AND scadenza < ?", t).v,
    da_pagare: q("SELECT COALESCE(SUM(totale-COALESCE(pagato,0)),0) v FROM fatture WHERE tipo='Acquisto' AND stato NOT IN ('Pagata','Annullata','Bozza')").v,
    spedizioni_attive: q("SELECT COUNT(*) n FROM spedizioni WHERE stato IN ('Pianificata','In carico','In viaggio','Problema')").n,
    in_turno_oggi: q("SELECT COUNT(DISTINCT dipendente_id) n FROM turni WHERE data=? AND tipo NOT IN ('Ferie','Permesso','Malattia','Riposo')", t).n,
  };
  const mesi = db.prepare(`SELECT substr(data,1,7) mese, ROUND(SUM(totale),2) venduto, ROUND(SUM(margine),2) margine FROM ordini
    WHERE stato<>'Annullato' AND data >= date(?, '-11 months', 'start of month') GROUP BY mese ORDER BY mese`).all(t);
  const ordini = db.prepare(`SELECT o.id, o.numero, o.data_consegna, o.stato, o.totale, c.ragione_sociale cliente FROM ordini o LEFT JOIN clienti c ON c.id=o.cliente_id
    WHERE o.stato IN ('Bozza','Confermato','In preparazione','In consegna') ORDER BY COALESCE(o.data_consegna,'9999'), o.id LIMIT 8`).all();
  const spedizioni = db.prepare(`SELECT s.id, s.codice, s.data_partenza, s.destinazione, s.stato, v.ragione_sociale vettore FROM spedizioni s LEFT JOIN vettori v ON v.id=s.vettore_id
    WHERE s.stato IN ('Pianificata','In carico','In viaggio','Problema') ORDER BY s.data_partenza LIMIT 8`).all();
  const fatture = db.prepare(`SELECT f.id, f.numero, f.tipo, f.scadenza, f.totale, f.pagato, COALESCE(c.ragione_sociale, fo.ragione_sociale) controparte FROM fatture f
    LEFT JOIN clienti c ON c.id=f.cliente_id LEFT JOIN fornitori fo ON fo.id=f.fornitore_id
    WHERE f.stato NOT IN ('Pagata','Annullata','Bozza') AND f.tipo<>'Nota di credito' AND f.scadenza <= date(?, '+7 days') ORDER BY f.scadenza LIMIT 8`).all(t);
  const top = db.prepare(`SELECT c.ragione_sociale nome, ROUND(SUM(o.totale),2) v FROM ordini o JOIN clienti c ON c.id=o.cliente_id
    WHERE o.stato<>'Annullato' AND o.data >= date(?, '-12 months') GROUP BY c.id ORDER BY v DESC LIMIT 5`).all(t);
  return { kpi, mesi, ordini, spedizioni, fatture, top, scadenze: scadenze(60) };
}
function scadenze(giorni = 60) {
  const out = [];
  const lim = new Date(Date.now() + giorni * 864e5).toISOString().slice(0, 10);
  for (const [k, e] of Object.entries(entities)) for (const f of e.fields.filter(f => f.expiry)) {
    const extra = k === 'dipendenti' ? ' AND COALESCE(attivo,1)=1' : '';
    for (const r of db.prepare(`SELECT id, ${e.display} AS nome, ${f.name} AS data FROM ${k} WHERE ${f.name} IS NOT NULL AND ${f.name} <= ?${extra} ORDER BY ${f.name}`).all(lim))
      out.push({ entity: k, id: r.id, nome: r.nome, cosa: f.label.replace(/^Scadenza /i, ''), data: r.data, scaduto: r.data < today() });
  }
  return out.sort((a, b) => a.data.localeCompare(b.data));
}

// ---------------------------------------------------------------- FatturaPA (bozza XML 1.2.2)
const x = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const d2 = n => (+n || 0).toFixed(2);
function fatturaXml(id) {
  const f = getRow('fatture', id);
  if (f.tipo === 'Acquisto') throw new HttpError(400, 'Le fatture di acquisto si ricevono dallo SDI, non si generano');
  const s = allSettings();
  const cp = f.tipo === 'Provvigione' ? db.prepare('SELECT * FROM fornitori WHERE id=?').get(f.fornitore_id) : db.prepare('SELECT * FROM clienti WHERE id=?').get(f.cliente_id);
  if (!cp) throw new HttpError(400, 'Controparte mancante');
  const piva = (s.piva || '').replace(/\D/g, '');
  if (!piva || !s.indirizzo || !s.cap || !s.citta) throw new HttpError(400, 'Per la fattura elettronica compila P. IVA, indirizzo, CAP e città in Sistema → Impostazioni');
  const prog = (f.progressivo || 1).toString(36).toUpperCase().padStart(5, '0');
  const estero = cp.nazione && cp.nazione.toUpperCase() !== 'IT';
  const sdi = estero ? 'XXXXXXX' : (cp.codice_sdi || '0000000');
  const righe = f.righe.map((r, i) => {
    const tot = (+r.quantita || 0) * (+r.prezzo || 0) * (1 - (+r.sconto || 0) / 100);
    return `      <DettaglioLinee>
        <NumeroLinea>${i + 1}</NumeroLinea>
        <Descrizione>${x(r.descrizione || 'Articolo').slice(0, 1000)}</Descrizione>
        <Quantita>${(+r.quantita || 0).toFixed(2)}</Quantita>
        ${r.unita ? `<UnitaMisura>${x(r.unita)}</UnitaMisura>` : ''}
        <PrezzoUnitario>${(+r.prezzo || 0).toFixed(4)}</PrezzoUnitario>
        ${+r.sconto ? `<ScontoMaggiorazione><Tipo>SC</Tipo><Percentuale>${d2(r.sconto)}</Percentuale></ScontoMaggiorazione>` : ''}
        <PrezzoTotale>${d2(tot)}</PrezzoTotale>
        <AliquotaIVA>${d2(r.iva)}</AliquotaIVA>
      </DettaglioLinee>`;
  }).join('\n');
  const riep = riepilogo(f.righe).map(r => `      <DatiRiepilogo>
        <AliquotaIVA>${d2(r.aliquota)}</AliquotaIVA>
        <ImponibileImporto>${d2(r.imponibile)}</ImponibileImporto>
        <Imposta>${d2(r.imposta)}</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
      </DatiRiepilogo>`).join('\n');
  const mp = /RiBa/.test(f.pagamento) ? 'MP12' : /Contanti/.test(f.pagamento) ? 'MP01' : 'MP05';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="FPR12" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente><IdPaese>IT</IdPaese><IdCodice>${x(piva || s.cf)}</IdCodice></IdTrasmittente>
      <ProgressivoInvio>${prog}</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>${x(sdi)}</CodiceDestinatario>
      ${!estero && sdi === '0000000' && cp.pec ? `<PECDestinatario>${x(cp.pec)}</PECDestinatario>` : ''}
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA><IdPaese>IT</IdPaese><IdCodice>${x(piva)}</IdCodice></IdFiscaleIVA>
        ${s.cf ? `<CodiceFiscale>${x(s.cf)}</CodiceFiscale>` : ''}
        <Anagrafica><Denominazione>${x(s.ragione_sociale)}</Denominazione></Anagrafica>
        <RegimeFiscale>${x(s.regime_fiscale || 'RF01')}</RegimeFiscale>
      </DatiAnagrafici>
      <Sede><Indirizzo>${x(s.indirizzo)}</Indirizzo><CAP>${x(s.cap)}</CAP><Comune>${x(s.citta)}</Comune>${s.provincia ? `<Provincia>${x(s.provincia)}</Provincia>` : ''}<Nazione>IT</Nazione></Sede>
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        ${cp.piva ? `<IdFiscaleIVA><IdPaese>${x((cp.nazione || 'IT').toUpperCase())}</IdPaese><IdCodice>${x(cp.piva.replace(/\s/g, ''))}</IdCodice></IdFiscaleIVA>` : ''}
        ${cp.cf ? `<CodiceFiscale>${x(cp.cf)}</CodiceFiscale>` : ''}
        <Anagrafica><Denominazione>${x(cp.ragione_sociale)}</Denominazione></Anagrafica>
      </DatiAnagrafici>
      <Sede><Indirizzo>${x(cp.indirizzo)}</Indirizzo><CAP>${x(estero ? '00000' : cp.cap)}</CAP><Comune>${x(cp.citta)}</Comune>${!estero && cp.provincia ? `<Provincia>${x(cp.provincia)}</Provincia>` : ''}<Nazione>${x((cp.nazione || 'IT').toUpperCase())}</Nazione></Sede>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>${f.tipo === 'Nota di credito' ? 'TD04' : 'TD01'}</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>${f.data}</Data>
        <Numero>${x(f.numero)}</Numero>
        <ImportoTotaleDocumento>${d2(f.totale)}</ImportoTotaleDocumento>
        ${f.rif_ddt ? `<Causale>${x(f.rif_ddt).slice(0, 200)}</Causale>` : ''}
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
${righe}
${riep}
    </DatiBeniServizi>
    <DatiPagamento>
      <CondizioniPagamento>TP02</CondizioniPagamento>
      <DettaglioPagamento>
        <ModalitaPagamento>${mp}</ModalitaPagamento>
        ${f.scadenza ? `<DataScadenzaPagamento>${f.scadenza}</DataScadenzaPagamento>` : ''}
        <ImportoPagamento>${d2(f.totale)}</ImportoPagamento>
        ${s.iban && mp === 'MP05' ? `<IBAN>${x(s.iban.replace(/\s/g, ''))}</IBAN>` : ''}
      </DettaglioPagamento>
    </DatiPagamento>
  </FatturaElettronicaBody>
</p:FatturaElettronica>
`.replace(/\n\s*\n/g, '\n');
  return { xml, nome: `IT${piva || 'PIVA'}_${prog}.xml` };
}

// ---------------------------------------------------------------- CSV
function toCsv(entity, rows) {
  const e = entities[entity];
  const fields = e.fields.filter(f => f.type !== 'password');
  const esc = v => { v = v ?? ''; v = String(v); return /[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
  const head = fields.map(f => f.label);
  const body = rows.map(r => fields.map(f => {
    const v = f.type === 'ref' ? r[f.name + '__label'] : r[f.name];
    return esc(['money', 'number'].includes(f.type) && v != null ? String(v).replace('.', ',') : v);
  }).join(';'));
  return '﻿' + [head.join(';'), ...body].join('\r\n');
}

// ---------------------------------------------------------------- turni
function copiaSettimana(da, a, user) {
  const days = (s1, s2) => Math.round((new Date(s2) - new Date(s1)) / 864e5);
  const shift = days(da, a);
  const fine = new Date(new Date(da).getTime() + 6 * 864e5).toISOString().slice(0, 10);
  const src = db.prepare('SELECT * FROM turni WHERE data BETWEEN ? AND ?').all(da, fine);
  const aFine = new Date(new Date(a).getTime() + 6 * 864e5).toISOString().slice(0, 10);
  if (db.prepare('SELECT COUNT(*) n FROM turni WHERE data BETWEEN ? AND ?').get(a, aFine).n) throw new HttpError(400, 'La settimana di destinazione contiene già dei turni');
  tx(() => {
    for (const t of src) {
      const nd = new Date(new Date(t.data).getTime() + shift * 864e5).toISOString().slice(0, 10);
      db.prepare('INSERT INTO turni (dipendente_id, data, tipo, inizio, fine, pausa_min, note) VALUES (?,?,?,?,?,?,?)').run(t.dipendente_id, nd, t.tipo, t.inizio, t.fine, t.pausa_min, t.note);
    }
  });
  log(user, 'copiato', 'turni', null, `${da} → ${a} (${src.length})`);
  return { copiati: src.length };
}

// ---------------------------------------------------------------- auth
function parseCookies(req) { const o = {}; (req.headers.cookie || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }); return o; }
function currentUser(req) {
  const tok = parseCookies(req).am_sess; if (!tok) return null;
  const s = db.prepare("SELECT u.id, u.username, u.nome, u.ruolo FROM sessioni s JOIN utenti u ON u.id=s.utente_id WHERE s.token=? AND s.scade > datetime('now') AND COALESCE(u.attivo,1)=1").get(tok);
  return s || null;
}
const loginAttempts = new Map();

// ---------------------------------------------------------------- file caricati (foto prodotti, listini)
const UPLOADS = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });
const FILE_RE = /^[a-f0-9]{24}\.(jpg|png|webp|pdf)$/;
const FILE_MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf' };
function saveUpload(b) {
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }[b.type];
  if (!ext) throw new HttpError(400, 'Formato non supportato: carica foto (JPG, PNG, WEBP) o PDF');
  const buf = Buffer.from(String(b.data || ''), 'base64');
  if (!buf.length) throw new HttpError(400, 'File vuoto');
  if (buf.length > 15e6) throw new HttpError(413, 'File oltre 15 MB');
  const name = crypto.randomBytes(12).toString('hex') + '.' + ext;
  fs.writeFileSync(path.join(UPLOADS, name), buf);
  return { name, type: b.type, size: buf.length };
}

// ---------------------------------------------------------------- confronto listini
function confronto() {
  const fornitori = db.prepare(`SELECT f.id, f.ragione_sociale nome, l.id listino_id, l.data, l.titolo,
      (SELECT p.id FROM listini p WHERE p.fornitore_id=f.id AND p.id<>l.id AND p.data<=l.data ORDER BY p.data DESC, p.id DESC LIMIT 1) prev_id
    FROM listini l JOIN fornitori f ON f.id=l.fornitore_id
    WHERE l.stato='Attivo' AND l.id = (SELECT l2.id FROM listini l2 WHERE l2.fornitore_id=l.fornitore_id AND l2.stato='Attivo' ORDER BY l2.data DESC, l2.id DESC LIMIT 1)
    ORDER BY f.ragione_sociale`).all();
  const keyOf = r => r.prodotto_id ? 'p' + r.prodotto_id : 'd' + String(r.descrizione || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const rows = new Map();
  const prodStmt = db.prepare('SELECT id, nome, nome_scientifico, categoria, foto, unita, pezzatura, prezzo_gdo, prezzo_horeca, prezzo_vendita FROM prodotti WHERE id=?');
  for (const f of fornitori) {
    const prev = new Map();
    if (f.prev_id) for (const r of db.prepare('SELECT * FROM listini_righe WHERE parent_id=?').all(f.prev_id)) prev.set(keyOf(r), r.prezzo);
    for (const r of db.prepare('SELECT * FROM listini_righe WHERE parent_id=? AND prezzo IS NOT NULL').all(f.listino_id)) {
      const k = keyOf(r);
      if (!rows.has(k)) {
        const p = r.prodotto_id ? prodStmt.get(r.prodotto_id) : null;
        rows.set(k, { key: k, prodotto_id: r.prodotto_id, nome: p ? p.nome : r.descrizione, nome_scientifico: p?.nome_scientifico || null,
          categoria: p?.categoria || null, foto: p?.foto || null, unita: r.unita || p?.unita || 'kg', anagrafica: p || null, prezzi: {} });
      }
      const row = rows.get(k);
      const cur = row.prezzi[f.id];
      if (!cur || r.prezzo < cur.prezzo) row.prezzi[f.id] = { prezzo: r.prezzo, pezzatura: r.pezzatura, origine: r.origine, unita: r.unita, descrizione: r.descrizione, prev: prev.get(k) ?? null };
    }
  }
  const s = allSettings();
  return { fornitori, righe: [...rows.values()].sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'it')),
    ricarichi: { GDO: +s.ricarico_gdo_pct || 0, HoReCa: +s.ricarico_horeca_pct || 0, Pescheria: +s.ricarico_pescheria_pct || 0 } };
}

// ---------------------------------------------------------------- assistente AI (Claude)
const AI_MODEL = process.env.AI_MODEL || 'claude-opus-5-5';
let aiClient = null, aiSdk = null;
function aiReady() { return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN); }
function getAi() {
  if (!aiReady()) throw new HttpError(503, "Assistente AI non attivo: manca la chiave ANTHROPIC_API_KEY sul server (Railway → servizio argo-maris-web → Variables).");
  if (!aiClient) {
    try { aiSdk = require('@anthropic-ai/sdk'); } catch { throw new HttpError(503, 'Libreria AI non installata sul server (npm install)'); }
    const Anthropic = aiSdk.default || aiSdk.Anthropic || aiSdk;
    aiClient = new Anthropic();
  }
  return aiClient;
}
async function askClaude(params) {
  const client = getAi();
  let res;
  try {
    res = await client.beta.messages.create({
      model: AI_MODEL, max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
      ...params,
    });
  } catch (err) {
    const A = aiSdk.default || aiSdk;
    if (A.AuthenticationError && err instanceof A.AuthenticationError) throw new HttpError(503, 'Chiave AI non valida: controlla ANTHROPIC_API_KEY sul server');
    if (A.RateLimitError && err instanceof A.RateLimitError) throw new HttpError(429, "L'assistente AI è sovraccarico, riprova tra un minuto");
    if (A.BadRequestError && err instanceof A.BadRequestError) throw new HttpError(400, 'Richiesta AI non valida: ' + (err.message || '').slice(0, 200));
    if (A.APIConnectionError && err instanceof A.APIConnectionError) throw new HttpError(502, 'Servizio AI non raggiungibile, riprova');
    if (A.APIError && err instanceof A.APIError) throw new HttpError(502, 'Servizio AI non disponibile (' + (err.status || 'errore') + '), riprova');
    throw err;
  }
  if (res.stop_reason === 'refusal') throw new HttpError(422, "L'assistente AI non ha potuto rispondere a questa richiesta");
  if (res.stop_reason === 'max_tokens') throw new HttpError(422, 'Risposta AI troppo lunga: prova con meno pagine alla volta');
  return res.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
}
const nullable = (t, description) => ({ anyOf: [{ type: t }, { type: 'null' }], ...(description ? { description } : {}) });
const LISTINO_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['fornitore', 'data', 'righe'],
  properties: {
    fornitore: nullable('string'), data: nullable('string', 'Data del listino in formato YYYY-MM-DD, se presente'),
    righe: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['descrizione', 'prodotto_id', 'origine', 'pezzatura', 'unita', 'prezzo', 'note'],
      properties: {
        descrizione: { type: 'string', description: 'Prodotto come scritto nel listino' },
        prodotto_id: nullable('integer', 'id del catalogo solo se è chiaramente lo stesso prodotto, altrimenti null'),
        origine: nullable('string'), pezzatura: nullable('string'),
        unita: { type: 'string', description: 'kg, pz, cassa o cartone' },
        prezzo: nullable('number', 'Prezzo in euro per unità, null se illeggibile'),
        note: nullable('string'),
      } } },
  },
};
async function estraiListino(files) {
  const names = (Array.isArray(files) ? files : []).filter(n => FILE_RE.test(n)).slice(0, 10);
  if (!names.length) throw new HttpError(400, 'Carica prima almeno una foto o un PDF del listino');
  const content = [];
  for (const n of names) {
    const ext = n.split('.').pop(); const data = fs.readFileSync(path.join(UPLOADS, n)).toString('base64');
    content.push(ext === 'pdf'
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } }
      : { type: 'image', source: { type: 'base64', media_type: FILE_MIME[ext], data } });
  }
  const catalogo = db.prepare('SELECT id, nome, nome_scientifico, pezzatura, unita FROM prodotti WHERE COALESCE(attivo,1)=1 ORDER BY nome').all();
  content.push({ type: 'text', text: `Leggi questo listino prezzi di un fornitore di prodotti ittici e restituisci una riga per ogni prodotto con prezzo.
- Copia la descrizione come è scritta; riporta origine/zona FAO e pezzatura se indicate.
- prezzo: numero in euro per l'unità indicata (kg, pz, cassa, cartone). Se il prezzo non si legge con sicurezza metti null e spiega in note: non stimare.
- prodotto_id: abbina al catalogo solo se è chiaramente la stessa specie e un formato compatibile, altrimenti null.
- Ignora intestazioni, condizioni di vendita e righe senza prodotto.

Catalogo prodotti (JSON):
${JSON.stringify(catalogo)}` });
  const text = await askClaude({
    system: 'Sei l\'assistente acquisti di Argo Maris, broker e importatore di prodotti ittici al Centro Agroalimentare di Roma. Trascrivi i listini dei fornitori con precisione.',
    messages: [{ role: 'user', content }],
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: LISTINO_SCHEMA } },
  });
  let out; try { out = JSON.parse(text); } catch { throw new HttpError(502, 'Risposta AI non leggibile, riprova'); }
  const ids = new Set(catalogo.map(c => c.id));
  out.righe = (out.righe || []).map(r => ({ ...r, prodotto_id: ids.has(r.prodotto_id) ? r.prodotto_id : null }));
  const forn = out.fornitore ? db.prepare('SELECT id, ragione_sociale FROM fornitori').all()
    .find(f => f.ragione_sociale.toLowerCase().split(/[\s()]+/).filter(w => w.length > 3).some(w => out.fornitore.toLowerCase().includes(w))) : null;
  return { ...out, fornitore_id: forn ? forn.id : null };
}
async function chiediAi(domanda, storia) {
  if (!String(domanda || '').trim()) throw new HttpError(400, 'Scrivi una domanda');
  const c = confronto();
  const listini = c.fornitori.map(f => ({ fornitore: f.nome, data: f.data,
    prezzi: c.righe.filter(r => r.prezzi[f.id]).map(r => ({ prodotto: r.nome, ...r.prezzi[f.id] })) }));
  const prodotti = db.prepare('SELECT nome, categoria, unita, prezzo_acquisto, prezzo_vendita, prezzo_gdo, prezzo_horeca FROM prodotti WHERE COALESCE(attivo,1)=1').all();
  const vendite = db.prepare(`SELECT r.descrizione prodotto, COALESCE(o.canale, c.canale) canale, ROUND(SUM(r.quantita),1) quantita, ROUND(AVG(r.prezzo_vendita),2) prezzo_medio_vendita, ROUND(AVG(r.prezzo_acquisto),2) prezzo_medio_acquisto
    FROM ordini_righe r JOIN ordini o ON o.id=r.parent_id LEFT JOIN clienti c ON c.id=o.cliente_id
    WHERE o.data >= date('now','-60 days') AND o.stato<>'Annullato' GROUP BY 1,2 ORDER BY quantita DESC LIMIT 80`).all();
  const contesto = JSON.stringify({ oggi: today(), ricarichi_suggeriti_pct: c.ricarichi, listini_attivi: listini, anagrafica_prodotti: prodotti, vendite_ultimi_60_giorni: vendite });
  const messages = [];
  for (const m of (Array.isArray(storia) ? storia : []).slice(-6)) if (m && ['user', 'assistant'].includes(m.role) && m.text) messages.push({ role: m.role, content: String(m.text).slice(0, 4000) });
  messages.push({ role: 'user', content: `Dati aggiornati del gestionale (JSON):\n${contesto}\n\nDomanda: ${String(domanda).slice(0, 2000)}` });
  return askClaude({
    system: `Sei l'assistente acquisti e prezzi di Argo Maris, broker e importatore di prodotti ittici al CAR di Roma che vende a GDO, HoReCa e pescherie.
Rispondi in italiano, in modo breve e pratico, usando solo i dati forniti: se un dato manca dillo, non inventare prezzi.
Quando confronti fornitori indica sempre prezzo, unità, pezzatura e data del listino. Per i prezzi di vendita parti dal miglior prezzo d'acquisto e applica i ricarichi suggeriti, mostrando il calcolo.
Usa elenchi puntati brevi; niente tabelle larghe.`,
    messages,
    output_config: { effort: 'low' },
  });
}

// ---------------------------------------------------------------- HTTP
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json' };
function send(res, code, body, type = 'application/json; charset=utf-8', extra = {}) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
  res.writeHead(code, { 'Content-Type': type, 'Content-Length': buf.length, 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(buf);
}
function serveStatic(res, root, rel) {
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root)) return send(res, 403, 'Vietato', 'text/plain');
  let f = file;
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) return send(res, 404, 'Non trovato', 'text/plain; charset=utf-8');
  send(res, 200, fs.readFileSync(f), MIME[path.extname(f)] || 'application/octet-stream', { 'Cache-Control': 'no-cache' });
}
async function readBody(req, limit = 2e6) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > limit) throw new HttpError(413, 'File o richiesta troppo grande'); chunks.push(c); }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new HttpError(400, 'JSON non valido'); }
}

async function api(req, res, url) {
  const parts = url.pathname.replace(/^\/app\/api\/?|^\/api\/?/, '').split('/').filter(Boolean);
  const q = Object.fromEntries(url.searchParams);
  const method = req.method;

  if (parts[0] === 'login' && method === 'POST') {
    const ip = req.socket.remoteAddress; const a = loginAttempts.get(ip) || { n: 0, t: 0 };
    if (a.n >= 8 && Date.now() - a.t < 10 * 60e3) throw new HttpError(429, 'Troppi tentativi, riprova tra qualche minuto');
    const b = await readBody(req);
    const u = db.prepare('SELECT * FROM utenti WHERE username=? AND COALESCE(attivo,1)=1').get(String(b.username || '').trim());
    if (!u || hashPw(b.password || '', u.salt) !== u.hash) { loginAttempts.set(ip, { n: a.n + 1, t: Date.now() }); throw new HttpError(401, 'Credenziali non valide'); }
    loginAttempts.delete(ip);
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare("INSERT INTO sessioni (token, utente_id, scade) VALUES (?,?,datetime('now','+12 hours'))").run(token, u.id);
    db.prepare("DELETE FROM sessioni WHERE scade < datetime('now')").run();
    log(u, 'login', 'utenti', u.id);
    const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
    return send(res, 200, { ok: true }, undefined, { 'Set-Cookie': `am_sess=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200${secure}` });
  }
  const user = currentUser(req);
  if (!user) throw new HttpError(401, 'Accesso richiesto');
  if (parts[0] === 'logout') { db.prepare('DELETE FROM sessioni WHERE token=?').run(parseCookies(req).am_sess); return send(res, 200, { ok: true }, undefined, { 'Set-Cookie': 'am_sess=; Path=/; Max-Age=0' }); }
  if (parts[0] === 'me') return send(res, 200, user);
  if (method !== 'GET' && user.ruolo === 'lettura') throw new HttpError(403, 'Utente in sola lettura');
  if (parts[0] === 'schema') return send(res, 200, { entities, groups: GROUPS, settings: SETTINGS });
  if (parts[0] === 'dashboard') return send(res, 200, dashboard());
  if (parts[0] === 'scadenze') return send(res, 200, scadenze(+q.giorni || 60));
  if (parts[0] === 'registro') return send(res, 200, db.prepare('SELECT * FROM registro ORDER BY id DESC LIMIT 300').all());
  if (parts[0] === 'impostazioni') {
    if (method === 'GET') return send(res, 200, allSettings());
    if (user.ruolo !== 'admin') throw new HttpError(403, 'Solo amministratori');
    const b = await readBody(req);
    for (const s of SETTINGS) if (s.name in b) db.prepare('INSERT INTO impostazioni (chiave, valore) VALUES (?,?) ON CONFLICT(chiave) DO UPDATE SET valore=excluded.valore').run(s.name, String(b[s.name] ?? ''));
    log(user, 'modificato', 'impostazioni', null);
    return send(res, 200, allSettings());
  }
  if (parts[0] === 'backup') {
    if (user.ruolo !== 'admin') throw new HttpError(403, 'Solo amministratori');
    const tmp = path.join(DATA_DIR, `backup-${Date.now()}.db`);
    db.exec(`VACUUM INTO '${tmp.replace(/'/g, "''")}'`);
    const buf = fs.readFileSync(tmp); fs.unlinkSync(tmp);
    return send(res, 200, buf, 'application/octet-stream', { 'Content-Disposition': `attachment; filename="argomaris-${today()}.db"` });
  }
  if (parts[0] === 'demo' && method === 'POST') {
    if (user.ruolo !== 'admin') throw new HttpError(403, 'Solo amministratori');
    tx(() => require('./demo')({ saveRow, db, user, generaDDT, generaFattura, generaProvvigione }));
    return send(res, 200, { ok: true });
  }
  if (parts[0] === 'upload' && method === 'POST') return send(res, 201, saveUpload(await readBody(req, 22e6)));
  if (parts[0] === 'files' && parts[1] && method === 'GET') {
    if (!FILE_RE.test(parts[1]) || !fs.existsSync(path.join(UPLOADS, parts[1]))) throw new HttpError(404, 'File non trovato');
    return send(res, 200, fs.readFileSync(path.join(UPLOADS, parts[1])), FILE_MIME[parts[1].split('.').pop()], { 'Cache-Control': 'private, max-age=86400' });
  }
  if (parts[0] === 'confronto') return send(res, 200, confronto());
  if (parts[0] === 'ai' && parts[1] === 'stato') return send(res, 200, { attivo: aiReady() });
  if (parts[0] === 'ai' && parts[1] === 'estrai-listino' && method === 'POST') { const b = await readBody(req); const out = await estraiListino(b.allegati); log(user, 'AI', 'listini', null, `lette ${out.righe.length} righe`); return send(res, 200, out); }
  if (parts[0] === 'ai' && parts[1] === 'chiedi' && method === 'POST') { const b = await readBody(req, 1e6); return send(res, 200, { risposta: await chiediAi(b.domanda, b.storia) }); }
  if (parts[0] === 'turni' && parts[1] === 'copia' && method === 'POST') { const b = await readBody(req); return send(res, 200, copiaSettimana(b.da, b.a, user)); }
  if (parts[0] === 'export' && parts[1]) {
    const ent = parts[1].replace(/\.csv$/, '');
    if (!entities[ent] || ent === 'utenti') throw new HttpError(404, 'Non trovato');
    return send(res, 200, toCsv(ent, listRows(ent, q)), 'text/csv; charset=utf-8', { 'Content-Disposition': `attachment; filename="${ent}-${today()}.csv"` });
  }

  const entity = parts[0]; const e = entities[entity];
  if (!e) throw new HttpError(404, 'Risorsa sconosciuta');
  if (e.admin && user.ruolo !== 'admin') throw new HttpError(403, 'Solo amministratori');
  const id = parts[1] ? +parts[1] : null;
  const action = parts[2];

  if (action && method === 'POST') {
    let out;
    if (entity === 'ordini' && action === 'genera-ddt') out = generaDDT(id, user);
    else if (entity === 'ordini' && action === 'genera-fattura') out = generaFattura(id, user);
    else if (entity === 'ordini' && action === 'genera-provvigione') out = generaProvvigione(id, user);
    else if (entity === 'ddt' && action === 'genera-fattura') {
      const d = getRow('ddt', id);
      if (!d.ordine_id) throw new HttpError(400, 'Il DDT non è collegato a un ordine: crea la fattura manualmente');
      out = generaFattura(d.ordine_id, user, id);
    } else if (action === 'duplica' && ['ordini', 'fatture', 'ddt'].includes(entity)) {
      const r = getRow(entity, id);
      const copy = { ...r, data: today(), stato: { ordini: 'Bozza', fatture: 'Bozza', ddt: 'Emesso' }[entity] };
      delete copy.id; delete copy.numero; delete copy.ordine_id__label;
      if (entity === 'fatture' && r.tipo !== 'Acquisto') delete copy.scadenza;
      out = saveRow(entity, null, copy, user);
    } else throw new HttpError(404, 'Azione sconosciuta');
    return send(res, 200, out);
  }
  if (entity === 'fatture' && action === 'xml') {
    const { xml, nome } = fatturaXml(id);
    if (q.download) return send(res, 200, xml, 'application/xml; charset=utf-8', { 'Content-Disposition': `attachment; filename="${nome}"` });
    return send(res, 200, xml, 'application/xml; charset=utf-8');
  }
  if (method === 'GET' && !id) return send(res, 200, listRows(entity, q));
  if (method === 'GET') return send(res, 200, getRow(entity, id));
  if (method === 'POST' && !id) return send(res, 201, saveRow(entity, null, await readBody(req), user));
  if (method === 'PUT' && id) { getRow(entity, id); return send(res, 200, saveRow(entity, id, await readBody(req), user)); }
  if (method === 'DELETE' && id) {
    if (entity === 'utenti' && id === user.id) throw new HttpError(400, 'Non puoi eliminare il tuo utente');
    deleteRow(entity, id, user); return send(res, 200, { ok: true });
  }
  throw new HttpError(405, 'Metodo non consentito');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (/^\/(app\/)?api(\/|$)/.test(url.pathname)) return await api(req, res, url);
    if (url.pathname === '/app') return send(res, 301, '', 'text/plain', { Location: '/app/' });
    if (url.pathname.startsWith('/app/')) return serveStatic(res, PUBLIC, decodeURIComponent(url.pathname.slice(5)));
    return serveStatic(res, SITE, decodeURIComponent(url.pathname));
  } catch (err) {
    const code = err.code && Number.isInteger(err.code) ? err.code : 500;
    if (code === 500) console.error(err);
    send(res, code, { error: code === 500 ? 'Errore interno: ' + err.message : err.message });
  }
});
if (require.main === module) server.listen(PORT, () => console.log(`Argo Maris: sito http://localhost:${PORT}/  ·  gestionale http://localhost:${PORT}/app/`));
module.exports = { server, db };
