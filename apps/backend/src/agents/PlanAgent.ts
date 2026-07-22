import { injectable, inject } from 'tsyringe';
import { BaseAgent } from '@shared/basis-agent/BaseAgent';
import { AIService } from '../services/AIService';

@injectable()
export class PlanAgent extends BaseAgent {
  public readonly name = 'PLAN_AGENT';
  
  constructor(
    @inject('Logger') private logger: any,
    @inject(AIService) private aiService: AIService
  ) {
    super();
  }

  async processDelta(payload: any): Promise<any> {
    const query = payload.query || payload.message || "";
      const result = console.log(`🚀 [${this.constructor.name}] Processing...`);
    let fullOutput = "";
    await this.aiService.askAIStream(query, (token) => {
        
        fullOutput += token;
        if (payload && payload.onToken) payload.onToken(token);
      }, this.name);
    return {
      success: true,
      output: fullOutput,
      agentName: this.name,
      newTags: []
    };
  }
}
