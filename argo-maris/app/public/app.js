// Argo Maris — interfaccia del gestionale (vanilla JS, nessuna dipendenza)
'use strict';
const S = { schema: null, me: null, settings: {}, refs: {}, view: null };
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const num = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 });
const money = v => v == null || v === '' ? '' : eur.format(+v);
const fdate = v => { if (!v) return ''; const [d, t] = String(v).split(/[T ]/); const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}${t ? ' ' + t.slice(0, 5) : ''}`; };
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const mondayOf = iso => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().slice(0, 10); };
const canWrite = () => S.me && S.me.ruolo !== 'lettura';
const isAdmin = () => S.me && S.me.ruolo === 'admin';

// ------------------------------------------------------------ icone
const ICONS = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
  file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  truck: '<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  euro: '<path d="M17 6a7 7 0 1 0 0 12M4 10h10M4 14h10"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  alarm: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M5 3L2 6M19 3l3 3"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7M16 4a4 4 0 0 1 0 8M22 21c0-3-2-6-5-7"/>',
  anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M5 12H2a10 10 0 0 0 20 0h-3M8 11h8"/>',
  fish: '<path d="M2 12c3-5 9-7 14-4l5-3v14l-5-3c-5 3-11 1-14-4z"/><circle cx="14" cy="11" r="1"/>',
  route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 17V9a4 4 0 0 1 8 0v6a4 4 0 0 0 4 4M18 7v2"/>',
  van: '<path d="M2 7h11v9H2zM13 9h5l4 4v3h-9z"/><circle cx="6" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  badge: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17c1-2 2.5-3 4-3s3 1 4 3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
  print: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>', trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4"/>',
  save: '<path d="M5 3h11l5 5v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M7 3v6h9M7 21v-7h10v7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>',
};
const icon = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

// ------------------------------------------------------------ API
async function api(path, opts = {}) {
  const res = await fetch('api/' + path, { method: opts.method || 'GET', headers: opts.body ? { 'Content-Type': 'application/json' } : {}, body: opts.body ? JSON.stringify(opts.body) : undefined, credentials: 'same-origin' });
  if (res.status === 401 && path !== 'login') { showLogin(); throw new Error('Accesso richiesto'); }
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data.error || data || 'Errore');
  return data;
}
function toast(msg, err) { const t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg; $('#toasts').append(t); setTimeout(() => t.remove(), err ? 5000 : 2600); }
const guard = fn => async (...a) => { try { await fn(...a); } catch (e) { if (e.message !== 'Accesso richiesto') toast(e.message, true); } };

// ------------------------------------------------------------ etichette e stati
function labelOf(ent, r) {
  if (!r) return '';
  switch (ent) {
    case 'dipendenti': return `${r.nome || ''} ${r.cognome || ''}`.trim();
    case 'ordini': return `${r.numero || ''} · ${r.cliente_id__label || ''}`;
    case 'fatture': return `${r.tipo === 'Acquisto' ? 'Acq.' : r.tipo === 'Provvigione' ? 'Provv.' : 'FT'} ${r.numero || '—'} · ${r.cliente_id__label || r.fornitore_id__label || ''}`;
    case 'ddt': return `DDT ${r.numero || ''} · ${r.cliente_id__label || ''}`;
    case 'spedizioni': return `${r.codice || ''} · ${r.destinazione || ''}`;
    case 'prodotti': return `${r.nome}${r.pezzatura ? ' (' + r.pezzatura + ')' : ''}`;
    case 'mezzi': return `${r.targa} ${r.modello || ''}`;
    default: { const d = S.schema.entities[ent].display; return r[d] ?? r.id; }
  }
}
const BADGE = {
  ok: ['Consegnato', 'Consegnata', 'Pagata', 'Chiuso'], teal: ['Fatturato', 'Inviata SDI'], info: ['Confermato', 'Emessa', 'Emesso', 'In viaggio', 'In consegna'],
  warn: ['Bozza', 'Pianificata', 'In preparazione', 'In carico', 'Parzialmente pagata'], bad: ['Annullato', 'Annullata', 'Insoluta', 'Problema', 'Scaduta'],
};
const badge = v => { if (!v) return ''; const k = Object.keys(BADGE).find(k => BADGE[k].includes(v)); return `<span class="badge ${k ? 'b-' + k : ''}">${esc(v)}</span>`; };
const isOverdue = r => r.scadenza && r.scadenza < today() && !['Pagata', 'Annullata', 'Bozza'].includes(r.stato) && r.tipo !== 'Nota di credito';

async function loadRefs(ent, force) {
  if (S.refs[ent] && !force) return S.refs[ent];
  S.refs[ent] = await api(ent + '?limit=5000');
  return S.refs[ent];
}
const invalidate = ent => { delete S.refs[ent]; };

// ------------------------------------------------------------ login / avvio
function showLogin() { $('#shell').hidden = true; $('#print').hidden = true; $('#login').hidden = false; $('#loginForm input').focus(); }
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault(); $('#loginErr').textContent = '';
  const f = new FormData(e.target);
  try { await api('login', { method: 'POST', body: { username: f.get('username'), password: f.get('password') } }); await boot(); }
  catch (err) { $('#loginErr').textContent = err.message; }
});
$('#logout').addEventListener('click', async () => { await api('logout', { method: 'POST' }).catch(() => {}); S.refs = {}; showLogin(); });
$('#menuBtn').addEventListener('click', () => $('#side').classList.toggle('open'));

async function boot() {
  try { S.me = await api('me'); } catch { return; }
  [S.schema, S.settings] = await Promise.all([api('schema'), api('impostazioni')]);
  $('#login').hidden = true; $('#shell').hidden = false;
  $('#who').textContent = `${S.me.nome || S.me.username} · ${S.me.ruolo}`;
  buildNav(); buildTabbar(); route();
}

function buildNav() {
  const E = S.schema.entities;
  const items = {
    'Operatività': [['#/', 'Dashboard', 'home'], ['#/e/ordini', 'Ordini', 'clipboard'], ['#/e/ddt', 'DDT', 'file'], ['#/e/spedizioni', 'Spedizioni', 'truck']],
    'Amministrazione': [['#/e/fatture', 'Fatture', 'euro'], ['#/e/pagamenti', 'Incassi e pagamenti', 'wallet'], ['#/scadenzario', 'Scadenzario', 'alarm']],
    'Anagrafiche': ['clienti', 'fornitori', 'prodotti', 'vettori', 'mezzi'].map(k => ['#/e/' + k, E[k].label, E[k].icon]),
    'Personale': [['#/e/dipendenti', 'Dipendenti', 'badge'], ['#/turni', 'Turni', 'calendar']],
    'Sistema': [...(isAdmin() ? [['#/e/utenti', 'Utenti', 'key']] : []), ['#/impostazioni', 'Impostazioni', 'gear'], ['#/registro', 'Registro attività', 'list']],
  };
  $('#nav').innerHTML = Object.entries(items).map(([g, list]) => `<div class="nav-group">${g}</div>` +
    list.map(([href, l, i]) => `<a class="nav-item" href="${href}">${icon(i)}<span>${esc(l)}</span></a>`).join('')).join('') +
    `<button type="button" class="nav-item install-btn" hidden style="width:100%;background:none;border:0;text-align:left">${icon('download')}<span>Installa l'app</span></button>`;
  setTimeout(showInstall);
}
function buildTabbar() {
  const t = [['#/', 'Home', 'home'], ['#/e/ordini', 'Ordini', 'clipboard'], ['#/e/spedizioni', 'Viaggi', 'truck'], ['#/turni', 'Turni', 'calendar']];
  $('#tabbar').innerHTML = t.map(([h, l, i]) => `<a href="${h}" data-tab>${icon(i)}<span>${l}</span></a>`).join('') +
    `<button type="button" id="tabMenu">${icon('list')}<span>Menu</span></button>`;
  $('#tabMenu').addEventListener('click', () => $('#side').classList.toggle('open'));
}
function markNav() {
  const h = location.hash || '#/';
  $$('#tabbar [data-tab]').forEach(a => { const href = a.getAttribute('href'); a.classList.toggle('active', href === '#/' ? h === '#/' || h === '' : h.startsWith(href)); });
  $$('.nav-item').forEach(a => { const href = a.getAttribute('href'); a.classList.toggle('active', href === '#/' ? h === '#/' || h === '' : h.startsWith(href)); });
  $('#side').classList.remove('open');
}
function setTop(title, crumbs = '', actions = '') {
  $('#crumbs').innerHTML = `${crumbs}<h1>${esc(title)}</h1>`;
  $('#topActions').innerHTML = actions;
  document.title = `${title} · Argo Maris`;
}

