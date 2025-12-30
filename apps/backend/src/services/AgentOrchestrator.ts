import { AIService } from './AIService';
import MemoryService from './MemoryService';
import { v4 as uuidv4 } from 'uuid';

export enum AgentState {
  IDLE = 'idle',
  THINKING = 'thinking',
  AWAITING_USER = 'awaiting_user_input',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface AgentSession {
  sessionId: string;
  state: AgentState;
  history: Message[];
  lastResponse?: string;
  error?: string;
  messageCount: number;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

export class AgentOrchestrator {
  static async initSession(agentId: string = 'DialogAgent', sessionId?: string): Promise<AgentSession> {
    const id = sessionId || uuidv4();
    try {
      await MemoryService.createSession(agentId, id);
      const systemInstruction = `Du bist der PSY-NEXUS Architekt und intelligenter Agent.`;
      await MemoryService.saveMessage(id, 'system', systemInstruction);
      const session = await MemoryService.getSession(id);
      return {
        sessionId: id,
        state: AgentState.IDLE,
        history: [{ role: 'system', content: systemInstruction }],
        messageCount: session?.message_count || 1,
        totalTokens: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error: any) {
      console.error('❌ Error initializing session:', error);
      throw error;
    }
  }

  static async handleTask(sessionId: string, userInput: string): Promise<AgentSession> {
    try {
      const dbSession = await MemoryService.getSession(sessionId);
      if (!dbSession) throw new Error(`Session ${sessionId} not found`);
      const history: Message[] = await MemoryService.getHistory(sessionId);
      await MemoryService.saveMessage(sessionId, 'user', userInput);
      history.push({ role: 'user', content: userInput });
      await MemoryService.updateSessionState(sessionId, AgentState.THINKING);
      const historyText = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
      const response = await AIService.askAI(historyText);
      await MemoryService.saveMessage(sessionId, 'assistant', response);
      history.push({ role: 'assistant', content: response });
      let newState = AgentState.COMPLETED;
      if (response.includes('[AWAITING_CLARIFICATION]')) newState = AgentState.AWAITING_USER;
      else if (response.includes('[READY_TO_EXECUTE]')) newState = AgentState.EXECUTING;
      else if (response.toLowerCase().includes('fehler')) newState = AgentState.ERROR;
      await MemoryService.updateSessionState(sessionId, newState);
      const updatedSession = await MemoryService.getSession(sessionId);
      return {
        sessionId: sessionId,
        state: newState as AgentState,
        history: history,
        lastResponse: response.replace('[AWAITING_CLARIFICATION]', '').replace('[READY_TO_EXECUTE]', '').trim(),
        messageCount: updatedSession?.message_count || 0,
        totalTokens: updatedSession?.total_tokens || 0,
        createdAt: updatedSession?.created_at || new Date(),
        updatedAt: updatedSession?.updated_at || new Date()
      };
    } catch (error: any) {
      console.error('❌ Error:', error);
      try { await MemoryService.updateSessionState(sessionId, AgentState.ERROR); } catch {}
      return {
        sessionId: sessionId,
        state: AgentState.ERROR,
        history: [],
        error: error.message,
        messageCount: 0,
        totalTokens: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  static async getSession(sessionId: string): Promise<AgentSession | null> {
    try {
      const dbSession = await MemoryService.getSession(sessionId);
      if (!dbSession) return null;
      const history = await MemoryService.getHistory(sessionId);
      return {
        sessionId: sessionId,
        state: dbSession.state as AgentState,
        history: history,
        messageCount: dbSession.message_count,
        totalTokens: dbSession.total_tokens,
        createdAt: dbSession.created_at,
        updatedAt: dbSession.updated_at
      };
    } catch (error: any) {
      console.error('❌ Error getting session:', error);
      return null;
    }
  }

  static async getStats() {
    try {
      return await MemoryService.getStats();
    } catch (error: any) {
      console.error('❌ Error getting stats:', error);
      return null;
    }
  }

  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      return await MemoryService.deleteSession(sessionId);
    } catch (error: any) {
      console.error('❌ Error deleting session:', error);
      return false;
    }
  }

  static async pruneOldSessions(daysOld: number = 30): Promise<number> {
    try {
      return await MemoryService.pruneOldSessions(daysOld);
    } catch (error: any) {
      console.error('❌ Error pruning sessions:', error);
      return 0;
    }
  }
}

export default AgentOrchestrator;
