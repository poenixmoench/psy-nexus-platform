import { Pool } from 'pg'
import { BaseAgent } from './BaseAgent'
import logger from '../services/logger'

export class CodeStyleAgent extends BaseAgent {
  async execute(prompt: string): Promise<string> {
    logger.info(`🎨 CodeStyleAgent checking...`)
    const analysis = await this.callOllama(`
Prüfe diesen Code auf Style & Best Practices:

${prompt}

Checke: Naming, Formatting, Comments, Function Length, Complexity, DRY, SOLID, ESLint, Consistency, Readability

Gib Refactoring-Vorschläge
    `, 0.2)
    return analysis
  }
}
