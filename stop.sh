#!/usr/bin/env bash
# =============================================================================
# shopizer-shop-reactjs/stop.sh — React Storefront Stop Script
# =============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.reactjs.pid"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  Shopizer React Storefront — Stop                ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "── React Dev Server ────────────────────────────────────"

STOPPED=false

if [[ -f "$PID_FILE" ]]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    log "Stopping React server (PID: $PID)..."
    kill "$PID" 2>/dev/null || true
    sleep 2
    if kill -0 "$PID" 2>/dev/null; then
      log "Process still alive — sending SIGKILL..."
      kill -9 "$PID" 2>/dev/null || true
    fi
    STOPPED=true
  else
    log "PID $PID from .reactjs.pid is no longer running"
  fi
  rm -f "$PID_FILE"
fi

# Fallback: kill anything on port 3000
PORT_PIDS=$(lsof -ti:3000 2>/dev/null || true)
if [[ -n "$PORT_PIDS" ]]; then
  log "Killing processes on port 3000: $PORT_PIDS"
  echo "$PORT_PIDS" | xargs kill -9 2>/dev/null || true
  STOPPED=true
fi

$STOPPED && log "✓ React storefront stopped" || log "✓ React storefront was not running"

echo ""
log "React storefront shutdown complete."
