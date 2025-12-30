export class AgentController {
  static async getAgents(req: any, res: any) {
    res.json({ agents: 8, status: 'ok' });
  }
  
  static async executeAgent(req: any, res: any) {
    const { agentId } = req.params;
    res.json({ success: true, agentId });
  }
}
