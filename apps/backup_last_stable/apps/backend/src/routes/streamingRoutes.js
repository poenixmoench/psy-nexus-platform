"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const streamingChatController_1 = require("../controllers/streamingChatController");
const router = express_1.default.Router();
// Route für den eigentlichen Orchestrierungs-Endpunkt
router.post('/orchestrate', streamingChatController_1.streamingChatController.startChat);
// Health Check Route (von früher)
router.get('/health', streamingChatController_1.streamingChatController.healthCheck);
exports.default = router;
