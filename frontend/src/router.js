import { createRouter, createWebHistory } from 'vue-router'
import AgentDevStudio from './components/AgentDevStudio.vue'

const routes = [
  { path: '/studio', component: AgentDevStudio },
  { path: '/', redirect: '/studio' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
