set -e
T=/opt/agent-tools; mkdir -p $T ~/.claude/skills ~/.claude/agents
for r in Nutlope/hallmark Graphify-Labs/graphify VoltAgent/awesome-claude-code-subagents \
  Jakeschincariol/instagram-agent-skill elevenlabs/elevenlabs-mcp tashfeenahmed/freellmapi \
  usestrix/strix thedotmack/claude-mem centminmod/my-claude-code-setup Leonxlnx/taste-skill \
  microsoft/playwright-mcp VoltAgent/awesome-design-md; do
  n=${r#*/}; [ -d $T/$n ] || git clone -q --depth 1 https://github.com/$r.git $T/$n || true
done
cp -r $T/hallmark/skills/hallmark $T/taste-skill/skills/taste-skill $T/instagram-agent-skill/skills/ig-* ~/.claude/skills/ 2>/dev/null || true
cp -r $T/strix/skills/find-security-vulnerabilities-in-code ~/.claude/skills/strix-code-security 2>/dev/null || true
for a in content-marketer seo-specialist prompt-engineer; do find $T/awesome-claude-code-subagents -name "$a.md" -exec cp {} ~/.claude/agents/ \; ; done
pip install -q graphifyy || true
python3 - <<'P'
import json,os
p=os.path.expanduser('~/.claude.json'); c=json.load(open(p)) if os.path.exists(p) else {}
m=c.setdefault('mcpServers',{})
m['playwright']={"type":"stdio","command":"npx","args":["-y","@playwright/mcp@0.0.84","--headless","--isolated","--no-sandbox",
  "--executable-path","/opt/pw-browsers/chromium-1243/chrome-linux64/chrome"]}
m['elevenlabs']={"type":"stdio","command":"uvx","args":["elevenlabs-mcp==0.12.2"],"env":{"ELEVENLABS_API_KEY":"el-placeholder-injected-by-proxy"}}
json.dump(c,open(p,'w'),indent=2)
P
cat > ~/.claude/CLAUDE.md <<'M'
# Strumenti installati in ogni sessione (setup script ambiente dama-up)
- Repo clonati in /opt/agent-tools: hallmark, graphify, awesome-claude-code-subagents,
  instagram-agent-skill, elevenlabs-mcp, freellmapi, strix, claude-mem, my-claude-code-setup,
  taste-skill, playwright-mcp, awesome-design-md.
- Skill utente: hallmark, taste-skill, ig-* (13 Instagram), strix-code-security. Agenti: content-marketer, seo-specialist, prompt-engineer.
- CLI `graphify` (pip graphifyy). MCP: playwright (Chromium /opt/pw-browsers), elevenlabs (chiave = segreto di rete api.elevenlabs.io, header xi-api-key).
- Non attivi: claude-mem (worker persistente), freellmapi (chiavi di molti provider), strix completo (Docker + chiave LLM).
M
