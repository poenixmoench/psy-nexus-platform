#!/bin/bash

FILE="/root/psy-nexus-platform/apps/backend/src/services/AIService.ts"

echo "=== 1. PATCHe AIService Payload ==="
cp "$FILE" "$FILE.bak.$(date +%s)"

# Ersetze die fehleranfllige messages-Generierung in askAI
sed -i 's/messages: \[\{ role: '"'"'system'"'"', content: config.systemPrompt \}, \{ role: '"'"'user'"'"', content: prompt \}\],/messages: config.systemPrompt ? [\{ role: '"'"'system'"'"', content: config.systemPrompt \}, \{ role: '"'"'user'"'"', content: prompt \}] : [\{ role: '"'"'user'"'"', content: prompt \}],/g' "$FILE"

# Ersetze die fehleranfällige options-Generierung in askAI (nur Werte mitschicken, die definiert sind)
sed -i 's/options: { num_ctx: config.num_ctx, num_thread: 12, temperature: config.temperature }/options: { ...(config.num_ctx && {num_ctx: config.num_ctx}), ...(config.temperature && {temperature: config.temperature}), num_thread: 12 }/g' "$FILE"

# Das gleiche für askAIStream
sed -i 's/options: { num_thread: 12, temperature: config.temperature, num_ctx: config.num_ctx }/options: { ...(config.num_ctx && {num_ctx: config.num_ctx}), ...(config.temperature && {temperature: config.temperature}), num_thread: 12 }/g' "$FILE"

echo "=== 2. NEUSTART ==="
cd /root/psy-nexus-platform/apps/backend && npx tsc && pm2 restart psy-backend
