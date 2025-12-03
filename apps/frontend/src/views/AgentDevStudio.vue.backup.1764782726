<template>
  <div class="agent-studio">
    <!-- Header -->
    <div class="header">
      <h1>🤖 Agent Development Studio</h1>
      <p>Live Multi-Model AI Orchestration</p>
    </div>

    <!-- Agents Grid -->
    <div class="agents-grid">
      <button
        v-for="agent in agents"
        :key="agent.name"
        @click="startAgent(agent.name)"
        :disabled="loading"
        class="agent-button"
      >
        <span class="icon">{{ agent.icon }}</span>
        <span class="name">{{ agent.name }}</span>
      </button>
    </div>

    <!-- Live Stream Output -->
    <div class="output-panel">
      <h2>📋 Echtzeit-Ausgabe</h2>
      <div class="output-box">
        <div v-if="!isRunning" class="placeholder">
          Wähle einen Agenten aus...
        </div>
        <div v-else class="stream">
          <div v-for="(msg, idx) in messages" :key="idx" class="message">
            {{ msg }}
          </div>
          <div v-if="loading" class="spinner">⏳ Lädt...</div>
        </div>
      </div>
      <div class="stats">
        <span>📊 Tokens: {{ tokenCount }}</span>
        <span>⏱️ Status: {{ status }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentDevStudio',
  data() {
    return {
      agents: [
        { name: 'Nexus Koordinator', icon: '🧠' },
        { name: 'Qwen2.5 Coder', icon: '💻' },
        { name: 'Performance Tuner', icon: '⚡' },
        { name: 'UI Magier', icon: '🎨' },
        { name: 'Debugger Fuchs', icon: '🔍' },
        { name: 'Data Archivist', icon: '📦' }
      ],
      messages: [],
      loading: false,
      isRunning: false,
      tokenCount: 0,
      status: 'Idle',
      ws: null,
      runId: null
    };
  },
  methods: {
    async startAgent(agentName) {
      this.loading = true;
      this.isRunning = true;
      this.messages = [];
      this.tokenCount = 0;
      this.status = 'Running...';

      try {
        // POST to start live run
        const response = await fetch(`/api/runs/start-live/${agentName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initialPrompt: 'Analyze and optimize' })
        });

        const data = await response.json();
        this.runId = data.runId;

        // Connect WebSocket
        this.connectWebSocket();
      } catch (error) {
        this.messages.push(`❌ Error: ${error.message}`);
        this.status = 'Error';
        this.loading = false;
        this.isRunning = false;
      }
    },

    connectWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/run?runId=${this.runId}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.messages.push('✅ WebSocket Connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.message) {
            this.messages.push(data.message);
          }
          if (data.tokens) {
            this.tokenCount += data.tokens;
          }
          if (data.status) {
            this.status = data.status;
          }
          if (data.completed) {
            this.messages.push('✅ Workflow abgeschlossen!');
            this.status = 'Completed';
            this.loading = false;
            this.isRunning = false;
            this.ws.close();
          }
        } catch (e) {
          console.error('WebSocket parse error:', e);
        }
      };

      this.ws.onerror = (error) => {
        this.messages.push(`❌ WebSocket Error: ${error}`);
        this.status = 'Error';
        this.loading = false;
      };

      this.ws.onclose = () => {
        this.messages.push('❌ WebSocket Closed');
        this.loading = false;
      };
    }
  }
};
</script>

<style scoped>
.agent-studio {
  padding: 20px;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  min-height: 100vh;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0;
  background: linear-gradient(135deg, #00d4ff, #0099ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header p {
  font-size: 1.1rem;
  color: #888;
  margin: 10px 0 0 0;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 40px;
}

.agent-button {
  padding: 20px;
  background: #1e40af;
  border: 2px solid #0066ff;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.agent-button:hover:not(:disabled) {
  background: #0066ff;
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 102, 255, 0.5);
}

.agent-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  font-size: 2rem;
}

.output-panel {
  background: #111827;
  border: 1px solid #333;
  border-radius: 10px;
  padding: 20px;
}

.output-box {
  background: #0f172a;
  border: 1px solid #1e3a8a;
  border-radius: 8px;
  padding: 15px;
  height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.placeholder {
  color: #666;
  text-align: center;
  padding-top: 130px;
}

.message {
  margin: 8px 0;
  color: #0f0;
  word-wrap: break-word;
}

.spinner {
  color: #00d4ff;
  animation: spin 1s linear infinite;
}

.stats {
  display: flex;
  gap: 30px;
  padding: 10px;
  background: #1e293b;
  border-radius: 8px;
  font-size: 0.95rem;
}

@keyframes spin {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .agents-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .header h1 {
    font-size: 1.8rem;
  }
}
</style>
