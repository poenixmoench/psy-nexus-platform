import { injectable, inject } from 'tsyringe';
import { BaseAgent } from '@shared/basis-agent/BaseAgent';
import { AIService } from '../services/AIService';

@injectable()
export class OrionAgent extends BaseAgent {
  public readonly name = 'ORION_AGENT';

  constructor(
    @inject('Logger') private logger: any,
    @inject(AIService) private aiService: AIService
  ) {
    super();
  }

  async processDelta(payload: any): Promise<any> {
    const query = payload.query || payload.message || "";

    // ✅ GEDÄCHTNIS-INTEGRATION
    let fullQuery = query;
    if (payload.previousOutput) {
      console.log(`🔗 [${this.name}] previousOutput erhalten. Integriere Kontext...`);
      fullQuery += `\n\n### 📝 KONTEXT VORHERIGER ANTWORT:\n${JSON.stringify(
        payload.previousOutput,
        null,
        2,
      )}`;
    }

    console.log(`🚀 [${this.name}] Processing...\nQUERY: ${query.substring(0, 50)}...`);

    let fullOutput = "";

    await this.aiService.askAIStream(
      fullQuery,
      (token: string) => {
        fullOutput += token;
        if (payload && payload.onToken) payload.onToken(token);
        
      },
      this.name,
    );

    const safeOutput = this.stripTechnicalPayload(fullOutput);


    return {
      success: true,
      output: safeOutput,
      agentName: this.name,
      newTags: [],
    };
  }

  private stripTechnicalPayload(text: string): string {
    if (!text) return "";

    // Entfernt Fenced Codeblocks (```...```)
    let cleaned = text.replace(/```[\s\S]*?```/g, "");
    // Additive Filter für hängende Header
    cleaned = cleaned.replace(/Voraussichtliche\s+JSON-LD-Struktur\s*\(Beispiel\):/gi, "");
    cleaned = cleaned.replace(/\*\*Beispiel\s+für\s+den\s+Code:\*\*/gi, "");
    // Additive Filter für hängende Header
    cleaned = cleaned.replace(/Voraussichtliche\s+JSON-LD-Struktur\s*\(Beispiel\):/gi, "");
    cleaned = cleaned.replace(/\*\*Beispiel\s+für\s+den\s+Code:\*\*/gi, "");

    // Entfernt JSON-LD Scripts
    cleaned = cleaned.replace(
      /<script[^>]*application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi,
      "",
    );

    // Entfernt nackte JSON-LD-Objekte mit @context/@type
    cleaned = cleaned.replace(
      /\{\s*"@context"[^}]*"@type"[\s\S]*?\}/g,
      "",
    );

    return cleaned.trim();
  }
}
