import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue' // Importiere die neue HomeView
import DevWorkspace from '../views/DevWorkspace.vue' // Importiere DevWorkspace

const routes = [
  { path: '/', name: 'home', component: HomeView }, // Hauptseite zeigt HomeView
  { path: '/dev-workspace', name: 'dev-workspace', component: DevWorkspace } // Agentenbereich zeigt DevWorkspace
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router
