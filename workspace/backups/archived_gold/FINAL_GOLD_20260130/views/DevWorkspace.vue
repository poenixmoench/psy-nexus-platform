<template>
  <div class="neural-grid">
    <div v-if="showToast" class="system-toast">{{ toastMsg }}</div>

    <!-- LEFT: AGENTS -->
    <aside class="agents-section">
      <div class="section-header">⚡ NEURAL NODES</div>
      <div class="agents-grid">
        <div v-for="(agent, name) in agents" :key="name"
             class="agent-card" :class="{ active: activeAgent === name }"
             @click="activeAgent = name">
          <div class="card-header">
            <span class="agent-name">{{ name }}</span>
            <div class="signal-wrapper">
              <div class="status-indicator" :class="{ processing: streamingAgent === name }"></div>
              <div v-if="streamingAgent === name" class="pulse-ring"></div>
            </div>
          </div>
          <div class="card-body">{{ agentTheme[name]?.role || 'Sub-System' }}</div>
        </div>
      </div>
    </aside>

    <!-- CENTER: CHAT -->
    <main class="chat-section">
      <div class="neural-map-wrapper">
        <div class="neural-map-header">
          <span class="header-icon">🧠</span>
          <span class="header-title">NEXUS CORE</span>
          <span class="header-status">{{ activeAgent }}</span>
          <button @click="resetConversation" class="btn-reset">♻️ RESET</button>
        </div>

        <svg class="neural-map" viewBox="0 0 300 300">
          <g class="pulsing-rings">
            <circle cx="150" cy="150" r="60" class="ring pulse" />
          </g>
          <circle cx="150" cy="150" r="10" class="core-node" />
          <g v-for="(name, i) in agentNames" :key="i">
            <line x1="150" y1="150" :x2="nodeX(i)" :y2="nodeY(i)"
                  class="workflow-line" :class="{ active: activeAgent === name }" />
            <g :class="['node', { active: activeAgent === name, streaming: streamingAgent === name }]">
              <circle :cx="nodeX(i)" :cy="nodeY(i)" r="8" class="node-circle" />
              <text :x="nodeX(i)" :y="nodeY(i) + 22" class="node-label">{{ name.substring(0, 3) }}</text>
            </g>
          </g>
        </svg>
      </div>

      <div class="messages-area" ref="msgBox">
        <div v-for="(msg, i) in agents[activeAgent]?.history" :key="i" class="message" :class="msg.type">
          <div class="msg-header">
            <span class="msg-agent">{{ msg.agent }}</span>
            <button v-if="msg.type === 'agent'" @click="copy(msg.text)" class="btn-copy">📋 COPY</button>
          </div>
          <div class="msg-text" v-html="marked(msg.text)"></div>
        </div>

        <div v-if="streamingAgent" class="stop-container">
          <button @click="stopGeneration" class="btn-stop">■ STOP GENERATION</button>
        </div>

        <div v-if="streamingAgent === activeAgent" class="message agent streaming">
          <div class="msg-text">{{ streamingText }}<span class="cursor">▌</span></div>
        </div>
      </div>

      <div class="input-zone">
        <textarea v-model="userInput" @keydown.enter.exact.prevent="send"
                  :placeholder="'BEFEHL AN ' + activeAgent + '...'"
                  class="system-input"></textarea>
        <button @click="send" class="btn-execute" :disabled="streamingAgent === activeAgent">SENDEN</button>
      </div>
    </main>

    <!-- RIGHT: PREVIEW WITH IFRAME SANDBOX -->
    <section class="stats-section">
      <div class="section-header">📊 LIVE PREVIEW</div>
      <div class="preview-box">
        <iframe 
          v-if="agentPreviews[aktiverTab]" 
          :key="aktiverTab"
          :srcdoc="agentPreviews[aktiverTab]" 
          class="preview-iframe"
          sandbox="allow-scripts allow-same-origin"
          title="Live Preview"
        ></iframe>
        <div v-else class="preview-empty">Warte auf {{ aktiverTab }}...</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { io } from 'socket.io-client'
import { marked } from 'marked'

const socket = io('/', { path: '/socket.io/', transports: ['websocket'] })
const agents = ref<any>({})
const activeAgent = ref('ORION')
const userInput = ref('')
const msgBox = ref<HTMLElement | null>(null)
const agentPreviews = ref({
  'ORION': '', 'PLAN-AGENT': '', 'FRONTEND-MEISTER': '', 'DESIGN-ALCHEMIST': '',
  'BACKEND-ARCHITEKT': '', 'QA-GURU': '', 'OPTIMIERER': '', 'DOKUMENTATION-AGENT': ''
})
const aktiverTab = ref('FRONTEND-MEISTER')
  let updateTimeout = null
