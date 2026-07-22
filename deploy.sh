#!/bin/bash
# =================================================================
# NEXUS SENTINEL 7.4.1 - PATCHED
# =================================================================

ROOT_DIR="/root/psy-nexus-platform"
BACKEND_DIR="$ROOT_DIR/apps/backend"
SHARED_DIR="$ROOT_DIR/packages/shared"
PRISMA_SCHEMA="$BACKEND_DIR/prisma/schema.prisma"
DIST_PRISMA_DIR="$BACKEND_DIR/dist/apps/backend/prisma/generated/prisma"

echo "🚀 Starte Sentinel 7.4.1 Versiegelung..."

# 1. PRISMA AUTO-REPAIR & INTEGRITÄT
echo "🔍 Prüfe Datenbank-Integrität..."
if [ -f "$DIST_PRISMA_DIR/schema.prisma" ]; then
    MD5_ROOT=$(md5sum "$PRISMA_SCHEMA" | awk '{ print $1 }')
    MD5_DIST=$(md5sum "$DIST_PRISMA_DIR/schema.prisma" | awk '{ print $1 }')

    if [ "$MD5_ROOT" != "$MD5_DIST" ]; then
        echo "⚠️  Diskrepanz erkannt. Erneuere Prisma-Client..."
        cd "$BACKEND_DIR" && npx prisma generate || { echo "❌ Prisma Generate fehlgeschlagen!"; exit 1; }
    else
        echo "✅ Integrität bestätigt."
    fi
else
    echo "ℹ️  Initialer Lauf: Generiere Prisma-Client..."
    cd "$BACKEND_DIR" && npx prisma generate || { echo "❌ Initialer Prisma-Build fehlgeschlagen!"; exit 1; }
fi

# 2. BUILD-FLOW
echo "📦 Baue Shared-Package..."
cd "$SHARED_DIR" && npx tsc || { echo "❌ Shared Build Fehler!"; exit 1; }

echo "📦 Baue Backend..."
# Zombie-Modul-Prophylaxe
echo "🔍 Prüfe Agent-Datei-Integritt..."
for agent in OrionAgent PlanAgent DesignAlchemistAgent FrontendMeisterAgent BackendArchitektAgent QAGuruAgent OptimiererAgent DokumentationAgent; do
  if [ ! -f "/root/psy-nexus-platform/apps/backend/src/agents/${agent}.ts" ]; then
    echo "❌ KRITISCH: Agent ${agent}.ts fehlt!"
    exit 1
  fi
done
echo "✅ Alle 8 Agenten-Dateien vorhanden."
cd "$BACKEND_DIR" && rm -rf dist && npx tsc -p tsconfig.json || { echo "❌ Backend Build Fehler!"; exit 1; }

# 3. BINÄR-MIGRATION
echo "🚚 Versiegle Prisma-Binaries..."
mkdir -p "$DIST_PRISMA_DIR"
cp -r "$BACKEND_DIR/prisma/generated/prisma/"* "$DIST_PRISMA_DIR/"
cp "$PRISMA_SCHEMA" "$DIST_PRISMA_DIR/schema.prisma"

# 4. KONTROLLIERTER PHOENIX-START
echo "🔥 Starte Phoenix..."
pm2 flush
pm2 delete psy-backend 2>/dev/null
pm2 start "$BACKEND_DIR/dist/apps/backend/src/main.js" --name psy-backend --exp-backoff-restart-delay 100

# 5. STABILITÄTS-CHECK
echo "⏳ Warte auf Initialisierung - 5s Stabilitäts-Test läuft..."
sleep 5

if pm2 show psy-backend | grep -q "online"; then
    echo "================================================================"
    echo "✅ SENTINEL 7.4.1: SYSTEM STABIL UND VERSIEGELT"
    echo "================================================================"
else
    echo "❌ KRITISCH: Phoenix instabil nach Start!"
    exit 1
fi

pm2 list
