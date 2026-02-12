"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const AgentRegistry_1 = require("../agents/AgentRegistry");
const StigmergyService_1 = require("../services/StigmergyService");
const OrchestratorService_1 = require("../services/OrchestratorService");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// Workflow starten
router.post('/workflow/start', async (req, res) => {
    try {
        const { initialPrompt } = req.body;
        const orchestrator = tsyringe_1.container.resolve(OrchestratorService_1.OrchestratorService);
        await orchestrator.startWorkflow({ prompt: initialPrompt });
        res.json({
            success: true,
            message: 'Workflow gestartet',
            status: orchestrator.getStatus()
        });
    }
    catch (err) {
        console.error('[AgentController] Fehler beim Starten des Workflows:', err);
        res.status(500).json({ error: err.message });
    }
});
// Status abfragen
router.get('/workflow/status', (req, res) => {
    try {
        const orchestrator = tsyringe_1.container.resolve(OrchestratorService_1.OrchestratorService);
        res.json({ success: true, status: orchestrator.getStatus() });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Gate genehmigen (mit String-Cast Fix)
router.post('/workflow/approve/:gate', (req, res) => {
    try {
        const gate = req.params.gate;
        const orchestrator = tsyringe_1.container.resolve(OrchestratorService_1.OrchestratorService);
        orchestrator.approveGate(gate);
        res.json({ success: true, message: `Gate ${gate} genehmigt` });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Gate ablehnen (mit String-Cast Fix)
router.post('/workflow/reject/:gate', (req, res) => {
    try {
        const gate = req.params.gate;
        const { reason } = req.body;
        const orchestrator = tsyringe_1.container.resolve(OrchestratorService_1.OrchestratorService);
        orchestrator.rejectGate(gate, reason || 'Kein Grund angegeben');
        res.json({ success: true, message: `Gate ${gate} abgelehnt` });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Einzelner Agent (Legacy / Direct Access)
router.post('/process', async (req, res) => {
    try {
        const { agentType, content, previousHash } = req.body;
        const AgentToken = AgentRegistry_1.AGENT_MAP[agentType];
        if (!AgentToken)
            return res.status(400).json({ error: "Agent nicht gefunden" });
        const currentHash = crypto_1.default.createHash('sha256').update(content || '').digest('hex');
        const agent = tsyringe_1.container.resolve(AgentToken);
        const stigmergyService = tsyringe_1.container.resolve(StigmergyService_1.StigmergyService);
        const context = {
            previousHash: previousHash || 'genesis',
            currentHash: currentHash,
            diffContent: content,
            activeTags: await stigmergyService.getActiveTags()
        };
        const result = await agent.processDelta(context);
        if (result.newTags && result.newTags.length > 0) {
            await stigmergyService.saveTags(result.newTags);
        }
        res.json({ success: true, agent: agentType, data: result, hash: currentHash });
    }
    catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});
exports.default = router;
