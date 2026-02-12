"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const OrionOrchestrator_1 = require("../orchestrator/OrionOrchestrator");
const OrchestrationHistoryService_1 = require("../services/OrchestrationHistoryService");
const router = (0, express_1.Router)();
router.post('/stream', async (req, res) => {
    try {
        const { agent, input, userGoal, sessionData } = req.body;
        if (!userGoal || typeof userGoal !== 'string' || userGoal.trim() === '') {
            return res.status(400).json({ error: 'Body must contain "userGoal" as non-empty string.' });
        }
        // Fallback-Werte für fehlende Parameter
        const safeInput = input || '';
        const userId = sessionData?.userId || 'default-user';
        // Starte Run mit korrekten Parametern
        let runId = null;
        try {
            runId = await OrchestrationHistoryService_1.historyService.startRun(agent, safeInput, userId);
        }
        catch (error) {
            console.warn('History startRun failed, continuing without logging:', error);
        }
        // Set up streaming response
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        const orchestrator = tsyringe_1.container.resolve(OrionOrchestrator_1.OrionOrchestrator);
        const result = await orchestrator.processRequestStreaming({
            agent,
            input: safeInput,
            sessionData
        }, (chunk) => {
            res.write(chunk);
        });
        // Beende Run mit korrekten Parametern
        if (runId) {
            try {
                await OrchestrationHistoryService_1.historyService.completeRun(runId, JSON.stringify(result), result.success);
            }
            catch (error) {
                console.warn('History completeRun failed:', error);
            }
        }
        res.end();
    }
    catch (error) {
        // Logge Fehler
        console.error('Orchestration error:', error);
        // Versuche Fehler zu loggen (falls möglich)
        try {
            // @ts-ignore - wir ignorieren nicht-existente Methoden
            if (OrchestrationHistoryService_1.historyService.logError) {
                await OrchestrationHistoryService_1.historyService.logError('unknown-run-id', error);
            }
        }
        catch (logError) {
            console.warn('Failed to log error to history service:', logError);
        }
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