// ------------------------------------------------------------ router
window.addEventListener('hashchange', () => route());
async function route() {
  if (!S.me) return;
  const h = (location.hash || '#/').slice(1);
  const [pathPart, query] = h.split('?');
  const p = pathPart.split('/').filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(query || ''));
  markNav();
  $('#print').hidden = true; $('#shell').hidden = false;
  const view = $('#view'); view.innerHTML = '<p class="empty">Caricamento…</p>';
  try {
    if (!p.length) return await viewDashboard();
    if (p[0] === 'e' && p[1] === 'turni' && !p[2]) return (location.hash = '#/turni');
    if (p[0] === 'e' && p[2] === 'nuovo') return await viewForm(p[1], null, params);
    if (p[0] === 'e' && p[2]) return await viewForm(p[1], +p[2]);
    if (p[0] === 'e') return await viewList(p[1], params);
    if (p[0] === 'turni') return await viewTurni(params.settimana);
    if (p[0] === 'scadenzario') return await viewScadenzario();
    if (p[0] === 'impostazioni') return await viewSettings();
    if (p[0] === 'registro') return await viewLog();
    if (p[0] === 'stampa') return await viewPrint(p[1], +p[2]);
    view.innerHTML = '<p class="empty">Pagina non trovata</p>';
  } catch (e) { if (e.message !== 'Accesso richiesto') view.innerHTML = `<p class="empty">${esc(e.message)}</p>`; }
}

// ------------------------------------------------------------ dashboard
async function viewDashboard() {
  const d = await api('dashboard');
  const k = d.kpi;
  setTop('Dashboard', `<span class="muted">${new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>`,
    canWrite() ? `<a class="btn primary" href="#/e/ordini/nuovo">${icon('plus')}Nuovo ordine</a>` : '');
  const v = $('#view');
  const kpi = (l, val, sub, cls = '') => `<div class="kpi ${cls}"><small>${l}</small><b>${val}</b><span>${sub}</span></div>`;
  v.innerHTML = `
    <div class="kpis">
      ${kpi('Venduto del mese', money(k.venduto_mese), `margine ${money(k.margine_mese)}`, 'dark')}
      ${kpi('Ordini aperti', k.ordini_aperti, `${k.spedizioni_attive} spedizioni attive`)}
      ${kpi('Da incassare', money(k.da_incassare), `di cui scaduto ${money(k.scaduto)}`, k.scaduto > 0 ? 'alert' : '')}
      ${kpi('Da pagare ai fornitori', money(k.da_pagare), `${k.in_turno_oggi} persone in turno oggi`)}
    </div>
    <div class="dash">
      <div class="grid">
        <section class="panel"><h2>Venduto e margine · 12 mesi</h2>${chart(d.mesi)}
          <div class="legend"><span><i style="background:#0a1a3d"></i>Venduto</span><span><i style="background:#ffd21f"></i>Margine</span></div></section>
        <section class="panel"><h2>Ordini da evadere <a href="#/e/ordini">Tutti →</a></h2>
          ${d.ordini.length ? `<table class="mini">${d.ordini.map(o => `<tr data-href="#/e/ordini/${o.id}"><td><b>${esc(o.numero)}</b><br><span class="muted">${esc(o.cliente)}</span></td><td>${o.data_consegna ? 'consegna ' + fdate(o.data_consegna) : ''}</td><td>${badge(o.stato)}</td><td class="r">${money(o.totale)}</td></tr>`).join('')}</table>` : '<p class="empty">Nessun ordine aperto</p>'}
        </section>
        <section class="panel"><h2>Spedizioni in corso <a href="#/e/spedizioni">Tutte →</a></h2>
          ${d.spedizioni.length ? `<table class="mini">${d.spedizioni.map(s => `<tr data-href="#/e/spedizioni/${s.id}"><td><b>${esc(s.codice)}</b><br><span class="muted">${esc(s.vettore || 'mezzo aziendale')}</span></td><td>${esc(s.destinazione || '')}</td><td>${fdate(s.data_partenza)}</td><td>${badge(s.stato)}</td></tr>`).join('')}</table>` : '<p class="empty">Nessuna spedizione in corso</p>'}
        </section>
      </div>
      <div class="grid">
        <section class="panel"><h2>Fatture in scadenza <a href="#/scadenzario">Scadenzario →</a></h2>
          ${d.fatture.length ? `<table class="mini">${d.fatture.map(f => `<tr data-href="#/e/fatture/${f.id}"><td><b>${esc(f.tipo === 'Acquisto' ? 'Da pagare' : 'Da incassare')}</b> ${esc(f.numero)}<br><span class="muted">${esc(f.controparte)}</span></td><td>${f.scadenza < today() ? badge('Scaduta') : fdate(f.scadenza)}</td><td class="r">${money(f.totale - (f.pagato || 0))}</td></tr>`).join('')}</table>` : '<p class="empty">Niente in scadenza nei prossimi 7 giorni</p>'}
        </section>
        <section class="panel"><h2>Migliori clienti · 12 mesi</h2>
          ${d.top.length ? d.top.map(t => `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:13px"><span>${esc(t.nome)}</span><b>${money(t.v)}</b></div><div class="bar"><i style="width:${Math.round(t.v / d.top[0].v * 100)}%"></i></div></div>`).join('') : '<p class="empty">Ancora nessun dato</p>'}
        </section>
        <section class="panel"><h2>Scadenze documenti · 60 gg</h2>
          ${d.scadenze.length ? `<table class="mini">${d.scadenze.slice(0, 8).map(s => `<tr data-href="#/e/${s.entity}/${s.id}"><td><b>${esc(s.nome)}</b><br><span class="muted">${esc(s.cosa)}</span></td><td class="r">${s.scaduto ? badge('Scaduta') : fdate(s.data)}</td></tr>`).join('')}</table>` : '<p class="empty">Nessuna scadenza imminente</p>'}
          ${!d.ordini.length && !d.top.length && isAdmin() ? '<p class="muted" style="margin-top:8px">Archivio vuoto? Puoi caricare dati di prova da <a href="#/impostazioni">Impostazioni</a>.</p>' : ''}
        </section>
      </div>
    </div>`;
  bindRowLinks(v);
}
function chart(mesi) {
  const months = []; const t = new Date(); t.setDate(1);
  for (let i = 11; i >= 0; i--) { const d = new Date(t.getFullYear(), t.getMonth() - i, 1); months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); }
  const by = Object.fromEntries(mesi.map(m => [m.mese, m]));
  const max = Math.max(1, ...mesi.map(m => m.venduto));
  const W = 720, H = 220, L = 54, B = 26, cw = (W - L) / 12;
  const y = v => H - B - (v / max) * (H - B - 12);
  const ticks = [0, .5, 1].map(f => max * f);
  const mn = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Grafico venduto e margine">
    ${ticks.map(v => `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="#e6eff2"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v >= 1000 ? Math.round(v / 1000) + 'k' : Math.round(v)}</text>`).join('')}
    ${months.map((m, i) => { const r = by[m] || { venduto: 0, margine: 0 }; const x = L + i * cw + cw * .18; const bw = cw * .32;
      return `<rect x="${x}" y="${y(r.venduto)}" width="${bw}" height="${H - B - y(r.venduto)}" rx="3" fill="#0a1a3d"><title>${m}: ${money(r.venduto)}</title></rect>
      <rect x="${x + bw + 3}" y="${y(r.margine)}" width="${bw}" height="${H - B - y(r.margine)}" rx="3" fill="#ffd21f"><title>margine ${money(r.margine)}</title></rect>
      <text x="${L + i * cw + cw / 2}" y="${H - 8}" text-anchor="middle">${mn[+m.slice(5) - 1]}</text>`; }).join('')}
  </svg>`;
}
function bindRowLinks(el) { $$('[data-href]', el).forEach(r => r.addEventListener('click', e => { if (e.target.closest('button,a,input,select')) return; location.hash = r.dataset.href; })); }

