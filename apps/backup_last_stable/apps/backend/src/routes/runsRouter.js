"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RunsController_1 = __importDefault(require("../controllers/RunsController"));
const router = express_1.default.Router();
//  [OK]  GET Conversation by runId
router.get('/api/runs/:runId/conversation', async (req, res) => {
    await RunsController_1.default.getRunConversation(req, res);
});
exports.default = router;
