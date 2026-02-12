"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agentRoutes_1 = __importDefault(require("./agentRoutes"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const health_1 = __importDefault(require("./health"));
const orchestrate_1 = __importDefault(require("./orchestrate"));
const history_routes_1 = __importDefault(require("./history-routes"));
const router = (0, express_1.Router)();
// Typsichere Einbindung der Routen
// Wir nutzen hier die Variablen, die wir importiert haben
if (health_1.default)
    router.use('/health', health_1.default);
if (agentRoutes_1.default)
    router.use('/agents', agentRoutes_1.default);
if (authRoutes_1.default)
    router.use('/auth', authRoutes_1.default);
if (orchestrate_1.default)
    router.use('/orchestrate', orchestrate_1.default);
router.use('/history', history_routes_1.default);
router.get('/', (req, res) => {
    res.json({ status: 'online', service: 'Psy-Nexus Gateway' });
});
exports.default = router;
