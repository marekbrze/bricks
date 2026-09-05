import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { startCloudMirror } from './modules/data-sync/lib/mirror'

// Start sync before the first render, and never block on it. Opening the
// database is what makes the addon restore the persisted login and begin
// syncing — leaving it to the sync page would mean the app is only signed in
// while that page is open. A cloud database that is not configured makes this
// a no-op. See docs/modules/data-sync.md.
void startCloudMirror().catch((err) => {
  console.error('[data-sync] could not start cloud sync', err)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
