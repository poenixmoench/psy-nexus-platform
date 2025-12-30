import { Router, Request, Response } from 'express';
import AgentRunService from '../services/AgentRunService';
const router = Router();
router.post('/execute', async (req: Request, res: Response) => {
  const { sessionId, userInput } = req.body;
  if (!sessionId || !userInput) return res.status(400).json({ error: 'Missing fields' });
  try {
    const result = await AgentRunService.executeRun(sessionId, userInput);
    res.json(result);
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});
export default router;
