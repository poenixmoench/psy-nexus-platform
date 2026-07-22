# Psy-Nexus Platform - Backend Deployment

## Architektur-Übersicht
- **Shared Library**: \`libs/shared/geometry\` mit absoluten Pfad-Imports
- **Monorepo-Struktur**: Apps in \`apps/backend\`, Bibliotheken in \`libs/\`
- **Geometrie-Engine**: Integriert als interne Engine, keine direkte API

## Deployment & Wartung
### Primäres Deploy-Script
\`\`\`bash
/root/psy-nexus-platform/scripts/deploy-backend.sh
\`\`\`

### System-Checks (via Cron)
- **Zeitplan**: Täglich um 02:00 Uhr
- **Skript**: \`/root/psy-nexus-platform/scripts/system-check.sh\`
- **Überwachung**: Backend-Status, Log-Rotation, Festplattenplatz

## Monitoring
### Log-Dateien
- **Backend-Log**: \`/root/psy-nexus-platform/logs/backend.log\`
- **Deploy-Logs**: \`/root/psy-nexus-platform/logs/deploy-YYYYMMDD.log\`
- **PID-Datei**: \`/root/psy-nexus-platform/backend.pid\`

### Status-Indikatoren
- **Geometrie-Engine**: \`"Platonic: 2 | Sacred: 3"\` im Backend-Log
- **Service-Status**: \`curl http://localhost:3000/api/health\`

## Troubleshooting
### Häufige Probleme
1. **Undefined Geometrien**: Prüfe \`Object.keys()\` in \`index.ts\`
2. **Build-Fehler**: Validiere TypeScript in \`libs/shared/geometry/src/\`
3. **Port-Konflikte**: \`lsof -i:3000\` zur Prozessanalyse

### Manuelle Reparatur
Falls das System hängt:
\`\`\`bash
# Prozess stoppen
pkill -f "node.*backend" || kill -9 $(cat /root/psy-nexus-platform/backend.pid)

# Neustart
/root/psy-nexus-platform/scripts/deploy-backend.sh
\`\`\`

## Geplante Erweiterungen
- **API-Endpunkte** für Geometrie-Daten (geplant)
- **Cache-Optimierung** für komplexe Berechnungen
- **Metrik-Export** für Prometheus/Monitoring
