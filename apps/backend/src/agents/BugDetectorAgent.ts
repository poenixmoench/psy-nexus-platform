import { Pool } from 'pg'
import { BaseAgent } from './BaseAgent'
import logger from '../services/logger'

export class BugDetectorAgent extends BaseAgent {
  async execute(prompt: string): Promise<string> {
    logger.info(`🐛 BugDetectorAgent scanning...`)
    const analysis = await this.callOllama(`
Finde ALLE potenzillen Bugs in diesem Code:

${prompt}

Suche nach: Off-by-one, Null/Undefined, Type Mismatches, Race Conditions, Logic Errors, Memory Issues, Async Probleme, Resource Leaks, Math Errors

Für jeden Bug: Severity, Lage, Behebung
    `, 0.3)
    return analysis
  }
}
