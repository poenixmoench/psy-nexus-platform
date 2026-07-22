<template>
<div class="neural-grid">
<div v-if="showToast" class="system-toast">{{ toastMsg }}</div>
<aside class="agents-section">
<div class="section-header holographic-pulse">AGENTEN</div>
<div class="agents-grid">
<div v-for="(agent, name) in agents" :key="name"
class="agent-card" :class="{ active: activeAgent === name }"
@click="activeAgent = name">
<div class="card-header">
<span class="agent-name">{{ name.replace(/_/g, "-").toUpperCase() }}</span>
<div class="signal-wrapper">
<div class="status-indicator" :class="{ processing: streamingAgent === name }"></div>
<div v-if="streamingAgent === name" class="pulse-ring"></div>
</div>
</div>
<div class="card-body">{{ (name.includes('ORION') ? 'Strategische Leitung' : name.includes('PLAN') ? 'Projekt Koordination' : name.includes('DESIGN') ? 'UI/UX Architektur' : name.includes('FRONTEND') ? 'Infrastruktur Architektur' : name.includes('BACKEND') ? 'Logik Architektur' : name.includes('QA') ? 'Qualitätssicherung' : name.includes('OPTIM') ? 'Performance Tuning' : name.includes('DOKU') ? 'Technische Dokumentation' : 'Nexus Agent').toUpperCase() }}</div>
</div>
</div>
</aside>
<main class="chat-section">
<div class="neural-map-wrapper">
<div class="neural-map-header">
<div class="header-left">
<span class="header-title holographic-pulse">NEXUS ZENTRALE</span>
<span class="header-status">{{ displayNameMap[activeAgent] || activeAgent }}</span>
</div>
<div class="header-actions">
<button v-if="hasPendingLocks" @click="releaseAlphaLock" class="nexus-btn unlock-btn">🔓 FREI</button>
<button v-if="stagingActive" @click="publishToProd" class="nexus-btn gold-prod-btn">RELEASE TO MAIN SITE</button>
</div>
</div>
<svg class="neural-map" viewBox="0 0 300 300">
<defs>
<filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
<feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur"/>
<feComposite in="SourceGraphic" in2="blur" operator="over"/>
</filter>
</defs>
<g class="seed-of-life" filter="url(#softGlow)" :class="{ 'is-streaming': streamingAgent }">
<circle cx="150" cy="150" r="42" class="geo-circle" />
<circle v-for="n in 6" :key="n"
:cx="150 + 42 * Math.cos((n * 60 * Math.PI) / 180)"
:cy="150 + 42 * Math.sin((n * 60 * Math.PI) / 180)"
r="42" class="geo-circle" />
</g>
<g v-for="(name, i) in agentNames" :key="i">
<line x1="150" y1="150" :x2="nodeX(i)" :y2="nodeY(i)"
class="workflow-line" :class="{ active: activeAgent === name }" />
<g :class="['node', { active: activeAgent === name, streaming: streamingAgent === name }]">
<circle :cx="nodeX(i)" :cy="nodeY(i)" r="8" class="node-circle" />
<text :x="nodeX(i)" :y="nodeY(i) + 22" class="node-label">{{ name.substring(0, 3).toUpperCase() }}</text>
</g>
</g>
</svg>
</div>
<div class="messages-area" ref="msgBox">
<div v-for="(msg, i) in agents[activeAgent]?.history" :key="i" class="message" :class="msg.type">
<div class="msg-header">
<span class="msg-agent">{{ msg.agent }}</span>
<button v-if="msg.type === 'agent'" @click="copy(msg.text)" class="btn-copy">COPY</button>
</div>
<div class="msg-text" v-html="marked(msg.text)"></div>
</div>
<div v-if="streamingAgent === activeAgent" class="message agent streaming">
<div class="msg-header">
<span class="msg-agent">{{ streamingAgent }}</span>
<span v-if="streamingModel" class="model-badge">[{{ streamingModel }}]</span>
</div>
<div class="msg-text streaming-live-text">{{ streamingText }}<span class="cursor">▌</span></div>
</div>
<div v-if="streamingAgent" class="stop-container">
<button @click="stopGeneration" class="btn-stop">■ STOP GENERATION</button>
</div>
<div v-if="awaitingHandover" class="handover-zone">
<div class="handover-label holographic-pulse">STAFETTEN-ÜBERGABE ERFORDERLICH</div>
<div class="handover-buttons">
<button v-for="nextAgent in suggestedAgents"
@click="triggerHandover(nextAgent)"
class="nexus-btn host-pulse handover-btn">
BERGEBE AN {{ nextAgent }}
</button>
</div>
</div>
</div>
<div class="input-zone">
<textarea id="user-input" name="userInput" v-model="userInput" @keydown.enter.exact.prevent="send"
:placeholder="'BEFEHL AN ' + activeAgent + '...'"
class="system-input"></textarea>
<button @click="send" class="btn-execute" :disabled="!!streamingAgent">SENDEN</button>
</div>
</main>
<section class="stats-section">
<div class="section-header holographic-pulse">LIVE VORSCHAU</div>
<div class="preview-controls">
<button @click="releaseAlphaLock" class="nexus-btn prev-btn">◀ FREI</button>
<button @click="hostProject" class="nexus-btn host-pulse">🏠 HOSTEN</button>
<button @click="resetWorkspace" class="nexus-btn reset-pulse">ZURÜCK</button>
</div>
<div class="preview-box">
<iframe v-if="agentPreviews[activeAgent]" :key="activeAgent"
:srcdoc="agentPreviews[activeAgent]" class="preview-iframe"
sandbox="allow-scripts allow-same-origin" title="Live Preview"></iframe>
<div v-else class="preview-empty">Warte auf {{ displayNameMap[activeAgent] || activeAgent }}...</div>
</div>
</section>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useWebSocketStore } from '../stores/webSocketStore'
import { io } from 'socket.io-client'
import { marked } from 'marked'
import { useSanitizeSVG } from '../composables/useSanitizeSVG';

