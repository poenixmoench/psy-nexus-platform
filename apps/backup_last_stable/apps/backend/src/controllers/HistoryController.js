"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OrchestrationHistoryService_1 = require("../services/OrchestrationHistoryService");
class HistoryController {
    /**
     * Holt die neuesten Orchestrierungs-Runs
     */
    async getLatestRuns(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const userId = req.user?.id || 'Alpha-Terminal-Prime'; // Fallback für Testzwecke
            const runs = await OrchestrationHistoryService_1.historyService.getRunsForUser(userId, limit);
            res.json({
                success: true,
                count: runs.length,
                data: runs
            });
        }
        catch (error) {
            console.error(`[HistoryController] getLatestRuns: ${error.message}`);
            res.status(500).json({ success: false, error: 'Fehler beim Abrufen der History' });
        }
    }
    /**
     * Holt Details zu einem spezifischen Run
     */
    async getRunDetails(req, res) {
        const { runId } = req.params;
        try {
            const run = await OrchestrationHistoryService_1.historyService.getRun(runId);
            if (!run) {
                res.status(404).json({ success: false, error: 'Run nicht gefunden' });
                return;
            }
            res.json({ success: true, data: run });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Fehler beim Abrufen des Runs' });
        }
    }
}
exports.default = new HistoryController();
