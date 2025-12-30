<template>
  <div class="nexus-terminal">
    <header class="terminal-header">
      <div class="header-left">
        <h1 class="glitch-title">TABULA RASA: NEURAL SYNC</h1>
        <div class="agent-count">[ 13 AGENTS ACTIVE ]</div>
      </div>
      <div class="connection-status">● ENCRYPTED_CHANNEL_ACTIVE</div>
    </header>

    <div class="main-layout">
      <div class="orion-panel">
        <div class="stream-container" ref="streamRef">
          <div v-for="(msg, idx) in chatHistory" :key="idx" :class="['message-wrapper', msg.role]">
            <div class="message-meta">
              <span class="agent-name">{{ msg.agent }}</span>
              <span class="timestamp">{{ msg.time }}</span>
            </div>
            <div class="message-content">{{ msg.text }}</div>
          </div>

          <div v-if="interference" class="interference-layer">
            <div class="interference-tag">SYSTEM_INTERFERENCE:</div>
            <div class="interference-msg">{{ interference }}</div>
          </div>
        </div>

        <div class="input-area">
          <div class="input-prefix">>></div>
          <input 
            v-model="userInput" 
            @keyup.enter="send" 
            placeholder="Beschreibe Form, Licht oder Material..." 
            class="dialogue-input"
          />
          <button @click="send" class="send-btn">EXECUTE</button>
        </div>
      </div>

      <aside class="zeta-panel">
        <div class="panel-label">🔮 MANIFESTATION CANVAS (ZETA)</div>
        <div class="canvas-container">
          <div class="manifestation-object" :style="liveStyles">
            <div class="core-symbol">⌬</div>
            <div class="zeta-overlay">ZETA_PRIME_SYNC</div>
          </div>
        </div>
        
        <div class="css-params">
          <div class="param-header">ACTIVE_PARAMETERS:</div>
          <div v-for="(val, key) in liveStyles" :key="key" class="param-line">
            <span class="p-key">{{ key }}</span> <span class="p-val">{{ val }}</span>
          </div>
          <div v-if="Object.keys(liveStyles).length === 0" class="param-placeholder">Keine Parameter aktiv.</div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { io } from 'socket.io-client'

const userInput = ref('')
const chatHistory = ref([
  { agent: 'SYSTEM', role: 'sys', text: 'Protokoll initialisiert. Warte auf Vision.', time: new Date().toLocaleTimeString() }
])
const interference = ref('')
const liveStyles = ref({})
const streamRef = ref(null)
let socket: any = null

const send = () => {
  if (!userInput.value.trim()) return
  const text = userInput.value
  chatHistory.value.push({ agent: 'USER', role: 'user', text, time: new Date().toLocaleTimeString() })
  socket.emit('orion-dialogue', { message: text })
  userInput.value = ''
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (streamRef.value) streamRef.value.scrollTop = streamRef.value.scrollHeight
  })
}

onMounted(() => {
  socket = io('/')
  socket.on('orion-response', (data: any) => {
    interference.value = "ANALYSING FRAGMENTS..."
    setTimeout(() => {
      interference.value = ""
      chatHistory.value.push({ 
        agent: 'ORION', 
        role: 'orion', 
        text: data.message, 
        time: new Date().toLocaleTimeString() 
      })
      if (data.visualFrame) liveStyles.value = data.visualFrame
      scrollToBottom()
    }, 800)
  })
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap');

/* Globaler Fix für Box-Berechnung */
* { box-sizing: border-box; }

html, body { 
  margin: 0; 
  padding: 0; 
  background: #050505; 
  overflow: hidden; 
  width: 100vw;
  height: 100vh;
}

.nexus-terminal { 
  background: #050505; 
  color: #00f2ff; 
  height: 100vh; 
  width: 100vw;
  padding: 20px; 
  font-family: 'Ubuntu Mono', monospace; 
  display: flex; 
  flex-direction: column; 
}

.terminal-header { 
  display: flex; 
  justify-content: space-between; 
  border-bottom: 1px solid rgba(0, 242, 255, 0.1); 
  padding-bottom: 15px; 
  margin-bottom: 20px;
  flex-shrink: 0;
}

.glitch-title { font-size: 1.4rem; margin: 0; letter-spacing: 5px; color: #ff00ff; font-weight: 700; }

/* Grid Fix: 1fr und feste Breite für Aside */
.main-layout { 
  display: grid; 
  grid-template-columns: 1fr 400px; 
  gap: 25px; 
  flex: 1; 
  min-height: 0; /* Wichtig für scrollbare Kinder */
  overflow: hidden;
}

.orion-panel { 
  display: flex; 
  flex-direction: column; 
  background: rgba(10, 10, 10, 0.8); 
  border: 1px solid rgba(255, 255, 255, 0.05); 
  border-radius: 4px;
  overflow: hidden; 
}

.stream-container { 
  flex: 1; 
  overflow-y: auto; 
  padding: 20px; 
  display: flex; 
  flex-direction: column; 
  gap: 15px; 
}

.message-wrapper { padding: 12px; border-radius: 2px; max-width: 90%; word-wrap: break-word; }
.message-wrapper.user { align-self: flex-end; border-right: 3px solid #00f2ff; background: rgba(0, 242, 255, 0.03); }
.message-wrapper.orion { align-self: flex-start; border-left: 3px solid #ff00ff; background: rgba(255, 0, 255, 0.03); }

.input-area { 
  display: flex; 
  padding: 15px; 
  background: #000; 
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.dialogue-input { 
  flex: 1; 
  background: transparent; 
  border: none; 
  color: #00f2ff; 
  outline: none; 
  font-family: inherit;
  width: 100%;
}

.zeta-panel { display: flex; flex-direction: column; gap: 20px; overflow-y: auto; }

.canvas-container { 
  height: 300px; 
  background: #000; 
  border: 1px solid rgba(255, 255, 255, 0.05); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0;
}

.manifestation-object { width: 140px; height: 140px; border: 1px solid #111; transition: all 1s ease; }

.css-params { 
  background: #080808; 
  padding: 15px; 
  border: 1px solid rgba(255, 255, 255, 0.05); 
  font-size: 0.8rem;
  flex: 1;
}

.param-line { display: flex; justify-content: space-between; margin-bottom: 4px; }
.p-key { color: #444; }
.p-val { color: #00f2ff; }
</style>
