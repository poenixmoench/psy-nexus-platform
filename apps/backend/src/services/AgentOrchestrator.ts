import LiveRunService from './LiveRunService';
import { askAI } from './AIService';
import { ROLES } from './AgentConfigs';
import { MemoryService } from './MemoryService';

export const pendingApprovals = new Map<string, (data: any) => void>();

export class AgentOrchestrator {
  static async execute(task: string, runId: string): Promise<void> {
    const broadcast = (content: string, type = 'architect') => {
      LiveRunService.broadcast({ type: 'stream_chunk', content: `\n[${type.toUpperCase()}]: ${content}`, runId });
    };

    // PHASE 1: ARCHITEKT FRAGT
    broadcast("Analysiere Vision... Erstelle Gegenfragen.", "architect");
    const archResponse = await askAI(`${ROLES.architect.systemPrompt}\n\nUSER: ${task}`, "architect");
    
    // PHASE 2: INTERAKTIONS-STOPP AUF DEV-WORKSPACE
    LiveRunService.broadcast({
      type: 'interaction_required',
      runId,
      subType: 'questions',
      content: archResponse,
      options: [
        { label: "Direkt umsetzen", prompt: "Verstanden, starte direkt.", icon: "🚀" },
        { label: "Details klären", prompt: "Ich beantworte deine Fragen...", icon: "📝" },
        { label: "Anderer Ansatz", prompt: "Neuer Plan: ", icon: "💡" },
        { label: "Security First", prompt: "Fokus auf Sicherheit.", icon: "🔒" },
        { label: "Abbrechen", prompt: "Stop.", icon: "🛑" }
      ]
    });

    // Warten auf User-Eingabe (Promise wird über API/WS gelöst)
    const developerInput = await new Promise<any>((resolve) => {
      pendingApprovals.set(runId, resolve);
    });

    // PHASE 3: SPEICHERUNG DER CO-KREATION & UMSETZUNG
    await MemoryService.save(`Entscheidung für Task ${runId}: ${developerInput.prompt}`);
    broadcast("Input erhalten. Starte Umsetzung...", "developer");
    
    // Hier folgt die iterative Schleife der restlichen 7 Agenten...
  }
}
