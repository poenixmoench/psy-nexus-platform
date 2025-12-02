import { Pool } from 'pg'
import { BaseAgent } from './BaseAgent'
import logger from '../services/logger'

export class PerformanceOptimizer extends BaseAgent {
  async execute(prompt: string): Promise<string> {
    logger.info(`⚡ PerformanceOptimizer analyzing...`)
    const analysis = await this.callOllama(`
Als Performance Optimization Expert analysiere diesen Code auf Performance-Probleme:

${prompt}

Finde:
1. Algorithmus-Ineffizienzen (Zeit-Komplexität)
2. Memory Leaks oder unnötige Allocations
3. N+1 Query Probleme
4. Caching Möglichkeiten
5. Bottlenecks und kritische Paths
6. Konkrete Optimierungen mit Code-Beispielen

Format: Markdown mit Prioritäten (HIGH/MEDIUM/LOW)
    `, 0.2)
    return analysis
  }
}
