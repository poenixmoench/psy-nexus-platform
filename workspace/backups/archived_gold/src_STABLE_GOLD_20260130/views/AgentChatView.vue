<template>
  <div class="agent-chat-view p-4 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">PSY-NEXUS Agent Chat (LIVE)</h1>
    <div ref="chatArea" class="chat-area space-y-4 h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border">
      <div v-for="message in chatHistory" :key="message.id"
            :class="{'text-right': message.isUser, 'text-left': !message.isUser}">
        <div :class="{'inline-block px-4 py-2 rounded-xl max-w-[90%] whitespace-pre-wrap': true,
                      'bg-indigo-600 text-white': message.isUser,
                      'bg-white text-gray-700 border border-gray-200': !message.isUser}">
          <strong v-if="!message.isUser" class="block text-indigo-600 mb-1">{{ message.sender }}</strong>
          <span v-html="formatMessage(message.content)"></span>
          <span v-if="!message.isUser && message.isStreaming" class="typing-indicator ml-2">...</span>
        </div>
      </div>
    </div>
    <form @submit.prevent="sendMessage" class="mt-6 flex space-x-3">
      <input type="text" v-model="userInput" placeholder="Ask the ProjectOrchestrator..."
              class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              required>
      <button type="submit" :disabled="isLoading"
              class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200">
        {{ isLoading ? 'Processing...' : 'Send' }}
      </button>
    </form>
    <div v-if="isLoading" class="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
      Agent is processing: Live WebSocket connection established. Watching for updates...     </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useWebSocketStore } from '../stores/webSocketStore';

const wsStore = useWebSocketStore();
const authStore = useAuthStore();
const userInput = ref('');
const isLoading = ref(false);
const chatArea = ref<HTMLElement | null>(null);
const agentMessageId = ref<number | null>(null);
let messageIdCounter = 2; // Startzähler nach der initialen Nachricht

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  isUser: boolean;
  isStreaming: boolean;
}

const chatHistory = ref<ChatMessage[]>([
  { id: 1, sender: 'System', content: 'Willkommen im Agent Chat. Der ProjectOrchestrator (🎼) ist bereit!', isUser: false, isStreaming: false }
]);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.scrollTop = chatArea.value.scrollHeight;
    }
  });
};

const formatMessage = (content: string) => {
    return content.replace(/\n/g, '<br>');
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  const userMessage = userInput.value.trim();
  chatHistory.value.push({ id: messageIdCounter++, sender: 'User', content: userMessage, isUser: true, isStreaming: false });
  userInput.value = '';
  isLoading.value = true;
  scrollToBottom();

  agentMessageId.value = messageIdCounter++;
  const agentMessage: ChatMessage = {
    id: agentMessageId.value,
    sender: 'ProjectOrchestrator 🎼',
    content: 'Agenten-Task wird gestartet...',
    isUser: false,
    isStreaming: true
  };
  chatHistory.value.push(agentMessage);
  scrollToBottom();

  try {
    // 🚀 KORREKTUR: Hartcodierte localhost:3001-URL durch den relativen Pfad /api ersetzt.
    const response = await fetch('/api/agents/CodeAnalyzerAgent/execute', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.getToken()}`,
      },
      body: JSON.stringify({ input: userMessage }),
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

  } catch (error: any) {
    console.error('Error starting agent task:', error);
    // KORREKTUR: Redundante Zeile entfernt
    const responseIndex = chatHistory.value.findIndex(m => m.id === agentMessageId.value);
    if (responseIndex !== -1) {
      chatHistory.value[responseIndex].content = `FEHLER: Agenten-Task fehlgeschlagen: ${error.message}`;
      chatHistory.value[responseIndex].isStreaming = false;
      isLoading.value = false;
      scrollToBottom();
    }
  }
};

onMounted(() => {
  if (!wsStore.isConnected) {
    // Stellen Sie sicher, dass die WebSocket-Store-Logik den Host der Seite verwendet (nicht localhost)
    wsStore.connect(authStore.getToken()); 
  }

  wsStore.setMessageHandler((data: any) => {
    if (data.type === 'TASK_UPDATE' && agentMessageId.value !== null) {
      const responseIndex = chatHistory.value.findIndex(m => m.id === agentMessageId.value);

      if (responseIndex !== -1) {
        if (chatHistory.value[responseIndex].content === 'Agenten-Task wird gestartet...') {
              chatHistory.value[responseIndex].content = '';
        }

        if (data.status === 'running' && data.result) {
            chatHistory.value[responseIndex].content += `\n[${data.agentType}]: ${data.result}`;
        } else if (data.status === 'completed' && data.result) {
            chatHistory.value[responseIndex].content += `\n--- FINAL RESULT --- \n[${data.agentType}]: ${data.result}`;
            chatHistory.value[responseIndex].isStreaming = false;
            isLoading.value = false;
            agentMessageId.value = null;
        }

        scrollToBottom();
      }
    }
  });
});
</script>
<style scoped>
.typing-indicator::after {
  content: '...';
  animation: loading 1s infinite steps(1);
}
@keyframes loading {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
}
</style>
