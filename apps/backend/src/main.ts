import "./alias-fix";
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { container } from 'tsyringe';
import { WorkflowStateService } from './services/WorkflowStateService';
import { StigmergyService } from './services/StigmergyService';
import { AgentExecutor } from './agents/AgentExecutor';
import { OrionOrchestrator } from './orchestrator/OrionOrchestrator';
import { GeometryTool } from './tools/GeometryTool';
import { registerAllAgents } from './agents/AgentRegistry';
import { EventEmitter2 } from 'eventemitter2';

async function bootstrap() {
  dotenv.config();
  const sharedBus = new EventEmitter2({ wildcard: true, delimiter: '.' });
  (global as any).NEXUS_BUS = sharedBus;

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Bridge NestJS -> tsyringe
  // Wir holen die Instanzen aus dem Nest-Context
  const workflowState = app.get(WorkflowStateService);
  const stigmergy = app.get(StigmergyService);
  
  container.registerInstance(WorkflowStateService, workflowState);
  container.registerInstance(StigmergyService, stigmergy);
  
  // Core Components & Tools
  container.register("AgentExecutor", { useClass: AgentExecutor });
  container.register(AgentExecutor, { useClass: AgentExecutor });
  container.register(OrionOrchestrator, { useClass: OrionOrchestrator });
  container.register(GeometryTool, { useClass: GeometryTool });
  container.register('Logger', { useValue: console });

  // Agenten-Registry laden
  registerAllAgents();

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT, () => {
    console.log(`🚀 [NEXUS] Core online auf Port ${PORT}`);
  });
}
bootstrap().catch(err => console.error("💥 BOOTSTRAP ERROR:", err));
