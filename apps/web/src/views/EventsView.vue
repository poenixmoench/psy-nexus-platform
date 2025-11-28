<template>
  <div class="events-view">
    <h1 class="view-title">Events</h1>
<div class="debug-output">Aktueller Ladezustand: {{ loading }}<br>Fehler: {{ error }}<pre>{{ events }}</pre></div>
      <pre>{{ events }}</pre> <!-- Zeigt die Rohdaten zur Diagnose an -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/plugins/axios'; // Stellen Sie sicher, dass dies korrekt importiert ist

const events = ref<any[]>([]); // Nutze any[] temporär
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  console.log("EventsView mounted, attempting to fetch events..."); // Debug-Log
  try {
    console.log("Making API call to /api/events..."); // Debug-Log
    const response = await apiClient.get('/api/events');
    console.log("API Response:", response); // Debug-Log
    events.value = response.data;
    console.log("Events loaded:", events.value); // Debug-Log
  } catch (err: any) {
    console.error('Error fetching events:', err); // Wichtig: Fehler in der Konsole
    error.value = `Fehler beim Laden: ${err.message || 'Unbekannter Fehler'}`;
  } finally {
    loading.value = false;
    console.log("Loading state set to false."); // Debug-Log
  }
});
</script>

<style scoped>
.events-view {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
}

.view-title {
    color: #e0e0e0;
    text-align: center;
    margin-bottom: 2rem;
    border-bottom: 2px solid #7b1fa2;
    padding-bottom: 0.5rem;
}

.loading {
    text-align: center;
    color: #aaa;
}

.error-message {
    color: #f44336;
    text-align: center;
    padding: 1rem;
}

pre {
    background-color: #2c2c2c;
    color: #e0e0e0;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    white-space: pre-wrap; /* Zeilenumbrüche erhalten */
}
</style>
