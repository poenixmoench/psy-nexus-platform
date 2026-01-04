<template>
  <div class="neural-grid">
    <aside class="agents-section">
      <div class="section-header">NEURAL NODES</div>
      <div class="agents-grid">
        <div v-for="(agent, name) in agents" :key="name" class="agent-card" :class="{ active: activeAgent === name }" @click="activeAgent = name">
          <div class="card-header"><span>{{ name }}</span><div class="signal-wrapper"><div class="status-indicator" :class="agent.status"></div><div v-if="agent.status === 'processing'" class="pulse-ring"></div></div></div>
          <div class="card-body">{{ agent.role }}</div>
        </div>
      </div>
    </aside>

    <main class="chat-section">
      <div class="neural-map-container">
        <svg class="neural-map" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
          <g class="pulsing-rings">
            <circle cx="150" cy="150" r="60" class="ring pulse" />
            <circle cx="150" cy="150" r="60" class="ring pulse" style="animation-delay: 0.3s" />
            <circle cx="150" cy="150" r="60" class="ring pulse" style="animation-delay: 0.6s" />
          </g>
          <circle cx="150" cy="150" r="40" class="ring-static" />
          <circle cx="150" cy="150" r="80" class="ring-static" />
          <circle cx="150" cy="150" r="100" class="ring-static" />
          <circle cx="150" cy="150" r="10" class="core-node" />
          <circle cx="150" cy="150" r="10" class="core-pulse" />
          <g class="agent-nodes">
            <g v-for="(name, i) in agentNames" :key="'node-' + i" :class="['node', { active: activeAgent === name, [agents[name]?.status]: true }]" @click.stop="activeAgent = name">
              <line x1="150" y1="150" :x2="nodeX(i)" :y2="nodeY(i)" class="connection-line" />
              <circle v-if="activeAgent === name" :cx="nodeX(i)" :cy="nodeY(i)" r="25" class="node-halo" />
              <circle :cx="nodeX(i)" :cy="nodeY(i)" r="15" class="node-pulse-ring" />
              <circle :cx="nodeX(i)" :cy="nodeY(i)" r="8" class="node-circle" />
              <text :x="nodeX(i)" :y="nodeY(i) + 22" class="node-label">{{ name.substring(0, 3).toUpperCase() }}</text>
            </g>
          </g>
          <g class="thread-connections">
            <line v-for="i in 7" :key="'thread-' + i" :x1="nodeX(i - 1)" :y1="nodeY(i - 1)" :x2="nodeX(i % 7)" :y2="nodeY(i % 7)" class="thread-line" />
          </g>
        </svg>
      </div>

      <div class="messages-area" ref="msgBox">
        <div v-for="(msg, i) in agents[activeAgent]?.history" :key="i" class="message" :class="msg.type">
          <div class="msg-header">
            <span class="msg-agent">{{ msg.agent || 'NUTZER' }}</span>
            <div v-if="msg.agent && msg.agent !== 'NUTZER'" class="msg-actions">
              <button @click="copyMessage(msg.text)" class="btn-copy" title="Text kopieren">📋 KOPIEREN</button>
              <button @click="deleteMessage(i)" class="btn-delete" title="Nachricht löschen">🗑️ LÖSCHEN</button>
            </div>
          </div>
          <div class="msg-text">{{ msg.text }}</div>
        </div> 
        <div v-if="streamingAgent === activeAgent" class="message agent streaming">
          <div class="msg-header">
            <span class="msg-agent">{{ streamingAgent }}</span>
            <div class="msg-actions">
              <button @click="copyMessage(streamingText)" class="btn-copy" title="Text kopieren">📋 KOPIEREN</button>
              <button @click="deleteStreamingMessage()" class="btn-delete" title="Nachricht löschen">🗑️ LÖSCHEN</button>
            </div>
          </div>
          <div class="msg-text"><span v-if="!streamingText">...</span><span v-else>{{ streamingText }}</span><span class="cursor">▌</span></div>
        </div>
      </div>

      <div class="input-zone">
        <input v-model="userInput" @keyup.enter="send" :placeholder="'SYSTEM_INPUT > ' + activeAgent + '...'" class="system-input" />
        <button @click="send" class="btn-execute">SENDEN</button>
      </div>
    </main>

    <section class="stats-section">
      <div class="section-header">LIVE PREVIEW</div>
      <div class="preview-box">
        <div v-if="livePreview" v-html="livePreview" class="preview-content"></div>
        <div v-else class="preview-empty"><span class="text-muted">Keine Vorschau verfügbar</span></div>
      </div>
    </section>   </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { io } from 'socket.io-client'

