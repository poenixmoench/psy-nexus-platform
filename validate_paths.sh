#!/bin/bash
PROJECT_ROOT="/root/psy-nexus-platform"

echo "🔍 Starte Pfad-Validierung für Alpha Fabian..."
echo "----------------------------------------------------"

check_dir() {
    if [ -d "$1" ]; then
        echo "✅ EXISTIERT: $1"
        # Zähle Dateien, um zu sehen ob es eine Leiche ist
        FILE_COUNT=$(find "$1" -type f | wc -l)
        echo "   📄 Dateien: $FILE_COUNT"
    else
        echo "❌ FEHLT:    $1"
    fi
}

echo "1. Prüfe Backend-Pfade aus tsconfig:"
check_dir "$PROJECT_ROOT/packages/shared/src"
check_dir "$PROJECT_ROOT/libs/shared/basis-agent/src"

echo -e "\n2. Prüfe Shared-Referenzen in der Base:"
check_dir "$PROJECT_ROOT/libs/shared/geometry/src"

echo -e "\n3. Suche nach aktiven Importen in den Agenten (Beispiel):"
grep -r "@shared" "$PROJECT_ROOT/apps/backend/src" | head -n 5 || echo "Keine @shared Importe im Backend-Source gefunden?"

echo "----------------------------------------------------"
echo "Done. Gib mir das Ergebnis, dann schweißen wir die tsconfig zusammen."
