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
            <span class="agent-name">{{ name }}</span> <!-- Kein holographic-pulse hier -->
            <div class="signal-wrapper">
              <div class="status-indicator" :class="{ processing: streamingAgent === name }"></div>
              <div v-if="streamingAgent === name" class="pulse-ring"></div>
            </div>
          </div>
          <div class="card-body">{{ agentTheme[name]?.role || 'Sub-System' }}</div> <!-- Kein holographic-pulse hier -->
        </div>
      </div>
    </aside>

    <main class="chat-section">
      <div class="neural-map-wrapper">
        <div class="neural-map-header">
          <div class="header-left">
            <span class="header-title holographic-pulse">NEXUS ZENTRALE</span>
            <span class="header-status">{{ activeAgent }}</span> <!-- Kein holographic-pulse hier -->
          </div>
          <div class="header-actions">
            <button @click="hostProject" class="nexus-btn host-pulse">HOSTEN (STAGING)</button>
            
            <button v-if="stagingActive" @click="publishToProd" class="nexus-btn gold-prod-btn">
              RELEASE TO MAIN SITE
            </button>
            
            <button @click="resetConversation" class="nexus-btn btn-reset">RESET</button>
          </div>
        </div>

        <svg class="neural-map" viewBox="0 0 300 300">
          <!-- Filter für weichere Linien -->
          <defs>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>
          <!-- "Seed of Life" Geometrie -->
          <g class="seed-of-life" filter="url(#softGlow)" :class="{ 'is-streaming': streamingAgent }">
            <!-- Zentraler Kreis -->
            <circle cx="150" cy="150" r="42" class="geo-circle" />
            <!-- 6 umgebende Kreise -->
            <circle v-for="n in 6" :key="n"
                    :cx="150 + 42 * Math.cos((n * 60 * Math.PI) / 180)"
                    :cy="150 + 42 * Math.sin((n * 60 * Math.PI) / 180)"
                    r="42" class="geo-circle" />
          </g>
          <!-- Verbindungslinien zu Agenten-Nodes -->
          <g v-for="(name, i) in agentNames" :key="i">
            <line x1="150" y1="150" :x2="nodeX(i)" :y2="nodeY(i)"
                  class="workflow-line" :class="{ active: activeAgent === name }" />
            <g :class="['node', { active: activeAgent === name, streaming: streamingAgent === name }]">
              <circle :cx="nodeX(i)" :cy="nodeY(i)" r="8" class="node-circle" />
              <text :x="nodeX(i)" :y="nodeY(i) + 22" class="node-label">{{ name.substring(0, 3) }}</text> <!-- Kein holographic-pulse hier -->
            </g>
          </g>
        </svg>
      </div>

      <div class="messages-area" ref="msgBox">
        <div v-for="(msg, i) in agents[activeAgent]?.history" :key="i" class="message" :class="msg.type">
          <div class="msg-header">
            <span class="msg-agent">{{ msg.agent }}</span> <!-- Kein holographic-pulse hier -->
            <button v-if="msg.type === 'agent'" @click="copy(msg.text)" class="btn-copy">COPY</button>
          </div>
          <div class="msg-text" v-html="marked(msg.text)"></div> <!-- Kein holographic-pulse hier -->
        </div>

        <div v-if="streamingAgent === activeAgent" class="message agent streaming">
          <div class="msg-header">
            <span class="msg-agent">{{ streamingAgent }}</span>
          </div>
          <div class="msg-text streaming-live-text">{{ streamingText }}<span class="cursor">▌</span></div>
        </div>

        <div v-if="streamingAgent" class="stop-container">
          <button @click="stopGeneration" class="btn-stop">■ STOP GENERATION</button>
        </div>

        <!-- Stafetten-Übergabe Zone -->
        <div v-if="awaitingHandover" class="handover-zone">
          <div class="handover-label holographic-pulse">STAFETTEN-ÜBERGABE ERFORDERLICH</div>
          <div class="handover-buttons">
            <button v-for="nextAgent in suggestedAgents" 
                    @click="triggerHandover(nextAgent)" 
                    class="nexus-btn host-pulse handover-btn">
              ÜBERGEBE AN {{ nextAgent }}
            </button>
          </div>
        </div>
      </div>

      <div class="input-zone">
        <textarea v-model="userInput" @keydown.enter.exact.prevent="send"
                  :placeholder="'BEFEHL AN ' + activeAgent + '...'"
                  class="system-input"></textarea> <!-- Kein holographic-pulse hier -->
        <button @click="send" class="btn-execute" :disabled="!!streamingAgent">SENDEN</button>
      </div>
    </main>

    <section class="stats-section">
      <div class="section-header holographic-pulse">LIVE VORSCHAU</div>
      <div class="preview-box">
        <iframe
          v-if="agentPreviews[activeAgent]"
          :key="activeAgent"
          :srcdoc="agentPreviews[activeAgent]"
          class="preview-iframe"
          sandbox="allow-scripts allow-same-origin"
          title="Live Preview"
        ></iframe>
        <div v-else class="preview-empty">Warte auf {{ activeAgent }}...</div>
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
const agentPreviews = ref<Record<string, string>>({
  'ORION': '', 'PLAN-AGENT': '', 'FRONTEND-MEISTER': '', 'DESIGN-ALCHEMIST': '',
  'BACKEND-ARCHITEKT': '', 'QA-GURU': '', 'OPTIMIERER': '', 'DOKUMENTATION-AGENT': ''
})

