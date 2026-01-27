import { injectable } from 'tsyringe';
import { container } from '../di/index';
import { AgentExecutor, AgentInput, AgentResult } from "../types/AgentExecutor";
import { BaseAgent } from "../types/AgentRegistry";
import { 
  RegisteredAgentName, 
  isValidAgentName, 
  mapToInternalName, 
  PUBLIC_TO_INTERNAL_NAME_MAP,
  AGENT_MAP 
} from "../agents/AgentRegistry";

@injectable()
export class ConcreteAgentExecutor implements AgentExecutor {
  async execute(agentName: string, input: AgentInput): Promise<AgentResult> {
    // 1. Mapping versuchen
    const mappedInternalName = mapToInternalName(agentName);

    // 2. Prüfung: Ist der Name (gemappt oder original) auflösbar?
    let finalName: RegisteredAgentName;

    if (isValidAgentName(mappedInternalName)) {
      finalName = mappedInternalName;
    } else if (isValidAgentName(agentName as RegisteredAgentName)) {
      finalName = agentName as RegisteredAgentName;
    } else {
      // 3. Fehlerbehandlung mit hilfreichen Infos
      const availablePublic = Object.keys(PUBLIC_TO_INTERNAL_NAME_MAP).join(', ');
      const availableInternal = Object.keys(AGENT_MAP).join(', ');
      
      throw new Error(
        `Agent "${agentName}" konnte nicht aufgelöst werden. ` +
        `Verfügbare öffentliche Namen: [${availablePublic}]. ` +
        `Verfügbare interne Klassen: [${availableInternal}].`
      );
    }

    // 4. Erfolgreiche Auflösung
    const agent = container.resolve<BaseAgent>(finalName);
    return agent.execute(input);
  }
}
