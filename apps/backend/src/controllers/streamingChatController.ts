import { Request, Response } from 'express';
import { ollamaService } from '../services/OllamaStreamService'; // KORREKTUR: Verwenden des Named Exports 'ollamaService'

class StreamingChatController {

     public async startChat(req: Request, res: Response): Promise<void> {
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
              await ollamaService.streamOrchestration(userGoal, res);

          } catch (error) {
              console.error('Error during orchestration streaming:', error);
              res.write(`data: ${JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : 'An unknown error occurred' })}\n\n`);
              if (!res.writableEnded) {
                  res.status(500); 
                  res.end();
              }
          }
     }

     public healthCheck(req: Request, res: Response): void {
          res.status(200).json({ status: 'OK', message: 'Backend is running' });
     }
}

export const streamingChatController = new StreamingChatController();
