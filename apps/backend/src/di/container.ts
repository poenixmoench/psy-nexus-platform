import { container } from './index';
import ConsoleLogger from '../utils/ConsoleLogger';
import { ConcreteAgentExecutor } from '../executors/ConcreteAgentExecutor';
import { OrionOrchestrator } from '../orchestrator/OrionOrchestrator';
import { GeometryTool } from '../tools/GeometryTool';
import { globalUserRulesStore } from '../config/globalUserRules';
import { registerAgents } from './modules/agent-module';

export const setupDIContainer = () => {
  // Infrastructure
  container.registerSingleton('Logger', ConsoleLogger);
  container.register('GlobalUserRulesStore', { useValue: globalUserRulesStore });
  
  // Core Services
  container.registerSingleton(OrionOrchestrator);
  container.registerSingleton('AgentExecutor', ConcreteAgentExecutor);
  container.registerSingleton(GeometryTool);

  // Modulare Registrierung
  registerAgents();

  console.log("💎 Psy-Nexus DI-Container: Optimiert & Modular bereit.");
};
