import { container } from '../index';
import { AGENT_MAP } from '../../agents/AgentRegistry';

export const registerAgents = () => {
  Object.entries(AGENT_MAP).forEach(([name, cls]) => {
    container.register(name, { useClass: cls as any });
  });
  console.log(`✅ ${Object.keys(AGENT_MAP).length} Agenten dynamisch registriert.`);
};
