import { Router, Request, Response } from 'express';
import { AgentOrchestrator } from '../services/AgentOrchestrator';
import { authDevMiddleware } from '../middleware/auth';

const router = Router();
const orchestrator = new AgentOrchestrator();

router.use(authDevMiddleware);

router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { agent, prompt, context } = req.body;
    if (!agent || !prompt) return res.status(400).json({ error: 'Agent and prompt are required' });
    const result = await orchestrator.executeAgent(agent, prompt, context);
    res.json({ success: true, agent, prompt, response: result.response, code: result.code || null, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Agent execution error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/list', (req: Request, res: Response) => {
  res.json({ agents: ['orchestrator', 'planner', 'coder', 'tester', 'architect', 'documenter', 'optimizer'], status: 'ready' });
});

router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await orchestrator.getHealth();
    res.json(health);
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
