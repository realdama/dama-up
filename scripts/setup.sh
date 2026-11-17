#!/usr/bin/env bash
# Installa lo studio Argo Maris in un container nuovo
set -e
cd "$(dirname "$0")/.."
pip install -q yt-dlp edge-tts faster-whisper headroom-ai
npm i -g hyperframes@0.9.63
(cd studio && npm ci)
[ -d tools/OpenMontage ] || git clone --depth 1 https://github.com/calesthio/OpenMontage tools/OpenMontage
pip install -q -r tools/OpenMontage/requirements.txt
(cd tools/OpenMontage/remotion-composer && npm ci)
python3 -c "from faster_whisper import WhisperModel; WhisperModel('large-v3-turbo', device='cpu', compute_type='int8')"
echo "Studio Argo Maris pronto."
# HyperFrames: GSAP e font in locale (la CDN è bloccata)
(cd hf && npm i -s gsap@3.15.0 @fontsource/montserrat && [ -d test ] || HYPERFRAMES_SKIP_SKILLS=1 hyperframes init test --example blank --non-interactive --resolution landscape)
cp hf/node_modules/gsap/dist/gsap.min.js hf/test/ 2>/dev/null || true
sed -i 's#https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js#gsap.min.js#' hf/test/index.html 2>/dev/null || true
