import { Router } from 'express';
import { AiOrchestratorService } from '../../services/AiOrchestratorService.js';
const router = Router();
const orchestrator = new AiOrchestratorService();
router.post('/execute', async (req, res) => {
    try {
        const result = await orchestrator.orchestrate(req.body);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
export default router;
//# sourceMappingURL=orchestration.controller.js.map