// ------------------------------------------------------------ liste
const listState = {};
async function viewList(ent, params = {}) {
  const e = S.schema.entities[ent]; if (!e) throw new Error('Sezione sconosciuta');
  const st = listState[ent] = listState[ent] || { q: '', filters: {}, sort: null, dir: 1 };
  Object.assign(st.filters, params);
  setTop(e.label, '', `<a class="btn" href="api/export/${ent}.csv" id="csvBtn">${icon('download')}CSV</a>` + (canWrite() ? `<a class="btn primary" href="#/e/${ent}/nuovo">${icon('plus')}Nuovo</a>` : ''));
  const cols = e.fields.filter(f => f.list);
  const filterFields = e.fields.filter(f => f.list && f.type === 'select').slice(0, 2);
  const dateF = e.fields.find(f => f.type === 'date' || f.type === 'datetime');
  const v = $('#view');
  v.innerHTML = `<div class="toolbar">
      <div class="search">${icon('search')}<input id="q" placeholder="Cerca in ${esc(e.label.toLowerCase())}…" value="${esc(st.q)}"></div>
      ${filterFields.map(f => `<select data-filter="${f.name}"><option value="">${esc(f.label)}: tutti</option>${f.options.filter(Boolean).map(o => `<option ${st.filters[f.name] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`).join('')}
      ${dateF ? `<input type="date" data-filter="da" value="${esc(st.filters.da || '')}" title="Dal"><input type="date" data-filter="a" value="${esc(st.filters.a || '')}" title="Al">` : ''}
      ${ent === 'fatture' ? `<label class="check" style="padding:0"><input type="checkbox" data-filter="aperte" ${st.filters.aperte === '1' ? 'checked' : ''}> Solo aperte</label>` : ''}
      ${['cliente_id', 'fornitore_id', 'ordine_id', 'fattura_id', 'dipendente_id', 'spedizione_id'].filter(k => st.filters[k]).map(k => `<button class="btn small" data-clear="${k}">${icon('x')}filtro ${esc(k.replace('_id', ''))}</button>`).join('')}
    </div>
    <div class="table-wrap"><table class="data"><thead><tr>${cols.map(f => `<th data-sort="${f.name}" class="${st.sort === f.name ? 'sorted' : ''} ${['money', 'number'].includes(f.type) ? 'num' : ''}">${esc(f.label)}${st.sort === f.name ? (st.dir > 0 ? ' ↑' : ' ↓') : ''}</th>`).join('')}</tr></thead><tbody></tbody><tfoot></tfoot></table></div>
    <p class="count-note" id="countNote"></p>`;
  let rows = [];
  const cell = (f, r) => {
    const val = r[f.name];
    if (f.type === 'ref') return esc(r[f.name + '__label'] || '');
    if (f.type === 'money') return money(val);
    if (f.type === 'number') return val == null ? '' : num.format(val);
    if (f.type === 'date') return f.expiry && val && val < addDays(today(), 30) ? `<span class="badge ${val < today() ? 'b-bad' : 'b-warn'}">${fdate(val)}</span>` : fdate(val);
    if (f.type === 'datetime') return fdate(val);
    if (f.type === 'bool') return val ? '✓' : '—';
    if (f.badge) return ent === 'fatture' && isOverdue(r) ? badge('Scaduta') : badge(val);
    if (f.italic) return `<span class="it">${esc(val)}</span>`;
    return esc(val);
  };
  const render = () => {
    let list = rows;
    if (st.sort) { const f = cols.find(c => c.name === st.sort); const key = r => f.type === 'ref' ? (r[f.name + '__label'] || '') : r[f.name] ?? '';
      list = [...rows].sort((a, b) => { const x = key(a), y = key(b); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'it', { numeric: true })) * st.dir; }); }
    $('tbody', v).innerHTML = list.length ? list.map(r => `<tr data-href="#/e/${ent}/${r.id}">${cols.map(f => `<td class="${['money', 'number'].includes(f.type) ? 'num' : ''}">${cell(f, r)}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${cols.length}" class="empty">Nessun risultato${canWrite() ? ` · <a href="#/e/${ent}/nuovo">aggiungi il primo</a>` : ''}</td></tr>`;
    const moneyCols = cols.filter(f => f.type === 'money' && !f.name.startsWith('prezzo'));
    $('tfoot', v).innerHTML = moneyCols.length && list.length ? `<tr>${cols.map((f, i) => `<td class="num">${moneyCols.includes(f) ? money(list.reduce((s, r) => s + (+r[f.name] || 0), 0)) : i === 0 ? 'Totale' : ''}</td>`).join('')}</tr>` : '';
    $('#countNote').textContent = `${list.length} ${list.length === 1 ? 'elemento' : 'elementi'}`;
    bindRowLinks(v);
  };
  const load = guard(async () => {
    const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(st.filters).filter(([, x]) => x)), ...(st.q ? { q: st.q } : {}) }).toString();
    rows = await api(`${ent}?${qs}`);
    $('#csvBtn').href = `api/export/${ent}.csv?${qs}`;
    render();
  });
  let timer;
  $('#q').addEventListener('input', ev => { st.q = ev.target.value; clearTimeout(timer); timer = setTimeout(load, 250); });
  $$('[data-filter]', v).forEach(el => el.addEventListener('change', () => { st.filters[el.dataset.filter] = el.type === 'checkbox' ? (el.checked ? '1' : '') : el.value; load(); }));
  $$('[data-clear]', v).forEach(b => b.addEventListener('click', () => { delete st.filters[b.dataset.clear]; viewList(ent); }));
  $$('th[data-sort]', v).forEach(th => th.addEventListener('click', () => { const n = th.dataset.sort; st.dir = st.sort === n ? -st.dir : 1; st.sort = n;
    $$('th', v).forEach(t => { t.classList.toggle('sorted', t.dataset.sort === n); t.textContent = cols.find(c => c.name === t.dataset.sort).label + (t.dataset.sort === n ? (st.dir > 0 ? ' ↑' : ' ↓') : ''); }); render(); }));
  await load();
}

// ------------------------------------------------------------ moduli
const LINE_TOTAL = {
  ordini: r => (+r.quantita || 0) * (+r.prezzo_vendita || 0),
  fatture: r => (+r.quantita || 0) * (+r.prezzo || 0) * (1 - (+r.sconto || 0) / 100),
};
function fieldInput(f, val, ro) {
  const id = 'f_' + f.name; const dis = ro ? 'disabled' : '';
  if (f.computed) return `<input id="${id}" readonly value="${esc(f.type === 'money' ? money(val) : val ?? '')}">`;
  switch (f.type) {
    case 'textarea': return `<textarea id="${id}" name="${f.name}" ${dis}>${esc(val)}</textarea>`;
    case 'select': { const opts = f.options.includes(val) || val == null || val === '' ? f.options : [val, ...f.options];
      return `<select id="${id}" name="${f.name}" ${dis}>${f.required ? '' : '<option value=""></option>'}${opts.filter(o => o !== '').map(o => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`; }
    case 'ref': { const list = S.refs[f.ref] || [];
      return `<select id="${id}" name="${f.name}" data-ref="${f.ref}" ${dis}><option value=""></option>${list.map(r => `<option value="${r.id}" ${+val === r.id ? 'selected' : ''}>${esc(labelOf(f.ref, r))}</option>`).join('')}</select>`; }
    case 'bool': return `<input id="${id}" type="checkbox" name="${f.name}" ${val ? 'checked' : ''} ${dis}>`;
    case 'money': return `<input id="${id}" type="number" step="0.01" name="${f.name}" value="${esc(val)}" ${dis}>`;
    case 'number': return `<input id="${id}" type="number" step="any" name="${f.name}" value="${esc(val)}" ${dis}>`;
    case 'datetime': return `<input id="${id}" type="datetime-local" name="${f.name}" value="${esc(val ? String(val).replace(' ', 'T').slice(0, 16) : '')}" ${dis}>`;
    case 'password': return `<input id="${id}" type="password" name="${f.name}" autocomplete="new-password" ${dis}>`;
    default: return `<input id="${id}" type="${{ date: 'date', time: 'time', email: 'email', tel: 'tel', color: 'color' }[f.type] || 'text'}" name="${f.name}" value="${esc(val)}" ${f.readonly ? 'readonly placeholder="automatico"' : ''} ${dis}>`;
  }
}
function fieldBlock(f, val, ro) {
  if (f.type === 'bool') return `<label class="check ${f.wide ? 'wide' : ''}" data-field="${f.name}">${fieldInput(f, val, ro)} ${esc(f.label)}</label>`;
  return `<label class="${f.type === 'textarea' ? 'full' : f.wide ? 'wide' : ''}" data-field="${f.name}" for="f_${f.name}">${esc(f.label)}${f.required ? ' *' : ''}${fieldInput(f, val, ro)}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ''}</label>`;
}
const VISIBLE = {
  fatture: { cliente_id: r => r.tipo !== 'Acquisto' && r.tipo !== 'Provvigione', fornitore_id: r => r.tipo === 'Acquisto' || r.tipo === 'Provvigione' },
  mezzi: { vettore_id: r => r.proprieta === 'Vettore' },
};

