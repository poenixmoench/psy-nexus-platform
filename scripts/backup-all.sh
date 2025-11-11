#!/bin/bash
BACKUP_ROOT="/root/psy-nexus-backups"
MASTER_PASS="$(cat /root/.backup-passphrase)"
DATE=$(date '+%Y%m%d-%H%M%S')
DAILY_DIR="$BACKUP_ROOT/daily"
mkdir -p "$DAILY_DIR"
docker exec librechat-mongodb mongodump --out /dump
docker cp librechat-mongodb:/dump "$DAILY_DIR/mongodb-$DATE"
tar -czf "$DAILY_DIR/mongodb-backup-$DATE.tar.gz" "$DAILY_DIR/mongodb-$DATE"
rm -rf "$DAILY_DIR/mongodb-$DATE"
if [ $(date +%w) -eq 0 ]; then
  WEEKLY_DIR="$BACKUP_ROOT/weekly"
  mkdir -p "$WEEKLY_DIR"
  tar -czf "$WEEKLY_DIR/backup-$DATE.tar.gz" "$DAILY_DIR/"
  echo "$MASTER_PASS" | gpg --symmetric --cipher-algo AES256 --passphrase-fd 0 "$WEEKLY_DIR/backup-$DATE.tar.gz"
  rm "$WEEKLY_DIR/backup-$DATE.tar.gz"
fi
if [ $(date +%d) -eq 01 ]; then
  MONTHLY_DIR="$BACKUP_ROOT/monthly"
  mkdir -p "$MONTHLY_DIR"
  tar -czf "$MONTHLY_DIR/backup-$(date '+%Y-%m').tar.gz" "$DAILY_DIR/" "$WEEKLY_DIR/"
  echo "$MASTER_PASS" | gpg --symmetric --cipher-algo AES256 --passphrase-fd 0 "$MONTHLY_DIR/backup-$(date '+%Y-%m').tar.gz"
fi
find "$BACKUP_ROOT/daily" -mtime +7 -delete
find "$BACKUP_ROOT/weekly" -mtime +30 -delete
find "$BACKUP_ROOT/monthly" -mtime +365 -delete
