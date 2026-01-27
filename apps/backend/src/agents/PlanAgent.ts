import { injectable, inject } from 'tsyringe';
import { Logger } from '../types/Logger';
import { AgentInput, AgentResult } from '../types/AgentExecutor';
import { OrionOrchestrator } from '../orchestrator/OrionOrchestrator';
import { AgentName } from '../types/AgentTypes';

interface PlanningTask {
  goal: string;
  scope: string;
  constraints: string[];
  deliverables: string[];
}

@injectable()
export class PlanAgent {
  constructor(
    @inject('Logger') private logger: Logger
  ) {}

  async execute(input: AgentInput): Promise<AgentResult> {
    try {
      // Hole den Orchestrator direkt aus dem Container
      const { container } = await import('tsyringe');
      const orion = container.resolve(OrionOrchestrator);
      
      const task = this.parsePlanningRequest(input.query);
      const currentManifest = orion.getCurrentManifest();
      
      const plan = await this.generatePlan(task, currentManifest);
      
      this.logger.info('PlanAgent', 'execution', `Plan für "${task.goal}" erstellt.`);
      
      return {
        output: JSON.stringify(plan, null, 2),
        success: true,
        agentName: 'PlanAgent',
        meta: { type: 'planning-result', target: task.scope }
      };
    } catch (error) {
      this.logger.error('PlanAgent', 'execution', 'Planung fehlgeschlagen', error);
      return {
        output: `Fehler bei der Planung: ${(error as Error).message}`,
        success: false,
        agentName: 'PlanAgent'
      };
    }
  }

  private parsePlanningRequest(query: string): PlanningTask {
    const lines = query.split('\n');
    let goal = 'Unbekannt';
    let scope = 'Gesamtprojekt';
    const constraints: string[] = [];
    const deliverables: string[] = [];

    for (const line of lines) {
      if (line.startsWith('ZIEL:')) goal = line.substring(6).trim();
      if (line.startsWith('BEREICH:')) scope = line.substring(9).trim();
      if (line.includes('kein KI-Jargon') || line.includes('barrierefrei')) constraints.push(line.trim());
      if (line.includes('Plan:') || line.includes('Struktur:')) deliverables.push(line.trim());
    }

    return { goal, scope, constraints, deliverables };
  }

  private async generatePlan(task: PlanningTask, manifest: any): Promise<any> {
    return {
      id: `plan-${Date.now()}`,
      goal: task.goal,
      basedOn: manifest.projectName,
      scope: task.scope,
      timelineEstimate: "2-3 Iterationen",
      tasks: [
        {
          id: "task-1",
          title: "Architektur-Review",
          description: "Überprüfe Manifest auf Konsistenz",
          assignedTo: "Architecture-Agent",
          dependsOn: []
        },
        {
          id: "task-2", 
          title: "Design-System Definition",
          description: "Erstelle Farbpalette und Komponenten-Struktur",
          assignedTo: "Design-Agent",
          dependsOn: ["task-1"]
        },
        {
          id: "task-3",
          title: "Frontend-Struktur",
          description: "Erstelle Komponenten-Baum basierend auf Design",
          assignedTo: "Frontend-Agent", 
          dependsOn: ["task-2"]
        }
      ],
      constraints: task.constraints,
      qualityGates: ["Barrierefreiheit", "Code-Qualität", "Design-Konsistenz"]
    };
  }
}
