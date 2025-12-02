import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AgentDevStudio from '@/views/AgentDevStudio.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: AgentDevStudio
  },
  {
    path: '/dev-studio',
    name: 'dev-studio',
    component: AgentDevStudio
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
