import { injectable } from 'tsyringe';
import { BaseAgent } from '@shared/basis-agent';
import { ContextDelta, StigmergyTag, KnownAgentType } from '@shared/types/AgentTypes';

@injectable()
export class OptimiererAgent extends BaseAgent {
  public readonly name: KnownAgentType = 'OPTIMIERER_AGENT';
  public async processDelta(delta: ContextDelta) {
    // Nutze diffContent (vorhanden) statt modifiedFiles (Phantasie)
    const changeSize = delta?.diffContent?.length || 0;
    return { 
      text: `[${this.name}] Delta-Optimierung gestartet. Analyse von ${changeSize} Zeichen im Diff.`, 
      newTags: [] 
    };
  }
}