async function viewForm(ent, id, params = {}) {
  const e = S.schema.entities[ent]; if (!e) throw new Error('Sezione sconosciuta');
  const refEnts = new Set([...e.fields, ...(e.lines ? e.lines.fields : [])].filter(f => f.type === 'ref').map(f => f.ref));
  await Promise.all([...refEnts].map(r => loadRefs(r)));
  let rec;
  if (id) rec = await api(`${ent}/${id}`);
  else {
    rec = {};
    for (const f of e.fields) if (f.default !== undefined) rec[f.name] = f.default === 'today' ? today() : f.default;
    if (ent === 'spedizioni') rec.data_partenza = today() + 'T05:00';
    Object.assign(rec, params);
    if (e.lines) rec.righe = [{}];
  }
  const ro = !canWrite();
  const title = id ? `${e.singular} ${labelOf(ent, rec)}` : `Nuovo ${e.singular.toLowerCase()}`;
  const acts = [];
  if (id) {
    if (ent === 'ordini') acts.push(`<button class="btn" data-act="genera-ddt">${icon('file')}Genera DDT</button>`, `<button class="btn" data-act="genera-fattura">${icon('euro')}Fattura cliente</button>`, `<button class="btn" data-act="genera-provvigione">${icon('euro')}Fattura provvigione</button>`);
    if (ent === 'ddt') acts.push(`<button class="btn" data-act="genera-fattura">${icon('euro')}Genera fattura</button>`);
    if (ent === 'fatture') { acts.push(`<button class="btn" data-pay>${icon('wallet')}${rec.tipo === 'Acquisto' ? 'Registra pagamento' : 'Registra incasso'}</button>`);
      if (rec.tipo !== 'Acquisto') acts.push(`<a class="btn" href="api/fatture/${id}/xml?download=1" data-xml>${icon('download')}XML FatturaPA</a>`); }
    if (['ordini', 'ddt', 'fatture', 'spedizioni'].includes(ent)) acts.push(`<a class="btn" href="#/stampa/${ent}/${id}">${icon('print')}Stampa</a>`);
    if (['ordini', 'ddt', 'fatture'].includes(ent)) acts.push(`<button class="btn" data-act="duplica">${icon('copy')}Duplica</button>`);
    acts.push(`<button class="btn danger" data-del>${icon('trash')}Elimina</button>`);
  }
  if (!ro) acts.push(`<button class="btn primary" data-save>${icon('save')}Salva</button>`);
  setTop(title, `<a href="#/e/${ent}">${esc(e.label)}</a>`, ro ? acts.filter(a => !/data-(act|pay|del)/.test(a)).join('') : acts.join(''));
  const v = $('#view');
  const flow = ent === 'ordini' && id ? `<div class="flow"><span>Flusso:</span>${['Bozza', 'Confermato', 'In preparazione', 'In consegna', 'Consegnato', 'Fatturato', 'Chiuso'].map(s => `<button class="btn small ${rec.stato === s ? 'mint' : ''}" data-stato="${s}">${s}</button>`).join(icon('right'))}</div>` : '';
  v.innerHTML = `${flow}<form id="recForm" class="panel" autocomplete="off"><div class="form-grid">${e.fields.map(f => fieldBlock(f, rec[f.name], ro)).join('')}</div>
    ${e.lines ? `<div class="section-title"><h2>${esc(e.lines.label)}</h2>${ro ? '' : `<button type="button" class="btn small" id="addLine">${icon('plus')}Aggiungi riga</button>`}</div>
      <div style="overflow-x:auto"><table class="lines"><thead><tr>${e.lines.fields.map(f => `<th>${esc(f.label)}</th>`).join('')}${LINE_TOTAL[ent] ? '<th style="text-align:right">Totale</th>' : ''}<th></th></tr></thead><tbody id="lines"></tbody></table></div>
      <div class="totals" id="totals"></div>` : ''}
    </form><div class="related" id="related"></div>`;
  const form = $('#recForm');

  // visibilità condizionale
  const applyVis = () => { const vis = VISIBLE[ent]; if (!vis) return; const cur = readForm(e, form);
    for (const [k, fn] of Object.entries(vis)) { const el = form.querySelector(`[data-field="${k}"]`); if (el) el.hidden = !fn(cur); } };
  applyVis(); form.addEventListener('change', applyVis);

  // righe
  if (e.lines) {
    const tb = $('#lines');
    const lineRow = (r = {}) => `<tr>${e.lines.fields.map(f => `<td class="${['number', 'money'].includes(f.type) ? 'n' : ''}" style="${f.type === 'ref' ? 'min-width:200px' : f.name === 'descrizione' ? 'min-width:180px' : ['number', 'money'].includes(f.type) ? 'width:90px' : f.name === 'unita' ? 'width:70px' : ''}">${
      f.type === 'ref' ? `<select data-l="${f.name}" ${ro ? 'disabled' : ''}><option value=""></option>${(S.refs[f.ref] || []).filter(p => p.attivo !== 0 || +r[f.name] === p.id).map(p => `<option value="${p.id}" ${+r[f.name] === p.id ? 'selected' : ''}>${esc(labelOf(f.ref, p))}</option>`).join('')}</select>`
      : `<input data-l="${f.name}" ${['number', 'money'].includes(f.type) ? `type="number" step="${f.type === 'money' ? '0.01' : 'any'}"` : ''} value="${esc(r[f.name])}" ${ro ? 'disabled' : ''}>`}</td>`).join('')}
      ${LINE_TOTAL[ent] ? '<td class="tot"></td>' : ''}<td>${ro ? '' : `<button type="button" class="icon-btn" data-rm title="Rimuovi riga">${icon('x')}</button>`}</td></tr>`;
    tb.innerHTML = (rec.righe && rec.righe.length ? rec.righe : [{}]).map(lineRow).join('');
    const recalcTotals = () => {
      const righe = readLines(e);
      $$('#lines tr').forEach((tr, i) => { const td = $('.tot', tr); if (td) td.textContent = money(LINE_TOTAL[ent](righe[i] || {})); });
      const T = $('#totals');
      if (ent === 'ordini') { const v1 = righe.reduce((s, r) => s + LINE_TOTAL.ordini(r), 0); const a = righe.reduce((s, r) => s + (+r.quantita || 0) * (+r.prezzo_acquisto || 0), 0);
        const pct = +readForm(e, form).provvigione_pct || 0;
        T.innerHTML = `<div><small>Costo</small><b>${money(a)}</b></div><div><small>Venduto</small><b>${money(v1)}</b></div><div><small>Margine</small><b>${money(v1 - a)}</b></div><div><small>Provvigione ${num.format(pct)}%</small><b>${money(v1 * pct / 100)}</b></div>`; }
      if (ent === 'fatture') { const by = {}; righe.forEach(r => { by[+r.iva || 0] = (by[+r.iva || 0] || 0) + LINE_TOTAL.fatture(r); });
        const imp = Object.values(by).reduce((s, x) => s + x, 0); const iva = Object.entries(by).reduce((s, [al, x]) => s + Math.round(x * al) / 100, 0);
        T.innerHTML = `<div><small>Imponibile</small><b>${money(imp)}</b></div><div><small>IVA</small><b>${money(iva)}</b></div><div><small>Totale documento</small><b>${money(imp + iva)}</b></div>`; }
      if (ent === 'ddt') { const kg = righe.filter(r => (r.unita || 'kg') === 'kg').reduce((s, r) => s + (+r.quantita || 0), 0); T.innerHTML = `<div><small>Totale kg</small><b>${num.format(kg)}</b></div>`; }
    };
    tb.addEventListener('input', recalcTotals);
    form.addEventListener('input', ev => { if (ev.target.name === 'provvigione_pct') recalcTotals(); });
    tb.addEventListener('change', ev => {
      const sel = ev.target.closest('select[data-l="prodotto_id"]'); if (!sel) return;
      const p = (S.refs.prodotti || []).find(x => x.id === +sel.value); if (!p) return;
      const tr = sel.closest('tr'); const set = (k, val) => { const i = $(`[data-l="${k}"]`, tr); if (i && val != null) i.value = val; };
      set('descrizione', p.nome); set('unita', p.unita); set('iva', p.iva ?? 10);
      set('prezzo_acquisto', p.prezzo_acquisto); set('prezzo_vendita', p.prezzo_vendita); set('prezzo', ent === 'fatture' && readForm(e, form).tipo === 'Acquisto' ? p.prezzo_acquisto : p.prezzo_vendita);
      set('nome_scientifico', p.nome_scientifico); set('zona_fao', p.zona_fao); set('metodo', [p.metodo, p.attrezzo].filter(Boolean).join(' – '));
      recalcTotals();
    });
    tb.addEventListener('click', ev => { if (ev.target.closest('[data-rm]')) { ev.target.closest('tr').remove(); if (!$('#lines tr')) tb.insertAdjacentHTML('beforeend', lineRow()); recalcTotals(); } });
    $('#addLine')?.addEventListener('click', () => { tb.insertAdjacentHTML('beforeend', lineRow({ iva: ent === 'ddt' ? undefined : 10 })); recalcTotals(); });
    recalcTotals();
  }

  // automatismi sui campi
  form.addEventListener('change', ev => {
    const n = ev.target.name; const val = ev.target.value;
    if (ent === 'ordini' && n === 'fornitore_id') { const f = S.refs.fornitori.find(x => x.id === +val); if (f && f.provvigione_pct != null) form.provvigione_pct.value = f.provvigione_pct; form.dispatchEvent(new Event('input')); }
    if (ent === 'ordini' && n === 'cliente_id' && !form.luogo_consegna.value) { const c = S.refs.clienti.find(x => x.id === +val); if (c) form.luogo_consegna.value = [c.indirizzo, c.cap, c.citta, c.provincia && `(${c.provincia})`].filter(Boolean).join(' '); }
    if (ent === 'fatture' && (n === 'cliente_id' || n === 'fornitore_id') && !form.pagamento.value) { const c = S.refs[n === 'cliente_id' ? 'clienti' : 'fornitori'].find(x => x.id === +val); if (c?.pagamento) form.pagamento.value = c.pagamento; }
    if (ent === 'fatture' && (n === 'pagamento' || n === 'data')) form.scadenza.value = '';
    if (ent === 'ddt' && n === 'cliente_id' && !form.destinazione.value) { const c = S.refs.clienti.find(x => x.id === +val); if (c) form.destinazione.value = [c.indirizzo, c.cap, c.citta, c.provincia].filter(Boolean).join(' '); }
    if (ent === 'pagamenti' && n === 'fattura_id' && !form.importo.value) { const f = S.refs.fatture.find(x => x.id === +val); if (f) form.importo.value = (f.totale - (f.pagato || 0)).toFixed(2); }
  });

  const save = guard(async () => {
    const body = readForm(e, form);
    if (e.lines) body.righe = readLines(e);
    const out = id ? await api(`${ent}/${id}`, { method: 'PUT', body }) : await api(ent, { method: 'POST', body });
    invalidate(ent); toast('Salvato');
    if (!id) location.hash = `#/e/${ent}/${out.id}`; else viewForm(ent, id);
  });
  $('[data-save]')?.addEventListener('click', save);
  form.addEventListener('submit', ev => { ev.preventDefault(); save(); });
  $('[data-del]')?.addEventListener('click', guard(async () => {
    if (!confirm(`Eliminare ${e.singular.toLowerCase()} ${labelOf(ent, rec)}? L'operazione non si può annullare.`)) return;
    await api(`${ent}/${id}`, { method: 'DELETE' }); invalidate(ent); toast('Eliminato'); location.hash = `#/e/${ent}`;
  }));
  $$('[data-act]').forEach(b => b.addEventListener('click', guard(async () => {
    const act = b.dataset.act;
    const msg = { 'genera-ddt': 'Creare il DDT da questo ordine?', 'genera-fattura': 'Creare la fattura al cliente?', 'genera-provvigione': 'Creare la fattura di provvigione al fornitore?', duplica: 'Duplicare il documento?' }[act];
    if (!confirm(msg)) return;
    const out = await api(`${ent}/${id}/${act}`, { method: 'POST' });
    const target = act === 'genera-ddt' ? 'ddt' : act === 'duplica' ? ent : 'fatture';
    invalidate(target); toast('Documento creato'); location.hash = `#/e/${target}/${out.id}`;
  })));
  $$('[data-stato]').forEach(b => b.addEventListener('click', guard(async () => { await api(`ordini/${id}`, { method: 'PUT', body: { stato: b.dataset.stato } }); toast('Stato: ' + b.dataset.stato); viewForm(ent, id); })));
  $('[data-pay]')?.addEventListener('click', () => payModal(rec));
  $('[data-xml]')?.addEventListener('click', guard(async ev => { ev.preventDefault(); await api(`fatture/${id}/xml`); location.href = ev.currentTarget.href; }));

  if (id) await related(ent, rec);
}
function readForm(e, form) {
  const o = {};
  for (const f of e.fields) {
    if (f.computed || f.readonly) continue;
    const el = form.elements[f.name]; if (!el) continue;
    o[f.name] = f.type === 'bool' ? el.checked : el.value;
  }
  return o;
}
function readLines(e) {
  return $$('#lines tr').map(tr => { const o = {}; e.lines.fields.forEach(f => { const el = $(`[data-l="${f.name}"]`, tr); o[f.name] = el ? el.value : null; }); return o; });
}

