#!/bin/bash

EXECUTOR="/root/psy-nexus-platform/apps/backend/src/agents/AgentExecutor.ts"
ORCHESTRATOR="/root/psy-nexus-platform/apps/backend/src/orchestrator/OrionOrchestrator.ts"

echo "=== 1. PATCHe AgentExecutor ==="
cp "$EXECUTOR" "$EXECUTOR.bak.$(date +%s)"
# Signatur von executeStream fixen (previousOutput zulassen)
sed -i 's/public async executeStream(agentName: string, input: string, onToken: (token: string) => void): Promise<string>/public async executeStream(agentName: string, input: string, onToken: (token: string) => void, previousOutput: any = null): Promise<string>/' "$EXECUTOR"
# Den Aufruf von this.execute reparieren (null durch previousOutput ersetzen)
sed -i 's/await this.execute(agentName, input, {}, null, onToken)/await this.execute(agentName, input, {}, previousOutput, onToken)/' "$EXECUTOR"

echo "=== 2. PATCHe OrionOrchestrator ==="
cp "$ORCHESTRATOR" "$ORCHESTRATOR.bak.$(date +%s)"
# previousOutput laden einbauen
sed -i '/const rawInput = input || "";/a \    let previousOutput = null;\n    const existingWorkflow = await this.workflowState.getWorkflow(workflowId);\n    if (existingWorkflow && existingWorkflow.metadata) {\n      previousOutput = existingWorkflow.metadata.last_result || null;\n    }' "$ORCHESTRATOR"
# executeStream Aufruf aktualisieren (previousOutput übergeben)
sed -i 's/const fullOutput = await this.executor.executeStream(targetAgent, enrichedInput, (token) => onToken(token));/const fullOutput = await this.executor.executeStream(targetAgent, enrichedInput, (token) => onToken(token), previousOutput);/g' "$ORCHESTRATOR"
# Geometrie für DOKUMENTATION_AGENT blockieren
sed -i 's/if (detectedForm)/if (detectedForm \&\& targetAgent !== "DOKUMENTATION_AGENT")/g' "$ORCHESTRATOR"

echo "=== 3. NEUSTART ==="
cd /root/psy-nexus-platform/apps/backend && npx tsc && pm2 restart psy-backend
