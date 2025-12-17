<template>
  <div class="agent-studio">
    <!-- LEFT: Chat Section -->
    <section class="chat-section">
      <div class="chat-header">
        <h1 class="chat-title">AGENT DEV STUDIO</h1>
        <div class="status-indicator" :class="`status-${orionStatus}`">
          [{{ orionStatus.toUpperCase() }}]
        </div>
      </div>

      <div class="message-log">
        <div v-for="(msg, idx) in messages" :key="idx" class="message" :class="`msg-${msg.type}`">
          <span class="msg-sender">[{{ msg.sender.toUpperCase() }}]:</span>
          <span class="msg-content">{{ msg.content }}</span>
        </div>
      </div>

      <div class="controls">
        <select v-model="selectedAgent" class="agent-select" aria-label="Agent auswählen">
          <option value="">-- Agent --</option>
          <option value="orion">ORION</option>
          <option value="nexus-prime">NEXUS-PRIME</option>
          <option value="aura">AURA</option>
          <option value="syntax">SYNTAX</option>
          <option value="validus">VALIDUS</option>
          <option value="mirror">MIRROR</option>
          <option value="infra">INFRA</option>
        </select>

        <input 
          v-model="inputMessage" 
          type="text" 
          class="message-input" 
          placeholder="Nachricht eingeben..."
          @keyup.enter="sendMessage"
          aria-label="Nachricht eingeben"
        >

        <button @click="sendMessage" class="btn btn-send" aria-label="Senden">
          [SENDEN]
        </button>
        <button @click="copyLastCode" class="btn btn-copy" aria-label="Kopieren">
          [KOPIEREN]
        </button>
        <button @click="clearMessages" class="btn btn-delete" aria-label="Löschen">
          [LÖSCHEN]
        </button>
        <button @click="showHelp" class="btn btn-help" aria-label="Hilfe">
          [HILFE]
        </button>
      </div>
    </section>

    <!-- RIGHT: Preview Section -->
    <section class="preview-section">
      <div class="preview-header">
        <h2>LIVE PREVIEW</h2>
        <span class="preview-status">[{{ previewStatus }}]</span>
      </div>
      <iframe 
        ref="previewIframe"
        class="preview-iframe"
        sandbox="allow-scripts allow-same-origin"
        :srcdoc="generatedCode"
        aria-label="Live Preview"
      ></iframe>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const agents = ['orion', 'nexus-prime', 'aura', 'syntax', 'validus', 'mirror', 'infra'];
const messages = ref<any[]>([]);
const inputMessage = ref('');
const selectedAgent = ref('orion');
const orionStatus = ref('idle');
const previewStatus = ref('ready');
const generatedCode = ref(`
  <html>
    <head>
      <style>
        body { background: #000; color: #32CD32; font-family: 'Ubuntu Mono'; padding: 20px; }
        h1 { margin: 0; }
      </style>
    </head>
    <body>
      <h1>[PREVIEW BEREIT]</h1>
      <p>Sende eine Aufgabe an einen Agenten...</p>
    </body>
  </html>
`);

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;

  messages.value.push({
    sender: 'you',
    type: 'user',
    content: inputMessage.value
  });

  const msg = inputMessage.value;
  inputMessage.value = '';

  // ORION beauftragt andere Agenten
  messages.value.push({
    sender: 'orion',
    type: 'system',
    content: `Beauftragte ${selectedAgent.value.toUpperCase()}...`
  });

  orionStatus.value = 'busy';
  previewStatus.value = 'processing';

  try {
    // Backend-Call würde hier stattfinden
    // const response = await fetch('/api/agents/task', { ... })
    
    // Für jetzt: Simulated Response
    setTimeout(() => {
      messages.value.push({
        sender: selectedAgent.value,
        type: 'response',
        content: `Aufgabe erledigt: ${msg}`
      });

      generatedCode.value = `
        <html>
          <head>
            <style>
              body { background: #000; color: #32CD32; font-family: 'Ubuntu Mono'; padding: 20px; }
              .success { color: #32CD32; }
              .code { background: rgba(50,205,50,0.1); padding: 10px; margin: 10px 0; border-left: 2px solid #32CD32; }
            </style>
          </head>
          <body>
            <h2 class="success">[OK] AUFGABE ABGESCHLOSSEN</h2>
            <p>Agent: ${selectedAgent.value.toUpperCase()}</p>
            <div class="code"><pre>${msg}</pre></div>
          </body>
        </html>
      `;

      orionStatus.value = 'idle';
      previewStatus.value = 'ready';

      messages.value.push({
        sender: 'orion',
        type: 'system',
        content: 'Ergebnis angezeigt. Was sollen wir als nächstes tun?'
      });
    }, 1000);
  } catch (error) {
    orionStatus.value = 'error';
    previewStatus.value = 'error';
    messages.value.push({
      sender: 'orion',
      type: 'error',
      content: `Fehler: ${error.message}`
    });
  }
};

