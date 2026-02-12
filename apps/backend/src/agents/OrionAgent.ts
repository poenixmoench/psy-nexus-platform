import { injectable } from 'tsyringe';
import { BaseAgent } from './AgentRegistry';
import { ContextDelta, StigmergyTag, KnownAgentType } from '@shared/types/AgentTypes';

@injectable()
export class OrionAgent extends BaseAgent {
  public readonly name: KnownAgentType = 'ORION_AGENT';

  public async processDelta(delta: ContextDelta) {
    const newTags: StigmergyTag[] = [];
    const topTask = this.getHighestPriorityTask(delta.activeTags);

    if (topTask) {
      newTags.push(this.emitTag({
        type: 'DATA',
        data: { key: 'orion_focus', value: ( ( (topTask as any).data || (topTask as any).payload?.data )  as any).taskId },
        reason: 'Orion synchronizes on top priority.'
      }, 1800));
    }

    return {
      text: `[${this.name}] Prime Directive aktiv. Überwache Stigmergie-Fluss.`,
      newTags
    };
  }
}
