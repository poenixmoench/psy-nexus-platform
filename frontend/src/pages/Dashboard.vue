<template>
  <div class="dashboard">
    <h2>Dashboard</h2>
    <p>Welcome, {{ authStore.user?.username }}</p>
    <h3>Events</h3>
    <button @click="fetchEvents">Load Events</button>
    <div v-if="loading">Loading...</div>
    <div v-else-if="events.length === 0">No events yet</div>
    <div v-else>
      <div v-for="event in events" :key="event.id" class="event-card">
        <h4>{{ event.title }}</h4>
        <p>{{ event.description }}</p>
        <small>{{ event.date }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const events = ref([])
const loading = ref(false)
const authStore = useAuthStore()

const fetchEvents = async () => {
  loading.value = true
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    events.value = await res.json()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchEvents)
</script>

<style scoped>
.dashboard { padding: 20px; }
.event-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }
</style>
