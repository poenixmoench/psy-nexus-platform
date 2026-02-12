import { StigmergyTag, StigmergyPayload, KnownAgentType } from '@shared/types/AgentTypes';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseAgent {
  public abstract processDelta(input: any): Promise<any>;
  public abstract readonly name: KnownAgentType;

  protected emitTag(payload: StigmergyPayload, ttlSeconds?: number): StigmergyTag {
    return {
      id: uuidv4(),
      sourceAgent: this.name,
      timestamp: Date.now(),
      payload,
      ttl: ttlSeconds ? ttlSeconds * 1000 : undefined
    };
  }

  protected getHighestPriorityTask(tags: StigmergyTag[]): StigmergyTag | null {
    const priorityMap: Record<string, number> = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    // NULL-SAFE: Prüfe zuerst, ob tags existiert und ein Array ist
    const validTags = Array.isArray(tags) ? tags : [];
    const tasks = validTags.filter(t => t?.payload?.type === 'TASK');
    if (tasks.length === 0) return null;
    return tasks.sort((a, b) => {
      // NULL-SAFE: Prüfe payload.data und priority
      const pA = priorityMap[a?.payload?.data?.priority as string] || 0;
      const pB = priorityMap[b?.payload?.data?.priority as string] || 0;
      return pB - pA;
    })[0];
  }
}
