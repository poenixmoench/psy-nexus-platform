import { askAI } from '../services/AIService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export class DialogAgent {
  private conversationHistory: Message[] = [];

  constructor(
    public readonly id = 'DialogAgent',
    public readonly name = 'Dialog Agent 💬',
    public readonly icon = '💬',
    public readonly description = 'Intelligenter Entwickler-Assistent mit Qwen 2.5 Coder'
  ) {}

  async execute(task: string, code?: string): Promise<string> {
    const userMessage: Message = {
      role: 'user',
      content: task + (code ? `\n\nCode:\n${code}` : ''),
      timestamp: new Date().toISOString()
    };

    this.conversationHistory.push(userMessage);

    // Kontext + System-Prompt bauen
    const context = this.buildConversationContext();
    const response = await askAI(context);

    const agentMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };

    this.conversationHistory.push(agentMessage);
    return response;
  }

  private buildConversationContext(): string {
    const history = this.conversationHistory.slice(-6).map(msg => 
      `${msg.role === 'user' ? '👤' : '🤖'} ${msg.content}`
    ).join('\n\n');

    return `PSY-NEXUS Developer Assistant Konversation:

${history}

---
SYSTEM: Du bist Entwickler-Assistent. Antworte auf Deutsch, stelle Rückfragen bei Unklarheiten, denke schrittweise.`;
  }

  getHistory(): Message[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}
