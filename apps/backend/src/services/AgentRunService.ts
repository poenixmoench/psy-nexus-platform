import { IAgent } from '../types/Agent';
import { LLMFactory } from '../llm/LLMFactory';
import { GitHubService } from './GitHubService';
import { wsServiceInstance } from '../server';

export interface AgentRunStatus {
  status: 'running' | 'completed' | 'failed';
  step: number;
  totalSteps: number;
  progress: number;
  results: Array<{
    step: number;
    agent: string;
    role: string;
    llmModel: string;
    output: string;
    tokens: number;
    responseTime: number;
    timestamp: string;
  }>;
  chainContext: string;
  startTime: string;
  endTime?: string;
  totalTokens?: number;
}

export class AgentRunService {
  private static instance: AgentRunService;
  private activeRuns: Map<string, AgentRunStatus> = new Map();

  private constructor() {}

  public static getInstance(): AgentRunService {
    if (!AgentRunService.instance) {
      AgentRunService.instance = new AgentRunService();
    }
    return AgentRunService.instance;
  }

  public async startWorkflow(masterAgentId: string, initialPrompt: string): Promise<string> {
    const runId = `run-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    console.log(`📍 Starting workflow: ${masterAgentId}`);
    console.log(`🚀 [${runId}] MULTI-MODEL WORKFLOW START`);

    const status: AgentRunStatus = {
      status: 'running',
      step: 0,
      totalSteps: 7,
      progress: 0,
      results: [],
      chainContext: initialPrompt,
      startTime: new Date().toISOString(),
      totalTokens: 0,
    };

    this.activeRuns.set(runId, status);
    this.updateRunStatus(runId, status);

    await this.processMultiModelWorkflow(runId);
    return runId;
  }

  private async processMultiModelWorkflow(runId: string) {
    const agents: IAgent[] = [
      { id: '1', name: 'Nexus Koordinator', role: 'Orchestrator', description: 'Master controller', preferredModel: 'Llama-3-70B' },
      { id: '2', name: 'Qwen2.5 Coder', role: 'Code Generator', description: 'Code specialist', preferredModel: 'Qwen2.5-Coder-14B' },
      { id: '3', name: 'Performance Tuner', role: 'Optimizer', description: 'Performance expert', preferredModel: 'Llama-3-70B' },
      { id: '4', name: 'UI Magier', role: 'UI/UX Designer', description: 'Frontend specialist', preferredModel: 'Mixtral-8x22B' },
      { id: '5', name: 'Debugger Fuchs', role: 'QA/Debugger', description: 'Quality expert', preferredModel: 'Llama-3-70B' },
      { id: '6', name: 'Data Archivist', role: 'Data Manager', description: 'Data specialist', preferredModel: 'Mixtral-8x22B' },
      { id: '7', name: 'Nexus Koordinator II', role: 'Final Reviewer', description: 'Final synthesis', preferredModel: 'Llama-3-70B' },
    ];

    let currentContext = this.activeRuns.get(runId)!.chainContext;
    let totalTokens = 0;

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const llmClient = LLMFactory.createClient(agent.preferredModel);
      console.log(`📍 [${runId}] Step ${i + 1}/7: ${agent.name} (${agent.preferredModel})`);

      const startTime = Date.now();
      const output = await llmClient.generate(`${agent.role}: ${currentContext}`);
      const responseTime = Date.now() - startTime;
      const tokens = llmClient.getTokenCount(output);
      totalTokens += tokens;

      const result = {
        step: i + 1,
        agent: agent.name,
        role: agent.role,
        llmModel: agent.preferredModel,
        output,
        tokens,
        responseTime,
        timestamp: new Date().toISOString(),
      };

      const run = this.activeRuns.get(runId)!;
      run.step = i;
      run.progress = Math.round(((i + 1) / 7) * 100);
      run.results.push(result);
      run.totalTokens = totalTokens;
      currentContext = output;

      this.updateRunStatus(runId, run);
      await new Promise(r => setTimeout(r, 800));
    }

    const run = this.activeRuns.get(runId)!;
    run.status = 'completed';
    run.endTime = new Date().toISOString();

    console.log(`🎉 [${runId}] MULTI-MODEL WORKFLOW COMPLETED! Total tokens: ${totalTokens}`);
    this.updateRunStatus(runId, run);

    GitHubService.getInstance().pushRunResults(runId, run)
      .then(result => {
        if (result.success) {
          console.log(`✅ [${runId}] Artifacts committed to GitHub: ${result.url}`);
        } else {
          console.error(`❌ [${runId}] GitHub push failed`);
        }
      })
      .catch(err => console.error(`🚨 [${runId}] GitHub error:`, err));
  }

  private updateRunStatus(runId: string, status: AgentRunStatus) {
    if (wsServiceInstance) {
      wsServiceInstance.broadcast(runId, status);
    }
  }

  public getRunStatus(runId: string): AgentRunStatus | undefined {
    return this.activeRuns.get(runId);
  }
}