function payModal(f) {
  const rest = Math.max(0, (f.totale || 0) - (f.pagato || 0));
  openModal(`<h2>${f.tipo === 'Acquisto' ? 'Pagamento' : 'Incasso'} fattura ${esc(f.numero || '')}</h2>
    <p class="muted" style="margin-bottom:14px">Totale ${money(f.totale)} · già registrato ${money(f.pagato)} · residuo <b>${money(rest)}</b></p>
    <form id="payForm" class="form-grid" style="grid-template-columns:1fr 1fr">
      <label>Data<input type="date" name="data" value="${today()}" required></label>
      <label>Importo €<input type="number" step="0.01" name="importo" value="${rest.toFixed(2)}" required></label>
      <label>Metodo<select name="metodo">${['Bonifico', 'RiBa', 'Contanti', 'Assegno', 'Carta', 'Compensazione'].map(m => `<option>${m}</option>`).join('')}</select></label>
      <label>Note<input name="note"></label>
    </form>
    <div class="modal-actions"><button class="btn" data-close>Annulla</button><button class="btn primary" id="payOk">Registra</button></div>`);
  $('#payOk').addEventListener('click', guard(async () => {
    const fd = Object.fromEntries(new FormData($('#payForm')));
    await api('pagamenti', { method: 'POST', body: { ...fd, fattura_id: f.id } });
    closeModal(); toast('Movimento registrato'); invalidate('fatture'); viewForm('fatture', f.id);
  }));
}

async function related(ent, rec) {
  const box = $('#related'); const blocks = [];
  const tbl = (title, rows, href, cols, moreHref, newHref) => `<section class="panel"><h2>${esc(title)} <span>${newHref && canWrite() ? `<a href="${newHref}">+ Nuovo</a> · ` : ''}${moreHref ? `<a href="${moreHref}">Elenco →</a>` : ''}</span></h2>
    ${rows.length ? `<table class="mini">${rows.map(r => `<tr data-href="${href(r)}">${cols.map(c => `<td class="${c[1] || ''}">${c[0](r)}</td>`).join('')}</tr>`).join('')}</table>` : '<p class="empty">Nessun elemento</p>'}</section>`;
  if (ent === 'ordini') {
    const [ddt, ft] = await Promise.all([api(`ddt?ordine_id=${rec.id}`), api(`fatture?ordine_id=${rec.id}`)]);
    blocks.push(tbl('DDT collegati', ddt, r => `#/e/ddt/${r.id}`, [[r => `<b>${esc(r.numero)}</b>`], [r => fdate(r.data)], [r => badge(r.stato)]]));
    blocks.push(tbl('Fatture collegate', ft, r => `#/e/fatture/${r.id}`, [[r => `<b>${esc(r.tipo)} ${esc(r.numero || '')}</b>`], [r => esc(r.cliente_id__label || r.fornitore_id__label || '')], [r => isOverdue(r) ? badge('Scaduta') : badge(r.stato)], [r => money(r.totale), 'r']]));
  }
  if (ent === 'fatture') {
    const pg = await api(`pagamenti?fattura_id=${rec.id}`);
    blocks.push(tbl(rec.tipo === 'Acquisto' ? 'Pagamenti' : 'Incassi', pg, r => `#/e/pagamenti/${r.id}`, [[r => fdate(r.data)], [r => esc(r.metodo || '')], [r => money(r.importo), 'r']]));
  }
  if (ent === 'ddt' && rec.ordine_id) {
    const ft = await api(`fatture?ordine_id=${rec.ordine_id}`);
    blocks.push(tbl('Fatture dell\'ordine', ft, r => `#/e/fatture/${r.id}`, [[r => `<b>${esc(r.tipo)} ${esc(r.numero || '')}</b>`], [r => badge(r.stato)], [r => money(r.totale), 'r']]));
  }
  if (ent === 'spedizioni') {
    const [ddt, liberi] = await Promise.all([api(`ddt?spedizione_id=${rec.id}`), api('ddt?stato=Emesso')]);
    const free = liberi.filter(d => !d.spedizione_id);
    blocks.push(`<section class="panel"><h2>DDT a bordo</h2>${ddt.length ? `<table class="mini">${ddt.map(r => `<tr data-href="#/e/ddt/${r.id}"><td><b>${esc(r.numero)}</b></td><td>${esc(r.cliente_id__label || '')}</td><td>${badge(r.stato)}</td><td class="r">${canWrite() ? `<button class="btn small" data-unlink="${r.id}">Scollega</button>` : ''}</td></tr>`).join('')}</table>` : '<p class="empty">Nessun DDT collegato</p>'}
      ${canWrite() && free.length ? `<div style="display:flex;gap:8px;margin-top:10px"><select id="linkDdt" style="flex:1;padding:8px;border:1px solid var(--line);border-radius:10px">${free.map(d => `<option value="${d.id}">DDT ${esc(d.numero)} · ${esc(d.cliente_id__label || '')}</option>`).join('')}</select><button class="btn" id="linkBtn">Collega</button></div>` : ''}</section>`);
  }
  if (ent === 'clienti' || ent === 'fornitori') {
    const k = ent === 'clienti' ? 'cliente_id' : 'fornitore_id';
    const [ord, ft] = await Promise.all([api(`ordini?${k}=${rec.id}&limit=8`), api(`fatture?${k}=${rec.id}&aperte=1`)]);
    blocks.push(tbl('Ultimi ordini', ord, r => `#/e/ordini/${r.id}`, [[r => `<b>${esc(r.numero)}</b>`], [r => fdate(r.data)], [r => badge(r.stato)], [r => money(r.totale), 'r']], `#/e/ordini?${k}=${rec.id}`, `#/e/ordini/nuovo?${k}=${rec.id}`));
    blocks.push(tbl('Fatture aperte', ft, r => `#/e/fatture/${r.id}`, [[r => `<b>${esc(r.tipo)} ${esc(r.numero || '')}</b>`], [r => isOverdue(r) ? badge('Scaduta') : fdate(r.scadenza)], [r => money(r.totale - (r.pagato || 0)), 'r']], `#/e/fatture?${k}=${rec.id}`));
  }
  if (ent === 'dipendenti') {
    const t = (await api(`turni?dipendente_id=${rec.id}&da=${today()}`)).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 10);
    blocks.push(tbl('Prossimi turni', t, () => '#/turni', [[r => fdate(r.data)], [r => esc(r.tipo)], [r => r.inizio ? `${r.inizio}–${r.fine}` : '']], '#/turni'));
  }
  if (ent === 'mezzi' || ent === 'vettori') {
    const k = ent === 'mezzi' ? 'mezzo_id' : 'vettore_id';
    const sp = await api(`spedizioni?${k}=${rec.id}&limit=8`);
    blocks.push(tbl('Ultime spedizioni', sp, r => `#/e/spedizioni/${r.id}`, [[r => `<b>${esc(r.codice)}</b>`], [r => fdate(r.data_partenza)], [r => esc(r.destinazione || '')], [r => badge(r.stato)]]));
  }
  box.innerHTML = blocks.join(''); bindRowLinks(box);
  $('#linkBtn')?.addEventListener('click', guard(async () => { await api(`ddt/${$('#linkDdt').value}`, { method: 'PUT', body: { spedizione_id: rec.id, vettore_id: rec.vettore_id } }); toast('DDT collegato'); viewForm('spedizioni', rec.id); }));
  $$('[data-unlink]', box).forEach(b => b.addEventListener('click', guard(async () => { await api(`ddt/${b.dataset.unlink}`, { method: 'PUT', body: { spedizione_id: '' } }); toast('DDT scollegato'); viewForm('spedizioni', rec.id); })));
}

