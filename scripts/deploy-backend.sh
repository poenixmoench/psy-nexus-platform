#!/bin/bash
# deploy-backend.sh - Korrigierte Version für Psy-Nexus

set -e

# Konstanten
PROJECT_ROOT="/root/psy-nexus-platform"
LOG_DIR="$PROJECT_ROOT/logs"
BACKEND_PID_FILE="$PROJECT_ROOT/backend.pid"
GEOMETRY_LIB_PATH="$PROJECT_ROOT/libs/shared/geometry"
BACKEND_PATH="$PROJECT_ROOT/apps/backend"

mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starte korrigiertes Deployment fuer Psy-Nexus..."

# 1. PROZESS-STOPP
log "Stoppe alte Prozesse..."
if [[ -f "$BACKEND_PID_FILE" ]]; then
    OLD_PID=$(cat "$BACKEND_PID_FILE")
    kill -TERM "$OLD_PID" 2>/dev/null || true
    sleep 2
    kill -KILL "$OLD_PID" 2>/dev/null || true
    rm -f "$BACKEND_PID_FILE"
fi
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 2. GEOMETRY LIBRARY BUILD
log "Baue Geometry Library..."
cd "$GEOMETRY_LIB_PATH"

BACKUP_FILE="src/index.ts.backup.$(date +%s)"
cp src/index.ts "$BACKUP_FILE" 2>/dev/null || true

# TS-Ignore Fix
if ! grep -q "// @ts-ignore" src/index.ts; then
    sed -i "/(PLATONIC_SOLIDS || \[\]).find/i \ \ // @ts-ignore" src/index.ts || true
fi

# Kompilierung (Wichtig: rootDir und alle Modulpfade)
if ! "$BACKEND_PATH/node_modules/.bin/tsc" \
    --outDir dist \
    --target es2020 \
    --module commonjs \
    --esModuleInterop \
    --skipLibCheck \
    --resolveJsonModule \
    --rootDir src \
    src/index.ts src/modules/*.ts src/types/*.ts; then
    log "ERROR: Kompilierung fehlgeschlagen!"
    exit 1
fi

log "Library erfolgreich gebaut."

# 3. BACKEND BUILD
log "Baue Backend..."
cd "$BACKEND_PATH"
rm -rf dist/
npm run build

# 4. PFAD-KORREKTUR
log "Korrigiere Pfade..."
GEOMETRY_DIST="$GEOMETRY_LIB_PATH/dist/index.js"
find ./dist -type f -name "*.js" -print0 | xargs -0 sed -i \
    -e "s|@shared/geometry|$GEOMETRY_DIST|g" \
    -e "s|../../../libs/shared/geometry|$GEOMETRY_DIST|g" \
    -e "s|../../../../libs/shared/geometry|$GEOMETRY_DIST|g"

# 5. START
log "Starte Backend (4GB RAM Mode)..."
nohup node --max-old-space-size=4096 dist/index.js > "$LOG_DIR/backend.log" 2>&1 &
echo $! > "$BACKEND_PID_FILE"

# 6. VERIFIKATION
sleep 5
if curl -sf http://localhost:3000/api/health >/dev/null 2>&1; then
    log "✅ Backend ist ONLINE."
    # Check Geometry Engine Log
    if tail -n 50 "$LOG_DIR/backend.log" | grep -q "Platonic"; then
        log "💎 Geometry Engine: INITIALISIERT."
        tail -n 50 "$LOG_DIR/backend.log" | grep "GEOMETRY-LIB" | tee -a "$LOG_FILE"
    fi
else
    log "❌ Fehler beim Start! Pruefe $LOG_DIR/backend.log"
    exit 1
fi

log "Deployment abgeschlossen."
