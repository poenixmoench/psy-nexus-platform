import { createRouter, createWebHistory } from 'vue-router'
import DevWorkspace from '../views/DevWorkspace.vue'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/dev-workspace',
    name: 'dev-workspace',
    component: DevWorkspace
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
