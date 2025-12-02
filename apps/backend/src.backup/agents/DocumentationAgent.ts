import { BaseAgent } from './BaseAgent'

export class DocumentationAgent extends BaseAgent {
  async execute(prompt: string): Promise<string> {
    await this.updateProgress(1, 20)
    const docPrompt = `Du bist Expert Technical Writer. Schreibe umfassende Dokumentation für den Code. Struktur: 1) Übersicht, 2) API Documentation, 3) Usage Examples, 4) Error Handling, 5) Best Practices. Markdown Format.\n\nCode:\n${prompt}`
    await this.updateProgress(2, 50)
    const documentation = await this.callOllama(docPrompt, 0.3)
    await this.updateProgress(3, 75)
    return `DOCUMENTATION:\n${documentation}`
  }
}
