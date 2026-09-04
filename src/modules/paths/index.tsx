import { Route } from 'react-router-dom'
import { PathsPage } from './components/PathsPage'
import { ArchivedPathsPage } from './components/ArchivedPathsPage'
import { PathOverviewPage } from './components/PathOverviewPage'
import { NestedModulePlaceholder } from './components/NestedModulePlaceholder'

/**
 * Routes for the `paths` module. Spread into <Routes> in src/App.tsx.
 *
 *   /paths                     — card grid of active Paths
 *   /paths/archived            — archived Paths
 *   /paths/:pathId             — Path overview (the hub)
 *   /paths/:pathId/vision      — placeholder → owned by the `vision` module
 *
 * `/paths/:pathId/goals` (+ `/:goalId`) is owned by the `goals` module —
 * see `src/modules/goals/index.tsx` — and registered separately in App.tsx.
 */
export const pathsRoutes = [
  <Route key="paths" path="/paths" element={<PathsPage />} />,
  <Route key="paths-archived" path="/paths/archived" element={<ArchivedPathsPage />} />,
  <Route key="path-overview" path="/paths/:pathId" element={<PathOverviewPage />} />,
  <Route
    key="path-vision"
    path="/paths/:pathId/vision"
    element={<NestedModulePlaceholder module="vision" label="Vision board" />}
  />,
]