const socket = io('', { path: '/socket.io/', transports: ['websocket'] })
const { sanitizeSVG } = useSanitizeSVG();

const agents = ref<any>({})
const activeAgent = ref('ORION_AGENT')
const userInput = ref('')
const msgBox = ref<HTMLElement | null>(null)
const agentPreviews = ref<Record<string, string>>({})
const streamingAgent = ref('')
const streamingModel = ref('')
const workflowId = ref<string | null>(null)
const streamingText = ref('')
const updateTimeoutId = ref<NodeJS.Timeout | null>(null)
const showToast = ref(false)
const toastMsg = ref('')
const stagingActive = ref(false)
const hasPendingLocks = ref(false)
const awaitingHandover = ref(false)
const suggestedAgents = ref<string[]>([])
const typeQueue = ref<string[]>([])
let isTyping = false
const typingSpeed = 15

const webSocketStore = useWebSocketStore()

const checkForPendingLocks = async () => {
  try {
    const res = await fetch("/api/stigmergy/tags/pending");
    const data = await res.json();
    hasPendingLocks.value = data.count > 0;
  } catch (e) {
    hasPendingLocks.value = false;
  }
};

const releaseAlphaLock = async () => {
  if (!confirm("Alpha-Lock freigeben?")) return;
  try {
    const res = await fetch("/api/stigmergy/tags/release-all", { method: "POST" });
    const result = await res.json();
    if (result.success) triggerToast("✅ Alle Locks freigegeben");
  } catch (e) {
    triggerToast("❌ Netzwerkfehler");
  }
};

const triggerHandover = (agentName: string) => {
  activeAgent.value = agentName
  awaitingHandover.value = false
  suggestedAgents.value = []
  triggerToast(`STAFETTE: Übergabe an ${agentName}`)
}

const hostProject = () => {
  triggerToast("DEPLOYMENT INITIALISIERT...")
  socket.emit('host-project', { agent: activeAgent.value })
}

const publishToProd = () => {
  if (confirm("Bist du sicher? Dies aktualisiert die HAUPTSEITE!")) {
    socket.emit('publish-to-production');
  }
};

const processQueue = () => {
  if (typeQueue.value.length > 0) {
    isTyping = true;
    streamingText.value += typeQueue.value.shift();
    if (streamingText.value.includes('```')) {
      const code = extractCodeBlock(streamingText.value);
      if (code && code.length > 5) {
        agentPreviews.value[streamingAgent.value] = sanitizeSVG(code);
      }
    }
    nextTick(() => { if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight; });
    setTimeout(processQueue, typingSpeed);
  } else {
    isTyping = false;
  }
};