// ------------------------------------------------------------ modale
function openModal(html) { $('#modalCard').innerHTML = html; $('#modal').hidden = false; $$('[data-close]', $('#modal')).forEach(b => b.addEventListener('click', closeModal)); $('#modalCard input,#modalCard select')?.focus(); }
function closeModal() { $('#modal').hidden = true; $('#modalCard').innerHTML = ''; }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

// ------------------------------------------------------------ turni
const shiftHours = t => { if (!t.inizio || !t.fine) return 0; const m = s => { const [h, mm] = s.split(':'); return +h * 60 + +mm; }; let d = m(t.fine) - m(t.inizio); if (d < 0) d += 1440; return Math.max(0, d - (+t.pausa_min || 0)) / 60; };
const OFF = ['Ferie', 'Permesso', 'Malattia', 'Riposo'];
async function viewTurni(settimana) {
  const start = mondayOf(settimana || today());
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const [dip, turni] = await Promise.all([loadRefs('dipendenti', true), api(`turni?da=${start}&a=${days[6]}`)]);
  const people = dip.filter(d => d.attivo !== 0);
  const prev = addDays(start, -7), next = addDays(start, 7);
  setTop('Turni', '', `<button class="btn" id="printWeek">${icon('print')}Stampa</button>${canWrite() ? `<button class="btn" id="copyWeek">${icon('copy')}Copia settimana precedente</button>` : ''}`);
  const dn = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const v = $('#view');
  v.innerHTML = `<div id="turniWrap"><div class="week-nav"><a class="btn small" href="#/turni?settimana=${prev}">${icon('left')}</a><h2>${fdate(start)} – ${fdate(days[6])}</h2><a class="btn small" href="#/turni?settimana=${next}">${icon('right')}</a><a class="btn small" href="#/turni">Oggi</a></div>
    ${people.length ? `<div class="table-wrap"><table class="shifts"><thead><tr><th>Dipendente</th>${days.map((d, i) => `<th class="${d === today() ? 'today' : ''}">${dn[i]} ${d.slice(8)}/${d.slice(5, 7)}</th>`).join('')}<th>Ore</th></tr></thead><tbody>
    ${people.map(p => { const mine = turni.filter(t => t.dipendente_id === p.id); const ore = mine.reduce((s, t) => s + (OFF.includes(t.tipo) ? 0 : shiftHours(t)), 0);
      return `<tr><td class="emp"><span class="dot" style="background:${esc(p.colore || '#3e8186')}"></span>${esc(p.nome)} ${esc(p.cognome)}<small>${esc(p.ruolo || '')}</small></td>
      ${days.map(d => `<td class="slot ${d === today() ? 'today' : ''}" data-day="${d}" data-emp="${p.id}">${mine.filter(t => t.data === d).sort((a, b) => (a.inizio || '').localeCompare(b.inizio || '')).map(t =>
        `<span class="chip ${OFF.includes(t.tipo) ? 'off' : ''}" style="background:${esc(p.colore || '#3e8186')}" data-shift="${t.id}">${t.inizio ? `${t.inizio}–${t.fine}` : esc(t.tipo)}<small>${t.inizio ? esc(t.tipo) : ''}${t.note ? ' · ' + esc(t.note) : ''}</small></span>`).join('')}</td>`).join('')}
      <td class="hours ${p.ore_settimanali && ore > p.ore_settimanali ? 'over' : ''}"><b>${num.format(ore)}</b>${p.ore_settimanali ? ` / ${p.ore_settimanali}` : ''}</td></tr>`; }).join('')}
    </tbody></table></div><p class="count-note">Clic su una cella vuota per aggiungere un turno, su un turno per modificarlo. Le ore oltre il contratto sono in rosso.</p>`
    : `<p class="empty">Nessun dipendente in forza. <a href="#/e/dipendenti/nuovo">Aggiungi un dipendente</a></p>`}</div>`;
  const byId = Object.fromEntries(turni.map(t => [t.id, t]));
  $('#turniWrap').addEventListener('click', ev => {
    if (!canWrite()) return;
    const chip = ev.target.closest('[data-shift]'); if (chip) return shiftModal(byId[chip.dataset.shift], start);
    const cell = ev.target.closest('td.slot'); if (cell) shiftModal({ dipendente_id: +cell.dataset.emp, data: cell.dataset.day }, start);
  });
  $('#copyWeek')?.addEventListener('click', guard(async () => {
    if (!confirm(`Copiare i turni della settimana dal ${fdate(prev)} in questa settimana?`)) return;
    const r = await api('turni/copia', { method: 'POST', body: { da: prev, a: start } }); toast(`${r.copiati} turni copiati`); viewTurni(start);
  }));
  $('#printWeek').addEventListener('click', () => window.print());
}
function shiftModal(t, week) {
  const e = S.schema.entities.turni; const isNew = !t.id;
  const def = { tipo: 'Lavoro', inizio: '05:00', fine: '13:00', pausa_min: 30 };
  const last = !isNew ? {} : JSON.parse(sessionStorageGet('am_lastShift') || 'null') || def;
  const rec = { ...last, ...t };
  openModal(`<h2>${isNew ? 'Nuovo turno' : 'Modifica turno'}</h2><form id="shiftForm" class="form-grid" style="grid-template-columns:1fr 1fr">${e.fields.map(f => fieldBlock(f, rec[f.name])).join('')}</form>
    <div class="modal-actions">${isNew ? '' : `<button class="btn danger" id="shDel">${icon('trash')}Elimina</button>`}<span style="flex:1"></span><button class="btn" data-close>Annulla</button><button class="btn primary" id="shOk">Salva</button></div>`);
  const f = $('#shiftForm');
  const toggle = () => { const off = OFF.includes(f.tipo.value); ['inizio', 'fine', 'pausa_min'].forEach(n => { f.querySelector(`[data-field="${n}"]`).hidden = off; }); };
  f.tipo.addEventListener('change', toggle); toggle();
  $('#shOk').addEventListener('click', guard(async () => {
    const body = readForm(e, f); if (OFF.includes(body.tipo)) { body.inizio = ''; body.fine = ''; body.pausa_min = 0; }
    await api(isNew ? 'turni' : `turni/${t.id}`, { method: isNew ? 'POST' : 'PUT', body });
    sessionStorageSet('am_lastShift', JSON.stringify({ tipo: body.tipo, inizio: body.inizio, fine: body.fine, pausa_min: body.pausa_min }));
    closeModal(); toast('Turno salvato'); viewTurni(week);
  }));
  $('#shDel')?.addEventListener('click', guard(async () => { await api(`turni/${t.id}`, { method: 'DELETE' }); closeModal(); toast('Turno eliminato'); viewTurni(week); }));
}
function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch { return null; } }
function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignorato */ } }

// ------------------------------------------------------------ scadenzario
async function viewScadenzario() {
  const [ft, docs] = await Promise.all([api('fatture?aperte=1&sort=scadenza'), api('scadenze?giorni=90')]);
  setTop('Scadenzario');
  ft.sort((a, b) => (a.scadenza || '').localeCompare(b.scadenza || ''));
  const att = ft.filter(f => f.tipo !== 'Acquisto'), pas = ft.filter(f => f.tipo === 'Acquisto');
  const sum = l => l.reduce((s, f) => s + (f.totale - (f.pagato || 0)), 0);
  const scad = l => sum(l.filter(isOverdue));
  const table = (l, who) => l.length ? `<table class="mini">${l.map(f => `<tr data-href="#/e/fatture/${f.id}"><td><b>${esc(f.numero || '—')}</b><br><span class="muted">${esc(f[who + '__label'] || '')}</span></td><td>${isOverdue(f) ? badge('Scaduta') + '<br><span class="muted">' + fdate(f.scadenza) + '</span>' : fdate(f.scadenza)}</td><td class="r">${money(f.totale - (f.pagato || 0))}</td></tr>`).join('')}</table>` : '<p class="empty">Nulla in sospeso</p>';
  $('#view').innerHTML = `<div class="kpis">
      <div class="kpi dark"><small>Da incassare</small><b>${money(sum(att))}</b><span>${att.length} fatture</span></div>
      <div class="kpi ${scad(att) ? 'alert' : ''}"><small>Crediti scaduti</small><b>${money(scad(att))}</b><span>da sollecitare</span></div>
      <div class="kpi"><small>Da pagare</small><b>${money(sum(pas))}</b><span>${pas.length} fatture fornitori</span></div>
      <div class="kpi ${scad(pas) ? 'alert' : ''}"><small>Debiti scaduti</small><b>${money(scad(pas))}</b><span>fornitori</span></div></div>
    <div class="related" style="margin-top:0">
      <section class="panel"><h2>Crediti verso clienti</h2>${table(att, 'cliente_id')}</section>
      <section class="panel"><h2>Debiti verso fornitori</h2>${table(pas, 'fornitore_id')}</section>
      <section class="panel"><h2>Scadenze documenti · 90 gg</h2>${docs.length ? `<table class="mini">${docs.map(s => `<tr data-href="#/e/${s.entity}/${s.id}"><td><b>${esc(s.nome)}</b><br><span class="muted">${esc(s.cosa)}</span></td><td class="r">${s.scaduto ? badge('Scaduta') + ' ' : ''}${fdate(s.data)}</td></tr>`).join('')}</table>` : '<p class="empty">Nessuna scadenza</p>'}</section>
    </div>`;
  // le fatture di provvigione hanno il fornitore come controparte
  $$('#view tr[data-href]').forEach(tr => { const f = ft.find(x => `#/e/fatture/${x.id}` === tr.dataset.href); const m = tr.querySelector('.muted'); if (f && m && !m.textContent) m.textContent = f.cliente_id__label || f.fornitore_id__label || ''; });
  bindRowLinks($('#view'));
}

// ------------------------------------------------------------ impostazioni e registro
async function viewSettings() {
  const s = await api('impostazioni'); S.settings = s;
  const ro = !isAdmin();
  setTop('Impostazioni', '', ro ? '' : `<button class="btn primary" id="setSave">${icon('save')}Salva</button>`);
  $('#view').innerHTML = `<form id="setForm" class="panel"><h2>Dati aziendali</h2><p class="muted" style="margin:-6px 0 14px">Compaiono su DDT, fatture e nel file XML per lo SDI.</p>
    <div class="form-grid">${S.schema.settings.map(f => `<label>${esc(f.label)}<input name="${f.name}" value="${esc(s[f.name])}" ${ro ? 'disabled' : ''}></label>`).join('')}</div></form>
    <div class="related">
      <section class="panel"><h2>Backup</h2><p class="muted">Scarica una copia completa dell'archivio (file SQLite). Conservala in un luogo sicuro.</p><p style="margin-top:12px">${isAdmin() ? `<a class="btn" href="api/backup">${icon('download')}Scarica backup</a>` : 'Solo gli amministratori.'}</p></section>
      <section class="panel"><h2>Dati di prova</h2><p class="muted">Carica clienti, fornitori, prodotti, ordini, DDT, fatture e turni di fantasia per provare il gestionale. Funziona solo con l'archivio senza ordini.</p><p style="margin-top:12px">${isAdmin() ? `<button class="btn" id="demoBtn">Carica dati demo</button>` : 'Solo gli amministratori.'}</p></section>
      <section class="panel"><h2>Fatturazione elettronica</h2><p class="muted">Il gestionale genera il file XML FatturaPA (FPR12) per vendite, provvigioni e note di credito. Va controllato e inviato allo SDI con il tuo intermediario o il servizio dell'Agenzia delle Entrate: il gestionale non trasmette da solo.</p></section>
    </div>`;
  $('#setSave')?.addEventListener('click', guard(async () => { S.settings = await api('impostazioni', { method: 'PUT', body: Object.fromEntries(new FormData($('#setForm'))) }); toast('Impostazioni salvate'); }));
  $('#demoBtn')?.addEventListener('click', guard(async () => { if (!confirm('Caricare i dati dimostrativi?')) return; await api('demo', { method: 'POST' }); S.refs = {}; toast('Dati demo caricati'); location.hash = '#/'; }));
}
async function viewLog() {
  const rows = await api('registro');
  setTop('Registro attività');
  const E = S.schema.entities;
  $('#view').innerHTML = `<div class="table-wrap"><table class="data"><thead><tr><th>Quando</th><th>Utente</th><th>Azione</th><th>Sezione</th><th>Dettaglio</th></tr></thead><tbody>
    ${rows.map(r => `<tr ${r.rif && E[r.entita] && r.azione !== 'eliminato' ? `data-href="#/e/${r.entita}/${r.rif}"` : ''}><td>${fdate(r.quando.replace(' ', 'T'))}</td><td>${esc(r.utente)}</td><td>${esc(r.azione)}</td><td>${esc(E[r.entita]?.label || r.entita)}</td><td>${esc(r.dettaglio)}</td></tr>`).join('')}</tbody></table></div>`;
  bindRowLinks($('#view'));
}

