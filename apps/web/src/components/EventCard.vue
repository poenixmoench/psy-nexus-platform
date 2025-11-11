<template>
  <div class="event-card">
    <h3>{{ event.title }}</h3>
    <p>{{ event.date }}</p>
    <p>{{ event.location }}</p>
    <p>{{ event.price }} €</p>
    <p>{{ event.status }}</p>
  </div>
</template>

<script>
export default {
  props: ['event']
};
</script>

<style scoped>
.event-card {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin: 10px;
  background-color: #f9f9f9;
}
</style>
