import { Router } from 'express';
import { AgentController } from '../controllers/AgentController';

const router = Router();

router.get('/', AgentController.getAllAgents);
router.get('/:id', AgentController.getAgentStatus);

export default router;
