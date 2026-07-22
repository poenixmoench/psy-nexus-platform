import { injectable } from 'tsyringe';
import { container } from '../di/index';
import { AgentExecutor } from "../types/AgentExecutor";
import { AgentInput, AgentResult, KnownAgentType } from '@shared/types/AgentTypes';
import { BaseAgent, mapToInternalType, KNOWN_AGENTS_SET } from "../agents/AgentRegistry";

@injectable()
export class ConcreteAgentExecutor implements AgentExecutor {
  async execute(agentName: KnownAgentType, input: AgentInput): Promise<AgentResult> {
    const mappedInternalName = mapToInternalType(agentName);

    let finalName: KnownAgentType;

    const normalizedAgentName = agentName.trim().toUpperCase().replace(/-/g, '_');

    if (KNOWN_AGENTS_SET.has(mappedInternalName)) {
      finalName = mappedInternalName as any;
    } else if (KNOWN_AGENTS_SET.has(normalizedAgentName)) {
      finalName = normalizedAgentName as KnownAgentType;
    } else {
      const availableInternal = Object.keys(KNOWN_AGENTS_SET).join(', ');
      throw new Error(
        `Agent "${agentName}" konnte nicht aufgelöst werden. Verfügbare interne Klassen: [${availableInternal}].`
      );
    }

    const agent = container.resolve<BaseAgent>(finalName);
    // Die processDelta-Methode erwartet jetzt das vollständige AgentInput
    return agent.processDelta(input);
  }
}