const agentNames = computed(() => Object.keys(agents.value || {}))
const nodeX = (index: number) => 150 + 85 * Math.cos((index / (agentNames.value.length || 1)) * Math.PI * 2 - Math.PI / 2)
const nodeY = (index: number) => 150 + 85 * Math.sin((index / (agentNames.value.length || 1)) * Math.PI * 2 - Math.PI / 2)

const triggerToast = (m: string) => {
  toastMsg.value = m
  showToast.value = true
  setTimeout(() => showToast.value = false, 2000)
}

const send = async () => {
  const txt = userInput.value.trim();
  if (!txt) return;
  agents.value[activeAgent.value].history.push({ agent: 'ALPHA', text: txt, type: 'user' });
  streamingAgent.value = activeAgent.value;
  streamingText.value = '';
  streamingModel.value = '';
  userInput.value = '';
  socket.emit('agent-message', { agentName: activeAgent.value, message: txt, workflowId: workflowId.value });
  nextTick(scrollToBottom);
}

const stopGeneration = () => {
  socket.emit('abort-generation')
  if (streamingAgent.value && streamingText.value) {
    agents.value[streamingAgent.value].history.push({ agent: streamingAgent.value, text: streamingText.value + "\n[HALTED]", type: 'agent' })
  }
  streamingAgent.value = ''
  streamingText.value = ''
  streamingModel.value = ''
  triggerToast("STOPPED")
}

const copy = (t: string) => {
  navigator.clipboard.writeText(t)
  triggerToast("COPIED")
}

const scrollToBottom = () => {
  if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
}

const extractCodeBlock = (text: string): string => {
  let match = text.match(/```(?:html|svg|xml|jsx|tsx|javascript|typescript|js|ts)\s+([\s\S]*?)```/i)
  if (match && match[1]) return match[1].trim()
  match = text.match(/```\s*([\s\S]*?)```/)
  if (match && match[1] && match[1].trim().startsWith('<')) return match[1].trim()
  return ''
}

const displayNameMap: Record<string, string> = {
  "ORION_AGENT": "ORION",
  "PLAN_AGENT": "PLAN",
  "FRONTEND_MEISTER_AGENT": "FRONTEND",
  "DESIGN_ALCHEMIST_AGENT": "DESIGN",
  "BACKEND_ARCHITEKT_AGENT": "BACKEND",
  "QA_GURU_AGENT": "QA",
  "OPTIMIERER_AGENT": "OPTIM",
  "DOKUMENTATION_AGENT": "DOKU"
};

onMounted(async () => {
  await checkForPendingLocks();
  const res = await fetch('/api/agents');
  const data = await res.json();
  data.forEach((a: any) => agents.value[a.name] = { ...a, history: [] });

  socket.on('agent-chunk', (data) => {
    if (streamingAgent.value === data.agent) {
      if (data.model) streamingModel.value = data.model.toUpperCase();
      const chars = (data.chunk || '').split('');
      typeQueue.value.push(...chars);
      if (!isTyping) processQueue();
    }
  });

  socket.on('agent-done', (data) => {
    if (data && data.agent && streamingAgent.value === data.agent) {
      const checkFinished = setInterval(() => {
        if (typeQueue.value.length === 0) {
          clearInterval(checkFinished);
          agents.value[data.agent].history.push({ agent: data.agent, text: streamingText.value, type: 'agent' });
          const code = extractCodeBlock(streamingText.value);
          if (code) agentPreviews.value[activeAgent.value] = sanitizeSVG(code);
          streamingAgent.value = '';
          streamingText.value = '';
          streamingModel.value = '';
        }
      }, 100);
    }
  });

  socket.on('request-handover', (data) => {
    awaitingHandover.value = true;
    suggestedAgents.value = data.suggestedAgents || [];
  });

  socket.on('deployment-result', (data) => {
    if (data.success) {
      triggerToast('🚀 DEPLOYMENT ERFOLGREICH');
      stagingActive.value = true;
    } else {
      triggerToast('❌ FEHLER: ' + data.error);
    }
  });
});
</script>

