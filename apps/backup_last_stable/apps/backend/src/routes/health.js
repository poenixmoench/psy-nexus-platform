"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
// GET /health - Einfacher Health-Check-Endpunkt
router.get('/', (req, res) => {
    // Prüft grundlegende Server-Konnektivität
    // Optional: Hier könntest du auch DB-Connectivity prüfen
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.healthRoutes = router;
exports.default = router;
