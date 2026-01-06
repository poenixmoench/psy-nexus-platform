import { createRouter, createWebHistory } from 'vue-router'
import DevWorkspace from './views/DevWorkspace.vue'

const routes = [
  {
    path: '/dev-workspace',
    name: 'DevWorkspace',
    component: DevWorkspace
  },
  {
    path: '/',
    redirect: '/dev-workspace'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
