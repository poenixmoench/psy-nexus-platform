import { Router } from 'express';
import HistoryController from '../controllers/HistoryController';

const router = Router();

// Route: GET /api/history/latest
router.get('/latest', HistoryController.getLatestRuns.bind(HistoryController));

// Route: GET /api/history/run/:runId
router.get('/run/:runId', HistoryController.getRunDetails.bind(HistoryController));

export default router;
