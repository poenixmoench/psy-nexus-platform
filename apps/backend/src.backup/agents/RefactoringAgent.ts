import { BaseAgent } from './BaseAgent'

export class RefactoringAgent extends BaseAgent {
  async execute(prompt: string): Promise<string> {
    await this.updateProgress(1, 20)
    const refactorPrompt = `Du bist Expert Code-Refactoring Spezialist. Refaktoriere den Code mit Fokus auf: 1) Readability, 2) DRY Principle, 3) SOLID Principles, 4) Performance. Gebe vollständig refaktorierten Code mit Kommentaren zurück.\n\nCode:\n${prompt}`
    await this.updateProgress(2, 50)
    const refactored = await this.callOllama(refactorPrompt, 0.2)
    await this.updateProgress(3, 75)
    return `REFACTORED_CODE:\n${refactored}`
  }
}
