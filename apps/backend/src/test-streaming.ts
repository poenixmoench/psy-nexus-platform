import "reflect-metadata";
import { container } from 'tsyringe';
import { OrionOrchestrator } from './orchestrator/OrionOrchestrator';
import { setupDIContainer } from './di/container';
import { AgentName } from "./types/AgentTypes";

async function runStreamingTest() {
    console.log("🌊 PSY-NEXUS: Orchestrator Real-Time Stream Test...");
    
    // Initialisiere DI
    setupDIContainer();
    
    const orchestrator = container.resolve(OrionOrchestrator);
    const targetAgent = "DESIGN-ALCHEMIST" as AgentName;

    console.log(`\n[START] Fordere Stream vom ${targetAgent} an...\n`);
    console.log("--- OUTPUT START ---");

    try {
        const result = await orchestrator.processRequestStreaming(
            {
                agent: targetAgent,
                input: "Erkläre kurz die Bedeutung der Blume des Lebens im Kontext von modernem UI-Design."
            },
            (chunk: string) => {
                // Gibt Chunks direkt aus ohne Newline für echten Schreibmaschinen-Effekt
                process.stdout.write(chunk);
            }
        );

        console.log("\n--- OUTPUT END ---");
        console.log(`\n✅ Test abgeschlossen. Status: ${result.success ? 'Erfolg' : 'Fehler'}`);
        
    } catch (error: any) {
        console.error("\n❌ Kritischer Fehler im Test:", error.message);
    }
}

runStreamingTest();
