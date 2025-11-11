import { createRouter, createWebHistory } from 'vue-router'
import Login from './pages/Login.vue'
import Dashboard from './pages/Dashboard.vue'
import { useAuthStore } from './stores/auth'

const routes = [
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
