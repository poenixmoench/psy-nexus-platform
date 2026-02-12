"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const AgentService_1 = require("../services/AgentService");
const router = (0, express_1.Router)();
// Geändert von '/list' auf '/'
router.get('/', async (req, res) => {
    try {
        const agentService = tsyringe_1.container.resolve(AgentService_1.AgentService);
        const agents = await agentService.getAllAgents();
        res.json(agents);
    }
    catch (error) {
        console.error('❌ Fehler beim Laden der Agenten:', error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
