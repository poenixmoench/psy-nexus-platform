#!/bin/bash
echo "🔧 Injecting module markers into dist..."

# Basis Agent Fix
mkdir -p dist/libs/shared/basis-agent
echo '{"name": "@shared/basis-agent", "main": "./src/index.js"}' > dist/libs/shared/basis-agent/package.json

# Geometry Fix
mkdir -p dist/libs/shared/geometry
echo '{"name": "@shared/geometry", "main": "./src/index.js"}' > dist/libs/shared/geometry/package.json

# Config Fix
mkdir -p dist/packages/shared/src/config
echo '{"name": "@shared/config", "main": "./index.js"}' > dist/packages/shared/src/config/package.json

echo "✅ Dist modules patched successfully."
