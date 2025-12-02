import { BaseAgent } from './BaseAgent'

export class TestGeneratorAgent extends BaseAgent {
  async execute(prompt: string): Promise<string> {
    await this.updateProgress(1, 20)
    const testPrompt = `Du bist Expert Unit Test Developer. Generiere umfassende Jest/Vitest Tests für TypeScript Code. Teste: 1) Happy Path, 2) Error Cases, 3) Edge Cases, 4) Mocks. Ziel: >90% Coverage. Nur Test-Code, keine Erklärung.\n\nCode:\n${prompt}`
    await this.updateProgress(2, 50)
    const tests = await this.callOllama(testPrompt, 0.2)
    await this.updateProgress(3, 75)
    return `UNIT_TESTS:\n${tests}`
  }
}
