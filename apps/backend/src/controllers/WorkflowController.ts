import { Request, Response, Router } from 'express';
import { container } from 'tsyringe';
import { WorkflowStateService } from '../services/WorkflowStateService';
import { Logger } from '../types/Logger';
import { EventEmitter2 } from 'eventemitter2';

const router = Router();

router.post('/:id/pulse', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { action, feedback } = req.body;
  const logger = container.resolve<Logger>('Logger');
  const events = container.resolve<EventEmitter2>(EventEmitter2);

  try {
    const stateService = container.resolve(WorkflowStateService);
    logger.info('WorkflowController', 'pulse', `Puls fuer Workflow ${id} erhalten.`);

    await stateService.updateStatus(id, 'IN_PROGRESS', {
      gateReleasedAt: new Date().toISOString(),
      userAction: action,
      userFeedback: feedback
    });

    events.emit('workflow.pulse', { workflowId: id, action, feedback });

    res.json({ success: true, message: "Puls verarbeitet. Orchestrator geweckt." });
  } catch (err: any) {
    logger.error('WorkflowController', 'pulse-error', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
