import express, { Router, Request, Response } from 'express';
import { AgentManager } from '../agents/AgentManager';
const router = express.Router();
const agentManager = new AgentManager();
router.get('/agents', (req, res) => { res.json({ totalAgents: agentManager.listAgents().length, agents: agentManager.listAgents() }); });
router.post('/agents/:name/execute', async (req, res) => { try { const r = await agentManager.executeAgent(req.params.name, req.body.input); res.json({ success: true, result: r }); } catch(e: any) { res.status(400).json({ error: e.message }); } });
export default router;