const streamingAgents = ref({})
const streamingTexts = ref({})
const showToast = ref(false)
const toastMsg = ref('')

const agentTheme: any = {
  'ORION': { role: 'Strategische Leitung' },
  'PLAN-AGENT': { role: 'Projekt-Koordination' },
  'FRONTEND-MEISTER': { role: 'UI/UX-Architektur' },
  'DESIGN-ALCHEMIST': { role: 'Visuelle Gestaltung' },
  'BACKEND-ARCHITEKT': { role: 'System-Infrastruktur' },
  'QA-GURU': { role: 'Qualitätssicherung' },
  'OPTIMIERER': { role: 'Performance-Tuning' },
  'DOKUMENTATION-AGENT': { role: 'Technische Dokumentation' }
}

const agentNames = computed(() => Object.keys(agents.value || {}))
const nodeX = (index: number) => 150 + 85 * Math.cos((index / (agentNames.value.length || 1)) * Math.PI * 2 - Math.PI / 2)
const nodeY = (index: number) => 150 + 85 * Math.sin((index / (agentNames.value.length || 1)) * Math.PI * 2 - Math.PI / 2)

const triggerToast = (m: string) => { 
  toastMsg.value = m
  showToast.value = true
  setTimeout(() => showToast.value = false, 2000)
}

const send = () => {
  if (!userInput.value.trim() || streamingAgents.value[activeAgent.value]) return
  const txt = userInput.value
  agents.value[activeAgent.value].history.push({ agent: 'FABIAN', text: txt, type: 'user' })
  streamingAgents.value[activeAgent.value] = true
  streamingTexts.value[activeAgent.value] = ''
  socket.emit('agent-message', { agentName: activeAgent.value, message: txt })
  userInput.value = ''
  nextTick(scrollToBottom)
}

const stopGeneration = () => {
  socket.emit('abort-generation')
  if (streamingText.value) {
    agents.value[streamingAgent.value].history.push({
      agent: streamingAgent.value, 
      text: streamingText.value + "\n\n[HALTED]", 
      type: 'agent'
    })
  }
  streamingAgents.value = {}
  triggerToast("STOPPED")
}

const resetConversation = () => {
  if (confirm("Reset Nexus Context?")) {
    agents.value[activeAgent.value].history = []
    agentPreviews.value[activeAgent.value] = ''
    triggerToast("CONTEXT CLEARED")
  }
}

const copy = (t: string) => { 
  navigator.clipboard.writeText(t)
  triggerToast("COPIED")
}

const scrollToBottom = () => { 
  if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight 
}

const extractCodeBlock = (text: string): string => {
  // Case 1: Code fence with language
  let match = text.match(/```(?:html|svg|xml|jsx|tsx|javascript|typescript|js|ts)\s+([\s\S]*?)```/i)
  if (match && match[1]) {
    const code = match[1].trim()
    if (isValidHTML(code)) return code
  }

  // Case 2: Generic code fence
  match = text.match(/```\s*([\s\S]*?)```/)
  if (match && match[1]) {
    const code = match[1].trim()
    if (code.startsWith('<') && isValidHTML(code)) return code
  }

  // Case 3: Raw HTML without fence
  const htmlStart = Math.max(text.indexOf('<!DOCTYPE'), text.indexOf('<html'), text.indexOf('<HTML'))
  if (htmlStart !== -1) {
    let html = text.substring(htmlStart).trim()
    const bodyEnd = html.lastIndexOf('</body>')
    const htmlEnd = html.lastIndexOf('</html>')
    const endPos = Math.max(bodyEnd, htmlEnd)
    if (endPos !== -1) html = html.substring(0, endPos + 7)
    if (!html.includes('</html>')) html += '\n</html>'
    if (!html.includes('</body>')) html = html.replace('</html>', '</body>\n</html>')
    if (isValidHTML(html)) return html
  }

  return ''
}

const isValidHTML = (code: string): any => {
  try {
    if (!code.includes('<')) return false
    // Remove min-length check - even small HTML like <h1>TEST</h1> is valid
    const parser = new DOMParser()
    const doc = parser.parseFromString(code, 'text/html')
    return doc.body && doc.body.innerHTML.length > 0
  } catch (e) {
    console.warn('[PARSER] Invalid HTML:', e)
    return false
  }
}