// ------------------------------------------------------------ stampe
async function viewPrint(ent, id) {
  const r = await api(`${ent}/${id}`); const s = S.settings = await api('impostazioni');
  const get = async (e2, i) => i ? api(`${e2}/${i}`).catch(() => ({})) : {};
  const addr = o => [o.indirizzo, [o.cap, o.citta, o.provincia && `(${o.provincia})`].filter(Boolean).join(' ')].filter(Boolean).map(esc).join('<br>');
  const ana = o => `<b>${esc(o.ragione_sociale || '')}</b><br>${addr(o)}${o.piva ? `<br>P. IVA ${esc(o.piva)}` : ''}${o.codice_sdi && o.codice_sdi !== '0000000' ? ` · SDI ${esc(o.codice_sdi)}` : ''}`;
  const head = (title, sub) => `<div class="doc-head"><div class="co"><img src="logo.png" width="62" height="62" alt=""><div><b>${esc(s.ragione_sociale || 'Argo Maris')}</b><p>${[s.indirizzo, [s.cap, s.citta, s.provincia && `(${s.provincia})`].filter(Boolean).join(' ')].filter(Boolean).map(esc).join(' · ')}<br>${s.piva ? 'P. IVA ' + esc(s.piva) + ' · ' : ''}${esc(s.telefono || '')} ${esc(s.email || '')}</p></div></div><div class="doc-title"><h1>${title}</h1><p>${sub}</p></div></div>`;
  let html = '';
  if (ent === 'ddt') {
    const [cli, forn, vet] = await Promise.all([get('clienti', r.cliente_id), get('fornitori', r.fornitore_id), get('vettori', r.vettore_id)]);
    html = head('Documento di trasporto', `N. <b>${esc(r.numero)}</b> del ${fdate(r.data)}<br><small>D.P.R. 472/1996</small>`) +
      `<div class="doc-boxes"><div class="doc-box"><small>Destinatario</small>${ana(cli)}</div><div class="doc-box"><small>Luogo di destinazione</small>${esc(r.destinazione || '')}</div>
       <div class="doc-box"><small>Luogo di carico / cedente</small>${forn.ragione_sociale ? ana(forn) : '—'}${forn.riconoscimento_ce ? `<br>Bollo CE ${esc(forn.riconoscimento_ce)}` : ''}</div><div class="doc-box"><small>Vettore</small>${vet.ragione_sociale ? ana(vet) : esc({ Mittente: 'Mezzo del mittente', Destinatario: 'Mezzo del destinatario' }[r.trasporto] || '')}</div></div>
       <div class="doc-grid"><div class="doc-box"><small>Causale</small>${esc(r.causale || '')}</div><div class="doc-box"><small>Trasporto a cura</small>${esc(r.trasporto || '')}</div><div class="doc-box"><small>Colli · Peso</small>${[r.colli ? r.colli + ' colli' : '', r.peso_kg ? num.format(r.peso_kg) + ' kg' : ''].filter(Boolean).join(' · ')}</div><div class="doc-box"><small>Ritiro</small>${fdate(r.ritiro)}</div></div>
       <table><thead><tr><th>Denominazione</th><th>Nome scientifico</th><th>Zona / origine</th><th>Metodo / attrezzo</th><th>Lotto</th><th class="r">Q.tà</th><th>U.M.</th></tr></thead><tbody>
       ${r.righe.map(l => `<tr><td>${esc(l.descrizione)}</td><td><i>${esc(l.nome_scientifico)}</i></td><td>${esc(l.zona_fao)}</td><td>${esc(l.metodo)}</td><td>${esc(l.lotto)}</td><td class="r">${num.format(l.quantita || 0)}</td><td>${esc(l.unita)}</td></tr>`).join('')}</tbody></table>
       <p><b>Aspetto dei beni:</b> ${esc(r.aspetto || '')}</p>${r.note ? `<p><b>Annotazioni:</b> ${esc(r.note)}</p>` : ''}
       <div class="doc-sign"><div>Firma mittente</div><div>Firma vettore</div><div>Firma destinatario</div></div>
       <p class="doc-foot">Informazioni di etichettatura dei prodotti della pesca ai sensi del Reg. (UE) n. 1379/2013. Merce da conservare alla temperatura indicata.</p>`;
  }
  if (ent === 'fatture') {
    const cp = r.tipo === 'Acquisto' || r.tipo === 'Provvigione' ? await get('fornitori', r.fornitore_id) : await get('clienti', r.cliente_id);
    const by = {}; r.righe.forEach(l => { const t = (+l.quantita || 0) * (+l.prezzo || 0) * (1 - (+l.sconto || 0) / 100); by[+l.iva || 0] = (by[+l.iva || 0] || 0) + t; });
    html = head(r.tipo === 'Nota di credito' ? 'Nota di credito' : r.tipo === 'Acquisto' ? 'Fattura fornitore' : 'Fattura', `N. <b>${esc(r.numero || '')}</b> del ${fdate(r.data)}`) +
      `<div class="doc-boxes"><div class="doc-box"><small>${r.tipo === 'Acquisto' ? 'Fornitore' : 'Spett.le'}</small>${ana(cp)}</div><div class="doc-box"><small>Riferimenti</small>${esc(r.rif_ddt || '')}${r.ordine_id__label ? `<br>Ordine ${esc(r.ordine_id__label)}` : ''}</div></div>
       <table><thead><tr><th>Descrizione</th><th class="r">Q.tà</th><th>U.M.</th><th class="r">Prezzo</th><th class="r">Sc. %</th><th class="r">IVA %</th><th class="r">Importo</th></tr></thead><tbody>
       ${r.righe.map(l => `<tr><td>${esc(l.descrizione)}</td><td class="r">${num.format(l.quantita || 0)}</td><td>${esc(l.unita)}</td><td class="r">${money(l.prezzo)}</td><td class="r">${l.sconto ? num.format(l.sconto) : ''}</td><td class="r">${num.format(l.iva || 0)}</td><td class="r">${money((+l.quantita || 0) * (+l.prezzo || 0) * (1 - (+l.sconto || 0) / 100))}</td></tr>`).join('')}</tbody></table>
       <div style="display:flex;gap:20px;align-items:flex-start"><table style="width:55%"><thead><tr><th>Aliquota</th><th class="r">Imponibile</th><th class="r">Imposta</th></tr></thead><tbody>${Object.entries(by).map(([al, imp]) => `<tr><td>${al}%</td><td class="r">${money(imp)}</td><td class="r">${money(Math.round(imp * al) / 100)}</td></tr>`).join('')}</tbody></table>
       <table class="doc-tot"><tbody><tr><td>Imponibile</td><td class="r">${money(r.imponibile)}</td></tr><tr><td>IVA</td><td class="r">${money(r.imposta)}</td></tr><tr><td><b>Totale documento</b></td><td class="r"><b>${money(r.totale)}</b></td></tr></tbody></table></div>
       <div class="doc-boxes"><div class="doc-box"><small>Pagamento</small>${esc(r.pagamento || '')}<br>Scadenza ${fdate(r.scadenza)}</div><div class="doc-box"><small>Coordinate bancarie</small>${esc(s.banca || '')}<br>${esc(s.iban || '')}</div></div>
       <p class="doc-foot">Copia di cortesia. ${r.tipo !== 'Acquisto' ? "L'originale è il file XML trasmesso tramite Sistema di Interscambio." : ''}</p>`;
  }
  if (ent === 'ordini') {
    const [cli, forn] = await Promise.all([get('clienti', r.cliente_id), get('fornitori', r.fornitore_id)]);
    html = head('Conferma d\'ordine', `N. <b>${esc(r.numero)}</b> del ${fdate(r.data)}`) +
      `<div class="doc-boxes"><div class="doc-box"><small>Cliente</small>${ana(cli)}</div><div class="doc-box"><small>Consegna</small>${fdate(r.data_consegna)}<br>${esc(r.luogo_consegna || '')}${r.rif_cliente ? `<br>Vs. rif. ${esc(r.rif_cliente)}` : ''}</div></div>
       <p style="margin:6px 0">Fornitore: <b>${esc(forn.ragione_sociale || '')}</b></p>
       <table><thead><tr><th>Prodotto</th><th>Lotto</th><th class="r">Q.tà</th><th>U.M.</th><th class="r">Prezzo</th><th class="r">IVA %</th><th class="r">Importo</th></tr></thead><tbody>
       ${r.righe.map(l => `<tr><td>${esc(l.descrizione)}</td><td>${esc(l.lotto)}</td><td class="r">${num.format(l.quantita || 0)}</td><td>${esc(l.unita)}</td><td class="r">${money(l.prezzo_vendita)}</td><td class="r">${num.format(l.iva ?? 10)}</td><td class="r">${money((+l.quantita || 0) * (+l.prezzo_vendita || 0))}</td></tr>`).join('')}</tbody></table>
       <table class="doc-tot"><tbody><tr><td><b>Totale imponibile</b></td><td class="r"><b>${money(r.totale)}</b></td></tr></tbody></table>${r.note ? `<p><b>Note:</b> ${esc(r.note)}</p>` : ''}
       <div class="doc-sign"><div></div><div></div><div>Timbro e firma per accettazione</div></div>`;
  }
  if (ent === 'spedizioni') {
    const [vet, mez, aut, ddt] = await Promise.all([get('vettori', r.vettore_id), get('mezzi', r.mezzo_id), get('dipendenti', r.autista_id), api(`ddt?spedizione_id=${id}`)]);
    html = head('Foglio di viaggio', `<b>${esc(r.codice)}</b><br>partenza ${fdate(r.data_partenza)}`) +
      `<div class="doc-grid"><div class="doc-box"><small>Origine</small>${esc(r.origine || '')}</div><div class="doc-box"><small>Destinazione</small>${esc(r.destinazione || '')}</div><div class="doc-box"><small>Arrivo previsto</small>${fdate(r.arrivo_previsto)}</div><div class="doc-box"><small>Temperatura</small>${esc(r.temperatura || '')}</div></div>
       <div class="doc-boxes"><div class="doc-box"><small>Vettore</small>${vet.ragione_sociale ? ana(vet) : 'Mezzo aziendale'}</div><div class="doc-box"><small>Mezzo · autista</small>${esc(mez.targa || '')} ${esc(mez.modello || '')}<br>${esc(aut.nome || '')} ${esc(aut.cognome || '')}${r.tracking ? `<br>Rif. ${esc(r.tracking)}` : ''}</div></div>
       <table><thead><tr><th>DDT</th><th>Destinatario</th><th>Data</th><th>Firma ricevuta</th></tr></thead><tbody>${ddt.map(d => `<tr><td>${esc(d.numero)}</td><td>${esc(d.cliente_id__label || '')}</td><td>${fdate(d.data)}</td><td style="height:34px"></td></tr>`).join('') || '<tr><td colspan="4">Nessun DDT collegato</td></tr>'}</tbody></table>
       <div class="doc-grid"><div class="doc-box"><small>Ora arrivo</small></div><div class="doc-box"><small>Temp. rilevata °C</small>${r.temp_rilevata ?? ''}</div><div class="doc-box"><small>Anomalie</small></div><div class="doc-box"><small>Firma autista</small></div></div>`;
  }
  $('#shell').hidden = true; const P = $('#print'); P.hidden = false;
  P.innerHTML = `<div class="print-bar"><a class="btn" href="#/e/${ent}/${id}">${icon('left')}Indietro</a><button class="btn primary" onclick="window.print()">${icon('print')}Stampa / PDF</button></div><div class="doc">${html}</div>`;
  document.title = `${S.schema.entities[ent].singular} ${r.numero || r.codice || ''}`;
}

// ------------------------------------------------------------ app installabile (PWA)
let installEvt = null;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
function showInstall() { if (standalone) return; $$('.install-btn').forEach(b => { b.hidden = !(installEvt || isIOS); }); }
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; showInstall(); });
window.addEventListener('appinstalled', () => { installEvt = null; $$('.install-btn').forEach(b => { b.hidden = true; }); toast('App installata'); });
document.addEventListener('click', async e => {
  if (!e.target.closest('.install-btn')) return;
  if (installEvt) { installEvt.prompt(); await installEvt.userChoice; installEvt = null; showInstall(); return; }
  openModal(`<h2>Installa Argo Maris</h2><p class="muted" style="margin-bottom:12px">Su iPhone e iPad, da <b>Safari</b>:</p>
    <ol style="padding-left:20px;line-height:2"><li>tocca il pulsante <b>Condividi</b> (quadrato con la freccia in su)</li><li>scegli <b>Aggiungi alla schermata Home</b></li><li>conferma con <b>Aggiungi</b></li></ol>
    <p class="muted" style="margin-top:12px">L'icona Argo Maris comparirà tra le tue app e si aprirà a schermo intero.</p>
    <div class="modal-actions"><button class="btn primary" data-close>Ho capito</button></div>`);
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
showInstall();

boot().then(() => { if (!S.me) showLogin(); });
