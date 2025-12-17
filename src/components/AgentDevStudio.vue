<template>
  <main class="agent-studio">
    <section class="agent-studio__chat-section">
      <div class="agent-studio__message-log">
        <p v-for="(message, index) in messageLog" :key="index" class="agent-studio__message">{{ message }}</p>
        <p v-if="isLoading" class="agent-studio__message agent-studio__message--loading">[{{ selectedAgent.toUpperCase() }}]: PROCESSING...</p>
      </div>
      <div class="agent-studio__input-bar" @mouseover="isInputBarHovered = true" @mouseleave="isInputBarHovered = false">
        <select v-model="selectedAgent" class="agent-studio__agent-select" aria-label="Ziel Agent auswählen" :disabled="isLoading">
          <option v-for="agent in agents" :key="agent" :value="agent">{{ agent.toUpperCase() }}</option>
        </select>
        <input type="text" v-model="newMessage" placeholder="PROMPT AN AGENTEN SENDEN..." aria-label="Nachricht eingeben" @keyup.enter="sendMessage" :disabled="isLoading">
        <button class="agent-studio__send-button" @click="sendMessage" aria-label="Senden" :disabled="isLoading">[SENDEN]</button>
      </div>
    </section>
    <aside class="agent-studio__preview-section">
      <iframe ref="previewIframe" sandbox="allow-scripts allow-same-origin" :srcdoc="generatedCode" aria-label="Live Preview des generierten Codes"></iframe>
    </aside>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const agents = ['orchestrator', 'planner', 'coder', 'tester', 'architect', 'documenter', 'optimizer'] as const
type Agent = typeof agents[number]

const messageLog = ref<string[]>([])
const newMessage = ref('')
const selectedAgent = ref<Agent>('orchestrator')
const generatedCode = ref('<html><body style="background-color: #0A0A0F; color: #32CD32; padding: 20px; font-family: \'Ubuntu Mono\', monospace;"><h1>[PREVIEW] WARTEN AUF CODE-AGENT...</h1></body></html>')
const isInputBarHovered = ref(false)
const isLoading = ref(false)
const previewIframe = ref<HTMLIFrameElement | null>(null)

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'
const DEV_API_KEY = import.meta.env.VITE_DEV_API_KEY || 'dev-key-default'

const sendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value) return

  try {
    isLoading.value = true
    const userMessage = newMessage.value
    messageLog.value.push(`[USER]: ${userMessage}`)
    newMessage.value = ''

    const response = await fetch(`${API_BASE}/agents/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Dev-Key': DEV_API_KEY,
      },
      body: JSON.stringify({
        agent: selectedAgent.value,
        prompt: userMessage,
        context: messageLog.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const data = await response.json()
    messageLog.value.push(`[${selectedAgent.value.toUpperCase()}]: ${data.response}`)

    if (data.code) {
      generatedCode.value = data.code
    }

  } catch (error) {
    console.error('Error sending message:', error)
    messageLog.value.push(`[ERROR]: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@keyframes pulse-glow {
    0% { box-shadow: 0 0 10px var(--color-neon-lime), 0 0 0 0 rgba(50, 205, 50, 0.6); }
    50% { box-shadow: 0 0 25px var(--color-neon-lime), 0 0 10px rgba(50, 205, 50, 0.9); }
    100% { box-shadow: 0 0 10px var(--color-neon-lime), 0 0 0 0 rgba(50, 205, 50, 0.6); }
}

@keyframes pulse-loading { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

@media (prefers-reduced-motion) {
    .agent-studio__input-bar { transform: none !important; animation: none !important; }
}

:root {
  --color-void: #0A0A0F;
  --color-neon-lime: #32CD32;
  --color-neon-cyan: #00FFFF;
  --color-neon-magenta: #FF00FF;
  --color-text-dimmed: rgba(255, 255, 255, 0.6);
  --color-background-card: rgba(45, 45, 70, 0.15);
}

.agent-studio { display: flex; height: 100vh; font-family: 'Ubuntu Mono', monospace; color: var(--color-neon-lime); text-transform: uppercase; font-weight: bold; background-color: var(--color-void); }

.agent-studio__chat-section, .agent-studio__preview-section { flex: 1; padding: 24px; border-radius: 16px; backdrop-filter: blur(8px); position: relative; margin: 10px; box-shadow: 0 0 12px var(--color-neon-lime); background: radial-gradient(circle at top left, var(--color-background-card), rgba(45, 45, 70, 0.25)); border: 2px double var(--color-neon-lime); transition: box-shadow 0.3s ease-in-out; }

.agent-studio__chat-section { display: flex; flex-direction: column; gap: 16px; }

.agent-studio__message-log { overflow-y: auto; min-height: 0; padding-right: 8px; }

.agent-studio__message { margin: 0 0 8px 0; color: var(--color-neon-lime); font-size: 12px; line-height: 1.4; word-break: break-word; }

.agent-studio__message--loading { animation: pulse-loading 1.5s infinite; color: var(--color-neon-cyan); }

.agent-studio__input-bar { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 12px; border: 2px dashed var(--color-neon-lime); box-shadow: 0 0 10px var(--color-neon-lime); animation: pulse-glow 3s infinite ease-in-out; transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out; }

.agent-studio__input-bar:hover { transform: scale(1.01); box-shadow: 0 0 20px var(--color-neon-magenta), inset 0 0 10px var(--color-neon-magenta); }

.agent-studio__agent-select, .agent-studio__input-bar input { background: rgba(0, 0, 0, 0.4); border: 1px solid var(--color-neon-cyan); color: var(--color-neon-lime); padding: 8px 12px; border-radius: 8px; text-transform: uppercase; font-weight: bold; outline: none; font-family: 'Ubuntu Mono', monospace; font-size: 11px; }

.agent-studio__input-bar input { flex: 1; }

.agent-studio__input-bar input::placeholder { color: rgba(50, 205, 50, 0.5); text-transform: uppercase; font-weight: bold; }

.agent-studio__agent-select option { background-color: var(--color-void); color: var(--color-neon-lime); text-transform: uppercase; }

.agent-studio__input-bar input:focus, .agent-studio__agent-select:focus { outline: 2px solid var(--color-neon-cyan); outline-offset: 2px; box-shadow: 0 0 8px var(--color-neon-cyan); }

.agent-studio__input-bar input:disabled, .agent-studio__agent-select:disabled { opacity: 0.6; cursor: not-allowed; }

.agent-studio__send-button { padding: 10px 20px; background: var(--color-neon-lime); color: var(--color-void); border: none; cursor: pointer; border-radius: 12px; font-weight: bold; text-transform: uppercase; font-family: 'Ubuntu Mono', monospace; font-size: 11px; box-shadow: 0 0 10px var(--color-neon-lime); transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out; white-space: nowrap; }

.agent-studio__send-button:hover:not(:disabled) { background: var(--color-neon-magenta); box-shadow: 0 0 20px var(--color-neon-magenta); }

.agent-studio__send-button:disabled { opacity: 0.6; cursor: not-allowed; }

.agent-studio__preview-section { display: flex; justify-content: center; align-items: center; }

.agent-studio__preview-section iframe { width: 100%; height: 100%; border: none; background: transparent; }

.agent-studio__preview-section::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.03; background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(50, 205, 50, 0.01) 2px, rgba(50, 205, 50, 0.01) 4px); background-size: cover; pointer-events: none; border-radius: 16px; z-index: -1; }

@media (max-width: 768px) { .agent-studio { flex-direction: column; height: auto; } .agent-studio__chat-section, .agent-studio__preview-section { flex: auto; min-height: 45vh; margin: 10px 10px 0 10px; } .agent-studio__preview-section { margin-bottom: 10px; } .agent-studio__input-bar { flex-wrap: wrap; } .agent-studio__agent-select { flex-basis: 100%; } }
</style>
