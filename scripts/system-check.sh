#!/bin/bash
# system-check.sh - Taeglicher Gesundheitscheck & Wartung

BACKEND_PID_FILE="/root/psy-nexus-platform/backend.pid"
LOG_DIR="/root/psy-nexus-platform/logs"
THRESHOLD=85

echo "[$(date)] Starte System-Check..."

# 1. Prozess-Ueberwachung
if [ -f "$BACKEND_PID_FILE" ]; then
    PID=$(cat "$BACKEND_PID_FILE")
    if ! kill -0 $PID 2>/dev/null; then
        echo "ALARM: Backend-Prozess $PID laeuft nicht! Neustart..."
        /root/psy-nexus-platform/scripts/deploy-backend.sh
    else
        echo "Backend laeuft stabil (PID: $PID)"
    fi
else
    echo "WARN: PID-Datei fehlt. Starte Backend neu..."
    /root/psy-nexus-platform/scripts/deploy-backend.sh
fi

# 2. Log-Rotation (aelter als 7 Tage)
find "$LOG_DIR" -name "*.log" -mtime +7 -delete
echo "Logs rotiert (aelter als 7 Tage entfernt)"

# 3. Speicherplatz-Ueberwachung
USAGE=$(df / | grep / | awk '{ print $5 }' | sed 's/%//')
if [ "$USAGE" -gt "$THRESHOLD" ]; then
    echo "KRITISCH: Festplattenbelegung bei $USAGE%!"
fi

# 4. Temp-Verzeichnis bereinigen
rm -rf /tmp/psy-nexus-* 2>/dev/null || true

echo "System-Check abgeschlossen."
