#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MODE="${1:-dev}"   # dev | build

echo "==> Installing JS deps"
npm install --legacy-peer-deps

echo "==> Building bundle → dist/"
npm run web:build

if [[ "$MODE" != "build" ]]; then
  echo "==> Starting webpack dev server at http://localhost:8080"
  npm run web
fi
