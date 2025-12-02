<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <header class="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
      <h1 class="text-3xl font-bold text-gray-900">Orchestrations-Verlauf</h1>
      <button
        @click="refreshData"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-400 transition"
        aria-label="Aktualisieren"
      >
        Aktualisieren
      </button>
    </header>

    <div v-if="error" class="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
      {{ error }}
    </div>

    <div v-if="loading" class="flex justify-center items-center min-h-96">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Gesamt Läufe" :value="stats.total" status="total" />
        <StatsCard label="Erfolgreich" :value="stats.successful" status="success" />
        <StatsCard label="Fehlgeschlagen" :value="stats.failed" status="failed" />
        <StatsCard label="Ø Dauer" :value="formatDuration(stats.avgDurationMs)" status="pending" />
      </div>

      <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div class="flex gap-4 mb-4 flex-col md:flex-row">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nach Ziel oder Ausgabe suchen..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
          />
          <button
            @click="debouncedSearch"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition"
          >
            Suchen
          </button>
        </div>

        <div class="flex gap-2 flex-wrap">
          <button @click="handleFilter('all')" :class="['px-4 py-2 rounded-lg transition focus:ring-2 focus:ring-offset-2', filters.status === 'all' ? 'bg-green-600 text-white focus:ring-green-400' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400']">Alle</button>
          <button @click="handleFilter('SUCCESS')" :class="['px-4 py-2 rounded-lg transition focus:ring-2 focus:ring-offset-2', filters.status === 'SUCCESS' ? 'bg-green-600 text-white focus:ring-green-400' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400']">Erfolgreich</button>
          <button @click="handleFilter('FAILED')" :class="['px-4 py-2 rounded-lg transition focus:ring-2 focus:ring-offset-2', filters.status === 'FAILED' ? 'bg-red-600 text-white focus:ring-red-400' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400']">Fehlgeschlagen</button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div v-if="runs.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ziel</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Dauer</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Gestartet</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aktionen</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="run in runs" :key="run.id" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm text-gray-900">{{ run.id }}</td>
                <td class="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{{ run.userGoal }}</td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-3 py-1 rounded-full text-white text-xs font-semibold" :class="{'bg-green-500': run.status === 'SUCCESS', 'bg-red-500': run.status === 'FAILED', 'bg-yellow-500': run.status === 'IN_PROGRESS', 'bg-gray-500': run.status === 'PENDING'}">
                    {{ statusLabel(run.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">{{ run.durationMs ? formatDuration(run.durationMs) : 'N/A' }}</td>
                <td class="px-6 py-4 text-sm text-gray-700">{{ formatDate(run.createdAt) }}</td>
                <td class="px-6 py-4 text-sm">
                  <button @click="showRunDetails(run)" class="text-blue-600 hover:text-blue-800 font-medium focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 rounded px-2 py-1">
                    Details anzeigen
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-8 text-center text-gray-500">
          Keine Läufe gefunden.
        </div>

        <div v-if="runs.length > 0" class="px-6 py-4 bg-gray-50 border-t flex justify-between items-center flex-col md:flex-row gap-4">
          <div class="text-sm text-gray-600">
            Seite {{ pagination.page }} von {{ Math.ceil(pagination.total / pagination.limit) }}
          </div>
          <div class="flex gap-2">
            <button @click="handlePageChange(pagination.page - 1)" :disabled="pagination.page === 1" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-gray-400 transition">Vorherige</button>
            <button @click="handlePageChange(pagination.page + 1)" :disabled="pagination.page >= Math.ceil(pagination.total / pagination.limit)" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-gray-400 transition">Nächste</button>
          </div>
        </div>
      </div>
    </template>

    <div v-if="showDetailModal && selectedRun" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click="closeModal">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto" @click.stop>
        <div class="sticky top-0 flex justify-between items-center p-6 bg-gray-50 border-b">
          <h2 class="text-2xl font-bold text-gray-900">Run-Details</h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 rounded px-2 py-1">×</button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="text-sm font-semibold text-gray-600">Ziel:</label>
            <p class="text-gray-900 break-words">{{ selectedRun.userGoal }}</p>
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-600">Status:</label>
            <span class="inline-block px-3 py-1 rounded-full text-white text-sm font-semibold mt-1" :class="{'bg-green-500': selectedRun.status === 'SUCCESS', 'bg-red-500': selectedRun.status === 'FAILED', 'bg-yellow-500': selectedRun.status === 'IN_PROGRESS', 'bg-gray-500': selectedRun.status === 'PENDING'}">
              {{ statusLabel(selectedRun.status) }}
            </span>
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-600">Dauer:</label>
            <p class="text-gray-900">{{ selectedRun.durationMs ? formatDuration(selectedRun.durationMs) : 'N/A' }}</p>
          </div>
          <div v-if="selectedRun.finalOutput">
            <label class="text-sm font-semibold text-gray-600">Ausgabe:</label>
            <pre class="text-gray-900 break-words text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">{{ selectedRun.finalOutput }}</pre>
          </div>
          <div v-if="selectedRun.agentOutputs">
            <label class="text-sm font-semibold text-gray-600">Agent-Ausgaben:</label>
            <div class="mt-2 space-y-2 text-sm text-gray-700">
              <div v-if="selectedRun.agentOutputs.orchestrator">
                <strong>Orchestrator:</strong>
                <pre class="text-xs bg-gray-100 p-2 rounded overflow-auto">{{ selectedRun.agentOutputs.orchestrator }}</pre>
              </div>
              <div v-if="selectedRun.agentOutputs.developer">
                <strong>Entwickler:</strong>
                <pre class="text-xs bg-gray-100 p-2 rounded overflow-auto">{{ selectedRun.agentOutputs.developer }}</pre>
              </div>
              <div v-if="selectedRun.agentOutputs.reviewer">
                <strong>Reviewer:</strong>
                <pre class="text-xs bg-gray-100 p-2 rounded overflow-auto">{{ selectedRun.agentOutputs.reviewer }}</pre>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 px-6 py-4 bg-gray-50 border-t flex justify-end gap-2">
          <button @click="closeModal" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition">Schließen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import debounce from 'lodash.debounce'
import StatsCard from './StatsCard.vue'
import { fetchStats, fetchRuns, subscribeToStreamStatus } from '@/api/history'
import { formatDate, formatDuration, statusToGerman } from '@/utils/formatters'
import type { OrchestrationRun, Stats, PaginationState } from '@/types/History'

const runs = ref<OrchestrationRun[]>([])
const stats = ref<Stats>({ total: 0, successful: 0, failed: 0, inProgress: 0, avgDurationMs: 0 })
const pagination = ref<PaginationState>({ page: 1, limit: 50, total: 0 })
const filters = ref({ status: 'all' })
const searchQuery = ref('')
const showDetailModal = ref(false)
const selectedRun = ref<OrchestrationRun | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
let refreshInterval: NodeJS.Timeout | null = null
let sseConnection: EventSource | null = null

const statusLabel = (status: string): string => statusToGerman(status)

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    pagination.value.page = 1
    await loadRuns()
    return
  }
  loading.value = true
  error.value = null
  try {
    const data = await fetchRuns(1, pagination.value.limit, filters.value.status === 'all' ? undefined : filters.value.status, searchQuery.value)
    runs.value = data.data
    pagination.value.total = data.count
  } catch (err) {
    error.value = 'Fehler bei der Suche'
    console.error('Search error:', err)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(handleSearch, 300)

const loadRuns = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await fetchRuns(
      pagination.value.page,
      pagination.value.limit,
      filters.value.status === 'all' ? undefined : filters.value.status,
      searchQuery.value
    )
    runs.value = data.data
    pagination.value.total = data.count
  } catch (err) {
    error.value = 'Fehler beim Laden der Läufe'
    console.error('Load error:', err)
  } finally {
    loading.value = false
  }
}

const handleFilter = (status: string) => {
  filters.value.status = status
  pagination.value.page = 1
  loadRuns()
}

const handlePageChange = (newPage: number) => {
  const maxPage = Math.ceil(pagination.value.total / pagination.value.limit)
  if (newPage >= 1 && newPage <= maxPage) {
    pagination.value.page = newPage
    loadRuns()
  }
}

const showRunDetails = (run: OrchestrationRun) => {
  selectedRun.value = run
  showDetailModal.value = true
}

const closeModal = () => {
  showDetailModal.value = false
}

const refreshData = async () => {
  loading.value = true
  error.value = null
  try {
    const statsData = await fetchStats()
    stats.value = statsData
    await loadRuns()
  } catch (err) {
    error.value = 'Fehler beim Aktualisieren der Daten'
    console.error('Refresh error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshData()
  refreshInterval = setInterval(() => {
    fetchStats().then(data => { stats.value = data }).catch(err => console.error('Stats refresh error:', err))
  }, 30000)

  sseConnection = subscribeToStreamStatus(
    (event) => {
      if (event.type === 'stats_update' && event.payload.newStats) {
        stats.value = event.payload.newStats
      }
      if (event.type === 'run_status_update' && event.payload.runId && event.payload.newStatus) {
        const run = runs.value.find(r => r.id === event.payload.runId)
        if (run) run.status = event.payload.newStatus!
      }
    },
    (error) => { console.error('SSE Error:', error) }
  )
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (sseConnection) sseConnection.close()
})
</script>

<style scoped>
/* Tailwind */
</style>
