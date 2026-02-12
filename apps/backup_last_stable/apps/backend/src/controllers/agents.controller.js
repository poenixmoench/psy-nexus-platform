"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AgentTypes_1 = require("@shared/types/AgentTypes");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    try {
        // 🎯 Mobilisierung der echten Agenten-Elite
        const agents = AgentTypes_1.KnownAgentTypeValues.map(name => ({ name }));
        console.log(`[${new Date().toISOString()}] 🔍 API-Abruf: ${agents.length} Agenten geliefert.`);
        res.json(agents);
    }
    catch (err) {
        console.error("❌ Kritischer Fehler beim Agenten-Abruf:", err);
        res.status(500).json({ error: "Agent Registry Unavailable", message: err.message });
    }
});
exports.default = router;
