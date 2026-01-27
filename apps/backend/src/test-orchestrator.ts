import "reflect-metadata";
import { container } from 'tsyringe';
import { OrionOrchestrator } from './orchestrator/OrionOrchestrator';
import { setupDIContainer } from './di/container'; // Korrekter Funktionsname!
import { AgentName } from "./types/AgentTypes";

async function runOrchestratorTest() {
    console.log("🚀 PSY-NEXUS: Deep-Scan Test...");
    setupDIContainer(); // Korrekter Funktionsname!
    const orchestrator = container.resolve(OrionOrchestrator);

    const testCases = [
        { name: "GEO-CMD", agent: "OrionAgent", input: "LOAD_GEOMETRY:Dodekaeder" },
        { name: "AGENT-LOGIC", agent: "DesignAlchemistAgent", input: "Verbinde die Blume des Lebens mit dem Backend." }
    ];

    for (const t of testCases) {
        console.log(`\nTesting ${t.name}...`);
        const res = await orchestrator.processRequestStreaming({
            agent: t.agent as AgentName,
            input: t.input
        }, () => {});
        console.log(`Result ${t.name}:`, res.success ? "✅ SUCCESS" : "❌ FAILED");
        console.log("Output:", res.output.substring(0, 100) + "...");
    }
}
runOrchestratorTest();
