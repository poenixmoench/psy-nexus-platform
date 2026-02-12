import { Request, Response, Router } from 'express';
import { KnownAgentTypeValues } from '@shared/types/AgentTypes';

interface Agent {
  name: string; // Hier nutzen wir den String aus KnownAgentTypeValues
}

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    // 🎯 Mobilisierung der echten Agenten-Elite
    const agents: Agent[] = KnownAgentTypeValues.map(name => ({ name }));
    console.log(`[${new Date().toISOString()}] 🔍 API-Abruf: ${agents.length} Agenten geliefert.`);
    res.json(agents);
  } catch (err: any) {
    console.error("❌ Kritischer Fehler beim Agenten-Abruf:", err);
    res.status(500).json({ error: "Agent Registry Unavailable", message: err.message });
  }
});

export default router;
