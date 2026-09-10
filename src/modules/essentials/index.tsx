import { Route } from 'react-router-dom'
import { EssentialsPage } from './components/EssentialsPage'

/**
 * Routes for the `essentials` module. Spread into <Routes> in src/App.tsx.
 * Nested under `paths` in the URL (an Essential only exists in the context of
 * a Path) but registered as its own flat route here — same handoff `vision`
 * and `goals` do.
 *
 *   /paths/:pathId/essentials — the Essentials tab: define, reorder, log
 */
export const essentialsRoutes = [
  <Route key="essentials" path="/paths/:pathId/essentials" element={<EssentialsPage />} />,
]
