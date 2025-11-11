<template>
  <div class="home">
    <h1>Events List</h1>
    <div v-for="event in events" :key="event.id" class="event-item">
      <EventCard :event="event" />
    </div>
  </div>
</template>

<script>
import EventCard from '../components/EventCard.vue';
import api from '../services/api';

export default {
  components: {
    EventCard
  },
  data() {
    return {
      events: []
    };
  },
  async mounted() {
    try {
      const response = await api.get('/api/events');
      this.events = response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }
};
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.event-item {
  margin-bottom: 20px;
}
</style>
