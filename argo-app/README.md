# ARGO — assistente personale vocale (app per iPhone)

App web installabile (PWA) + server Node senza dipendenze.
- Cervello: Claude (API Anthropic). Voce e ascolto: ElevenLabs (TTS multilingual v2 + Scribe).
- Intro rock originale: `public/intro.mp3` (generata da `tools/make_intro.py`, solo numpy).
- Icone: `tools/icon.js` (Playwright).

## Variabili d'ambiente (sul server, mai nel codice)
| Nome | Cosa |
|---|---|
| `ANTHROPIC_API_KEY` | chiave API Anthropic (console.anthropic.com) |
| `ELEVENLABS_API_KEY` | chiave ElevenLabs |
| `ARGO_PIN` | codice di accesso all'app (scelto da te) |
| `ARGO_VOICE_ID` | opz., voce ElevenLabs (default "George") |
| `ARGO_MODEL` | opz., modello Claude (default claude-sonnet-5-5) |

Avvio locale: `ARGO_PIN=1234 node server.js` → http://localhost:3000
