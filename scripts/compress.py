#!/usr/bin/env python3
"""headroom: comprime trascrizioni Whisper / JSON lunghi prima dell'analisi (SmartCrusher).
Uso: python3 scripts/compress.py <file.words.json> [out.txt]"""
import json, sys
from headroom import compress
src = sys.argv[1]
d = json.load(open(src))
payload = json.dumps(d.get("words", d), ensure_ascii=False)
msgs = [{"role": "user", "content": "q"},
        {"role": "assistant", "content": [{"type": "tool_use", "id": "t1", "name": "whisper_transcribe", "input": {}}]},
        {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "t1", "content": payload}]},
        {"role": "assistant", "content": "ok"}, {"role": "user", "content": "next"}]
r = compress(msgs, model="claude-sonnet-4-5-20250929")
out = r.messages[2]["content"][0]["content"]
out = out if isinstance(out, str) else json.dumps(out, ensure_ascii=False)
open(sys.argv[2] if len(sys.argv) > 2 else src + ".hr.txt", "w").write(out)
print(f"headroom: {r.tokens_before} -> {r.tokens_after} token ({', '.join(r.transforms_applied)})")