onMounted(async () => {
  const res = await fetch('/api/agents')
  const data = await res.json()
  data.forEach((a: any) => agents.value[a.name] = { ...a, history: [] })

  socket.on('agent-chunk', (data) => {
    if (streamingAgents.value[data.agent]) {
      const chunk = data.chunk || '';
      streamingTexts.value[data.agent] = (streamingTexts.value[data.agent] || '') + chunk
      scrollToBottom()
      const code = extractCodeBlock(streamingTexts.value[data.agent])
      if (code && code.length > 10 && code !== agentPreviews.value[data.agent]) {
        clearTimeout(updateTimeout)
        updateTimeout = setTimeout(() => {
          agentPreviews.value[data.agent] = code
        }, 150)
      }
    }
  })

  socket.on('agent-done', (data) => {
    if (data && data.agent && streamingAgents.value[data.agent]) {
      agents.value[data.agent].history.push({
        agent: data.agent, 
        text: streamingTexts.value[data.agent], 
        type: 'agent'
      })
      
      const code = extractCodeBlock(streamingText.value)
      if (code) {
      console.log("🔍 streamingText Länge:", streamingText.value.length);
      console.log("🔍 extractCodeBlock Funktion?", typeof extractCodeBlock);
        agentPreviews.value[data.agent] = code
      console.log("📦 Code extracted?", !!code, code?.length);
      }
    }
    streamingAgents.value[data.agent] = false
    streamingTexts.value[data.agent] = ''
  })
})
</script>

<style scoped>
* {
  font-family: 'Ubuntu Mono', 'Courier New', monospace;
}

.neural-grid { 
  display: grid; 
  grid-template-columns: 280px 1fr 400px; 
  height: 100vh; 
  background: #000; 
  color: #32ff00; 
  overflow: hidden;
}

.system-toast { 
  position: fixed; 
  top: 20px; 
  left: 50%; 
  transform: translateX(-50%); 
  background: #32ff00; 
  color: #000; 
  padding: 10px 30px; 
  font-weight: bold; 
  z-index: 1000;
  border-radius: 4px;
}

.agents-section { 
  border-right: 1px solid rgba(50, 255, 0, 0.2); 
  padding: 20px; 
  background: #050505; 
  overflow-y: auto;
}

.section-header {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #32ff00;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.agents-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agent-card { 
  padding: 12px; 
  border: 1px solid rgba(50, 255, 0, 0.2); 
  cursor: pointer; 
  transition: 0.3s;
  background: #000;
  border-radius: 4px;
}

.agent-card:hover {
  border-color: #32ff00;
  background: rgba(50, 255, 0, 0.05);
}

