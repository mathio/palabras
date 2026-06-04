import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import App from './App.vue'
import './style.css'

// iOS 10+ ignores user-scalable=no in the meta tag; block pinch-zoom via JS
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) e.preventDefault()
}, { passive: false })

createApp(App).use(createPinia()).use(router).mount('#app')
