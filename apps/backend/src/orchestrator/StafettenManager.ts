import { injectable } from 'tsyringe';

enum KnownAgents {
  FRONTEND_MEISTER = 'FrontendMeisterAgent',
  DESIGN_ALCHEMIST = 'DesignAlchemistAgent',
  PLAN_AGENT = 'PlanAgent',
  DOKUMENTATION_AGENT = 'DokumentationAgent',
  ORION_AGENT = 'OrionAgent',
  BACKEND_ARCHITEKT = 'BackendArchitectAgent',
  QA_GURU = 'QaGuruAgent',
  OPTIMIERER = 'OptimizerAgent',
}

const KEYWORD_TO_AGENT_MAPPING: Array<{ keywords: string[]; agent: KnownAgents }> = [
  { keywords: ['frontend', 'ui', 'ux', 'interface', 'vue', 'button', 'component'], agent: KnownAgents.FRONTEND_MEISTER },
  { keywords: ['design', 'visual', 'layout', 'color', 'style', 'css'], agent: KnownAgents.DESIGN_ALCHEMIST },
  { keywords: ['plan', 'strategy', 'coordinate', 'organize', 'roadmap'], agent: KnownAgents.PLAN_AGENT },
  { keywords: ['documentation', 'document', 'spec', 'info', 'readme', 'json-ld'], agent: KnownAgents.DOKUMENTATION_AGENT },
  { keywords: ['archive', 'final', 'done', 'orion', 'save', 'bibliothek'], agent: KnownAgents.ORION_AGENT },
  { keywords: ['backend', 'server', 'api', 'database', 'node', 'express'], agent: KnownAgents.BACKEND_ARCHITEKT },
  { keywords: ['quality', 'test', 'check', 'qa', 'bug', 'fix'], agent: KnownAgents.QA_GURU },
  { keywords: ['optimize', 'performance', 'speed', 'optimizer', 'refactor'], agent: KnownAgents.OPTIMIERER },
];

@injectable()
export class StafettenManager {
  
  async checkForPriorityHandover(
    response: string, 
    currentAgent: string, 
    targetAgent?: string
  ): Promise<{needsHandover: boolean, suggestedAgents: string[], priority: number}> {
    
    const responseLower = response.toLowerCase().trim();
    
    if (targetAgent && responseLower.includes(targetAgent.toLowerCase())) {
      return { needsHandover: true, suggestedAgents: [targetAgent], priority: 10 };
    }

    const suggestedAgentsSet = new Set<string>();

    for (const mapping of KEYWORD_TO_AGENT_MAPPING) {
      if (mapping.keywords.some(keyword => responseLower.includes(keyword))) {
        suggestedAgentsSet.add(mapping.agent);
      }
    }

    const filteredSuggestions = Array.from(suggestedAgentsSet).filter(
      agent => agent.toLowerCase() !== currentAgent.toLowerCase()
    );

    return {
      needsHandover: filteredSuggestions.length > 0,
      suggestedAgents: filteredSuggestions,
      priority: filteredSuggestions.length > 0 ? 5 : 0
    };
  }
}
