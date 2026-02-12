import { Request, Response } from 'express';
import { historyService } from '../services/OrchestrationHistoryService';

class HistoryController {
  /**
   * Holt die neuesten Orchestrierungs-Runs
   */
  public async getLatestRuns(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const userId = (req as any).user?.id || 'Alpha-Terminal-Prime'; // Fallback für Testzwecke
      
      const runs = await historyService.getRunsForUser(userId, limit);
      
      res.json({
        success: true,
        count: runs.length,
        data: runs
      });
    } catch (error: any) {
      console.error(`[HistoryController] getLatestRuns: ${error.message}`);
      res.status(500).json({ success: false, error: 'Fehler beim Abrufen der History' });
    }
  }

  /**
   * Holt Details zu einem spezifischen Run
   */
  public async getRunDetails(req: Request, res: Response): Promise<void> {
    const { runId } = req.params;
    try {
      const run = await historyService.getRun(runId as string);
      if (!run) {
        res.status(404).json({ success: false, error: 'Run nicht gefunden' });
        return;
      }
      res.json({ success: true, data: run });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Fehler beim Abrufen des Runs' });
    }
  }
}

export default new HistoryController();
