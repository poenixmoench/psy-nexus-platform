export class AgentController {
  static async getAllAgents(req: any, res: any) {
    res.json({ agents: 8, status: 'ok' });
  }

  static async getAgentStatus(req: any, res: any) {
    const { id } = req.params;
    res.json({ success: true, agentId: id, status: 'active' });
  }
}
