import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { container } from 'tsyringe';
import { OrionOrchestrator } from '../orchestrator/OrionOrchestrator';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Controller()
export class AgentsController {

  @Get(['agents', 'orchestrate/agents', 'api/agents'])
  findAll() {
    return [
      { name: 'ORION_AGENT', status: 'active' },
      { name: 'PLAN_AGENT', status: 'active' },
      { name: 'DESIGN_ALCHEMIST_AGENT', status: 'active' },
      { name: 'FRONTEND_MEISTER_AGENT', status: 'active' },
      { name: 'BACKEND_ARCHITEKT_AGENT', status: 'active' },
      { name: 'QA_GURU_AGENT', status: 'active' },
      { name: 'OPTIMIERER_AGENT', status: 'active' },
      { name: 'DOKUMENTATION_AGENT', status: 'active' }
    ];
  }

  @Post(['orchestrate/stream', 'agents/chat/stream', 'api/orchestrate/stream'])
  async streamChat(@Body() body: any, @Res() res: Response) {
    const userGoal = body?.userGoal || body?.goal || body?.message || body?.input;
    const sessionData = body?.sessionData || {};
    const targetAgent = body.agentName || body.agent || 'ORION_AGENT';
    const workflowId = body.workflowId || uuidv4();
    const usePreviousOutput = body.usePreviousOutput === true;

    if (!userGoal) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: "Input fehlt." });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      const orchestrator = container.resolve(OrionOrchestrator);

      // Initiales Event mit der WorkflowId
      res.write(`data: ${JSON.stringify({ workflowId })}\n\n`);

      // Token-Stream vom Orchestrator direkt an den Client weiterreichen
      await orchestrator.processRequestStreaming(
        { workflowId, agent: targetAgent, input: userGoal, sessionData },
        (token: string) => {
          res.write(`data: ${token}\n\n`);
        },
      );

      // Abschluss-Signal
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error("[AgentsController] Stream Error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }

  @Post('agents/ollama/unload')
  async unloadModel() {
    try {
      await axios.post('http://localhost:11434/api/chat', {
        model: 'qwen3:32b',
        keep_alive: 0
      });
      return { success: true, message: 'Modell entladen' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }


  @Get()
  root() {
    return {
      status: 'ok',
      service: 'psy-backend',
      timestamp: Date.now(),
      agentsOnline: true,
      routes: ['/agents', '/agents/health', '/api/agents', '/api/agents/health']
    };
  }

  @Get(['agents/health', 'api/agents/health'])
  health() {
    return {
      status: 'ok',
      service: 'psy-backend',
      timestamp: Date.now(),
      agentsOnline: true
    };
  }
}
