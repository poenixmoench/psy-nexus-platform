#!/bin/bash
echo "🔍 START: Monorepo Deep-Scan"
echo "=================================="
echo "Datum: $(date)"

# 1. Workspace-Struktur
echo "📁 WORKSPACE STRUKTUR"
cat pnpm-workspace.yaml 2>/dev/null || echo "❌ pnpm-workspace.yaml FEHLT"

# 2. Package-Struktur (Apps & Libs)
echo -e "\n📦 PACKAGE STRUKTUR"
find . -name "package.json" -not -path "./node_modules/*" -exec sh -c 'echo "=== $1 ==="; jq -r ".name" "$1" 2>/dev/null' _ {} \;

# 3. TypeScript & Aliase (Das Herzstück)
echo -e "\n⚙️ TS CONFIGURATION (Base Paths)"
if [ -f "tsconfig.base.json" ]; then
    cat tsconfig.base.json | grep -A 20 "paths"
else
    echo "❌ tsconfig.base.json nicht gefunden."
fi

# 4. Agenten-Check (Physische Files)
echo -e "\n🤖 AGENTEN-CHECK (Physische Präsenz)"
for agent in PLAN-AGENT FRONTEND-MEISTER DESIGN-ALCHEMIST BACKEND-ARCHITEKT QA-GURU OPTIMIERER DOKUMENTATION-AGENT ETHICS-AUDITOR; do
    find . -type f -name "*${agent}*" -not -path "./node_modules/*" | sed 's/^/  ✅ /'
done

# 5. Geister & Fragmente (Alles was wir nicht kennen)
echo -e "\n👻 POTENZIELLE FRAGMENTE (>1MB & Backups)"
find . -maxdepth 2 -type f \( -name "*.bak" -o -name "*.tmp" -o -name "*.sql" -o -size +1M \) -not -path "*/node_modules/*" -ls

echo -e "\n🔍 SCAN ABGESCHLOSSEN"
