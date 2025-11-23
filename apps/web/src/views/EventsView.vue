<template>
  <div class="events-view">
    <h1 class="view-title">Event Creation</h1>
    <EventForm @submitEvent="handleFormSubmission" />
    <p v-if="statusMessage" :class="statusType">{{ statusMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EventForm from '@/components/EventForm.vue';
// FIX: Explizite .ts-Endung für vue-tsc im Docker-Build
import { useAuthStore } from '@/stores/authStore.ts';
import apiClient from '@/plugins/axios.ts';

const authStore = useAuthStore();
const statusMessage = ref('');
const statusType = ref('success');

async function handleFormSubmission(eventData: any) {
    statusMessage.value = 'Submitting event...';
    statusType.value = 'info';

    try {
      const token = authStore.token;
      if (!token) {
        statusMessage.value = 'Error: Not authenticated. Please log in.';
        statusType.value = 'error';
        console.error('No authentication token available');
        return;
      }

      // Die API-Anfrage an den /events-Endpunkt des Backends
      const response = await apiClient.post('/events', eventData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201 || response.status === 200) {
        statusMessage.value = `Event successfully created! ID: ${response.data.id}`;
        statusType.value = 'success';
        console.log('Event created:', response.data);
      } else {
        throw new Error('Failed to submit event with unexpected status');
      }
    } catch (error: any) {
      statusMessage.value = `Error submitting event: ${error.response?.data?.message || error.message}`;
      statusType.value = 'error';
      console.error('Error submitting event:', error);
    }
}
</script>

<style scoped>
.events-view {
    max-width: 650px;
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

p {
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
}

.success {
    background-color: #4caf5033; /* Light green background */
    color: #4CAF50;
    border: 1px solid #4CAF50;
}

.error {
    background-color: #f4433633; /* Light red background */
    color: #F44336;
    border: 1px solid #F44336;
}

.info {
    background-color: #2196f333;
    color: #2196F3;
    border: 1px solid #2196F3;
}
</style>
