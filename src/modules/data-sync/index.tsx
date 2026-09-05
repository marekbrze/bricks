import { Route } from 'react-router-dom'
import { DataSyncPage } from './components/DataSyncPage'

/**
 * Routes for the `data-sync` module. Spread into <Routes> in src/App.tsx.
 * Not a main-nav destination — reached from the footer's secondary nav,
 * alongside the other settings-level surfaces (docs/UI-STRATEGY.md).
 *
 *   /data-sync         — Dexie Cloud setup, sign-in, push/pull
 */
export const dataSyncRoutes = [
  <Route key="data-sync" path="/data-sync" element={<DataSyncPage />} />,
]
