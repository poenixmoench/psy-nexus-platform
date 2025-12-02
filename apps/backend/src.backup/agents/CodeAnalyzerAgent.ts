import { BaseAgent } from './BaseAgent'

export class CodeAnalyzerAgent extends BaseAgent {
  async execute(prompt: string): Promise<string> {
    await this.updateProgress(1, 20)
    const analysisPrompt = `Du bist ein Expert Code-Analyzer für Production-Code. Analysiere den folgenden Code auf: 1) Code Quality, 2) Performance, 3) Security Issues, 4) Maintainability. Gebe eine strukturierte Analyse mit Verbesserungsvorschlägen.\n\nCode:\n${prompt}`
    await this.updateProgress(2, 50)
    const analysis = await this.callOllama(analysisPrompt, 0.3)
    await this.updateProgress(3, 75)
    return `ANALYSIS:\n${analysis}`
  }
}
