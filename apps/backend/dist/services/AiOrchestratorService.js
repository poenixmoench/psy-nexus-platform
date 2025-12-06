import { Logger } from '../utils/logger.js';
export class AiOrchestratorService {
    static instance;
    logger = new Logger();
    constructor() {
        this.logger.info('AiOrchestratorService initialisiert');
    }
    static getInstance() {
        if (!AiOrchestratorService.instance) {
            AiOrchestratorService.instance = new AiOrchestratorService();
        }
        return AiOrchestratorService.instance;
    }
    async handleUserQuery(prompt, socketId) {
        this.logger.info(ORCHESTRIERUNG, GESTARTET - Socket, $, { socketId });
        // TODO: Qwen Integration
        this.logger.info('ORCHESTRIERUNG ABGESCHLOSSEN');
    }
}