// ✅ FIXED: Socket URL für Production
const socket = io('/api', { 
  path: '/socket.io/', 
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
})

const agents = ref<any>({})
const activeAgent = ref('ORION')
const userInput = ref('')
const msgBox = ref<HTMLElement | null>(null)
const livePreview = ref('')
const streamingAgent = ref('')
const streamingText = ref('')
const targetText = ref('')

let typewriterInterval: ReturnType<typeof setInterval> | null = null

const agentNames = computed(() => Object.keys(agents.value || {}))

const nodeX = (index: number): number => {
  const angle = (index / 7) * Math.PI * 2 - Math.PI / 2
  return 150 + 80 * Math.cos(angle)
} 
const nodeY = (index: number): number => {
  const angle = (index / 7) * Math.PI * 2 - Math.PI / 2
  return 150 + 80 * Math.sin(angle)
}

const copyMessage = (text: string) => {
  navigator.clipboard.writeText(text)
  console.log('✅ Text kopiert!')
}

const deleteMessage = (idx: number) => {
  agents.value[activeAgent.value].history.splice(idx, 1)
}

const deleteStreamingMessage = () => {
  streamingAgent.value = ''
  streamingText.value = ''
  targetText.value = ''
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'c') {
    const messages = agents.value[activeAgent.value]?.history || []
    const lastAgentMsg = [...messages].reverse().find((m: any) => m.agent && m.agent !== 'NUTZER')
    if (lastAgentMsg?.text) {       e.preventDefault()
      navigator.clipboard.writeText(lastAgentMsg.text)
      console.log('✅ Letzte Nachricht kopiert (Ctrl+C)!')
    }
  }
}

const send = () => {
  if (!userInput.value.trim()) return
  socket.emit('agent-message', { agentName: activeAgent.value, message: userInput.value })
  userInput.value = ''
}

watch(streamingText, () => {
  nextTick(() => {
    if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
  })
})

