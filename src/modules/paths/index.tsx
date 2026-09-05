import { Route } from 'react-router-dom'
import { PathsPage } from './components/PathsPage'
import { ArchivedPathsPage } from './components/ArchivedPathsPage'
import { PathOverviewPage } from './components/PathOverviewPage'
import { PathActionsPage } from './components/PathActionsPage'

/**
 * Routes for the `paths` module. Spread into <Routes> in src/App.tsx.
 *
 *   /paths                     — card grid of active Paths
 *   /paths/archived            — archived Paths
 *   /paths/:pathId             — Path overview (the hub)
 *   /paths/:pathId/actions     — this Path's Goals + Actions, drag-and-drop
 *
 * All four sit on one tab bar (`PathTabs`) together with
 * `/paths/:pathId/goals` (owned by the `goals` module) and
 * `/paths/:pathId/vision` (owned by `vision`) — see their own `index.tsx`;
 * those two are registered separately in App.tsx.
 */
export const pathsRoutes = [
  <Route key="paths" path="/paths" element={<PathsPage />} />,
  <Route key="paths-archived" path="/paths/archived" element={<ArchivedPathsPage />} />,
  <Route key="path-overview" path="/paths/:pathId" element={<PathOverviewPage />} />,
  <Route key="path-actions" path="/paths/:pathId/actions" element={<PathActionsPage />} />,
]
