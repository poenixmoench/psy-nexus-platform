"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamingChatController = void 0;
const OllamaStreamService_1 = require("../services/OllamaStreamService"); // KORREKTUR: Verwenden des Named Exports 'ollamaService'
class StreamingChatController {
    async startChat(req, res) {
        const { userGoal } = req.body;
        if (!userGoal) {
            res.status(400).json({ error: "Missing required field: userGoal" });
            return;
        }
        // Setzen der Header für Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        console.log(`Starting orchestration for goal: ${userGoal}`);
        try {
            // Verwenden des importierten ollamaService
            await OllamaStreamService_1.ollamaService.streamOrchestration(userGoal, res);
        }
        catch (error) {
            console.error('Error during orchestration streaming:', error);
            res.write(`data: ${JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : 'An unknown error occurred' })}\n\n`);
            if (!res.writableEnded) {
                res.status(500);
                res.end();
            }
        }
    }
    healthCheck(req, res) {
        res.status(200).json({ status: 'OK', message: 'Backend is running' });
    }
}
exports.streamingChatController = new StreamingChatController();
