import { Pool } from 'pg'
import { BaseAgent } from './BaseAgent'
import { CodeAnalyzerAgent } from './CodeAnalyzerAgent'
import { RefactoringAgent } from './RefactoringAgent'
import { TestGeneratorAgent } from './TestGeneratorAgent'
import { DocumentationAgent } from './DocumentationAgent'
import { SecurityAuditAgent } from './SecurityAuditAgent'
import { PerformanceOptimizer } from './PerformanceOptimizer'
import { DependencyAudit } from './DependencyAudit'
import { CodeReviewAgent } from './CodeReviewAgent'
import { BugDetectorAgent } from './BugDetectorAgent'
import { CodeStyleAgent } from './CodeStyleAgent'
import { ArchitectureAnalyzer } from './ArchitectureAnalyzer'
import { DeploymentAgent } from './DeploymentAgent'
import { ProjectOrchestrator } from './ProjectOrchestrator'

type AgentConstructor = new (pool: Pool, taskId: string) => BaseAgent

export class AgentRegistry {
  private agents: Map<string, AgentConstructor> = new Map()

  constructor() {
    // Existing Agents
    this.register('CodeAnalyzerAgent', CodeAnalyzerAgent as AgentConstructor)
    this.register('RefactoringAgent', RefactoringAgent as AgentConstructor)
    this.register('TestGeneratorAgent', TestGeneratorAgent as AgentConstructor)
    this.register('DocumentationAgent', DocumentationAgent as AgentConstructor)
    this.register('SecurityAuditAgent', SecurityAuditAgent as AgentConstructor)

    // New Agents
    this.register('PerformanceOptimizer', PerformanceOptimizer as AgentConstructor)
    this.register('DependencyAudit', DependencyAudit as AgentConstructor)
    this.register('CodeReviewAgent', CodeReviewAgent as AgentConstructor)
    this.register('BugDetectorAgent', BugDetectorAgent as AgentConstructor)
    this.register('CodeStyleAgent', CodeStyleAgent as AgentConstructor)
    this.register('ArchitectureAnalyzer', ArchitectureAnalyzer as AgentConstructor)
    this.register('DeploymentAgent', DeploymentAgent as AgentConstructor)

    // The Boss
    this.register('ProjectOrchestrator', ProjectOrchestrator as AgentConstructor)
  }

  private register(name: string, agentClass: AgentConstructor): void {
    this.agents.set(name, agentClass)
  }

  getAgent(agentType: string, pool: Pool, taskId: string): BaseAgent {
    const AgentClass = this.agents.get(agentType)
    if (!AgentClass) {
      throw new Error(`Unknown agent type: ${agentType}`)
    }
    return new AgentClass(pool, taskId)
  }

  getAllAgents(): string[] {
    return Array.from(this.agents.keys())
  }

  getAgentInfo(): Record<string, string> {
    return {
      'CodeAnalyzerAgent': 'Analysiert Code Qualität, Performance, Sicherheit',
      'RefactoringAgent': 'Schlägt Code-Verbesserungen vor',
      'TestGeneratorAgent': 'Generiert Unit Tests',
      'DocumentationAgent': 'Erstellt API/Code Dokumentation',
      'SecurityAuditAgent': 'Findet Sicherheitslücken',
      'PerformanceOptimizer': 'Findet Performance Probleme',
      'DependencyAudit': 'Checkt npm packages auf Vulnerabilities',
      'CodeReviewAgent': 'Macht vollständiges Code Review',
      'BugDetectorAgent': 'Findet potenzielle Bugs',
      'CodeStyleAgent': 'Prüft Code Style & Best Practices',
      'ArchitectureAnalyzer': 'Prüft System Architecture',
      'DeploymentAgent': 'Hilft mit Deployment Strategies',
      'ProjectOrchestrator': 'Koordiniert alle Agenten & fasst zusammen'
    }
  }
}
