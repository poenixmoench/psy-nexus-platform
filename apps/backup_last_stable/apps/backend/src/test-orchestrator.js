"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const OrionOrchestrator_1 = require("./orchestrator/OrionOrchestrator");
const container_1 = require("./di/container"); // Korrekter Funktionsname!
async function runOrchestratorTest() {
    console.log("🚀 PSY-NEXUS: Deep-Scan Test...");
    (0, container_1.setupDIContainer)(); // Korrekter Funktionsname!
    const orchestrator = tsyringe_1.container.resolve(OrionOrchestrator_1.OrionOrchestrator);
    const testCases = [
        { name: "GEO-CMD", agent: "OrionAgent", input: "LOAD_GEOMETRY:Dodekaeder" },
        { name: "AGENT-LOGIC", agent: "DesignAlchemistAgent", input: "Verbinde die Blume des Lebens mit dem Backend." }
    ];
    for (const t of testCases) {
        console.log(`\nTesting ${t.name}...`);
        const res = await orchestrator.processRequestStreaming({
            agent: t.agent,
            input: t.input
        }, () => { });
        console.log(`Result ${t.name}:`, res.success ? "✅ SUCCESS" : "❌ FAILED");
        console.log("Output:", res.output.substring(0, 100) + "...");
    }
}
runOrchestratorTest();
