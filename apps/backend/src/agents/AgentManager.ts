import { pool } from '../services/database';
import { ROLES } from '../services/AgentConfigs';
import fs from 'fs';
import path from 'path';

export class AgentManager {
    private agents: Map<string, any> = new Map();

    constructor() {
        this.initialize();
    }

    private async initialize() {
        // 1. Rollen aus der Config laden (UIUX Magier, GitHub, etc.)
        console.log("🔄 Lade Agenten-Rollen aus Config...");
        for (const [key, role] of Object.entries(ROLES)) {
            await this.registerInDb(role.name, role.name, role.systemPrompt);
            this.agents.set(role.name, { ...role, isConfigRole: true });
        }

        // 2. Instanzen aus dem Ordner laden (NexusPrime, Coder)
        const agentsDir = path.join(__dirname, 'instances');
        if (fs.existsSync(agentsDir)) {
            const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
            for (const file of files) {
                try {
                    const agentModule = await import(path.join(agentsDir, file));
                    const AgentClass = agentModule.default || agentModule[Object.keys(agentModule)[0]];
                    if (typeof AgentClass === 'function') {
                        const instance = new AgentClass();
                        const name = instance.name || file.replace(/\.[^/.]+$/, "");
                        await this.registerInDb(name, instance.role || 'Agent', instance.systemPrompt || '');
                        this.agents.set(name, instance);
                    }
                } catch (e) { console.error(`Fehler bei ${file}:`, e); }
            }
        }
        console.log(`✅ ${this.agents.size} Agenten insgesamt registriert.`);
    }

    private async registerInDb(name: string, role: string, prompt: string) {
        await pool!.query(`
            INSERT INTO agents (name, role, system_prompt, status)
            VALUES ($1, $2, $3, 'idle')
            ON CONFLICT (name) DO UPDATE SET 
                role = EXCLUDED.role, 
                system_prompt = EXCLUDED.system_prompt,
                last_seen = CURRENT_TIMESTAMP
        `, [name, role, prompt]);
    }

    public listAgents() {
        return Array.from(this.agents.values()).map(a => ({
            name: a.name,
            role: a.role || a.name,
            status: 'online'
        }));
    }

    public async executeAgent(name: string, input: string) {
        const agent = this.agents.get(name);
        if (!agent) throw new Error("Agent nicht gefunden");
        if (agent.run) return await agent.run(input);
        return `Rolle ${name} aktiv. Starte Orchestrierung...`;
    }
}