.agent-card.active { 
  border-color: #32ff00; 
  background: rgba(50, 255, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.agent-name {
  font-size: 12px;
  font-weight: bold;
  color: #32ff00;
}

.signal-wrapper {
  position: relative;
  width: 12px;
  height: 12px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #333;
  border: 1px solid #32ff00;
  transition: 0.3s;
}

.status-indicator.processing {
  background: #32ff00;
  box-shadow: 0 0 8px #32ff00;
}

.pulse-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 20px;
  height: 20px;
  border: 1px solid #32ff00;
  border-radius: 50%;
  animation: pulse 1.5s ease-out infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

.card-body {
  font-size: 11px;
  color: #888;
}

.chat-section { 
  display: flex; 
  flex-direction: column; 
  background: #000;
  overflow: hidden;
}

.neural-map-wrapper {
  border-bottom: 1px solid rgba(50, 255, 0, 0.1);
  background: #050505;
}

.neural-map-header { 
  display: flex; 
  align-items: center; 
  gap: 15px; 
  padding: 15px; 
  border-bottom: 1px solid rgba(50, 255, 0, 0.1);
  font-size: 12px;
}

.header-icon {
  font-size: 18px;
}

.header-title {
  font-weight: bold;
  color: #32ff00;
  text-transform: uppercase;
  letter-spacing: 2px;
  flex: 1;
}

.header-status {
  background: rgba(50, 255, 0, 0.1);
  padding: 4px 8px;
  border-radius: 3px;
  color: #32ff00;
  font-size: 11px;
}

.btn-reset { 
  background: transparent; 
  border: 1px solid #ff3300; 
  color: #ff3300; 
  padding: 4px 10px; 
  cursor: pointer; 
  font-size: 11px;
  border-radius: 3px;
  font-family: 'Ubuntu Mono', monospace;
  transition: 0.3s;
}

.btn-reset:hover {
  background: rgba(255, 51, 0, 0.1);
}

.neural-map { 
  height: 180px; 
  width: 100%;
  display: block;
}

.core-node { 
  fill: #32ff00; 
}

.ring {
  fill: none;
  stroke: rgba(50, 255, 0, 0.1);
  stroke-width: 1;
}

.ring.pulse {
  animation: ring-pulse 2s ease-out infinite;
}

@keyframes ring-pulse {
  0% { stroke-width: 1; opacity: 1; }
  100% { stroke-width: 3; opacity: 0; }
}

.workflow-line { 
  stroke: rgba(50, 255, 0, 0.2); 
  stroke-dasharray: 5;
  stroke-width: 1;
}

.workflow-line.active { 
  stroke: #32ff00; 
  stroke-dasharray: 0; 
  opacity: 1;
}

.node-circle { 
  fill: #000; 
  stroke: #32ff00;
  stroke-width: 1;
}

.node.active .node-circle { 
  fill: #32ff00; 
}

.node.streaming .node-circle {
  animation: node-pulse 1s ease-in-out infinite;
}

@keyframes node-pulse {
  0%, 100% { fill: #000; }
  50% { fill: #32ff00; }
}

.node-label { 
  font-size: 9px; 
  fill: #32ff00; 
  text-anchor: middle;
  font-family: 'Ubuntu Mono', monospace;
}

.messages-area { 
  flex: 1; 
  overflow-y: auto; 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  gap: 12px;
}

.message { 
  padding: 12px; 
  border-radius: 4px; 
  max-width: 90%;
  word-wrap: break-word;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 11px;
}

.msg-agent {
  font-weight: bold;
  color: #32ff00;
  text-transform: uppercase;
}

.btn-copy {
  background: transparent;
  border: 1px solid #0096ff;
  color: #0096ff;
  padding: 2px 6px;
  cursor: pointer;
  font-size: 10px;
  border-radius: 2px;
  font-family: 'Ubuntu Mono', monospace;
  transition: 0.3s;
}

.btn-copy:hover {
  background: rgba(0, 150, 255, 0.1);
}

.message.user { 
  align-self: flex-end; 
  background: rgba(0, 150, 255, 0.1); 
  border-right: 3px solid #0096ff;
  color: #0096ff;
}

.message.agent { 
  align-self: flex-start; 
  background: rgba(50, 255, 0, 0.05); 
  border-left: 3px solid #32ff00;
  color: #32ff00;
}

.message.streaming {
  animation: stream-pulse 1.5s ease-in-out infinite;
}

@keyframes stream-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.msg-text { 
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.stop-container { 
  display: flex; 
  justify-content: center;
  padding: 10px 0;
}

.btn-stop { 
  background: #000; 
  border: 2px solid #ff3300; 
  color: #ff3300; 
  padding: 8px 16px; 
  font-weight: bold; 
  cursor: pointer; 
  animation: blink 1s infinite;
  border-radius: 4px;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
}

.btn-stop:hover {
  background: rgba(255, 51, 0, 0.1);
}

.input-zone { 
  padding: 15px; 
  display: flex; 
  gap: 10px; 
  border-top: 1px solid rgba(50, 255, 0, 0.1);
  background: #050505;
}

.system-input { 
  flex: 1; 
  height: 60px; 
  background: #000; 
  border: 1px solid rgba(50, 255, 0, 0.2); 
  color: #32ff00; 
  padding: 10px; 
  resize: none;
  border-radius: 4px;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 12px;
  transition: 0.3s;
}

.system-input:focus {
  outline: none;
  border-color: #32ff00;
  box-shadow: 0 0 10px rgba(50, 255, 0, 0.3);
}

.system-input::placeholder {
  color: #555;
}

.btn-execute { 
  background: #32ff00; 
  color: #000; 
  border: none; 
  padding: 10px 20px; 
  font-weight: bold; 
  cursor: pointer;
  border-radius: 4px;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  transition: 0.3s;
}

.btn-execute:hover:not(:disabled) {
  background: #45ff00;
  box-shadow: 0 0 10px rgba(50, 255, 0, 0.5);
}

.btn-execute:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats-section {
  border-left: 1px solid rgba(50, 255, 0, 0.2);
  padding: 15px;
  background: #050505;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-box { 
  flex: 1;
  background: #fff; 
  padding: 0;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

.preview-empty {
  color: #999;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  font-family: 'Ubuntu Mono', monospace;
  padding: 10px;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #000;
}

::-webkit-scrollbar-thumb {
  background: rgba(50, 255, 0, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(50, 255, 0, 0.6);
}

:deep(.markdown-body) {
  background: transparent;
  color: inherit;
}

:deep(.markdown-body code) {
  background: rgba(50, 255, 0, 0.1);
  color: #32ff00;
  padding: 2px 4px;
  border-radius: 2px;
}

:deep(.markdown-body pre) {
  background: #1a1a1a;
  border: 1px solid rgba(50, 255, 0, 0.2);
  overflow-x: auto;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3) {
  color: #32ff00;
  border: none;
}
</style>
