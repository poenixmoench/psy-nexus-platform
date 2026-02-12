import { injectable } from 'tsyringe';
import { BaseAgent } from '@shared/basis-agent';
import { ContextDelta, StigmergyTag, KnownAgentType } from '@shared/types/AgentTypes';

@injectable()
export class PlanAgent extends BaseAgent {
  public readonly name: KnownAgentType = 'PLAN_AGENT';

  public async processDelta(delta: ContextDelta): Promise<{ text: string; newTags: StigmergyTag[] }> {
    const newTags: StigmergyTag[] = [];
    const content = (delta?.diffContent ?? '').toLowerCase();

    if (content.includes('migration') || content.includes('frontend')) {
      newTags.push(this.emitTag({
        type: 'TASK',
        data: { taskId: `task-${Date.now()}`, description: 'Frontend migration analysis', priority: 'HIGH' }
      }, 3600));
    }

    const hashSnippet = delta?.currentHash ? delta.currentHash.substring(0, 8) : 'N/A';
    return {
      text: `[${this.name}] Analyse des Deltas ${hashSnippet} abgeschlossen.`,
      newTags
    };
  }
}