const streamingAgent = ref('')
const streamingText = ref('')
const updateTimeoutId = ref<NodeJS.Timeout | null>(null)
const showToast = ref(false)
const toastMsg = ref('')
const stagingActive = ref(false)

// Neue Variablen für das Stafetten-Feature
const awaitingHandover = ref(false)
const suggestedAgents = ref<string[]>([])

// Neue Funktion für die Stafetten-Übergabe
const triggerHandover = (agentName: string) => {
  activeAgent.value = agentName
  awaitingHandover.value = false
  suggestedAgents.value = []
  triggerToast(`STAFETTE: Übergabe an ${agentName}`)
}

// Neue Funktion für den Hosen-Knopf (Deployment)
const hostProject = () => {
  triggerToast("DEPLOYMENT INITIALISIERT...")
  socket.emit('host-project', { agent: activeAgent.value })
}

// Neue Funktion für den Production-Knopf
const publishToProd = () => {
  if (confirm("Bist du sicher? Dies aktualisiert die HAUPTSEITE psy-nexus.live!")) {
    socket.emit('publish-to-production');
  }
};

// Neue Variablen für das flüssige Tippen
const typeQueue = ref<string[]>([]);
let isTyping = false;
const typingSpeed = 15; // Geschwindigkeit in Millisekunden pro Zeichen

const processQueue = () => {
  if (typeQueue.value.length > 0) {
    isTyping = true;
    streamingText.value += typeQueue.value.shift();

    // Optimierte Logik: Nur rendern, wenn Code-Blöcke aktiv sind
    if (streamingText.value.includes('```')) {
      const code = extractCodeBlock(streamingText.value);
      if (code && code.length > 5) { // Erst ab einer gewissen Länge rendern
        agentPreviews.value[streamingAgent.value] = code;
      }
    }

    nextTick(() => {
      if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight;
    });

    setTimeout(processQueue, typingSpeed);
  } else {
    isTyping = false;
  }
};

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

// Helper-Funktion für die Blumenrad-Petalen (wird hier nicht mehr benötigt, da statische Geometrie)
// const calcPetalX = (angleDeg: number) => 150 + 70 * Math.cos((angleDeg * Math.PI) / 180)
// const calcPetalY = (angleDeg: number) => 150 + 70 * Math.sin((angleDeg * Math.PI) / 180)

const triggerToast = (m: string) => {
  toastMsg.value = m
  showToast.value = true
  setTimeout(() => showToast.value = false, 2000)
}

const send = () => {
  if (!userInput.value.trim() || streamingAgent.value) return;
  const txt = userInput.value;

  // Diese Zeile hinzufügen: Leert die Vorschau für den aktiven Agenten
  agentPreviews.value[activeAgent.value] = '';

  agents.value[activeAgent.value].history.push({ agent: 'FABIAN', text: txt, type: 'user' });
  streamingAgent.value = activeAgent.value;
  streamingText.value = '';
  socket.emit('agent-message', { agentName: activeAgent.value, message: txt });
  userInput.value = '';
  nextTick(scrollToBottom);
}

const stopGeneration = () => {
  socket.emit('abort-generation')
  if (streamingAgent.value && streamingText.value) {
    agents.value[streamingAgent.value].history.push({
      agent: streamingAgent.value,
      text: streamingText.value + "\n\n[HALTED]",
      type: 'agent'
    })
  }
  streamingAgent.value = ''
  streamingText.value = ''
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
  let match = text.match(/```(?:html|svg|xml|jsx|tsx|javascript|typescript|js|ts)\s+([\s\S]*?)```/i)
  if (match && match[1]) return match[1].trim()
  match = text.match(/```\s*([\s\S]*?)```/)
  if (match && match[1] && match[1].trim().startsWith('<')) return match[1].trim()
  return ''
}