onMounted(async () => {
  // Make variables global for console debugging
  window.socket = socket
  window.activeAgent = activeAgent
  window.agents = agents
  window.userInput = userInput
  window.send = send
  console.log('🔌 Socket gemacht global:', socket)
  console.log('🔄 DevWorkspace mounted - loading agents...')

  // 1️⃣ Lade Agenten SOFORT via REST API (FALLBACK)
  try {
    const response = await fetch('/api/agents')
    const data = await response.json()
    console.log('✅ Agenten geladen via REST:', Object.keys(data.agents || {}))
    agents.value = data.agents || {}
  } catch (err) {
    console.error('❌ REST Fehler:', err)
  }

  // 2️⃣ WebSocket Listener für Live Updates
  socket.on('init-agents', (data) => {
    console.log('✅ Agenten via WebSocket:', Object.keys(data.agents || {}))
    agents.value = data.agents || {}
  })

  socket.on('connect', () => {
    console.log('🔌 WebSocket verbunden!')
  })

  socket.on('disconnect', () => {
    console.log('🔌 WebSocket getrennt!')
  })

  socket.on('agent-partial', (data) => {
    if (data.agent === activeAgent.value) {
      streamingAgent.value = data.agent
      targetText.value = data.partial
      // ✨ HTML-Preview: Wenn Agent Code schreibt, zeige es rechts
      if (data.partial.includes("<") && (data.partial.includes(">") || data.partial.includes("{"))) {
        livePreview.value = data.partial
      }

      if (!typewriterInterval) {
        typewriterInterval = setInterval(() => {
          if (streamingText.value.length < targetText.value.length) {
            streamingText.value += targetText.value.charAt(streamingText.value.length)
          }
        }, 20)
      }
    }
  })

  socket.on('state-update', (data) => {
    agents.value = data.agents || {}

    if (data.lastUpdate === streamingAgent.value) {
      if (typewriterInterval) {
        clearInterval(typewriterInterval)
        typewriterInterval = null
      }

      if (agents.value[streamingAgent.value]) {
        agents.value[streamingAgent.value].history = agents.value[streamingAgent.value].history || []
        agents.value[streamingAgent.value].history.push({
          agent: streamingAgent.value,
          text: streamingText.value,
          type: 'agent'
        })
      }

      streamingAgent.value = ''
      streamingText.value = ''
      targetText.value = ''
    }
  })

  window.addEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
* { font-family: 'Ubuntu Mono', 'Courier New', monospace; }
.neural-grid { display: grid; grid-template-columns: 280px 1fr 350px; height: 100vh; width: 100vw; background: #000; color: #00ff9d; gap: 1px; overflow: hidden; }
.agents-section { background: #0a0a0a; border-right: 1px solid #1a1a1a; display: flex; flex-direction: column; overflow: hidden; }
.section-header { background: #000; padding: 12px; border-bottom: 1px solid #1a1a1a; font-size: 0.75em; letter-spacing: 2px; color: #444; text-transform: uppercase; font-weight: bold; }
.agents-grid { padding: 10px; overflow-y: auto; flex: 1; }
.agents-grid::-webkit-scrollbar { width: 6px; }
.agents-grid::-webkit-scrollbar-track { background: #0a0a0a; }
.agents-grid::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
.agent-card { background: #080808; border: 1px solid #111; padding: 12px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s ease; border-radius: 2px; }
.agent-card:hover { border-color: #333; background: #0c0c0c; }
.agent-card.active { border-color: #00ff9d; background: #0c0c0c; box-shadow: inset 0 0 10px rgba(0, 255, 157, 0.05); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: #00ff9d; }
.signal-wrapper { position: relative; width: 12px; height: 12px; }
.status-indicator { width: 8px; height: 8px; border-radius: 50%; background: #444; margin: 2px; }
.status-indicator.idle { background: #444; }
.status-indicator.processing { background: #ffaa00; }
.status-indicator.completed { background: #00ff9d; }
.pulse-ring { position: absolute; width: 12px; height: 12px; border: 1px solid #ffaa00; border-radius: 50%; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { width: 12px; height: 12px; opacity: 1; } 100% { width: 20px; height: 20px; opacity: 0; } }
.card-body { font-size: 0.75em; color: #888; line-height: 1.4; }
.chat-section { display: flex; flex-direction: column; background: #050505; border-right: 1px solid #1a1a1a; overflow: hidden; }
.neural-map-container { height: 250px; background: radial-gradient(circle at center, #0a0a0a 0%, #000 100%); border-bottom: 1px solid #1a1a1a; display: flex; align-items: center; justify-content: center; }
.neural-map { width: 100%; height: 100%; max-width: 300px; max-height: 300px; }
.pulsing-rings .ring { fill: none; stroke: #00ff9d; opacity: 0.3; stroke-width: 1; }
.pulsing-rings .ring.pulse { animation: ring-pulse 3s infinite ease-out; }
@keyframes ring-pulse { 0% { r: 50; opacity: 0.4; } 100% { r: 120; opacity: 0; } }
.ring-static { fill: none; stroke: #00ff9d; opacity: 0.1; stroke-width: 0.5; }
.core-node { fill: #00ff9d; filter: drop-shadow(0 0 6px #00ff9d); }
.core-pulse { fill: none; stroke: #00ff9d; opacity: 0.3; animation: core-pulse 2s infinite; }
@keyframes core-pulse { 0% { r: 10; opacity: 0.5; } 50% { r: 15; opacity: 0.2; } 100% { r: 10; opacity: 0.5; } }
.connection-line { stroke: #00ff9d; stroke-width: 0.5; opacity: 0.2; }
.thread-line { stroke: #009dff; stroke-width: 0.5; opacity: 0.15; animation: flow 4s infinite linear; }
@keyframes flow { 0% { stroke-dashoffset: 10; } 100% { stroke-dashoffset: 0; } }
.node-circle { fill: #00ff9d; transition: all 0.2s; opacity: 0.7; }
.node.active .node-circle { r: 10; fill: #00ff41; filter: drop-shadow(0 0 8px #00ff41); }
.node-pulse-ring { fill: none; stroke: #00ff9d; opacity: 0.3; animation: node-pulse 2s infinite; }
@keyframes node-pulse { 0% { r: 15; opacity: 0.5; } 100% { r: 25; opacity: 0; } }
.node-halo { fill: none; stroke: #00ff9d; opacity: 0.4; stroke-width: 1; filter: drop-shadow(0 0 4px #00ff9d); }
.node-label { fill: #00ff9d; font-size: 9px; text-anchor: middle; font-weight: bold; opacity: 0.8; }
.messages-area { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #050505; }
.messages-area::-webkit-scrollbar { width: 6px; }
.messages-area::-webkit-scrollbar-track { background: #0a0a0a; }
.messages-area::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
.message { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-left: 2px solid; border-radius: 2px; max-width: 100%; word-wrap: break-word; }
.message.user { align-self: flex-end; border-left-color: #009dff; background: rgba(0, 157, 255, 0.05); color: #009dff; }
.message.agent { align-self: flex-start; border-left-color: #00ff9d; background: rgba(0, 255, 157, 0.05); color: #00ff9d; }
.message.streaming { font-style: italic; }
.msg-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; }
.msg-agent { font-size: 0.75em; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; }
.msg-text { font-size: 0.9em; line-height: 1.5; word-wrap: break-word; }
.cursor { animation: cursor-blink 1s infinite; }
@keyframes cursor-blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
.msg-actions { display: flex; gap: 6px; flex-shrink: 0; margin-left: auto; }
.btn-copy, .btn-delete { padding: 4px 8px; background: #00ff9d; color: #000; border: none; cursor: pointer; font-size: 0.6rem; border-radius: 2px; font-weight: bold; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
.btn-delete { background: #ff4444; color: #fff; }
.btn-copy:hover, .btn-delete:hover { opacity: 0.8; box-shadow: 0 0 6px currentColor; }
.btn-copy:active, .btn-delete:active { transform: scale(0.95); }
.input-zone { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #1a1a1a; background: #0a0a0a; }
.system-input { flex: 1; background: #080808; border: 1px solid #1a1a1a; color: #00ff9d; padding: 10px; font-family: 'Ubuntu Mono', monospace; font-size: 0.85em; }
.system-input:focus { outline: none; border-color: #00ff9d; box-shadow: inset 0 0 8px rgba(0, 255, 157, 0.1); }
.system-input::placeholder { color: #444; opacity: 0.7; }
.btn-execute { padding: 10px 16px; background: #00ff9d; color: #000; border: none; border-radius: 2px; cursor: pointer; font-weight: bold; transition: all 0.2s; white-space: nowrap; }
.btn-execute:hover { background: #00ff41; box-shadow: 0 0 12px rgba(0, 255, 157, 0.4); }
.btn-execute:active { transform: scale(0.98); }
.stats-section { background: #0a0a0a; border-left: 1px solid #1a1a1a; display: flex; flex-direction: column; overflow: hidden; }
.preview-box { flex: 1; overflow-y: auto; padding: 12px; background: #050505; }
.preview-box::-webkit-scrollbar { width: 6px; }
.preview-box::-webkit-scrollbar-track { background: #0a0a0a; }
.preview-box::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
.preview-content { font-size: 0.9em; line-height: 1.6; color: #000; background: #fff; padding: 16px; word-wrap: break-word; overflow: auto; }
.preview-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: #444; font-style: italic; }
.text-muted { opacity: 0.5; }
</style>
