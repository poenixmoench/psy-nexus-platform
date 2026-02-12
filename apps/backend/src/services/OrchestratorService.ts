import { EventEmitter2 } from 'eventemitter2';
import { NexusEvent } from '../types/events';
import { injectable, singleton } from 'tsyringe';
import { createActor } from 'xstate';
import { psyNexusMachine } from '../machines/PsyNexusMachine';
import { StigmergyService } from './StigmergyService';
import { KnownAgentType, KnownAgentTypeValues, RunStatus } from '@shared/types/AgentTypes';
import { WorkflowRouter } from '@shared/logic/WorkflowRouter'; // Korrekter Import-Pfad
import { container } from 'tsyringe';
import { AGENT_MAP } from '../agents/AgentRegistry';
import { OllamaAdapter } from './OllamaAdapter';
import { ContextManager } from '@shared/logic/ContextManager';
import { v4 as uuidv4 } from 'uuid';

@singleton()
@injectable()
export class OrchestratorService {
  private actor;
  private circuitBreakerOpen = false;
  private lastFailureTime = 0;
  private readonly RESET_TIMEOUT = 60000; // 60 Sek. Abkühlphase

  constructor(
    private stigmergyService: StigmergyService,
    private ollamaAdapter: OllamaAdapter
  ) {
    this.actor = createActor(psyNexusMachine);
    this.actor.start();

    this.actor.subscribe((snapshot) => {
      console.log(`[Orchestrator] Zustand: ${JSON.stringify(snapshot.context.status)}`);
    });
  }

  // --- XState basierte Methoden ---
  public getStatus(): RunStatus {
    return this.actor.getSnapshot().context.status;
  }

  public async startWorkflow(input: any) {
    console.log('[Orchestrator] Starte neuen Workflow...', input);
    this.actor.send({ type: 'START_WORKFLOW', input });
  }

  public async agentCompleted(agentName: string, output: any) {
    if (!this.isValidAgentType(agentName)) {
      console.warn(`[Orchestrator] ⛔ SECURITY ALERT: Invalid agent '${agentName}' tried to complete task.`);
      this.handleError('INVALID_AGENT', `Agent ${agentName} is not registered.`);
      return;
    }

    console.log(`[Orchestrator] Agent ${agentName} completed work.`);

    // Persistenz
    if (output && output.newTags && output.newTags.length > 0) {
      await this.stigmergyService.saveTags(output.newTags);
    }

    // Zustand aktualisieren
    this.actor.send({
      type: 'AGENT_COMPLETED',
      agent: agentName as KnownAgentType,
      output
    });

    // Nächsten Schritt basierend auf Workflow-Logik
    const currentState = this.actor.getSnapshot().context.currentStep;
    const nextAgent = WorkflowRouter.getNextAgent(currentState);

    if (nextAgent) {
      const requiresApproval = WorkflowRouter.requiresApproval(currentState);
      if (requiresApproval) {
        const gateName = WorkflowRouter.getApprovalGate(currentState);
        if (gateName) {
          this.actor.send({
            type: 'REQUIRE_APPROVAL',
            gate: gateName,
             output
          });
          console.log(`[Orchestrator] Warte auf Genehmigung für ${gateName}-Gate.`);
        }
      } else {
        console.log(`[Orchestrator] Starte nächsten Agenten: ${nextAgent}`);
        // Optional: Hier könnte der nächste Agent automatisch gestartet werden
      }
    } else {
      console.log('[Orchestrator] Workflow erfolgreich abgeschlossen.');
    }
  }

  public approveGate(gate: string) {
    console.log(`[Orchestrator] Gate '${gate}' genehmigt.`);
    this.actor.send({ type: 'APPROVE_GATE', gate });
  }

  public rejectGate(gate: string, reason: string) {
    console.log(`[Orchestrator] Gate '${gate}' abgelehnt: ${reason}`);
    this.actor.send({ type: 'REJECT_GATE', gate, reason });
  }

  // --- Neue kognitive Methoden ---
  async processAgentTask(agentName: KnownAgentType, task: string, namespace: string = 'global') {
    const requestId = uuidv4().substring(0, 8);
    const startTime = Date.now();

    // 1. Circuit Breaker Check
    if (this.circuitBreakerOpen) {
      if (Date.now() - this.lastFailureTime > this.RESET_TIMEOUT) {
        console.log(`[Orchestrator][${requestId}] Versuche Half-Open Reset...`);
        this.circuitBreakerOpen = false;
      } else {
        throw new Error(`[Orchestrator] Circuit Breaker ist offen. System kühlt ab.`);
      }
    }

    console.log(`[Orchestrator][${requestId}] Start: ${agentName} | Namespace: ${namespace}`);

    try {
      // 2. Kontext-Laden & Filtern (Refactored)
      const relevantContext = await this.loadContext(agentName, namespace);

      // 3. KI-Inference
      const aiResponse = await this.ollamaAdapter.askAgent(agentName, task, relevantContext as any);

      // 4. Resultat persistieren
      const newTag = await this.persistResult(agentName, namespace, aiResponse, requestId);

      const duration = Date.now() - startTime;
      console.log(`[Orchestrator][${requestId}] SUCCESS: ${agentName} in ${duration}ms (Tag: ${newTag.id})`);

      return aiResponse;
    } catch (error: any) {
      this.handleFailure(requestId, agentName, error);
      throw error;
    }
  }

  // --- Hilfsmethoden für kognitive Verarbeitung ---
  private async loadContext(agentName: KnownAgentType, namespace: string) {
    const fullHistory = await this.stigmergyService.getTagsByNamespace(namespace);
    return ContextManager.calculateDelta(fullHistory as any, agentName);
  }

  private async persistResult(agentName: KnownAgentType, namespace: string, data: any, requestId: string) {
    return await this.stigmergyService.createTag({
      sourceAgent: agentName,
      namespace: namespace,
      priority: 'MEDIUM',
      payload: {
        type: 'DATA',
         data,
        reason: `RequestID: ${requestId}`
      }
    });
  }

  private handleFailure(requestId: string, agentName: KnownAgentType, error: any) {
    console.error(`[Orchestrator][${requestId}] FAIL: Agent ${agentName} ->`, error.message);
    this.circuitBreakerOpen = true;
    this.lastFailureTime = Date.now();
  }

  // --- Validierung ---
  private isValidAgentType(type: string): type is KnownAgentType {
    return KnownAgentTypeValues.includes(type as any);
  }

  private handleError(code: string, message: string) {
    this.actor.send({ type: 'WORKFLOW_ERROR', code, message });
  }
}
