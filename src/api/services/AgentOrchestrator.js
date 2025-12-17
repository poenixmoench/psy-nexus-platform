// NEUE KONSTANTE: Timeout für Ollama Requests
const OLLAMA_REQUEST_TIMEOUT_MS = 90000; // 90 Sekunden
export class AgentOrchestrator {
    constructor() {
        Object.defineProperty(this, "ollamaUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: process.env.OLLAMA_URL || 'http://ollama:11434'
        });
        Object.defineProperty(this, "coderModel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'qwen:7b'
        });
    }
    async executeAgent(agentType, prompt, context = []) {
        switch (agentType) {
            case 'coder': return this.executeCoder(prompt);
            case 'orchestrator': return this.executeOrchestrator(prompt, context);
            case 'planner': return this.executePlanner(prompt);
            case 'tester': return this.executeTester(prompt);
            case 'architect': return this.executeArchitect(prompt);
            case 'documenter': return this.executeDocumenter(prompt);
            case 'optimizer': return this.executeOptimizer(prompt);
            default: throw new Error(`Unknown agent: \${agentType}\`);
    }
  }
  // ... (Die spezifischen executeX-Methoden bleiben unverändert, da sie callOllama nutzen) ...

  private async executeCoder(prompt: string): Promise<AgentResult> {
    const systemPrompt = \`Du bist ein expertischer Code-Generator. Generiere nur validen, produktionsreifen Code.
Antworte NUR mit Code, keine Erklärungen. Verwende TypeScript/JavaScript wenn nichts anderes spezifiziert.\`;
    const response = await this.callOllama(systemPrompt, prompt);
    return { response: response, code: this.extractCode(response) };
  }

  private async executeOrchestrator(prompt: string, context: string[]): Promise<AgentResult> {
    const systemPrompt = \`Du bist der Agenten-Orchestrator. Du koordinierst alle anderen Agenten.
Analysiere den Prompt und entscheide, welche Agenten involviert sein sollten.\`;
    const contextStr = context.slice(-5).join('\\n');
    const fullPrompt = \`Kontext:\\n\${contextStr}\\n\\nAufgabe: \${prompt}\`;
    const response = await this.callOllama(systemPrompt, fullPrompt);
    return { response };
  }

  private async executePlanner(prompt: string): Promise<AgentResult> {
    const systemPrompt = \`Du bist ein Projektplaner. Erstelle strukturierte Planungsvorschläge.
Nutze Markdown mit klaren Hierarchien und Checklisten.\`;
    const response = await this.callOllama(systemPrompt, prompt);
    return { response };
  }

  private async executeTester(prompt: string): Promise<AgentResult> {
    const systemPrompt = \`Du bist ein QA/Tester. Erstelle Test-Cases und Validierungsschritte.
Fokussiere auf Edge-Cases und Fehlerhafte Eingaben.\`;
    const response = await this.callOllama(systemPrompt, prompt);
    return { response };
  }

  private async executeArchitect(prompt: string): Promise<AgentResult> {
    const systemPrompt = \`Du bist ein Software-Architekt. Entwerfe robuste Systeme.
Nutze Diagramme in ASCII-Art und strukturierte Vorschläge.\`;
    const response = await this.callOllama(systemPrompt, prompt);
    return { response };
  }

  private async executeDocumenter(prompt: string): Promise<AgentResult> {
    const systemPrompt = \`Du bist ein technischer Dokumentations-Spezialist.
Erstelle klare, prägnante und benutzerfreundliche Dokumentation.\`;
    const response = await this.callOllama(systemPrompt, prompt);
    return { response };
  }

  private async executeOptimizer(prompt: string): Promise<AgentResult> {
    const systemPrompt = \`Du bist ein Performance- und Code-Optimierungs-Experte.
Analysiere Code auf Ineffizienzen und gib konkrete Verbesserungsvorschläge.\`;
    const response = await this.callOllama(systemPrompt, prompt);
    return { response };
  }

  // <-- WESENTLICHE ÄNDERUNG: Integration von Queue und Timeout -->
  private async callOllama(systemPrompt: string, userPrompt: string): Promise<string> {
    // Führe die Ollama-Anfrage in der Warteschlange aus, um Serialisierung zu gewährleisten
    const job = async () => {
        try {
          const response = await axios.post(\`\${this.ollamaUrl}/api/generate\`, {
            model: this.coderModel,
            prompt: userPrompt,
            system: systemPrompt,
            stream: false,
          }, {
                // <-- NEU: Axios Timeout Konfiguration -->
                timeout: OLLAMA_REQUEST_TIMEOUT_MS, 
                timeoutErrorMessage: \`Ollama Timeout nach \${OLLAMA_REQUEST_TIMEOUT_MS / 1000}s.\`
            });
          return response.data.response || '';
        } catch (error) {
          console.error('Ollama API error:', error);
            // Verbesserte Fehlerbehandlung für Timeout
            if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
                 throw new Error(\`Ollama Service Timeout: Anfrage dauerte länger als \${OLLAMA_REQUEST_TIMEOUT_MS / 1000}s.\`);
            }
          throw new Error('Failed to execute agent: Ollama service unavailable oder interner Fehler');
        }
    };

    return ollamaQueue.enqueue(job);
  }

  private extractCode(response: string): string {
    const codeBlockRegex = /\`\`\`(?:typescript|javascript|ts|js)?\\n([\\s\\S]*?)\\n\`\`\`/;
    const match = response.match(codeBlockRegex);
    return match ? match[1] : '';
  }

  async getHealth(): Promise<AgentHealth> {
    try {
      // Erhöhen Sie hier optional das Timeout für den Health Check
      const ollamaResponse = await axios.get(\`\${this.ollamaUrl}/api/tags\`, { timeout: 5000 });
      return {
        status: ollamaResponse.status === 200 ? 'healthy' : 'degraded',
        agents: { orchestrator: true, planner: true, coder: true, tester: true, architect: true, documenter: true, optimizer: true },
        ollama: true,
      };
    } catch (error) {
      return { status: 'unhealthy', agents: {}, ollama: false };
    }
  }
}
            );
        }
    }
}
//# sourceMappingURL=AgentOrchestrator.js.map