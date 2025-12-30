import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import DevWorkspace from '../views/DevWorkspace.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/dev-workspace/',
      name: 'DevWorkspace',
      component: DevWorkspace
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router
