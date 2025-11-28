import { TaskService } from '../services/taskService'
import { BaseAgent } from './BaseAgent'
import { CodeAnalyzerAgent } from './CodeAnalyzerAgent'
import { RefactoringAgent } from './RefactoringAgent'
import { TestGeneratorAgent } from './TestGeneratorAgent'
import { DocumentationAgent } from './DocumentationAgent'
import { SecurityAuditAgent } from './SecurityAuditAgent'

export class AgentRegistry {
  private agents: Record<string, new (taskService: TaskService, taskId: string) => BaseAgent> = {
    CodeAnalyzerAgent,
    RefactoringAgent,
    TestGeneratorAgent,
    DocumentationAgent,
    SecurityAuditAgent
  }

  getAgent(agentType: string, taskService: TaskService, taskId: string): BaseAgent {
    const AgentClass = this.agents[agentType as keyof typeof this.agents]
    if (!AgentClass) {
      throw new Error(`Unknown agent type: ${agentType}`)
    }
    return new AgentClass(taskService, taskId)
  }

  listAgents(): string[] {
    return Object.keys(this.agents)
  }

  isValidAgent(agentType: string): boolean {
    return agentType in this.agents
  }
}
