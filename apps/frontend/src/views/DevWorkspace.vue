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
const socket = io(location.origin, { 
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
  console.log('🔄 DevWorkspace mounted - loading agents...')

  // 1️⃣ Lade Agenten SOFORT via REST API (FALLBACK)
  try {
    const response = await fetch('https://api.psy-nexus.live/agents')
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
