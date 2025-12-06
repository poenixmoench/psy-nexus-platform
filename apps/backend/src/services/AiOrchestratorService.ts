import { Logger } from '../utils/logger.js';

export class AiOrchestratorService {
private static instance: AiOrchestratorService;
private logger = new Logger();

private constructor() {
this.logger.info('AiOrchestratorService initialisiert');
}

public static getInstance(): AiOrchestratorService {
if (!AiOrchestratorService.instance) {
AiOrchestratorService.instance = new AiOrchestratorService();
}
return AiOrchestratorService.instance;
}

public async handleUserQuery(prompt: string, socketId: string): Promise<void> {
this.logger.info(ORCHESTRIERUNG GESTARTET - Socket: ${socketId});
// TODO: Qwen Integration
this.logger.info('ORCHESTRIERUNG ABGESCHLOSSEN');
}
}
