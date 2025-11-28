<script setup lang="ts">
import { ref, computed } from 'vue'

interface Task {
  id: string
  agentType: 'CodeAnalyzerAgent' | 'RefactoringAgent' | 'TestGeneratorAgent' | 'DocumentationAgent' | 'SecurityAuditAgent'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress: number
  prompt: string
  createdAt: string
  result?: string
}

interface TaskResult {
  taskId: string
  stepNumber: number
  output: string
  status: 'SUCCESS' | 'ERROR' | 'PARTIAL'
}

const tasks = ref<Task[]>([
  {
    id: 'task-001',
    agentType: 'CodeAnalyzerAgent',
    status: 'COMPLETED',
    progress: 100,
    prompt: 'Analyze the following TypeScript service for code quality and performance issues',
    createdAt: '2025-11-28T01:15:00Z',
    result: 'Analysis complete: Found 3 quality issues, 2 performance opportunities'
  },
  {
    id: 'task-002',
    agentType: 'RefactoringAgent',
    status: 'RUNNING',
    progress: 45,
    prompt: 'Refactor the authentication middleware to follow SOLID principles',
    createdAt: '2025-11-28T02:10:00Z'
  },
  {
    id: 'task-003',
    agentType: 'TestGeneratorAgent',
    status: 'PENDING',
    progress: 0,
    prompt: 'Generate comprehensive unit tests for the TaskService class',
    createdAt: '2025-11-28T02:20:00Z'
  },
  {
    id: 'task-004',
    agentType: 'SecurityAuditAgent',
    status: 'FAILED',
    progress: 25,
    prompt: 'Audit the API routes for OWASP Top 10 vulnerabilities',
    createdAt: '2025-11-28T01:45:00Z',
    result: 'Error: Timeout during security audit'
  },
  {
    id: 'task-005',
    agentType: 'DocumentationAgent',
    status: 'CANCELLED',
    progress: 0,
    prompt: 'Generate API documentation for the Agent System endpoints',
    createdAt: '2025-11-28T02:05:00Z'
  }
])

const selectedTaskId = ref<string | null>(null)
const selectedTask = computed(() => tasks.value.find(t => t.id === selectedTaskId.value))

const startNewTask = () => {
  const newId = `task-${String(tasks.value.length + 1).padStart(3, '0')}`
  tasks.value.unshift({
    id: newId,
    agentType: 'CodeAnalyzerAgent',
    status: 'PENDING',
    progress: 0,
    prompt: 'Enter your code analysis prompt here...',
    createdAt: new Date().toISOString()
  })
  selectedTaskId.value = newId
}

const selectTask = (id: string) => {
  selectedTaskId.value = id
}

const deleteTask = (id: string) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
  if (selectedTaskId.value === id) {
    selectedTaskId.value = null
  }
}

const updateTaskProgress = (id: string, progress: number) => {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    task.progress = Math.min(progress, 100)
    if (progress >= 100) {
      task.status = 'COMPLETED'
    }
  }
}

const getStatusColor = (status: Task['status']) => {
  const colors: Record<Task['status'], string> = {
    PENDING: '#FFA500',
    RUNNING: '#00D4FF',
    COMPLETED: '#22C55E',
    FAILED: '#EF4444',
    CANCELLED: '#6B7280'
  }
  return colors[status]
}

const getStatusBgColor = (status: Task['status']) => {
  const colors: Record<Task['status'], string> = {
    PENDING: 'rgba(255, 165, 0, 0.15)',
    RUNNING: 'rgba(0, 212, 255, 0.15)',
    COMPLETED: 'rgba(34, 197, 94, 0.15)',
    FAILED: 'rgba(239, 68, 68, 0.15)',
    CANCELLED: 'rgba(107, 114, 128, 0.15)'
  }
  return colors[status]
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
}

const getAgentIcon = (agentType: Task['agentType']) => {
  const icons: Record<Task['agentType'], string> = {
    CodeAnalyzerAgent: '🔍',
    RefactoringAgent: '♻️',
    TestGeneratorAgent: '✓',
    DocumentationAgent: '📚',
    SecurityAuditAgent: '🔒'
  }
  return icons[agentType]
}
</script>

