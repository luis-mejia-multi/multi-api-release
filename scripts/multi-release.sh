#!/usr/bin/env bash
# multi-release.sh — Global wrapper for multi-api-release CLI
#
# Usage:
#   multi-release [command] [options]   # run CLI normally
#   multi-release --update              # pull latest code and rebuild
#
# Setup (one-time, run as root or with sudo):
#   ln -sf /path/to/multi-api-release/scripts/multi-release.sh /usr/local/bin/multi-release
#   chmod +x /path/to/multi-api-release/scripts/multi-release.sh

set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve the real path of this script (follows symlinks)
# ---------------------------------------------------------------------------
_resolve_dir() {
  local source="${BASH_SOURCE[0]}"
  while [[ -L "${source}" ]]; do
    local dir
    dir="$(cd -P "$(dirname "${source}")" && pwd)"
    source="$(readlink "${source}")"
    [[ "${source}" != /* ]] && source="${dir}/${source}"
  done
  cd -P "$(dirname "${source}")" && pwd
}

SCRIPT_DIR="$(_resolve_dir)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# ---------------------------------------------------------------------------
# Dependency checks
# ---------------------------------------------------------------------------
_require() {
  if ! command -v "$1" &>/dev/null; then
    echo "[multi-release] ERROR: '$1' not found in PATH. Please install it first." >&2
    exit 1
  fi
}

_require node
_require pnpm

# ---------------------------------------------------------------------------
# --update: pull + rebuild
# ---------------------------------------------------------------------------
if [[ "${1:-}" == "--update" ]]; then
  echo "[multi-release] Pulling latest changes..."
  git -C "${REPO_DIR}" pull --ff-only
  echo "[multi-release] Rebuilding CLI..."
  pnpm --dir "${REPO_DIR}" build
  echo "[multi-release] Done. Run 'multi-release --help' to verify."
  exit 0
fi

# ---------------------------------------------------------------------------
# Check that dist/main.js exists (built artefact)
# ---------------------------------------------------------------------------
ENTRY="${REPO_DIR}/dist/main.js"
if [[ ! -f "${ENTRY}" ]]; then
  echo "[multi-release] ERROR: dist/main.js not found. Run 'multi-release --update' or 'pnpm build' inside ${REPO_DIR}." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Load .env if present (non-interactive server sessions may lack env vars)
# ---------------------------------------------------------------------------
ENV_FILE="${REPO_DIR}/.env"
if [[ -f "${ENV_FILE}" ]]; then
  # Export only lines that are KEY=VALUE (skip comments and blanks)
  set -o allexport
  # shellcheck source=/dev/null
  source "${ENV_FILE}"
  set +o allexport
fi

# ---------------------------------------------------------------------------
# Execute the CLI, forwarding all arguments
# ---------------------------------------------------------------------------
exec node "${ENTRY}" "$@"
