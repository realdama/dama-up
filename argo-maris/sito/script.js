// Argo Maris · interazioni del sito (tabellone, rotte, canali, richiesta listino)
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // menu su telefono
  const slab = $('.slab'); const menu = $('.menu');
  menu.addEventListener('click', () => {
    const open = slab.classList.toggle('open');
    menu.setAttribute('aria-expanded', open); menu.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  });
  $$('.nav a').forEach(a => a.addEventListener('click', () => { slab.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));

  // animazioni: un solo interruttore per tabellone, rotte e nastro
  const pauseBtns = $$('.board-pause, .flow-pause');
  const map = $('.map');
  let motion = !reduce;
  const setMotion = on => {
    motion = on;
    document.documentElement.dataset.motion = on ? 'on' : 'off';
    pauseBtns.forEach(b => { b.setAttribute('aria-pressed', String(!on)); b.textContent = on ? (b.classList.contains('board-pause') ? 'Ferma' : "Ferma l'animazione") : (b.classList.contains('board-pause') ? 'Riprendi' : "Riprendi l'animazione"); });
    if (map && map.pauseAnimations) on ? map.unpauseAnimations() : map.pauseAnimations();
  };
  pauseBtns.forEach(b => b.addEventListener('click', () => setMotion(!motion)));
  setMotion(motion);

  // tabellone del box: una riga cambia ogni 3 secondi
  const items = [
    ['Gambero rosso', 'Sicilia', 'Fresco', 'HoReCa'], ['Salmone', 'Norvegia', 'Fresco', 'GDO'],
    ['Mazzancolle', 'Ecuador', 'Surgelato', 'GDO'], ['Astice', 'Canada', 'Vivo', 'HoReCa'],
    ['Scampi', 'Adriatico', 'Fresco', 'HoReCa'], ['Merluzzo', 'Islanda', 'Surgelato', 'GDO'],
    ['Polpo', 'Senegal', 'Surgelato', 'Pescherie'], ['Tonno', 'Tirreno', 'Fresco', 'HoReCa'],
    ['Cozze', 'Italia', 'Fresco', 'GDO'], ['Gamberi', 'Vietnam', 'Surgelato', 'GDO'],
  ];
  const rows = $$('#boardRows tr');
  let next = rows.length, slot = 0;
  const tick = () => {
    if (!motion || document.hidden) return;
    const row = rows[slot % rows.length]; const item = items[next % items.length];
    [...row.cells].forEach((td, i) => setTimeout(() => {
      td.classList.remove('flip'); void td.offsetWidth; td.classList.add('flip');
      setTimeout(() => { td.textContent = item[i]; }, 170);
    }, i * 90));
    slot++; next++;
  };
  let timer = null;
  const boardEl = $('.board');
  if ('IntersectionObserver' in window && boardEl) {
    new IntersectionObserver(([e]) => { clearInterval(timer); if (e.isIntersecting) timer = setInterval(tick, 3000); }).observe(boardEl);
  }

  // rotte
  const tabs = $$('.route-list [role=tab]');
  const pick = key => {
    tabs.forEach(t => { const on = t.dataset.route === key; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    $$('.map .route').forEach(g => g.classList.toggle('on', g.dataset.route === key));
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t.dataset.route));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return; e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); pick(n.dataset.route);
    });
  });
  $$('.map .route').forEach(g => g.addEventListener('click', () => pick(g.dataset.route)));
  pick('asia');

  // GDO / HoReCa
  const segs = $$('.segmented [role=tab]');
  segs.forEach((b, i) => {
    const show = () => segs.forEach(o => { const on = o === b; o.setAttribute('aria-selected', String(on)); o.tabIndex = on ? 0 : -1; $('#' + o.getAttribute('aria-controls')).hidden = !on; });
    b.addEventListener('click', show);
    b.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = segs[(i + 1) % segs.length]; n.focus(); n.click(); } });
  });

  // richiesta listino: arriva nel gestionale (Richieste dal sito)
  const form = $('#askForm'); const status = $('#askStatus');
  const err = (name, msg) => { const f = form.elements[name]; f.setAttribute('aria-invalid', msg ? 'true' : 'false'); const e = f.closest('.field').querySelector('.err'); if (e) e.textContent = msg || ''; };
  form.addEventListener('submit', async e => {
    e.preventDefault(); status.textContent = ''; status.className = 'status';
    const d = Object.fromEntries(new FormData(form));
    const bad = [];
    err('nome', d.nome.trim() ? '' : (bad.push('nome'), 'Scrivi nome e azienda.'));
    err('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()) ? '' : (bad.push('email'), "Serve un'email valida per mandarti il listino."));
    err('messaggio', d.messaggio.trim() ? '' : (bad.push('messaggio'), 'Scrivi cosa cerchi, anche solo la specie.'));
    if (bad.length) { form.elements[bad[0]].focus(); return; }
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Invio in corso…';
    try {
      const res = await fetch('/api/pubblico/richiesta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'Invio non riuscito');
      form.reset(); status.className = 'status ok'; status.textContent = 'Richiesta ricevuta: ti rispondiamo con il listino aggiornato.';
    } catch (ex) {
      status.className = 'status ko'; status.textContent = `${ex.message}. Riprova tra poco.`;
    } finally { btn.disabled = false; btn.textContent = 'Invia la richiesta'; }
  });

  $('#year').textContent = new Date().getFullYear();
})();
