export interface AgentResult {
    response: string;
    code?: string;
}
export interface AgentHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    agents: {
        [key: string]: boolean;
    };
    ollama: boolean;
}
export declare class AgentOrchestrator {
    private ollamaUrl;
    private coderModel;
    executeAgent(agentType: string, prompt: string, context?: string[]): Promise<AgentResult>;
}
//# sourceMappingURL=AgentOrchestrator.d.ts.map