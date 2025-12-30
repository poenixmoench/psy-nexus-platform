import { AIService } from './AIService';
import MemoryService from './MemoryService';

export class AgentRunService {
  static async executeRun(sessionId: string, userInput: string) {
    try {
      const history = await MemoryService.getHistory(sessionId);
      await MemoryService.saveMessage(sessionId, 'user', userInput);
      const historyText = history.map(m => `${m.role}: ${m.content}`).join('\n\n') + `\nUSER: ${userInput}`;
      const response = await AIService.askAI(historyText);
      await MemoryService.saveMessage(sessionId, 'assistant', response);
      return { success: true, response: response, sessionId: sessionId };
    } catch (error: any) {
      console.error('❌ ExecuteRun error:', error);
      return { success: false, error: error.message, sessionId: sessionId };
    }
  }

  static async getRunHistory(sessionId: string) {
    try {
      const history = await MemoryService.getHistory(sessionId);
      const session = await MemoryService.getSession(sessionId);
      return {
        sessionId: sessionId,
        state: session?.state,
        messageCount: session?.message_count,
        messages: history
      };
    } catch (error: any) {
      console.error('❌ GetRunHistory error:', error);
      return null;
    }
  }
}

export default AgentRunService;
