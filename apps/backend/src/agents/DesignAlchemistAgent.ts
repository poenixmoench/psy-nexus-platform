import { injectable, inject } from "tsyringe";
import { BaseAgent } from "./BaseAgent";
import { Logger } from "../types/Logger";
import { AgentName } from "../types/AgentTypes";

@injectable()
export class DesignAlchemistAgent extends BaseAgent {
  public name: AgentName = "DESIGN-ALCHEMIST" as AgentName;

  constructor(@inject("Logger") logger: Logger) {
    super(undefined, logger);
  }

  // Agent nutzt jetzt automatisch execute() und executeStreaming() von BaseAgent
}
