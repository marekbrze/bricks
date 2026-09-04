import { Route } from 'react-router-dom'
import { InboxPage } from './components/InboxPage'
import { TriagePage } from './components/TriagePage'

/**
 * Routes for the `capture-triage` module. Spread into <Routes> in src/App.tsx.
 *
 *   /capture-triage          — Inbox list + quick capture + Start Triage
 *   /capture-triage/triage   — card-by-card triage mode
 */
export const captureTriageRoutes = [
  <Route key="capture-triage" path="/capture-triage" element={<InboxPage />} />,
  <Route key="capture-triage-triage" path="/capture-triage/triage" element={<TriagePage />} />,
]

export { QuickCaptureButton } from './components/QuickCaptureButton'
