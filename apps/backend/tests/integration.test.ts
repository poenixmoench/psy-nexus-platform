import { jest, describe, it, expect } from '@jest/globals';
import { setupDIContainer } from '../src/di/container';
import { ConcreteAgentExecutor } from '../src/executors/ConcreteAgentExecutor';
import { AgentInput } from '../src/types/AgentExecutor';

describe('Integration: AgentExecutor mit Agenten', () => {
  it('should resolve and execute PlanAgent via ConcreteAgentExecutor', async () => {
    const container = setupDIContainer();
    const agentExecutor: ConcreteAgentExecutor = container.resolve('AgentExecutor');

    const input: AgentInput = { query: 'Erstelle einen Projektplan für eine Webseite.' };

    const result = await agentExecutor.execute('PLAN-AGENT', input);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Generierter Projektplan');
    expect(result.meta?.agent).toBe('PLAN-AGENT');
  });

  it('should resolve and execute FrontendMeisterAgent via ConcreteAgentExecutor', async () => {
    const container = setupDIContainer();
    const agentExecutor: ConcreteAgentExecutor = container.resolve('AgentExecutor');

    const input: AgentInput = { query: 'Generiere etwas mit Geometrie.' };

    const result = await agentExecutor.execute('FRONTEND-MEISTER', input);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Generiertes SVG');
    expect(result.meta?.agent).toBe('FRONTEND-MEISTER');
  });

  // Füge weitere Integrationstests für andere Agenten hinzu...
});
