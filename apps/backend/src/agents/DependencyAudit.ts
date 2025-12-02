import { Pool } from 'pg'
import { BaseAgent } from './BaseAgent'
import logger from '../services/logger'

export class DependencyAudit extends BaseAgent {
  async execute(prompt: string): Promise<string> {
    logger.info(`🔐 DependencyAudit checking...`)
    const analysis = await this.callOllama(`
Als Security Expert für npm-Dependencies analysiere:

${prompt}

Finde:
1. Bekannte Vulnerabilities
2. Veraltete Packages (deprecated)
3. Unused Dependencies
4. Größe & Performance Impact
5. Lizenz-Probleme
6. Update-Empfehlungen

Format: Kategorisiert nach Severity
    `, 0.2)
    return analysis
  }
}