<template>
  <div class="agent-studio-container">
    <header class="studio-header">
      <div class="header-content">
        <h1>🤖 Agent Studio</h1>
        <p class="subtitle">AI-Powered Code Analysis & Automation</p>
      </div>
      <button class="btn-new-task" @click="startNewTask">
        <span>➕</span> New Task
      </button>
    </header>

    <div class="studio-layout">
      <!-- Task List (Left Column) -->
      <div class="studio-task-list">
        <div class="list-header">
          <h2>Active Tasks</h2>
          <span class="task-count">{{ tasks.length }}</span>
        </div>

        <div class="tasks-container">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="task-card"
            :class="{ active: selectedTaskId === task.id }"
            @click="selectTask(task.id)"
          >
            <div class="task-header">
              <div class="task-info">
                <div class="task-id">{{ task.id.slice(-3) }}</div>
                <div class="agent-badge">
                  <span class="agent-icon">{{ getAgentIcon(task.agentType) }}</span>
                  <span class="agent-name">{{ task.agentType.replace('Agent', '') }}</span>
                </div>
              </div>
              <div
                class="status-badge"
                :style="{ backgroundColor: getStatusBgColor(task.status), color: getStatusColor(task.status) }"
              >
                {{ task.status }}
              </div>
            </div>

            <div class="task-prompt">
              {{ task.prompt.length > 60 ? task.prompt.slice(0, 60) + '...' : task.prompt }}
            </div>

            <div class="task-progress-mini">
              <div class="progress-bar-mini">
                <div class="progress-fill" :style="{ width: task.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ task.progress }}%</span>
            </div>

            <div class="task-footer">
              <span class="task-time">{{ formatDate(task.createdAt) }}</span>
              <div class="task-actions">
                <button class="btn-action btn-view" @click.stop="selectTask(task.id)" title="View Details">👁️</button>
                <button class="btn-action btn-delete" @click.stop="deleteTask(task.id)" title="Delete">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Detail Panel (Right Column) -->
      <div class="studio-detail-panel">
        <div v-if="selectedTask" class="detail-content">
          <div class="detail-header">
            <div class="detail-title">
              <h2>{{ selectedTask.agentType }}</h2>
              <span class="detail-id">ID: {{ selectedTask.id }}</span>
            </div>
            <div
              class="status-badge-large"
              :style="{ backgroundColor: getStatusBgColor(selectedTask.status), color: getStatusColor(selectedTask.status) }"
            >
              {{ selectedTask.status }}
            </div>
          </div>

          <!-- Progress Section -->
          <div class="detail-section">
            <h3>Progress</h3>
            <div class="progress-bar-large">
              <div class="progress-fill" :style="{ width: selectedTask.progress + '%' }"></div>
            </div>
            <div class="progress-text-large">{{ selectedTask.progress }}% Complete</div>
          </div>

          <!-- Prompt Section -->
          <div class="detail-section">
            <h3>Task Prompt</h3>
            <div class="prompt-box">
              {{ selectedTask.prompt }}
            </div>
          </div>

          <!-- Results Section -->
          <div v-if="selectedTask.result" class="detail-section">
            <h3>Results</h3>
            <div class="result-box">
              {{ selectedTask.result }}
            </div>
          </div>

          <!-- Live Output Section -->
          <div v-if="selectedTask.status === 'RUNNING'" class="detail-section">
            <h3>Live Output</h3>
            <div class="output-box">
              <div class="output-line">🔄 Processing step {{ Math.ceil(selectedTask.progress / 20) }}/5...</div>
              <div class="output-line">⏱️ Elapsed time: {{ Math.floor(Math.random() * 30) }}s</div>
              <div class="output-line">💾 Memory: {{ Math.floor(Math.random() * 200) }}MB</div>
            </div>
          </div>
        </div>
        <div v-else class="detail-empty">
          <p>Select a task to view details</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --color-primary: #00d4ff;
  --color-secondary: #2d96a6;
  --color-success: #22c55e;
  --color-danger: #ef4444;
  --color-warning: #ffa500;
  --color-gray: #6b7280;
  --color-bg-dark: #1a1a2e;
  --color-surface: #16213e;
  --color-border: rgba(0, 212, 255, 0.2);
}

.agent-studio-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.studio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid var(--color-border);
  background: rgba(0, 0, 0, 0.3);
}

.header-content h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--color-gray);
}

.btn-new-task {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-new-task:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 212, 255, 0.3);
}

.studio-layout {
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 16px;
  padding: 20px;
  flex: 1;
  overflow: hidden;
}

.studio-task-list {
  display: flex;
  flex-direction: column;
  background: rgba(22, 33, 62, 0.8);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  background: rgba(0, 0, 0, 0.2);
}

.list-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.task-count {
  background: var(--color-primary);
  color: #1a1a2e;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.tasks-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.task-card {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 212, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-card:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--color-border);
  transform: translateX(4px);
}

.task-card.active {
  background: rgba(0, 212, 255, 0.15);
  border-color: var(--color-primary);
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.2);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-id {
  background: rgba(0, 212, 255, 0.2);
  color: var(--color-primary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  font-family: monospace;
}

.agent-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.agent-icon {
  font-size: 14px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid currentColor;
}

.task-prompt {
  font-size: 12px;
  color: #b0b0b0;
  margin-bottom: 8px;
  line-height: 1.4;
}

.task-progress-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.progress-bar-mini {
  flex: 1;
  height: 4px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: var(--color-primary);
  font-weight: 600;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #808080;
}

.task-time {
  font-family: monospace;
}

.task-actions {
  display: flex;
  gap: 4px;
}

.btn-action {
  padding: 2px 6px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  color: var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: var(--color-primary);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.studio-detail-panel {
  background: rgba(22, 33, 62, 0.8);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  overflow-y: auto;
}

.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #606060;
  font-size: 14px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.detail-title h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
}

.detail-id {
  font-size: 11px;
  color: #808080;
  font-family: monospace;
}

.status-badge-large {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  border: 1px solid currentColor;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-section h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-bar-large {
  height: 8px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.progress-text-large {
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 600;
}

.prompt-box,
.result-box,
.output-box {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  color: #d0d0d0;
  font-family: 'Courier New', monospace;
  max-height: 200px;
  overflow-y: auto;
}

.output-line {
  margin-bottom: 4px;
}

.output-line:last-child {
  margin-bottom: 0;
}

@media (max-width: 1200px) {
  .studio-layout {
    grid-template-columns: 1fr;
  }

  .studio-detail-panel {
    display: none;
  }

  .task-card.active .studio-detail-panel {
    display: block;
  }
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.5);
}
</style>
