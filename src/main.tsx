import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'transition-style/transition.circles.min.css'
import App from './App.tsx'
import { setupCacheRefreshOnReload, startAutoClearCache } from './utils/cache'

// Initialize cache system
setupCacheRefreshOnReload()
startAutoClearCache()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
