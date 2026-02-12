import { injectable } from 'tsyringe';
import { BaseAgent } from '@shared/basis-agent';
import { ContextDelta, StigmergyTag, KnownAgentType } from '@shared/types/AgentTypes';

@injectable()
export class FrontendMeisterAgent extends BaseAgent {
  public readonly name: KnownAgentType = 'FRONTEND_MEISTER_AGENT';
  public async processDelta(delta: ContextDelta) {
    const newTags: StigmergyTag[] = [];
    if ((delta.diffContent || '').toLowerCase().includes('frontend')) {
      newTags.push(this.emitTag({ type: 'DATA', data: { key: 'ui_refinement', value: 'pending' }, reason: 'Detected frontend change.' }, 3600));
    }
    return { text: `[${this.name}] Frontend-Präzision wird angewandt.`, newTags };
  }
}
