import { Response } from 'express';
import { Readable } from 'stream';
import { ollamaService } from './OllamaStreamService';

export class OrchestratorService {
    public async orchestrate(userGoal: string, res: Response): Promise<void> {
        res.write('data: ' + JSON.stringify({ type: 'start', message: 'Orchestration started' }) + '\n\n');
        
        try {
            await ollamaService.streamOrchestration(userGoal, res);
        } catch (error) {
            res.write('data: ' + JSON.stringify({ type: 'error', message: 'Orchestration failed' }) + '\n\n');
            res.end();
        }
    }

    private sendSseEvent(res: Response, type: string, data: any): void {
        res.write('data: ' + JSON.stringify({ type, ...data }) + '\n\n');
    }
}

export const orchestratorService = new OrchestratorService();
