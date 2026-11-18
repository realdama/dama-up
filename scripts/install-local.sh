#!/usr/bin/env bash
# Installa gli strumenti in Claude Code sul tuo computer (Mac/Linux), per tutti i progetti.
# Requisiti: git, node (npx), python3 + pip, uv (per uvx), claude CLI.
set -e
T="$HOME/.agent-tools"; mkdir -p "$T" "$HOME/.claude/skills" "$HOME/.claude/agents"
for r in Nutlope/hallmark Graphify-Labs/graphify VoltAgent/awesome-claude-code-subagents \
  Jakeschincariol/instagram-agent-skill elevenlabs/elevenlabs-mcp tashfeenahmed/freellmapi \
  usestrix/strix thedotmack/claude-mem centminmod/my-claude-code-setup Leonxlnx/taste-skill \
  microsoft/playwright-mcp VoltAgent/awesome-design-md; do
  n=${r#*/}; if [ -d "$T/$n" ]; then git -C "$T/$n" pull -q || true; else git clone -q --depth 1 "https://github.com/$r.git" "$T/$n"; fi
done
cp -R "$T/hallmark/skills/hallmark" "$T/taste-skill/skills/taste-skill" "$T"/instagram-agent-skill/skills/ig-* "$HOME/.claude/skills/"
rm -rf "$HOME/.claude/skills/strix-code-security"
cp -R "$T/strix/skills/find-security-vulnerabilities-in-code" "$HOME/.claude/skills/strix-code-security"
for a in content-marketer seo-specialist prompt-engineer; do find "$T/awesome-claude-code-subagents" -name "$a.md" -exec cp {} "$HOME/.claude/agents/" \; ; done
(command -v uv >/dev/null && uv tool install -q graphifyy) || pip3 install --user -q graphifyy || true
claude mcp add --scope user playwright -- npx -y @playwright/mcp@0.0.84 || true
if [ -n "$ELEVENLABS_API_KEY" ]; then
  claude mcp add --scope user elevenlabs -e ELEVENLABS_API_KEY="$ELEVENLABS_API_KEY" -- uvx elevenlabs-mcp==0.12.2 || true
else echo "ElevenLabs saltato: rilancia con ELEVENLABS_API_KEY=tuachiave bash install-local.sh"; fi
echo "Fatto. Riavvia Claude Code."
