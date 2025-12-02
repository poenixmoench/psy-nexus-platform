<template>
  <div class="agent-dev-studio">
    <h1>Agenten Entwicklungsstudio</h1>
    <div v-if="loadingConversation || isLiveStreamActive" class="spinner-container">
        <span class="spinner-text">Lädt...</span>
    </div>

    <div v-else>
        <div class="agents-container">
            <button
                v-for="agent in agents"
                :key="agent.id"
                :class="['status-badge', agent.status]"
                @click="startAgentRun(agent)"
            >
                {{ agent.name }}
            </button>
        </div>
    </div>

    <div v-if="liveError" class="error-message">
        Fehler beim Live-Streaming: {{ liveError }}
    </div>

    <div v-if="streamMessages.length > 0" class="message-container">
        <h3>Live-Protokoll (Run: {{ selectedRunId }})</h3>
        <div
            v-for="(message, index) in streamMessages"
            :key="index"
            class="message"
            :class="{
                'stream-message': message.type === 'stream',
                'complete-message': message.type === 'complete'
            }"
        >
            {{ message.content }} ({{ new Date(message.timestamp).toLocaleTimeString('de-DE') }})
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeUnmount } from 'vue';
import axios from 'axios';

interface IStreamMessage {
    type: 'stream' | 'complete';
    content: string;
    timestamp: string;
    runId: string;
}

interface IAgent {
    id: string;
    name: string;
    status: 'active' | 'inactive';
}

export default defineComponent({
    setup() {
        // ✅ KORRIGIERT: Nutze localhost statt 157.180.31.27
        const API_BASE_URL = 'http://157.180.31.27:3001/api';
        const WS_BASE_URL = 'ws://157.180.31.27:3001/ws/';

        const liveWs = ref<WebSocket | null>(null);
        const isLiveStreamActive = ref<boolean>(false);
        const liveError = ref<string>('');
        const loadingConversation = ref<boolean>(false);
        const selectedRunId = ref<string>('');

        const agents: IAgent[] = [
            { id: '1', name: 'CodeReviewAgent', status: 'active' },
            { id: '2', name: 'SecurityAuditAgent', status: 'active' },
            { id: '3', name: 'BugFixerAgent', status: 'inactive' }
        ];
        const streamMessages = ref<IStreamMessage[]>([]);

        const closeWebSocket = () => {
            if (liveWs.value) {
                console.log('[WS] Verbindung wird geschlossen.');
                liveWs.value.close();
                liveWs.value = null;
            }
            isLiveStreamActive.value = false;
            loadingConversation.value = false;
        };

        const startAgentRun = async (agent: IAgent) => {
            if (isLiveStreamActive.value) {
                console.warn('Ein Stream läuft bereits.');
                return;
            }

            loadingConversation.value = true;
            closeWebSocket();
            liveError.value = '';
            streamMessages.value = [];

            try {
                console.log(`[API] Starte Live-Lauf für Agent ${agent.name}...`);
                const response = await axios.post(`${API_BASE_URL}/runs/start-live/${agent.name}`);
                const runId = response.data.runId;

                selectedRunId.value = runId;
                connectWebSocket(runId, agent.name);

                streamMessages.value.push({
                    type: 'stream',
                    content: `[SYSTEM] Starte Agenten-Lauf: ${agent.name}. Erwarte Stream...`,
                    timestamp: new Date().toISOString(),
                    runId: runId
                });

            } catch (error: any) {
                console.error('Fehler beim Starten des Agenten:', error);
                liveError.value = `Fehler beim Starten des Agenten: ${error.message || 'Netzwerkfehler'}`;
                loadingConversation.value = false;
            }
        };

        const connectWebSocket = (runId: string, agentName: string) => {
            closeWebSocket();

            // ✅ KORRIGIERT: Nutze richtige URL ohne "/live/"
            const wsUrl = `${WS_BASE_URL}${runId}`;
            console.log(`[WS] Verbinde zu: ${wsUrl}`);
            
            liveWs.value = new WebSocket(wsUrl);

            liveWs.value.onopen = () => {
                console.log('[WS] ✅ WebSocket-Verbindung geöffnet');
                isLiveStreamActive.value = true;
                loadingConversation.value = false;
            };

            liveWs.value.onmessage = (event) => {
                try {
                    const message: IStreamMessage = JSON.parse(event.data);
                    console.log('[WS] 📨 Nachricht erhalten:', message);
                    if (message.type === 'stream') {
                        streamMessages.value.push(message);
                    } else if (message.type === 'complete') {
                        message.content = `[SYSTEM] ✅ Agenten-Lauf erfolgreich beendet.`;
                        streamMessages.value.push(message);
                        closeWebSocket();
                    }
                } catch (e) {
                    console.error('[WS] Fehler beim Parsen der Nachricht:', e);
                    liveError.value = 'Fehler beim Empfangen von Stream-Daten.';
                    closeWebSocket();
                }
            };

            liveWs.value.onerror = (error) => {
                console.error('[WS] 🔴 WebSocket-Fehler:', error);
                liveError.value = 'Ein kritischer Fehler beim Live-Streaming ist aufgetreten.';
                closeWebSocket();
            };

            liveWs.value.onclose = () => {
                console.log('[WS] ❌ WebSocket-Verbindung geschlossen');
                isLiveStreamActive.value = false;
            };
        };

        onBeforeUnmount(() => {
            closeWebSocket();
        });

        return {
            agents,
            startAgentRun,
            isLiveStreamActive,
            liveError,
            loadingConversation,
            streamMessages,
            selectedRunId
        };
    }
});
</script>

<style scoped>
.agent-dev-studio {
    max-width: 900px;
    margin: 20px auto;
    padding: 30px;
    background-color: #f4f4f4;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
    border-bottom: 2px solid #ccc;
    padding-bottom: 15px;
    margin-bottom: 25px;
}

.spinner-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 150px;
}

.spinner-text {
    font-size: 1.5em;
    color: #007bff;
}

.agents-container {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.status-badge {
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    border: none;
    font-weight: bold;
    transition: background-color 0.2s;
}

.status-badge.active {
    background-color: #28a745;
    color: white;
}

.status-badge.inactive {
    background-color: #dc3545;
    color: white;
}

.status-badge:hover {
    opacity: 0.8;
}

.error-message {
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    padding: 10px;
    border-radius: 4px;
    margin-top: 15px;
}

.message-container {
    margin-top: 30px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
    background-color: #fff;
    max-height: 400px;
    overflow-y: auto;
}

.message {
    padding: 8px 0;
    border-bottom: 1px dotted #eee;
    font-family: monospace;
    font-size: 0.9em;
}

.stream-message {
    color: #007bff;
}

.complete-message {
    color: #28a745;
    font-weight: bold;
    background-color: #e9ecef;
}
</style>
