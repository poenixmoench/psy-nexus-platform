import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import { OrionOrchestrator } from '../orchestrator/OrionOrchestrator';
import { historyService } from '../services/OrchestrationHistoryService';

const router = Router();

router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { agent, input, userGoal, sessionData } = req.body;

    if (!userGoal || typeof userGoal !== 'string' || userGoal.trim() === '') {
      return res.status(400).json({ error: 'Body must contain "userGoal" as non-empty string.' });
    }

    // Fallback-Werte für fehlende Parameter
    const safeInput = input || '';
    const userId = sessionData?.userId || 'default-user';

    // Starte Run mit korrekten Parametern
    let runId: string | null = null;
    try {
      runId = await historyService.startRun(agent, safeInput, userId);
    } catch (error) {
      console.warn('History startRun failed, continuing without logging:', error);
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const orchestrator = container.resolve(OrionOrchestrator);

    const result = await orchestrator.processRequestStreaming({
      agent,
      input: safeInput,
      sessionData
    }, (chunk) => {
      res.write(chunk);
    });

    // Beende Run mit korrekten Parametern
    if (runId) {
      try {
        await historyService.completeRun(runId, JSON.stringify(result), result.success);
      } catch (error) {
        console.warn('History completeRun failed:', error);
      }
    }

    res.end();

  } catch (error: any) {
    // Logge Fehler
    console.error('Orchestration error:', error);

    // Versuche Fehler zu loggen (falls möglich)
    try {
      // @ts-ignore - wir ignorieren nicht-existente Methoden
      if (historyService.logError) {
        await historyService.logError('unknown-run-id', error);
      }
    } catch (logError) {
      console.warn('Failed to log error to history service:', logError);
    }

    res.status(500).json({ error: error.message });
  }
});

export default router;
