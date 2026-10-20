#!/usr/bin/env bash
# A throwaway opentide detection repo for capturing REAL output for slides.
# Every terminal window, JSON envelope and file tree on a slide should come
# from a run like this, against the version the deck names.
#
#   pnpm lab                       # opentide 0.16.0 → .lab/soc
#   OPENTIDE_VERSION=0.15.0 pnpm lab   # any other release
#
# Then: source .lab/venv/bin/activate && cd .lab/soc && opentide …
set -euo pipefail

VERSION="${OPENTIDE_VERSION:-0.16.0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)/.lab"
REPO="$ROOT/soc"
export NO_COLOR=1 COLUMNS=110

mkdir -p "$ROOT"
if command -v uv >/dev/null 2>&1; then
  [ -d "$ROOT/venv" ] || uv venv -q "$ROOT/venv"
  VIRTUAL_ENV="$ROOT/venv" uv pip install -q "opentide==$VERSION"
else
  [ -d "$ROOT/venv" ] || python3 -m venv "$ROOT/venv"
  "$ROOT/venv/bin/pip" install -q "opentide==$VERSION"
fi
# shellcheck disable=SC1091
source "$ROOT/venv/bin/activate"

rm -rf "$REPO" && mkdir -p "$REPO" && cd "$REPO"
git init -q -b main
opentide setup --yes --name "SOC Detections" --org "Example Corp" --platform sentinel --ci github
opentide setup mcp --claude-code --yes
opentide setup skills --yes --claude-code --name "SOC Detections" --org "Example Corp"
opentide setup hooks --yes
opentide generate >/dev/null 2>&1
opentide validate --strict

echo
echo "opentide $VERSION lab ready: $REPO"
echo "  source .lab/venv/bin/activate && cd .lab/soc"
