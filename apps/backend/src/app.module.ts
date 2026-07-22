import { AgentDiagnosticsService } from './services/AgentDiagnosticsService';
import { Module } from '@nestjs/common';
import { PrismaService } from './db/PrismaService';
import { WorkflowStateService } from './services/WorkflowStateService';
import { StigmergyService } from './services/StigmergyService';
import { AIService } from './services/AIService';
import { AgentsController } from './controllers/agents.controller';
import { ReleaseController } from './controllers/ReleaseController';

@Module({
  controllers: [AgentsController, ReleaseController],
  providers: [PrismaService, WorkflowStateService, StigmergyService, AIService
    ,AgentDiagnosticsService],
  exports: [PrismaService, WorkflowStateService, StigmergyService, AIService]
})
export class AppModule {}
