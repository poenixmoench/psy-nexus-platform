import { Request, Response, Router } from 'express';
import { historyService } from '../services/OrchestrationHistoryService';

const router = Router();

router.get('/api/runs', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const runs = await historyService.listRuns(limit, offset);
    res.json(runs);
  } catch (error: any) {
    console.error('Error listing runs:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/runs/:id', async (req: Request, res: Response) => {
  try {
    const runId = parseInt(req.params.id);
    if (isNaN(runId)) {
      return res.status(400).json({ error: 'Invalid run ID' });
    }
    const run = await historyService.getRun(runId);
    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }
    res.json(run);
  } catch (error: any) {
    console.error('Error getting run:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/runs/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const runs = await historyService.searchRuns(query);
    res.json(runs);
  } catch (error: any) {
    console.error('Error searching runs:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const stats = await historyService.getStatistics();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
