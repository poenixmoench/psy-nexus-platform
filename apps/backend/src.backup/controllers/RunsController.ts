import { Request, Response } from 'express';
import conversationService from '../services/ConversationService';
import LiveRunService from '../services/LiveRunService';

class RunsController {
  /**
   * Gets the conversation for a specific runId.
   * @param req - The request object.
   * @param res - The response object.
   */
  public async getRunConversation(req: Request, res: Response): Promise<void> {
    const { runId } = req.params;
    if (!runId) {
      res.status(400).json({ success: false, error: 'Ungültige runId' });
      return;
    }

    try {
      const conversation = await conversationService.getConversationByRunId(runId);
      res.json({ success: true, data: conversation });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`[RunsController] getRunConversation: ${errorMessage}`);
      res.status(404).json({ success: false, error: 'Konversation nicht gefunden' });
    }
  }

  /**
   * Startet einen neuen Live-Run mit WebSocket-Streaming
   * @param req - The request object.
   * @param res - The response object.
   */
  public async startLiveRun(req: Request, res: Response): Promise<void> {
    const { agentName } = req.params;

    if (!agentName) {
      res.status(400).json({ success: false, error: 'Agent-Name erforderlich' });
      return;
    }

    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const runId = `live_run_${timestamp}_${random}`;

      console.log(`[RunsController] Starte Live-Run mit Agent: ${agentName}, runId: ${runId}`);

      await new Promise(resolve => setTimeout(resolve, 500));
      LiveRunService.startStreamingSimulation(runId, agentName);

      res.json({
        success: true,
        runId,
        agentName,
        message: 'Live-Run gestartet',
        wsUrl: `ws://157.180.31.27:3001/ws/live/${runId}`,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`[RunsController] startLiveRun: ${errorMessage}`);
      res.status(500).json({ success: false, error: 'Fehler beim Starten des Live-Runs' });
    }
  }

  /**
   * Gibt Status aller aktiven Live-Runs zurück
   */
  public async getLiveRunsStatus(req: Request, res: Response): Promise<void> {
    try {
      const runIds = LiveRunService.getAllRunIds();
      const count = LiveRunService.getConnectionCount();

      res.json({
        success: true,
        activeRuns: count,
        runIds,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`[RunsController] getLiveRunsStatus: ${errorMessage}`);
      res.status(500).json({ success: false, error: 'Fehler beim Abrufen des Status' });
    }
  }
}

export default new RunsController();
