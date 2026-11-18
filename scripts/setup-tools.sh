#!/usr/bin/env bash
# Riscarica gli strumenti esterni (container cloud effimero). Uso: bash scripts/setup-tools.sh
set -e
D=${TOOLS_DIR:-/home/user/tools}; mkdir -p "$D"; cd "$D"
for r in Nutlope/hallmark Graphify-Labs/graphify VoltAgent/awesome-claude-code-subagents \
  Jakeschincariol/instagram-agent-skill elevenlabs/elevenlabs-mcp tashfeenahmed/freellmapi \
  usestrix/strix thedotmack/claude-mem centminmod/my-claude-code-setup Leonxlnx/taste-skill \
  microsoft/playwright-mcp VoltAgent/awesome-design-md; do
  n=${r#*/}; [ -d "$n" ] || git clone -q --depth 1 "https://github.com/$r.git" "$n"
done
pip install -q graphifyy
