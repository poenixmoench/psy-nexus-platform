import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { OrionOrchestrator } from '../orchestrator/OrionOrchestrator';

class StreamingChatController {
    public async startChat(req: Request, res: Response): Promise<void> {
        const { userGoal, sessionData } = req.body;

        if (!userGoal) {
            res.status(400).json({ error: "Missing required field: userGoal" });
            return;
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        console.log(`🚀 [SSE] Orchestrierung gestartet: ${userGoal}`);

        try {
            const orchestrator = container.resolve(OrionOrchestrator);
            
            // Wir nutzen den Orion-Orchestrator für den neuen Workflow
            await orchestrator.runWorkflow({
                goal: userGoal,
                sessionData: sessionData || {},
                onChunk: (chunk) => {
                    res.write(`data: ${JSON.stringify({ type: 'token', content: chunk })}\n\n`);
                },
                onTag: (tag) => {
                    res.write(`data: ${JSON.stringify({ type: 'tag', content: tag })}\n\n`);
                }
            });

            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
            res.end();
        } catch (error: any) {
            console.error('❌ SSE-Stream Fehler:', error);
            res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
            res.end();
        }
    }
}

export const streamingChatController = new StreamingChatController();
