import { container } from "tsyringe";
import { OrionOrchestrator } from "../orchestrator/OrionOrchestrator";
import { v4 as uuidv4 } from 'uuid';

export class SocketService {
  private orchestrator: OrionOrchestrator;

  constructor() {
    this.orchestrator = container.resolve(OrionOrchestrator);
  }

  async handleIncoming(socketId: string, payload: any) {
    // Wir nehmen jetzt ALLES mit, was du schickst, Alpha Fabian
    const workflowId = payload.workflowId || payload.sessionData?.workflowId || uuidv4();
    const manualMode = payload.manualMode === true || payload.sessionData?.manualMode === true;

    const request = {
      agent: payload.agent,
      input: payload.message || payload.query,
      userId: payload.userId,
      workflowId: workflowId,
      manualMode: manualMode,
      sessionData: payload.sessionData
    };

    return await this.orchestrator.processRequestStreaming(request, () => {});
  }
}
