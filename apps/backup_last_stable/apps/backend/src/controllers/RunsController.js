"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConversationService_1 = __importDefault(require("../services/ConversationService"));
const LiveRunService_1 = __importDefault(require("../services/LiveRunService"));
class RunsController {
    /**
     * Gets the conversation for a specific runId.
     * @param req - The request object.
     * @param res - The response object.
     */
    async getRunConversation(req, res) {
        const { runId } = req.params;
        if (!runId) {
            res.status(400).json({ success: false, error: 'Ungültige runId' });
            return;
        }
        try {
            const conversation = await ConversationService_1.default.getConversationByRunId(runId);
            res.json({ success: true, data: conversation });
        }
        catch (error) {
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
    async startLiveRun(req, res) {
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
            LiveRunService_1.default.startStreamingSimulation(runId, agentName);
            res.json({
                success: true,
                runId,
                agentName,
                message: 'Live-Run gestartet',
                wsUrl: `wss://psy-nexus.live/ws/live/${runId}`,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error(`[RunsController] startLiveRun: ${errorMessage}`);
            res.status(500).json({ success: false, error: 'Fehler beim Starten des Live-Runs' });
        }
    }
    /**
     * Gibt Status aller aktiven Live-Runs zurück
     */
    async getLiveRunsStatus(req, res) {
        try {
            const runIds = LiveRunService_1.default.getAllRunIds();
            const count = LiveRunService_1.default.getConnectionCount();
            res.json({
                success: true,
                activeRuns: count,
                runIds,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error(`[RunsController] getLiveRunsStatus: ${errorMessage}`);
            res.status(500).json({ success: false, error: 'Fehler beim Abrufen des Status' });
        }
    }
}
exports.default = new RunsController();
