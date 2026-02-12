"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const OrionOrchestrator_1 = require("./orchestrator/OrionOrchestrator");
const container_1 = require("./di/container");
async function runStreamingTest() {
    console.log("🌊 PSY-NEXUS: Orchestrator Real-Time Stream Test...");
    // Initialisiere DI
    (0, container_1.setupDIContainer)();
    const orchestrator = tsyringe_1.container.resolve(OrionOrchestrator_1.OrionOrchestrator);
    const targetAgent = "DESIGN-ALCHEMIST";
    console.log(`\n[START] Fordere Stream vom ${targetAgent} an...\n`);
    console.log("--- OUTPUT START ---");
    try {
        const result = await orchestrator.processRequestStreaming({
            agent: targetAgent,
            input: "Erkläre kurz die Bedeutung der Blume des Lebens im Kontext von modernem UI-Design."
        }, (chunk) => {
            // Gibt Chunks direkt aus ohne Newline für echten Schreibmaschinen-Effekt
            process.stdout.write(chunk);
        });
        console.log("\n--- OUTPUT END ---");
        console.log(`\n✅ Test abgeschlossen. Status: ${result.success ? 'Erfolg' : 'Fehler'}`);
    }
    catch (error) {
        console.error("\n❌ Kritischer Fehler im Test:", error.message);
    }
}
runStreamingTest();
