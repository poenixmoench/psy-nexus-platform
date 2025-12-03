<template>
  <div style="background: #0d0d0d; color: #f0f0f0; padding: 30px; font-family: 'Ubuntu Mono', monospace; max-width: 1000px; margin: 0 auto;">
    <h1 style="color: #00ffff; border-bottom: 2px solid #00ffff; padding-bottom: 10px;">🤖 Agent Dev Studio (M5.1-M5.2)</h1>

    <div style="margin: 20px 0;">
      <label style="color: #ff00ff; font-weight: bold;">KI-Befehl:</label>
      <input v-model="command" type="text" placeholder="Generiere Vue Component..." style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #00ff00; color: #00ff00; margin: 5px 0;" />
    </div>

    <div style="margin: 20px 0;">
      <label style="color: #ff00ff; font-weight: bold;">Agent:</label>
      <select v-model="agentId" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #00ff00; color: #00ff00; margin: 5px 0;">
        <option value="agent_001">Code Agent</option>
        <option value="agent_002">Design Agent</option>
      </select>
    </div>

    <button @click="submitJob" :disabled="isSending" style="width: 100%; padding: 12px; background: transparent; color: #00ffff; border: 2px solid #00ffff; cursor: pointer; font-weight: bold; margin-bottom: 20px;">
      {{ isSending ? '⏳ Sending...' : '🚀 Submit Job' }}
    </button>

    <div style="border: 1px dashed #ff00ff; padding: 15px; margin: 20px 0; background: #1a1a1a;">
      <h3 style="color: #00ffff; margin-top: 0;">Status</h3>
      <p style="color: #ff00ff;">{{ jobStatus }}</p>
      <p v-if="lastJobData" style="color: #00ff00; background: #0d0d0d; padding: 10px; border-radius: 4px; max-height: 100px; overflow-y: auto; white-space: pre-wrap;">{{ lastJobData }}</p>
    </div>

    <div style="border: 2px solid #00ffff; padding: 20px; margin: 20px 0; background: #1a1a1a;">
      <h3 style="color: #00ffff; margin-top: 0;">📡 Real-Time Logs (WebSocket)</h3>
      <button @click="clearLogs" style="padding: 8px 15px; background: transparent; color: #ff00ff; border: 1px solid #ff00ff; cursor: pointer; font-family: inherit; margin-bottom: 10px;">Clear Logs</button>
      <div style="background: #0d0d0d; border: 1px solid #333; padding: 10px; max-height: 200px; overflow-y: auto;">
        <p v-if="realtimeLog.length === 0" style="color: #888; font-style: italic;">Waiting for feedback... (WS: {{ wsConnected ? '✅' : '❌' }})</p>
        <div v-for="(entry, idx) in realtimeLog" :key="idx" style="color: #00ff00; margin-bottom: 3px; border-left: 2px solid #00ffff; padding-left: 8px;">{{ entry }}</div>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #1a1a1a; border: 1px solid #333; border-radius: 4px;">
      <span :style="{ width: '12px', height: '12px', backgroundColor: wsConnected ? '#00ff00' : '#ff0000', borderRadius: '50%', boxShadow: wsConnected ? '0 0 5px #00ff00' : '0 0 5px #ff0000' }"></span>
      {{ wsConnected ? '🟢 WebSocket Connected' : '🔴 WebSocket Disconnected' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const command = ref('Generiere Vue Component Skeleton für Event-Details');
const agentId = ref('agent_001');
const jobStatus = ref('IDLE');
const isSending = ref(false);
const lastJobData = ref('');
const realtimeLog = ref<string[]>([]);
const ws = ref<WebSocket | null>(null);
const wsConnected = ref(false);

async function submitJob() {
  if (isSending.value) return;
  isSending.value = true;
  jobStatus.value = 'SENDING...';
  realtimeLog.value = [];

  try {
    const response = await axios.post('/api/agents/orchestrate', {
      command: command.value,
      agentId: agentId.value
    });

    if (response.status === 202) {
      jobStatus.value = '✅ QUEUED (Waiting for Worker)';
      lastJobData.value = JSON.stringify(response.data, null, 2);
      addLog('[M5.1] ✅ Job submitted successfully');
    }
  } catch (error) {
    jobStatus.value = '❌ ERROR';
    addLog(`[M5.1] ❌ Error: ${error}`);
  } finally {
    isSending.value = false;
  }
}

function addLog(msg: string) {
  realtimeLog.value.push(msg);
  if (realtimeLog.value.length > 100) realtimeLog.value.shift();
}

function clearLogs() {
  realtimeLog.value = [];
}

onMounted(() => {
  try {
    ws.value = new WebSocket('ws://localhost:3001/ws/orchestration');
    ws.value.onopen = () => {
      wsConnected.value = true;
      addLog('[M5.2] 🟢 WebSocket Connected');
    };
    ws.value.onmessage = (e) => {
      const ts = new Date().toLocaleTimeString('de-DE');
      addLog(`[WS ${ts}] ${e.data}`);
    };
    ws.value.onerror = () => {
      wsConnected.value = false;
      addLog('[M5.2] ⚠️ WebSocket Error');
    };
    ws.value.onclose = () => {
      wsConnected.value = false;
      addLog('[M5.2] 🔴 WebSocket Disconnected');
    };
  } catch (err) {
    addLog(`[M5.2] ❌ WebSocket Error: ${err}`);
  }
});

onUnmounted(() => {
  if (ws.value?.readyState === WebSocket.OPEN) {
    ws.value.close();
  }
});
</script>