onMounted(async () => {
  const res = await fetch('/api/agents');
  const data = await res.json();
  data.forEach((a: any) => agents.value[a.name] = { ...a, history: [] });

  socket.on('agent-chunk', (data) => {
    if (streamingAgent.value === data.agent) {
      // Zeichen in die Queue werfen statt direkt anzuzeigen
      const chars = (data.chunk || '').split('');
      typeQueue.value.push(...chars);

      // Startet den Prozess, falls er nicht schon läuft
      if (!isTyping) processQueue();
    }
  });

  socket.on('agent-done', (data) => {
    if (data && data.agent && streamingAgent.value === data.agent) {
      // Warten bis die Queue leer getippt wurde, dann in History schieben
      const checkFinished = setInterval(() => {
        if (typeQueue.value.length === 0) {
          clearInterval(checkFinished);
          agents.value[data.agent].history.push({
            agent: data.agent,
            text: streamingText.value,
            type: 'agent'
          });
          const code = extractCodeBlock(streamingText.value);
          if (code) agentPreviews.value[data.agent] = code;
          streamingAgent.value = '';
          streamingText.value = '';

          // Prüfe ob der Agent eine Stafetten-Übergabe empfiehlt
          const responseText = streamingText.value.toLowerCase();
          if (responseText.includes('stafette') || responseText.includes('übergabe') || responseText.includes('transfer')) {
            // Extrahiere mögliche Agentennamen aus der Antwort
            const possibleAgents = Object.keys(agentTheme).filter(agent => 
              responseText.includes(agent.toLowerCase()) && agent !== data.agent
            );
            
            if (possibleAgents.length > 0) {
              awaitingHandover.value = true;
              suggestedAgents.value = possibleAgents.slice(0, 3); // Max 3 Vorschläge
            }
          }
        }
      }, 100);
    }
  });

  // Socket für Stafetten-Übergabe vom Backend
  socket.on('request-handover', (data) => {
    awaitingHandover.value = true;
    suggestedAgents.value = data.suggestedAgents || [];
  });

  // Socket für Deployment-Ergebnisse
  socket.on('deployment-result', (data) => {
    if (data.success) {
      triggerToast('🚀 DEPLOYMENT ERFOLGREICH: psy-nexus.live wurde aktualisiert!');
      console.log('Rsync Log:', data.log);
      if (data.message && data.message.includes("Deployment erfolgreich")) {
        stagingActive.value = true; // Button für Release freischalten
      } else if (data.message && data.message.includes("LIVE!")) {
        triggerToast("🎉 ERFOLG: Seite ist jetzt LIVE!");
      }
    } else {
      triggerToast('❌ FEHLER: ' + data.error);
      console.log('Deployment Error:', data.error);
    }
  });
});
</script>

<style scoped>
* {
  font-family: 'Ubuntu Mono', monospace;
  box-sizing: border-box;
  color: #e5e4e2; /* Platin-Grau Standard */
}

