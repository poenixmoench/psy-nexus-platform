#!/bin/bash
# NEXUS GUARDIAN v2.0 - Multi-DB Backup Engine

# KONFIGURATION
BACKUP_ROOT="/mnt/HC_Volume_103847079/psy-nexus-backups"
PASSPHRASE_FILE="/root/.backup-passphrase"
DATE=$(date '+%Y%m%d-%H%M%S')
TEMP_DIR="/tmp/nexus_backup_$DATE"
DAILY_DIR="$BACKUP_ROOT/daily"
LOG_FILE="$BACKUP_ROOT/logs/backup_$DATE.log"

exec > >(tee -a "$LOG_FILE") 2>&1

echo "--- 🚀 START BACKUP: $DATE ---"

# Sicherheits-Checks
if [ ! -f "$PASSPHRASE_FILE" ]; then
    echo "❌ FEHLER: Passphrase-Datei fehlt!"
    exit 1
fi
MASTER_PASS=$(cat "$PASSPHRASE_FILE")
mkdir -p "$TEMP_DIR"

# A: MONGODB (LibreChat)
echo "🍃 Sichere MongoDB..."
docker exec librechat-mongodb mongodump --out /dump > /dev/null
docker cp librechat-mongodb:/dump "$TEMP_DIR/mongodb"
docker exec librechat-mongodb rm -rf /dump
echo "✅ MongoDB Dump extrahiert."

# B: POSTGRESQL (Nexus Core)
echo "🐘 Sichere PostgreSQL..."
# Wir holen die URL aus der Backend-Env
if [ -f "/root/psy-nexus-platform/apps/backend/.env" ]; then
    DB_URL=$(grep -E "^DATABASE_URL=" /root/psy-nexus-platform/apps/backend/.env | cut -d '=' -f2- | tr -d '"')
    PGPASSWORD=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    PGPASSWORD="$PGPASSWORD" pg_dump "$DB_URL" > "$TEMP_DIR/nexus_postgres.sql"
    echo "✅ Postgres Dump abgeschlossen."
else
    echo "⚠️ WARNUNG: Backend .env nicht gefunden, überspringe Postgres."
fi

# C: VERSCHLÜSSELUNG & ARCHIVIERUNG
echo "🔐 Komprimiere und verschlüssele..."
cd "$TEMP_DIR"
tar -czf "../snapshot-$DATE.tar.gz" .
cd ..
echo "$MASTER_PASS" | gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase-fd 0 --output "$DAILY_DIR/snapshot-$DATE.gpg" "snapshot-$DATE.tar.gz"

# D: REINIGUNG
rm -rf "$TEMP_DIR"
rm "snapshot-$DATE.tar.gz"

# E: ROTATION (7 Tage)
echo "🧹 Bereinige alte Backups (Laufzeit: 7 Tage)..."
find "$DAILY_DIR" -name "snapshot-*.gpg" -mtime +7 -delete

echo "--- ✅ BACKUP ERFOLGREICH: $DAILY_DIR/snapshot-$DATE.gpg ---"
