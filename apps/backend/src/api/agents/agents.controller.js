"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = (0, express_1.Router)();
// Health check endpoint (for the Nginx reverse proxy test)
router.get('/health', function (req, res) {
    // Wenn dieser Endpunkt erreicht wird, ist der Backend-Service UP
    res.json({
        status: 'healthy',
        service: 'agents-api',
        database: 'connected', // Annahme, da DB up ist
        ollama_status: 'unhealthy', // Ollama ist nicht gestartet und sollte fehlschlagen
    });
});
// List agents endpoint (for the second test)
router.get('/list', function (req, res) {
    res.json({
        success: true,
        agents: [
            { id: 1, name: "Nexus Orchestrator", status: "ready" },
        ]
    });
});
exports.default = router;