/* 1. Geändertes Layout: Größerer Vorschaubereich */
.neural-grid { display: grid; grid-template-columns: 260px 1fr 1.5fr; height: 100vh; background: #000; color: #32ff00; overflow: hidden; }

/* LAYERING */
/* 3. Geänderte Sidebar & Agenten */
.agents-section {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px 15px; /* Etwas mehr Luft oben/unten */
  background: #050505;
}
.chat-section { background: #0a0a0a; display: flex; flex-direction: column; overflow: hidden; }
.stats-section { background: #050505; border-left: 1px solid rgba(50, 255, 0, 0.15); padding: 15px; display: flex; flex-direction: column; }

.section-header {
  font-size: 11px; /* Von 13 reduziert */
  opacity: 0.8;
  font-weight: bold;
  margin-bottom: 15px;
  color: #32ff00;
  letter-spacing: 2px;
}
/* 3. Geänderte Sidebar & Agenten */
.agents-grid {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Verteilt Agenten über die ganze Höhe */
  flex-grow: 1;
  padding-bottom: 20px;
}

/* AGENT CARD FIX - Sunset Gradient für aktive Karte */
.agent-card {
  padding: 10px;
  border: 1px solid rgba(50, 255, 0, 0.1);
  cursor: pointer;
  transition: 0.2s;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0; /* Space-between übernimmt jetzt den Abstand */
  flex-shrink: 0;
}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 5px; }
/* 3. Geänderte Sidebar & Agenten */
/* Inaktive Agenten in dezentem Platin */
.agent-name {
  color: #a0a0a0 !important; /* Dezentes Grau/Silber */
  font-size: 11px;
}
/* Aktiver Agent in strahlendem Gold */
.agent-card.active .agent-name {
  color: #cfb53b !important;
  text-shadow: 0 0 10px rgba(207, 181, 59, 0.5);
}
/* Die Rollenbeschreibung unter dem Namen */
.card-body {
  color: #707070 !important; /* Dunkleres Platin */
  font-size: 9px;
}

.signal-wrapper { position: relative; width: 10px; height: 10px; flex-shrink: 0; }
.status-indicator { width: 10px; height: 10px; border-radius: 50%; background: #111; border: 1px solid #32ff00; }
.status-indicator.processing { background: #32ff00; box-shadow: 0 0 8px #32ff00; }
.pulse-ring { position: absolute; top: -5px; left: -5px; width: 20px; height: 20px; border: 1px solid #32ff00; border-radius: 50%; animation: pulse 3s infinite; }

/* HEADER FIX */
.neural-map-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid rgba(50, 255, 0, 0.1); }
.header-left { display: flex; align-items: center; gap: 15px; }
/* 2. Geänderter Header-Stil (holographic-pulse) */
.header-title {
  font-size: 1.1rem !important; /* Von 1.3 reduziert */
  letter-spacing: 2px;
}
.header-status { font-size: 10px; background: rgba(50, 255, 0, 0.1); padding: 2px 6px; border-radius: 2px; }
.header-actions { display: flex; gap: 8px; }

/* BUTTONS */
.nexus-btn {
  padding: 6px 15px;
  border-radius: 4px;
  font-family: 'Ubuntu Mono', monospace;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  transition: 0.3s;
  text-transform: uppercase;
}

.host-pulse {
  background: #32ff00;
  color: #000;
  border: none;
  box-shadow: 0 0 10px rgba(50, 255, 0, 0.4);
}

.host-pulse:hover {
  box-shadow: 0 0 20px #32ff00;
  transform: scale(1.05);
}

/* Neuer Button-Stil für Stafetten-Übergabe */
.handover-btn {
  width: 100%;
  margin-bottom: 10px;
  background: #ff007f; /* Pink für Stafette */
  color: #fff;
  border: none;
  box-shadow: 0 0 10px rgba(255, 0, 127, 0.4);
}

.handover-btn:hover {
  box-shadow: 0 0 20px #ff007f;
  transform: scale(1.02);
}

/* Neuer Button-Stil für Production-Release */
.gold-prod-btn {
  background: linear-gradient(45deg, #cfb53b, #ffcf40) !important;
  color: #000 !important;
  font-weight: 900;
  border: 1px solid #000;
  box-shadow: 0 0 15px rgba(255, 207, 64, 0.5);
  margin-left: 10px;
}
.gold-prod-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px rgba(255, 207, 64, 0.8);
}

.btn-reset {
  background: transparent;
  border: 1px solid #ff3300;
  color: #ff3300;
  margin-left: 10px;
}

/* STAFETTEN-ÜBERGABE ZONE */
.handover-zone {
  padding: 20px;
  background: rgba(255, 0, 127, 0.1); /* dezentes pink für Übergabe */
  border: 1px dashed #ff007f;
  border-radius: 8px;
  margin-top: 15px;
  text-align: center;
}

.handover-label {
  display: block;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: bold;
}

.handover-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Ersetze .input-zone, .system-input und .btn-execute */
.input-zone {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #080808; /* Dunkler Kontrast zum Rest */
  border-top: 1px solid rgba(50, 255, 0, 0.1);
}

.system-input {
  flex: 1;
  height: 42px; /* Etwas flacher und eleganter */
  background: rgba(50, 255, 0, 0.05);
  border: 1px solid rgba(50, 255, 0, 0.2);
  border-radius: 8px; /* Deine Rundungen, aber sauberer */
  color: #32ff00;
  padding: 8px 15px;
  font-size: 13px;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

/* Ersetze die .btn-execute und .preview-box Sektionen */
.btn-execute {
  height: 42px;
  padding: 0 25px;
  background: transparent; /* Weg von der massiven grünen Fläche */
  border: 1px solid #32ff00;
  color: #32ff00;
  border-radius: 8px;
  font-weight: 900;
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-execute:hover:not(:disabled) {
  background: rgba(50, 255, 0, 0.1); /* Nur dezentes Leuchten */
  box-shadow: 0 0 15px rgba(50, 255, 0, 0.3);
  transform: translateY(-1px);
}

/* BOHO-HIPPIE-GOA BLUMENRAD STYLES */
.neural-map { height: 220px; width: 100%; opacity: 0.9; }
/* 3. Neue Geometrie-CSS-Klassen */
.geo-circle {
  fill: none;
  stroke: #cfb53b; /* Gold statt Blau */
  stroke-width: 0.8;
  opacity: 0.2; /* Geringere Deckkraft für Gold-Blautinte-Optik */
  transition: stroke 0.5s, opacity 0.5s;
}
.is-streaming .geo-circle {
  stroke: #ff007f; /* Wechselt zu Pink beim Generieren */
  opacity: 1;
}

/* 4. Geänderte Geometrie (Linien & Pulsieren) */
/* Die Verbindungslinie zum aktiven Agenten */
.workflow-line.active {
  stroke: #32ff00;
  stroke-width: 2;
  opacity: 1;
}

/* Der Node-Punkt am Ende der Linie */
.node-circle {
  fill: #111;
  stroke: #32ff00;
  transition: all 0.3s;
}

/* Wenn der Agent schreibt: Festes Leuchten */
.node.active .node-circle {
  fill: #32ff00;
  box-shadow: 0 0 15px #32ff00;
}

/* Wenn der Agent nachdenkt (Streaming): Pulsieren */
.node.streaming .node-circle {
  animation: thinking-pulse 1s infinite alternate;
}

@keyframes thinking-pulse {
  from { r: 8; opacity: 1; fill: #32ff00; }
  to { r: 12; opacity: 0.5; fill: #ff007f; }
}

/* 5. Neue CSS-Klasse für die Agenten-Kürzel am Rad */
.node-label {
  fill: #ffcf40 !important; /* Ein leuchtendes Gold passend zum Header */
  font-size: 11px;
  font-weight: 900;
  text-shadow: 0 0 8px rgba(255, 207, 64, 0.6);
  pointer-events: none;
}

.messages-area { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
/* 2. Chat-Nachrichten Farben korrigieren */
.message { padding: 10px; border-radius: 4px; max-width: 85%; font-size: 12px; }
/* Deine Nachrichten (User) - Edles Platin/Silber */
.message.user {
  align-self: flex-end;
  background: rgba(229, 228, 226, 0.1) !important;
  border-right: 3px solid #e5e4e2 !important;
}
.message.user .msg-text, .message.user .msg-agent {
  color: #e5e4e2 !important; /* Zwingt Platin-Farbe */
}
/* Agenten Nachrichten - Echtes Gold */
.message.agent {
  align-self: flex-start;
  background: rgba(207, 181, 59, 0.1) !important;
  border-left: 3px solid #cfb53b !important;
}
.message.agent .msg-text, .message.agent .msg-agent {
  color: #cfb53b !important; /* Zwingt Gold-Farbe */
  text-shadow: 0 0 5px rgba(207, 181, 59, 0.3);
}

/* 4. Live-Vorschau Animation */
.preview-iframe {
  background: #fff;
  transition: opacity 0.5s ease;
}

/* Optional: Damit der Wartetext schöner aussieht */
.preview-empty {
  color: #cfb53b; /* Goldene Schrift für den Wartezustand */
  font-family: 'Ubuntu Mono', monospace;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: center;
}

/* Der blinkende Cursor am Wort-Ende */
.cursor {
  display: inline-block;
  width: 8px;
  height: 15px;
  background: #32ff00;
  margin-left: 2px;
  box-shadow: 0 0 8px #32ff00;
  animation: blink 0.8s infinite;
}

/* Neuer Style für das flüssige Tippen */
.streaming-live-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Ubuntu Mono', monospace;
  color: #a0ffa0; /* Etwas sanfter während des Tippens */
  line-height: 1.5;
  transition: all 0.1s ease; /* Macht das Erscheinen der Zeilen weicher */
}

@keyframes blink {
  50% { opacity: 0; }
}

@keyframes pulse { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }

/* 2. Neuer holographic-pulse Effekt */
.holographic-pulse {
  background: linear-gradient(90deg, #ff007f, #00ffff, #ffcf40, #00ffff, #ff007f);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: holo-flow 4s linear infinite;
  font-weight: 900;
  font-size: 1.1rem !important; /* Von 1.3 reduziert */
  letter-spacing: 2px;
}

@keyframes holo-flow {
  to { background-position: 200% center; }
}

/* Rotations-Animation für die Aura (wird hier nicht mehr benötigt, da statische Geometrie) */
/* @keyframes rotateAura {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
} */
</style>
