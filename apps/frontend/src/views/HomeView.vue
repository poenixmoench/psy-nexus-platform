<template>
  <div class="home">
    <h1>Welcome to Psy-Nexus</h1>
    <p>The neural operating system is online.</p>
    <router-link to="/dev-workspace" class="enter-link">Go to Agent Studio</router-link>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  background: #0f172a;
}
.enter-link {
  margin-top: 20px;
  color: #3b82f6;
  text-decoration: none;
  border: 1px solid #3b82f6;
  padding: 10px 20px;
  border-radius: 5px;
}
</style>
