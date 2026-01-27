import { injectable, inject } from "tsyringe";
import { BaseAgent } from "./BaseAgent";
import { Logger } from "../types/Logger";
import { AgentName } from "../types/AgentTypes";

@injectable()
export class FrontendMeisterAgent extends BaseAgent {
  public name: AgentName = "FRONTEND-MEISTER" as AgentName;

  constructor(@inject("Logger") logger: Logger) {
    super(undefined, logger);
  }

  // Agent nutzt jetzt automatisch execute() und executeStreaming() von BaseAgent
}
