import { Router, Request, Response } from 'express';
import { AgentRunService } from '../services/AgentRunService';

const router = Router();
const service = AgentRunService.getInstance();

// POST /api/v2/run - Workflow starten
router.post('/', async (req: Request, res: Response) => {
  try {
    const { masterAgentName, initialPrompt } = req.body;
    
    if (!masterAgentName || !initialPrompt) {
      return res.status(400).json({ 
        error: 'masterAgentName and initialPrompt required' 
      });
    }

    console.log(`📍 Starting workflow: ${masterAgentName}`);
    const runId = await service.startWorkflow('master-agent-1', initialPrompt);
    
    res.status(202).json({
      success: true,
      runId,
      wsUrl: `ws://localhost:3001/ws/run?runId=${runId}`,
      statusUrl: `http://localhost:3001/api/v2/run/${runId}/status`,
      message: 'Workflow started - connect to WebSocket for live updates'
    });
  } catch (error: any) {
    console.error('❌ Error starting workflow:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v2/run/:runId/status - Status abrufen
router.get('/:runId/status', (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const status = service.getRunStatus(runId);
    
    if (!status) {
      return res.status(404).json({ error: `Run ${runId} not found` });
    }
    
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
