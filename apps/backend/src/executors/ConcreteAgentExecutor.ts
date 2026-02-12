import { injectable } from 'tsyringe';
import { container } from '../di/index';
import { AgentExecutor, AgentInput, AgentResult } from "../types/AgentExecutor";
import { BaseAgent } from "../agents/AgentRegistry";
import {
  KnownAgentType,
  mapToInternalType,
  AGENT_MAP,
  KNOWN_AGENTS_SET
} from "../agents/AgentRegistry";

@injectable()
export class ConcreteAgentExecutor implements AgentExecutor {
  async execute(agentName: string, input: AgentInput): Promise<AgentResult> {
    // 1. Mapping versuchen
    const mappedInternalName = mapToInternalType(agentName);

    // 2. Prüfung: Ist der Name (gemappt oder original) auflösbar?
    let finalName: KnownAgentType;

    // Definiere normalizedAgentName für den zweiten Check
    const normalizedAgentName = agentName.trim().toUpperCase().replace(/-/g, '_');

    if (KNOWN_AGENTS_SET.has(mappedInternalName)) {
      finalName = mappedInternalName;
    } else if (KNOWN_AGENTS_SET.has(normalizedAgentName)) {
      finalName = normalizedAgentName as KnownAgentType;
    } else {
      // 3. Fehlerbehandlung
      const availableInternal = Object.keys(AGENT_MAP).join(', ');

      throw new Error(
        `Agent "${agentName}" konnte nicht aufgelöst werden. ` +
        `Verfügbare interne Klassen: [${availableInternal}].`
      );
    }

    // 4. Erfolgreiche Auflösung
    const agent = container.resolve<BaseAgent>(finalName);
    return agent.processDelta(input);
  }
}
