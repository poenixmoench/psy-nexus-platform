import { injectable, inject } from 'tsyringe';
import { AgentExecutor } from '../agents/AgentExecutor';
import { WorkflowStateService } from '../services/WorkflowStateService';
import { GeometryTool } from '../tools/GeometryTool';
import { logShadowRouting } from '../services/ShadowRouter';

@injectable()
export class OrionOrchestrator {
  constructor(
    @inject('AgentExecutor') private executor: AgentExecutor,
    @inject(WorkflowStateService) private workflowState: WorkflowStateService,
    @inject(GeometryTool) private geometryTool: GeometryTool
  ) {}

  async processRequestStreaming(request: any, onToken: (token: string) => void) {
    const { workflowId, agent, input, sessionData } = request;
    let targetAgent = agent || 'ORION_AGENT';
    if (!targetAgent.toUpperCase().endsWith("_AGENT")) if (!targetAgent.endsWith("_AGENT")) targetAgent = `${targetAgent}_AGENT`;
    const rawInput = input || "";

    // Shadow-Router: nur Logging, kein Einfluss aufs Routing
    logShadowRouting(rawInput, targetAgent);

    // FIX 1: Zuerst erstellen
    await this.workflowState.createWorkflow(workflowId, targetAgent, rawInput);
    
    // FIX 2: Dann laden (jetzt existiert er!)
    const currentWorkflow = await this.workflowState.getWorkflow(workflowId);
    
    // FIX 3: Jetzt funktioniert die Prüfung
    if (currentWorkflow && !(currentWorkflow.metadata as any)?.nicheLocked) {
      const detectedNiche = this.extractNiche(rawInput);
      if (detectedNiche) {
        await this.workflowState.lockNiche(workflowId, detectedNiche);
        console.log(`🔒 [ORCHESTRATOR] Niche locked: ${detectedNiche}`);
      }
    }

    const niche = await this.workflowState.getNiche(workflowId);
    const nicheContext = niche 
      ? `\n\n### 🏷️ AKTIVE NISCHE: ${niche.toUpperCase()}\nDIREKTIVE: Alle Ausgaben MÜSSEN zu dieser Nische passen!` 
      : "";

    let previousOutput = (currentWorkflow?.metadata as any)?.last_result || null;

    try {
      let enrichedInput = rawInput + nicheContext;

      if (targetAgent !== 'DOKUMENTATION_AGENT' &&
          ['FRONTEND_MEISTER_AGENT', 'DESIGN_ALCHEMIST_AGENT'].includes(targetAgent)) {
        const manifest = this.geometryTool.getManifest();
        const allForms = manifest.flatMap(m => m.forms || []);
        const detectedForm = allForms.find(f => rawInput.toLowerCase().includes(f.toLowerCase()));
        if (detectedForm) {
          const data = this.geometryTool.calculate(detectedForm as any, 'RODIN' as any, { size: 100 });
          if (data) {
            enrichedInput = `${rawInput}\n\n### 📐 GEOMETRIE_DATA\nDATA: ${JSON.stringify(data)}${nicheContext}`;
          }
        }
      }

      console.log(`⏳ [EXECUTOR] Starte Berechnung für ${targetAgent}...`);
      const fullOutput = await this.executor.executeStream(targetAgent, enrichedInput, (token) => onToken(token), previousOutput);
      const result = { output: fullOutput };
      console.log(`✅ [EXECUTOR] Berechnung abgeschlossen.`);
      
      await this.workflowState.updateStatus(workflowId, 'completed', result);
    } catch (err: any) {
      onToken(`SYSTEM-ERROR: ${err.message}`);
      await this.workflowState.updateStatus(workflowId, 'failed', { error: err.message });
    }
  }

  private extractNiche(input: string): string | null {
    const regex = /(?:für|in der|im Bereich|Thema|Nische|zum Thema)\s+([a-zA-ZäöüÄÖÜ0-9\s\-]{3,40})/i;
    const match = input.match(regex);
    return match && match[1] ? match[1].trim() : null;
  }
}
