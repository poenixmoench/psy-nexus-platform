#!/bin/bash

set -euo pipefail # Beende bei Fehlern, undefinierten Variablen oder Pipe-Fehlern

PROJECT_ROOT="/root/psy-nexus-platform/apps/backend"
SHARED_GEOM_DIR="/root/psy-nexus-platform/apps/shared/geometry"

echo "=== DI-Setup Überprüfung & Geometrie-Umzug ==="

# 1. Überprüfe Abhängigkeiten
echo "1. Prüfe TypeScript-Abhängigkeiten..."
if ! command -v npx >/dev/null 2>&1 || ! (cd "$PROJECT_ROOT" && node -e "require('ts-node/register');"); then
  echo "❌ ts-node oder Abhängigkeiten fehlen in $PROJECT_ROOT"
  exit 1
fi

# 2. Erstelle Testskript
CHECK_SCRIPT="$PROJECT_ROOT/check_di_setup.ts"
cat > "$CHECK_SCRIPT" << 'EOF'
import "reflect-metadata";
import { container } from "./src/di/container";
import { OrionOrchestrator } from "./src/orchestrator/OrionOrchestrator";
import { ConcreteAgentExecutor } from "./src/executors/ConcreteAgentExecutor";
import { setupDIContainer } from "./src/di/container"; // Stelle sicher, dass dies die Funktion exportiert

setupDIContainer();

console.log("--- DI-Setup Überprüfungs-Script ---");

try {
  console.log("1. Versuche, OrionOrchestrator zu resolving...");
  const orchestrator = container.resolve(OrionOrchestrator);
  console.log("✅ Erfolg: OrionOrchestrator wurde aufgelöst.");

  console.log("2. Versuche, AgentExecutor (Token) zu resolving...");
  const agentExecutorByToken = container.resolve<ConcreteAgentExecutor>('AgentExecutor');
  console.log("✅ Erfolg: 'AgentExecutor' Token wurde aufgelöst zu ConcreteAgentExecutor.");

  console.log("3. Versuche, ConcreteAgentExecutor direkt zu resolving...");
  const concreteExecutor = container.resolve(ConcreteAgentExecutor);
  console.log("✅ Erfolg: ConcreteAgentExecutor wurde direkt aufgelöst.");

  console.log("\n🎉 DI-Setup ist korrekt konfiguriert und funktioniert.");
} catch (error) {
  console.error("\n❌ Fehler im DI-Setup:");
  console.error((error as Error).message);
  process.exit(1);
}
EOF

# 3. Führe Testskript aus
echo "2. Führe DI-Überprüfungs-Script aus..."
if (cd "$PROJECT_ROOT" && npx ts-node check_di_setup.ts); then
  echo "✅ DI-Setup-Test erfolgreich."
else
  echo "❌ DI-Setup-Test fehlgeschlagen. Breche ab."
  rm -f "$CHECK_SCRIPT" # Bereinige das temporäre Skript
  exit 1
fi

# 4. Bereinige Testskript
rm -f "$CHECK_SCRIPT"

# 5. Umzug
echo "3. Starte Umzug der Geometrie-Dateien..."
mkdir -p "$SHARED_GEOM_DIR"

# Prüfe, ob die Quelldateien existieren
for dir_file in "src/config/knowledge/geometry/modules" "src/config/knowledge/geometry/geometry.engine.ts" "src/config/knowledge/geometry/types.ts"; do
  if [[ ! -e "$PROJECT_ROOT/$dir_file" ]]; then
    echo "❌ Quelldatei/Ordner existiert nicht: $PROJECT_ROOT/$dir_file"
    exit 1
  fi
done

# Verschiebe Dateien
mv "$PROJECT_ROOT/src/config/knowledge/geometry/modules" "$SHARED_GEOM_DIR/"
mv "$PROJECT_ROOT/src/config/knowledge/geometry/geometry.engine.ts" "$SHARED_GEOM_DIR/"
mv "$PROJECT_ROOT/src/config/knowledge/geometry/types.ts" "$SHARED_GEOM_DIR/"

echo "✅ Geometrie-Dateien verschoben."

# 6. Pfade anpassen
echo "4. Passe Import-Pfade an..."
# Kombiniere sed-Befehle für geometry.engine.ts
sed -i.bak \
    -e 's|from '\''../types'\''|from '\''./types'\''|g' \
    -e 's|from '\''./geometry/types'\''|from '\''../types'\''|g' \
    -e 's|from '\''./geometry/modules/platonic'\''|from '\''./modules/platonic'\''|g' \
    -e 's|from '\''./geometry/modules/sacred'\''|from '\''./modules/sacred'\''|g' \
    -e 's|from '\''./geometry/modules/complex'\''|from '\''./modules/complex'\''|g' \
    "$SHARED_GEOM_DIR/geometry.engine.ts"

# Optional: Lösche Backup-Datei von sed
rm -f "$SHARED_GEOM_DIR/geometry.engine.ts.bak"

echo "✅ Import-Pfade aktualisiert."

# 7. Neubauen und Neustarten
echo "5. Starte Neubau und Neustart..."
if (cd "$PROJECT_ROOT" && npm run build); then
  echo "✅ Build erfolgreich."
else
  echo "❌ Build fehlgeschlagen."
  exit 1
fi

if pm2 restart psy-backend-core --update-env; then
  echo "✅ Backend neu gestartet."
else
  echo "❌ Backend-Neustart fehlgeschlagen."
  exit 1
fi

echo "🎉 Umzug abgeschlossen und System neu gestartet."
