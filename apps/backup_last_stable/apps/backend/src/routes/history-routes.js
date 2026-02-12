"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const HistoryController_1 = __importDefault(require("../controllers/HistoryController"));
const router = (0, express_1.Router)();
// Route: GET /api/history/latest
router.get('/latest', HistoryController_1.default.getLatestRuns.bind(HistoryController_1.default));
// Route: GET /api/history/run/:runId
router.get('/run/:runId', HistoryController_1.default.getRunDetails.bind(HistoryController_1.default));
exports.default = router;
