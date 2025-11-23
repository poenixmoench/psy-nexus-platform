<template>
  <form @submit.prevent="handleSubmit" class="event-form-container">
    <h2>Create New Event</h2>
    <div class="form-group">
      <label for="title">Title</label>
      <input v-model="title" type="text" id="title" required />
    </div>
    <div class="form-group">
      <label for="start_date">Start Date</label>
      <input v-model="start_date" type="datetime-local" id="start_date" required />
    </div>
    <div class="form-group">
      <label for="end_date">End Date</label>
      <input v-model="end_date" type="datetime-local" id="end_date" required />
    </div>
    <div class="form-group">
      <label for="location_city">City</label>
      <input v-model="location_city" type="text" id="location_city" required />
    </div>
    <div class="form-group">
      <label for="location_details">Location Details</label>
      <textarea v-model="location_details" id="location_details" rows="3" required></textarea>
    </div>
    <div class="form-group">
      <label for="description">Description</label>
      <textarea v-model="description" id="description" rows="5" required></textarea>
    </div>
    <div class="form-group">
      <label for="genres">Genres (comma-separated)</label>
      <input v-model="genresInput" type="text" id="genres" required />
    </div>
    <button type="submit">Submit Event</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['submitEvent']);

const title = ref('');
const start_date = ref('');
const end_date = ref('');
const location_city = ref('');
const location_details = ref('');
const description = ref('');
const genresInput = ref('');

function handleSubmit() {
  const genresArray = genresInput.value.split(',').map(g => g.trim()).filter(g => g.length > 0);
  const eventData = {
    title: title.value,
    start_date: start_date.value,
    end_date: end_date.value,
    location_city: location_city.value,
    location_details: location_details.value,
    description: description.value,
    genres: genresArray
  };

  emit('submitEvent', eventData);
}
</script>

<style scoped>
.event-form-container {
    background-color: #2c2c2c;
    padding: 2rem;
    border-radius: 8px;
    color: #f0f0f0;
}
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input[type="text"], input[type="datetime-local"], textarea {
  width: 100%;
  padding: 0.75rem;
  box-sizing: border-box;
  border: 1px solid #444;
  background-color: #1e1e1e;
  color: white;
  border-radius: 4px;
}

button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  background-color: #7b1fa2; /* Psy-Nexus Purple */
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

button[type="submit"]:hover {
  background-color: #5d167a;
}
</style>
