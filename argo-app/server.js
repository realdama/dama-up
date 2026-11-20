// ARGO — server: serve l'app (PWA) e fa da ponte sicuro verso Claude (cervello) ed ElevenLabs (voce/ascolto).
// Le chiavi stanno SOLO nelle variabili d'ambiente del server, mai nel telefono.
// Variabili: ANTHROPIC_API_KEY, ELEVENLABS_API_KEY, ARGO_PIN, (opz.) ARGO_MODEL, ARGO_VOICE_ID, PORT
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PIN = process.env.ARGO_PIN || '';
const MODEL = process.env.ARGO_MODEL || 'claude-sonnet-5-5';
const VOICE = process.env.ARGO_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb'; // "George": voce maschile britannica, calda e matura
const AKEY = process.env.ANTHROPIC_API_KEY || '';
const EKEY = process.env.ELEVENLABS_API_KEY || '';
const PUB = path.join(__dirname, 'public');

const PERSONA = `Sei ARGO, l'assistente personale con intelligenza artificiale del tuo proprietario, che chiami sempre "signore".
Carattere: maggiordomo digitale britannico trapiantato in Italia: elegante, devoto, ironia sottile e asciutta, battute pronte mai volgari, calmo anche nelle emergenze, un filo di sarcasmo affettuoso quando il signore esagera. Parli un italiano raffinato ma naturale.
Il signore gestisce il canale TikTok "Dama Reservèe" (prodotti ittici esclusivi: gambero rosso di Mazara, gambero viola, eccellenze del mare) e Abisso Broker.
Le tue risposte vengono LETTE AD ALTA VOCE: massimo 2-4 frasi brevi, niente elenchi, niente markdown, niente emoji o simboli, numeri scritti in modo pronunciabile. Usa "signore" in modo naturale (non in ogni frase). Se ti chiedono cose che non puoi fare dal telefono (chiamare, mandare messaggi, aprire app, sveglie), dillo con eleganza e suggerisci come farlo in un attimo. Non inventare fatti: se non sei sicuro, dillo.`;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml' };

// limite semplice anti-abuso: 40 richieste/minuto per IP
const hits = new Map();
function limited(ip) {
  const now = Date.now(), w = (hits.get(ip) || []).filter(t => now - t < 60000);
  w.push(now); hits.set(ip, w); return w.length > 40;
}
function pinOk(req) {
  if (!PIN) return false;
  const got = Buffer.from(String(req.headers['x-argo-pin'] || ''));
  const want = Buffer.from(PIN);
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}
function body(req, max = 8e6) {
  return new Promise((res, rej) => {
    const chunks = []; let n = 0;
    req.on('data', c => { n += c.length; if (n > max) { rej(new Error('too_big')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => res(Buffer.concat(chunks))); req.on('error', rej);
  });
}
function json(res, code, obj) { res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(obj)); }

async function chat(messages) {
  const now = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const clean = messages.filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-16).map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
  while (clean.length && clean[0].role !== 'user') clean.shift();
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': AKEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 400, system: PERSONA + `\nData e ora attuali (Italia): ${now}.`, messages: clean })
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || 'anthropic_error');
  return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join(' ').replace(/[*#_`]/g, '').trim();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  try {
    if (url.pathname.startsWith('/api/')) {
      if (req.method !== 'POST' && url.pathname !== '/api/status') return json(res, 405, { error: 'method' });
      if (url.pathname === '/api/status') return json(res, 200, { pinSet: !!PIN, brain: !!AKEY, voice: !!EKEY });
      if (limited(ip)) return json(res, 429, { error: 'rate_limited' });
      if (!pinOk(req)) return json(res, 401, { error: PIN ? 'bad_pin' : 'pin_not_configured' });

      if (url.pathname === '/api/check') return json(res, 200, { ok: true });

      if (url.pathname === '/api/chat') {
        if (!AKEY) return json(res, 503, { error: 'no_brain' });
        const { messages } = JSON.parse((await body(req, 2e5)).toString() || '{}');
        return json(res, 200, { text: await chat(messages || []) });
      }

      if (url.pathname === '/api/tts') {
        if (!EKEY) return json(res, 503, { error: 'no_voice' });
        const { text } = JSON.parse((await body(req, 2e4)).toString() || '{}');
        const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: { 'xi-api-key': EKEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
          body: JSON.stringify({ text: String(text || '').slice(0, 1200), model_id: 'eleven_multilingual_v2', language_code: 'it',
            voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 1.0 } })
        });
        if (!r.ok) return json(res, 502, { error: 'tts_failed', detail: (await r.text()).slice(0, 300) });
        res.writeHead(200, { 'content-type': 'audio/mpeg', 'cache-control': 'no-store' });
        return res.end(Buffer.from(await r.arrayBuffer()));
      }

      if (url.pathname === '/api/stt') {
        if (!EKEY) return json(res, 503, { error: 'no_voice' });
        const audio = await body(req, 8e6);
        const type = req.headers['content-type'] || 'audio/mp4';
        const ext = type.includes('webm') ? 'webm' : type.includes('wav') ? 'wav' : 'm4a';
        const fd = new FormData();
        fd.append('model_id', 'scribe_v1');
        fd.append('language_code', 'ita');
        fd.append('file', new Blob([audio], { type }), 'voce.' + ext);
        const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': EKEY }, body: fd });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return json(res, 502, { error: 'stt_failed', detail: JSON.stringify(j).slice(0, 300) });
        return json(res, 200, { text: (j.text || '').trim() });
      }
      return json(res, 404, { error: 'not_found' });
    }

    // file statici
    let p = decodeURIComponent(url.pathname);
    if (p === '/') p = '/index.html';
    const f = path.normalize(path.join(PUB, p));
    if (!f.startsWith(PUB) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
    const ext = path.extname(f);
    res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream',
      'cache-control': ext === '.html' || p === '/sw.js' ? 'no-cache' : 'public, max-age=86400' });
    fs.createReadStream(f).pipe(res);
  } catch (e) {
    console.error(e);
    json(res, 500, { error: 'server', detail: String(e.message || e).slice(0, 200) });
  }
});
server.listen(PORT, () => console.log('ARGO online su porta ' + PORT));
