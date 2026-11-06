#!/bin/sh
# Build a Chrome Web Store upload: dist/whatsapp-bookmarks-<version>.zip containing only runtime files.
set -e
cd "$(dirname "$0")/.."
VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json | head -1)
for f in background navigation media media-bridge content; do node --check "$f.js"; done
mkdir -p dist
OUT="dist/whatsapp-bookmarks-$VERSION.zip"
rm -f "$OUT"
zip -q -r "$OUT" manifest.json background.js navigation.js media.js media-bridge.js content.js content.css \
  assets/icon-16.png assets/icon-32.png assets/icon-48.png assets/icon-128.png
echo "Built $OUT ($(wc -c < "$OUT") bytes)"
unzip -l "$OUT"
