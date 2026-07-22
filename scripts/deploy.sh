#!/bin/bash

# --- KONFIGURATION ---
PROJECT_ROOT="/root/psy-nexus-platform"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"
FRONTEND_DIR="$PROJECT_ROOT/apps/frontend"
TARGET_LINK="$BACKEND_DIR/dist/apps/backend/public"
BACKUP_DIR="$PROJECT_ROOT/apps/backup_last_stable"
LOG_FILE="/var/log/psy-nexus-deploy.log"
PORT=3001

# --- ROLLBACK FUNKTION ---
rollback() {
    echo -e "\n🚨 ROLLBACK EINGELEITET! Stelle letzten stabilen Stand wieder her..." | tee -a "$LOG_FILE"
    if [ -d "$BACKUP_DIR" ]; then
        rm -rf "$BACKEND_DIR/dist"
        cp -r "$BACKUP_DIR" "$BACKEND_DIR/dist"
        pm2 reload psy-backend --update-env
        echo "✅ Rollback abgeschlossen. System läuft wieder auf altem Stand." | tee -a "$LOG_FILE"
    else
        echo "❌ KRITISCH: Kein Backup gefunden! System-Integrität gefährdet." | tee -a "$LOG_FILE"
    fi
    exit 1
}

# Fehler-Trap
trap 'echo "Fehler in Zeile $LINENO"; exit 1' ERR

echo "----------------------------------------------------"
echo "🛡️  PSY-NEXUS IRON-RETURN DEPLOYMENT"
echo "----------------------------------------------------"

# 1. SICHERUNG
echo "💾 Erstelle Backup des aktuellen Stands..."
mkdir -p "$BACKUP_DIR"
if [ -d "$BACKEND_DIR/dist" ]; then
    # Wir löschen das alte Backup und erstellen ein frisches
    rm -rf "$BACKUP_DIR/*"
    cp -r "$BACKEND_DIR/dist/." "$BACKUP_DIR/"
fi

# 2. BUILD-PHASE
echo "📦 Baue Frontend & Backend..."
cd "$FRONTEND_DIR" && npm run build
cd "$BACKEND_DIR" && npm run build

# 3. SYMLINK
echo "🔗 Update Symlinks..."
mkdir -p $(dirname "$TARGET_LINK")
ln -sf "$FRONTEND_DIR/dist" "$TARGET_LINK"

# 4. RELOAD (Hier war der Fehler gefixt)
echo "🔄 PM2 Reload..."
pm2 reload psy-backend --update-env || pm2 start "$BACKEND_DIR/dist/apps/backend/src/main.js" --name psy-backend

# 5. HEALTH-CHECK MIT ROLLBACK-TRIGGER
echo "🩺 Verifiziere Integrität..."
sleep 3
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/ || echo "000")

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 304 ]; then
    echo "✅ Health-Check bestanden (HTTP $HTTP_STATUS)"
    echo "[$(date)] Deploy Erfolg" >> "$LOG_FILE"
else
    rollback 
fi

echo "----------------------------------------------------"
echo "✨ SYSTEM IMMUNISIERT UND AKTUALISIERT"
echo "----------------------------------------------------"
