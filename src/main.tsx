import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Clear session on every fresh page load (restart/refresh)
// This ensures users always land on the public page and must log in again
localStorage.removeItem('yarsi_user');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
