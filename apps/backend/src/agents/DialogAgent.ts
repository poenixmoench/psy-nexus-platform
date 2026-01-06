export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export class DialogAgent {
  public conversationHistory: Message[] = [];

  constructor(
    public readonly id = 'DialogAgent',
    public readonly name = 'Dialog Agent',
    public readonly icon = ' [DIALOG] ',
    public readonly description = 'Intelligenter Developer Assistant'
  ) {}

  public addUserMessage(content: string) {
    this.conversationHistory.push({ 
      role: 'user', 
      content, 
      timestamp: new Date().toISOString() 
    });
  }

  public addAssistantMessage(content: string) {
    this.conversationHistory.push({ 
      role: 'assistant', 
      content, 
      timestamp: new Date().toISOString() 
    });
  }

  public buildConversationContext(): string {
    const history = this.conversationHistory.slice(-6)
      .map(msg => `${msg.role === 'user' ? '👤' : ' [AI] '} ${msg.content}`)
      .join('\n\n');
    return `PSY-NEXUS Developer Assistant Konversation:\n\n${history}\n\nSYSTEM: Antworte präzise auf Deutsch.`;
  }
}
