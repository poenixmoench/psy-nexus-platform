import 'reflect-metadata';
import { Router } from 'express';
import { container } from 'tsyringe';
import { AgentService } from '../services/AgentService';

const router = Router();

// Geändert von '/list' auf '/'
router.get('/', async (req, res) => {
  try {
    const agentService = container.resolve(AgentService);
    const agents = await agentService.getAllAgents();
    res.json(agents);
  } catch (error: any) {
    console.error('❌ Fehler beim Laden der Agenten:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
