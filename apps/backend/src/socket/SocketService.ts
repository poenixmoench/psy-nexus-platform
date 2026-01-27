import { container } from "tsyringe";
import { OrionOrchestrator } from "../orchestrator/OrionOrchestrator";
import { AgentName } from "../types/AgentTypes";

export class SocketService {
  private orchestrator: OrionOrchestrator;

  constructor() {
    this.orchestrator = container.resolve(OrionOrchestrator);
  }

  async handleIncoming(socketId: string, payload: any) {
    const request = {
      agent: payload.agent as AgentName,
      input: payload.message || payload.query,
      userId: payload.userId
    };
    // Die Antwort wird hier direkt im Orchestrator auf Deutsch verarbeitet
    return await this.orchestrator.processRequestStreaming(request, () => {});
  }
}