<style scoped>
* { font-family: 'Ubuntu Mono', monospace; box-sizing: border-box; color: #e5e4e2; }
.neural-grid { display: grid; grid-template-columns: 260px 1fr 1.5fr; height: 100vh; background: #000; color: #32ff00; overflow: hidden; }
.agents-section { display: flex; flex-direction: column; height: 100vh; padding: 20px 15px; background: #050505; }
.chat-section { background: #0a0a0a; display: flex; flex-direction: column; overflow: hidden; }
.stats-section { background: #050505; border-left: 1px solid rgba(50, 255, 0, 0.15); padding: 15px; display: flex; flex-direction: column; }
.section-header { font-size: 11px; opacity: 0.8; font-weight: bold; margin-bottom: 15px; color: #32ff00; letter-spacing: 2px; }
.agents-grid { display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1; padding-bottom: 20px; }
.agent-card { padding: 10px; border: 1px solid rgba(50, 255, 0, 0.1); cursor: pointer; transition: 0.2s; background: #000; border-radius: 4px; margin-bottom: 0; flex-shrink: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 5px; }
.agent-name { font-size: 10px; word-break: break-word; color: #a0a0a0 !important; font-size: 11px; }
.agent-card.active .agent-name { color: #cfb53b !important; text-shadow: 0 0 10px rgba(207, 181, 59, 0.5); }
.card-body { color: #707070 !important; font-size: 9px; }
.signal-wrapper { position: relative; width: 10px; height: 10px; flex-shrink: 0; }
.status-indicator { width: 10px; height: 10px; border-radius: 50%; background: #111; border: 1px solid #32ff00; }
.status-indicator.processing { background: #32ff00; box-shadow: 0 0 8px #32ff00; }
.pulse-ring { position: absolute; top: -5px; left: -5px; width: 20px; height: 20px; border: 1px solid #32ff00; border-radius: 50%; animation: pulse 3s infinite; }
.neural-map-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid rgba(50, 255, 0, 0.1); }
.header-left { display: flex; align-items: center; gap: 15px; }
.header-title { font-size: 1.1rem !important; letter-spacing: 2px; }
.header-status { font-size: 10px; background: rgba(50, 255, 0, 0.1); padding: 2px 6px; border-radius: 2px; }
.header-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.preview-controls { position: absolute; top: 15px; right: 15px; display: flex; gap: 8px; z-index: 100; }
.nexus-btn { padding: 6px 15px; border-radius: 4px; font-family: 'Ubuntu Mono', monospace; font-weight: bold; font-size: 12px; cursor: pointer; transition: 0.3s; text-transform: uppercase; }
.host-pulse { background: #32ff00; color: #000; border: none; box-shadow: 0 0 10px rgba(50, 255, 0, 0.4); }
.host-pulse:hover { box-shadow: 0 0 20px #32ff00; transform: scale(1.05); }
.handover-btn { width: 100%; margin-bottom: 10px; background: #ff007f; color: #fff; border: none; box-shadow: 0 0 10px rgba(255, 0, 127, 0.4); }
.handover-btn:hover { box-shadow: 0 0 20px #ff007f; transform: scale(1.02); }
.gold-prod-btn { background: linear-gradient(45deg, #cfb53b, #ffcf40) !important; color: #000 !important; font-weight: 900; border: 1px solid #000; box-shadow: 0 0 15px rgba(255, 207, 64, 0.5); margin-left: 10px; }
.gold-prod-btn:hover { transform: scale(1.05); box-shadow: 0 0 25px rgba(255, 207, 64, 0.8); }
.unlock-btn { background: linear-gradient(45deg, #ff6b6b, #ff8e8e) !important; color: #fff !important; font-weight: 900; border: 1px solid #ff6b6b; box-shadow: 0 0 15px rgba(255, 107, 107, 0.5); margin-left: 10px; }
.unlock-btn:hover { transform: scale(1.05); box-shadow: 0 0 25px rgba(255, 107, 107, 0.8); }
.handover-zone { padding: 20px; background: rgba(255, 0, 127, 0.1); border: 1px dashed #ff007f; border-radius: 8px; margin-top: 15px; text-align: center; }
.handover-label { display: block; margin-bottom: 15px; font-size: 14px; font-weight: bold; }
.handover-buttons { display: flex; flex-direction: column; gap: 10px; }
.input-zone { padding: 15px 20px; display: flex; align-items: center; gap: 10px; background: #080808; border-top: 1px solid rgba(50, 255, 0, 0.1); }
.system-input { flex: 1; height: 42px; background: rgba(50, 255, 0, 0.05); border: 1px solid rgba(50, 255, 0, 0.2); border-radius: 8px; color: #32ff00; padding: 8px 15px; font-size: 13px; resize: none; outline: none; transition: border-color 0.2s; }
.btn-execute { height: 42px; padding: 0 25px; background: transparent; border: 1px solid #32ff00; color: #32ff00; border-radius: 8px; font-weight: 900; text-transform: uppercase; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.btn-execute:hover:not(:disabled) { background: rgba(50, 255, 0, 0.1); box-shadow: 0 0 15px rgba(50, 255, 0, 0.3); transform: translateY(-1px); }
.neural-map { height: 220px; width: 100%; opacity: 0.9; }
.geo-circle { fill: none; stroke: #cfb53b; stroke-width: 0.8; opacity: 0.2; transition: stroke 0.5s, opacity 0.5s; }
.is-streaming .geo-circle { stroke: #ff007f; opacity: 1; }
.workflow-line.active { stroke: #32ff00; stroke-width: 2; opacity: 1; }
.node-circle { fill: #111; stroke: #32ff00; transition: all 0.3s; }
.node.active .node-circle { fill: #32ff00; box-shadow: 0 0 15px #32ff00; }
.node.streaming .node-circle { animation: thinking-pulse 1s infinite alternate; }
@keyframes thinking-pulse { from { r: 8; opacity: 1; fill: #32ff00; } to { r: 12; opacity: 0.5; fill: #ff007f; } }
.node-label { fill: #ffcf40 !important; font-size: 11px; font-weight: 900; text-shadow: 0 0 8px rgba(255, 207, 64, 0.6); pointer-events: none; }
.messages-area { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
.message { padding: 10px; border-radius: 4px; max-width: 85%; font-size: 12px; }
.message.user { align-self: flex-end; background: rgba(229, 228, 226, 0.1) !important; border-right: 3px solid #e5e4e2 !important; }
.message.user .msg-text, .message.user .msg-agent { color: #e5e4e2 !important; }
.message.agent { align-self: flex-start; background: rgba(207, 181, 59, 0.1) !important; border-left: 3px solid #cfb53b !important; }
.message.agent .msg-text, .message.agent .msg-agent { color: #cfb53b !important; text-shadow: 0 0 5px rgba(207, 181, 59, 0.3); }
.preview-iframe { background: #fff; transition: opacity 0.5s ease; }
.preview-empty { color: #cfb53b; font-family: 'Ubuntu Mono', monospace; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; text-align: center; }
.cursor { display: inline-block; width: 8px; height: 15px; background: #32ff00; margin-left: 2px; box-shadow: 0 0 8px #32ff00; animation: blink 0.8s infinite; }
.streaming-live-text { white-space: pre-wrap !important; word-wrap: break-word; font-family: 'Ubuntu Mono', monospace; color: #a0ffa0; line-height: 1.5; transition: all 0.1s ease; }
@keyframes blink { 50% { opacity: 0; } }
@keyframes pulse { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
.holographic-pulse { background: linear-gradient(90deg, #ff007f, #00ffff, #ffcf40, #00ffff, #ff007f); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: holo-flow 4s linear infinite; font-weight: 900; font-size: 1.1rem !important; letter-spacing: 2px; }
@keyframes holo-flow { to { background-position: 200% center; } }
.preview-controls .nexus-btn { background: rgba(50, 255, 0, 0.15) !important; border: 1px solid #32ff00 !important; color: #32ff00 !important; }
.preview-controls .nexus-btn.locked { background: rgba(255, 0, 127, 0.25) !important; border: 1px solid #ff007f !important; color: #ff007f !important; }
.preview-controls .host-pulse { background: rgba(0, 255, 255, 0.15) !important; border: 1px solid #00ffff !important; color: #00ffff !important; }
.preview-controls .reset-pulse { background: rgba(255, 207, 64, 0.15) !important; border: 1px solid #ffcf40 !important; color: #ffcf40 !important; }
.model-badge { font-size: 9px; background: rgba(50, 255, 0, 0.1); color: #32ff00; border: 1px solid rgba(50, 255, 0, 0.3); padding: 1px 6px; border-radius: 10px; margin-left: 10px; letter-spacing: 1px; text-shadow: 0 0 5px rgba(50, 255, 0, 0.5); animation: breathe 2s infinite ease-in-out; }
@keyframes breathe { 0%, 100% { opacity: 0.6; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1); } }
</style>
