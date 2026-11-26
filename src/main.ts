import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import App from './App.vue'
import { preloadPavilion } from './data/pavilion'
import './style.css'

if (window.location.pathname === '/') preloadPavilion()

const app = createApp(App)
app.use(createPinia())
app.use(router)
void router.isReady().then(() => app.mount('#app'))
