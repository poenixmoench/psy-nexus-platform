import { Pool } from 'pg'
import { BaseAgent } from './BaseAgent'
import logger from '../services/logger'

export class ArchitectureAnalyzer extends BaseAgent {
  async execute(prompt: string): Promise<string> {
    logger.info(`🏗️ ArchitectureAnalyzer...`)
    const analysis = await this.callOllama(`
Analysiere die System-Architektur:

${prompt}

Bewerte: Layering, Modularity, Coupling, Scalability, Disaster Recovery, API Design, Data Flow, Integrations, Technology Fit, Growth

Identifiziere: Debt, Bottlenecks, Improvements
    `, 0.3)
    return analysis
  }
}
