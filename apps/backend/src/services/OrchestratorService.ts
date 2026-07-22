import { injectable, singleton, container } from 'tsyringe';
import { createActor } from 'xstate';
import { psyNexusMachine } from '../machines/PsyNexusMachine';
import { StigmergyService } from './StigmergyService';
import { KnownAgentType, KnownAgentTypeValues, AgentInput, AgentResult } from '@shared/types/AgentTypes';
import { ConcreteAgentExecutor } from '../executors/ConcreteAgentExecutor';

@singleton()
@injectable()
export class OrchestratorService {
  private actor: any;

  constructor(
    private stigmergyService: StigmergyService
  ) {
    // Die Machine wird EINMALIG beim Start des Services initialisiert
    this.actor = createActor(psyNexusMachine);
    
    this.actor.subscribe(async (snapshot: any) => {
      const { status, currentAgent, initialPrompt } = snapshot.context;
      console.log(`[Orchestrator] Machine-State: ${snapshot.value} | Status: ${status.type} | Agent: ${currentAgent}`);

      if (status.type === 'IN_PROGRESS' && currentAgent) {
        // Starte Logik nur, wenn wir uns im korrekten Zustand befinden
        this.executeAgentLogic(currentAgent, initialPrompt);
      }
    });

    this.actor.start();
  }

  private async executeAgentLogic(agentType: KnownAgentType, prompt: string) {
    console.log(`🚀 [EXECUTION] Trigger Agent-Logic: ${agentType} (Prompt: ${prompt})`);
    try {
      const executor = container.resolve(ConcreteAgentExecutor);
      const history = await this.stigmergyService.getTagsByNamespace('global');

      const agentInput: AgentInput = {
        query: prompt,
        agentName: agentType,
        context: {
          delta: {
            previousHash: '0',
            currentHash: '0',
            activeTags: history
          }
        }
      };

      const result = await executor.execute(agentType, agentInput);
      await this.handleAgentCompletion(agentType, result);
    } catch (err: any) {
      console.error(`❌ [EXECUTION] Kritischer Fehler in ${agentType}:`, err.message);
    }
  }

  public async startWorkflow(input: any) {
    const prompt = input.initialPrompt || input.prompt || 'INITIALIZE_NEXUS';
    console.log(`[Orchestrator] 🏁 Workflow-Start Signal: ${prompt}`);
    
    // Wir senden das Event an die existierende Machine
    this.actor.send({ 
      type: "START_WORKFLOW", 
      input: { ...input, initialPrompt: prompt } 
    });
  }

  public approveGate(gate: string) {
    const snapshot = this.actor.getSnapshot();
    console.log(`[Orchestrator] 🔓 Freigabe für Gate: ${gate} (State: ${snapshot.value})`);
    this.actor.send({ type: 'APPROVE_GATE', gate });
  }

  private async handleAgentCompletion(agentName: KnownAgentType, result: AgentResult) {
    console.log(`✅ [Orchestrator] Agent ${agentName} hat Arbeit abgeliefert.`);
    
    if (result.success && result.newTags.length > 0) {
      await this.stigmergyService.saveTags(result.newTags);
    }

    this.actor.send({ 
      type: 'AGENT_COMPLETED', 
      agent: agentName, 
      output: result 
    });
  }

  public getStatus() {
    return this.actor.getSnapshot().context.status;
  }
}
