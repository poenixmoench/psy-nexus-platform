import LiveRunService from './LiveRunService';
import { runCommand } from './ShellService';
import { askAI } from './AIService';
import { ProjectContextService } from './ProjectContextService';
import { MemoryService } from './MemoryService';
import { ROLES } from './AgentConfigs';
import fs from 'fs';
import path from 'path';

export const pendingApprovals = new Map<string, (approved: boolean) => void>();

export class AgentOrchestrator {
  static async execute(task: string, runId: string): Promise<void> {
    await MemoryService.init();
    const logAndStream = (content: string, type: string = 'stream') => {
      LiveRunService.broadcast({ type: 'stream_chunk', content: `\n[${type.toUpperCase()}]: ${content}` });
    };

    // 1. RELEVANTES WISSEN ABRUFEN
    const history = await MemoryService.search(task);
    const memoryContext = history.length > 0 ? `ERINNERUNG AN FRÜHERE TASKS:\n${history.join('\n')}` : "";

    const projectContext = await ProjectContextService.getContext(process.cwd());

    // 2. ARCHITEKT (PLANUNG)
    const planPrompt = `${ROLES.architect.systemPrompt}\n${memoryContext}\nAufgabe: ${task}\nErstelle Plan: [[PLAN: ...]]`;
    const planResponse = await askAI(planPrompt, "Architektur");
    const plan = planResponse.match(/\[\[PLAN: ([\s\S]*?)\]\]/)?.[1] || "Direkt ausführen.";
    
    // Plan im Langzeitgedächtnis speichern
    await MemoryService.store(`Plan für "${task}": ${plan}`, { type: 'plan', runId });

    LiveRunService.broadcast({ type: 'confirm_plan', actionId: runId, plan });
    if (!(await new Promise<boolean>(res => pendingApprovals.set(runId, res)))) return;

    // 3. EXECUTION LOOP
    let lastObservation = `Start. Plan: ${plan}`;
    let iteration = 0;

    while (iteration < 15) {
      iteration++;
      
      // Wissen aus der aktuellen Sitzung abrufen
      const currentMemory = await MemoryService.search(lastObservation);
      
      const devPrompt = `Rolle: ${ROLES.developer.systemPrompt}\nAufgabe: ${task}\nWissen: ${currentMemory.join('\n')}\nStatus: ${lastObservation}`;
      const devResponse = await askAI(devPrompt, `Dev Iter ${iteration}`);

      // WRITE-LOGIK (mit Review & Memory-Update)
      const writeMatch = devResponse.match(/\[\[WRITE: (.*?) \| ([\s\S]*?)\]\]/);
      if (writeMatch) {
        const [_, filePath, newContent] = writeMatch;
        const reviewPrompt = `${ROLES.reviewer.systemPrompt}\nCheck: ${newContent}`;
        const reviewResponse = await askAI(reviewPrompt, "Review");

        if (reviewResponse.includes('[[APPROVED]]')) {
          LiveRunService.broadcast({ type: 'confirm_file_write', actionId: runId, file: filePath, newContent });
          if (await new Promise<boolean>(res => pendingApprovals.set(runId, res))) {
            fs.writeFileSync(path.join(process.cwd(), filePath), newContent);
            await MemoryService.store(`Datei ${filePath} wurde geändert. Inhalt: ${newContent.substring(0, 100)}...`, { file: filePath });
            lastObservation = `Erfolg: ${filePath} geschrieben.`;
          }
        } else {
          lastObservation = `Review-Korrektur: ${reviewResponse}`;
          continue;
        }
      }

      if (devResponse.includes('[[DONE]]')) {
        await MemoryService.store(`Task abgeschlossen: ${task}`, { status: 'success' });
        break;
      }
    }
    logAndStream("Task mit Long-Term Memory abgeschlossen.", "success");
  }
}
