import { createApp } from 'vue'
import { io } from 'socket.io-client'
import App from './App.vue'
import router from './router'

// Socket.io global verfügbar machen
window.io = io

const app = createApp(App)
app.use(router)
app.mount('#app')
