import { injectable, inject } from 'tsyringe';
import { BaseAgent } from '@shared/basis-agent/BaseAgent';
import { AIService } from '../services/AIService';
import { GeometryTool } from '../tools/GeometryTool';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class DesignAlchemistAgent extends BaseAgent {
  public readonly name = 'DESIGN_ALCHEMIST_AGENT';

  constructor(
    @inject('Logger') private logger: any,
    @inject(AIService) private aiService: AIService,
    @inject(GeometryTool) private geometryTool: GeometryTool
  ) {
    super();
  }

  async processDelta(payload: any): Promise<any> {
    const input = (payload.query || payload.message || payload.input || "").toUpperCase();
    console.log(`🚀 [${this.name}] Checke: ${input.substring(0, 30)}`);

    const manifestGroups = this.geometryTool.getManifest();
    const allForms = manifestGroups.flatMap(g => g.forms);
    const foundForm = allForms.find(f => input.includes(f));

    if (foundForm) {
      const vertices = this.geometryTool.calculate(foundForm, 'DEFAULT', { radius: 100 });
      return {
        success: true,
        output: `✨ **Formel aktiviert: ${foundForm}**\nMathematische Vektoren generiert.`,
        agentName: this.name,
        newTags: [{
          id: uuidv4(),
          type: 'GEOMETRY_STRUCTURE',
          sourceAgent: this.name,
          timestamp: Date.now(),
          payload: { form: foundForm, vertices: vertices }
        }]
      };
    }

    const result = console.log(`🚀 [${this.constructor.name}] Processing...`);
    let fullOutput = "";
    await this.aiService.askAIStream(input, (token) => {
        
        fullOutput += token;
        if (payload && payload.onToken) payload.onToken(token);
      }, this.name);
    return { success: true, output: fullOutput, agentName: this.name, newTags: [] };
  }
}
