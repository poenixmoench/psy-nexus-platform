import { Router } from 'express';
import agentRoutes from './agentRoutes';
import agentController from '../controllers/agent.controller';
import authRoutes from './authRoutes';
import healthRoutes from './health';
import orchestrateRoutes from './orchestrate';
import historyRoutes from './history-routes';

const router = Router();

// 1. Health & Auth zuerst
if (healthRoutes) router.use('/health', healthRoutes);
if (authRoutes) router.use('/auth', authRoutes);

// 2. Agenten-Logik mit Priorisierung
if (agentRoutes) {
    // Bedient: GET /api/agents (Liste)
    router.use('/agents', agentRoutes);
}

if (agentController) {
    // Bedient: /api/agents/workflow/* und /api/agents/process
    // Da agentController intern schon '/workflow' nutzt, passt das hier perfekt.
    router.use('/agents', agentController);
}

// 3. Orchestrierung & History
if (orchestrateRoutes) router.use('/orchestrate', orchestrateRoutes);
router.use('/history', historyRoutes);

router.get('/', (req, res) => {
  res.json({ status: 'online', service: 'Psy-Nexus Gateway' });
});

export default router;
