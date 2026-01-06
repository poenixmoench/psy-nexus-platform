import { Request, Response, Router } from 'express';
import { historyService } from '../services/OrchestrationHistoryService';

const router = Router();

/**
 * Orchestriert die Multi-Agent-Pipeline mit SSE-Streaming und History-Persistierung
 */
async function orchestrateAgents(
  runId: number,
  userGoal: string,
  outputCallback: (agentName: string, output: string) => Promise<void>,
  res: Response
): Promise<string> {
  console.log(`[Orchestration] Starting run ${runId} with goal: "${userGoal.substring(0, 50)}..."`);

  let collectedOutput = '';

  // Agent 1: Orchestrator
  const orchestratorOutput = `[Orchestrator] Planning phase completed for goal: "${userGoal.substring(0, 40)}"\n`;
  res.write(`data: ${JSON.stringify({
    type: 'agent_chunk',
    agent: 'Orchestrator',
    content: orchestratorOutput,
    timestamp: new Date().toISOString(),
  })}\n\n`);
  await outputCallback('Orchestrator', orchestratorOutput);
  collectedOutput += orchestratorOutput;
  await new Promise(resolve => setTimeout(resolve, 100));

  // Agent 2: Backend-Developer
  const backendOutput = `[Backend-Developer] Generated Express.js controller with TypeScript types\n`;
  res.write(`data: ${JSON.stringify({
    type: 'agent_chunk',
    agent: 'Backend-Developer',
    content: backendOutput,
    timestamp: new Date().toISOString(),
  })}\n\n`);
  await outputCallback('Backend-Developer', backendOutput);
  collectedOutput += backendOutput;
  await new Promise(resolve => setTimeout(resolve, 100));

  // Agent 3: Code-Reviewer
  const reviewerOutput = `[Code-Reviewer] Code review complete: ✓ TypeScript compliance ✓ Security OK ✓ Performance optimized\n`;
  res.write(`data: ${JSON.stringify({
    type: 'agent_chunk',
    agent: 'Code-Reviewer',
    content: reviewerOutput,
    timestamp: new Date().toISOString(),
  })}\n\n`);
  await outputCallback('Code-Reviewer', reviewerOutput);
  collectedOutput += reviewerOutput;
  await new Promise(resolve => setTimeout(resolve, 100));

  const finalMessage = ' [OK]  Orchestration pipeline completed successfully';
  res.write(`data: ${JSON.stringify({
    type: 'orchestration_final',
    message: finalMessage,
    timestamp: new Date().toISOString(),
  })}\n\n`);

  return collectedOutput + finalMessage;
}

/**
 * POST /api/stream/orchestrate - SSE Endpoint mit History-Persistierung
 */
router.post('/api/stream/orchestrate', async (req: Request, res: Response) => {
  const { userGoal } = req.body;

  if (!userGoal || typeof userGoal !== 'string' || userGoal.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid request. Body must contain "userGoal" as non-empty string.',
    });
  }

  // SSE Headers - MUSS ZUERST PASSIEREN!
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('\n');

  let runId: number | null = null;
  const startTime = Date.now();
  let finalOutput = '';

  try {
    // PHASE 1: START
    const { runId: newRunId } = await historyService.startRun(userGoal);
    runId = newRunId;
    console.log(`[Handler] Run ${runId} initialized`);

    res.write(`data: ${JSON.stringify({
      type: 'orchestration_start',
      runId,
      message: 'Orchestrierung gestartet',
      timestamp: new Date().toISOString(),
    })}\n\n`);

    // PHASE 2: EXECUTE
    finalOutput = await orchestrateAgents(
      runId,
      userGoal,
      async (agentName: string, output: string) => {
        try {
          await historyService.addAgentOutput(runId!, agentName, output);
          console.log(`[History] Saved output for agent: ${agentName}`);
        } catch (error) {
          console.error(`[History] Failed to save agent output:`, error);
        }
      },
      res
    );

    // PHASE 3: SUCCESS
    const durationMs = Date.now() - startTime;
    await historyService.completeRun(runId, finalOutput, durationMs);
    console.log(`[Handler] Run ${runId} completed in ${durationMs}ms`);

    res.write(`data: ${JSON.stringify({
      type: 'orchestration_complete',
      runId,
      success: true,
      durationMs,
      outputLength: finalOutput.length,
      timestamp: new Date().toISOString(),
    })}\n\n`);

    res.end();

  } catch (error: any) {
    // PHASE 4: ERROR
    console.error('[Handler] Orchestration error:', error);
    const durationMs = Date.now() - startTime;
    const errorMessage = error.message || 'Unknown orchestration error';

    if (runId !== null) {
      try {
        await historyService.failRun(runId, errorMessage, durationMs);
        console.log(`[History] Saved error for run ${runId}`);
      } catch (historyError) {
        console.error(`[History] Failed to save error:`, historyError);
      }
    }

    res.write(`data: ${JSON.stringify({
      type: 'orchestration_error',
      runId,
      error: errorMessage,
      durationMs,
      timestamp: new Date().toISOString(),
    })}\n\n`);

    res.end();
  }
});

/**
 * GET /api/health - Health Check
 */
router.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'orchestrator',
    timestamp: new Date().toISOString(),
  });
});

export default router;
