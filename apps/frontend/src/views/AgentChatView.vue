<template>
  \n
  <div class="agent-chat-view p-4 max-w-4xl mx-auto">
    \n
    <h1
      class="text-3xl font-bold mb-6 text-gray-800 tracking-tighter uppercase"
    >
      NEXUS Agent Chat (LIVE)
    </h1>
    \n \n
    <div
      ref="chatArea"
      class="chat-area space-y-4 h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg border shadow-inner"
    >
      \n
      <div
        v-for="message in chatHistory"
        :key="message.id"
        \n
        :class="{ 'text-right': message.isUser, 'text-left': !message.isUser }"
      >
        \n
        <div
          :class="['inline-block px-4 py-2 rounded-xl max-w-[90%] whitespace-pre-wrap shadow-sm',\n                      message.isUser ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200']"
        >
          \n
          <strong
            v-if="!message.isUser"
            class="block text-indigo-600 mb-1 text-[10px] uppercase font-black"
            >{{ message.sender }}</strong
          >\n <span v-html="formatMessage(message.content)"></span>\n
          <span
            v-if="!message.isUser && message.isStreaming"
            class="typing-indicator ml-2"
            >...</span
          >\n
        </div>
        \n
      </div>
      \n
    </div>
    \n\n
    <div
      class="mt-6 flex items-center justify-between mb-3 px-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm"
    >
      \n
      <div class="flex items-center space-x-4">
        \n
        <label class="flex items-center cursor-pointer group"
          >\n
          <div class="relative">
            \n
            <input
              type="checkbox"
              v-model="isDeepMode"
              class="sr-only peer"
            />\n
            <div
              class="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors shadow-inner"
            ></div>
            \n
            <div
              class="absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform peer-checked:translate-x-5 shadow"
            ></div>
            \n
          </div>
          \n
          <span
            class="ml-3 text-[10px] font-black tracking-widest uppercase"
            :class="isDeepMode ? 'text-indigo-600' : 'text-gray-400'"
            >\n
            {{
              isDeepMode ? "🧠 DEEP MODE (32B)" : "⚡ SPEED MODE (14B)"
            }}\n </span
          >\n </label
        >\n
      </div>
      \n
      <button
        @click="unloadRAM"
        type="button"
        class="text-[9px] font-black bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition-all uppercase tracking-tighter shadow-sm"
      >
        🗑️ RAM LEEREN</button
      >\n
    </div>
    \n\n
    <form @submit.prevent="sendMessage" class="flex space-x-3">
      \n
      <input
        type="text"
        v-model="userInput"
        placeholder="Befehl senden..."
        \n
        class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all"
        \n
        required
      />\n
      <button
        type="submit"
        :disabled="isLoading"
        \n
        class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 transition-all uppercase tracking-widest"
      >
        \n {{ isLoading ? "VERARBEITET..." : "ABSENDEN" }}\n</button
      >\n
    </form>
    \n
  </div>
  \n
</template>
\n\n
<script setup lang="ts">
\nimport { AGENT_PROFILES } from "@shared/config/agent-profiles";\nimport { ref, nextTick } from 'vue';\nimport { useAuthStore } from '../stores/authStore';\nimport { useWebSocketStore } from '../stores/webSocketStore';\n\nconst wsStore = useWebSocketStore();\nconst authStore = useAuthStore();\nconst userInput = ref('');\nconst isLoading = ref(false);\nconst isDeepMode = ref(false);\nconst chatArea = ref<HTMLElement | null>(null);\nlet messageIdCounter = 2;
let currentController: AbortController | null = null;\n\ninterface ChatMessage {\n  id: number; sender: string; content: string; isUser: boolean; isStreaming: boolean;\n}\n\nconst chatHistory = ref<ChatMessage[]>([\n  { id: 1, sender: 'System', content: 'Bereit für Alpha.', isUser: false, isStreaming: false }\n]);\n\nconst scrollToBottom = () => {\n  nextTick(() => { if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight; });\n};\n\nconst formatMessage = (content: string) => content.replace(/\n/g, '<br>');\n\nconst unloadRAM = async () => {\n  try {\n    const response = await fetch('/api/agents/ollama/unload', { method: 'POST' });\n    const res = await response.json();\n    if (res.success) alert('Modelle entladen');\n  } catch (e) { console.error('Unload failed'); }\n};\n\nconst sendMessage = async () => {\n  if (!userInput.value.trim()) return;\n\n  const userMessage = userInput.value.trim();\n  chatHistory.value.push({ id: messageIdCounter++, sender: 'Alpha', content: userMessage, isUser: true, isStreaming: false });\n  userInput.value = '';\n  isLoading.value = true;\n  scrollToBottom();\n\n  const agentMsgObj: ChatMessage = {\n    id: messageIdCounter++,\n    sender: AGENT_PROFILES.ORION_AGENT.name,\n    content: '',\n    isUser: false,\n    isStreaming: true\n  };\n  chatHistory.value.push(agentMsgObj);\n\n  try {\n    const controller = new AbortController();
    currentController = controller;

    const response = await fetch('/api/orchestrate/stream', {\n      method: 'POST',\n      headers: { \n        'Content-Type': 'application/json',\n        'Authorization': `Bearer ${authStore.getToken()}`\n      },\n      body: JSON.stringify({ \n        input: isDeepMode.value ? userMessage + ' [32b]' : userMessage, \n        userGoal: userMessage, \n        agent: 'ORION_AGENT',\n        workflowId: wsStore.activeWorkflowId || undefined\n      }),\n    });\n\n    const reader = response.body?.getReader();\n    const decoder = new TextDecoder();\n    let buffer = '';\n\n    if (reader) {\n      while (true) {\n        const { done, value } = await reader.read();\n        if (done) break;\n        \n        buffer += decoder.decode(value, { stream: true });\n        const lines = buffer.split('\n');\n        buffer = lines.pop() || '';\n\n        for (const line of lines) {\n          const trimmed = line.trim();\n          if (!trimmed || !trimmed.startsWith('data: ')) continue;\n          \n          try {\n            const data = JSON.parse(trimmed.replace('data: ', ''));\n            if (data.error) {\n              agentMsgObj.content += '\n[FEHLER] ' + data.error;
              console.error('[ORCHESTRATE ERROR]', data.error);\n              agentMsgObj.isStreaming = false;\n              isLoading.value = false;\n              scrollToBottom();\n              continue;\n            }\n            \n            if (data.workflowId) {\n              wsStore.setWorkflowId(data.workflowId);\n              continue;\n            }\n\n            if (data.content) {\n              agentMsgObj.content += data.content;\n              scrollToBottom();\n            }\n          } catch (e) {}\n        }\n      }\n    }\n  } catch (err: any) {\n    if (err.name === 'AbortError') {\n      console.log('Stream bewusst abgebrochen.');\n    } else {\n      agentMsgObj.content = "Kommunikationsfehler.";\n    }\n  } finally {\n    isLoading.value = false;\n    agentMsgObj.isStreaming = false;\n    scrollToBottom();\n  }\n};\n
</script>
\n\n
<style scoped>
\n.typing-indicator::after {\n  content: '...';\n  animation: loading 1s infinite steps(1);\n}\n@keyframes loading {\n  0% { content: '.'; }\n  33% { content: '..'; }\n  66% { content: '...'; }\n}\n
</style>
\n
