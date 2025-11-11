<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin">
      <h2>Login to Psy-Nexus</h2>
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit" :disabled="loading">{{ loading ? 'Logging in...' : 'Login' }}</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const email = ref('test@psy.de')
const password = ref('Test123!')
const error = ref('')
const loading = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container { max-width: 400px; margin: 100px auto; padding: 20px; border: 1px solid #ccc; }
form { display: flex; flex-direction: column; }
input { padding: 10px; margin: 10px 0; border: 1px solid #999; }
button { padding: 10px; background: #007bff; color: white; cursor: pointer; }
.error { color: red; }
</style>
