import { injectable, inject } from "tsyringe";
import { BaseAgent } from "./BaseAgent";
import { Logger } from "../types/Logger";
import { AgentName } from "../types/AgentTypes";

@injectable()
export class BackendArchitectAgent extends BaseAgent {
  public name: AgentName = "BACKEND-ARCHITEKT" as AgentName;

  constructor(@inject("Logger") logger: Logger) {
    super(undefined, logger);
  }

  // Agent nutzt jetzt automatisch execute() und executeStreaming() von BaseAgent
}
