#!/usr/bin/env bash
set -euo pipefail

corepack enable
mkdir -p ~/.local/bin

platform="$(uname -s)-$(uname -m)"
formatjs_url=""

case "$platform" in
  Linux-x86_64)
    formatjs_url="https://github.com/formatjs/formatjs/releases/download/formatjs_cli_v1.1.0/formatjs_cli-linux-x64"
    ;;
  Darwin-arm64)
    formatjs_url="https://github.com/formatjs/formatjs/releases/download/formatjs_cli_v1.1.0/formatjs_cli-darwin-arm64"
    ;;
esac

if [[ -n "$formatjs_url" ]]; then
  curl -fsSL "$formatjs_url" -o ~/.local/bin/formatjs
  chmod +x ~/.local/bin/formatjs
fi

pnpm install --ignore-scripts
