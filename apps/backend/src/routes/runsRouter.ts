import express, { Request, Response } from 'express';
import runsController from '../controllers/RunsController';

const router = express.Router();

//  [OK]  GET Conversation by runId
router.get('/api/runs/:runId/conversation', async (req: Request, res: Response) => {
  await runsController.getRunConversation(req, res);
});

export default router;
