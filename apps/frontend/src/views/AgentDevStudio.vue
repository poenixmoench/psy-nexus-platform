<template>
  <div class="agent-studio">
    <div class="header">
      <h1>🤖 Agent Development Studio</h1>
      <p>Nexus Dev v2 - Dynamic Orchestration</p>
    </div>

    <div v-if="loading" class="status-msg">Lade Agenten-Registry...</div>

    <div v-else class="agents-grid">
      <button 
        v-for="agent in agents" 
        :key="agent.id" 
        @click="startAgent(agent.id)" 
        class="agent-button"
      >
        <span class="icon">{{ agent.icon || '🤖' }}</span>
        <span class="name">{{ agent.name }}</span>
        <span class="description" v-if="agent.description">{{ agent.description }}</span>
      </button>
    </div>

    <div class="output-panel">
      <div class="output-header">Live Log Output</div>
      <div class="output-box" ref="scrollBox">
        <div v-for="(msg, i) in messages" :key="i" class="message">{{ msg }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      agents: [],
      messages: [],
      loading: true
    }
  },
  async mounted() {
    await this.fetchAgents();
  },
  methods: {
    async fetchAgents() {
      try {
        const res = await fetch('/api/agents');
        if (!res.ok) throw new Error('API nicht erreichbar');
        this.agents = await res.json();
        this.messages.push(`System: ${this.agents.length} Agenten geladen.`);
      } catch (e) {
        this.messages.push(`Fehler beim Laden der Agenten: ${e.message}`);
      } finally {
        this.loading = false;
      }
    },
    async startAgent(id) {
      this.messages.push(`>>> Initialisiere Run für: ${id}...`);
      try {
        const res = await fetch(`/api/runs/start-live/${id}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ initialPrompt: 'Web-UI Trigger' })
        });
        const data = await res.json();
        this.messages.push(`[System] Run ID: ${data.runId} - Status: ${data.status}`);
      } catch (e) {
        this.messages.push(`[Fehler] Start fehlgeschlagen: ${e.message}`);
      }
      this.scrollToBottom();
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const box = this.$refs.scrollBox;
        if (box) box.scrollTop = box.scrollHeight;
      });
    }
  }
}
</script>

<style scoped>
.agent-studio { padding: 40px; background: #0f172a; min-height: 100vh; color: white; font-family: 'Inter', sans-serif; }
.status-msg { text-align: center; font-style: italic; color: #94a3b8; }
.agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.agent-button { 
  padding: 20px; background: #1e293b; border: 1px solid #334155; color: white; 
  border-radius: 12px; cursor: pointer; display: flex; flex-direction: column; 
  align-items: center; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.agent-button:hover { background: #2563eb; transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); }
.icon { font-size: 2rem; margin-bottom: 8px; }
.name { font-weight: bold; }
.description { font-size: 0.75rem; color: #94a3b8; margin-top: 5px; text-align: center; }
.output-panel { margin-top: 40px; }
.output-header { font-size: 0.8rem; text-transform: uppercase; color: #64748b; margin-bottom: 8px; font-weight: bold; }
.output-box { 
  background: #020617; padding: 15px; height: 200px; overflow-y: auto; 
  color: #10b981; font-family: 'Fira Code', monospace; border-radius: 6px; border: 1px solid #1e293b; 
}
.message { margin-bottom: 4px; font-size: 0.9rem; }
</style>
