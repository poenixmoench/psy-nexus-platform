import { Pool } from 'pg'
import { BaseAgent } from './BaseAgent'
import logger from '../services/logger'

export class CodeReviewAgent extends BaseAgent {
  async execute(prompt: string): Promise<string> {
    logger.info(`📋 CodeReviewAgent performing review...`)
    const analysis = await this.callOllama(`
Als Senior Code Reviewer mache ein VOLLSTÄNDIGES Review:

${prompt}

Bewerte: Quality, Architecture, Error Handling, Testability, Documentation, Best Practices, Security, Performance

Format: Structured Review mit Scoring
    `, 0.25)
    return analysis
  }
}
