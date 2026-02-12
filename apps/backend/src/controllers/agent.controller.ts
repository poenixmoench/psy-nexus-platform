import { Request, Response, Router } from 'express';
import { container } from 'tsyringe';
import { AGENT_MAP } from '../agents/AgentRegistry';
import { StigmergyService } from '../services/StigmergyService';
import { OrchestratorService } from '../services/OrchestratorService';
import { ContextDelta } from '@shared/types/AgentTypes';
import crypto from 'crypto';

const router = Router();

// Workflow starten
router.post('/workflow/start', async (req: Request, res: Response) => {
  try {
    const { initialPrompt } = req.body;
    const orchestrator = container.resolve(OrchestratorService);
    await orchestrator.startWorkflow({ prompt: initialPrompt });

    res.json({
      success: true,
      message: 'Workflow gestartet',
      status: orchestrator.getStatus()
    });
  } catch (err: any) {
    console.error('[AgentController] Fehler beim Starten des Workflows:', err);
    res.status(500).json({ error: err.message });
  }
});

// Status abfragen
router.get('/workflow/status', (req: Request, res: Response) => {
  try {
    const orchestrator = container.resolve(OrchestratorService);
    res.json({ success: true, status: orchestrator.getStatus() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Gate genehmigen (mit String-Cast Fix)
router.post('/workflow/approve/:gate', (req: Request, res: Response) => {
  try {
    const gate = req.params.gate as string;
    const orchestrator = container.resolve(OrchestratorService);
    orchestrator.approveGate(gate);
    res.json({ success: true, message: `Gate ${gate} genehmigt` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Gate ablehnen (mit String-Cast Fix)
router.post('/workflow/reject/:gate', (req: Request, res: Response) => {
  try {
    const gate = req.params.gate as string;
    const { reason } = req.body;
    const orchestrator = container.resolve(OrchestratorService);
    orchestrator.rejectGate(gate, reason || 'Kein Grund angegeben');
    res.json({ success: true, message: `Gate ${gate} abgelehnt` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Einzelner Agent (Legacy / Direct Access)
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { agentType, content, previousHash } = req.body;
    const AgentToken = AGENT_MAP[agentType as keyof typeof AGENT_MAP];
    if (!AgentToken) return res.status(400).json({ error: "Agent nicht gefunden" });

    const currentHash = crypto.createHash('sha256').update(content || '').digest('hex');
    const agent = container.resolve(AgentToken);
    const stigmergyService = container.resolve(StigmergyService);

    const context: ContextDelta = {
      previousHash: previousHash || 'genesis',
      currentHash: currentHash,
      diffContent: content,
      activeTags: await stigmergyService.getActiveTags()
    };

    const result = await (agent as any).processDelta(context);
    if (result.newTags && result.newTags.length > 0) {
      await stigmergyService.saveTags(result.newTags);
    }

    res.json({ success: true, agent: agentType, data: result, hash: currentHash });
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

export default router;
