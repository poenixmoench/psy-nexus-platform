import "reflect-metadata";
import { container } from 'tsyringe';
import { OrionOrchestrator } from './orchestrator/OrionOrchestrator';
import { setupDIContainer } from './di/container';
import { AGENT_MAP, KnownAgentType } from './agents/AgentRegistry';

async function runDynamicOrchestratorTest() {
    console.log("\n🚀 PSY-NEXUS: Dynamischer Agenten-Deep-Scan [v2.0]");
    console.log("=================================================");
    
    // Initialisiere den Container (Guard sorgt für Sicherheit)
    setupDIContainer();
    
    const orchestrator = container.resolve(OrionOrchestrator);
    const agentTypes = Object.keys(AGENT_MAP) as KnownAgentType[];
    
    console.log(`🔍 Registry-Check: ${agentTypes.length} Agenten registriert.\n`);
    let successCount = 0;

    for (const type of agentTypes) {
        process.stdout.write(`📡 Teste Auflösung: [${type}] ... `);
        try {
            // Wir nutzen einen kurzen Ping-Input
            const res = await orchestrator.processRequestStreaming({
                agent: type as any,
                input: "DI_RESOLUTION_TEST_PING"
            }, () => {});

            if (res) {
                console.log("✅ OK");
                successCount++;
            }
        } catch (error: any) {
            console.log(`\n❌ FEHLER bei [${type}]: ${error.message || error}`);
        }
    }

    console.log("\n=================================================");
    console.log(`📊 Endergebnis: ${successCount}/${agentTypes.length} Agenten online`);
    
    if (successCount === agentTypes.length) {
        console.log("🎉 VALIDIERUNG ERFOLGREICH: Alle Systeme synchron.\n");
    } else {
        console.error("⚠️  WARNUNG: Inkonsistenz im Agenten-System erkannt!\n");
        process.exit(1);
    }
}

runDynamicOrchestratorTest().catch((err) => {
    console.error("💥 Kritischer Test-Abbruch:", err);
    process.exit(1);
});