const copyLastCode = () => {
  const textToCopy = generatedCode.value;
  navigator.clipboard.writeText(textToCopy);
  messages.value.push({
    sender: 'system',
    type: 'info',
    content: '[COPY] Code in Zwischenablage kopiert'
  });
};

const clearMessages = () => {
  messages.value = [];
  messages.value.push({
    sender: 'orion',
    type: 'system',
    content: 'Chat geleert. Bereit für neue Aufgaben.'
  });
};

const showHelp = () => {
  messages.value.push({
    sender: 'orion',
    type: 'info',
    content: `HILFE: Wähle einen Agenten, gib eine Aufgabe ein und klick [SENDEN]. ORION wird den Agenten beauftragen.`
  });
};
</script>

<style scoped>
:root {
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-lime: #32CD32;
  --color-orange: #FFA500;
}

* {
  box-sizing: border-box;
}

.agent-studio {
  display: flex;
  height: 100vh;
  background: var(--color-black);
  color: var(--color-white);
  font-family: 'Ubuntu Mono', monospace;
  gap: 2px;
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-right: 2px solid var(--color-lime);
  background: linear-gradient(135deg, rgba(50,205,50,0.05) 0%, rgba(0,0,0,0.95) 100%);
  position: relative;
  overflow: hidden;
}

.chat-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(50,205,50,0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255,165,0,0.02) 0%, transparent 50%);
  pointer-events: none;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.chat-title {
  font-size: 24px;
  margin: 0;
  color: var(--color-lime);
  text-shadow: 0 0 10px var(--color-lime);
}

.status-indicator {
  padding: 4px 12px;
  border: 1px solid var(--color-lime);
  font-size: 12px;
  color: var(--color-lime);
  text-transform: uppercase;
}

.status-ok { color: var(--color-lime); border-color: var(--color-lime); }
.status-busy { color: var(--color-orange); border-color: var(--color-orange); }
.status-error { color: #FF4444; border-color: #FF4444; }

.message-log {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.message {
  margin-bottom: 8px;
  padding: 8px;
  border-left: 2px solid var(--color-lime);
  font-size: 12px;
  line-height: 1.4;
}

.msg-sender {
  color: var(--color-lime);
  font-weight: bold;
}

.msg-user { border-left-color: #4488FF; }
.msg-system { border-left-color: var(--color-orange); color: var(--color-orange); }
.msg-response { border-left-color: var(--color-lime); }
.msg-error { border-left-color: #FF4444; color: #FF4444; }
.msg-info { border-left-color: #00FFFF; color: #00FFFF; }

.controls {
  display: flex;
  gap: 8px;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
}

.agent-select,
.message-input {
  padding: 8px 12px;
  background: rgba(0,0,0,0.6);
  border: 1px solid var(--color-lime);
  color: var(--color-lime);
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  border-radius: 4px;
  outline: none;
}

.message-input {
  flex: 1;
  min-width: 200px;
}

.agent-select:focus,
.message-input:focus {
  box-shadow: 0 0 8px var(--color-lime);
  border-color: #00FFFF;
}

.btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--color-lime);
  color: var(--color-lime);
  font-family: 'Ubuntu Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn:hover {
  background: var(--color-lime);
  color: var(--color-black);
  box-shadow: 0 0 12px var(--color-lime);
  transform: scale(1.02);
}

.btn-delete {
  border-color: var(--color-orange);
  color: var(--color-orange);
}

.btn-delete:hover {
  background: var(--color-orange);
  color: var(--color-black);
  box-shadow: 0 0 12px var(--color-orange);
}

.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--color-black);
  border: 1px solid var(--color-lime);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: var(--color-lime);
}

.preview-header h2 {
  margin: 0;
  font-size: 16px;
}

.preview-status {
  font-size: 12px;
  padding: 4px 8px;
  border: 1px solid var(--color-lime);
}

.preview-iframe {
  flex: 1;
  border: none;
  background: var(--color-black);
  border-radius: 4px;
}

@media (max-width: 768px) {
  .agent-studio {
    flex-direction: column;
  }

  .chat-section {
    border-right: none;
    border-bottom: 2px solid var(--color-lime);
  }

  .controls {
    flex-direction: column;
  }

  .agent-select,
  .message-input,
  .btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
