import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || null)
  
  const login = async (email, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    token.value = data.token
    user.value = data.user
    localStorage.setItem('auth_token', data.token)
    return data
  }
  
  const logout = () => { token.value = null; user.value = null; localStorage.removeItem('auth_token') }
  
  return { user, token, login, logout }
})
