#!/bin/bash
echo "--- Alpha-Build: Behalte Monorepo-Struktur bei ---"
if [ -d "dist/apps/backend/src" ]; then
    # Wir kopieren die Files nach oben, behalten aber den Rest (packages)
    cp -r dist/apps/backend/src/* dist/
    echo "dist-Ordner geglaettet. Shared-Logik bleibt erhalten."
else
    echo "Struktur-Check: dist/apps/backend/src nicht gefunden."
fi
exit 0
